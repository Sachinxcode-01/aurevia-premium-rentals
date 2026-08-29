"use client";

import { CameraSensorSpec, CINE_CAMERAS } from "@/lib/data/cinematography-data";
import { OpticalCalculationResult } from "@/lib/utils/optical-calculator";

interface SensorComparisonOverlayProps {
  primarySensor: CameraSensorSpec;
  primaryResult: OpticalCalculationResult;
  comparisonSensor: CameraSensorSpec | null;
  comparisonResult: OpticalCalculationResult | null;
  showComparison: boolean;
}

export default function SensorComparisonOverlay({
  primarySensor,
  primaryResult,
  comparisonSensor,
  comparisonResult,
  showComparison,
}: SensorComparisonOverlayProps) {
  // Max bounds for diagram: 46mm width, 26mm height (VistaVision / Large Format)
  const maxDiagramWidthMm = 46.0;
  const maxDiagramHeightMm = 28.0;

  const primaryWidthPct = (primarySensor.sensorWidthMm / maxDiagramWidthMm) * 100;
  const primaryHeightPct = (primarySensor.sensorHeightMm / maxDiagramHeightMm) * 100;

  const compWidthPct = comparisonSensor
    ? (comparisonSensor.sensorWidthMm / maxDiagramWidthMm) * 100
    : 0;
  const compHeightPct = comparisonSensor
    ? (comparisonSensor.sensorHeightMm / maxDiagramHeightMm) * 100
    : 0;

  // Full Frame Reference (36x24mm)
  const ffWidthPct = (36.0 / maxDiagramWidthMm) * 100;
  const ffHeightPct = (24.0 / maxDiagramHeightMm) * 100;

  return (
    <div className="rounded-2xl border border-white/10 bg-neutral-900/80 p-6 backdrop-blur-xl shadow-xl">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-xs font-bold tracking-widest uppercase text-amber-400">
          Physical Sensor Geometry & Crop Map
        </h3>
        <span className="text-[11px] text-neutral-400 font-mono">
          Full Frame 36×24mm Baseline
        </span>
      </div>

      {/* 2D Graphical Sensor Diagram */}
      <div className="relative mx-auto flex aspect-[2/1] w-full max-w-lg items-center justify-center rounded-xl border border-white/5 bg-black/60 p-4">
        {/* Full-Frame 36x24 Reference Box */}
        <div
          className="absolute flex items-center justify-center border border-dashed border-neutral-600/60"
          style={{ width: `${ffWidthPct}%`, height: `${ffHeightPct}%` }}
        >
          <span className="absolute -top-4 text-[9px] font-mono text-neutral-500">
            FF 36×24mm Reference
          </span>
        </div>

        {/* Primary Sensor */}
        <div
          className="absolute flex items-center justify-center rounded border-2 border-amber-400 bg-amber-400/10 backdrop-blur-sm transition-all duration-300 shadow-[0_0_20px_rgba(216,179,106,0.15)]"
          style={{ width: `${primaryWidthPct}%`, height: `${primaryHeightPct}%` }}
        >
          <div className="text-center">
            <span className="block text-[11px] font-bold text-amber-300">
              {primarySensor.name}
            </span>
            <span className="block text-[9px] text-amber-400/80 font-mono">
              {primarySensor.sensorWidthMm} × {primarySensor.sensorHeightMm}mm (Ø {primarySensor.diagonalMm}mm)
            </span>
          </div>
        </div>

        {/* Secondary Comparison Sensor (If Active) */}
        {showComparison && comparisonSensor && (
          <div
            className="absolute flex items-end justify-start rounded border-2 border-dashed border-emerald-400 bg-emerald-400/10 p-1 backdrop-blur-sm transition-all duration-300"
            style={{ width: `${compWidthPct}%`, height: `${compHeightPct}%` }}
          >
            <span className="rounded bg-emerald-950/80 px-1 text-[8px] font-bold text-emerald-400 border border-emerald-500/30">
              {comparisonSensor.name}
            </span>
          </div>
        )}
      </div>

      {/* Telemetry Metric Cards */}
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4 font-mono">
        <div className="rounded-xl border border-white/5 bg-black/40 p-3">
          <span className="text-[10px] text-neutral-500 uppercase">Crop Factor</span>
          <p className="mt-0.5 text-lg font-bold text-white">{primaryResult.cropFactor}x</p>
          <span className="text-[9px] text-neutral-400">vs 35mm Full Frame</span>
        </div>

        <div className="rounded-xl border border-white/5 bg-black/40 p-3">
          <span className="text-[10px] text-neutral-500 uppercase">Native Aspect</span>
          <p className="mt-0.5 text-lg font-bold text-amber-400">{primaryResult.nativeAspectRatio}:1</p>
          <span className="text-[9px] text-neutral-400">{primarySensor.resolutionLabel}</span>
        </div>

        <div className="rounded-xl border border-white/5 bg-black/40 p-3">
          <span className="text-[10px] text-neutral-500 uppercase">Diagonal Image</span>
          <p className="mt-0.5 text-lg font-bold text-white">{primarySensor.diagonalMm} mm</p>
          <span className="text-[9px] text-neutral-400">Circle Required</span>
        </div>

        <div className="rounded-xl border border-white/5 bg-black/40 p-3">
          <span className="text-[10px] text-neutral-500 uppercase">Equivalent 35mm</span>
          <p className="mt-0.5 text-lg font-bold text-amber-400">
            {primaryResult.equivalentFocalLengthMm} mm
          </p>
          <span className="text-[9px] text-neutral-400">Field-of-View Match</span>
        </div>
      </div>
    </div>
  );
}
