"use client";

import React, { useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Navbar from "@/components/navigation/Navbar";
import CanonScrollSequence from "@/components/cinematic/CanonScrollSequence";
import CameraShowroom from "@/components/three/CameraShowroom";
import Timeline from "@/components/features/Timeline";
import AnimatedAccordion from "@/components/ui/AnimatedAccordion";
import { useCart } from "@/hooks/useCart";
import { MOCK_PRODUCTS, MOCK_FAQS, MOCK_BRANDS } from "@/lib/db/mockData";
import type { FAQ, Product } from "@/lib/db/mockData";
import { db } from "@/lib/db/store";
import type { Review } from "@/lib/db/store";
import { animate, stagger } from "animejs";
import { Logo } from "@/components/ui/Logo";
import {
  ShieldCheck,
  TrendingUp,
  Clock,
  ArrowRight,
  Star,
  Eye,
  CheckCircle2,
  ChevronUp,
  Phone,
  MessageCircle,
  Mail,
} from "lucide-react";

export default function Home() {
  const router = useRouter();
  const { cart, addToCart } = useCart();

  const [reviewsList, setReviewsList] = React.useState<Review[]>([]);
  const [revName, setRevName] = React.useState("");
  const [revQuote, setRevQuote] = React.useState("");
  const [revRating, setRevRating] = React.useState(5);
  const [revSuccess, setRevSuccess] = React.useState(false);

  const [faqsList, setFaqsList] = React.useState<FAQ[]>([]);
  const [productsList, setProductsList] = React.useState<Product[]>([]);
  const [showScrollTop, setShowScrollTop] = React.useState(false);

  React.useEffect(() => {
    db.getReviews(undefined, true).then(setReviewsList);
    db.getFAQs().then(setFaqsList);
    db.getProducts().then(setProductsList);

    const handleScrollBtn = () => {
      if (window.scrollY > 600) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };
    window.addEventListener("scroll", handleScrollBtn, { passive: true });
    return () => window.removeEventListener("scroll", handleScrollBtn);
  }, []);

  useEffect(() => {
    const sections = Array.from(
      document.querySelectorAll<HTMLElement>("[data-reveal]")
    );
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (reducedMotion) {
      sections.forEach((section) => section.classList.add("is-visible"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0.08 }
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  const finalProducts = productsList.length > 0 ? productsList : MOCK_PRODUCTS;

  const featuredSectionRef = useRef<HTMLDivElement>(null);

  const featuredCameras = finalProducts.filter(
    (p) =>
      p.categoryId === "c1000000-0000-0000-0000-000000000001" || // DSLR Cameras
      p.categoryId === "c1000000-0000-0000-0000-000000000002" || // Mirrorless Cameras
      p.categoryId === "c1000000-0000-0000-0000-000000000003"    // Cinema Cameras
  );

  useEffect(() => {
    const element = featuredSectionRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animate(".camera-card-anim", {
              opacity: [0, 1],
              translateY: [40, 0],
              scale: [0.92, 1],
              rotateX: [8, 0],
              duration: 900,
              delay: stagger(120),
              easing: "easeOutQuint",
            });
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );

    observer.observe(element);
    return () => {
      if (element) observer.unobserve(element);
    };
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    const isTouchDevice = window.matchMedia("(hover: none)").matches;
    if (isTouchDevice) return;

    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const percentX = (x / rect.width) * 100;
    const percentY = (y / rect.height) * 100;
    card.style.setProperty("--mouse-x", `${percentX}%`);
    card.style.setProperty("--mouse-y", `${percentY}%`);

    const xc = rect.width / 2;
    const yc = rect.height / 2;

    const angleX = -(y - yc) / (yc / 7);
    const angleY = (x - xc) / (xc / 7);

    const shadowX = -angleY * 2.5;
    const shadowY = angleX * 2.5;

    card.style.transform = `perspective(1000px) rotateX(${angleX}deg) rotateY(${angleY}deg) scale3d(1.02, 1.02, 1.02)`;
    card.style.borderColor = "rgba(216, 179, 106, 0.4)";
    card.style.boxShadow = `${shadowX}px ${shadowY}px 30px rgba(0, 0, 0, 0.45), 0 0 25px rgba(216, 179, 106, 0.12)`;
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLElement>) => {
    const card = e.currentTarget;
    card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
    card.style.borderColor = "rgba(255, 255, 255, 0.05)";
    card.style.boxShadow = "none";
    card.style.setProperty("--mouse-x", "50%");
    card.style.setProperty("--mouse-y", "50%");
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLElement>) => {
    const card = e.currentTarget;
    card.style.transform = "scale(0.98)";
    card.style.borderColor = "rgba(216, 179, 106, 0.25)";
    card.style.boxShadow = "0 5px 15px rgba(0, 0, 0, 0.4)";
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLElement>) => {
    const card = e.currentTarget;
    card.style.transform = "scale(1)";
    card.style.borderColor = "rgba(255, 255, 255, 0.05)";
    card.style.boxShadow = "none";
  };

  const handleMagneticMove = (e: React.MouseEvent<HTMLElement>) => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    const isTouchDevice = window.matchMedia("(hover: none)").matches;
    if (isTouchDevice) return;

    const button = e.currentTarget;
    const rect = button.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;

    const x = e.clientX - cx;
    const y = e.clientY - cy;

    const pullX = x * 0.3;
    const pullY = y * 0.3;

    button.style.transform = `translate3d(${pullX}px, ${pullY}px, 50px) scale(1.05)`;
    button.style.boxShadow = "0 10px 20px rgba(216, 179, 106, 0.15)";
  };

  const handleMagneticLeave = (e: React.MouseEvent<HTMLElement>) => {
    const button = e.currentTarget;
    button.style.transform = `translate3d(0px, 0px, 50px) scale(1)`;
    button.style.boxShadow = "none";
  };

  const categoriesSectionRef = useRef<HTMLDivElement>(null);

  const categories = [
    {
      name: "DSLR Cameras",
      slug: "dslr-cameras",
      count: "12 Bodies",
      imageUrl: "/assets/canon-sequence/frame-030.jpg",
    },
    {
      name: "Mirrorless Cameras",
      slug: "mirrorless-cameras",
      count: "25 Bodies",
      imageUrl: "/assets/canon-sequence/frame-060.jpg",
    },
    {
      name: "Cinema Cameras",
      slug: "cinema-cameras",
      count: "8 Systems",
      imageUrl: "/assets/canon-sequence/frame-090.jpg",
    },
    {
      name: "Professional Lenses",
      slug: "professional-lenses",
      count: "40 Lenses",
      imageUrl: "/assets/canon-sequence/frame-120.jpg",
    },
    {
      name: "Gimbals & Stabilizers",
      slug: "gimbals",
      count: "6 Stabilizers",
      imageUrl: "/assets/canon-sequence/frame-150.jpg",
    },
    {
      name: "Lighting Equipment",
      slug: "lighting",
      count: "15 Kits",
      imageUrl: "/assets/canon-sequence/frame-180.jpg",
    },
    {
      name: "Audio Gear",
      slug: "audio",
      count: "10 Systems",
      imageUrl: "/assets/canon-sequence/frame-200.jpg",
    },
    {
      name: "Accessories",
      slug: "accessories",
      count: "30 Essentials",
      imageUrl: "/assets/canon-sequence/frame-210.jpg",
    },
  ];

  useEffect(() => {
    const element = categoriesSectionRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animate(".category-card-anim", {
              opacity: [0, 1],
              translateY: [40, 0],
              scale: [0.92, 1],
              rotateX: [8, 0],
              duration: 900,
              delay: stagger(100),
              easing: "easeOutQuint",
            });
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );

    observer.observe(element);
    return () => {
      if (element) observer.unobserve(element);
    };
  }, []);

  const handleBookDirect = (product: Product) => {
    addToCart(product, 1, "2026-07-20", "2026-07-23", []);
    router.push("/booking");
  };

  return (
    <main className="relative min-h-screen bg-obsidian text-ivory overflow-x-hidden">
      {/* 1. Header Navigation */}
      <Navbar cartItemCount={cart.length} />

      {/* 2. Flagship Canon Cinematic Scroll Sequence */}
      <CanonScrollSequence onExploreClick={() => router.push("/explore")} />

      {/* Brand Highlights Ribbon */}
      <section data-reveal className="reveal-section relative border-t border-b border-gold-border/20 bg-gradient-to-r from-obsidian via-rich-black-lux to-obsidian z-20 overflow-hidden">
        <div className="absolute inset-0 luxury-spotlight pointer-events-none" />
        <div className="max-w-7xl mx-auto px-6 py-12 md:py-16 grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 relative z-10">
          <div className="flex flex-col items-center text-center p-6 rounded-xl bg-white/[0.02] border border-white/5 hover:border-gold-champagne/30 transition-all duration-300 group hover-gold-glow">
            <span className="serif-heading text-3xl md:text-4xl text-gold-champagne font-light tracking-tight group-hover:text-gold-warm transition-colors text-gold-glow">50+</span>
            <span className="text-[10px] uppercase tracking-[0.25em] text-muted-gray font-mono font-medium mt-2">L-Series Optics</span>
          </div>
          <div className="flex flex-col items-center text-center p-6 rounded-xl bg-white/[0.02] border border-white/5 hover:border-gold-champagne/30 transition-all duration-300 group hover-gold-glow">
            <span className="serif-heading text-3xl md:text-4xl text-gold-champagne font-light tracking-tight group-hover:text-gold-warm transition-colors text-gold-glow">100%</span>
            <span className="text-[10px] uppercase tracking-[0.25em] text-muted-gray font-mono font-medium mt-2">Sensor Sanitized</span>
          </div>
          <div className="flex flex-col items-center text-center p-6 rounded-xl bg-white/[0.02] border border-white/5 hover:border-gold-champagne/30 transition-all duration-300 group hover-gold-glow">
            <span className="serif-heading text-3xl md:text-4xl text-gold-champagne font-light tracking-tight group-hover:text-gold-warm transition-colors text-gold-glow">Zero</span>
            <span className="text-[10px] uppercase tracking-[0.25em] text-muted-gray font-mono font-medium mt-2">Deposit Scheme</span>
          </div>
          <div className="flex flex-col items-center text-center p-6 rounded-xl bg-white/[0.02] border border-white/5 hover:border-gold-champagne/30 transition-all duration-300 group hover-gold-glow">
            <span className="serif-heading text-3xl md:text-4xl text-gold-champagne font-light tracking-tight group-hover:text-gold-warm transition-colors text-gold-glow">Concierge</span>
            <span className="text-[10px] uppercase tracking-[0.25em] text-muted-gray font-mono font-medium mt-2">Pelican Delivery</span>
          </div>
        </div>
      </section>

      {/* 3. Redesigned Featured Professional Gear */}
      <section
        ref={featuredSectionRef}
        data-reveal
        className="reveal-section relative py-28 px-6 md:px-12 bg-charcoal border-t border-b border-white/5 z-20 overflow-hidden"
      >
        {/* Volumetric subtle radial glow overlay */}
        <div className="absolute inset-0 bg-radial-gradient(circle at 80% 20%, rgba(216, 179, 106, 0.04) 0%, transparent 60%) pointer-events-none" />

        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-6 relative z-10">
          <div className="space-y-3">
            <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-gold-champagne font-mono block">
              FLAGSHIP INSTRUMENTS
            </span>
            <h2 className="serif-heading text-3xl md:text-5xl font-light text-ivory tracking-tight">
              Featured Professional <span className="text-gold">Gear</span>
            </h2>
            <p className="text-xs md:text-sm text-muted-gray font-light max-w-md leading-relaxed">
              Choose premium cameras built for unforgettable stories.
            </p>
          </div>
          <Link
            href="/explore"
            className="text-xs uppercase tracking-[0.2em] text-gold-champagne hover:text-gold-warm transition flex items-center gap-1 font-semibold group border-b border-gold-champagne/10 pb-1"
          >
            Explore All Vault Gear
            <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform duration-300" />
          </Link>
        </div>

        {/* Camera Cards Container */}
        <div
          className="max-w-7xl mx-auto flex md:grid md:grid-cols-3 gap-8 overflow-x-auto md:overflow-x-visible snap-x snap-mandatory scrollbar-none pb-8 md:pb-0"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {featuredCameras.map((camera) => {
            const isAvailable = camera.inventoryQty > 0;
            const brandName = MOCK_BRANDS.find((b) => b.id === camera.brandId)?.name || "Flagship";
            return (
              <div
                key={camera.id}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
                className="camera-card-anim premium-surface opacity-0 min-w-[290px] sm:min-w-[350px] md:min-w-0 snap-center bg-obsidian/45 backdrop-blur-md border border-white/5 rounded-xl overflow-hidden flex flex-col justify-between h-[520px] group shadow-2xl transition-all duration-300"
                style={{
                  transformStyle: "preserve-3d",
                  willChange: "transform",
                  transition: "transform 0.1s ease-out, border-color 0.3s ease, box-shadow 0.3s ease"
                }}
              >
                {/* Real-time pointer sheen/reflection overlay */}
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-30"
                  style={{
                    background: "radial-gradient(circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(255, 255, 255, 0.08) 0%, transparent 60%)"
                  }}
                />

                {/* Image Container with 3D Depth Layer */}
                <div
                  className="h-52 overflow-hidden relative bg-black/35 flex items-center justify-center border-b border-white/5"
                  style={{ transformStyle: "preserve-3d" }}
                >
                  <Image
                    src={camera.imagePrimary}
                    alt={camera.name}
                    fill
                    sizes="(max-width: 767px) 88vw, 33vw"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    style={{ transform: "translateZ(15px)" }}
                  />

                  {/* Availability Badge */}
                  <div
                    className="absolute top-4 left-4 z-10 flex items-center gap-1.5 px-2.5 py-1 bg-black/70 backdrop-blur-md rounded-full border border-white/10"
                    style={{ transform: "translateZ(25px)" }}
                  >
                    <span className={`h-1.5 w-1.5 rounded-full ${isAvailable ? "bg-emerald-400 animate-pulse" : "bg-rose-400"}`}></span>
                    <span className="text-[8px] uppercase tracking-wider text-ivory font-mono">
                      {isAvailable ? "Available" : "Reserved"}
                    </span>
                  </div>

                  {/* Brand Badge */}
                  <div
                    className="absolute top-4 right-4 z-10 px-2.5 py-1 bg-gold-champagne/10 rounded border border-gold-border/20"
                    style={{ transform: "translateZ(25px)" }}
                  >
                    <span className="text-[8px] uppercase tracking-wider text-gold-champagne font-semibold font-mono">
                      {brandName}
                    </span>
                  </div>
                </div>

                {/* Content Area with preserve-3d layers */}
                <div className="p-6 flex-1 flex flex-col justify-between" style={{ transform: "translateZ(30px)", transformStyle: "preserve-3d" }}>
                  <div className="space-y-4" style={{ transformStyle: "preserve-3d" }}>
                    {/* Rating & Category (translateZ 10px) */}
                    <div className="flex items-center justify-between" style={{ transform: "translateZ(10px)" }}>
                      <span className="text-[9px] uppercase tracking-widest text-muted-gray font-mono">
                        {camera.categoryId === "c1000000-0000-0000-0000-000000000003" ? "Cinema Line" : "Mirrorless Body"}
                      </span>
                      <div className="flex items-center gap-1">
                        <Star size={10} className="fill-gold text-gold" />
                        <span className="text-[9px] font-mono text-gold-champagne font-semibold mt-0.5">{camera.rating}</span>
                      </div>
                    </div>

                    {/* Camera Title (translateZ 25px) */}
                    <Link
                      href={`/gear/${camera.slug}`}
                      className="block"
                      style={{ transform: "translateZ(25px)" }}
                    >
                      <h3 className="serif-heading text-xl md:text-2xl font-light text-ivory group-hover:text-gold transition-colors duration-300">
                        {camera.name}
                      </h3>
                    </Link>

                    {/* Specifications Grid (translateZ 15px) */}
                    <div className="grid grid-cols-2 gap-3 pt-2" style={{ transform: "translateZ(15px)" }}>
                      <div className="space-y-0.5">
                        <span className="text-[8px] text-muted-gray uppercase font-mono block">Sensor</span>
                        <span className="text-[10px] text-ivory/90 truncate block">{camera.specs.sensor || "Full-Frame"}</span>
                      </div>
                      <div className="space-y-0.5">
                        <span className="text-[8px] text-muted-gray uppercase font-mono block">Video Capture</span>
                        <span className="text-[10px] text-ivory/90 truncate block">{camera.specs.video || "4K Broadcast"}</span>
                      </div>
                      <div className="space-y-0.5">
                        <span className="text-[8px] text-muted-gray uppercase font-mono block">ISO Range</span>
                        <span className="text-[10px] text-ivory/90 truncate block">{camera.specs.iso || "Auto"}</span>
                      </div>
                      <div className="space-y-0.5">
                        <span className="text-[8px] text-muted-gray uppercase font-mono block">Body Weight</span>
                        <span className="text-[10px] text-ivory/90 truncate block">{camera.specs.weight || "N/A"}</span>
                      </div>
                    </div>
                  </div>

                  {/* Pricing and Action Buttons (translateZ 20px + preserve-3d) */}
                  <div className="pt-5 border-t border-white/5 flex flex-col space-y-4" style={{ transform: "translateZ(20px)", transformStyle: "preserve-3d" }}>
                    <div className="flex items-baseline justify-between" style={{ transform: "translateZ(10px)" }}>
                      <span className="text-[9px] text-muted-gray uppercase font-mono">Daily Rate</span>
                      <span className="text-base font-semibold text-gold-champagne">
                        ₹{camera.dailyPrice.toLocaleString("en-IN")} <span className="text-[9px] text-muted-gray font-normal">/ day</span>
                      </span>
                    </div>

                    {/* Action buttons with magnetic pointer attraction (translateZ 40px) */}
                    <div className="grid grid-cols-2 gap-3" style={{ transformStyle: "preserve-3d" }}>
                      <Link
                        href={`/gear/${camera.slug}`}
                        onMouseMove={handleMagneticMove}
                        onMouseLeave={handleMagneticLeave}
                        className="py-2.5 bg-transparent hover:bg-white/[0.03] text-ivory hover:text-gold text-[10px] font-bold uppercase tracking-wider rounded border border-white/10 hover:border-gold-champagne transition flex items-center justify-center gap-1.5 cursor-pointer"
                        style={{
                          transform: "translateZ(40px)",
                          willChange: "transform",
                          transition: "transform 0.15s ease-out, border-color 0.3s ease, background-color 0.3s ease, color 0.3s ease"
                        }}
                      >
                        <Eye size={12} />
                        Details
                      </Link>
                      <button
                        onClick={() => handleBookDirect(camera)}
                        onMouseMove={handleMagneticMove}
                        onMouseLeave={handleMagneticLeave}
                        className="py-2.5 bg-gold-champagne hover:bg-gold-warm text-obsidian text-[10px] font-bold uppercase tracking-wider rounded transition flex items-center justify-center gap-1.5 cursor-pointer shadow-lg shadow-gold-champagne/10"
                        style={{
                          transform: "translateZ(40px)",
                          willChange: "transform",
                          transition: "transform 0.15s ease-out, background-color 0.3s ease"
                        }}
                      >
                        Rent Now
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. Redesigned Gear-Category Explorer */}
      <section
        id="categories"
        ref={categoriesSectionRef}
        data-reveal
        className="reveal-section py-28 px-6 md:px-12 bg-charcoal border-t border-b border-white/5 relative z-20 overflow-hidden"
      >
        {/* Subtle background light reflection */}
        <div className="absolute inset-0 bg-radial-gradient(circle at 20% 80%, rgba(216, 179, 106, 0.03) 0%, transparent 60%) pointer-events-none" />

        <div className="max-w-7xl mx-auto space-y-16 relative z-10">
          <div className="text-center space-y-3 max-w-xl mx-auto">
            <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-gold-champagne font-mono block">
              CURATED VAULTS
            </span>
            <h2 className="serif-heading text-3xl md:text-5xl font-light text-ivory tracking-tight">
              Explore by <span className="text-gold">Category</span>
            </h2>
            <p className="text-xs md:text-sm text-muted-gray font-light leading-relaxed">
              Everything you need for professional production.
            </p>
          </div>

          {/* Cards Grid / Mobile Swipe container */}
          <div
            className="flex md:grid md:grid-cols-4 gap-6 overflow-x-auto md:overflow-x-visible snap-x snap-mandatory scrollbar-none pb-8 md:pb-0"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {categories.map((cat) => (
              <Link
                key={cat.slug}
                href={`/explore?category=${cat.slug}`}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
                className="category-card-anim premium-surface opacity-0 min-w-[250px] sm:min-w-[290px] md:min-w-0 snap-center relative h-96 rounded-xl overflow-hidden border border-white/5 group shadow-2xl flex flex-col justify-end transition-all duration-300"
                style={{
                  transformStyle: "preserve-3d",
                  willChange: "transform",
                  transition: "transform 0.1s ease-out, border-color 0.3s ease, box-shadow 0.3s ease"
                }}
              >
                {/* Real-time pointer sheen/reflection overlay */}
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-30"
                  style={{
                    background: "radial-gradient(circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(255, 255, 255, 0.08) 0%, transparent 60%)"
                  }}
                />

                {/* Background Image Container with 3D Depth Layer */}
                <div className="absolute inset-0 z-0" style={{ transform: "translateZ(10px)", transformStyle: "preserve-3d" }}>
                  <Image
                    src={cat.imageUrl}
                    alt={cat.name}
                    fill
                    sizes="(max-width: 767px) 78vw, 25vw"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 filter brightness-[0.75] contrast-[1.05]"
                  />
                  {/* Subtle glass reflection overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/35 to-transparent z-10" />
                </div>

                {/* Inner Content overlay card with preserve-3d layers */}
                <div className="p-6 relative z-20 space-y-3" style={{ transform: "translateZ(30px)", transformStyle: "preserve-3d" }}>
                  <div className="space-y-1 text-left" style={{ transform: "translateZ(15px)" }}>
                    <span className="text-[8px] font-mono uppercase text-gold-champagne tracking-widest block">
                      {cat.count}
                    </span>
                    <h3 className="serif-heading text-lg md:text-xl font-light text-ivory group-hover:text-gold transition-colors duration-300">
                      {cat.name}
                    </h3>
                  </div>

                  {/* Explore button with magnetic pointer attraction (translateZ 40px) */}
                  <div
                    onMouseMove={handleMagneticMove}
                    onMouseLeave={handleMagneticLeave}
                    className="pt-2 border-t border-white/10 flex items-center justify-between text-[10px] uppercase font-bold tracking-widest text-gold-champagne group-hover:text-gold-warm transition-all duration-300"
                    style={{
                      transform: "translateZ(40px)",
                      willChange: "transform"
                    }}
                  >
                    <span>Explore</span>
                    <ArrowRight size={14} className="transition-transform duration-300 group-hover:translate-x-1" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Interactive Showroom */}
      <section data-reveal className="reveal-section py-24 px-6 md:px-12 max-w-7xl mx-auto relative z-20">
        <div className="space-y-4 mb-10 text-left">
          <span className="text-[10px] font-semibold uppercase tracking-[0.25em] text-gold-champagne font-mono block">
            Digital Showroom
          </span>
          <h2 className="serif-heading text-3xl md:text-5xl font-light text-ivory">
            Interactive <span className="text-gold">3D Optics Showroom</span>
          </h2>
          <p className="text-sm text-muted-gray max-w-xl font-light leading-relaxed">
            Examine our high-performance flagship cameras programmatically mapped in absolute luxury precision.
          </p>
        </div>

        <CameraShowroom />
      </section>

      {/* 6. Rental Process Timeline */}
      <section data-reveal className="reveal-section py-24 px-6 md:px-12 bg-rich-black/30 border-t border-b border-white/5 relative z-20">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

          <div className="lg:col-span-4 space-y-4">
            <span className="text-[10px] font-semibold uppercase tracking-[0.25em] text-gold-champagne font-mono block">
              Bespoke Service
            </span>
            <h2 className="serif-heading text-3xl md:text-4xl font-light text-ivory">
              The Rental <span className="text-gold">Process</span>
            </h2>
            <p className="text-xs text-muted-gray leading-relaxed font-light">
              Experience a streamlined rental workflow designed for cinematic professionals and luxury creators.
            </p>
          </div>

          <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { step: "01", title: "Select Gear", desc: "Browse our luxury vault, configure options, and choose dates." },
              { step: "02", title: "Verify availability", desc: "Our real-time engine validates calendar slots and secures stock." },
              { step: "03", title: "Concierge Pick", desc: "Pick up from our studio or opt for secure delivery in Pelican flight cases." },
            ].map((item) => (
              <div key={item.step} className="premium-surface glass-panel border-white/5 p-6 rounded-xl space-y-4">
                <span className="serif-heading text-3xl font-light text-gold-champagne font-mono">{item.step}</span>
                <h3 className="serif-heading text-base font-semibold text-ivory">{item.title}</h3>
                <p className="text-xs text-muted-gray leading-normal font-light">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. Why Choose Aurevia */}
      <section data-reveal className="reveal-section py-24 px-6 md:px-12 max-w-7xl mx-auto relative z-20">
        <div className="text-center space-y-2 mb-12 max-w-xl mx-auto">
          <span className="text-[10px] font-semibold uppercase tracking-[0.25em] text-gold-champagne font-mono block">
            Core Values
          </span>
          <h2 className="serif-heading text-3xl md:text-4xl font-light text-ivory">
            Why Rent From <span className="text-gold">AUREVIA</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="premium-surface glass-panel border-white/5 p-8 rounded-xl space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-gold-champagne/10 text-gold-champagne flex items-center justify-center mx-auto"><ShieldCheck size={22} /></div>
            <h3 className="serif-heading text-lg font-light text-ivory">100% Inspected Optics</h3>
            <p className="text-xs text-muted-gray leading-relaxed font-light">Every lens element and sensor is thoroughly cleaned and tested before dispatch to guarantee zero optical artifacts.</p>
          </div>

          <div className="premium-surface glass-panel border-white/5 p-8 rounded-xl space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-gold-champagne/10 text-gold-champagne flex items-center justify-center mx-auto"><TrendingUp size={22} /></div>
            <h3 className="serif-heading text-lg font-light text-ivory">Damage Waiver Policies</h3>
            <p className="text-xs text-muted-gray leading-relaxed font-light">Accidents happen. We offer optional damage waiver policies during checkout to keep your production runs protected.</p>
          </div>

          <div className="premium-surface glass-panel border-white/5 p-8 rounded-xl space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-gold-champagne/10 text-gold-champagne flex items-center justify-center mx-auto"><Clock size={22} /></div>
            <h3 className="serif-heading text-lg font-light text-ivory">24/7 Concierge Hotline</h3>
            <p className="text-xs text-muted-gray leading-relaxed font-light">Get custom support directly from Prem (9686909048) on location pickups, setup questions, or last-minute extensions.</p>
          </div>
        </div>
      </section>

      {/* 8. Cinematic MP4 Showcase */}
      <section data-reveal className="reveal-section relative py-24 bg-black border-t border-b border-white/5 z-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black z-10" />
        <div className="max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-20">
          <div className="space-y-6">
            <span className="text-[10px] font-semibold uppercase tracking-[0.25em] text-gold-champagne font-mono block">
              Cinematic Commercial
            </span>
            <h2 className="serif-heading text-3xl md:text-5xl font-light text-ivory">
              Frame the <span className="text-gold">Extraordinary</span>
            </h2>
            <p className="text-sm text-muted-gray font-light leading-relaxed">
              Capture cinematic quality matching high-end advertising. Take a look at the commercial footage showcasing the precision engineering of the Canon system.
            </p>
          </div>

          <div className="aspect-video w-full rounded overflow-hidden border border-white/10 shadow-2xl relative">
            <video
              className="w-full h-full object-cover"
              src="/assets/videos/canonvideo.mp4"
              controls
              muted
              playsInline
            />
          </div>
        </div>
      </section>

      {/* 12. Trust Safeguards & Verified Reviews */}
      <section data-reveal className="reveal-section py-24 px-6 md:px-12 max-w-7xl mx-auto relative z-20 space-y-16">

        {/* Trust Badges */}
        <div className="glass-panel border-white/5 rounded-lg p-8 md:p-10 space-y-8 bg-black/40">
          <div className="text-center space-y-2">
            <span className="text-[10px] font-semibold uppercase tracking-[0.25em] text-gold-champagne font-mono block">Our Guarantee</span>
            <h3 className="serif-heading text-2xl md:text-3xl font-light text-ivory">Professional Renter Safeguards</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-xs font-light">
            <div className="space-y-2 text-center p-4">
              <CheckCircle2 aria-hidden="true" size={24} className="mx-auto text-gold-champagne" />
              <h4 className="font-semibold text-ivory">Pre-Rental Inspection</h4>
              <p className="text-[11px] text-muted-gray leading-relaxed">Sensors are swabbed and systems calibrated before every pickup.</p>
            </div>
            <div className="space-y-2 text-center p-4">
              <CheckCircle2 aria-hidden="true" size={24} className="mx-auto text-gold-champagne" />
              <h4 className="font-semibold text-ivory">Zero Security Deposit</h4>
              <p className="text-[11px] text-muted-gray leading-relaxed">Absolute trust. Rent without locking capital on security deposits.</p>
            </div>
            <div className="space-y-2 text-center p-4">
              <CheckCircle2 aria-hidden="true" size={24} className="mx-auto text-gold-champagne" />
              <h4 className="font-semibold text-ivory">Secure Payments</h4>
              <p className="text-[11px] text-muted-gray leading-relaxed">Processed safely through SSL-secured Razorpay payment gateway channels.</p>
            </div>
            <div className="space-y-2 text-center p-4">
              <CheckCircle2 aria-hidden="true" size={24} className="mx-auto text-gold-champagne" />
              <h4 className="font-semibold text-ivory">Transparent Damage Rules</h4>
              <p className="text-[11px] text-muted-gray leading-relaxed">We evaluate repair costs honestly using official manufacturer quotes.</p>
            </div>
          </div>
        </div>

        {/* Reviews List */}
        <div className="space-y-8">
          <div className="text-center space-y-2">
            <span className="text-[10px] font-semibold uppercase tracking-[0.25em] text-gold-champagne font-mono block">Renter Reviews</span>
            <h2 className="serif-heading text-3xl md:text-4xl font-light text-ivory">Trusted by Visual Creators</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {reviewsList.map((t) => (
              <div key={t.id} className="glass-panel border-white/5 p-6 rounded-lg flex flex-col justify-between space-y-4">
                <div className="flex justify-between items-center text-xs">
                  <span className="serif-heading font-medium text-ivory">{t.authorName}</span>
                  <span className="flex gap-0.5 text-gold-champagne" aria-label={`${t.rating} out of 5 stars`}>
                    {Array.from({ length: 5 }, (_, index) => (
                      <Star
                        key={index}
                        aria-hidden="true"
                        size={13}
                        className={index < t.rating ? "fill-current" : "opacity-25"}
                      />
                    ))}
                  </span>
                </div>
                <p className="text-xs text-muted-gray italic leading-relaxed font-light">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div className="text-[8px] font-mono text-muted-gray/50 uppercase">Verified Renter</div>
              </div>
            ))}
          </div>
        </div>

        {/* Submit Review */}
        <div className="max-w-xl mx-auto glass-panel border-white/5 rounded-lg p-6 space-y-4">
          <h4 className="serif-heading text-lg font-light text-ivory text-center">Share Your Feedback</h4>
          {revSuccess ? (
            <div className="text-xs text-emerald-400 font-mono text-center bg-emerald-500/10 p-3 border border-emerald-500/20 rounded">
              Review submitted! It will appear on the homepage once approved by Prem.
            </div>
          ) : (
            <form onSubmit={async (e) => {
              e.preventDefault();
              if (!revName || !revQuote) return;
              await db.submitReview({
                productId: "p1000000-0000-0000-0000-000000000001", // Default to Canon
                authorName: revName,
                rating: revRating,
                quote: revQuote
              });
              setRevSuccess(true);
              setRevName("");
              setRevQuote("");
            }} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[9px] font-mono text-muted-gray uppercase">Your Name</label>
                  <input
                    type="text"
                    required
                    value={revName}
                    onChange={(e) => setRevName(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 text-xs rounded p-2 focus:outline-none focus:border-gold-champagne/40"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-mono text-muted-gray uppercase">Rating</label>
                  <select
                    value={revRating}
                    onChange={(e) => setRevRating(Number(e.target.value))}
                    className="w-full bg-white/5 border border-white/10 text-xs rounded p-2 focus:outline-none text-ivory"
                  >
                    {[5, 4, 3, 2, 1].map(r => (
                      <option key={r} value={r} className="bg-obsidian text-ivory">{r} Stars</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-mono text-muted-gray uppercase">Review Comments</label>
                <textarea
                  required
                  rows={3}
                  value={revQuote}
                  onChange={(e) => setRevQuote(e.target.value)}
                  placeholder="Tell us about the rental process, support, or camera performance..."
                  className="w-full bg-white/5 border border-white/10 text-xs rounded p-2 focus:outline-none focus:border-gold-champagne/40 resize-none"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2.5 bg-gold-champagne hover:bg-gold-warm text-obsidian text-[10px] font-bold uppercase tracking-wider rounded transition cursor-pointer"
              >
                Submit Review
              </button>
            </form>
          )}
        </div>
      </section>

      {/* 13. How It Works Timeline */}
      <Timeline />

      {/* 14. FAQ Accordion */}
      <section data-reveal className="reveal-section py-24 px-6 md:px-12 bg-charcoal/30 border-t border-b border-white/5 relative z-20">
        <div className="max-w-4xl mx-auto space-y-12">
          <div className="text-center space-y-2">
            <span className="text-[10px] font-semibold uppercase tracking-[0.25em] text-gold-champagne font-mono block">
              Got Questions?
            </span>
            <h2 className="serif-heading text-3xl md:text-4xl font-light text-ivory">
              Frequently Asked <span className="text-gold-champagne font-normal">Questions</span>
            </h2>
          </div>

          <AnimatedAccordion items={faqsList.length > 0 ? faqsList : MOCK_FAQS} />
        </div>
      </section>

      {/* 15. Premium Booking CTA */}
      <section data-reveal className="reveal-section py-28 px-6 md:px-12 max-w-7xl mx-auto text-center relative z-20">
        <div className="premium-surface glass-panel-gold border-gold-border rounded-2xl p-10 md:p-16 space-y-8 shadow-2xl relative overflow-hidden max-w-4xl mx-auto">
          {/* Volumetric glow overlay */}
          <div className="absolute inset-0 gold-glow opacity-30 pointer-events-none" />

          <div className="space-y-3 relative z-10">
            <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-gold-champagne font-mono block">
              Reserve Your Optics Vault
            </span>
            <h2 className="serif-heading text-3xl md:text-5xl font-light text-ivory leading-tight">
              Ready to Capture the <br /><span className="text-gold font-light">Extraordinary?</span>
            </h2>
            <p className="text-xs sm:text-sm text-muted-gray max-w-lg mx-auto font-light leading-relaxed">
              Book professional bodies and lenses with secure online payment and pickup. Experience the AUREVIA difference.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-4 relative z-10 pt-2">
            <button
              onClick={() => router.push("/explore")}
              className="px-8 py-3.5 bg-gold-champagne hover:bg-gold-warm text-obsidian text-xs font-bold uppercase tracking-wider rounded shadow-lg shadow-gold-champagne/10 transition cursor-pointer"
            >
              Explore Equipment
            </button>

            <button
              onClick={() => router.push("/booking")}
              className="px-8 py-3.5 bg-transparent border border-white/20 hover:border-gold-champagne hover:text-gold-champagne text-ivory text-xs font-semibold uppercase tracking-wider rounded transition cursor-pointer"
            >
              Book Direct Now
            </button>
          </div>
        </div>
      </section>

      {/* 16. Luxury Footer */}
      <footer className="bg-black border-t border-white/5 py-16 px-6 md:px-12 relative z-20">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 pb-12 border-b border-white/5">

          {/* Brand & owner contact */}
          <div className="space-y-4 lg:col-span-1">
            <Logo variant="wordmark" theme="light" width={130} height={35} />
            <p className="text-xs text-muted-gray font-light leading-relaxed mt-2">
              Premium Camera Rentals by Prem Mundargi.<br />Frame the Extraordinary.
            </p>
            <div className="space-y-1.5 text-[11px] font-mono">
              <p className="text-gold-champagne uppercase tracking-wider text-[10px] mb-2">Rental Enquiries</p>
              <a href="tel:+919686909048" className="flex items-center gap-2 text-muted-gray hover:text-gold-champagne transition">
                <Phone aria-hidden="true" size={15} className="shrink-0 text-gold-champagne/60" /> +91 96869 09048
              </a>
              <a
                href="https://wa.me/919686909048"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-muted-gray hover:text-[#25D366] transition"
              >
                <MessageCircle aria-hidden="true" size={15} className="shrink-0" /> WhatsApp Prem
              </a>
              <a href="mailto:premmundargi135@gmail.com" className="flex items-center gap-2 text-muted-gray hover:text-gold-champagne transition break-all">
                <Mail aria-hidden="true" size={15} className="shrink-0 text-gold-champagne/60" /> premmundargi135@gmail.com
              </a>
            </div>
          </div>

          {/* Vault Gear links */}
          <div className="space-y-3 text-xs">
            <h4 className="font-semibold text-gold-champagne uppercase font-mono tracking-wider">Vault Gear</h4>
            <div className="flex flex-col gap-2 font-light text-muted-gray">
              <Link href="/explore?category=dslr-cameras" className="hover:text-gold-champagne transition">DSLR Cameras</Link>
              <Link href="/explore?category=mirrorless-cameras" className="hover:text-gold-champagne transition">Mirrorless Cameras</Link>
              <Link href="/explore?category=cinema-cameras" className="hover:text-gold-champagne transition">Cinema Systems</Link>
              <Link href="/explore?category=professional-lenses" className="hover:text-gold-champagne transition">L-Series Glass</Link>
              <Link href="/explore?category=gimbals" className="hover:text-gold-champagne transition">Gimbals</Link>
              <Link href="/explore?category=lighting" className="hover:text-gold-champagne transition">Lighting</Link>
            </div>
          </div>

          {/* Client care links */}
          <div className="space-y-3 text-xs">
            <h4 className="font-semibold text-gold-champagne uppercase font-mono tracking-wider">Client Care</h4>
            <div className="flex flex-col gap-2 font-light text-muted-gray">
              <Link href="/contact" className="hover:text-gold-champagne transition">Contact Us</Link>
              <Link href="/faq" className="hover:text-gold-champagne transition">FAQ Help</Link>
              <Link href="/rental-process" className="hover:text-gold-champagne transition">Rental Guidelines</Link>
              <Link href="/about" className="hover:text-gold-champagne transition">About AUREVIA</Link>
              <Link href="/terms" className="hover:text-gold-champagne transition">Terms of Use</Link>
              <Link href="/privacy" className="hover:text-gold-champagne transition">Privacy Policy</Link>
            </div>
          </div>

          {/* My Account & Help */}
          <div className="space-y-4 text-xs">
            <div className="space-y-3">
              <h4 className="font-semibold text-gold-champagne uppercase font-mono tracking-wider">Account &amp; Support</h4>
              <div className="flex flex-col gap-2 font-light text-muted-gray">
                <Link href="/login" className="hover:text-gold-champagne transition">Customer Sign In</Link>
                <Link href="/dashboard" className="hover:text-gold-champagne transition">Customer Dashboard</Link>
                <Link href="/contact" className="hover:text-gold-champagne transition">Concierge Support</Link>
              </div>
            </div>

            {/* Technical support attribution */}
            <div className="pt-3 border-t border-white/5 space-y-1.5">
              <p className="text-[10px] uppercase font-mono tracking-wider text-muted-gray/60">Technical Support</p>
              <a href="mailto:sachiii8827@gmail.com" className="text-[11px] font-mono text-muted-gray hover:text-ivory/70 transition break-all">
                sachiii8827@gmail.com
              </a>
              <p className="text-[10px] text-muted-gray/50 font-light">Website issues &amp; maintenance only</p>
            </div>
          </div>
        </div>

        {/* Footer bottom bar */}
        <div className="max-w-7xl mx-auto pt-8 flex flex-col sm:flex-row justify-between items-center gap-3 text-center font-mono text-[9px] text-muted-gray uppercase tracking-widest">
          <span>© 2026 AUREVIA Camera Rentals. All Rights Reserved.</span>
          <span className="text-muted-gray/50">
            Business: Prem Mundargi · Website: Sachin
          </span>
        </div>
      </footer>

      {/* Floating Scroll to Top Widget (Positioned on the Left to avoid right-side action triggers) */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        className={`fixed bottom-8 left-8 z-40 p-3.5 rounded-full bg-gold-champagne/10 border border-gold-champagne/30 text-gold-champagne backdrop-blur-md transition-all duration-300 hover:scale-110 hover:bg-gold-champagne hover:text-obsidian shadow-xl ${showScrollTop ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6 pointer-events-none"
          }`}
        aria-label="Scroll to top"
      >
        <ChevronUp size={18} />
      </button>
    </main>
  );
}
