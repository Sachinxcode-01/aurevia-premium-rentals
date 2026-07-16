"use client";

import React, { useEffect, useState, useCallback } from "react";
import Navbar from "@/components/navigation/Navbar";
import { useToast } from "@/hooks/useToast";
import { useCart } from "@/hooks/useCart";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { db, Booking } from "@/lib/db/store";
import { getCurrentUserAction } from "@/lib/actions/auth";
import { getAllBookingsAction } from "@/lib/actions/bookings";
import { 
  Camera, ShieldAlert, CheckCircle, Clock, AlertTriangle, 
  DollarSign, Mail, Send, ChevronRight, User, RefreshCw
} from "lucide-react";
import Link from "next/link";

export default function AdminPenaltiesPage() {
  const toast = useToast();
  const { cart } = useCart();

  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingAdmin, setCheckingAdmin] = useState(true);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Form states for each booking
  const [damageDescription, setDamageDescription] = useState<Record<string, string>>({});
  const [damageCost, setDamageCost] = useState<Record<string, number>>({});
  const [lateFee, setLateFee] = useState<Record<string, number>>({});
  const [submittingId, setSubmittingId] = useState<string | null>(null);

  // Verify Admin role
  useEffect(() => {
    const checkRole = async () => {
      try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
        const isSupabase = supabaseUrl.length > 0 && !supabaseUrl.includes("your-project-id");
        
        if (isSupabase) {
          const user = await getCurrentUserAction();
          if (user && (user.role === "admin" || user.role === "staff")) {
            setIsAdmin(true);
          }
        } else {
          const prof = await db.getProfile();
          if (prof && (prof.role === "admin" || prof.role === "staff")) {
            setIsAdmin(true);
          }
        }
      } catch (e) {
        console.error(e);
      } finally {
        setCheckingAdmin(false);
      }
    };
    checkRole();
  }, []);

  const loadData = useCallback(async () => {
    setLoadingBookings(true);
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
      const isSupabase = supabaseUrl.length > 0 && !supabaseUrl.includes("your-project-id");
      
      let all: any[] = [];
      if (isSupabase) {
        all = await getAllBookingsAction();
      } else {
        all = await db.getBookings("usr-prem"); // gets all bookings in mock mode
      }

      // Filter only completed or returned bookings
      const completed = all.filter((b: any) => ["completed", "returned"].includes(b.status));
      setBookings(completed);

      // Initialize form fields
      const descInit: Record<string, string> = {};
      const costInit: Record<string, number> = {};
      const lateInit: Record<string, number> = {};
      
      completed.forEach((b: any) => {
        descInit[b.id] = b.damageDescription || "";
        costInit[b.id] = Number(b.damageCost || 0);
        lateInit[b.id] = Number(b.lateFee || 0);
      });

      setDamageDescription(descInit);
      setDamageCost(costInit);
      setLateFee(lateInit);
    } catch (e: any) {
      toast.error("Failed to load bookings: " + e.message);
    } finally {
      setLoadingBookings(false);
    }
  }, [toast]);

  useEffect(() => {
    if (isAdmin) {
      loadData();
    }
  }, [isAdmin, loadData]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
    toast.success("Data refreshed.");
  };

  const handleAssessPenalty = async (bookingId: string) => {
    setSubmittingId(bookingId);
    try {
      const cost = Number(damageCost[bookingId] || 0);
      const fee = Number(lateFee[bookingId] || 0);
      const desc = damageDescription[bookingId] || "";

      if (cost > 0 && !desc) {
        toast.error("Please provide a description of the damage.");
        setSubmittingId(null);
        return;
      }

      const success = await db.assessPenalty(bookingId, {
        damageCost: cost,
        lateFee: fee,
        damageDescription: desc
      });

      if (success) {
        toast.success("Post-rental penalty saved successfully.");
        await loadData();
      } else {
        toast.error("Failed to save penalty.");
      }
    } catch (err: any) {
      toast.error("Error: " + err.message);
    } finally {
      setSubmittingId(null);
    }
  };

  const handleSendInvoice = async (booking: Booking) => {
    try {
      const cost = Number(damageCost[booking.id] || 0);
      const fee = Number(lateFee[booking.id] || 0);
      const total = cost + fee;

      if (total <= 0) {
        toast.error("Assessed penalty must be greater than zero to send invoice.");
        return;
      }

      // Trigger email sending
      const subject = `AUREVIA Post-Rental Billing: Booking #${booking.referenceCode}`;
      const paymentLink = `${window.location.origin}/checkout/penalty/${booking.id}`;
      
      const text = `Dear ${booking.contactName},\n\nWe have completed inspection of camera equipment returned under booking ${booking.referenceCode}.\n\nAssessed charges:\n- Late Return Fee: ₹${fee}\n- Damage Assessment: ₹${cost} (${booking.damageDescription || 'N/A'})\n\nTotal Due: ₹${total}\n\nPlease pay using this link: ${paymentLink}\n\nBest regards,\nAUREVIA Operations`;
      const html = `<div style="background-color:#080808;color:#F5F1E8;font-family:Georgia,serif;padding:30px;border:1px solid #D8B36A;">
        <h2 style="color:#D8B36A;text-transform:uppercase;letter-spacing:0.1em;">Post-Rental Inspection Assessment</h2>
        <p>Dear ${booking.contactName},</p>
        <p>We have completed inspection of the returned camera equipment under booking <strong>${booking.referenceCode}</strong>.</p>
        <table style="width:100%;color:#F5F1E8;border-collapse:collapse;margin:20px 0;">
          <tr style="border-bottom:1px solid #333;"><td style="padding:8px 0;">Late Return Fee</td><td style="text-align:right;">₹${fee}</td></tr>
          <tr style="border-bottom:1px solid #333;"><td style="padding:8px 0;">Damage Assessment</td><td style="text-align:right;">₹${cost}</td></tr>
          ${cost > 0 ? `<tr><td colspan="2" style="font-size:11px;color:#9A9995;padding-top:4px;">Description: ${booking.damageDescription}</td></tr>` : ""}
          <tr style="border-top:2px solid #D8B36A;font-weight:bold;"><td style="padding:8px 0;color:#D8B36A;">Total Outstanding</td><td style="text-align:right;color:#D8B36A;">₹${total}</td></tr>
        </table>
        <p>Please clear these outstanding charges to maintain your membership status and authorize future bookings.</p>
        <p style="margin-top:25px;"><a href="${paymentLink}" style="background-color:#D8B36A;color:#080808;padding:12px 24px;text-decoration:none;font-weight:bold;text-transform:uppercase;font-size:11px;letter-spacing:1px;display:inline-block;">Pay Outstanding Penalty</a></p>
        <p style="color:#9A9995;font-size:11px;margin-top:30px;">For disputes or manufacturer-authorized repair invoice receipts, reply directly to this mail.</p>
      </div>`;

      // API call to mailer
      const response = await fetch("/api/cron/booking-ops", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "send_custom_email",
          to: booking.contactEmail,
          subject,
          text,
          html,
          bookingId: booking.id
        })
      });

      if (response.ok) {
        toast.success("Invoice and Razorpay link emailed to customer!");
      } else {
        toast.error("Failed to send email invoice.");
      }
    } catch (err: any) {
      toast.error("Failed: " + err.message);
    }
  };

  if (checkingAdmin) {
    return (
      <div className="min-h-screen bg-obsidian flex items-center justify-center text-gold-champagne font-mono text-xs uppercase animate-pulse">
        Checking administration credentials...
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-obsidian flex flex-col items-center justify-center gap-4 text-center">
        <AlertTriangle className="text-rose-500 h-10 w-10 animate-bounce" />
        <h2 className="serif-heading text-xl text-ivory">Access Denied</h2>
        <p className="text-xs text-muted-gray">This portal is restricted to Aurevia admin operators.</p>
        <Link href="/dashboard" className="text-gold-champagne hover:underline text-xs">Return to Dashboard</Link>
      </div>
    );
  }

  // Calculate summary metrics
  const totalCollected = bookings
    .filter(b => b.penaltyPaymentStatus === "paid")
    .reduce((sum, b) => sum + Number(b.damageCost || 0) + Number(b.lateFee || 0), 0);

  const totalOutstanding = bookings
    .filter(b => b.penaltyPaymentStatus === "unpaid")
    .reduce((sum, b) => sum + Number(b.damageCost || 0) + Number(b.lateFee || 0), 0);

  return (
    <AuthGuard>
      <div className="min-h-screen bg-obsidian text-ivory pb-32">
        <Navbar cartItemCount={cart.length} />

        <div className="max-w-6xl mx-auto px-6 pt-32 space-y-8">
          <div className="flex justify-between items-center">
            <div>
              <span className="text-[9px] text-gold-champagne uppercase font-mono tracking-widest block mb-1">Vault Operations</span>
              <h1 className="serif-heading text-2xl font-light text-ivory">Penalty & Returns Billing</h1>
            </div>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-1.5 text-[10px] text-muted-gray hover:text-ivory border border-white/10 px-3 py-2 rounded-lg transition cursor-pointer"
            >
              <RefreshCw size={11} className={refreshing ? "animate-spin" : ""} />
              Refresh Data
            </button>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="glass-panel border-white/5 p-5 rounded-lg flex items-center justify-between">
              <div>
                <span className="text-[9px] uppercase font-mono text-emerald-400 block mb-1">Total Penalties Collected</span>
                <span className="text-2xl font-light text-ivory serif-heading">₹{totalCollected.toLocaleString("en-IN")}</span>
              </div>
              <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                <CheckCircle size={18} />
              </div>
            </div>
            <div className="glass-panel border-white/5 p-5 rounded-lg flex items-center justify-between">
              <div>
                <span className="text-[9px] uppercase font-mono text-amber-400 block mb-1">Outstanding Post-Rental Receivables</span>
                <span className="text-2xl font-light text-ivory serif-heading">₹{totalOutstanding.toLocaleString("en-IN")}</span>
              </div>
              <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-400">
                <Clock size={18} />
              </div>
            </div>
          </div>

          {/* Bookings Table */}
          <div className="glass-panel border-white/5 rounded-xl overflow-hidden p-6 space-y-4">
            <h2 className="text-xs uppercase font-mono tracking-wider text-muted-gray border-b border-white/5 pb-3">Completed & Returned Rentals</h2>

            {loadingBookings ? (
              <p className="text-xs font-mono text-muted-gray uppercase animate-pulse">Loading inspection database...</p>
            ) : bookings.length === 0 ? (
              <div className="text-center py-12 text-muted-gray space-y-2">
                <Camera size={28} className="mx-auto text-muted-gray/30" />
                <p className="text-xs font-mono">No completed rentals with potential inspections found.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {bookings.map((b) => {
                  const totalPenalty = Number(damageCost[b.id] || 0) + Number(lateFee[b.id] || 0);
                  const isPaid = b.penaltyPaymentStatus === "paid";
                  const isUnpaid = b.penaltyPaymentStatus === "unpaid";
                  
                  return (
                    <div key={b.id} className="border border-white/5 rounded-lg p-5 space-y-4 bg-charcoal/25 hover:border-gold-border/20 transition">
                      {/* Booking Summary */}
                      <div className="flex flex-wrap justify-between items-start gap-3 border-b border-white/5 pb-3">
                        <div>
                          <span className="text-[9px] font-mono text-gold-champagne uppercase block">Booking Reference</span>
                          <span className="text-xs font-semibold text-ivory font-mono">{b.referenceCode}</span>
                          <p className="text-[10px] text-muted-gray mt-0.5">{b.contactName} ({b.contactPhone})</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <span className="text-[8px] font-mono text-muted-gray block">Assessed Penalty</span>
                            <span className="text-xs font-bold text-gold-champagne">₹{totalPenalty.toLocaleString("en-IN")}</span>
                          </div>
                          <span className={`px-2 py-0.5 rounded text-[8px] font-mono font-bold uppercase border ${isPaid ? "bg-emerald-500/10 border-emerald-500/25 text-emerald-400" : isUnpaid ? "bg-rose-500/10 border-rose-500/25 text-rose-400" : "bg-white/5 border-white/10 text-muted-gray"}`}>
                            {b.penaltyPaymentStatus || "none"}
                          </span>
                        </div>
                      </div>

                      {/* Penalty inputs */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                        <div className="space-y-1">
                          <label className="text-[9px] uppercase font-mono text-muted-gray">Late Return Fee (₹)</label>
                          <input
                            type="number"
                            disabled={isPaid}
                            value={lateFee[b.id] ?? 0}
                            onChange={(e) => setLateFee({ ...lateFee, [b.id]: Math.max(0, parseInt(e.target.value) || 0) })}
                            className="w-full bg-black/45 border border-white/10 rounded p-2 text-xs text-ivory focus:outline-none focus:border-gold-champagne/45"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] uppercase font-mono text-muted-gray">Damage Cost (₹)</label>
                          <input
                            type="number"
                            disabled={isPaid}
                            value={damageCost[b.id] ?? 0}
                            onChange={(e) => setDamageCost({ ...damageCost, [b.id]: Math.max(0, parseInt(e.target.value) || 0) })}
                            className="w-full bg-black/45 border border-white/10 rounded p-2 text-xs text-ivory focus:outline-none focus:border-gold-champagne/45"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] uppercase font-mono text-muted-gray">Damage Assessment Description</label>
                          <input
                            type="text"
                            disabled={isPaid}
                            placeholder="Detail sensor spots, body scratches, etc."
                            value={damageDescription[b.id] ?? ""}
                            onChange={(e) => setDamageDescription({ ...damageDescription, [b.id]: e.target.value })}
                            className="w-full bg-black/45 border border-white/10 rounded p-2 text-xs text-ivory focus:outline-none focus:border-gold-champagne/45"
                          />
                        </div>
                      </div>

                      {/* Form submission controls */}
                      <div className="flex flex-wrap gap-3.5 items-center justify-between border-t border-white/5 pt-3">
                        <p className="text-[9px] text-muted-gray italic">
                          Return remark: "{b.returnRemarks || 'No return comment entered.'}"
                        </p>
                        
                        {!isPaid && (
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => handleAssessPenalty(b.id)}
                              disabled={submittingId === b.id}
                              className="px-4 py-2 bg-white/10 hover:bg-white/15 text-[10px] font-bold uppercase text-gold-champagne rounded transition cursor-pointer"
                            >
                              {submittingId === b.id ? "Saving..." : "Save Assessment"}
                            </button>
                            {totalPenalty > 0 && (
                              <button
                                type="button"
                                onClick={() => handleSendInvoice(b)}
                                className="px-4 py-2 bg-gold-champagne hover:bg-gold-warm text-obsidian text-[10px] font-extrabold uppercase rounded transition cursor-pointer flex items-center gap-1.5"
                              >
                                <Mail size={11} /> Email Invoice & Link
                              </button>
                            )}
                          </div>
                        )}
                        {isPaid && (
                          <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
                            ✓ Post-rental charges cleared. No action required.
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
