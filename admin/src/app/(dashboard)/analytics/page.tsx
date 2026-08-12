"use client";

import React from "react";
import { BarChart3, TrendingUp, DollarSign, Camera, Users, Calendar } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

const MONTHLY_REVENUE = [
  { month: "Jan", revenue: 140000 },
  { month: "Feb", revenue: 185000 },
  { month: "Mar", revenue: 210000 },
  { month: "Apr", revenue: 195000 },
  { month: "May", revenue: 240000 },
  { month: "Jun", revenue: 260000 },
  { month: "Jul", revenue: 284000 },
];

export default function AdminAnalyticsPage() {
  return (
    <div className="space-y-6 pb-12">
      <div className="border-b border-white/5 pb-6">
        <h1 className="text-2xl font-light text-[#f5f1e8] font-serif flex items-center gap-3">
          <BarChart3 className="text-[#d8b36a]" size={24} />
          Business Intelligence &amp; Fleet Analytics
        </h1>
        <p className="text-xs text-[#9a9995] font-light mt-1">
          Revenue performance, rental utilization metrics, customer acquisition, and equipment ROI.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="admin-card p-4 rounded-2xl">
          <span className="text-[10px] font-mono text-[#9a9995] uppercase">Gross Revenue</span>
          <p className="text-xl font-bold font-mono text-[#f5f1e8] mt-1">₹15,14,000</p>
        </div>
        <div className="admin-card p-4 rounded-2xl">
          <span className="text-[10px] font-mono text-[#9a9995] uppercase">Net Revenue</span>
          <p className="text-xl font-bold font-mono text-emerald-400 mt-1">₹14,28,500</p>
        </div>
        <div className="admin-card p-4 rounded-2xl">
          <span className="text-[10px] font-mono text-[#9a9995] uppercase">Average Order Value</span>
          <p className="text-xl font-bold font-mono text-[#d8b36a] mt-1">₹18,450</p>
        </div>
        <div className="admin-card p-4 rounded-2xl">
          <span className="text-[10px] font-mono text-[#9a9995] uppercase">Repeat Customer Rate</span>
          <p className="text-xl font-bold font-mono text-indigo-400 mt-1">42.8%</p>
        </div>
      </div>

      <div className="admin-card p-6 rounded-2xl space-y-4">
        <h3 className="text-base font-medium text-[#f5f1e8]">Monthly Revenue Performance</h3>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={MONTHLY_REVENUE}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="month" stroke="#9a9995" fontSize={11} tickLine={false} />
              <YAxis stroke="#9a9995" fontSize={11} tickLine={false} tickFormatter={(v) => `₹${v / 1000}k`} />
              <Tooltip contentStyle={{ backgroundColor: "#121212", borderColor: "rgba(255,255,255,0.15)", borderRadius: "12px", fontSize: "12px" }} />
              <Bar dataKey="revenue" fill="#d8b36a" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
