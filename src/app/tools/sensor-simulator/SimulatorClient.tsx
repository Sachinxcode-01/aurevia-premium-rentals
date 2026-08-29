"use client";

import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import {
  CINE_CAMERAS,
  CameraSensorSpec,
  FRAME_LINES,
  FrameLineSpec,
  SIMULATION_SCENES,
  SimulationScene,
} from "@/lib/data/cinematography-data";
import { calculateOpticalSpecs } from "@/lib/utils/optical-calculator";
import CinematicViewfinder from "@/components/features/simulator/CinematicViewfinder";
import OpticalControlsPanel from "@/components/features/simulator/OpticalControlsPanel";
import SensorComparisonOverlay from "@/components/features/simulator/SensorComparisonOverlay";
import DoFVisualizer from "@/components/features/simulator/DoFVisualizer";
import MatchedGearDeck from "@/components/features/simulator/MatchedGearDeck";
import { Sliders, Camera, Sparkles, Film, Info } from "lucide-react";

export default function SimulatorClient() {
  const searchParams = useSearchParams();

  // Parse URL search params if present for deep-linking
  const initialCameraId = searchParams.get("cam") || "arri-alexa-mini-lf";
  const initialFocalLength = Number(searchParams.get("fl")) || 35;
  const initialSqueeze = Number(searchParams.get("sq")) || 1.0;
  const initialAperture = Number(searchParams.get("t")) || 2.8;
  const initialFocusDist = Number(searchParams.get("fd")) || 3.0;
  const initialFrameLineId = searchParams.get("flock");

  const [selectedCamera, setSelectedCamera] = useState<CameraSensorSpec>(() => {
    return CINE_CAMERAS.find((c) => c.id === initialCameraId) || CINE_CAMERAS[0];
  });

  const [focalLengthMm, setFocalLengthMm] = useState<number>(initialFocalLength);
  const [squeezeFactor, setSqueezeFactor] = useState<number>(initialSqueeze);
  const [aperture, setAperture] = useState<number>(initialAperture);
  const [focusDistanceMeters, setFocusDistanceMeters] = useState<number>(initialFocusDist);

  const [activeFrameLine, setActiveFrameLine] = useState<FrameLineSpec | null>(() => {
    if (initialFrameLineId) {
      return FRAME_LINES.find((fl) => fl.id === initialFrameLineId) || null;
    }
    return FRAME_LINES[0]; // Default 2.39:1 CinemaScope
  });

  const [activeScene, setActiveScene] = useState<SimulationScene>(SIMULATION_SCENES[0]);

  // Dual comparison state
  const [showComparison, setShowComparison] = useState<boolean>(false);
  const [comparisonCamera, setComparisonCamera] = useState<CameraSensorSpec | null>(
    CINE_CAMERAS[1] // ARRI Alexa 35 as secondary
  );

  // Optical Calculations (Memoized for peak 60fps performance)
  const primaryOpticalResult = useMemo(() => {
    return calculateOpticalSpecs(
      selectedCamera,
      focalLengthMm,
      squeezeFactor,
      aperture,
      focusDistanceMeters,
      43.3 // standard full-frame image circle
    );
  }, [selectedCamera, focalLengthMm, squeezeFactor, aperture, focusDistanceMeters]);

  const comparisonOpticalResult = useMemo(() => {
    if (!comparisonCamera) return null;
    return calculateOpticalSpecs(
      comparisonCamera,
      focalLengthMm,
      squeezeFactor,
      aperture,
      focusDistanceMeters,
      43.3
    );
  }, [comparisonCamera, focalLengthMm, squeezeFactor, aperture, focusDistanceMeters]);

  return (
    <div className="space-y-8">
      {/* ─── WORKSTATION GRID: VIEWFINDER + CONTROLS ─── */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Left Column: Viewfinder & Quick Status */}
        <div className="space-y-6 lg:col-span-7 xl:col-span-8">
          <CinematicViewfinder
            sensor={selectedCamera}
            focalLengthMm={focalLengthMm}
            squeezeFactor={squeezeFactor}
            aperture={aperture}
            activeScene={activeScene}
            activeFrameLine={activeFrameLine}
            opticalResult={primaryOpticalResult}
            comparisonSensor={comparisonCamera}
            comparisonOpticalResult={comparisonOpticalResult}
            showComparison={showComparison}
          />

          {/* Depth of Field Visualizer */}
          <DoFVisualizer
            opticalResult={primaryOpticalResult}
            focalLengthMm={focalLengthMm}
            aperture={aperture}
            focusDistanceMeters={focusDistanceMeters}
          />
        </div>

        {/* Right Column: Tactical Optical Controls Panel */}
        <div className="lg:col-span-5 xl:col-span-4">
          <OpticalControlsPanel
            selectedCamera={selectedCamera}
            onSelectCamera={setSelectedCamera}
            focalLengthMm={focalLengthMm}
            onChangeFocalLength={setFocalLengthMm}
            squeezeFactor={squeezeFactor}
            onChangeSqueeze={setSqueezeFactor}
            aperture={aperture}
            onChangeAperture={setAperture}
            focusDistanceMeters={focusDistanceMeters}
            onChangeFocusDistance={setFocusDistanceMeters}
            activeFrameLine={activeFrameLine}
            onSelectFrameLine={setActiveFrameLine}
            activeScene={activeScene}
            onSelectScene={setActiveScene}
            showComparison={showComparison}
            onToggleComparison={setShowComparison}
            comparisonCamera={comparisonCamera}
            onSelectComparisonCamera={setComparisonCamera}
          />
        </div>
      </div>

      {/* ─── LOWER DECK: SENSOR GEOMETRY & MATCHED GEAR DECK ─── */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Sensor Map Diagram */}
        <div className="lg:col-span-5">
          <SensorComparisonOverlay
            primarySensor={selectedCamera}
            primaryResult={primaryOpticalResult}
            comparisonSensor={comparisonCamera}
            comparisonResult={comparisonOpticalResult}
            showComparison={showComparison}
          />
        </div>

        {/* Matched Gear & Export Suite */}
        <div className="lg:col-span-7">
          <MatchedGearDeck
            sensor={selectedCamera}
            focalLengthMm={focalLengthMm}
            squeezeFactor={squeezeFactor}
            aperture={aperture}
            focusDistanceMeters={focusDistanceMeters}
            activeFrameLine={activeFrameLine}
            opticalResult={primaryOpticalResult}
          />
        </div>
      </div>
    </div>
  );
}
