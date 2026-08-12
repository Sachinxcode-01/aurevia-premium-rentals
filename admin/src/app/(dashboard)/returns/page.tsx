"use client";

import React, { useState } from "react";
import { RotateCcw, AlertTriangle, Phone, MessageSquare, Check, X, ShieldAlert } from "lucide-react";

interface ReturnCase {
  id: string;
  bookingId: string;
  customerName: string;
  phone: string;
  equipmentName: string;
  expectedReturn: string;
  hoursOverdue?: number;
  status: "RETURNED_INSPECTION" | "OVERDUE" | "SETTLED";
}

const MOCK_RETURNS: ReturnCase[] = [
  { id: "RET-01", bookingId: "AUR-1035", customerName: "Deepak Mehta", phone: "+91 97111 22233", equipmentName: "ARRI Alexa Mini LF", expectedReturn: "12 Aug, 08:00 AM", hoursOverdue: 4, status: "OVERDUE" },
  { id: "RET-02", bookingId: "AUR-1039", customerName: "Priya Nair", phone: "+91 97444 55667", equipmentName: "Canon RF 70-200mm f/2.8L", expectedReturn: "12 Aug, 10:00 AM", status: "RETURNED_INSPECTION" },
];

export default function AdminReturnsPage() {
  const [cases, setCases] = useState<ReturnCase[]>(MOCK_RETURNS);

  const settleReturn = (id: string) => {
    setCases((prev) => prev.map((c) => (c.id === id ? { ...c, status: "SETTLED" } : c)));
    alert("Return inspection completed. Security deposit released.");
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="border-b border-white/5 pb-6">
        <h1 className="text-2xl font-light text-[#f5f1e8] font-serif flex items-center gap-3">
          <RotateCcw className="text-purple-400" size={24} />
          Returns Inspection &amp; Overdue Center
        </h1>
        <p className="text-xs text-[#9a9995] font-light mt-1">
          Perform physical damage inspections, process security deposit refunds, and handle late rental follow-ups.
        </p>
      </div>

      {/* Overdue Alert Banner */}
      <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-red-500/20 text-red-400">
            <AlertTriangle size={20} />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-red-400">1 Overdue Rental Alert</h3>
            <p className="text-xs text-[#9a9995]">Deepak Mehta is 4 hours overdue for ARRI Alexa Mini LF.</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <a href="tel:+919711122233" className="px-3 py-1.5 rounded-lg bg-red-500 text-[#070707] font-semibold text-xs flex items-center gap-1.5">
            <Phone size={14} />
            <span>Call Customer</span>
          </a>
          <a href="https://wa.me/919711122233" target="_blank" rel="noreferrer" className="px-3 py-1.5 rounded-lg bg-emerald-500 text-[#070707] font-semibold text-xs flex items-center gap-1.5">
            <MessageSquare size={14} />
            <span>WhatsApp</span>
          </a>
        </div>
      </div>

      {/* Table */}
      <div className="admin-card rounded-2xl overflow-hidden border border-white/10">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="bg-[#0c0c0c] border-b border-white/10 text-[#9a9995] font-mono text-[10px] uppercase">
              <th className="p-4">Case Ref</th>
              <th className="p-4">Booking ID</th>
              <th className="p-4">Customer</th>
              <th className="p-4">Equipment</th>
              <th className="p-4">Expected Return</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 text-[#f5f1e8]">
            {cases.map((c) => (
              <tr key={c.id} className="hover:bg-white/5 transition">
                <td className="p-4 font-mono text-[#d8b36a]">{c.id}</td>
                <td className="p-4 font-mono">{c.bookingId}</td>
                <td className="p-4">
                  <p className="font-medium">{c.customerName}</p>
                  <p className="text-[10px] text-[#9a9995] font-mono">{c.phone}</p>
                </td>
                <td className="p-4 font-medium">{c.equipmentName}</td>
                <td className="p-4 font-mono text-[11px]">{c.expectedReturn}</td>
                <td className="p-4">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono uppercase ${c.status === "OVERDUE" ? "bg-red-500/10 text-red-400 border border-red-500/30" : c.status === "SETTLED" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30" : "bg-purple-500/10 text-purple-400 border border-purple-500/30"}`}>
                    {c.status}
                  </span>
                </td>
                <td className="p-4 text-right">
                  {c.status !== "SETTLED" ? (
                    <button
                      onClick={() => settleReturn(c.id)}
                      className="px-3 py-1.5 rounded-lg bg-emerald-500 text-[#070707] font-semibold text-xs hover:bg-emerald-400 transition"
                    >
                      Inspect &amp; Release Deposit
                    </button>
                  ) : (
                    <span className="text-xs text-[#9a9995]">Deposit Settled</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
