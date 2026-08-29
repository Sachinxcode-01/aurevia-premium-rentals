"use client";

import {
  CINE_CAMERAS,
  CameraSensorSpec,
  ANAMORPHIC_SQUEEZE_PRESETS,
  FRAME_LINES,
  FrameLineSpec,
  PRIME_FOCAL_LENGTHS,
  APERTURE_STOPS,
  SIMULATION_SCENES,
  SimulationScene,
} from "@/lib/data/cinematography-data";
import { Camera, Film, Sliders, Layers, Eye, Disc } from "lucide-react";

interface OpticalControlsPanelProps {
  selectedCamera: CameraSensorSpec;
  onSelectCamera: (cam: CameraSensorSpec) => void;
  focalLengthMm: number;
  onChangeFocalLength: (val: number) => void;
  squeezeFactor: number;
  onChangeSqueeze: (val: number) => void;
  aperture: number;
  onChangeAperture: (val: number) => void;
  focusDistanceMeters: number;
  onChangeFocusDistance: (val: number) => void;
  activeFrameLine: FrameLineSpec | null;
  onSelectFrameLine: (fl: FrameLineSpec | null) => void;
  activeScene: SimulationScene;
  onSelectScene: (scene: SimulationScene) => void;
  showComparison: boolean;
  onToggleComparison: (val: boolean) => void;
  comparisonCamera: CameraSensorSpec | null;
  onSelectComparisonCamera: (cam: CameraSensorSpec) => void;
}

export default function OpticalControlsPanel({
  selectedCamera,
  onSelectCamera,
  focalLengthMm,
  onChangeFocalLength,
  squeezeFactor,
  onChangeSqueeze,
  aperture,
  onChangeAperture,
  focusDistanceMeters,
  onChangeFocusDistance,
  activeFrameLine,
  onSelectFrameLine,
  activeScene,
  onSelectScene,
  showComparison,
  onToggleComparison,
  comparisonCamera,
  onSelectComparisonCamera,
}: OpticalControlsPanelProps) {
  return (
    <div className="space-y-6 rounded-2xl border border-white/10 bg-neutral-900/80 p-6 backdrop-blur-xl shadow-xl">
      {/* ─── 1. CAMERA / SENSOR SELECTION ─── */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <label className="flex items-center gap-2 text-xs font-bold tracking-widest uppercase text-amber-400">
            <Camera className="h-4 w-4" />
            1. Primary Camera & Sensor Format
          </label>
          <span className="rounded bg-amber-400/10 px-2 py-0.5 text-[11px] font-semibold text-amber-300 border border-amber-400/20">
            {selectedCamera.format}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {CINE_CAMERAS.map((cam) => {
            const isSelected = cam.id === selectedCamera.id;
            return (
              <button
                key={cam.id}
                onClick={() => onSelectCamera(cam)}
                className={`relative flex flex-col items-start rounded-xl p-3 text-left transition-all ${
                  isSelected
                    ? "border-amber-400 bg-amber-400/10 text-white shadow-lg ring-1 ring-amber-400/50"
                    : "border border-white/5 bg-black/40 text-neutral-400 hover:border-white/20 hover:text-white"
                }`}
              >
                <div className="flex w-full items-center justify-between gap-1">
                  <span className="text-[10px] font-bold tracking-wider uppercase text-neutral-500">
                    {cam.brand}
                  </span>
                  {cam.badge && (
                    <span className="text-[9px] text-amber-400 font-medium">{cam.badge}</span>
                  )}
                </div>
                <span className="mt-0.5 text-xs font-semibold text-white line-clamp-1">{cam.name}</span>
                <span className="mt-1 text-[10px] text-neutral-400 font-mono">
                  {cam.sensorWidthMm} × {cam.sensorHeightMm}mm
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ─── 2. FOCAL LENGTH (LENS) CONTROLS ─── */}
      <div className="border-t border-white/5 pt-5">
        <div className="mb-3 flex items-center justify-between">
          <label className="flex items-center gap-2 text-xs font-bold tracking-widest uppercase text-amber-400">
            <Sliders className="h-4 w-4" />
            2. Lens Focal Length
          </label>
          <div className="flex items-center gap-2 font-mono text-sm">
            <span className="text-neutral-400">Focal:</span>
            <span className="rounded bg-black px-2.5 py-1 text-base font-bold text-amber-400 border border-white/10">
              {focalLengthMm} mm
            </span>
          </div>
        </div>

        {/* Continuous Slider */}
        <div className="space-y-2">
          <input
            type="range"
            min={12}
            max={200}
            step={1}
            value={focalLengthMm}
            onChange={(e) => onChangeFocalLength(Number(e.target.value))}
            className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-neutral-800 accent-amber-400"
          />
          <div className="flex justify-between text-[10px] text-neutral-500 font-mono">
            <span>12mm (Ultra-Wide)</span>
            <span>35mm</span>
            <span>50mm (Normal)</span>
            <span>85mm (Portrait)</span>
            <span>200mm (Tele)</span>
          </div>
        </div>

        {/* Quick Cine Prime Buttons */}
        <div className="mt-3 flex flex-wrap gap-1.5">
          {PRIME_FOCAL_LENGTHS.map((fl) => (
            <button
              key={fl}
              onClick={() => onChangeFocalLength(fl)}
              className={`rounded-lg px-2.5 py-1 text-xs font-mono font-medium transition-colors ${
                focalLengthMm === fl
                  ? "bg-amber-400 text-black font-bold"
                  : "bg-black/60 text-neutral-400 hover:bg-neutral-800 hover:text-white border border-white/5"
              }`}
            >
              {fl}mm
            </button>
          ))}
        </div>
      </div>

      {/* ─── 3. ANAMORPHIC SQUEEZE FACTOR ─── */}
      <div className="border-t border-white/5 pt-5">
        <div className="mb-3 flex items-center justify-between">
          <label className="flex items-center gap-2 text-xs font-bold tracking-widest uppercase text-cyan-400">
            <Film className="h-4 w-4" />
            3. Anamorphic Squeeze Ratio
          </label>
          <span className="text-xs text-neutral-400 font-mono">
            {squeezeFactor > 1.0 ? `${squeezeFactor}x Squeeze` : "Spherical 1.0x"}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {ANAMORPHIC_SQUEEZE_PRESETS.map((sq) => {
            const isSelected = sq.factor === squeezeFactor;
            return (
              <button
                key={sq.factor}
                onClick={() => onChangeSqueeze(sq.factor)}
                className={`flex flex-col items-start rounded-xl p-2.5 text-left transition-all ${
                  isSelected
                    ? "border-cyan-400 bg-cyan-400/10 text-white ring-1 ring-cyan-400/50"
                    : "border border-white/5 bg-black/40 text-neutral-400 hover:border-white/20 hover:text-white"
                }`}
              >
                <span className="text-xs font-bold text-white">{sq.label}</span>
                <span className="mt-0.5 text-[10px] text-cyan-300/80 line-clamp-1">{sq.desqueezeAspectDesc}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ─── 4. APERTURE & FOCUS DISTANCE (DEPTH OF FIELD) ─── */}
      <div className="grid grid-cols-1 gap-4 border-t border-white/5 pt-5 md:grid-cols-2">
        <div>
          <div className="mb-2 flex items-center justify-between">
            <label className="flex items-center gap-1.5 text-xs font-bold tracking-widest uppercase text-neutral-300">
              <Disc className="h-3.5 w-3.5 text-amber-400" />
              Iris / Aperture
            </label>
            <span className="font-mono text-xs font-bold text-amber-400">T{aperture}</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {APERTURE_STOPS.map((stop) => (
              <button
                key={stop}
                onClick={() => onChangeAperture(stop)}
                className={`rounded px-2 py-1 text-[11px] font-mono transition-colors ${
                  aperture === stop
                    ? "bg-amber-400 text-black font-bold"
                    : "bg-black/60 text-neutral-400 hover:bg-neutral-800 hover:text-white border border-white/5"
                }`}
              >
                T{stop}
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <label className="text-xs font-bold tracking-widest uppercase text-neutral-300">
              Focus Distance
            </label>
            <span className="font-mono text-xs font-bold text-amber-400">{focusDistanceMeters}m</span>
          </div>
          <input
            type="range"
            min={0.5}
            max={20}
            step={0.5}
            value={focusDistanceMeters}
            onChange={(e) => onChangeFocusDistance(Number(e.target.value))}
            className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-neutral-800 accent-amber-400"
          />
          <div className="flex justify-between text-[10px] text-neutral-500 font-mono mt-1">
            <span>0.5m (Close Up)</span>
            <span>3m (Dialogue)</span>
            <span>10m</span>
            <span>20m+ (Landscape)</span>
          </div>
        </div>
      </div>

      {/* ─── 5. FRAME LINE OVERLAYS & SCENE PICKER ─── */}
      <div className="grid grid-cols-1 gap-4 border-t border-white/5 pt-5 md:grid-cols-2">
        {/* Frame Lines */}
        <div>
          <label className="mb-2 flex items-center gap-2 text-xs font-bold tracking-widest uppercase text-neutral-300">
            <Layers className="h-3.5 w-3.5 text-amber-400" />
            Viewfinder Frame Lines
          </label>
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => onSelectFrameLine(null)}
              className={`rounded-lg px-2.5 py-1 text-xs transition-colors ${
                activeFrameLine === null
                  ? "bg-amber-400 text-black font-bold"
                  : "bg-black/60 text-neutral-400 hover:bg-neutral-800 hover:text-white border border-white/5"
              }`}
            >
              Full Sensor
            </button>
            {FRAME_LINES.map((fl) => {
              const isSelected = activeFrameLine?.id === fl.id;
              return (
                <button
                  key={fl.id}
                  onClick={() => onSelectFrameLine(fl)}
                  className={`rounded-lg px-2.5 py-1 text-xs font-mono transition-colors ${
                    isSelected
                      ? "bg-amber-400 text-black font-bold"
                      : "bg-black/60 text-neutral-400 hover:bg-neutral-800 hover:text-white border border-white/5"
                  }`}
                >
                  {fl.ratioLabel}
                </button>
              );
            })}
          </div>
        </div>

        {/* Scene Selection */}
        <div>
          <label className="mb-2 flex items-center gap-2 text-xs font-bold tracking-widest uppercase text-neutral-300">
            <Eye className="h-3.5 w-3.5 text-amber-400" />
            Simulation Scene
          </label>
          <div className="grid grid-cols-2 gap-1.5">
            {SIMULATION_SCENES.map((scene) => {
              const isSelected = scene.id === activeScene.id;
              return (
                <button
                  key={scene.id}
                  onClick={() => onSelectScene(scene)}
                  className={`rounded-lg p-2 text-left text-xs transition-all ${
                    isSelected
                      ? "border-amber-400 bg-amber-400/10 text-amber-300 ring-1 ring-amber-400/40"
                      : "border border-white/5 bg-black/50 text-neutral-400 hover:border-white/20 hover:text-white"
                  }`}
                >
                  <span className="font-semibold block truncate">{scene.title}</span>
                  <span className="text-[10px] text-neutral-500">{scene.category}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ─── 6. DUAL SENSOR COMPARISON DRAWER ─── */}
      <div className="border-t border-white/5 pt-5">
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 text-xs font-bold tracking-widest uppercase text-emerald-400">
            Dual Sensor Comparison Mode
          </label>
          <button
            onClick={() => onToggleComparison(!showComparison)}
            className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
              showComparison
                ? "bg-emerald-400 text-black"
                : "bg-white/10 text-neutral-400 hover:bg-white/20"
            }`}
          >
            {showComparison ? "Comparison Active" : "Enable Dual Mode"}
          </button>
        </div>

        {showComparison && (
          <div className="mt-3 rounded-xl border border-emerald-500/20 bg-emerald-950/20 p-3">
            <span className="text-xs text-neutral-300 font-medium block mb-2">
              Select Secondary Camera to Compare:
            </span>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {CINE_CAMERAS.filter((c) => c.id !== selectedCamera.id).map((cam) => {
                const isSelected = comparisonCamera?.id === cam.id;
                return (
                  <button
                    key={cam.id}
                    onClick={() => onSelectComparisonCamera(cam)}
                    className={`rounded-lg p-2 text-left text-xs transition-all ${
                      isSelected
                        ? "border-emerald-400 bg-emerald-400/20 text-emerald-300 ring-1 ring-emerald-400/50"
                        : "border border-white/5 bg-black/50 text-neutral-400 hover:text-white"
                    }`}
                  >
                    <span className="font-semibold block truncate">{cam.name}</span>
                    <span className="text-[10px] text-neutral-500 font-mono">
                      {cam.sensorWidthMm} × {cam.sensorHeightMm}mm
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
