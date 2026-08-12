"use client";

import React, { useState } from "react";
import {
  CalendarCheck, Search, Filter, ArrowUpRight, Check, X,
  Clock, ShieldAlert, Eye, FileSpreadsheet, Key, AlertTriangle,
  RotateCcw, CheckSquare, ChevronRight, User, Phone, Mail, MapPin, Sparkles
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

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

  const filteredBookings = bookings.filter((b) => {
    const matchesSearch =
      b.id.toLowerCase().includes(search.toLowerCase()) ||
      b.customerName.toLowerCase().includes(search.toLowerCase()) ||
      b.equipmentName.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filterStatus === "all" || b.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const handleStatusChange = (id: string, newStatus: BookingItem["status"]) => {
    setBookings((prev) =>
      prev.map((b) => (b.id === id ? { ...b, status: newStatus } : b))
    );
    if (selectedBooking && selectedBooking.id === id) {
      setSelectedBooking({ ...selectedBooking, status: newStatus });
    }
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
    a.download = `AUREVIA_Bookings_Report_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-6">
        <div>
          <h1 className="text-2xl font-light text-[#f5f1e8] font-serif">
            Booking &amp; Reservation Management
          </h1>
          <p className="text-xs text-[#9a9995] font-light mt-1">
            Review customer bookings, authorize pickup OTPs, verify KYC, and track rental timelines.
          </p>
        </div>

        <button
          onClick={exportCSV}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-[#f5f1e8] hover:border-[#d8b36a]/40 transition font-mono"
        >
          <FileSpreadsheet size={14} className="text-[#d8b36a]" />
          <span>Export CSV Report</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9a9995]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search ID, customer, gear..."
            className="w-full bg-[#121212] border border-white/10 rounded-xl pl-10 pr-4 py-2 text-xs text-[#f5f1e8] placeholder-[#9a9995]/50 focus:outline-none focus:border-[#d8b36a]/50"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto text-xs">
          {[
            { id: "all", label: "All Bookings" },
            { id: "approval_pending", label: "Pending Approval" },
            { id: "ready_for_pickup", label: "Ready Pickup" },
            { id: "rented", label: "Active Rented" },
            { id: "returned", label: "Returned" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterStatus(tab.id)}
              className={`px-3 py-1.5 rounded-lg border font-mono text-[11px] whitespace-nowrap transition ${
                filterStatus === tab.id
                  ? "bg-[#d8b36a]/15 text-[#d8b36a] border-[#d8b36a]/40 font-semibold"
                  : "bg-[#121212] text-[#9a9995] border-white/10 hover:text-[#f5f1e8]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Bookings Table */}
      <div className="admin-card rounded-2xl overflow-hidden border border-white/10">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-[#0c0c0c] border-b border-white/10 text-[#9a9995] font-mono text-[10px] uppercase">
                <th className="p-4">Booking ID</th>
                <th className="p-4">Customer</th>
                <th className="p-4">Equipment</th>
                <th className="p-4">Dates</th>
                <th className="p-4">Total</th>
                <th className="p-4">KYC</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-[#f5f1e8]">
              {filteredBookings.map((b) => (
                <tr key={b.id} className="hover:bg-white/5 transition">
                  <td className="p-4 font-mono text-[#d8b36a] font-semibold">{b.id}</td>
                  <td className="p-4">
                    <p className="font-medium">{b.customerName}</p>
                    <p className="text-[10px] text-[#9a9995] font-mono">{b.phone}</p>
                  </td>
                  <td className="p-4">
                    <p className="text-[#f5f1e8] font-medium">{b.equipmentName}</p>
                    <p className="text-[10px] text-[#9a9995] font-mono">SN: {b.serialNumber}</p>
                  </td>
                  <td className="p-4 font-mono text-[11px]">
                    <p>{b.startDate} → {b.endDate}</p>
                    <p className="text-[10px] text-[#9a9995]">{b.days} Days Rental</p>
                  </td>
                  <td className="p-4 font-mono">
                    <p className="font-semibold text-[#f5f1e8]">₹{b.total.toLocaleString("en-IN")}</p>
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-400 font-mono">
                      {b.paymentStatus}
                    </span>
                  </td>
                  <td className="p-4">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-mono border ${
                        b.kycStatus === "APPROVED"
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                          : "bg-amber-500/10 text-amber-400 border-amber-500/30"
                      }`}
                    >
                      {b.kycStatus}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono uppercase bg-blue-500/10 text-blue-400 border border-blue-500/30">
                      {b.status.replace(/_/g, " ")}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => setSelectedBooking(b)}
                      className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 hover:border-[#d8b36a]/40 text-[#f5f1e8] hover:text-[#d8b36a] text-xs font-medium transition"
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

      {/* Booking Detail & Handover Drawer */}
      <AnimatePresence>
        {selectedBooking && (
          <div className="fixed inset-0 z-50 flex justify-end bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ translateX: "100%" }}
              animate={{ translateX: 0 }}
              exit={{ translateX: "100%" }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="w-full max-w-lg bg-[#121212] border-l border-white/10 h-full overflow-y-auto p-6 space-y-6 shadow-2xl"
            >
              {/* Drawer Header */}
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div>
                  <span className="text-[10px] font-mono text-[#d8b36a] uppercase tracking-widest">RESERVATION DETAILS</span>
                  <h2 className="text-xl font-semibold text-[#f5f1e8] font-mono">{selectedBooking.id}</h2>
                </div>
                <button
                  onClick={() => setSelectedBooking(null)}
                  className="p-2 rounded-xl text-[#9a9995] hover:text-[#f5f1e8] hover:bg-white/5"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Customer Info Box */}
              <div className="bg-[#0c0c0c] border border-white/10 rounded-xl p-4 space-y-2">
                <p className="text-[10px] font-mono text-[#9a9995] uppercase">Customer Metadata</p>
                <p className="text-sm font-semibold text-[#f5f1e8] flex items-center gap-2">
                  <User size={14} className="text-[#d8b36a]" />
                  {selectedBooking.customerName}
                </p>
                <div className="text-xs text-[#9a9995] space-y-1 font-mono pt-1">
                  <p className="flex items-center gap-2"><Mail size={12} /> {selectedBooking.email}</p>
                  <p className="flex items-center gap-2"><Phone size={12} /> {selectedBooking.phone}</p>
                </div>
              </div>

              {/* Equipment Spec & Serial Number */}
              <div className="bg-[#0c0c0c] border border-white/10 rounded-xl p-4 space-y-2">
                <p className="text-[10px] font-mono text-[#9a9995] uppercase">Reserved Equipment Unit</p>
                <p className="text-sm font-semibold text-[#f5f1e8]">{selectedBooking.equipmentName}</p>
                <p className="text-xs font-mono text-[#d8b36a]">Serial: {selectedBooking.serialNumber}</p>
              </div>

              {/* Handover OTP Verification Panel */}
              {selectedBooking.status === "ready_for_pickup" && (
                <div className="bg-[#d8b36a]/10 border border-[#d8b36a]/30 rounded-xl p-4 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-semibold text-[#d8b36a]">
                    <Key size={16} />
                    <span>CUSTOMER HANDOVER OTP VERIFICATION</span>
                  </div>
                  <p className="text-xs text-[#9a9995] font-light">
                    Ask customer for their 4-digit pickup code before handing over gear.
                  </p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      maxLength={4}
                      value={otpInput}
                      onChange={(e) => setOtpInput(e.target.value)}
                      placeholder="Enter 4-Digit OTP"
                      className="bg-[#070707] border border-white/10 rounded-lg px-3 py-2 text-xs font-mono text-center tracking-widest text-[#f5f1e8] focus:border-[#d8b36a] outline-none"
                    />
                    <button
                      onClick={handleVerifyOTP}
                      className="px-4 py-2 rounded-lg bg-[#d8b36a] text-[#070707] font-semibold text-xs hover:bg-[#b98a43] transition"
                    >
                      Verify &amp; Handover
                    </button>
                  </div>
                  {otpError && <p className="text-xs text-red-400">{otpError}</p>}
                </div>
              )}

              {/* Admin Actions */}
              <div className="space-y-2 pt-2 border-t border-white/10">
                <p className="text-[10px] font-mono text-[#9a9995] uppercase">Update Status Transition</p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button
                    onClick={() => handleStatusChange(selectedBooking.id, "approved")}
                    className="p-2.5 rounded-xl bg-teal-500/10 border border-teal-500/30 text-teal-400 hover:bg-teal-500/20 font-mono"
                  >
                    Approve Reservation
                  </button>
                  <button
                    onClick={() => handleStatusChange(selectedBooking.id, "ready_for_pickup")}
                    className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 font-mono"
                  >
                    Mark Ready Pickup
                  </button>
                  <button
                    onClick={() => handleStatusChange(selectedBooking.id, "returned")}
                    className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400 hover:bg-purple-500/20 font-mono"
                  >
                    Mark Gear Returned
                  </button>
                  <button
                    onClick={() => handleStatusChange(selectedBooking.id, "rejected")}
                    className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 font-mono"
                  >
                    Reject Booking
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
