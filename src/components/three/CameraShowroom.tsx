"use client";

import React, { Suspense, useRef, useState, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, ContactShadows, RoundedBox } from "@react-three/drei";
import * as THREE from "three";
import { animate } from "animejs";
import { 
  Camera, 
  Cpu, 
  Maximize2, 
  Minimize2, 
  RotateCcw, 
  Layers, 
  Eye, 
  Video, 
  HelpCircle, 
  Settings 
} from "lucide-react";

// ----------------------------------------------------
// CAMERA VIEW PRESETS / HOTSPOTS DATA
// ----------------------------------------------------
interface HotspotInfo {
  id: string;
  name: string;
  shortDesc: string;
  fullDesc: string;
  icon: React.ReactNode;
  cameraPos: [number, number, number];
  targetPos: [number, number, number];
  detachLens?: boolean;
}

const HOTSPOTS: HotspotInfo[] = [
  {
    id: "sensor",
    name: "45 MP Full-Frame Wafer",
    shortDesc: "High-resolution CMOS sensor with 5-axis stabilization.",
    fullDesc: "A state-of-the-art 45 Megapixel full-frame CMOS sensor. Captures massive detail, dynamic range, and enables up to 8K video acquisition with full sensor readouts.",
    icon: <Cpu size={14} />,
    cameraPos: [0, 0, 1.8],
    targetPos: [0, 0, 0],
    detachLens: true,
  },
  {
    id: "mount",
    name: "RF Lens Mount System",
    shortDesc: "54mm inner diameter with high-speed electronic contact pins.",
    fullDesc: "The proprietary Canon RF mount. Featuring a large 54mm internal diameter, short flange back distance, and a 12-pin interface for ultra-fast, high-bandwidth optics communications.",
    icon: <Layers size={14} />,
    cameraPos: [0.5, 0.4, 1.5],
    targetPos: [0, 0, 0.3],
  },
  {
    id: "video",
    name: "8K RAW Cine Ports",
    shortDesc: "HDMI micro, headphone jacks, and remote control terminals.",
    fullDesc: "Professional video connectivity enabling 8K RAW external recordings, clean HDMI out, microphones input, head-monitoring outputs, and studio sync terminals.",
    icon: <Video size={14} />,
    cameraPos: [-1.8, 0, 1.2],
    targetPos: [-0.8, 0, 0],
  },
  {
    id: "ibis",
    name: "In-Body Image Stabilisation",
    shortDesc: "Coordinated control provides up to 8.0 stops of shake correction.",
    fullDesc: "Advanced 5-axis IBIS works in absolute coordination with optical stabilizers in RF lenses to provide industry-leading correction against camera shakes.",
    icon: <Settings size={14} />,
    cameraPos: [0, 1.4, 1.8],
    targetPos: [0, 0, 0],
  },
  {
    id: "evf",
    name: "Electronic Viewfinder",
    shortDesc: "0.5-inch 5.76 million dot OLED display at 120fps.",
    fullDesc: "A high-performance electronic viewfinder. Features 5.76 million dots of resolution, 100% coverage, 0.76x magnification, and a fluid 120fps refresh rate for lag-free tracking.",
    icon: <Eye size={14} />,
    cameraPos: [0, 0.95, -1.5],
    targetPos: [0, 0.65, -0.2],
  },
  {
    id: "lcd",
    name: "Vari-angle Touchscreen",
    shortDesc: "3.2-inch 2.1 million dot clear LCD monitor.",
    fullDesc: "Fully articulating, flexible touchscreen monitor. Rotates and folds out, allowing photographers and videographers to compose shots from extremely low or high angles easily.",
    icon: <HelpCircle size={14} />,
    cameraPos: [0.6, -0.2, -1.8],
    targetPos: [0, -0.1, -0.45],
  },
  {
    id: "controls",
    name: "Custom Dials & Shutter Grip",
    shortDesc: "Ergonomic command dials, multi-controllers, and custom buttons.",
    fullDesc: "Features dual command dials, quick control dial, secondary scroll, dynamic AF joystick, and a deep secure ergonomic handgrip for tactile adjustments on blind shoots.",
    icon: <Camera size={14} />,
    cameraPos: [-0.8, 1.4, 0.8],
    targetPos: [-0.6, 0.6, 0.1],
  },
];

const DEFAULT_CAMERA_POS: [number, number, number] = [2.2, 1.4, 3.4];
const DEFAULT_TARGET_POS: [number, number, number] = [0, 0, 0];

// ----------------------------------------------------
// CAMERA VIEW CONTROLLER LERPING
// ----------------------------------------------------
function CameraController({
  targetPos,
  cameraPos,
  controlsRef,
}: {
  targetPos: THREE.Vector3;
  cameraPos: THREE.Vector3;
  controlsRef: React.RefObject<any>;
}) {
  const { camera } = useThree();

  useFrame(() => {
    // Smoothly lerp camera coordinates
    camera.position.lerp(cameraPos, 0.08);

    // Smoothly lerp OrbitControls center target
    if (controlsRef.current) {
      controlsRef.current.target.lerp(targetPos, 0.08);
      controlsRef.current.update();
    }
  });

  return null;
}

// ----------------------------------------------------
// HIGH-FIDELITY PROCEDURAL CANON EOS R5 MODEL
// ----------------------------------------------------
function CanonEOSR5({
  activeLens,
  lensOffset,
  lensOpacity,
  activeHotspot,
  isUserInteracting,
  prefersReducedMotion,
}: {
  activeLens: string;
  lensOffset: number;
  lensOpacity: number;
  activeHotspot: HotspotInfo | null;
  isUserInteracting: boolean;
  prefersReducedMotion: boolean;
}) {
  const modelGroupRef = useRef<THREE.Group>(null);

  // Auto rotation & subtle cursor parallax
  useFrame((state) => {
    if (!modelGroupRef.current) return;

    // Slow auto-rotation when user is not interacting and no hotspot is open
    if (!isUserInteracting && !activeHotspot && !prefersReducedMotion) {
      modelGroupRef.current.rotation.y = state.clock.getElapsedTime() * 0.12;
    }

    // Gentle cursor-following parallax
    const mx = state.pointer.x * 0.12;
    const my = state.pointer.y * 0.12;

    modelGroupRef.current.rotation.x = THREE.MathUtils.lerp(
      modelGroupRef.current.rotation.x,
      my,
      0.08
    );
    
    if (activeHotspot) {
      modelGroupRef.current.rotation.y = THREE.MathUtils.lerp(
        modelGroupRef.current.rotation.y,
        mx,
        0.08
      );
    }
  });

  return (
    <group ref={modelGroupRef}>
      {/* 1. Camera Main Body Block (Charcoal Obsidian) */}
      <RoundedBox args={[2.0, 1.35, 0.7]} radius={0.06} smoothness={8} position={[0, 0, 0]}>
        <meshStandardMaterial color="#1a1a1c" roughness={0.65} metalness={0.28} />
      </RoundedBox>

      {/* 2. Textured Hand Grip (Deep rough rubber) */}
      <RoundedBox args={[0.5, 1.25, 0.82]} radius={0.08} smoothness={8} position={[-0.75, -0.05, 0.15]}>
        <meshStandardMaterial color="#111112" roughness={0.92} metalness={0.08} />
      </RoundedBox>

      {/* 3. Electronic Viewfinder Eye Hump (Top Center) */}
      <mesh position={[0, 0.72, 0]}>
        <boxGeometry args={[0.55, 0.28, 0.55]} />
        <meshStandardMaterial color="#1a1a1c" roughness={0.65} metalness={0.28} />
      </mesh>
      {/* EVF Slanted back visor */}
      <mesh position={[0, 0.79, -0.1]} rotation={[-Math.PI / 10, 0, 0]}>
        <boxGeometry args={[0.55, 0.16, 0.4]} />
        <meshStandardMaterial color="#1a1a1c" roughness={0.65} metalness={0.28} />
      </mesh>
      {/* Viewfinder rubber eyepiece pad */}
      <mesh position={[0, 0.72, -0.32]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.16, 0.18, 0.08, 16]} />
        <meshStandardMaterial color="#0c0c0d" roughness={0.95} metalness={0.05} />
      </mesh>
      {/* Eye Cup view sensor (glowing blue-green screen inside) */}
      <mesh position={[0, 0.72, -0.36]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.1, 0.1, 0.01, 16]} />
        <meshStandardMaterial color="#112520" emissive="#0b4034" emissiveIntensity={0.8} roughness={0.1} />
      </mesh>

      {/* 4. Luxury gold rim surrounding EVF top hump */}
      <mesh position={[0, 0.88, 0.12]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.1, 0.015, 8, 24]} />
        <meshStandardMaterial color="#D8B36A" roughness={0.15} metalness={0.95} />
      </mesh>

      {/* 5. Hot Shoe Mounting Bracket */}
      <mesh position={[0, 0.87, -0.05]}>
        <boxGeometry args={[0.22, 0.02, 0.25]} />
        <meshStandardMaterial color="#2d2d30" roughness={0.3} metalness={0.95} />
      </mesh>

      {/* 6. Top Dials & Shutter controls */}
      {/* Mode Dial left side */}
      <mesh position={[-0.55, 0.72, 0]} rotation={[0, 0, 0]}>
        <cylinderGeometry args={[0.15, 0.15, 0.08, 24]} />
        <meshStandardMaterial color="#121213" roughness={0.4} metalness={0.85} />
      </mesh>
      {/* Right dial collar ring */}
      <mesh position={[0.55, 0.72, 0]} rotation={[0, 0, 0]}>
        <cylinderGeometry args={[0.16, 0.16, 0.06, 24]} />
        <meshStandardMaterial color="#D8B36A" roughness={0.15} metalness={0.95} />
      </mesh>
      {/* Shutter button on angled grip mount */}
      <mesh position={[-0.75, 0.65, 0.35]} rotation={[Math.PI / 8, 0, 0]}>
        <cylinderGeometry args={[0.08, 0.08, 0.05, 16]} />
        <meshStandardMaterial color="#cacace" roughness={0.2} metalness={0.95} />
      </mesh>

      {/* 7. Vari-angle Screen Panel (Articulated on back) */}
      <group position={[0.1, -0.05, -0.36]} rotation={[0, Math.PI / 18, 0]}>
        <RoundedBox args={[1.05, 0.75, 0.05]} radius={0.015} smoothness={4}>
          <meshStandardMaterial color="#111112" roughness={0.5} metalness={0.2} />
        </RoundedBox>
        {/* LCD Glass Screen face */}
        <mesh position={[0, 0, -0.027]}>
          <planeGeometry args={[0.96, 0.66]} />
          <meshStandardMaterial color="#080809" roughness={0.08} metalness={0.9} transparent opacity={0.95} />
        </mesh>
      </group>

      {/* 8. Metal Lens Mount Ring Collar */}
      <group position={[0.2, 0, 0.35]}>
        {/* Outer Silver collar */}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.48, 0.48, 0.1, 40]} />
          <meshStandardMaterial color="#dcdcdf" roughness={0.18} metalness={0.95} />
        </mesh>
        {/* Red lens alignment dot */}
        <mesh position={[0, 0.44, 0.04]}>
          <sphereGeometry args={[0.02, 8, 8]} />
          <meshStandardMaterial color="#e53935" roughness={0.3} />
        </mesh>
        {/* Inner mount plate */}
        <mesh position={[0, 0, 0.025]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.43, 0.43, 0.04, 32]} />
          <meshStandardMaterial color="#1a1a1c" roughness={0.5} metalness={0.9} />
        </mesh>
        {/* 12-pin Gold connection contacts array (represented as a curved plate) */}
        <mesh position={[0, -0.34, 0.035]} rotation={[0, 0, 0]}>
          <boxGeometry args={[0.2, 0.015, 0.015]} />
          <meshStandardMaterial color="#D8B36A" roughness={0.1} metalness={1.0} />
        </mesh>

        {/* 45 MP CMOS Sensor Wafer (Visible deep inside Mount Collar when lens is detached) */}
        <mesh position={[0, 0, -0.1]} rotation={[0, 0, 0]}>
          <planeGeometry args={[0.48, 0.32]} />
          <meshStandardMaterial 
            color="#08382c" 
            roughness={0.02} 
            metalness={0.98} 
            emissive="#00261d" 
            emissiveIntensity={0.7} 
          />
        </mesh>
        {/* Sensor glass protective reflection ring */}
        <mesh position={[0, 0, -0.09]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.3, 0.3, 0.01, 24, 1, true]} />
          <meshStandardMaterial color="#1a3b5c" roughness={0.0} metalness={0.8} transparent opacity={0.4} />
        </mesh>
      </group>

      {/* ========================================================
          9. PROCEDURAL SWAPPABLE LENSES WITH SMOOTH DETACHMENT
          ======================================================== */}
      {activeLens === "rf24-70" && (
        <group position={[0.2, 0, 0.4 + lensOffset]}>
          {/* Main Lens Body */}
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.42, 0.42, 1.1, 32]} />
            <meshStandardMaterial 
              color="#1a1a1c" 
              roughness={0.4} 
              metalness={0.6} 
              transparent 
              opacity={lensOpacity} 
            />
          </mesh>
          {/* Zoom Grip Ring (Ribbed) */}
          <mesh position={[0, 0, -0.1]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.43, 0.43, 0.35, 32]} />
            <meshStandardMaterial 
              color="#0c0c0d" 
              roughness={0.85} 
              metalness={0.1} 
              transparent 
              opacity={lensOpacity} 
            />
          </mesh>
          {/* Focus Grip Ring */}
          <mesh position={[0, 0, 0.25]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.425, 0.425, 0.2, 32]} />
            <meshStandardMaterial 
              color="#0c0c0d" 
              roughness={0.85} 
              metalness={0.1} 
              transparent 
              opacity={lensOpacity} 
            />
          </mesh>
          {/* Signature L-Series Red Ring */}
          <mesh position={[0, 0, 0.48]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.422, 0.015, 8, 32]} />
            <meshStandardMaterial 
              color="#e53935" 
              roughness={0.2} 
              metalness={0.5} 
              transparent 
              opacity={lensOpacity} 
            />
          </mesh>
          {/* Front filter threads mount */}
          <mesh position={[0, 0, 0.53]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.41, 0.41, 0.04, 32]} />
            <meshStandardMaterial 
              color="#1a1a1c" 
              roughness={0.3} 
              metalness={0.8} 
              transparent 
              opacity={lensOpacity} 
            />
          </mesh>
          {/* Front Optic Convex Glass element */}
          <mesh position={[0, 0, 0.54]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.38, 0.38, 0.02, 32]} />
            <meshStandardMaterial 
              color="#112b40" 
              roughness={0.0} 
              metalness={0.98} 
              transparent 
              opacity={0.7 * lensOpacity} 
            />
          </mesh>
        </group>
      )}

      {activeLens === "rf50" && (
        <group position={[0.2, 0, 0.4 + lensOffset]}>
          {/* Thick compact body barrel */}
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.46, 0.44, 0.72, 32]} />
            <meshStandardMaterial 
              color="#1a1a1c" 
              roughness={0.4} 
              metalness={0.6} 
              transparent 
              opacity={lensOpacity} 
            />
          </mesh>
          {/* Wide focus ring */}
          <mesh position={[0, 0, -0.05]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.465, 0.465, 0.38, 32]} />
            <meshStandardMaterial 
              color="#0c0c0d" 
              roughness={0.85} 
              metalness={0.1} 
              transparent 
              opacity={lensOpacity} 
            />
          </mesh>
          {/* Red Ring */}
          <mesh position={[0, 0, 0.28]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.462, 0.015, 8, 32]} />
            <meshStandardMaterial 
              color="#e53935" 
              roughness={0.2} 
              metalness={0.5} 
              transparent 
              opacity={lensOpacity} 
            />
          </mesh>
          {/* Front element glass aperture (Massive aperture glass!) */}
          <mesh position={[0, 0, 0.34]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.42, 0.42, 0.02, 32]} />
            <meshStandardMaterial 
              color="#11324c" 
              roughness={0.0} 
              metalness={0.99} 
              transparent 
              opacity={0.75 * lensOpacity} 
            />
          </mesh>
        </group>
      )}

      {activeLens === "rf70-200" && (
        <group position={[0.2, 0, 0.4 + lensOffset]}>
          {/* Main White telephoto barrel */}
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.43, 0.43, 1.6, 32]} />
            <meshStandardMaterial 
              color="#e1e1e4" 
              roughness={0.38} 
              metalness={0.15} 
              transparent 
              opacity={lensOpacity} 
            />
          </mesh>
          {/* Black Zoom ring */}
          <mesh position={[0, 0, -0.2]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.435, 0.435, 0.4, 32]} />
            <meshStandardMaterial 
              color="#0c0c0d" 
              roughness={0.88} 
              metalness={0.05} 
              transparent 
              opacity={lensOpacity} 
            />
          </mesh>
          {/* Black Focus ring */}
          <mesh position={[0, 0, 0.4]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.432, 0.432, 0.22, 32]} />
            <meshStandardMaterial 
              color="#0c0c0d" 
              roughness={0.88} 
              metalness={0.05} 
              transparent 
              opacity={lensOpacity} 
            />
          </mesh>
          {/* Silver Tripod Collar Mount collar */}
          <mesh position={[0, 0, -0.6]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.445, 0.445, 0.12, 32]} />
            <meshStandardMaterial 
              color="#acacb2" 
              roughness={0.2} 
              metalness={0.9} 
              transparent 
              opacity={lensOpacity} 
            />
          </mesh>
          {/* Tripod mounting foot */}
          <mesh position={[0, -0.55, -0.6]}>
            <boxGeometry args={[0.15, 0.15, 0.2]} />
            <meshStandardMaterial 
              color="#acacb2" 
              roughness={0.2} 
              metalness={0.9} 
              transparent 
              opacity={lensOpacity} 
            />
          </mesh>
          {/* Red Accent Ring */}
          <mesh position={[0, 0, 0.74]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.432, 0.015, 8, 32]} />
            <meshStandardMaterial 
              color="#e53935" 
              roughness={0.2} 
              metalness={0.5} 
              transparent 
              opacity={lensOpacity} 
            />
          </mesh>
          {/* Front optical element */}
          <mesh position={[0, 0, 0.79]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.39, 0.39, 0.02, 32]} />
            <meshStandardMaterial 
              color="#0e2a3f" 
              roughness={0.02} 
              metalness={0.98} 
              transparent 
              opacity={0.68 * lensOpacity} 
            />
          </mesh>
        </group>
      )}
    </group>
  );
}

// ----------------------------------------------------
// MAIN SHOWROOM CONTAINER
// ----------------------------------------------------
export default function CameraShowroom() {
  const containerRef = useRef<HTMLDivElement>(null);
  const controlsRef = useRef<any>(null);

  // States
  const [activeLens, setActiveLens] = useState<string>("rf24-70");
  const [activeHotspot, setActiveHotspot] = useState<HotspotInfo | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [threeSupport, setThreeSupport] = useState(true);
  const [isUserInteracting, setIsUserInteracting] = useState(false);

  // Animation values for lens swap
  const [currentLensModel, setCurrentLensModel] = useState<string>("rf24-70");
  const [lensOffset, setLensOffset] = useState(0);
  const [lensOpacity, setLensOpacity] = useState(1);

  // Interpolation vectors for OrbitControls target and Camera position
  const [targetPos, setTargetPos] = useState<THREE.Vector3>(new THREE.Vector3(...DEFAULT_TARGET_POS));
  const [cameraPos, setCameraPos] = useState<THREE.Vector3>(new THREE.Vector3(...DEFAULT_CAMERA_POS));

  // Accessibility Check
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    // Check reduced motion settings
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener("change", handler);

    // Watch fullscreen transitions
    const onFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", onFullscreenChange);

    return () => {
      mediaQuery.removeEventListener("change", handler);
      document.removeEventListener("fullscreenchange", onFullscreenChange);
    };
  }, []);

  // Handle active details or hotspot clicks
  const selectHotspot = (hotspot: HotspotInfo | null) => {
    setActiveHotspot(hotspot);

    const destCamera = hotspot ? hotspot.cameraPos : DEFAULT_CAMERA_POS;
    const destTarget = hotspot ? hotspot.targetPos : DEFAULT_TARGET_POS;

    if (prefersReducedMotion) {
      setCameraPos(new THREE.Vector3(...destCamera));
      setTargetPos(new THREE.Vector3(...destTarget));
      if (hotspot && hotspot.detachLens) {
        setLensOffset(1.6);
        setLensOpacity(0);
      } else {
        setLensOffset(0);
        setLensOpacity(1);
      }
      return;
    }

    // Capture starting state values for transition
    const animObj = {
      cx: cameraPos.x,
      cy: cameraPos.y,
      cz: cameraPos.z,
      tx: targetPos.x,
      ty: targetPos.y,
      tz: targetPos.z,
      lensOffset: lensOffset,
      lensOpacity: lensOpacity
    };

    const targetLensOffset = (hotspot && hotspot.detachLens) ? 1.6 : 0;
    const targetLensOpacity = (hotspot && hotspot.detachLens) ? 0 : 1;

    // Use Anime.js to smoothly animate coordinates and lens positions
    animate(animObj, {
      cx: destCamera[0],
      cy: destCamera[1],
      cz: destCamera[2],
      tx: destTarget[0],
      ty: destTarget[1],
      tz: destTarget[2],
      lensOffset: targetLensOffset,
      lensOpacity: targetLensOpacity,
      duration: 850,
      easing: "easeOutQuint",
      update: () => {
        setCameraPos(new THREE.Vector3(animObj.cx, animObj.cy, animObj.cz));
        setTargetPos(new THREE.Vector3(animObj.tx, animObj.ty, animObj.tz));
        setLensOffset(animObj.lensOffset);
        setLensOpacity(animObj.lensOpacity);
      }
    });
  };

  // Perform smooth lens swap animation along Z axis
  const swapLens = (targetLens: string) => {
    if (targetLens === activeLens) return;

    // Reset any active hotspot that might conflict
    selectHotspot(null);

    let start = Date.now();
    const duration = 300;

    // Phase 1: Detach and Slide Out (forward)
    const animOut = () => {
      const now = Date.now();
      const progress = Math.min((now - start) / duration, 1);
      
      setLensOffset(progress * 1.6);
      setLensOpacity(Math.max(1 - progress, 0));

      if (progress < 1) {
        requestAnimationFrame(animOut);
      } else {
        // Model swap
        setActiveLens(targetLens);
        setCurrentLensModel(targetLens);

        // Phase 2: Insert and Slide In (backward from front)
        let startIn = Date.now();
        const animIn = () => {
          const nowIn = Date.now();
          const progressIn = Math.min((nowIn - startIn) / duration, 1);

          setLensOffset(1.6 * (1 - progressIn));
          setLensOpacity(progressIn);

          if (progressIn < 1) {
            requestAnimationFrame(animIn);
          }
        };
        requestAnimationFrame(animIn);
      }
    };
    requestAnimationFrame(animOut);
  };

  // Handle fullscreen toggle
  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => {
        setIsFullscreen(true);
      }).catch((err) => {
        console.error("Fullscreen request failed", err);
      });
    } else {
      document.exitFullscreen().then(() => {
        setIsFullscreen(false);
      });
    }
  };

  // Keep track of pointer interaction states to suspend auto rotation
  const startInteraction = () => {
    setIsUserInteracting(true);
  };

  const endInteraction = () => {
    // Brief delay before resuming automatic rotation
    setTimeout(() => {
      setIsUserInteracting(false);
    }, 4500);
  };

  return (
    <div 
      ref={containerRef}
      className={`w-full relative glass-panel border-white/5 rounded-lg overflow-hidden flex flex-col lg:flex-row shadow-2xl transition-all duration-300 ${
        isFullscreen ? "h-screen bg-black" : "h-[580px] md:h-[640px]"
      }`}
    >
      
      {/* 3D Scene Viewport Canvas */}
      <div 
        className="flex-1 h-[350px] lg:h-full bg-obsidian relative overflow-hidden"
        onPointerDown={startInteraction}
        onPointerUp={endInteraction}
      >
        {/* Loading Overlay */}
        <Suspense
          fallback={
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-obsidian z-40 space-y-4">
              <div className="w-10 h-10 border-2 border-gold-champagne border-t-transparent rounded-full animate-spin"></div>
              <span className="font-mono text-[9px] uppercase tracking-[0.25em] text-gold-champagne">
                Assembling Photorealistic Scene...
              </span>
            </div>
          }
        >
          {threeSupport ? (
            <Canvas camera={{ position: DEFAULT_CAMERA_POS, fov: 45 }}>
              {/* Studio Lights */}
              <ambientLight intensity={0.4} />
              
              {/* Gold rim light for champagne gold highlight */}
              <directionalLight position={[3, 4, -2]} intensity={2.8} color="#D8B36A" />
              
              {/* Soft key light */}
              <directionalLight position={[-4, 2, 3]} intensity={1.5} color="#ffffff" />
              
              {/* Fill light */}
              <directionalLight position={[0, -2, -3]} intensity={0.5} color="#ffffff" />

              {/* Canon EOS R5 Mesh Group */}
              <CanonEOSR5 
                activeLens={currentLensModel} 
                lensOffset={lensOffset} 
                lensOpacity={lensOpacity}
                activeHotspot={activeHotspot}
                isUserInteracting={isUserInteracting}
                prefersReducedMotion={prefersReducedMotion}
              />

              {/* Dynamic shadow plane underneath camera */}
              <ContactShadows 
                position={[0, -0.85, 0]} 
                opacity={0.65} 
                scale={4.5} 
                blur={2.4} 
                far={1.5} 
              />

              {/* Smooth Camera coordinates lerper controller */}
              <CameraController 
                cameraPos={cameraPos} 
                targetPos={targetPos} 
                controlsRef={controlsRef} 
              />

              <OrbitControls
                ref={controlsRef}
                enableZoom={true}
                enablePan={false}
                minDistance={1.4}
                maxDistance={5.5}
                minPolarAngle={Math.PI / 3}
                maxPolarAngle={Math.PI / 1.7}
              />
            </Canvas>
          ) : (
            /* Photorealistic fallback screen if WebGL is disabled */
            <div className="absolute inset-0 flex items-center justify-center bg-obsidian">
              <img
                src="https://images.unsplash.com/photo-1616423643768-7c458787c88b?q=80&w=1200&auto=format&fit=crop"
                className="w-full h-full object-cover opacity-70 filter brightness-[0.7] contrast-[1.05]"
                alt="Canon EOS R5 Fallback Showcase"
              />
              <div className="absolute bottom-6 left-6 p-4 glass-panel border-white/5 rounded-lg max-w-sm">
                <span className="text-[8px] font-mono uppercase text-gold-champagne tracking-widest block">Static Fallback Mode</span>
                <p className="text-[10px] text-muted-gray leading-normal mt-1">WebGL is disabled or unsupported. Explore camera categories or proceed to booking.</p>
              </div>
            </div>
          )}
        </Suspense>

        {/* Viewport Control overlays */}
        <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between pointer-events-none z-30">
          <span className="font-mono text-[8px] text-muted-gray uppercase tracking-[0.2em]">
            Drag to Rotate • Scroll to Zoom • Tap Hotspots
          </span>
          <div className="flex items-center gap-2 pointer-events-auto">
            <button
              onClick={() => selectHotspot(null)}
              title="Reset View"
              className="w-8 h-8 rounded-full bg-black/60 hover:bg-black border border-white/10 hover:border-gold-champagne text-gold-champagne flex items-center justify-center transition cursor-pointer"
            >
              <RotateCcw size={12} />
            </button>
            <button
              onClick={toggleFullscreen}
              title={isFullscreen ? "Exit Fullscreen" : "Fullscreen View"}
              className="w-8 h-8 rounded-full bg-black/60 hover:bg-black border border-white/10 hover:border-gold-champagne text-gold-champagne flex items-center justify-center transition cursor-pointer"
            >
              {isFullscreen ? <Minimize2 size={12} /> : <Maximize2 size={12} />}
            </button>
          </div>
        </div>

        {/* 3D / Fallback toggle button */}
        <button
          onClick={() => setThreeSupport(!threeSupport)}
          className="absolute top-4 left-4 px-3 py-1.5 bg-black/60 hover:bg-black border border-white/10 hover:border-gold-champagne text-[9px] uppercase tracking-widest font-mono font-bold text-gold-champagne rounded-full transition z-30 cursor-pointer"
        >
          {threeSupport ? "2D Image Mode" : "Interactive 3D"}
        </button>
      </div>

      {/* Showroom Specs & Information Sidebar Panel */}
      <div className="w-full lg:w-[360px] border-t lg:border-t-0 lg:border-l border-white/5 p-6 lg:p-8 flex flex-col justify-between bg-rich-black/30 overflow-y-auto">
        <div className="space-y-6">
          <div className="text-left">
            <span className="text-[9px] uppercase tracking-widest text-gold-champagne font-mono block">
              Digital Showroom
            </span>
            <h3 className="serif-heading text-2xl font-light text-ivory mt-1">
              Canon EOS R5
            </h3>
            <p className="text-[9px] text-muted-gray uppercase tracking-widest font-mono mt-1">
              Flagship Mirrorless Body
            </p>
          </div>

          {/* Interactive Lens Switcher */}
          <div className="space-y-3 pt-4 border-t border-white/5 text-left">
            <span className="text-[8px] uppercase tracking-[0.2em] text-muted-gray font-mono font-bold block">
              Mount Compatible Lens
            </span>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => swapLens("rf24-70")}
                className={`py-2 px-1 text-[9px] font-bold uppercase tracking-wider rounded border transition cursor-pointer ${
                  activeLens === "rf24-70"
                    ? "bg-gold-champagne text-obsidian border-gold-champagne"
                    : "bg-transparent text-ivory border-white/10 hover:border-gold-champagne"
                }`}
              >
                24-70mm
              </button>
              <button
                onClick={() => swapLens("rf50")}
                className={`py-2 px-1 text-[9px] font-bold uppercase tracking-wider rounded border transition cursor-pointer ${
                  activeLens === "rf50"
                    ? "bg-gold-champagne text-obsidian border-gold-champagne"
                    : "bg-transparent text-ivory border-white/10 hover:border-gold-champagne"
                }`}
              >
                50mm f/1.2
              </button>
              <button
                onClick={() => swapLens("rf70-200")}
                className={`py-2 px-1 text-[9px] font-bold uppercase tracking-wider rounded border transition cursor-pointer ${
                  activeLens === "rf70-200"
                    ? "bg-gold-champagne text-obsidian border-gold-champagne"
                    : "bg-transparent text-ivory border-white/10 hover:border-gold-champagne"
                }`}
              >
                70-200mm
              </button>
            </div>
          </div>

          {/* Hotspots Buttons List */}
          <div className="space-y-2 pt-4 border-t border-white/5 text-left">
            <span className="text-[8px] uppercase tracking-[0.2em] text-muted-gray font-mono font-bold block">
              Examine Camera Features
            </span>
            <div className="flex flex-wrap gap-1.5">
              {HOTSPOTS.map((hs) => (
                <button
                  key={hs.id}
                  onClick={() => selectHotspot(activeHotspot?.id === hs.id ? null : hs)}
                  className={`px-2 py-1 text-[8px] font-mono uppercase rounded transition cursor-pointer flex items-center gap-1 border ${
                    activeHotspot?.id === hs.id
                      ? "bg-gold-champagne/15 text-gold border-gold"
                      : "bg-white/5 text-muted-gray border-transparent hover:border-white/10 hover:text-ivory"
                  }`}
                >
                  {hs.icon}
                  {hs.id === "sensor" ? "Sensor" : hs.id === "mount" ? "Mount" : hs.id === "video" ? "RAW Ports" : hs.id === "ibis" ? "IBIS" : hs.id === "evf" ? "EVF" : hs.id === "lcd" ? "LCD Screen" : "Dials"}
                </button>
              ))}
            </div>
          </div>

          {/* Dynamic Information Display Box */}
          <div className="pt-4 border-t border-white/5 text-left min-h-[140px] flex flex-col justify-center">
            {activeHotspot ? (
              <div className="p-4 bg-white/[0.02] border border-white/5 rounded-lg space-y-2 animate-fade-in">
                <div className="flex items-center gap-2 text-gold-champagne">
                  {activeHotspot.icon}
                  <span className="text-[10px] font-mono font-semibold uppercase tracking-wider">
                    {activeHotspot.name}
                  </span>
                </div>
                <p className="text-xs text-ivory font-light leading-relaxed">
                  {activeHotspot.fullDesc}
                </p>
                {activeHotspot.detachLens && (
                  <span className="text-[8px] uppercase font-bold tracking-widest text-emerald-400 block pt-1 animate-pulse">
                    * Lens detached for sensor examination
                  </span>
                )}
              </div>
            ) : (
              <div className="p-4 bg-white/[0.01] border border-dashed border-white/5 rounded-lg text-center space-y-2 py-8">
                <HelpCircle size={20} className="mx-auto text-muted-gray/50" />
                <p className="text-[10px] text-muted-gray leading-normal max-w-[220px] mx-auto">
                  Click a camera feature hotspot button or examine details by tapping elements inside the showroom.
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="pt-6 border-t border-white/5">
          <button
            onClick={() => selectHotspot(null)}
            className="w-full py-2.5 bg-white/5 border border-white/10 hover:border-gold-champagne text-gold-champagne text-xs font-semibold uppercase tracking-wider rounded transition cursor-pointer flex items-center justify-center gap-1.5"
          >
            <RotateCcw size={12} />
            Reset Camera View
          </button>
        </div>
      </div>

    </div>
  );
}
