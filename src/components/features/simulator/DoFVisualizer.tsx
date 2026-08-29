"use client";

import { OpticalCalculationResult } from "@/lib/utils/optical-calculator";
import { Gauge, Target, Compass } from "lucide-react";

interface DoFVisualizerProps {
  opticalResult: OpticalCalculationResult;
  focalLengthMm: number;
  aperture: number;
  focusDistanceMeters: number;
}

export default function DoFVisualizer({
  opticalResult,
  focalLengthMm,
  aperture,
  focusDistanceMeters,
}: DoFVisualizerProps) {
  // Max scale range in meters for the visual bar (e.g. 20m)
  const maxScaleMeters = Math.max(15, focusDistanceMeters * 2);
  const nearPct = Math.min(100, (opticalResult.nearLimitMeters / maxScaleMeters) * 100);
  const focusPct = Math.min(100, (focusDistanceMeters / maxScaleMeters) * 100);

  const isInfinityFar = opticalResult.farLimitMeters === "Infinity";
  const farPct = isInfinityFar
    ? 100
    : Math.min(100, ((opticalResult.farLimitMeters as number) / maxScaleMeters) * 100);

  const dofWidthPct = Math.max(2, farPct - nearPct);

  return (
    <div className="rounded-2xl border border-white/10 bg-neutral-900/80 p-6 backdrop-blur-xl shadow-xl">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-xs font-bold tracking-widest uppercase text-amber-400">
          <Gauge className="h-4 w-4" />
          Optical Depth of Field & Hyperfocal Scale
        </h3>
        <span className="text-[11px] text-neutral-400 font-mono">
          {focalLengthMm}mm @ T{aperture} • Focus at {focusDistanceMeters}m
        </span>
      </div>

      {/* Visual Graphical Focus Ruler */}
      <div className="relative mt-6 mb-8 h-10 w-full rounded-xl bg-black/60 p-1 border border-white/5">
        {/* Scale tick marks */}
        <div className="absolute inset-x-0 top-0 bottom-0 flex justify-between px-2 text-[9px] text-neutral-600 font-mono">
          <span>0m</span>
          <span>{Math.round(maxScaleMeters * 0.25)}m</span>
          <span>{Math.round(maxScaleMeters * 0.5)}m</span>
          <span>{Math.round(maxScaleMeters * 0.75)}m</span>
          <span>{maxScaleMeters}m+</span>
        </div>

        {/* In-Focus Depth of Field Zone */}
        <div
          className="absolute top-2 bottom-2 rounded bg-amber-400/30 border-y border-amber-400 transition-all duration-300 backdrop-blur-sm"
          style={{
            left: `${nearPct}%`,
            width: `${dofWidthPct}%`,
          }}
        />

        {/* Focus Subject Plane Indicator */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-cyan-400 shadow-[0_0_8px_#22d3ee] transition-all duration-300 z-10"
          style={{ left: `${focusPct}%` }}
        >
          <div className="absolute -top-5 -translate-x-1/2 rounded bg-cyan-400 px-1.5 py-0.5 text-[9px] font-bold text-black font-mono">
            {focusDistanceMeters}m
          </div>
        </div>
      </div>

      {/* Numerical Telemetry Breakdown */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 font-mono">
        <div className="rounded-xl border border-white/5 bg-black/40 p-3">
          <div className="flex items-center gap-1 text-[10px] text-neutral-500 uppercase">
            <Target className="h-3 w-3 text-amber-400" />
            Near Limit
          </div>
          <p className="mt-0.5 text-lg font-bold text-white">
            {opticalResult.nearLimitMeters} m
          </p>
          <span className="text-[9px] text-neutral-400">Sharpness onset</span>
        </div>

        <div className="rounded-xl border border-white/5 bg-black/40 p-3">
          <div className="flex items-center gap-1 text-[10px] text-neutral-500 uppercase">
            <Target className="h-3 w-3 text-cyan-400" />
            Far Limit
          </div>
          <p className="mt-0.5 text-lg font-bold text-white">
            {isInfinityFar ? "∞ (Infinity)" : `${opticalResult.farLimitMeters} m`}
          </p>
          <span className="text-[9px] text-neutral-400">Sharpness falloff</span>
        </div>

        <div className="rounded-xl border border-white/5 bg-black/40 p-3">
          <div className="flex items-center gap-1 text-[10px] text-neutral-500 uppercase">
            <Gauge className="h-3 w-3 text-emerald-400" />
            Total Sharp DoF
          </div>
          <p className="mt-0.5 text-lg font-bold text-emerald-400">
            {opticalResult.totalDofMeters === "Infinity"
              ? "Deep Focus"
              : `${opticalResult.totalDofMeters} m`}
          </p>
          <span className="text-[9px] text-neutral-400">In-focus depth range</span>
        </div>

        <div className="rounded-xl border border-white/5 bg-black/40 p-3">
          <div className="flex items-center gap-1 text-[10px] text-neutral-500 uppercase">
            <Compass className="h-3 w-3 text-amber-400" />
            Hyperfocal Dist.
          </div>
          <p className="mt-0.5 text-lg font-bold text-amber-300">
            {opticalResult.hyperfocalDistanceMeters} m
          </p>
          <span className="text-[9px] text-neutral-400">Max background depth</span>
        </div>
      </div>
    </div>
  );
}
