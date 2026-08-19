"use client";

import React from "react";
import Image from "next/image";

interface AdminLogoProps {
  variant?: "wordmark" | "monogram" | "full";
  className?: string;
  width?: number;
  height?: number;
}

export function AdminLogo({
  variant = "full",
  className = "",
  width = 160,
  height = 42,
}: AdminLogoProps) {
  if (variant === "monogram") {
    return (
      <div className={`relative inline-flex items-center justify-center shrink-0 transition-transform duration-300 hover:scale-105 ${className}`}>
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#d8b36a]/20 via-black to-[#b98a43]/10 border border-[#d8b36a]/40 text-[#d8b36a] flex items-center justify-center font-bold font-serif text-base shadow-lg shadow-black/50">
          A
        </div>
      </div>
    );
  }

  if (variant === "wordmark") {
    return (
      <div
        className={`relative inline-flex items-center justify-center select-none shrink-0 transition-opacity duration-300 ${className}`}
        style={{ width, height }}
      >
        <Image
          src="/aurevia-logo.png"
          alt="AUREVIA Admin Console"
          width={width}
          height={height}
          priority
          className="object-contain w-full h-full"
        />
      </div>
    );
  }

  // Full variant: Official logo + Admin Console badge
  return (
    <div className={`flex items-center gap-3 select-none transition-opacity duration-300 ${className}`}>
      <div className="relative w-28 h-8 shrink-0">
        <Image
          src="/aurevia-logo.png"
          alt="AUREVIA Premium Camera Rentals"
          fill
          priority
          className="object-contain"
        />
      </div>
      <div className="h-6 w-px bg-white/10 hidden sm:block" />
      <div className="hidden sm:flex flex-col">
        <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-[#d8b36a] leading-none">
          ADMIN CONSOLE
        </span>
        <span className="text-[8px] font-mono text-gray-400 tracking-wider mt-0.5">
          Operations Hub
        </span>
      </div>
    </div>
  );
}
