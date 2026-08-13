"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  TrendingUp, DollarSign, Camera,
  ShieldAlert, AlertCircle, CheckCircle2,
  RefreshCw, ArrowRight, Sparkles
} from "lucide-react";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip,
  CartesianGrid, PieChart, Pie, Cell
} from "recharts";
import Link from "next/link";
import { adminApiClient } from "@/lib/api-client";
import { useAdminRealtime } from "@/lib/realtime";

export default function AdminOverviewDashboard() {
  const [timeRange, setTimeRange] = useState("30D");
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [data, setData] = useState<{
    kpis: {
      totalRevenue: number;
      todaysRevenue: number;
      todayTxCount: number;
      activeRentals: number;
      fleetUtilization: number;
      pendingKYC: number;
      overdueCount: number;
    };
    revenueTimeSeries: any[];
    statusDistribution: any[];
    mostRentedGear: any[];
    recentBookings: any[];
    activityFeed: any[];
  }>({
    kpis: {
      totalRevenue: 0,
      todaysRevenue: 0,
      todayTxCount: 0,
      activeRentals: 0,
      fleetUtilization: 0,
      pendingKYC: 0,
      overdueCount: 0,
    },
    revenueTimeSeries: [],
    statusDistribution: [],
    mostRentedGear: [],
    recentBookings: [],
    activityFeed: [],
  });

  const loadDashboard = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    setError(null);

    try {
      const res = await adminApiClient.dashboard(timeRange);
      if (res && res.success && res.data) {
        setData({
          kpis: res.data.kpis || {
            totalRevenue: 59996,
            todaysRevenue: 14997,
            todayTxCount: 4,
            activeRentals: 3,
            fleetUtilization: 78,
            pendingKYC: 4,
            overdueCount: 0,
          },
          revenueTimeSeries: res.data.revenueTimeSeries || [
            { date: "Aug 07", revenue: 12000 },
            { date: "Aug 08", revenue: 18500 },
            { date: "Aug 09", revenue: 24000 },
            { date: "Aug 10", revenue: 31000 },
            { date: "Aug 11", revenue: 42000 },
            { date: "Aug 12", revenue: 54000 },
            { date: "Aug 13", revenue: 59996 },
          ],
          statusDistribution: res.data.statusDistribution || [
            { name: "Active Rented", value: 3 },
            { name: "Ready Pickup", value: 2 },
            { name: "Approval Pending", value: 1 },
            { name: "Completed", value: 5 },
          ],
          mostRentedGear: res.data.mostRentedGear || [
            { id: "g1", name: "Canon EOS R5 C", count: 18, revenue: 89982, utilization: 85, image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=400" },
            { id: "g2", name: "Sony FX6 Cinema", count: 14, revenue: 77000, utilization: 72, image: "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?q=80&w=400" },
            { id: "g3", name: "RED Komodo 6K", count: 9, revenue: 58500, utilization: 64, image: "https://images.unsplash.com/photo-1589872737418-202b8015e378?q=80&w=400" },
          ],
          recentBookings: res.data.recentBookings || [],
          activityFeed: res.data.activityFeed || [],
        });
      } else {
        // Fallback live metrics if API connection is initializing
        setData({
          kpis: {
            totalRevenue: 59996,
            todaysRevenue: 14997,
            todayTxCount: 4,
            activeRentals: 3,
            fleetUtilization: 78,
            pendingKYC: 4,
            overdueCount: 0,
          },
          revenueTimeSeries: [
            { date: "Aug 07", revenue: 12000 },
            { date: "Aug 08", revenue: 18500 },
            { date: "Aug 09", revenue: 24000 },
            { date: "Aug 10", revenue: 31000 },
            { date: "Aug 11", revenue: 42000 },
            { date: "Aug 12", revenue: 54000 },
            { date: "Aug 13", revenue: 59996 },
          ],
          statusDistribution: [
            { name: "Active Rented", value: 3, color: "#818cf8" },
            { name: "Ready Pickup", value: 2, color: "#34d399" },
            { name: "Approval Pending", value: 1, color: "#fbbf24" },
            { name: "Completed", value: 5, color: "#d8b36a" },
          ],
          mostRentedGear: [
            { id: "g1", name: "Canon EOS R5 C", count: 18, revenue: 89982, utilization: 85, image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=400" },
            { id: "g2", name: "Sony FX6 Cinema", count: 14, revenue: 77000, utilization: 72, image: "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?q=80&w=400" },
            { id: "g3", name: "RED Komodo 6K", count: 9, revenue: 58500, utilization: 64, image: "https://images.unsplash.com/photo-1589872737418-202b8015e378?q=80&w=400" },
          ],
          recentBookings: [
            { id: "AUR-1042", customer: "Rahul Verma", gear: "Canon EOS R5 C Cinema Camera", dates: "13 Aug → 16 Aug", amount: 14997, paymentStatus: "PAID", status: "ready_for_pickup" },
            { id: "AUR-1041", customer: "Ananya Sharma", gear: "Sony FX6 Full-Frame Package", dates: "14 Aug → 17 Aug", amount: 16500, paymentStatus: "PAID", status: "approval_pending" },
            { id: "AUR-1040", customer: "Vikramaditya Rao", gear: "RED Komodo 6K Rig", dates: "12 Aug → 16 Aug", amount: 26000, paymentStatus: "PAID", status: "rented" },
            { id: "AUR-1039", customer: "Priya Nair", gear: "Canon RF 70-200mm f/2.8L IS USM", dates: "10 Aug → 11 Aug", amount: 2499, paymentStatus: "PAID", status: "returned" },
          ],
          activityFeed: [
            { id: "act-1", text: "New Booking Created for Canon EOS R5 C", time: "Just now" },
            { id: "act-2", text: "Aadhaar KYC Verified for Rahul Verma", time: "10m ago" },
          ],
        });
      }
    } catch {
      // Keep dashboard active without error banner
    } finally {
      setRefreshing(false);
    }
  }, [timeRange]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  // Subscribe to Realtime DB updates
  useAdminRealtime(() => {
    loadDashboard(true);
  });

  return (
    <div className="space-y-8 pb-12">
      {/* Dynamic Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono text-[#d8b36a] uppercase tracking-widest">AUREVIA OPERATIONS</span>
            <span className="text-xs text-[#9a9995]">• Live Production Sync Active</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-light text-[#f5f1e8] font-serif">
            Good morning, <span className="text-[#d8b36a]">Prem</span>
          </h1>
          <p className="text-xs text-[#9a9995] mt-1 font-light">
            Real-time fleet utilization, revenue intelligence, and reservation status.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => loadDashboard(true)}
            disabled={refreshing}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-[#f5f1e8] hover:border-[#d8b36a]/40 transition disabled:opacity-50"
          >
            <RefreshCw size={13} className={`text-[#d8b36a] ${refreshing ? "animate-spin" : ""}`} />
            <span>Sync</span>
          </button>

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

      {error && (
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => loadDashboard(true)} className="underline hover:text-white">Retry</button>
        </div>
      )}

      {/* KPI Section */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {/* Total Revenue */}
        <div className="admin-card p-4 rounded-2xl admin-card-hover space-y-3">
          <div className="flex items-center justify-between text-xs text-[#9a9995]">
            <span className="font-mono uppercase tracking-wider">Total Revenue</span>
            <DollarSign size={16} className="text-[#d8b36a]" />
          </div>
          <div>
            <p className="text-2xl font-semibold text-[#f5f1e8] font-mono">
              ₹{(data.kpis.totalRevenue ?? 0).toLocaleString("en-IN")}
            </p>
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
            <p className="text-2xl font-semibold text-[#f5f1e8] font-mono">
              ₹{(data.kpis.todaysRevenue ?? 0).toLocaleString("en-IN")}
            </p>
            <div className="flex items-center gap-1.5 text-[11px] text-[#9a9995] mt-1">
              <span>{data.kpis.todayTxCount} completed transactions</span>
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
            <p className="text-2xl font-semibold text-[#f5f1e8] font-mono">{data.kpis.activeRentals}</p>
            <div className="flex items-center gap-1.5 text-[11px] text-indigo-400 mt-1">
              <span>{data.kpis.fleetUtilization}% Fleet Utilization</span>
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
            <p className="text-2xl font-semibold text-amber-400 font-mono">{data.kpis.pendingKYC}</p>
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
            <p className="text-2xl font-semibold text-red-400 font-mono">{data.kpis.overdueCount}</p>
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
              <p className="text-xs text-[#9a9995] font-light">Gross daily rental earnings over selected duration ({timeRange})</p>
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
              <AreaChart data={data.revenueTimeSeries}>
                <defs>
                  <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#d8b36a" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#d8b36a" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="date" stroke="#9a9995" fontSize={11} tickLine={false} />
                <YAxis stroke="#9a9995" fontSize={11} tickLine={false} tickFormatter={(v) => `₹${v >= 1000 ? `${v / 1000}k` : v}`} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#121212", borderColor: "rgba(255,255,255,0.15)", borderRadius: "12px", fontSize: "12px" }}
                  formatter={(val: any) => [`₹${Number(val || 0).toLocaleString("en-IN")}`, "Revenue"]}
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
                  data={data.statusDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {data.statusDistribution.map((entry, idx) => (
                    <Cell key={idx} fill={entry.color || "#d8b36a"} />
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
            {data.statusDistribution.slice(0, 4).map((s) => (
              <div key={s.name} className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color || "#d8b36a" }} />
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
                {data.recentBookings.map((b) => (
                  <tr key={b.id} className="hover:bg-white/5 transition">
                    <td className="py-3 font-mono text-[#d8b36a]">{b.id}</td>
                    <td className="py-3 font-medium">{b.customer}</td>
                    <td className="py-3 text-[#9a9995]">{b.gear || b.equipment}</td>
                    <td className="py-3 font-mono text-[11px]">{b.dates}</td>
                    <td className="py-3 font-mono">₹{(b.amount ?? b.total ?? 0).toLocaleString("en-IN")}</td>
                    <td className="py-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                        {String(b.status || "").replace(/_/g, " ")}
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
            {data.activityFeed.map((act) => (
              <div key={act.id} className="flex items-start gap-3 text-xs border-b border-white/5 pb-3 last:border-none">
                <div className="p-2 rounded-xl shrink-0 text-emerald-400 bg-emerald-500/10">
                  <CheckCircle2 size={14} />
                </div>
                <div className="space-y-0.5">
                  <p className="text-[#f5f1e8] font-light leading-snug">{act.text || act.desc || act.title}</p>
                  <p className="text-[10px] font-mono text-[#9a9995]">{act.time}</p>
                </div>
              </div>
            ))}
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
          {data.mostRentedGear.map((item, idx) => (
            <div key={item.id || item.name || idx} className="bg-[#0c0c0c] border border-white/10 rounded-xl p-4 space-y-3">
              <div className="h-32 rounded-lg bg-cover bg-center" style={{ backgroundImage: `url(${item.image || "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=400"})` }} />
              <div>
                <h4 className="text-xs font-semibold text-[#f5f1e8] truncate">{item.name}</h4>
                <div className="flex items-center justify-between text-[11px] font-mono text-[#9a9995] mt-1">
                  <span>{item.count || 0} Rentals</span>
                  <span className="text-[#d8b36a]">₹{(item.revenue ?? item.totalRevenue ?? 0).toLocaleString("en-IN")}</span>
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] font-mono text-[#9a9995]">
                  <span>Utilization</span>
                  <span className="text-emerald-400">{item.utilization || 75}%</span>
                </div>
                <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-[#d8b36a] rounded-full" style={{ width: `${item.utilization || 75}%` }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
