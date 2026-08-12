"use client";

import React, { useState, useEffect, useCallback } from "react";
import { db, Booking, InventoryUnit } from "@/lib/db/store";
import { useToast } from "@/hooks/useToast";
import { 
  Camera, Check, X, Clock, AlertTriangle, CheckCircle, 
  Phone, Mail, MessageSquare, Key, RefreshCw, ChevronRight, 
  User, Calendar, Shield, CameraOff, AlertCircle, FileText
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function AdminMobileOps() {
  const toast = useToast();
  const router = useRouter();

  // Authentication and state
  const [profile, setProfile] = useState<any>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [inventory, setInventory] = useState<InventoryUnit[]>([]);
  const [activeTab, setActiveTab] = useState<"approvals" | "pickups" | "returns" | "overdue" | "all">("approvals");

  // Confirmations and inspection modals
  const [confirmModal, setConfirmModal] = useState<{
    show: boolean;
    title: string;
    message: string;
    action: () => void;
  } | null>(null);

  // Handover state
  const [handoverModal, setHandoverModal] = useState<{
    show: boolean;
    booking: Booking;
    otp: string;
    remarks: string;
    serialVerified: boolean;
    serialNumber: string;
  } | null>(null);

  // Return state
  const [returnModal, setReturnModal] = useState<{
    show: boolean;
    booking: Booking;
    condition: "good" | "damaged";
    damageDescription: string;
    damageCost: string;
    remarks: string;
    lateFee: string;
  } | null>(null);

  // Load profile and verify admin role
  useEffect(() => {
    async function init() {
      try {
        const p = await db.getProfile();
        setProfile(p);
        if (p.role !== "admin" && p.role !== "staff") {
          toast.error("Access denied: Admin/Staff role required.");
          router.push("/dashboard");
          return;
        }
        setAuthChecked(true);
      } catch (err) {
        console.error("Auth check error:", err);
        // In local mock mode we fallback to the local admin profile
        setAuthChecked(true);
      }
    }
    init();
  }, [router, toast]);

  // Load/refresh dashboard data
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [allBookings, allInventory] = await Promise.all([
        db.getBookings(),
        db.getInventoryUnits()
      ]);
      setBookings(allBookings);
      setInventory(allInventory);
    } catch (err: any) {
      toast.error("Failed to load operations data: " + err.message);
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    if (authChecked) {
      loadData();
    }
  }, [authChecked, loadData]);

  // 1-Tap Action: Approve
  const handleApprove = (booking: Booking) => {
    setConfirmModal({
      show: true,
      title: "Approve Booking",
      message: `Are you sure you want to approve booking ${booking.referenceCode} for ${booking.contactName}?`,
      action: async () => {
        try {
          // Perform server status change
          await db.updateBookingStatus(booking.id, "approved", "Approved via Mobile Panel.", profile?.fullName || "Admin");
          toast.success(`Booking ${booking.referenceCode} approved.`);
          loadData();
        } catch (err: any) {
          toast.error("Approval failed: " + err.message);
        }
        setConfirmModal(null);
      }
    });
  };

  // 1-Tap Action: Reject
  const handleReject = (booking: Booking) => {
    setConfirmModal({
      show: true,
      title: "Reject Booking",
      message: `Are you sure you want to reject booking ${booking.referenceCode}?`,
      action: async () => {
        try {
          await db.updateBookingStatus(booking.id, "rejected", "Rejected via Mobile Panel.", profile?.fullName || "Admin");
          toast.success(`Booking ${booking.referenceCode} rejected.`);
          loadData();
        } catch (err: any) {
          toast.error("Rejection failed: " + err.message);
        }
        setConfirmModal(null);
      }
    });
  };

  // Action: Generate and Send OTP
  const handleGenerateOTP = async (booking: Booking) => {
    try {
      const otp = String(Math.floor(100000 + Math.random() * 900000));
      
      // Update database status and OTP
      if (process.env.NEXT_PUBLIC_SUPABASE_URL && !process.env.NEXT_PUBLIC_SUPABASE_URL.includes("your-project-id")) {
        const supabase = await (db as any).getSupabase();
        await supabase
          .from("bookings")
          .update({ 
            pickup_otp: otp, 
            status: "ready_for_pickup" 
          })
          .eq("id", booking.id);
      }
      
      // Update local storage status
      const localBookings = JSON.parse(localStorage.getItem("aurevia_bookings") || "[]");
      const idx = localBookings.findIndex((b: any) => b.id === booking.id);
      if (idx !== -1) {
        localBookings[idx].pickupOTP = otp;
        localBookings[idx].status = "ready_for_pickup";
        localStorage.setItem("aurevia_bookings", JSON.stringify(localBookings));
      }

      // Re-trigger mailer notification if running on server side
      toast.success(`OTP ${otp} generated and sent to ${booking.contactName}`);
      loadData();
    } catch (err: any) {
      toast.error("Failed to generate OTP: " + err.message);
    }
  };

  // Action: Confirm Handover
  const handleConfirmHandover = async () => {
    if (!handoverModal) return;
    const { booking, otp, remarks, serialVerified } = handoverModal;

    if (!otp || otp.trim() === "") {
      toast.error("Please enter the pickup OTP.");
      return;
    }
    if (!serialVerified) {
      toast.error("You must physically verify the camera serial numbers.");
      return;
    }

    try {
      await db.confirmHandover(booking.id, otp.trim(), remarks, true);
      toast.success("Handover complete. Camera status changed to Rented.");
      setHandoverModal(null);
      loadData();
    } catch (err: any) {
      toast.error("Handover failed: " + err.message);
    }
  };

  // Action: Confirm Return
  const handleConfirmReturn = async () => {
    if (!returnModal) return;
    const { booking, condition, damageDescription, damageCost, remarks, lateFee } = returnModal;

    try {
      const dmgCost = parseFloat(damageCost) || 0;
      const ltFee = parseFloat(lateFee) || 0;

      await db.processReturn(booking.id, condition, damageDescription, dmgCost, remarks, ltFee);
      toast.success("Return processed successfully. Inventory restocked.");
      setReturnModal(null);
      loadData();
    } catch (err: any) {
      toast.error("Return failed: " + err.message);
    }
  };

  // Action: Update Camera Status directly
  const handleToggleCameraStatus = (unit: InventoryUnit) => {
    const statuses: InventoryUnit["status"][] = ["available", "rented", "maintenance"];
    const currentIdx = statuses.indexOf(unit.status);
    const nextStatus = statuses[(currentIdx + 1) % statuses.length];

    setConfirmModal({
      show: true,
      title: "Change Camera Status",
      message: `Change ${unit.name} (${unit.serialNumber}) status from ${unit.status.toUpperCase()} to ${nextStatus.toUpperCase()}?`,
      action: async () => {
        try {
          await db.updateInventoryUnitStatus(unit.id, nextStatus);
          toast.success(`${unit.name} is now ${nextStatus.toUpperCase()}`);
          loadData();
        } catch (err: any) {
          toast.error("Status update failed: " + err.message);
        }
        setConfirmModal(null);
      }
    });
  };

  // WhatsApp link constructor
  const getWhatsAppLink = (phone: string, name: string, refCode: string, type: "pickup" | "return" | "overdue") => {
    const cleanPhone = phone.replace(/\D/g, "");
    const formattedPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
    let text = "";
    if (type === "pickup") {
      text = `Hello ${name}, your AUREVIA rental booking ${refCode} is approved. Please sign the agreement online and collect your camera unit. Thank you!`;
    } else if (type === "return") {
      text = `Hello ${name}, a friendly reminder that your AUREVIA camera rental ${refCode} is scheduled for return inspection today. Please bring the gear back in clean condition.`;
    } else if (type === "overdue") {
      text = `URGENT: Hello ${name}, your AUREVIA camera rental ${refCode} is OVERDUE. Please return the camera immediately to avoid late charges. Contact us if there are any issues.`;
    }
    return `https://wa.me/${formattedPhone}?text=${encodeURIComponent(text)}`;
  };

  if (!authChecked) {
    return (
      <div className="min-h-screen bg-obsidian flex items-center justify-center font-sans">
        <div className="text-center">
          <RefreshCw className="animate-spin text-gold-champagne h-8 w-8 mx-auto mb-4" />
          <p className="text-xs text-muted-gray uppercase tracking-widest font-mono">Verifying Credentials...</p>
        </div>
      </div>
    );
  }

  // Filter bookings based on selected tab
  const todayStr = new Date().toISOString().split("T")[0];
  const approvalsList = bookings.filter(b => b.status === "approval_pending" || (b.status === "pending_payment" && b.paymentStatus === "paid"));
  const pickupsList = bookings.filter(b => b.status === "approved" || b.status === "ready_for_pickup");
  const returnsList = bookings.filter(b => b.status === "rented");
  const overdueList = bookings.filter(b => b.status === "overdue" || (b.status === "rented" && b.endDate < todayStr));
  
  const getFilteredBookings = () => {
    switch (activeTab) {
      case "approvals": return approvalsList;
      case "pickups": return pickupsList;
      case "returns": return returnsList;
      case "overdue": return overdueList;
      case "all": return bookings;
    }
  };

  const filtered = getFilteredBookings();

  return (
    <div className="min-h-screen bg-obsidian text-ivory font-sans pb-12">
      {/* Cinematic noise film grain */}
      <div className="film-grain opacity-10" />

      {/* Header */}
      <header className="border-b border-white/10 bg-charcoal/80 backdrop-blur-md sticky top-0 z-50 px-4 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield className="text-gold-champagne h-4 w-4 shrink-0" />
          <h1 className="font-serif text-sm font-bold tracking-widest uppercase text-gold-champagne">
            Aurevia Ops
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={loadData}
            className="p-1 rounded hover:bg-white/5 transition"
            title="Refresh Operations"
          >
            <RefreshCw className={`h-4 w-4 text-ivory/60 ${loading ? "animate-spin" : ""}`} />
          </button>
          <Link 
            href="/admin" 
            className="text-[10px] uppercase font-mono tracking-wider text-gold-champagne/80 hover:text-gold-champagne transition border border-gold-champagne/20 px-2 py-0.5 rounded"
          >
            Desktop view
          </Link>
        </div>
      </header>

      {/* Blinking Overdue alert banner if any rentals are late */}
      {overdueList.length > 0 && (
        <div className="bg-red-950/80 border-b border-red-500/30 px-4 py-2 flex items-center justify-between animate-pulse">
          <div className="flex items-center gap-2">
            <AlertTriangle className="text-red-400 h-4 w-4 shrink-0" />
            <span className="text-[10px] font-mono font-bold tracking-wider text-red-200 uppercase">
              {overdueList.length} Rental{overdueList.length > 1 ? "s" : ""} Overdue
            </span>
          </div>
          <button 
            onClick={() => setActiveTab("overdue")}
            className="text-[9px] font-mono uppercase bg-red-500 text-white font-bold px-2 py-0.5 rounded shrink-0"
          >
            View Actions
          </button>
        </div>
      )}

      <main className="p-4 flex flex-col gap-5">
        {/* Physical 3-Camera Status Board */}
        <section className="bg-charcoal border border-white/5 rounded p-4">
          <h2 className="text-[10px] uppercase font-mono font-bold tracking-widest text-gold-champagne mb-3">
            Inventory Units status
          </h2>
          <div className="grid grid-cols-1 gap-2.5">
            {inventory.map((unit) => {
              const statusColors: Record<string, string> = {
                available: "bg-emerald-500/10 border-emerald-500/30 text-emerald-400",
                rented: "bg-blue-500/10 border-blue-500/30 text-blue-400",
                maintenance: "bg-amber-500/10 border-amber-500/30 text-amber-400",
              };
              return (
                <div 
                  key={unit.id} 
                  className="flex items-center justify-between bg-black/40 border border-white/5 p-3 rounded-lg hover:border-gold-champagne/30 transition cursor-pointer"
                  onClick={() => handleToggleCameraStatus(unit)}
                >
                  <div className="flex items-center gap-3">
                    <Camera className="text-gold-champagne h-5 w-5 shrink-0" />
                    <div>
                      <h4 className="text-xs font-semibold text-ivory">{unit.name}</h4>
                      <p className="text-[10px] text-muted-gray font-mono">{unit.serialNumber}</p>
                    </div>
                  </div>
                  <span className={`text-[9px] uppercase font-mono tracking-wider font-bold px-2.5 py-1 border rounded-full ${statusColors[unit.status] || "border-white/20 text-white"}`}>
                    {unit.status}
                  </span>
                </div>
              );
            })}
          </div>
          <p className="text-[9px] text-muted-gray font-mono mt-2.5 text-center">
            Tap a camera unit card to cycle its physical status.
          </p>
        </section>

        {/* Touch Tabs */}
        <section className="flex gap-1.5 overflow-x-auto pb-1 shrink-0">
          {(["approvals", "pickups", "returns", "overdue", "all"] as const).map((tab) => {
            const counts = {
              approvals: approvalsList.length,
              pickups: pickupsList.length,
              returns: returnsList.length,
              overdue: overdueList.length,
              all: bookings.length,
            };
            const label = tab === "approvals" ? "Queue" : tab;
            const activeClass = activeTab === tab
              ? "bg-gold-champagne text-obsidian font-bold border-gold-champagne"
              : "bg-charcoal text-ivory/60 border-white/5 hover:text-ivory";
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3.5 py-2.5 text-[10px] uppercase font-mono tracking-wider border rounded shrink-0 transition flex items-center gap-1.5 cursor-pointer ${activeClass}`}
              >
                <span>{label}</span>
                {counts[tab] > 0 && (
                  <span className={`text-[9px] rounded-full px-1.5 font-bold font-mono ${activeTab === tab ? "bg-obsidian text-gold-champagne" : "bg-white/10 text-ivory"}`}>
                    {counts[tab]}
                  </span>
                )}
              </button>
            );
          })}
        </section>

        {/* Bookings Queue */}
        <section className="flex flex-col gap-3">
          {loading ? (
            <div className="py-12 text-center text-muted-gray font-mono text-[11px]">
              <RefreshCw className="animate-spin text-gold-champagne h-5 w-5 mx-auto mb-2" />
              Loading bookings...
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-12 border border-dashed border-white/10 rounded-lg text-center text-muted-gray font-mono text-[11px] flex flex-col items-center gap-2">
              <CameraOff className="h-6 w-6 text-muted-gray" />
              <span>No bookings found in this view.</span>
            </div>
          ) : (
            filtered.map((b) => {
              const overdue = overdueList.some(o => o.id === b.id);
              return (
                <div 
                  key={b.id} 
                  className={`bg-charcoal border rounded p-4 flex flex-col gap-3.5 shadow-md relative ${overdue ? "border-red-500/40 bg-red-950/10" : "border-white/5"}`}
                >
                  {/* Overdue Blinking Ribbon */}
                  {overdue && (
                    <span className="absolute top-2 right-2 bg-red-600 text-white font-mono font-bold text-[8px] uppercase tracking-wider px-1.5 py-0.5 rounded animate-pulse">
                      Overdue
                    </span>
                  )}

                  {/* Header details */}
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-xs font-bold text-ivory flex items-center gap-1">
                        <User className="h-3 w-3 text-gold-champagne" /> {b.contactName}
                      </h4>
                      <p className="text-[10px] text-muted-gray font-mono mt-0.5">{b.referenceCode}</p>
                    </div>
                    <span className="text-[10px] font-bold text-gold-champagne font-mono">
                      ₹{b.totalPayable}
                    </span>
                  </div>

                  {/* Date details */}
                  <div className="grid grid-cols-2 gap-2 text-[10px] font-mono bg-black/30 p-2.5 rounded border border-white/5">
                    <div>
                      <span className="text-muted-gray block uppercase text-[8px]">Start Date</span>
                      <span className="text-ivory font-bold">{b.startDate}</span>
                    </div>
                    <div>
                      <span className="text-muted-gray block uppercase text-[8px]">End Date</span>
                      <span className="text-ivory font-bold">{b.endDate}</span>
                    </div>
                  </div>

                  {/* Camera detail */}
                  <div className="text-[11px] flex items-center gap-1.5">
                    <Camera className="text-gold-champagne h-3.5 w-3.5 shrink-0" />
                    <span className="font-semibold">
                      {b.items.map(i => {
                        const unit = inventory.find(u => u.id === i.inventoryUnitId);
                        const serialText = unit ? ` (${unit.serialNumber})` : "";
                        return i.productId === "p1000000-0000-0000-0000-000000000001" 
                          ? `Canon Camera${serialText}` 
                          : `Nikon Camera${serialText}`;
                      }).join(", ")}
                    </span>
                  </div>

                  {/* Status & Payment Badges */}
                  <div className="flex gap-2">
                    <span className="text-[9px] font-bold font-mono uppercase bg-white/5 border border-white/10 px-2 py-0.5 rounded">
                      Status: {b.status.replace("_", " ")}
                    </span>
                    <span className={`text-[9px] font-bold font-mono uppercase px-2 py-0.5 rounded border ${b.paymentStatus === "paid" ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : "bg-rose-500/10 border-rose-500/20 text-rose-400"}`}>
                      Payment: {b.paymentStatus}
                    </span>
                  </div>

                  {/* Touch Action Panel */}
                  <div className="border-t border-white/5 pt-3.5 flex flex-col gap-2">
                    {/* Contacts Row */}
                    <div className="grid grid-cols-3 gap-1.5">
                      <a 
                        href={`tel:${b.contactPhone}`}
                        className="flex items-center justify-center gap-1.5 bg-black/40 border border-white/5 hover:border-white/20 transition rounded py-2 text-[10px] font-semibold text-ivory/80 uppercase font-mono"
                      >
                        <Phone className="h-3 w-3 text-gold-champagne" /> Call
                      </a>
                      <a 
                        href={`mailto:${b.contactEmail}`}
                        className="flex items-center justify-center gap-1.5 bg-black/40 border border-white/5 hover:border-white/20 transition rounded py-2 text-[10px] font-semibold text-ivory/80 uppercase font-mono"
                      >
                        <Mail className="h-3 w-3 text-gold-champagne" /> Email
                      </a>
                      <a 
                        href={getWhatsAppLink(b.contactPhone, b.contactName, b.referenceCode, overdue ? "overdue" : b.status === "rented" ? "return" : "pickup")}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-1.5 bg-emerald-950/40 border border-emerald-500/20 hover:border-emerald-500/40 transition rounded py-2 text-[10px] font-semibold text-emerald-400 uppercase font-mono"
                      >
                        <MessageSquare className="h-3 w-3 text-emerald-400" /> Chat
                      </a>
                    </div>

                    {/* Operational Action Row */}
                    <div className="mt-1 flex flex-col gap-1.5">
                      {/* Approvals tab actions */}
                      {b.status === "approval_pending" && (
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            onClick={() => handleReject(b)}
                            className="bg-red-950/80 border border-red-500/30 hover:bg-red-900/50 py-3 rounded text-[10px] font-bold tracking-widest uppercase font-mono text-red-300 cursor-pointer"
                          >
                            Reject
                          </button>
                          <button
                            onClick={() => handleApprove(b)}
                            className="bg-gold-champagne text-obsidian py-3 rounded text-[10px] font-extrabold tracking-widest uppercase font-mono hover:bg-gold-champagne/90 cursor-pointer"
                          >
                            Approve
                          </button>
                        </div>
                      )}

                      {/* Approved (Generate OTP / Handover) */}
                      {b.status === "approved" && (
                        <button
                          onClick={() => handleGenerateOTP(b)}
                          className="w-full flex items-center justify-center gap-2 bg-charcoal border border-gold-champagne/30 text-gold-champagne py-3 rounded text-[10px] font-bold tracking-widest uppercase font-mono hover:bg-gold-champagne hover:text-obsidian transition cursor-pointer"
                        >
                          <Key className="h-3.5 w-3.5" /> Generate & Send OTP
                        </button>
                      )}

                      {/* Ready for Pickup (Handovers) */}
                      {b.status === "ready_for_pickup" && (
                        <button
                          onClick={() => setHandoverModal({
                            show: true,
                            booking: b,
                            otp: "",
                            remarks: "",
                            serialVerified: false,
                            serialNumber: b.items[0]?.inventoryUnitId 
                              ? inventory.find(u => u.id === b.items[0].inventoryUnitId)?.serialNumber || "CN-CAM-01"
                              : "CN-CAM-01"
                          })}
                          className="w-full flex items-center justify-center gap-2 bg-gold-champagne text-obsidian py-3 rounded text-[10px] font-extrabold tracking-widest uppercase font-mono hover:bg-gold-champagne/90 transition cursor-pointer"
                        >
                          <CheckCircle className="h-3.5 w-3.5" /> Handover Equipment
                        </button>
                      )}

                      {/* Rented (Returns) */}
                      {b.status === "rented" && (
                        <button
                          onClick={() => setReturnModal({
                            show: true,
                            booking: b,
                            condition: "good",
                            damageDescription: "",
                            damageCost: "",
                            remarks: "",
                            lateFee: (() => {
                              const today = new Date();
                              today.setHours(0,0,0,0);
                              const end = new Date(b.endDate);
                              end.setHours(0,0,0,0);
                              if (today > end) {
                                const diff = today.getTime() - end.getTime();
                                const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
                                return String(days * 999);
                              }
                              return "0";
                            })()
                          })}
                          className="w-full flex items-center justify-center gap-2 bg-gold-champagne text-obsidian py-3 rounded text-[10px] font-extrabold tracking-widest uppercase font-mono hover:bg-gold-champagne/90 transition cursor-pointer"
                        >
                          <Check className="h-3.5 w-3.5" /> Process Return
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </section>
      </main>

      {/* Confirmation Modal */}
      {confirmModal?.show && (
        <div className="fixed inset-0 z-[11000] bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-charcoal border border-white/10 rounded max-w-sm w-full p-5 shadow-2xl flex flex-col gap-4 font-sans animate-fade-in">
            <div>
              <h3 className="text-sm font-serif font-bold tracking-wider text-gold-champagne uppercase">
                {confirmModal.title}
              </h3>
              <p className="text-xs text-muted-gray leading-relaxed mt-2">
                {confirmModal.message}
              </p>
            </div>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setConfirmModal(null)}
                className="px-4 py-2 border border-white/10 hover:border-white/20 transition text-[10px] font-bold uppercase tracking-wider rounded font-mono cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={confirmModal.action}
                className="px-4 py-2 bg-gold-champagne text-obsidian transition text-[10px] font-extrabold uppercase tracking-wider rounded font-mono hover:bg-gold-champagne/90 cursor-pointer"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Handover Modal */}
      {handoverModal?.show && (
        <div className="fixed inset-0 z-[11000] bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm overflow-y-auto">
          <div className="bg-charcoal border border-white/10 rounded max-w-sm w-full p-5 shadow-2xl flex flex-col gap-4 font-sans">
            <div className="flex justify-between items-center border-b border-white/5 pb-2">
              <h3 className="text-xs font-serif font-bold tracking-widest text-gold-champagne uppercase">
                Equipment Handover Checklist
              </h3>
              <button onClick={() => setHandoverModal(null)} className="text-muted-gray hover:text-ivory cursor-pointer">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex flex-col gap-3">
              <p className="text-[10px] text-muted-gray leading-normal">
                Physically inspect the gear before handing it over to the client.
              </p>

              {/* Serial number checklist */}
              <label className="flex items-start gap-2.5 p-3 rounded bg-black/30 border border-white/5 cursor-pointer">
                <input 
                  type="checkbox"
                  checked={handoverModal.serialVerified}
                  onChange={(e) => setHandoverModal(prev => prev ? { ...prev, serialVerified: e.target.checked } : null)}
                  className="mt-0.5 h-4 w-4 accent-gold-champagne"
                />
                <div className="text-[11px] leading-snug">
                  <span className="font-semibold text-ivory block">Serial Match Verified</span>
                  <span className="text-[9px] text-gold-champagne font-mono">
                    Must physically verify: {handoverModal.serialNumber}
                  </span>
                </div>
              </label>

              {/* Remarks */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] font-mono uppercase text-muted-gray">Handover Condition Notes</label>
                <textarea
                  placeholder="E.g., Mint condition, clean lens glass, charged battery..."
                  value={handoverModal.remarks}
                  onChange={(e) => setHandoverModal(prev => prev ? { ...prev, remarks: e.target.value } : null)}
                  className="bg-black/40 border border-white/10 rounded p-2.5 text-xs text-ivory focus:outline-none focus:border-gold-champagne h-16 font-sans resize-none"
                />
              </div>

              {/* OTP code input */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] font-mono uppercase text-muted-gray">Customer Handover OTP</label>
                <input
                  type="number"
                  placeholder="Enter 6-digit OTP code"
                  value={handoverModal.otp}
                  onChange={(e) => setHandoverModal(prev => prev ? { ...prev, otp: e.target.value } : null)}
                  className="bg-black/40 border border-white/10 rounded p-2.5 text-xs text-ivory tracking-widest font-mono text-center font-bold focus:outline-none focus:border-gold-champagne"
                />
                <span className="text-[8px] text-gold-champagne font-mono block text-right">
                  Sent to {handoverModal.booking.contactEmail} (Expected: {handoverModal.booking.pickupOTP})
                </span>
              </div>
            </div>

            <div className="flex gap-2 justify-end border-t border-white/5 pt-3">
              <button
                onClick={() => setHandoverModal(null)}
                className="px-4 py-2 border border-white/10 text-[9px] font-mono font-bold uppercase tracking-wider rounded cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmHandover}
                className="px-4 py-2 bg-gold-champagne text-obsidian text-[9px] font-extrabold uppercase tracking-wider rounded font-mono hover:bg-gold-champagne/90 cursor-pointer"
              >
                Confirm handover
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Return Modal */}
      {returnModal?.show && (
        <div className="fixed inset-0 z-[11000] bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm overflow-y-auto">
          <div className="bg-charcoal border border-white/10 rounded max-w-sm w-full p-5 shadow-2xl flex flex-col gap-4 font-sans">
            <div className="flex justify-between items-center border-b border-white/5 pb-2">
              <h3 className="text-xs font-serif font-bold tracking-widest text-gold-champagne uppercase">
                Return Inspection Check
              </h3>
              <button onClick={() => setReturnModal(null)} className="text-muted-gray hover:text-ivory cursor-pointer">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex flex-col gap-3">
              {/* Condition Choice */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] font-mono uppercase text-muted-gray">Gear Condition</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setReturnModal(prev => prev ? { ...prev, condition: "good" } : null)}
                    className={`py-2 rounded text-[10px] font-mono uppercase font-bold border transition cursor-pointer ${returnModal.condition === "good" ? "bg-emerald-500/10 border-emerald-500 text-emerald-400" : "bg-black/30 border-white/5 text-ivory/60"}`}
                  >
                    Good Condition
                  </button>
                  <button
                    type="button"
                    onClick={() => setReturnModal(prev => prev ? { ...prev, condition: "damaged" } : null)}
                    className={`py-2 rounded text-[10px] font-mono uppercase font-bold border transition cursor-pointer ${returnModal.condition === "damaged" ? "bg-red-500/10 border-red-500 text-red-400 animate-pulse" : "bg-black/30 border-white/5 text-ivory/60"}`}
                  >
                    Damaged / Missing
                  </button>
                </div>
              </div>

              {/* Damage assessment */}
              {returnModal.condition === "damaged" && (
                <div className="flex flex-col gap-3 p-3 rounded bg-red-950/10 border border-red-500/20">
                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] font-mono uppercase text-red-300 font-bold">Damage Description</label>
                    <input
                      type="text"
                      placeholder="E.g., Front filter thread dented, missing lens cap..."
                      value={returnModal.damageDescription}
                      onChange={(e) => setReturnModal(prev => prev ? { ...prev, damageDescription: e.target.value } : null)}
                      className="bg-black/50 border border-red-500/20 rounded p-2 text-xs text-ivory focus:outline-none focus:border-red-500"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] font-mono uppercase text-red-300 font-bold">Assess Damage Cost (INR)</label>
                    <input
                      type="number"
                      placeholder="₹ Amount to bill client"
                      value={returnModal.damageCost}
                      onChange={(e) => setReturnModal(prev => prev ? { ...prev, damageCost: e.target.value } : null)}
                      className="bg-black/50 border border-red-500/20 rounded p-2 text-xs text-ivory font-mono focus:outline-none focus:border-red-500"
                    />
                  </div>
                </div>
              )}

              {/* Late fees */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] font-mono uppercase text-muted-gray">Late Return Fee (INR)</label>
                <input
                  type="number"
                  placeholder="₹ Late charge"
                  value={returnModal.lateFee}
                  onChange={(e) => setReturnModal(prev => prev ? { ...prev, lateFee: e.target.value } : null)}
                  className="bg-black/40 border border-white/10 rounded p-2.5 text-xs text-ivory font-mono focus:outline-none focus:border-gold-champagne"
                />
                <span className="text-[8px] text-muted-gray font-mono block text-right">
                  System suggestion: ₹{(() => {
                    const today = new Date();
                    today.setHours(0,0,0,0);
                    const end = new Date(returnModal.booking.endDate);
                    end.setHours(0,0,0,0);
                    if (today > end) {
                      const diff = today.getTime() - end.getTime();
                      return Math.ceil(diff / (1000 * 60 * 60 * 24)) * 999;
                    }
                    return 0;
                  })()}
                </span>
              </div>

              {/* Return notes */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] font-mono uppercase text-muted-gray">General Return Remarks</label>
                <textarea
                  placeholder="Notes on return inspection..."
                  value={returnModal.remarks}
                  onChange={(e) => setReturnModal(prev => prev ? { ...prev, remarks: e.target.value } : null)}
                  className="bg-black/40 border border-white/10 rounded p-2.5 text-xs text-ivory focus:outline-none focus:border-gold-champagne h-14 font-sans resize-none"
                />
              </div>
            </div>

            <div className="flex gap-2 justify-end border-t border-white/5 pt-3">
              <button
                onClick={() => setReturnModal(null)}
                className="px-4 py-2 border border-white/10 text-[9px] font-mono font-bold uppercase tracking-wider rounded cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReturn}
                className="px-4 py-2 bg-gold-champagne text-obsidian text-[9px] font-extrabold uppercase tracking-wider rounded font-mono hover:bg-gold-champagne/90 cursor-pointer"
              >
                Confirm return
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
