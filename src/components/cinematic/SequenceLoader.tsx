"use client";

import React from "react";
import { motion } from "motion/react";

interface SequenceLoaderProps {
  progressPct: number;
}

export default function SequenceLoader({ progressPct }: SequenceLoaderProps) {
  return (
    <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-obsidian text-ivory">
      {/* Volumetric glow background */}
      <div className="absolute w-[400px] h-[400px] rounded-full bg-gold-champagne/10 blur-[140px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative z-10 flex flex-col items-center text-center space-y-6"
      >
        <div className="relative flex items-center justify-center">
          <div className="w-20 h-20 rounded-full border border-gold-champagne/20 border-t-gold-champagne animate-spin" />
          <span className="absolute font-mono text-[10px] font-bold text-gold-champagne tracking-widest uppercase">
            AV
          </span>
        </div>

        <div className="space-y-1">
          <h2 className="serif-heading text-2xl tracking-widest text-ivory font-light">AUREVIA</h2>
          <p className="text-[10px] uppercase tracking-[0.3em] text-muted-gray font-mono">
            Preparing the Frame
          </p>
        </div>

        <div className="w-56 h-[1.5px] bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-gold-champagne transition-all duration-300 ease-out"
            style={{ width: `${progressPct}%` }}
          />
        </div>

        <span className="font-mono text-[10px] text-gold-champagne/80 tracking-widest">
          {progressPct}%
        </span>
      </motion.div>
    </div>
  );
}
