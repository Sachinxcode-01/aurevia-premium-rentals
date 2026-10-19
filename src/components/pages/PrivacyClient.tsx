"use client";

import React, { useState } from "react";
import Link from "next/link";
import Navbar from "@/components/navigation/Navbar";
import Footer from "@/components/navigation/Footer";
import { useCart } from "@/hooks/useCart";
import {
  ShieldCheck,
  Lock,
  FileText,
  AlertTriangle,
  Server,
  RefreshCw,
  Trash2,
  Download,
  Mail,
  CheckCircle2,
  Clock,
  Eye,
  Globe,
  Sliders,
  Send,
} from "lucide-react";

export default function PrivacyClient() {
  const { cart } = useCart();

  // Interactive Data Request Form state
  const [requestType, setRequestType] = useState("DATA_DELETION");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [details, setDetails] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [resultMessage, setResultMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setResultMessage(null);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/v1/compliance/data-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requestType,
          fullName,
          email,
          phone,
          details,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to submit compliance request.");
      }

      setResultMessage(
        `Request registered! Reference: ${data.data?.requestId}. Our Data Protection Officer will review and respond within 30 days.`
      );
      setFullName("");
      setEmail("");
      setPhone("");
      setDetails("");
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : "Error processing request");
    } finally {
      setSubmitting(false);
    }
  };

  const sections = [
    { id: "overview", label: "1. Scope & Commitment" },
    { id: "collection", label: "2. Information We Collect" },
    { id: "legal-basis", label: "3. Legal Basis for Processing" },
    { id: "gdpr", label: "4. GDPR Compliance (EU / EEA)" },
    { id: "third-parties", label: "5. Sub-Processors & Disclosures" },
    { id: "security", label: "6. Technical & Data Security" },
    { id: "retention", label: "7. Data Retention Timetable" },
    { id: "deletion", label: "8. Data Deletion & Rights" },
    { id: "marketing", label: "9. Marketing & Communications" },
    { id: "breach", label: "10. Breach Notification Procedures" },
    { id: "dpa", label: "11. Data Processing Agreements" },
    { id: "officer", label: "12. Grievance & DPO Contacts" },
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
                Enterprise Regulatory Compliance
              </span>
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono">
                GDPR &amp; DPDP 2023 Aligned
              </span>
            </div>
            <h1 className="serif-heading text-4xl md:text-5xl lg:text-6xl font-light text-ivory">
              Privacy <span className="text-gold">Policy</span>
            </h1>
            <p className="text-xs text-muted-gray max-w-2xl font-light leading-relaxed">
              Complete disclosure regarding user identity data, government KYC storage, technical sub-processors, cryptographic security protocols, and your statutory data rights under GDPR and the Indian Digital Personal Data Protection Act (DPDP Act 2023).
            </p>
          </div>
          <div className="text-left md:text-right font-mono text-[11px] text-muted-gray shrink-0">
            <p>Effective Date: January 1, 2026</p>
            <p className="text-gold-champagne/90">Last Revised: October 2026</p>
          </div>
        </div>
      </header>

      {/* Main Grid: Sidebar Navigator + Detailed Sections */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-12 grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Sticky Table of Contents (Desktop) */}
        <nav aria-label="Privacy policy directory" className="lg:col-span-3 hidden lg:block">
          <div className="sticky top-28 space-y-4 p-5 rounded-2xl bg-white/2 border border-white/5 backdrop-blur-xl">
            <h3 className="text-xs font-semibold text-gold-champagne uppercase font-mono tracking-wider">
              Document Directory
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

            <div className="pt-4 border-t border-white/5 space-y-2">
              <a
                href="#interactive-dsr"
                className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-gold-champagne/10 border border-gold-champagne/20 text-gold-champagne hover:bg-gold-champagne/20 text-xs font-medium transition"
              >
                <Trash2 size={13} />
                <span>Submit Data Request</span>
              </a>
              <button
                type="button"
                onClick={() => {
                  if (typeof window !== "undefined" && (window as unknown as { openAureviaCookieSettings?: () => void }).openAureviaCookieSettings) {
                    (window as unknown as { openAureviaCookieSettings: () => void }).openAureviaCookieSettings();
                  }
                }}
                className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-muted-gray hover:text-ivory text-xs transition"
              >
                <Sliders size={13} />
                <span>Cookie Preferences</span>
              </button>
            </div>
          </div>
        </nav>

        {/* Content Body (9 cols) */}
        <main className="lg:col-span-9 space-y-14 text-xs text-muted-gray leading-relaxed font-light">
          {/* 01. Scope & Commitment */}
          <section id="overview" className="space-y-3 scroll-mt-24">
            <div className="flex items-center gap-2 text-gold-champagne font-mono text-[11px] uppercase tracking-wider">
              <ShieldCheck size={14} />
              <span>Section 01</span>
            </div>
            <h2 className="serif-heading text-2xl font-normal text-ivory">
              1. Scope &amp; Privacy Commitment
            </h2>
            <p>
              AUREVIA Premium Rentals (&quot;AUREVIA&quot;, &quot;we&quot;, &quot;us&quot;, or &quot;our&quot;), operated by Prem Mundargi, provides high-caliber cinema camera bodies, cine glass, lighting, and production equipment rentals across India. We believe that creative filmmakers deserve total transparency regarding how their personal and corporate data is gathered, processed, and safeguarded.
            </p>
            <p>
              This Privacy Policy applies to all interactions through our online portal (<strong>aurevia-premium-rentals.vercel.app</strong>), customer service lines, WhatsApp concierge channels, and physical vault handovers. We operate in strict adherence with applicable international data regulations, including the <strong>European General Data Protection Regulation (GDPR)</strong>, the <strong>UK GDPR</strong>, and India&apos;s <strong>Digital Personal Data Protection Act, 2023 (DPDP Act)</strong>.
            </p>
          </section>

          {/* 02. Information We Collect */}
          <section id="collection" className="space-y-4 scroll-mt-24">
            <div className="flex items-center gap-2 text-gold-champagne font-mono text-[11px] uppercase tracking-wider">
              <Eye size={14} />
              <span>Section 02</span>
            </div>
            <h2 className="serif-heading text-2xl font-normal text-ivory">
              2. Categories of Information We Collect
            </h2>
            <p>
              We collect information to facilitate gear reservations, prevent asset theft, comply with commercial taxation, and ensure safe equipment deployment:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-white/2 border border-white/5 space-y-2">
                <h4 className="font-medium text-ivory text-xs flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-gold-champagne" />
                  Account &amp; Booking Identifiers
                </h4>
                <p className="text-[11px] text-muted-gray">
                  Full name, corporate entity / production company name, billing address, studio delivery destination, direct phone number, and verified email address.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-white/2 border border-white/5 space-y-2">
                <h4 className="font-medium text-ivory text-xs flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-gold-champagne" />
                  Filmmaker KYC Identity Scans
                </h4>
                <p className="text-[11px] text-muted-gray">
                  In order to offer our signature <strong>Zero-Deposit Guarantee</strong> on high-value gear (e.g., RED Komodo, Sony FX3, Canon Cine bodies), we collect photographic scans of recognized government identity documents (Aadhaar, Driving Licence, PAN, Passport, or Film Academy Student ID).
                </p>
              </div>

              <div className="p-4 rounded-xl bg-white/2 border border-white/5 space-y-2">
                <h4 className="font-medium text-ivory text-xs flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-gold-champagne" />
                  Payment &amp; Transaction Ledger
                </h4>
                <p className="text-[11px] text-muted-gray">
                  Transaction IDs, GST numbers, rental duration, invoices, and promo codes. Payment card numbers and UPI MPINs are processed directly by our PCI-DSS compliant partner (Razorpay) and are never stored on AUREVIA servers.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-white/2 border border-white/5 space-y-2">
                <h4 className="font-medium text-ivory text-xs flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-gold-champagne" />
                  Technical &amp; Telemetry Data
                </h4>
                <p className="text-[11px] text-muted-gray">
                  IP addresses, cryptographic session cookies, browser user-agent, device characteristics, error logs, and anonymous page flow through Vercel Web Analytics.
                </p>
              </div>
            </div>
          </section>

          {/* 03. Legal Basis for Processing */}
          <section id="legal-basis" className="space-y-4 scroll-mt-24">
            <div className="flex items-center gap-2 text-gold-champagne font-mono text-[11px] uppercase tracking-wider">
              <CheckCircle2 size={14} />
              <span>Section 03</span>
            </div>
            <h2 className="serif-heading text-2xl font-normal text-ivory">
              3. Legal Basis for Data Processing
            </h2>
            <p>
              Under GDPR (Article 6) and Section 4 of the DPDP Act 2023, every data processing activity by AUREVIA is grounded in a specific lawful justification:
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-[11px] border border-white/5 rounded-xl overflow-hidden">
                <thead className="bg-white/5 text-ivory font-mono uppercase tracking-wider">
                  <tr>
                    <th className="p-3 border-b border-white/5">Purpose of Processing</th>
                    <th className="p-3 border-b border-white/5">Data Involved</th>
                    <th className="p-3 border-b border-white/5">Lawful Ground (GDPR / DPDP)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  <tr>
                    <td className="p-3 font-medium text-ivory">Order Execution &amp; Dispatch</td>
                    <td className="p-3">Name, address, contact, gear selections</td>
                    <td className="p-3 text-gold-champagne font-mono">Contractual Necessity (Art. 6(1)(b))</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-medium text-ivory">Zero-Deposit KYC Verification</td>
                    <td className="p-3">Government ID Scans (Aadhaar / DL)</td>
                    <td className="p-3 text-gold-champagne font-mono">Legitimate Interest &amp; Fraud Prevention (Art. 6(1)(f))</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-medium text-ivory">GST Commercial Invoicing</td>
                    <td className="p-3">GSTIN, billing address, amounts paid</td>
                    <td className="p-3 text-gold-champagne font-mono">Legal Obligation (Art. 6(1)(c))</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-medium text-ivory">Platform Analytics &amp; Experience</td>
                    <td className="p-3">Aggregated telemetry, session cookies</td>
                    <td className="p-3 text-gold-champagne font-mono">User Consent (Art. 6(1)(a))</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-medium text-ivory">Equipment Theft Prevention</td>
                    <td className="p-3">Audit logs, pickup verification photos</td>
                    <td className="p-3 text-gold-champagne font-mono">Legitimate Interest (Asset Protection)</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* 04. GDPR Compliance (EU / EEA) */}
          <section id="gdpr" className="space-y-4 scroll-mt-24">
            <div className="flex items-center gap-2 text-gold-champagne font-mono text-[11px] uppercase tracking-wider">
              <Globe size={14} />
              <span>Section 04</span>
            </div>
            <h2 className="serif-heading text-2xl font-normal text-ivory">
              4. GDPR Compliance &amp; European Data Subject Rights
            </h2>
            <p>
              If you access our services from within the European Economic Area (EEA), United Kingdom, or Switzerland, you are endowed with comprehensive statutory rights under Chapter III of the GDPR:
            </p>
            <div className="space-y-2.5">
              <div className="p-3.5 rounded-xl bg-white/2 border border-white/5">
                <strong className="text-ivory block mb-1">Right of Access (Art. 15):</strong>
                You may request a complete copy of all personal records we hold about you at no administrative cost.
              </div>
              <div className="p-3.5 rounded-xl bg-white/2 border border-white/5">
                <strong className="text-ivory block mb-1">Right to Rectification (Art. 16):</strong>
                You may immediately rectify inaccurate or incomplete profile or billing details through your dashboard or via concierge.
              </div>
              <div className="p-3.5 rounded-xl bg-white/2 border border-white/5">
                <strong className="text-ivory block mb-1">Right to Erasure / &quot;Right to be Forgotten&quot; (Art. 17):</strong>
                You may demand the immediate deletion of your personal records and KYC documents, subject only to statutory tax retention exemptions.
              </div>
              <div className="p-3.5 rounded-xl bg-white/2 border border-white/5">
                <strong className="text-ivory block mb-1">Right to Data Portability (Art. 20):</strong>
                You are entitled to export your rental history and profile data in a structured, commonly used, machine-readable JSON format.
              </div>
              <div className="p-3.5 rounded-xl bg-white/2 border border-white/5">
                <strong className="text-ivory block mb-1">Right to Object &amp; Restrict Processing (Arts. 18 &amp; 21):</strong>
                You may restrict processing or object at any time to non-contractual data use, including direct marketing notifications.
              </div>
            </div>
            <p className="text-[11px] text-muted-gray">
              <strong>Cross-Border Transfers:</strong> When information is transferred outside the EEA, we rely on EU Commission Standard Contractual Clauses (SCCs) and verify that our cloud providers maintain adequacy certifications.
            </p>
          </section>

          {/* 05. Sub-Processors & Disclosures */}
          <section id="third-parties" className="space-y-4 scroll-mt-24">
            <div className="flex items-center gap-2 text-gold-champagne font-mono text-[11px] uppercase tracking-wider">
              <Server size={14} />
              <span>Section 05</span>
            </div>
            <h2 className="serif-heading text-2xl font-normal text-ivory">
              5. Third-Party Sub-Processors &amp; Disclosures
            </h2>
            <p>
              We do not sell, rent, or trade your personal data. We disclose information strictly to certified sub-processors required to execute payments, power infrastructure, and deliver cinema equipment:
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-[11px] border border-white/5 rounded-xl overflow-hidden">
                <thead className="bg-white/5 text-ivory font-mono uppercase tracking-wider">
                  <tr>
                    <th className="p-3 border-b border-white/5">Sub-Processor</th>
                    <th className="p-3 border-b border-white/5">Activity Performed</th>
                    <th className="p-3 border-b border-white/5">Server Region</th>
                    <th className="p-3 border-b border-white/5">Compliance Standard</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  <tr>
                    <td className="p-3 font-medium text-ivory">Supabase Inc. (AWS)</td>
                    <td className="p-3">PostgreSQL Database, Auth, Encrypted Storage</td>
                    <td className="p-3">AP-South-1 (Mumbai, India)</td>
                    <td className="p-3 font-mono text-emerald-400">SOC2 Type II, ISO 27001</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-medium text-ivory">Razorpay Software Pvt Ltd</td>
                    <td className="p-3">Online Checkout, UPI, NetBanking</td>
                    <td className="p-3">India</td>
                    <td className="p-3 font-mono text-emerald-400">PCI-DSS Level 1</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-medium text-ivory">Vercel Inc.</td>
                    <td className="p-3">Edge Serverless Hosting &amp; Web Analytics</td>
                    <td className="p-3">Global Edge (BOM1 Mumbai)</td>
                    <td className="p-3 font-mono text-emerald-400">SOC2 Type II, GDPR DPA</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-medium text-ivory">Google LLC</td>
                    <td className="p-3">Federated OAuth Authentication</td>
                    <td className="p-3">Global / India</td>
                    <td className="p-3 font-mono text-emerald-400">ISO 27018, GDPR</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-medium text-ivory">Logistics &amp; Courier Partners</td>
                    <td className="p-3">Armored Flight-Case Equipment Transport</td>
                    <td className="p-3">Karnataka &amp; Pan-India</td>
                    <td className="p-3 font-mono text-muted-gray">Confidential Delivery NDA</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* 06. Technical & Data Security */}
          <section id="security" className="space-y-4 scroll-mt-24">
            <div className="flex items-center gap-2 text-gold-champagne font-mono text-[11px] uppercase tracking-wider">
              <Lock size={14} />
              <span>Section 06</span>
            </div>
            <h2 className="serif-heading text-2xl font-normal text-ivory">
              6. Technical &amp; Organizational Security Measures
            </h2>
            <p>
              AUREVIA protects your identity documents and reservation history using multi-layered defense-in-depth security architectures:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
              <div className="p-4 rounded-xl bg-white/2 border border-white/5 space-y-1.5">
                <span className="font-mono text-gold-champagne text-[11px] block">01. Cryptography</span>
                <h4 className="text-ivory font-medium text-xs">AES-256 &amp; TLS 1.3</h4>
                <p className="text-[11px] text-muted-gray">
                  All customer documents and database volumes are encrypted at rest using AES-256. Web communications are enforced over TLS 1.3 with HSTS headers.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-white/2 border border-white/5 space-y-1.5">
                <span className="font-mono text-gold-champagne text-[11px] block">02. Access Control</span>
                <h4 className="text-ivory font-medium text-xs">Row-Level Security (RLS)</h4>
                <p className="text-[11px] text-muted-gray">
                  Supabase database queries strictly enforce RLS policies. No customer can query or read documents belonging to another filmmaker.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-white/2 border border-white/5 space-y-1.5">
                <span className="font-mono text-gold-champagne text-[11px] block">03. Audit Trail</span>
                <h4 className="text-ivory font-medium text-xs">Immutable Administrative Logs</h4>
                <p className="text-[11px] text-muted-gray">
                  Every administrative verification, coupon change, or status update generates an unalterable cryptographic audit record with timestamp and identity.
                </p>
              </div>
            </div>
          </section>

          {/* 07. Data Retention Timetable */}
          <section id="retention" className="space-y-4 scroll-mt-24">
            <div className="flex items-center gap-2 text-gold-champagne font-mono text-[11px] uppercase tracking-wider">
              <Clock size={14} />
              <span>Section 07</span>
            </div>
            <h2 className="serif-heading text-2xl font-normal text-ivory">
              7. Data Retention Schedule
            </h2>
            <p>
              We retain personal information only for the minimum duration required to service your bookings, uphold safety guarantees, and satisfy statutory tax obligations:
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-[11px] border border-white/5 rounded-xl overflow-hidden">
                <thead className="bg-white/5 text-ivory font-mono uppercase tracking-wider">
                  <tr>
                    <th className="p-3 border-b border-white/5">Data Classification</th>
                    <th className="p-3 border-b border-white/5">Retention Duration</th>
                    <th className="p-3 border-b border-white/5">Purge / Deletion Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  <tr>
                    <td className="p-3 font-medium text-ivory">KYC Identity Scans (Aadhaar, DL, PAN)</td>
                    <td className="p-3">Rental active + 90 calendar days post gear return</td>
                    <td className="p-3 text-gold-champagne">Permanently shredded from encrypted S3 storage bucket</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-medium text-ivory">Booking Invoices &amp; Tax Receipts</td>
                    <td className="p-3">7 years (Mandatory under Indian GST &amp; IT Act)</td>
                    <td className="p-3 text-muted-gray">Automated archiving to immutable cold storage</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-medium text-ivory">Customer Account Profile &amp; Preferences</td>
                    <td className="p-3">Until user requests voluntary account closure</td>
                    <td className="p-3 text-gold-champagne">Purged upon authenticated Right to Erasure request</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-medium text-ivory">Server Telemetry &amp; Access Logs</td>
                    <td className="p-3">30 to 90 days rolling window</td>
                    <td className="p-3 text-muted-gray">Overwritten via automated server rotation scripts</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* 08. Data Deletion & Interactive DSR Form */}
          <section id="deletion" className="space-y-5 scroll-mt-24">
            <div className="flex items-center gap-2 text-gold-champagne font-mono text-[11px] uppercase tracking-wider">
              <Trash2 size={14} />
              <span>Section 08</span>
            </div>
            <h2 className="serif-heading text-2xl font-normal text-ivory">
              8. Data Deletion, Right to Erasure &amp; Self-Service Requests
            </h2>
            <p>
              You maintain the absolute right to have your account wiped, personal identifiers removed, and KYC documents securely erased once all active camera rentals are resolved.
            </p>

            {/* Interactive Data Subject Request (DSR) Form */}
            <div id="interactive-dsr" className="p-6 rounded-2xl bg-white/3 border border-gold-champagne/30 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gold-champagne/10 text-gold-champagne flex items-center justify-center shrink-0">
                  <RefreshCw size={18} />
                </div>
                <div>
                  <h3 className="serif-heading text-base font-medium text-ivory">
                    Interactive Data Subject Request (DSR) Portal
                  </h3>
                  <p className="text-[11px] text-muted-gray">
                    Submit an official request under GDPR Art. 17 or DPDP Act 2023. Our compliance team verifies your identity and processes your request within 30 days.
                  </p>
                </div>
              </div>

              {resultMessage && (
                <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                  <CheckCircle2 size={16} className="shrink-0" />
                  <span>{resultMessage}</span>
                </div>
              )}

              {errorMessage && (
                <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                  <AlertTriangle size={16} className="shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <form onSubmit={handleSubmitRequest} className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-1">
                <div>
                  <label className="block text-[11px] font-mono text-muted-gray mb-1">
                    Request Classification *
                  </label>
                  <select
                    value={requestType}
                    onChange={(e) => setRequestType(e.target.value)}
                    className="w-full bg-obsidian border border-white/10 rounded-xl px-3 py-2 text-ivory focus:outline-none focus:border-gold-champagne"
                  >
                    <option value="DATA_DELETION">Right to Erasure (Delete Account &amp; Records)</option>
                    <option value="KYC_PURGE">Purge KYC Scans (Keep Basic Account)</option>
                    <option value="DATA_PORTABILITY_EXPORT">Right to Portability (JSON Export)</option>
                    <option value="RECTIFICATION">Data Rectification (Correct Inaccuracies)</option>
                    <option value="MARKETING_OPT_OUT">Marketing Opt-Out (Unsubscribe All)</option>
                    <option value="GDPR_GENERAL_INQUIRY">General Compliance &amp; Legal Query</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-muted-gray mb-1">
                    Your Full Legal Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Arjun Rao"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-obsidian border border-white/10 rounded-xl px-3 py-2 text-ivory focus:outline-none focus:border-gold-champagne"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-muted-gray mb-1">
                    Registered Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="filmmaker@studio.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-obsidian border border-white/10 rounded-xl px-3 py-2 text-ivory focus:outline-none focus:border-gold-champagne"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-muted-gray mb-1">
                    Phone / WhatsApp Number (Optional)
                  </label>
                  <input
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-obsidian border border-white/10 rounded-xl px-3 py-2 text-ivory focus:outline-none focus:border-gold-champagne"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-[11px] font-mono text-muted-gray mb-1">
                    Additional Request Context (Optional)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Specify booking IDs or details regarding your request..."
                    value={details}
                    onChange={(e) => setDetails(e.target.value)}
                    className="w-full bg-obsidian border border-white/10 rounded-xl px-3 py-2 text-ivory focus:outline-none focus:border-gold-champagne resize-none"
                  />
                </div>

                <div className="md:col-span-2 flex justify-end">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gold-champagne hover:bg-gold text-obsidian font-semibold text-xs transition disabled:opacity-50"
                  >
                    <Send size={13} />
                    <span>{submitting ? "Transmitting..." : "Submit Official DSR Request"}</span>
                  </button>
                </div>
              </form>
            </div>
          </section>

          {/* 09. Marketing & Communications */}
          <section id="marketing" className="space-y-4 scroll-mt-24">
            <div className="flex items-center gap-2 text-gold-champagne font-mono text-[11px] uppercase tracking-wider">
              <Mail size={14} />
              <span>Section 09</span>
            </div>
            <h2 className="serif-heading text-2xl font-normal text-ivory">
              9. Marketing Consent &amp; Communication Preferences
            </h2>
            <p>
              We draw a strict distinction between <strong>Transactional Notifications</strong> and <strong>Promotional Communications</strong>:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-[11px]">
              <li>
                <strong>Transactional Messages:</strong> Reservation confirmations, OTPs, dispatch alerts, and return inspection reports are mandatory to perform our rental agreement.
              </li>
              <li>
                <strong>Promotional Alerts:</strong> Updates on new cinema gear additions (e.g. Master Anamorphic lenses, new RED cine rigs) or seasonal festival discounts are sent <em>only</em> if you affirmatively opt in.
              </li>
              <li>
                <strong>Immediate Opt-Out:</strong> You can revoke marketing consent at any time by replying <code>STOP</code> on our WhatsApp concierge, clicking &quot;Unsubscribe&quot; at the bottom of any email, or toggling preferences via our DSR portal above.
              </li>
            </ul>
          </section>

          {/* 10. Data Breach Notification Procedures */}
          <section id="breach" className="space-y-4 scroll-mt-24">
            <div className="flex items-center gap-2 text-gold-champagne font-mono text-[11px] uppercase tracking-wider">
              <AlertTriangle size={14} />
              <span>Section 10</span>
            </div>
            <h2 className="serif-heading text-2xl font-normal text-ivory">
              10. Data Breach Response &amp; Notification Procedures
            </h2>
            <p>
              AUREVIA maintains an active Incident Response Lifecycle to detect, isolate, and remediate cybersecurity threats. In the event of a confirmed breach of personal or identity data:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
              <div className="p-4 rounded-xl bg-white/2 border border-white/5 space-y-2">
                <h4 className="text-ivory font-medium text-xs flex items-center gap-2">
                  <span className="font-mono text-gold-champagne">Timeline 01</span>
                  Regulatory Authority Escalation
                </h4>
                <p className="text-[11px] text-muted-gray">
                  In compliance with Indian CERT-In cybersecurity directives, qualifying security incidents are reported to CERT-In within <strong>6 hours</strong> of notice. Under GDPR Article 33, relevant EU Data Protection Authorities are notified within <strong>72 hours</strong>.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-white/2 border border-white/5 space-y-2">
                <h4 className="text-ivory font-medium text-xs flex items-center gap-2">
                  <span className="font-mono text-gold-champagne">Timeline 02</span>
                  Affected Filmmaker Notification
                </h4>
                <p className="text-[11px] text-muted-gray">
                  If an incident presents high risk to user rights or identity protection, AUREVIA notifies affected customers without undue delay via registered email and SMS, detailing the nature of the breach, affected records, and remediation guidance.
                </p>
              </div>
            </div>
          </section>

          {/* 11. Data Processing Agreements */}
          <section id="dpa" className="space-y-4 scroll-mt-24">
            <div className="flex items-center gap-2 text-gold-champagne font-mono text-[11px] uppercase tracking-wider">
              <FileText size={14} />
              <span>Section 11</span>
            </div>
            <h2 className="serif-heading text-2xl font-normal text-ivory">
              11. Data Processing Agreements (DPA) for Commercial Studios
            </h2>
            <p>
              For production houses, OTT studios, advertising agencies, and corporate entities that require a formal Data Processing Agreement (DPA) under GDPR Art. 28 or enterprise vendor risk compliance, AUREVIA provides our pre-executed Standard Rental DPA.
            </p>
            <p>
              To execute a custom DPA or register specific compliance vendor questionnaires, contact our Legal Concierge at <strong>premmundargi135@gmail.com</strong> with the subject line <code>[Enterprise DPA Request - Production Entity]</code>.
            </p>
          </section>

          {/* 12. Grievance & DPO Contacts */}
          <section id="officer" className="space-y-4 scroll-mt-24">
            <div className="flex items-center gap-2 text-gold-champagne font-mono text-[11px] uppercase tracking-wider">
              <ShieldCheck size={14} />
              <span>Section 12</span>
            </div>
            <h2 className="serif-heading text-2xl font-normal text-ivory">
              12. Grievance Redressal &amp; Data Protection Officer
            </h2>
            <p>
              In accordance with Section 8(9) of the Digital Personal Data Protection Act 2023 and GDPR Article 37, our designated Grievance Officer and Data Protection Lead can be contacted directly:
            </p>
            <div className="p-5 rounded-2xl bg-white/2 border border-white/5 space-y-2.5 max-w-lg">
              <p className="text-ivory font-medium text-xs">
                Prem Mundargi — Founder &amp; Chief Data Protection Officer
              </p>
              <p className="text-[11px] text-muted-gray">
                AUREVIA Premium Rentals Vault, Gadag Main Road, Karnataka, India - 582101
              </p>
              <p className="text-[11px] text-muted-gray">
                Direct Contact Phone:{" "}
                <a href="tel:+919686909048" className="text-gold-champagne hover:underline">
                  +91 96869 09048
                </a>
              </p>
              <p className="text-[11px] text-muted-gray">
                Regulatory Inquiries:{" "}
                <a href="mailto:premmundargi135@gmail.com" className="text-gold-champagne hover:underline">
                  premmundargi135@gmail.com
                </a>
              </p>
              <p className="text-[10px] text-muted-gray/70 pt-1">
                Grievances are acknowledged within 24 business hours and fully resolved within 15 to 30 calendar days.
              </p>
            </div>
          </section>
        </main>
      </div>

      <Footer />
    </div>
  );
}
