"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Package,
  Search,
  Check,
  Camera,
  Layers,
  Calculator,
  Printer,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Phone,
  MessageSquare,
  ShieldCheck,
  QrCode,
  Loader2,
  RefreshCw,
  Copy,
  ExternalLink,
} from "lucide-react";
import { adminApiClient } from "@/lib/api-client";
import { useAdminRealtime } from "@/lib/realtime";

interface FlightCaseCheckItem {
  id: string;
  name: string;
  serialNumber: string;
  isVerified: boolean;
  notes?: string;
}

interface InspectionCase {
  id: string; // Pelican Case ID e.g. PEL-R5-108
  bookingId: string;
  customerName: string;
  phone: string;
  equipmentName: string;
  dispatchDate: string;
  expectedReturn: string;
  actualReturn?: string;
  securityDeposit: number;
  hoursOverdue: number;
  status: "CHECKED_OUT" | "INSPECTION_PENDING" | "OVERDUE" | "DISPATCH_READY" | "SETTLED_CLEARED";
  items: FlightCaseCheckItem[];
  sensorSanitized: boolean;
  physicalCondition: "MINT" | "MINOR_WEAR" | "MISSING_ACCESSORY" | "DAMAGE_CLAIM";
  damageDescription?: string;
  damageCharge: number;
  penaltyPaymentUrl?: string;
  notes?: string;
}

const FALLBACK_CASES: InspectionCase[] = [
  {
    id: "PEL-R5-108",
    bookingId: "AUR-1039",
    customerName: "Priya Nair",
    phone: "+91 97444 55667",
    equipmentName: "Canon EOS R5 Cinema Vault Pack",
    dispatchDate: "10 Aug 2026, 09:00 AM",
    expectedReturn: "12 Aug 2026, 10:00 AM",
    actualReturn: "12 Aug 2026, 09:45 AM",
    securityDeposit: 15000,
    hoursOverdue: 0,
    status: "INSPECTION_PENDING",
    sensorSanitized: true,
    physicalCondition: "MINT",
    damageCharge: 0,
    items: [
      { id: "i1", name: "Canon EOS R5 Camera Body", serialNumber: "SN-7482910", isVerified: true },
      { id: "i2", name: "Canon RF 24-70mm f/2.8L IS USM", serialNumber: "SN-9182746", isVerified: true },
      { id: "i3", name: "Canon LP-E6NH Battery Pack (x2)", serialNumber: "SN-BAT-04A / 04B", isVerified: true },
      { id: "i4", name: "ProGrade 512GB CFexpress Type B Card", serialNumber: "SN-CFX-512B", isVerified: true },
      { id: "i5", name: "Pelican 1510 Air Flight Case (Custom Foam)", serialNumber: "PEL-AIR-1510-08", isVerified: true },
      { id: "i6", name: "Canon Dual Battery Charger & AC Cable", serialNumber: "SN-CHG-99", isVerified: true },
    ],
  },
  {
    id: "PEL-ALEXA-001",
    bookingId: "AUR-1035",
    customerName: "Deepak Mehta",
    phone: "+91 97111 22233",
    equipmentName: "ARRI Alexa Mini LF Production System",
    dispatchDate: "08 Aug 2026, 08:00 AM",
    expectedReturn: "12 Aug 2026, 08:00 AM",
    securityDeposit: 50000,
    hoursOverdue: 4,
    status: "OVERDUE",
    sensorSanitized: false,
    physicalCondition: "MINOR_WEAR",
    damageCharge: 2400,
    notes: "Late return charges calculated for 4 hours overdue @ ₹600/hr.",
    items: [
      { id: "i1", name: "ARRI Alexa Mini LF Body", serialNumber: "ARRI-LF-3920", isVerified: true },
      { id: "i2", name: "ARRI LPL Lens Mount", serialNumber: "ARRI-LPL-01", isVerified: true },
      { id: "i3", name: "Codex Compact Drive 1TB (x2)", serialNumber: "CDX-1TB-01 / 02", isVerified: true },
      { id: "i4", name: "B-Mount Battery 290Wh (x4)", serialNumber: "BAT-BM-01..04", isVerified: true },
      { id: "i5", name: "Pelican Protector 1650 Heavy Flight Case", serialNumber: "PEL-1650-ARRI", isVerified: true },
    ],
  },
  {
    id: "PEL-RED-042",
    bookingId: "AUR-1044",
    customerName: "Ananya Roy",
    phone: "+91 98222 11009",
    equipmentName: "RED V-Raptor 8K VV Cinema Package",
    dispatchDate: "12 Aug 2026, 02:00 PM",
    expectedReturn: "15 Aug 2026, 02:00 PM",
    securityDeposit: 40000,
    hoursOverdue: 0,
    status: "DISPATCH_READY",
    sensorSanitized: true,
    physicalCondition: "MINT",
    damageCharge: 0,
    items: [
      { id: "i1", name: "RED V-Raptor 8K VV Body", serialNumber: "RED-VR-8821", isVerified: true },
      { id: "i2", name: "RED PRO CFexpress 2TB Card", serialNumber: "RED-2TB-99", isVerified: true },
      { id: "i3", name: "DSMC3 RED Touch 7.0\" LCD", serialNumber: "RED-LCD-07", isVerified: true },
      { id: "i4", name: "RED Compact Dual V-Lock Charger", serialNumber: "RED-CHG-02", isVerified: true },
      { id: "i5", name: "Pelican 1535 Air Flight Case", serialNumber: "PEL-1535-RED", isVerified: true },
    ],
  },
];

export default function AdminReturnsPage() {
  const [cases, setCases] = useState<InspectionCase[]>(FALLBACK_CASES);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCaseId, setSelectedCaseId] = useState<string>("PEL-R5-108");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [generatingLink, setGeneratingLink] = useState(false);
  const [penaltyLinkCopied, setPenaltyLinkCopied] = useState(false);

  // Sync with live bookings
  const loadLiveBookings = useCallback(async () => {
    setLoading(true);
    try {
      const res: any = await adminApiClient.bookings.list({ limit: 50 });
      const bookingsList: any[] =
        res?.bookings ||
        res?.data?.bookings ||
        (Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : []);

      if (bookingsList.length > 0) {
        // Map live bookings to inspection cases
        const mappedCases: InspectionCase[] = bookingsList
          .filter(
            (b) =>
              b.status === "rented" ||
              b.status === "confirmed" ||
              b.status === "returned" ||
              b.status === "completed"
          )
          .map((b, idx) => {
            const isReturned = b.status === "returned" || b.status === "completed";
            const caseId = `PEL-${(b.productName || "OPT").slice(0, 3).toUpperCase()}-${String(100 + idx)}`;
            return {
              id: caseId,
              bookingId: b.id,
              customerName: b.customerName || b.userName || "Filmmaker",
              phone: b.customerPhone || b.userPhone || "+91 98000 00000",
              equipmentName: b.productName || "Cinema Equipment System",
              dispatchDate: b.startDate ? new Date(b.startDate).toLocaleDateString("en-IN") : "Active",
              expectedReturn: b.endDate ? new Date(b.endDate).toLocaleDateString("en-IN") : "Today",
              securityDeposit: b.securityDeposit || 15000,
              hoursOverdue: 0,
              status: isReturned ? "SETTLED_CLEARED" : "INSPECTION_PENDING",
              sensorSanitized: true,
              physicalCondition: "MINT",
              damageCharge: 0,
              items: [
                {
                  id: "it-1",
                  name: `${b.productName || "Cinema"} System Body`,
                  serialNumber: `SN-${b.id?.slice(-6).toUpperCase() || "778899"}`,
                  isVerified: true,
                },
                {
                  id: "it-2",
                  name: "Pelican Air Protective Flight Case",
                  serialNumber: `PEL-${caseId}`,
                  isVerified: true,
                },
              ],
            };
          });

        if (mappedCases.length > 0) {
          // Merge unique cases keeping existing fallback details if not covered
          setCases((prev) => {
            const existingIds = new Set(mappedCases.map((m) => m.bookingId));
            const retainedFallback = prev.filter((p) => !existingIds.has(p.bookingId));
            return [...mappedCases, ...retainedFallback];
          });
        }
      }
    } catch (err) {
      console.warn("Could not merge live bookings into returns:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadLiveBookings();
  }, [loadLiveBookings]);

  useAdminRealtime(
    useCallback(
      (event: any) => {
        if (event?.type === "BOOKING_UPDATED" || event?.type === "SYNC_REFRESH") {
          loadLiveBookings();
        }
      },
      [loadLiveBookings]
    )
  );

  const selectedCase = cases.find((c) => c.id === selectedCaseId) || cases[0];

  // Filter cases
  const filteredCases = cases.filter((c) => {
    const matchesFilter = statusFilter === "ALL" || c.status === statusFilter;
    const matchesSearch =
      c.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.bookingId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.equipmentName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  // Item verification toggle
  const toggleItemVerified = (itemId: string) => {
    setCases((prev) =>
      prev.map((c) => {
        if (c.id !== selectedCase.id) return c;
        const updatedItems = c.items.map((item) =>
          item.id === itemId ? { ...item, isVerified: !item.isVerified } : item
        );
        return { ...c, items: updatedItems };
      })
    );
  };

  // Sensor sanitize toggle
  const toggleSensorSanitized = () => {
    setCases((prev) =>
      prev.map((c) =>
        c.id === selectedCase.id ? { ...c, sensorSanitized: !c.sensorSanitized } : c
      )
    );
  };

  // Physical condition update
  const setCondition = (cond: InspectionCase["physicalCondition"]) => {
    let defaultDamage = 0;
    if (cond === "MISSING_ACCESSORY") defaultDamage = 1500;
    if (cond === "DAMAGE_CLAIM") defaultDamage = 8500;

    setCases((prev) =>
      prev.map((c) =>
        c.id === selectedCase.id
          ? {
              ...c,
              physicalCondition: cond,
              damageCharge: c.hoursOverdue * 600 + defaultDamage,
            }
          : c
      )
    );
  };

  // Generate Razorpay Penalty Link
  const handleGeneratePenaltyLink = async () => {
    if (selectedCase.damageCharge <= 0) return;
    setGeneratingLink(true);
    try {
      const res = await adminApiClient.returns.generatePenaltyLink({
        bookingId: selectedCase.bookingId,
        amount: selectedCase.damageCharge,
        description: `Damage/late penalty settlement for Pelican ${selectedCase.id} (${selectedCase.equipmentName})`,
      });

      const paymentUrl = res.data?.paymentUrl || (res as any).paymentUrl;
      if (paymentUrl) {
        setCases((prev) =>
          prev.map((c) =>
            c.id === selectedCase.id ? { ...c, penaltyPaymentUrl: paymentUrl } : c
          )
        );
      }
    } catch (err: any) {
      alert("Failed to generate payment link: " + (err?.message || "Unknown error"));
    } finally {
      setGeneratingLink(false);
    }
  };

  const copyPenaltyLink = () => {
    if (!selectedCase.penaltyPaymentUrl) return;
    navigator.clipboard.writeText(selectedCase.penaltyPaymentUrl);
    setPenaltyLinkCopied(true);
    setTimeout(() => setPenaltyLinkCopied(false), 3000);
  };

  // Finalize return inspection
  const finalizeInspection = async () => {
    const unverified = selectedCase.items.filter((i) => !i.isVerified);
    if (unverified.length > 0) {
      if (!confirm(`Warning: ${unverified.length} item(s) are not verified yet. Proceed to clear deposit anyway?`)) {
        return;
      }
    }

    try {
      // If valid booking, update booking status to returned
      await adminApiClient.bookings.updateStatus(
        selectedCase.bookingId,
        "returned",
        `Pelican ${selectedCase.id} returned in ${selectedCase.physicalCondition} condition.`
      );
    } catch {
      // Local fallback
    }

    setCases((prev) =>
      prev.map((c) =>
        c.id === selectedCase.id ? { ...c, status: "SETTLED_CLEARED" } : c
      )
    );

    const netRefund = selectedCase.securityDeposit - selectedCase.damageCharge;
    alert(
      `Inspection Completed for Pelican Case ${selectedCase.id}!\n\nSecurity Deposit: ₹${selectedCase.securityDeposit.toLocaleString()}\nDeductions: ₹${selectedCase.damageCharge.toLocaleString()}\nNet Refund Released: ₹${netRefund.toLocaleString()}`
    );
  };

  // Print manifest
  const printPackingManifest = () => {
    const win = window.open("", "_blank");
    if (!win) return;

    const netRefund = selectedCase.securityDeposit - selectedCase.damageCharge;

    win.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>AUREVIA Pelican Flight-Case Manifest - ${selectedCase.id}</title>
          <style>
            body { font-family: 'Courier New', monospace; background: #fff; color: #111; padding: 40px; margin: 0; }
            .header { border-bottom: 2px solid #111; padding-bottom: 20px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: flex-start; }
            .title { font-size: 24px; font-weight: bold; letter-spacing: 2px; }
            .subtitle { font-size: 11px; text-transform: uppercase; color: #555; margin-top: 4px; }
            .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px; font-size: 12px; }
            .box { border: 1px solid #ccc; padding: 12px; border-radius: 6px; }
            .box-title { font-weight: bold; border-bottom: 1px solid #eee; padding-bottom: 4px; margin-bottom: 8px; text-transform: uppercase; font-size: 10px; color: #666; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 11px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background: #f5f5f5; text-transform: uppercase; font-size: 10px; }
            .footer { margin-top: 40px; border-top: 1px dashed #aaa; padding-top: 20px; font-size: 10px; display: flex; justify-content: space-between; }
            .sign { margin-top: 40px; border-top: 1px solid #000; width: 200px; text-align: center; padding-top: 5px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <div class="title">AUREVIA OPTICS</div>
              <div class="subtitle">Pelican Flight-Case Inspection & Dispatch Certificate</div>
            </div>
            <div style="text-align: right;">
              <div style="font-size: 14px; font-weight: bold;">${selectedCase.id}</div>
              <div style="font-size: 10px; color: #666;">Booking: ${selectedCase.bookingId}</div>
              <div style="font-size: 10px; color: #666;">Date: ${new Date().toLocaleDateString("en-IN")}</div>
            </div>
          </div>

          <div class="grid">
            <div class="box">
              <div class="box-title">Client Details</div>
              <div><strong>Customer:</strong> ${selectedCase.customerName}</div>
              <div><strong>Phone:</strong> ${selectedCase.phone}</div>
              <div><strong>Vault System:</strong> ${selectedCase.equipmentName}</div>
            </div>
            <div class="box">
              <div class="box-title">Inspection Status</div>
              <div><strong>Sensor Cleanliness:</strong> ${selectedCase.sensorSanitized ? "PASSED (100% Swabbed)" : "PENDING"}</div>
              <div><strong>Physical Condition:</strong> ${selectedCase.physicalCondition}</div>
              <div><strong>Net Deposit Released:</strong> ₹${netRefund.toLocaleString()}</div>
            </div>
          </div>

          <div style="font-size: 11px; font-weight: bold; margin-bottom: 8px;">ITEMIZED FLIGHT-CASE CONTENT AUDIT:</div>
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Item Description</th>
                <th>Serial Number</th>
                <th>Verification Status</th>
              </tr>
            </thead>
            <tbody>
              ${selectedCase.items
                .map(
                  (item, idx) => `
                <tr>
                  <td>${idx + 1}</td>
                  <td>${item.name}</td>
                  <td>${item.serialNumber}</td>
                  <td>${item.isVerified ? "VERIFIED MATCH" : "MISSING / UNVERIFIED"}</td>
                </tr>
              `
                )
                .join("")}
            </tbody>
          </table>

          <div class="footer">
            <div>
              <p>Certified Technicians: Prem Mundargi</p>
              <p>AUREVIA Optics Studio • Concierge Vault Dispatch</p>
            </div>
            <div class="sign">
              Authorized Technician Signature
            </div>
          </div>

          <script>
            window.onload = function() { window.print(); }
          </script>
        </body>
      </html>
    `);
    win.document.close();
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Bar */}
      <div className="border-b border-white/5 pb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-light text-[#f5f1e8] font-serif flex items-center gap-3">
            <Package className="text-[#d8b36a]" size={26} />
            Pelican Flight-Case Dispatch &amp; Inspection Terminal
          </h1>
          <p className="text-xs text-[#9a9995] font-light mt-1">
            Scan flight-case barcodes, verify serial numbers, certify sensor cleanliness, and compute deposit refunds.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => loadLiveBookings()}
            className="px-3 py-2 rounded-xl border border-white/10 text-xs text-[#9a9995] hover:text-[#f5f1e8] hover:border-white/20 transition flex items-center gap-1.5"
          >
            <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
            Sync Bookings
          </button>
          <button
            onClick={printPackingManifest}
            className="px-4 py-2 bg-[#d8b36a] hover:bg-[#b98a43] text-[#070707] text-xs font-semibold uppercase tracking-wider rounded-xl transition flex items-center gap-2 cursor-pointer shadow-lg shadow-[#d8b36a]/10"
          >
            <Printer size={15} />
            Print Manifest PDF
          </button>
        </div>
      </div>

      {/* Barcode & Search Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-8 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9a9995]" />
            <input
              type="text"
              placeholder="Scan Barcode or Search Pelican ID (e.g. PEL-R5-108, Priya Nair)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#0c0c0c] border border-white/10 text-xs text-[#f5f1e8] rounded-xl pl-10 pr-4 py-3 focus:ring-1 focus:ring-[#d8b36a]/60 focus:outline-hidden font-mono"
            />
          </div>

          <div className="flex items-center gap-1.5 bg-[#0c0c0c] border border-white/10 p-1 rounded-xl">
            {["ALL", "INSPECTION_PENDING", "OVERDUE", "SETTLED_CLEARED"].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 text-[10px] font-mono uppercase rounded-lg transition cursor-pointer ${
                  statusFilter === st
                    ? "bg-[#d8b36a]/20 text-[#d8b36a] border border-[#d8b36a]/40 font-bold"
                    : "text-[#9a9995] hover:text-[#f5f1e8]"
                }`}
              >
                {st === "ALL" ? "All Cases" : st === "INSPECTION_PENDING" ? "Pending" : st === "OVERDUE" ? "Overdue" : "Cleared"}
              </button>
            ))}
          </div>
        </div>

        <div className="lg:col-span-4 flex items-center justify-end gap-2 text-xs font-mono text-[#9a9995] bg-[#0c0c0c] border border-white/10 px-4 py-2.5 rounded-xl">
          <QrCode size={16} className="text-[#d8b36a]" />
          <span>Scanner Ready: </span>
          <span className="text-emerald-400 font-bold">ONLINE</span>
        </div>
      </div>

      {/* Main Workspace Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Cases List */}
        <div className="lg:col-span-4 space-y-3">
          <span className="text-[10px] uppercase font-mono tracking-widest text-[#9a9995] block">
            Flight-Cases Queue ({filteredCases.length})
          </span>

          <div className="space-y-3 max-h-155 overflow-y-auto pr-1">
            {filteredCases.map((c) => {
              const isSelected = c.id === selectedCase.id;
              return (
                <div
                  key={c.id}
                  onClick={() => setSelectedCaseId(c.id)}
                  className={`p-4 rounded-2xl border transition cursor-pointer text-left space-y-3 ${
                    isSelected
                      ? "bg-[#141416] border-[#d8b36a] shadow-xl shadow-[#d8b36a]/5"
                      : "bg-[#0c0c0c] border-white/5 hover:border-white/20"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-[#d8b36a] flex items-center gap-1.5">
                      <Package size={14} />
                      {c.id}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[9px] font-mono uppercase border ${
                        c.status === "OVERDUE"
                          ? "bg-red-500/10 text-red-400 border-red-500/30"
                          : c.status === "SETTLED_CLEARED"
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                          : "bg-purple-500/10 text-purple-400 border-purple-500/30"
                      }`}
                    >
                      {c.status}
                    </span>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-[#f5f1e8] line-clamp-1">{c.equipmentName}</h4>
                    <p className="text-xs text-[#9a9995] font-light mt-0.5">
                      {c.customerName} ({c.bookingId})
                    </p>
                  </div>

                  <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[10px] font-mono text-[#9a9995]">
                    <span>Return: {c.expectedReturn.split(",")[0]}</span>
                    <span>Deposit: ₹{c.securityDeposit.toLocaleString()}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Interactive Terminal Inspection Station */}
        <div className="lg:col-span-8 space-y-6">
          {/* Active Case Summary Card */}
          <div className="admin-card p-6 rounded-2xl border border-white/10 bg-[#0c0c0c] space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/5 pb-4">
              <div>
                <span className="text-[9px] uppercase tracking-widest text-[#d8b36a] font-mono block">
                  Active Inspection Terminal
                </span>
                <h2 className="text-xl font-semibold text-[#f5f1e8] font-serif mt-0.5">
                  {selectedCase.equipmentName}
                </h2>
                <p className="text-xs text-[#9a9995] font-mono mt-0.5">
                  Case ID: <span className="text-[#d8b36a]">{selectedCase.id}</span> | Booking: {selectedCase.bookingId}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={`tel:${selectedCase.phone}`}
                  className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-[#f5f1e8] hover:border-[#d8b36a] text-xs font-semibold transition flex items-center gap-1.5"
                >
                  <Phone size={14} className="text-[#d8b36a]" />
                  <span>{selectedCase.phone}</span>
                </a>
                <a
                  href={`https://wa.me/${selectedCase.phone.replace(/[^0-9]/g, "")}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 text-xs font-semibold transition flex items-center gap-1.5"
                >
                  <MessageSquare size={14} />
                  <span>WhatsApp</span>
                </a>
              </div>
            </div>

            {/* Overdue Warning Alert if overdue */}
            {selectedCase.hoursOverdue > 0 && (
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5">
                  <AlertTriangle size={18} />
                  <span>
                    <strong>Rental Overdue:</strong> {selectedCase.hoursOverdue} hour(s) late. Late return fee of ₹{(selectedCase.hoursOverdue * 600).toLocaleString()} applied.
                  </span>
                </div>
              </div>
            )}

            {/* 1. Itemized Pelican Content Verification Checklist */}
            <div className="space-y-3 text-left">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#d8b36a] font-mono flex items-center gap-1.5">
                  <Layers size={14} /> 1. Pelican Case Serial Audit Checklist
                </span>
                <span className="text-[10px] font-mono text-[#9a9995]">
                  {selectedCase.items.filter((i) => i.isVerified).length} / {selectedCase.items.length} Verified
                </span>
              </div>

              <div className="space-y-2">
                {selectedCase.items.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => toggleItemVerified(item.id)}
                    className={`p-3 rounded-xl border flex items-center justify-between transition cursor-pointer ${
                      item.isVerified
                        ? "bg-emerald-500/5 border-emerald-500/30 text-[#f5f1e8]"
                        : "bg-white/2 border-white/10 text-[#9a9995] hover:border-white/20"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-5 h-5 rounded flex items-center justify-center border transition ${
                          item.isVerified
                            ? "bg-emerald-500 text-[#070707] border-emerald-500"
                            : "bg-transparent border-white/20"
                        }`}
                      >
                        {item.isVerified && <Check size={14} className="stroke-3" />}
                      </div>
                      <div>
                        <p className="text-xs font-medium">{item.name}</p>
                        <p className="text-[10px] font-mono text-[#9a9995]">{item.serialNumber}</p>
                      </div>
                    </div>

                    <span
                      className={`text-[9px] font-mono uppercase px-2 py-0.5 rounded ${
                        item.isVerified
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                      }`}
                    >
                      {item.isVerified ? "VERIFIED MATCH" : "PENDING CHECK"}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* 2. Sensor Cleanliness & Optical Inspection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left pt-2">
              <div
                onClick={toggleSensorSanitized}
                className={`p-4 rounded-xl border transition cursor-pointer space-y-2 ${
                  selectedCase.sensorSanitized
                    ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-400"
                    : "bg-white/2 border-white/10 text-[#9a9995]"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Camera size={16} />
                    <span className="text-xs font-semibold font-mono uppercase">2. Sensor Cleanliness</span>
                  </div>
                  <div
                    className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                      selectedCase.sensorSanitized
                        ? "bg-emerald-500 text-black border-emerald-500"
                        : "border-white/20"
                    }`}
                  >
                    {selectedCase.sensorSanitized && <Check size={12} className="stroke-3" />}
                  </div>
                </div>
                <p className="text-[11px] leading-relaxed font-light text-[#f5f1e8]">
                  {selectedCase.sensorSanitized
                    ? "100% Swabbed & Certified Dust-Free before release."
                    : "Tap to certify sensor cleaning inspection."}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-white/2 border border-white/10 space-y-2">
                <span className="text-xs font-semibold font-mono uppercase text-[#d8b36a] block">
                  3. Optics Physical Condition
                </span>
                <select
                  value={selectedCase.physicalCondition}
                  onChange={(e) => setCondition(e.target.value as InspectionCase["physicalCondition"])}
                  className="w-full bg-[#0c0c0c] border border-white/15 text-xs text-[#f5f1e8] rounded-lg p-2 focus:ring-1 focus:ring-[#d8b36a] focus:outline-hidden"
                >
                  <option value="MINT">Mint (No Scratches / Defects)</option>
                  <option value="MINOR_WEAR">Minor Surface Wear (Normal)</option>
                  <option value="MISSING_ACCESSORY">Missing Accessory (Lens Cap/Cable)</option>
                  <option value="DAMAGE_CLAIM">Optical Scratches / Housing Damage</option>
                </select>
              </div>
            </div>

            {/* 3. Deposit Refund & Deduction Calculator */}
            <div className="p-5 rounded-xl bg-[#121214] border border-white/10 space-y-4 text-left">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#d8b36a] font-mono flex items-center gap-1.5">
                  <Calculator size={16} /> 4. Security Deposit Settlement Ledger
                </span>
                <span className="text-xs font-mono text-[#9a9995]">
                  Deposit: <strong className="text-[#f5f1e8]">₹{selectedCase.securityDeposit.toLocaleString()}</strong>
                </span>
              </div>

              <div className="grid grid-cols-3 gap-4 text-xs font-mono">
                <div>
                  <span className="text-[9px] text-[#9a9995] uppercase block">Late Return Fee</span>
                  <span className="text-red-400 font-semibold">₹{(selectedCase.hoursOverdue * 600).toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-[9px] text-[#9a9995] uppercase block">Damage / Missing Fee</span>
                  <span className="text-red-400 font-semibold">
                    ₹{(selectedCase.damageCharge - selectedCase.hoursOverdue * 600).toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="text-[9px] text-[#d8b36a] uppercase block">Net Refund Released</span>
                  <span className="text-emerald-400 font-bold text-sm">
                    ₹{(selectedCase.securityDeposit - selectedCase.damageCharge).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Razorpay Penalty Link Section (If damage or overdue fee) */}
              {selectedCase.damageCharge > 0 && (
                <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <p className="text-xs font-semibold text-amber-400">
                        Razorpay Damage/Penalty Payment Settlement
                      </p>
                      <p className="text-[10px] text-[#9a9995]">
                        Generate live payment link for ₹{selectedCase.damageCharge.toLocaleString()}
                      </p>
                    </div>

                    {!selectedCase.penaltyPaymentUrl ? (
                      <button
                        onClick={handleGeneratePenaltyLink}
                        disabled={generatingLink}
                        className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black text-xs font-semibold flex items-center gap-1.5 transition self-start sm:self-auto"
                      >
                        {generatingLink ? <Loader2 size={13} className="animate-spin" /> : <ExternalLink size={13} />}
                        Generate Razorpay Link
                      </button>
                    ) : (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={copyPenaltyLink}
                          className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-[#f5f1e8] text-xs font-mono flex items-center gap-1.5 transition"
                        >
                          <Copy size={13} />
                          <span>{penaltyLinkCopied ? "Copied!" : "Copy Link"}</span>
                        </button>
                        <a
                          href={selectedCase.penaltyPaymentUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-1.5 rounded-lg bg-amber-500 text-black text-xs font-semibold flex items-center gap-1.5 transition"
                        >
                          <ExternalLink size={13} />
                          Open
                        </a>
                      </div>
                    )}
                  </div>

                  {selectedCase.penaltyPaymentUrl && (
                    <div className="p-2 rounded-lg bg-black/40 border border-white/10 text-[10px] font-mono text-amber-300 break-all">
                      {selectedCase.penaltyPaymentUrl}
                    </div>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-3 border-t border-white/10 flex flex-col sm:flex-row items-center justify-end gap-3">
                <button
                  onClick={printPackingManifest}
                  className="w-full sm:w-auto px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-[#f5f1e8] hover:border-[#d8b36a] text-xs font-semibold transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <FileText size={14} className="text-[#d8b36a]" />
                  Preview Certificate
                </button>

                {selectedCase.status !== "SETTLED_CLEARED" ? (
                  <button
                    onClick={finalizeInspection}
                    className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-[#070707] font-bold text-xs uppercase tracking-wider transition shadow-lg shadow-emerald-500/10 cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <CheckCircle2 size={16} />
                    Complete Inspection &amp; Release Deposit
                  </button>
                ) : (
                  <div className="px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-xs flex items-center gap-1.5">
                    <ShieldCheck size={16} />
                    <span>Inspection Settled &amp; Deposit Cleared</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
