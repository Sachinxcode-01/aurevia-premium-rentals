"use client";

import React from "react";
import Image from "next/image";
import { motion } from "motion/react";

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
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ scale: 1.05 }}
        transition={{ duration: 0.3 }}
        className={`relative inline-flex items-center justify-center shrink-0 ${className}`}
      >
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#d8b36a]/20 via-black to-[#b98a43]/10 border border-[#d8b36a]/40 text-[#d8b36a] flex items-center justify-center font-bold font-serif text-base shadow-lg shadow-black/50">
          A
        </div>
      </motion.div>
    );
  }

  if (variant === "wordmark") {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
        className={`relative inline-flex items-center justify-center select-none shrink-0 ${className}`}
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
      </motion.div>
    );
  }

  // Full variant: Official logo + Admin Console badge
  return (
    <motion.div
      initial={{ opacity: 0, y: -2 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={`flex items-center gap-3 select-none ${className}`}
    >
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
    </motion.div>
  );
}
