"use client";

import { useState } from "react";
import CuratedPackagesDeck from "@/components/features/packages/CuratedPackagesDeck";
import CustomRigConfigurator from "@/components/features/packages/CustomRigConfigurator";
import TieredPricingSchedule from "@/components/features/packages/TieredPricingSchedule";
import { Package, Sliders, Calendar } from "lucide-react";

export default function PackagesClient() {
  const [activeTab, setActiveTab] = useState<"curated" | "custom" | "schedule">("curated");

  return (
    <div className="space-y-10">
      {/* ─── TAB NAVIGATION SWITCHER ─── */}
      <div className="flex justify-center">
        <div className="inline-flex rounded-2xl border border-white/10 bg-charcoal/90 p-1.5 backdrop-blur-xl shadow-2xl">
          <button
            onClick={() => setActiveTab("curated")}
            className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === "curated"
                ? "bg-gold-champagne text-obsidian shadow-lg shadow-gold-champagne/20"
                : "text-muted-gray hover:text-ivory"
            }`}
          >
            <Package className="h-4 w-4" />
            Curated Production Packages
          </button>

          <button
            onClick={() => setActiveTab("custom")}
            className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === "custom"
                ? "bg-gold-champagne text-obsidian shadow-lg shadow-gold-champagne/20"
                : "text-muted-gray hover:text-ivory"
            }`}
          >
            <Sliders className="h-4 w-4" />
            Custom Rig Configurator
          </button>

          <button
            onClick={() => setActiveTab("schedule")}
            className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === "schedule"
                ? "bg-gold-champagne text-obsidian shadow-lg shadow-gold-champagne/20"
                : "text-muted-gray hover:text-ivory"
            }`}
          >
            <Calendar className="h-4 w-4" />
            Multi-Day Pricing Rules
          </button>
        </div>
      </div>

      {/* ─── ACTIVE TAB CONTENT ─── */}
      {activeTab === "curated" && <CuratedPackagesDeck />}
      {activeTab === "custom" && <CustomRigConfigurator />}
      {activeTab === "schedule" && <TieredPricingSchedule />}
    </div>
  );
}
