"use client";

import { useState } from "react";
import {
  getTierMultiplier,
  POPULAR_DURATION_TIERS,
} from "@/lib/utils/tiered-pricing-calculator";
import { Calendar, Percent, Sparkles, CheckCircle2, ShieldCheck } from "lucide-react";

export default function TieredPricingSchedule() {
  const [sampleDailyRate, setSampleDailyRate] = useState<number>(10000);

  const testDays = [1, 2, 3, 5, 7, 14, 30];

  return (
    <div className="rounded-3xl border border-white/10 bg-neutral-900/80 p-8 backdrop-blur-xl shadow-2xl space-y-8">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 border-b border-white/10 pb-6 md:flex-row md:items-end">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-widest text-amber-400">
            <Calendar className="h-4 w-4" />
            Cinema Rental Industry Standard Rules
          </div>
          <h2 className="mt-1 text-2xl font-black text-white sm:text-3xl">
            Tiered Multi-Day Rate Schedule
          </h2>
          <p className="mt-1 text-xs text-neutral-400 max-w-2xl">
            AUREVIA operates on transparent multi-day cinema tiers designed for commercial productions and feature film principal photography schedules.
          </p>
        </div>

        {/* Interactive Rate Tester */}
        <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-black/60 p-3">
          <span className="text-xs font-mono text-neutral-400">Sample Rate:</span>
          <div className="flex items-center gap-1 font-mono">
            <span className="text-amber-400 font-bold">₹</span>
            <input
              type="number"
              min={1000}
              max={100000}
              step={1000}
              value={sampleDailyRate}
              onChange={(e) => setSampleDailyRate(Number(e.target.value) || 1000)}
              className="w-24 rounded bg-neutral-900 px-2 py-1 text-sm font-bold text-white outline-none border border-white/10 focus:border-amber-400"
            />
            <span className="text-[10px] text-neutral-500">/day</span>
          </div>
        </div>
      </div>

      {/* Comparison Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left font-mono text-xs">
          <thead>
            <tr className="border-b border-white/10 text-neutral-400 uppercase text-[10px] tracking-wider">
              <th className="pb-3 font-bold">Duration</th>
              <th className="pb-3 font-bold">Billing Tier Name</th>
              <th className="pb-3 font-bold">Rate Multiplier</th>
              <th className="pb-3 font-bold">Total Package Fee</th>
              <th className="pb-3 font-bold">A La Carte Full Total</th>
              <th className="pb-3 font-bold text-right">Production Savings</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {testDays.map((days) => {
              const { multiplier, tierName, tierBadge, daysFree } = getTierMultiplier(days);
              const tieredTotal = Math.round(sampleDailyRate * multiplier);
              const unbundledTotal = sampleDailyRate * days;
              const savings = unbundledTotal - tieredTotal;
              const savingsPct = Math.round((savings / unbundledTotal) * 100);

              const isHighlight = days === 3 || days === 7 || days === 30;

              return (
                <tr
                  key={days}
                  className={`transition-colors ${
                    isHighlight
                      ? "bg-amber-400/5 hover:bg-amber-400/10"
                      : "hover:bg-white/5"
                  }`}
                >
                  <td className="py-3.5 font-bold text-white">
                    {days} {days === 1 ? "Day" : "Days"}
                  </td>
                  <td className="py-3.5">
                    <span className="font-semibold text-neutral-200">{tierName}</span>
                    {tierBadge && (
                      <span className="ml-2 inline-block rounded bg-amber-400/20 px-1.5 py-0.5 text-[9px] font-bold text-amber-300 border border-amber-400/30">
                        {tierBadge}
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 text-neutral-300 font-bold">
                    {multiplier}x <span className="text-neutral-500 font-normal">({daysFree > 0 ? `${daysFree}d free` : "standard"})</span>
                  </td>
                  <td className="py-3.5 text-base font-black text-amber-400">
                    ₹{tieredTotal.toLocaleString("en-IN")}
                  </td>
                  <td className="py-3.5 text-neutral-500 line-through">
                    ₹{unbundledTotal.toLocaleString("en-IN")}
                  </td>
                  <td className="py-3.5 text-right font-bold text-emerald-400">
                    {savings > 0 ? (
                      <span className="rounded bg-emerald-500/10 px-2 py-1 border border-emerald-500/20">
                        Save ₹{savings.toLocaleString("en-IN")} ({savingsPct}%)
                      </span>
                    ) : (
                      <span className="text-neutral-500 font-normal">Base Rate</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* 3 Core Production Rules Badges */}
      <div className="grid grid-cols-1 gap-4 pt-4 md:grid-cols-3">
        <div className="rounded-2xl border border-white/5 bg-black/40 p-5 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase font-mono">
            <Sparkles className="h-4 w-4" />
            Weekend Special
          </div>
          <h4 className="text-sm font-bold text-white">Pickup Friday, Return Monday</h4>
          <p className="text-xs text-neutral-400 leading-relaxed">
            Pickup after 2:00 PM on Friday and return before 11:00 AM on Monday. Billed as 2 days only (Sunday is completely on the house).
          </p>
        </div>

        <div className="rounded-2xl border border-white/5 bg-black/40 p-5 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase font-mono">
            <CheckCircle2 className="h-4 w-4" />
            1-Week Production Tier
          </div>
          <h4 className="text-sm font-bold text-white">7 Full Days = 4-Day Rate</h4>
          <p className="text-xs text-neutral-400 leading-relaxed">
            Shoot for a full 7-day week and only pay for 4 days. Enjoy 3 free production days automatically at checkout.
          </p>
        </div>

        <div className="rounded-2xl border border-white/5 bg-black/40 p-5 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-cyan-400 uppercase font-mono">
            <ShieldCheck className="h-4 w-4" />
            Monthly Feature Film
          </div>
          <h4 className="text-sm font-bold text-white">30 Days = 12-Day Rate</h4>
          <p className="text-xs text-neutral-400 leading-relaxed">
            For long-form narrative features and television series, 30 days is billed at a 60% discount with dedicated backup body support.
          </p>
        </div>
      </div>
    </div>
  );
}
