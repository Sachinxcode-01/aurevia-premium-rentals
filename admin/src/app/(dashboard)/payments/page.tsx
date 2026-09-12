"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  CreditCard,
  Search,
  CheckCircle2,
  RefreshCw,
  Loader2,
  TrendingUp,
  ShieldCheck,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";
import { adminApiClient } from "@/lib/api-client";
import { useAdminRealtime } from "@/lib/realtime";

interface PaymentTx {
  id: string;
  bookingId: string;
  customerName: string;
  amount: number;
  razorpayId: string;
  method: string;
  status: "PAID" | "FAILED" | "REFUNDED" | "AUTHORIZED";
  date: string;
}

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<PaymentTx[]>([]);
  const [totalVolume, setTotalVolume] = useState<number>(0);
  const [successfulCount, setSuccessfulCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const fetchPayments = useCallback(async (showLoading = false) => {
    if (showLoading) setLoading(true);
    try {
      const res: any = await adminApiClient.payments.list({
        status: statusFilter !== "all" ? statusFilter : undefined,
        limit: 100,
      });

      const list: PaymentTx[] =
        res?.transactions ||
        res?.data?.transactions ||
        (Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : []);
      setPayments(list);

      const vol =
        res?.totalVolume ??
        res?.data?.totalVolume ??
        list.reduce((sum, p) => sum + (p.amount || 0), 0);
      const count =
        res?.successfulCount ??
        res?.data?.successfulCount ??
        list.filter((p) => p.status === "PAID").length;

      setTotalVolume(vol);
      setSuccessfulCount(count);
    } catch (err: any) {
      console.error("Failed to load payments:", err);
    } finally {
      if (showLoading) setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchPayments(true);
  }, [fetchPayments]);

  useAdminRealtime(
    useCallback(
      (event: any) => {
        if (
          event?.table === "payments" ||
          event?.type === "BOOKING_UPDATED" ||
          event?.type === "SYNC_REFRESH"
        ) {
          fetchPayments(false);
        }
      },
      [fetchPayments]
    )
  );

  const filtered = payments.filter((p) => {
    const q = search.toLowerCase();
    return (
      p.bookingId?.toLowerCase().includes(q) ||
      p.customerName?.toLowerCase().includes(q) ||
      p.razorpayId?.toLowerCase().includes(q) ||
      p.id?.toLowerCase().includes(q)
    );
  });

  const aov = successfulCount > 0 ? Math.round(totalVolume / successfulCount) : 0;

  return (
    <div className="space-y-6 pb-12">
      <div className="border-b border-white/5 pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-light text-[#f5f1e8] font-serif flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-[#d8b36a]" />
            Payment Gateway Ledger
          </h1>
          <p className="text-xs text-[#9a9995] font-light mt-1">
            Razorpay checkout records, payment gateway callbacks, security deposits, and transaction audits.
          </p>
        </div>
        <button
          onClick={() => fetchPayments(true)}
          disabled={loading}
          className="self-start md:self-auto px-3 py-1.5 rounded-xl border border-white/10 text-xs text-[#9a9995] hover:text-[#f5f1e8] hover:border-white/20 transition flex items-center gap-1.5"
        >
          <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
          <span>Refresh</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="admin-card p-4 rounded-2xl border border-white/10">
          <p className="text-[10px] text-[#9a9995] uppercase font-mono tracking-wider">Settled Volume</p>
          <p className="text-2xl font-light text-[#f5f1e8] mt-1 font-serif">
            ₹{totalVolume.toLocaleString("en-IN")}
          </p>
        </div>
        <div className="admin-card p-4 rounded-2xl border border-white/10">
          <p className="text-[10px] text-[#9a9995] uppercase font-mono tracking-wider flex items-center gap-1">
            <CheckCircle2 size={12} className="text-emerald-400" /> Settled Txns
          </p>
          <p className="text-2xl font-light text-emerald-400 mt-1 font-serif">{successfulCount}</p>
        </div>
        <div className="admin-card p-4 rounded-2xl border border-white/10">
          <p className="text-[10px] text-[#9a9995] uppercase font-mono tracking-wider flex items-center gap-1">
            <TrendingUp size={12} className="text-[#d8b36a]" /> Avg Order Value
          </p>
          <p className="text-2xl font-light text-[#d8b36a] mt-1 font-serif">
            ₹{aov.toLocaleString("en-IN")}
          </p>
        </div>
        <div className="admin-card p-4 rounded-2xl border border-white/10">
          <p className="text-[10px] text-[#9a9995] uppercase font-mono tracking-wider flex items-center gap-1">
            <ShieldCheck size={12} className="text-blue-400" /> Gateway
          </p>
          <p className="text-xl font-light text-blue-400 mt-1 font-mono">Razorpay Live</p>
        </div>
      </div>

      {/* Filter controls */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9a9995]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by Razorpay ID, booking ID, customer name..."
            className="w-full bg-[#121212] border border-white/10 rounded-xl pl-10 pr-4 py-2 text-xs text-[#f5f1e8] placeholder-[#9a9995]/50 focus:outline-none focus:border-[#d8b36a]"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-[#121212] border border-white/10 rounded-xl px-3 py-2 text-xs text-[#f5f1e8] font-mono outline-none w-full sm:w-40"
        >
          <option value="all">All Statuses</option>
          <option value="PAID">PAID (Captured)</option>
          <option value="AUTHORIZED">AUTHORIZED</option>
          <option value="REFUNDED">REFUNDED</option>
          <option value="FAILED">FAILED</option>
        </select>
      </div>

      {/* Transactions Table */}
      <div className="admin-card rounded-2xl overflow-hidden border border-white/10">
        {loading ? (
          <div className="p-12 flex flex-col items-center justify-center text-[#9a9995] gap-3">
            <Loader2 className="w-6 h-6 animate-spin text-[#d8b36a]" />
            <p className="text-xs font-light">Loading payment gateway transaction logs...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-[#9a9995]">
            <CreditCard className="w-10 h-10 mx-auto mb-2 opacity-30 text-[#d8b36a]" />
            <p className="text-sm text-[#f5f1e8] font-medium">No transactions recorded</p>
            <p className="text-xs mt-1">Transactions will show here as bookings are placed via Razorpay.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-[#0c0c0c] border-b border-white/10 text-[#9a9995] font-mono text-[10px] uppercase">
                  <th className="p-4">Payment ID</th>
                  <th className="p-4">Booking ID</th>
                  <th className="p-4">Customer</th>
                  <th className="p-4">Razorpay Ref</th>
                  <th className="p-4">Method</th>
                  <th className="p-4">Date / Time</th>
                  <th className="p-4">Amount</th>
                  <th className="p-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-[#f5f1e8]">
                {filtered.map((p) => (
                  <tr key={p.id} className="hover:bg-white/5 transition font-mono">
                    <td className="p-4 text-[#d8b36a]">{p.id}</td>
                    <td className="p-4 text-[#f5f1e8]">
                      <Link
                        href={`/bookings`}
                        className="hover:text-[#d8b36a] flex items-center gap-1 group transition"
                      >
                        <span>{p.bookingId}</span>
                        <ExternalLink size={11} className="opacity-0 group-hover:opacity-100 transition" />
                      </Link>
                    </td>
                    <td className="p-4 font-sans font-medium text-[#f5f1e8]">{p.customerName}</td>
                    <td className="p-4 text-[#9a9995]">{p.razorpayId || "—"}</td>
                    <td className="p-4 text-[#9a9995] font-sans">{p.method || "Razorpay Standard"}</td>
                    <td className="p-4 text-[11px] text-[#9a9995]">{p.date}</td>
                    <td className="p-4 font-semibold text-[#f5f1e8]">
                      ₹{(p.amount || 0).toLocaleString("en-IN")}
                    </td>
                    <td className="p-4 text-right">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] border font-mono ${
                          p.status === "PAID"
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                            : p.status === "REFUNDED"
                            ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                            : "bg-red-500/10 text-red-400 border-red-500/30"
                        }`}
                      >
                        {p.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
