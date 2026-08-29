"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  MODULAR_COMPONENTS,
  ModularRigComponent,
} from "@/lib/data/production-packages-data";
import {
  calculatePackagePricing,
  POPULAR_DURATION_TIERS,
} from "@/lib/utils/tiered-pricing-calculator";
import { useCart } from "@/hooks/useCart";
import { useToast } from "@/hooks/useToast";
import {
  Camera,
  Sliders,
  Sparkles,
  ShoppingBag,
  Zap,
  Weight,
  Layers,
  CheckCircle2,
  Tv,
  Film,
  BatteryCharging,
  Disc,
} from "lucide-react";

export default function CustomRigConfigurator() {
  const router = useRouter();
  const { addToCart } = useCart();
  const toast = useToast();

  // Filter components by department
  const bodies = useMemo(
    () => MODULAR_COMPONENTS.filter((c) => c.department === "body"),
    []
  );
  const optics = useMemo(
    () => MODULAR_COMPONENTS.filter((c) => c.department === "optics"),
    []
  );
  const monitoring = useMemo(
    () => MODULAR_COMPONENTS.filter((c) => c.department === "monitoring"),
    []
  );
  const support = useMemo(
    () => MODULAR_COMPONENTS.filter((c) => c.department === "support"),
    []
  );
  const power = useMemo(
    () => MODULAR_COMPONENTS.filter((c) => c.department === "power"),
    []
  );

  // Selected State
  const [selectedBody, setSelectedBody] = useState<ModularRigComponent>(bodies[0]);
  const [selectedOptics, setSelectedOptics] = useState<ModularRigComponent>(optics[0]);
  const [selectedMonitoring, setSelectedMonitoring] = useState<ModularRigComponent | null>(monitoring[0]);
  const [selectedSupport, setSelectedSupport] = useState<ModularRigComponent | null>(support[0]);
  const [selectedPower, setSelectedPower] = useState<ModularRigComponent | null>(power[0]);

  // Duration
  const [durationDays, setDurationDays] = useState<number>(3); // Default weekend special

  // Calculations
  const rawUnbundledDaily =
    selectedBody.dailyPrice +
    selectedOptics.dailyPrice +
    (selectedMonitoring?.dailyPrice || 0) +
    (selectedSupport?.dailyPrice || 0) +
    (selectedPower?.dailyPrice || 0);

  const totalWeightKg = Number(
    (
      selectedBody.weightKg +
      selectedOptics.weightKg +
      (selectedMonitoring?.weightKg || 0) +
      (selectedSupport?.weightKg || 0) +
      (selectedPower?.weightKg || 0)
    ).toFixed(1)
  );

  const totalPowerDrawWatts =
    selectedBody.powerDrawWatts +
    (selectedMonitoring?.powerDrawWatts || 0) +
    (selectedSupport?.powerDrawWatts || 0);

  // Apply custom rig 15% bundle discount + multi-day tiering
  const pricing = useMemo(() => {
    return calculatePackagePricing(rawUnbundledDaily, 15, durationDays);
  }, [rawUnbundledDaily, durationDays]);

  const handleAddCustomRigToCart = () => {
    const includedList = [
      selectedBody.name,
      selectedOptics.name,
      ...(selectedMonitoring ? [selectedMonitoring.name] : []),
      ...(selectedSupport ? [selectedSupport.name] : []),
      ...(selectedPower ? [selectedPower.name] : []),
    ];

    const packageName = `Custom Cinema Kit (${selectedBody.brand} + ${selectedOptics.brand})`;
    const today = new Date();
    const startDateStr = today.toISOString().split("T")[0];
    const endDate = new Date(today.getTime() + (durationDays - 1) * 86400000);
    const endDateStr = endDate.toISOString().split("T")[0];

    const productObj = {
      id: `custom-kit-${Date.now()}`,
      slug: "custom-production-kit",
      name: packageName,
      category: "Custom Cinema Packages",
      brand: "AUREVIA Modular Rig",
      dailyPrice: pricing.effectiveDailyCost,
      weeklyPrice: pricing.totalPackageFee,
      depositAmount: 8000,
      images: [selectedBody.image],
      availableQuantity: 3,
      rating: 5.0,
      reviewCount: 34,
      specs: {
        "Rig Weight": `${totalWeightKg} kg`,
        "Power Draw": `${totalPowerDrawWatts}W`,
        "Duration Tier": pricing.tierName,
        "Bundle Discount": `15% + Multi-Day (${pricing.discountPercentage}% total savings)`,
      },
      includedItems: includedList,
      description: `Custom assembled cinema production kit with active multi-day package discount.`,
      isFeatured: true,
      inStock: true,
    } as any;

    addToCart(productObj, 1, startDateStr, endDateStr, []);
    toast?.success
      ? toast.success(`Added ${packageName} to Cart!`)
      : null;

    router.push("/booking");
  };

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
      {/* ─── LEFT: 5-STEP MODULAR RIG BUILDER (8 COLS) ─── */}
      <div className="space-y-8 lg:col-span-8">
        {/* Step 1: Camera Body */}
        <div className="rounded-2xl border border-white/10 bg-neutral-900/80 p-6 backdrop-blur-xl shadow-xl">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-amber-400">
              <Camera className="h-4 w-4" />
              Step 1: Choose Camera Body
            </h3>
            <span className="text-xs text-neutral-400 font-mono">
              Selected: <strong className="text-white">{selectedBody.name}</strong>
            </span>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {bodies.map((body) => {
              const isSelected = selectedBody.id === body.id;
              return (
                <button
                  key={body.id}
                  onClick={() => setSelectedBody(body)}
                  className={`flex flex-col justify-between rounded-xl p-3 text-left transition-all ${
                    isSelected
                      ? "border-amber-400 bg-amber-400/10 text-white ring-1 ring-amber-400/50"
                      : "border border-white/5 bg-black/40 text-neutral-400 hover:border-white/20 hover:text-white"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between text-[10px] uppercase font-bold text-neutral-500">
                      <span>{body.brand}</span>
                      {body.badge && <span className="text-amber-400">{body.badge}</span>}
                    </div>
                    <h4 className="mt-1 text-xs font-bold text-white line-clamp-1">{body.name}</h4>
                    <p className="mt-1 text-[10px] text-neutral-400 line-clamp-2">{body.specs}</p>
                  </div>
                  <div className="mt-3 flex items-center justify-between border-t border-white/5 pt-2 text-[11px] font-mono">
                    <span className="text-neutral-500">{body.weightKg}kg • {body.powerDrawWatts}W</span>
                    <span className="font-bold text-amber-400">₹{body.dailyPrice}/day</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Step 2: Optics & Glass */}
        <div className="rounded-2xl border border-white/10 bg-neutral-900/80 p-6 backdrop-blur-xl shadow-xl">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-cyan-400">
              <Film className="h-4 w-4" />
              Step 2: Cinema Optics &amp; Glass
            </h3>
            <span className="text-xs text-neutral-400 font-mono">
              Selected: <strong className="text-white">{selectedOptics.name}</strong>
            </span>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {optics.map((lens) => {
              const isSelected = selectedOptics.id === lens.id;
              return (
                <button
                  key={lens.id}
                  onClick={() => setSelectedOptics(lens)}
                  className={`flex flex-col justify-between rounded-xl p-3 text-left transition-all ${
                    isSelected
                      ? "border-cyan-400 bg-cyan-400/10 text-white ring-1 ring-cyan-400/50"
                      : "border border-white/5 bg-black/40 text-neutral-400 hover:border-white/20 hover:text-white"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between text-[10px] uppercase font-bold text-neutral-500">
                      <span>{lens.brand}</span>
                      {lens.badge && <span className="text-cyan-400">{lens.badge}</span>}
                    </div>
                    <h4 className="mt-1 text-xs font-bold text-white">{lens.name}</h4>
                    <p className="mt-1 text-[10px] text-neutral-400">{lens.specs}</p>
                  </div>
                  <div className="mt-3 flex items-center justify-between border-t border-white/5 pt-2 text-[11px] font-mono">
                    <span className="text-neutral-500">{lens.weightKg}kg</span>
                    <span className="font-bold text-cyan-400">₹{lens.dailyPrice}/day</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Step 3: Monitoring & Wireless Video */}
        <div className="rounded-2xl border border-white/10 bg-neutral-900/80 p-6 backdrop-blur-xl shadow-xl">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-emerald-400">
              <Tv className="h-4 w-4" />
              Step 3: Wireless Video &amp; Monitoring
            </h3>
            {selectedMonitoring && (
              <button
                onClick={() => setSelectedMonitoring(null)}
                className="text-[10px] text-neutral-500 hover:text-rose-400 font-mono underline"
              >
                Clear Selection
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {monitoring.map((mon) => {
              const isSelected = selectedMonitoring?.id === mon.id;
              return (
                <button
                  key={mon.id}
                  onClick={() => setSelectedMonitoring(isSelected ? null : mon)}
                  className={`flex flex-col justify-between rounded-xl p-3 text-left transition-all ${
                    isSelected
                      ? "border-emerald-400 bg-emerald-400/10 text-white ring-1 ring-emerald-400/50"
                      : "border border-white/5 bg-black/40 text-neutral-400 hover:border-white/20 hover:text-white"
                  }`}
                >
                  <div>
                    <span className="text-[10px] uppercase font-bold text-neutral-500">{mon.brand}</span>
                    <h4 className="mt-1 text-xs font-bold text-white line-clamp-1">{mon.name}</h4>
                    <p className="mt-1 text-[10px] text-neutral-400 line-clamp-2">{mon.specs}</p>
                  </div>
                  <div className="mt-3 flex items-center justify-between border-t border-white/5 pt-2 text-[11px] font-mono">
                    <span className="text-neutral-500">{mon.powerDrawWatts}W</span>
                    <span className="font-bold text-emerald-400">₹{mon.dailyPrice}/day</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Step 4: Gimbals & Wireless Focus */}
        <div className="rounded-2xl border border-white/10 bg-neutral-900/80 p-6 backdrop-blur-xl shadow-xl">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-amber-400">
              <Sliders className="h-4 w-4" />
              Step 4: Camera Stabilization &amp; Follow Focus
            </h3>
            {selectedSupport && (
              <button
                onClick={() => setSelectedSupport(null)}
                className="text-[10px] text-neutral-500 hover:text-rose-400 font-mono underline"
              >
                Clear Selection
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {support.map((sup) => {
              const isSelected = selectedSupport?.id === sup.id;
              return (
                <button
                  key={sup.id}
                  onClick={() => setSelectedSupport(isSelected ? null : sup)}
                  className={`flex flex-col justify-between rounded-xl p-3 text-left transition-all ${
                    isSelected
                      ? "border-amber-400 bg-amber-400/10 text-white ring-1 ring-amber-400/50"
                      : "border border-white/5 bg-black/40 text-neutral-400 hover:border-white/20 hover:text-white"
                  }`}
                >
                  <div>
                    <span className="text-[10px] uppercase font-bold text-neutral-500">{sup.brand}</span>
                    <h4 className="mt-1 text-xs font-bold text-white line-clamp-1">{sup.name}</h4>
                    <p className="mt-1 text-[10px] text-neutral-400 line-clamp-2">{sup.specs}</p>
                  </div>
                  <div className="mt-3 flex items-center justify-between border-t border-white/5 pt-2 text-[11px] font-mono">
                    <span className="text-neutral-500">{sup.weightKg}kg</span>
                    <span className="font-bold text-amber-400">₹{sup.dailyPrice}/day</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Step 5: Power & Media Accessories */}
        <div className="rounded-2xl border border-white/10 bg-neutral-900/80 p-6 backdrop-blur-xl shadow-xl">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-cyan-400">
              <BatteryCharging className="h-4 w-4" />
              Step 5: Power, Media &amp; Flight-Case Accessories
            </h3>
            {selectedPower && (
              <button
                onClick={() => setSelectedPower(null)}
                className="text-[10px] text-neutral-500 hover:text-rose-400 font-mono underline"
              >
                Clear Selection
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {power.map((pow) => {
              const isSelected = selectedPower?.id === pow.id;
              return (
                <button
                  key={pow.id}
                  onClick={() => setSelectedPower(isSelected ? null : pow)}
                  className={`flex flex-col justify-between rounded-xl p-3 text-left transition-all ${
                    isSelected
                      ? "border-cyan-400 bg-cyan-400/10 text-white ring-1 ring-cyan-400/50"
                      : "border border-white/5 bg-black/40 text-neutral-400 hover:border-white/20 hover:text-white"
                  }`}
                >
                  <div>
                    <span className="text-[10px] uppercase font-bold text-neutral-500">{pow.brand}</span>
                    <h4 className="mt-1 text-xs font-bold text-white line-clamp-1">{pow.name}</h4>
                    <p className="mt-1 text-[10px] text-neutral-400 line-clamp-2">{pow.specs}</p>
                  </div>
                  <div className="mt-3 flex items-center justify-between border-t border-white/5 pt-2 text-[11px] font-mono">
                    <span className="text-neutral-500">{pow.weightKg}kg</span>
                    <span className="font-bold text-cyan-400">₹{pow.dailyPrice}/day</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ─── RIGHT: LIVE RIG SUMMARY & TIERED PRICING HUD (4 COLS) ─── */}
      <div className="space-y-6 lg:col-span-4">
        {/* Sticky Rig Summary Deck */}
        <div className="sticky top-28 rounded-2xl border border-white/10 bg-neutral-900/90 p-6 backdrop-blur-2xl shadow-2xl space-y-6">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-amber-400">
                Custom Production Rig
              </span>
              <span className="rounded bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-300 border border-emerald-500/30">
                15% Kit Discount
              </span>
            </div>
            <h3 className="mt-1 text-lg font-black text-white">
              Package Specification
            </h3>
          </div>

          {/* Selected Modules Roster */}
          <div className="space-y-2 rounded-xl border border-white/5 bg-black/50 p-4 text-xs font-mono">
            <div className="flex justify-between items-center text-neutral-300">
              <span className="text-neutral-500 uppercase text-[10px]">Body:</span>
              <span className="text-right truncate max-w-[160px]">{selectedBody.name}</span>
            </div>
            <div className="flex justify-between items-center text-neutral-300">
              <span className="text-neutral-500 uppercase text-[10px]">Optics:</span>
              <span className="text-right truncate max-w-[160px]">{selectedOptics.name}</span>
            </div>
            {selectedMonitoring && (
              <div className="flex justify-between items-center text-neutral-300">
                <span className="text-neutral-500 uppercase text-[10px]">Video:</span>
                <span className="text-right truncate max-w-[160px]">{selectedMonitoring.name}</span>
              </div>
            )}
            {selectedSupport && (
              <div className="flex justify-between items-center text-neutral-300">
                <span className="text-neutral-500 uppercase text-[10px]">Support:</span>
                <span className="text-right truncate max-w-[160px]">{selectedSupport.name}</span>
              </div>
            )}
            {selectedPower && (
              <div className="flex justify-between items-center text-neutral-300">
                <span className="text-neutral-500 uppercase text-[10px]">Power:</span>
                <span className="text-right truncate max-w-[160px]">{selectedPower.name}</span>
              </div>
            )}
          </div>

          {/* Rig Telemetry: Weight & Power */}
          <div className="grid grid-cols-2 gap-2 font-mono">
            <div className="rounded-xl border border-white/5 bg-black/40 p-3">
              <div className="flex items-center gap-1 text-[10px] text-neutral-500 uppercase">
                <Weight className="h-3 w-3 text-amber-400" />
                Est. Weight
              </div>
              <p className="mt-1 text-base font-bold text-white">{totalWeightKg} kg</p>
            </div>

            <div className="rounded-xl border border-white/5 bg-black/40 p-3">
              <div className="flex items-center gap-1 text-[10px] text-neutral-500 uppercase">
                <Zap className="h-3 w-3 text-cyan-400" />
                Power Draw
              </div>
              <p className="mt-1 text-base font-bold text-white">{totalPowerDrawWatts} W</p>
            </div>
          </div>

          {/* Shoot Duration Selector */}
          <div>
            <label className="mb-2 block text-[10px] font-mono uppercase font-bold text-neutral-400">
              Rental Duration ({durationDays} Days)
            </label>
            <div className="grid grid-cols-3 gap-1.5 font-mono text-xs">
              {[1, 3, 7].map((d) => (
                <button
                  key={d}
                  onClick={() => setDurationDays(d)}
                  className={`rounded-lg py-2 transition-all ${
                    durationDays === d
                      ? "bg-amber-400 text-black font-bold"
                      : "bg-black/60 text-neutral-400 hover:text-white border border-white/5"
                  }`}
                >
                  {d === 1 ? "1 Day" : d === 3 ? "3D Weekend" : "7D Week"}
                </button>
              ))}
            </div>
          </div>

          {/* Price Breakdown */}
          <div className="rounded-2xl border border-amber-500/20 bg-amber-950/20 p-4 space-y-2">
            <div className="flex justify-between text-xs text-neutral-400 font-mono">
              <span>Unbundled A La Carte:</span>
              <span className="line-through">₹{(rawUnbundledDaily * durationDays).toLocaleString("en-IN")}</span>
            </div>

            <div className="flex items-baseline justify-between">
              <div>
                <span className="text-[10px] font-mono text-amber-400 uppercase">
                  {pricing.tierName}
                </span>
                <p className="text-2xl font-black text-white font-mono">
                  ₹{pricing.totalPackageFee.toLocaleString("en-IN")}
                </p>
              </div>
              <span className="rounded bg-emerald-500/20 px-2 py-0.5 text-xs font-bold text-emerald-300 border border-emerald-500/30">
                Save ₹{pricing.totalSavingsAmount.toLocaleString("en-IN")}
              </span>
            </div>
          </div>

          {/* Add to Cart CTA */}
          <button
            onClick={handleAddCustomRigToCart}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 py-3.5 text-xs font-black uppercase tracking-wider text-black shadow-lg shadow-amber-400/20 transition-all hover:scale-[1.02]"
          >
            <ShoppingBag className="h-4 w-4" />
            Book Custom Cinema Package
          </button>
        </div>
      </div>
    </div>
  );
}
