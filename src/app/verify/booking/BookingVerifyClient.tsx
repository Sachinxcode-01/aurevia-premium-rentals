"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Package,
  Calendar,
  User,
  Key,
  FileCheck2,
  ArrowRight,
  RefreshCw,
  Search,
  Lock,
} from "lucide-react";
import Link from "next/link";

interface BookingItemDetail {
  productId: string;
  productName: string;
  productImage: string;
  quantity: number;
  unitPrice: number;
  inventoryUnitId: string;
  serialNumber: string;
  condition: string;
}

interface BookingVerifyData {
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
    agreementAccepted: boolean;
    agreementAcceptedAt?: string;
    pickupOTP?: string;
    pickupHandoverAt?: string;
    pickupRemarks?: string;
    items: BookingItemDetail[];
  };
  otpValid: boolean;
  canHandover: boolean;
  isHandoverComplete: boolean;
}

interface BookingVerifyClientProps {
  initialRef?: string;
  initialOtp?: string;
}

export default function BookingVerifyClient({
  initialRef = "",
  initialOtp = "",
}: BookingVerifyClientProps) {
  const [refInput, setRefInput] = useState(initialRef);
  const [otpInput, setOtpInput] = useState(initialOtp);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<BookingVerifyData | null>(null);
  const [error, setError] = useState("");

  // Inspection Checklist State
  const [checklist, setChecklist] = useState({
    serialsVerified: false,
    conditionChecked: false,
    batteriesAccessoriesChecked: false,
    idVerified: false,
  });

  const [staffName, setStaffName] = useState("Studio Staff");
  const [remarks, setRemarks] = useState("");
  const [dispatching, setDispatching] = useState(false);
  const [dispatchSuccess, setDispatchSuccess] = useState(false);

  const fetchVerification = useCallback(
    async (ref: string, otp: string) => {
      if (!ref) return;
      setLoading(true);
      setError("");

      try {
        const query = new URLSearchParams();
        query.set("ref", ref);
        if (otp) query.set("otp", otp);

        const res = await fetch(`/api/bookings/verify?${query.toString()}`);
        const json = await res.json();

        if (!res.ok || !json.success) {
          setError(json.message || "Failed to find booking verification record.");
          setData(null);
        } else {
          setData(json.data);
          // If OTP matched from URL, pre-fill and clear errors
          if (json.data.otpValid) {
            setOtpInput(otp);
          }
        }
      } catch (err: any) {
        setError(err.message || "Network error loading verification portal.");
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    if (initialRef) {
      fetchVerification(initialRef, initialOtp);
    }
  }, [initialRef, initialOtp, fetchVerification]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (refInput.trim()) {
      fetchVerification(refInput.trim(), otpInput.trim());
    }
  };

  const isOtpMatched = Boolean(
    data &&
      data.booking.pickupOTP &&
      otpInput.trim() === data.booking.pickupOTP.trim()
  );

  const allChecklistCompleted =
    checklist.serialsVerified &&
    checklist.conditionChecked &&
    checklist.batteriesAccessoriesChecked &&
    checklist.idVerified;

  const canAuthorizeHandover =
    data &&
    !data.isHandoverComplete &&
    isOtpMatched &&
    allChecklistCompleted;

  const handleConfirmHandover = async () => {
    if (!data) return;
    if (!isOtpMatched) {
      setError("Please ensure the customer's Handover OTP matches.");
      return;
    }
    if (!checklist.serialsVerified) {
      setError("Equipment serial numbers must be verified before handover.");
      return;
    }

    setDispatching(true);
    setError("");

    try {
      const res = await fetch("/api/bookings/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingId: data.booking.id,
          referenceCode: data.booking.referenceCode,
          otp: otpInput.trim(),
          remarks,
          checklist,
          staffName,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        setError(json.message || "Failed to confirm equipment handover.");
      } else {
        setDispatchSuccess(true);
        // Refresh state
        fetchVerification(data.booking.referenceCode, otpInput.trim());
      }
    } catch (err: any) {
      setError(err.message || "Network error completing handover.");
    } finally {
      setDispatching(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070707] text-gray-100 selection:bg-gold-champagne selection:text-black py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Terminal Header */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/10 pb-6 gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
              <span className="text-[10px] font-mono tracking-widest uppercase text-gold-champagne font-bold">
                Aurevia Studio Counter • Dispatch Terminal
              </span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white mt-1">
              Equipment Handover &amp; Pass Verification
            </h1>
            <p className="text-xs text-gray-400 mt-0.5">
              Verify customer digital pass, validate security OTP, and confirm serial numbers before equipment release.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-xs font-mono text-gray-300 hover:text-white transition"
            >
              Customer Hub <ArrowRight size={13} />
            </Link>
          </div>
        </header>

        {/* Quick Search Bar */}
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
              placeholder="Enter Booking Ref (e.g. AUR-1042) or Booking ID"
              className="w-full bg-black/60 border border-white/10 rounded-lg pl-9 pr-3 py-2 text-xs font-mono text-white placeholder-gray-500 focus:border-gold-champagne focus:outline-none"
            />
          </div>

          <div className="relative w-full sm:w-44">
            <Key
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
            />
            <input
              type="text"
              value={otpInput}
              onChange={(e) => setOtpInput(e.target.value)}
              placeholder="Handover OTP"
              className="w-full bg-black/60 border border-white/10 rounded-lg pl-8 pr-3 py-2 text-xs font-mono text-white placeholder-gray-500 focus:border-gold-champagne focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto px-5 py-2 rounded-lg bg-gold-champagne hover:bg-[#c3a05b] text-black font-mono font-bold text-xs uppercase tracking-wider transition flex items-center justify-center gap-1.5 disabled:opacity-50"
          >
            {loading ? <RefreshCw size={14} className="animate-spin" /> : <Search size={14} />}
            <span>Lookup Pass</span>
          </button>
        </form>

        {/* Error Alert */}
        {error && (
          <div className="bg-rose-500/10 border border-rose-500/30 text-rose-300 p-4 rounded-xl flex items-start gap-3 text-xs">
            <AlertTriangle size={18} className="shrink-0 text-rose-400 mt-0.5" />
            <div>
              <strong className="font-semibold block">Verification Alert</strong>
              <span>{error}</span>
            </div>
          </div>
        )}

        {/* Success Alert */}
        {dispatchSuccess && (
          <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 p-4 rounded-xl flex items-start gap-3 text-xs">
            <CheckCircle2 size={18} className="shrink-0 text-emerald-400 mt-0.5" />
            <div>
              <strong className="font-semibold block">Handover Successfully Authorized</strong>
              <span>
                Equipment serial numbers transferred to renter. Booking status updated to{" "}
                <strong className="uppercase font-mono">RENTED</strong>. Handover audit logged.
              </span>
            </div>
          </div>
        )}

        {/* Booking Details Card */}
        {data && (
          <div className="space-y-6">
            {/* Status & Renter Summary Banner */}
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
                      data.booking.status === "rented"
                        ? "bg-blue-500/15 text-blue-400 border-blue-500/30"
                        : data.booking.status === "completed"
                        ? "bg-purple-500/15 text-purple-400 border-purple-500/30"
                        : data.booking.status === "ready_for_pickup" || data.booking.status === "approved"
                        ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                        : "bg-amber-500/15 text-amber-400 border-amber-500/30"
                    }`}
                  >
                    {data.booking.status.replace(/_/g, " ")}
                  </span>
                </div>
              </div>

              {/* Renter & Rental Details Grid */}
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
                    <Calendar size={12} className="text-gold-champagne" /> Rental Schedule
                  </div>
                  <div className="text-gray-200">
                    <span className="text-gray-500">From:</span> {data.booking.startDate}
                  </div>
                  <div className="text-gray-200">
                    <span className="text-gray-500">Until:</span> {data.booking.endDate}
                  </div>
                  <div className="text-emerald-400 text-[10px]">
                    Method: {data.booking.deliveryMethod.toUpperCase()}
                  </div>
                </div>

                <div className="bg-black/40 border border-white/5 p-3 rounded-xl space-y-1">
                  <div className="text-gray-500 flex items-center gap-1">
                    <FileCheck2 size={12} className="text-gold-champagne" /> Compliance &amp; Agreement
                  </div>
                  <div className="flex items-center gap-1.5">
                    {data.booking.agreementAccepted ? (
                      <span className="text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 size={12} /> Agreement Signed
                      </span>
                    ) : (
                      <span className="text-amber-400 flex items-center gap-1">
                        <AlertTriangle size={12} /> Agreement Pending
                      </span>
                    )}
                  </div>
                  <div className="text-gray-400 text-[11px]">
                    Payment: <strong className="text-white uppercase">{data.booking.paymentStatus}</strong>
                  </div>
                  <div className="text-gold-champagne font-bold">
                    ₹{data.booking.totalPayable.toLocaleString()}
                  </div>
                </div>
              </div>
            </div>

            {/* OTP Verification Box */}
            <div
              className={`p-5 rounded-2xl border transition-all ${
                isOtpMatched
                  ? "bg-emerald-950/20 border-emerald-500/40 shadow-[0_0_20px_rgba(16,185,129,0.1)]"
                  : "bg-[#111111] border-gold-champagne/30"
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Key
                      size={18}
                      className={isOtpMatched ? "text-emerald-400" : "text-gold-champagne"}
                    />
                    <h3 className="font-mono text-sm font-bold text-white uppercase tracking-wider">
                      Handover OTP Validation
                    </h3>
                  </div>
                  <p className="text-xs text-gray-400">
                    Customer must show the 4-6 digit OTP on their phone or scannable pass.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="relative">
                    <input
                      type="text"
                      maxLength={6}
                      value={otpInput}
                      onChange={(e) => setOtpInput(e.target.value.trim())}
                      placeholder="e.g. 1358"
                      className="w-32 bg-black border border-white/20 rounded-lg px-3 py-1.5 text-center font-mono text-base font-bold tracking-widest text-gold-champagne focus:border-gold-champagne focus:outline-none"
                    />
                  </div>

                  {isOtpMatched ? (
                    <div className="flex items-center gap-1.5 text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1.5 rounded-lg text-xs font-mono font-bold uppercase">
                      <CheckCircle2 size={16} />
                      <span>OTP MATCHED</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 text-amber-400 bg-amber-500/10 border border-amber-500/30 px-3 py-1.5 rounded-lg text-xs font-mono font-bold uppercase">
                      <XCircle size={16} />
                      <span>OTP MISMATCH</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Equipment Manifest */}
            <div className="bg-[#0f0f0f] border border-white/10 rounded-2xl p-5 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <Package size={18} className="text-gold-champagne" />
                  <h3 className="font-mono text-sm font-bold text-white uppercase tracking-wider">
                    Equipment Manifest &amp; Serial Numbers
                  </h3>
                </div>
                <span className="text-xs text-gray-400 font-mono">
                  {data.booking.items.length} Item(s)
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
                          <span>Qty: {item.quantity}</span>
                          <span>•</span>
                          <span className="text-emerald-400">{item.condition}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 sm:self-center">
                      <span className="text-xs font-mono text-gray-400">Assigned Unit:</span>
                      <span className="font-mono text-xs font-bold text-gold-champagne bg-black border border-gold-champagne/40 px-2.5 py-1 rounded">
                        {item.serialNumber}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Physical Pre-Flight Checklist */}
            <div className="bg-[#0f0f0f] border border-white/10 rounded-2xl p-5 shadow-xl space-y-4">
              <div className="flex items-center gap-2 border-b border-white/10 pb-3">
                <FileCheck2 size={18} className="text-gold-champagne" />
                <h3 className="font-mono text-sm font-bold text-white uppercase tracking-wider">
                  Pre-Flight Handover Checklist
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <label className="flex items-start gap-3 p-3 bg-black/40 border border-white/5 rounded-xl cursor-pointer hover:border-gold-champagne/30 transition">
                  <input
                    type="checkbox"
                    checked={checklist.serialsVerified}
                    onChange={(e) =>
                      setChecklist({ ...checklist, serialsVerified: e.target.checked })
                    }
                    className="mt-0.5 rounded border-white/20 accent-[#d8b36a] w-4 h-4"
                  />
                  <div>
                    <strong className="block text-white font-medium">
                      Physical Serial Numbers Verified
                    </strong>
                    <span className="text-gray-400 text-[11px]">
                      Hardware barcodes match Pelican case tags and manifest.
                    </span>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-3 bg-black/40 border border-white/5 rounded-xl cursor-pointer hover:border-gold-champagne/30 transition">
                  <input
                    type="checkbox"
                    checked={checklist.conditionChecked}
                    onChange={(e) =>
                      setChecklist({ ...checklist, conditionChecked: e.target.checked })
                    }
                    className="mt-0.5 rounded border-white/20 accent-[#d8b36a] w-4 h-4"
                  />
                  <div>
                    <strong className="block text-white font-medium">
                      Sensor &amp; Glass Cleanliness
                    </strong>
                    <span className="text-gray-400 text-[11px]">
                      Optical front/rear elements and sensor are dust-free.
                    </span>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-3 bg-black/40 border border-white/5 rounded-xl cursor-pointer hover:border-gold-champagne/30 transition">
                  <input
                    type="checkbox"
                    checked={checklist.batteriesAccessoriesChecked}
                    onChange={(e) =>
                      setChecklist({
                        ...checklist,
                        batteriesAccessoriesChecked: e.target.checked,
                      })
                    }
                    className="mt-0.5 rounded border-white/20 accent-[#d8b36a] w-4 h-4"
                  />
                  <div>
                    <strong className="block text-white font-medium">
                      Batteries &amp; Charging Accessories
                    </strong>
                    <span className="text-gray-400 text-[11px]">
                      Batteries tested (&gt;= 80% charge), cables, and charger packed.
                    </span>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-3 bg-black/40 border border-white/5 rounded-xl cursor-pointer hover:border-gold-champagne/30 transition">
                  <input
                    type="checkbox"
                    checked={checklist.idVerified}
                    onChange={(e) =>
                      setChecklist({ ...checklist, idVerified: e.target.checked })
                    }
                    className="mt-0.5 rounded border-white/20 accent-[#d8b36a] w-4 h-4"
                  />
                  <div>
                    <strong className="block text-white font-medium">
                      Customer Photo ID Matched
                    </strong>
                    <span className="text-gray-400 text-[11px]">
                      Physical Aadhaar/Passport/DL verified against agreement name.
                    </span>
                  </div>
                </label>
              </div>
            </div>

            {/* Handover Authorization Box */}
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
                    className="w-full bg-black border border-white/15 rounded-lg px-3 py-2 text-xs font-mono text-white focus:border-gold-champagne focus:outline-none"
                  />
                </div>

                <div className="w-full sm:w-2/3">
                  <label className="block text-[10px] font-mono text-gray-400 uppercase tracking-wider mb-1">
                    Handover Inspection Remarks (Optional)
                  </label>
                  <input
                    type="text"
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    placeholder="e.g. Pelican case 4A seal intact. Extra lens hood included."
                    className="w-full bg-black border border-white/15 rounded-lg px-3 py-2 text-xs text-white placeholder-gray-500 focus:border-gold-champagne focus:outline-none"
                  />
                </div>
              </div>

              {data.isHandoverComplete ? (
                <div className="bg-blue-500/10 border border-blue-500/30 p-4 rounded-xl text-center space-y-1">
                  <div className="text-blue-400 font-mono font-bold text-sm uppercase flex items-center justify-center gap-2">
                    <ShieldCheck size={18} />
                    Equipment Dispatched • Active Rental Window
                  </div>
                  <p className="text-xs text-gray-400">
                    Handover was completed on{" "}
                    {data.booking.pickupHandoverAt
                      ? new Date(data.booking.pickupHandoverAt).toLocaleString()
                      : "earlier today"}
                    .
                  </p>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleConfirmHandover}
                  disabled={!canAuthorizeHandover || dispatching}
                  className={`w-full py-3.5 px-6 rounded-xl font-mono text-sm font-bold uppercase tracking-widest transition flex items-center justify-center gap-2 shadow-lg ${
                    canAuthorizeHandover
                      ? "bg-gold-champagne hover:bg-[#c3a05b] text-black cursor-pointer"
                      : "bg-white/10 text-gray-500 cursor-not-allowed border border-white/10"
                  }`}
                >
                  {dispatching ? (
                    <>
                      <RefreshCw size={16} className="animate-spin" />
                      <span>Authorizing Dispatch...</span>
                    </>
                  ) : (
                    <>
                      <Lock size={16} />
                      <span>Authorize Handover &amp; Dispatch Equipment</span>
                    </>
                  )}
                </button>
              )}

              {!canAuthorizeHandover && !data.isHandoverComplete && (
                <p className="text-[11px] font-mono text-center text-gray-400">
                  {!isOtpMatched
                    ? "Requires matching customer Handover OTP code."
                    : !allChecklistCompleted
                    ? "All 4 pre-flight inspection checklist items must be checked."
                    : "Booking is not yet ready for equipment handover."}
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
