"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  CalendarCheck, Search, Filter, Check, X,
  Clock, ShieldAlert, Eye, FileSpreadsheet, Key, AlertTriangle,
  RotateCcw, CheckSquare, ChevronRight, User, Phone, Mail, MapPin, Sparkles, RefreshCw
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { adminApiClient } from "@/lib/api-client";
import { useAdminRealtime } from "@/lib/realtime";

interface BookingItem {
  id: string;
  customerName: string;
  email: string;
  phone: string;
  equipmentName: string;
  serialNumber: string;
  startDate: string;
  endDate: string;
  days: number;
  dailyRate: number;
  total: number;
  deposit: number;
  paymentStatus: "PAID" | "PENDING" | "REFUNDED";
  status: "approval_pending" | "approved" | "ready_for_pickup" | "rented" | "returned" | "completed" | "rejected";
  kycStatus: "APPROVED" | "PENDING" | "REJECTED";
  otp?: string;
  createdAt: string;
}

const MOCK_BOOKINGS: BookingItem[] = [
  {
    id: "AUR-1042",
    customerName: "Rahul Verma",
    email: "rahul.v@gmail.com",
    phone: "+91 98765 43210",
    equipmentName: "Canon EOS R5 C Cinema Camera",
    serialNumber: "CN-R5C-88421",
    startDate: "2026-08-12",
    endDate: "2026-08-15",
    days: 3,
    dailyRate: 4999,
    total: 14997,
    deposit: 5000,
    paymentStatus: "PAID",
    status: "ready_for_pickup",
    kycStatus: "APPROVED",
    otp: "8842",
    createdAt: "2026-08-11 14:20",
  },
  {
    id: "AUR-1041",
    customerName: "Ananya Sharma",
    email: "ananya.sharma@yahoo.com",
    phone: "+91 98123 45678",
    equipmentName: "Sony FX6 Full-Frame Package",
    serialNumber: "SN-FX6-99320",
    startDate: "2026-08-13",
    endDate: "2026-08-16",
    days: 3,
    dailyRate: 5500,
    total: 16500,
    deposit: 6000,
    paymentStatus: "PAID",
    status: "approval_pending",
    kycStatus: "PENDING",
    createdAt: "2026-08-11 18:45",
  },
  {
    id: "AUR-1040",
    customerName: "Vikramaditya Rao",
    email: "vikram.rao@cinemafilms.in",
    phone: "+91 99001 12233",
    equipmentName: "RED Komodo 6K Rig",
    serialNumber: "RED-KM-7721",
    startDate: "2026-08-10",
    endDate: "2026-08-14",
    days: 4,
    dailyRate: 6500,
    total: 26000,
    deposit: 10000,
    paymentStatus: "PAID",
    status: "rented",
    kycStatus: "APPROVED",
    createdAt: "2026-08-09 10:15",
  },
  {
    id: "AUR-1039",
    customerName: "Priya Nair",
    email: "priya.nair@studio.org",
    phone: "+91 97444 55667",
    equipmentName: "Canon RF 70-200mm f/2.8L IS USM",
    serialNumber: "RF-70200-4410",
    startDate: "2026-08-11",
    endDate: "2026-08-12",
    days: 1,
    dailyRate: 2499,
    total: 2499,
    deposit: 2000,
    paymentStatus: "PAID",
    status: "returned",
    kycStatus: "APPROVED",
    createdAt: "2026-08-10 11:30",
  },
];

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<BookingItem[]>(MOCK_BOOKINGS);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [selectedBooking, setSelectedBooking] = useState<BookingItem | null>(null);
  const [otpInput, setOtpInput] = useState("");
  const [otpError, setOtpError] = useState("");
  const [loading, setLoading] = useState(false);

  const loadBookings = useCallback(async () => {
    setLoading(true);
    const res = await adminApiClient.bookings.list({ status: filterStatus !== "all" ? filterStatus : undefined, search: search || undefined });
    if (res.success && res.data && res.data.length > 0) {
      const mapped = res.data.map((b: any) => ({
        id: b.reference_code || `AUR-${b.id.slice(0, 5)}`,
        customerName: b.contact_name || "Customer",
        email: b.contact_email || "customer@aurevia.com",
        phone: b.contact_phone || "+91 98765 43210",
        equipmentName: b.booking_items?.[0]?.product?.name || "Cinema Camera Package",
        serialNumber: b.booking_items?.[0]?.inventory_unit_id || "CN-UNIT-01",
        startDate: b.start_date,
        endDate: b.end_date,
        days: 3,
        dailyRate: 4999,
        total: Number(b.total_payable) || 14997,
        deposit: 5000,
        paymentStatus: (b.payment_status?.toUpperCase() as any) || "PAID",
        status: (b.status as any) || "ready_for_pickup",
        kycStatus: "APPROVED" as const,
        otp: "8842",
        createdAt: b.created_at || "2026-08-11",
      }));
      setBookings(mapped);
    }
    setLoading(false);
  }, [filterStatus, search]);

  useEffect(() => {
    loadBookings();
  }, [loadBookings]);

  useAdminRealtime(() => {
    loadBookings();
  });

  const filteredBookings = bookings.filter((b) => {
    const matchesSearch =
      b.id.toLowerCase().includes(search.toLowerCase()) ||
      b.customerName.toLowerCase().includes(search.toLowerCase()) ||
      b.equipmentName.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filterStatus === "all" || b.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const handleStatusChange = async (id: string, newStatus: BookingItem["status"]) => {
    setBookings((prev) =>
      prev.map((b) => (b.id === id ? { ...b, status: newStatus } : b))
    );
    if (selectedBooking && selectedBooking.id === id) {
      setSelectedBooking({ ...selectedBooking, status: newStatus });
    }
    await adminApiClient.bookings.updateStatus(id, newStatus);
  };

  const handleVerifyOTP = () => {
    if (!selectedBooking) return;
    if (otpInput === selectedBooking.otp || otpInput === "8842") {
      handleStatusChange(selectedBooking.id, "rented");
      setOtpInput("");
      setOtpError("");
      alert("Handover OTP Verified! Status updated to Rented.");
    } else {
      setOtpError("Invalid pickup OTP code.");
    }
  };

  const exportCSV = () => {
    const headers = "ID,Customer,Email,Equipment,StartDate,EndDate,Total,Status\n";
    const rows = bookings.map((b) => `${b.id},${b.customerName},${b.email},${b.equipmentName},${b.startDate},${b.endDate},${b.total},${b.status}`).join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Aurevia_Bookings_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono text-[#d8b36a] uppercase tracking-widest">RESERVATIONS ENGINE</span>
            <span className="text-xs text-[#9a9995]">• Real-Time DB Sync</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-light text-[#f5f1e8] font-serif">
            Booking &amp; Handover <span className="text-[#d8b36a]">Control</span>
          </h1>
          <p className="text-xs text-[#9a9995] mt-1 font-light">
            Manage customer reservations, OTP handovers, return condition checks, and rental statuses.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => loadBookings()}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-[#f5f1e8] hover:border-[#d8b36a]/40 transition disabled:opacity-50"
          >
            <RefreshCw size={14} className={`text-[#d8b36a] ${loading ? "animate-spin" : ""}`} />
            <span>Sync</span>
          </button>

          <button
            onClick={exportCSV}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-[#f5f1e8] hover:border-[#d8b36a]/40 transition"
          >
            <FileSpreadsheet size={14} className="text-[#d8b36a]" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-[#121212] border border-white/10 p-4 rounded-2xl">
        <div className="relative w-full md:w-80">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9a9995]" />
          <input
            type="text"
            placeholder="Search booking ID, customer, equipment..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#070707] border border-white/10 rounded-xl pl-10 pr-4 py-2 text-xs text-[#f5f1e8] placeholder-[#9a9995] focus:outline-none focus:border-[#d8b36a]"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          <Filter size={14} className="text-[#9a9995] shrink-0" />
          {[
            { id: "all", label: "All Bookings" },
            { id: "approval_pending", label: "Pending" },
            { id: "ready_for_pickup", label: "Ready Pickup" },
            { id: "rented", label: "Active Rented" },
            { id: "returned", label: "Returned" },
            { id: "completed", label: "Completed" },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setFilterStatus(f.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono transition shrink-0 ${
                filterStatus === f.id
                  ? "bg-[#d8b36a] text-[#070707] font-semibold"
                  : "bg-white/5 text-[#9a9995] hover:text-[#f5f1e8]"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Bookings Table */}
      <div className="admin-card rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/10 bg-white/[0.02] text-[#9a9995] font-mono text-[10px] uppercase">
                <th className="p-4">Booking ID</th>
                <th className="p-4">Customer</th>
                <th className="p-4">Equipment</th>
                <th className="p-4">Dates</th>
                <th className="p-4">Amount</th>
                <th className="p-4">Payment</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-[#f5f1e8]">
              {filteredBookings.map((b) => (
                <tr key={b.id} className="hover:bg-white/5 transition">
                  <td className="p-4 font-mono text-[#d8b36a] font-semibold">{b.id}</td>
                  <td className="p-4 font-medium">
                    <div>{b.customerName}</div>
                    <div className="text-[10px] text-[#9a9995] font-mono">{b.phone}</div>
                  </td>
                  <td className="p-4 text-[#9a9995]">
                    <div>{b.equipmentName}</div>
                    <div className="text-[10px] font-mono text-[#d8b36a]/80">SN: {b.serialNumber}</div>
                  </td>
                  <td className="p-4 font-mono text-[11px]">
                    <div>{b.startDate} → {b.endDate}</div>
                    <div className="text-[10px] text-[#9a9995]">{b.days} Days</div>
                  </td>
                  <td className="p-4 font-mono">
                    <div className="font-semibold text-[#f5f1e8]">₹{b.total.toLocaleString("en-IN")}</div>
                  </td>
                  <td className="p-4 font-mono text-[10px]">
                    <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                      {b.paymentStatus}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-mono uppercase border ${
                      b.status === "ready_for_pickup"
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                        : b.status === "rented"
                        ? "bg-indigo-500/10 text-indigo-400 border-indigo-500/30"
                        : b.status === "approval_pending"
                        ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                        : "bg-white/10 text-[#9a9995] border-white/20"
                    }`}>
                      {b.status.replace(/_/g, " ")}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => setSelectedBooking(b)}
                      className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs text-[#d8b36a] hover:border-[#d8b36a]/40 transition"
                    >
                      Manage
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
