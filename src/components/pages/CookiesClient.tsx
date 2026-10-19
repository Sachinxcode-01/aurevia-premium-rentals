"use client";

import React from "react";
import Link from "next/link";
import Navbar from "@/components/navigation/Navbar";
import Footer from "@/components/navigation/Footer";
import { useCart } from "@/hooks/useCart";
import { Sliders } from "lucide-react";

export default function CookiesClient() {
  const { cart } = useCart();

  const handleOpenPreferences = () => {
    if (typeof window !== "undefined") {
      const globalTrigger = (window as unknown as { openAureviaCookieSettings?: () => void }).openAureviaCookieSettings;
      if (globalTrigger) {
        globalTrigger();
      } else {
        alert("Cookie preferences can be configured using the bottom banner on this page.");
      }
    }
  };

  return (
    <div className="min-h-screen bg-obsidian text-ivory pb-20 selection:bg-gold-champagne/20 selection:text-ivory">
      <Navbar cartItemCount={cart.length} />

      {/* Header Banner */}
      <header className="pt-32 pb-14 px-6 md:px-12 max-w-7xl mx-auto border-b border-white/5 relative">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-semibold uppercase tracking-[0.25em] text-gold-champagne font-mono block">
                Transparency &amp; Tracking Choice
              </span>
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono">
                ePrivacy Directive &amp; GDPR Compliant
              </span>
            </div>
            <h1 className="serif-heading text-4xl md:text-5xl lg:text-6xl font-light text-ivory">
              Cookie <span className="text-gold">Policy</span>
            </h1>
            <p className="text-xs text-muted-gray max-w-2xl font-light leading-relaxed">
              Understand the small data tokens utilized on AUREVIA to maintain your authenticated vault sessions, safeguard your rental cart, optimize page speeds, and honor your personal privacy preferences.
            </p>
          </div>
          <div className="shrink-0">
            <button
              onClick={handleOpenPreferences}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gold-champagne hover:bg-gold text-obsidian font-semibold text-xs transition"
            >
              <Sliders size={14} />
              <span>Configure Cookie Consent</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Body */}
      <main className="max-w-5xl mx-auto px-6 md:px-12 py-12 space-y-12 text-xs text-muted-gray leading-relaxed font-light">
        {/* Intro */}
        <section className="space-y-3">
          <h2 className="serif-heading text-2xl font-normal text-ivory">
            1. What Are Cookies &amp; Local Storage?
          </h2>
          <p>
            Cookies are small cryptographic text files placed on your browser or device when you visit web properties. Along with browser <code>localStorage</code>, they enable web applications to remember your authenticated session across page navigations, keep cinema gear in your rental cart while you explore accessories, and diagnose loading latency.
          </p>
        </section>

        {/* Categories Table */}
        <section className="space-y-4">
          <h2 className="serif-heading text-2xl font-normal text-ivory">
            2. Detailed Inventory of Cookies Used
          </h2>
          <p>
            We classify our cookies into four distinct tiers so you can exercise complete control over what is stored:
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-[11px] border border-white/5 rounded-xl overflow-hidden">
              <thead className="bg-white/5 text-ivory font-mono uppercase tracking-wider">
                <tr>
                  <th className="p-3 border-b border-white/5">Cookie Name</th>
                  <th className="p-3 border-b border-white/5">Category</th>
                  <th className="p-3 border-b border-white/5">Provider</th>
                  <th className="p-3 border-b border-white/5">Lifespan</th>
                  <th className="p-3 border-b border-white/5">Purpose</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                <tr>
                  <td className="p-3 font-mono text-gold-champagne">sb-*-auth-token</td>
                  <td className="p-3 text-emerald-400 font-medium">Strictly Necessary</td>
                  <td className="p-3">Supabase</td>
                  <td className="p-3">Session / 1 Year</td>
                  <td className="p-3">Maintains encrypted JWT authentication tokens for your filmmaker vault account.</td>
                </tr>
                <tr>
                  <td className="p-3 font-mono text-gold-champagne">aurevia_cookie_consent</td>
                  <td className="p-3 text-emerald-400 font-medium">Strictly Necessary</td>
                  <td className="p-3">AUREVIA</td>
                  <td className="p-3">1 Year</td>
                  <td className="p-3">Stores your explicit cookie consent preferences so we never ask twice unnecessarily.</td>
                </tr>
                <tr>
                  <td className="p-3 font-mono text-gold-champagne">aurevia_cart</td>
                  <td className="p-3 text-ivory font-medium">Functional</td>
                  <td className="p-3">AUREVIA (localStorage)</td>
                  <td className="p-3">Persistent</td>
                  <td className="p-3">Preserves your selected cinema cameras, lenses, and dates in your cart between visits.</td>
                </tr>
                <tr>
                  <td className="p-3 font-mono text-gold-champagne">_va / _vercel_analytics</td>
                  <td className="p-3 text-muted-gray font-medium">Analytics</td>
                  <td className="p-3">Vercel Inc.</td>
                  <td className="p-3">Session</td>
                  <td className="p-3">Collects privacy-preserving, cookieless anonymous telemetry to identify website latency and 404 errors.</td>
                </tr>
                <tr>
                  <td className="p-3 font-mono text-gold-champagne">__cf_bm / rzp_*</td>
                  <td className="p-3 text-emerald-400 font-medium">Strictly Necessary</td>
                  <td className="p-3">Razorpay</td>
                  <td className="p-3">30 Minutes</td>
                  <td className="p-3">Fraud prevention and bot mitigation during secure online UPI/Card checkouts.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Managing and Disabling Cookies */}
        <section className="space-y-4">
          <h2 className="serif-heading text-2xl font-normal text-ivory">
            3. How to Revoke Consent or Manage Browser Settings
          </h2>
          <p>
            You can modify your preferences on our website at any time by clicking the &quot;Configure Cookie Consent&quot; button at the top of this page or via the link in the footer.
          </p>
          <p>
            Additionally, all modern browsers allow you to block or delete third-party cookies globally:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
            <div className="p-3.5 rounded-xl bg-white/2 border border-white/5 space-y-1">
              <strong className="text-ivory block text-xs">Google Chrome &amp; Edge:</strong>
              <p className="text-[11px] text-muted-gray">Settings &gt; Privacy and Security &gt; Third-party Cookies &gt; Block or Clear browsing data.</p>
            </div>
            <div className="p-3.5 rounded-xl bg-white/2 border border-white/5 space-y-1">
              <strong className="text-ivory block text-xs">Apple Safari (iOS / macOS):</strong>
              <p className="text-[11px] text-muted-gray">Preferences &gt; Privacy &gt; Prevent cross-site tracking and Block all cookies.</p>
            </div>
            <div className="p-3.5 rounded-xl bg-white/2 border border-white/5 space-y-1">
              <strong className="text-ivory block text-xs">Mozilla Firefox:</strong>
              <p className="text-[11px] text-muted-gray">Options &gt; Privacy &amp; Security &gt; Enhanced Tracking Protection (Strict Mode).</p>
            </div>
            <div className="p-3.5 rounded-xl bg-white/2 border border-white/5 space-y-1">
              <strong className="text-ivory block text-xs">Mobile Browsers (Android / iOS):</strong>
              <p className="text-[11px] text-muted-gray">Browser Settings &gt; Site Settings &gt; Cookies &gt; Toggle off non-essential cookies.</p>
            </div>
          </div>
          <p className="text-[11px] text-muted-gray/80">
            Note: Disabling Strictly Necessary cookies will prevent logging in to your customer dashboard or completing equipment checkouts.
          </p>
        </section>

        {/* Contact */}
        <section className="p-5 rounded-2xl bg-white/2 border border-white/5 space-y-2">
          <h3 className="serif-heading text-base font-medium text-ivory">
            Questions Regarding Our Cookie Architecture?
          </h3>
          <p className="text-[11px] text-muted-gray">
            For technical queries regarding our cookie encryption, contact Prem Mundargi at{" "}
            <a href="mailto:premmundargi135@gmail.com" className="text-gold-champagne hover:underline">
              premmundargi135@gmail.com
            </a>{" "}
            or review our comprehensive{" "}
            <Link href="/privacy" className="text-gold-champagne hover:underline">
              Privacy Notice
            </Link>
            .
          </p>
        </section>
      </main>

      <Footer />
    </div>
  );
}
