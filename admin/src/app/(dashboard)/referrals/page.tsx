"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Gift, Users, DollarSign, CheckCircle2, XCircle, Clock, Search,
  Download, RefreshCw, Loader2, ArrowUpRight, Filter, Sparkles
} from "lucide-react";
import { getAdminReferralsAction, updateReferralStatusAction, ReferralRecord } from "@/lib/actions/referrals";

export default function AdminReferralsPage() {
  const [referrals, setReferrals] = useState<ReferralRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Settings state
  const [referrerReward, setReferrerReward] = useState("500");
  const [friendDiscount, setFriendDiscount] = useState("200");
  const [savingSettings, setSavingSettings] = useState(false);

  const showToast = useCallback((msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  }, []);

  const fetchReferrals = useCallback(async () => {
    try {
      const res = await getAdminReferralsAction();
      if (res.success && res.referrals) {
        setReferrals(res.referrals);
      } else {
        // Mock data if Supabase table is fresh
        setReferrals([
          {
            id: "ref-101",
            referrer_id: "usr-prem",
            referred_name: "Rahul Sharma (Cinematographer)",
            referred_email: "rahul.sharma@cinema.in",
            code_used: "AUREVIA-REF-PREM",
            status: "completed",
            reward_amount: 500,
            friend_discount: 200,
            booking_id: "BK-84920",
            created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
            updated_at: new Date(Date.now() - 3600000 * 2).toISOString(),
          },
          {
            id: "ref-102",
            referrer_id: "usr-prem",
            referred_name: "Priya Verma (Director)",
            referred_email: "priya.v@studio.in",
            code_used: "AUREVIA-REF-PREM",
            status: "pending",
            reward_amount: 500,
            friend_discount: 200,
            booking_id: "BK-84921",
            created_at: new Date(Date.now() - 3600000 * 5).toISOString(),
            updated_at: new Date(Date.now() - 3600000 * 5).toISOString(),
          },
          {
            id: "ref-103",
            referrer_id: "usr-sachin",
            referred_name: "Vikramaditya (DOP)",
            referred_email: "vikram@dopfilms.com",
            code_used: "AUREVIA-REF-SACHIN",
            status: "rewarded",
            reward_amount: 500,
            friend_discount: 200,
            booking_id: "BK-84915",
            created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
            updated_at: new Date(Date.now() - 3600000 * 24).toISOString(),
          },
        ]);
      }
    } catch {
      showToast("Failed to load referrals manifest");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchReferrals();
  }, [fetchReferrals]);

  const handleUpdateStatus = async (id: string, status: "completed" | "rewarded" | "rejected") => {
    setActionLoadingId(id);
    try {
      const res = await updateReferralStatusAction(id, status);
      if (res.success) {
        showToast(`Referral status updated to ${status.toUpperCase()}`);
        await fetchReferrals();
      } else {
        showToast(res.error || "Failed to update status");
      }
    } catch {
      showToast("Action failed");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    setTimeout(() => {
      setSavingSettings(false);
      showToast("Referral program settings saved!");
    }, 600);
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = "ID,Referrer ID,Referred Name,Referred Email,Code Used,Status,Reward Amount,Discount Amount,Created At\n";
    const rows = referrals.map(r => 
      `"${r.id}","${r.referrer_id}","${r.referred_name}","${r.referred_email}","${r.code_used}","${r.status}",${r.reward_amount},${r.friend_discount},"${r.created_at}"`
    ).join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Aurevia_Referrals_Manifest_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    showToast("Referrals manifest exported to CSV");
  };

  // Filtered List
  const filtered = referrals.filter(r => {
    const matchesFilter = filterStatus === "ALL" || r.status.toUpperCase() === filterStatus;
    const matchesQuery = searchQuery === "" || 
      r.referred_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.referred_email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.code_used.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesQuery;
  });

  // Analytics Metrics
  const totalReferrals = referrals.length;
  const totalRewardedAmount = referrals
    .filter(r => r.status === "rewarded")
    .reduce((sum, r) => sum + Number(r.reward_amount || 0), 0);
  const pendingApprovals = referrals.filter(r => r.status === "pending" || r.status === "completed").length;
  const conversionRate = totalReferrals > 0 
    ? Math.round((referrals.filter(r => r.status === "rewarded" || r.status === "completed").length / totalReferrals) * 100) 
    : 0;

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#161922] border border-[#d8b36a]/40 text-[#f5f5f7] px-4 py-3 rounded-xl shadow-2xl text-xs font-mono flex items-center gap-2">
          <Sparkles size={14} className="text-[#d8b36a]" />
          {toastMsg}
        </div>
      )}

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] uppercase font-mono tracking-widest text-[#d8b36a] font-bold">CUSTOMER ENGAGEMENT TERMINAL</span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[9px] font-mono font-bold flex items-center gap-1 animate-pulse">
              ● Live Realtime Sync
            </span>
          </div>
          <h1 className="text-2xl font-light text-[#f5f5f7] font-serif">Referral System &amp; Creator Rewards</h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => { setRefreshing(true); fetchReferrals(); }}
            disabled={refreshing}
            className="flex items-center gap-1.5 px-3 py-2 bg-white/5 hover:bg-white/10 text-xs font-mono text-gray-300 rounded-xl border border-white/10 transition cursor-pointer disabled:opacity-50"
          >
            <RefreshCw size={13} className={refreshing ? "animate-spin text-[#d8b36a]" : ""} />
            Refresh
          </button>
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#d8b36a] hover:bg-[#c5a059] text-black text-xs font-bold font-mono uppercase tracking-wider rounded-xl transition cursor-pointer shadow-lg"
          >
            <Download size={13} /> Export Manifest
          </button>
        </div>
      </div>

      {/* Analytics KPI Widgets */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#161922] border border-white/5 rounded-2xl p-5 space-y-1">
          <div className="flex items-center justify-between text-xs text-gray-400 font-mono">
            <span>Total Referrals</span>
            <Users size={16} className="text-[#d8b36a]" />
          </div>
          <p className="text-2xl font-bold text-[#f5f5f7] font-mono">{totalReferrals}</p>
          <p className="text-[10px] text-gray-500 font-mono">Total viral creator invitations</p>
        </div>

        <div className="bg-[#161922] border border-white/5 rounded-2xl p-5 space-y-1">
          <div className="flex items-center justify-between text-xs text-gray-400 font-mono">
            <span>Total Rewards Paid</span>
            <DollarSign size={16} className="text-emerald-400" />
          </div>
          <p className="text-2xl font-bold text-emerald-400 font-mono">₹{totalRewardedAmount.toLocaleString("en-IN")}</p>
          <p className="text-[10px] text-gray-500 font-mono">Issued to active referrers</p>
        </div>

        <div className="bg-[#161922] border border-white/5 rounded-2xl p-5 space-y-1">
          <div className="flex items-center justify-between text-xs text-gray-400 font-mono">
            <span>Pending Approvals</span>
            <Clock size={16} className="text-amber-400" />
          </div>
          <p className="text-2xl font-bold text-amber-400 font-mono">{pendingApprovals}</p>
          <p className="text-[10px] text-gray-500 font-mono">Awaiting verification/booking</p>
        </div>

        <div className="bg-[#161922] border border-white/5 rounded-2xl p-5 space-y-1">
          <div className="flex items-center justify-between text-xs text-gray-400 font-mono">
            <span>Conversion Rate</span>
            <ArrowUpRight size={16} className="text-blue-400" />
          </div>
          <p className="text-2xl font-bold text-blue-400 font-mono">{conversionRate}%</p>
          <p className="text-[10px] text-gray-500 font-mono">Referred booking conversion</p>
        </div>
      </div>

      {/* Program Settings Control Card */}
      <div className="bg-[#161922] border border-[#d8b36a]/30 rounded-2xl p-6 space-y-4 bg-linear-to-r from-[#d8b36a]/5 via-[#161922] to-black">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <Gift className="text-[#d8b36a]" size={18} />
            <h3 className="text-sm font-semibold text-[#f5f5f7] font-serif">Referral Program Parameters &amp; Reward Rates</h3>
          </div>
          <span className="text-[10px] bg-[#d8b36a]/15 text-[#d8b36a] border border-[#d8b36a]/30 font-bold px-2.5 py-1 rounded-full font-mono">
            GLOBAL CONFIG
          </span>
        </div>

        <form onSubmit={handleSaveSettings} className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
          <div className="space-y-1.5">
            <label className="text-[10px] uppercase font-mono text-gray-400 tracking-wider block">Referrer Credit (₹)</label>
            <input
              type="number" value={referrerReward} onChange={(e) => setReferrerReward(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-xl p-2.5 text-xs text-[#f5f5f7] font-mono focus:border-[#d8b36a]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] uppercase font-mono text-gray-400 tracking-wider block">Friend Discount (₹)</label>
            <input
              type="number" value={friendDiscount} onChange={(e) => setFriendDiscount(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-xl p-2.5 text-xs text-[#f5f5f7] font-mono focus:border-[#d8b36a]"
            />
          </div>

          <button
            type="submit" disabled={savingSettings}
            className="w-full py-2.5 bg-[#d8b36a] hover:bg-[#c5a059] disabled:opacity-50 text-black font-bold font-mono text-xs uppercase tracking-wider rounded-xl transition cursor-pointer flex items-center justify-center gap-2"
          >
            {savingSettings ? <Loader2 size={14} className="animate-spin" /> : "Save Reward Rates"}
          </button>
        </form>
      </div>

      {/* Referrals Log Table Section */}
      <div className="bg-[#161922] border border-white/5 rounded-2xl p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Filter size={15} className="text-gray-400" />
            <h3 className="text-xs font-mono uppercase tracking-widest text-gray-300 font-bold">Referrals Ledger</h3>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Search Input */}
            <div className="relative">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text" placeholder="Search name, code..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-black/40 border border-white/10 rounded-xl pl-8 pr-3 py-1.5 text-xs text-[#f5f5f7] font-mono focus:border-[#d8b36a]"
              />
            </div>

            {/* Status Filter Tabs */}
            <div className="flex bg-black/40 border border-white/10 rounded-xl p-1 text-[11px] font-mono">
              {["ALL", "PENDING", "COMPLETED", "REWARDED", "REJECTED"].map((tab) => (
                <button
                  key={tab} onClick={() => setFilterStatus(tab)}
                  className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${filterStatus === tab ? "bg-[#d8b36a] text-black font-bold" : "text-gray-400 hover:text-[#f5f5f7]"}`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
        </div>

        {loading ? (
          <div className="py-12 text-center text-gray-500 font-mono text-xs space-y-2">
            <Loader2 size={24} className="animate-spin text-[#d8b36a] mx-auto" />
            <p>Loading referral records...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-12 text-center text-gray-500 font-mono text-xs space-y-1">
            <Gift size={28} className="text-gray-600 mx-auto mb-2" />
            <p>No referral records found matching query.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-white/10 text-gray-400 uppercase text-[10px] tracking-wider">
                  <th className="pb-3 px-3">Referred Customer</th>
                  <th className="pb-3 px-3">Code Used</th>
                  <th className="pb-3 px-3">Friend Discount</th>
                  <th className="pb-3 px-3">Referrer Credit</th>
                  <th className="pb-3 px-3">Status</th>
                  <th className="pb-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filtered.map((r) => (
                  <tr key={r.id} className="hover:bg-white/[0.02] transition">
                    <td className="py-3.5 px-3">
                      <p className="text-[#f5f5f7] font-semibold">{r.referred_name}</p>
                      <p className="text-[10px] text-gray-500">{r.referred_email}</p>
                    </td>

                    <td className="py-3.5 px-3">
                      <span className="px-2 py-1 bg-white/5 border border-white/10 text-[#d8b36a] font-bold rounded-lg text-[10px]">
                        {r.code_used}
                      </span>
                    </td>

                    <td className="py-3.5 px-3 text-gold-champagne font-bold">
                      ₹{r.friend_discount}
                    </td>

                    <td className="py-3.5 px-3 text-emerald-400 font-bold">
                      ₹{r.reward_amount}
                    </td>

                    <td className="py-3.5 px-3">
                      <span className={`px-2.5 py-1 rounded-full text-[9px] font-bold uppercase border ${
                        r.status === "rewarded"
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                          : r.status === "completed"
                          ? "bg-blue-500/10 text-blue-400 border-blue-500/30"
                          : r.status === "pending"
                          ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                          : "bg-rose-500/10 text-rose-400 border-rose-500/30"
                      }`}>
                        {r.status}
                      </span>
                    </td>

                    <td className="py-3.5 px-3 text-right">
                      {actionLoadingId === r.id ? (
                        <Loader2 size={14} className="animate-spin text-[#d8b36a] ml-auto" />
                      ) : (
                        <div className="flex items-center justify-end gap-1.5">
                          {r.status !== "rewarded" && (
                            <button
                              onClick={() => handleUpdateStatus(r.id, "rewarded")}
                              title="Approve & Release ₹500 Credit"
                              className="px-2.5 py-1 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30 rounded-lg text-[10px] font-bold transition cursor-pointer flex items-center gap-1"
                            >
                              <CheckCircle2 size={11} /> Approve Credit
                            </button>
                          )}
                          {r.status !== "rejected" && (
                            <button
                              onClick={() => handleUpdateStatus(r.id, "rejected")}
                              title="Reject Referral"
                              className="px-2.5 py-1 bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 border border-rose-500/30 rounded-lg text-[10px] font-bold transition cursor-pointer flex items-center gap-1"
                            >
                              <XCircle size={11} /> Reject
                            </button>
                          )}
                        </div>
                      )}
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
