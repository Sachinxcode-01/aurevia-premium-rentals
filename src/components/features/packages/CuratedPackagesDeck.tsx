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
  FileText,
  Layers,
  CheckCircle2,
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
    if (toast?.success) {
      toast.success(`Added ${pkg.name} (${selectedDurationDays} Days) to Cart!`);
    }

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
      <div className="rounded-2xl border border-white/10 bg-charcoal/80 p-5 backdrop-blur-xl shadow-xl">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <span className="text-[10px] font-mono font-medium text-gold-champagne">
              Multi-Day Production Tier Pricing
            </span>
            <h2 className="text-base font-bold text-ivory">
              Select Your Shoot Schedule Duration
            </h2>
          </div>

          <div className="flex flex-wrap gap-2">
            {POPULAR_DURATION_TIERS.map((tier) => {
              const isSelected = selectedDurationDays === tier.days;
              return (
                <button
                  key={tier.days}
                  onClick={() => setSelectedDurationDays(tier.days)}
                  className={`flex flex-col items-start rounded-xl px-4 py-2 text-left transition-all cursor-pointer ${
                    isSelected
                      ? "bg-gold-champagne text-obsidian shadow-lg shadow-gold-champagne/20 font-bold"
                      : "btn-secondary text-muted-gray"
                  }`}
                >
                  <span className="text-xs font-bold">{tier.label}</span>
                  <span
                    className={`text-[10px] font-mono ${
                      isSelected ? "text-obsidian/80 font-semibold" : "text-gold-champagne/90"
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
              className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-white/10 bg-charcoal/90 shadow-2xl transition-all duration-300 hover:border-gold-champagne/40 hover:shadow-gold-champagne/5"
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
                <div className="absolute inset-0 bg-linear-to-t from-obsidian via-obsidian/40 to-transparent" />

                {/* Badges */}
                <div className="absolute top-4 right-4 left-4 flex items-center justify-between">
                  <span className="rounded-full bg-black/80 px-3 py-1 text-[10px] font-semibold text-gold-champagne backdrop-blur-md border border-gold-champagne/30">
                    {pkg.category}
                  </span>
                  <span className="flex items-center gap-1 rounded-full bg-emerald-500/20 px-3 py-1 text-[10px] font-semibold text-emerald-300 backdrop-blur-md border border-emerald-500/40">
                    <Sparkles className="h-3 w-3" />
                    {pkg.bundleDiscountPercent}% Bundle Off
                  </span>
                </div>

                {/* Package Title inside Image overlay */}
                <div className="absolute right-4 bottom-4 left-4">
                  <span className="text-[10px] font-mono font-medium text-gold-champagne">
                    {pkg.badge}
                  </span>
                  <h3 className="text-xl font-black text-ivory sm:text-2xl">
                    {pkg.name}
                  </h3>
                </div>
              </div>

              {/* Package Body Details */}
              <div className="flex-1 space-y-6 p-6">
                <p className="text-xs text-muted-gray leading-relaxed">
                  {pkg.tagline}
                </p>

                {/* Highlights List */}
                <div className="space-y-2 rounded-xl border border-white/5 bg-black/40 p-4">
                  <span className="text-[10px] font-mono text-muted-gray">
                    Key Equipment Highlights:
                  </span>
                  <ul className="space-y-1.5 text-xs text-ivory/90">
                    {pkg.highlightSpecs.map((spec, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <CheckCircle2 className="h-3.5 w-3.5 text-gold-champagne shrink-0" />
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
                    className="flex w-full items-center justify-between text-xs font-semibold text-gold-champagne hover:text-gold-warm transition-colors cursor-pointer"
                  >
                    <span className="flex items-center gap-1.5">
                      <Layers className="h-3.5 w-3.5" />
                      {isExpanded
                        ? "Hide Full Equipment Manifest"
                        : "View Complete Equipment Manifest"}
                    </span>
                    <span className="font-mono text-[10px] text-muted-gray">
                      {pkg.includedGear.reduce(
                        (acc, curr) => acc + curr.items.length,
                        0
                      )}{" "}
                      Items
                    </span>
                  </button>

                  {isExpanded && (
                    <div className="mt-3 space-y-3 rounded-xl border border-white/10 bg-obsidian p-4 text-xs">
                      {pkg.includedGear.map((dept, i) => (
                        <div key={i} className="space-y-1">
                          <span className="text-[10px] font-mono font-bold text-muted-gray">
                            {dept.department}
                          </span>
                          <ul className="list-disc pl-4 text-ivory/80 space-y-0.5">
                            {dept.items.map((it, j) => (
                              <li key={j}>{it}</li>
                            ))}
                          </ul>
                        </div>
                      ))}
                      <div className="mt-2 border-t border-white/10 pt-2 text-[10px] text-muted-gray font-mono">
                        Packaged in: <strong className="text-ivory">{pkg.pelicanCaseModel}</strong> (Total Est. {pkg.estimatedWeightKg} kg)
                      </div>
                    </div>
                  )}
                </div>

                {/* Tiered Price Summary Card */}
                <div className="rounded-2xl border border-gold-champagne/20 bg-gold-champagne/5 p-4">
                  <div className="flex items-baseline justify-between">
                    <div>
                      <span className="text-[10px] font-mono text-gold-champagne">
                        {pricing.tierName} ({selectedDurationDays} Days)
                      </span>
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-black text-ivory font-mono">
                          ₹{pricing.totalPackageFee.toLocaleString("en-IN")}
                        </span>
                        <span className="text-xs text-muted-gray line-through font-mono">
                          ₹{(pkg.dailyRate * selectedDurationDays).toLocaleString("en-IN")}
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="rounded bg-emerald-500/20 px-2 py-0.5 text-[11px] font-bold text-emerald-300 border border-emerald-500/30">
                        Save ₹{pricing.totalSavingsAmount.toLocaleString("en-IN")}
                      </span>
                      <p className="mt-1 text-[10px] text-muted-gray font-mono">
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
                  className="btn-secondary text-xs"
                >
                  {copiedManifestId === pkg.id ? (
                    <>
                      <Check className="h-4 w-4 text-emerald-400" />
                      <span className="text-emerald-400">Copied</span>
                    </>
                  ) : (
                    <>
                      <FileText className="h-4 w-4 text-gold-champagne" />
                      <span className="hidden sm:inline">Call Sheet</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => handleBookPackage(pkg)}
                  className="btn-primary flex-1 text-xs"
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
