"use client";

import { useState } from "react";
import Link from "next/link";
import { CameraSensorSpec, FrameLineSpec } from "@/lib/data/cinematography-data";
import { OpticalCalculationResult } from "@/lib/utils/optical-calculator";
import { ShoppingBag, Share2, Check, FileText, Sparkles, ArrowRight } from "lucide-react";

interface MatchedGearDeckProps {
  sensor: CameraSensorSpec;
  focalLengthMm: number;
  squeezeFactor: number;
  aperture: number;
  focusDistanceMeters: number;
  activeFrameLine: FrameLineSpec | null;
  opticalResult: OpticalCalculationResult;
}

export default function MatchedGearDeck({
  sensor,
  focalLengthMm,
  squeezeFactor,
  aperture,
  focusDistanceMeters,
  activeFrameLine,
  opticalResult,
}: MatchedGearDeckProps) {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedSpec, setCopiedSpec] = useState(false);

  // Generate shareable URL with parameters
  const generateShareUrl = () => {
    if (typeof window === "undefined") return "";
    const params = new URLSearchParams({
      cam: sensor.id,
      fl: focalLengthMm.toString(),
      sq: squeezeFactor.toString(),
      t: aperture.toString(),
      fd: focusDistanceMeters.toString(),
    });
    if (activeFrameLine) {
      params.set("flock", activeFrameLine.id);
    }
    return `${window.location.origin}/tools/sensor-simulator?${params.toString()}`;
  };

  const handleCopyLink = () => {
    const url = generateShareUrl();
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleCopySpecSheet = () => {
    const specSheet = `=====================================================
AUREVIA CINEMATOGRAPHY PRE-VIS SPEC SHEET
=====================================================
• Camera Body: ${sensor.name} (${sensor.brand})
• Sensor Dimensions: ${sensor.sensorWidthMm}mm × ${sensor.sensorHeightMm}mm (Ø ${sensor.diagonalMm}mm)
• Sensor Format: ${sensor.format}
• Resolution Mode: ${sensor.resolutionLabel}
• Active Focal Length: ${focalLengthMm}mm
• Lens Squeeze: ${squeezeFactor > 1.0 ? `${squeezeFactor}x Anamorphic` : "1.0x Spherical"}
• Iris Aperture: T${aperture}
• Focus Subject Distance: ${focusDistanceMeters}m
-----------------------------------------------------
OPTICAL TELEMETRY:
• Horizontal Field of View (H-FoV): ${opticalResult.horizontalFovDeg}°
• Vertical Field of View (V-FoV): ${opticalResult.verticalFovDeg}°
• Full Frame Crop Factor: ${opticalResult.cropFactor}x (Eq. ${opticalResult.equivalentFocalLengthMm}mm)
• Desqueezed Aspect Ratio: ${opticalResult.desqueezedAspectRatio}:1
• Active Frame Line: ${activeFrameLine ? `${activeFrameLine.ratioLabel} (${activeFrameLine.name})` : "Full Sensor"}
• Near Focus Limit: ${opticalResult.nearLimitMeters}m
• Far Focus Limit: ${opticalResult.farLimitMeters === "Infinity" ? "Infinity (∞)" : `${opticalResult.farLimitMeters}m`}
• Hyperfocal Distance: ${opticalResult.hyperfocalDistanceMeters}m
-----------------------------------------------------
Simulated via AUREVIA Optical Engine: ${generateShareUrl()}
=====================================================`;

    navigator.clipboard.writeText(specSheet);
    setCopiedSpec(true);
    setTimeout(() => setCopiedSpec(false), 2500);
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-neutral-900/80 p-6 backdrop-blur-xl shadow-xl">
      <div className="flex flex-col justify-between gap-4 border-b border-white/5 pb-5 sm:flex-row sm:items-center">
        <div>
          <h3 className="flex items-center gap-2 text-xs font-bold tracking-widest uppercase text-amber-400">
            <Sparkles className="h-4 w-4" />
            Recommended Vault Packages & Collaboration
          </h3>
          <p className="mt-1 text-xs text-neutral-400">
            Match this optical setup directly with AUREVIA&apos;s physical camera inventory &amp; cinema glass.
          </p>
        </div>

        {/* Action Buttons for DPs and Directors */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleCopySpecSheet}
            className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-black/60 px-3.5 py-2 text-xs font-semibold text-neutral-300 transition-colors hover:bg-neutral-800 hover:text-white"
          >
            {copiedSpec ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-400" />
                <span className="text-emerald-400">Spec Copied!</span>
              </>
            ) : (
              <>
                <FileText className="h-3.5 w-3.5 text-amber-400" />
                <span>Copy Shot Spec Sheet</span>
              </>
            )}
          </button>

          <button
            onClick={handleCopyLink}
            className="flex items-center gap-1.5 rounded-xl border border-amber-500/30 bg-amber-500/10 px-3.5 py-2 text-xs font-semibold text-amber-300 transition-colors hover:bg-amber-500/20"
          >
            {copiedLink ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-400" />
                <span className="text-emerald-400">Link Copied!</span>
              </>
            ) : (
              <>
                <Share2 className="h-3.5 w-3.5 text-amber-400" />
                <span>Share Setup Link</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Suggested Gear Cards */}
      <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {/* Primary Camera Gear Card */}
        <div className="flex flex-col justify-between rounded-xl border border-white/5 bg-black/50 p-4 transition-all hover:border-amber-400/30 hover:bg-neutral-900/60">
          <div>
            <div className="flex items-center justify-between text-[10px] uppercase tracking-wider text-amber-400">
              <span>Flagship Camera Body</span>
              <span className="rounded bg-amber-400/10 px-1.5 py-0.5 text-[9px] font-bold text-amber-300">
                In Stock
              </span>
            </div>
            <h4 className="mt-1 font-bold text-white">{sensor.name}</h4>
            <p className="mt-1 text-xs text-neutral-400 line-clamp-2">
              {sensor.description}
            </p>
          </div>

          <div className="mt-4 flex items-center justify-between border-t border-white/5 pt-3">
            <div>
              <span className="text-[10px] text-neutral-500">Rental Rate</span>
              <p className="font-mono text-sm font-bold text-white">Starting ₹4,500<span className="text-xs font-normal text-neutral-400">/day</span></p>
            </div>
            <Link
              href={sensor.matchedProductId ? `/gear/${sensor.matchedProductId}` : "/explore"}
              className="flex items-center gap-1 rounded-lg bg-amber-400 px-3 py-1.5 text-xs font-bold text-black transition-transform hover:scale-105"
            >
              <ShoppingBag className="h-3.5 w-3.5" />
              Rent Gear
            </Link>
          </div>
        </div>

        {/* Recommended Matching Cinema Lens Card */}
        <div className="flex flex-col justify-between rounded-xl border border-white/5 bg-black/50 p-4 transition-all hover:border-cyan-400/30 hover:bg-neutral-900/60">
          <div>
            <div className="flex items-center justify-between text-[10px] uppercase tracking-wider text-cyan-400">
              <span>Matching Cinema Optics</span>
              <span className="rounded bg-cyan-400/10 px-1.5 py-0.5 text-[9px] font-bold text-cyan-300">
                {squeezeFactor > 1.0 ? "Anamorphic Prime" : "Cine Prime"}
              </span>
            </div>
            <h4 className="mt-1 font-bold text-white">
              {squeezeFactor > 1.0
                ? `Cooke Anamorphic /i ${focalLengthMm}mm T2.3 (${squeezeFactor}x)`
                : `Zeiss Supreme Prime ${focalLengthMm}mm T1.5`}
            </h4>
            <p className="mt-1 text-xs text-neutral-400 line-clamp-2">
              Covers {sensor.format} image circle (43.3mm) with creamy roll-off and zero breathing.
            </p>
          </div>

          <div className="mt-4 flex items-center justify-between border-t border-white/5 pt-3">
            <div>
              <span className="text-[10px] text-neutral-500">Daily Vault Rate</span>
              <p className="font-mono text-sm font-bold text-white">Starting ₹2,200<span className="text-xs font-normal text-neutral-400">/day</span></p>
            </div>
            <Link
              href="/explore?category=lenses"
              className="flex items-center gap-1 rounded-lg border border-cyan-400/40 bg-cyan-500/10 px-3 py-1.5 text-xs font-bold text-cyan-300 transition-colors hover:bg-cyan-500/20"
            >
              Explore Glass
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>

        {/* Complete Cinema Production Package */}
        <div className="flex flex-col justify-between rounded-xl border border-white/5 bg-black/50 p-4 transition-all hover:border-amber-400/30 hover:bg-neutral-900/60 sm:col-span-2 lg:col-span-1">
          <div>
            <div className="flex items-center justify-between text-[10px] uppercase tracking-wider text-emerald-400">
              <span>Pelican Flight-Case Kit</span>
              <span className="rounded bg-emerald-400/10 px-1.5 py-0.5 text-[9px] font-bold text-emerald-300">
                15% Bundle Discount
              </span>
            </div>
            <h4 className="mt-1 font-bold text-white">{sensor.brand} Director&apos;s Cinema Package</h4>
            <p className="mt-1 text-xs text-neutral-400 line-clamp-2">
              Includes {sensor.name}, 3x Prime Lenses, Pelican Storm Case, 4x V-Mount 150Wh batteries, Tilta follow focus, and SmallHD 7&quot; Monitor.
            </p>
          </div>

          <div className="mt-4 flex items-center justify-between border-t border-white/5 pt-3">
            <div>
              <span className="text-[10px] text-neutral-500">Package Rate</span>
              <p className="font-mono text-sm font-bold text-emerald-400">₹8,900<span className="text-xs font-normal text-neutral-400">/day</span></p>
            </div>
            <Link
              href="/booking"
              className="flex items-center gap-1 rounded-lg bg-emerald-400 px-3 py-1.5 text-xs font-bold text-black transition-transform hover:scale-105"
            >
              Book Package
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
