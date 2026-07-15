"use client";

import React from "react";
import Navbar from "@/components/navigation/Navbar";
import { useCart } from "@/hooks/useCart";

export default function PrivacyPage() {
  const { cart } = useCart();

  return (
    <div className="min-h-screen bg-obsidian text-ivory pb-20">
      <Navbar cartItemCount={cart.length} />

      <div className="pt-32 pb-12 px-6 md:px-12 max-w-7xl mx-auto border-b border-white/5">
        <span className="text-[10px] font-semibold uppercase tracking-[0.25em] text-gold-champagne font-mono block mb-2">
          Data Protection
        </span>
        <h1 className="serif-heading text-4xl md:text-5xl lg:text-6xl font-light text-ivory">
          Privacy <span className="text-gold">Policy</span>
        </h1>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-12 space-y-8 text-xs text-muted-gray leading-relaxed font-light">
        <div className="space-y-3">
          <h3 className="serif-heading text-lg font-medium text-ivory">1. Information We Collect</h3>
          <p>We collect details you input during profile initialization, including name, email, phone number, and shipping addresses. For bookings verification, physical ID scans are inspected matching names to safeguard our camera vault assets.</p>
        </div>

        <div className="space-y-3">
          <h3 className="serif-heading text-lg font-medium text-ivory">2. Usage of Contact Information</h3>
          <p>Contact details are used for reservation tracking updates, shipping alerts, and direct concierge notifications under management of Prem. Your details are never traded or exposed to third-party marketing entities.</p>
        </div>

        <div className="space-y-3">
          <h3 className="serif-heading text-lg font-medium text-ivory">3. Secure Database Cryptography</h3>
          <p>Session data and transactions details are processed using high-security SSL encryption channels. Audit logs are preserved containing dates and actions to prevent unauthorized portal access.</p>
        </div>
      </div>
    </div>
  );
}
