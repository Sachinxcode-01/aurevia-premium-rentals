"use client";

import { useState } from "react";
import {
  Printer,
  Plus,
  Trash2,
  CheckCircle2,
} from "lucide-react";

export interface ManifestItem {
  id: string;
  category: "Camera Body" | "Optics & Lenses" | "Power & Battery" | "Monitoring & Wireless" | "Support & Rigging";
  name: string;
  serialNumber: string;
  pelicanCaseNo: string;
  status: "Passed 100%" | "Verified" | "Calibrated";
  notes: string;
}

const PRESET_PACKAGES: { [key: string]: { title: string; items: ManifestItem[] } } = {
  arriAlexa35: {
    title: "ARRI Alexa 35 Master Commercial Package",
    items: [
      { id: "1", category: "Camera Body", name: "ARRI Alexa 35 (4.6K 3:2 Open Gate)", serialNumber: "ARRI-35-90812", pelicanCaseNo: "PEL-01-A", status: "Passed 100%", notes: "Sensor clean check certified (0 dust particles)" },
      { id: "2", category: "Optics & Lenses", name: "Cooke S4/i Prime Set (25mm, 32mm, 50mm, 75mm)", serialNumber: "CKE-S4-44120", pelicanCaseNo: "PEL-02-L", status: "Calibrated", notes: "Collimated back-focus confirmed on test bench" },
      { id: "3", category: "Power & Battery", name: "4x Core SWX Hypercore NEO 150 (147Wh V-Mount) + Dual Quad Charger", serialNumber: "SWX-150-7781", pelicanCaseNo: "PEL-03-P", status: "Verified", notes: "100% full health charge" },
      { id: "4", category: "Monitoring & Wireless", name: "SmallHD Cine 7 Touchscreen Monitor + Teradek Bolt 4K LT 750", serialNumber: "TRD-4K-5521", pelicanCaseNo: "PEL-04-W", status: "Verified", notes: "Paired with zero latency wireless feed" },
      { id: "5", category: "Support & Rigging", name: "O'Connor Ultimate 1040 Fluid Head + 30L Carbon Fiber Tripod", serialNumber: "OCN-1040-128", pelicanCaseNo: "BAG-01-S", status: "Passed 100%", notes: "Smooth pan/tilt drag fluid dampening" },
    ],
  },
  redRaptor: {
    title: "RED V-Raptor 8K VV Anamorphic Cinema Kit",
    items: [
      { id: "1", category: "Camera Body", name: "RED V-Raptor 8K VV VistaVision Body", serialNumber: "RED-VRP-33109", pelicanCaseNo: "PEL-10-A", status: "Passed 100%", notes: "Black shading calibration up to date" },
      { id: "2", category: "Optics & Lenses", name: "Atlas Orion 2.0x Anamorphic Primes (40mm, 65mm, 100mm)", serialNumber: "ATL-ORN-8821", pelicanCaseNo: "PEL-11-L", status: "Calibrated", notes: "Full coverage on 8K VV 17:9 crop mode" },
      { id: "3", category: "Power & Battery", name: "3x Bebob V290 Micro High-Capacity V-Mount (294Wh)", serialNumber: "BEB-290-0041", pelicanCaseNo: "PEL-12-P", status: "Verified", notes: "High draw continuous rated" },
      { id: "4", category: "Monitoring & Wireless", name: "RED Touch 7.0\" LCD + Teradek Bolt 4K 1500 TX/RX", serialNumber: "RED-T7-6712", pelicanCaseNo: "PEL-13-W", status: "Verified", notes: "Includes sunhood and LEMO control cables" },
      { id: "5", category: "Support & Rigging", name: "Tilta Camera Cage System with 15mm Baseplate & Top Handle", serialNumber: "TLT-RAP-991", pelicanCaseNo: "PEL-10-A", status: "Verified", notes: "Full quick-release dovetail included" },
    ],
  },
};

export default function CallsheetManifestClient() {
  // Metadata state
  const [productionTitle, setProductionTitle] = useState("REQUIEM FOR DREAMS (Commercial)");
  const [director, setDirector] = useState("Christopher Nolan");
  const [cinematographer, setCinematographer] = useState("Hoyte van Hoytema, ASC, NSC");
  const [firstAC, setFirstAC] = useState("Marcus Vance");
  const [orderRef, setOrderRef] = useState("AUREVIA-ORD-88492");
  const [shootDates, setShootDates] = useState("Sept 15 – Sept 18, 2026 (4 Days)");
  const [location, setLocation] = useState("Stage 4, Pinewood Studios / Downtown Night Exterior");
  
  // Items state
  const [items, setItems] = useState<ManifestItem[]>(PRESET_PACKAGES.arriAlexa35.items);

  // Add Item
  const handleAddItem = () => {
    const newItem: ManifestItem = {
      id: Date.now().toString(),
      category: "Optics & Lenses",
      name: "New Equipment Item",
      serialNumber: "SN-PENDING",
      pelicanCaseNo: "PEL-XX",
      status: "Verified",
      notes: "Cleaned & inspected",
    };
    setItems((prev) => [...prev, newItem]);
  };

  // Remove Item
  const handleRemoveItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  // Update Item
  const handleUpdateItem = (id: string, field: keyof ManifestItem, value: string) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  // Load Preset
  const handleLoadPreset = (key: string) => {
    if (PRESET_PACKAGES[key]) {
      setItems(PRESET_PACKAGES[key].items);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-8">
      {/* ─── ACTION BAR (PRESETS & PRINT CONTROLS) ─── */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-white/10 bg-neutral-900/80 p-4 backdrop-blur print:hidden">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-mono text-neutral-400">Load Preset Kit:</span>
          <button
            onClick={() => handleLoadPreset("arriAlexa35")}
            className="px-3 py-1.5 rounded-lg border border-amber-400/40 bg-amber-400/10 text-amber-300 text-xs font-mono font-bold hover:bg-amber-400/20 transition"
          >
            ARRI Alexa 35 Kit
          </button>
          <button
            onClick={() => handleLoadPreset("redRaptor")}
            className="px-3 py-1.5 rounded-lg border border-cyan-400/40 bg-cyan-400/10 text-cyan-300 text-xs font-mono font-bold hover:bg-cyan-400/20 transition"
          >
            RED V-Raptor Kit
          </button>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleAddItem}
            className="flex items-center gap-1.5 rounded-xl border border-white/20 bg-neutral-800 px-3.5 py-2 text-xs font-bold text-white hover:bg-neutral-700 transition"
          >
            <Plus className="h-4 w-4" /> Add Gear Line
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-2 rounded-xl bg-linear-to-r from-amber-400 to-amber-500 px-5 py-2 text-xs font-black uppercase tracking-wider text-black hover:opacity-90 shadow-lg shadow-amber-400/20 transition"
          >
            <Printer className="h-4 w-4" /> Print / Export PDF
          </button>
        </div>
      </div>

      {/* ─── PRINTABLE MANIFEST SLATE CONTAINER ─── */}
      <div className="rounded-3xl border border-white/20 bg-neutral-950 p-6 sm:p-10 shadow-2xl space-y-8 print:border-black print:bg-white print:text-black print:p-2 print:shadow-none">
        {/* HEADER SLATE BANNER */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b-2 border-amber-400/80 pb-6 gap-4 print:border-black">
          <div>
            <div className="flex items-center gap-3">
              <span className="h-3.5 w-3.5 rounded-full bg-amber-400 print:bg-black" />
              <h2 className="text-2xl sm:text-3xl font-black tracking-widest uppercase text-white print:text-black font-mono">
                AUREVIA CINEMA RENTALS
              </h2>
            </div>
            <p className="mt-1 text-xs font-mono text-neutral-400 print:text-neutral-700">
              OFFICIAL CAMERA DEPARTMENT EQUIPMENT MANIFEST &amp; TECHNICAL DISPATCH CERTIFICATE
            </p>
          </div>

          <div className="text-right font-mono text-xs">
            <div className="inline-block px-3 py-1 rounded bg-amber-400/10 border border-amber-400/40 text-amber-300 print:border-black print:text-black font-bold">
              ORDER REF: {orderRef}
            </div>
            <p className="mt-1 text-[10px] text-neutral-400 print:text-neutral-600">
              GENERATED: {new Date().toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
            </p>
          </div>
        </div>

        {/* PRODUCTION METADATA GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 rounded-2xl border border-white/10 bg-neutral-900/50 p-5 print:border-neutral-300 print:bg-neutral-50 text-xs font-mono">
          <div className="space-y-1">
            <label className="text-[10px] text-neutral-400 print:text-neutral-600 uppercase">Production Project:</label>
            <input
              type="text"
              value={productionTitle}
              onChange={(e) => setProductionTitle(e.target.value)}
              className="w-full bg-transparent font-bold text-white print:text-black focus:outline-none focus:border-b border-amber-400"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] text-neutral-400 print:text-neutral-600 uppercase">Director:</label>
            <input
              type="text"
              value={director}
              onChange={(e) => setDirector(e.target.value)}
              className="w-full bg-transparent font-bold text-white print:text-black focus:outline-none focus:border-b border-amber-400"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] text-neutral-400 print:text-neutral-600 uppercase">Order / Booking ID:</label>
            <input
              type="text"
              value={orderRef}
              onChange={(e) => setOrderRef(e.target.value)}
              className="w-full bg-transparent font-bold text-cyan-300 print:text-black focus:outline-none focus:border-b border-amber-400"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] text-neutral-400 print:text-neutral-600 uppercase">Director of Photography (DP):</label>
            <input
              type="text"
              value={cinematographer}
              onChange={(e) => setCinematographer(e.target.value)}
              className="w-full bg-transparent font-bold text-white print:text-black focus:outline-none focus:border-b border-amber-400"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] text-neutral-400 print:text-neutral-600 uppercase">1st Assistant Camera (1st AC):</label>
            <input
              type="text"
              value={firstAC}
              onChange={(e) => setFirstAC(e.target.value)}
              className="w-full bg-transparent font-bold text-white print:text-black focus:outline-none focus:border-b border-amber-400"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] text-neutral-400 print:text-neutral-600 uppercase">Shoot Dates &amp; Duration:</label>
            <input
              type="text"
              value={shootDates}
              onChange={(e) => setShootDates(e.target.value)}
              className="w-full bg-transparent font-bold text-amber-300 print:text-black focus:outline-none focus:border-b border-amber-400"
            />
          </div>

          <div className="space-y-1 sm:col-span-3">
            <label className="text-[10px] text-neutral-400 print:text-neutral-600 uppercase">Stage / Location:</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full bg-transparent font-bold text-white print:text-black focus:outline-none focus:border-b border-amber-400"
            />
          </div>
        </div>

        {/* EQUIPMENT TABLE */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono border-collapse">
            <thead>
              <tr className="border-b-2 border-white/20 print:border-black text-neutral-400 print:text-black text-[11px] uppercase tracking-wider">
                <th className="py-3 px-2">#</th>
                <th className="py-3 px-2">Category</th>
                <th className="py-3 px-2">Equipment Description &amp; Model</th>
                <th className="py-3 px-2">Serial Number</th>
                <th className="py-3 px-2">Pelican Case #</th>
                <th className="py-3 px-2">Check Status</th>
                <th className="py-3 px-2">Notes</th>
                <th className="py-3 px-2 print:hidden">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10 print:divide-neutral-300">
              {items.map((item, idx) => (
                <tr key={item.id} className="hover:bg-white/5 print:hover:bg-transparent">
                  <td className="py-3 px-2 font-bold text-neutral-500">{idx + 1}</td>
                  <td className="py-3 px-2 text-neutral-300 print:text-neutral-700">
                    <input
                      type="text"
                      value={item.category}
                      onChange={(e) => handleUpdateItem(item.id, "category", e.target.value as any)}
                      className="bg-transparent text-white print:text-black w-28 focus:outline-none"
                    />
                  </td>
                  <td className="py-3 px-2 font-bold text-white print:text-black">
                    <input
                      type="text"
                      value={item.name}
                      onChange={(e) => handleUpdateItem(item.id, "name", e.target.value)}
                      className="bg-transparent text-white print:text-black w-full min-w-50 font-bold focus:outline-none"
                    />
                  </td>
                  <td className="py-3 px-2 text-amber-300 print:text-black">
                    <input
                      type="text"
                      value={item.serialNumber}
                      onChange={(e) => handleUpdateItem(item.id, "serialNumber", e.target.value)}
                      className="bg-transparent text-amber-300 print:text-black w-28 focus:outline-none"
                    />
                  </td>
                  <td className="py-3 px-2 text-cyan-300 print:text-black">
                    <input
                      type="text"
                      value={item.pelicanCaseNo}
                      onChange={(e) => handleUpdateItem(item.id, "pelicanCaseNo", e.target.value)}
                      className="bg-transparent text-cyan-300 print:text-black w-20 focus:outline-none font-bold"
                    />
                  </td>
                  <td className="py-3 px-2">
                    <span className="inline-flex items-center gap-1 text-emerald-400 print:text-black font-bold">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 print:text-black" />
                      {item.status}
                    </span>
                  </td>
                  <td className="py-3 px-2 text-neutral-400 print:text-neutral-600">
                    <input
                      type="text"
                      value={item.notes}
                      onChange={(e) => handleUpdateItem(item.id, "notes", e.target.value)}
                      className="bg-transparent text-neutral-300 print:text-black w-full min-w-37.5 focus:outline-none"
                    />
                  </td>
                  <td className="py-3 px-2 print:hidden">
                    <button
                      onClick={() => handleRemoveItem(item.id)}
                      className="text-neutral-500 hover:text-red-400 transition"
                      title="Remove item"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* BOTTOM SIGN-OFF CERTIFICATION & LEGAL ACKNOWLEDGEMENT */}
        <div className="border-t-2 border-white/20 pt-6 space-y-6 print:border-black">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-xs font-mono">
            {/* 1st AC / Crew Sign-off */}
            <div className="border border-white/10 rounded-xl p-4 bg-neutral-900/40 print:border-black print:bg-white space-y-4">
              <p className="font-bold text-white print:text-black uppercase">
                1. Camera Department Verification &amp; Acceptance
              </p>
              <p className="text-[11px] text-neutral-400 print:text-neutral-700 leading-relaxed">
                I confirm that all equipment, camera bodies, optics, and flight-cases listed above have been inspected on the test bench, back-focus verified, sensor inspected for zero dust, and accepted in prime operational condition.
              </p>
              <div className="pt-6 flex justify-between items-end border-b border-dashed border-white/30 print:border-black pb-2">
                <span className="text-[10px] text-neutral-400 print:text-black">1st AC Signature:</span>
                <span className="font-serif italic text-amber-300 print:text-black text-sm">{firstAC}</span>
              </div>
            </div>

            {/* AUREVIA Dispatch Lead Sign-off */}
            <div className="border border-white/10 rounded-xl p-4 bg-neutral-900/40 print:border-black print:bg-white space-y-4">
              <p className="font-bold text-white print:text-black uppercase">
                2. AUREVIA Technical Dispatch &amp; QA Officer
              </p>
              <p className="text-[11px] text-neutral-400 print:text-neutral-700 leading-relaxed">
                All serial numbers, firmware versions, battery charge capacities, and Pelican waterproof seals have passed AUREVIA Tier-1 Rental Standards.
              </p>
              <div className="pt-6 flex justify-between items-end border-b border-dashed border-white/30 print:border-black pb-2">
                <span className="text-[10px] text-neutral-400 print:text-black">QA Technician Signature:</span>
                <span className="font-serif italic text-emerald-400 print:text-black text-sm">Sachin (Head of Optics)</span>
              </div>
            </div>
          </div>

          {/* WATERMARK FOOTER */}
          <div className="flex justify-between items-center text-[10px] font-mono text-neutral-500 print:text-black">
            <span>AUREVIA LUXURY CAMERA RENTALS &middot; 24/7 PRODUCTION SUPPORT: +1 (800) 555-CINE</span>
            <span>PAGE 1 OF 1 &middot; TAMPER-EVIDENT MANIFEST</span>
          </div>
        </div>
      </div>
    </div>
  );
}
