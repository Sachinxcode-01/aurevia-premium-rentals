"use client";

import React, { useEffect, useState, useTransition } from "react";
import { Sparkles, Copy, Check, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/useToast";

interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  totalMs: number;
  isExpired: boolean;
}

interface PromoData {
  title: string;
  subtitle: string;
  couponCode: string;
  discountNote: string;
  deadlineIso: string;
}

export default function PromotionalDeadlineTimer() {
  const toast = useToast();
  const [, startTransition] = useTransition();

  const [promo, setPromo] = useState<PromoData>({
    title: "LIMITED PRODUCTION PASS",
    subtitle: "Unlock 20% savings on all flagship cinema packages before current reservation cycle closes.",
    couponCode: "WELCOME20",
    discountNote: "20% OFF ALL CAMERAS",
    deadlineIso: "",
  });

  const [copied, setCopied] = useState(false);
  const [time, setTime] = useState<TimeRemaining | null>(null);
  const [hasWarnedExpiring, setHasWarnedExpiring] = useState(false);

  // Synchronize deadline from database settings or active coupons
  useEffect(() => {
    let isMounted = true;
    async function loadPromoConfig() {
      try {
        const { db } = await import("@/lib/db/store");
        const [deadlineSetting, titleSetting, couponSetting] = await Promise.all([
          db.getWebsiteSetting("promo_deadline_iso").catch(() => null),
          db.getWebsiteSetting("promo_banner_title").catch(() => null),
          db.getWebsiteSetting("promo_coupon_code").catch(() => null),
        ]);

        if (!isMounted) return;

        let resolvedDeadline = deadlineSetting;
        if (!resolvedDeadline) {
          // Fetch from active coupons
          const coupons = await db.getCoupons();
          const targetCoupon = coupons.find((c: any) => c.code === "WELCOME20" || c.code === "PREM15" || c.isActive);
          if (targetCoupon && (targetCoupon as any).valid_until) {
            resolvedDeadline = (targetCoupon as any).valid_until;
          } else {
            // Default to end of current week midnight in Asia/Kolkata
            const target = new Date();
            target.setHours(23, 59, 59, 999);
            target.setDate(target.getDate() + 1);
            resolvedDeadline = target.toISOString();
          }
        }

        setPromo((prev) => ({
          ...prev,
          deadlineIso: resolvedDeadline || prev.deadlineIso,
          title: titleSetting || prev.title,
          couponCode: couponSetting || prev.couponCode,
        }));
      } catch {
        // Fallback to default state
      }
    }
    loadPromoConfig();
    return () => {
      isMounted = false;
    };
  }, []);

  // Ticker loop
  useEffect(() => {
    if (!promo.deadlineIso) return;

    function calculateRemaining(): TimeRemaining {
      const targetTime = new Date(promo.deadlineIso).getTime();
      const now = Date.now();
      const diff = targetTime - now;

      if (diff <= 0) {
        return {
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          totalMs: 0,
          isExpired: true,
        };
      }

      const seconds = Math.floor((diff / 1000) % 60);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));

      return {
        days,
        hours,
        minutes,
        seconds,
        totalMs: diff,
        isExpired: false,
      };
    }

    const initial = calculateRemaining();
    setTime(initial);

    const timer = setInterval(() => {
      const next = calculateRemaining();
      setTime(next);

      // Trigger one-time toast warning when less than 30 minutes remain
      if (!hasWarnedExpiring && next.totalMs > 0 && next.totalMs < 30 * 60 * 1000) {
        setHasWarnedExpiring(true);
        toast.info("Production pass deadline is closing in under 30 minutes.");
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [promo.deadlineIso, hasWarnedExpiring, toast]);

  const handleCopyCoupon = () => {
    navigator.clipboard.writeText(promo.couponCode);
    setCopied(true);
    startTransition(() => {
      toast.success(`Coupon code ${promo.couponCode} copied! Apply at checkout for discount.`);
    });
    setTimeout(() => setCopied(false), 2500);
  };

  if (!time) {
    return null;
  }

  return (
    <section className="relative z-20 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 -mt-6 mb-12">
      <div className="relative overflow-hidden rounded-2xl border border-gold-champagne/30 bg-linear-to-r from-obsidian via-[#141416] to-obsidian p-5 sm:p-6 shadow-2xl backdrop-blur-xl">
        {/* Subtle Ambient Glow */}
        <div className="absolute -top-12 -left-12 h-40 w-40 rounded-full bg-gold-champagne/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 -right-12 h-40 w-40 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row items-center justify-between gap-6 relative z-10">
          {/* Headline & Description */}
          <div className="space-y-1.5 text-center lg:text-left max-w-xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-gold-champagne/40 bg-gold-champagne/10 px-3 py-0.5 text-[10px] font-mono uppercase tracking-widest text-gold-champagne">
              <Sparkles size={11} className="animate-pulse" />
              <span>{promo.title}</span>
            </div>
            <h3 className="text-sm sm:text-base font-serif text-ivory tracking-wide">
              {time.isExpired ? "Current Promotional Window Concluded" : promo.subtitle}
            </h3>
          </div>

          {/* Countdown Clock or Expired State */}
          {time.isExpired ? (
            <div className="flex items-center gap-2 text-xs font-mono text-muted-gray bg-charcoal/40 px-4 py-2.5 rounded-xl border border-white/5">
              <AlertCircle size={14} className="text-amber-400" />
              <span>Standard Concierge Reservations Available</span>
            </div>
          ) : (
            <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
              {time.days > 0 && (
                <>
                  <div className="flex flex-col items-center bg-black/60 border border-white/10 rounded-xl px-3 py-2 min-w-14">
                    <span className="font-mono text-lg sm:text-xl font-bold text-ivory">
                      {String(time.days).padStart(2, "0")}
                    </span>
                    <span className="text-[9px] uppercase tracking-wider text-muted-gray font-mono">Days</span>
                  </div>
                  <span className="text-gold-champagne font-bold text-lg">:</span>
                </>
              )}

              <div className="flex flex-col items-center bg-black/60 border border-white/10 rounded-xl px-3 py-2 min-w-14">
                <span className="font-mono text-lg sm:text-xl font-bold text-gold-champagne">
                  {String(time.hours).padStart(2, "0")}
                </span>
                <span className="text-[9px] uppercase tracking-wider text-muted-gray font-mono">Hours</span>
              </div>

              <span className="text-gold-champagne font-bold text-lg">:</span>

              <div className="flex flex-col items-center bg-black/60 border border-white/10 rounded-xl px-3 py-2 min-w-14">
                <span className="font-mono text-lg sm:text-xl font-bold text-gold-champagne">
                  {String(time.minutes).padStart(2, "0")}
                </span>
                <span className="text-[9px] uppercase tracking-wider text-muted-gray font-mono">Mins</span>
              </div>

              <span className="text-gold-champagne font-bold text-lg">:</span>

              <div className="flex flex-col items-center bg-black/60 border border-white/10 rounded-xl px-3 py-2 min-w-14">
                <span className="font-mono text-lg sm:text-xl font-bold text-amber-400">
                  {String(time.seconds).padStart(2, "0")}
                </span>
                <span className="text-[9px] uppercase tracking-wider text-muted-gray font-mono">Secs</span>
              </div>
            </div>
          )}

          {/* Quick Copy Coupon Action */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="flex items-center gap-2 bg-charcoal/80 border border-gold-champagne/40 rounded-xl px-3.5 py-2">
              <div className="flex flex-col text-left">
                <span className="text-[8px] font-mono uppercase tracking-widest text-muted-gray">PROMO CODE</span>
                <span className="font-mono text-xs font-bold text-gold-champagne">{promo.couponCode}</span>
              </div>
              <button
                type="button"
                onClick={handleCopyCoupon}
                className="ml-1 p-1.5 rounded-lg bg-gold-champagne/10 text-gold-champagne hover:bg-gold-champagne hover:text-obsidian transition cursor-pointer"
                title="Copy coupon code"
                aria-label="Copy promotional coupon code"
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
