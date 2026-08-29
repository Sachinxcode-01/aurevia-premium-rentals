export interface CameraSensorSpec {
  id: string;
  name: string;
  brand: "ARRI" | "RED" | "Sony" | "Canon" | "Blackmagic" | "Custom";
  format: "Large Format / Full Frame" | "Super 35" | "VistaVision" | "Medium Format" | "Custom";
  sensorWidthMm: number;
  sensorHeightMm: number;
  diagonalMm: number;
  resolutionLabel: string;
  pixelPitchUm: number; // For CoC calculation
  defaultMount: string;
  matchedProductId?: string; // Links to AUREVIA catalog product if present
  description: string;
  badge?: string;
}

export interface AnamorphicSqueezeSpec {
  factor: number;
  label: string;
  desqueezeAspectDesc: string;
  recommendedSensorFormat: string;
  description: string;
}

export interface FrameLineSpec {
  id: string;
  name: string;
  ratio: number;
  ratioLabel: string;
  standard: string;
  color: string;
}

export interface SimulationScene {
  id: string;
  title: string;
  category: "Urban Night" | "Portraiture" | "Architecture" | "Studio Motion";
  imageUrl: string;
  description: string;
  baseFocalLengthMm: number;
  baseSensorWidthMm: number;
  hasLights: boolean; // Enables anamorphic streak highlight simulation
}

export const CINE_CAMERAS: CameraSensorSpec[] = [
  {
    id: "arri-alexa-mini-lf",
    name: "ARRI Alexa Mini LF",
    brand: "ARRI",
    format: "Large Format / Full Frame",
    sensorWidthMm: 36.70,
    sensorHeightMm: 25.54,
    diagonalMm: 44.71,
    resolutionLabel: "4.5K Open Gate (4448 x 3096)",
    pixelPitchUm: 8.25,
    defaultMount: "LPL / PL",
    matchedProductId: "arri-alexa-mini-lf",
    description: "ALEV III A2X large-format sensor offering legendary ARRI color science and clean organic roll-off.",
    badge: "Cinema Flagship",
  },
  {
    id: "arri-alexa-35",
    name: "ARRI Alexa 35",
    brand: "ARRI",
    format: "Super 35",
    sensorWidthMm: 27.99,
    sensorHeightMm: 19.22,
    diagonalMm: 33.95,
    resolutionLabel: "4.6K 3:2 Open Gate (4608 x 3164)",
    pixelPitchUm: 6.075,
    defaultMount: "LPL / PL",
    description: "ALEV 4 Super 35 sensor with 17 stops of dynamic range and REVEAL Color Science.",
    badge: "17 Stops DR",
  },
  {
    id: "red-v-raptor-8k-vv",
    name: "RED V-Raptor 8K VV",
    brand: "RED",
    format: "VistaVision",
    sensorWidthMm: 40.96,
    sensorHeightMm: 21.60,
    diagonalMm: 46.31,
    resolutionLabel: "8K VistaVision (8192 x 4320)",
    pixelPitchUm: 5.0,
    defaultMount: "RF / PL",
    matchedProductId: "red-v-raptor",
    description: "Ultra-high resolution multi-format VistaVision sensor with 120fps full 8K raw capture.",
    badge: "8K 120fps",
  },
  {
    id: "red-komodo-6k",
    name: "RED Komodo 6K",
    brand: "RED",
    format: "Super 35",
    sensorWidthMm: 27.03,
    sensorHeightMm: 14.26,
    diagonalMm: 30.56,
    resolutionLabel: "6K Super 35 (6144 x 3240)",
    pixelPitchUm: 4.4,
    defaultMount: "RF / PL",
    matchedProductId: "red-komodo-6k",
    description: "Global shutter Super 35 sensor eliminating jello motion distortion in high-velocity scenes.",
    badge: "Global Shutter",
  },
  {
    id: "sony-fx9",
    name: "Sony FX9 Full-Frame",
    brand: "Sony",
    format: "Large Format / Full Frame",
    sensorWidthMm: 35.70,
    sensorHeightMm: 18.80,
    diagonalMm: 40.35,
    resolutionLabel: "6K Full-Frame Oversampled (3840 x 2160)",
    pixelPitchUm: 5.95,
    defaultMount: "E-mount / PL",
    matchedProductId: "sony-fx9",
    description: "Back-illuminated full-frame Exmor R 6K CMOS sensor with Dual Base ISO (800 / 4000) and Fast Hybrid AF.",
    badge: "Dual Base ISO",
  },
  {
    id: "sony-fx6",
    name: "Sony FX6 Cinema Line",
    brand: "Sony",
    format: "Large Format / Full Frame",
    sensorWidthMm: 35.60,
    sensorHeightMm: 20.00,
    diagonalMm: 40.82,
    resolutionLabel: "4K Full-Frame 10.2MP (4096 x 2160)",
    pixelPitchUm: 8.4,
    defaultMount: "E-mount",
    matchedProductId: "sony-fx6",
    description: "Compact cinema powerhouse with extreme low-light sensitivity up to 409,600 ISO and electronic variable ND.",
    badge: "Low-Light King",
  },
  {
    id: "sony-fx3",
    name: "Sony FX3 / A7S III",
    brand: "Sony",
    format: "Large Format / Full Frame",
    sensorWidthMm: 35.60,
    sensorHeightMm: 23.80,
    diagonalMm: 42.82,
    resolutionLabel: "4K Full-Frame (3840 x 2160)",
    pixelPitchUm: 8.4,
    defaultMount: "E-mount",
    matchedProductId: "sony-fx3",
    description: "Run-and-gun cinema body with in-body image stabilization (IBIS) and full cage mounting points.",
    badge: "Solo Operator",
  },
  {
    id: "canon-c500-mk-ii",
    name: "Canon EOS C500 Mark II",
    brand: "Canon",
    format: "Large Format / Full Frame",
    sensorWidthMm: 38.10,
    sensorHeightMm: 20.10,
    diagonalMm: 43.08,
    resolutionLabel: "5.9K Full-Frame (5952 x 3140)",
    pixelPitchUm: 6.4,
    defaultMount: "EF / PL",
    description: "Full-frame CMOS sensor with Cinema RAW Light internal recording and Dual Pixel CMOS AF.",
    badge: "5.9K Cinema RAW",
  },
  {
    id: "blackmagic-cinema-6k",
    name: "Blackmagic Cinema Camera 6K",
    brand: "Blackmagic",
    format: "Large Format / Full Frame",
    sensorWidthMm: 36.00,
    sensorHeightMm: 24.00,
    diagonalMm: 43.27,
    resolutionLabel: "6K Full-Frame Open Gate (6048 x 4032)",
    pixelPitchUm: 5.95,
    defaultMount: "L-Mount",
    description: "Classic 36x24mm 3:2 Open Gate sensor engineered for anamorphic desqueeze and Blackmagic RAW.",
    badge: "Open Gate 3:2",
  },
];

export const ANAMORPHIC_SQUEEZE_PRESETS: AnamorphicSqueezeSpec[] = [
  {
    factor: 1.0,
    label: "1.0x (Spherical)",
    desqueezeAspectDesc: "Standard Spherical (1:1 direct)",
    recommendedSensorFormat: "All Formats (16:9, 3:2, 1.85:1)",
    description: "Standard circular optics with linear geometric projection across all focal lengths.",
  },
  {
    factor: 1.25,
    label: "1.25x Anamorphic",
    desqueezeAspectDesc: "Yields 2.00:1 / 2.22:1 from 16:9 / 1.78:1",
    recommendedSensorFormat: "16:9 Sensors (Irix, Sirui 1.25x)",
    description: "Subtle vintage anamorphic compression designed for 16:9 sensors.",
  },
  {
    factor: 1.33,
    label: "1.33x Anamorphic",
    desqueezeAspectDesc: "Yields 2.39:1 Scope from standard 16:9",
    recommendedSensorFormat: "16:9 Full Frame & Super 35 (Hawk V-Lite 1.3x, Sirui)",
    description: "Transforms standard 16:9 sensors into widescreen 2.39:1 without cropping top and bottom pixels.",
  },
  {
    factor: 1.5,
    label: "1.5x Anamorphic",
    desqueezeAspectDesc: "Yields 2.40:1 from 16:10 or 2.25:1 from 3:2",
    recommendedSensorFormat: "3:2 Open Gate & 16:9 Sensors",
    description: "Modern sweet-spot squeeze factor balancing rich horizontal streaks and natural skin tones.",
  },
  {
    factor: 1.8,
    label: "1.8x Anamorphic",
    desqueezeAspectDesc: "Yields 2.40:1 from 4:3 Sensor mode",
    recommendedSensorFormat: "4:3 / 3:2 Open Gate Cinema Sensors (Cooke Anamorphic /i)",
    description: "Cooke signature oval bokeh and classic Hollywood optical character.",
  },
  {
    factor: 2.0,
    label: "2.0x Classic Cinema Scope",
    desqueezeAspectDesc: "Yields 2.39:1 from 4:3 or 2.76:1 Ultra Panavision from 1.37:1",
    recommendedSensorFormat: "4:3 Full Aperture & 3:2 Open Gate (Atlas Orion, ARRI Master Anamorphic)",
    description: "The gold standard of cinema anamorphic. Dramatic horizontal flares, intense waterfall oval bokeh, and cinematic barrel curvature.",
  },
];

export const FRAME_LINES: FrameLineSpec[] = [
  { id: "scope-239", name: "2.39:1 CinemaScope", ratio: 2.39, ratioLabel: "2.39:1", standard: "DCI Scope (Theatrical Release)", color: "#D8B36A" },
  { id: "univisium-200", name: "2.00:1 Univisium", ratio: 2.00, ratioLabel: "2.00:1", standard: "Storaro Univisium (Netflix / Prime Originals)", color: "#10B981" },
  { id: "flat-185", name: "1.85:1 Flat", ratio: 1.85, ratioLabel: "1.85:1", standard: "DCI Flat (Standard Feature Film)", color: "#3B82F6" },
  { id: "broadcast-169", name: "16:9 Broadcast (1.78:1)", ratio: 16 / 9, ratioLabel: "16:9", standard: "HDTV / UHD / Commercial Stream", color: "#EC4899" },
  { id: "academy-43", name: "4:3 Academy (1.33:1)", ratio: 4 / 3, ratioLabel: "4:3", standard: "Classic Hollywood / Anamorphic 4:3 Capture", color: "#8B5CF6" },
  { id: "vertical-916", name: "9:16 Vertical (0.56:1)", ratio: 9 / 16, ratioLabel: "9:16", standard: "Social / Mobile Commercial Pre-Vis", color: "#F59E0B" },
];

export const PRIME_FOCAL_LENGTHS = [14, 18, 21, 24, 28, 35, 40, 50, 65, 75, 85, 100, 135, 180];
export const APERTURE_STOPS = [1.2, 1.4, 1.8, 2.0, 2.8, 4.0, 5.6, 8.0, 11.0, 16.0, 22.0];

export const SIMULATION_SCENES: SimulationScene[] = [
  {
    id: "urban-neon",
    title: "Tokyo Cyberpunk Night",
    category: "Urban Night",
    imageUrl: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=1600&auto=format&fit=crop",
    description: "High contrast neon cityscape ideal for evaluating anamorphic horizontal streak flares, chromatic aberration, and highlight halation.",
    baseFocalLengthMm: 35,
    baseSensorWidthMm: 36.0,
    hasLights: true,
  },
  {
    id: "golden-portrait",
    title: "Cinematic Golden Hour Portrait",
    category: "Portraiture",
    imageUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1600&auto=format&fit=crop",
    description: "Close-up subject with textured background elements to inspect shallow depth-of-field separation, bokeh rendering, and skin micro-contrast.",
    baseFocalLengthMm: 50,
    baseSensorWidthMm: 36.0,
    hasLights: false,
  },
  {
    id: "architecture-interior",
    title: "Brutalist Grand Hall",
    category: "Architecture",
    imageUrl: "https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=1600&auto=format&fit=crop",
    description: "Geometric interior grid to test perspective convergence, ultra-wide barrel distortion, and edge sharpness.",
    baseFocalLengthMm: 24,
    baseSensorWidthMm: 36.0,
    hasLights: true,
  },
  {
    id: "studio-vehicle",
    title: "Studio Exotic Supercar",
    category: "Studio Motion",
    imageUrl: "https://images.unsplash.com/photo-1617788138017-80ad40651399?q=80&w=1600&auto=format&fit=crop",
    description: "Commercial lighting stage with metallic curves to evaluate reflection falloff and wide-angle car rig framing.",
    baseFocalLengthMm: 35,
    baseSensorWidthMm: 36.0,
    hasLights: true,
  },
];

export const LENS_IMAGE_CIRCLES = [
  { name: "Super 35 Cine Standard", diameterMm: 31.5, format: "Super 35" },
  { name: "Full Frame / Large Format", diameterMm: 43.3, format: "Full Frame" },
  { name: "VistaVision & Large Format+", diameterMm: 46.5, format: "VistaVision / ARRI LF" },
];
