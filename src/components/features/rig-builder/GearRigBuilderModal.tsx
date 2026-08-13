"use client";

import React, { useState } from "react";
import { X, Sliders, CheckCircle2, Sparkles, ShoppingBag } from "lucide-react";
import { useCart } from "@/hooks/useCart";

interface RigItem {
  id: string;
  name: string;
  category: "body" | "lens" | "wireless" | "power";
  dailyPrice: number;
  image: string;
}

const RIG_ITEMS: RigItem[] = [
  // Bodies
  { id: "rig-sony-fx6", name: "Sony FX6 Full-Frame Cinema Camera", category: "body", dailyPrice: 4500, image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=800" },
  { id: "rig-red-vraptor", name: "RED V-Raptor 8K VV Cinema Package", category: "body", dailyPrice: 12000, image: "https://images.unsplash.com/photo-1589872565089-63364f33668a?q=80&w=800" },
  // Lenses
  { id: "rig-dzofilm-set", name: "DZOFilm VESPID Cine Prime 6-Lens Set", category: "lens", dailyPrice: 3200, image: "https://images.unsplash.com/photo-1617005082133-548c4dd27f35?q=80&w=800" },
  { id: "rig-sony-2470", name: "Sony FE 24-70mm f/2.8 GM II", category: "lens", dailyPrice: 1500, image: "https://images.unsplash.com/photo-1617005082133-548c4dd27f35?q=80&w=800" },
  // Wireless
  { id: "rig-teradek-bolt", name: "Teradek Bolt 4K LT 750 TX/RX Wireless Video", category: "wireless", dailyPrice: 2000, image: "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?q=80&w=800" },
  // Power
  { id: "rig-vmount-kit", name: "Core SWX V-Mount 150Wh Battery (4x) & Quad Charger", category: "power", dailyPrice: 1200, image: "https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?q=80&w=800" },
];

interface GearRigBuilderModalProps {
  onClose: () => void;
}

export default function GearRigBuilderModal({ onClose }: GearRigBuilderModalProps) {
  const { addToCart } = useCart();
  const [selectedBody, setSelectedBody] = useState<RigItem>(RIG_ITEMS[0]);
  const [selectedLens, setSelectedLens] = useState<RigItem>(RIG_ITEMS[2]);
  const [selectedWireless, setSelectedWireless] = useState<RigItem | null>(RIG_ITEMS[4]);
  const [selectedPower, setSelectedPower] = useState<RigItem | null>(RIG_ITEMS[5]);

  const rawTotal =
    selectedBody.dailyPrice +
    selectedLens.dailyPrice +
    (selectedWireless?.dailyPrice || 0) +
    (selectedPower?.dailyPrice || 0);

  // 15% Bundle Savings
  const bundleDiscount = Math.round(rawTotal * 0.15);
  const discountedDailyTotal = rawTotal - bundleDiscount;

  const handleAddToCart = () => {
    const packageName = `Custom Cinema Rig (${selectedBody.name.split(" ")[0]} + ${selectedLens.name.split(" ")[0]})`;
    const todayStr = new Date().toISOString().split("T")[0];
    const nextWeekStr = new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0];
    
    const productObj = {
      id: `custom-rig-${Date.now()}`,
      slug: "custom-cinema-rig",
      name: packageName,
      category: "Cinema Camera Rigs",
      brand: "Aurevia Custom",
      dailyPrice: discountedDailyTotal,
      weeklyPrice: discountedDailyTotal * 5,
      depositAmount: 5000,
      images: [selectedBody.image],
      availableQuantity: 3,
      rating: 5.0,
      reviewCount: 42,
      specs: { Sensor: "Full-Frame / VV Cinema", Mount: "PL / E-Mount", Resolution: "4K/8K RAW" },
      includedItems: [
        selectedBody.name,
        selectedLens.name,
        ...(selectedWireless ? [selectedWireless.name] : []),
        ...(selectedPower ? [selectedPower.name] : []),
      ],
      description: "Custom built cinema production package with 15% active bundle discount.",
      isFeatured: true,
      inStock: true,
    } as any;

    addToCart(productObj, 1, todayStr, nextWeekStr, []);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="relative max-w-3xl w-full bg-[#0a0a0a] border border-[#d8b36a]/30 rounded-2xl p-6 space-y-6 shadow-2xl overflow-y-auto max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#d8b36a]/15 text-[#d8b36a] border border-[#d8b36a]/30">
              <Sliders size={20} />
            </div>
            <div>
              <span className="text-[10px] text-[#d8b36a] uppercase tracking-widest font-mono font-bold block">
                INTERACTIVE RIG BUILDER
              </span>
              <h2 className="text-xl font-light text-[#f5f1e8] font-serif">
                Configure Custom <span className="text-[#d8b36a]">Cinema Rig</span>
              </h2>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-white transition cursor-pointer">
            <X size={18} />
          </button>
        </div>

        {/* Builder Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Slot 1: Body */}
          <div className="space-y-2">
            <label className="text-xs font-mono uppercase tracking-wider text-gray-400 font-bold block">
              1. Camera Body
            </label>
            <div className="space-y-2">
              {RIG_ITEMS.filter((i) => i.category === "body").map((item) => (
                <div
                  key={item.id}
                  onClick={() => setSelectedBody(item)}
                  className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition ${
                    selectedBody.id === item.id
                      ? "bg-[#d8b36a]/10 border-[#d8b36a] text-[#f5f1e8]"
                      : "bg-white/3 border-white/10 text-gray-400 hover:border-white/20"
                  }`}
                >
                  <div>
                    <p className="text-xs font-medium text-[#f5f1e8]">{item.name}</p>
                    <p className="text-[10px] font-mono text-[#d8b36a]">₹{item.dailyPrice.toLocaleString("en-IN")}/day</p>
                  </div>
                  {selectedBody.id === item.id && <CheckCircle2 size={16} className="text-[#d8b36a]" />}
                </div>
              ))}
            </div>
          </div>

          {/* Slot 2: Lenses */}
          <div className="space-y-2">
            <label className="text-xs font-mono uppercase tracking-wider text-gray-400 font-bold block">
              2. Cinema Optics / Lens Package
            </label>
            <div className="space-y-2">
              {RIG_ITEMS.filter((i) => i.category === "lens").map((item) => (
                <div
                  key={item.id}
                  onClick={() => setSelectedLens(item)}
                  className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition ${
                    selectedLens.id === item.id
                      ? "bg-[#d8b36a]/10 border-[#d8b36a] text-[#f5f1e8]"
                      : "bg-white/3 border-white/10 text-gray-400 hover:border-white/20"
                  }`}
                >
                  <div>
                    <p className="text-xs font-medium text-[#f5f1e8]">{item.name}</p>
                    <p className="text-[10px] font-mono text-[#d8b36a]">₹{item.dailyPrice.toLocaleString("en-IN")}/day</p>
                  </div>
                  {selectedLens.id === item.id && <CheckCircle2 size={16} className="text-[#d8b36a]" />}
                </div>
              ))}
            </div>
          </div>

          {/* Slot 3: Wireless */}
          <div className="space-y-2">
            <label className="text-xs font-mono uppercase tracking-wider text-gray-400 font-bold block">
              3. Wireless Video &amp; Monitoring
            </label>
            <div className="space-y-2">
              {RIG_ITEMS.filter((i) => i.category === "wireless").map((item) => (
                <div
                  key={item.id}
                  onClick={() => setSelectedWireless(selectedWireless?.id === item.id ? null : item)}
                  className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition ${
                    selectedWireless?.id === item.id
                      ? "bg-[#d8b36a]/10 border-[#d8b36a] text-[#f5f1e8]"
                      : "bg-white/3 border-white/10 text-gray-400 hover:border-white/20"
                  }`}
                >
                  <div>
                    <p className="text-xs font-medium text-[#f5f1e8]">{item.name}</p>
                    <p className="text-[10px] font-mono text-[#d8b36a]">₹{item.dailyPrice.toLocaleString("en-IN")}/day</p>
                  </div>
                  {selectedWireless?.id === item.id && <CheckCircle2 size={16} className="text-[#d8b36a]" />}
                </div>
              ))}
            </div>
          </div>

          {/* Slot 4: Power */}
          <div className="space-y-2">
            <label className="text-xs font-mono uppercase tracking-wider text-gray-400 font-bold block">
              4. V-Mount Power &amp; Chargers
            </label>
            <div className="space-y-2">
              {RIG_ITEMS.filter((i) => i.category === "power").map((item) => (
                <div
                  key={item.id}
                  onClick={() => setSelectedPower(selectedPower?.id === item.id ? null : item)}
                  className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition ${
                    selectedPower?.id === item.id
                      ? "bg-[#d8b36a]/10 border-[#d8b36a] text-[#f5f1e8]"
                      : "bg-white/3 border-white/10 text-gray-400 hover:border-white/20"
                  }`}
                >
                  <div>
                    <p className="text-xs font-medium text-[#f5f1e8]">{item.name}</p>
                    <p className="text-[10px] font-mono text-[#d8b36a]">₹{item.dailyPrice.toLocaleString("en-IN")}/day</p>
                  </div>
                  {selectedPower?.id === item.id && <CheckCircle2 size={16} className="text-[#d8b36a]" />}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Pricing & Bundle Summary */}
        <div className="p-4 bg-[#121212] border border-[#d8b36a]/30 rounded-xl space-y-3">
          <div className="flex items-center justify-between text-xs font-mono border-b border-white/10 pb-2">
            <span className="text-gray-400">Standard Individual Total:</span>
            <span className="line-through text-gray-500">₹{rawTotal.toLocaleString("en-IN")}/day</span>
          </div>

          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-[#d8b36a] font-bold flex items-center gap-1.5">
              <Sparkles size={14} /> 15% Custom Rig Bundle Discount
            </span>
            <span className="text-emerald-400 font-bold">−₹{bundleDiscount.toLocaleString("en-IN")}/day</span>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-white/10">
            <div>
              <span className="text-[10px] text-gray-400 uppercase font-mono tracking-widest block">Final Daily Rental Rate</span>
              <div className="text-2xl font-bold text-[#f5f1e8] font-mono">
                ₹{discountedDailyTotal.toLocaleString("en-IN")} <span className="text-xs text-[#d8b36a] font-normal">/ day</span>
              </div>
            </div>

            <button
              onClick={handleAddToCart}
              className="px-6 py-3 rounded-xl bg-[#d8b36a] hover:bg-[#b98a43] text-black font-bold text-xs uppercase tracking-wider transition cursor-pointer flex items-center gap-2"
            >
              <ShoppingBag size={15} /> Add Complete Rig to Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
