"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/navigation/Navbar";
import Footer from "@/components/navigation/Footer";
import { useCart } from "@/hooks/useCart";
import {
  RotateCcw,
  ShieldCheck,
  CheckCircle2,
  Clock,
  MapPin,
  Phone,
  MessageCircle,
  Box,
  FileCheck,
  ArrowRight,
  AlertCircle,
  Search,
} from "lucide-react";

export default function ReturnClient() {
  const { cart } = useCart();
  const router = useRouter();
  const [bookingRef, setBookingRef] = useState("");

  const handleLookup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingRef.trim()) return;
    router.push(`/return/booking?ref=${encodeURIComponent(bookingRef.trim().toUpperCase())}`);
  };

  const whatsappUrl = `https://wa.me/919686909048?text=${encodeURIComponent(
    "Hello Prem sir, I am reaching out regarding returning my rental equipment (Reference code: " +
      (bookingRef.trim().toUpperCase() || "[YOUR_REF]") +
      ")."
  )}`;

  return (
    <div className="min-h-screen bg-obsidian text-ivory pb-20 selection:bg-gold-champagne/20 selection:text-ivory">
      <Navbar cartItemCount={cart.length} />

      {/* Header Banner */}
      <header className="pt-32 pb-14 px-6 md:px-12 max-w-7xl mx-auto border-b border-white/5 relative">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-semibold uppercase tracking-[0.25em] text-gold-champagne font-mono block">
                Official Equipment Protocol
              </span>
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono">
                Rapid Settlement
              </span>
            </div>
            <h1 className="serif-heading text-4xl md:text-5xl lg:text-6xl font-light text-ivory">
              Equipment Return &amp; <span className="text-gold">Handover Hub</span>
            </h1>
            <p className="text-xs text-muted-gray max-w-2xl font-light leading-relaxed">
              Transparent, frictionless gear return guidelines for filmmakers. Check your unit into the diagnostic terminal, verify sensor and glass cleanliness, and trigger instantaneous security deposit release.
            </p>
          </div>
          <div className="text-left md:text-right font-mono text-[11px] text-muted-gray shrink-0">
            <div>Concierge Handover Hours</div>
            <div className="text-ivory font-medium">07:00 AM – 10:00 PM IST</div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 md:px-12 py-12 space-y-16">
        {/* Booking Reference Lookup Box */}
        <section className="p-8 rounded-2xl bg-neutral-900/60 border border-gold-champagne/30 backdrop-blur-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-72 h-72 bg-gold-champagne/5 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 max-w-2xl">
            <div className="flex items-center gap-2 text-gold-champagne text-xs font-mono uppercase tracking-wider mb-2">
              <Search size={14} />
              <span>Diagnostic Terminal Fast-Track</span>
            </div>
            <h2 className="serif-heading text-2xl md:text-3xl text-ivory mb-2">
              Check In Active Booking
            </h2>
            <p className="text-xs text-muted-gray font-light mb-6">
              Enter your booking reference code (e.g. <span className="font-mono text-gold-champagne">AUR-2026-XXXX</span>) to access the interactive handover diagnostic checklist and initiate deposit release.
            </p>

            <form onSubmit={handleLookup} className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                placeholder="Enter Booking Reference (e.g., AUR-2026-8827)"
                value={bookingRef}
                onChange={(e) => setBookingRef(e.target.value)}
                className="flex-1 bg-obsidian border border-white/10 rounded-xl px-4 py-3 text-sm font-mono text-ivory placeholder:text-muted-gray/50 focus:outline-hidden focus:border-gold-champagne transition"
              />
              <button
                type="submit"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gold-champagne text-obsidian font-semibold text-xs tracking-wider uppercase hover:bg-gold-champagne/90 transition shadow-lg shrink-0 cursor-pointer"
              >
                <span>Open Terminal</span>
                <ArrowRight size={14} />
              </button>
            </form>
          </div>
        </section>

        {/* 4-Step Handover Protocol */}
        <section className="space-y-6">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-mono text-gold-champagne uppercase tracking-widest">Standard Operating Procedure</span>
            <h2 className="serif-heading text-2xl md:text-3xl text-ivory">The 4-Step Handover Protocol</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-xl bg-white/2 border border-white/5 space-y-4">
              <div className="w-10 h-10 rounded-xl bg-gold-champagne/10 text-gold-champagne flex items-center justify-center font-mono font-bold text-sm">
                01
              </div>
              <h3 className="text-sm font-semibold text-ivory flex items-center gap-2">
                <Box size={16} className="text-gold-champagne" />
                Pack in Pelican Casing
              </h3>
              <p className="text-xs text-muted-gray font-light leading-relaxed">
                Ensure body caps, front/rear lens caps, and all cables, chargers, and batteries are securely placed back into their designated Pelican laser-cut foam inserts.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-white/2 border border-white/5 space-y-4">
              <div className="w-10 h-10 rounded-xl bg-gold-champagne/10 text-gold-champagne flex items-center justify-center font-mono font-bold text-sm">
                02
              </div>
              <h3 className="text-sm font-semibold text-ivory flex items-center gap-2">
                <ShieldCheck size={16} className="text-gold-champagne" />
                Diagnostic Inspection
              </h3>
              <p className="text-xs text-muted-gray font-light leading-relaxed">
                Our technicians run a prompt optical inspection: sensor cleanliness, mount integrity, and electronic communication pins. This takes less than 5 minutes.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-white/2 border border-white/5 space-y-4">
              <div className="w-10 h-10 rounded-xl bg-gold-champagne/10 text-gold-champagne flex items-center justify-center font-mono font-bold text-sm">
                03
              </div>
              <h3 className="text-sm font-semibold text-ivory flex items-center gap-2">
                <CheckCircle2 size={16} className="text-gold-champagne" />
                Instant Deposit Refund
              </h3>
              <p className="text-xs text-muted-gray font-light leading-relaxed">
                Once the unit clears inspection, the Razorpay security deposit pre-authorization is instantly unlocked back to your original source bank or UPI account.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-white/2 border border-white/5 space-y-4">
              <div className="w-10 h-10 rounded-xl bg-gold-champagne/10 text-gold-champagne flex items-center justify-center font-mono font-bold text-sm">
                04
              </div>
              <h3 className="text-sm font-semibold text-ivory flex items-center gap-2">
                <FileCheck size={16} className="text-gold-champagne" />
                Digital Receipt &amp; Credit
              </h3>
              <p className="text-xs text-muted-gray font-light leading-relaxed">
                Receive an automated clearance receipt on WhatsApp and Email. Regular on-time returns elevate your account toward Zero-Deposit VIP status!
              </p>
            </div>
          </div>
        </section>

        {/* Location & Contact Grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Studio Location */}
          <div className="p-6 rounded-xl bg-white/2 border border-white/5 space-y-4">
            <div className="flex items-center gap-2 text-gold-champagne text-xs font-mono uppercase tracking-wider">
              <MapPin size={16} />
              <span>Studio Vault Handover Desk</span>
            </div>
            <h3 className="serif-heading text-xl text-ivory">AUREVIA Studio Vault — Gadag</h3>
            <p className="text-xs text-muted-gray font-light leading-relaxed">
              Main Road, Gadag, Karnataka, India — 582101<br />
              Convenient client parking and cleanroom inspection bay available on-site.
            </p>
            <div className="flex items-center gap-2 text-xs text-muted-gray pt-2">
              <Clock size={14} className="text-gold-champagne" />
              <span>Mon – Sun: 7:00 AM – 10:00 PM IST (Daily)</span>
            </div>
          </div>

          {/* Concierge Assistance */}
          <div className="p-6 rounded-xl bg-white/2 border border-white/5 space-y-4">
            <div className="flex items-center gap-2 text-gold-champagne text-xs font-mono uppercase tracking-wider">
              <Phone size={16} />
              <span>Need Extension or Assistance?</span>
            </div>
            <h3 className="serif-heading text-xl text-ivory">Direct Concierge Contact</h3>
            <p className="text-xs text-muted-gray font-light leading-relaxed">
              If your shoot is running behind schedule or you wish to extend your rental window, reach out at least 4 hours before the return cutoff to avoid late hold charges.
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <a
                href="tel:+919686909048"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10 hover:border-gold-champagne/40 text-xs font-medium text-ivory transition"
              >
                <Phone size={13} className="text-gold-champagne" />
                <span>+91 96869 09048</span>
              </a>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 text-xs font-medium transition"
              >
                <MessageCircle size={13} />
                <span>WhatsApp Concierge</span>
              </a>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
