"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  CINE_POWER_CODECS,
  BATTERY_CATALOG,
  MEDIA_CARD_CATALOG,
  CameraPowerAndCodecSpec,
  BatterySpec,
  MediaCardSpec,
} from "@/lib/data/cine-calculator-data";
import {
  Zap,
  HardDrive,
  BatteryCharging,
  Clock,
  ArrowRight,
  Sparkles,
  Layers,
  ShoppingBag,
} from "lucide-react";

export default function PowerMediaClient() {
  // States
  const [selectedCamera, setSelectedCamera] = useState<CameraPowerAndCodecSpec>(CINE_POWER_CODECS[0]);
  const [selectedCodecId, setSelectedCodecId] = useState<string>(CINE_POWER_CODECS[0].supportedCodecs[0].id);
  const [frameRate, setFrameRate] = useState<number>(24);
  const [shootingHoursPerDay, setShootingHoursPerDay] = useState<number>(10);
  const [rollingRatioPercent, setRollingRatioPercent] = useState<number>(35); // 35% active recording time
  const [multiDayCount, setMultiDayCount] = useState<number>(3);

  // Rig Accessories Power Draw (Watts)
  const [hasOnboardMonitor, setHasOnboardMonitor] = useState<boolean>(true); // +15W (SmallHD Cine 7)
  const [hasWirelessVideo, setHasWirelessVideo] = useState<boolean>(true); // +12W (Teradek Bolt 4K)
  const [hasWirelessFocus, setHasWirelessFocus] = useState<boolean>(true); // +8W (Tilta Nucleus-M)
  const [hasLensMotors, setHasLensMotors] = useState<boolean>(false); // +10W

  // Selected Battery & Media models
  const [selectedBattery, setSelectedBattery] = useState<BatterySpec>(BATTERY_CATALOG[0]);
  const [selectedMediaCard, setSelectedMediaCard] = useState<MediaCardSpec>(MEDIA_CARD_CATALOG[0]);

  // Codec object
  const activeCodec = useMemo(() => {
    return (
      selectedCamera.supportedCodecs.find((c) => c.id === selectedCodecId) ||
      selectedCamera.supportedCodecs[0]
    );
  }, [selectedCamera, selectedCodecId]);

  // Update selected codec when camera changes if previous codec doesn't exist
  const handleCameraChange = (cam: CameraPowerAndCodecSpec) => {
    setSelectedCamera(cam);
    setSelectedCodecId(cam.supportedCodecs[0].id);
  };

  // Calculations
  const metrics = useMemo(() => {
    // 1. Total Rig Power Draw (Watts)
    let totalWatts = selectedCamera.averagePowerDrawWatts;
    if (hasOnboardMonitor) totalWatts += 15;
    if (hasWirelessVideo) totalWatts += 12;
    if (hasWirelessFocus) totalWatts += 8;
    if (hasLensMotors) totalWatts += 10;

    // 2. Total Daily Energy Required (Watt-hours)
    // Daily active energy = TotalWatts * shootingHoursPerDay
    const dailyEnergyWh = totalWatts * shootingHoursPerDay;
    // With 20% safety factor (cold weather, stand-by standby drain)
    const dailyEnergyWithBufferWh = dailyEnergyWh * 1.2;

    // Battery runtime per single battery (Hours)
    const runtimePerBatteryHours = selectedBattery.capacityWh / totalWatts;
    const runtimePerBatteryMinutes = Math.round(runtimePerBatteryHours * 60);

    // Required Batteries per day to cover full shoot with safety buffer
    const batteriesNeededPerDay = Math.ceil(dailyEnergyWithBufferWh / selectedBattery.capacityWh);

    // 3. Storage and Data Calculations
    // Frame rate multiplier (24fps is baseline 1.0x)
    const fpsMultiplier = frameRate / 24;
    // Effective bitrate MB/s
    const effectiveBitrateMBps = activeCodec.bitrateMBpsAt24fps * fpsMultiplier;
    
    // Total Rolling Time in Hours per day = shootingHoursPerDay * (rollingRatioPercent / 100)
    const dailyRollingHours = shootingHoursPerDay * (rollingRatioPercent / 100);
    const dailyRollingSeconds = dailyRollingHours * 3600;

    // Total Daily Data in Gigabytes (GB)
    const totalDailyDataMB = effectiveBitrateMBps * dailyRollingSeconds;
    const totalDailyDataGB = totalDailyDataMB / 1024;
    const totalDailyDataTB = totalDailyDataGB / 1024;

    // Media Card record time per single card (Minutes)
    const recordTimePerCardMinutes = Math.round((selectedMediaCard.capacityGB * 1024) / (effectiveBitrateMBps * 60));

    // Media Cards needed per day (with 1 spare backup rotation card)
    const cardsNeededPerDay = Math.max(2, Math.ceil(totalDailyDataGB / selectedMediaCard.capacityGB) + 1);

    // Multi-day totals
    const totalShootDataTB = totalDailyDataTB * multiDayCount;

    // Cost estimation for accessories
    const batteryDailyCost = batteriesNeededPerDay * selectedBattery.pricePerDay;
    const mediaDailyCost = cardsNeededPerDay * selectedMediaCard.pricePerDay;

    return {
      totalWatts,
      dailyEnergyWh: Math.round(dailyEnergyWh),
      dailyEnergyWithBufferWh: Math.round(dailyEnergyWithBufferWh),
      runtimePerBatteryHours: runtimePerBatteryHours.toFixed(1),
      runtimePerBatteryMinutes,
      batteriesNeededPerDay,
      effectiveBitrateMBps: effectiveBitrateMBps.toFixed(1),
      dailyRollingHours: dailyRollingHours.toFixed(1),
      totalDailyDataGB: Math.round(totalDailyDataGB),
      totalDailyDataTB: totalDailyDataTB.toFixed(2),
      recordTimePerCardMinutes,
      cardsNeededPerDay,
      totalShootDataTB: totalShootDataTB.toFixed(2),
      batteryDailyCost,
      mediaDailyCost,
      totalAccessoryDailyCost: batteryDailyCost + mediaDailyCost,
    };
  }, [
    selectedCamera,
    activeCodec,
    frameRate,
    shootingHoursPerDay,
    rollingRatioPercent,
    multiDayCount,
    hasOnboardMonitor,
    hasWirelessVideo,
    hasWirelessFocus,
    hasLensMotors,
    selectedBattery,
    selectedMediaCard,
  ]);

  return (
    <div className="space-y-8">
      {/* ─── TOP KEY METRICS CARDS ─── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3">
        <div className="rounded-xl border border-white/10 bg-neutral-900/80 p-3.5 backdrop-blur">
          <p className="text-[10px] font-mono uppercase tracking-wider text-neutral-400">Total Rig Power Draw</p>
          <p className="mt-1 text-xl font-black text-amber-400 font-mono">{metrics.totalWatts} Watts</p>
          <p className="text-xs text-neutral-400 font-mono">Camera + {hasOnboardMonitor ? "Mon " : ""}{hasWirelessVideo ? "TX " : ""}{hasWirelessFocus ? "Focus" : ""}</p>
        </div>

        <div className="rounded-xl border border-white/10 bg-neutral-900/80 p-3.5 backdrop-blur">
          <p className="text-[10px] font-mono uppercase tracking-wider text-neutral-400">Single Batt Runtime</p>
          <p className="mt-1 text-xl font-black text-emerald-400 font-mono">{metrics.runtimePerBatteryMinutes} mins</p>
          <p className="text-xs text-neutral-400 font-mono">~{metrics.runtimePerBatteryHours} hrs / pack</p>
        </div>

        <div className="rounded-xl border border-white/10 bg-neutral-900/80 p-3.5 backdrop-blur">
          <p className="text-[10px] font-mono uppercase tracking-wider text-neutral-400">Rec. Battery Count</p>
          <p className="mt-1 text-xl font-black text-emerald-300 font-mono">{metrics.batteriesNeededPerDay}x Bricks</p>
          <p className="text-xs text-neutral-400 font-mono">For {shootingHoursPerDay}hr shoot day (+20% safety)</p>
        </div>

        <div className="rounded-xl border border-white/10 bg-neutral-900/80 p-3.5 backdrop-blur">
          <p className="text-[10px] font-mono uppercase tracking-wider text-neutral-400">Daily Data Footprint</p>
          <p className="mt-1 text-xl font-black text-cyan-400 font-mono">{metrics.totalDailyDataGB} GB</p>
          <p className="text-xs text-neutral-400 font-mono">({metrics.totalDailyDataTB} TB / day)</p>
        </div>

        <div className="rounded-xl border border-white/10 bg-neutral-900/80 p-3.5 backdrop-blur col-span-2 sm:col-span-4 lg:col-span-1">
          <p className="text-[10px] font-mono uppercase tracking-wider text-neutral-400">Rec. Media Cards</p>
          <p className="mt-1 text-xl font-black text-purple-400 font-mono">{metrics.cardsNeededPerDay}x Cards</p>
          <p className="text-xs text-neutral-400 font-mono">{metrics.recordTimePerCardMinutes}m per card</p>
        </div>
      </div>

      {/* ─── MAIN TWO COLUMN WORKBENCH ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT COLUMN: CAMERA, RIG & SCHEDULE SETUP */}
        <div className="lg:col-span-7 space-y-6">
          {/* CAMERA SELECTION */}
          <div className="rounded-2xl border border-white/10 bg-neutral-900/80 p-5 backdrop-blur space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-black uppercase tracking-wider text-white flex items-center gap-2">
                <Zap className="h-4 w-4 text-amber-400" />
                1. Select Camera Platform
              </h2>
              <span className="text-xs font-mono text-amber-400">{selectedCamera.averagePowerDrawWatts}W Base Draw</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {CINE_POWER_CODECS.map((cam) => (
                <button
                  key={cam.id}
                  onClick={() => handleCameraChange(cam)}
                  className={`p-2.5 rounded-xl text-left border text-xs transition-all ${
                    selectedCamera.id === cam.id
                      ? "border-amber-400 bg-amber-400/10 text-white font-bold shadow-md shadow-amber-400/10"
                      : "border-white/10 bg-neutral-950/60 text-neutral-400 hover:text-white"
                  }`}
                >
                  <p className="font-bold truncate text-white">{cam.name}</p>
                  <p className="text-[10px] font-mono text-neutral-400">{cam.averagePowerDrawWatts}W Draw</p>
                </button>
              ))}
            </div>
          </div>

          {/* CODEC & RECORDING BITRATE */}
          <div className="rounded-2xl border border-white/10 bg-neutral-900/80 p-5 backdrop-blur space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-black uppercase tracking-wider text-white flex items-center gap-2">
                <HardDrive className="h-4 w-4 text-cyan-400" />
                2. Codec &amp; Resolution Preset
              </h2>
              <span className="text-xs font-mono text-cyan-400">{metrics.effectiveBitrateMBps} MB/s Data Rate</span>
            </div>

            <div className="space-y-2">
              {selectedCamera.supportedCodecs.map((codec) => (
                <button
                  key={codec.id}
                  onClick={() => setSelectedCodecId(codec.id)}
                  className={`w-full p-3 rounded-xl text-left border text-xs transition-all ${
                    activeCodec.id === codec.id
                      ? "border-cyan-400 bg-cyan-400/10 text-white font-bold"
                      : "border-white/10 bg-neutral-950/60 text-neutral-400 hover:text-white"
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="text-white font-bold">{codec.label}</span>
                    <span className="font-mono text-cyan-400 text-[11px]">{codec.bitrateMBpsAt24fps} MB/s @ 24fps</span>
                  </div>
                  <p className="mt-1 text-[11px] text-neutral-400 font-sans font-normal">{codec.description}</p>
                </button>
              ))}
            </div>

            {/* Frame Rate Selector */}
            <div className="pt-2">
              <div className="flex justify-between text-xs font-mono mb-2">
                <span className="text-neutral-400">Capture Frame Rate (FPS):</span>
                <span className="text-cyan-300 font-bold">{frameRate} FPS ({frameRate === 24 ? "Standard 1.0x" : `${(frameRate / 24).toFixed(1)}x Data Multiplier`})</span>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {[24, 48, 60, 120].map((fps) => (
                  <button
                    key={fps}
                    onClick={() => setFrameRate(fps)}
                    className={`py-2 rounded-xl text-center text-xs font-mono transition-all ${
                      frameRate === fps
                        ? "bg-cyan-400 text-black font-bold"
                        : "bg-neutral-950 border border-white/10 text-neutral-400 hover:text-white"
                    }`}
                  >
                    {fps} FPS
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* RIG ACCESSORIES POWER ADD-ONS */}
          <div className="rounded-2xl border border-white/10 bg-neutral-900/80 p-5 backdrop-blur space-y-4">
            <h2 className="text-sm font-black uppercase tracking-wider text-white flex items-center gap-2">
              <Layers className="h-4 w-4 text-purple-400" />
              3. Connected Rig Accessories (Power Draw)
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button
                onClick={() => setHasOnboardMonitor(!hasOnboardMonitor)}
                className={`p-3 rounded-xl border text-left flex items-center justify-between text-xs transition-all ${
                  hasOnboardMonitor
                    ? "border-purple-400 bg-purple-400/10 text-white font-bold"
                    : "border-white/10 bg-neutral-950/60 text-neutral-400"
                }`}
              >
                <div>
                  <p className="text-white">Onboard 7&quot; Monitor (SmallHD / Cine)</p>
                  <p className="text-[10px] font-mono text-purple-300">+15 Watts</p>
                </div>
                <div className={`h-4 w-4 rounded-md border flex items-center justify-center ${hasOnboardMonitor ? "border-purple-400 bg-purple-400 text-black" : "border-white/20"}`}>
                  {hasOnboardMonitor && "✓"}
                </div>
              </button>

              <button
                onClick={() => setHasWirelessVideo(!hasWirelessVideo)}
                className={`p-3 rounded-xl border text-left flex items-center justify-between text-xs transition-all ${
                  hasWirelessVideo
                    ? "border-purple-400 bg-purple-400/10 text-white font-bold"
                    : "border-white/10 bg-neutral-950/60 text-neutral-400"
                }`}
              >
                <div>
                  <p className="text-white">Wireless Video TX (Teradek 4K)</p>
                  <p className="text-[10px] font-mono text-purple-300">+12 Watts</p>
                </div>
                <div className={`h-4 w-4 rounded-md border flex items-center justify-center ${hasWirelessVideo ? "border-purple-400 bg-purple-400 text-black" : "border-white/20"}`}>
                  {hasWirelessVideo && "✓"}
                </div>
              </button>

              <button
                onClick={() => setHasWirelessFocus(!hasWirelessFocus)}
                className={`p-3 rounded-xl border text-left flex items-center justify-between text-xs transition-all ${
                  hasWirelessFocus
                    ? "border-purple-400 bg-purple-400/10 text-white font-bold"
                    : "border-white/10 bg-neutral-950/60 text-neutral-400"
                }`}
              >
                <div>
                  <p className="text-white">Wireless Follow Focus (Tilta)</p>
                  <p className="text-[10px] font-mono text-purple-300">+8 Watts</p>
                </div>
                <div className={`h-4 w-4 rounded-md border flex items-center justify-center ${hasWirelessFocus ? "border-purple-400 bg-purple-400 text-black" : "border-white/20"}`}>
                  {hasWirelessFocus && "✓"}
                </div>
              </button>

              <button
                onClick={() => setHasLensMotors(!hasLensMotors)}
                className={`p-3 rounded-xl border text-left flex items-center justify-between text-xs transition-all ${
                  hasLensMotors
                    ? "border-purple-400 bg-purple-400/10 text-white font-bold"
                    : "border-white/10 bg-neutral-950/60 text-neutral-400"
                }`}
              >
                <div>
                  <p className="text-white">Lens Zoom / Iris Motors</p>
                  <p className="text-[10px] font-mono text-purple-300">+10 Watts</p>
                </div>
                <div className={`h-4 w-4 rounded-md border flex items-center justify-center ${hasLensMotors ? "border-purple-400 bg-purple-400 text-black" : "border-white/20"}`}>
                  {hasLensMotors && "✓"}
                </div>
              </button>
            </div>
          </div>

          {/* SHOOT DAY SCHEDULE SLIDERS */}
          <div className="rounded-2xl border border-white/10 bg-neutral-900/80 p-5 backdrop-blur space-y-5">
            <h2 className="text-sm font-black uppercase tracking-wider text-white flex items-center gap-2">
              <Clock className="h-4 w-4 text-emerald-400" />
              4. Production Shoot Schedule
            </h2>

            {/* Daily Hours Slider */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-neutral-400">Daily Camera On-Time:</span>
                <span className="text-emerald-300 font-bold">{shootingHoursPerDay} Hours / Day</span>
              </div>
              <input
                type="range"
                min="4"
                max="16"
                step="1"
                value={shootingHoursPerDay}
                onChange={(e) => setShootingHoursPerDay(Number(e.target.value))}
                className="w-full accent-emerald-400 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-neutral-500 font-mono">
                <span>4h Short Day</span>
                <span>10h Standard Commercial</span>
                <span>16h Feature Long Day</span>
              </div>
            </div>

            {/* Rolling Time Ratio Slider */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-neutral-400">Active Rolling Time (%):</span>
                <span className="text-cyan-300 font-bold">{rollingRatioPercent}% ({metrics.dailyRollingHours} Hours of Footage)</span>
              </div>
              <input
                type="range"
                min="10"
                max="80"
                step="5"
                value={rollingRatioPercent}
                onChange={(e) => setRollingRatioPercent(Number(e.target.value))}
                className="w-full accent-cyan-400 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-neutral-500 font-mono">
                <span>10% Narrative Rehearsed</span>
                <span>35% Commercial Average</span>
                <span>70% Unscripted Docu</span>
              </div>
            </div>

            {/* Total Shoot Days */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-neutral-400">Total Production Days:</span>
                <span className="text-amber-300 font-bold">{multiDayCount} Shoot Days</span>
              </div>
              <div className="flex gap-2">
                {[1, 2, 3, 5, 7, 14, 30].map((days) => (
                  <button
                    key={days}
                    onClick={() => setMultiDayCount(days)}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-mono transition-all ${
                      multiDayCount === days
                        ? "bg-amber-400 text-black font-bold"
                        : "bg-neutral-950 border border-white/10 text-neutral-400 hover:text-white"
                    }`}
                  >
                    {days}d
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: RECOMMENDED BATTERY & MEDIA HARDWARE PACKAGES */}
        <div className="lg:col-span-5 space-y-6">
          {/* BATTERY HARDWARE SELECTION */}
          <div className="rounded-2xl border border-white/10 bg-neutral-900/80 p-5 backdrop-blur space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-black uppercase tracking-wider text-white flex items-center gap-2">
                <BatteryCharging className="h-4 w-4 text-emerald-400" />
                Select Battery Model
              </h2>
              <span className="text-xs font-mono text-emerald-400">{selectedBattery.capacityWh} Wh</span>
            </div>

            <div className="space-y-2">
              {BATTERY_CATALOG.map((bat) => (
                <button
                  key={bat.id}
                  onClick={() => setSelectedBattery(bat)}
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
                  <p className="mt-1 text-[10px] text-neutral-400">{bat.description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* MEDIA CARD HARDWARE SELECTION */}
          <div className="rounded-2xl border border-white/10 bg-neutral-900/80 p-5 backdrop-blur space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-black uppercase tracking-wider text-white flex items-center gap-2">
                <HardDrive className="h-4 w-4 text-purple-400" />
                Select Media Card Model
              </h2>
              <span className="text-xs font-mono text-purple-400">{selectedMediaCard.capacityGB} GB</span>
            </div>

            <div className="space-y-2">
              {MEDIA_CARD_CATALOG.map((card) => (
                <button
                  key={card.id}
                  onClick={() => setSelectedMediaCard(card)}
                  className={`w-full p-3 rounded-xl text-left border text-xs transition-all ${
                    selectedMediaCard.id === card.id
                      ? "border-purple-400 bg-purple-400/10 text-white font-bold"
                      : "border-white/10 bg-neutral-950/60 text-neutral-400 hover:text-white"
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="text-white font-bold">{card.name}</span>
                    <span className="font-mono text-purple-400">${card.pricePerDay}/day</span>
                  </div>
                  <p className="mt-1 text-[10px] text-neutral-400">{card.description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* DIT SUMMARY & ESTIMATED PACKAGE CARD */}
          <div className="rounded-2xl border border-amber-400/30 bg-linear-to-b from-neutral-900 to-black p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-amber-400" />
                <h3 className="text-base font-black text-white uppercase tracking-wider">
                  Recommended Power &amp; Media Kit
                </h3>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-amber-400/10 border border-amber-400/30 text-[10px] font-mono font-bold text-amber-300">
                {multiDayCount} SHOOT DAYS
              </span>
            </div>

            {/* Breakdown Items */}
            <div className="space-y-3 text-xs font-mono">
              <div className="flex justify-between items-center py-1 border-b border-white/5">
                <span className="text-neutral-300 flex items-center gap-2">
                  <BatteryCharging className="h-4 w-4 text-emerald-400" />
                  {metrics.batteriesNeededPerDay}x {selectedBattery.name.split(" ")[0]} {selectedBattery.capacityWh}Wh Batteries
                </span>
                <span className="text-white font-bold">${metrics.batteryDailyCost}/day</span>
              </div>

              <div className="flex justify-between items-center py-1 border-b border-white/5">
                <span className="text-neutral-300 flex items-center gap-2">
                  <HardDrive className="h-4 w-4 text-purple-400" />
                  {metrics.cardsNeededPerDay}x {selectedMediaCard.name.split(" ")[0]} {selectedMediaCard.capacityGB}GB Cards
                </span>
                <span className="text-white font-bold">${metrics.mediaDailyCost}/day</span>
              </div>

              <div className="flex justify-between items-center py-1 border-b border-white/5">
                <span className="text-neutral-400">Total Shoot Data Volume:</span>
                <span className="text-cyan-300 font-bold">{metrics.totalShootDataTB} TB ({multiDayCount} days)</span>
              </div>

              <div className="flex justify-between items-center py-1">
                <span className="text-neutral-400">Estimated Accessory Daily Rate:</span>
                <span className="text-amber-400 font-bold text-sm">${metrics.totalAccessoryDailyCost} / day</span>
              </div>
            </div>

            {/* CTA Button */}
            <div className="pt-2 space-y-2">
              <Link
                href="/packages"
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-linear-to-r from-amber-400 to-amber-500 py-3 text-xs font-bold text-black uppercase tracking-wider hover:opacity-90 transition shadow-lg shadow-amber-400/20"
              >
                <ShoppingBag className="h-4 w-4" />
                <span>Rent Camera &amp; Calculated Kit</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
              <p className="text-center text-[10px] text-neutral-400">
                Includes dual multi-bay rapid charger &amp; card reader in Pelican flight-case.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
