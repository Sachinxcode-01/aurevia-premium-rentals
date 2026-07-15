"use client";

import React, { useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import Navbar from "@/components/navigation/Navbar";
import HeroScrollSequence from "@/components/hero/HeroScrollSequence";
import { useCart } from "@/hooks/useCart";
import { MOCK_PRODUCTS, MOCK_TESTIMONIALS, MOCK_FAQS, MOCK_BRANDS } from "@/lib/db/mockData";
import { animate, stagger } from "animejs";
import {
  Camera,
  Layers,
  Sparkles,
  ShieldCheck,
  TrendingUp,
  Clock,
  ArrowRight,
  MessageCircle,
  HelpCircle,
  Star,
  Eye,
} from "lucide-react";

// Dynamically import Three.js scene to protect initial Hero load speeds
const CameraShowroom = dynamic(
  () => import("@/components/three/CameraShowroom"),
  { ssr: false, loading: () => <div className="h-[550px] flex items-center justify-center font-mono text-xs text-muted-gray bg-black/20 rounded">LOADING 3D LIGHTS & MATERIALS...</div> }
);

export default function Home() {
  const router = useRouter();
  const { cart, addToCart } = useCart();

  const featuredGear = MOCK_PRODUCTS.filter((p) => p.isFeatured).slice(0, 3);
  const mostRented = MOCK_PRODUCTS.slice(0, 4);

  const featuredSectionRef = useRef<HTMLDivElement>(null);

  const featuredCameras = MOCK_PRODUCTS.filter(
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
      imageUrl: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=600&auto=format&fit=crop",
    },
    {
      name: "Mirrorless Cameras",
      slug: "mirrorless-cameras",
      count: "25 Bodies",
      imageUrl: "https://images.unsplash.com/photo-1616423643768-7c458787c88b?q=80&w=600&auto=format&fit=crop",
    },
    {
      name: "Cinema Cameras",
      slug: "cinema-cameras",
      count: "8 Systems",
      imageUrl: "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?q=80&w=600&auto=format&fit=crop",
    },
    {
      name: "Professional Lenses",
      slug: "professional-lenses",
      count: "40 Lenses",
      imageUrl: "https://images.unsplash.com/photo-1617005082133-548c4dd27f35?q=80&w=600&auto=format&fit=crop",
    },
    {
      name: "Gimbals & Stabilizers",
      slug: "gimbals",
      count: "6 Stabilizers",
      imageUrl: "https://images.unsplash.com/photo-1590233464442-5132610b6ab4?q=80&w=600&auto=format&fit=crop",
    },
    {
      name: "Lighting Equipment",
      slug: "lighting",
      count: "15 Kits",
      imageUrl: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=600&auto=format&fit=crop",
    },
    {
      name: "Audio Gear",
      slug: "audio",
      count: "10 Systems",
      imageUrl: "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?q=80&w=600&auto=format&fit=crop",
    },
    {
      name: "Accessories",
      slug: "accessories",
      count: "30 Essentials",
      imageUrl: "https://images.unsplash.com/photo-1512790182412-b19e6d62bc39?q=80&w=600&auto=format&fit=crop",
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

  const handleBookDirect = (product: any) => {
    addToCart(product, 1, "2026-07-20", "2026-07-23", []);
    router.push("/booking");
  };

  return (
    <main className="relative min-h-screen bg-obsidian text-ivory overflow-x-hidden">
      {/* 1. Header Navigation */}
      <Navbar cartItemCount={cart.length} />

      {/* 2. Scroll Sequence Hero */}
      <HeroScrollSequence
        onExploreClick={() => router.push("/explore")}
        onBookClick={() => router.push("/booking")}
      />

      {/* Brand Highlights Ribbon */}
      <section className="relative border-t border-b border-white/5 bg-rich-black-lux z-20">
        <div className="max-w-7xl mx-auto px-6 py-12 md:py-16 grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
          <div className="flex flex-col items-center text-center space-y-2 group">
            <span className="serif-heading text-3xl md:text-4xl text-gold-champagne font-light tracking-tight group-hover:text-gold-warm transition-colors">50+</span>
            <span className="text-[10px] uppercase tracking-[0.2em] text-muted-gray font-mono font-medium">L-Series Optics</span>
          </div>
          <div className="flex flex-col items-center text-center space-y-2 group">
            <span className="serif-heading text-3xl md:text-4xl text-gold-champagne font-light tracking-tight group-hover:text-gold-warm transition-colors">100%</span>
            <span className="text-[10px] uppercase tracking-[0.2em] text-muted-gray font-mono font-medium">Sensor Sanitized</span>
          </div>
          <div className="flex flex-col items-center text-center space-y-2 group">
            <span className="serif-heading text-3xl md:text-4xl text-gold-champagne font-light tracking-tight group-hover:text-gold-warm transition-colors">Zero</span>
            <span className="text-[10px] uppercase tracking-[0.2em] text-muted-gray font-mono font-medium">Deposit Scheme</span>
          </div>
          <div className="flex flex-col items-center text-center space-y-2 group">
            <span className="serif-heading text-3xl md:text-4xl text-gold-champagne font-light tracking-tight group-hover:text-gold-warm transition-colors">Concierge</span>
            <span className="text-[10px] uppercase tracking-[0.2em] text-muted-gray font-mono font-medium">Pelican Delivery</span>
          </div>
        </div>
      </section>

      {/* 3. Redesigned Featured Professional Gear */}
      <section 
        ref={featuredSectionRef}
        className="relative py-28 px-6 md:px-12 bg-charcoal border-t border-b border-white/5 z-20 overflow-hidden"
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
                className="camera-card-anim opacity-0 min-w-[290px] sm:min-w-[350px] md:min-w-0 snap-center bg-obsidian/45 backdrop-blur-md border border-white/5 rounded-lg overflow-hidden flex flex-col justify-between h-[520px] group shadow-2xl transition-all duration-300"
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
                  <img
                    src={camera.imagePrimary}
                    alt={camera.name}
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
        className="py-28 px-6 md:px-12 bg-charcoal border-t border-b border-white/5 relative z-20 overflow-hidden"
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
                className="category-card-anim opacity-0 min-w-[250px] sm:min-w-[290px] md:min-w-0 snap-center relative h-96 rounded-lg overflow-hidden border border-white/5 group shadow-2xl flex flex-col justify-end transition-all duration-300"
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
                  <img
                    src={cat.imageUrl}
                    alt={cat.name}
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
                    <span className="transform group-hover:translate-x-1 transition-transform duration-300 font-semibold font-mono">→</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Interactive Showroom */}
      <section className="py-24 px-6 md:px-12 max-w-7xl mx-auto relative z-20">
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
      <section className="py-24 px-6 md:px-12 bg-rich-black/30 border-t border-b border-white/5 relative z-20">
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
              <div key={item.step} className="glass-panel border-white/5 p-6 rounded-lg space-y-4">
                <span className="serif-heading text-3xl font-light text-gold-champagne font-mono">{item.step}</span>
                <h3 className="serif-heading text-base font-semibold text-ivory">{item.title}</h3>
                <p className="text-xs text-muted-gray leading-normal font-light">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. Why Choose Aurevia */}
      <section className="py-24 px-6 md:px-12 max-w-7xl mx-auto relative z-20">
        <div className="text-center space-y-2 mb-12 max-w-xl mx-auto">
          <span className="text-[10px] font-semibold uppercase tracking-[0.25em] text-gold-champagne font-mono block">
            Core Values
          </span>
          <h2 className="serif-heading text-3xl md:text-4xl font-light text-ivory">
            Why Rent From <span className="text-gold">AUREVIA</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="glass-panel border-white/5 p-8 rounded-lg space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-gold-champagne/10 text-gold-champagne flex items-center justify-center mx-auto"><ShieldCheck size={22} /></div>
            <h3 className="serif-heading text-lg font-light text-ivory">100% Inspected Optics</h3>
            <p className="text-xs text-muted-gray leading-relaxed font-light">Every lens element and sensor is thoroughly cleaned and tested before dispatch to guarantee zero optical artifacts.</p>
          </div>

          <div className="glass-panel border-white/5 p-8 rounded-lg space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-gold-champagne/10 text-gold-champagne flex items-center justify-center mx-auto"><TrendingUp size={22} /></div>
            <h3 className="serif-heading text-lg font-light text-ivory">Damage Waiver Policies</h3>
            <p className="text-xs text-muted-gray leading-relaxed font-light">Accidents happen. We offer optional damage waiver policies during checkout to keep your production runs protected.</p>
          </div>

          <div className="glass-panel border-white/5 p-8 rounded-lg space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-gold-champagne/10 text-gold-champagne flex items-center justify-center mx-auto"><Clock size={22} /></div>
            <h3 className="serif-heading text-lg font-light text-ivory">24/7 Concierge Hotline</h3>
            <p className="text-xs text-muted-gray leading-relaxed font-light">Get custom support directly from Prem (9686909048) on location pickups, setup questions, or last-minute extensions.</p>
          </div>
        </div>
      </section>

      {/* 8. Cinematic MP4 Showcase */}
      <section className="relative py-24 bg-black border-t border-b border-white/5 z-20 overflow-hidden">
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

      {/* 12. Testimonials */}
      <section className="py-24 px-6 md:px-12 max-w-7xl mx-auto relative z-20">
        <div className="text-center space-y-2 mb-12">
          <span className="text-[10px] font-semibold uppercase tracking-[0.25em] text-gold-champagne font-mono block">
            Renter Reviews
          </span>
          <h2 className="serif-heading text-3xl md:text-4xl font-light text-ivory">
            Trusted by <span className="text-gold">Visual Creators</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {MOCK_TESTIMONIALS.map((t) => (
            <div key={t.id} className="glass-panel border-white/5 p-6 rounded-lg flex flex-col justify-between space-y-6">
              <p className="text-xs text-muted-gray italic leading-relaxed font-light">
                &ldquo;{t.quote}&rdquo;
              </p>
              <div className="border-t border-white/5 pt-4">
                <h4 className="serif-heading text-sm text-ivory">{t.authorName}</h4>
                <span className="text-[9px] uppercase tracking-wider text-gold-champagne font-mono font-medium block mt-0.5">{t.authorTitle}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 14. FAQ Accordion */}
      <section className="py-24 px-6 md:px-12 bg-rich-black/30 border-t border-b border-white/5 relative z-20">
        <div className="max-w-4xl mx-auto space-y-12">
          <div className="text-center space-y-2">
            <span className="text-[10px] font-semibold uppercase tracking-[0.25em] text-gold-champagne font-mono block">
              Got Questions?
            </span>
            <h2 className="serif-heading text-3xl md:text-4xl font-light text-ivory">
              Frequently Asked <span className="text-gold">Questions</span>
            </h2>
          </div>

          <div className="space-y-4">
            {MOCK_FAQS.map((faq) => (
              <details key={faq.id} className="group glass-panel border-white/5 rounded-lg p-5 [&_summary::-webkit-details-marker]:hidden transition-all duration-300">
                <summary className="flex justify-between items-center font-semibold text-xs uppercase tracking-wider text-ivory cursor-pointer select-none">
                  {faq.question}
                  <span className="text-gold-champagne group-open:rotate-180 transition-transform duration-300">
                    ▼
                  </span>
                </summary>
                <p className="text-xs text-muted-gray leading-relaxed font-light mt-3 pt-3 border-t border-white/5">
                  {faq.answer}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* 15. Premium Booking CTA */}
      <section className="py-28 px-6 md:px-12 max-w-7xl mx-auto text-center relative z-20">
        <div className="glass-panel-gold border-gold-border rounded-lg p-10 md:p-16 space-y-8 shadow-2xl relative overflow-hidden max-w-4xl mx-auto">
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
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 pb-12 border-b border-white/5">
          <div className="space-y-4">
            <h3 className="serif-heading text-xl font-bold tracking-widest text-ivory">AUREVIA</h3>
            <p className="text-xs text-muted-gray font-light">
              Premium Camera Rentals by Prem. Frame the Extraordinary.
            </p>
            <div className="text-[10px] font-mono text-muted-gray uppercase space-y-1">
              <p>Hotline: 9686909048</p>
              <p>Studio: Bangalore, India</p>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <h4 className="font-semibold text-gold-champagne uppercase font-mono tracking-wider">Vault Gear</h4>
            <div className="flex flex-col gap-2 font-light text-muted-gray">
              <Link href="/explore?category=dslr-cameras" className="hover:text-gold-champagne">DSLR Cameras</Link>
              <Link href="/explore?category=mirrorless-cameras" className="hover:text-gold-champagne">Mirrorless Cameras</Link>
              <Link href="/explore?category=cinema-cameras" className="hover:text-gold-champagne">Cinema Systems</Link>
              <Link href="/explore?category=professional-lenses" className="hover:text-gold-champagne">L-Series Glass</Link>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <h4 className="font-semibold text-gold-champagne uppercase font-mono tracking-wider">Client Care</h4>
            <div className="flex flex-col gap-2 font-light text-muted-gray">
              <Link href="/faq" className="hover:text-gold-champagne">FAQ Help</Link>
              <Link href="/rental-process" className="hover:text-gold-champagne">Rental Guidelines</Link>
              <Link href="/terms" className="hover:text-gold-champagne">Terms of Use</Link>
              <Link href="/privacy" className="hover:text-gold-champagne">Privacy Policy</Link>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <h4 className="font-semibold text-gold-champagne uppercase font-mono tracking-wider">Staff Terminal</h4>
            <div className="flex flex-col gap-2 font-light text-muted-gray">
              <Link href="/login" className="hover:text-gold-champagne">Admin Login</Link>
              <Link href="/admin" className="hover:text-gold-champagne">Operations Center</Link>
              <Link href="/dashboard" className="hover:text-gold-champagne">Customer Cockpit</Link>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-center font-mono text-[9px] text-muted-gray uppercase tracking-widest">
          <span>© 2026 AUREVIA CAMERA RENTALS. ALL RIGHTS RESERVED.</span>
          <span>CURATED BY PREM (9686909048)</span>
        </div>
      </footer>
    </main>
  );
}
