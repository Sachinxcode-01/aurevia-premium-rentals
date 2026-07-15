"use client";

import React from "react";
import Navbar from "@/components/navigation/Navbar";
import { useCart } from "@/hooks/useCart";

export default function TermsPage() {
  const { cart } = useCart();

  return (
    <div className="min-h-screen bg-obsidian text-ivory pb-20">
      <Navbar cartItemCount={cart.length} />

      <div className="pt-32 pb-12 px-6 md:px-12 max-w-7xl mx-auto border-b border-white/5">
        <span className="text-[10px] font-semibold uppercase tracking-[0.25em] text-gold-champagne font-mono block mb-2">
          Legal Agreement
        </span>
        <h1 className="serif-heading text-4xl md:text-5xl lg:text-6xl font-light text-ivory">
          Rental <span className="text-gold">Terms & Conditions</span>
        </h1>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-12 space-y-8 text-xs text-muted-gray leading-relaxed font-light">
        <div className="space-y-3">
          <h3 className="serif-heading text-lg font-medium text-ivory">1. Equipment Inspection</h3>
          <p>The renter agrees to inspect all items (lens glass, sensor bodies, stabilizer calibration) upon handover. Any noted aesthetic or functional defects must be documented. Unreported defects discovered upon return will be assumed to have occurred during the rental term.</p>
        </div>

        <div className="space-y-3">
          <h3 className="serif-heading text-lg font-medium text-ivory">2. Security Deposits & Payments</h3>
          <p>Aurevia holds a pre-authorization security deposit for all equipment rentals. Deposits are released in full within 24-48 hours after returning gear in inspected condition. If damage is verified, the cost will be assessed and deducted from the deposit.</p>
        </div>

        <div className="space-y-3">
          <h3 className="serif-heading text-lg font-medium text-ivory">3. Damage and Waiver Policies</h3>
          <p>Our optional damage waiver protects against accidental impact or moisture damages. It does not cover complete loss, theft, cosmetic scrapes, or gross negligence. Uncovered damages are evaluated according to physical repair cost assessments.</p>
        </div>
      </div>
    </div>
  );
}
