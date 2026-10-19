"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Calendar,
  Sparkles,
  ShieldCheck,
  Star,
  CheckCircle2,
  Sliders,
  Eye,
  Search,
  Phone,
  MessageCircle,
  Box,
} from "lucide-react";
import GridBackground from "@/components/effects/GridBackground";
import { getTomorrowDate, getDefaultReturnDate } from "@/lib/utils/dates";

interface ModernHeroProps {
  onExploreClick?: () => void;
  onShowcaseClick?: () => void;
}

const HERO_FEATURED_GEAR = [
  {
    id: "canon-eos-r5",
    slug: "canon-eos-r5",
    name: "Canon EOS R5 Cinema Pack",
    category: "Mirrorless / Cinema",
    tagline: "45MP Full-Frame • 8K RAW Video • 8-Stops IBIS",
    price: 799,
    badge: "Most Popular",
    image: "/assets/canon-sequence/frame-210.jpg",
    specs: ["8K RAW Internal", "45MP Stills", "Dual Pixel CMOS AF II", "Sensor Sanitized"],
  },
  {
    id: "nikon-z8",
    slug: "nikon-z8",
    name: "Nikon Z8 Flagship Body",
    category: "Mirrorless / Cinema",
    tagline: "45.7MP Stacked CMOS • 8K 60p N-RAW Internal",
    price: 799,
    badge: "Flagship",
    image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=600&auto=format&fit=crop",
    specs: ["8K 60p N-RAW", "Stacked High-Speed Sensor", "Deep Learning AF", "Weather Sealed"],
  },
  {
    id: "l-series-glass",
    slug: "canon-eos-r5",
    name: "L-Series Prime & Zoom Optics",
    category: "Optics / Lenses",
    tagline: "Ultra-Sharp Cinema Primes • Collimated Glass",
    price: 499,
    badge: "Cinema Glass",
    image: "https://images.unsplash.com/photo-1617005082133-548c4dd27f35?q=80&w=600&auto=format&fit=crop",
    specs: ["Circular 9-Blade Aperture", "Nano USM Motors", "Fluorine Coated", "Collimated"],
  },
];

export default function ModernHero({ onExploreClick, onShowcaseClick }: ModernHeroProps) {
  const router = useRouter();
  const [activeGearIndex, setActiveGearIndex] = useState(0);

  const [searchQuery, setSearchQuery] = useState("");
  const [pickupDate, setPickupDate] = useState(() => getTomorrowDate(1));
  const [returnDate, setReturnDate] = useState(() => getDefaultReturnDate(3));
  const [category, setCategory] = useState("all");

  const activeGear = HERO_FEATURED_GEAR[activeGearIndex];

  const handleSearchAvailability = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery.trim()) params.set("search", searchQuery.trim());
    if (category !== "all") params.set("category", category);
    if (pickupDate) params.set("pickupDate", pickupDate);
    if (returnDate) params.set("returnDate", returnDate);

    router.push(`/explore?${params.toString()}`);
  };

  const whatsappInquiryUrl = `https://wa.me/919686909048?text=${encodeURIComponent(
    "Hello Prem sir, Greetings! 👋✨\n\nI would like to enquire about camera & lens rental availability from AUREVIA Premium Rentals:\n\n📷 *Interested Equipment:* " +
      activeGear.name +
      "\n📅 *Pickup Date:* " +
      pickupDate +
      "\n🔄 *Return Date:* " +
      returnDate +
      "\n\nCould you please share live availability and rental quote? Thank you!"
  )}`;

  return (
    <GridBackground className="w-full bg-obsidian text-ivory relative overflow-hidden border-b border-white/10 pt-28 sm:pt-32 pb-16 md:pb-24">
      {/* Background Volumetric Lighting Gradients */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-140 h-140 bg-gold-champagne/10 rounded-full blur-[140px] pointer-events-none z-0" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-amber-900/10 rounded-full blur-[120px] pointer-events-none z-0" />

      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10 space-y-10 md:space-y-12">
        {/* Top Badges & Service Ribbon */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gold-champagne/10 border border-gold-border/30 backdrop-blur-md">
            <Sparkles size={13} className="text-gold-champagne" />
            <span className="text-[10px] sm:text-xs font-mono font-semibold uppercase tracking-widest text-gold-champagne">
              AUREVIA VAULT • OFFICIAL CAMERA &amp; CINEMA RENTALS
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-4 text-xs font-mono text-muted-gray">
            <a
              href="tel:+919686909048"
              className="flex items-center gap-1.5 hover:text-gold-champagne transition"
            >
              <Phone size={12} className="text-gold-champagne" />
              <span>Direct: +91 96869 09048</span>
            </a>
            <span className="text-white/20">•</span>
            <span>Gadag Vault &amp; Bangalore Hub</span>
          </div>
        </div>

        {/* Main Hero Header Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          {/* Left Column: Semantic Headline, Editorial Intro & Action CTAs */}
          <div className="lg:col-span-7 space-y-6 text-center md:text-left">
            <div className="space-y-3">
              <span className="text-xs uppercase font-mono tracking-[0.25em] text-gold-champagne/90 block font-semibold">
                By Prem Mundargi • Frame the Extraordinary
              </span>
              <h1 className="serif-heading text-4xl sm:text-6xl lg:text-7xl font-light tracking-tight text-ivory leading-[1.06]">
                AUREVIA <span className="text-gold-glow italic font-normal">Premium Rentals</span>
              </h1>
            </div>

            <p className="text-sm sm:text-base text-muted-gray font-light max-w-2xl leading-relaxed mx-auto md:mx-0">
              South India&apos;s premier camera equipment concierge. Rent calibrated cinema cameras, full-frame mirrorless bodies, cinema lenses, and production stabilizers with zero-deposit options and doorstep Pelican flight cases.
            </p>

            {/* Quick Action CTAs */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3.5 pt-1">
              <button
                onClick={onExploreClick || (() => router.push("/explore"))}
                className="px-7 py-3.5 bg-gold-champagne hover:bg-gold-warm text-obsidian text-xs font-bold uppercase tracking-widest rounded-lg shadow-xl shadow-gold-champagne/15 transition-all duration-300 transform hover:-translate-y-0.5 flex items-center gap-2 cursor-pointer font-mono"
              >
                <span>Browse Gear Vault</span>
                <ArrowRight size={15} />
              </button>

              <a
                href={whatsappInquiryUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold uppercase tracking-widest rounded-lg transition-all duration-300 flex items-center gap-2 font-mono"
              >
                <MessageCircle size={15} />
                <span>WhatsApp Booking</span>
              </a>

              {onShowcaseClick && (
                <button
                  onClick={onShowcaseClick}
                  className="px-5 py-3.5 bg-white/3 hover:bg-white/8 text-ivory/80 hover:text-ivory border border-white/10 hover:border-gold-champagne/40 text-xs font-semibold uppercase tracking-wider rounded-lg transition-all duration-300 flex items-center gap-1.5 cursor-pointer font-mono"
                >
                  <Eye size={14} className="text-gold-champagne" />
                  <span>3D Optics View</span>
                </button>
              )}
            </div>

            {/* Quick Human Trust Metrics */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-white/10 max-w-lg mx-auto md:mx-0">
              <div className="space-y-1 text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start gap-1">
                  <Star size={14} className="fill-gold text-gold" />
                  <span className="text-base font-bold font-mono text-ivory">4.95/5</span>
                </div>
                <span className="text-[10px] text-muted-gray uppercase font-mono tracking-wider block">
                  Verified Reviews
                </span>
              </div>

              <div className="space-y-1 text-center md:text-left border-x border-white/10 px-2">
                <div className="flex items-center justify-center md:justify-start gap-1">
                  <ShieldCheck size={14} className="text-emerald-400" />
                  <span className="text-base font-bold font-mono text-ivory">100%</span>
                </div>
                <span className="text-[10px] text-muted-gray uppercase font-mono tracking-wider block">
                  Cleanroom Tested
                </span>
              </div>

              <div className="space-y-1 text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start gap-1">
                  <CheckCircle2 size={14} className="text-gold-champagne" />
                  <span className="text-base font-bold font-mono text-ivory">₹0</span>
                </div>
                <span className="text-[10px] text-muted-gray uppercase font-mono tracking-wider block">
                  Zero Deposit Scheme
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Featured Gear Preview Card */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-2xl bg-charcoal/80 border border-gold-border/30 backdrop-blur-xl p-5 sm:p-6 shadow-2xl space-y-5 overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gold-champagne/10 blur-3xl pointer-events-none" />

              {/* Card Header & Badge */}
              <div className="flex items-center justify-between border-b border-white/10 pb-3.5">
                <span className="text-[10px] uppercase font-mono text-gold-champagne tracking-widest font-semibold flex items-center gap-1.5">
                  <Box size={13} /> {activeGear.category}
                </span>
                <span className="px-2.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-mono uppercase font-semibold">
                  {activeGear.badge}
                </span>
              </div>

              {/* Product Image Stage */}
              <div className="relative h-56 sm:h-64 w-full rounded-xl overflow-hidden bg-black/50 border border-white/5 flex items-center justify-center group">
                <Image
                  src={activeGear.image}
                  alt={activeGear.name}
                  fill
                  priority
                  sizes="(max-width: 1024px) 90vw, 40vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/85 via-black/20 to-transparent pointer-events-none" />

                <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between z-10">
                  <span className="text-xs font-mono text-ivory/90 truncate max-w-50">
                    {activeGear.tagline}
                  </span>
                  <Link
                    href={`/gear/${activeGear.slug}`}
                    className="p-2 rounded-full bg-gold-champagne/20 hover:bg-gold-champagne text-gold-champagne hover:text-obsidian transition-colors border border-gold-border/40"
                    aria-label={`View details for ${activeGear.name}`}
                  >
                    <Eye size={14} />
                  </Link>
                </div>
              </div>

              {/* Details & Specs */}
              <div className="space-y-3">
                <div className="flex items-baseline justify-between">
                  <h3 className="serif-heading text-lg sm:text-xl font-light text-ivory">
                    {activeGear.name}
                  </h3>
                  <div className="text-right">
                    <span className="text-base sm:text-lg font-bold font-mono text-gold-champagne">
                      ₹{activeGear.price.toLocaleString("en-IN")}
                    </span>
                    <span className="text-[10px] text-muted-gray font-normal block font-mono">/ day</span>
                  </div>
                </div>

                {/* Specs Pills */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  {activeGear.specs.map((spec, i) => (
                    <div
                      key={i}
                      className="px-2.5 py-1 rounded bg-white/2 border border-white/5 text-[10px] font-mono text-ivory/80 flex items-center gap-1.5"
                    >
                      <span className="w-1 h-1 rounded-full bg-gold-champagne" />
                      <span className="truncate">{spec}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Selector Tabs */}
              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/10">
                {HERO_FEATURED_GEAR.map((gear, idx) => (
                  <button
                    key={gear.id}
                    onClick={() => setActiveGearIndex(idx)}
                    className={`py-2 px-1 rounded text-[10px] font-mono font-semibold transition-all cursor-pointer truncate ${
                      activeGearIndex === idx
                        ? "bg-gold-champagne text-obsidian border border-gold-warm shadow-md"
                        : "bg-white/3 text-muted-gray hover:text-ivory border border-white/5 hover:border-white/20"
                    }`}
                  >
                    {gear.name.split(" ")[0]} {gear.name.split(" ")[1]}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Real-World Quick Availability & Gear Reservation Bar */}
        <div className="w-full max-w-6xl mx-auto rounded-2xl bg-charcoal/90 border border-gold-border/30 backdrop-blur-2xl p-4 sm:p-6 shadow-2xl">
          <form
            onSubmit={handleSearchAvailability}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-4 items-end"
          >
            {/* 1. Keyword search input */}
            <div className="sm:col-span-2 lg:col-span-4 space-y-1.5">
              <label className="text-[10px] font-mono uppercase text-muted-gray font-semibold flex items-center gap-1">
                <Search size={11} className="text-gold-champagne" /> Equipment Search
              </label>
              <input
                type="text"
                placeholder="Search Sony FX3, RED, Canon R5, Lenses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-obsidian border border-white/10 focus:border-gold-champagne text-ivory placeholder:text-muted-gray/50 text-xs rounded-lg px-3 py-2.5 outline-none font-mono transition-colors"
              />
            </div>

            {/* 2. Category Dropdown */}
            <div className="lg:col-span-3 space-y-1.5">
              <label className="text-[10px] font-mono uppercase text-muted-gray font-semibold flex items-center gap-1">
                <Sliders size={11} className="text-gold-champagne" /> Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-obsidian border border-white/10 focus:border-gold-champagne text-ivory text-xs rounded-lg px-3 py-2.5 outline-none font-mono transition-colors cursor-pointer"
              >
                <option value="all">All Vault Equipment</option>
                <option value="cinema-cameras">Cinema Cameras</option>
                <option value="mirrorless-cameras">Mirrorless Bodies</option>
                <option value="dslr-cameras">DSLR Cameras</option>
                <option value="professional-lenses">L-Series &amp; Cine Lenses</option>
                <option value="gimbals">Gimbals &amp; Stabilizers</option>
                <option value="lighting">Studio Lighting</option>
                <option value="audio">Wireless Audio</option>
              </select>
            </div>

            {/* 3. Pickup Date */}
            <div className="lg:col-span-2 space-y-1.5">
              <label className="text-[10px] font-mono uppercase text-muted-gray font-semibold flex items-center gap-1">
                <Calendar size={11} className="text-gold-champagne" /> Pickup Date
              </label>
              <input
                type="date"
                value={pickupDate}
                onChange={(e) => setPickupDate(e.target.value)}
                className="w-full bg-obsidian border border-white/10 focus:border-gold-champagne text-ivory text-xs rounded-lg px-3 py-2.5 outline-none font-mono transition-colors"
              />
            </div>

            {/* 4. Return Date */}
            <div className="lg:col-span-2 space-y-1.5">
              <label className="text-[10px] font-mono uppercase text-muted-gray font-semibold flex items-center gap-1">
                <Calendar size={11} className="text-gold-champagne" /> Return Date
              </label>
              <input
                type="date"
                value={returnDate}
                onChange={(e) => setReturnDate(e.target.value)}
                className="w-full bg-obsidian border border-white/10 focus:border-gold-champagne text-ivory text-xs rounded-lg px-3 py-2.5 outline-none font-mono transition-colors"
              />
            </div>

            {/* 5. Submit Button */}
            <div className="sm:col-span-2 lg:col-span-1">
              <button
                type="submit"
                className="w-full py-2.5 bg-gold-champagne hover:bg-gold-warm text-obsidian text-xs font-bold uppercase tracking-wider rounded-lg shadow-lg transition-all duration-300 flex items-center justify-center gap-1.5 cursor-pointer font-mono"
                title="Search Vault Availability"
              >
                <span>Find</span>
                <ArrowRight size={13} />
              </button>
            </div>
          </form>

          {/* Quick Filter Tags Below Search */}
          <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-white/5 mt-3 text-[11px] font-mono text-muted-gray">
            <span className="text-[10px] uppercase text-gold-champagne/80 font-semibold">Popular:</span>
            <Link
              href="/explore?category=mirrorless-cameras"
              className="px-2 py-0.5 rounded bg-white/3 hover:bg-white/8 hover:text-gold-champagne transition border border-white/5"
            >
              Canon EOS R5
            </Link>
            <Link
              href="/explore?category=cinema-cameras"
              className="px-2 py-0.5 rounded bg-white/3 hover:bg-white/8 hover:text-gold-champagne transition border border-white/5"
            >
              Cinema Systems
            </Link>
            <Link
              href="/explore?category=professional-lenses"
              className="px-2 py-0.5 rounded bg-white/3 hover:bg-white/8 hover:text-gold-champagne transition border border-white/5"
            >
              L-Series Glass
            </Link>
            <Link
              href="/packages"
              className="px-2 py-0.5 rounded bg-white/3 hover:bg-white/8 hover:text-gold-champagne transition border border-white/5"
            >
              Turnkey Packages
            </Link>
            <Link
              href="/rental-process"
              className="px-2 py-0.5 rounded bg-white/3 hover:bg-white/8 hover:text-gold-champagne transition border border-white/5"
            >
              Zero-Deposit Guide
            </Link>
          </div>
        </div>
      </div>
    </GridBackground>
  );
}
