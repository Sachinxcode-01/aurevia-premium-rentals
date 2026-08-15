"use client";

import React, { useState, useEffect } from "react";
import {
  HelpCircle, MessageSquare, Send, CheckCircle2, Clock, AlertTriangle,
  Search, Filter, Mail, Phone, Calendar, Sparkles, RefreshCw, User,
  Check, X, Eye, ArrowRight, ShieldCheck, ChevronRight
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { engagementStore, OnlineEnquiry } from "@/lib/db/engagementStore";
import { adminApiClient } from "@/lib/api-client";
import { realtimeHub } from "@/lib/realtime/realtimeHub";

export default function AdminEnquiriesPage() {
  const [enquiries, setEnquiries] = useState<OnlineEnquiry[]>([]);
  const [filterStatus, setFilterStatus] = useState<"all" | "new" | "in_progress" | "resolved">("all");
  const [filterPriority, setFilterPriority] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEnquiry, setSelectedEnquiry] = useState<OnlineEnquiry | null>(null);
  
  // Response form
  const [responseText, setResponseText] = useState("");
  const [sendingEmail, setSendingEmail] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const loadEnquiries = () => {
    const data = engagementStore.getEnquiries();
    setEnquiries(data);
  };

  useEffect(() => {
    loadEnquiries();
  }, []);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const handleSendResponse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEnquiry || !responseText.trim()) return;

    setSendingEmail(true);
    try {
      const res = await adminApiClient.enquiries.respond(
        selectedEnquiry.id,
        responseText.trim(),
        "AUREVIA Concierge Team"
      );

      realtimeHub.broadcast("ENQUIRY_UPDATED", { enquiryId: selectedEnquiry.id, status: "resolved" }, "admin");

      if (res.success) {
        loadEnquiries();
        const updated = engagementStore.getEnquiries().find((e) => e.id === selectedEnquiry.id);
        if (updated) setSelectedEnquiry(updated);
        setResponseText("");
        showToast(`Email response sent to ${selectedEnquiry.customerEmail} & enquiry marked as Resolved!`);
      } else {
        engagementStore.respondToEnquiry(selectedEnquiry.id, responseText.trim());
        loadEnquiries();
        const updated = engagementStore.getEnquiries().find((e) => e.id === selectedEnquiry.id);
        if (updated) setSelectedEnquiry(updated);
        setResponseText("");
        showToast("Response saved & marked as resolved.");
      }
    } catch {
      engagementStore.respondToEnquiry(selectedEnquiry.id, responseText.trim());
      realtimeHub.broadcast("ENQUIRY_UPDATED", { enquiryId: selectedEnquiry.id, status: "resolved" }, "admin");
      loadEnquiries();
      setResponseText("");
      showToast("Response recorded locally.");
    } finally {
      setSendingEmail(false);
    }
  };

  const handleUpdateStatus = (id: string, status: OnlineEnquiry["status"]) => {
    engagementStore.updateEnquiryStatus(id, status);
    loadEnquiries();
    if (selectedEnquiry?.id === id) {
      setSelectedEnquiry((prev) => (prev ? { ...prev, status } : null));
    }
    showToast(`Enquiry status updated to ${status.replace("_", " ")}.`);
  };

  const filtered = enquiries.filter((e) => {
    if (filterStatus !== "all" && e.status !== filterStatus) return false;
    if (filterPriority !== "all" && e.priority !== filterPriority) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchRef = e.referenceNo.toLowerCase().includes(q);
      const matchName = e.customerName.toLowerCase().includes(q);
      const matchEmail = e.customerEmail.toLowerCase().includes(q);
      const matchEquip = e.equipmentInterest.toLowerCase().includes(q);
      const matchMsg = e.message.toLowerCase().includes(q);
      return matchRef || matchName || matchEmail || matchEquip || matchMsg;
    }
    return true;
  });

  const totalCount = enquiries.length;
  const newCount = enquiries.filter((e) => e.status === "new").length;
  const inProgressCount = enquiries.filter((e) => e.status === "in_progress").length;
  const resolvedCount = enquiries.filter((e) => e.status === "resolved").length;

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
            <HelpCircle size={14} /> Enquiry Resolution Center
          </div>
          <h1 className="text-3xl font-serif font-light tracking-wide text-white">
            Online Enquiry Control
          </h1>
          <p className="text-xs text-[#9a9995] mt-1">
            Manage incoming customer inquiries, send direct email responses, and track equipment requests.
          </p>
        </div>

        <button
          onClick={loadEnquiries}
          className="self-start md:self-auto px-4 py-2 bg-[#121212] hover:bg-[#1a1a1a] border border-white/10 text-xs text-[#d8b36a] rounded-lg transition flex items-center gap-2"
        >
          <RefreshCw size={14} /> Refresh Enquiries
        </button>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#121212] border border-white/10 rounded-2xl p-5 space-y-2">
          <div className="flex items-center justify-between text-[#9a9995] text-xs uppercase font-mono tracking-wider">
            <span>Total Enquiries</span>
            <HelpCircle size={16} className="text-white/40" />
          </div>
          <p className="text-3xl font-bold text-white">{totalCount}</p>
          <p className="text-[11px] text-[#9a9995]">Customer online requests</p>
        </div>

        <div className="bg-[#121212] border border-blue-500/30 rounded-2xl p-5 space-y-2">
          <div className="flex items-center justify-between text-blue-400 text-xs uppercase font-mono tracking-wider">
            <span>New Queries</span>
            <Clock size={16} className="text-blue-400" />
          </div>
          <p className="text-3xl font-bold text-blue-400">{newCount}</p>
          <p className="text-[11px] text-blue-400/70">Awaiting concierge response</p>
        </div>

        <div className="bg-[#121212] border border-amber-500/30 rounded-2xl p-5 space-y-2">
          <div className="flex items-center justify-between text-amber-400 text-xs uppercase font-mono tracking-wider">
            <span>In Progress</span>
            <AlertTriangle size={16} className="text-amber-400" />
          </div>
          <p className="text-3xl font-bold text-amber-400">{inProgressCount}</p>
          <p className="text-[11px] text-amber-400/70">Under review or active quote</p>
        </div>

        <div className="bg-[#121212] border border-emerald-500/30 rounded-2xl p-5 space-y-2">
          <div className="flex items-center justify-between text-emerald-400 text-xs uppercase font-mono tracking-wider">
            <span>Resolved Queries</span>
            <CheckCircle2 size={16} className="text-emerald-400" />
          </div>
          <p className="text-3xl font-bold text-emerald-400">{resolvedCount}</p>
          <p className="text-[11px] text-emerald-400/70">Answered & resolved via email</p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-[#121212] border border-white/10 rounded-2xl p-4 flex flex-col md:flex-row gap-4 justify-between items-center">
        {/* Status Tabs */}
        <div className="flex items-center gap-1 bg-[#070707] p-1 rounded-xl border border-white/10 overflow-x-auto w-full md:w-auto">
          {(["all", "new", "in_progress", "resolved"] as const).map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-4 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition whitespace-nowrap cursor-pointer ${
                filterStatus === st
                  ? "bg-[#d8b36a] text-black font-bold shadow-md"
                  : "text-[#9a9995] hover:text-white"
              }`}
            >
              {st === "all" ? `All (${totalCount})` : `${st.replace("_", " ")} (${enquiries.filter((e) => e.status === st).length})`}
            </button>
          ))}
        </div>

        {/* Priority & Search */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="bg-[#070707] border border-white/10 text-xs text-[#f5f1e8] rounded-xl px-3 py-2 focus:outline-none focus:border-[#d8b36a]"
          >
            <option value="all">All Priorities</option>
            <option value="high">High Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="low">Low Priority</option>
          </select>

          <div className="relative flex-1 md:w-64">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9a9995]" />
            <input
              type="text"
              placeholder="Search reference, name, gear..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#070707] border border-white/10 text-xs text-[#f5f1e8] rounded-xl pl-9 pr-3 py-2 focus:outline-none focus:border-[#d8b36a]"
            />
          </div>
        </div>
      </div>

      {/* Enquiries Grid */}
      {filtered.length === 0 ? (
        <div className="bg-[#121212] border border-white/10 rounded-2xl p-12 text-center space-y-3">
          <HelpCircle size={32} className="text-[#9a9995] mx-auto opacity-50" />
          <p className="text-sm text-white font-medium">No enquiries match your search</p>
          <p className="text-xs text-[#9a9995]">Adjust your status or priority filter to see more.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((enq) => (
            <motion.div
              key={enq.id}
              layout
              className={`bg-[#121212] border rounded-2xl p-5 space-y-4 flex flex-col justify-between transition ${
                enq.status === "new"
                  ? "border-blue-500/40 bg-blue-500/2"
                  : enq.status === "in_progress"
                  ? "border-amber-500/30"
                  : "border-emerald-500/30 opacity-85"
              }`}
            >
              <div className="space-y-3">
                {/* Reference & Badges */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-[#d8b36a]">{enq.referenceNo}</span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase font-semibold ${
                        enq.priority === "high"
                          ? "bg-rose-500/10 border border-rose-500/30 text-rose-400"
                          : enq.priority === "medium"
                          ? "bg-amber-500/10 border border-amber-500/30 text-amber-400"
                          : "bg-blue-500/10 border border-blue-500/30 text-blue-400"
                      }`}
                    >
                      {enq.priority} priority
                    </span>
                  </div>

                  <span
                    className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider ${
                      enq.status === "resolved"
                        ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400"
                        : enq.status === "new"
                        ? "bg-blue-500/10 border border-blue-500/30 text-blue-400 animate-pulse"
                        : "bg-amber-500/10 border border-amber-500/30 text-amber-400"
                    }`}
                  >
                    {enq.status.replace("_", " ")}
                  </span>
                </div>

                {/* Customer Details */}
                <div>
                  <h3 className="text-sm font-semibold text-white">{enq.customerName}</h3>
                  <div className="flex flex-wrap items-center gap-3 text-[11px] text-[#9a9995] mt-0.5">
                    <span className="flex items-center gap-1"><Mail size={11} /> {enq.customerEmail}</span>
                    {enq.customerPhone && <span className="flex items-center gap-1"><Phone size={11} /> {enq.customerPhone}</span>}
                  </div>
                </div>

                {/* Subject & Equipment */}
                <div className="bg-[#070707] p-3 rounded-xl border border-white/10 space-y-1">
                  <p className="text-xs font-semibold text-white">{enq.subject}</p>
                  <p className="text-[11px] text-[#d8b36a] font-mono flex items-center gap-1">
                    🎯 Gear: {enq.equipmentInterest}
                  </p>
                  {enq.rentalDates && (
                    <p className="text-[10px] text-[#9a9995] font-mono flex items-center gap-1">
                      <Calendar size={10} /> Dates: {enq.rentalDates}
                    </p>
                  )}
                </div>

                {/* Message preview */}
                <p className="text-xs text-[#c5c3bc] leading-relaxed line-clamp-3">
                  "{enq.message}"
                </p>

                {/* Responses Count */}
                {enq.responses.length > 0 && (
                  <div className="text-[10px] text-emerald-400 font-mono flex items-center gap-1 pt-1">
                    <CheckCircle2 size={11} /> {enq.responses.length} response(s) sent to customer
                  </div>
                )}
              </div>

              {/* Action Footer */}
              <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                <span className="text-[10px] text-[#9a9995] font-mono">
                  Submitted {new Date(enq.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                </span>

                <button
                  onClick={() => {
                    setSelectedEnquiry(enq);
                    setResponseText("");
                  }}
                  className="px-4 py-2 bg-[#d8b36a] text-black font-bold text-xs rounded-xl hover:bg-[#c8a35a] transition cursor-pointer flex items-center gap-1.5 shadow-md"
                >
                  <Send size={13} /> Respond to Customer
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Response & Resolution Modal */}
      <AnimatePresence>
        {selectedEnquiry && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#121212] border border-[#d8b36a]/40 rounded-2xl max-w-2xl w-full p-6 space-y-6 shadow-2xl text-white max-h-[90vh] overflow-y-auto"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div>
                  <span className="text-[10px] font-mono text-[#d8b36a] uppercase tracking-widest">{selectedEnquiry.referenceNo}</span>
                  <h2 className="text-lg font-serif font-semibold text-white">{selectedEnquiry.subject}</h2>
                </div>
                <button
                  onClick={() => setSelectedEnquiry(null)}
                  className="text-[#9a9995] hover:text-white p-1"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Enquiry Details Grid */}
              <div className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-[#070707] p-4 rounded-xl border border-white/10">
                  <div>
                    <span className="text-[10px] text-[#9a9995] uppercase font-mono">Customer Name</span>
                    <p className="font-semibold text-white">{selectedEnquiry.customerName}</p>
                    <p className="text-[#9a9995]">{selectedEnquiry.customerEmail}</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#9a9995] uppercase font-mono">Contact Phone</span>
                    <p className="font-mono text-white">{selectedEnquiry.customerPhone || "N/A"}</p>
                    <p className="text-[#d8b36a] font-mono mt-0.5">Dates: {selectedEnquiry.rentalDates || "Flexible"}</p>
                  </div>
                </div>

                <div>
                  <span className="text-[10px] text-[#9a9995] uppercase font-mono">Equipment Interest</span>
                  <p className="text-xs font-mono text-[#d8b36a] bg-[#070707] p-2.5 rounded-xl border border-white/10 mt-1">
                    {selectedEnquiry.equipmentInterest}
                  </p>
                </div>

                <div>
                  <span className="text-[10px] text-[#9a9995] uppercase font-mono">Original Inquiry Message</span>
                  <div className="bg-[#070707] p-3.5 rounded-xl border border-white/10 mt-1 text-[#c5c3bc] leading-relaxed">
                    "{selectedEnquiry.message}"
                  </div>
                </div>

                {/* Past Responses Log */}
                {selectedEnquiry.responses.length > 0 && (
                  <div className="space-y-2 pt-2">
                    <span className="text-[10px] text-emerald-400 font-mono uppercase tracking-wider block">Sent Email Responses ({selectedEnquiry.responses.length})</span>
                    {selectedEnquiry.responses.map((resp) => (
                      <div key={resp.id} className="bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-xl text-xs space-y-1">
                        <div className="flex justify-between text-[10px] text-emerald-400 font-mono">
                          <span>{resp.respondedBy}</span>
                          <span>{new Date(resp.sentAt).toLocaleString("en-IN")}</span>
                        </div>
                        <p className="text-[#e2e8f0]">{resp.responseText}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Direct Email Response Form */}
                <form onSubmit={handleSendResponse} className="space-y-3 pt-2 border-t border-white/10">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] text-[#d8b36a] uppercase font-mono tracking-wider font-semibold block">
                      Compose Email Reply to {selectedEnquiry.customerName}
                    </label>
                    <span className="text-[10px] text-[#9a9995]">Dispatches via Gmail SMTP</span>
                  </div>

                  <textarea
                    rows={4}
                    required
                    value={responseText}
                    onChange={(e) => setResponseText(e.target.value)}
                    placeholder="Type your response to the customer. This message will be emailed directly to their email address..."
                    className="w-full bg-[#070707] border border-white/10 text-xs rounded-xl p-3 text-white focus:outline-none focus:border-[#d8b36a] placeholder-white/20"
                  />

                  <div className="flex items-center justify-between gap-3 pt-2">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleUpdateStatus(selectedEnquiry.id, "in_progress")}
                        className="px-3 py-1.5 bg-amber-500/10 text-amber-400 border border-amber-500/30 rounded-lg text-xs hover:bg-amber-500/20 transition"
                      >
                        Mark In Progress
                      </button>
                    </div>

                    <button
                      type="submit"
                      disabled={sendingEmail || !responseText.trim()}
                      className="px-5 py-2.5 bg-[#d8b36a] text-black font-bold rounded-xl text-xs hover:bg-[#c8a35a] disabled:opacity-50 transition cursor-pointer flex items-center gap-2 shadow-lg"
                    >
                      {sendingEmail ? <RefreshCw size={14} className="animate-spin" /> : <Send size={14} />}
                      {sendingEmail ? "Sending Email..." : "Send Email Response & Resolve"}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
