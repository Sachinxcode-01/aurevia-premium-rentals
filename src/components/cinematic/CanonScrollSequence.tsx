"use client";

import React, { useRef, useState, useCallback } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { useImageSequence } from "@/hooks/useImageSequence";
import { useCanvasSequence } from "@/hooks/useCanvasSequence";
import SequenceLoader from "./SequenceLoader";
import CinematicText from "./CinematicText";
import GridBackground from "@/components/effects/GridBackground";

gsap.registerPlugin(ScrollTrigger);

const TOTAL_FRAMES = 210;

const getFrameUrl = (frameIndex: number) => {
  const paddedIndex = String(frameIndex).padStart(3, "0");
  return `/assets/canon-sequence/frame-${paddedIndex}.jpg`;
};

interface CanonScrollSequenceProps {
  onExploreClick?: () => void;
}

export default function CanonScrollSequence({ onExploreClick }: CanonScrollSequenceProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const pinWrapperRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [scrollProgress, setScrollProgress] = useState(0);

  // Lazy state initializers to prevent synchronous setState inside effect
  const [isMobile] = useState(() => {
    if (typeof window !== "undefined") {
      return window.innerWidth < 768;
    }
    return false;
  });

  const [prefersReducedMotion] = useState(() => {
    if (typeof window !== "undefined") {
      return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    }
    return false;
  });

  // Progressive image preloader hook
  const { progressPct, isReady, getFrameImage } = useImageSequence({
    totalFrames: TOTAL_FRAMES,
    getFrameUrl,
    keyframeInterval: 5,
  });

  // Canvas drawing hook
  const { renderFrame } = useCanvasSequence({
    canvasRef,
    containerRef: pinWrapperRef,
    getFrameImage,
    objectFit: "cover",
  });

  // Frame scrubbing callback
  const handleScrollProgress = useCallback(
    (progress: number) => {
      setScrollProgress(progress);
      const targetFrame = Math.max(
        1,
        Math.min(TOTAL_FRAMES, Math.floor(progress * (TOTAL_FRAMES - 1)) + 1)
      );
      renderFrame(targetFrame);
    },
    [renderFrame]
  );

  // GSAP ScrollTrigger pinning and scrubbing setup
  useGSAP(
    () => {
      if (prefersReducedMotion || !containerRef.current || !pinWrapperRef.current) return;

      const trigger = ScrollTrigger.create({
        trigger: containerRef.current,
        start: "top top",
        end: isMobile ? "+=200%" : "+=350%",
        pin: pinWrapperRef.current,
        scrub: 0.2,
        onUpdate: (self) => {
          handleScrollProgress(self.progress);
        },
      });

      return () => {
        trigger.kill();
      };
    },
    { scope: containerRef, dependencies: [isReady, isMobile, prefersReducedMotion, handleScrollProgress] }
  );

  // Reduced motion / fallback layout
  if (prefersReducedMotion) {
    return (
      <GridBackground className="w-full bg-obsidian py-24 px-6 md:px-12 text-center text-ivory">
        <div className="max-w-4xl mx-auto space-y-6">
          <span className="text-[10px] uppercase font-mono tracking-widest text-gold-champagne px-3 py-1 rounded-full bg-gold-champagne/10 border border-gold-champagne/20">
            AUREVIA Vault Series
          </span>
          <h1 className="serif-heading text-4xl sm:text-6xl font-light tracking-tight">
            CANON EOS R5 CINEMA PACK
          </h1>
          <p className="text-sm text-muted-gray leading-relaxed max-w-lg mx-auto font-light">
            45MP full-frame sensor, 8K RAW video recording, and Dual Pixel CMOS AF II precision tracking.
          </p>
          <div className="relative aspect-video max-w-2xl mx-auto rounded-xl overflow-hidden border border-white/10 shadow-2xl">
            <Image
              src="/assets/canon-sequence/frame-210.jpg"
              alt="Canon EOS R5"
              fill
              className="object-cover"
            />
          </div>
        </div>
      </GridBackground>
    );
  }

  return (
    <GridBackground className="w-full bg-obsidian">
      <div
        ref={containerRef}
        className="relative w-full bg-obsidian"
        style={{ height: isMobile ? "250vh" : "400vh" }}
      >
        {/* Sequence Preloading Overlay */}
        {!isReady && <SequenceLoader progressPct={progressPct} />}

        {/* Pinned Viewport Section */}
        <div
          ref={pinWrapperRef}
          className="sticky top-0 w-full h-[100vh] overflow-hidden flex items-center justify-center select-none"
        >
          {/* Volumetric ambient background lighting */}
          <div className="absolute inset-0 bg-gold-champagne/10 blur-[130px] pointer-events-none z-10" />
          <div className="absolute inset-0 bg-gradient-to-t from-obsidian via-transparent to-obsidian/80 pointer-events-none z-15" />

          {/* High-DPI Canvas Sequence */}
          <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full object-cover pointer-events-none"
            style={{ filter: "brightness(0.96) contrast(1.04)" }}
          />

          {/* Frame-Aware Cinematic Typography Overlay */}
          <CinematicText progress={scrollProgress} onExploreClick={onExploreClick} />

          {/* Scroll Progress Bar & Hint */}
          <div className="absolute right-6 top-1/2 -translate-y-1/2 z-30 h-32 w-[1.5px] bg-white/10 overflow-hidden">
            <div
              className="w-full bg-gradient-to-b from-gold-champagne/40 to-gold-champagne origin-top transition-transform duration-75"
              style={{ transform: `scaleY(${Math.max(0.02, scrollProgress)})` }}
            />
          </div>

          <div
            className={`absolute bottom-8 left-1/2 -translate-x-1/2 z-30 transition-opacity duration-300 pointer-events-none text-center ${
              scrollProgress > 0.95 ? "opacity-0" : "opacity-100"
            }`}
          >
            <span className="text-[9px] uppercase tracking-[0.3em] text-muted-gray/80 font-mono block mb-2">
              Scroll to Scrub Sequence
            </span>
            <div className="w-[1px] h-10 mx-auto bg-gradient-to-b from-gold-champagne to-transparent animate-pulse" />
          </div>
        </div>
      </div>
    </GridBackground>
  );
}
