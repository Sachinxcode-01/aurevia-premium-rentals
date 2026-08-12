"use client";

import React, { useState } from "react";
import {
  Camera, Plus, Search, Filter, Wrench, ShieldAlert, CheckCircle2,
  AlertTriangle, ArrowUpRight, Edit2, Trash2, LayoutGrid, List, Sparkles
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface InventoryItem {
  id: string;
  name: string;
  brand: string;
  category: "camera" | "lens" | "lighting" | "audio" | "accessory";
  serialNumber: string;
  dailyPrice: number;
  deposit: number;
  status: "AVAILABLE" | "RENTED" | "MAINTENANCE" | "DAMAGED" | "RESERVED";
  condition: "EXCELLENT" | "GOOD" | "FAIR";
  image: string;
}

const INITIAL_INVENTORY: InventoryItem[] = [
  {
    id: "INV-001",
    name: "Canon EOS R5 C Cinema Camera",
    brand: "Canon",
    category: "camera",
    serialNumber: "CN-R5C-88421",
    dailyPrice: 4999,
    deposit: 5000,
    status: "AVAILABLE",
    condition: "EXCELLENT",
    image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=400",
  },
  {
    id: "INV-002",
    name: "Sony FX6 Full-Frame Cinema Camera",
    brand: "Sony",
    category: "camera",
    serialNumber: "SN-FX6-99320",
    dailyPrice: 5500,
    deposit: 6000,
    status: "RENTED",
    condition: "EXCELLENT",
    image: "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?q=80&w=400",
  },
  {
    id: "INV-003",
    name: "RED Komodo 6K Digital Cinema",
    brand: "RED",
    category: "camera",
    serialNumber: "RED-KM-7721",
    dailyPrice: 6500,
    deposit: 10000,
    status: "RENTED",
    condition: "EXCELLENT",
    image: "https://images.unsplash.com/photo-1589872737418-202b8015e378?q=80&w=400",
  },
  {
    id: "INV-004",
    name: "Canon RF 24-70mm f/2.8L IS USM",
    brand: "Canon",
    category: "lens",
    serialNumber: "RF-2470-1120",
    dailyPrice: 1999,
    deposit: 2000,
    status: "MAINTENANCE",
    condition: "GOOD",
    image: "https://images.unsplash.com/photo-1617005082133-548c4dd27f35?q=80&w=400",
  },
];

export default function AdminInventoryPage() {
  const [inventory, setInventory] = useState<InventoryItem[]>(INITIAL_INVENTORY);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New Equipment Form State
  const [newGear, setNewGear] = useState({
    name: "",
    brand: "Canon",
    category: "camera",
    serialNumber: "",
    dailyPrice: 2999,
    deposit: 3000,
    image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=400",
  });

  const filteredInventory = inventory.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.serialNumber.toLowerCase().includes(search.toLowerCase()) ||
      item.brand.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === "all" || item.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const handleAddEquipment = (e: React.FormEvent) => {
    e.preventDefault();
    const created: InventoryItem = {
      id: `INV-00${inventory.length + 1}`,
      name: newGear.name,
      brand: newGear.brand,
      category: newGear.category as any,
      serialNumber: newGear.serialNumber || `SN-${Math.floor(1000 + Math.random() * 9000)}`,
      dailyPrice: Number(newGear.dailyPrice),
      deposit: Number(newGear.deposit),
      status: "AVAILABLE",
      condition: "EXCELLENT",
      image: newGear.image,
    };
    setInventory([created, ...inventory]);
    setIsAddModalOpen(false);
    setNewGear({ name: "", brand: "Canon", category: "camera", serialNumber: "", dailyPrice: 2999, deposit: 3000, image: "" });
  };

  const updateStatus = (id: string, newStatus: InventoryItem["status"]) => {
    setInventory((prev) => prev.map((item) => (item.id === id ? { ...item, status: newStatus } : item)));
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-6">
        <div>
          <h1 className="text-2xl font-light text-[#f5f1e8] font-serif">
            Equipment Fleet &amp; Serial Inventory
          </h1>
          <p className="text-xs text-[#9a9995] font-light mt-1">
            Track individual physical camera units, maintenance logs, and rental status.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#d8b36a] text-[#070707] font-semibold text-xs hover:bg-[#b98a43] transition shadow-lg shadow-[#d8b36a]/10"
        >
          <Plus size={16} />
          <span>Add New Equipment</span>
        </button>
      </div>

      {/* Controls */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9a9995]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search brand, model, serial..."
            className="w-full bg-[#121212] border border-white/10 rounded-xl pl-10 pr-4 py-2 text-xs text-[#f5f1e8] placeholder-[#9a9995]/50 focus:outline-none focus:border-[#d8b36a]/50"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto text-xs">
          {["all", "camera", "lens", "lighting", "audio", "accessory"].map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-lg border font-mono text-[11px] uppercase transition ${
                categoryFilter === cat
                  ? "bg-[#d8b36a]/15 text-[#d8b36a] border-[#d8b36a]/40 font-semibold"
                  : "bg-[#121212] text-[#9a9995] border-white/10 hover:text-[#f5f1e8]"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Inventory Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {filteredInventory.map((item) => (
          <div key={item.id} className="admin-card rounded-2xl p-4 space-y-4 border border-white/10 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="relative h-40 rounded-xl bg-cover bg-center overflow-hidden" style={{ backgroundImage: `url(${item.image})` }}>
                <span className="absolute top-2 left-2 px-2 py-0.5 rounded text-[9px] font-mono uppercase bg-[#070707]/80 text-[#d8b36a] border border-white/10">
                  {item.id}
                </span>
                <span
                  className={`absolute top-2 right-2 px-2 py-0.5 rounded-full text-[9px] font-mono font-semibold uppercase border ${
                    item.status === "AVAILABLE"
                      ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/40"
                      : item.status === "RENTED"
                      ? "bg-indigo-500/20 text-indigo-400 border-indigo-500/40"
                      : "bg-amber-500/20 text-amber-400 border-amber-500/40"
                  }`}
                >
                  {item.status}
                </span>
              </div>

              <div>
                <p className="text-[10px] font-mono text-[#9a9995] uppercase">{item.brand}</p>
                <h3 className="text-sm font-semibold text-[#f5f1e8] line-clamp-1">{item.name}</h3>
                <p className="text-xs font-mono text-[#d8b36a] mt-1">Serial: {item.serialNumber}</p>
              </div>
            </div>

            <div className="space-y-3 pt-3 border-t border-white/10">
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="text-[#9a9995]">Rate / Day</span>
                <span className="text-[#f5f1e8] font-semibold">₹{item.dailyPrice.toLocaleString("en-IN")}</span>
              </div>

              <div className="flex gap-1 text-[10px] font-mono">
                <button
                  onClick={() => updateStatus(item.id, "AVAILABLE")}
                  className="flex-1 py-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20"
                >
                  Available
                </button>
                <button
                  onClick={() => updateStatus(item.id, "MAINTENANCE")}
                  className="flex-1 py-1 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30 hover:bg-amber-500/20"
                >
                  Repair
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Equipment Modal */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg bg-[#121212] border border-white/15 rounded-2xl p-6 shadow-2xl space-y-6"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <h2 className="text-lg font-semibold text-[#f5f1e8] font-serif">Add New Equipment to Fleet</h2>
                <button onClick={() => setIsAddModalOpen(false)} className="text-[#9a9995] hover:text-[#f5f1e8]">✕</button>
              </div>

              <form onSubmit={handleAddEquipment} className="space-y-4 text-xs">
                <div className="space-y-1">
                  <label className="text-[#9a9995] font-mono uppercase">Equipment Name</label>
                  <input
                    required
                    value={newGear.name}
                    onChange={(e) => setNewGear({ ...newGear, name: e.target.value })}
                    placeholder="e.g. Canon EOS C300 Mark III"
                    className="w-full bg-[#070707] border border-white/10 rounded-lg p-2.5 text-[#f5f1e8] focus:border-[#d8b36a] outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[#9a9995] font-mono uppercase">Brand</label>
                    <input
                      value={newGear.brand}
                      onChange={(e) => setNewGear({ ...newGear, brand: e.target.value })}
                      className="w-full bg-[#070707] border border-white/10 rounded-lg p-2.5 text-[#f5f1e8] outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[#9a9995] font-mono uppercase">Category</label>
                    <select
                      value={newGear.category}
                      onChange={(e) => setNewGear({ ...newGear, category: e.target.value as any })}
                      className="w-full bg-[#070707] border border-white/10 rounded-lg p-2.5 text-[#f5f1e8] outline-none"
                    >
                      <option value="camera">Camera Body</option>
                      <option value="lens">Cinema Lens</option>
                      <option value="lighting">Lighting</option>
                      <option value="audio">Audio</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[#9a9995] font-mono uppercase">Daily Rate (₹)</label>
                    <input
                      type="number"
                      value={newGear.dailyPrice}
                      onChange={(e) => setNewGear({ ...newGear, dailyPrice: Number(e.target.value) })}
                      className="w-full bg-[#070707] border border-white/10 rounded-lg p-2.5 text-[#f5f1e8] outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[#9a9995] font-mono uppercase">Security Deposit (₹)</label>
                    <input
                      type="number"
                      value={newGear.deposit}
                      onChange={(e) => setNewGear({ ...newGear, deposit: Number(e.target.value) })}
                      className="w-full bg-[#070707] border border-white/10 rounded-lg p-2.5 text-[#f5f1e8] outline-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full mt-4 py-3 bg-[#d8b36a] text-[#070707] font-semibold rounded-lg hover:bg-[#b98a43] transition"
                >
                  SAVE EQUIPMENT TO INVENTORY
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
