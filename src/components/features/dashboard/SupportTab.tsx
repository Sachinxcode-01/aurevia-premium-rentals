"use client";

import React, { useState } from "react";
import { SupportTicket } from "./DashboardTypes";
import {
  MessageCircle,
  PlusCircle,
  Clock,
  Send,
  CheckCircle2,
  AlertCircle,
  User,
  Shield,
  X,
} from "lucide-react";

interface SupportTabProps {
  tickets: SupportTicket[];
  ticketsLoading: boolean;
  selectedTicket: SupportTicket | null;
  onSelectTicket: (ticket: SupportTicket | null) => void;
  onCreateTicket: (subject: string, category: string, priority: string, message: string) => Promise<void>;
  onSendReply: (ticketId: string, text: string) => Promise<void>;
  creatingTicket: boolean;
  sendingReply: boolean;
}

export default function SupportTab({
  tickets,
  ticketsLoading,
  selectedTicket,
  onSelectTicket,
  onCreateTicket,
  onSendReply,
  creatingTicket,
  sendingReply,
}: SupportTabProps) {
  const [showNewModal, setShowNewModal] = useState(false);
  const [subject, setSubject] = useState("");
  const [category, setCategory] = useState("Technical & Lens Inquiry");
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium");
  const [initialMessage, setInitialMessage] = useState("");
  const [replyText, setReplyText] = useState("");

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !initialMessage.trim()) return;
    await onCreateTicket(subject, category, priority, initialMessage);
    setShowNewModal(false);
    setSubject("");
    setInitialMessage("");
  };

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket || !replyText.trim()) return;
    await onSendReply(selectedTicket.id, replyText);
    setReplyText("");
  };

  return (
    <div className="space-y-6">
      {/* ─── 1. HEADER & NEW TICKET BUTTON ─── */}
      <div className="flex flex-col justify-between gap-4 rounded-2xl border border-white/10 bg-neutral-900/80 p-5 backdrop-blur-xl shadow-xl md:flex-row md:items-center">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-widest text-amber-400">
            <MessageCircle className="h-4 w-4" />
            24/7 Cinematography Support Desk
          </div>
          <h3 className="mt-1 text-base font-bold text-white">
            Dedicated Vault Assistance &amp; Tech Concierge
          </h3>
        </div>

        <button
          onClick={() => setShowNewModal(true)}
          className="flex items-center gap-2 rounded-xl bg-amber-400 px-4 py-2 text-xs font-bold text-black transition-transform hover:scale-105 shadow-md shadow-amber-400/20"
        >
          <PlusCircle className="h-4 w-4" />
          Open Support Ticket
        </button>
      </div>

      {/* ─── 2. TICKETS SPLIT VIEW OR LIST ─── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Column: Tickets Roster */}
        <div className="space-y-3 lg:col-span-1">
          <h4 className="text-xs font-mono font-bold uppercase text-neutral-400">
            Active Tickets ({tickets.length})
          </h4>

          {tickets.length === 0 ? (
            <div className="rounded-2xl border border-white/5 bg-neutral-900/40 p-8 text-center text-xs text-neutral-500">
              No active support inquiries.
            </div>
          ) : (
            <div className="space-y-2">
              {tickets.map((t) => {
                const isSelected = selectedTicket?.id === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => onSelectTicket(t)}
                    className={`w-full text-left rounded-2xl border p-4 transition-all ${
                      isSelected
                        ? "border-amber-400 bg-amber-400/10 shadow-lg shadow-amber-400/10"
                        : "border-white/10 bg-neutral-900/80 hover:border-white/20"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono text-neutral-500 uppercase">
                        {t.category}
                      </span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[9px] font-mono font-bold uppercase ${
                          t.status === "resolved"
                            ? "bg-emerald-500/20 text-emerald-400"
                            : "bg-amber-500/20 text-amber-400"
                        }`}
                      >
                        {t.status}
                      </span>
                    </div>
                    <h5 className="font-bold text-white text-xs mt-1 truncate">{t.subject}</h5>
                    <span className="text-[10px] text-neutral-500 font-mono mt-1 block">
                      {new Date(t.updated_at || t.created_at).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                      })}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Active Thread Discussion */}
        <div className="rounded-3xl border border-white/10 bg-neutral-900/80 p-6 shadow-2xl backdrop-blur-xl lg:col-span-2 flex flex-col justify-between min-h-[460px]">
          {selectedTicket ? (
            <div className="flex flex-col h-full justify-between space-y-4">
              {/* Thread Header */}
              <div className="border-b border-white/10 pb-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold uppercase text-amber-400">
                    {selectedTicket.category} • Priority: {selectedTicket.priority}
                  </span>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[10px] font-mono font-bold uppercase ${
                      selectedTicket.status === "resolved"
                        ? "bg-emerald-500/20 text-emerald-400"
                        : "bg-amber-500/20 text-amber-400"
                    }`}
                  >
                    {selectedTicket.status}
                  </span>
                </div>
                <h3 className="text-base font-bold text-white mt-1">{selectedTicket.subject}</h3>
              </div>

              {/* Messages Container */}
              <div className="flex-1 space-y-3 overflow-y-auto max-h-[320px] pr-2">
                {selectedTicket.messages?.map((msg) => {
                  const isCust = msg.sender === "customer";
                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isCust ? "items-end" : "items-start"}`}
                    >
                      <div
                        className={`max-w-[85%] rounded-2xl p-3.5 text-xs ${
                          isCust
                            ? "bg-amber-400 text-black font-medium"
                            : "bg-black/60 border border-white/10 text-white"
                        }`}
                      >
                        <span className="text-[9px] opacity-70 block mb-1 font-mono uppercase">
                          {isCust ? "You (Creator)" : "Aurevia Vault Specialist"}
                        </span>
                        <p className="leading-relaxed">{msg.text}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Reply Form */}
              <form onSubmit={handleReply} className="flex gap-2 border-t border-white/10 pt-4">
                <input
                  type="text"
                  placeholder="Type a response to the concierge team..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  className="flex-1 rounded-xl border border-white/10 bg-black/60 px-4 py-2 text-xs text-white placeholder:text-neutral-500 focus:border-amber-400 focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={sendingReply || !replyText.trim()}
                  className="rounded-xl bg-amber-400 px-4 py-2 text-xs font-bold text-black hover:bg-amber-300 transition-colors disabled:opacity-50"
                >
                  <Send className="h-4 w-4" />
                </button>
              </form>
            </div>
          ) : (
            <div className="flex h-full flex-col items-center justify-center text-center text-neutral-500 space-y-2 py-12">
              <MessageCircle className="h-10 w-10 text-neutral-600" />
              <p className="text-xs font-mono">Select a ticket from the left to view replies or send updates.</p>
            </div>
          )}
        </div>
      </div>

      {/* ─── 3. NEW TICKET MODAL ─── */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
          <div className="relative w-full max-w-lg rounded-3xl border border-white/15 bg-neutral-950 p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <PlusCircle className="h-4 w-4 text-amber-400" />
                Open Concierge Support Ticket
              </h3>
              <button
                onClick={() => setShowNewModal(false)}
                className="text-neutral-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4 text-xs">
              <div>
                <label className="text-neutral-400 uppercase font-mono text-[10px] block mb-1">
                  Subject / Topic
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Lens mount adapter request for ARRI shoot"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-black/60 p-2.5 text-white placeholder:text-neutral-600 focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-neutral-400 uppercase font-mono text-[10px] block mb-1">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-neutral-900 p-2.5 text-white focus:border-amber-400 focus:outline-none"
                  >
                    <option value="Technical & Lens Inquiry">Technical &amp; Optics</option>
                    <option value="Booking Modification">Booking Modification</option>
                    <option value="Billing & Tax Invoicing">Billing &amp; Invoicing</option>
                    <option value="Other Assistance">Other Assistance</option>
                  </select>
                </div>

                <div>
                  <label className="text-neutral-400 uppercase font-mono text-[10px] block mb-1">
                    Priority
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as any)}
                    className="w-full rounded-xl border border-white/10 bg-neutral-900 p-2.5 text-white focus:border-amber-400 focus:outline-none"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High (Shoot Critical)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-neutral-400 uppercase font-mono text-[10px] block mb-1">
                  Message Details
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Describe your inquiry or gear request in detail..."
                  value={initialMessage}
                  onChange={(e) => setInitialMessage(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-black/60 p-2.5 text-white placeholder:text-neutral-600 focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowNewModal(false)}
                  className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 font-semibold text-neutral-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingTicket}
                  className="rounded-xl bg-amber-400 px-5 py-2 font-bold text-black hover:bg-amber-300 transition-colors"
                >
                  {creatingTicket ? "Submitting..." : "Submit Ticket"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
