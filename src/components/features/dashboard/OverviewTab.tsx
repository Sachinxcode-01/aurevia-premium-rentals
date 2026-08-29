"use client";

import React, { useState } from "react";
import Link from "next/link";
import { DashTab, STATUS_STYLES } from "./DashboardTypes";
import {
  TrendingUp,
  ShoppingBag,
  Calendar,
  Gift,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Copy,
  Check,
  Film,
  Sliders,
  CreditCard,
} from "lucide-react";

interface OverviewTabProps {
  stats: {
    upcoming: number;
    active: number;
    completed: number;
    cancelled: number;
  };
  bookings: any[];
  onNavigateTab: (tab: DashTab) => void;
  referrals: any[];
  totalRewardEarned: number;
  pendingReward: number;
  onClaimReward: (referralId: string) => Promise<void>;
  claimingRewardId: string | null;
  claimedCoupons: Record<string, string>;
  originUrl: string;
}

export default function OverviewTab({
  stats,
  bookings,
  onNavigateTab,
  referrals,
  totalRewardEarned,
  pendingReward,
  onClaimReward,
  claimingRewardId,
  claimedCoupons,
  originUrl,
}: OverviewTabProps) {
  const [copiedRef, setCopiedRef] = useState(false);

  const referralCode = "AUREVIA-REF-PREM";
  const referralShareUrl = `${originUrl}/booking?ref=${referralCode}`;

  const handleCopyReferral = () => {
    navigator.clipboard.writeText(referralShareUrl);
    setCopiedRef(true);
    setTimeout(() => setCopiedRef(false), 2500);
  };

  const activeOrUpcoming = bookings
    .filter((b) =>
      [
        "rented",
        "overdue",
        "ready_for_pickup",
        "approved",
        "paid",
        "approval_pending",
      ].includes(b.status)
    )
    .slice(0, 3);

  return (
    <div className="space-y-8">
      {/* ─── 1. TELEMETRY STAT CARDS ─── */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 font-mono">
        <div className="dash-card rounded-2xl border border-white/10 bg-neutral-900/80 p-5 shadow-xl">
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-[10px] uppercase tracking-wider">Active Rentals</span>
            <TrendingUp className="h-4 w-4 text-emerald-400" />
          </div>
          <p className="mt-2 text-2xl font-black text-white">{stats.active}</p>
          <span className="text-[10px] text-emerald-400 font-semibold">Currently on shoot</span>
        </div>

        <div className="dash-card rounded-2xl border border-white/10 bg-neutral-900/80 p-5 shadow-xl">
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-[10px] uppercase tracking-wider">Upcoming Shoots</span>
            <Calendar className="h-4 w-4 text-amber-400" />
          </div>
          <p className="mt-2 text-2xl font-black text-white">{stats.upcoming}</p>
          <span className="text-[10px] text-amber-300 font-semibold">Reserved in vault</span>
        </div>

        <div className="dash-card rounded-2xl border border-white/10 bg-neutral-900/80 p-5 shadow-xl">
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-[10px] uppercase tracking-wider">Completed</span>
            <CheckCircle2 className="h-4 w-4 text-cyan-400" />
          </div>
          <p className="mt-2 text-2xl font-black text-white">{stats.completed}</p>
          <span className="text-[10px] text-neutral-400">Inspected &amp; returned</span>
        </div>

        <div className="dash-card rounded-2xl border border-amber-400/30 bg-amber-400/10 p-5 shadow-xl">
          <div className="flex items-center justify-between text-amber-400">
            <span className="text-[10px] uppercase tracking-wider">Rental Credits</span>
            <Gift className="h-4 w-4" />
          </div>
          <p className="mt-2 text-2xl font-black text-white">₹{totalRewardEarned.toLocaleString("en-IN")}</p>
          <span className="text-[10px] text-amber-300 font-semibold">
            {pendingReward > 0 ? `+₹${pendingReward} pending` : "Available to apply"}
          </span>
        </div>
      </div>

      {/* ─── 2. VIRAL REFERRAL & REWARDS TERMINAL ─── */}
      <div className="dash-card rounded-3xl border border-amber-500/30 bg-gradient-to-br from-amber-950/40 via-neutral-900/90 to-black p-6 shadow-2xl backdrop-blur-xl">
        <div className="flex flex-col justify-between gap-4 border-b border-white/10 pb-5 md:flex-row md:items-center">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-widest text-amber-400">
              <Sparkles className="h-4 w-4" />
              Creator Referral Program
            </div>
            <h3 className="mt-1 text-xl font-black text-white">
              Earn ₹500 Rental Credits on Every Referral
            </h3>
            <p className="text-xs text-neutral-400 mt-0.5">
              Your filmmaker friend gets <strong className="text-white">₹200 instant discount</strong>, and you earn <strong className="text-amber-300">₹500 rental credit</strong> when their shoot starts!
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyReferral}
              className="flex items-center gap-2 rounded-xl bg-amber-400 px-4 py-2.5 text-xs font-bold text-black transition-transform hover:scale-105 shadow-lg shadow-amber-400/20"
            >
              {copiedRef ? (
                <>
                  <Check className="h-4 w-4" />
                  Link Copied!
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  Copy Share Link
                </>
              )}
            </button>
          </div>
        </div>

        {/* Referred Creators Table / Status */}
        <div className="mt-5">
          <h4 className="text-xs font-mono font-bold uppercase text-neutral-400 mb-3">
            Referred Creators Roster ({referrals.length})
          </h4>
          {referrals.length === 0 ? (
            <p className="text-xs text-neutral-500 italic">
              Share your link with cinematographers and directors to start racking up equipment credits.
            </p>
          ) : (
            <div className="space-y-2">
              {referrals.slice(0, 3).map((ref) => (
                <div
                  key={ref.id}
                  className="flex items-center justify-between rounded-xl border border-white/5 bg-black/40 p-3 text-xs"
                >
                  <div>
                    <span className="font-bold text-white block">{ref.referredName || "Fellow Filmmaker"}</span>
                    <span className="text-[10px] text-neutral-500 font-mono">
                      Status: <strong className="text-amber-400 uppercase">{ref.status}</strong>
                    </span>
                  </div>

                  <div>
                    {ref.status === "rewarded" && (
                      <button
                        onClick={() => onClaimReward(ref.id)}
                        disabled={claimingRewardId === ref.id || Boolean(claimedCoupons[ref.id])}
                        className="rounded-lg bg-emerald-500/20 border border-emerald-500/40 px-3 py-1 text-[11px] font-bold text-emerald-300 hover:bg-emerald-500/30 transition-colors"
                      >
                        {claimedCoupons[ref.id]
                          ? `Code: ${claimedCoupons[ref.id]}`
                          : claimingRewardId === ref.id
                          ? "Claiming..."
                          : "Claim ₹500 Coupon"}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ─── 3. QUICK PRO TOOLS LAUNCHPAD ─── */}
      <div>
        <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-amber-400 mb-4">
          Pre-Production Suite &amp; Pro Tools
        </h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Link
            href="/explore"
            className="group flex flex-col justify-between rounded-2xl border border-white/10 bg-neutral-900/80 p-5 backdrop-blur-xl shadow-xl transition-all hover:border-amber-400/40"
          >
            <div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-400/10 text-amber-400 mb-3 border border-amber-400/20">
                <ShoppingBag className="h-5 w-5" />
              </div>
              <h4 className="font-bold text-white group-hover:text-amber-300 transition-colors">
                Browse Camera Vault
              </h4>
              <p className="text-xs text-neutral-400 mt-1">
                Explore ARRI, RED, Sony bodies and master cinema glass.
              </p>
            </div>
            <span className="mt-4 flex items-center gap-1 text-xs font-mono text-amber-400">
              Explore Fleet <ArrowRight className="h-3.5 w-3.5" />
            </span>
          </Link>

          <Link
            href="/packages"
            className="group flex flex-col justify-between rounded-2xl border border-white/10 bg-neutral-900/80 p-5 backdrop-blur-xl shadow-xl transition-all hover:border-cyan-400/40"
          >
            <div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-400/10 text-cyan-400 mb-3 border border-cyan-400/20">
                <Sliders className="h-5 w-5" />
              </div>
              <h4 className="font-bold text-white group-hover:text-cyan-300 transition-colors">
                Production Kit Builder
              </h4>
              <p className="text-xs text-neutral-400 mt-1">
                Curated cinema rigs with tiered weekend &amp; weekly rates.
              </p>
            </div>
            <span className="mt-4 flex items-center gap-1 text-xs font-mono text-cyan-400">
              Build Rig <ArrowRight className="h-3.5 w-3.5" />
            </span>
          </Link>

          <Link
            href="/tools/sensor-simulator"
            className="group flex flex-col justify-between rounded-2xl border border-white/10 bg-neutral-900/80 p-5 backdrop-blur-xl shadow-xl transition-all hover:border-emerald-400/40"
          >
            <div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-400/10 text-emerald-400 mb-3 border border-emerald-400/20">
                <Film className="h-5 w-5" />
              </div>
              <h4 className="font-bold text-white group-hover:text-emerald-300 transition-colors">
                Optical FOV Simulator
              </h4>
              <p className="text-xs text-neutral-400 mt-1">
                Simulate anamorphic de-squeeze, sensor crop, and DoF.
              </p>
            </div>
            <span className="mt-4 flex items-center gap-1 text-xs font-mono text-emerald-400">
              Launch Simulator <ArrowRight className="h-3.5 w-3.5" />
            </span>
          </Link>
        </div>
      </div>

      {/* ─── 4. ACTIVE & UPCOMING BOOKINGS ─── */}
      <div className="rounded-3xl border border-white/10 bg-neutral-900/80 p-6 backdrop-blur-xl shadow-xl">
        <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <ShoppingBag className="h-4 w-4 text-amber-400" />
            Active &amp; Upcoming Reservations
          </h3>
          <button
            onClick={() => onNavigateTab("bookings")}
            className="text-xs font-mono text-amber-400 hover:text-amber-300 flex items-center gap-1"
          >
            View All ({bookings.length}) <ArrowRight className="h-3 w-3" />
          </button>
        </div>

        {activeOrUpcoming.length === 0 ? (
          <div className="text-center py-8 text-neutral-500 text-xs">
            No active shoot reservations currently underway.
          </div>
        ) : (
          <div className="space-y-3">
            {activeOrUpcoming.map((b) => {
              const ref = b.referenceCode || b.reference_code || b.id;
              const statusClass = STATUS_STYLES[b.status] || "bg-white/5 text-white";
              return (
                <div
                  key={b.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-white/5 bg-black/40 p-4 transition-all hover:border-white/20"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-white">{ref}</span>
                      <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-mono font-bold border ${statusClass}`}>
                        {b.status.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-xs text-neutral-400 mt-1 font-mono">
                      {new Date(b.startDate || b.start_date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })} – {new Date(b.endDate || b.end_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="font-mono text-sm font-bold text-amber-400">
                      ₹{(b.totalPayable || b.total_payable || 0).toLocaleString("en-IN")}
                    </span>
                    <button
                      onClick={() => onNavigateTab("bookings")}
                      className="rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-neutral-300 hover:text-white"
                    >
                      Inspect Booking
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
