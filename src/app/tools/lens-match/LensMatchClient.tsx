"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  CINE_CAMERAS,
  ANAMORPHIC_SQUEEZE_PRESETS,
  FRAME_LINES,
  SIMULATION_SCENES,
  LENS_IMAGE_CIRCLES,
  CameraSensorSpec,
  AnamorphicSqueezeSpec,
  SimulationScene,
} from "@/lib/data/cinematography-data";
import {
  Sliders,
  Maximize2,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  Camera,
  Layers,
  Sparkles,
} from "lucide-react";

export default function LensMatchClient() {
  // State
  const [selectedCamera, setSelectedCamera] = useState<CameraSensorSpec>(CINE_CAMERAS[0]);
  const [selectedSqueeze, setSelectedSqueeze] = useState<AnamorphicSqueezeSpec>(ANAMORPHIC_SQUEEZE_PRESETS[0]);
  const [focalLengthMm, setFocalLengthMm] = useState<number>(35);
  const [aperture, setAperture] = useState<number>(2.0);
  const [subjectDistanceM, setSubjectDistanceM] = useState<number>(2.5);
  const [activeScene, setActiveScene] = useState<SimulationScene>(SIMULATION_SCENES[0]);
  const [selectedLensCircle, setSelectedLensCircle] = useState(LENS_IMAGE_CIRCLES[1]);
  const [activeFrameLines, setActiveFrameLines] = useState<string[]>(["scope-239", "broadcast-169"]);

  // Optical Calculations
  const calculations = useMemo(() => {
    // Reference 35mm full-frame standard width (36.0mm)
    const baseSensorWidth = 36.0;
    const currentSensorWidth = selectedCamera.sensorWidthMm;
    const currentSensorHeight = selectedCamera.sensorHeightMm;
    const diagonal = Math.sqrt(currentSensorWidth ** 2 + currentSensorHeight ** 2);

    // Crop factor relative to Full Frame 36x24
    const cropFactor = 43.27 / diagonal;

    // Field of View calculation
    // Horizontal FoV in degrees = 2 * atan((SensorWidth * Squeeze) / (2 * FocalLength)) * (180 / PI)
    const effectiveSensorWidth = currentSensorWidth * selectedSqueeze.factor;
    const horizontalFoVDeg = 2 * Math.atan(effectiveSensorWidth / (2 * focalLengthMm)) * (180 / Math.PI);
    const verticalFoVDeg = 2 * Math.atan(currentSensorHeight / (2 * focalLengthMm)) * (180 / Math.PI);

    // 35mm equivalent focal length
    const equivalentFocalLength = Math.round(focalLengthMm * cropFactor / selectedSqueeze.factor);

    // Depth of Field (DoF) Calculation
    // Circle of Confusion (CoC) in mm standard rule: diagonal / 1500
    const cocMm = diagonal / 1500;
    const focalLengthM = focalLengthMm / 1000;
    const hyperfocalM = (focalLengthM ** 2) / (aperture * (cocMm / 1000));

    // Near Limit & Far Limit
    const nearLimitM = (hyperfocalM * subjectDistanceM) / (hyperfocalM + (subjectDistanceM - focalLengthM));
    let farLimitM = (hyperfocalM * subjectDistanceM) / (hyperfocalM - (subjectDistanceM - focalLengthM));
    if (farLimitM < 0 || subjectDistanceM >= hyperfocalM) {
      farLimitM = Infinity;
    }
    const totalDoFM = farLimitM === Infinity ? Infinity : Math.max(0, farLimitM - nearLimitM);

    // Vignetting check: Does the lens image circle cover the sensor diagonal?
    const hasVignetting = selectedLensCircle.diameterMm < diagonal - 0.5;
    const coverageShortageMm = Math.max(0, diagonal - selectedLensCircle.diameterMm);

    // Visual zoom scale calculation for preview
    // Standard baseline is 35mm lens on 36mm sensor
    const baselineFocal = activeScene.baseFocalLengthMm;
    const zoomScale = (focalLengthMm / baselineFocal) * (baseSensorWidth / currentSensorWidth) * (1 / selectedSqueeze.factor);

    return {
      cropFactor: cropFactor.toFixed(2),
      diagonal: diagonal.toFixed(1),
      horizontalFoVDeg: horizontalFoVDeg.toFixed(1),
      verticalFoVDeg: verticalFoVDeg.toFixed(1),
      equivalentFocalLength,
      hyperfocalM: hyperfocalM.toFixed(2),
      nearLimitM: nearLimitM.toFixed(2),
      farLimitM: farLimitM === Infinity ? "Infinity (∞)" : farLimitM.toFixed(2),
      totalDoFM: totalDoFM === Infinity ? "Infinite Deep Focus" : `${(totalDoFM * 100).toFixed(1)} cm`,
      hasVignetting,
      coverageShortageMm: coverageShortageMm.toFixed(1),
      zoomScale: Math.max(0.5, Math.min(4.0, zoomScale)),
      sensorAspectRatio: (currentSensorWidth / currentSensorHeight).toFixed(2),
    };
  }, [selectedCamera, selectedSqueeze, focalLengthMm, aperture, subjectDistanceM, activeScene, selectedLensCircle]);

  const toggleFrameLine = (id: string) => {
    setActiveFrameLines((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  return (
    <div className="space-y-8">
      {/* ─── TOP DIAGNOSTIC BAR ─── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
        <div className="rounded-xl border border-white/10 bg-neutral-900/80 p-3.5 backdrop-blur">
          <p className="text-[10px] font-mono uppercase tracking-wider text-neutral-400">Sensor Format</p>
          <p className="mt-1 text-sm font-bold text-white truncate">{selectedCamera.format}</p>
          <p className="text-xs text-amber-400 font-mono">{selectedCamera.sensorWidthMm} × {selectedCamera.sensorHeightMm} mm</p>
        </div>

        <div className="rounded-xl border border-white/10 bg-neutral-900/80 p-3.5 backdrop-blur">
          <p className="text-[10px] font-mono uppercase tracking-wider text-neutral-400">Horizontal FOV</p>
          <p className="mt-1 text-base font-black text-cyan-400 font-mono">{calculations.horizontalFoVDeg}°</p>
          <p className="text-xs text-neutral-400 font-mono">Vert: {calculations.verticalFoVDeg}°</p>
        </div>

        <div className="rounded-xl border border-white/10 bg-neutral-900/80 p-3.5 backdrop-blur">
          <p className="text-[10px] font-mono uppercase tracking-wider text-neutral-400">Crop / Eqv. 35mm</p>
          <p className="mt-1 text-base font-black text-amber-300 font-mono">{calculations.cropFactor}x Crop</p>
          <p className="text-xs text-neutral-400 font-mono">~{calculations.equivalentFocalLength}mm Spherical</p>
        </div>

        <div className="rounded-xl border border-white/10 bg-neutral-900/80 p-3.5 backdrop-blur">
          <p className="text-[10px] font-mono uppercase tracking-wider text-neutral-400">Total Depth of Field</p>
          <p className="mt-1 text-sm font-bold text-emerald-400 font-mono truncate">{calculations.totalDoFM}</p>
          <p className="text-[11px] text-neutral-400 font-mono">{calculations.nearLimitM}m – {calculations.farLimitM}{calculations.farLimitM.includes("∞") ? "" : "m"}</p>
        </div>

        <div className="rounded-xl border border-white/10 bg-neutral-900/80 p-3.5 backdrop-blur">
          <p className="text-[10px] font-mono uppercase tracking-wider text-neutral-400">Hyperfocal Dist</p>
          <p className="mt-1 text-base font-black text-purple-400 font-mono">{calculations.hyperfocalM} m</p>
          <p className="text-[11px] text-neutral-400 font-mono">Focus point for max DoF</p>
        </div>

        <div className="rounded-xl border border-white/10 bg-neutral-900/80 p-3.5 backdrop-blur">
          <p className="text-[10px] font-mono uppercase tracking-wider text-neutral-400">Coverage Status</p>
          {calculations.hasVignetting ? (
            <div>
              <p className="mt-1 flex items-center gap-1 text-xs font-black text-red-400 font-mono">
                <AlertTriangle className="h-3.5 w-3.5" /> VIGNETTING
              </p>
              <p className="text-[10px] text-red-300/80">-{calculations.coverageShortageMm}mm deficit</p>
            </div>
          ) : (
            <div>
              <p className="mt-1 flex items-center gap-1 text-xs font-black text-emerald-400 font-mono">
                <CheckCircle2 className="h-3.5 w-3.5" /> FULL COVERAGE
              </p>
              <p className="text-[10px] text-emerald-300/80">No dark corners</p>
            </div>
          )}
        </div>
      </div>

      {/* ─── MAIN TWO-COLUMN WORKBENCH ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT COLUMN: INTERACTIVE VISUAL VIEWFINDER */}
        <div className="lg:col-span-7 space-y-4">
          <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-white/15 bg-neutral-950 shadow-2xl">
            {/* Background Live Scene */}
            <div
              className="absolute inset-0 transition-transform duration-300 ease-out origin-center"
              style={{
                transform: `scale(${calculations.zoomScale})`,
                filter: `blur(${Math.max(0, (2.8 - aperture) * 1.5)}px)`,
              }}
            >
              <Image
                src={activeScene.imageUrl}
                alt={activeScene.title}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 60vw"
                priority
              />
            </div>

            {/* Anamorphic Flare Streak Simulation Overlay */}
            {selectedSqueeze.factor > 1.0 && (
              <div
                className="pointer-events-none absolute inset-0 bg-linear-to-r from-transparent via-cyan-400/20 to-transparent mix-blend-screen opacity-70 blur-sm"
                style={{
                  transform: `scaleY(${1 / selectedSqueeze.factor}) scaleX(1.8)`,
                }}
              />
            )}

            {/* Vignetting Optical Darkening Circle if Image Circle < Sensor */}
            {calculations.hasVignetting && (
              <div
                className="pointer-events-none absolute inset-0 rounded-full border-60 border-black/80 blur-xl mix-blend-multiply"
                style={{
                  transform: "scale(1.15)",
                }}
              />
            )}

            {/* Framing Guide Lines Overlays */}
            <div className="pointer-events-none absolute inset-0 p-4 flex items-center justify-center">
              {FRAME_LINES.filter((fl) => activeFrameLines.includes(fl.id)).map((fl) => {
                const isWiderThan169 = fl.ratio > 16 / 9;
                const widthPercent = isWiderThan169 ? 100 : (fl.ratio / (16 / 9)) * 100;
                const heightPercent = isWiderThan169 ? ((16 / 9) / fl.ratio) * 100 : 100;

                return (
                  <div
                    key={fl.id}
                    className="absolute border transition-all duration-300 pointer-events-none"
                    style={{
                      width: `${widthPercent}%`,
                      height: `${heightPercent}%`,
                      borderColor: fl.color,
                      borderWidth: "1.5px",
                      opacity: 0.85,
                    }}
                  >
                    <span
                      className="absolute top-1 left-1.5 px-1.5 py-0.5 rounded text-[9px] font-mono font-bold"
                      style={{
                        backgroundColor: fl.color,
                        color: "#000",
                      }}
                    >
                      {fl.ratioLabel}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* HUD Viewfinder Telemetry */}
            <div className="pointer-events-none absolute inset-x-0 top-0 flex justify-between p-3 text-[11px] font-mono font-bold text-white/90 bg-linear-to-b from-black/80 to-transparent">
              <div className="flex items-center gap-2">
                <span className="flex h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                <span>RAW REC</span>
                <span className="text-amber-400">[{selectedCamera.name}]</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-neutral-300">{focalLengthMm}mm</span>
                <span className="text-amber-300">ƒ/{aperture.toFixed(1)}</span>
                <span className="text-cyan-300">{selectedSqueeze.factor}x SQZ</span>
                <span className="text-emerald-300">{subjectDistanceM.toFixed(1)}m</span>
              </div>
            </div>

            {/* Bottom HUD Bar */}
            <div className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-between items-center p-3 text-[10px] font-mono text-neutral-300 bg-linear-to-t from-black/80 to-transparent">
              <span>SCENE: {activeScene.title.toUpperCase()}</span>
              <span>RES: {selectedCamera.resolutionLabel}</span>
            </div>
          </div>

          {/* Scene Selector Strip */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <span className="text-xs font-mono text-neutral-400 whitespace-nowrap mr-1">SCENE:</span>
            {SIMULATION_SCENES.map((scene) => (
              <button
                key={scene.id}
                onClick={() => setActiveScene(scene)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all whitespace-nowrap ${
                  activeScene.id === scene.id
                    ? "bg-amber-400 text-black font-bold shadow-md shadow-amber-400/20"
                    : "bg-neutral-900 text-neutral-300 border border-white/10 hover:border-white/30"
                }`}
              >
                {scene.title}
              </button>
            ))}
          </div>

          {/* Framing Guides Toggle */}
          <div className="rounded-xl border border-white/10 bg-neutral-900/60 p-3.5 backdrop-blur space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-neutral-300 font-bold flex items-center gap-1.5">
                <Layers className="h-3.5 w-3.5 text-amber-400" /> Cinema Frame Line Overlays
              </span>
              <button
                onClick={() => setActiveFrameLines([])}
                className="text-[10px] font-mono text-neutral-400 hover:text-white underline"
              >
                Clear All
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {FRAME_LINES.map((fl) => {
                const isActive = activeFrameLines.includes(fl.id);
                return (
                  <button
                    key={fl.id}
                    onClick={() => toggleFrameLine(fl.id)}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono transition-all ${
                      isActive
                        ? "border bg-neutral-800 text-white font-bold"
                        : "border border-white/5 bg-neutral-950/60 text-neutral-400 hover:text-neutral-200"
                    }`}
                    style={{ borderColor: isActive ? fl.color : undefined }}
                  >
                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: fl.color }} />
                    {fl.ratioLabel} ({fl.name.split(" ")[1] || fl.name})
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: OPTICAL CONTROLS & CAMERA SELECTION */}
        <div className="lg:col-span-5 space-y-5">
          {/* CAMERA SELECTION */}
          <div className="rounded-2xl border border-white/10 bg-neutral-900/80 p-5 backdrop-blur space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-black uppercase tracking-wider text-white flex items-center gap-2">
                <Camera className="h-4 w-4 text-amber-400" />
                1. Cinema Camera &amp; Sensor
              </h2>
              <span className="text-[11px] font-mono text-amber-400">{selectedCamera.brand}</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {CINE_CAMERAS.map((camera) => (
                <button
                  key={camera.id}
                  onClick={() => setSelectedCamera(camera)}
                  className={`p-2.5 rounded-xl text-left border text-xs transition-all ${
                    selectedCamera.id === camera.id
                      ? "border-amber-400 bg-amber-400/10 text-white shadow-md shadow-amber-400/10"
                      : "border-white/10 bg-neutral-950/60 text-neutral-400 hover:text-white hover:border-white/20"
                  }`}
                >
                  <p className="font-bold truncate text-white">{camera.name}</p>
                  <p className="text-[10px] font-mono text-neutral-400">{camera.format}</p>
                </button>
              ))}
            </div>
          </div>

          {/* ANAMORPHIC SQUEEZE SELECTOR */}
          <div className="rounded-2xl border border-white/10 bg-neutral-900/80 p-5 backdrop-blur space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-black uppercase tracking-wider text-white flex items-center gap-2">
                <Sliders className="h-4 w-4 text-cyan-400" />
                2. Lens Optics &amp; Squeeze
              </h2>
              <span className="text-[11px] font-mono text-cyan-400">{selectedSqueeze.factor}x Factor</span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {ANAMORPHIC_SQUEEZE_PRESETS.map((preset) => (
                <button
                  key={preset.factor}
                  onClick={() => setSelectedSqueeze(preset)}
                  className={`p-2 rounded-xl text-center border text-xs font-mono transition-all ${
                    selectedSqueeze.factor === preset.factor
                      ? "border-cyan-400 bg-cyan-400/10 text-cyan-300 font-bold"
                      : "border-white/10 bg-neutral-950/60 text-neutral-400 hover:text-white"
                  }`}
                >
                  {preset.factor}x
                </button>
              ))}
            </div>
            <p className="text-xs text-neutral-400 leading-relaxed font-sans">{selectedSqueeze.description}</p>
          </div>

          {/* LENS IMAGE CIRCLE COVERAGE */}
          <div className="rounded-2xl border border-white/10 bg-neutral-900/80 p-5 backdrop-blur space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-black uppercase tracking-wider text-white flex items-center gap-2">
                <Maximize2 className="h-4 w-4 text-emerald-400" />
                3. Lens Image Circle Coverage
              </h2>
              <span className="text-[11px] font-mono text-emerald-400">Ø {selectedLensCircle.diameterMm}mm</span>
            </div>

            <div className="space-y-2">
              {LENS_IMAGE_CIRCLES.map((circle) => (
                <button
                  key={circle.name}
                  onClick={() => setSelectedLensCircle(circle)}
                  className={`w-full p-2.5 rounded-xl text-left border text-xs flex items-center justify-between transition-all ${
                    selectedLensCircle.name === circle.name
                      ? "border-emerald-400 bg-emerald-400/10 text-white font-bold"
                      : "border-white/10 bg-neutral-950/60 text-neutral-400 hover:text-white"
                  }`}
                >
                  <span>{circle.name}</span>
                  <span className="font-mono text-emerald-400">Ø {circle.diameterMm} mm</span>
                </button>
              ))}
            </div>
          </div>

          {/* OPTICAL SLIDERS (FOCAL LENGTH, APERTURE, DISTANCE) */}
          <div className="rounded-2xl border border-white/10 bg-neutral-900/80 p-5 backdrop-blur space-y-5">
            <h2 className="text-sm font-black uppercase tracking-wider text-white flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-purple-400" />
              4. Live Optical Controls
            </h2>

            {/* Focal Length Slider */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-neutral-400">Focal Length:</span>
                <span className="font-bold text-amber-300">{focalLengthMm} mm</span>
              </div>
              <input
                type="range"
                min="14"
                max="200"
                step="1"
                value={focalLengthMm}
                onChange={(e) => setFocalLengthMm(Number(e.target.value))}
                className="w-full accent-amber-400 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-neutral-500 font-mono">
                <span>14mm Ultra-Wide</span>
                <span>50mm Normal</span>
                <span>200mm Telephoto</span>
              </div>
            </div>

            {/* Aperture Slider */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-neutral-400">Aperture (T-Stop / ƒ):</span>
                <span className="font-bold text-cyan-300">ƒ/{aperture.toFixed(1)}</span>
              </div>
              <input
                type="range"
                min="1.2"
                max="22.0"
                step="0.1"
                value={aperture}
                onChange={(e) => setAperture(Number(e.target.value))}
                className="w-full accent-cyan-400 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-neutral-500 font-mono">
                <span>ƒ/1.2 Shallow Bokeh</span>
                <span>ƒ/5.6 Commercial</span>
                <span>ƒ/22 Deep Focus</span>
              </div>
            </div>

            {/* Subject Distance Slider */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-neutral-400">Subject Focus Distance:</span>
                <span className="font-bold text-emerald-300">{subjectDistanceM.toFixed(1)} meters</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="15.0"
                step="0.1"
                value={subjectDistanceM}
                onChange={(e) => setSubjectDistanceM(Number(e.target.value))}
                className="w-full accent-emerald-400 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-neutral-500 font-mono">
                <span>0.5m Close-Up</span>
                <span>3m Medium Shot</span>
                <span>15m Wide Establishing</span>
              </div>
            </div>
          </div>

          {/* ACTION CTA: DIRECT MATCH RENTAL PACKAGE */}
          <div className="rounded-2xl border border-amber-400/30 bg-linear-to-br from-amber-400/10 via-neutral-900 to-black p-5 space-y-3">
            <div className="flex items-center gap-2 text-amber-300 text-xs font-mono font-bold uppercase">
              <Sparkles className="h-4 w-4 text-amber-400" />
              Verified Production Rig
            </div>
            <p className="text-xs text-neutral-300">
              Ready to rent this optical pairing with certified Pelican case and calibrated back-focus?
            </p>
            <div className="flex gap-2">
              <Link
                href={`/packages`}
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-linear-to-r from-amber-400 to-amber-500 px-4 py-2.5 text-xs font-bold text-black uppercase tracking-wider hover:opacity-90 transition shadow-lg shadow-amber-400/20"
              >
                <span>View Complete Rigs</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
              <Link
                href={`/explore`}
                className="inline-flex items-center justify-center rounded-xl border border-white/20 bg-neutral-900 px-4 py-2.5 text-xs font-bold text-white hover:bg-neutral-800 transition"
              >
                Browse Lenses
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
