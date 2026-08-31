"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  CURATED_PACKAGES,
  ProductionPackage,
} from "@/lib/data/production-packages-data";
import {
  calculatePackagePricing,
  POPULAR_DURATION_TIERS,
} from "@/lib/utils/tiered-pricing-calculator";
import { useCart } from "@/hooks/useCart";
import { useToast } from "@/hooks/useToast";
import {
  Check,
  ShoppingBag,
  Sparkles,
  Shield,
  FileText,
  Calendar,
  Layers,
  CheckCircle2,
  Share2,
} from "lucide-react";

export default function CuratedPackagesDeck() {
  const router = useRouter();
  const { addToCart } = useCart();
  const toast = useToast();

  const [selectedDurationDays, setSelectedDurationDays] = useState<number>(3); // Default weekend special
  const [expandedPackageId, setExpandedPackageId] = useState<string | null>(null);
  const [copiedManifestId, setCopiedManifestId] = useState<string | null>(null);

  const handleBookPackage = (pkg: ProductionPackage) => {
    const pricing = calculatePackagePricing(
      pkg.dailyRate,
      pkg.bundleDiscountPercent,
      selectedDurationDays
    );

    const today = new Date();
    const startDateStr = today.toISOString().split("T")[0];
    const endDate = new Date(today.getTime() + (selectedDurationDays - 1) * 86400000);
    const endDateStr = endDate.toISOString().split("T")[0];

    // Format all items for manifest
    const allItems = pkg.includedGear.flatMap((g) => g.items);

    const productObj = {
      id: `pkg-${pkg.id}`,
      slug: pkg.id,
      name: pkg.name,
      category: "Production Cinema Packages",
      brand: "AUREVIA Master Suite",
      dailyPrice: pricing.effectiveDailyCost,
      weeklyPrice: pricing.totalPackageFee,
      depositAmount: pkg.depositAmount,
      images: [pkg.image],
      availableQuantity: 2,
      rating: 5.0,
      reviewCount: 28,
      specs: {
        "Pelican Model": pkg.pelicanCaseModel,
        "Package Weight": `${pkg.estimatedWeightKg} kg`,
        "Rental Tier": pricing.tierName,
        "Bundle Savings": `₹${pricing.totalSavingsAmount.toLocaleString("en-IN")} saved`,
      },
      includedItems: allItems,
      description: `${pkg.tagline} Delivered in certified ${pkg.pelicanCaseModel}.`,
      isFeatured: true,
      inStock: true,
    } as any;

    addToCart(productObj, 1, startDateStr, endDateStr, []);
    toast?.success
      ? toast.success(`Added ${pkg.name} (${selectedDurationDays} Days) to Cart!`)
      : null;

    router.push("/booking");
  };

  const handleCopyManifest = (pkg: ProductionPackage) => {
    const pricing = calculatePackagePricing(
      pkg.dailyRate,
      pkg.bundleDiscountPercent,
      selectedDurationDays
    );

    let manifest = `=====================================================
AUREVIA PRODUCTION EQUIPMENT CALL SHEET MANIFEST
=====================================================
PACKAGE: ${pkg.name.toUpperCase()}
CATEGORY: ${pkg.category}
FLIGHT CASE: ${pkg.pelicanCaseModel} (Est. ${pkg.estimatedWeightKg} kg)
RENTAL DURATION: ${selectedDurationDays} Days (${pricing.tierName})
PACKAGE FEE: ₹${pricing.totalPackageFee.toLocaleString("en-IN")} (Saved ₹${pricing.totalSavingsAmount.toLocaleString("en-IN")})
-----------------------------------------------------
INCLUDED EQUIPMENT CHECKLIST:
`;

    pkg.includedGear.forEach((dept) => {
      manifest += `\n[${dept.department.toUpperCase()}]\n`;
      dept.items.forEach((item) => {
        manifest += `  [ ] ${item}\n`;
      });
    });

    manifest += `-----------------------------------------------------
Prepared by AUREVIA Vault Operations
=====================================================`;

    navigator.clipboard.writeText(manifest);
    setCopiedManifestId(pkg.id);
    setTimeout(() => setCopiedManifestId(null), 2500);
  };

  return (
    <div className="space-y-8">
      {/* ─── DURATION TIER BARREL SELECTOR ─── */}
      <div className="rounded-2xl border border-white/10 bg-neutral-900/80 p-5 backdrop-blur-xl shadow-xl">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-amber-400">
              Multi-Day Production Tier Pricing
            </span>
            <h3 className="text-base font-bold text-white">
              Select Your Shoot Schedule Duration
            </h3>
          </div>

          <div className="flex flex-wrap gap-2">
            {POPULAR_DURATION_TIERS.map((tier) => {
              const isSelected = selectedDurationDays === tier.days;
              return (
                <button
                  key={tier.days}
                  onClick={() => setSelectedDurationDays(tier.days)}
                  className={`flex flex-col items-start rounded-xl px-4 py-2 text-left transition-all ${
                    isSelected
                      ? "border-amber-400 bg-amber-400 text-black shadow-lg shadow-amber-400/20 font-bold"
                      : "border border-white/10 bg-black/60 text-neutral-300 hover:border-white/20 hover:text-white"
                  }`}
                >
                  <span className="text-xs font-bold">{tier.label}</span>
                  <span
                    className={`text-[10px] font-mono ${
                      isSelected ? "text-neutral-900 font-semibold" : "text-amber-400/80"
                    }`}
                  >
                    {tier.desc}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ─── CURATED PACKAGES GRID ─── */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {CURATED_PACKAGES.map((pkg) => {
          const pricing = calculatePackagePricing(
            pkg.dailyRate,
            pkg.bundleDiscountPercent,
            selectedDurationDays
          );
          const isExpanded = expandedPackageId === pkg.id;

          return (
            <div
              key={pkg.id}
              className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-white/10 bg-neutral-900/90 shadow-2xl transition-all duration-300 hover:border-amber-400/40 hover:shadow-amber-500/5"
            >
              {/* Top Banner Image with Badges */}
              <div className="relative h-60 w-full overflow-hidden sm:h-72">
                <Image
                  src={pkg.image}
                  alt={pkg.name}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  sizes="(max-width: 1024px) 100vw, 600px"
                />
                <div className="absolute inset-0 bg-linear-to-t from-neutral-950 via-neutral-950/40 to-transparent" />

                {/* Badges */}
                <div className="absolute top-4 right-4 left-4 flex items-center justify-between">
                  <span className="rounded-full bg-black/80 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-amber-300 backdrop-blur-md border border-amber-400/30">
                    {pkg.category}
                  </span>
                  <span className="flex items-center gap-1 rounded-full bg-emerald-500/20 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-300 backdrop-blur-md border border-emerald-500/40">
                    <Sparkles className="h-3 w-3" />
                    {pkg.bundleDiscountPercent}% Bundle Off
                  </span>
                </div>

                {/* Package Title inside Image overlay */}
                <div className="absolute right-4 bottom-4 left-4">
                  <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-amber-400">
                    {pkg.badge}
                  </span>
                  <h3 className="text-xl font-black text-white sm:text-2xl">
                    {pkg.name}
                  </h3>
                </div>
              </div>

              {/* Package Body Details */}
              <div className="flex-1 space-y-6 p-6">
                <p className="text-xs text-neutral-300 leading-relaxed">
                  {pkg.tagline}
                </p>

                {/* Highlights List */}
                <div className="space-y-2 rounded-xl border border-white/5 bg-black/40 p-4">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400">
                    Key Equipment Highlights:
                  </span>
                  <ul className="space-y-1.5 text-xs text-neutral-200">
                    {pkg.highlightSpecs.map((spec, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <CheckCircle2 className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                        <span>{spec}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Included Gear Expandable Section */}
                <div>
                  <button
                    onClick={() =>
                      setExpandedPackageId(isExpanded ? null : pkg.id)
                    }
                    className="flex w-full items-center justify-between text-xs font-bold uppercase tracking-wider text-amber-400 hover:text-amber-300 transition-colors"
                  >
                    <span className="flex items-center gap-1.5">
                      <Layers className="h-3.5 w-3.5" />
                      {isExpanded
                        ? "Hide Full Equipment Manifest"
                        : "View Complete Equipment Manifest"}
                    </span>
                    <span className="font-mono text-[10px] text-neutral-400">
                      {pkg.includedGear.reduce(
                        (acc, curr) => acc + curr.items.length,
                        0
                      )}{" "}
                      Items
                    </span>
                  </button>

                  {isExpanded && (
                    <div className="mt-3 space-y-3 rounded-xl border border-white/10 bg-neutral-950 p-4 text-xs">
                      {pkg.includedGear.map((dept, i) => (
                        <div key={i} className="space-y-1">
                          <span className="text-[10px] font-mono uppercase font-bold text-neutral-400">
                            {dept.department}
                          </span>
                          <ul className="list-disc pl-4 text-neutral-300 space-y-0.5">
                            {dept.items.map((it, j) => (
                              <li key={j}>{it}</li>
                            ))}
                          </ul>
                        </div>
                      ))}
                      <div className="mt-2 border-t border-white/10 pt-2 text-[10px] text-neutral-400 font-mono">
                        Packaged in: <strong className="text-white">{pkg.pelicanCaseModel}</strong> (Total Est. {pkg.estimatedWeightKg} kg)
                      </div>
                    </div>
                  )}
                </div>

                {/* Tiered Price Summary Card */}
                <div className="rounded-2xl border border-amber-500/20 bg-amber-950/20 p-4">
                  <div className="flex items-baseline justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-mono tracking-wider text-amber-400">
                        {pricing.tierName} ({selectedDurationDays} Days)
                      </span>
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-black text-white font-mono">
                          ₹{pricing.totalPackageFee.toLocaleString("en-IN")}
                        </span>
                        <span className="text-xs text-neutral-400 line-through font-mono">
                          ₹{(pkg.dailyRate * selectedDurationDays).toLocaleString("en-IN")}
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="rounded bg-emerald-500/20 px-2 py-0.5 text-[11px] font-bold text-emerald-300 border border-emerald-500/30">
                        Save ₹{pricing.totalSavingsAmount.toLocaleString("en-IN")}
                      </span>
                      <p className="mt-1 text-[10px] text-neutral-400 font-mono">
                        (₹{pricing.effectiveDailyCost.toLocaleString("en-IN")}/day effective)
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Deck (Bottom) */}
              <div className="flex items-center gap-3 border-t border-white/10 bg-black/60 p-6">
                <button
                  onClick={() => handleCopyManifest(pkg)}
                  title="Copy Equipment Manifest for Call Sheet"
                  className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-neutral-900 px-4 py-3 text-xs font-semibold text-neutral-300 transition-colors hover:bg-neutral-800 hover:text-white"
                >
                  {copiedManifestId === pkg.id ? (
                    <>
                      <Check className="h-4 w-4 text-emerald-400" />
                      <span className="text-emerald-400">Copied</span>
                    </>
                  ) : (
                    <>
                      <FileText className="h-4 w-4 text-amber-400" />
                      <span className="hidden sm:inline">Call Sheet</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => handleBookPackage(pkg)}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-linear-to-r from-amber-400 via-amber-300 to-amber-500 py-3 text-xs font-black uppercase tracking-wider text-black shadow-lg shadow-amber-400/20 transition-all hover:scale-[1.02]"
                >
                  <ShoppingBag className="h-4 w-4" />
                  Book Complete Package
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
