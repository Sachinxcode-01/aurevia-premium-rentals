"use client";

import React, { useState } from "react";
import Script from "next/script";
import Navbar from "@/components/navigation/Navbar";
import { useCart } from "@/hooks/useCart";
import { db } from "@/lib/db/store";
import { MOCK_PRODUCTS } from "@/lib/db/mockData";
import {
  Calendar,
  Trash2,
  Tag,
  CreditCard,
  Truck,
  Building,
  CheckCircle,
  PhoneCall,
  User,
  Mail,
  Smartphone,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";
import { animate, stagger } from "animejs";

type CheckoutStep = "cart" | "details" | "confirmation";

export default function BookingPage() {
  const {
    cart,
    coupon,
    discountPercent,
    applyCouponCode,
    removeCoupon,
    removeFromCart,
    clearCart,
    cartTotals,
  } = useCart();

  const [step, setStep] = useState<CheckoutStep>("cart");
  const [couponCode, setCouponCode] = useState("");
  const [couponError, setCouponError] = useState("");
  
  // Checkout Form Details
  const [fullName, setFullName] = useState("Prem Kumar");
  const [email, setEmail] = useState("contact@prem.dev");
  const [phone, setPhone] = useState("9686909048");
  const [deliveryMethod, setDeliveryMethod] = useState<"pickup" | "delivery">("pickup");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("card");
  
  // Created Booking Ref
  const [createdBooking, setCreatedBooking] = useState<any | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingError, setBookingError] = useState("");

  // Logistics Upgrades
  const [pickupTime, setPickupTime] = useState("10:00 AM");
  const [returnTime, setReturnTime] = useState("04:00 PM");
  const [emergencyContact, setEmergencyContact] = useState("Aswin Kumar - 9876543210");
  const [companyOrCollege, setCompanyOrCollege] = useState("Aurevia Studio");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError("");
    const success = await applyCouponCode(couponCode);
    if (!success) {
      setCouponError("Invalid or inactive luxury coupon code.");
    } else {
      setCouponCode("");
    }
  };

  const handleCreateBooking = async () => {
    if (cart.length === 0) return;
    setIsSubmitting(true);
    setBookingError("");

    try {
      const refCode = `AV-2026-${Math.floor(Math.random() * 90000) + 10000}`;
      
      const payableAmount = cartTotals.totalPayable;
      const bookingPayload = {
        profileId: "usr-prem", // Simulated login user
        referenceCode: refCode,
        startDate: cart[0].startDate,
        endDate: cart[0].endDate,
        totalRentalFee: cartTotals.rentalFee,
        securityDeposit: 0,
        taxFee: 0,
        deliveryFee: 0,
        discountAmount: cartTotals.discountAmount,
        totalPayable: payableAmount,
        deliveryMethod,
        contactName: fullName,
        contactPhone: phone,
        contactEmail: email,
        couponApplied: coupon?.code,
        pickupTime,
        returnTime,
        emergencyContact,
        companyOrCollege,
        agreementAccepted: true,
        agreementAcceptedAt: new Date().toISOString(),
        agreementIP: "127.0.0.1",
        depositPaymentMethod: "razorpay" as const,
        items: cart.map((item) => ({
          productId: item.product.id,
          quantity: item.quantity,
          unitPrice: 799,
        })),
        addons: cart.flatMap((item) =>
          item.selectedAddons.map((addId) => ({
            addonId: addId,
            price: 0,
          }))
        ),
      };

      // 1. Create the booking draft (local storage)
      const result = await db.createBooking(bookingPayload);

      // 2. Call backend create-order endpoint with secure payload structure (recalculated on server)
      const orderRes = await fetch("/api/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          couponCode: coupon?.code || null,
          deliveryMethod,
          emergencyContact,
          companyOrCollege,
          contactEmail: email,
          contactName: fullName,
          contactPhone: phone,
          items: cart.map((item) => ({
            productId: item.product.id,
            quantity: item.quantity,
            startDate: item.startDate,
            endDate: item.endDate,
          })),
          addons: cart.flatMap((item) => item.selectedAddons),
          receipt: result.referenceCode,
        }),
      });

      if (!orderRes.ok) {
        const errData = await orderRes.json().catch(() => ({}));
        throw new Error(errData.error || "Failed to initiate Razorpay order on the server.");
      }

      const orderData = await orderRes.json();

      // 3. Open Razorpay Modal
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_TDzpNVr4KK6rJG",
        amount: orderData.amount,
        currency: orderData.currency,
        name: "AUREVIA Premium Rentals",
        description: `Rental Booking ${result.referenceCode}`,
        order_id: orderData.order_id,
        handler: async function (response: any) {
          try {
            setIsSubmitting(true);
            setBookingError("");

            // Send payment details to verification endpoint
            const verifyRes = await fetch("/api/verify-payment", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                bookingId: result.id,
              }),
            });

            const verifyData = await verifyRes.json();
            if (verifyRes.ok && verifyData.success) {
              // 4. Mark the booking as paid and confirmed
              const updated = await db.getBookingById(result.id);
              setCreatedBooking(updated || { ...result, status: "confirmed", paymentStatus: "paid" });
              clearCart();
              setStep("confirmation");

              // Staggered entry animation on confirmation icons
              setTimeout(() => {
                animate(".success-fade", {
                  opacity: [0, 1],
                  translateY: [20, 0],
                  delay: stagger(150),
                  duration: 800,
                  ease: "easeOutQuad",
                });
              }, 50);
            } else {
              setBookingError(verifyData.error || "Payment verification failed.");
            }
          } catch (err: any) {
            setBookingError(err.message || "Failed to verify signature.");
          } finally {
            setIsSubmitting(false);
          }
        },
        prefill: {
          name: fullName,
          email: email,
          contact: phone,
        },
        image: "/readme/aurevia-logo.png",
        theme: {
          color: "#09a275",
        },
        modal: {
          ondismiss: function () {
            setBookingError("Payment modal was closed before completion.");
            setIsSubmitting(false);
          },
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on("payment.failed", function (response: any) {
        setBookingError(response.error.description || "Razorpay transaction failed.");
        setIsSubmitting(false);
      });
      rzp.open();
    } catch (err: any) {
      setBookingError(err.message || "Failed to process transaction. Please try again.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-obsidian text-ivory pb-20">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      <Navbar cartItemCount={cart.length} />

      {/* Page Title Header */}
      <div className="pt-32 pb-12 px-6 md:px-12 max-w-7xl mx-auto border-b border-white/5">
        <h1 className="serif-heading text-4xl font-light">
          {step === "confirmation" ? "Booking Complete" : "Rental Checkout"}
        </h1>
        <p className="text-xs text-muted-gray uppercase tracking-widest font-mono mt-1">
          {step === "cart" && "Step 1: Review Selected Gear"}
          {step === "details" && "Step 2: Guest Details & Verification"}
          {step === "confirmation" && "Vault Reservation Confirmed"}
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-12 py-10">
        {/* Error Announcements */}
        {bookingError && (
          <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-mono rounded">
            ⚠️ ERROR: {bookingError}
          </div>
        )}

        {/* ----------------------------------------------------
            STEP 1: CART REVIEW
            ---------------------------------------------------- */}
        {step === "cart" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Cart Items List */}
            <div className="lg:col-span-8 space-y-4">
              {cart.length === 0 ? (
                <div className="glass-panel border-white/5 rounded-lg p-16 text-center space-y-4">
                  <p className="text-xs text-muted-gray">Your rental cart is empty.</p>
                  <Link
                    href="/explore"
                    className="px-6 py-2.5 bg-gold-champagne text-obsidian text-xs font-bold uppercase tracking-wider rounded hover:bg-gold-warm transition"
                  >
                    Go to Catalog
                  </Link>
                </div>
              ) : (
                cart.map((item) => (
                  <div
                    key={item.product.id}
                    className="glass-panel border-white/5 rounded-lg p-5 flex flex-col sm:flex-row gap-6 justify-between items-start sm:items-center"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <img src={item.product.imagePrimary} className="w-16 h-12 object-cover rounded bg-black/25 border border-white/5" alt="" />
                      <div>
                        <h3 className="serif-heading text-base font-light text-ivory">{item.product.name}</h3>
                        <p className="text-[9px] text-gold-champagne uppercase tracking-widest font-mono mt-0.5">
                          {item.quantity} Unit(s) • {item.startDate} to {item.endDate}
                        </p>
                        {item.selectedAddons.length > 0 && (
                          <p className="text-[9px] text-muted-gray mt-1">
                            + {item.selectedAddons.map(id => id === "a1000000-0000-0000-0000-000000000001" ? "CFexpress" : id === "a1000000-0000-0000-0000-000000000002" ? "Extra Battery" : "Monitor").join(", ")}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-6 justify-between sm:justify-end w-full sm:w-auto">
                      <div className="text-right">
                        <span className="text-[8px] text-muted-gray uppercase block font-mono">Daily Rate</span>
                        <span className="text-xs text-ivory">₹{item.product.dailyPrice.toLocaleString("en-IN")}</span>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.product.id)}
                        className="text-muted-gray hover:text-rose-400 transition p-2 cursor-pointer"
                        title="Remove Item"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Sticky Pricing Summary */}
            <div className="lg:col-span-4">
              <div className="glass-panel-gold border-gold-border rounded-lg p-6 space-y-6">
                <h3 className="serif-heading text-lg font-light text-ivory border-b border-white/10 pb-3">Booking Cost Breakdown</h3>

                <div className="space-y-3 font-sans text-xs">
                  <div className="flex justify-between text-muted-gray">
                    <span>Base Rental Charges:</span>
                    <span className="font-mono text-ivory">₹{cartTotals.rentalFee.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="flex justify-between text-muted-gray">
                    <span>Security Deposit (Refundable):</span>
                    <span className="font-mono text-ivory">₹{cartTotals.depositFee.toLocaleString("en-IN")}</span>
                  </div>
                  {discountPercent > 0 && (
                    <div className="flex justify-between text-emerald-400">
                      <span>Promo Discount ({discountPercent}%):</span>
                      <span className="font-mono">- ₹{cartTotals.discountAmount.toLocaleString("en-IN")}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-muted-gray">
                    <span>Estimated GST (18%):</span>
                    <span className="font-mono text-ivory">₹{cartTotals.taxFee.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="flex justify-between text-muted-gray">
                    <span>Handling & Shipping:</span>
                    <span className="font-mono text-ivory">₹{cartTotals.deliveryFee.toLocaleString("en-IN")}</span>
                  </div>
                  
                  <div className="flex justify-between text-sm font-bold border-t border-white/10 pt-3 text-gold-champagne">
                    <span>Total Estimated:</span>
                    <span className="font-mono">₹{cartTotals.totalPayable.toLocaleString("en-IN")}</span>
                  </div>
                </div>

                {/* Promo Code Input */}
                {cart.length > 0 && (
                  <form onSubmit={handleApplyCoupon} className="space-y-2 pt-2 border-t border-white/5">
                    <label className="text-[9px] text-muted-gray uppercase font-mono tracking-wider block">Apply Promo Coupon</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="e.g. AUREVIA10"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        className="flex-1 bg-white/5 border border-white/10 text-xs rounded p-2 focus:outline-none focus:border-gold-champagne/40"
                      />
                      <button type="submit" className="px-3 bg-white/10 text-gold-champagne text-xs font-semibold rounded hover:bg-white/15 transition cursor-pointer">
                        Apply
                      </button>
                    </div>
                    {coupon ? (
                      <div className="flex items-center justify-between bg-emerald-500/10 text-emerald-400 text-[10px] p-2 rounded border border-emerald-500/20 mt-2 font-mono">
                        <span>Code Applied: {coupon.code}</span>
                        <button type="button" onClick={removeCoupon} className="hover:underline text-[9px] uppercase font-bold cursor-pointer">Remove</button>
                      </div>
                    ) : couponError ? (
                      <p className="text-[10px] text-rose-400 font-mono mt-1">{couponError}</p>
                    ) : (
                      <p className="text-[9px] text-muted-gray leading-normal mt-1">Use AUREVIA10 for a 10% discount on optical services.</p>
                    )}
                  </form>
                )}

                <button
                  disabled={cart.length === 0}
                  onClick={() => setStep("details")}
                  className={`w-full py-3.5 text-xs font-bold uppercase tracking-wider rounded transition flex items-center justify-center gap-1.5 cursor-pointer ${
                    cart.length > 0
                      ? "bg-gold-champagne hover:bg-gold-warm text-obsidian shadow-lg shadow-gold-champagne/5"
                      : "bg-white/5 text-muted-gray cursor-not-allowed border border-white/5"
                  }`}
                >
                  Proceed to Details
                  <ArrowRight size={13} />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ----------------------------------------------------
            STEP 2: CUSTOMER DETAILS
            ---------------------------------------------------- */}
        {step === "details" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Guest Form */}
            <div className="lg:col-span-8 glass-panel border-white/5 rounded-lg p-6 md:p-8 space-y-6">
              <h3 className="serif-heading text-xl font-light text-ivory border-b border-white/5 pb-3">Guest Contact Details</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] text-muted-gray uppercase font-mono tracking-wider block">Full Name</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 text-xs rounded p-2.5 pl-8 focus:outline-none"
                    />
                    <User size={13} className="absolute left-2.5 top-3.5 text-muted-gray" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] text-muted-gray uppercase font-mono tracking-wider block">Email Address</label>
                  <div className="relative">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 text-xs rounded p-2.5 pl-8 focus:outline-none"
                    />
                    <Mail size={13} className="absolute left-2.5 top-3.5 text-muted-gray" />
                  </div>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label className="text-[10px] text-muted-gray uppercase font-mono tracking-wider block">Mobile Phone Number</label>
                  <div className="relative">
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 text-xs rounded p-2.5 pl-8 focus:outline-none"
                    />
                    <Smartphone size={13} className="absolute left-2.5 top-3.5 text-muted-gray" />
                  </div>
                </div>
              </div>

              {/* Pickup & Return Time Slots */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-white/5">
                <div className="space-y-2">
                  <label className="text-[10px] text-muted-gray uppercase font-mono tracking-wider block">Pickup Time Slot</label>
                  <select
                    value={pickupTime}
                    onChange={(e) => setPickupTime(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 text-xs rounded p-2.5 focus:outline-none text-ivory"
                  >
                    <option value="09:00 AM">09:00 AM (Early Pickup)</option>
                    <option value="11:00 AM">11:00 AM</option>
                    <option value="01:00 PM">01:00 PM (Midday)</option>
                    <option value="03:00 PM">03:00 PM</option>
                    <option value="05:00 PM">05:00 PM (Late Pickup)</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] text-muted-gray uppercase font-mono tracking-wider block">Return Time Slot</label>
                  <select
                    value={returnTime}
                    onChange={(e) => setReturnTime(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 text-xs rounded p-2.5 focus:outline-none text-ivory"
                  >
                    <option value="10:00 AM">10:00 AM</option>
                    <option value="12:00 PM">12:00 PM</option>
                    <option value="02:00 PM">02:00 PM</option>
                    <option value="04:00 PM">04:00 PM</option>
                    <option value="06:00 PM">06:00 PM (End of Day)</option>
                  </select>
                </div>
              </div>

              {/* Emergency Contact & College/Company Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-white/5">
                <div className="space-y-2">
                  <label className="text-[10px] text-muted-gray uppercase font-mono tracking-wider block">Emergency Contact Name & Phone (Required)</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Aswin Kumar - 9876543210"
                    value={emergencyContact}
                    onChange={(e) => setEmergencyContact(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 text-xs rounded p-2.5 focus:outline-none focus:border-gold-champagne/40 text-ivory placeholder:text-muted-gray/50"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] text-muted-gray uppercase font-mono tracking-wider block">Company / College Name (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. Aurevia Studio or IIT Bangalore"
                    value={companyOrCollege}
                    onChange={(e) => setCompanyOrCollege(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 text-xs rounded p-2.5 focus:outline-none focus:border-gold-champagne/40 text-ivory placeholder:text-muted-gray/50"
                  />
                </div>
              </div>

              {/* Delivery method */}
              <div className="space-y-3 pt-4 border-t border-white/5">
                <label className="text-[10px] text-muted-gray uppercase font-mono tracking-wider block">Collection Method</label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setDeliveryMethod("pickup")}
                    className={`p-4 rounded border text-left space-y-2 cursor-pointer transition ${
                      deliveryMethod === "pickup"
                        ? "bg-gold-champagne/5 border-gold-champagne text-gold-champagne"
                        : "bg-white/5 border-white/5 text-ivory/80 hover:border-white/10"
                    }`}
                  >
                    <div className="flex items-center gap-2 font-semibold text-xs">
                      <Building size={14} />
                      Concierge Studio Pickup
                    </div>
                    <p className="text-[10px] text-muted-gray font-light">Pick up directly from our luxury studio vault in Bangalore. Free of charge.</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDeliveryMethod("delivery")}
                    className={`p-4 rounded border text-left space-y-2 cursor-pointer transition ${
                      deliveryMethod === "delivery"
                        ? "bg-gold-champagne/5 border-gold-champagne text-gold-champagne"
                        : "bg-white/5 border-white/5 text-ivory/80 hover:border-white/10"
                    }`}
                  >
                    <div className="flex items-center gap-2 font-semibold text-xs">
                      <Truck size={14} />
                      Secure Studio Delivery
                    </div>
                    <p className="text-[10px] text-muted-gray font-light">Delivered securely in heavy-duty Pelican flight cases to your set location. (₹500)</p>
                  </button>
                </div>
              </div>

              {/* Delivery Address fields */}
              {deliveryMethod === "delivery" && (
                <div className="space-y-4 pt-4 border-t border-white/5 animate-fade-in">
                  <div className="space-y-2">
                    <label className="text-[10px] text-muted-gray uppercase font-mono tracking-wider block">Shipping Address Line 1</label>
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Studio, floor, building details..."
                      className="w-full bg-white/5 border border-white/10 text-xs rounded p-2.5 focus:outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] text-muted-gray uppercase font-mono tracking-wider block">City</label>
                      <input
                        type="text"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 text-xs rounded p-2.5 focus:outline-none"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] text-muted-gray uppercase font-mono tracking-wider block">Postal Code</label>
                      <input
                        type="text"
                        value={postalCode}
                        onChange={(e) => setPostalCode(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 text-xs rounded p-2.5 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Payment selector */}
              <div className="space-y-3 pt-4 border-t border-white/5">
                <label className="text-[10px] text-muted-gray uppercase font-mono tracking-wider block">Secure Payment Method</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer text-xs">
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === "card"}
                      onChange={() => setPaymentMethod("card")}
                      className="accent-gold-champagne"
                    />
                    Credit / Debit Card
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-xs">
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === "upi"}
                      onChange={() => setPaymentMethod("upi")}
                      className="accent-gold-champagne"
                    />
                    UPI (Google Pay, PhonePe)
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-xs">
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === "netbanking"}
                      onChange={() => setPaymentMethod("netbanking")}
                      className="accent-gold-champagne"
                    />
                    Net Banking
                  </label>
                </div>
              </div>
            </div>

            {/* Cost Overview Side panel */}
            <div className="lg:col-span-4 space-y-4">
              <div className="glass-panel border-white/5 rounded-lg p-5 space-y-4">
                <h3 className="serif-heading text-base font-light text-ivory border-b border-white/5 pb-2">Checkout Reservation</h3>
                <div className="space-y-2 text-xs font-mono">
                  <div className="flex justify-between text-muted-gray">
                    <span>Camera Rent (₹799/day):</span>
                    <span>₹{cartTotals.rentalFee.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="flex justify-between text-muted-gray">
                    <span>Rental Duration:</span>
                    <span>{cartTotals.totalDays} Days</span>
                  </div>
                  {cartTotals.discountAmount > 0 && (
                    <div className="flex justify-between text-rose-400">
                      <span>Coupon Discount:</span>
                      <span>-₹{cartTotals.discountAmount.toLocaleString("en-IN")}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-gold-champagne font-bold text-sm border-t border-white/5 pt-2">
                    <span>Final Payable:</span>
                    <span>₹{cartTotals.totalPayable.toLocaleString("en-IN")}</span>
                  </div>
                </div>
              </div>

              {/* Action Button: Opens terms modal */}
              <div className="flex gap-3 mt-4">
                <button
                  onClick={() => setStep("cart")}
                  className="w-1/3 py-3 border border-white/10 text-muted-gray hover:text-ivory rounded text-xs uppercase font-semibold cursor-pointer transition"
                >
                  Back
                </button>
                <button
                  onClick={() => setShowTermsModal(true)}
                  disabled={isSubmitting}
                  className="flex-1 py-3 text-xs font-bold uppercase tracking-wider rounded transition flex items-center justify-center gap-1.5 bg-gold-champagne hover:bg-gold-warm text-obsidian shadow-lg shadow-gold-champagne/10 cursor-pointer animate-pulse"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-3.5 h-3.5 rounded-full border border-obsidian/30 border-t-obsidian animate-spin"></div>
                      Confirming...
                    </>
                  ) : (
                    <>
                      <ShieldCheck size={14} />
                      Review & Pay
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ----------------------------------------------------
            STEP 3: CONFIRMATION
            ---------------------------------------------------- */}
        {step === "confirmation" && createdBooking && (
          <div className="max-w-2xl mx-auto glass-panel-gold border-gold-border rounded-lg p-8 space-y-8 shadow-2xl backdrop-blur-md">
            
            <div className="text-center space-y-3 border-b border-white/10 pb-6">
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-2 success-fade" style={{ opacity: 0 }}>
                <CheckCircle size={32} />
              </div>
              <h2 className="serif-heading text-3xl font-light text-ivory success-fade" style={{ opacity: 0 }}>Order Confirmed</h2>
              <p className="text-xs text-gold-champagne font-mono uppercase tracking-widest success-fade" style={{ opacity: 0 }}>
                Reservation Code: {createdBooking.referenceCode}
              </p>
            </div>

            <div className="space-y-6 text-xs success-fade" style={{ opacity: 0 }}>
              <div className="space-y-3">
                <span className="text-[10px] text-muted-gray uppercase tracking-widest block font-mono">Rental Summary</span>
                
                {createdBooking.items.map((item: any, idx: number) => {
                  const productDetails = MOCK_PRODUCTS.find((p) => p.id === item.productId);
                  return (
                    <div key={idx} className="flex justify-between items-center bg-white/5 p-3.5 rounded border border-white/5">
                      <div>
                        <h4 className="font-semibold text-ivory">{productDetails?.name}</h4>
                        <p className="text-[10px] text-muted-gray font-mono mt-0.5">
                          {item.quantity} Unit(s) • {createdBooking.startDate} to {createdBooking.endDate}
                        </p>
                      </div>
                      <span className="font-mono text-gold-champagne">₹{item.unitPrice.toLocaleString("en-IN")}</span>
                    </div>
                  );
                })}
              </div>

              <div className="space-y-3 pt-4 border-t border-white/10">
                <span className="text-[10px] text-muted-gray uppercase tracking-widest block font-mono">Logistics schedule</span>
                <div className="grid grid-cols-2 gap-4 bg-white/5 p-4 rounded border border-white/5">
                  <div>
                    <span className="text-[8px] text-muted-gray uppercase font-mono block mb-0.5">Pickup / Delivery Mode</span>
                    <span className="text-ivory font-medium uppercase text-[10px]">
                      {createdBooking.deliveryMethod === "pickup" ? "Concierge Studio Pickup" : "Pelican Case Delivery"}
                    </span>
                  </div>
                  <div>
                    <span className="text-[8px] text-muted-gray uppercase font-mono block mb-0.5">Recipient</span>
                    <span className="text-ivory font-medium">{createdBooking.contactName} ({createdBooking.contactPhone})</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2 border-t border-white/10 pt-4 font-mono text-[10px] text-muted-gray">
                <div className="flex justify-between">
                  <span>Grand Total Paid:</span>
                  <span className="text-ivory">₹{createdBooking.totalPayable.toLocaleString("en-IN")}</span>
                </div>
              </div>
            </div>

            {/* Assistance Contact info */}
            <div className="bg-emerald-500/5 border border-emerald-500/20 p-4 rounded-lg flex flex-col sm:flex-row items-center justify-between gap-4 success-fade" style={{ opacity: 0 }}>
              <div className="space-y-1 text-left">
                <h4 className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
                  <PhoneCall size={12} />
                  AUREVIA Concierge Hotline
                </h4>
                <p className="text-[10px] text-muted-gray leading-normal">
                  Your dedicated vault reservation specialist Prem (9686909048) has reserved your equipment. For support or location pickups, call us anytime.
                </p>
              </div>
              <a
                href={`https://wa.me/919686909048?text=Hello%20Prem,%20confirming%20my%20Aurevia%20booking%20reservation%20${createdBooking.referenceCode}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-[10px] uppercase tracking-wider rounded transition cursor-pointer"
              >
                Chat WhatsApp
              </a>
            </div>

            <div className="pt-4 flex gap-4 success-fade" style={{ opacity: 0 }}>
              <Link
                href="/dashboard"
                className="w-1/2 py-3 bg-white/5 hover:bg-white/10 text-ivory text-xs font-semibold uppercase tracking-wider text-center rounded border border-white/10 transition"
              >
                View Dashboard
              </Link>
              
              <Link
                href="/explore"
                className="w-1/2 py-3 bg-gold-champagne hover:bg-gold-warm text-obsidian text-xs font-bold uppercase tracking-wider text-center rounded transition"
              >
                Back to Showroom
              </Link>
            </div>

          </div>
        )}

        {/* Terms and Conditions Modal Overlay */}
        {showTermsModal && (
          <div className="fixed inset-0 bg-black/85 flex items-center justify-center p-4 z-50 animate-fade-in font-sans">
            <div className="glass-panel border-gold-border/30 bg-[#0e0e0f] rounded-lg p-6 max-w-lg w-full space-y-4 text-ivory max-h-[85vh] overflow-y-auto">
              <h3 className="serif-heading text-xl font-light text-ivory border-b border-[#D8B36A]/20 pb-2">
                Rental Terms & Conditions
              </h3>
              
              <div className="text-xs text-muted-gray space-y-3 leading-relaxed max-h-60 overflow-y-auto pr-2 border-b border-white/5 pb-4 font-light">
                <p>Please review and accept our camera rental policy guidelines before completing checkout payment:</p>
                <ul className="list-disc list-inside space-y-2">
                  <li>Customer must return the camera on the selected date and time.</li>
                  <li>Late return fees may be charged per extra day (at a rate of ₹999/day).</li>
                  <li>Customer is responsible for physical damage during the rental period.</li>
                  <li>Breakage or repair charges will be based on the actual service cost.</li>
                  <li>Lost or stolen camera requires payment of the camera’s replacement value.</li>
                  <li>Missing lens, battery, charger, memory card, bag or accessories will be charged separately.</li>
                  <li>Water, impact, fire or misuse damage is the customer’s responsibility.</li>
                  <li>Camera condition will be recorded before pickup and after return.</li>
                  <li>Customer must not transfer or sub-rent the camera.</li>
                  <li><strong>Cancellation & Refund Rules:</strong> Free cancellation up to 24 hours prior to booking start time. 50% fee applies if cancelled within 24 hours. No refunds post pickup.</li>
                  <li>Razorpay payment confirms the booking only after successful server verification.</li>
                  <li>Availability remains subject to successful payment and booking confirmation.</li>
                </ul>
              </div>

              <div className="flex flex-col gap-3">
                <label className="flex items-start gap-2.5 cursor-pointer text-[10px] text-muted-gray font-light leading-normal select-none">
                  <input
                    type="checkbox"
                    checked={termsAccepted}
                    onChange={(e) => setTermsAccepted(e.target.checked)}
                    className="mt-0.5 accent-gold-champagne"
                  />
                  <span>
                    I have read and agree to the Rental Terms and Conditions.
                  </span>
                </label>

                <div className="flex justify-end gap-3 pt-2 border-t border-white/5">
                  <button
                    onClick={() => setShowTermsModal(false)}
                    className="px-4 py-2 border border-white/10 text-muted-gray hover:text-ivory rounded text-[10px] font-semibold uppercase tracking-wider transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      setShowTermsModal(false);
                      handleCreateBooking();
                    }}
                    disabled={!termsAccepted || isSubmitting}
                    className={`px-5 py-2 rounded text-[10px] font-bold uppercase tracking-wider transition flex items-center gap-1.5 ${
                      termsAccepted
                        ? "bg-gold-champagne hover:bg-gold-warm text-obsidian cursor-pointer"
                        : "bg-white/5 text-muted-gray border border-white/5 cursor-not-allowed"
                    }`}
                  >
                    Proceed to Payment
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
