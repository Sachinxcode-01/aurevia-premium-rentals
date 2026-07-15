"use client";

import { useEffect, useRef, useState } from "react";
import { animate, createTimeline, stagger } from "animejs";
import { ArrowRight, Play, Cpu, Camera, Layers, CheckCircle } from "lucide-react";

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
}

export default function HeroScrollSequence({
  onExploreClick,
  onBookClick,
}: HeroScrollSequenceProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Text refs for scroll-based animation (avoiding React state re-renders)
  const introTextRef = useRef<HTMLDivElement>(null);
  const mainTextRef = useRef<HTMLDivElement>(null);
  const specsRef = useRef<HTMLDivElement>(null);
  const scrollIndicatorRef = useRef<HTMLDivElement>(null);

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

  // State-gates for scroll-triggered Anime.js animations
  const isIntroFadedRef = useRef(false);
  const isMainVisibleRef = useRef(false);
  const isSpecsVisibleRef = useRef(false);
  const isFadedOutRef = useRef(false);

  // Tracking visibility of Hero for performance optimization
  const isVisibleRef = useRef(true);

  useEffect(() => {
    // 1. Feature Detection: Fallback if prefers-reduced-motion is true
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    const isMobile = window.innerWidth < 768; // basic performance guard

    if (prefersReducedMotion || isMobile) {
      setUseFallback(true);
      setIsPreloaded(true);
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      setUseFallback(true);
      setIsPreloaded(true);
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

    // 2. Progressive Loading Strategy
    // Load first critical frames (1 to 30) immediately for initial smooth scroll
    const criticalFrames: number[] = [];
    for (let i = 1; i <= 30; i++) {
      criticalFrames.push(i);
    }
    const milestones = [50, 75, 100, 125, 150, 175, 200, 210];
    milestones.forEach((f) => {
      if (!criticalFrames.includes(f)) {
        criticalFrames.push(f);
      }
    });

    const remainingFrames: number[] = [];
    for (let i = 1; i <= TOTAL_FRAMES; i++) {
      if (!criticalFrames.includes(i)) {
        remainingFrames.push(i);
      }
    }

    let isDestroyed = false;

    // Draw frame on canvas with object-fit: cover logic while keeping camera in view
    const drawFrame = (index: number) => {
      let img = imagesCacheRef.current[index];
      
      // Cache-miss fallback: search for closest loaded frame to prevent flickering
      if (!img) {
        for (let i = index - 1; i >= 1; i--) {
          if (imagesCacheRef.current[i]) {
            img = imagesCacheRef.current[i];
            break;
          }
        }
        if (!img) {
          for (let i = index + 1; i <= TOTAL_FRAMES; i++) {
            if (imagesCacheRef.current[i]) {
              img = imagesCacheRef.current[i];
              break;
            }
          }
        }
      }

      const canvasCtx = canvasContextRef.current;
      if (!img || !canvas || !canvasCtx) return;

      const dpr = window.devicePixelRatio || 1;
      const w = canvas.width / dpr;
      const h = canvas.height / dpr;

      // 16:9 original aspect ratio of assets
      const assetRatio = 1920 / 1080;
      const canvasRatio = w / h;

      let drawWidth = w;
      let drawHeight = h;
      let offsetX = 0;
      let offsetY = 0;

      if (canvasRatio > assetRatio) {
        drawHeight = w / assetRatio;
        offsetY = (h - drawHeight) / 2;
      } else {
        drawWidth = h * assetRatio;
        // Keep camera on the right visible by shifting offset
        offsetX = w > 1024 ? (w - drawWidth) * 0.35 : (w - drawWidth) * 0.5;
      }

      canvasCtx.clearRect(0, 0, w, h);
      canvasCtx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
    };

    // Set canvas dimensions supporting high-DPI displays
    const resizeCanvas = () => {
      if (!canvas) return;
      const dpr = window.devicePixelRatio || 1;
      canvas.width = canvas.clientWidth * dpr;
      canvas.height = canvas.clientHeight * dpr;
      ctx.scale(dpr, dpr);
      // Re-draw current frame
      drawFrame(frameIndexRef.current);
    };

    window.addEventListener("resize", resizeCanvas);
    resizeCanvas();

    // Load an individual frame
    const loadFrame = (index: number): Promise<HTMLImageElement> => {
      return new Promise((resolve, reject) => {
        if (imagesCacheRef.current[index]) {
          resolve(imagesCacheRef.current[index]!);
          return;
        }

        const img = new Image();
        img.src = getFrameUrl(index);
        img.onload = () => {
          if (isDestroyed) return;
          // Decode offscreen to avoid main-thread stuttering
          if (img.decode) {
            img
              .decode()
              .then(() => {
                imagesCacheRef.current[index] = img;
                loadedCountRef.current += 1;
                const progress = Math.min(
                  99,
                  Math.round((loadedCountRef.current / TOTAL_FRAMES) * 100)
                );
                setLoadingProgress(progress);
                resolve(img);
              })
              .catch(() => {
                imagesCacheRef.current[index] = img;
                loadedCountRef.current += 1;
                resolve(img);
              });
          } else {
            imagesCacheRef.current[index] = img;
            loadedCountRef.current += 1;
            resolve(img);
          }
        };
        img.onerror = () => {
          reject(new Error(`Failed to load frame ${index}`));
        };
      });
    };

    // Preload critical frames first
    Promise.all(criticalFrames.map((f) => loadFrame(f).catch(() => null)))
      .then(() => {
        if (isDestroyed) return;
        // Draw the first frame immediately once it's loaded to prevent blank screen
        drawFrame(1);
        setIsPreloaded(true);
        setLoadingProgress(100);

        // Progressively load the rest of the frames in background batches
        const loadRemainingBatches = async () => {
          const batchSize = 15;
          for (let i = 0; i < remainingFrames.length; i += batchSize) {
            if (isDestroyed) break;
            const batch = remainingFrames.slice(i, i + batchSize);
            await Promise.all(batch.map((f) => loadFrame(f).catch(() => null)));
            // Small break between batches
            await new Promise((resolve) => setTimeout(resolve, 50));
          }
        };

        loadRemainingBatches();
      })
      .catch((err) => {
        console.error("Critical frames load error, falling back to video", err);
        setUseFallback(true);
      });

    // 3. Scroll Render Loop with Lerp Interpolation
    let targetFrame = 1;
    let currentFrame = 1;
    let animationFrameId = 0;

    const tick = () => {
      const container = containerRef.current;
      if (!container || !canvas || !isVisibleRef.current) return;

      const rect = container.getBoundingClientRect();
      const scrollHeight = rect.height - window.innerHeight;
      if (scrollHeight <= 0) return;

      const scrolled = -rect.top;
      let progress = scrolled / scrollHeight;
      progress = Math.max(0, Math.min(1, progress));

      // Map progress to target frame index (1 to 210)
      targetFrame = progress * (TOTAL_FRAMES - 1) + 1;

      // Lerp current frame towards target frame
      const diff = targetFrame - currentFrame;
      if (Math.abs(diff) > 0.05) {
        currentFrame += diff * 0.55;
        animationFrameId = requestAnimationFrame(tick);
      } else {
        currentFrame = targetFrame;
      }

      const roundedFrame = Math.max(1, Math.min(TOTAL_FRAMES, Math.round(currentFrame)));
      if (roundedFrame !== frameIndexRef.current) {
        frameIndexRef.current = roundedFrame;
        drawFrame(roundedFrame);
      }

      // Calculate progress of current rendering frame for synced text fades
      const animProgress = (currentFrame - 1) / (TOTAL_FRAMES - 1);

      // Scale down and fade out canvas at the end of the scroll sequence using Anime.js
      if (canvas) {
        if (animProgress >= 0.82) {
          if (!isFadedOutRef.current) {
            isFadedOutRef.current = true;
            animate(canvas, {
              scale: 0.92,
              opacity: 0,
              duration: 350,
              easing: "easeOutQuad",
            });
          }
        } else {
          if (isFadedOutRef.current) {
            isFadedOutRef.current = false;
            animate(canvas, {
              scale: 1,
              opacity: 1,
              duration: 350,
              easing: "easeOutQuad",
            });
          }
        }
      }

      // 4. Staged Text and Overlay Animations using State-Gated Anime.js
      const introText = introTextRef.current;
      const mainText = mainTextRef.current;
      const specs = specsRef.current;
      const scrollIndicator = scrollIndicatorRef.current;

      // Scroll hint fades out early (directly tied for immediate feedback)
      if (scrollIndicator) {
        scrollIndicator.style.opacity = String(Math.max(0, 1 - animProgress * 8));
      }

      // Stage 1: Empty Studio intro (0% to 15% scroll)
      if (introText) {
        if (animProgress < 0.12) {
          if (isIntroFadedRef.current) {
            isIntroFadedRef.current = false;
            introText.style.display = "block";
            animate(introText, {
              opacity: 1,
              translateY: 0,
              duration: 400,
              easing: "easeOutQuad",
            });
          }
        } else {
          if (!isIntroFadedRef.current) {
            isIntroFadedRef.current = true;
            animate(introText, {
              opacity: 0,
              translateY: -50,
              duration: 400,
              easing: "easeOutQuad",
              complete: () => {
                if (isIntroFadedRef.current) introText.style.display = "none";
              },
            });
          }
        }
      }

      // Stage 2: Main headings (12% to 30% scroll)
      if (mainText) {
        if (animProgress >= 0.12 && animProgress < 0.30) {
          if (!isMainVisibleRef.current) {
            isMainVisibleRef.current = true;
            mainText.style.display = "flex";
            animate(mainText, {
              opacity: 1,
              translateY: 0,
              duration: 500,
              easing: "easeOutQuint",
            });
          }
        } else {
          if (isMainVisibleRef.current) {
            isMainVisibleRef.current = false;
            animate(mainText, {
              opacity: 0,
              translateY: -50,
              duration: 400,
              easing: "easeOutQuad",
              complete: () => {
                if (!isMainVisibleRef.current) mainText.style.display = "none";
              },
            });
          }
        }
      }

      // Stage 3: Specs panel (Canon EOS R5 details) near 80% scroll
      if (specs) {
        if (animProgress >= 0.75 && animProgress < 0.95) {
          if (!isSpecsVisibleRef.current) {
            isSpecsVisibleRef.current = true;
            specs.style.display = "block";
            animate(specs, {
              opacity: 1,
              translateX: 0,
              duration: 500,
              easing: "easeOutQuint",
            });
          }
        } else {
          if (isSpecsVisibleRef.current) {
            isSpecsVisibleRef.current = false;
            animate(specs, {
              opacity: 0,
              translateX: 50,
              duration: 400,
              easing: "easeOutQuad",
              complete: () => {
                if (!isSpecsVisibleRef.current) specs.style.display = "none";
              },
            });
          }
        }
      }
    };

    const handleScroll = () => {
      cancelAnimationFrame(animationFrameId);
      animationFrameId = requestAnimationFrame(tick);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    // Initial draw & scroll call
    tick();

    return () => {
      isDestroyed = true;
      window.removeEventListener("resize", resizeCanvas);
      window.removeEventListener("scroll", handleScroll);
      cancelAnimationFrame(animationFrameId);
      observer.disconnect();
      // Clear image cache references
      imagesCacheRef.current = [];
    };
  }, [useFallback]);

  // Anime.js Entry Animations once preloaded
  useEffect(() => {
    if (isPreloaded && !useFallback) {
      // Small intro bounce/fade for scroll hint and empty studio text
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
    <div
      ref={containerRef}
      id="hero-scroll-section"
      className="relative w-full bg-obsidian"
      style={{ height: useFallback ? "100vh" : "400vh" }}
    >
      {/* 1. Loading Overlay */}
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
        <div className="absolute inset-0 gold-glow opacity-60 mix-blend-screen pointer-events-none z-10" />
        <div className="absolute inset-0 cinematic-vignette z-15" />

        {/* 2. Interactive Canvas Sequence */}
        {!useFallback ? (
          <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full object-cover pointer-events-none"
            style={{ filter: "brightness(0.95) contrast(1.05)", willChange: "transform, opacity" }}
          />
        ) : (
          /* 3. Performance / Mobile Fallback Video */
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

        {/* ==============================================
            TEXT OVERLAYS (STAGED VIA SCROLL)
            ============================================== */}

        {/* Fallback Viewport Static Overlay (When video is used directly) */}
        {useFallback && (
          <div className="absolute inset-0 z-20 flex items-center bg-gradient-to-r from-obsidian via-obsidian/60 to-transparent">
            <div className="max-w-7xl mx-auto px-6 md:px-12 w-full grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div className="space-y-6 md:space-y-8 text-left">
                <span className="inline-block text-[11px] font-semibold uppercase tracking-[0.3em] text-gold-champagne bg-gold-champagne/10 px-3 py-1 rounded-full border border-gold-champagne/20">
                  Premium Camera Rentals
                </span>
                <h1 className="serif-heading text-4xl sm:text-5xl lg:text-7xl font-light text-ivory leading-[1.1] tracking-tight">
                  Professional Gear.<br />
                  <span className="text-gold">Extraordinary Stories.</span>
                </h1>
                <p className="text-sm sm:text-base text-muted-gray max-w-md font-light leading-relaxed">
                  Rent professional cameras, cinema gear and premium lenses for every story worth capturing. Experienced by industry masters.
                </p>
                <div className="flex flex-wrap gap-4 pt-2">
                  <button
                    onClick={onExploreClick}
                    className="relative px-8 py-3.5 bg-gold-champagne text-obsidian text-xs font-semibold uppercase tracking-wider rounded hover:bg-gold-warm transition duration-300 flex items-center gap-2 group cursor-pointer shadow-lg shadow-gold-champagne/10"
                  >
                    Explore Gear
                    <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </button>
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
                <div className="glass-panel-gold rounded-lg p-8 border-gold-border max-w-sm space-y-6 shadow-2xl backdrop-blur-md">
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
            style={{ display: "none" }}
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
            style={{ display: "none" }}
          >
            <span className="inline-block self-start text-[10px] font-semibold uppercase tracking-[0.25em] text-gold-champagne bg-gold-champagne/10 px-3 py-1 rounded-full border border-gold-champagne/20">
              Premium Camera Rentals
            </span>
            <h2 className="serif-heading text-4xl sm:text-5xl lg:text-7xl font-light text-ivory leading-[1.1] tracking-tight">
              Professional Gear.<br />
              <span className="text-gold">Extraordinary Stories.</span>
            </h2>
            <p className="text-xs sm:text-sm text-muted-gray max-w-md font-light leading-relaxed">
              Rent professional cameras, cinema gear and premium lenses for every story worth capturing.
            </p>
            <div className="flex flex-wrap gap-4 pt-2">
              <button
                onClick={onExploreClick}
                className="relative px-8 py-3.5 bg-gold-champagne text-obsidian text-xs font-semibold uppercase tracking-wider rounded hover:bg-gold-warm transition duration-300 flex items-center gap-2 group cursor-pointer shadow-lg shadow-gold-champagne/10"
              >
                Explore Gear
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </button>
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
            style={{ display: "none" }}
          >
            <div className="glass-panel-gold rounded-lg p-6 border-gold-border max-w-sm space-y-4 shadow-2xl backdrop-blur-md">
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

        {/* 4. Scroll to Reveal Hint */}
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
  );
}
