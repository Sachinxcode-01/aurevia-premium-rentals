"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Package,
  Calendar,
  User,
  FileCheck2,
  ArrowRight,
  RefreshCw,
  Search,
  AlertTriangle,
  CheckCircle2,
  RotateCcw,
  ShieldCheck,
  Wrench,
  Clock,
  Sparkles,
} from "lucide-react";
import Link from "next/link";

interface ReturnItemDetail {
  productId: string;
  productName: string;
  productImage: string;
  quantity: number;
  unitPrice: number;
  inventoryUnitId: string;
  serialNumber: string;
  condition: string;
}

interface ReturnBookingData {
  booking: {
    id: string;
    referenceCode: string;
    status: string;
    paymentStatus: string;
    startDate: string;
    endDate: string;
    deliveryMethod: string;
    totalPayable: number;
    contactName: string;
    contactPhone: string;
    contactEmail: string;
    pickupHandoverAt?: string;
    returnInspectionAt?: string;
    returnRemarks?: string;
    lateFee?: number;
    damageCost?: number;
    damageDescription?: string;
    items: ReturnItemDetail[];
  };
  overdueDays: number;
  dailyLateFeeRate: number;
  estimatedLateFee: number;
  securityDepositHeld: number;
  canReturn: boolean;
  isAlreadyReturned: boolean;
}

interface BookingReturnClientProps {
  initialRef?: string;
}

export default function BookingReturnClient({
  initialRef = "",
}: BookingReturnClientProps) {
  const [refInput, setRefInput] = useState(initialRef);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<ReturnBookingData | null>(null);
  const [error, setError] = useState("");

  // Condition State
  const [condition, setCondition] = useState<"good" | "damaged">("good");
  const [damageDescription, setDamageDescription] = useState("");
  const [damageCost, setDamageCost] = useState<number>(0);
  const [lateFeeOverride, setLateFeeOverride] = useState<number | undefined>(undefined);

  // Return Inspection Checklist
  const [checklist, setChecklist] = useState({
    serialsMatched: false,
    allAccessoriesReturned: false,
    opticsInspected: false,
    diagnosticPassed: false,
  });

  const [staffName, setStaffName] = useState("Studio Return Staff");
  const [remarks, setRemarks] = useState("");
  const [processing, setProcessing] = useState(false);
  const [processSuccess, setProcessSuccess] = useState(false);

  const fetchReturnData = useCallback(async (ref: string) => {
    if (!ref) return;
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`/api/bookings/return?ref=${encodeURIComponent(ref)}`);
      const json = await res.json();

      if (!res.ok || !json.success) {
        setError(json.message || "Failed to find return record for this booking.");
        setData(null);
      } else {
        setData(json.data);
        setLateFeeOverride(json.data.estimatedLateFee);
        if (json.data.booking.damageCost) {
          setDamageCost(json.data.booking.damageCost);
          setCondition("damaged");
          setDamageDescription(json.data.booking.damageDescription || "");
        }
      }
    } catch (err: any) {
      setError(err.message || "Network error loading return portal.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (initialRef) {
      fetchReturnData(initialRef);
    }
  }, [initialRef, fetchReturnData]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (refInput.trim()) {
      fetchReturnData(refInput.trim());
    }
  };

  const activeLateFee =
    lateFeeOverride !== undefined
      ? lateFeeOverride
      : (data?.estimatedLateFee || 0);

  const activeDamageCost = condition === "damaged" ? (damageCost || 0) : 0;
  const totalDeductions = activeLateFee + activeDamageCost;
  const depositHeld = data?.securityDepositHeld || 5000;
  const netRefundableDeposit = Math.max(0, depositHeld - totalDeductions);
  const additionalBalanceDue = totalDeductions > depositHeld ? totalDeductions - depositHeld : 0;

  const allChecklistPassed =
    checklist.serialsMatched &&
    checklist.allAccessoriesReturned &&
    checklist.opticsInspected &&
    checklist.diagnosticPassed;

  const canAuthorizeReturn =
    data &&
    !data.isAlreadyReturned &&
    allChecklistPassed;

  const handleConfirmReturn = async () => {
    if (!data) return;
    if (!allChecklistPassed) {
      setError("Please complete all 4 return inspection checklist items.");
      return;
    }

    if (condition === "damaged" && !damageDescription.trim()) {
      setError("Please provide a description of the damage or defect.");
      return;
    }

    setProcessing(true);
    setError("");

    try {
      const res = await fetch("/api/bookings/return", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingId: data.booking.id,
          referenceCode: data.booking.referenceCode,
          condition,
          damageDescription,
          damageCost: activeDamageCost,
          lateFeeOverride: activeLateFee,
          remarks,
          checklist,
          staffName,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        setError(json.message || "Failed to complete return inspection.");
      } else {
        setProcessSuccess(true);
        fetchReturnData(data.booking.referenceCode);
      }
    } catch (err: any) {
      setError(err.message || "Network error processing return.");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070707] text-gray-100 selection:bg-gold-champagne selection:text-black py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/10 pb-6 gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-gold-champagne animate-pulse" />
              <span className="text-[10px] font-mono tracking-widest uppercase text-gold-champagne font-bold">
                Aurevia Studio Counter • Return &amp; Diagnostic Terminal
              </span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white mt-1">
              Equipment Return &amp; Diagnostic Inspection
            </h1>
            <p className="text-xs text-gray-400 mt-0.5">
              Inspect incoming gear, calculate overdue fees, assess physical condition, and release inventory back to active fleet.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/verify/booking"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-xs font-mono text-gray-300 hover:text-white transition"
            >
              Dispatch Terminal <ArrowRight size={13} />
            </Link>
          </div>
        </header>

        {/* Quick Search */}
        <form
          onSubmit={handleSearchSubmit}
          className="bg-[#0e0e0e] border border-white/10 p-3 rounded-xl flex flex-col sm:flex-row gap-2 items-center shadow-lg"
        >
          <div className="relative flex-1 w-full">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
            />
            <input
              type="text"
              value={refInput}
              onChange={(e) => setRefInput(e.target.value)}
              placeholder="Enter Booking Ref (e.g. AUR-1042) or Booking ID to begin inspection"
              className="w-full bg-black/60 border border-white/10 rounded-lg pl-9 pr-3 py-2 text-xs font-mono text-white placeholder-gray-500 focus:border-gold-champagne focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto px-5 py-2 rounded-lg bg-gold-champagne hover:bg-[#c3a05b] text-black font-mono font-bold text-xs uppercase tracking-wider transition flex items-center justify-center gap-1.5 disabled:opacity-50"
          >
            {loading ? <RefreshCw size={14} className="animate-spin" /> : <Search size={14} />}
            <span>Load Booking</span>
          </button>
        </form>

        {/* Error Alert */}
        {error && (
          <div className="bg-rose-500/10 border border-rose-500/30 text-rose-300 p-4 rounded-xl flex items-start gap-3 text-xs">
            <AlertTriangle size={18} className="shrink-0 text-rose-400 mt-0.5" />
            <div>
              <strong className="font-semibold block">Inspection Alert</strong>
              <span>{error}</span>
            </div>
          </div>
        )}

        {/* Success Alert */}
        {processSuccess && (
          <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 p-4 rounded-xl flex items-start gap-3 text-xs">
            <CheckCircle2 size={18} className="shrink-0 text-emerald-400 mt-0.5" />
            <div>
              <strong className="font-semibold block">Return Inspection Completed</strong>
              <span>
                Gear has been returned and status transitioned to{" "}
                <strong className="uppercase font-mono">COMPLETED</strong>. Hardware units are now released back to stock.
              </span>
            </div>
          </div>
        )}

        {/* Return Details Card */}
        {data && (
          <div className="space-y-6">
            {/* Status & Renter Summary */}
            <div className="bg-[#0f0f0f] border border-white/10 rounded-2xl p-5 shadow-xl space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
                <div>
                  <div className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">
                    Booking Reference
                  </div>
                  <div className="text-xl font-mono font-bold text-gold-champagne flex items-center gap-2">
                    <span>{data.booking.referenceCode}</span>
                    <span className="text-xs px-2 py-0.5 rounded font-mono uppercase bg-white/5 border border-white/10 text-gray-300">
                      ID: {data.booking.id.slice(0, 10)}...
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-mono font-semibold uppercase tracking-wider border ${
                      data.booking.status === "completed"
                        ? "bg-purple-500/15 text-purple-400 border-purple-500/30"
                        : data.overdueDays > 0
                        ? "bg-rose-500/15 text-rose-400 border-rose-500/30"
                        : "bg-blue-500/15 text-blue-400 border-blue-500/30"
                    }`}
                  >
                    {data.booking.status === "completed"
                      ? "RETURNED / COMPLETED"
                      : data.overdueDays > 0
                      ? `OVERDUE (${data.overdueDays} DAYS)`
                      : "RENTAL IN PROGRESS"}
                  </span>
                </div>
              </div>

              {/* Grid Info */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
                <div className="bg-black/40 border border-white/5 p-3 rounded-xl space-y-1">
                  <div className="text-gray-500 flex items-center gap-1">
                    <User size={12} className="text-gold-champagne" /> Customer Details
                  </div>
                  <div className="font-bold text-white text-sm">
                    {data.booking.contactName || "Verified Renter"}
                  </div>
                  <div className="text-gray-400 text-[11px]">{data.booking.contactPhone}</div>
                  <div className="text-gray-500 text-[10px] truncate">{data.booking.contactEmail}</div>
                </div>

                <div className="bg-black/40 border border-white/5 p-3 rounded-xl space-y-1">
                  <div className="text-gray-500 flex items-center gap-1">
                    <Calendar size={12} className="text-gold-champagne" /> Rental Window
                  </div>
                  <div className="text-gray-200">
                    <span className="text-gray-500">Scheduled End:</span> {data.booking.endDate}
                  </div>
                  <div className="text-gray-400 text-[11px]">
                    Dispatched: {data.booking.pickupHandoverAt ? new Date(data.booking.pickupHandoverAt).toLocaleDateString() : "Active"}
                  </div>
                </div>

                <div className="bg-black/40 border border-white/5 p-3 rounded-xl space-y-1">
                  <div className="text-gray-500 flex items-center gap-1">
                    <Clock size={12} className="text-gold-champagne" /> Timeline Status
                  </div>
                  {data.overdueDays > 0 ? (
                    <div className="text-rose-400 font-bold">
                      {data.overdueDays} Day(s) Overdue
                    </div>
                  ) : (
                    <div className="text-emerald-400 font-bold flex items-center gap-1">
                      <CheckCircle2 size={12} /> On-Time Return
                    </div>
                  )}
                  <div className="text-gray-400 text-[11px]">
                    Deposit: <strong className="text-white">₹{depositHeld.toLocaleString()}</strong>
                  </div>
                </div>
              </div>
            </div>

            {/* Overdue & Late Fee Assessment */}
            <div className="bg-[#111] border border-white/10 rounded-2xl p-5 shadow-xl space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock size={18} className="text-gold-champagne" />
                  <h3 className="font-mono text-sm font-bold text-white uppercase tracking-wider">
                    Late Fee &amp; Overdue Assessment
                  </h3>
                </div>
                <span className="text-xs font-mono text-gray-400">
                  Rate: ₹{data.dailyLateFeeRate}/day
                </span>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-black/50 p-4 rounded-xl border border-white/5">
                <div>
                  <div className="text-xs text-gray-300 font-mono">
                    {data.overdueDays > 0 ? (
                      <span>
                        Equipment is <strong className="text-rose-400">{data.overdueDays} days</strong> past scheduled return.
                      </span>
                    ) : (
                      <span className="text-emerald-400">
                        Equipment returned within the authorized rental window.
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-gray-500 mt-0.5">
                    Standard late fee is applied against renter security deposit. Staff may waive or adjust.
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-gray-400">Late Fee: ₹</span>
                  <input
                    type="number"
                    min={0}
                    value={activeLateFee}
                    onChange={(e) => setLateFeeOverride(Number(e.target.value) || 0)}
                    disabled={data.isAlreadyReturned}
                    className="w-28 bg-black border border-white/20 rounded-lg px-3 py-1 text-center font-mono text-sm font-bold text-gold-champagne focus:border-gold-champagne focus:outline-none disabled:opacity-50"
                  />
                </div>
              </div>
            </div>

            {/* Equipment Manifest */}
            <div className="bg-[#0f0f0f] border border-white/10 rounded-2xl p-5 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <Package size={18} className="text-gold-champagne" />
                  <h3 className="font-mono text-sm font-bold text-white uppercase tracking-wider">
                    Returned Items &amp; Assigned Serial Numbers
                  </h3>
                </div>
                <span className="text-xs text-gray-400 font-mono">
                  {data.booking.items.length} Unit(s) to Restock
                </span>
              </div>

              <div className="divide-y divide-white/5">
                {data.booking.items.map((item, idx) => (
                  <div
                    key={idx}
                    className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-black border border-white/10 flex items-center justify-center font-mono text-xs text-gray-400 shrink-0">
                        <Package size={20} className="text-gold-champagne" />
                      </div>
                      <div>
                        <div className="font-medium text-white text-sm">
                          {item.productName}
                        </div>
                        <div className="flex items-center gap-2 text-[11px] font-mono text-gray-400 mt-0.5">
                          <span>Unit ID: {item.inventoryUnitId}</span>
                          <span>•</span>
                          <span className="text-gold-champagne">Pre-Rental: {item.condition}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 sm:self-center">
                      <span className="text-xs font-mono text-gray-400">Barcode / SN:</span>
                      <span className="font-mono text-xs font-bold text-gold-champagne bg-black border border-gold-champagne/40 px-2.5 py-1 rounded">
                        {item.serialNumber}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Condition & Damage Assessment */}
            <div className="bg-[#0f0f0f] border border-white/10 rounded-2xl p-5 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <Wrench size={18} className="text-gold-champagne" />
                  <h3 className="font-mono text-sm font-bold text-white uppercase tracking-wider">
                    Diagnostic &amp; Physical Condition Assessment
                  </h3>
                </div>
              </div>

              {/* Radio Selector */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setCondition("good")}
                  disabled={data.isAlreadyReturned}
                  className={`p-4 rounded-xl border text-left transition flex items-start gap-3 cursor-pointer ${
                    condition === "good"
                      ? "bg-emerald-950/20 border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.1)]"
                      : "bg-black/40 border-white/10 hover:border-white/20"
                  }`}
                >
                  <CheckCircle2
                    size={20}
                    className={condition === "good" ? "text-emerald-400" : "text-gray-500"}
                  />
                  <div>
                    <strong className="block text-white text-xs font-mono font-bold uppercase">
                      Pristine / Good Condition
                    </strong>
                    <span className="text-gray-400 text-[11px] leading-relaxed block mt-0.5">
                      No physical defects or functional damage. Hardware ready to be released back to active rental fleet.
                    </span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setCondition("damaged")}
                  disabled={data.isAlreadyReturned}
                  className={`p-4 rounded-xl border text-left transition flex items-start gap-3 cursor-pointer ${
                    condition === "damaged"
                      ? "bg-rose-950/20 border-rose-500/50 shadow-[0_0_15px_rgba(244,63,94,0.1)]"
                      : "bg-black/40 border-white/10 hover:border-white/20"
                  }`}
                >
                  <AlertTriangle
                    size={20}
                    className={condition === "damaged" ? "text-rose-400" : "text-gray-500"}
                  />
                  <div>
                    <strong className="block text-white text-xs font-mono font-bold uppercase">
                      Damage / Wear Reported
                    </strong>
                    <span className="text-gray-400 text-[11px] leading-relaxed block mt-0.5">
                      Scratches on optical elements, impact damage, or functional faults requiring maintenance hold.
                    </span>
                  </div>
                </button>
              </div>

              {/* Damage Details Form */}
              {condition === "damaged" && (
                <div className="bg-rose-500/5 border border-rose-500/20 p-4 rounded-xl space-y-3">
                  <div>
                    <label className="block text-[10px] font-mono text-rose-300 uppercase tracking-wider mb-1">
                      Damage Description &amp; Fault Details
                    </label>
                    <textarea
                      rows={2}
                      value={damageDescription}
                      onChange={(e) => setDamageDescription(e.target.value)}
                      placeholder="Detail visible damage (e.g. Front lens element hairline scratch, Pelican case clasp broken)..."
                      disabled={data.isAlreadyReturned}
                      className="w-full bg-black border border-rose-500/30 rounded-lg p-2.5 text-xs text-white placeholder-gray-500 focus:border-rose-400 focus:outline-none"
                    />
                  </div>

                  <div className="flex items-center gap-3">
                    <label className="text-xs font-mono text-rose-300">
                      Estimated Repair / Replacement Deduction: ₹
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={damageCost}
                      onChange={(e) => setDamageCost(Number(e.target.value) || 0)}
                      disabled={data.isAlreadyReturned}
                      className="w-32 bg-black border border-rose-500/40 rounded-lg px-3 py-1 font-mono text-sm font-bold text-rose-400 focus:border-rose-400 focus:outline-none"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Pre-Return Diagnostic Checklist */}
            <div className="bg-[#0f0f0f] border border-white/10 rounded-2xl p-5 shadow-xl space-y-4">
              <div className="flex items-center gap-2 border-b border-white/10 pb-3">
                <FileCheck2 size={18} className="text-gold-champagne" />
                <h3 className="font-mono text-sm font-bold text-white uppercase tracking-wider">
                  Post-Flight Return Diagnostic Checklist
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <label className="flex items-start gap-3 p-3 bg-black/40 border border-white/5 rounded-xl cursor-pointer hover:border-gold-champagne/30 transition">
                  <input
                    type="checkbox"
                    checked={checklist.serialsMatched}
                    onChange={(e) =>
                      setChecklist({ ...checklist, serialsMatched: e.target.checked })
                    }
                    disabled={data.isAlreadyReturned}
                    className="mt-0.5 rounded border-white/20 accent-[#d8b36a] w-4 h-4"
                  />
                  <div>
                    <strong className="block text-white font-medium">
                      Hardware Serial Numbers Matched
                    </strong>
                    <span className="text-gray-400 text-[11px]">
                      Returned camera &amp; lens bodies match original dispatch barcode tags.
                    </span>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-3 bg-black/40 border border-white/5 rounded-xl cursor-pointer hover:border-gold-champagne/30 transition">
                  <input
                    type="checkbox"
                    checked={checklist.allAccessoriesReturned}
                    onChange={(e) =>
                      setChecklist({
                        ...checklist,
                        allAccessoriesReturned: e.target.checked,
                      })
                    }
                    disabled={data.isAlreadyReturned}
                    className="mt-0.5 rounded border-white/20 accent-[#d8b36a] w-4 h-4"
                  />
                  <div>
                    <strong className="block text-white font-medium">
                      All Accessories &amp; Cases Accounted For
                    </strong>
                    <span className="text-gray-400 text-[11px]">
                      Batteries, chargers, HDMI cables, lens caps, and Pelican case seals returned.
                    </span>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-3 bg-black/40 border border-white/5 rounded-xl cursor-pointer hover:border-gold-champagne/30 transition">
                  <input
                    type="checkbox"
                    checked={checklist.opticsInspected}
                    onChange={(e) =>
                      setChecklist({
                        ...checklist,
                        opticsInspected: e.target.checked,
                      })
                    }
                    disabled={data.isAlreadyReturned}
                    className="mt-0.5 rounded border-white/20 accent-[#d8b36a] w-4 h-4"
                  />
                  <div>
                    <strong className="block text-white font-medium">
                      Optical Inspection &amp; Sensor Check
                    </strong>
                    <span className="text-gray-400 text-[11px]">
                      Sensor filter and optical glass verified clean under counter inspection lamp.
                    </span>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-3 bg-black/40 border border-white/5 rounded-xl cursor-pointer hover:border-gold-champagne/30 transition">
                  <input
                    type="checkbox"
                    checked={checklist.diagnosticPassed}
                    onChange={(e) =>
                      setChecklist({
                        ...checklist,
                        diagnosticPassed: e.target.checked,
                      })
                    }
                    disabled={data.isAlreadyReturned}
                    className="mt-0.5 rounded border-white/20 accent-[#d8b36a] w-4 h-4"
                  />
                  <div>
                    <strong className="block text-white font-medium">
                      Power &amp; Diagnostic Boot Test
                    </strong>
                    <span className="text-gray-400 text-[11px]">
                      Gear powers on, passes electronic self-check, and records test clip.
                    </span>
                  </div>
                </label>
              </div>
            </div>

            {/* Financial Settlement Breakdown */}
            <div className="bg-[#111] border border-gold-champagne/30 rounded-2xl p-5 shadow-xl space-y-4">
              <div className="flex items-center gap-2 border-b border-white/10 pb-3">
                <Sparkles size={18} className="text-gold-champagne" />
                <h3 className="font-mono text-sm font-bold text-white uppercase tracking-wider">
                  Security Deposit Settlement Breakdown
                </h3>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs text-center">
                <div className="bg-black/50 p-3 rounded-xl border border-white/5">
                  <div className="text-gray-500 text-[10px]">DEPOSIT HELD</div>
                  <div className="text-base font-bold text-white mt-0.5">
                    ₹{depositHeld.toLocaleString()}
                  </div>
                </div>

                <div className="bg-black/50 p-3 rounded-xl border border-white/5">
                  <div className="text-gray-500 text-[10px]">LATE DEDUCTION</div>
                  <div className={`text-base font-bold mt-0.5 ${activeLateFee > 0 ? "text-rose-400" : "text-gray-300"}`}>
                    -₹{activeLateFee.toLocaleString()}
                  </div>
                </div>

                <div className="bg-black/50 p-3 rounded-xl border border-white/5">
                  <div className="text-gray-500 text-[10px]">DAMAGE DEDUCTION</div>
                  <div className={`text-base font-bold mt-0.5 ${activeDamageCost > 0 ? "text-rose-400" : "text-gray-300"}`}>
                    -₹{activeDamageCost.toLocaleString()}
                  </div>
                </div>

                <div className="bg-black/50 p-3 rounded-xl border border-gold-champagne/30">
                  <div className="text-gold-champagne text-[10px]">NET REFUNDABLE</div>
                  <div className="text-base font-bold text-emerald-400 mt-0.5">
                    ₹{netRefundableDeposit.toLocaleString()}
                  </div>
                </div>
              </div>

              {additionalBalanceDue > 0 && (
                <div className="bg-rose-500/10 border border-rose-500/30 p-3 rounded-xl flex items-center justify-between text-xs font-mono text-rose-300">
                  <span>Deductions exceed security deposit. Additional balance due:</span>
                  <span className="font-bold text-rose-400 text-sm">
                    ₹{additionalBalanceDue.toLocaleString()}
                  </span>
                </div>
              )}
            </div>

            {/* Authorize Return Action Box */}
            <div className="bg-[#121212] border border-gold-champagne/40 rounded-2xl p-5 shadow-2xl space-y-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="w-full sm:w-1/3">
                  <label className="block text-[10px] font-mono text-gold-champagne uppercase tracking-wider mb-1">
                    Staff Name / Counter ID
                  </label>
                  <input
                    type="text"
                    value={staffName}
                    onChange={(e) => setStaffName(e.target.value)}
                    disabled={data.isAlreadyReturned}
                    className="w-full bg-black border border-white/15 rounded-lg px-3 py-2 text-xs font-mono text-white focus:border-gold-champagne focus:outline-none disabled:opacity-50"
                  />
                </div>

                <div className="w-full sm:w-2/3">
                  <label className="block text-[10px] font-mono text-gray-400 uppercase tracking-wider mb-1">
                    Return Inspection Remarks (Optional)
                  </label>
                  <input
                    type="text"
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    placeholder="e.g. Unit returned in pristine condition. Cleaning completed."
                    disabled={data.isAlreadyReturned}
                    className="w-full bg-black border border-white/15 rounded-lg px-3 py-2 text-xs text-white placeholder-gray-500 focus:border-gold-champagne focus:outline-none disabled:opacity-50"
                  />
                </div>
              </div>

              {data.isAlreadyReturned ? (
                <div className="bg-purple-500/10 border border-purple-500/30 p-4 rounded-xl text-center space-y-1">
                  <div className="text-purple-400 font-mono font-bold text-sm uppercase flex items-center justify-center gap-2">
                    <ShieldCheck size={18} />
                    Equipment Returned &amp; Completed
                  </div>
                  <p className="text-xs text-gray-400">
                    Return inspection was finalized on{" "}
                    {data.booking.returnInspectionAt
                      ? new Date(data.booking.returnInspectionAt).toLocaleString()
                      : "earlier"}
                    . Hardware units have been released to inventory.
                  </p>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleConfirmReturn}
                  disabled={!canAuthorizeReturn || processing}
                  className={`w-full py-3.5 px-6 rounded-xl font-mono text-sm font-bold uppercase tracking-widest transition flex items-center justify-center gap-2 shadow-lg ${
                    canAuthorizeReturn
                      ? "bg-gold-champagne hover:bg-[#c3a05b] text-black cursor-pointer"
                      : "bg-white/10 text-gray-500 cursor-not-allowed border border-white/10"
                  }`}
                >
                  {processing ? (
                    <>
                      <RefreshCw size={16} className="animate-spin" />
                      <span>Processing Return &amp; Updating Stock...</span>
                    </>
                  ) : (
                    <>
                      <RotateCcw size={16} />
                      <span>Authorize Equipment Return &amp; Release Inventory</span>
                    </>
                  )}
                </button>
              )}

              {!canAuthorizeReturn && !data.isAlreadyReturned && (
                <p className="text-[11px] font-mono text-center text-gray-400">
                  All 4 return diagnostic checklist items must be verified before releasing equipment.
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
