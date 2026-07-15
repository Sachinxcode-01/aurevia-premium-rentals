"use client";

import React from "react";
import Navbar from "@/components/navigation/Navbar";
import { useCart } from "@/hooks/useCart";
import Link from "next/link";
import { Check, Clipboard, Calendar, HelpCircle, PackageOpen } from "lucide-react";

export default function RentalProcessPage() {
  const { cart } = useCart();

  return (
    <div className="min-h-screen bg-obsidian text-ivory pb-20">
      <Navbar cartItemCount={cart.length} />

      <div className="pt-32 pb-12 px-6 md:px-12 max-w-7xl mx-auto border-b border-white/5">
        <span className="text-[10px] font-semibold uppercase tracking-[0.25em] text-gold-champagne font-mono block mb-2">
          Operations Guide
        </span>
        <h1 className="serif-heading text-4xl md:text-5xl lg:text-6xl font-light text-ivory">
          How AUREVIA <span className="text-gold">Rentals Work</span>
        </h1>
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-12 py-12 space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {[
            {
              step: "Step 01",
              title: "Vault Selection",
              desc: "Browse our premium DSLR, mirrorless, and cinema camera catalogs. Filter by category, lens length, and technical specifications.",
            },
            {
              step: "Step 02",
              title: "Availability Locking",
              desc: "Enter pickup and return dates. Our real-time calendar checks stock and ensures you are never double-booked.",
            },
            {
              step: "Step 03",
              title: "Concierge Handover",
              desc: "Collect your equipment directly from our Indiranagar studio or opt for secure flight-cased delivery to your shoot location.",
            },
            {
              step: "Step 04",
              title: "Return & Refund",
              desc: "Return the checked-out gear. Once inspected, security deposits are fully returned to your original payment source within 24 hours.",
            },
          ].map((item) => (
            <div key={item.step} className="glass-panel border-white/5 p-6 rounded-lg space-y-4">
              <span className="text-xs font-mono text-gold-champagne uppercase tracking-widest block">{item.step}</span>
              <h3 className="serif-heading text-lg font-light text-ivory">{item.title}</h3>
              <p className="text-xs text-muted-gray leading-relaxed font-light">{item.desc}</p>
            </div>
          ))}
        </div>

        <div className="glass-panel p-8 rounded-lg border-white/5 space-y-6">
          <h3 className="serif-heading text-xl text-ivory border-b border-white/5 pb-2">Frequently Audited Guidelines</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-muted-gray font-light leading-relaxed">
            <div className="space-y-3">
              <p className="flex gap-2 items-start">
                <Check size={14} className="text-gold-champagne shrink-0 mt-0.5" />
                <span><strong>Required Identification:</strong> Creators must present a government photo ID card (Aadhaar, Passport, DL) matching order credentials upon collection.</span>
              </p>
              <p className="flex gap-2 items-start">
                <Check size={14} className="text-gold-champagne shrink-0 mt-0.5" />
                <span><strong>Security Deposits:</strong> Pre-authorization holds are mandatorily computed for security reasons and cannot be waived.</span>
              </p>
            </div>

            <div className="space-y-3">
              <p className="flex gap-2 items-start">
                <Check size={14} className="text-gold-champagne shrink-0 mt-0.5" />
                <span><strong>Extensions:</strong> Rental extensions must be filed 24 hours before return slots to prevent inventory conflicts.</span>
              </p>
              <p className="flex gap-2 items-start">
                <Check size={14} className="text-gold-champagne shrink-0 mt-0.5" />
                <span><strong>Concierge Pickups:</strong> Pickups are available at Indiranagar studio Mon-Sat 9AM to 7PM. Call hotline at 9686909048 to schedule.</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
