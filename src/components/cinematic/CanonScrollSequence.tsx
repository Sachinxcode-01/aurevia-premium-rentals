"use client";

import React, { useRef, useState, useCallback, useEffect } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { useImageSequence } from "@/hooks/useImageSequence";
import { useCanvasSequence } from "@/hooks/useCanvasSequence";
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
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

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

  // Immediately render frame 1 as soon as image sequence is ready
  useEffect(() => {
    if (isReady) {
      renderFrame(1);
    }
  }, [isReady, renderFrame]);

  // Current frame index for HUD telemetry
  const currentFrameNum = Math.max(
    1,
    Math.min(TOTAL_FRAMES, Math.floor(scrollProgress * (TOTAL_FRAMES - 1)) + 1)
  );

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
      const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reducedMotion || !containerRef.current || !pinWrapperRef.current) return;

      const isMobile = window.innerWidth < 768;

      const trigger = ScrollTrigger.create({
        trigger: containerRef.current,
        start: "top top",
        end: isMobile ? "+=180%" : "+=240%",
        pin: pinWrapperRef.current,
        pinSpacing: true,
        scrub: isMobile ? 0.2 : 0.15,
        onUpdate: (self) => {
          handleScrollProgress(self.progress);
        },
      });

      return () => {
        trigger.kill();
      };
    },
    { scope: containerRef, dependencies: [isReady, handleScrollProgress] }
  );

  // Handler to jump scroll position directly to a sequence stage
  const jumpToStage = (targetProgress: number) => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const rect = container.getBoundingClientRect();
    const scrollTop = window.scrollY || window.pageYOffset;
    const startY = rect.top + scrollTop;
    const scrollableDistance = rect.height - window.innerHeight;
    const destinationY = startY + targetProgress * scrollableDistance;

    window.scrollTo({
      top: destinationY,
      behavior: "smooth",
    });
  };

  // Stage checkpoints
  const stages = [
    { label: "01 • Intro", progress: 0.05 },
    { label: "02 • Optics", progress: 0.25 },
    { label: "03 • Control", progress: 0.45 },
    { label: "04 • Video", progress: 0.65 },
    { label: "05 • Specs", progress: 0.82 },
    { label: "06 • Reserve", progress: 0.95 },
  ];

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
        className="relative w-full bg-obsidian h-[200vh] md:h-[280vh]"
      >
        {/* Pinned Viewport Section */}
        <div
          ref={pinWrapperRef}
          className="w-full h-screen overflow-hidden flex items-center justify-center select-none relative"
        >
          {/* Volumetric ambient background lighting */}
          <div className="absolute inset-0 bg-gold-champagne/10 blur-[130px] pointer-events-none z-10" />
          <div className="absolute inset-0 bg-linear-to-t from-obsidian via-transparent to-obsidian/80 pointer-events-none z-15" />

          {/* Instant SSR / Fallback Frame 1 Image */}
          <div className="absolute inset-0 w-full h-full pointer-events-none z-12">
            <Image
              src="/assets/canon-sequence/frame-001.jpg"
              alt="Canon EOS R5 Cinema Pack"
              fill
              priority
              sizes="100vw"
              className="w-full h-full object-cover"
              style={{ filter: "brightness(0.96) contrast(1.04)" }}
            />
          </div>

          {/* High-DPI Canvas Sequence */}
          <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full object-cover pointer-events-none z-14"
            style={{ filter: "brightness(0.96) contrast(1.04)" }}
          />

          {/* Frame-Aware Cinematic Typography Overlay */}
          <CinematicText progress={scrollProgress} onExploreClick={onExploreClick} />

          {/* Real-Time Sequence Telemetry Badge (Bottom Left HUD) */}
          <div className="absolute bottom-8 left-6 md:left-12 z-30 hidden sm:flex items-center gap-3 bg-black/70 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/10 text-[10px] font-mono text-muted-gray shadow-2xl">
            <span className={`w-2 h-2 rounded-full ${isReady ? "bg-gold-champagne animate-ping" : "bg-emerald-400 animate-pulse"}`} />
            <span className="text-ivory font-medium">
              {isReady ? `FRAME ${String(currentFrameNum).padStart(3, "0")} / ${TOTAL_FRAMES}` : `PREPARING 8K SEQUENCE (${progressPct}%)`}
            </span>
            <span className="text-white/20">|</span>
            <span className="text-gold-champagne font-semibold">8K RAW 30FPS</span>
          </div>

          {/* Interactive Desktop Sequence Stage Navigation Dots (Right Side) */}
          <div className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-30 hidden lg:flex flex-col items-end gap-4">
            <div className="relative h-44 w-[1.5px] bg-white/10 rounded-full overflow-hidden">
              <div
                className="w-full bg-linear-to-b from-gold-champagne/40 to-gold-champagne origin-top transition-transform duration-75"
                style={{ transform: `scaleY(${Math.max(0.02, scrollProgress)})` }}
              />
            </div>

            <div className="flex flex-col gap-2.5 items-end pr-1">
              {stages.map((stg) => {
                const isActive = Math.abs(scrollProgress - stg.progress) < 0.12;
                return (
                  <button
                    key={stg.label}
                    onClick={() => jumpToStage(stg.progress)}
                    className="group flex items-center gap-2 text-[9px] uppercase tracking-widest font-mono cursor-pointer transition-all duration-300"
                  >
                    <span className={`opacity-0 group-hover:opacity-100 transition-opacity ${isActive ? "text-gold-champagne opacity-100 font-bold" : "text-muted-gray"}`}>
                      {stg.label}
                    </span>
                    <span
                      className={`w-2 h-2 rounded-full border transition-all duration-300 ${
                        isActive
                          ? "bg-gold-champagne border-gold-champagne scale-125 shadow-[0_0_8px_rgba(216,179,106,0.8)]"
                          : "bg-white/10 border-white/20 group-hover:border-gold-champagne"
                      }`}
                    />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Mobile Interactive Floating Stage Pills Bar */}
          <div className="lg:hidden absolute bottom-4 left-4 right-4 z-35 flex items-center justify-start sm:justify-center gap-1.5 overflow-x-auto py-1.5 px-2.5 bg-black/80 backdrop-blur-xl rounded-full border border-white/10 shadow-2xl scrollbar-none">
            {stages.map((stg) => {
              const isActive = Math.abs(scrollProgress - stg.progress) < 0.12;
              const cleanName = stg.label.includes("•") ? stg.label.split("•")[1].trim() : stg.label;
              return (
                <button
                  key={stg.label}
                  onClick={() => jumpToStage(stg.progress)}
                  className={`px-3 py-1 rounded-full text-[9px] font-mono whitespace-nowrap transition-all duration-300 cursor-pointer ${
                    isActive
                      ? "bg-gold-champagne text-obsidian font-bold shadow-md shadow-gold-champagne/20"
                      : "bg-white/5 text-muted-gray hover:text-ivory"
                  }`}
                >
                  {cleanName}
                </button>
              );
            })}
          </div>

          {/* Scroll Hint */}
          <div
            className={`absolute bottom-16 sm:bottom-8 left-1/2 -translate-x-1/2 z-30 transition-opacity duration-300 pointer-events-none text-center ${
              scrollProgress > 0.15 ? "opacity-0" : "opacity-100"
            }`}
          >
            <span className="text-[9px] uppercase tracking-[0.3em] text-muted-gray/80 font-mono block mb-2">
              Scroll to Scrub Sequence
            </span>
            <div className="w-px h-8 sm:h-10 mx-auto bg-linear-to-b from-gold-champagne to-transparent animate-pulse" />
          </div>
        </div>
      </div>
    </GridBackground>
  );
}

