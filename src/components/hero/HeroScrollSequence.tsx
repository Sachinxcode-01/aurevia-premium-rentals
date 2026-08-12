"use client";

import { useEffect, useRef, useState } from "react";
import { createTimeline, stagger } from "animejs";
import { ArrowRight, Cpu, Camera, Layers } from "lucide-react";
import MagneticButton from "@/components/motion/MagneticButton";
import GridBackground from "@/components/effects/GridBackground";

// Total frames in the zip sequence
const TOTAL_FRAMES = 210;

// Path to image frames mapping helper
const getFrameUrl = (frameIndex: number) => {
  const paddedIndex = String(frameIndex).padStart(3, "0");
  return `/assets/canon-sequence/frame-${paddedIndex}.jpg`;
};

interface HeroScrollSequenceProps {
  onExploreClick?: () => void;
  onBookClick?: () => void;
  title?: string;
  subtitle?: string;
}

export default function HeroScrollSequence({
  onExploreClick,
  onBookClick,
  title,
  subtitle,
}: HeroScrollSequenceProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Text refs for scroll-based animation (avoiding React state re-renders)
  const introTextRef = useRef<HTMLDivElement>(null);
  const mainTextRef = useRef<HTMLDivElement>(null);
  const specsRef = useRef<HTMLDivElement>(null);
  const scrollIndicatorRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  const [loadingProgress, setLoadingProgress] = useState(0);
  const [isPreloaded, setIsPreloaded] = useState(false);
  const [useFallback, setUseFallback] = useState(false);

  // Cache of preloaded images
  const imagesCacheRef = useRef<(HTMLImageElement | null)[]>(
    new Array(TOTAL_FRAMES + 1).fill(null)
  );

  // Monitor loading status
  const loadedCountRef = useRef(0);

  // Core configuration & execution variables
  const frameIndexRef = useRef(1);
  const canvasContextRef = useRef<CanvasRenderingContext2D | null>(null);

  // Tracking visibility of Hero for performance optimization
  const isVisibleRef = useRef(true);

  useEffect(() => {
    // Feature Detection: Fallback if prefers-reduced-motion is true
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    const isMobile = window.innerWidth < 768; // basic performance guard

    if (prefersReducedMotion || isMobile) {
      queueMicrotask(() => {
        setUseFallback(true);
        setIsPreloaded(true);
      });
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      queueMicrotask(() => {
        setUseFallback(true);
        setIsPreloaded(true);
      });
      return;
    }
    canvasContextRef.current = ctx;

    // Create IntersectionObserver to pause tick when hero is not visible
    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisibleRef.current = entry.isIntersecting;
        if (entry.isIntersecting) {
          tick();
        }
      },
      { threshold: 0.01 }
    );
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    let isDestroyed = false;

    // Resize canvas safely
    const resizeCanvas = () => {
      if (!canvas || !containerRef.current) return;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      if (frameIndexRef.current && imagesCacheRef.current[frameIndexRef.current]) {
        drawFrame(frameIndexRef.current);
      }
    };
    window.addEventListener("resize", resizeCanvas, { passive: true });
    resizeCanvas();

    // Draw single frame to canvas cleanly maintaining aspect fill
    const drawFrame = (index: number) => {
      const img = imagesCacheRef.current[index];
      if (!img || !ctx || !canvas) return;

      const cw = canvas.width;
      const ch = canvas.height;
      const iw = img.naturalWidth || img.width;
      const ih = img.naturalHeight || img.height;
      if (!iw || !ih) return;

      const scale = Math.max(cw / iw, ch / ih);
      const nw = iw * scale;
      const nh = ih * scale;
      const cx = (cw - nw) / 2;
      const cy = (ch - nh) / 2;

      ctx.clearRect(0, 0, cw, ch);
      ctx.drawImage(img, cx, cy, nw, nh);
    };

    // Preload image frame sequence
    const loadImages = () => {
      for (let i = 1; i <= TOTAL_FRAMES; i++) {
        const img = new Image();
        img.src = getFrameUrl(i);

        img.onload = () => {
          if (isDestroyed) return;
          imagesCacheRef.current[i] = img;
          loadedCountRef.current += 1;
          const pct = Math.round((loadedCountRef.current / TOTAL_FRAMES) * 100);
          setLoadingProgress(pct);

          if (i === 1) {
            drawFrame(1);
          }

          if (loadedCountRef.current === TOTAL_FRAMES) {
            setIsPreloaded(true);
            drawFrame(1);
          }
        };

        img.onerror = () => {
          if (isDestroyed) return;
          loadedCountRef.current += 1;
          if (loadedCountRef.current >= TOTAL_FRAMES) {
            setIsPreloaded(true);
          }
        };
      }
    };

    loadImages();

    // Scroll progress calculations
    let animationFrameId = 0;
    let targetProgress = 0;
    let currentProgress = 0;
    let lastTimestamp = performance.now();

    const clamp = (val: number, min = 0, max = 1) => Math.min(max, Math.max(min, val));
    const smoothstep = (t: number) => t * t * (3 - 2 * t);
    const range = (val: number, start: number, end: number) => clamp((val - start) / (end - start));

    const renderScrollState = (progress: number) => {
      const introText = introTextRef.current;
      const mainText = mainTextRef.current;
      const specs = specsRef.current;
      const scrollIndicator = scrollIndicatorRef.current;
      const progressBar = progressRef.current;

      const introOpacity = smoothstep(range(progress, 0.01, 0.07)) * (1 - smoothstep(range(progress, 0.12, 0.18)));
      const mainOpacity = smoothstep(range(progress, 0.18, 0.28)) * (1 - smoothstep(range(progress, 0.65, 0.75)));
      const specsOpacity = smoothstep(range(progress, 0.72, 0.82)) * (1 - smoothstep(range(progress, 0.92, 0.98)));

      if (introText) {
        introText.style.opacity = String(introOpacity);
        introText.style.transform = `translate3d(0, ${(1 - range(progress, 0.01, 0.07)) * 20 - range(progress, 0.12, 0.18) * 20}px, 0)`;
        introText.style.visibility = introOpacity < 0.01 ? "hidden" : "visible";
      }
      if (mainText) {
        mainText.style.opacity = String(mainOpacity);
        mainText.style.transform = `translate3d(0, ${(1 - range(progress, 0.18, 0.28)) * 32 - range(progress, 0.65, 0.75) * 28}px, 0)`;
        mainText.style.visibility = mainOpacity < 0.01 ? "hidden" : "visible";
        mainText.style.pointerEvents = mainOpacity > 0.65 ? "auto" : "none";
      }
      if (specs) {
        specs.style.opacity = String(specsOpacity);
        specs.style.transform = `translate3d(${(1 - range(progress, 0.72, 0.82)) * 38}px, 0, 0)`;
        specs.style.visibility = specsOpacity < 0.01 ? "hidden" : "visible";
      }
      if (scrollIndicator) {
        scrollIndicator.style.opacity = String(1 - smoothstep(range(progress, 0.01, 0.09)));
      }
      if (progressBar) {
        progressBar.style.transform = `scaleY(${Math.max(0.02, progress)})`;
      }
    };

    const tick = (timestamp = performance.now()) => {
      animationFrameId = 0;
      const container = containerRef.current;
      if (!container || !canvas || !isVisibleRef.current) return;

      const rect = container.getBoundingClientRect();
      const scrollHeight = rect.height - window.innerHeight;
      if (scrollHeight <= 0) return;

      targetProgress = clamp(-rect.top / scrollHeight);

      const delta = Math.min(64, timestamp - lastTimestamp);
      lastTimestamp = timestamp;
      const damping = 1 - Math.exp(-delta / 62);
      currentProgress += (targetProgress - currentProgress) * damping;
      if (Math.abs(targetProgress - currentProgress) < 0.0001) {
        currentProgress = targetProgress;
      }

      const roundedFrame = Math.max(
        1,
        Math.min(TOTAL_FRAMES, Math.round(currentProgress * (TOTAL_FRAMES - 1) + 1))
      );
      if (roundedFrame !== frameIndexRef.current) {
        frameIndexRef.current = roundedFrame;
        drawFrame(roundedFrame);
      }

      renderScrollState(currentProgress);

      if (Math.abs(targetProgress - currentProgress) >= 0.0001) {
        animationFrameId = requestAnimationFrame(tick);
      }
    };

    const handleScroll = () => {
      cancelAnimationFrame(animationFrameId);
      if (!animationFrameId) {
        lastTimestamp = performance.now();
        animationFrameId = requestAnimationFrame((timestamp) => {
          animationFrameId = 0;
          tick(timestamp);
        });
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    tick();

    return () => {
      isDestroyed = true;
      window.removeEventListener("resize", resizeCanvas);
      window.removeEventListener("scroll", handleScroll);
      cancelAnimationFrame(animationFrameId);
      observer.disconnect();
      imagesCacheRef.current = [];
    };
  }, []);

  // Anime.js Entry Animations once preloaded
  useEffect(() => {
    if (isPreloaded && !useFallback) {
      const tl = createTimeline();
      tl.add(".intro-heading-char", {
        opacity: [0, 1],
        translateY: [20, 0],
        ease: "easeOutQuint",
        duration: 1200,
        delay: stagger(40),
      }).add(".scroll-hint-element", {
        opacity: [0, 1],
        translateY: [10, 0],
        ease: "easeOutSine",
        duration: 800,
      }, "-=400");
    }
  }, [isPreloaded, useFallback]);

  return (
    <GridBackground className="w-full bg-obsidian">
      <div
        ref={containerRef}
        id="hero-scroll-section"
        className="relative w-full bg-obsidian"
        style={{ height: useFallback ? "100vh" : "400vh" }}
      >
        {/* Loading Overlay */}
        {!isPreloaded && !useFallback && (
          <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-obsidian text-ivory">
            <div className="relative mb-6">
              <div className="w-16 h-16 rounded-full border border-gold-champagne/10 border-t-gold-champagne animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center text-[10px] uppercase tracking-widest text-gold-champagne font-semibold font-mono">
                AV
              </div>
            </div>
            <h2 className="serif-heading text-2xl tracking-wide text-ivory mb-2">AUREVIA</h2>
            <p className="text-xs uppercase tracking-[0.25em] text-muted-gray mb-1">Frame the Extraordinary</p>
            <div className="w-48 h-[1px] bg-white/10 rounded-full overflow-hidden mt-4">
              <div
                className="h-full bg-gold-champagne transition-all duration-300 ease-out"
                style={{ width: `${loadingProgress}%` }}
              ></div>
            </div>
            <p className="text-[10px] text-muted-gray mt-2 font-mono">{loadingProgress}% Loaded</p>
          </div>
        )}

        {/* Sticky Frame Viewer */}
        <div className="sticky top-0 w-full h-[100vh] overflow-hidden flex items-center justify-center z-10 select-none">
          
          {/* Ambient volumetric background light overlay */}
          <div className="absolute inset-0 bg-gold-champagne/10 blur-[120px] pointer-events-none z-10" />
          <div className="absolute inset-0 bg-gradient-to-t from-obsidian via-transparent to-obsidian/80 pointer-events-none z-15" />

          {/* Interactive Canvas Sequence */}
          {!useFallback ? (
            <canvas
              ref={canvasRef}
              className="absolute inset-0 w-full h-full object-cover pointer-events-none"
              style={{ filter: "brightness(0.95) contrast(1.05)", willChange: "transform, opacity" }}
            />
          ) : (
            /* Performance / Mobile Fallback Video */
            <video
              ref={videoRef}
              className="w-full h-full object-cover absolute inset-0 z-0 pointer-events-none filter brightness-95"
              src="/assets/videos/canonvideo.mp4"
              autoPlay
              muted
              loop
              playsInline
              poster="/assets/canon-sequence/frame-210.jpg"
            />
          )}

          {/* Fallback Viewport Static Overlay */}
          {useFallback && (
            <div className="absolute inset-0 z-20 flex items-center bg-gradient-to-r from-obsidian via-obsidian/60 to-transparent">
              <div className="max-w-7xl mx-auto px-6 md:px-12 w-full grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                <div className="space-y-6 md:space-y-8 text-left">
                  <span className="inline-block text-[11px] font-semibold uppercase tracking-[0.3em] text-gold-champagne bg-gold-champagne/10 px-3 py-1 rounded-full border border-gold-champagne/20">
                    Premium Camera Rentals
                  </span>
                  <h1 className="serif-heading text-4xl sm:text-5xl lg:text-7xl font-light text-ivory leading-[1.1] tracking-tight">
                    {title ? (
                      <span>{title}</span>
                    ) : (
                      <>
                        Professional Gear.<br />
                        <span className="text-gold-champagne font-normal">Extraordinary Stories.</span>
                      </>
                    )}
                  </h1>
                  <p className="text-sm sm:text-base text-muted-gray max-w-md font-light leading-relaxed">
                    {subtitle || "Rent professional cameras, cinema gear and premium lenses for every story worth capturing. Experienced by industry masters."}
                  </p>
                  <div className="flex flex-wrap gap-4 pt-2">
                    <MagneticButton onClick={onExploreClick}>
                      <div className="px-8 py-3.5 bg-gold-champagne text-obsidian text-xs font-semibold uppercase tracking-wider rounded hover:bg-gold-champagne/90 transition duration-300 flex items-center gap-2 group cursor-pointer shadow-lg shadow-gold-champagne/10">
                        Explore Gear
                        <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                      </div>
                    </MagneticButton>
                    <button
                      onClick={onBookClick}
                      className="px-8 py-3.5 bg-transparent text-ivory text-xs font-semibold uppercase tracking-wider rounded border border-white/20 hover:border-gold-champagne hover:text-gold-champagne transition duration-300 cursor-pointer"
                    >
                      Book Now
                    </button>
                  </div>
                </div>
                
                {/* Dynamic specs for fallback view */}
                <div className="hidden md:block justify-self-end">
                  <div className="bg-charcoal/80 rounded-lg p-8 border border-gold-champagne/20 max-w-sm space-y-6 shadow-2xl backdrop-blur-md">
                    <div className="border-b border-white/10 pb-4">
                      <span className="text-[10px] uppercase text-gold-champagne tracking-widest block mb-1 font-mono">Flagship Series</span>
                      <h3 className="serif-heading text-2xl text-ivory font-light">Canon EOS R5</h3>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded bg-white/5 flex items-center justify-center text-gold-champagne"><Camera size={16} /></div>
                        <div>
                          <p className="text-[10px] text-muted-gray font-mono uppercase">Sensor</p>
                          <p className="text-xs text-ivory font-medium">45 Megapixel Full-Frame</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded bg-white/5 flex items-center justify-center text-gold-champagne"><Cpu size={16} /></div>
                        <div>
                          <p className="text-[10px] text-muted-gray font-mono uppercase">Video Quality</p>
                          <p className="text-xs text-ivory font-medium">8K RAW Internal Recording</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded bg-white/5 flex items-center justify-center text-gold-champagne"><Layers size={16} /></div>
                        <div>
                          <p className="text-[10px] text-muted-gray font-mono uppercase">System</p>
                          <p className="text-xs text-ivory font-medium">Dual Pixel CMOS AF II</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STAGE 1: Empty Studio Text (0% to 15% scroll) */}
          {!useFallback && (
            <div
              ref={introTextRef}
              className="absolute top-1/2 left-6 md:left-12 -translate-y-1/2 z-20 max-w-xl text-left select-none pointer-events-none"
              style={{ opacity: 0, visibility: "hidden", willChange: "transform, opacity" }}
            >
              <h1 className="serif-heading text-4xl sm:text-5xl lg:text-7xl font-light text-ivory/90 leading-tight">
                {Array.from("Crafted for the Moment.").map((char, index) => (
                  <span
                    key={index}
                    className="intro-heading-char inline-block"
                    style={{ opacity: 0 }}
                  >
                    {char === " " ? "\u00A0" : char}
                  </span>
                ))}
              </h1>
              <p className="text-xs sm:text-sm tracking-[0.3em] uppercase text-gold-champagne/80 mt-4 font-mono font-light scroll-hint-element" style={{ opacity: 0 }}>
                An atmospheric revelation of luxury optics
              </p>
            </div>
          )}

          {/* STAGES 2 & 3: Main Heading (15% to 35% scroll) */}
          {!useFallback && (
            <div
              ref={mainTextRef}
              className="absolute top-1/3 left-6 md:left-12 z-20 flex flex-col space-y-6 md:space-y-8 text-left max-w-2xl select-none"
              style={{ opacity: 0, visibility: "hidden", willChange: "transform, opacity" }}
            >
              <span className="inline-block self-start text-[10px] font-semibold uppercase tracking-[0.25em] text-gold-champagne bg-gold-champagne/10 px-3 py-1 rounded-full border border-gold-champagne/20">
                Premium Camera Rentals
              </span>
              <h2 className="serif-heading text-4xl sm:text-5xl lg:text-7xl font-light text-ivory leading-[1.1] tracking-tight">
                {title ? (
                  <span>{title}</span>
                ) : (
                  <>
                    Professional Gear.<br />
                    <span className="text-gold-champagne font-normal">Extraordinary Stories.</span>
                  </>
                )}
              </h2>
              <p className="text-xs sm:text-sm text-muted-gray max-w-md font-light leading-relaxed">
                {subtitle || "Rent professional cameras, cinema gear and premium lenses for every story worth capturing."}
              </p>
              <div className="flex flex-wrap gap-4 pt-2">
                <MagneticButton onClick={onExploreClick}>
                  <div className="px-8 py-3.5 bg-gold-champagne text-obsidian text-xs font-semibold uppercase tracking-wider rounded hover:bg-gold-champagne/90 transition duration-300 flex items-center gap-2 group cursor-pointer shadow-lg shadow-gold-champagne/10">
                    Explore Gear
                    <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </div>
                </MagneticButton>
                <button
                  onClick={onBookClick}
                  className="px-8 py-3.5 bg-transparent text-ivory text-xs font-semibold uppercase tracking-wider rounded border border-white/20 hover:border-gold-champagne hover:text-gold-champagne transition duration-300 cursor-pointer"
                >
                  Book Now
                </button>
              </div>
            </div>
          )}

          {/* STAGE 5: Floating Specifications Panel (75% to 95% scroll) */}
          {!useFallback && (
            <div
              ref={specsRef}
              className="absolute bottom-24 left-6 md:left-12 lg:left-24 z-20 select-none"
              style={{ opacity: 0, visibility: "hidden", willChange: "transform, opacity" }}
            >
              <div className="bg-charcoal/80 rounded-lg p-6 border border-gold-champagne/20 max-w-sm space-y-4 shadow-2xl backdrop-blur-md">
                <div className="border-b border-white/10 pb-3">
                  <span className="text-[9px] uppercase text-gold-champagne tracking-widest block mb-1 font-mono">Flagship Series</span>
                  <h3 className="serif-heading text-xl text-ivory font-light">Canon EOS R5</h3>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[9px] text-muted-gray font-mono uppercase">Sensor</p>
                    <p className="text-[11px] text-ivory font-medium">45 MP Full-Frame</p>
                  </div>
                  <div>
                    <p className="text-[9px] text-muted-gray font-mono uppercase">Video</p>
                    <p className="text-[11px] text-ivory font-medium">8K RAW Internal</p>
                  </div>
                  <div>
                    <p className="text-[9px] text-muted-gray font-mono uppercase">Focus</p>
                    <p className="text-[11px] text-ivory font-medium">Dual Pixel CMOS II</p>
                  </div>
                  <div>
                    <p className="text-[9px] text-muted-gray font-mono uppercase">Body</p>
                    <p className="text-[11px] text-ivory font-medium">Professional Mirrorless</p>
                  </div>
                </div>
                <div className="pt-2 border-t border-white/5 flex items-center justify-between">
                  <span className="text-[10px] text-gold-champagne font-semibold font-mono">AVAILABLE FOR RENT</span>
                  <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Scroll to Reveal Hint */}
          {!useFallback && (
            <div
              aria-hidden="true"
              className="absolute right-5 md:right-8 top-1/2 -translate-y-1/2 z-20 h-28 w-px bg-white/10 overflow-hidden"
            >
              <div
                ref={progressRef}
                className="h-full w-full origin-top bg-gradient-to-b from-gold-champagne/40 to-gold-champagne"
                style={{ transform: "scaleY(0.02)", willChange: "transform" }}
              />
            </div>
          )}

          {!useFallback && (
            <div
              ref={scrollIndicatorRef}
              className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center justify-center text-center cursor-pointer pointer-events-none"
            >
              <span className="text-[10px] uppercase tracking-[0.3em] text-muted-gray/80 font-light mb-2 font-mono scroll-hint-element" style={{ opacity: 0 }}>
                Scroll to reveal
              </span>
              <div className="w-[1px] h-12 bg-gradient-to-b from-gold-champagne to-transparent scroll-hint-element" style={{ opacity: 0 }}></div>
            </div>
          )}
        </div>
      </div>
    </GridBackground>
  );
}
