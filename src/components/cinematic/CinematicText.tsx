"use client";

import React from "react";
import MagneticButton from "@/components/motion/MagneticButton";
import { ArrowRight, Camera, Cpu, Layers, Sparkles } from "lucide-react";

interface CinematicTextProps {
  progress: number;
  onExploreClick?: () => void;
}

const clamp = (val: number, min = 0, max = 1) => Math.min(max, Math.max(min, val));
const range = (val: number, start: number, end: number) => {
  if (start === end) return 1;
  return clamp((val - start) / (end - start));
};
const smoothstep = (t: number) => t * t * (3 - 2 * t);

const getOpacity = (
  progress: number,
  inStart: number,
  inEnd: number,
  outStart: number,
  outEnd: number
) => {
  if (progress < inStart || progress > outEnd) return 0;
  if (progress >= inStart && progress <= inEnd) {
    if (inStart === inEnd) return 1;
    return smoothstep(range(progress, inStart, inEnd));
  }
  if (progress >= inEnd && progress <= outStart) return 1;
  if (outStart === outEnd) return 0;
  return 1 - smoothstep(range(progress, outStart, outEnd));
};

export default function CinematicText({ progress, onExploreClick }: CinematicTextProps) {
  // Calculated Opacities for smooth crossfading - Intro is 100% visible on first load (progress 0)
  const op1 = getOpacity(progress, 0, 0, 0.12, 0.16);
  const op2 = getOpacity(progress, 0.15, 0.20, 0.31, 0.36);
  const op3 = getOpacity(progress, 0.35, 0.40, 0.51, 0.56);
  const op4 = getOpacity(progress, 0.55, 0.60, 0.70, 0.75);
  const op5 = getOpacity(progress, 0.74, 0.79, 0.86, 0.90);
  const op6 = getOpacity(progress, 0.89, 0.94, 0.99, 1.0);

  // Transform translations
  const y1 = -range(progress, 0.12, 0.16) * 20;
  const x2 = (1 - range(progress, 0.15, 0.20)) * -40 + range(progress, 0.31, 0.36) * -30;
  const x3 = (1 - range(progress, 0.35, 0.40)) * 40 - range(progress, 0.51, 0.56) * 30;
  const y4 = (1 - range(progress, 0.55, 0.60)) * 35 - range(progress, 0.70, 0.75) * 25;
  const scale5 = 0.92 + range(progress, 0.74, 0.79) * 0.08 - range(progress, 0.86, 0.90) * 0.05;
  const y6 = (1 - range(progress, 0.89, 0.94)) * 30;

  return (
    <div className="absolute inset-0 pointer-events-none z-20 flex items-center justify-center px-6 md:px-16 overflow-hidden">
      {/* Region 1: Intro Presentation */}
      <div
        className="absolute top-1/4 text-center max-w-xl space-y-3 transition-opacity duration-75"
        style={{
          opacity: op1,
          transform: `translate3d(0, ${y1}px, 0)`,
          visibility: op1 < 0.01 ? "hidden" : "visible",
        }}
      >
        <span className="inline-flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-[0.4em] text-gold-champagne bg-gold-champagne/10 px-3.5 py-1 rounded-full border border-gold-champagne/20">
          <Sparkles size={11} /> AUREVIA PRESENTS
        </span>
        <h1 className="serif-heading text-4xl sm:text-6xl lg:text-7xl font-light text-ivory tracking-tight drop-shadow-2xl">
          CANON <span className="text-gold-champagne">EOS R5</span>
        </h1>
        <p className="text-xs uppercase tracking-[0.3em] text-muted-gray font-mono">
          The Cinema Vault Series
        </p>
      </div>

      {/* Region 2: Precision in Every Frame (Left aligned) */}
      <div
        className="absolute left-6 md:left-16 max-w-lg space-y-4 text-left transition-opacity duration-75"
        style={{
          opacity: op2,
          transform: `translate3d(${x2}px, 0, 0)`,
          visibility: op2 < 0.01 ? "hidden" : "visible",
        }}
      >
        <span className="inline-block text-[9px] font-semibold uppercase tracking-[0.3em] text-gold-champagne bg-gold-champagne/10 px-3 py-1 rounded-full border border-gold-champagne/20">
          01 • Masterclass Optics
        </span>
        <h2 className="serif-heading text-3xl sm:text-5xl font-light text-ivory leading-tight">
          PRECISION <br />
          <span className="text-gold-champagne font-normal">IN EVERY FRAME.</span>
        </h2>
        <p className="text-xs sm:text-sm text-muted-gray leading-relaxed font-light">
          Crafted with 45MP high-resolution full-frame sensors and advanced RF optical glass engineered for uncompromising visual clarity.
        </p>
      </div>

      {/* Region 3: Built for Storytellers (Right aligned) */}
      <div
        className="absolute right-6 md:right-16 max-w-lg space-y-4 text-right transition-opacity duration-75"
        style={{
          opacity: op3,
          transform: `translate3d(${x3}px, 0, 0)`,
          visibility: op3 < 0.01 ? "hidden" : "visible",
        }}
      >
        <span className="inline-block text-[9px] font-semibold uppercase tracking-[0.3em] text-gold-champagne bg-gold-champagne/10 px-3 py-1 rounded-full border border-gold-champagne/20">
          02 • Ergonomics & Control
        </span>
        <h2 className="serif-heading text-3xl sm:text-5xl font-light text-ivory leading-tight">
          BUILT FOR <br />
          <span className="text-gold-champagne font-normal">STORYTELLERS.</span>
        </h2>
        <p className="text-xs sm:text-sm text-muted-gray leading-relaxed font-light ml-auto">
          From high-budget commercial film sets to intimate documentary captures, intuitive controls give you complete creative authority.
        </p>
      </div>

      {/* Region 4: Cinematic Power & Control (Bottom Left) */}
      <div
        className="absolute bottom-20 left-6 md:left-16 max-w-xl space-y-4 text-left transition-opacity duration-75"
        style={{
          opacity: op4,
          transform: `translate3d(0, ${y4}px, 0)`,
          visibility: op4 < 0.01 ? "hidden" : "visible",
        }}
      >
        <span className="inline-block text-[9px] font-semibold uppercase tracking-[0.3em] text-gold-champagne bg-gold-champagne/10 px-3 py-1 rounded-full border border-gold-champagne/20">
          03 • 8K RAW Cinema Power
        </span>
        <h2 className="serif-heading text-3xl sm:text-5xl font-light text-ivory leading-tight">
          CINEMATIC POWER. <br />
          <span className="text-gold-champagne font-normal">PROFESSIONAL CONTROL.</span>
        </h2>
        <p className="text-xs sm:text-sm text-muted-gray leading-relaxed font-light">
          Record 8K RAW video internally with Dual Pixel CMOS AF II precision tracking and 5-axis in-body image stabilization.
        </p>
      </div>

      {/* Region 5: Floating Spec Glass Card (Bottom Right) */}
      <div
        className="absolute bottom-24 right-6 md:right-16 bg-charcoal/85 rounded-xl p-6 border border-gold-champagne/25 max-w-sm space-y-4 shadow-2xl backdrop-blur-md text-left pointer-events-auto transition-opacity duration-75"
        style={{
          opacity: op5,
          transform: `scale(${scale5})`,
          visibility: op5 < 0.01 ? "hidden" : "visible",
        }}
      >
        <div className="border-b border-white/10 pb-3 flex items-center justify-between">
          <div>
            <span className="text-[9px] uppercase text-gold-champagne tracking-widest block font-mono">
              04 • Vault Specifications
            </span>
            <h3 className="serif-heading text-xl text-ivory font-light">Canon EOS R5</h3>
          </div>
          <span className="flex h-2.5 w-2.5 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
        </div>
        <div className="space-y-3 text-xs">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded bg-gold-champagne/10 flex items-center justify-center text-gold-champagne shrink-0">
              <Camera className="w-3.5 h-3.5" />
            </div>
            <div>
              <span className="text-[9px] text-muted-gray uppercase block font-mono">Sensor</span>
              <span className="text-ivory font-medium">45MP Full-Frame CMOS</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded bg-gold-champagne/10 flex items-center justify-center text-gold-champagne shrink-0">
              <Cpu className="w-3.5 h-3.5" />
            </div>
            <div>
              <span className="text-[9px] text-muted-gray uppercase block font-mono">Resolution</span>
              <span className="text-ivory font-medium">8K RAW @ 30fps Internal</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded bg-gold-champagne/10 flex items-center justify-center text-gold-champagne shrink-0">
              <Layers className="w-3.5 h-3.5" />
            </div>
            <div>
              <span className="text-[9px] text-muted-gray uppercase block font-mono">Focus Engine</span>
              <span className="text-ivory font-medium">Dual Pixel CMOS AF II</span>
            </div>
          </div>
        </div>
      </div>

      {/* Region 6: Grand Finale Call to Action (Center) */}
      <div
        className="absolute z-30 text-center max-w-2xl space-y-6 pointer-events-auto transition-opacity duration-75"
        style={{
          opacity: op6,
          transform: `translate3d(0, ${y6}px, 0)`,
          visibility: op6 < 0.01 ? "hidden" : "visible",
        }}
      >
        <span className="inline-block text-[10px] font-mono uppercase tracking-[0.4em] text-gold-champagne bg-gold-champagne/10 px-4 py-1.5 rounded-full border border-gold-champagne/30">
          RENT • CREATE • CAPTURE
        </span>
        <h2 className="serif-heading text-4xl sm:text-6xl font-light text-ivory leading-tight tracking-tight">
          FRAME THE <br />
          <span className="text-gold-champagne font-normal">EXTRAORDINARY.</span>
        </h2>
        <p className="text-xs sm:text-sm text-muted-gray font-light max-w-md mx-auto leading-relaxed">
          Experience the pinnacle of cinema optics. Reserve the Canon EOS R5 vault package today.
        </p>

        <div className="pt-2 flex justify-center">
          <MagneticButton onClick={onExploreClick}>
            <div className="px-8 py-4 bg-gold-champagne text-obsidian text-xs font-bold uppercase tracking-[0.2em] rounded shadow-xl hover:bg-gold-warm transition duration-300 flex items-center gap-3 group cursor-pointer">
              Explore The Collection
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform duration-300" />
            </div>
          </MagneticButton>
        </div>
      </div>
    </div>
  );
}

