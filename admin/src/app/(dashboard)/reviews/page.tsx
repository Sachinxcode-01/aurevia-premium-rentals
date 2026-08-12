"use client";

import React, { useState, useEffect } from "react";
import {
  Star, CheckCircle2, XCircle, AlertCircle, Search, Filter,
  Trash2, ShieldCheck, MessageSquare, ThumbsUp, RefreshCw,
  ExternalLink, Eye, ArrowUpRight, Sparkles, Check, X
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { engagementStore, CustomerReview } from "@/lib/db/engagementStore";
import { realtimeHub } from "@/lib/realtime/realtimeHub";

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<CustomerReview[]>([]);
  const [filterStatus, setFilterStatus] = useState<"all" | "pending" | "approved" | "rejected">("all");
  const [ratingFilter, setRatingFilter] = useState<number | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedReview, setSelectedReview] = useState<CustomerReview | null>(null);
  const [adminNoteInput, setAdminNoteInput] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const loadReviews = () => {
    const data = engagementStore.getReviews();
    setReviews(data);
  };

  useEffect(() => {
    loadReviews();
  }, []);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleStatusChange = (id: string, status: "approved" | "rejected", note?: string) => {
    setActionLoading(id);
    setTimeout(() => {
      engagementStore.updateReviewStatus(id, status, note || adminNoteInput);
      realtimeHub.broadcast("REVIEW_MODERATED", { id, status }, "admin");
      loadReviews();
      setActionLoading(null);
      if (selectedReview?.id === id) {
        setSelectedReview((prev) => (prev ? { ...prev, status, adminNote: note || adminNoteInput } : null));
      }
      showToast(`Review ${status === "approved" ? "APPROVED and published to website" : "REJECTED"}.`);
    }, 400);
  };

  const handleDelete = (id: string) => {
    if (!confirm("Are you sure you want to delete this review?")) return;
    engagementStore.deleteReview(id);
    loadReviews();
    if (selectedReview?.id === id) setSelectedReview(null);
    showToast("Review deleted successfully.");
  };

  // Filtered reviews calculation
  const filtered = reviews.filter((r) => {
    if (filterStatus !== "all" && r.status !== filterStatus) return false;
    if (ratingFilter !== "all" && r.rating !== ratingFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = r.customerName.toLowerCase().includes(q);
      const matchEmail = r.customerEmail.toLowerCase().includes(q);
      const matchProd = r.productName.toLowerCase().includes(q);
      const matchText = r.comment.toLowerCase().includes(q);
      return matchName || matchEmail || matchProd || matchText;
    }
    return true;
  });

  const totalCount = reviews.length;
  const pendingCount = reviews.filter((r) => r.status === "pending").length;
  const approvedCount = reviews.filter((r) => r.status === "approved").length;
  const rejectedCount = reviews.filter((r) => r.status === "rejected").length;
  const avgRating = totalCount > 0
    ? (reviews.reduce((acc, curr) => acc + curr.rating, 0) / totalCount).toFixed(1)
    : "5.0";

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMsg && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-6 right-6 z-50 bg-[#121212] border border-[#d8b36a]/40 text-[#f5f1e8] px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 text-xs"
          >
            <Sparkles size={16} className="text-[#d8b36a]" />
            <span>{toastMsg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Page Title Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-2 text-[#d8b36a] text-xs font-mono uppercase tracking-widest mb-1">
            <Star size={14} className="fill-[#d8b36a]" /> Customer Feedback Control
          </div>
          <h1 className="text-3xl font-serif font-light tracking-wide text-white">
            Customer Reviews Moderation
          </h1>
          <p className="text-xs text-[#9a9995] mt-1">
            Review, approve, or reject customer ratings before they publish to the live Aurevia website.
          </p>
        </div>

        <button
          onClick={loadReviews}
          className="self-start md:self-auto px-4 py-2 bg-[#121212] hover:bg-[#1a1a1a] border border-white/10 text-xs text-[#d8b36a] rounded-lg transition flex items-center gap-2"
        >
          <RefreshCw size={14} /> Refresh Feed
        </button>
      </div>

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#121212] border border-white/10 rounded-2xl p-5 space-y-2">
          <div className="flex items-center justify-between text-[#9a9995] text-xs uppercase font-mono tracking-wider">
            <span>Total Reviews</span>
            <MessageSquare size={16} className="text-white/40" />
          </div>
          <p className="text-3xl font-bold text-white">{totalCount}</p>
          <p className="text-[11px] text-[#9a9995]">Customer feedback submissions</p>
        </div>

        <div className="bg-[#121212] border border-amber-500/30 rounded-2xl p-5 space-y-2">
          <div className="flex items-center justify-between text-amber-400 text-xs uppercase font-mono tracking-wider">
            <span>Pending Moderation</span>
            <AlertCircle size={16} className="text-amber-400" />
          </div>
          <p className="text-3xl font-bold text-amber-400">{pendingCount}</p>
          <p className="text-[11px] text-amber-400/70">Awaiting your approval</p>
        </div>

        <div className="bg-[#121212] border border-emerald-500/30 rounded-2xl p-5 space-y-2">
          <div className="flex items-center justify-between text-emerald-400 text-xs uppercase font-mono tracking-wider">
            <span>Live On Website</span>
            <CheckCircle2 size={16} className="text-emerald-400" />
          </div>
          <p className="text-3xl font-bold text-emerald-400">{approvedCount}</p>
          <p className="text-[11px] text-emerald-400/70">Approved public testimonials</p>
        </div>

        <div className="bg-[#121212] border border-[#d8b36a]/30 rounded-2xl p-5 space-y-2">
          <div className="flex items-center justify-between text-[#d8b36a] text-xs uppercase font-mono tracking-wider">
            <span>Average Rating</span>
            <Star size={16} className="fill-[#d8b36a] text-[#d8b36a]" />
          </div>
          <div className="flex items-baseline gap-2">
            <p className="text-3xl font-bold text-[#d8b36a]">{avgRating}</p>
            <span className="text-xs text-[#9a9995]">/ 5.0</span>
          </div>
          <p className="text-[11px] text-[#9a9995]">Based on all customer ratings</p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-[#121212] border border-white/10 rounded-2xl p-4 flex flex-col md:flex-row gap-4 justify-between items-center">
        {/* Status Tabs */}
        <div className="flex items-center gap-1 bg-[#070707] p-1 rounded-xl border border-white/10 overflow-x-auto w-full md:w-auto">
          {(["all", "pending", "approved", "rejected"] as const).map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-4 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition capitalize whitespace-nowrap cursor-pointer ${
                filterStatus === st
                  ? "bg-[#d8b36a] text-black font-bold shadow-md"
                  : "text-[#9a9995] hover:text-white"
              }`}
            >
              {st === "all" ? `All (${totalCount})` : `${st} (${reviews.filter((r) => r.status === st).length})`}
            </button>
          ))}
        </div>

        {/* Rating & Search */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <select
            value={ratingFilter}
            onChange={(e) => setRatingFilter(e.target.value === "all" ? "all" : Number(e.target.value))}
            className="bg-[#070707] border border-white/10 text-xs text-[#f5f1e8] rounded-xl px-3 py-2 focus:outline-none focus:border-[#d8b36a]"
          >
            <option value="all">All Ratings (1-5★)</option>
            <option value="5">5 Stars Only</option>
            <option value="4">4 Stars Only</option>
            <option value="3">3 Stars Only</option>
          </select>

          <div className="relative flex-1 md:w-64">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9a9995]" />
            <input
              type="text"
              placeholder="Search reviewer or product..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#070707] border border-white/10 text-xs text-[#f5f1e8] rounded-xl pl-9 pr-3 py-2 focus:outline-none focus:border-[#d8b36a]"
            />
          </div>
        </div>
      </div>

      {/* Reviews Grid */}
      {filtered.length === 0 ? (
        <div className="bg-[#121212] border border-white/10 rounded-2xl p-12 text-center space-y-3">
          <Star size={32} className="text-[#9a9995] mx-auto opacity-50" />
          <p className="text-sm text-white font-medium">No reviews found</p>
          <p className="text-xs text-[#9a9995]">Try adjusting your search query or status filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((rev) => (
            <motion.div
              key={rev.id}
              layout
              className={`bg-[#121212] border rounded-2xl p-5 space-y-4 flex flex-col justify-between transition ${
                rev.status === "pending"
                  ? "border-amber-500/40 bg-amber-500/2"
                  : rev.status === "approved"
                  ? "border-emerald-500/30"
                  : "border-rose-500/30 opacity-75"
              }`}
            >
              {/* Header */}
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-semibold text-white">{rev.customerName}</h3>
                      {rev.verifiedRental && (
                        <span className="px-1.5 py-0.5 bg-teal-500/10 border border-teal-500/30 text-teal-400 text-[10px] font-mono rounded flex items-center gap-1">
                          <ShieldCheck size={10} /> Verified Rental
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-[#9a9995]">{rev.customerEmail}</p>
                  </div>

                  {/* Status Badge */}
                  <span
                    className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider ${
                      rev.status === "approved"
                        ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400"
                        : rev.status === "pending"
                        ? "bg-amber-500/10 border border-amber-500/30 text-amber-400 animate-pulse"
                        : "bg-rose-500/10 border border-rose-500/30 text-rose-400"
                    }`}
                  >
                    {rev.status === "approved" ? "Live on Site" : rev.status}
                  </span>
                </div>

                {/* Equipment & Rating */}
                <div className="flex items-center justify-between pt-1 border-t border-white/5">
                  <span className="text-xs text-[#d8b36a] font-mono truncate max-w-[240px]">{rev.productName}</span>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        size={13}
                        className={s <= rev.rating ? "fill-[#d8b36a] text-[#d8b36a]" : "text-white/20"}
                      />
                    ))}
                  </div>
                </div>

                {/* Title & Comment */}
                <div className="pt-2">
                  <p className="text-xs font-semibold text-white mb-1">"{rev.title}"</p>
                  <p className="text-xs text-[#c5c3bc] leading-relaxed line-clamp-3 font-sans">
                    {rev.comment}
                  </p>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                <span className="text-[10px] text-[#9a9995] font-mono">
                  {new Date(rev.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                </span>

                <div className="flex items-center gap-2">
                  {rev.status !== "approved" && (
                    <button
                      onClick={() => handleStatusChange(rev.id, "approved")}
                      disabled={actionLoading === rev.id}
                      className="px-3 py-1.5 bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/40 text-emerald-400 text-xs font-medium rounded-lg transition flex items-center gap-1 cursor-pointer"
                    >
                      <Check size={12} /> Approve
                    </button>
                  )}

                  {rev.status !== "rejected" && (
                    <button
                      onClick={() => handleStatusChange(rev.id, "rejected")}
                      disabled={actionLoading === rev.id}
                      className="px-3 py-1.5 bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/40 text-rose-400 text-xs font-medium rounded-lg transition flex items-center gap-1 cursor-pointer"
                    >
                      <X size={12} /> Reject
                    </button>
                  )}

                  <button
                    onClick={() => {
                      setSelectedReview(rev);
                      setAdminNoteInput(rev.adminNote || "");
                    }}
                    className="p-1.5 bg-[#070707] hover:bg-white/10 text-[#9a9995] hover:text-white rounded-lg border border-white/10 transition"
                    title="View Details"
                  >
                    <Eye size={14} />
                  </button>

                  <button
                    onClick={() => handleDelete(rev.id)}
                    className="p-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-lg border border-rose-500/30 transition"
                    title="Delete Review"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Review Details & Moderation Modal */}
      <AnimatePresence>
        {selectedReview && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#121212] border border-[#d8b36a]/40 rounded-2xl max-w-lg w-full p-6 space-y-6 shadow-2xl text-white"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-2">
                  <Star size={18} className="fill-[#d8b36a] text-[#d8b36a]" />
                  <h2 className="text-lg font-serif font-semibold">Review Moderation</h2>
                </div>
                <button
                  onClick={() => setSelectedReview(null)}
                  className="text-[#9a9995] hover:text-white p-1"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div className="flex justify-between items-start bg-[#070707] p-3 rounded-xl border border-white/10">
                  <div>
                    <p className="font-semibold text-white">{selectedReview.customerName}</p>
                    <p className="text-[#9a9995]">{selectedReview.customerEmail}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} size={12} className={s <= selectedReview.rating ? "fill-[#d8b36a] text-[#d8b36a]" : "text-white/20"} />
                    ))}
                  </div>
                </div>

                <div>
                  <span className="text-[10px] text-[#9a9995] uppercase font-mono">Product Rented</span>
                  <p className="text-xs text-[#d8b36a] font-mono mt-0.5">{selectedReview.productName}</p>
                </div>

                <div>
                  <span className="text-[10px] text-[#9a9995] uppercase font-mono">Review Title</span>
                  <p className="text-xs font-semibold text-white mt-0.5">"{selectedReview.title}"</p>
                </div>

                <div>
                  <span className="text-[10px] text-[#9a9995] uppercase font-mono">Review Content</span>
                  <p className="text-xs text-[#c5c3bc] leading-relaxed mt-0.5 bg-[#070707] p-3 rounded-xl border border-white/10">
                    {selectedReview.comment}
                  </p>
                </div>

                <div className="space-y-1 pt-2">
                  <label className="text-[10px] text-[#9a9995] uppercase font-mono">Internal Admin Note</label>
                  <textarea
                    rows={2}
                    value={adminNoteInput}
                    onChange={(e) => setAdminNoteInput(e.target.value)}
                    placeholder="Add internal note or moderation reason..."
                    className="w-full bg-[#070707] border border-white/10 text-xs rounded-xl p-2.5 focus:outline-none focus:border-[#d8b36a]"
                  />
                </div>
              </div>

              {/* Modal Action Buttons */}
              <div className="flex items-center justify-end gap-3 border-t border-white/10 pt-4">
                <button
                  onClick={() => handleStatusChange(selectedReview.id, "rejected")}
                  className="px-4 py-2 bg-rose-500/15 text-rose-400 border border-rose-500/40 rounded-xl text-xs font-semibold hover:bg-rose-500/25 transition cursor-pointer"
                >
                  Reject Review
                </button>

                <button
                  onClick={() => handleStatusChange(selectedReview.id, "approved")}
                  className="px-5 py-2 bg-[#d8b36a] text-black font-bold rounded-xl text-xs hover:bg-[#c8a35a] transition cursor-pointer flex items-center gap-1.5"
                >
                  <Check size={14} /> Approve & Publish
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
