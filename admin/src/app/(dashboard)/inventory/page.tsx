import React, { useState, useEffect, useCallback } from "react";
import { Search, Wrench, RefreshCw, Plus } from "lucide-react";
import { adminApiClient } from "@/lib/api-client";
import { useAdminRealtime } from "@/lib/realtime";

import FleetMaintenanceModal from "../../../components/inventory/FleetMaintenanceModal";
import AddEditCameraModal from "../../../components/inventory/AddEditCameraModal";

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
];

export default function AdminInventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>(INITIAL_INVENTORY);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [loading, setLoading] = useState(false);
  const [maintenanceTarget, setMaintenanceTarget] = useState<InventoryItem | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  const loadInventory = useCallback(async () => {
    setLoading(true);
    const res = await adminApiClient.inventory.list({ status: filterStatus !== "all" ? filterStatus : undefined, search: search || undefined });
    if (res.success && Array.isArray(res.data) && res.data.length > 0) {
      const mapped = res.data.map((u: any) => ({
        id: u.id,
        name: u.name || u.product?.name || "Equipment Unit",
        brand: u.product?.brand?.name || "Aurevia",
        category: "camera" as const,
        serialNumber: u.serial_number,
        dailyPrice: u.product?.daily_price ? Number(u.product.daily_price) : 4999,
        deposit: u.product?.security_deposit ? Number(u.product.security_deposit) : 5000,
        status: u.status ? (u.status.toUpperCase() as any) : "AVAILABLE",
        condition: u.condition ? (u.condition.toUpperCase() as any) : "EXCELLENT",
        image: u.product?.image_url || "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=400",
        productId: u.product_id,
      }));
      setItems(mapped);
    }
    setLoading(false);
  }, [filterStatus, search]);

  useEffect(() => {
    loadInventory();
  }, [loadInventory]);

  useAdminRealtime(() => {
    loadInventory();
  });

  const handleToggleMaintenance = (id: string) => {
    const targetItem = items.find(i => i.id === id);
    if (targetItem) {
      setMaintenanceTarget(targetItem);
    }
  };

  const filteredItems = items.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.serialNumber.toLowerCase().includes(search.toLowerCase()) ||
      item.brand.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filterStatus === "all" || item.status.toLowerCase() === filterStatus.toLowerCase();
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono text-[#d8b36a] uppercase tracking-widest">FLEET MANAGEMENT</span>
            <span className="text-xs text-[#9a9995]">• Real-Time Stock &amp; Calibration</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-light text-[#f5f1e8] font-serif">
            Equipment <span className="text-[#d8b36a]">Fleet Inventory</span>
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#d8b36a] text-black font-bold text-xs hover:bg-[#b98a43] transition cursor-pointer font-mono uppercase tracking-wider shadow-lg"
          >
            <Plus size={14} />
            <span>Add Camera Equipment</span>
          </button>

          <button
            onClick={() => loadInventory()}
            disabled={loading}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-[#f5f1e8] hover:border-[#d8b36a]/40 transition disabled:opacity-50"
          >
            <RefreshCw size={14} className={`text-[#d8b36a] ${loading ? "animate-spin" : ""}`} />
            <span>Sync Fleet Inventory</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div className="relative w-full md:w-80">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9a9995]" />
          <input
            type="text"
            placeholder="Search serial number or model..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#070707] border border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs text-[#f5f1e8] focus:border-[#d8b36a] focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
          {["all", "AVAILABLE", "RENTED", "MAINTENANCE"].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono uppercase transition shrink-0 ${
                filterStatus === st
                  ? "bg-[#d8b36a] text-[#070707] font-semibold"
                  : "bg-white/5 text-[#9a9995] hover:text-[#f5f1e8]"
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Inventory Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.map((item) => (
          <div key={item.id} className="admin-card p-5 rounded-2xl space-y-4 admin-card-hover">
            <div className="h-40 rounded-xl bg-cover bg-center border border-white/10" style={{ backgroundImage: `url(${item.image})` }} />
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-[#d8b36a] uppercase tracking-wider">{item.brand}</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono uppercase border ${
                  item.status === "AVAILABLE"
                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                    : item.status === "RENTED"
                    ? "bg-indigo-500/10 text-indigo-400 border-indigo-500/30"
                    : "bg-amber-500/10 text-amber-400 border-amber-500/30"
                }`}>
                  {item.status}
                </span>
              </div>
              <h3 className="text-sm font-semibold text-[#f5f1e8] mt-1">{item.name}</h3>
              <p className="text-[11px] font-mono text-[#9a9995] mt-0.5">SN: {item.serialNumber}</p>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-white/5 text-xs font-mono">
              <div>
                <span className="text-[#9a9995] text-[10px] uppercase block">Daily Rate</span>
                <span className="text-[#f5f1e8] font-semibold">₹{item.dailyPrice.toLocaleString("en-IN")}</span>
              </div>
              <button
                onClick={() => handleToggleMaintenance(item.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-sans transition cursor-pointer ${
                  item.status === "MAINTENANCE"
                    ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                    : "bg-amber-500/10 text-amber-400 border-amber-500/30 hover:bg-amber-500/20"
                }`}
              >
                <Wrench size={12} />
                <span>Log Maintenance</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {maintenanceTarget && (
        <FleetMaintenanceModal
          equipmentName={maintenanceTarget.name}
          serialNumber={maintenanceTarget.serialNumber}
          onClose={() => setMaintenanceTarget(null)}
          onSave={() => {
            setItems(prev => prev.map(i => i.id === maintenanceTarget.id ? { ...i, status: "MAINTENANCE" } : i));
          }}
        />
      )}

      {showAddModal && (
        <AddEditCameraModal
          onClose={() => setShowAddModal(false)}
          onSuccess={() => loadInventory()}
        />
      )}
    </div>
  );
}
