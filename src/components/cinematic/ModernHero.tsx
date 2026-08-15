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
  ChevronRight,
  Eye,
} from "lucide-react";
import GridBackground from "@/components/effects/GridBackground";

interface ModernHeroProps {
  onExploreClick?: () => void;
}

const HERO_FEATURED_GEAR = [
  {
    id: "canon-eos-r5c",
    slug: "canon-eos-r5c",
    name: "Canon EOS R5 C Cinema",
    tagline: "8K RAW 60FPS • Full-Frame Mirrorless Cinema System",
    price: 3499,
    badge: "Flagship",
    image: "/assets/canon-sequence/frame-210.jpg",
    specs: ["8K 60P RAW Internal", "45MP Stills", "Dual Pixel CMOS AF II", "Active Cooling"],
  },
  {
    id: "sony-fx6-cinema",
    slug: "sony-fx6-cinema",
    name: "Sony FX6 Cinema Line",
    tagline: "4K 120FPS 10-bit 4:2:2 • Full-Frame CineAlta Color",
    price: 3999,
    badge: "Most Popular",
    image: "/assets/canon-sequence/frame-150.jpg",
    specs: ["4K 120p High Frame Rate", "15+ Stops Dynamic Range", "Electronic Variable ND", "S-Cinetone"],
  },
  {
    id: "red-v-raptor-8k",
    slug: "red-v-raptor-8k",
    name: "RED V-RAPTOR 8K VV",
    tagline: "8K 120FPS Multi-Format • Ultra-High Speed Cinema",
    price: 8999,
    badge: "High End",
    image: "/assets/canon-sequence/frame-090.jpg",
    specs: ["8K VV 17+ Stops Range", "120FPS at 8K", "REDCODE RAW", "Integrated Dual-12G SDI"],
  },
];

export default function ModernHero({ onExploreClick }: ModernHeroProps) {
  const router = useRouter();
  const [activeGearIndex, setActiveGearIndex] = useState(0);

  const [pickupDate, setPickupDate] = useState("2026-08-15");
  const [returnDate, setReturnDate] = useState("2026-08-18");
  const [category, setCategory] = useState("all");

  const activeGear = HERO_FEATURED_GEAR[activeGearIndex];

  const handleSearchAvailability = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(
      `/explore?category=${category}&pickupDate=${pickupDate}&returnDate=${returnDate}`
    );
  };

  return (
    <GridBackground className="w-full bg-obsidian text-ivory relative overflow-hidden border-b border-white/10 pt-24 pb-16 md:py-32">
      {/* Background Volumetric Lighting Gradients */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-150 h-150 bg-gold-champagne/10 rounded-full blur-[140px] pointer-events-none z-0" />
      <div className="absolute bottom-0 right-0 w-112.5 h-112.5 bg-indigo-900/15 rounded-full blur-[120px] pointer-events-none z-0" />

      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10 space-y-12">
        {/* Top Announcement Tag */}
        <div className="flex items-center justify-center md:justify-start">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gold-champagne/10 border border-gold-border/30 backdrop-blur-md">
            <Sparkles size={13} className="text-gold-champagne animate-pulse" />
            <span className="text-[10px] sm:text-xs font-mono font-semibold uppercase tracking-widest text-gold-champagne">
              AUREVIA VAULT • ZERO SECURITY DEPOSIT SCHEME
            </span>
          </div>
        </div>

        {/* Main Hero Header Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Left Column: Headlines & CTAs */}
          <div className="lg:col-span-7 space-y-6 text-center md:text-left">
            <h1 className="serif-heading text-4xl sm:text-6xl lg:text-7xl font-light tracking-tight text-ivory leading-[1.08]">
              Frame the <span className="text-gold-glow italic font-normal">Extraordinary.</span>
            </h1>
            <p className="text-sm sm:text-base text-muted-gray font-light max-w-2xl leading-relaxed">
              Rent world-class cinema cameras, anamorphic lenses, and professional production kits. Fully sensor-sanitized, Pelican flight-cased, and delivered with 24/7 on-set support across India.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 pt-2">
              <button
                onClick={onExploreClick || (() => router.push("/explore"))}
                className="px-8 py-4 bg-gold-champagne hover:bg-gold-warm text-obsidian text-xs font-bold uppercase tracking-widest rounded-lg shadow-xl shadow-gold-champagne/15 transition-all duration-300 transform hover:-translate-y-0.5 flex items-center gap-2 cursor-pointer"
              >
                <span>Explore Gear Vault</span>
                <ArrowRight size={16} />
              </button>

              <Link
                href="/booking"
                className="px-8 py-4 bg-white/3 hover:bg-white/8 text-ivory border border-white/10 hover:border-gold-border/40 text-xs font-bold uppercase tracking-widest rounded-lg transition-all duration-300 flex items-center gap-2"
              >
                <span>Instant Availability</span>
                <ChevronRight size={16} className="text-gold-champagne" />
              </Link>
            </div>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-white/10 max-w-lg mx-auto md:mx-0">
              <div className="space-y-1 text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start gap-1">
                  <Star size={14} className="fill-gold text-gold" />
                  <span className="text-base font-bold font-mono text-ivory">4.9/5</span>
                </div>
                <span className="text-[10px] text-muted-gray uppercase font-mono tracking-wider block">
                  Renter Rating
                </span>
              </div>
              <div className="space-y-1 text-center md:text-left border-x border-white/10 px-2">
                <div className="flex items-center justify-center md:justify-start gap-1">
                  <ShieldCheck size={14} className="text-emerald-400" />
                  <span className="text-base font-bold font-mono text-ivory">100%</span>
                </div>
                <span className="text-[10px] text-muted-gray uppercase font-mono tracking-wider block">
                  Sensor Cleaned
                </span>
              </div>
              <div className="space-y-1 text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start gap-1">
                  <CheckCircle2 size={14} className="text-gold-champagne" />
                  <span className="text-base font-bold font-mono text-ivory">₹0</span>
                </div>
                <span className="text-[10px] text-muted-gray uppercase font-mono tracking-wider block">
                  Deposit Scheme
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Featured Camera Preview Card */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-2xl bg-charcoal/80 border border-gold-border/30 backdrop-blur-xl p-6 shadow-2xl space-y-6 overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gold-champagne/10 blur-3xl pointer-events-none" />

              {/* Gear Switching Tabs */}
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <span className="text-[10px] uppercase font-mono text-gold-champagne tracking-widest font-semibold">
                  Featured Optic System
                </span>
                <span className="px-2.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-mono uppercase">
                  {activeGear.badge}
                </span>
              </div>

              {/* Product Image Stage */}
              <div className="relative h-64 w-full rounded-xl overflow-hidden bg-black/40 border border-white/5 flex items-center justify-center group">
                <Image
                  src={activeGear.image}
                  alt={activeGear.name}
                  fill
                  priority
                  sizes="(max-width: 1024px) 90vw, 40vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
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
                  <h3 className="serif-heading text-xl font-light text-ivory">
                    {activeGear.name}
                  </h3>
                  <div className="text-right">
                    <span className="text-lg font-bold font-mono text-gold-champagne">
                      ₹{activeGear.price.toLocaleString("en-IN")}
                    </span>
                    <span className="text-[10px] text-muted-gray font-normal block">/ day</span>
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

              {/* Selector Buttons */}
              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/10">
                {HERO_FEATURED_GEAR.map((gear, idx) => (
                  <button
                    key={gear.id}
                    onClick={() => setActiveGearIndex(idx)}
                    className={`py-2 px-1 rounded text-[10px] font-mono font-semibold transition-all cursor-pointer ${
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

        {/* Floating Quick Search / Availability Filter Bar */}
        <div className="w-full max-w-5xl mx-auto rounded-2xl bg-charcoal/90 border border-gold-border/30 backdrop-blur-2xl p-4 sm:p-6 shadow-2xl">
          <form onSubmit={handleSearchAvailability} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 items-end">
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono uppercase text-muted-gray font-semibold flex items-center gap-1">
                <Sliders size={11} className="text-gold-champagne" /> Equipment Vault
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-obsidian border border-white/10 focus:border-gold-champagne text-ivory text-xs rounded-lg px-3 py-2.5 outline-none font-mono transition-colors"
              >
                <option value="all">All Vault Equipment</option>
                <option value="cinema-cameras">Cinema Cameras</option>
                <option value="mirrorless-cameras">Mirrorless Bodies</option>
                <option value="professional-lenses">L-Series Optics</option>
                <option value="gimbals">Gimbals & Rigs</option>
                <option value="lighting">Production Lighting</option>
              </select>
            </div>

            <div className="space-y-1.5">
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

            <div className="space-y-1.5">
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

            <button
              type="submit"
              className="w-full py-3 bg-gold-champagne hover:bg-gold-warm text-obsidian text-xs font-bold uppercase tracking-wider rounded-lg shadow-lg transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer font-mono"
            >
              <span>Check Availability</span>
              <ArrowRight size={14} />
            </button>
          </form>
        </div>
      </div>
    </GridBackground>
  );
}
