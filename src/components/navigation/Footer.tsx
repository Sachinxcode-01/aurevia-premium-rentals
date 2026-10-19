"use client";

import React from "react";
import Link from "next/link";
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  ShieldCheck,
  CheckCircle2,
  Box,
  FileCheck,
  MessageCircle,
} from "lucide-react";
import { Logo } from "@/components/ui/Logo";

export default function Footer() {
  const whatsappUrl = `https://wa.me/919686909048?text=${encodeURIComponent(
    "Hello Prem sir, Greetings! 👋✨\n\nI would like to enquire about equipment availability and book gear from AUREVIA Premium Rentals:\n\n🎬 *Project / Shoot Type:*\n📅 *Pickup Date:*\n🔄 *Return Date:*\n📍 *Location:*\n\n📷 *Requested Equipment:*\n• Camera Body / Lenses:\n\nCould you please share the quote and confirm reservation? Thank you! 🙏"
  )}`;

  return (
    <footer className="relative bg-black border-t border-white/10 text-ivory z-20 overflow-hidden">
      {/* Subtle top ambient glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-px bg-linear-to-r from-transparent via-gold-champagne/40 to-transparent pointer-events-none" />

      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 pt-16 pb-12">
        {/* Top Trust Ribbon */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pb-12 mb-12 border-b border-white/5">
          <div className="flex items-center gap-3 p-3.5 rounded-xl bg-white/2 border border-white/5">
            <div className="w-9 h-9 rounded-lg bg-gold-champagne/10 text-gold-champagne flex items-center justify-center shrink-0">
              <ShieldCheck size={18} />
            </div>
            <div>
              <p className="text-xs font-semibold text-ivory">100% Calibrated</p>
              <p className="text-[10px] text-muted-gray">Cleanroom sensor swabbed</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3.5 rounded-xl bg-white/2 border border-white/5">
            <div className="w-9 h-9 rounded-lg bg-gold-champagne/10 text-gold-champagne flex items-center justify-center shrink-0">
              <Box size={18} />
            </div>
            <div>
              <p className="text-xs font-semibold text-ivory">Pelican Hardcases</p>
              <p className="text-[10px] text-muted-gray">Heavy-duty flight casing</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3.5 rounded-xl bg-white/2 border border-white/5">
            <div className="w-9 h-9 rounded-lg bg-gold-champagne/10 text-gold-champagne flex items-center justify-center shrink-0">
              <CheckCircle2 size={18} />
            </div>
            <div>
              <p className="text-xs font-semibold text-ivory">Zero-Deposit Option</p>
              <p className="text-[10px] text-muted-gray">For verified filmmakers</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3.5 rounded-xl bg-white/2 border border-white/5">
            <div className="w-9 h-9 rounded-lg bg-gold-champagne/10 text-gold-champagne flex items-center justify-center shrink-0">
              <FileCheck size={18} />
            </div>
            <div>
              <p className="text-xs font-semibold text-ivory">GST Invoicing</p>
              <p className="text-[10px] text-muted-gray">Full commercial billing</p>
            </div>
          </div>
        </div>

        {/* 4-Column Directory Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8 pb-12 border-b border-white/5">
          {/* Brand & Direct Concierge Column (4 cols) */}
          <div className="lg:col-span-4 space-y-5">
            <div className="flex items-center gap-3">
              <Link href="/" className="inline-block group" aria-label="AUREVIA Premium Rentals Home">
                <Logo variant="wordmark" theme="light" width={140} height={38} />
              </Link>
            </div>
            <p className="text-xs text-muted-gray font-light leading-relaxed max-w-sm">
              <strong className="text-ivory font-medium">AUREVIA Premium Rentals</strong> is South India&apos;s premier cinema equipment concierge, founded by Prem Mundargi. Supplying calibrated cinema bodies, cinema glass, and production grip across Karnataka and India.
            </p>

            <div className="space-y-2.5 text-xs text-muted-gray font-light pt-1">
              <a
                href="tel:+919686909048"
                className="flex items-center gap-2.5 hover:text-gold-champagne transition group"
              >
                <div className="w-7 h-7 rounded-md bg-white/5 text-gold-champagne flex items-center justify-center group-hover:bg-gold-champagne/20 transition">
                  <Phone size={13} />
                </div>
                <span>+91 96869 09048 <span className="text-[10px] text-gold-champagne/80 font-mono">(Direct Calling)</span></span>
              </a>

              <a
                href="mailto:premmundargi135@gmail.com"
                className="flex items-center gap-2.5 hover:text-gold-champagne transition group break-all"
              >
                <div className="w-7 h-7 rounded-md bg-white/5 text-gold-champagne flex items-center justify-center group-hover:bg-gold-champagne/20 transition">
                  <Mail size={13} />
                </div>
                <span>premmundargi135@gmail.com</span>
              </a>

              <div className="flex items-start gap-2.5">
                <div className="w-7 h-7 rounded-md bg-white/5 text-gold-champagne flex items-center justify-center shrink-0 mt-0.5">
                  <MapPin size={13} />
                </div>
                <span>
                  Aurevia Studio Vault, Gadag Main Road, Karnataka, India - 582101
                  <span className="block text-[10px] text-muted-gray/70">Hubli • Dharwad • Gadag • Bangalore • Pan-India Courier</span>
                </span>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-md bg-white/5 text-gold-champagne flex items-center justify-center shrink-0">
                  <Clock size={13} />
                </div>
                <span>Mon – Sun: 7:00 AM – 10:00 PM IST</span>
              </div>
            </div>

            {/* Quick Chat / Social Pills */}
            <div className="flex flex-wrap items-center gap-2.5 pt-2">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 text-xs font-medium transition"
              >
                <MessageCircle size={14} />
                <span>WhatsApp Concierge</span>
              </a>

              <a
                href="https://www.instagram.com/mr__prem___.135"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-muted-gray hover:text-pink-400 hover:border-pink-500/30 text-xs font-medium transition"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
                <span>Instagram</span>
              </a>
            </div>
          </div>

          {/* Column 2: Equipment Vault (3 cols) */}
          <div className="lg:col-span-3 space-y-3.5">
            <h3 className="text-xs font-semibold text-gold-champagne uppercase font-mono tracking-wider">
              Equipment Vault
            </h3>
            <ul className="space-y-2 text-xs text-muted-gray font-light">
              <li>
                <Link href="/explore?category=dslr-cameras" className="hover:text-gold-champagne transition">
                  DSLR Camera Bodies
                </Link>
              </li>
              <li>
                <Link href="/explore?category=mirrorless-cameras" className="hover:text-gold-champagne transition">
                  Full-Frame Mirrorless
                </Link>
              </li>
              <li>
                <Link href="/explore?category=cinema-cameras" className="hover:text-gold-champagne transition">
                  Cinema Camera Systems
                </Link>
              </li>
              <li>
                <Link href="/explore?category=professional-lenses" className="hover:text-gold-champagne transition">
                  L-Series &amp; Cine Prime Lenses
                </Link>
              </li>
              <li>
                <Link href="/explore?category=gimbals" className="hover:text-gold-champagne transition">
                  Gimbals &amp; Stabilizers
                </Link>
              </li>
              <li>
                <Link href="/explore?category=lighting" className="hover:text-gold-champagne transition">
                  Studio &amp; Location Lighting
                </Link>
              </li>
              <li>
                <Link href="/explore?category=audio" className="hover:text-gold-champagne transition">
                  Wireless Audio &amp; Mics
                </Link>
              </li>
              <li>
                <Link href="/explore" className="text-gold-champagne font-medium hover:underline inline-flex items-center gap-1 pt-1">
                  Browse Full Gear Catalog &rarr;
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Production Packages & Tools (2 cols) */}
          <div className="lg:col-span-2 space-y-3.5">
            <h3 className="text-xs font-semibold text-gold-champagne uppercase font-mono tracking-wider">
              Filmmaker Tools
            </h3>
            <ul className="space-y-2 text-xs text-muted-gray font-light">
              <li>
                <Link href="/packages" className="hover:text-gold-champagne transition">
                  Turnkey Shoot Packages
                </Link>
              </li>
              <li>
                <Link href="/tools/rig-builder" className="hover:text-gold-champagne transition">
                  Rig Configurator
                </Link>
              </li>
              <li>
                <Link href="/tools/lens-match" className="hover:text-gold-champagne transition">
                  Lens &amp; Sensor Lab
                </Link>
              </li>
              <li>
                <Link href="/tools/power-media-calculator" className="hover:text-gold-champagne transition">
                  Power &amp; Media Calc
                </Link>
              </li>
              <li>
                <Link href="/tools/sensor-simulator" className="hover:text-gold-champagne transition">
                  Sensor FOV Simulator
                </Link>
              </li>
              <li>
                <Link href="/tools/callsheet-manifest" className="hover:text-gold-champagne transition">
                  Callsheet Manifest
                </Link>
              </li>
              <li>
                <Link href="/explore/compare" className="hover:text-gold-champagne transition">
                  Compare Gear Specs
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Client Care & Company (3 cols) */}
          <div className="lg:col-span-3 space-y-3.5">
            <h3 className="text-xs font-semibold text-gold-champagne uppercase font-mono tracking-wider">
              Client Care &amp; Trust
            </h3>
            <ul className="space-y-2 text-xs text-muted-gray font-light">
              <li>
                <Link href="/rental-process" className="hover:text-gold-champagne transition">
                  How Rental Works (4-Step Process)
                </Link>
              </li>
              <li>
                <Link href="/kyc" className="hover:text-gold-champagne transition">
                  Filmmaker ID &amp; KYC Verification
                </Link>
              </li>
              <li>
                <Link href="/return" className="hover:text-gold-champagne transition">
                  Equipment Return &amp; Handover
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-gold-champagne transition">
                  FAQ &amp; Security Deposit Guide
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-gold-champagne transition">
                  About AUREVIA &amp; Prem Mundargi
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-gold-champagne transition">
                  Contact Studio Concierge
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-gold-champagne transition">
                  Rental Terms &amp; Conditions
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-gold-champagne transition">
                  Privacy Policy &amp; GDPR
                </Link>
              </li>
              <li>
                <Link href="/cookies" className="hover:text-gold-champagne transition">
                  Cookie Policy &amp; Consent
                </Link>
              </li>
              <li>
                <Link href="/licenses" className="hover:text-gold-champagne transition">
                  Open-Source Licences
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar: Copyright, Developer Credit & Live Status */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-muted-gray font-light">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-center sm:text-left">
            <span>
              &copy; {new Date().getFullYear()} <strong className="text-ivory font-medium">AUREVIA Premium Rentals</strong> by Prem Mundargi. All rights reserved.
            </span>
            <div className="flex items-center gap-3">
              <Link href="/terms" className="hover:text-gold-champagne transition">Terms</Link>
              <span>•</span>
              <Link href="/privacy" className="hover:text-gold-champagne transition">Privacy</Link>
              <span>•</span>
              <Link href="/cookies" className="hover:text-gold-champagne transition">Cookies</Link>
              <span>•</span>
              <Link href="/licenses" className="hover:text-gold-champagne transition">Licences</Link>
              <span>•</span>
              <button
                type="button"
                onClick={() => {
                  if (typeof window !== "undefined") {
                    const fn = (window as unknown as { openAureviaCookieSettings?: () => void }).openAureviaCookieSettings;
                    if (fn) fn();
                  }
                }}
                className="hover:text-gold-champagne text-gold-champagne/80 underline underline-offset-2 transition cursor-pointer"
              >
                Cookie Settings
              </button>
              <span>•</span>
              <a href="/sitemap.xml" className="hover:text-gold-champagne transition">Sitemap</a>
              <span>•</span>
              <span className="text-muted-gray/70">
                Dev: <a href="https://github.com/Sachinxcode-01" target="_blank" rel="noopener noreferrer" className="text-gold-champagne hover:underline">Sachin</a>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono text-[10px]">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Vault Operational • Online Booking Active</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
