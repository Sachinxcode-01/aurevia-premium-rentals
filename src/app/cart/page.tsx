"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Navbar from "@/components/navigation/Navbar";
import { useCart } from "@/hooks/useCart";
import { useToast } from "@/hooks/useToast";
import {
  Trash2,
  Calendar,
  ShieldCheck,
  Tag,
  ArrowRight,
  ShoppingBag,
  Plus,
  Minus,
  CheckCircle2,
} from "lucide-react";

export default function CartPage() {
  const router = useRouter();
  const toast = useToast();
  const {
    cart,
    removeFromCart,
    updateCartItemQty,
    coupon,
    discountPercent,
    applyCouponCode,
    removeCoupon,
    cartTotals,
  } = useCart();

  const [couponInput, setCouponInput] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;

    setCouponLoading(true);
    const success = await applyCouponCode(couponInput.trim().toUpperCase());
    setCouponLoading(false);

    if (success) {
      toast.success(`Coupon ${couponInput.toUpperCase()} applied successfully!`);
      setCouponInput("");
    } else {
      toast.error("Invalid or expired coupon code.");
    }
  };

  return (
    <div className="min-h-screen bg-obsidian text-ivory flex flex-col">
      <Navbar cartItemCount={cart.length} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20">
        {/* Breadcrumb / Header */}
        <div className="space-y-2 mb-8 border-b border-white/10 pb-6">
          <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-gold-champagne">
            Production Equipment Manifest
          </span>
          <h1 className="text-3xl md:text-4xl font-serif font-light text-ivory tracking-tight">
            Your Selected <span className="text-gold">Gear Cart</span>
          </h1>
        </div>

        {cart.length === 0 ? (
          <div className="py-20 text-center space-y-6 max-w-md mx-auto">
            <div className="w-16 h-16 rounded-full bg-charcoal/80 border border-white/10 flex items-center justify-center mx-auto text-gold-champagne">
              <ShoppingBag size={28} />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-serif text-ivory">Your Gear Cart is Empty</h2>
              <p className="text-xs text-muted-gray leading-relaxed">
                Explore our vault of cinematic camera bodies, prime lenses, and production accessories ready for instant reservation.
              </p>
            </div>
            <Link
              href="/explore"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gold-champagne text-obsidian font-mono text-xs uppercase tracking-widest font-semibold rounded-xl hover:bg-gold-light transition"
            >
              Browse Equipment Vault
              <ArrowRight size={14} />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Cart Items List */}
            <div className="lg:col-span-8 space-y-4">
              {cart.map((item) => (
                <div
                  key={item.product.id}
                  className="rounded-2xl border border-white/10 bg-charcoal/60 p-4 sm:p-6 backdrop-blur-xl flex flex-col sm:flex-row items-start sm:items-center gap-5 justify-between"
                >
                  <div className="flex items-center gap-4">
                    <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden bg-black/40 shrink-0 border border-white/5">
                      <Image
                        src={item.product.imagePrimary || "/assets/canon-sequence/frame-210.jpg"}
                        alt={item.product.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-sm sm:text-base font-serif font-medium text-ivory">
                        {item.product.name}
                      </h3>
                      <p className="text-xs font-mono text-gold-champagne">
                        ₹{item.product.dailyPrice.toLocaleString("en-IN")} / day
                      </p>
                      <div className="flex items-center gap-1.5 text-[10px] font-mono text-muted-gray pt-1">
                        <Calendar size={11} className="text-gold-champagne" />
                        <span>
                          {item.startDate} → {item.endDate}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-6 pt-3 sm:pt-0 border-t sm:border-t-0 border-white/5">
                    {/* Quantity Controls */}
                    <div className="flex items-center border border-white/10 rounded-lg bg-black/40">
                      <button
                        type="button"
                        onClick={() => updateCartItemQty(item.product.id, Math.max(1, item.quantity - 1))}
                        className="p-1.5 text-muted-gray hover:text-ivory transition cursor-pointer"
                        aria-label="Decrease quantity"
                      >
                        <Minus size={12} />
                      </button>
                      <span className="font-mono text-xs px-2.5 text-ivory">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateCartItemQty(item.product.id, item.quantity + 1)}
                        className="p-1.5 text-muted-gray hover:text-ivory transition cursor-pointer"
                        aria-label="Increase quantity"
                      >
                        <Plus size={12} />
                      </button>
                    </div>

                    {/* Subtotal for Item */}
                    <div className="text-right">
                      <span className="font-mono text-sm font-semibold text-ivory block">
                        ₹{(item.product.dailyPrice * item.quantity * Math.max(1, cartTotals.totalDays)).toLocaleString("en-IN")}
                      </span>
                      <span className="text-[9px] font-mono text-muted-gray">
                        ({Math.max(1, cartTotals.totalDays)} days)
                      </span>
                    </div>

                    {/* Remove Action */}
                    <button
                      type="button"
                      onClick={() => removeFromCart(item.product.id)}
                      className="p-2 text-muted-gray hover:text-rose-400 transition cursor-pointer rounded-lg hover:bg-rose-500/10"
                      title="Remove from cart"
                      aria-label="Remove item"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              ))}

              <div className="flex items-center justify-between pt-2">
                <Link
                  href="/explore"
                  className="text-xs font-mono text-gold-champagne hover:text-gold-warm transition flex items-center gap-1.5"
                >
                  ← Add More Equipment
                </Link>
              </div>
            </div>

            {/* Summary Column */}
            <div className="lg:col-span-4 space-y-6">
              <div className="rounded-2xl border border-gold-champagne/30 bg-charcoal/80 p-6 backdrop-blur-xl space-y-6 shadow-2xl">
                <h2 className="text-base font-serif tracking-wide text-ivory border-b border-white/10 pb-3">
                  Reservation Summary
                </h2>

                {/* Pricing Line Items */}
                <div className="space-y-3 text-xs font-mono">
                  <div className="flex justify-between text-muted-gray">
                    <span>Base Rental Fee</span>
                    <span className="text-ivory">₹{cartTotals.rentalFee.toLocaleString("en-IN")}</span>
                  </div>

                  {coupon && cartTotals.discountAmount > 0 && (
                    <div className="flex justify-between text-emerald-400">
                      <span className="flex items-center gap-1">
                        <Tag size={12} />
                        Promo ({coupon.code})
                      </span>
                      <span>-₹{cartTotals.discountAmount.toLocaleString("en-IN")}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-muted-gray">
                    <span>Security Deposit</span>
                    <span className="text-emerald-400 uppercase text-[10px]">Zero (Waived)</span>
                  </div>

                  <div className="flex justify-between text-muted-gray">
                    <span>Turnaround Maintenance</span>
                    <span className="text-emerald-400 uppercase text-[10px]">Included</span>
                  </div>

                  <div className="border-t border-white/10 pt-3 flex justify-between items-baseline">
                    <span className="text-sm font-serif text-ivory">Total Payable</span>
                    <span className="text-xl font-bold font-mono text-gold-champagne">
                      ₹{cartTotals.totalPayable.toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>

                {/* Coupon Code Input */}
                <div className="pt-2 border-t border-white/10 space-y-2">
                  {coupon ? (
                    <div className="flex items-center justify-between p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs font-mono text-emerald-400">
                      <div className="flex items-center gap-1.5">
                        <CheckCircle2 size={14} />
                        <span>{coupon.code} applied ({discountPercent}% off)</span>
                      </div>
                      <button
                        type="button"
                        onClick={removeCoupon}
                        className="text-muted-gray hover:text-rose-400 transition cursor-pointer text-[10px] uppercase"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleApplyCoupon} className="flex gap-2">
                      <input
                        type="text"
                        value={couponInput}
                        onChange={(e) => setCouponInput(e.target.value)}
                        placeholder="ENTER COUPON CODE"
                        className="flex-1 bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-xs font-mono uppercase text-ivory placeholder:text-muted-gray focus:outline-none focus:border-gold-champagne"
                      />
                      <button
                        type="submit"
                        disabled={couponLoading || !couponInput.trim()}
                        className="px-4 py-2 bg-charcoal border border-gold-champagne/40 text-gold-champagne hover:bg-gold-champagne hover:text-obsidian rounded-xl text-xs font-mono uppercase font-semibold transition cursor-pointer disabled:opacity-50"
                      >
                        {couponLoading ? "..." : "Apply"}
                      </button>
                    </form>
                  )}
                </div>

                {/* Primary CTA */}
                <button
                  type="button"
                  onClick={() => router.push("/booking")}
                  className="w-full py-3.5 bg-gold-champagne text-obsidian font-mono text-xs uppercase tracking-widest font-bold rounded-xl hover:bg-gold-light transition flex items-center justify-center gap-2 cursor-pointer shadow-lg"
                >
                  Proceed to Reservation
                  <ArrowRight size={14} />
                </button>

                {/* Trust Badges */}
                <div className="flex items-center justify-center gap-2 text-[10px] font-mono text-muted-gray/80 pt-1">
                  <ShieldCheck size={13} className="text-emerald-400" />
                  <span>256-Bit SSL · Verified Razorpay Checkout</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
