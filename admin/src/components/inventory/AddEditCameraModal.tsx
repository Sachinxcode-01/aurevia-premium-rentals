"use client";

import React, { useState } from "react";
import { X, Camera, Plus, CheckCircle2 } from "lucide-react";
import { adminApiClient } from "@/lib/api-client";

interface AddEditCameraModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddEditCameraModal({ onClose, onSuccess }: AddEditCameraModalProps) {
  const [name, setName] = useState("");
  const [brand, setBrand] = useState("Canon");
  const [serialNumber, setSerialNumber] = useState("");
  const [dailyPrice, setDailyPrice] = useState("4999");
  const [deposit, setDeposit] = useState("5000");
  const [imageUrl, setImageUrl] = useState("https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=400");
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg("Equipment Name is required");
      return;
    }

    setLoading(true);
    setErrorMsg("");

    try {
      const priceNum = Number(dailyPrice) || 4999;
      const depositNum = Number(deposit) || 5000;
      const autoSerial = serialNumber.trim() || `AUR-${Math.floor(10000 + Math.random() * 90000)}`;

      // 1. Create camera product
      const prodRes = await adminApiClient.products.add({
        name: name.trim(),
        dailyPrice: priceNum,
        securityDeposit: depositNum,
        imageUrl: imageUrl.trim(),
        inventoryQty: 1,
        isFeatured: true,
      });

      const createdProdId = prodRes.data?.id || "p1000000-0000-0000-0000-000000000001";

      // 2. Add physical inventory unit
      await adminApiClient.inventory.add({
        productId: createdProdId,
        serialNumber: autoSerial,
        name: `${name.trim()} - Unit 1`,
        status: "available",
        condition: "excellent",
      });

      setSaved(true);
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1000);
    } catch (err: any) {
      setErrorMsg(err?.message || "Failed to create camera equipment");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="relative max-w-lg w-full bg-[#0a0a0a] border border-[#d8b36a]/30 rounded-2xl p-6 space-y-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#d8b36a]/15 text-[#d8b36a] border border-[#d8b36a]/30">
              <Camera size={20} />
            </div>
            <div>
              <span className="text-[10px] text-[#d8b36a] uppercase tracking-widest font-mono font-bold block">
                FLEET CATALOGUE MANAGEMENT
              </span>
              <h2 className="text-base font-semibold text-[#f5f1e8] font-serif">
                Add New Cinema Camera
              </h2>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-white transition cursor-pointer">
            <X size={18} />
          </button>
        </div>

        {saved ? (
          <div className="py-8 text-center space-y-3">
            <CheckCircle2 size={42} className="text-emerald-400 mx-auto animate-bounce" />
            <h3 className="text-sm font-semibold text-[#f5f1e8]">Equipment Added Successfully!</h3>
            <p className="text-xs text-gray-400 font-mono">
              Product and physical inventory unit published to central catalogue.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {errorMsg && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-xs text-red-400 font-mono">
                {errorMsg}
              </div>
            )}

            {/* Equipment Name */}
            <div className="space-y-1">
              <label className="text-xs font-mono uppercase text-gray-400 block">Equipment Model / Package Name *</label>
              <input
                type="text"
                placeholder="e.g. Canon EOS R5 C Cinema Camera"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full bg-black border border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-[#f5f1e8] focus:border-[#d8b36a] focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              {/* Brand */}
              <div className="space-y-1">
                <label className="text-xs font-mono uppercase text-gray-400 block">Brand / Manufacturer</label>
                <select
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  className="w-full bg-black border border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-[#f5f1e8] focus:border-[#d8b36a] focus:outline-none"
                >
                  <option value="Canon">Canon</option>
                  <option value="Sony">Sony</option>
                  <option value="RED">RED</option>
                  <option value="ARRI">ARRI</option>
                  <option value="Blackmagic">Blackmagic</option>
                  <option value="Fujifilm">Fujifilm</option>
                </select>
              </div>

              {/* Serial Number */}
              <div className="space-y-1">
                <label className="text-xs font-mono uppercase text-gray-400 block">Serial Number</label>
                <input
                  type="text"
                  placeholder="SN: CN-R5C-88421"
                  value={serialNumber}
                  onChange={(e) => setSerialNumber(e.target.value)}
                  className="w-full bg-black border border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-[#f5f1e8] focus:border-[#d8b36a] focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {/* Daily Rental Price */}
              <div className="space-y-1">
                <label className="text-xs font-mono uppercase text-gray-400 block">Daily Rate (₹) *</label>
                <input
                  type="number"
                  placeholder="899"
                  value={dailyPrice}
                  onChange={(e) => setDailyPrice(e.target.value)}
                  required
                  className="w-full bg-black border border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-[#f5f1e8] focus:border-[#d8b36a] focus:outline-none"
                />
              </div>

              {/* Security Deposit */}
              <div className="space-y-1">
                <label className="text-xs font-mono uppercase text-gray-400 block">Security Deposit (₹)</label>
                <input
                  type="number"
                  placeholder="5000"
                  value={deposit}
                  onChange={(e) => setDeposit(e.target.value)}
                  className="w-full bg-black border border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-[#f5f1e8] focus:border-[#d8b36a] focus:outline-none"
                />
              </div>
            </div>

            {/* Cover Image URL */}
            <div className="space-y-1">
              <label className="text-xs font-mono uppercase text-gray-400 block">Cover Image URL</label>
              <input
                type="text"
                placeholder="https://images.unsplash.com/..."
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="w-full bg-black border border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-[#f5f1e8] focus:border-[#d8b36a] focus:outline-none"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs text-gray-400 font-mono transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-1.5 px-6 py-2 rounded-xl bg-[#d8b36a] hover:bg-[#b98a43] text-black font-bold text-xs uppercase font-mono tracking-wider transition cursor-pointer disabled:opacity-50"
              >
                <Plus size={14} />
                <span>{loading ? "Saving..." : "Add Equipment"}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
