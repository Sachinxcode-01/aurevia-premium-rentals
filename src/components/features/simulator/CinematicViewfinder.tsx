"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { Maximize2, Minimize2, Eye, Sparkles, Grid3X3, Crosshair, AlertTriangle } from "lucide-react";
import { CameraSensorSpec, FrameLineSpec, SimulationScene } from "@/lib/data/cinematography-data";
import { OpticalCalculationResult } from "@/lib/utils/optical-calculator";

interface CinematicViewfinderProps {
  sensor: CameraSensorSpec;
  focalLengthMm: number;
  squeezeFactor: number;
  aperture: number;
  activeScene: SimulationScene;
  activeFrameLine: FrameLineSpec | null;
  opticalResult: OpticalCalculationResult;
  comparisonSensor?: CameraSensorSpec | null;
  comparisonOpticalResult?: OpticalCalculationResult | null;
  showComparison: boolean;
}

export default function CinematicViewfinder({
  sensor,
  focalLengthMm,
  squeezeFactor,
  aperture,
  activeScene,
  activeFrameLine,
  opticalResult,
  comparisonSensor,
  comparisonOpticalResult,
  showComparison,
}: CinematicViewfinderProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showGrid, setShowGrid] = useState(false);
  const [showCrosshair, setShowCrosshair] = useState(true);
  const [showAnamorphicFlare, setShowAnamorphicFlare] = useState(true);
  const [frameLineOpacity, setFrameLineOpacity] = useState(0.85);

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  // Compute transform scale for focal length and anamorphic squeeze
  // Optical zoom adjusts scale, anamorphic squeeze expands width
  const zoomScale = opticalResult.viewfinderScale;
  const isAnamorphic = squeezeFactor > 1.0;

  // Aperture blur simulation for background depth
  // Smaller aperture number = shallower DoF = more blur
  const depthBlurPx = aperture <= 1.4 ? 4 : aperture <= 2.0 ? 2.5 : aperture <= 2.8 ? 1.2 : 0;

  // Determine frame line dimensions relative to 16:9 container aspect
  // Container standard is 16:9 (1.777)
  const containerAspect = 16 / 9;
  let frameMaskWidthPct = 100;
  let frameMaskHeightPct = 100;

  if (activeFrameLine) {
    if (activeFrameLine.ratio > containerAspect) {
      // Wider than 16:9 (e.g. 2.39:1 Scope) -> Letterbox top/bottom
      frameMaskHeightPct = (containerAspect / activeFrameLine.ratio) * 100;
      frameMaskWidthPct = 100;
    } else {
      // Taller than 16:9 (e.g. 4:3 or 9:16) -> Pillarbox sides
      frameMaskWidthPct = (activeFrameLine.ratio / containerAspect) * 100;
      frameMaskHeightPct = 100;
    }
  }

  return (
    <div
      ref={containerRef}
      className={`relative w-full overflow-hidden rounded-2xl border border-white/10 bg-black font-mono shadow-2xl transition-all duration-300 ${
        isFullscreen ? "h-screen w-screen rounded-none" : "aspect-[16/9] min-h-[380px] lg:min-h-[520px]"
      }`}
    >
      {/* ─── LIVE SCENE IMAGE SIMULATOR ─── */}
      <div className="absolute inset-0 flex items-center justify-center overflow-hidden bg-neutral-950">
        <div
          className="relative h-full w-full transition-transform duration-500 ease-out"
          style={{
            transform: `scale(${zoomScale})`,
            transformOrigin: "center center",
          }}
        >
          <div
            className="relative h-full w-full transition-transform duration-500 ease-out"
            style={{
              transform: isAnamorphic ? `scaleX(${opticalResult.horizontalStretchScale})` : "none",
              transformOrigin: "center center",
            }}
          >
            <Image
              src={activeScene.imageUrl}
              alt={activeScene.title}
              fill
              priority
              sizes="(max-width: 1200px) 100vw, 1200px"
              className="object-cover transition-[filter] duration-300"
              style={{
                filter: depthBlurPx > 0 ? `blur(${depthBlurPx}px)` : "none",
              }}
            />
          </div>
        </div>

        {/* Anamorphic Horizontal Streak & Oval Bokeh Simulation Overlay */}
        {isAnamorphic && showAnamorphicFlare && activeScene.hasLights && (
          <div className="pointer-events-none absolute inset-0 mix-blend-screen opacity-70 transition-opacity duration-300">
            {/* Horizontal Blue/Gold Anamorphic streak */}
            <div className="absolute top-1/2 left-0 h-[2px] w-full -translate-y-1/2 bg-gradient-to-r from-transparent via-cyan-400/80 to-transparent blur-[1px]" />
            <div className="absolute top-1/2 left-0 h-[8px] w-full -translate-y-1/2 bg-gradient-to-r from-transparent via-amber-300/40 to-transparent blur-[4px]" />
            <div className="absolute top-[38%] left-1/4 h-[1px] w-1/2 bg-gradient-to-r from-transparent via-cyan-300/60 to-transparent blur-[1px]" />
            {/* Oval bokeh reflections */}
            <div className="absolute top-1/3 right-1/4 h-16 w-8 rounded-full border border-cyan-400/30 bg-cyan-500/10 blur-[2px]" />
            <div className="absolute bottom-1/3 left-1/3 h-20 w-10 rounded-full border border-amber-400/30 bg-amber-500/10 blur-[3px]" />
          </div>
        )}

        {/* Optical Vignetting / Image Circle Border Warning */}
        {opticalResult.hasVignetting && (
          <div className="pointer-events-none absolute inset-0 z-10">
            <div
              className="absolute inset-0 rounded-full border-[60px] border-black/90 shadow-[inset_0_0_100px_rgba(0,0,0,0.95)]"
              style={{ transform: "scale(1.05)" }}
            />
          </div>
        )}
      </div>

      {/* ─── CINEMATIC FRAME LINES & MASKS ─── */}
      {activeFrameLine && (
        <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center">
          {/* Top Mask */}
          <div
            className="absolute top-0 right-0 left-0 bg-black transition-all duration-300"
            style={{
              height: `${(100 - frameMaskHeightPct) / 2}%`,
              opacity: frameLineOpacity,
            }}
          />
          {/* Bottom Mask */}
          <div
            className="absolute right-0 bottom-0 left-0 bg-black transition-all duration-300"
            style={{
              height: `${(100 - frameMaskHeightPct) / 2}%`,
              opacity: frameLineOpacity,
            }}
          />
          {/* Left Mask */}
          <div
            className="absolute top-0 bottom-0 left-0 bg-black transition-all duration-300"
            style={{
              width: `${(100 - frameMaskWidthPct) / 2}%`,
              opacity: frameLineOpacity,
            }}
          />
          {/* Right Mask */}
          <div
            className="absolute top-0 right-0 bottom-0 bg-black transition-all duration-300"
            style={{
              width: `${(100 - frameMaskWidthPct) / 2}%`,
              opacity: frameLineOpacity,
            }}
          />

          {/* Active Frame Line Box */}
          <div
            className="relative transition-all duration-300"
            style={{
              width: `${frameMaskWidthPct}%`,
              height: `${frameMaskHeightPct}%`,
              boxShadow: `0 0 0 1.5px ${activeFrameLine.color}90`,
            }}
          >
            {/* Aspect Ratio Watermark */}
            <div
              className="absolute top-2 left-2 rounded px-1.5 py-0.5 text-[10px] font-semibold tracking-wider uppercase backdrop-blur-md"
              style={{
                backgroundColor: `${activeFrameLine.color}20`,
                color: activeFrameLine.color,
                border: `1px solid ${activeFrameLine.color}50`,
              }}
            >
              {activeFrameLine.ratioLabel} • {activeFrameLine.name}
            </div>

            {/* Corner Marker Brackets */}
            <div className="absolute top-0 left-0 h-4 w-4 border-t-2 border-l-2 border-amber-400" />
            <div className="absolute top-0 right-0 h-4 w-4 border-t-2 border-r-2 border-amber-400" />
            <div className="absolute bottom-0 left-0 h-4 w-4 border-b-2 border-l-2 border-amber-400" />
            <div className="absolute right-0 bottom-0 h-4 w-4 border-r-2 border-b-2 border-amber-400" />
          </div>
        </div>
      )}

      {/* ─── DUAL SENSOR COMPARISON OVERLAY (IF ENABLED) ─── */}
      {showComparison && comparisonSensor && comparisonOpticalResult && (
        <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center">
          <div
            className="relative border-2 border-dashed border-emerald-400/90 transition-all duration-300"
            style={{
              width: `${Math.min(95, (comparisonSensor.sensorWidthMm / sensor.sensorWidthMm) * 80)}%`,
              height: `${Math.min(95, (comparisonSensor.sensorHeightMm / sensor.sensorHeightMm) * 80)}%`,
            }}
          >
            <div className="absolute right-2 bottom-2 rounded bg-emerald-950/80 px-2 py-0.5 text-[10px] font-semibold text-emerald-400 backdrop-blur-md border border-emerald-500/40">
              {comparisonSensor.name} ({comparisonSensor.format}) • {comparisonOpticalResult.cropFactor}x Crop
            </div>
          </div>
        </div>
      )}

      {/* ─── RULE OF THIRDS GRID ─── */}
      {showGrid && (
        <div className="pointer-events-none absolute inset-0 z-20">
          <div className="absolute top-1/3 left-0 h-px w-full bg-white/20" />
          <div className="absolute top-2/3 left-0 h-px w-full bg-white/20" />
          <div className="absolute top-0 left-1/3 h-full w-px bg-white/20" />
          <div className="absolute top-0 left-2/3 h-full w-px bg-white/20" />
        </div>
      )}

      {/* ─── CENTER CROSSHAIR ─── */}
      {showCrosshair && (
        <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center">
          <div className="relative flex items-center justify-center">
            <div className="h-4 w-px bg-amber-400/80" />
            <div className="absolute h-px w-4 bg-amber-400/80" />
            <div className="h-1.5 w-1.5 rounded-full border border-amber-400/90" />
          </div>
        </div>
      )}

      {/* ─── HUD TELEMETRY OVERLAY (TOP BAR) ─── */}
      <div className="absolute top-0 right-0 left-0 z-30 flex items-center justify-between border-b border-white/10 bg-gradient-to-b from-black/80 via-black/40 to-transparent p-3 text-[11px] text-neutral-300 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 rounded-md bg-amber-500/20 px-2 py-0.5 font-bold text-amber-400 border border-amber-500/30">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
            REC 4K RAW
          </div>
          <span className="font-semibold text-white">{sensor.name}</span>
          <span className="hidden text-neutral-400 md:inline">
            ({sensor.sensorWidthMm.toFixed(1)} × {sensor.sensorHeightMm.toFixed(1)}mm)
          </span>
          <span className="rounded bg-white/10 px-1.5 py-0.5 text-[10px] text-neutral-300">
            {sensor.format}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {opticalResult.hasVignetting && (
            <div className="flex items-center gap-1 rounded bg-rose-500/20 px-2 py-0.5 text-[10px] font-semibold text-rose-400 border border-rose-500/30">
              <AlertTriangle className="h-3 w-3" />
              Vignetting Risk ({opticalResult.imageCircleCoveragePercentage}%)
            </div>
          )}

          <div className="hidden items-center gap-3 text-neutral-400 sm:flex">
            <span>FPS: <strong className="text-white">24.00</strong></span>
            <span>SHUTTER: <strong className="text-white">180.0°</strong></span>
            <span>WB: <strong className="text-white">5600K</strong></span>
            <span>ISO: <strong className="text-white">800</strong></span>
          </div>
        </div>
      </div>

      {/* ─── HUD TELEMETRY OVERLAY (BOTTOM BAR) ─── */}
      <div className="absolute right-0 bottom-0 left-0 z-30 flex flex-wrap items-center justify-between gap-2 border-t border-white/10 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-3 text-[11px] text-neutral-300 backdrop-blur-sm">
        <div className="flex flex-wrap items-center gap-3">
          <div>
            <span className="text-neutral-500">LENS:</span>{" "}
            <strong className="text-amber-400">{focalLengthMm}mm</strong>{" "}
            <span className="text-neutral-500">T{aperture}</span>
          </div>

          <div>
            <span className="text-neutral-500">H-FOV:</span>{" "}
            <strong className="text-white">{opticalResult.horizontalFovDeg}°</strong>
          </div>

          <div>
            <span className="text-neutral-500">V-FOV:</span>{" "}
            <strong className="text-white">{opticalResult.verticalFovDeg}°</strong>
          </div>

          <div className="hidden sm:inline-block">
            <span className="text-neutral-500">CROP:</span>{" "}
            <strong className="text-white">{opticalResult.cropFactor}x</strong>{" "}
            <span className="text-neutral-500">(Eq. {opticalResult.equivalentFocalLengthMm}mm)</span>
          </div>

          {isAnamorphic && (
            <div className="rounded bg-cyan-500/20 px-1.5 py-0.5 text-[10px] font-bold text-cyan-300 border border-cyan-500/30">
              {squeezeFactor}x SQUEEZE → {opticalResult.desqueezedAspectRatio}:1
            </div>
          )}
        </div>

        {/* Viewfinder Controls Toolbar */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setShowGrid(!showGrid)}
            title="Toggle Rule-of-Thirds Grid"
            className={`rounded p-1.5 transition-colors ${
              showGrid ? "bg-amber-400 text-black" : "bg-white/10 text-white hover:bg-white/20"
            }`}
          >
            <Grid3X3 className="h-3.5 w-3.5" />
          </button>

          <button
            onClick={() => setShowCrosshair(!showCrosshair)}
            title="Toggle Center Crosshair"
            className={`rounded p-1.5 transition-colors ${
              showCrosshair ? "bg-amber-400 text-black" : "bg-white/10 text-white hover:bg-white/20"
            }`}
          >
            <Crosshair className="h-3.5 w-3.5" />
          </button>

          {isAnamorphic && (
            <button
              onClick={() => setShowAnamorphicFlare(!showAnamorphicFlare)}
              title="Toggle Anamorphic Flare & Bokeh"
              className={`rounded p-1.5 transition-colors ${
                showAnamorphicFlare ? "bg-cyan-400 text-black" : "bg-white/10 text-white hover:bg-white/20"
              }`}
            >
              <Sparkles className="h-3.5 w-3.5" />
            </button>
          )}

          <button
            onClick={toggleFullscreen}
            title={isFullscreen ? "Exit Fullscreen" : "Enter Viewfinder Fullscreen"}
            className="rounded bg-white/10 p-1.5 text-white hover:bg-white/20 transition-colors"
          >
            {isFullscreen ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
          </button>
        </div>
      </div>
    </div>
  );
}
