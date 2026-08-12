"use client";

import React, { useState } from "react";
import {
  TrendingUp, TrendingDown, DollarSign, CalendarCheck, Camera,
  ShieldAlert, RotateCcw, AlertCircle, ArrowUpRight, CheckCircle2,
  Clock, RefreshCw, Eye, ArrowRight, Sparkles, Filter, ChevronDown
} from "lucide-react";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip,
  CartesianGrid, PieChart, Pie, Cell, BarChart, Bar
} from "recharts";
import { motion } from "motion/react";
import Link from "next/link";

/* ─── Mock Real-Time Business Data ───────────────────────────── */
const REVENUE_DATA_30D = [
  { date: "Aug 1", revenue: 8400, bookings: 2 },
  { date: "Aug 2", revenue: 12200, bookings: 3 },
  { date: "Aug 3", revenue: 9500, bookings: 2 },
  { date: "Aug 4", revenue: 16800, bookings: 4 },
  { date: "Aug 5", revenue: 21000, bookings: 5 },
  { date: "Aug 6", revenue: 18400, bookings: 4 },
  { date: "Aug 7", revenue: 24500, bookings: 6 },
  { date: "Aug 8", revenue: 19800, bookings: 5 },
  { date: "Aug 9", revenue: 28900, bookings: 7 },
  { date: "Aug 10", revenue: 31200, bookings: 8 },
  { date: "Aug 11", revenue: 26400, bookings: 6 },
  { date: "Aug 12", revenue: 14800, bookings: 5 },
];

const STATUS_DISTRIBUTION = [
  { name: "Active Rentals", value: 14, color: "#818cf8" },
  { name: "Ready Pickup", value: 6, color: "#34d399" },
  { name: "Confirmed", value: 8, color: "#38bdf8" },
  { name: "Approval Pending", value: 4, color: "#fbbf24" },
  { name: "Returned", value: 7, color: "#c084fc" },
  { name: "Completed", value: 18, color: "#9ca3af" },
  { name: "Overdue", value: 1, color: "#f87171" },
];

const MOST_RENTED_GEAR = [
  { id: "canon-eos-r5-c", name: "Canon EOS R5 C Cinema Camera", count: 18, revenue: 89820, utilization: 88, image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=400" },
  { id: "sony-fx6", name: "Sony FX6 Full-Frame Cinema Camera", count: 15, revenue: 82500, utilization: 82, image: "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?q=80&w=400" },
  { id: "red-komodo-6k", name: "RED Komodo 6K Digital Cinema", count: 12, revenue: 78000, utilization: 75, image: "https://images.unsplash.com/photo-1589872737418-202b8015e378?q=80&w=400" },
  { id: "canon-rf-24-70mm", name: "Canon RF 24-70mm f/2.8L IS USM", count: 24, revenue: 47760, utilization: 92, image: "https://images.unsplash.com/photo-1617005082133-548c4dd27f35?q=80&w=400" },
];

const RECENT_BOOKINGS = [
  { id: "AUR-1042", customer: "Rahul Verma", gear: "Canon EOS R5 C", dates: "12 Aug - 15 Aug", amount: 14997, payment: "PAID", status: "ready_for_pickup" },
  { id: "AUR-1041", customer: "Ananya Sharma", gear: "Sony FX6 Cinema Package", dates: "13 Aug - 16 Aug", amount: 16500, payment: "PAID", status: "approval_pending" },
  { id: "AUR-1040", customer: "Vikramaditya Rao", gear: "RED Komodo 6K Rig", dates: "10 Aug - 14 Aug", amount: 26000, payment: "PAID", status: "rented" },
  { id: "AUR-1039", customer: "Priya Nair", gear: "Canon RF 70-200mm f/2.8L", dates: "11 Aug - 12 Aug", amount: 2499, payment: "PAID", status: "returned" },
  { id: "AUR-1038", customer: "Siddharth Malhotra", gear: "ARRI Alexa Mini LF", dates: "08 Aug - 11 Aug", amount: 45000, payment: "PAID", status: "completed" },
];

const ACTIVITY_FEED = [
  { id: 1, type: "payment", text: "Payment of ₹14,997 received for Booking #AUR-1042", time: "5 minutes ago", icon: DollarSign, color: "text-emerald-400 bg-emerald-500/10" },
  { id: 2, type: "kyc", text: "KYC Verification submitted by Rahul Verma", time: "12 minutes ago", icon: ShieldAlert, color: "text-amber-400 bg-amber-500/10" },
  { id: 3, type: "return", text: "Equipment returned for Booking #AUR-1039 in good condition", time: "1 hour ago", icon: RotateCcw, color: "text-purple-400 bg-purple-500/10" },
  { id: 4, type: "overdue", text: "Rental #AUR-1035 is now 4 hours overdue", time: "2 hours ago", icon: AlertCircle, color: "text-red-400 bg-red-500/10" },
];

export default function AdminOverviewDashboard() {
  const [timeRange, setTimeRange] = useState("30D");

  return (
    <div className="space-y-8 pb-12">
      {/* Dynamic Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono text-[#d8b36a] uppercase tracking-widest">AUREVIA OPERATIONS</span>
            <span className="text-xs text-[#9a9995]">• Wednesday, 12 August 2026</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-light text-[#f5f1e8] font-serif">
            Good morning, <span className="text-[#d8b36a]">Prem</span>
          </h1>
          <p className="text-xs text-[#9a9995] mt-1 font-light">
            Real-time fleet utilization, revenue intelligence, and reservation status.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center bg-[#121212] border border-white/10 rounded-xl p-1 text-xs">
            {["7D", "30D", "3M", "1Y"].map((r) => (
              <button
                key={r}
                onClick={() => setTimeRange(r)}
                className={`px-3 py-1.5 rounded-lg font-mono text-[11px] transition ${
                  timeRange === r
                    ? "bg-[#d8b36a] text-[#070707] font-semibold shadow-md shadow-[#d8b36a]/10"
                    : "text-[#9a9995] hover:text-[#f5f1e8]"
                }`}
              >
                {r}
              </button>
            ))}
          </div>

          <Link
            href="/reports"
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-[#f5f1e8] hover:border-[#d8b36a]/40 transition"
          >
            <Sparkles size={14} className="text-[#d8b36a]" />
            <span>Generate Report</span>
          </Link>
        </div>
      </div>

      {/* KPI Section */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {/* Total Revenue */}
        <div className="admin-card p-4 rounded-2xl admin-card-hover space-y-3">
          <div className="flex items-center justify-between text-xs text-[#9a9995]">
            <span className="font-mono uppercase tracking-wider">Total Revenue</span>
            <DollarSign size={16} className="text-[#d8b36a]" />
          </div>
          <div>
            <p className="text-2xl font-semibold text-[#f5f1e8] font-mono">₹2,84,240</p>
            <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 mt-1">
              <TrendingUp size={12} />
              <span>+14.2% vs last month</span>
            </div>
          </div>
        </div>

        {/* Today's Revenue */}
        <div className="admin-card p-4 rounded-2xl admin-card-hover space-y-3">
          <div className="flex items-center justify-between text-xs text-[#9a9995]">
            <span className="font-mono uppercase tracking-wider">Today&apos;s Revenue</span>
            <DollarSign size={16} className="text-[#d8b36a]" />
          </div>
          <div>
            <p className="text-2xl font-semibold text-[#f5f1e8] font-mono">₹14,800</p>
            <div className="flex items-center gap-1.5 text-[11px] text-[#9a9995] mt-1">
              <span>5 completed transactions</span>
            </div>
          </div>
        </div>

        {/* Active Rentals */}
        <div className="admin-card p-4 rounded-2xl admin-card-hover space-y-3">
          <div className="flex items-center justify-between text-xs text-[#9a9995]">
            <span className="font-mono uppercase tracking-wider">Active Rentals</span>
            <Camera size={16} className="text-indigo-400" />
          </div>
          <div>
            <p className="text-2xl font-semibold text-[#f5f1e8] font-mono">14</p>
            <div className="flex items-center gap-1.5 text-[11px] text-indigo-400 mt-1">
              <span>82% Fleet Utilization</span>
            </div>
          </div>
        </div>

        {/* Pending KYC */}
        <div className="admin-card p-4 rounded-2xl admin-card-hover space-y-3 border-amber-500/30 bg-amber-500/5">
          <div className="flex items-center justify-between text-xs text-amber-400">
            <span className="font-mono uppercase tracking-wider">Pending KYC</span>
            <ShieldAlert size={16} />
          </div>
          <div>
            <p className="text-2xl font-semibold text-amber-400 font-mono">4</p>
            <Link href="/kyc" className="flex items-center gap-1 text-[11px] text-amber-300 hover:underline mt-1">
              <span>Requires action</span>
              <ArrowRight size={10} />
            </Link>
          </div>
        </div>

        {/* Overdue Rentals */}
        <div className="admin-card p-4 rounded-2xl admin-card-hover space-y-3 border-red-500/30 bg-red-500/5">
          <div className="flex items-center justify-between text-xs text-red-400">
            <span className="font-mono uppercase tracking-wider">Overdue</span>
            <AlertCircle size={16} />
          </div>
          <div>
            <p className="text-2xl font-semibold text-red-400 font-mono">1</p>
            <Link href="/returns" className="flex items-center gap-1 text-[11px] text-red-300 hover:underline mt-1">
              <span>View contact alert</span>
              <ArrowRight size={10} />
            </Link>
          </div>
        </div>
      </div>

      {/* Main Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Large Revenue Chart (2 Cols) */}
        <div className="lg:col-span-2 admin-card p-6 rounded-2xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-medium text-[#f5f1e8]">Revenue &amp; Booking Trends</h3>
              <p className="text-xs text-[#9a9995] font-light">Gross daily rental earnings over selected duration</p>
            </div>
            <div className="flex items-center gap-4 text-xs font-mono">
              <span className="flex items-center gap-1.5 text-[#d8b36a]">
                <span className="w-2 h-2 rounded-full bg-[#d8b36a]" />
                Revenue (₹)
              </span>
            </div>
          </div>

          <div className="h-72 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={REVENUE_DATA_30D}>
                <defs>
                  <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#d8b36a" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#d8b36a" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="date" stroke="#9a9995" fontSize={11} tickLine={false} />
                <YAxis stroke="#9a9995" fontSize={11} tickLine={false} tickFormatter={(v) => `₹${v / 1000}k`} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#121212", borderColor: "rgba(255,255,255,0.15)", borderRadius: "12px", fontSize: "12px" }}
                  formatter={(val: any) => [`₹${Number(val).toLocaleString("en-IN")}`, "Revenue"]}
                />
                <Area type="monotone" dataKey="revenue" stroke="#d8b36a" strokeWidth={2} fillOpacity={1} fill="url(#revenueGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Fleet Distribution Donut (1 Col) */}
        <div className="admin-card p-6 rounded-2xl space-y-4">
          <div>
            <h3 className="text-base font-medium text-[#f5f1e8]">Booking Status Distribution</h3>
            <p className="text-xs text-[#9a9995] font-light">Breakdown of current active pipeline</p>
          </div>

          <div className="h-56 w-full flex items-center justify-center relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={STATUS_DISTRIBUTION}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {STATUS_DISTRIBUTION.map((entry, idx) => (
                    <Cell key={idx} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: "#121212", borderColor: "rgba(255,255,255,0.15)", borderRadius: "12px", fontSize: "12px" }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-bold font-mono text-[#f5f1e8]">68</span>
              <span className="text-[10px] text-[#9a9995] uppercase font-mono">Total Units</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/5 text-[11px]">
            {STATUS_DISTRIBUTION.slice(0, 4).map((s) => (
              <div key={s.name} className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color }} />
                <span className="text-[#9a9995] truncate">{s.name}:</span>
                <span className="font-mono text-[#f5f1e8] font-semibold">{s.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Operational Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Bookings Table (2 Cols) */}
        <div className="lg:col-span-2 admin-card p-6 rounded-2xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-medium text-[#f5f1e8]">Recent Reservations</h3>
              <p className="text-xs text-[#9a9995] font-light">Latest customer rental requests</p>
            </div>
            <Link href="/bookings" className="text-xs text-[#d8b36a] hover:underline flex items-center gap-1 font-mono">
              <span>View All</span>
              <ArrowRight size={12} />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-white/10 text-[#9a9995] font-mono text-[10px] uppercase">
                  <th className="pb-3">Booking ID</th>
                  <th className="pb-3">Customer</th>
                  <th className="pb-3">Equipment</th>
                  <th className="pb-3">Dates</th>
                  <th className="pb-3">Amount</th>
                  <th className="pb-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-[#f5f1e8]">
                {RECENT_BOOKINGS.map((b) => (
                  <tr key={b.id} className="hover:bg-white/5 transition">
                    <td className="py-3 font-mono text-[#d8b36a]">{b.id}</td>
                    <td className="py-3 font-medium">{b.customer}</td>
                    <td className="py-3 text-[#9a9995]">{b.gear}</td>
                    <td className="py-3 font-mono text-[11px]">{b.dates}</td>
                    <td className="py-3 font-mono">₹{b.amount.toLocaleString("en-IN")}</td>
                    <td className="py-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                        {b.status.replace(/_/g, " ")}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Real-Time Activity Feed (1 Col) */}
        <div className="admin-card p-6 rounded-2xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-medium text-[#f5f1e8]">Live Audit Activity</h3>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>

          <div className="space-y-4">
            {ACTIVITY_FEED.map((act) => {
              const Icon = act.icon;
              return (
                <div key={act.id} className="flex items-start gap-3 text-xs border-b border-white/5 pb-3 last:border-none">
                  <div className={`p-2 rounded-xl shrink-0 ${act.color}`}>
                    <Icon size={14} />
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-[#f5f1e8] font-light leading-snug">{act.text}</p>
                    <p className="text-[10px] font-mono text-[#9a9995]">{act.time}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Ranked Most Rented Equipment */}
      <div className="admin-card p-6 rounded-2xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-medium text-[#f5f1e8]">Flagship Equipment Utilization</h3>
            <p className="text-xs text-[#9a9995] font-light">Highest grossing cinema inventory</p>
          </div>
          <Link href="/inventory" className="text-xs text-[#d8b36a] hover:underline font-mono">
            Manage Fleet →
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {MOST_RENTED_GEAR.map((item) => (
            <div key={item.id} className="bg-[#0c0c0c] border border-white/10 rounded-xl p-4 space-y-3">
              <div className="h-32 rounded-lg bg-cover bg-center" style={{ backgroundImage: `url(${item.image})` }} />
              <div>
                <h4 className="text-xs font-semibold text-[#f5f1e8] truncate">{item.name}</h4>
                <div className="flex items-center justify-between text-[11px] font-mono text-[#9a9995] mt-1">
                  <span>{item.count} Rentals</span>
                  <span className="text-[#d8b36a]">₹{item.revenue.toLocaleString("en-IN")}</span>
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] font-mono text-[#9a9995]">
                  <span>Utilization</span>
                  <span className="text-emerald-400">{item.utilization}%</span>
                </div>
                <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-[#d8b36a] rounded-full" style={{ width: `${item.utilization}%` }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
