"use client";

import React from "react";
import { motion, AnimatePresence } from "motion/react";
import MagneticButton from "@/components/motion/MagneticButton";
import { ArrowRight, Camera, Cpu, Layers } from "lucide-react";

interface CinematicTextProps {
  progress: number;
  onExploreClick?: () => void;
}

export default function CinematicText({ progress, onExploreClick }: CinematicTextProps) {
  // Region definitions based on scroll progress (0.0 to 1.0)
  const isRegion1 = progress >= 0.02 && progress < 0.16; // AUREVIA PRESENTS
  const isRegion2 = progress >= 0.16 && progress < 0.36; // PRECISION IN EVERY FRAME
  const isRegion3 = progress >= 0.36 && progress < 0.56; // BUILT FOR STORYTELLERS
  const isRegion4 = progress >= 0.56 && progress < 0.76; // CINEMATIC POWER
  const isRegion5 = progress >= 0.76 && progress < 0.90; // RENT. CREATE. CAPTURE.
  const isRegion6 = progress >= 0.90;                   // FRAME THE EXTRAORDINARY + CTA

  return (
    <div className="absolute inset-0 pointer-events-none z-20 flex items-center justify-center px-6 md:px-16">
      <AnimatePresence mode="wait">
        {/* Region 1: Intro Presentation (Top / Center) */}
        {isRegion1 && (
          <motion.div
            key="region1"
            initial={{ opacity: 0, y: 30, filter: "blur(10px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -20, filter: "blur(6px)" }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="absolute top-1/4 text-center max-w-xl space-y-3"
          >
            <span className="text-[10px] font-mono uppercase tracking-[0.4em] text-gold-champagne block">
              AUREVIA PRESENTS
            </span>
            <h1 className="serif-heading text-4xl sm:text-6xl font-light text-ivory tracking-tight">
              CANON
            </h1>
            <p className="text-xs uppercase tracking-[0.25em] text-muted-gray font-mono">
              The Flagship Optics Series
            </p>
          </motion.div>
        )}

        {/* Region 2: Precision in Every Frame (Left aligned) */}
        {isRegion2 && (
          <motion.div
            key="region2"
            initial={{ opacity: 0, x: -40, filter: "blur(10px)" }}
            animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, x: -20, filter: "blur(6px)" }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="absolute left-6 md:left-16 max-w-lg space-y-4 text-left"
          >
            <span className="inline-block text-[9px] font-semibold uppercase tracking-[0.3em] text-gold-champagne bg-gold-champagne/10 px-3 py-1 rounded-full border border-gold-champagne/20">
              Masterclass Optics
            </span>
            <h2 className="serif-heading text-3xl sm:text-5xl font-light text-ivory leading-tight">
              PRECISION <br />
              <span className="text-gold-champagne font-normal">IN EVERY FRAME.</span>
            </h2>
            <p className="text-xs sm:text-sm text-muted-gray leading-relaxed font-light">
              Crafted with high-resolution full-frame sensors and advanced optical glass engineered for uncompromising visual clarity.
            </p>
          </motion.div>
        )}

        {/* Region 3: Built for Storytellers (Right aligned) */}
        {isRegion3 && (
          <motion.div
            key="region3"
            initial={{ opacity: 0, x: 40, filter: "blur(10px)" }}
            animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, x: 20, filter: "blur(6px)" }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="absolute right-6 md:right-16 max-w-lg space-y-4 text-right"
          >
            <span className="inline-block text-[9px] font-semibold uppercase tracking-[0.3em] text-gold-champagne bg-gold-champagne/10 px-3 py-1 rounded-full border border-gold-champagne/20">
              Uncompromising Ergonomics
            </span>
            <h2 className="serif-heading text-3xl sm:text-5xl font-light text-ivory leading-tight">
              BUILT FOR <br />
              <span className="text-gold-champagne font-normal">STORYTELLERS.</span>
            </h2>
            <p className="text-xs sm:text-sm text-muted-gray leading-relaxed font-light ml-auto">
              From commercial film sets to intimate documentary captures, intuitive controls give you complete creative authority.
            </p>
          </motion.div>
        )}

        {/* Region 4: Cinematic Power & Control (Bottom Left) */}
        {isRegion4 && (
          <motion.div
            key="region4"
            initial={{ opacity: 0, y: 40, filter: "blur(10px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: 20, filter: "blur(6px)" }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="absolute bottom-20 left-6 md:left-16 max-w-xl space-y-4 text-left"
          >
            <h2 className="serif-heading text-3xl sm:text-5xl font-light text-ivory leading-tight">
              CINEMATIC POWER. <br />
              <span className="text-gold-champagne font-normal">PROFESSIONAL CONTROL.</span>
            </h2>
            <p className="text-xs sm:text-sm text-muted-gray leading-relaxed font-light">
              Record 8K RAW video internally with Dual Pixel CMOS AF II precision tracking and 5-axis image stabilization.
            </p>
          </motion.div>
        )}

        {/* Region 5: Floating Spec Glass Card (Bottom Right) */}
        {isRegion5 && (
          <motion.div
            key="region5"
            initial={{ opacity: 0, scale: 0.92, filter: "blur(10px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, scale: 0.95, filter: "blur(6px)" }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="absolute bottom-24 right-6 md:right-16 bg-charcoal/80 rounded-xl p-6 border border-gold-champagne/20 max-w-sm space-y-4 shadow-2xl backdrop-blur-md text-left pointer-events-auto"
          >
            <div className="border-b border-white/10 pb-3">
              <span className="text-[9px] uppercase text-gold-champagne tracking-widest block mb-1 font-mono">
                Vault Specifications
              </span>
              <h3 className="serif-heading text-xl text-ivory font-light">Canon EOS R5</h3>
            </div>
            <div className="space-y-3 text-xs">
              <div className="flex items-center gap-3">
                <Camera className="w-4 h-4 text-gold-champagne shrink-0" />
                <div>
                  <span className="text-[9px] text-muted-gray uppercase block font-mono">Sensor</span>
                  <span className="text-ivory font-medium">45MP Full-Frame CMOS</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Cpu className="w-4 h-4 text-gold-champagne shrink-0" />
                <div>
                  <span className="text-[9px] text-muted-gray uppercase block font-mono">Resolution</span>
                  <span className="text-ivory font-medium">8K RAW @ 30fps</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Layers className="w-4 h-4 text-gold-champagne shrink-0" />
                <div>
                  <span className="text-[9px] text-muted-gray uppercase block font-mono">Focus Engine</span>
                  <span className="text-ivory font-medium">Dual Pixel CMOS AF II</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Region 6: Grand Finale Call to Action (Center) */}
        {isRegion6 && (
          <motion.div
            key="region6"
            initial={{ opacity: 0, y: 30, filter: "blur(12px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -20, filter: "blur(6px)" }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="absolute z-30 text-center max-w-2xl space-y-6 pointer-events-auto"
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
                <div className="px-8 py-4 bg-gold-champagne text-obsidian text-xs font-bold uppercase tracking-[0.2em] rounded shadow-xl hover:bg-gold-champagne/90 transition duration-300 flex items-center gap-3 group cursor-pointer">
                  Explore The Collection
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform duration-300" />
                </div>
              </MagneticButton>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
