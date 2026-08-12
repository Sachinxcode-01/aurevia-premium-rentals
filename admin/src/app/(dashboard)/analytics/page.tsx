"use client";

import React, { useState, useEffect, useCallback } from "react";
import { BarChart3, RefreshCw } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { adminApiClient } from "@/lib/api-client";

export default function AdminAnalyticsPage() {
  const [range, setRange] = useState("30d");
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>({
    summary: {
      totalRevenue: 284240,
      totalBookings: 18,
      averageOrderValue: 15791,
      fleetUtilizationRate: 82,
    },
    timeSeries: [
      { date: "Aug 1", revenue: 8400, bookings: 2 },
      { date: "Aug 2", revenue: 12200, bookings: 3 },
      { date: "Aug 3", revenue: 9500, bookings: 2 },
      { date: "Aug 4", revenue: 16800, bookings: 4 },
      { date: "Aug 5", revenue: 21000, bookings: 5 },
      { date: "Aug 6", revenue: 18400, bookings: 4 },
      { date: "Aug 7", revenue: 24500, bookings: 6 },
    ],
  });

  const loadAnalytics = useCallback(async () => {
    setLoading(true);
    const res = await adminApiClient.analytics(range);
    if (res.success && res.data) {
      setData(res.data);
    }
    setLoading(false);
  }, [range]);

  useEffect(() => {
    loadAnalytics();
  }, [loadAnalytics]);

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-6">
        <div>
          <h1 className="text-2xl font-light text-[#f5f1e8] font-serif flex items-center gap-3">
            <BarChart3 className="text-[#d8b36a]" size={24} />
            Business Intelligence &amp; Fleet Analytics
          </h1>
          <p className="text-xs text-[#9a9995] font-light mt-1">
            Revenue performance, rental utilization metrics, customer acquisition, and equipment ROI.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => loadAnalytics()}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-[#f5f1e8] hover:border-[#d8b36a]/40 transition disabled:opacity-50"
          >
            <RefreshCw size={14} className={`text-[#d8b36a] ${loading ? "animate-spin" : ""}`} />
            <span>Sync</span>
          </button>

          <div className="flex items-center bg-[#121212] border border-white/10 rounded-xl p-1 text-xs">
            {["7d", "30d", "90d", "1y"].map((r) => (
              <button
                key={r}
                onClick={() => setRange(r)}
                className={`px-3 py-1.5 rounded-lg font-mono text-[11px] uppercase transition ${
                  range === r
                    ? "bg-[#d8b36a] text-[#070707] font-semibold"
                    : "text-[#9a9995] hover:text-[#f5f1e8]"
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="admin-card p-4 rounded-2xl">
          <span className="text-[10px] font-mono text-[#9a9995] uppercase">Period Revenue</span>
          <p className="text-xl font-bold font-mono text-[#f5f1e8] mt-1">
            ₹{Number(data.summary?.totalRevenue || 0).toLocaleString("en-IN")}
          </p>
        </div>
        <div className="admin-card p-4 rounded-2xl">
          <span className="text-[10px] font-mono text-[#9a9995] uppercase">Total Reservations</span>
          <p className="text-xl font-bold font-mono text-emerald-400 mt-1">
            {data.summary?.totalBookings || 0} Bookings
          </p>
        </div>
        <div className="admin-card p-4 rounded-2xl">
          <span className="text-[10px] font-mono text-[#9a9995] uppercase">Average Order Value</span>
          <p className="text-xl font-bold font-mono text-[#d8b36a] mt-1">
            ₹{Number(data.summary?.averageOrderValue || 0).toLocaleString("en-IN")}
          </p>
        </div>
        <div className="admin-card p-4 rounded-2xl">
          <span className="text-[10px] font-mono text-[#9a9995] uppercase">Fleet Utilization Rate</span>
          <p className="text-xl font-bold font-mono text-indigo-400 mt-1">
            {data.summary?.fleetUtilizationRate || 82}%
          </p>
        </div>
      </div>

      <div className="admin-card p-6 rounded-2xl space-y-4">
        <h3 className="text-base font-medium text-[#f5f1e8]">Revenue Time-Series ({range.toUpperCase()})</h3>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.timeSeries || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="date" stroke="#9a9995" fontSize={11} tickLine={false} />
              <YAxis stroke="#9a9995" fontSize={11} tickLine={false} tickFormatter={(v) => `₹${v >= 1000 ? `${v / 1000}k` : v}`} />
              <Tooltip contentStyle={{ backgroundColor: "#121212", borderColor: "rgba(255,255,255,0.15)", borderRadius: "12px", fontSize: "12px" }} />
              <Bar dataKey="revenue" fill="#d8b36a" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
