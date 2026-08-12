"use client";

import React, { useState, useEffect } from "react";
import {
  LifeBuoy, MessageSquare, Send, CheckCircle2, Clock, AlertCircle,
  Search, Filter, Mail, Phone, Calendar, Sparkles, RefreshCw, User,
  Check, X, Eye, ArrowRight, ShieldCheck, Headphones, Wrench, CreditCard, Truck
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { engagementStore, SupportTicket } from "@/lib/db/engagementStore";
import { adminApiClient } from "@/lib/api-client";

export default function AdminSupportTicketsPage() {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [filterStatus, setFilterStatus] = useState<"all" | "open" | "pending_customer" | "resolved">("all");
  const [filterPriority, setFilterPriority] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);

  // Reply form
  const [replyText, setReplyText] = useState("");
  const [sendingReply, setSendingReply] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const loadTickets = () => {
    const data = engagementStore.getTickets();
    setTickets(data);
  };

  useEffect(() => {
    loadTickets();
  }, []);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket || !replyText.trim()) return;

    setSendingReply(true);
    try {
      // Call backend API to trigger email notification to customer
      const res = await adminApiClient.tickets.reply(
        selectedTicket.id,
        replyText.trim(),
        "AUREVIA Support Team"
      );

      if (res.success) {
        loadTickets();
        const updated = engagementStore.getTickets().find((t) => t.id === selectedTicket.id);
        if (updated) setSelectedTicket(updated);
        setReplyText("");
        showToast(`Reply sent to ${selectedTicket.customerEmail} & ticket updated.`);
      } else {
        engagementStore.replyToTicket(selectedTicket.id, replyText.trim());
        loadTickets();
        const updated = engagementStore.getTickets().find((t) => t.id === selectedTicket.id);
        if (updated) setSelectedTicket(updated);
        setReplyText("");
        showToast("Reply saved to ticket thread.");
      }
    } catch {
      engagementStore.replyToTicket(selectedTicket.id, replyText.trim());
      loadTickets();
      setReplyText("");
      showToast("Reply saved locally.");
    } finally {
      setSendingReply(false);
    }
  };

  const handleUpdateStatus = (ticketId: string, status: SupportTicket["status"], priority?: SupportTicket["priority"]) => {
    engagementStore.updateTicketStatus(ticketId, status, priority);
    loadTickets();
    if (selectedTicket?.id === ticketId) {
      setSelectedTicket((prev) => (prev ? { ...prev, status, ...(priority ? { priority } : {}) } : null));
    }
    showToast(`Ticket status changed to ${status.replace("_", " ")}.`);
  };

  const filtered = tickets.filter((t) => {
    if (filterStatus !== "all" && t.status !== filterStatus) return false;
    if (filterPriority !== "all" && t.priority !== filterPriority) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchNo = t.ticketNo.toLowerCase().includes(q);
      const matchName = t.customerName.toLowerCase().includes(q);
      const matchEmail = t.customerEmail.toLowerCase().includes(q);
      const matchSubj = t.subject.toLowerCase().includes(q);
      const matchBooking = (t.bookingReference || "").toLowerCase().includes(q);
      return matchNo || matchName || matchEmail || matchSubj || matchBooking;
    }
    return true;
  });

  const totalCount = tickets.length;
  const openCount = tickets.filter((t) => t.status === "open").length;
  const urgentCount = tickets.filter((t) => t.priority === "urgent" && t.status !== "resolved").length;
  const resolvedCount = tickets.filter((t) => t.status === "resolved").length;

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case "Equipment Technical Issue": return <Wrench size={13} className="text-amber-400" />;
      case "Billing & Deposit": return <CreditCard size={13} className="text-[#d8b36a]" />;
      case "Delivery & Pickup": return <Truck size={13} className="text-blue-400" />;
      default: return <Headphones size={13} className="text-purple-400" />;
    }
  };

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
            <LifeBuoy size={14} /> Customer Support Center
          </div>
          <h1 className="text-3xl font-serif font-light tracking-wide text-white">
            Support Ticket Management
          </h1>
          <p className="text-xs text-[#9a9995] mt-1">
            Monitor, respond to, and resolve active customer technical and deposit support tickets.
          </p>
        </div>

        <button
          onClick={loadTickets}
          className="self-start md:self-auto px-4 py-2 bg-[#121212] hover:bg-[#1a1a1a] border border-white/10 text-xs text-[#d8b36a] rounded-lg transition flex items-center gap-2"
        >
          <RefreshCw size={14} /> Refresh Tickets
        </button>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#121212] border border-white/10 rounded-2xl p-5 space-y-2">
          <div className="flex items-center justify-between text-[#9a9995] text-xs uppercase font-mono tracking-wider">
            <span>Total Tickets</span>
            <LifeBuoy size={16} className="text-white/40" />
          </div>
          <p className="text-3xl font-bold text-white">{totalCount}</p>
          <p className="text-[11px] text-[#9a9995]">Support requests registered</p>
        </div>

        <div className="bg-[#121212] border border-amber-500/30 rounded-2xl p-5 space-y-2">
          <div className="flex items-center justify-between text-amber-400 text-xs uppercase font-mono tracking-wider">
            <span>Open Tickets</span>
            <Clock size={16} className="text-amber-400" />
          </div>
          <p className="text-3xl font-bold text-amber-400">{openCount}</p>
          <p className="text-[11px] text-amber-400/70">Awaiting support response</p>
        </div>

        <div className="bg-[#121212] border border-rose-500/30 rounded-2xl p-5 space-y-2">
          <div className="flex items-center justify-between text-rose-400 text-xs uppercase font-mono tracking-wider">
            <span>Urgent Priority</span>
            <AlertCircle size={16} className="text-rose-400" />
          </div>
          <p className="text-3xl font-bold text-rose-400">{urgentCount}</p>
          <p className="text-[11px] text-rose-400/70">High impact support tickets</p>
        </div>

        <div className="bg-[#121212] border border-emerald-500/30 rounded-2xl p-5 space-y-2">
          <div className="flex items-center justify-between text-emerald-400 text-xs uppercase font-mono tracking-wider">
            <span>Resolved Tickets</span>
            <CheckCircle2 size={16} className="text-emerald-400" />
          </div>
          <p className="text-3xl font-bold text-emerald-400">{resolvedCount}</p>
          <p className="text-[11px] text-emerald-400/70">Successfully closed</p>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-[#121212] border border-white/10 rounded-2xl p-4 flex flex-col md:flex-row gap-4 justify-between items-center">
        {/* Status Tabs */}
        <div className="flex items-center gap-1 bg-[#070707] p-1 rounded-xl border border-white/10 overflow-x-auto w-full md:w-auto">
          {(["all", "open", "pending_customer", "resolved"] as const).map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-4 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition capitalize whitespace-nowrap cursor-pointer ${
                filterStatus === st
                  ? "bg-[#d8b36a] text-black font-bold shadow-md"
                  : "text-[#9a9995] hover:text-white"
              }`}
            >
              {st === "all" ? `All (${totalCount})` : `${st.replace("_", " ")} (${tickets.filter((t) => t.status === st).length})`}
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
            <option value="urgent">Urgent Priority</option>
            <option value="normal">Normal Priority</option>
            <option value="low">Low Priority</option>
          </select>

          <div className="relative flex-1 md:w-64">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9a9995]" />
            <input
              type="text"
              placeholder="Search ticket #, name, subject..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#070707] border border-white/10 text-xs text-[#f5f1e8] rounded-xl pl-9 pr-3 py-2 focus:outline-none focus:border-[#d8b36a]"
            />
          </div>
        </div>
      </div>

      {/* Tickets List Grid */}
      {filtered.length === 0 ? (
        <div className="bg-[#121212] border border-white/10 rounded-2xl p-12 text-center space-y-3">
          <LifeBuoy size={32} className="text-[#9a9995] mx-auto opacity-50" />
          <p className="text-sm text-white font-medium">No support tickets found</p>
          <p className="text-xs text-[#9a9995]">Try adjusting your search query or filters.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((tck) => (
            <motion.div
              key={tck.id}
              layout
              className={`bg-[#121212] border rounded-2xl p-5 transition flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
                tck.priority === "urgent" && tck.status !== "resolved"
                  ? "border-rose-500/40 bg-rose-500/2"
                  : tck.status === "open"
                  ? "border-amber-500/30"
                  : "border-white/10"
              }`}
            >
              <div className="space-y-1.5 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-mono font-bold text-[#d8b36a]">{tck.ticketNo}</span>
                  
                  {/* Category Badge */}
                  <span className="px-2 py-0.5 bg-[#070707] border border-white/10 rounded text-[10px] text-[#e2e8f0] flex items-center gap-1 font-mono">
                    {getCategoryIcon(tck.category)} {tck.category}
                  </span>

                  {/* Priority Badge */}
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase font-semibold ${
                      tck.priority === "urgent"
                        ? "bg-rose-500/10 border border-rose-500/30 text-rose-400 animate-pulse"
                        : tck.priority === "normal"
                        ? "bg-amber-500/10 border border-amber-500/30 text-amber-400"
                        : "bg-blue-500/10 border border-blue-500/30 text-blue-400"
                    }`}
                  >
                    {tck.priority}
                  </span>

                  {/* Status Badge */}
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider ${
                      tck.status === "resolved"
                        ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400"
                        : tck.status === "open"
                        ? "bg-amber-500/10 border border-amber-500/30 text-amber-400"
                        : "bg-purple-500/10 border border-purple-500/30 text-purple-400"
                    }`}
                  >
                    {tck.status.replace("_", " ")}
                  </span>
                </div>

                <h3 className="text-sm font-semibold text-white">{tck.subject}</h3>

                <div className="flex flex-wrap items-center gap-3 text-[11px] text-[#9a9995]">
                  <span>Customer: <strong className="text-white">{tck.customerName}</strong> ({tck.customerEmail})</span>
                  {tck.bookingReference && (
                    <span className="font-mono text-[#d8b36a]">Ref: {tck.bookingReference}</span>
                  )}
                  <span>Messages: {tck.messages.length}</span>
                </div>
              </div>

              <div className="flex items-center gap-3 self-end md:self-auto">
                {tck.status !== "resolved" && (
                  <button
                    onClick={() => handleUpdateStatus(tck.id, "resolved")}
                    className="px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs rounded-lg transition"
                  >
                    Mark Resolved
                  </button>
                )}

                <button
                  onClick={() => {
                    setSelectedTicket(tck);
                    setReplyText("");
                  }}
                  className="px-4 py-2 bg-[#d8b36a] text-black font-bold text-xs rounded-xl hover:bg-[#c8a35a] transition cursor-pointer flex items-center gap-1.5 shadow-md"
                >
                  <MessageSquare size={13} /> View Thread & Reply
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Ticket Conversation Modal */}
      <AnimatePresence>
        {selectedTicket && (
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
                  <span className="text-[10px] font-mono text-[#d8b36a] uppercase tracking-widest">{selectedTicket.ticketNo} · {selectedTicket.category}</span>
                  <h2 className="text-lg font-serif font-semibold text-white">{selectedTicket.subject}</h2>
                </div>
                <button
                  onClick={() => setSelectedTicket(null)}
                  className="text-[#9a9995] hover:text-white p-1"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Customer Info */}
              <div className="flex justify-between items-center bg-[#070707] p-3 rounded-xl border border-white/10 text-xs">
                <div>
                  <p className="font-semibold text-white">{selectedTicket.customerName}</p>
                  <p className="text-[#9a9995]">{selectedTicket.customerEmail}</p>
                </div>
                {selectedTicket.bookingReference && (
                  <span className="font-mono text-[#d8b36a] bg-[#d8b36a]/10 border border-[#d8b36a]/30 px-2 py-1 rounded">
                    Booking #{selectedTicket.bookingReference}
                  </span>
                )}
              </div>

              {/* Conversation Messages List */}
              <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                {selectedTicket.messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`p-3.5 rounded-xl text-xs space-y-1 ${
                      msg.sender === "admin"
                        ? "bg-[#d8b36a]/10 border border-[#d8b36a]/30 ml-6 text-white"
                        : "bg-[#070707] border border-white/10 mr-6 text-[#c5c3bc]"
                    }`}
                  >
                    <div className="flex justify-between text-[10px] font-mono text-[#9a9995]">
                      <span className={msg.sender === "admin" ? "text-[#d8b36a] font-bold" : "text-white"}>
                        {msg.senderName} ({msg.sender === "admin" ? "Concierge Support" : "Customer"})
                      </span>
                      <span>{new Date(msg.sentAt).toLocaleString("en-IN")}</span>
                    </div>
                    <p className="leading-relaxed">{msg.text}</p>
                  </div>
                ))}
              </div>

              {/* Admin Reply Form */}
              <form onSubmit={handleSendReply} className="space-y-3 pt-2 border-t border-white/10">
                <label className="text-[10px] text-[#d8b36a] uppercase font-mono tracking-wider font-semibold block">
                  Send Concierge Reply to {selectedTicket.customerName}
                </label>

                <textarea
                  rows={3}
                  required
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Type your response to the customer. They will receive an instant email notification..."
                  className="w-full bg-[#070707] border border-white/10 text-xs rounded-xl p-3 text-white focus:outline-none focus:border-[#d8b36a] placeholder-white/20"
                />

                <div className="flex items-center justify-between gap-3 pt-1">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleUpdateStatus(selectedTicket.id, "resolved")}
                      className="px-3 py-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-lg text-xs hover:bg-emerald-500/20 transition"
                    >
                      Mark Resolved
                    </button>
                  </div>

                  <button
                    type="submit"
                    disabled={sendingReply || !replyText.trim()}
                    className="px-5 py-2 bg-[#d8b36a] text-black font-bold rounded-xl text-xs hover:bg-[#c8a35a] disabled:opacity-50 transition cursor-pointer flex items-center gap-2 shadow-lg"
                  >
                    {sendingReply ? <RefreshCw size={14} className="animate-spin" /> : <Send size={14} />}
                    {sendingReply ? "Sending..." : "Send Reply Email"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
