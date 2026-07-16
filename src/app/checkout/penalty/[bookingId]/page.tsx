"use client";

import React, { useEffect, useState, use } from "react";
import Navbar from "@/components/navigation/Navbar";
import { useToast } from "@/hooks/useToast";
import { useCart } from "@/hooks/useCart";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { db, Booking } from "@/lib/db/store";
import { 
  Camera, ShieldCheck, AlertCircle, DollarSign, 
  CreditCard, Loader2, ArrowRight, CheckCircle2 
} from "lucide-react";
import Link from "next/link";
import Script from "next/script";

interface PenaltyPageProps {
  params: Promise<{ bookingId: string }>;
}

export default function PenaltyCheckoutPage({ params }: PenaltyPageProps) {
  const toast = useToast();
  const { cart } = useCart();
  const { bookingId } = use(params);

  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        const data = await db.getBookingById(bookingId);
        if (data) {
          setBooking(data);
          if (data.penaltyPaymentStatus === "paid") {
            setSuccess(true);
          }
        }
      } catch (err: any) {
        toast.error("Failed to load booking details: " + err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchBooking();
  }, [bookingId, toast]);

  const handlePayPenalty = async () => {
    if (!booking) return;
    setPaying(true);

    try {
      // 1. Create penalty order on server
      const orderRes = await fetch("/api/create-penalty-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId: booking.id })
      });

      if (!orderRes.ok) {
        const errData = await orderRes.json().catch(() => ({}));
        throw new Error(errData.error || "Failed to create payment order.");
      }

      const orderData = await orderRes.json();

      // 2. Configure Razorpay options
      const options = {
        key: orderData.key_id,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "AUREVIA Premium Rentals",
        description: `Outstanding Fees - Booking #${booking.referenceCode}`,
        order_id: orderData.order_id,
        handler: async function (response: any) {
          try {
            setPaying(true);
            const verifyRes = await fetch("/api/verify-penalty-payment", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                bookingId: booking.id
              })
            });

            const verifyData = await verifyRes.json();
            if (verifyRes.ok && verifyData.success) {
              toast.success("Payment verified! Penalty cleared.");
              setSuccess(true);
              setBooking(prev => prev ? { ...prev, penaltyPaymentStatus: "paid" } : null);
            } else {
              throw new Error(verifyData.error || "Payment signature verification failed.");
            }
          } catch (e: any) {
            toast.error(e.message || "Verification failed.");
          } finally {
            setPaying(false);
          }
        },
        prefill: {
          name: booking.contactName,
          email: booking.contactEmail,
          contact: booking.contactPhone
        },
        theme: {
          color: "#D8B36A"
        }
      };

      // 3. Open Razorpay modal
      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (err: any) {
      toast.error(err.message || "Payment initiation failed.");
    } finally {
      setPaying(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-obsidian flex items-center justify-center text-gold-champagne font-mono text-xs uppercase animate-pulse">
        Retrieving inspection records...
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-obsidian flex flex-col items-center justify-center gap-4 text-center">
        <AlertCircle className="text-rose-500 h-10 w-10 animate-bounce" />
        <h2 className="serif-heading text-xl text-ivory">Record Not Found</h2>
        <p className="text-xs text-muted-gray">This booking record or outstanding reference does not exist.</p>
        <Link href="/dashboard" className="text-gold-champagne hover:underline text-xs">Return to Dashboard</Link>
      </div>
    );
  }

  const damage = Number(booking.damageCost || 0);
  const late = Number(booking.lateFee || 0);
  const total = damage + late;

  return (
    <AuthGuard>
      <div className="min-h-screen bg-obsidian text-ivory pb-32">
        <Navbar cartItemCount={cart.length} />
        <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />

        <div className="max-w-xl mx-auto px-6 pt-32">
          {success ? (
            /* Success confirmation card */
            <div className="glass-panel border-gold-border/30 rounded-xl p-8 text-center space-y-6 bg-charcoal/45 shadow-2xl relative overflow-hidden">
              <div className="absolute inset-0 bg-gold-champagne/5 pointer-events-none" />
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mx-auto animate-pulse">
                <CheckCircle2 size={32} />
              </div>
              
              <div className="space-y-2">
                <span className="text-[9px] uppercase font-mono text-gold-champagne tracking-widest block">Clearance Certificate</span>
                <h2 className="serif-heading text-2xl font-bold text-ivory">Outstanding Penalty Settled</h2>
                <p className="text-xs text-muted-gray max-w-sm mx-auto leading-relaxed">
                  Thank you. Post-rental charges for booking #{booking.referenceCode} have been verified and paid. Your membership is fully cleared.
                </p>
              </div>

              <div className="border-t border-white/5 pt-4 space-y-2 text-xs font-mono text-muted-gray text-left bg-black/20 p-4 rounded">
                <div className="flex justify-between"><span>Reference:</span><span className="text-ivory font-bold">{booking.referenceCode}</span></div>
                <div className="flex justify-between"><span>Amount Paid:</span><span className="text-gold-champagne font-bold">₹{total.toLocaleString("en-IN")}</span></div>
                <div className="flex justify-between"><span>Cleared At:</span><span className="text-ivory">{new Date().toLocaleDateString("en-IN")}</span></div>
              </div>

              <Link
                href="/dashboard"
                className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-gold-champagne hover:underline"
              >
                Go to My Dashboard <ArrowRight size={12} />
              </Link>
            </div>
          ) : (
            /* Payment invoice card */
            <div className="glass-panel border-white/5 rounded-xl p-6 md:p-8 space-y-6 shadow-2xl bg-charcoal/30 relative">
              <div className="border-b border-white/10 pb-4">
                <span className="text-[9px] uppercase text-gold-champagne tracking-widest block font-mono mb-1">Outstanding Invoice</span>
                <h2 className="serif-heading text-xl font-bold text-ivory">Post-Rental Charges</h2>
                <p className="text-[10px] text-muted-gray mt-1">Inspection report for booking #{booking.referenceCode}</p>
              </div>

              <div className="space-y-4">
                <div className="bg-black/35 rounded-lg p-4 space-y-3.5 text-xs font-mono text-muted-gray">
                  {late > 0 && (
                    <div className="flex justify-between items-center">
                      <span>Late Return Surcharge</span>
                      <span className="text-ivory">₹{late.toLocaleString("en-IN")}</span>
                    </div>
                  )}
                  {damage > 0 && (
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex flex-col">
                        <span>Accidental Damage Charge</span>
                        <span className="text-[9px] text-rose-400 mt-0.5">{booking.damageDescription}</span>
                      </div>
                      <span className="text-ivory font-bold shrink-0">₹{damage.toLocaleString("en-IN")}</span>
                    </div>
                  )}
                  <div className="border-t border-white/5 pt-3 flex justify-between items-center text-sm font-bold">
                    <span className="text-gold-champagne">Total Amount Due</span>
                    <span className="text-gold-champagne font-extrabold text-base">₹{total.toLocaleString("en-IN")}</span>
                  </div>
                </div>

                <div className="flex gap-2.5 bg-rose-500/5 border border-rose-500/10 rounded-lg p-4">
                  <AlertCircle className="text-rose-400 shrink-0 mt-0.5" size={14} />
                  <p className="text-[10px] text-rose-300 leading-relaxed font-mono">
                    Outstanding balances restrict booking new equipment from the vault. Clear charges securely using UPI, Card or Netbanking below.
                  </p>
                </div>

                <button
                  onClick={handlePayPenalty}
                  disabled={paying}
                  className="w-full py-4 bg-gold-champagne hover:bg-gold-warm text-obsidian text-xs font-extrabold uppercase tracking-widest rounded-lg transition font-mono flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  {paying ? (
                    <><Loader2 size={14} className="animate-spin" /> Verifying Vault Gateway...</>
                  ) : (
                    <><CreditCard size={14} /> Secure Payment via Razorpay</>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </AuthGuard>
  );
}
