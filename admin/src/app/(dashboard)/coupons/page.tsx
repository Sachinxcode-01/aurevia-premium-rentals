"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Plus, Tag, ToggleLeft, ToggleRight, Trash2, Loader2, RefreshCw, AlertCircle, CheckCircle2 } from "lucide-react";
import { adminApiClient } from "@/lib/api-client";
import { useAdminRealtime } from "@/lib/realtime";

interface CouponItem {
  id: string;
  code: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  minRentalDays?: number;
  minOrderAmount?: number;
  maxDiscountAmount?: number;
  expiresAt?: string;
  usageLimit?: number;
  usedCount: number;
  revenueGenerated: number;
  active: boolean;
  createdAt?: string;
}

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<CouponItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Form state
  const [newCode, setNewCode] = useState("");
  const [newType, setNewType] = useState<"percentage" | "fixed">("percentage");
  const [newValue, setNewValue] = useState<number>(10);
  const [minOrder, setMinOrder] = useState<number>(5000);
  const [usageLimit, setUsageLimit] = useState<number>(50);

  const fetchCoupons = useCallback(async (showLoading = false) => {
    if (showLoading) setLoading(true);
    try {
      const res: any = await adminApiClient.coupons.list();
      const list = Array.isArray(res) ? res : Array.isArray(res?.data) ? res.data : [];
      setCoupons(list);
    } catch (err: any) {
      console.error("Failed to load coupons:", err);
    } finally {
      if (showLoading) setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCoupons(true);
  }, [fetchCoupons]);

  // Realtime updates
  useAdminRealtime(
    useCallback(
      (event: any) => {
        if (event?.type === "COUPON_UPDATED" || event?.type === "SYNC_REFRESH") {
          fetchCoupons(false);
        }
      },
      [fetchCoupons]
    )
  );

  const showToast = (type: "success" | "error", message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleToggleCoupon = async (coupon: CouponItem) => {
    setActionLoading(coupon.id);
    try {
      const nextActive = !coupon.active;
      await adminApiClient.coupons.toggleStatus(coupon.id, nextActive);
      setCoupons((prev) =>
        prev.map((c) => (c.id === coupon.id ? { ...c, active: nextActive } : c))
      );
      showToast("success", `Coupon ${coupon.code} is now ${nextActive ? "Active" : "Inactive"}`);
    } catch (err: any) {
      showToast("error", err?.message || "Failed to update coupon status");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteCoupon = async (id: string, code: string) => {
    if (!confirm(`Are you sure you want to permanently delete coupon "${code}"?`)) return;
    setActionLoading(id);
    try {
      await adminApiClient.coupons.delete(id);
      setCoupons((prev) => prev.filter((c) => c.id !== id));
      showToast("success", `Coupon ${code} deleted successfully`);
    } catch (err: any) {
      showToast("error", err?.message || "Failed to delete coupon");
    } finally {
      setActionLoading(null);
    }
  };

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = newCode.trim().toUpperCase();
    if (!cleanCode) return;

    setSubmitting(true);
    try {
      const res: any = await adminApiClient.coupons.create({
        code: cleanCode,
        discountType: newType,
        discountValue: Number(newValue),
        minOrderAmount: Number(minOrder) || 0,
        usageLimit: Number(usageLimit) || 50,
      });

      const created: CouponItem = res?.data || res;
      if (created && created.id) {
        setCoupons((prev) => [created, ...prev.filter((c) => c.id !== created.id)]);
      } else {
        await fetchCoupons(false);
      }

      setNewCode("");
      setNewValue(10);
      setMinOrder(5000);
      setUsageLimit(50);
      showToast("success", `Promotional code ${cleanCode} created successfully!`);
    } catch (err: any) {
      showToast("error", err?.message || "Failed to create coupon");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="border-b border-white/5 pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-light text-[#f5f1e8] font-serif flex items-center gap-2">
            <Tag className="w-6 h-6 text-[#d8b36a]" />
            Promotions &amp; Coupon Codes
          </h1>
          <p className="text-xs text-[#9a9995] font-light mt-1">
            Create promotional discount codes, enforce minimum order rules, and track realtime revenue impact.
          </p>
        </div>
        <button
          onClick={() => fetchCoupons(true)}
          disabled={loading}
          className="self-start md:self-auto px-3 py-1.5 rounded-xl border border-white/10 text-xs text-[#9a9995] hover:text-[#f5f1e8] hover:border-white/20 transition flex items-center gap-1.5"
        >
          <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
          <span>Refresh</span>
        </button>
      </div>

      {notification && (
        <div
          className={`p-3 rounded-xl border flex items-center gap-2 text-xs transition animate-fadeIn ${
            notification.type === "success"
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
              : "bg-red-500/10 border-red-500/30 text-red-400"
          }`}
        >
          {notification.type === "success" ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Add Form */}
      <form
        onSubmit={handleCreateCoupon}
        className="admin-card p-5 rounded-2xl border border-white/10 flex flex-col lg:flex-row items-center gap-3 text-xs"
      >
        <div className="w-full lg:w-44">
          <label className="block text-[10px] text-[#9a9995] uppercase font-mono mb-1">Coupon Code</label>
          <input
            required
            value={newCode}
            onChange={(e) => setNewCode(e.target.value)}
            placeholder="PROMO15"
            className="bg-[#070707] border border-white/10 rounded-xl px-3 py-2 text-[#f5f1e8] uppercase font-mono w-full focus:border-[#d8b36a] outline-none"
          />
        </div>

        <div className="w-full lg:w-36">
          <label className="block text-[10px] text-[#9a9995] uppercase font-mono mb-1">Type</label>
          <select
            value={newType}
            onChange={(e) => setNewType(e.target.value as any)}
            className="bg-[#070707] border border-white/10 rounded-xl px-3 py-2 text-[#f5f1e8] font-mono w-full outline-none"
          >
            <option value="percentage">Percentage (%)</option>
            <option value="fixed">Flat Amount (₹)</option>
          </select>
        </div>

        <div className="w-full lg:w-28">
          <label className="block text-[10px] text-[#9a9995] uppercase font-mono mb-1">
            {newType === "percentage" ? "Percent (%)" : "Amount (₹)"}
          </label>
          <input
            type="number"
            min={1}
            max={newType === "percentage" ? 100 : 100000}
            value={newValue}
            onChange={(e) => setNewValue(Number(e.target.value))}
            className="bg-[#070707] border border-white/10 rounded-xl px-3 py-2 text-[#f5f1e8] font-mono w-full focus:border-[#d8b36a] outline-none"
          />
        </div>

        <div className="w-full lg:w-32">
          <label className="block text-[10px] text-[#9a9995] uppercase font-mono mb-1">Min Order (₹)</label>
          <input
            type="number"
            min={0}
            step={500}
            value={minOrder}
            onChange={(e) => setMinOrder(Number(e.target.value))}
            className="bg-[#070707] border border-white/10 rounded-xl px-3 py-2 text-[#f5f1e8] font-mono w-full focus:border-[#d8b36a] outline-none"
          />
        </div>

        <div className="w-full lg:w-28">
          <label className="block text-[10px] text-[#9a9995] uppercase font-mono mb-1">Usage Limit</label>
          <input
            type="number"
            min={1}
            value={usageLimit}
            onChange={(e) => setUsageLimit(Number(e.target.value))}
            className="bg-[#070707] border border-white/10 rounded-xl px-3 py-2 text-[#f5f1e8] font-mono w-full focus:border-[#d8b36a] outline-none"
          />
        </div>

        <div className="w-full lg:w-auto pt-4 lg:pt-4">
          <button
            type="submit"
            disabled={submitting}
            className="w-full lg:w-auto px-5 py-2.5 bg-[#d8b36a] text-[#070707] font-semibold rounded-xl hover:bg-[#b98a43] transition flex items-center justify-center gap-1.5 disabled:opacity-50"
          >
            {submitting ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
            <span>Create Coupon</span>
          </button>
        </div>
      </form>

      {/* Coupons Table */}
      <div className="admin-card rounded-2xl overflow-hidden border border-white/10">
        {loading ? (
          <div className="p-12 flex flex-col items-center justify-center text-[#9a9995] gap-3">
            <Loader2 className="w-6 h-6 animate-spin text-[#d8b36a]" />
            <p className="text-xs font-light">Loading promotional discount codes...</p>
          </div>
        ) : coupons.length === 0 ? (
          <div className="p-12 text-center text-[#9a9995]">
            <Tag className="w-10 h-10 mx-auto mb-2 opacity-30 text-[#d8b36a]" />
            <p className="text-sm text-[#f5f1e8] font-medium">No coupons active</p>
            <p className="text-xs mt-1">Create your first promotional voucher code using the builder above.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-[#0c0c0c] border-b border-white/10 text-[#9a9995] font-mono text-[10px] uppercase">
                  <th className="p-4">Coupon Code</th>
                  <th className="p-4">Discount</th>
                  <th className="p-4">Min Order</th>
                  <th className="p-4">Uses</th>
                  <th className="p-4">Revenue Influenced</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-[#f5f1e8]">
                {coupons.map((c) => {
                  const isPending = actionLoading === c.id;
                  return (
                    <tr key={c.id || c.code} className="hover:bg-white/5 transition font-mono">
                      <td className="p-4 font-bold text-[#d8b36a]">{c.code}</td>
                      <td className="p-4 font-sans">
                        {c.discountType === "percentage" ? `${c.discountValue}% OFF` : `₹${c.discountValue} OFF`}
                      </td>
                      <td className="p-4 text-[#9a9995]">₹{(c.minOrderAmount || 0).toLocaleString("en-IN")}</td>
                      <td className="p-4 text-[#9a9995]">
                        {c.usedCount} / {c.usageLimit || "∞"}
                      </td>
                      <td className="p-4 font-semibold text-emerald-400">
                        ₹{(c.revenueGenerated || 0).toLocaleString("en-IN")}
                      </td>
                      <td className="p-4 font-sans">
                        <button
                          onClick={() => handleToggleCoupon(c)}
                          disabled={isPending}
                          className={`px-3 py-1 rounded-full text-[10px] font-mono border flex items-center gap-1.5 transition ${
                            c.active
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20"
                              : "bg-white/5 text-[#9a9995] border-white/10 hover:bg-white/10"
                          }`}
                        >
                          {isPending ? (
                            <Loader2 size={10} className="animate-spin" />
                          ) : c.active ? (
                            <ToggleRight size={12} className="text-emerald-400" />
                          ) : (
                            <ToggleLeft size={12} className="text-[#9a9995]" />
                          )}
                          <span>{c.active ? "ACTIVE" : "INACTIVE"}</span>
                        </button>
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => handleDeleteCoupon(c.id, c.code)}
                          disabled={isPending}
                          className="p-1.5 text-[#9a9995] hover:text-red-400 hover:bg-red-500/10 rounded-lg transition"
                          title="Delete Coupon"
                        >
                          <Trash2 size={15} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
