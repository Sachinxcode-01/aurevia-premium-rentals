"use client";

import React, { useState } from "react";
import { RefreshCw, Check, AlertTriangle, ArrowRight } from "lucide-react";

interface RefundReq {
  id: string;
  bookingId: string;
  customerName: string;
  originalAmount: number;
  refundAmount: number;
  reason: string;
  status: "REQUESTED" | "PROCESSED" | "REJECTED";
  requestedDate: string;
}

const MOCK_REFUNDS: RefundReq[] = [
  { id: "RFD-101", bookingId: "AUR-1035", customerName: "Deepak Mehta", originalAmount: 14997, refundAmount: 14997, reason: "Shoot cancelled due to weather emergency", status: "REQUESTED", requestedDate: "11 Aug 2026" },
];

export default function AdminRefundsPage() {
  const [refunds, setRefunds] = useState<RefundReq[]>(MOCK_REFUNDS);

  const processRefund = (id: string) => {
    if (confirm("Confirm issuing Razorpay refund for this reservation?")) {
      setRefunds((prev) => prev.map((r) => (r.id === id ? { ...r, status: "PROCESSED" } : r)));
      alert("Refund request sent to Razorpay API successfully.");
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="border-b border-white/5 pb-6">
        <h1 className="text-2xl font-light text-[#f5f1e8] font-serif flex items-center gap-3">
          <RefreshCw className="text-[#d8b36a]" size={24} />
          Refund Request Approvals
        </h1>
        <p className="text-xs text-[#9a9995] font-light mt-1">
          Review customer cancellation refund claims, deposit settlements, and Razorpay reversals.
        </p>
      </div>

      <div className="admin-card rounded-2xl overflow-hidden border border-white/10">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="bg-[#0c0c0c] border-b border-white/10 text-[#9a9995] font-mono text-[10px] uppercase">
              <th className="p-4">Refund ID</th>
              <th className="p-4">Booking ID</th>
              <th className="p-4">Customer</th>
              <th className="p-4">Reason</th>
              <th className="p-4">Refund Amount</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 text-[#f5f1e8]">
            {refunds.map((r) => (
              <tr key={r.id} className="hover:bg-white/5 transition font-mono">
                <td className="p-4 text-[#d8b36a]">{r.id}</td>
                <td className="p-4">{r.bookingId}</td>
                <td className="p-4 font-sans font-medium">{r.customerName}</td>
                <td className="p-4 font-sans text-[#9a9995] max-w-xs truncate">{r.reason}</td>
                <td className="p-4 font-semibold text-emerald-400">₹{r.refundAmount.toLocaleString("en-IN")}</td>
                <td className="p-4">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] uppercase ${r.status === "PROCESSED" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30" : "bg-amber-500/10 text-amber-400 border border-amber-500/30"}`}>
                    {r.status}
                  </span>
                </td>
                <td className="p-4 text-right font-sans">
                  {r.status === "REQUESTED" ? (
                    <button
                      onClick={() => processRefund(r.id)}
                      className="px-3 py-1.5 rounded-lg bg-emerald-500 text-[#070707] font-semibold text-xs hover:bg-emerald-400 transition"
                    >
                      Process Refund
                    </button>
                  ) : (
                    <span className="text-xs text-[#9a9995]">Completed</span>
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
