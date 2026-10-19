"use client";

import React from "react";
import Link from "next/link";
import Navbar from "@/components/navigation/Navbar";
import Footer from "@/components/navigation/Footer";
import { useCart } from "@/hooks/useCart";
import {
  FileText,
  ShieldCheck,
  CreditCard,
  AlertTriangle,
  Scale,
  Camera,
  Copyright,
  Clock,
  RotateCcw,
  CheckCircle2,
} from "lucide-react";

export default function TermsClient() {
  const { cart } = useCart();

  const sections = [
    { id: "preamble", label: "1. Agreement & Eligibility" },
    { id: "zero-deposit", label: "2. Zero-Deposit & KYC Rules" },
    { id: "payments", label: "3. Rental Rates & Payments" },
    { id: "cancellations", label: "4. Cancellations & Refunds" },
    { id: "handover", label: "5. Inspection & Return" },
    { id: "damage-waiver", label: "6. Damage & Loss Policy" },
    { id: "intellectual-property", label: "7. Intellectual Property (IP)" },
    { id: "prohibited", label: "8. Prohibited Equipment Uses" },
    { id: "liability", label: "9. Limitation of Liability" },
    { id: "governing-law", label: "10. Governing Law & Dispute Resolution" },
  ];

  return (
    <div className="min-h-screen bg-obsidian text-ivory pb-20 selection:bg-gold-champagne/20 selection:text-ivory">
      <Navbar cartItemCount={cart.length} />

      {/* Header Banner */}
      <header className="pt-32 pb-14 px-6 md:px-12 max-w-7xl mx-auto border-b border-white/5 relative">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-semibold uppercase tracking-[0.25em] text-gold-champagne font-mono block">
                Binding Legal Agreement
              </span>
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono">
                Commercial Cinema Gear Standards
              </span>
            </div>
            <h1 className="serif-heading text-4xl md:text-5xl lg:text-6xl font-light text-ivory">
              Terms of <span className="text-gold">Service &amp; Rental Agreement</span>
            </h1>
            <p className="text-xs text-muted-gray max-w-2xl font-light leading-relaxed">
              Standard commercial hire conditions, equipment care obligations, transparent billing, cancellation refunds, zero-deposit criteria, and mutual intellectual property protections for filmmakers renting from AUREVIA.
            </p>
          </div>
          <div className="text-left md:text-right font-mono text-[11px] text-muted-gray shrink-0">
            <p>Effective Date: January 1, 2026</p>
            <p className="text-gold-champagne/90">Last Revised: October 2026</p>
          </div>
        </div>
      </header>

      {/* Main Grid: Directory + Articles */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-12 grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Sticky Table of Contents */}
        <nav aria-label="Terms of service directory" className="lg:col-span-3 hidden lg:block">
          <div className="sticky top-28 space-y-4 p-5 rounded-2xl bg-white/2 border border-white/5 backdrop-blur-xl">
            <h3 className="text-xs font-semibold text-gold-champagne uppercase font-mono tracking-wider">
              Terms Directory
            </h3>
            <ul className="space-y-2 text-xs font-light text-muted-gray">
              {sections.map((sec) => (
                <li key={sec.id}>
                  <a
                    href={`#${sec.id}`}
                    className="hover:text-gold-champagne transition block py-1 border-l border-white/5 pl-3 hover:border-gold-champagne"
                  >
                    {sec.label}
                  </a>
                </li>
              ))}
            </ul>

            <div className="pt-4 border-t border-white/5 space-y-2 text-xs text-muted-gray font-light">
              <p>Need custom production terms for high-budget commercial shoots?</p>
              <Link
                href="/contact"
                className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-gold-champagne/10 border border-gold-champagne/20 text-gold-champagne hover:bg-gold-champagne/20 font-medium transition"
              >
                <span>Concierge Desk</span>
              </Link>
            </div>
          </div>
        </nav>

        {/* Content Body (9 cols) */}
        <main className="lg:col-span-9 space-y-14 text-xs text-muted-gray leading-relaxed font-light">
          {/* 01. Agreement & Eligibility */}
          <section id="preamble" className="space-y-3 scroll-mt-24">
            <div className="flex items-center gap-2 text-gold-champagne font-mono text-[11px] uppercase tracking-wider">
              <FileText size={14} />
              <span>Article 01</span>
            </div>
            <h2 className="serif-heading text-2xl font-normal text-ivory">
              1. Master Rental Agreement &amp; User Eligibility
            </h2>
            <p>
              By accessing, browsing, reserving, or taking physical delivery of equipment from <strong>AUREVIA Premium Rentals</strong> (&quot;AUREVIA&quot;, &quot;Company&quot;, &quot;we&quot;, &quot;our&quot;), operated by Prem Mundargi, you (&quot;Renter&quot;, &quot;Customer&quot;, &quot;Production Company&quot;) enter into a legally binding contract subject to these Terms of Service.
            </p>
            <p>
              <strong>Eligibility:</strong> Renters must be at least 18 years of age and possess full legal capacity to enter into binding contracts. In the case of commercial productions or corporate bodies, the individual completing the reservation warrants that they hold legitimate authorization to bind the corporate entity.
            </p>
          </section>

          {/* 02. Zero-Deposit & KYC Rules */}
          <section id="zero-deposit" className="space-y-4 scroll-mt-24">
            <div className="flex items-center gap-2 text-gold-champagne font-mono text-[11px] uppercase tracking-wider">
              <ShieldCheck size={14} />
              <span>Article 02</span>
            </div>
            <h2 className="serif-heading text-2xl font-normal text-ivory">
              2. Zero Security Deposit Policy &amp; Digital KYC
            </h2>
            <p>
              Traditional rental houses restrict creative filmmakers by demanding ₹30,000 to ₹50,000 in upfront security deposits. AUREVIA offers a <strong>Zero-Deposit Guarantee</strong> on high-end camera bodies and cine optics subject to verified identity compliance:
            </p>
            <div className="space-y-3">
              <div className="p-4 rounded-xl bg-white/2 border border-white/5 space-y-1.5">
                <h4 className="text-ivory font-medium text-xs flex items-center gap-2">
                  <CheckCircle2 size={15} className="text-emerald-400" />
                  Mandatory Digital KYC
                </h4>
                <p className="text-[11px] text-muted-gray">
                  Prior to gear dispatch, the Renter must complete a fast digital verification via our KYC portal (submitting a clear copy of Aadhaar Card, Driving Licence, PAN Card, Passport, or Film Academy Student ID).
                </p>
              </div>

              <div className="p-4 rounded-xl bg-white/2 border border-white/5 space-y-1.5">
                <h4 className="text-ivory font-medium text-xs flex items-center gap-2">
                  <CheckCircle2 size={15} className="text-emerald-400" />
                  Right to Re-evaluate
                </h4>
                <p className="text-[11px] text-muted-gray">
                  AUREVIA reserves the right to decline rental dispatch or require an accompanying production concierge if identity credentials are blurry, altered, or cannot be verified.
                </p>
              </div>
            </div>
          </section>

          {/* 03. Rental Rates & Payments */}
          <section id="payments" className="space-y-4 scroll-mt-24">
            <div className="flex items-center gap-2 text-gold-champagne font-mono text-[11px] uppercase tracking-wider">
              <CreditCard size={14} />
              <span>Article 03</span>
            </div>
            <h2 className="serif-heading text-2xl font-normal text-ivory">
              3. Rental Rates, Billing &amp; Payment Terms
            </h2>
            <div className="space-y-2">
              <p>
                <strong>Transparent Pricing:</strong> Standard rental rates are billed at a flat rate of <strong>₹799 per day</strong> (or <strong>₹600 per day</strong> if an authorized promotional code is validated during checkout), unless custom multi-day production packages apply.
              </p>
              <p>
                <strong>Payment Clearance:</strong> Full payment must be completed and cleared via our secure payment gateway (Razorpay) before equipment is handed over at the studio vault or dispatched via armored delivery courier.
              </p>
              <p>
                <strong>Late Returns &amp; Overtime Billing:</strong> Handover punctuality is crucial because incoming production teams rely on booked gear. A complimentary 1-hour grace period applies. Subsequent delays without prior extension approval will be billed at <strong>₹150 per hour</strong>, or the full standard daily rental rate if exceeding 4 hours.
              </p>
              <p>
                <strong>No Automatic Subscriptions:</strong> AUREVIA operates exclusively on an agreed-upon per-day hire model. There are no recurring subscriptions, auto-debits, or hidden processing fees.
              </p>
            </div>
          </section>

          {/* 04. Cancellations & Refunds */}
          <section id="cancellations" className="space-y-4 scroll-mt-24">
            <div className="flex items-center gap-2 text-gold-champagne font-mono text-[11px] uppercase tracking-wider">
              <RotateCcw size={14} />
              <span>Article 04</span>
            </div>
            <h2 className="serif-heading text-2xl font-normal text-ivory">
              4. Booking Cancellations, Rescheduling &amp; Refunds
            </h2>
            <p>
              Because reserved cameras, cine lenses, and stabilizers are calibrated and locked specifically for your shoot dates, the following tiered refund terms govern booking cancellations:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
              <div className="p-4 rounded-xl bg-white/2 border border-white/5 space-y-1.5">
                <span className="font-mono text-emerald-400 text-[11px] block">&gt; 48 Hours Notice</span>
                <h4 className="text-ivory font-medium text-xs">100% Full Refund</h4>
                <p className="text-[11px] text-muted-gray">
                  Full refund processed back to original payment method, or 100% rental credit toward any future shoot date with zero penalties.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-white/2 border border-white/5 space-y-1.5">
                <span className="font-mono text-gold-champagne text-[11px] block">24 – 48 Hours Notice</span>
                <h4 className="text-ivory font-medium text-xs">50% Refund / 100% Credit</h4>
                <p className="text-[11px] text-muted-gray">
                  50% cash refund to original payment source, or 100% transferrable store credit applicable to reschedule within 90 days.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-white/2 border border-white/5 space-y-1.5">
                <span className="font-mono text-rose-400 text-[11px] block">&lt; 24 Hours Notice</span>
                <h4 className="text-ivory font-medium text-xs">Non-Refundable</h4>
                <p className="text-[11px] text-muted-gray">
                  Cancellations within 24 hours of scheduled pickup are non-refundable as the equipment has already been swabbed, packaged, and reserved.
                </p>
              </div>
            </div>
            <p className="text-[11px] text-muted-gray">
              Refunds are initiated immediately upon cancellation and settle within 5–7 banking days via Razorpay.
            </p>
          </section>

          {/* 05. Inspection & Return */}
          <section id="handover" className="space-y-4 scroll-mt-24">
            <div className="flex items-center gap-2 text-gold-champagne font-mono text-[11px] uppercase tracking-wider">
              <Camera size={14} />
              <span>Article 05</span>
            </div>
            <h2 className="serif-heading text-2xl font-normal text-ivory">
              5. Handover Inspection &amp; Equipment Return Protocols
            </h2>
            <div className="space-y-2">
              <p>
                <strong>Pre-Handover Cleanroom Calibration:</strong> Every camera body sensor is wet-swabbed, lens optical elements collimated, and gimbal motors balanced before customer release.
              </p>
              <p>
                <strong>Customer Check-In:</strong> Upon receiving the equipment, the Renter must inspect all gear, test buttons, inspect front and rear lens elements, and confirm accessories. Any cosmetic blemishes or operational quirks must be documented and noted to the concierge immediately upon handover.
              </p>
              <p>
                <strong>Return Verification:</strong> Upon return to the vault, equipment undergoes a standard optical and functional check. Defects not noted during initial handover will be presumed to have occurred during the rental term.
              </p>
            </div>
          </section>

          {/* 06. Damage & Loss Policy */}
          <section id="damage-waiver" className="space-y-4 scroll-mt-24">
            <div className="flex items-center gap-2 text-gold-champagne font-mono text-[11px] uppercase tracking-wider">
              <AlertTriangle size={14} />
              <span>Article 06</span>
            </div>
            <h2 className="serif-heading text-2xl font-normal text-ivory">
              6. Accidental Damage Waiver &amp; Equipment Loss Policies
            </h2>
            <p>
              We want filmmakers to shoot fearlessly. Our optional <strong>Damage Waiver</strong> provides industry-leading peace of mind:
            </p>
            <div className="space-y-3">
              <div className="p-4 rounded-xl bg-white/2 border border-white/5 space-y-1">
                <h4 className="text-ivory font-medium text-xs">What Is Covered by Waiver:</h4>
                <p className="text-[11px] text-muted-gray">
                  Accidental camera body drops, minor lens barrel abrasions, tripod leg fractures, accidental sensor dust, and unintentional cable wear during standard film production usage.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-white/2 border border-white/5 space-y-1">
                <h4 className="text-ivory font-medium text-xs">Exclusions (Not Covered):</h4>
                <p className="text-[11px] text-muted-gray">
                  Complete gear theft, total loss / mysterious disappearance, water submersion from unhoused underwater filming, gross negligence (leaving gear unattended in unlocked vehicles), unauthorized repairs, or intentional harm. Uncovered damages are billed at actual authorized manufacturer repair invoice costs.
                </p>
              </div>
            </div>
          </section>

          {/* 07. Intellectual Property (IP) */}
          <section id="intellectual-property" className="space-y-4 scroll-mt-24">
            <div className="flex items-center gap-2 text-gold-champagne font-mono text-[11px] uppercase tracking-wider">
              <Copyright size={14} />
              <span>Article 07</span>
            </div>
            <h2 className="serif-heading text-2xl font-normal text-ivory">
              7. Intellectual Property Rights (IP)
            </h2>
            <div className="space-y-3">
              <div className="p-4 rounded-xl bg-white/2 border border-white/5 space-y-1.5">
                <h4 className="text-ivory font-medium text-xs">100% Filmmaker Creative Ownership</h4>
                <p className="text-[11px] text-muted-gray leading-relaxed">
                  <strong>You own your art.</strong> AUREVIA asserts <strong>zero</strong> intellectual property claim, copyright, or licensing rights over any footage, photography, audio, or RAW files recorded by the Renter using our camera equipment. The creative work is 100% owned exclusively by the filmmaker and their clients.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-white/2 border border-white/5 space-y-1.5">
                <h4 className="text-ivory font-medium text-xs">AUREVIA Platform &amp; Trademark Rights</h4>
                <p className="text-[11px] text-muted-gray leading-relaxed">
                  The AUREVIA brand name, logo, wordmarks, website user interface, software code, Rig Configurator algorithms, Lens Match databases, FOV simulators, and cinematic brand photography are the exclusive intellectual property of AUREVIA and Prem Mundargi, protected by Indian and international copyright and trademark laws.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-white/2 border border-white/5 space-y-1.5">
                <h4 className="text-ivory font-medium text-xs">Prohibited Exploitation</h4>
                <p className="text-[11px] text-muted-gray leading-relaxed">
                  Users are strictly prohibited from copying, decompiling, reverse-engineering, data scraping, framing, or re-selling any software tools, pricing data, or copyrighted assets from this platform without explicit prior written authorization.
                </p>
              </div>
            </div>
          </section>

          {/* 08. Prohibited Equipment Uses */}
          <section id="prohibited" className="space-y-4 scroll-mt-24">
            <div className="flex items-center gap-2 text-gold-champagne font-mono text-[11px] uppercase tracking-wider">
              <AlertTriangle size={14} />
              <span>Article 08</span>
            </div>
            <h2 className="serif-heading text-2xl font-normal text-ivory">
              8. Prohibited Uses &amp; Sub-Leasing
            </h2>
            <p>
              The Renter agrees that rented cinema bodies and lenses shall <strong>not</strong> be:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-[11px]">
              <li>Sub-leased, pawned, loaned, or transferred to third parties without prior written consent.</li>
              <li>Used in hostile war zones, riots, or unlawful activities violating Indian Penal Code regulations.</li>
              <li>Exposed to high-power stage lasers (which permanently burn CMOS sensors) without certified safety filters.</li>
              <li>Operated in extreme environments (active volcanoes, chemical corrosive chambers) without specialized casing.</li>
            </ul>
          </section>

          {/* 09. Limitation of Liability */}
          <section id="liability" className="space-y-4 scroll-mt-24">
            <div className="flex items-center gap-2 text-gold-champagne font-mono text-[11px] uppercase tracking-wider">
              <Scale size={14} />
              <span>Article 09</span>
            </div>
            <h2 className="serif-heading text-2xl font-normal text-ivory">
              9. Limitation of Liability &amp; Indemnification
            </h2>
            <p>
              To the maximum extent permitted by applicable law, AUREVIA shall not be held liable for any indirect, incidental, special, consequential, or punitive damages, including loss of production revenues, delayed shoot schedules, or corrupted actor footage resulting from equipment malfunction or unforeseen logistics delays.
            </p>
            <p>
              Our maximum aggregate liability arising from any rental booking shall not exceed the actual rental fee amount paid by the Customer for that specific booking.
            </p>
          </section>

          {/* 10. Governing Law */}
          <section id="governing-law" className="space-y-4 scroll-mt-24">
            <div className="flex items-center gap-2 text-gold-champagne font-mono text-[11px] uppercase tracking-wider">
              <Scale size={14} />
              <span>Article 10</span>
            </div>
            <h2 className="serif-heading text-2xl font-normal text-ivory">
              10. Governing Law &amp; Jurisdiction
            </h2>
            <p>
              These Terms of Service and any rental agreements executed hereunder shall be governed by and construed in accordance with the laws of <strong>India</strong>.
            </p>
            <p>
              Any disputes, controversies, or claims arising out of or in connection with these terms shall be subject to the exclusive jurisdiction of the competent courts of <strong>Karnataka, India</strong>.
            </p>
            <div className="pt-4 border-t border-white/5 text-[11px] text-muted-gray">
              Direct inquiries regarding contractual terms may be addressed to:{" "}
              <a href="mailto:premmundargi135@gmail.com" className="text-gold-champagne hover:underline">
                premmundargi135@gmail.com
              </a>{" "}
              or +91 96869 09048.
            </div>
          </section>
        </main>
      </div>

      <Footer />
    </div>
  );
}
