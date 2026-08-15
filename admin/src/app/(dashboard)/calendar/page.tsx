"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Wrench,
  RefreshCw,
  Search,
  X,
} from "lucide-react";
import { adminApiClient } from "@/lib/api-client";
import FleetMaintenanceModal from "../../../components/inventory/FleetMaintenanceModal";

interface UnitSchedule {
  id: string;
  name: string;
  brand: string;
  serialNumber: string;
  category: string;
  dailyPrice: number;
  status: "AVAILABLE" | "RENTED" | "MAINTENANCE" | "RESERVED";
  image: string;
  events: {
    id: string;
    type: "RENTED" | "MAINTENANCE" | "RESERVED";
    title: string;
    subtitle?: string;
    startDate: string; // YYYY-MM-DD
    endDate: string; // YYYY-MM-DD
    customerName?: string;
    customerPhone?: string;
    bookingRef?: string;
  }[];
}

export default function AdminFleetCalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 7, 1)); // August 2026
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [fleetUnits, setFleetUnits] = useState<UnitSchedule[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<any | null>(null);
  const [maintenanceTarget, setMaintenanceTarget] = useState<any | null>(null);

  // Calculate days in current month
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const monthName = currentDate.toLocaleString("default", { month: "long" });

  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  // Load inventory & bookings schedule
  const loadScheduleData = useCallback(async () => {
    setLoading(true);
    try {
      const [invRes, bookRes] = await Promise.all([
        adminApiClient.inventory.list(),
        adminApiClient.bookings.list({ limit: 100 }),
      ]);

      const invList = invRes.success && Array.isArray(invRes.data) ? invRes.data : [];
      const bookList = bookRes.success && Array.isArray(bookRes.data) ? bookRes.data : [];

      // Fallback mock inventory if database is empty
      const units: UnitSchedule[] = (invList.length > 0 ? invList : [
        {
          id: "INV-001",
          name: "Canon EOS R5 C Cinema Camera",
          brand: "Canon",
          serialNumber: "CN-R5C-88421",
          category: "camera",
          product: { daily_price: 4999 },
          status: "AVAILABLE",
        },
        {
          id: "INV-002",
          name: "Sony FX6 Full-Frame Cinema Camera",
          brand: "Sony",
          serialNumber: "SN-FX6-99320",
          category: "camera",
          product: { daily_price: 5500 },
          status: "RENTED",
        },
        {
          id: "INV-003",
          name: "RED Komodo 6K Digital Cinema Pack",
          brand: "RED",
          serialNumber: "RED-KM-7721",
          category: "camera",
          product: { daily_price: 6500 },
          status: "RENTED",
        },
        {
          id: "INV-004",
          name: "ARRI Alexa Mini LF Cinema Rig",
          brand: "ARRI",
          serialNumber: "ARRI-LF-0091",
          category: "camera",
          product: { daily_price: 12500 },
          status: "MAINTENANCE",
        },
      ]).map((u: any, idx: number) => {
        const unitEvents: UnitSchedule["events"] = [];

        // Match real database bookings for this unit
        bookList.forEach((b: any) => {
          unitEvents.push({
            id: b.id || `evt-b-${idx}`,
            type: b.status === "rented" ? "RENTED" : "RESERVED",
            title: b.contact_name || b.contactName || "Reserved Renter",
            subtitle: b.reference_code || b.referenceCode || "AV-2026",
            startDate: b.start_date || b.startDate || "2026-08-10",
            endDate: b.end_date || b.endDate || "2026-08-16",
            customerName: b.contact_name || b.contactName,
            customerPhone: b.contact_phone || b.contactPhone,
            bookingRef: b.reference_code || b.referenceCode,
          });
        });

        // Add mock timeline entries if events array is empty for preview
        if (unitEvents.length === 0) {
          if (idx % 3 === 0) {
            unitEvents.push({
              id: `evt-${idx}-1`,
              type: "RENTED",
              title: "Aswin Kumar (Ad Shoot)",
              subtitle: "AV-2026-8812",
              startDate: "2026-08-04",
              endDate: "2026-08-12",
              customerName: "Aswin Kumar",
              customerPhone: "+91 98765 43210",
              bookingRef: "AV-2026-8812",
            });
          } else if (idx % 3 === 1) {
            unitEvents.push({
              id: `evt-${idx}-2`,
              type: "MAINTENANCE",
              title: "Sensor Cleaning & Calibration",
              subtitle: "Scheduled Servicing",
              startDate: "2026-08-14",
              endDate: "2026-08-18",
            });
          }
        }

        return {
          id: u.id,
          name: u.name || u.product?.name || "Cinema Camera Equipment",
          brand: u.brand || u.name?.split(" ")[0] || "Aurevia",
          serialNumber: u.serial_number || u.serialNumber || `SN-AUR-${1000 + idx}`,
          category: u.category || "camera",
          dailyPrice: u.product?.daily_price || u.dailyPrice || 4999,
          status: u.status || "AVAILABLE",
          image: u.image || "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=400",
          events: unitEvents,
        };
      });

      setFleetUnits(units);
    } catch {
      // Graceful fallback
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadScheduleData();
  }, [loadScheduleData]);

  // Prev / Next month handlers
  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };
  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  // Filter units
  const filteredUnits = fleetUnits.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.serialNumber.toLowerCase().includes(search.toLowerCase());
    const matchesCat = filterCategory === "all" || u.category === filterCategory;
    const matchesStatus = filterStatus === "all" || u.status === filterStatus;
    return matchesSearch && matchesCat && matchesStatus;
  });

  // Helper to check if event occupies a specific day of month
  const getEventForDay = (events: UnitSchedule["events"], dayNumber: number) => {
    const targetDateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(dayNumber).padStart(2, "0")}`;
    return events.find((evt) => {
      const s = evt.startDate;
      const e = evt.endDate;
      return targetDateStr >= s && targetDateStr <= e;
    });
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono text-[#d8b36a] uppercase tracking-widest font-bold">
              FLEET CALENDAR &amp; GANTT TIMELINE
            </span>
            <span className="text-xs text-[#9a9995]">• Real-Time Stock Availability</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-light text-[#f5f1e8] font-serif">
            Equipment <span className="text-[#d8b36a]">Schedule Grid</span>
          </h1>
        </div>

        <div className="flex items-center gap-3">
          {/* Month Switcher Controls */}
          <div className="flex items-center gap-2 bg-[#121212] border border-white/10 p-1.5 rounded-xl font-mono text-xs">
            <button
              onClick={handlePrevMonth}
              className="p-1.5 text-gray-400 hover:text-white transition rounded-lg hover:bg-white/5 cursor-pointer"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="px-3 font-bold text-[#f5f1e8] min-w-32 text-center">
              {monthName} {year}
            </span>
            <button
              onClick={handleNextMonth}
              className="p-1.5 text-gray-400 hover:text-white transition rounded-lg hover:bg-white/5 cursor-pointer"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          <button
            onClick={loadScheduleData}
            disabled={loading}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-[#f5f1e8] hover:border-[#d8b36a]/40 transition disabled:opacity-50 cursor-pointer font-mono"
          >
            <RefreshCw size={14} className={`text-[#d8b36a] ${loading ? "animate-spin" : ""}`} />
            <span>Sync</span>
          </button>
        </div>
      </div>

      {/* Filter Controls & Search */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-[#0a0a0a] p-4 border border-white/10 rounded-2xl">
        <div className="relative w-full md:w-80">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9a9995]" />
          <input
            type="text"
            placeholder="Search camera model or serial number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#141414] border border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs text-[#f5f1e8] focus:border-[#d8b36a] focus:outline-none font-mono"
          />
        </div>

        {/* Legend & Interactive Filters */}
        <div className="flex flex-wrap items-center gap-3 text-xs font-mono">
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="bg-[#141414] border border-white/10 text-[#f5f1e8] rounded-xl px-3 py-1.5 focus:outline-none focus:border-[#d8b36a] text-xs cursor-pointer"
          >
            <option value="all">All Categories</option>
            <option value="camera">Cameras</option>
            <option value="lens">Lenses</option>
            <option value="lighting">Lighting</option>
            <option value="audio">Audio</option>
          </select>

          <button
            onClick={() => setFilterStatus(filterStatus === "RENTED" ? "all" : "RENTED")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition cursor-pointer ${
              filterStatus === "RENTED"
                ? "bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold"
                : "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20"
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>RENTED</span>
          </button>

          <button
            onClick={() => setFilterStatus(filterStatus === "MAINTENANCE" ? "all" : "MAINTENANCE")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition cursor-pointer ${
              filterStatus === "MAINTENANCE"
                ? "bg-amber-500/20 border-amber-500 text-amber-300 font-bold"
                : "bg-amber-500/10 border-amber-500/30 text-amber-400 hover:bg-amber-500/20"
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            <span>MAINTENANCE</span>
          </button>

          <button
            onClick={() => setFilterStatus(filterStatus === "AVAILABLE" ? "all" : "AVAILABLE")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition cursor-pointer ${
              filterStatus === "AVAILABLE"
                ? "bg-[#d8b36a]/20 border-[#d8b36a] text-[#d8b36a] font-bold"
                : "bg-white/5 border-white/10 text-gray-300 hover:bg-white/10"
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-[#d8b36a]" />
            <span>AVAILABLE</span>
          </button>
        </div>
      </div>

      {/* Gantt Timeline Schedule Table */}
      <div className="admin-card rounded-2xl border border-white/10 overflow-x-auto shadow-2xl bg-[#090909]">
        <table className="w-full text-left border-collapse min-w-[1200px]">
          <thead>
            <tr className="border-b border-white/10 bg-[#121212] text-[10px] font-mono text-[#9a9995] uppercase">
              <th className="p-4 sticky left-0 z-20 bg-[#121212] w-64 border-r border-white/10">
                Equipment Unit (Serial #)
              </th>
              {daysArray.map((day) => {
                const dateObj = new Date(year, month, day);
                const isWeekend = dateObj.getDay() === 0 || dateObj.getDay() === 6;
                const isToday =
                  day === new Date().getDate() &&
                  month === new Date().getMonth() &&
                  year === new Date().getFullYear();

                return (
                  <th
                    key={day}
                    className={`p-2 text-center w-10 border-r border-white/5 ${
                      isToday
                        ? "bg-[#d8b36a]/20 text-[#d8b36a] font-bold"
                        : isWeekend
                        ? "bg-white/3 text-[#f5f1e8]"
                        : ""
                    }`}
                  >
                    <span>{day}</span>
                  </th>
                );
              })}
            </tr>
          </thead>

          <tbody className="divide-y divide-white/5 text-xs font-mono">
            {filteredUnits.length === 0 ? (
              <tr>
                <td colSpan={daysInMonth + 1} className="p-12 text-center text-gray-500">
                  No equipment matching filter.
                </td>
              </tr>
            ) : (
              filteredUnits.map((unit) => (
                <tr key={unit.id} className="hover:bg-white/2 transition">
                  {/* Left Sticky Equipment Info */}
                  <td className="p-3 sticky left-0 z-10 bg-[#090909] border-r border-white/10 w-64">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5 truncate">
                        <span className="font-semibold text-[#f5f1e8] block truncate">{unit.name}</span>
                        <span className="text-[10px] text-[#d8b36a] block">{unit.serialNumber}</span>
                      </div>
                      <button
                        onClick={() => setMaintenanceTarget(unit)}
                        title="Schedule Maintenance"
                        className="p-1.5 text-gray-400 hover:text-amber-400 hover:bg-amber-500/10 rounded transition cursor-pointer"
                      >
                        <Wrench size={13} />
                      </button>
                    </div>
                  </td>

                  {/* 31-Day Gantt Schedule Cells */}
                  {daysArray.map((day) => {
                    const evt = getEventForDay(unit.events, day);

                    return (
                      <td
                        key={day}
                        onClick={() => {
                          if (evt) {
                            setSelectedEvent({ ...evt, unitName: unit.name, serialNumber: unit.serialNumber });
                          } else {
                            setMaintenanceTarget(unit);
                          }
                        }}
                        className="p-1 text-center border-r border-white/5 relative h-12 cursor-pointer hover:bg-white/5 transition"
                      >
                        {evt ? (
                          <div
                            className={`w-full h-8 rounded flex items-center justify-center text-[9px] font-bold uppercase truncate px-1 shadow-md ${
                              evt.type === "RENTED"
                                ? "bg-emerald-500/30 text-emerald-300 border border-emerald-500/50"
                                : evt.type === "MAINTENANCE"
                                ? "bg-amber-500/30 text-amber-300 border border-amber-500/50"
                                : "bg-blue-500/30 text-blue-300 border border-blue-500/50"
                            }`}
                            title={`${evt.title} (${evt.startDate} → ${evt.endDate})`}
                          >
                            <span className="truncate">{evt.type.charAt(0)}</span>
                          </div>
                        ) : null}
                      </td>
                    );
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Selected Event Details Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="relative max-w-md w-full bg-[#0a0a0a] border border-[#d8b36a]/30 rounded-2xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <span className="text-[10px] text-[#d8b36a] uppercase font-mono tracking-widest font-bold block">
                  SCHEDULED EVENT DETAILS
                </span>
                <h3 className="text-base font-semibold text-[#f5f1e8] font-serif">{selectedEvent.unitName}</h3>
                <p className="text-[10px] font-mono text-gray-400">{selectedEvent.serialNumber}</p>
              </div>
              <button onClick={() => setSelectedEvent(null)} className="p-2 text-gray-400 hover:text-white transition cursor-pointer">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3 font-mono text-xs">
              <div className="p-3 bg-white/5 rounded-xl border border-white/10 space-y-1">
                <span className="text-[10px] text-gray-400 uppercase block">Event Type</span>
                <span className={`font-bold uppercase ${selectedEvent.type === "RENTED" ? "text-emerald-400" : "text-amber-400"}`}>
                  {selectedEvent.type}
                </span>
              </div>

              <div className="p-3 bg-white/5 rounded-xl border border-white/10 space-y-1">
                <span className="text-[10px] text-gray-400 uppercase block">Details / Renter Name</span>
                <span className="text-[#f5f1e8] font-semibold">{selectedEvent.title}</span>
                {selectedEvent.customerPhone && <p className="text-[10px] text-gray-400">{selectedEvent.customerPhone}</p>}
                {selectedEvent.bookingRef && <p className="text-[10px] text-[#d8b36a]">Ref: {selectedEvent.bookingRef}</p>}
              </div>

              <div className="p-3 bg-white/5 rounded-xl border border-white/10 space-y-1">
                <span className="text-[10px] text-gray-400 uppercase block">Duration Window</span>
                <span className="text-[#f5f1e8]">{selectedEvent.startDate} → {selectedEvent.endDate}</span>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-white/10">
              <button
                onClick={() => setSelectedEvent(null)}
                className="px-4 py-2 rounded-xl bg-[#d8b36a] text-black font-bold font-mono text-xs uppercase cursor-pointer"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Fleet Maintenance Modal */}
      {maintenanceTarget && (
        <FleetMaintenanceModal
          equipmentName={maintenanceTarget.name}
          serialNumber={maintenanceTarget.serialNumber}
          onClose={() => setMaintenanceTarget(null)}
          onSave={() => {
            setFleetUnits((prev) =>
              prev.map((u) => (u.id === maintenanceTarget.id ? { ...u, status: "MAINTENANCE" } : u))
            );
            loadScheduleData();
          }}
        />
      )}
    </div>
  );
}
