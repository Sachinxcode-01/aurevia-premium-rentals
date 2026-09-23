import { Metadata } from "next";
import { Suspense } from "react";
import PackagesClient from "./PackagesClient";
import { Sparkles, Shield, Clock, Film } from "lucide-react";

export const metadata: Metadata = {
  title: "Production Kits & Cinema Packages | Tiered Multi-Day Rates | AUREVIA",
  description:
    "Explore curated cinema camera packages and modular custom rig builder with industry-standard tiered multi-day discounts (Weekend 2-day rate, 1-Week 4-day rate, Monthly 12-day rate).",
  keywords: [
    "cinema camera packages",
    "ARRI Alexa Mini LF rental kit",
    "RED V-Raptor package rental",
    "Sony FX6 documentary kit",
    "tiered camera rental pricing",
    "weekend camera rental discount",
    "weekly camera package rental",
    "film production equipment packages",
  ],
  openGraph: {
    title: "Production Kits & Packages with Tiered Multi-Day Rates | AUREVIA",
    description:
      "Save up to 60% with AUREVIA's curated cinema production kits and tiered multi-day rate schedule.",
    type: "website",
  },
};

export default function ProductionPackagesPage() {
  return (
    <main className="min-h-screen bg-black pt-28 pb-20 text-white">
      {/* Background Ambient Glow */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute -top-40 right-1/4 h-96 w-96 rounded-full bg-amber-500/10 blur-[130px]" />
        <div className="absolute top-1/2 left-1/4 h-96 w-96 rounded-full bg-cyan-500/10 blur-[150px]" />
      </div>

      <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
        {/* ─── HEADER & VALUE PROPOSITION ─── */}
        <div className="mb-10 text-center max-w-4xl mx-auto">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-gold-champagne/30 bg-gold-champagne/10 px-3.5 py-1 text-xs font-mono font-medium text-gold-champagne">
            <Sparkles className="h-3.5 w-3.5 text-gold-champagne" />
            <span>Complete Production Packages &amp; Multi-Day Rates</span>
          </div>

          <h1 className="text-3xl font-black tracking-tight text-ivory sm:text-5xl lg:text-6xl">
            Pre-Packaged <span className="bg-linear-to-r from-gold-champagne via-amber-300 to-gold-warm bg-clip-text text-transparent">Cinema Rigs</span> &amp; Tiered Rates
          </h1>

          <p className="mt-4 text-sm text-muted-gray sm:text-base leading-relaxed">
            Eliminate equipment incompatibility on set. Rent fully-rigged camera systems in certified Pelican flight cases with automated multi-day discounts: <strong className="text-ivory">Weekend Special (3 Days = 2-Day Rate)</strong>, <strong className="text-ivory">1-Week Tier (7 Days = 4-Day Rate)</strong>, and <strong className="text-ivory">Monthly Feature Tier (30 Days = 12-Day Rate)</strong>.
          </p>

          {/* Quick Value Metrics */}
          <div className="mt-6 flex flex-wrap justify-center items-center gap-6 text-xs text-muted-gray font-mono">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-emerald-400" />
              <span className="text-ivory/90">Pelican Flight-Case Verified</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-gold-champagne" />
              <span className="text-ivory/90">15% - 60% Multi-Day Savings</span>
            </div>
            <div className="flex items-center gap-2">
              <Film className="h-4 w-4 text-gold-champagne" />
              <span className="text-ivory/90">Full Cine Accessories Included</span>
            </div>
          </div>
        </div>

        {/* ─── PACKAGES WORKSTATION COMPONENT ─── */}
        <Suspense
          fallback={
            <div className="flex h-96 w-full items-center justify-center rounded-2xl border border-white/10 bg-neutral-900/50">
              <div className="text-center font-mono text-sm text-neutral-400">
                <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-amber-400 border-t-transparent" />
                Loading Production Packages &amp; Pricing Engine...
              </div>
            </div>
          }
        >
          <PackagesClient />
        </Suspense>
      </div>
    </main>
  );
}
