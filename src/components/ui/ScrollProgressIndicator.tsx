"use client";

import React, { useEffect, useState } from "react";
import { ChevronUp } from "lucide-react";

export default function ScrollProgressIndicator() {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight <= 0) return;
      const currentScroll = window.scrollY || window.pageYOffset;
      const progress = Math.min(100, Math.max(0, (currentScroll / totalHeight) * 100));

      setScrollProgress(progress);
      setIsVisible(currentScroll > 300);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // SVG Radial Progress Ring math
  const radius = 18;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (scrollProgress / 100) * circumference;

  return (
    <>
      {/* 1. Ultra-Luxury Fine Top Progress Bar */}
      <div className="fixed top-0 left-0 right-0 z-50 h-[2px] bg-transparent pointer-events-none">
        <div
          className="h-full bg-gradient-to-r from-gold-champagne/60 via-gold-champagne to-gold-warm origin-left transition-transform duration-100 ease-out shadow-[0_0_8px_rgba(216,179,106,0.8)]"
          style={{ transform: `scaleX(${scrollProgress / 100})` }}
        />
      </div>

      {/* 2. Floating Radial Scroll-to-Top Ring Widget (Bottom Left) */}
      <div
        className={`fixed bottom-8 left-8 z-40 transition-all duration-500 transform ${
          isVisible ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-6 scale-90 pointer-events-none"
        }`}
      >
        <button
          onClick={scrollToTop}
          className="group relative flex items-center justify-center w-12 h-12 rounded-full bg-obsidian/85 border border-white/10 hover:border-gold-champagne/50 backdrop-blur-md shadow-2xl transition-all duration-300 hover:scale-110 cursor-pointer"
          aria-label="Scroll to top"
        >
          {/* Circular SVG Progress Ring */}
          <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none" viewBox="0 0 44 44">
            <circle
              cx="22"
              cy="22"
              r={radius}
              className="stroke-white/10 fill-none"
              strokeWidth="2"
            />
            <circle
              cx="22"
              cy="22"
              r={radius}
              className="stroke-gold-champagne fill-none transition-all duration-150 ease-out"
              strokeWidth="2"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
            />
          </svg>

          {/* Icon & Scroll Percent tooltip */}
          <div className="relative z-10 text-gold-champagne group-hover:text-gold-warm transition-colors flex items-center justify-center">
            <ChevronUp size={18} className="transition-transform duration-300 group-hover:-translate-y-0.5" />
          </div>

          {/* Hover percent badge */}
          <span className="absolute -top-7 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 text-[9px] font-mono text-gold-champagne bg-black/90 px-2 py-0.5 rounded border border-white/10 whitespace-nowrap pointer-events-none">
            {Math.round(scrollProgress)}%
          </span>
        </button>
      </div>
    </>
  );
}
