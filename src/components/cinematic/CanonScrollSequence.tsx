"use client";

import React, { useRef, useState, useCallback, useEffect } from "react";
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
      if (prefersReducedMotion || !containerRef.current || !pinWrapperRef.current) return;

      const trigger = ScrollTrigger.create({
        trigger: containerRef.current,
        start: "top top",
        end: isMobile ? "+=220%" : "+=380%",
        pin: pinWrapperRef.current,
        scrub: 0.15,
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
        className="relative w-full bg-obsidian"
        style={{ height: isMobile ? "250vh" : "420vh" }}
      >
        {/* Sequence Preloading Overlay */}
        {!isReady && <SequenceLoader progressPct={progressPct} />}

        {/* Pinned Viewport Section */}
        <div
          ref={pinWrapperRef}
          className="sticky top-0 w-full h-screen overflow-hidden flex items-center justify-center select-none"
        >
          {/* Volumetric ambient background lighting */}
          <div className="absolute inset-0 bg-gold-champagne/10 blur-[130px] pointer-events-none z-10" />
          <div className="absolute inset-0 bg-linear-to-t from-obsidian via-transparent to-obsidian/80 pointer-events-none z-15" />

          {/* High-DPI Canvas Sequence */}
          <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full object-cover pointer-events-none"
            style={{ filter: "brightness(0.96) contrast(1.04)" }}
          />

          {/* Frame-Aware Cinematic Typography Overlay */}
          <CinematicText progress={scrollProgress} onExploreClick={onExploreClick} />

          {/* Real-Time Sequence Telemetry Badge (Bottom Left HUD) */}
          <div className="absolute bottom-8 left-6 md:left-12 z-30 hidden sm:flex items-center gap-3 bg-black/60 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/10 text-[10px] font-mono text-muted-gray">
            <span className="w-2 h-2 rounded-full bg-gold-champagne animate-ping" />
            <span className="text-ivory font-medium">FRAME {String(currentFrameNum).padStart(3, "0")} / {TOTAL_FRAMES}</span>
            <span className="text-white/20">|</span>
            <span className="text-gold-champagne font-semibold">8K RAW 30FPS</span>
          </div>

          {/* Interactive Sequence Stage Navigation Dots (Right Side) */}
          <div className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-30 flex flex-col items-end gap-4">
            <div className="relative h-44 w-[1.5px] bg-white/10 rounded-full overflow-hidden">
              <div
                className="w-full bg-linear-to-b from-gold-champagne/40 to-gold-champagne origin-top transition-transform duration-75"
                style={{ transform: `scaleY(${Math.max(0.02, scrollProgress)})` }}
              />
            </div>

            <div className="hidden lg:flex flex-col gap-2.5 items-end pr-1">
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

          {/* Scroll Hint */}
          <div
            className={`absolute bottom-8 left-1/2 -translate-x-1/2 z-30 transition-opacity duration-300 pointer-events-none text-center ${
              scrollProgress > 0.95 ? "opacity-0" : "opacity-100"
            }`}
          >
            <span className="text-[9px] uppercase tracking-[0.3em] text-muted-gray/80 font-mono block mb-2">
              Scroll to Scrub Sequence
            </span>
            <div className="w-px h-10 mx-auto bg-linear-to-b from-gold-champagne to-transparent animate-pulse" />
          </div>
        </div>
      </div>
    </GridBackground>
  );
}

