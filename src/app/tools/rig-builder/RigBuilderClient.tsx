"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  RIG_CAMERAS,
  RIG_LENSES,
  RIG_CAGES,
  RIG_MATTEBOXES,
  RIG_FOLLOWFOCUS,
  RIG_MONITORS,
  RIG_WIRELESSTX,
  RIG_BATTERIES,
  RIG_ACCESSORIES,
  RigComponent,
} from "@/lib/data/rig-builder-data";
import {
  Zap,
  AlertTriangle,
  ShoppingBag,
  ArrowRight,
  Camera,
  Maximize2,
  Sparkles,
  Tv,
  Radio,
  BatteryCharging,
  Eye,
  Printer,
} from "lucide-react";
import { useCineAudio } from "@/hooks/useCineAudio";

export default function RigBuilderClient() {
  const { playClick, playLatch } = useCineAudio();

  // Active Rig Component State
  const [selectedCamera, setSelectedCamera] = useState<RigComponent>(RIG_CAMERAS[0]);
  const [selectedLens, setSelectedLens] = useState<RigComponent>(RIG_LENSES[0]);
  const [selectedCage, setSelectedCage] = useState<RigComponent | null>(RIG_CAGES[0]);
  const [selectedMatteBox, setSelectedMatteBox] = useState<RigComponent | null>(RIG_MATTEBOXES[0]);
  const [selectedFollowFocus, setSelectedFollowFocus] = useState<RigComponent | null>(RIG_FOLLOWFOCUS[0]);
  const [selectedMonitor, setSelectedMonitor] = useState<RigComponent | null>(RIG_MONITORS[0]);
  const [selectedWirelessTx, setSelectedWirelessTx] = useState<RigComponent | null>(RIG_WIRELESSTX[0]);
  const [selectedBattery, setSelectedBattery] = useState<RigComponent>(RIG_BATTERIES[0]);
  const [selectedAccessories, setSelectedAccessories] = useState<string[]>([RIG_ACCESSORIES[0].id]);
  const [activeTab, setActiveTab] = useState<"camera" | "lens" | "cage" | "mattebox" | "followfocus" | "monitor" | "wireless" | "power">("camera");

  // Toggle accessories
  const toggleAccessory = (id: string) => {
    playClick();
    setSelectedAccessories((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Preset Builders
  const loadPreset = (preset: "commercialArri" | "docuFx6" | "redAnamorphic") => {
    playLatch();
    if (preset === "commercialArri") {
      setSelectedCamera(RIG_CAMERAS[0]); // ARRI 35
      setSelectedLens(RIG_LENSES[2]); // ARRI Signature
      setSelectedCage(RIG_CAGES[0]); // Tilta Full Cage
      setSelectedMatteBox(RIG_MATTEBOXES[0]); // ARRI LMB 4x5
      setSelectedFollowFocus(RIG_FOLLOWFOCUS[1]); // ARRI Hi-5
      setSelectedMonitor(RIG_MONITORS[0]); // SmallHD Cine 7
      setSelectedWirelessTx(RIG_WIRELESSTX[0]); // Teradek 4K
      setSelectedBattery(RIG_BATTERIES[2]); // Bebob 294Wh
    } else if (preset === "docuFx6") {
      setSelectedCamera(RIG_CAMERAS[3]); // Sony FX6
      setSelectedLens(RIG_LENSES[3]); // Sony 16-35
      setSelectedCage(RIG_CAGES[1]); // SmallRig Black Mamba
      setSelectedMatteBox(RIG_MATTEBOXES[1]); // Tilta Mirage
      setSelectedFollowFocus(RIG_FOLLOWFOCUS[2]); // Tilta Mini
      setSelectedMonitor(RIG_MONITORS[1]); // Ninja Ultra
      setSelectedWirelessTx(RIG_WIRELESSTX[1]); // Hollyland
      setSelectedBattery(RIG_BATTERIES[3]); // BP-U70
    } else if (preset === "redAnamorphic") {
      setSelectedCamera(RIG_CAMERAS[2]); // RED Raptor
      setSelectedLens(RIG_LENSES[1]); // Atlas Orion Anamorphic
      setSelectedCage(RIG_CAGES[0]); // Tilta Full Cage
      setSelectedMatteBox(RIG_MATTEBOXES[0]); // ARRI LMB
      setSelectedFollowFocus(RIG_FOLLOWFOCUS[0]); // Nucleus-M
      setSelectedMonitor(RIG_MONITORS[2]); // RED Touch 7
      setSelectedWirelessTx(RIG_WIRELESSTX[0]); // Teradek 4K
      setSelectedBattery(RIG_BATTERIES[0]); // Core SWX 150
    }
  };

  // Calculations & Telemetry
  const telemetry = useMemo(() => {
    const activeComponents: (RigComponent | null)[] = [
      selectedCamera,
      selectedLens,
      selectedCage,
      selectedMatteBox,
      selectedFollowFocus,
      selectedMonitor,
      selectedWirelessTx,
      selectedBattery,
      ...RIG_ACCESSORIES.filter((a) => selectedAccessories.includes(a.id)),
    ];

    const validComponents = activeComponents.filter((c): c is RigComponent => c !== null);

    // Total Weight
    const totalGrams = validComponents.reduce((sum, c) => sum + c.weightGrams, 0);
    const totalKg = totalGrams / 1000;
    const totalLbs = totalKg * 2.20462;

    // Total Power
    const totalWatts = validComponents.reduce((sum, c) => sum + c.powerWatts, 0);
    const batteryCapacityWh = selectedBattery.capacityWh || 147;
    const runtimeHours = totalWatts > 0 ? batteryCapacityWh / totalWatts : 0;
    const runtimeMinutes = Math.round(runtimeHours * 60);

    // Total Daily Rate
    const totalDailyRate = validComponents.reduce((sum, c) => sum + c.pricePerDay, 0);

    // Ergonomic Classification
    let ergonomics = {
      label: "Gimbal Lightweight",
      color: "text-emerald-400",
      bg: "bg-emerald-400/10 border-emerald-400/30",
      description: "Suitable for DJI Ronin RS 3 / RS 4 Pro, lightweight car rigs, and rapid one-man-band gimbal operation.",
    };

    if (totalKg >= 3.5 && totalKg < 7.5) {
      ergonomics = {
        label: "Handheld / EasyRig Medium",
        color: "text-cyan-400",
        bg: "bg-cyan-400/10 border-cyan-400/30",
        description: "Optimal balance for shoulder-mount, EasyRig Vario 5, or Ready Rig gimbal support.",
      };
    } else if (totalKg >= 7.5 && totalKg < 13.0) {
      ergonomics = {
        label: "Studio Cine Tripod Heavy",
        color: "text-amber-400",
        bg: "bg-amber-400/10 border-amber-400/30",
        description: "Heavy cinema rig requiring O'Connor 1040/2575 or Sachtler Cine 30 fluid head support.",
      };
    } else if (totalKg >= 13.0) {
      ergonomics = {
        label: "Crane / Techno-Jib Heavyweight",
        color: "text-purple-400",
        bg: "bg-purple-400/10 border-purple-400/30",
        description: "High payload feature build designed for remote heads, tracking vehicles, and cinema cranes.",
      };
    }

    // Compatibility Warnings
    const warnings: string[] = [];

    // 1. Mount Compatibility Check
    if (selectedCamera && selectedLens) {
      const camMount = selectedCamera.mountType;
      const lensMount = selectedLens.mountType;

      if (camMount !== lensMount) {
        if (lensMount === "PL" && (camMount === "LPL" || camMount === "RF" || camMount === "E-mount" || camMount === "L-Mount")) {
          warnings.push(`Lens (${lensMount}) requires a ${camMount}-to-PL mechanical adapter (included in Pelican case).`);
        } else if (lensMount === "LPL" && camMount !== "LPL") {
          warnings.push(`LPL Mount Lens cannot be mounted to ${camMount} body without specialized sub-mount conversion.`);
        } else if (lensMount === "E-mount" && camMount !== "E-mount") {
          warnings.push(`Native E-mount lens cannot be mounted to ${camMount} camera body due to flange depth.`);
        }
      }
    }

    // 2. Matte Box Clamp Diameter Check
    if (selectedLens && selectedMatteBox) {
      const lensDiameter = selectedLens.frontDiameterMm || 114;
      const matteBoxDiameter = selectedMatteBox.frontDiameterMm || 114;

      if (lensDiameter > matteBoxDiameter) {
        warnings.push(`Lens front diameter (${lensDiameter}mm) exceeds matte box opening (${matteBoxDiameter}mm). Step-up clamp required.`);
      }
    }

    // 3. Power Draw Warning
    if (totalWatts > 110 && selectedBattery.capacityWh && selectedBattery.capacityWh < 100) {
      warnings.push(`High rig draw (${totalWatts}W) will drain ${selectedBattery.capacityWh}Wh battery in under 50 minutes. Consider 150Wh+ V-Mount.`);
    }

    return {
      totalKg: totalKg.toFixed(2),
      totalLbs: totalLbs.toFixed(2),
      totalWatts,
      runtimeHours: runtimeHours.toFixed(1),
      runtimeMinutes,
      totalDailyRate,
      ergonomics,
      warnings,
      componentCount: validComponents.length,
    };
  }, [
    selectedCamera,
    selectedLens,
    selectedCage,
    selectedMatteBox,
    selectedFollowFocus,
    selectedMonitor,
    selectedWirelessTx,
    selectedBattery,
    selectedAccessories,
  ]);

  return (
    <div className="space-y-8">
      {/* ─── PRESET RIG SWITCHER ─── */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-white/10 bg-neutral-900/80 p-4 backdrop-blur">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-mono text-neutral-400">Quick-Load Cinema Builds:</span>
          <button
            onClick={() => loadPreset("commercialArri")}
            className="px-3 py-1.5 rounded-lg border border-amber-400/40 bg-amber-400/10 text-amber-300 text-xs font-mono font-bold hover:bg-amber-400/20 transition"
          >
            ARRI 35 Master Commercial
          </button>
          <button
            onClick={() => loadPreset("redAnamorphic")}
            className="px-3 py-1.5 rounded-lg border border-cyan-400/40 bg-cyan-400/10 text-cyan-300 text-xs font-mono font-bold hover:bg-cyan-400/20 transition"
          >
            RED 8K VV Anamorphic
          </button>
          <button
            onClick={() => loadPreset("docuFx6")}
            className="px-3 py-1.5 rounded-lg border border-emerald-400/40 bg-emerald-400/10 text-emerald-300 text-xs font-mono font-bold hover:bg-emerald-400/20 transition"
          >
            Sony FX6 Run &amp; Gun
          </button>
        </div>

        <button
          onClick={() => window.print()}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-white/20 bg-neutral-800 text-xs font-mono font-bold text-white hover:bg-neutral-700 transition"
        >
          <Printer className="h-4 w-4 text-amber-400" /> Export Rig Spec
        </button>
      </div>

      {/* ─── LIVE TELEMETRY RADAR BAR ─── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3">
        <div className="rounded-xl border border-white/10 bg-neutral-900/80 p-3.5 backdrop-blur">
          <p className="text-[10px] font-mono uppercase tracking-wider text-neutral-400">Total Payload Weight</p>
          <p className="mt-1 text-xl font-black text-white font-mono">{telemetry.totalKg} kg</p>
          <p className="text-xs text-neutral-400 font-mono">({telemetry.totalLbs} lbs)</p>
        </div>

        <div className="rounded-xl border border-white/10 bg-neutral-900/80 p-3.5 backdrop-blur">
          <p className="text-[10px] font-mono uppercase tracking-wider text-neutral-400">Rig Power Draw</p>
          <p className="mt-1 text-xl font-black text-cyan-400 font-mono">{telemetry.totalWatts} Watts</p>
          <p className="text-xs text-neutral-400 font-mono">Active Continuous</p>
        </div>

        <div className="rounded-xl border border-white/10 bg-neutral-900/80 p-3.5 backdrop-blur">
          <p className="text-[10px] font-mono uppercase tracking-wider text-neutral-400">Single Battery Runtime</p>
          <p className="mt-1 text-xl font-black text-emerald-400 font-mono">{telemetry.runtimeMinutes} mins</p>
          <p className="text-xs text-neutral-400 font-mono">~{telemetry.runtimeHours} hours / brick</p>
        </div>

        <div className="rounded-xl border border-white/10 bg-neutral-900/80 p-3.5 backdrop-blur">
          <p className="text-[10px] font-mono uppercase tracking-wider text-neutral-400">Rig Rental Rate</p>
          <p className="mt-1 text-xl font-black text-amber-400 font-mono">${telemetry.totalDailyRate} / day</p>
          <p className="text-xs text-neutral-400 font-mono">{telemetry.componentCount} Active Modules</p>
        </div>

        <div className="rounded-xl border border-white/10 bg-neutral-900/80 p-3.5 backdrop-blur col-span-2 sm:col-span-4 lg:col-span-1">
          <p className="text-[10px] font-mono uppercase tracking-wider text-neutral-400">Operating Class</p>
          <p className={`mt-1 text-xs font-black font-mono uppercase ${telemetry.ergonomics.color}`}>
            {telemetry.ergonomics.label}
          </p>
          <p className="text-[10px] text-neutral-400 truncate mt-0.5">{telemetry.ergonomics.description}</p>
        </div>
      </div>

      {/* ─── COMPATIBILITY DIAGNOSTIC ALERTS ─── */}
      {telemetry.warnings.length > 0 && (
        <div className="rounded-2xl border border-amber-400/40 bg-amber-400/10 p-4 space-y-2">
          <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase text-amber-300">
            <AlertTriangle className="h-4 w-4 text-amber-400" />
            <span>Mechanical Compatibility Notes ({telemetry.warnings.length})</span>
          </div>
          <div className="space-y-1 pl-6 text-xs text-neutral-300 font-mono list-disc">
            {telemetry.warnings.map((w, i) => (
              <p key={i}>• {w}</p>
            ))}
          </div>
        </div>
      )}

      {/* ─── MAIN TWO-COLUMN WORKBENCH ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT COLUMN: INTERACTIVE VISUAL RIG CANVAS */}
        <div className="lg:col-span-7 space-y-4">
          <div className="relative aspect-video w-full overflow-hidden rounded-3xl border border-white/20 bg-neutral-950 p-6 shadow-2xl flex flex-col justify-between">
            {/* Background Grid Accent */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-size-[24px_24px] pointer-events-none" />

            {/* TOP ROW: MONITOR & AUDIO / TIMECODE */}
            <div className="relative z-10 flex justify-between items-start">
              {/* Monitor Module */}
              <div
                onClick={() => {
                  playClick();
                  setActiveTab("monitor");
                }}
                className={`p-3 rounded-2xl border cursor-pointer transition-all ${
                  selectedMonitor
                    ? "border-cyan-400/50 bg-cyan-400/10 text-cyan-300"
                    : "border-dashed border-white/20 bg-neutral-900/40 text-neutral-500 hover:border-white/40"
                }`}
              >
                <div className="flex items-center gap-2">
                  <Tv className="h-4 w-4 text-cyan-400" />
                  <span className="text-xs font-mono font-bold">
                    {selectedMonitor ? selectedMonitor.name.split(" ")[0] + " " + selectedMonitor.name.split(" ")[1] : "No Monitor"}
                  </span>
                </div>
                {selectedMonitor && (
                  <p className="text-[10px] font-mono text-neutral-400 mt-1">
                    {selectedMonitor.weightGrams}g &middot; {selectedMonitor.powerWatts}W
                  </p>
                )}
              </div>

              {/* Wireless TX Module */}
              <div
                onClick={() => {
                  playClick();
                  setActiveTab("wireless");
                }}
                className={`p-3 rounded-2xl border cursor-pointer transition-all ${
                  selectedWirelessTx
                    ? "border-purple-400/50 bg-purple-400/10 text-purple-300"
                    : "border-dashed border-white/20 bg-neutral-900/40 text-neutral-500 hover:border-white/40"
                }`}
              >
                <div className="flex items-center gap-2">
                  <Radio className="h-4 w-4 text-purple-400" />
                  <span className="text-xs font-mono font-bold">
                    {selectedWirelessTx ? selectedWirelessTx.name.split(" ")[0] + " TX" : "No Wireless TX"}
                  </span>
                </div>
                {selectedWirelessTx && (
                  <p className="text-[10px] font-mono text-neutral-400 mt-1">
                    {selectedWirelessTx.weightGrams}g &middot; {selectedWirelessTx.powerWatts}W
                  </p>
                )}
              </div>
            </div>

            {/* MIDDLE ROW: MATTE BOX -> LENS -> CAMERA CORE -> BATTERY */}
            <div className="relative z-10 grid grid-cols-4 gap-2 my-auto items-center">
              {/* Matte Box Slot */}
              <div
                onClick={() => {
                  playClick();
                  setActiveTab("mattebox");
                }}
                className={`p-3 rounded-2xl border text-center cursor-pointer transition-all ${
                  selectedMatteBox
                    ? "border-emerald-400/50 bg-emerald-400/10 text-emerald-300"
                    : "border-dashed border-white/20 bg-neutral-900/40 text-neutral-500 hover:border-white/40"
                }`}
              >
                <Maximize2 className="h-5 w-5 mx-auto text-emerald-400 mb-1" />
                <p className="text-xs font-mono font-bold truncate">
                  {selectedMatteBox ? selectedMatteBox.name.split(" ")[0] : "+ Matte Box"}
                </p>
                {selectedMatteBox && (
                  <p className="text-[9px] font-mono text-neutral-400">{selectedMatteBox.weightGrams}g</p>
                )}
              </div>

              {/* Lens Slot */}
              <div
                onClick={() => {
                  playClick();
                  setActiveTab("lens");
                }}
                className="p-3 rounded-2xl border border-amber-400/50 bg-amber-400/10 text-center cursor-pointer transition-all hover:bg-amber-400/20"
              >
                <Eye className="h-5 w-5 mx-auto text-amber-400 mb-1" />
                <p className="text-xs font-mono font-bold truncate">{selectedLens.name.split(" ")[0]}</p>
                <p className="text-[9px] font-mono text-amber-300">{selectedLens.mountType} Mount</p>
              </div>

              {/* Camera Body Core */}
              <div
                onClick={() => {
                  playClick();
                  setActiveTab("camera");
                }}
                className="p-4 rounded-2xl border-2 border-amber-400 bg-neutral-900 text-center cursor-pointer transition-all shadow-lg shadow-amber-400/10 hover:border-amber-300"
              >
                <Camera className="h-6 w-6 mx-auto text-amber-400 mb-1" />
                <p className="text-xs font-mono font-black text-white truncate">{selectedCamera.name.replace(" Camera Body", "").replace(" Body", "")}</p>
                <p className="text-[10px] font-mono text-cyan-400">{selectedCamera.powerWatts}W &middot; {selectedCamera.weightGrams}g</p>
              </div>

              {/* Battery Slot */}
              <div
                onClick={() => {
                  playClick();
                  setActiveTab("power");
                }}
                className="p-3 rounded-2xl border border-emerald-400/50 bg-emerald-400/10 text-center cursor-pointer transition-all hover:bg-emerald-400/20"
              >
                <BatteryCharging className="h-5 w-5 mx-auto text-emerald-400 mb-1" />
                <p className="text-xs font-mono font-bold truncate">{selectedBattery.name.split(" ")[0]}</p>
                <p className="text-[9px] font-mono text-emerald-300">{selectedBattery.capacityWh}Wh Brick</p>
              </div>
            </div>

            {/* BOTTOM ROW: CAGE / BASEPLATE & FOLLOW FOCUS MOTORS */}
            <div className="relative z-10 flex justify-between items-end">
              {/* Follow Focus Motor */}
              <div
                onClick={() => {
                  playClick();
                  setActiveTab("followfocus");
                }}
                className={`p-2.5 rounded-xl border cursor-pointer transition-all ${
                  selectedFollowFocus
                    ? "border-cyan-400/40 bg-cyan-400/10 text-cyan-300"
                    : "border-dashed border-white/20 bg-neutral-900/40 text-neutral-500"
                }`}
              >
                <span className="text-[11px] font-mono font-bold">
                  {selectedFollowFocus ? selectedFollowFocus.name.split(" ")[0] + " Focus" : "+ Follow Focus"}
                </span>
              </div>

              {/* Cage / 15mm Rod Support */}
              <div
                onClick={() => {
                  playClick();
                  setActiveTab("cage");
                }}
                className={`p-2.5 rounded-xl border cursor-pointer transition-all ${
                  selectedCage
                    ? "border-white/30 bg-neutral-900 text-white font-bold"
                    : "border-dashed border-white/20 bg-neutral-900/40 text-neutral-500"
                }`}
              >
                <span className="text-[11px] font-mono">
                  {selectedCage ? selectedCage.name.split(" ")[0] + " Armor Baseplate" : "+ Rig Cage"}
                </span>
              </div>
            </div>
          </div>

          {/* Timecode & Accessories Checkboxes */}
          <div className="rounded-2xl border border-white/10 bg-neutral-900/80 p-4 backdrop-blur space-y-2">
            <span className="text-xs font-mono text-neutral-400 uppercase font-bold">Connected Smart Accessories:</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {RIG_ACCESSORIES.map((acc) => {
                const isChecked = selectedAccessories.includes(acc.id);
                return (
                  <button
                    key={acc.id}
                    onClick={() => toggleAccessory(acc.id)}
                    className={`p-2.5 rounded-xl border text-left flex items-center justify-between text-xs transition-all ${
                      isChecked
                        ? "border-amber-400 bg-amber-400/10 text-white font-bold"
                        : "border-white/10 bg-neutral-950/60 text-neutral-400"
                    }`}
                  >
                    <div>
                      <p className="text-white font-mono">{acc.name}</p>
                      <p className="text-[10px] text-neutral-400 font-mono">+{acc.weightGrams}g &middot; ${acc.pricePerDay}/day</p>
                    </div>
                    <div className={`h-4 w-4 rounded border flex items-center justify-center ${isChecked ? "border-amber-400 bg-amber-400 text-black font-bold" : "border-white/20"}`}>
                      {isChecked && "✓"}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: MODULE CONFIGURATOR ACCORDION */}
        <div className="lg:col-span-5 space-y-5">
          {/* CATEGORY SELECTOR TABS */}
          <div className="flex gap-1 overflow-x-auto pb-1">
            {[
              { id: "camera", label: "Camera" },
              { id: "lens", label: "Optics" },
              { id: "cage", label: "Cage/Rods" },
              { id: "mattebox", label: "Matte Box" },
              { id: "followfocus", label: "Focus" },
              { id: "monitor", label: "Monitor" },
              { id: "wireless", label: "Wireless" },
              { id: "power", label: "Battery" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  playClick();
                  setActiveTab(tab.id as any);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold whitespace-nowrap transition-all ${
                  activeTab === tab.id
                    ? "bg-amber-400 text-black shadow-md shadow-amber-400/20"
                    : "bg-neutral-900 text-neutral-400 border border-white/10 hover:text-white"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* ACTIVE TAB HARDWARE OPTIONS */}
          <div className="rounded-2xl border border-white/10 bg-neutral-900/90 p-5 backdrop-blur space-y-4">
            {/* 1. CAMERA SELECTION */}
            {activeTab === "camera" && (
              <div className="space-y-3">
                <h3 className="text-xs font-mono uppercase text-neutral-400 font-bold">Select Cinema Camera Core:</h3>
                {RIG_CAMERAS.map((cam) => (
                  <button
                    key={cam.id}
                    onClick={() => {
                      playClick();
                      setSelectedCamera(cam);
                    }}
                    className={`w-full p-3 rounded-xl text-left border text-xs transition-all ${
                      selectedCamera.id === cam.id
                        ? "border-amber-400 bg-amber-400/10 text-white font-bold"
                        : "border-white/10 bg-neutral-950/60 text-neutral-400 hover:text-white"
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-white font-bold">{cam.name}</span>
                      <span className="font-mono text-amber-400">${cam.pricePerDay}/day</span>
                    </div>
                    <p className="mt-1 text-[11px] text-neutral-400 font-sans font-normal">{cam.description}</p>
                    <div className="mt-2 flex gap-3 text-[10px] font-mono text-neutral-300">
                      <span>Mount: {cam.mountType}</span>
                      <span>Weight: {cam.weightGrams}g</span>
                      <span>Power: {cam.powerWatts}W</span>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* 2. LENS SELECTION */}
            {activeTab === "lens" && (
              <div className="space-y-3">
                <h3 className="text-xs font-mono uppercase text-neutral-400 font-bold">Select Cinema Lens / Optics:</h3>
                {RIG_LENSES.map((lens) => (
                  <button
                    key={lens.id}
                    onClick={() => {
                      playClick();
                      setSelectedLens(lens);
                    }}
                    className={`w-full p-3 rounded-xl text-left border text-xs transition-all ${
                      selectedLens.id === lens.id
                        ? "border-amber-400 bg-amber-400/10 text-white font-bold"
                        : "border-white/10 bg-neutral-950/60 text-neutral-400 hover:text-white"
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-white font-bold">{lens.name}</span>
                      <span className="font-mono text-amber-400">${lens.pricePerDay}/day</span>
                    </div>
                    <p className="mt-1 text-[11px] text-neutral-400 font-sans font-normal">{lens.description}</p>
                    <div className="mt-2 flex gap-3 text-[10px] font-mono text-neutral-300">
                      <span>Mount: {lens.mountType}</span>
                      <span>Front: Ø{lens.frontDiameterMm}mm</span>
                      <span>Weight: {lens.weightGrams}g</span>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* 3. CAGE SELECTION */}
            {activeTab === "cage" && (
              <div className="space-y-3">
                <h3 className="text-xs font-mono uppercase text-neutral-400 font-bold">Select Rigging Armor &amp; Rod Baseplate:</h3>
                {RIG_CAGES.map((cage) => (
                  <button
                    key={cage.id}
                    onClick={() => {
                      playClick();
                      setSelectedCage(cage);
                    }}
                    className={`w-full p-3 rounded-xl text-left border text-xs transition-all ${
                      selectedCage?.id === cage.id
                        ? "border-amber-400 bg-amber-400/10 text-white font-bold"
                        : "border-white/10 bg-neutral-950/60 text-neutral-400 hover:text-white"
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-white font-bold">{cage.name}</span>
                      <span className="font-mono text-amber-400">${cage.pricePerDay}/day</span>
                    </div>
                    <p className="mt-1 text-[11px] text-neutral-400 font-sans font-normal">{cage.description}</p>
                  </button>
                ))}
              </div>
            )}

            {/* 4. MATTE BOX SELECTION */}
            {activeTab === "mattebox" && (
              <div className="space-y-3">
                <h3 className="text-xs font-mono uppercase text-neutral-400 font-bold">Select Matte Box &amp; Filter Stage:</h3>
                {RIG_MATTEBOXES.map((mb) => (
                  <button
                    key={mb.id}
                    onClick={() => {
                      playClick();
                      setSelectedMatteBox(mb);
                    }}
                    className={`w-full p-3 rounded-xl text-left border text-xs transition-all ${
                      selectedMatteBox?.id === mb.id
                        ? "border-emerald-400 bg-emerald-400/10 text-white font-bold"
                        : "border-white/10 bg-neutral-950/60 text-neutral-400 hover:text-white"
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-white font-bold">{mb.name}</span>
                      <span className="font-mono text-emerald-400">${mb.pricePerDay}/day</span>
                    </div>
                    <p className="mt-1 text-[11px] text-neutral-400 font-sans font-normal">{mb.description}</p>
                  </button>
                ))}
              </div>
            )}

            {/* 5. FOLLOW FOCUS SELECTION */}
            {activeTab === "followfocus" && (
              <div className="space-y-3">
                <h3 className="text-xs font-mono uppercase text-neutral-400 font-bold">Select Lens Control &amp; Focus Motor:</h3>
                {RIG_FOLLOWFOCUS.map((ff) => (
                  <button
                    key={ff.id}
                    onClick={() => {
                      playClick();
                      setSelectedFollowFocus(ff);
                    }}
                    className={`w-full p-3 rounded-xl text-left border text-xs transition-all ${
                      selectedFollowFocus?.id === ff.id
                        ? "border-cyan-400 bg-cyan-400/10 text-white font-bold"
                        : "border-white/10 bg-neutral-950/60 text-neutral-400 hover:text-white"
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-white font-bold">{ff.name}</span>
                      <span className="font-mono text-cyan-400">${ff.pricePerDay}/day</span>
                    </div>
                    <p className="mt-1 text-[11px] text-neutral-400 font-sans font-normal">{ff.description}</p>
                  </button>
                ))}
              </div>
            )}

            {/* 6. MONITOR SELECTION */}
            {activeTab === "monitor" && (
              <div className="space-y-3">
                <h3 className="text-xs font-mono uppercase text-neutral-400 font-bold">Select Onboard Monitor / EVF:</h3>
                {RIG_MONITORS.map((mon) => (
                  <button
                    key={mon.id}
                    onClick={() => {
                      playClick();
                      setSelectedMonitor(mon);
                    }}
                    className={`w-full p-3 rounded-xl text-left border text-xs transition-all ${
                      selectedMonitor?.id === mon.id
                        ? "border-cyan-400 bg-cyan-400/10 text-white font-bold"
                        : "border-white/10 bg-neutral-950/60 text-neutral-400 hover:text-white"
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-white font-bold">{mon.name}</span>
                      <span className="font-mono text-cyan-400">${mon.pricePerDay}/day</span>
                    </div>
                    <p className="mt-1 text-[11px] text-neutral-400 font-sans font-normal">{mon.description}</p>
                  </button>
                ))}
              </div>
            )}

            {/* 7. WIRELESS TX SELECTION */}
            {activeTab === "wireless" && (
              <div className="space-y-3">
                <h3 className="text-xs font-mono uppercase text-neutral-400 font-bold">Select Wireless Video Transmitter:</h3>
                {RIG_WIRELESSTX.map((tx) => (
                  <button
                    key={tx.id}
                    onClick={() => {
                      playClick();
                      setSelectedWirelessTx(tx);
                    }}
                    className={`w-full p-3 rounded-xl text-left border text-xs transition-all ${
                      selectedWirelessTx?.id === tx.id
                        ? "border-purple-400 bg-purple-400/10 text-white font-bold"
                        : "border-white/10 bg-neutral-950/60 text-neutral-400 hover:text-white"
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-white font-bold">{tx.name}</span>
                      <span className="font-mono text-purple-400">${tx.pricePerDay}/day</span>
                    </div>
                    <p className="mt-1 text-[11px] text-neutral-400 font-sans font-normal">{tx.description}</p>
                  </button>
                ))}
              </div>
            )}

            {/* 8. BATTERY SELECTION */}
            {activeTab === "power" && (
              <div className="space-y-3">
                <h3 className="text-xs font-mono uppercase text-neutral-400 font-bold">Select Battery Power System:</h3>
                {RIG_BATTERIES.map((bat) => (
                  <button
                    key={bat.id}
                    onClick={() => {
                      playClick();
                      setSelectedBattery(bat);
                    }}
                    className={`w-full p-3 rounded-xl text-left border text-xs transition-all ${
                      selectedBattery.id === bat.id
                        ? "border-emerald-400 bg-emerald-400/10 text-white font-bold"
                        : "border-white/10 bg-neutral-950/60 text-neutral-400 hover:text-white"
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-white font-bold">{bat.name}</span>
                      <span className="font-mono text-emerald-400">${bat.pricePerDay}/day</span>
                    </div>
                    <p className="mt-1 text-[11px] text-neutral-400 font-sans font-normal">{bat.description}</p>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* TOTAL PACKAGE SUMMARY & BOOKING CARD */}
          <div className="rounded-2xl border border-amber-400/30 bg-linear-to-b from-neutral-900 to-black p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <span className="text-xs font-mono font-bold uppercase text-amber-300 flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 text-amber-400" />
                Configured Custom Rig
              </span>
              <span className="text-base font-black font-mono text-white">
                ${telemetry.totalDailyRate} <span className="text-xs font-normal text-neutral-400">/ day</span>
              </span>
            </div>

            <p className="text-xs text-neutral-300 leading-relaxed">
              Includes laser-cut custom Pelican flight-case, tested back-focus, calibrated rods, and AC prep certification.
            </p>

            <Link
              href="/packages"
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-linear-to-r from-amber-400 to-amber-500 py-3.5 text-xs font-black text-black uppercase tracking-wider hover:opacity-90 transition shadow-lg shadow-amber-400/20"
            >
              <ShoppingBag className="h-4 w-4" />
              <span>Book This Configured Rig</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
