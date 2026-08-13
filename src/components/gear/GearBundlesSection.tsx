"use client";

import { useEffect, useState } from "react";
import { Package, Sparkles, CheckCircle2, ShieldCheck } from "lucide-react";
import { GearBundle, fetchGearBundles } from "@/lib/services/gearBundleService";
import MagneticButton from "@/components/motion/MagneticButton";

interface GearBundlesSectionProps {
  onSelectBundle?: (bundle: GearBundle) => void;
}

export default function GearBundlesSection({ onSelectBundle }: GearBundlesSectionProps) {
  const [bundles, setBundles] = useState<GearBundle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGearBundles().then((data) => {
      setBundles(data);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="py-12 text-center text-amber-100/50 animate-pulse">
        Loading curated cinema gear bundles...
      </div>
    );
  }

  return (
    <section className="my-16 px-4 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 border-b border-amber-500/20 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            Curated Production Packages
          </div>
          <h2 className="text-3xl md:text-4xl font-serif font-light tracking-wide text-amber-50">
            Turnkey <span className="italic text-amber-300">Gear Rigs & Bundles</span>
          </h2>
        </div>
        <p className="text-sm text-neutral-400 max-w-md mt-3 md:mt-0">
          Save up to 20% with all-inclusive camera, optics, lighting, and audio packages optimized for professional production workflows.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {bundles.map((bundle) => (
          <div
            key={bundle.id}
            className="group relative flex flex-col justify-between rounded-2xl bg-neutral-900/80 border border-amber-500/20 hover:border-amber-400/50 p-6 transition-all duration-300 hover:shadow-2xl hover:shadow-amber-500/10 backdrop-blur-xl overflow-hidden"
          >
            {/* Top Accent Gradient & Badge */}
            <div className="absolute inset-x-0 top-0 h-1 bg-linear-to-r from-transparent via-amber-400 to-transparent opacity-50 group-hover:opacity-100 transition-opacity" />
            
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  {bundle.badge}
                </span>
                <span className="text-xs text-amber-400/80 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> Tested & Calibrated
                </span>
              </div>

              <h3 className="text-xl font-serif text-amber-100 group-hover:text-amber-300 transition-colors mb-2">
                {bundle.name}
              </h3>
              <p className="text-xs text-amber-200/70 italic mb-4 font-sans">
                &ldquo;{bundle.tagline}&rdquo;
              </p>

              <p className="text-xs text-neutral-300/80 mb-6 leading-relaxed">
                {bundle.description}
              </p>

              {/* Package Content List */}
              <div className="space-y-2 mb-6 pt-4 border-t border-white/5">
                <p className="text-[11px] uppercase tracking-wider text-neutral-400 font-semibold mb-2">
                  Included Equipment ({bundle.items.length} items):
                </p>
                {bundle.items.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs text-neutral-200">
                    <span className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span>{item.name}</span>
                    </span>
                    <span className="text-[11px] text-amber-400/70 font-mono">
                      x{item.quantity}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Price & Action Footer */}
            <div className="pt-6 border-t border-white/10 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-neutral-400 line-through font-mono">
                    ₹{bundle.originalDailyTotal.toLocaleString()}/day
                  </span>
                  <span className="text-xs font-bold text-emerald-400">
                    -{bundle.discountPercentage}%
                  </span>
                </div>
                <div className="text-2xl font-bold font-mono text-amber-300">
                  ₹{bundle.discountedDailyTotal.toLocaleString()}
                  <span className="text-xs font-normal text-neutral-400 font-sans">/day</span>
                </div>
              </div>

              <MagneticButton>
                <button
                  onClick={() => onSelectBundle && onSelectBundle(bundle)}
                  className="px-4 py-2.5 rounded-xl bg-linear-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-neutral-950 font-semibold text-xs transition-all shadow-lg shadow-amber-500/20 flex items-center gap-2"
                >
                  <Package className="w-4 h-4" />
                  Select Bundle
                </button>
              </MagneticButton>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
