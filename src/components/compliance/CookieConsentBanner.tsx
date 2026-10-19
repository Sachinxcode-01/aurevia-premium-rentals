"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Cookie, ShieldCheck, Settings, Check, X } from "lucide-react";

interface CookiePreferences {
  essential: boolean;
  analytics: boolean;
  marketing: boolean;
  functional: boolean;
  timestamp: string;
}

const STORAGE_KEY = "aurevia_cookie_consent_v1";

export default function CookieConsentBanner() {
  const [isOpen, setIsOpen] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    essential: true, // Always true
    analytics: true,
    marketing: false,
    functional: true,
    timestamp: "",
  });

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        // Show banner after brief delay for smooth appearance
        const timer = setTimeout(() => setIsOpen(true), 800);
        return () => clearTimeout(timer);
      } else {
        const parsed = JSON.parse(stored);
        setPreferences(parsed);
      }
    } catch {
      setIsOpen(true);
    }

    // Expose global trigger for reopening cookie preferences from footer or policy pages
    if (typeof window !== "undefined") {
      (window as unknown as { openAureviaCookieSettings: () => void }).openAureviaCookieSettings = () => {
        setShowPreferences(true);
        setIsOpen(true);
      };
    }
  }, []);

  const saveConsent = (updated: CookiePreferences) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      document.cookie = `aurevia_cookie_consent=true; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=Lax`;
      
      // Dispatch custom event for analytics scripts
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("aurevia-cookie-consent-updated", { detail: updated })
        );
      }
    } catch (e) {
      console.warn("Unable to save cookie preferences:", e);
    }
    setIsOpen(false);
    setShowPreferences(false);
  };

  const handleAcceptAll = () => {
    const fullConsent: CookiePreferences = {
      essential: true,
      analytics: true,
      marketing: true,
      functional: true,
      timestamp: new Date().toISOString(),
    };
    setPreferences(fullConsent);
    saveConsent(fullConsent);
  };

  const handleRejectNonEssential = () => {
    const essentialOnly: CookiePreferences = {
      essential: true,
      analytics: false,
      marketing: false,
      functional: false,
      timestamp: new Date().toISOString(),
    };
    setPreferences(essentialOnly);
    saveConsent(essentialOnly);
  };

  const handleSavePreferences = () => {
    const customConsent: CookiePreferences = {
      ...preferences,
      essential: true,
      timestamp: new Date().toISOString(),
    };
    saveConsent(customConsent);
  };

  if (!isOpen) return null;

  return (
    <aside
      aria-label="Cookie and Privacy Consent Banner"
      className="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:max-w-xl z-50 animate-in fade-in slide-in-from-bottom-5 duration-300"
    >
      <div className="bg-[#0b0b0d]/95 backdrop-blur-2xl border border-white/10 rounded-2xl p-6 shadow-[0_20px_50px_rgba(0,0,0,0.85)] text-ivory">
        {/* Ambient Top Glow Line */}
        <div className="absolute top-0 left-12 right-12 h-px bg-linear-to-r from-transparent via-gold-champagne/40 to-transparent pointer-events-none" />

        {!showPreferences ? (
          <div>
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-gold-champagne/10 text-gold-champagne border border-gold-champagne/20 flex items-center justify-center shrink-0 mt-0.5">
                <Cookie size={20} />
              </div>
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="serif-heading text-base font-medium text-ivory tracking-wide">
                    Privacy &amp; Cookie Preferences
                  </h3>
                  <button
                    onClick={handleRejectNonEssential}
                    className="text-muted-gray hover:text-ivory transition p-1"
                    aria-label="Dismiss cookie notice with essential cookies only"
                  >
                    <X size={16} />
                  </button>
                </div>
                <p className="text-xs text-muted-gray leading-relaxed font-light">
                  AUREVIA utilizes essential cookies to maintain secure authenticated vault sessions, safeguard your rental cart, and respect your privacy choices. We do not sell your personal data.
                </p>
                <div className="text-[11px] text-muted-gray/80 pt-0.5 flex flex-wrap gap-x-3 gap-y-1">
                  <Link href="/cookies" className="text-gold-champagne hover:underline">
                    Cookie Policy
                  </Link>
                  <span>•</span>
                  <Link href="/privacy" className="text-gold-champagne hover:underline">
                    Privacy Notice
                  </Link>
                  <span>•</span>
                  <Link href="/terms" className="text-gold-champagne hover:underline">
                    Rental Terms
                  </Link>
                </div>
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-white/5 flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setShowPreferences(true)}
                className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 hover:border-gold-champagne/40 hover:bg-white/10 text-xs text-muted-gray hover:text-ivory transition"
              >
                <Settings size={13} />
                <span>Customise</span>
              </button>
              <button
                type="button"
                onClick={handleRejectNonEssential}
                className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-xs text-ivory transition"
              >
                Essential Only
              </button>
              <button
                type="button"
                onClick={handleAcceptAll}
                className="px-5 py-2 rounded-xl bg-linear-to-r from-gold-champagne to-amber-600 hover:from-amber-500 hover:to-gold text-obsidian font-semibold text-xs tracking-wide shadow-md hover:shadow-gold-champagne/20 transition"
              >
                Accept All
              </button>
            </div>
          </div>
        ) : (
          /* Granular Preferences View */
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <div className="flex items-center gap-2.5">
                <ShieldCheck size={18} className="text-gold-champagne" />
                <h3 className="serif-heading text-sm font-medium text-ivory">
                  Manage Cookie Consent
                </h3>
              </div>
              <button
                onClick={() => setShowPreferences(false)}
                className="text-xs text-muted-gray hover:text-ivory transition"
              >
                Back
              </button>
            </div>

            <div className="space-y-3 max-h-64 overflow-y-auto pr-1 text-xs">
              {/* Essential */}
              <div className="p-3 rounded-xl bg-white/3 border border-white/5 flex items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-ivory">Strictly Necessary</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-mono">
                      Always Active
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-gray">
                    Required for identity verification, Supabase session auth, CSRF security, and reservation checkout.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={true}
                  disabled
                  className="rounded border-white/20 text-gold-champagne bg-white/10 opacity-70 cursor-not-allowed"
                />
              </div>

              {/* Functional */}
              <div className="p-3 rounded-xl bg-white/3 border border-white/5 flex items-center justify-between gap-3">
                <div className="space-y-1">
                  <span className="font-medium text-ivory">Functional &amp; Experience</span>
                  <p className="text-[11px] text-muted-gray">
                    Preserves your rental dates, lens filter configurations, and interactive simulator preferences.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.functional}
                  onChange={(e) =>
                    setPreferences({ ...preferences, functional: e.target.checked })
                  }
                  className="rounded border-white/20 text-gold-champagne bg-white/10 focus:ring-gold-champagne"
                />
              </div>

              {/* Analytics */}
              <div className="p-3 rounded-xl bg-white/3 border border-white/5 flex items-center justify-between gap-3">
                <div className="space-y-1">
                  <span className="font-medium text-ivory">Analytics &amp; Performance</span>
                  <p className="text-[11px] text-muted-gray">
                    Anonymous telemetry through Vercel Analytics to diagnose latency, broken links, and booking errors.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.analytics}
                  onChange={(e) =>
                    setPreferences({ ...preferences, analytics: e.target.checked })
                  }
                  className="rounded border-white/20 text-gold-champagne bg-white/10 focus:ring-gold-champagne"
                />
              </div>

              {/* Marketing */}
              <div className="p-3 rounded-xl bg-white/3 border border-white/5 flex items-center justify-between gap-3">
                <div className="space-y-1">
                  <span className="font-medium text-ivory">Marketing &amp; New Gear Drops</span>
                  <p className="text-[11px] text-muted-gray">
                    Allows concierge notifications regarding newly stocked cine lenses, camera bodies, and seasonal discounts.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.marketing}
                  onChange={(e) =>
                    setPreferences({ ...preferences, marketing: e.target.checked })
                  }
                  className="rounded border-white/20 text-gold-champagne bg-white/10 focus:ring-gold-champagne"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-white/5 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={handleRejectNonEssential}
                className="px-3.5 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs text-muted-gray hover:text-ivory transition"
              >
                Disable All
              </button>
              <button
                type="button"
                onClick={handleSavePreferences}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-gold-champagne text-obsidian font-semibold text-xs transition hover:bg-gold"
              >
                <Check size={13} />
                <span>Save Preferences</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
