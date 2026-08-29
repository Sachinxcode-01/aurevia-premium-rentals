"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  BookingFilter,
  STATUS_STYLES,
  TIMELINE_STEPS,
  STEP_ORDER,
  filterBookings,
  canCancel,
} from "./DashboardTypes";
import BookingQRCode from "@/components/booking/BookingQRCode";
import {
  ShoppingBag,
  Calendar,
  Search,
  CheckCircle2,
  XCircle,
  QrCode,
  FileText,
  AlertTriangle,
  RefreshCw,
  Clock,
  Key,
} from "lucide-react";

interface BookingsTabProps {
  bookings: any[];
  onRefresh: () => Promise<void>;
  refreshing: boolean;
  onCancelBooking: (id: string) => Promise<void>;
  cancellingId: string | null;
}

export default function BookingsTab({
  bookings,
  onRefresh,
  refreshing,
  onCancelBooking,
  cancellingId,
}: BookingsTabProps) {
  const [filter, setFilter] = useState<BookingFilter>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [qrModalBooking, setQrModalBooking] = useState<any | null>(null);

  const filterOptions: { id: BookingFilter; label: string }[] = [
    { id: "all", label: "All Reservations" },
    { id: "upcoming", label: "Upcoming" },
    { id: "active", label: "Active on Shoot" },
    { id: "completed", label: "Completed" },
    { id: "cancelled", label: "Cancelled" },
  ];

  let filtered = filterBookings(bookings, filter);

  if (searchTerm.trim()) {
    const t = searchTerm.toLowerCase();
    filtered = filtered.filter((b) => {
      const ref = (String(b.referenceCode || b.reference_code || "")).toLowerCase();
      const contact = (String(b.contactName || "")).toLowerCase();
      return ref.includes(t) || contact.includes(t);
    });
  }

  return (
    <div className="space-y-6">
      {/* ─── 1. CONTROLS: FILTER PILLS + SEARCH + REFRESH ─── */}
      <div className="flex flex-col justify-between gap-4 rounded-2xl border border-white/10 bg-neutral-900/80 p-4 backdrop-blur-xl shadow-xl md:flex-row md:items-center">
        {/* Filter Pills */}
        <div className="flex flex-wrap gap-1.5">
          {filterOptions.map((opt) => (
            <button
              key={opt.id}
              onClick={() => setFilter(opt.id)}
              className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-all ${
                filter === opt.id
                  ? "bg-amber-400 text-black font-bold shadow-md shadow-amber-400/20"
                  : "bg-black/40 text-neutral-400 hover:text-white border border-white/5"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Search & Refresh */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1 md:w-60">
            <Search className="absolute top-2.5 left-3 h-3.5 w-3.5 text-neutral-500" />
            <input
              type="text"
              placeholder="Search reference #..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-black/60 py-1.5 pr-3 pl-8 text-xs text-white placeholder:text-neutral-500 focus:border-amber-400 focus:outline-none"
            />
          </div>

          <button
            onClick={onRefresh}
            disabled={refreshing}
            className="rounded-xl border border-white/10 bg-black/60 p-2 text-neutral-300 hover:text-white transition-colors"
            title="Refresh Bookings"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin text-amber-400" : ""}`} />
          </button>
        </div>
      </div>

      {/* ─── 2. BOOKINGS ROSTER ─── */}
      {filtered.length === 0 ? (
        <div className="rounded-3xl border border-white/10 bg-neutral-900/40 p-12 text-center text-neutral-500 space-y-3">
          <ShoppingBag className="mx-auto h-8 w-8 text-neutral-600" />
          <p className="text-sm font-mono">No reservations matching current filter criteria.</p>
          <Link
            href="/explore"
            className="inline-flex items-center gap-1.5 rounded-xl bg-amber-400 px-4 py-2 text-xs font-bold text-black hover:bg-amber-300 transition-colors"
          >
            Reserve Equipment Now
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {filtered.map((b) => {
            const ref = b.referenceCode || b.reference_code || b.id;
            const statusClass = STATUS_STYLES[b.status] || "bg-white/5 text-white";
            const currentStepIdx = STEP_ORDER.indexOf(b.status);
            const itemsList = (b.booking_items || b.items || []) as any[];

            return (
              <div
                key={b.id}
                className="dash-card overflow-hidden rounded-3xl border border-white/10 bg-neutral-900/80 shadow-xl backdrop-blur-xl transition-all hover:border-white/20"
              >
                {/* Booking Header */}
                <div className="flex flex-col justify-between gap-3 border-b border-white/10 bg-black/40 p-6 sm:flex-row sm:items-center">
                  <div>
                    <div className="flex items-center gap-3">
                      <h3 className="font-mono text-base font-black text-white">{ref}</h3>
                      <span className={`rounded-full px-3 py-0.5 text-xs font-mono font-bold border ${statusClass}`}>
                        {b.status.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-xs text-neutral-400 font-mono mt-1">
                      Shoot Dates:{" "}
                      <strong className="text-white">
                        {new Date(b.startDate || b.start_date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })} – {new Date(b.endDate || b.end_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                      </strong>
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="font-mono text-lg font-black text-amber-400">
                      ₹{(b.totalPayable || b.total_payable || 0).toLocaleString("en-IN")}
                    </span>

                    {/* QR Code Action */}
                    <button
                      onClick={() => setQrModalBooking(b)}
                      className="flex items-center gap-1 rounded-xl border border-white/10 bg-neutral-800 px-3 py-2 text-xs font-semibold text-neutral-300 hover:text-white"
                      title="View Vault Handover QR Pass"
                    >
                      <QrCode className="h-4 w-4 text-amber-400" />
                      <span className="hidden sm:inline">Pass QR</span>
                    </button>
                  </div>
                </div>

                {/* Timeline Visualizer */}
                <div className="border-b border-white/5 bg-neutral-950/40 p-6">
                  <div className="flex items-center justify-between">
                    {TIMELINE_STEPS.map((step, idx) => {
                      const isPastOrCurrent = currentStepIdx >= idx;
                      const isCurrent = currentStepIdx === idx;

                      return (
                        <div key={step.key} className="flex flex-col items-center text-center flex-1">
                          <div
                            className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-mono font-bold transition-all ${
                              isCurrent
                                ? "bg-amber-400 text-black ring-4 ring-amber-400/20 shadow-lg"
                                : isPastOrCurrent
                                ? "bg-emerald-500 text-black"
                                : "bg-neutral-800 text-neutral-500 border border-white/5"
                            }`}
                          >
                            {isPastOrCurrent ? "✓" : idx + 1}
                          </div>
                          <span
                            className={`mt-2 hidden text-[10px] font-mono leading-tight sm:block ${
                              isCurrent ? "font-bold text-amber-400" : isPastOrCurrent ? "text-neutral-300" : "text-neutral-600"
                            }`}
                          >
                            {step.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Booking Content Body */}
                <div className="p-6 space-y-4">
                  {/* Items List */}
                  <div>
                    <h4 className="text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-400 mb-2">
                      Reserved Cinema Gear:
                    </h4>
                    <div className="space-y-1.5">
                      {itemsList.map((item: any, idx: number) => {
                        const prodName =
                          item.product?.name || item.name || item.productId || "Cinema Camera Package";
                        return (
                          <div
                            key={idx}
                            className="flex items-center justify-between rounded-xl bg-black/40 px-3 py-2 text-xs font-mono"
                          >
                            <span className="text-neutral-200">{prodName}</span>
                            <span className="text-neutral-500">Qty: {item.quantity || 1}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Cancellation Action if Eligible */}
                  {canCancel(b.status) && (
                    <div className="flex justify-end pt-2 border-t border-white/5">
                      <button
                        onClick={() => onCancelBooking(b.id)}
                        disabled={cancellingId === b.id}
                        className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-3.5 py-1.5 text-xs font-bold text-rose-400 hover:bg-rose-500/20 transition-colors"
                      >
                        {cancellingId === b.id ? "Cancelling..." : "Cancel Reservation"}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ─── 3. VAULT QR CODE HANDOVER PASS MODAL ─── */}
      {qrModalBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
          <div className="relative w-full max-w-sm">
            <button
              onClick={() => setQrModalBooking(null)}
              className="absolute -top-10 right-0 text-white hover:text-amber-400 text-xs font-mono"
            >
              [Close ✕]
            </button>
            <BookingQRCode
              referenceCode={qrModalBooking.referenceCode || qrModalBooking.reference_code || qrModalBooking.id}
              customerPhone={qrModalBooking.contactPhone || "+91 96869 09048"}
              pickupOTP={qrModalBooking.pickupOTP || "1358"}
            />
          </div>
        </div>
      )}
    </div>
  );
}
