"use client";

import React, { useState } from "react";
import { Ticket, Plus, Tag, ToggleLeft, ToggleRight, Trash2 } from "lucide-react";

interface CouponItem {
  code: string;
  type: "flat" | "percentage";
  value: number;
  minBooking: number;
  usageLimit: number;
  usedCount: number;
  revenueGenerated: number;
  active: boolean;
}

const MOCK_COUPONS: CouponItem[] = [
  { code: "AUREVIA10", type: "percentage", value: 10, minBooking: 10000, usageLimit: 100, usedCount: 34, revenueGenerated: 340000, active: true },
  { code: "CINEMA500", type: "flat", value: 500, minBooking: 5000, usageLimit: 50, usedCount: 18, revenueGenerated: 90000, active: true },
  { code: "FREELANCE15", type: "percentage", value: 15, minBooking: 15000, usageLimit: 20, usedCount: 12, revenueGenerated: 180000, active: false },
];

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<CouponItem[]>(MOCK_COUPONS);
  const [newCode, setNewCode] = useState("");
  const [newValue, setNewValue] = useState(10);
  const [newType, setNewType] = useState<"flat" | "percentage">("percentage");

  const toggleCoupon = (code: string) => {
    setCoupons((prev) => prev.map((c) => (c.code === code ? { ...c, active: !c.active } : c)));
  };

  const addCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCode) return;
    setCoupons([
      { code: newCode.toUpperCase(), type: newType, value: Number(newValue), minBooking: 5000, usageLimit: 50, usedCount: 0, revenueGenerated: 0, active: true },
      ...coupons,
    ]);
    setNewCode("");
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="border-b border-white/5 pb-6">
        <h1 className="text-2xl font-light text-[#f5f1e8] font-serif">Promotions &amp; Coupon Codes</h1>
        <p className="text-xs text-[#9a9995] font-light mt-1">
          Create promotional discount codes, enforce minimum order rules, and track revenue impact.
        </p>
      </div>

      {/* Add Form */}
      <form onSubmit={addCoupon} className="admin-card p-4 rounded-2xl border border-white/10 flex flex-col md:flex-row items-center gap-3 text-xs">
        <input
          required
          value={newCode}
          onChange={(e) => setNewCode(e.target.value)}
          placeholder="PROMO CODE (e.g. PRO10)"
          className="bg-[#070707] border border-white/10 rounded-xl px-3 py-2 text-[#f5f1e8] uppercase font-mono w-full md:w-48 focus:border-[#d8b36a] outline-none"
        />
        <select
          value={newType}
          onChange={(e) => setNewType(e.target.value as any)}
          className="bg-[#070707] border border-white/10 rounded-xl px-3 py-2 text-[#f5f1e8] font-mono w-full md:w-36 outline-none"
        >
          <option value="percentage">Percentage (%)</option>
          <option value="flat">Flat Amount (₹)</option>
        </select>
        <input
          type="number"
          value={newValue}
          onChange={(e) => setNewValue(Number(e.target.value))}
          placeholder="Value"
          className="bg-[#070707] border border-white/10 rounded-xl px-3 py-2 text-[#f5f1e8] font-mono w-full md:w-32 focus:border-[#d8b36a] outline-none"
        />
        <button
          type="submit"
          className="w-full md:w-auto px-4 py-2 bg-[#d8b36a] text-[#070707] font-semibold rounded-xl hover:bg-[#b98a43] transition flex items-center justify-center gap-1.5"
        >
          <Plus size={16} />
          <span>Create Coupon</span>
        </button>
      </form>

      {/* Coupons Table */}
      <div className="admin-card rounded-2xl overflow-hidden border border-white/10">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="bg-[#0c0c0c] border-b border-white/10 text-[#9a9995] font-mono text-[10px] uppercase">
              <th className="p-4">Coupon Code</th>
              <th className="p-4">Discount</th>
              <th className="p-4">Min Order</th>
              <th className="p-4">Uses</th>
              <th className="p-4">Revenue Influenced</th>
              <th className="p-4 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 text-[#f5f1e8]">
            {coupons.map((c) => (
              <tr key={c.code} className="hover:bg-white/5 transition font-mono">
                <td className="p-4 font-bold text-[#d8b36a]">{c.code}</td>
                <td className="p-4 font-sans">{c.type === "percentage" ? `${c.value}% OFF` : `₹${c.value} OFF`}</td>
                <td className="p-4 text-[#9a9995]">₹{c.minBooking.toLocaleString("en-IN")}</td>
                <td className="p-4 text-[#9a9995]">{c.usedCount} / {c.usageLimit}</td>
                <td className="p-4 font-semibold text-emerald-400">₹{c.revenueGenerated.toLocaleString("en-IN")}</td>
                <td className="p-4 text-right font-sans">
                  <button
                    onClick={() => toggleCoupon(c.code)}
                    className={`px-3 py-1 rounded-full text-[10px] font-mono border ${c.active ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30" : "bg-white/5 text-[#9a9995] border-white/10"}`}
                  >
                    {c.active ? "ACTIVE" : "INACTIVE"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
