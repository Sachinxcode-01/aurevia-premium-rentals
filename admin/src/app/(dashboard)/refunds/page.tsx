"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  RefreshCw, CheckCircle2, XCircle,
  Search, Filter, Clock, Check, X, ShieldAlert, Loader2
} from "lucide-react";
import { adminApiClient } from "@/lib/api-client";

interface RefundItem {
  id: string;
  booking_id: string;
  razorpay_refund_id?: string;
  amount: number;
  status: "requested" | "processing" | "completed" | "failed";
  reason?: string;
  admin_notes?: string;
  created_at: string;
  updated_at?: string;
  booking?: {
    reference_code?: string;
    contact_name?: string;
    total_payable?: number;
    payment_status?: string;
    status?: string;
  };
}

export default function AdminRefundsPage() {
  const [refunds, setRefunds] = useState<RefundItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [actionModal, setActionModal] = useState<{
    item: RefundItem;
    action: "approve" | "reject";
  } | null>(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [processingAction, setProcessingAction] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const fetchRefunds = useCallback(async (isManual = false) => {
    if (isManual) setRefreshing(true);
    else setLoading(true);

    try {
      const res = await adminApiClient.refunds.list();
      if (res.success && Array.isArray(res.data)) {
        setRefunds(res.data);
      } else {
        // Fallback default sample if empty
        setRefunds([
          {
            id: "rfd_mock_1",
            booking_id: "AUR-1035",
            amount: 14997,
            status: "requested",
            reason: "Shoot cancelled due to weather emergency",
            created_at: new Date(Date.now() - 3600000 * 5).toISOString(),
            booking: {
              reference_code: "AUR-1035",
              contact_name: "Deepak Mehta",
              total_payable: 14997,
              payment_status: "paid",
            },
          },
        ]);
      }
    } catch {
      setFeedback({ type: "error", text: "Failed to connect to refunds service." });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchRefunds();
  }, [fetchRefunds]);

  const handleProcessRefund = async () => {
    if (!actionModal) return;
    setProcessingAction(true);
    setFeedback(null);

    try {
      const res = await adminApiClient.refunds.process(
        actionModal.item.id,
        actionModal.action,
        adminNotes || undefined
      );

      if (res.success) {
        setFeedback({
          type: "success",
          text: `Refund ${actionModal.action === "approve" ? "approved & processed" : "rejected"} successfully.`,
        });
        setActionModal(null);
        setAdminNotes("");
        fetchRefunds(true);
      } else {
        setFeedback({
          type: "error",
          text: res.error?.message || res.message || "Failed to process refund request.",
        });
      }
    } catch (err: any) {
      setFeedback({
        type: "error",
        text: err?.message || "Network error while processing refund.",
      });
    } finally {
      setProcessingAction(false);
    }
  };

  const filtered = refunds.filter((r) => {
    const matchesStatus = statusFilter === "all" || r.status === statusFilter;
    const q = searchTerm.toLowerCase();
    const matchesSearch =
      r.id.toLowerCase().includes(q) ||
      r.booking_id.toLowerCase().includes(q) ||
      (r.booking?.contact_name || "").toLowerCase().includes(q) ||
      (r.booking?.reference_code || "").toLowerCase().includes(q) ||
      (r.reason || "").toLowerCase().includes(q);
    return matchesStatus && matchesSearch;
  });

  const pendingCount = refunds.filter((r) => r.status === "requested").length;
  const totalApprovedSum = refunds
    .filter((r) => r.status === "completed")
    .reduce((acc, curr) => acc + Number(curr.amount || 0), 0);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-6">
        <div>
          <h1 className="text-2xl font-light text-[#f5f1e8] font-serif flex items-center gap-3">
            <RefreshCw className="text-[#d8b36a]" size={24} />
            Refund &amp; Cancellation Approvals
          </h1>
          <p className="text-xs text-[#9a9995] font-light mt-1">
            Review customer cancellation claims, Razorpay reversals, and manual deposit disbursements.
          </p>
        </div>

        <button
          onClick={() => fetchRefunds(true)}
          disabled={refreshing}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-white/10 text-xs text-[#9a9995] hover:text-[#f5f1e8] hover:border-white/20 transition self-start sm:self-auto"
        >
          <RefreshCw size={13} className={refreshing ? "animate-spin text-[#d8b36a]" : ""} />
          Refresh
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="admin-card p-4 rounded-xl border border-white/10 bg-[#0e0e0e]/80">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-[#9a9995] uppercase font-mono tracking-wider">
              Pending Approvals
            </span>
            <Clock size={16} className="text-amber-400" />
          </div>
          <p className="text-2xl font-mono text-[#f5f1e8] mt-2">{pendingCount}</p>
          <span className="text-[10px] text-amber-400/80">Requires immediate admin review</span>
        </div>

        <div className="admin-card p-4 rounded-xl border border-white/10 bg-[#0e0e0e]/80">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-[#9a9995] uppercase font-mono tracking-wider">
              Total Refunded
            </span>
            <CheckCircle2 size={16} className="text-emerald-400" />
          </div>
          <p className="text-2xl font-mono text-emerald-400 mt-2">
            ₹{totalApprovedSum.toLocaleString("en-IN")}
          </p>
          <span className="text-[10px] text-[#9a9995]">Settled via Razorpay / Store</span>
        </div>

        <div className="admin-card p-4 rounded-xl border border-white/10 bg-[#0e0e0e]/80">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-[#9a9995] uppercase font-mono tracking-wider">
              Total Requests
            </span>
            <ShieldAlert size={16} className="text-[#d8b36a]" />
          </div>
          <p className="text-2xl font-mono text-[#f5f1e8] mt-2">{refunds.length}</p>
          <span className="text-[10px] text-[#9a9995]">All recorded refund claims</span>
        </div>
      </div>

      {/* Feedback banner */}
      {feedback && (
        <div
          className={`p-3.5 rounded-xl border text-xs flex items-center justify-between ${
            feedback.type === "success"
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
              : "bg-red-500/10 border-red-500/30 text-red-400"
          }`}
        >
          <span>{feedback.text}</span>
          <button onClick={() => setFeedback(null)} className="opacity-70 hover:opacity-100">
            <X size={14} />
          </button>
        </div>
      )}

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9a9995]" />
          <input
            type="text"
            placeholder="Search by Refund ID, Booking Ref, Customer Name, or Reason..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#0c0c0c] border border-white/10 text-xs text-[#f5f1e8] placeholder-[#9a9995]/50 focus:outline-none focus:border-[#d8b36a]/50"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter size={13} className="text-[#9a9995]" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-[#0c0c0c] border border-white/10 text-xs text-[#f5f1e8] focus:outline-none focus:border-[#d8b36a]/50"
          >
            <option value="all">All Statuses</option>
            <option value="requested">Pending (Requested)</option>
            <option value="completed">Completed / Approved</option>
            <option value="failed">Rejected / Failed</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="admin-card rounded-2xl overflow-hidden border border-white/10 bg-[#0c0c0c]">
        {loading ? (
          <div className="p-12 text-center text-[#9a9995] text-xs flex flex-col items-center gap-3">
            <Loader2 size={20} className="animate-spin text-[#d8b36a]" />
            Loading refund records...
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-[#9a9995] text-xs">
            No refund records found matching your filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-[#070707] border-b border-white/10 text-[#9a9995] font-mono text-[10px] uppercase">
                  <th className="p-4">Refund Ref</th>
                  <th className="p-4">Booking</th>
                  <th className="p-4">Customer</th>
                  <th className="p-4">Reason / Notes</th>
                  <th className="p-4">Amount</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-[#f5f1e8]">
                {filtered.map((r) => (
                  <tr key={r.id} className="hover:bg-white/5 transition font-mono">
                    <td className="p-4 text-[#d8b36a] whitespace-nowrap">
                      {r.id.length > 12 ? `${r.id.slice(0, 10)}...` : r.id}
                    </td>
                    <td className="p-4 whitespace-nowrap">
                      {r.booking?.reference_code || r.booking_id}
                    </td>
                    <td className="p-4 font-sans font-medium whitespace-nowrap">
                      {r.booking?.contact_name || "Customer"}
                    </td>
                    <td className="p-4 font-sans text-[#9a9995] max-w-xs truncate">
                      {r.reason || r.admin_notes || "Cancellation requested"}
                    </td>
                    <td className="p-4 font-semibold text-emerald-400 whitespace-nowrap">
                      ₹{Number(r.amount).toLocaleString("en-IN")}
                    </td>
                    <td className="p-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] uppercase font-sans border ${
                          r.status === "completed"
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                            : r.status === "failed"
                            ? "bg-red-500/10 text-red-400 border-red-500/30"
                            : "bg-amber-500/10 text-amber-400 border-amber-500/30"
                        }`}
                      >
                        {r.status}
                      </span>
                    </td>
                    <td className="p-4 text-right font-sans whitespace-nowrap">
                      {r.status === "requested" ? (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => {
                              setActionModal({ item: r, action: "approve" });
                              setAdminNotes("");
                            }}
                            className="px-2.5 py-1 rounded-lg bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500 hover:text-[#070707] font-medium text-xs transition flex items-center gap-1"
                          >
                            <Check size={12} />
                            Approve
                          </button>
                          <button
                            onClick={() => {
                              setActionModal({ item: r, action: "reject" });
                              setAdminNotes("");
                            }}
                            className="px-2.5 py-1 rounded-lg bg-red-500/15 text-red-400 border border-red-500/30 hover:bg-red-500 hover:text-[#f5f1e8] font-medium text-xs transition flex items-center gap-1"
                          >
                            <X size={12} />
                            Reject
                          </button>
                        </div>
                      ) : (
                        <span className="text-[11px] text-[#9a9995]">
                          {r.razorpay_refund_id ? `Rzp: ${r.razorpay_refund_id}` : "Resolved"}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Action confirmation modal */}
      {actionModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0e0e0e] border border-white/15 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-base font-medium text-[#f5f1e8] flex items-center gap-2">
                {actionModal.action === "approve" ? (
                  <>
                    <CheckCircle2 size={18} className="text-emerald-400" />
                    Approve &amp; Issue Refund
                  </>
                ) : (
                  <>
                    <XCircle size={18} className="text-red-400" />
                    Reject Refund Claim
                  </>
                )}
              </h3>
              <button
                onClick={() => setActionModal(null)}
                className="text-[#9a9995] hover:text-[#f5f1e8]"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-2 text-xs text-[#9a9995]">
              <p>
                Booking Reference:{" "}
                <span className="text-[#f5f1e8] font-mono">
                  {actionModal.item.booking?.reference_code || actionModal.item.booking_id}
                </span>
              </p>
              <p>
                Customer:{" "}
                <span className="text-[#f5f1e8]">
                  {actionModal.item.booking?.contact_name || "Customer"}
                </span>
              </p>
              <p>
                Refund Amount:{" "}
                <span className="text-emerald-400 font-mono font-semibold">
                  ₹{Number(actionModal.item.amount).toLocaleString("en-IN")}
                </span>
              </p>
              {actionModal.item.reason && (
                <p>
                  Claim Reason: <span className="text-[#f5f1e8]">{actionModal.item.reason}</span>
                </p>
              )}
            </div>

            <div>
              <label className="block text-[11px] uppercase font-mono text-[#9a9995] mb-1.5">
                Admin Notes / Justification
              </label>
              <textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder={
                  actionModal.action === "approve"
                    ? "e.g., Cancellation policy approved, weather emergency confirmed."
                    : "e.g., Cancellation past allowed deadline, non-refundable deposit."
                }
                rows={3}
                className="w-full p-3 rounded-xl bg-[#070707] border border-white/10 text-xs text-[#f5f1e8] placeholder-[#9a9995]/50 focus:outline-none focus:border-[#d8b36a]/50"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setActionModal(null)}
                disabled={processingAction}
                className="px-4 py-2 rounded-xl border border-white/10 text-xs text-[#9a9995] hover:text-[#f5f1e8] transition"
              >
                Cancel
              </button>
              <button
                onClick={handleProcessRefund}
                disabled={processingAction}
                className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition ${
                  actionModal.action === "approve"
                    ? "bg-emerald-500 text-[#070707] hover:bg-emerald-400"
                    : "bg-red-500 text-[#f5f1e8] hover:bg-red-600"
                }`}
              >
                {processingAction && <Loader2 size={13} className="animate-spin" />}
                Confirm {actionModal.action === "approve" ? "Approval" : "Rejection"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
