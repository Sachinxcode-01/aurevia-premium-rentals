"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Globe,
  Save,
  Sparkles,
  Megaphone,
  Clock,
  Phone,
  Mail,
  MapPin,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Loader2,
  Eye,
  Tag,
  Flame,
} from "lucide-react";
import { adminApiClient } from "@/lib/api-client";

type CmsTab = "hero" | "announcement" | "promo" | "contact";

interface CmsFormState {
  homepage_banner_title: string;
  homepage_banner_subtitle: string;
  hero_badge_text: string;
  announcement_bar_text: string;
  announcement_bar_active: string;
  announcement_bar_link: string;
  promo_countdown_active: string;
  promo_countdown_title: string;
  promo_countdown_code: string;
  promo_countdown_discount: string;
  featured_gear_id: string;
  contact_phone: string;
  contact_email: string;
  contact_address: string;
}

const DEFAULT_STATE: CmsFormState = {
  homepage_banner_title: "Frame the Extraordinary",
  homepage_banner_subtitle:
    "South India's premier camera equipment concierge. Rent calibrated cinema cameras, full-frame mirrorless bodies, cinema lenses, and production stabilizers with zero-deposit options and doorstep Pelican flight cases.",
  hero_badge_text: "AUREVIA VAULT • OFFICIAL CAMERA & CINEMA RENTALS",
  announcement_bar_text:
    "⚡ SPECIAL OFFER: Save ₹199/day on all cameras with coupon AUREVIA199!",
  announcement_bar_active: "true",
  announcement_bar_link: "/explore",
  promo_countdown_active: "true",
  promo_countdown_title: "Monsoon Production Pass",
  promo_countdown_code: "AUREVIA199",
  promo_countdown_discount: "Flat ₹199 OFF",
  featured_gear_id: "canon-eos-r5",
  contact_phone: "+91 96869 09048",
  contact_email: "premmundargi135@gmail.com",
  contact_address:
    "Aurevia Studio Vault, Gadag Main Road, Karnataka, India - 582101",
};

export default function AdminCmsPage() {
  const [activeTab, setActiveTab] = useState<CmsTab>("hero");
  const [form, setForm] = useState<CmsFormState>(DEFAULT_STATE);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const publicSiteUrl =
    process.env.NEXT_PUBLIC_API_URL ||
    (typeof window !== "undefined" && window.location.hostname.includes("localhost")
      ? "http://localhost:3000"
      : "https://aurevia-premium-rentals.vercel.app");

  const loadCmsData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminApiClient.cms.get();
      if (res.success && res.data) {
        setForm((prev) => ({ ...prev, ...res.data }));
      }
    } catch {
      // Fallback to default
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCmsData();
  }, [loadCmsData]);

  const handleChange = (key: keyof CmsFormState, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFeedback(null);

    try {
      const res = await adminApiClient.cms.update(form);
      if (res.success) {
        setFeedback({
          type: "success",
          message: "Website content published and live across all public pages!",
        });
        if (res.data) {
          setForm((prev) => ({ ...prev, ...res.data }));
        }
      } else {
        setFeedback({
          type: "error",
          message: res.error?.message || res.message || "Failed to publish content.",
        });
      }
    } catch (err: any) {
      setFeedback({
        type: "error",
        message: err?.message || "Network error while saving CMS changes.",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-[#d8b36a]/10 text-[#d8b36a] border border-[#d8b36a]/20">
              <Globe size={18} />
            </span>
            <span className="text-[10px] font-mono tracking-widest text-[#d8b36a] uppercase">
              No-Code Content Management
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-light text-[#f5f1e8] tracking-tight">
            Website CMS &amp; Content Studio
          </h1>
          <p className="text-xs text-[#9a9995] font-light mt-1">
            Update hero headlines, live announcement banners, flash deals, and concierge contact details without writing code.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <a
            href={publicSiteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-[#f5f1e8] hover:text-[#d8b36a] hover:border-[#d8b36a]/30 transition text-xs font-mono font-medium"
          >
            <Eye size={14} className="text-[#d8b36a]" />
            <span>Open Public Site ↗</span>
          </a>

          <button
            type="button"
            onClick={handleSave}
            disabled={saving || loading}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#d8b36a] hover:bg-[#b98a43] text-black font-semibold text-xs transition duration-200 shadow-lg shadow-[#d8b36a]/15 disabled:opacity-50 cursor-pointer font-mono"
          >
            {saving ? (
              <Loader2 size={15} className="animate-spin text-black" />
            ) : (
              <Save size={15} className="text-black" />
            )}
            <span>{saving ? "Publishing..." : "Publish Live Changes"}</span>
          </button>
        </div>
      </div>

      {/* Feedback Toast */}
      {feedback && (
        <div
          className={`p-4 rounded-xl text-xs flex items-center justify-between gap-3 border ${
            feedback.type === "success"
              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
              : "bg-rose-500/10 border-rose-500/20 text-rose-400"
          }`}
        >
          <div className="flex items-center gap-2.5">
            {feedback.type === "success" ? (
              <CheckCircle2 size={16} />
            ) : (
              <AlertCircle size={16} />
            )}
            <span>{feedback.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            className="text-white/40 hover:text-white"
          >
            ✕
          </button>
        </div>
      )}

      {/* Two-Column Editor & Live Visual Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Tabbed Form Editor */}
        <div className="lg:col-span-7 space-y-6">
          {/* Navigation Tabs */}
          <div className="flex flex-wrap gap-2 border-b border-white/5 pb-2">
            {[
              { id: "hero", label: "Hero & Headline", icon: Sparkles },
              { id: "announcement", label: "Top Announcement Bar", icon: Megaphone },
              { id: "promo", label: "Flash Sales & Deals", icon: Flame },
              { id: "contact", label: "Concierge Contacts", icon: Phone },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id as CmsTab)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium transition cursor-pointer ${
                    isActive
                      ? "bg-[#d8b36a]/15 text-[#d8b36a] border border-[#d8b36a]/30"
                      : "text-[#9a9995] hover:text-[#f5f1e8] hover:bg-white/5"
                  }`}
                >
                  <Icon size={14} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          <form onSubmit={handleSave} className="space-y-6">
            {/* TAB 1: Hero & Headline */}
            {activeTab === "hero" && (
              <div className="p-6 rounded-2xl bg-[#0f0f0f] border border-white/5 space-y-5">
                <div className="border-b border-white/5 pb-3">
                  <h3 className="text-sm font-medium text-[#f5f1e8]">Homepage Hero Banner</h3>
                  <p className="text-[11px] text-[#9a9995] font-light">
                    Controls the primary above-the-fold title, badge, and editorial intro.
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-xs text-[#9a9995] font-medium block">
                    Gold Vault Pill Badge
                  </label>
                  <input
                    type="text"
                    value={form.hero_badge_text}
                    onChange={(e) => handleChange("hero_badge_text", e.target.value)}
                    placeholder="e.g. AUREVIA VAULT • OFFICIAL CAMERA & CINEMA RENTALS"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/10 text-xs text-[#f5f1e8] focus:border-[#d8b36a] focus:outline-none transition font-mono"
                  />
                  <p className="text-[10px] text-white/40">Appears above the main headline.</p>
                </div>

                <div className="space-y-2">
                  <label className="text-xs text-[#9a9995] font-medium block">
                    Hero Tagline / Secondary Headline
                  </label>
                  <input
                    type="text"
                    value={form.homepage_banner_title}
                    onChange={(e) => handleChange("homepage_banner_title", e.target.value)}
                    placeholder="e.g. Frame the Extraordinary"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/10 text-xs text-[#f5f1e8] focus:border-[#d8b36a] focus:outline-none transition font-medium"
                  />
                  <p className="text-[10px] text-white/40">Prefixed with &quot;By Prem Mundargi • &quot; on the live site.</p>
                </div>

                <div className="space-y-2">
                  <label className="text-xs text-[#9a9995] font-medium block">
                    Editorial Intro / Concierge Pitch
                  </label>
                  <textarea
                    rows={4}
                    value={form.homepage_banner_subtitle}
                    onChange={(e) => handleChange("homepage_banner_subtitle", e.target.value)}
                    placeholder="Describe your equipment curation, flight cases, and concierge support..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/10 text-xs text-[#f5f1e8] focus:border-[#d8b36a] focus:outline-none transition font-light leading-relaxed"
                  />
                </div>
              </div>
            )}

            {/* TAB 2: Announcement Bar */}
            {activeTab === "announcement" && (
              <div className="p-6 rounded-2xl bg-[#0f0f0f] border border-white/5 space-y-5">
                <div className="border-b border-white/5 pb-3">
                  <h3 className="text-sm font-medium text-[#f5f1e8]">Global Announcement Bar</h3>
                  <p className="text-[11px] text-[#9a9995] font-light">
                    Displays a top banner across every page of the public website.
                  </p>
                </div>

                <div className="flex items-center justify-between p-3.5 rounded-xl bg-black/40 border border-white/5">
                  <div>
                    <p className="text-xs font-medium text-[#f5f1e8]">Enable Announcement Bar</p>
                    <p className="text-[10px] text-[#9a9995]">Make the banner visible to all visitors</p>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      handleChange(
                        "announcement_bar_active",
                        form.announcement_bar_active === "true" ? "false" : "true"
                      )
                    }
                    className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition ${
                      form.announcement_bar_active === "true"
                        ? "bg-[#d8b36a] justify-end"
                        : "bg-white/10 justify-start"
                    }`}
                  >
                    <span className="bg-black w-4 h-4 rounded-full shadow-md" />
                  </button>
                </div>

                <div className="space-y-2">
                  <label className="text-xs text-[#9a9995] font-medium block">
                    Banner Announcement Message
                  </label>
                  <input
                    type="text"
                    value={form.announcement_bar_text}
                    onChange={(e) => handleChange("announcement_bar_text", e.target.value)}
                    placeholder="e.g. ⚡ SPECIAL OFFER: Save ₹199/day on all cameras with coupon AUREVIA199!"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/10 text-xs text-[#f5f1e8] focus:border-[#d8b36a] focus:outline-none transition font-mono"
                  />
                  <div className="flex items-center gap-1.5 pt-1">
                    <span className="text-[10px] text-white/40">Quick Emojis:</span>
                    {["⚡", "🎬", "📷", "✨", "🔥", "💎", "🎁"].map((emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() =>
                          handleChange(
                            "announcement_bar_text",
                            `${emoji} ${form.announcement_bar_text}`
                          )
                        }
                        className="px-2 py-0.5 rounded bg-white/5 hover:bg-white/10 text-xs border border-white/5 transition"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs text-[#9a9995] font-medium block">
                    Banner Link Route (Optional)
                  </label>
                  <input
                    type="text"
                    value={form.announcement_bar_link}
                    onChange={(e) => handleChange("announcement_bar_link", e.target.value)}
                    placeholder="/explore or /packages"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/10 text-xs text-[#f5f1e8] focus:border-[#d8b36a] focus:outline-none transition font-mono"
                  />
                </div>
              </div>
            )}

            {/* TAB 3: Flash Deals & Promo Timer */}
            {activeTab === "promo" && (
              <div className="p-6 rounded-2xl bg-[#0f0f0f] border border-white/5 space-y-5">
                <div className="border-b border-white/5 pb-3">
                  <h3 className="text-sm font-medium text-[#f5f1e8]">Promotional Deals &amp; Badges</h3>
                  <p className="text-[11px] text-[#9a9995] font-light">
                    Highlights seasonal coupons and countdown incentives for filmmakers.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs text-[#9a9995] font-medium block">
                      Promotion Title
                    </label>
                    <input
                      type="text"
                      value={form.promo_countdown_title}
                      onChange={(e) => handleChange("promo_countdown_title", e.target.value)}
                      placeholder="e.g. Monsoon Production Pass"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/10 text-xs text-[#f5f1e8] focus:border-[#d8b36a] focus:outline-none transition"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs text-[#9a9995] font-medium block">
                      Coupon Code
                    </label>
                    <input
                      type="text"
                      value={form.promo_countdown_code}
                      onChange={(e) => handleChange("promo_countdown_code", e.target.value.toUpperCase())}
                      placeholder="e.g. AUREVIA199"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/10 text-xs text-[#d8b36a] font-mono font-bold focus:border-[#d8b36a] focus:outline-none transition"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs text-[#9a9995] font-medium block">
                    Discount Ribbon Text
                  </label>
                  <input
                    type="text"
                    value={form.promo_countdown_discount}
                    onChange={(e) => handleChange("promo_countdown_discount", e.target.value)}
                    placeholder="e.g. Flat ₹199 OFF or 15% OFF"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/10 text-xs text-[#f5f1e8] focus:border-[#d8b36a] focus:outline-none transition"
                  />
                </div>
              </div>
            )}

            {/* TAB 4: Concierge Contacts */}
            {activeTab === "contact" && (
              <div className="p-6 rounded-2xl bg-[#0f0f0f] border border-white/5 space-y-5">
                <div className="border-b border-white/5 pb-3">
                  <h3 className="text-sm font-medium text-[#f5f1e8]">Concierge Contact Info</h3>
                  <p className="text-[11px] text-[#9a9995] font-light">
                    Synchronized across website navigation, footer, and automated WhatsApp booking redirects.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs text-[#9a9995] font-medium block">
                      Direct Calling Phone
                    </label>
                    <input
                      type="text"
                      value={form.contact_phone}
                      onChange={(e) => handleChange("contact_phone", e.target.value)}
                      placeholder="+91 96869 09048"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/10 text-xs text-[#f5f1e8] focus:border-[#d8b36a] focus:outline-none transition font-mono"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs text-[#9a9995] font-medium block">
                      Official Support Email
                    </label>
                    <input
                      type="email"
                      value={form.contact_email}
                      onChange={(e) => handleChange("contact_email", e.target.value)}
                      placeholder="premmundargi135@gmail.com"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/10 text-xs text-[#f5f1e8] focus:border-[#d8b36a] focus:outline-none transition font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs text-[#9a9995] font-medium block">
                    Studio Vault Physical Address
                  </label>
                  <input
                    type="text"
                    value={form.contact_address}
                    onChange={(e) => handleChange("contact_address", e.target.value)}
                    placeholder="Aurevia Studio Vault, Gadag Main Road, Karnataka, India - 582101"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/10 text-xs text-[#f5f1e8] focus:border-[#d8b36a] focus:outline-none transition"
                  />
                </div>
              </div>
            )}
          </form>
        </div>

        {/* Right Column: Interactive Real-Time Live Preview */}
        <div className="lg:col-span-5 sticky top-24 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono tracking-wider text-[#d8b36a] uppercase flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#d8b36a] animate-pulse" />
              Live Visual Preview
            </span>
            <span className="text-[10px] text-[#9a9995] font-mono">Updates as you type</span>
          </div>

          <div className="rounded-2xl bg-black border border-white/10 p-5 space-y-5 shadow-2xl relative overflow-hidden">
            {/* Top Announcement Bar Preview */}
            {form.announcement_bar_active === "true" && (
              <div className="p-2 rounded-lg bg-linear-to-r from-[#d8b36a]/20 via-[#b98a43]/20 to-[#d8b36a]/20 border border-[#d8b36a]/30 text-center text-[10px] text-[#f5f1e8] font-mono truncate">
                {form.announcement_bar_text || "Announcement Text Preview"}
              </div>
            )}

            {/* Hero Header Preview */}
            <div className="space-y-3.5 pt-2">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#d8b36a]/15 border border-[#d8b36a]/30 text-[9px] font-mono text-[#d8b36a] font-semibold">
                <Sparkles size={11} />
                <span className="truncate max-w-70">
                  {form.hero_badge_text || "BADGE PREVIEW"}
                </span>
              </div>

              <div className="space-y-1">
                <p className="text-[10px] font-mono tracking-widest text-[#d8b36a]/80 uppercase">
                  By Prem Mundargi • {form.homepage_banner_title}
                </p>
                <h2 className="text-2xl font-light text-[#f5f1e8] tracking-tight leading-tight">
                  AUREVIA <span className="text-[#d8b36a] italic">Premium Rentals</span>
                </h2>
              </div>

              <p className="text-xs text-[#9a9995] font-light leading-relaxed line-clamp-4">
                {form.homepage_banner_subtitle}
              </p>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-2">
                <div className="px-3.5 py-1.5 rounded-lg bg-[#d8b36a] text-black text-[10px] font-mono font-bold">
                  Browse Gear Vault ↗
                </div>
                <div className="px-3 py-1.5 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[10px] font-mono">
                  WhatsApp Booking
                </div>
              </div>
            </div>

            {/* Promo Card Preview */}
            <div className="p-3.5 rounded-xl bg-white/5 border border-white/5 space-y-2">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-[#f5f1e8] font-medium flex items-center gap-1.5">
                  <Tag size={12} className="text-[#d8b36a]" />
                  {form.promo_countdown_title}
                </span>
                <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-mono">
                  {form.promo_countdown_discount}
                </span>
              </div>
              <p className="text-[10px] font-mono text-[#9a9995]">
                Use Coupon Code: <span className="text-[#d8b36a] font-bold">{form.promo_countdown_code}</span>
              </p>
            </div>

            {/* Contact Footer Preview */}
            <div className="pt-2 border-t border-white/5 text-[10px] text-[#9a9995] font-light space-y-1">
              <p className="flex items-center gap-1.5">
                <Phone size={10} className="text-[#d8b36a]" />
                <span>{form.contact_phone}</span>
              </p>
              <p className="flex items-center gap-1.5">
                <Mail size={10} className="text-[#d8b36a]" />
                <span className="truncate">{form.contact_email}</span>
              </p>
              <p className="flex items-center gap-1.5">
                <MapPin size={10} className="text-[#d8b36a]" />
                <span className="truncate">{form.contact_address}</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
