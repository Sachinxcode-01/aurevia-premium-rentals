"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Users,
  Search,
  ShieldCheck,
  Crown,
  Loader2,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  UserCheck,
  UserX,
} from "lucide-react";
import { adminApiClient } from "@/lib/api-client";
import { useAdminRealtime } from "@/lib/realtime";

interface CustomerRecord {
  id: string;
  name: string;
  email: string;
  phone: string;
  joined: string;
  kycStatus: "VERIFIED" | "PENDING" | "REJECTED" | "NOT_SUBMITTED";
  bookingsCount: number;
  totalSpend: number;
  status: "ACTIVE" | "SUSPENDED";
  tier?: "VIP" | "REGULAR" | "NEW";
}

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<CustomerRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [tierFilter, setTierFilter] = useState("all");
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const fetchCustomers = useCallback(async (showLoading = false) => {
    if (showLoading) setLoading(true);
    try {
      const res: any = await adminApiClient.customers.list({
        search: search.trim() || undefined,
        status: statusFilter !== "all" ? statusFilter : undefined,
        tier: tierFilter !== "all" ? tierFilter : undefined,
      });

      const list: CustomerRecord[] =
        res?.customers ||
        res?.data?.customers ||
        (Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : []);
      setCustomers(list);
    } catch (err: any) {
      console.error("Failed to load customers:", err);
    } finally {
      if (showLoading) setLoading(false);
    }
  }, [search, statusFilter, tierFilter]);

  useEffect(() => {
    fetchCustomers(true);
  }, [fetchCustomers]);

  // Realtime hook
  useAdminRealtime(
    useCallback(
      (event: any) => {
        if (
          event?.type === "CUSTOMER_UPDATED" ||
          event?.type === "BOOKING_UPDATED" ||
          event?.type === "KYC_STATUS_UPDATED" ||
          event?.type === "SYNC_REFRESH"
        ) {
          fetchCustomers(false);
        }
      },
      [fetchCustomers]
    )
  );

  const showToast = (type: "success" | "error", message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleToggleStatus = async (customer: CustomerRecord) => {
    const nextStatus = customer.status === "ACTIVE" ? "SUSPENDED" : "ACTIVE";
    if (
      !confirm(
        `Are you sure you want to ${nextStatus === "SUSPENDED" ? "SUSPEND" : "ACTIVATE"} customer ${customer.name}?`
      )
    ) {
      return;
    }

    setActionLoading(customer.id);
    try {
      await adminApiClient.customers.toggleStatus(customer.id, nextStatus.toLowerCase() as any);
      setCustomers((prev) =>
        prev.map((c) => (c.id === customer.id ? { ...c, status: nextStatus } : c))
      );
      showToast("success", `Customer ${customer.name} status updated to ${nextStatus}`);
    } catch (err: any) {
      showToast("error", err?.message || "Failed to update customer status");
    } finally {
      setActionLoading(null);
    }
  };

  // Aggregated KPIs
  const totalSpend = customers.reduce((sum, c) => sum + (c.totalSpend || 0), 0);
  const vipCount = customers.filter((c) => c.tier === "VIP" || c.totalSpend >= 100000).length;
  const verifiedCount = customers.filter((c) => c.kycStatus === "VERIFIED").length;

  return (
    <div className="space-y-6 pb-12">
      <div className="border-b border-white/5 pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-light text-[#f5f1e8] font-serif flex items-center gap-2">
            <Users className="w-6 h-6 text-[#d8b36a]" />
            Customer Directory &amp; History
          </h1>
          <p className="text-xs text-[#9a9995] font-light mt-1">
            Manage registered filmmakers, verified studio accounts, and cumulative rental spend history.
          </p>
        </div>
        <button
          onClick={() => fetchCustomers(true)}
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
          <p className="text-[10px] text-[#9a9995] uppercase font-mono tracking-wider">Total Clients</p>
          <p className="text-2xl font-light text-[#f5f1e8] mt-1 font-serif">{customers.length}</p>
        </div>
        <div className="admin-card p-4 rounded-2xl border border-white/10">
          <p className="text-[10px] text-[#9a9995] uppercase font-mono tracking-wider flex items-center gap-1">
            <Crown size={12} className="text-[#d8b36a]" /> VIP Accounts
          </p>
          <p className="text-2xl font-light text-[#d8b36a] mt-1 font-serif">{vipCount}</p>
        </div>
        <div className="admin-card p-4 rounded-2xl border border-white/10">
          <p className="text-[10px] text-[#9a9995] uppercase font-mono tracking-wider flex items-center gap-1">
            <ShieldCheck size={12} className="text-emerald-400" /> KYC Verified
          </p>
          <p className="text-2xl font-light text-emerald-400 mt-1 font-serif">{verifiedCount}</p>
        </div>
        <div className="admin-card p-4 rounded-2xl border border-white/10">
          <p className="text-[10px] text-[#9a9995] uppercase font-mono tracking-wider">Total Spend</p>
          <p className="text-2xl font-light text-[#f5f1e8] mt-1 font-serif">
            ₹{totalSpend.toLocaleString("en-IN")}
          </p>
        </div>
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

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9a9995]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search customer name, email, phone..."
            className="w-full bg-[#121212] border border-white/10 rounded-xl pl-10 pr-4 py-2 text-xs text-[#f5f1e8] placeholder-[#9a9995]/50 focus:outline-none focus:border-[#d8b36a]"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-[#121212] border border-white/10 rounded-xl px-3 py-2 text-xs text-[#f5f1e8] font-mono outline-none w-full sm:w-36"
        >
          <option value="all">All Status</option>
          <option value="ACTIVE">Active</option>
          <option value="SUSPENDED">Suspended</option>
        </select>
        <select
          value={tierFilter}
          onChange={(e) => setTierFilter(e.target.value)}
          className="bg-[#121212] border border-white/10 rounded-xl px-3 py-2 text-xs text-[#f5f1e8] font-mono outline-none w-full sm:w-36"
        >
          <option value="all">All Tiers</option>
          <option value="VIP">VIP Tier</option>
          <option value="REGULAR">Regular</option>
        </select>
      </div>

      {/* Customers Table */}
      <div className="admin-card rounded-2xl overflow-hidden border border-white/10">
        {loading ? (
          <div className="p-12 flex flex-col items-center justify-center text-[#9a9995] gap-3">
            <Loader2 className="w-6 h-6 animate-spin text-[#d8b36a]" />
            <p className="text-xs font-light">Loading customer directory &amp; rental history...</p>
          </div>
        ) : customers.length === 0 ? (
          <div className="p-12 text-center text-[#9a9995]">
            <Users className="w-10 h-10 mx-auto mb-2 opacity-30 text-[#d8b36a]" />
            <p className="text-sm text-[#f5f1e8] font-medium">No customers found</p>
            <p className="text-xs mt-1">Try adjusting your search criteria or filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-[#0c0c0c] border-b border-white/10 text-[#9a9995] font-mono text-[10px] uppercase">
                  <th className="p-4">Customer ID</th>
                  <th className="p-4">Name &amp; Contact</th>
                  <th className="p-4">Tier</th>
                  <th className="p-4">KYC Status</th>
                  <th className="p-4">Rentals</th>
                  <th className="p-4">Lifetime Spend</th>
                  <th className="p-4">Account Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-[#f5f1e8]">
                {customers.map((c) => {
                  const isPending = actionLoading === c.id;
                  const isVip = c.tier === "VIP" || (c.totalSpend || 0) >= 100000;
                  return (
                    <tr key={c.id} className="hover:bg-white/5 transition">
                      <td className="p-4 font-mono text-[#d8b36a]">{c.id}</td>
                      <td className="p-4">
                        <p className="font-medium text-[#f5f1e8]">{c.name}</p>
                        <p className="text-[10px] text-[#9a9995] font-mono mt-0.5">
                          {c.email} {c.phone ? `• ${c.phone}` : ""}
                        </p>
                      </td>
                      <td className="p-4">
                        {isVip ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono border bg-[#d8b36a]/15 text-[#d8b36a] border-[#d8b36a]/30 flex items-center gap-1 w-max">
                            <Crown size={10} /> VIP
                          </span>
                        ) : (
                          <span className="text-[10px] text-[#9a9995] font-mono">Standard</span>
                        )}
                      </td>
                      <td className="p-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-mono border ${
                            c.kycStatus === "VERIFIED"
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                              : c.kycStatus === "REJECTED"
                              ? "bg-red-500/10 text-red-400 border-red-500/30"
                              : "bg-amber-500/10 text-amber-400 border-amber-500/30"
                          }`}
                        >
                          {c.kycStatus}
                        </span>
                      </td>
                      <td className="p-4 font-mono">{c.bookingsCount || 0} Rentals</td>
                      <td className="p-4 font-mono font-semibold text-[#f5f1e8]">
                        ₹{(c.totalSpend || 0).toLocaleString("en-IN")}
                      </td>
                      <td className="p-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-mono border ${
                            c.status === "ACTIVE"
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                              : "bg-red-500/10 text-red-400 border-red-500/30"
                          }`}
                        >
                          {c.status}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => handleToggleStatus(c)}
                          disabled={isPending}
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-mono border transition inline-flex items-center gap-1 ${
                            c.status === "ACTIVE"
                              ? "text-red-400 border-red-500/20 hover:bg-red-500/10"
                              : "text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/10"
                          }`}
                        >
                          {isPending ? (
                            <Loader2 size={11} className="animate-spin" />
                          ) : c.status === "ACTIVE" ? (
                            <>
                              <UserX size={11} /> Suspend
                            </>
                          ) : (
                            <>
                              <UserCheck size={11} /> Activate
                            </>
                          )}
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
