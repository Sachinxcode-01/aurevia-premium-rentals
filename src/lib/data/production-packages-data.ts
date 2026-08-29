export interface ProductionPackage {
  id: string;
  name: string;
  tagline: string;
  category: "Narrative Cinema" | "Commercial & Studio" | "Documentary & Run-Gun" | "Music Video & Indie";
  badge: string;
  dailyRate: number; // Base individual total daily rate
  bundleDiscountPercent: number; // e.g. 15% or 20%
  depositAmount: number;
  image: string;
  pelicanCaseModel: string;
  estimatedWeightKg: number;
  highlightSpecs: string[];
  includedGear: {
    department: "Camera" | "Optics" | "Monitoring & Wireless" | "Support & Focus" | "Power & Media";
    items: string[];
  }[];
  idealFor: string;
}

export interface ModularRigComponent {
  id: string;
  name: string;
  department: "body" | "optics" | "monitoring" | "support" | "power";
  brand: string;
  dailyPrice: number;
  image: string;
  weightKg: number;
  powerDrawWatts: number;
  specs: string;
  badge?: string;
}

export const CURATED_PACKAGES: ProductionPackage[] = [
  {
    id: "master-anamorphic-narrative-kit",
    name: "Master Anamorphic Narrative Package",
    tagline: "Flagship ARRI Large Format cinema body paired with legendary Cooke anamorphic primes.",
    category: "Narrative Cinema",
    badge: "Director's Choice",
    dailyRate: 14500,
    bundleDiscountPercent: 20,
    depositAmount: 15000,
    image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=1200&auto=format&fit=crop",
    pelicanCaseModel: "Pelican Storm iM2975 Flight Case",
    estimatedWeightKg: 18.5,
    highlightSpecs: [
      "ARRI Alexa Mini LF 4.5K Large Format",
      "Cooke Anamorphic /i Prime 4-Lens Set (32, 40, 50, 75mm)",
      "Teradek Bolt 4K LT 750 TX/RX Wireless",
      "Tilta Nucleus-M 3-Channel Wireless Focus",
      "SmallHD 703 UltraBright 2200-Nit Monitor",
    ],
    includedGear: [
      {
        department: "Camera",
        items: ["ARRI Alexa Mini LF Body (LPL & PL Mount)", "ARRI MVF-2 Viewfinder", "ARRI Codex Compact Drive 1TB (x3) & USB-C Reader"],
      },
      {
        department: "Optics",
        items: ["Cooke Anamorphic /i Full Frame Plus 32mm T2.3", "Cooke Anamorphic /i 40mm T2.3", "Cooke Anamorphic /i 50mm T2.3", "Cooke Anamorphic /i 75mm T2.3"],
      },
      {
        department: "Monitoring & Wireless",
        items: ["Teradek Bolt 4K LT 750 TX/RX Set", "SmallHD 703 UltraBright 7\" Director's Monitor with Cage & Neck Strap"],
      },
      {
        department: "Support & Focus",
        items: ["Tilta Nucleus-M Wireless Follow Focus (2x Motors & Handgrips)", "ARRI LMB 4x5 Matte Box & Polarizer", "Sachtler Video 20 S1 Heavy Duty Carbon Tripod"],
      },
      {
        department: "Power & Media",
        items: ["Core SWX Hypercore NEO 150Wh V-Mount Battery (x4)", "Quad Fast V-Mount Charger & AC Distribution Box"],
      },
    ],
    idealFor: "Feature Films, High-End Commercials, Prestigious Narrative Shorts, Television Drama.",
  },
  {
    id: "commercial-8k-high-speed-rig",
    name: "Commercial 8K VistaVision Stage Rig",
    tagline: "Extreme resolution, 120fps high-speed capture, and pristine Zeiss Supreme cinema optics.",
    category: "Commercial & Studio",
    badge: "8K 120fps Master",
    dailyRate: 11800,
    bundleDiscountPercent: 18,
    depositAmount: 12000,
    image: "https://images.unsplash.com/photo-1589872565089-63364f33668a?q=80&w=1200&auto=format&fit=crop",
    pelicanCaseModel: "Pelican Air 1615 Travel Case",
    estimatedWeightKg: 14.2,
    highlightSpecs: [
      "RED V-Raptor 8K VV Multi-Format Body",
      "Zeiss Supreme Prime 3-Lens Set (25, 35, 50mm T1.5)",
      "Angelbird 2TB CFexpress Type B (x2) & Dual Reader",
      "Tilta Carbon Matte Box with Firecrest IRND Filters",
      "Core SWX Micro V-Mount 98Wh (x4)",
    ],
    includedGear: [
      {
        department: "Camera",
        items: ["RED V-Raptor 8K VV Body (RF Mount & PL Adapter)", "RED DSMC3 Touch 7.0\" LCD Monitor", "2x 2TB Angelbird PRO CFexpress Cards"],
      },
      {
        department: "Optics",
        items: ["Zeiss Supreme Prime 25mm T1.5", "Zeiss Supreme Prime 35mm T1.5", "Zeiss Supreme Prime 50mm T1.5"],
      },
      {
        department: "Monitoring & Wireless",
        items: ["Hollyland Mars 4K Wireless Video Transmitter", "PortKeys BM5 III WR 5.5\" 2200nit High-Bright Monitor"],
      },
      {
        department: "Support & Focus",
        items: ["Tilta Nucleus Nano II Wireless Focus Kit", "Tilta Mirage Motorized VND Matte Box", "Manfrotto 504X Fluid Head & 645 FAST Carbon Tripod"],
      },
      {
        department: "Power & Media",
        items: ["4x Core SWX V-Mount Micro 98Wh Batteries", "Dual Fast Simultaneous V-Mount Charger"],
      },
    ],
    idealFor: "Automotive Commercials, Fashion Campaigns, High-Speed Product Tabletop, VFX Plates.",
  },
  {
    id: "run-and-gun-documentary-rig",
    name: "Run-and-Gun Solo Creator Rig",
    tagline: "Agile Sony FX6 / FX3 cinema kit with GM zooms, active gimbal stabilization, and wireless audio.",
    category: "Documentary & Run-Gun",
    badge: "Solo Operator Favorite",
    dailyRate: 5800,
    bundleDiscountPercent: 15,
    depositAmount: 6000,
    image: "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?q=80&w=1200&auto=format&fit=crop",
    pelicanCaseModel: "Pelican 1510 Carry-On Case",
    estimatedWeightKg: 8.8,
    highlightSpecs: [
      "Sony FX6 Cinema Line (or FX3 Rigged)",
      "Sony FE 24-70mm f/2.8 GM II & FE 16-35mm f/2.8 GM II",
      "DJI RS 3 Pro Gimbal Combo with LiDAR Focus",
      "Rode Wireless PRO Dual Microphone System with 32-Bit Float",
      "FXLION Nano Two Micro V-Mounts (x4)",
    ],
    includedGear: [
      {
        department: "Camera",
        items: ["Sony FX6 Full-Frame Cinema Body (or FX3 Full Cage)", "Sony Top Handle with Dual XLR Audio", "2x Sony 160GB CEA-G Tough CFexpress Type A"],
      },
      {
        department: "Optics",
        items: ["Sony FE 24-70mm f/2.8 GM II Zoom", "Sony FE 16-35mm f/2.8 GM II Ultra-Wide Zoom"],
      },
      {
        department: "Monitoring & Wireless",
        items: ["Atomos Shinobi II 5.2\" 1500nit HDR Monitor with Sunhood", "Rode Wireless PRO 2-Person Mic Set with Lavalieres"],
      },
      {
        department: "Support & Focus",
        items: ["DJI RS 3 Pro Gimbal Stabilizer with Focus Motor", "DJI LiDAR Range Finder Focus Module", "Tilta Ring Handgrip for RS3 Pro"],
      },
      {
        department: "Power & Media",
        items: ["4x FXLION Nano Two 98Wh Micro V-Mounts with D-Tap & USB-C PD", "4-Bay USB-C PD Fast Charging Station"],
      },
    ],
    idealFor: "Documentary Filmmakers, Travel Productions, Guerrilla Music Videos, Behind-The-Scenes Crews.",
  },
  {
    id: "indie-music-video-creative-kit",
    name: "Indie Music Video & Creative Cinema Rig",
    tagline: "Rich filmic colors, versatile DZOFilm cine primes, RGB tube lighting, and motorized focus.",
    category: "Music Video & Indie",
    badge: "Creative Value",
    dailyRate: 4600,
    bundleDiscountPercent: 15,
    depositAmount: 5000,
    image: "https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=1200&auto=format&fit=crop",
    pelicanCaseModel: "Pelican Storm iM2600 Case",
    estimatedWeightKg: 10.5,
    highlightSpecs: [
      "Blackmagic Cinema Camera 6K Full-Frame Open Gate",
      "DZOFilm VESPID Cine Prime 3-Lens Set (25, 50, 85mm T2.1)",
      "Aputure amaran T2c 2-Foot RGB Tube Lights (x2)",
      "Tilta Nucleus Nano II Wireless Follow Focus",
      "Core SWX 98Wh V-Mount Power Rig",
    ],
    includedGear: [
      {
        department: "Camera",
        items: ["Blackmagic Cinema Camera 6K Full Frame Body (L-Mount)", "SmallRig Full Armor Cage & Top Handle", "Samsung T7 Shield 1TB SSD & USB-C Cable"],
      },
      {
        department: "Optics",
        items: ["DZOFilm VESPID 25mm T2.1 Cine Prime", "DZOFilm VESPID 50mm T2.1 Cine Prime", "DZOFilm VESPID 85mm T2.1 Cine Prime"],
      },
      {
        department: "Monitoring & Wireless",
        items: ["FeelWorld LUT7 7\" 2200nit Daylight Viewable Monitor", "2x Aputure amaran T2c RGB Color Tube Lights with Grid"],
      },
      {
        department: "Support & Focus",
        items: ["Tilta Nucleus Nano II Wireless Focus Motor & Control Handle", "SmallRig Carbon Tripod & Fluid Head"],
      },
      {
        department: "Power & Media",
        items: ["3x Core SWX Nano 98Wh V-Mounts with D-Tap to BMPCC Cable", "Dual V-Mount Fast Charger"],
      },
    ],
    idealFor: "Music Videos, Indie Short Films, Creative Commercials, Content Creation with Filmic Tone.",
  },
];

export const MODULAR_COMPONENTS: ModularRigComponent[] = [
  // ─── CAMERA BODIES ───
  {
    id: "mod-arri-lf",
    name: "ARRI Alexa Mini LF Large Format Body",
    department: "body",
    brand: "ARRI",
    dailyPrice: 6500,
    image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=600",
    weightKg: 2.6,
    powerDrawWatts: 65,
    specs: "4.5K Open Gate Large Format ALEV III A2X Sensor, LPL/PL Mount",
    badge: "Flagship",
  },
  {
    id: "mod-arri-35",
    name: "ARRI Alexa 35 4.6K Super 35 Body",
    department: "body",
    brand: "ARRI",
    dailyPrice: 5800,
    image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=600",
    weightKg: 2.9,
    powerDrawWatts: 90,
    specs: "4.6K Super 35 ALEV 4 Sensor, 17 Stops Dynamic Range, REVEAL Color",
  },
  {
    id: "mod-red-vraptor",
    name: "RED V-Raptor 8K VV Multi-Format Body",
    department: "body",
    brand: "RED",
    dailyPrice: 5200,
    image: "https://images.unsplash.com/photo-1589872565089-63364f33668a?q=80&w=600",
    weightKg: 1.8,
    powerDrawWatts: 70,
    specs: "8K VistaVision Sensor, 120fps 8K RAW, RF Mount & PL Adapter",
    badge: "8K 120fps",
  },
  {
    id: "mod-red-komodo",
    name: "RED Komodo 6K Global Shutter Body",
    department: "body",
    brand: "RED",
    dailyPrice: 3200,
    image: "https://images.unsplash.com/photo-1589872565089-63364f33668a?q=80&w=600",
    weightKg: 0.95,
    powerDrawWatts: 37,
    specs: "6K Super 35 Global Shutter Sensor, Zero Jello Motion, RF Mount",
  },
  {
    id: "mod-sony-fx6",
    name: "Sony FX6 Full-Frame Cinema Body",
    department: "body",
    brand: "Sony",
    dailyPrice: 2800,
    image: "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?q=80&w=600",
    weightKg: 0.89,
    powerDrawWatts: 18,
    specs: "4K Full-Frame 10.2MP Exmor R, Electronic Variable ND, Dual Base ISO",
    badge: "Low-Light",
  },
  {
    id: "mod-sony-fx3",
    name: "Sony FX3 Full-Frame Cinema Body",
    department: "body",
    brand: "Sony",
    dailyPrice: 2100,
    image: "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?q=80&w=600",
    weightKg: 0.71,
    powerDrawWatts: 12,
    specs: "4K 120p Full-Frame, In-Body Image Stabilization (IBIS), XLR Handle",
  },

  // ─── OPTICS & GLASS ───
  {
    id: "mod-cooke-anamorphic",
    name: "Cooke Anamorphic /i Full Frame 4-Lens Set",
    department: "optics",
    brand: "Cooke",
    dailyPrice: 4800,
    image: "https://images.unsplash.com/photo-1617005082133-548c4dd27f35?q=80&w=600",
    weightKg: 7.2,
    powerDrawWatts: 0,
    specs: "32, 40, 50, 75mm T2.3 (1.8x Squeeze) with /i Technology Metadata",
    badge: "Anamorphic",
  },
  {
    id: "mod-zeiss-supreme",
    name: "Zeiss Supreme Prime 3-Lens Set",
    department: "optics",
    brand: "Zeiss",
    dailyPrice: 3800,
    image: "https://images.unsplash.com/photo-1617005082133-548c4dd27f35?q=80&w=600",
    weightKg: 4.8,
    powerDrawWatts: 0,
    specs: "25, 35, 50mm T1.5 Full-Frame PL Mount with Ultra-Smooth Focus",
  },
  {
    id: "mod-dzofilm-vespid",
    name: "DZOFilm VESPID Cine Prime 5-Lens Set",
    department: "optics",
    brand: "DZOFilm",
    dailyPrice: 2200,
    image: "https://images.unsplash.com/photo-1617005082133-548c4dd27f35?q=80&w=600",
    weightKg: 4.1,
    powerDrawWatts: 0,
    specs: "25, 35, 50, 75, 100mm T2.1 Full-Frame Cinema Primes in Flight Case",
  },
  {
    id: "mod-sony-gm-duo",
    name: "Sony G Master Zoom Duo (16-35 & 24-70 f/2.8 GM II)",
    department: "optics",
    brand: "Sony",
    dailyPrice: 1800,
    image: "https://images.unsplash.com/photo-1617005082133-548c4dd27f35?q=80&w=600",
    weightKg: 1.25,
    powerDrawWatts: 0,
    specs: "FE 16-35mm f/2.8 GM II & FE 24-70mm f/2.8 GM II Ultra-Fast AF Zooms",
  },

  // ─── MONITORING & WIRELESS ───
  {
    id: "mod-teradek-bolt",
    name: "Teradek Bolt 4K LT 750 TX/RX Wireless Set",
    department: "monitoring",
    brand: "Teradek",
    dailyPrice: 1800,
    image: "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?q=80&w=600",
    weightKg: 0.68,
    powerDrawWatts: 14,
    specs: "Zero-delay (<0.001s) 4K 10-bit HDR video transmission up to 750 feet",
    badge: "Zero-Latency",
  },
  {
    id: "mod-smallhd-703",
    name: "SmallHD 703 UltraBright 7\" 2200-Nit Monitor Kit",
    department: "monitoring",
    brand: "SmallHD",
    dailyPrice: 1400,
    image: "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?q=80&w=600",
    weightKg: 0.85,
    powerDrawWatts: 18,
    specs: "7\" 1920x1080 2200-nit Daylight Viewable SDI/HDMI Director Monitor",
  },
  {
    id: "mod-atomos-shinobi",
    name: "Atomos Shinobi II 5.2\" 1500-Nit On-Camera Monitor",
    department: "monitoring",
    brand: "Atomos",
    dailyPrice: 700,
    image: "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?q=80&w=600",
    weightKg: 0.22,
    powerDrawWatts: 7,
    specs: "5.2\" 1500nit HDR Touchscreen with Camera Control & Waveforms",
  },

  // ─── SUPPORT, GIMBALS & FOCUS ───
  {
    id: "mod-tilta-nucleus-m",
    name: "Tilta Nucleus-M 3-Channel Wireless Follow Focus",
    department: "support",
    brand: "Tilta",
    dailyPrice: 1300,
    image: "https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?q=80&w=600",
    weightKg: 1.4,
    powerDrawWatts: 8,
    specs: "Hand Unit, 2x Wireless Motors, Handgrips, Hard Case & Focus Rings",
  },
  {
    id: "mod-dji-rs3-pro",
    name: "DJI RS 3 Pro Gimbal Stabilizer Combo + LiDAR",
    department: "support",
    brand: "DJI",
    dailyPrice: 1600,
    image: "https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?q=80&w=600",
    weightKg: 1.9,
    powerDrawWatts: 15,
    specs: "Automated Axis Locks, LiDAR Autofocus, 4.5kg Payload, Carbon Arms",
    badge: "LiDAR AF",
  },
  {
    id: "mod-sachtler-tripod",
    name: "Sachtler Video 20 S1 Heavy Duty Carbon Tripod",
    department: "support",
    brand: "Sachtler",
    dailyPrice: 1200,
    image: "https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?q=80&w=600",
    weightKg: 4.8,
    powerDrawWatts: 0,
    specs: "100mm Bowl Fluid Head, 25kg Payload, 16-Step Counterbalance, Mid Spreader",
  },

  // ─── POWER, MEDIA & PELICAN FLIGHT CASES ───
  {
    id: "mod-core-swx-quad",
    name: "Core SWX 150Wh V-Mount Quad Battery & Charger Kit",
    department: "power",
    brand: "Core SWX",
    dailyPrice: 1100,
    image: "https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?q=80&w=600",
    weightKg: 4.2,
    powerDrawWatts: 0,
    specs: "4x 150Wh High-Draw V-Mount Batteries & Quad Simultaneous Fast Charger",
  },
  {
    id: "mod-fxlion-nano-quad",
    name: "FXLION Nano Two 98Wh Micro V-Mount Quad Kit",
    department: "power",
    brand: "FXLION",
    dailyPrice: 850,
    image: "https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?q=80&w=600",
    weightKg: 2.1,
    powerDrawWatts: 0,
    specs: "4x 98Wh Micro V-Mounts with D-Tap & USB-C 65W Power Delivery",
  },
  {
    id: "mod-mattebox-filters",
    name: "Tilta Carbon Matte Box + NiSi Cinema True Color IRND Set",
    department: "power",
    brand: "Tilta / NiSi",
    dailyPrice: 900,
    image: "https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?q=80&w=600",
    weightKg: 1.1,
    powerDrawWatts: 0,
    specs: "4x5.65\" Swing-Away Matte Box with 0.3, 0.6, 0.9, 1.2 IRND Glass",
  },
];
