export interface CameraPowerAndCodecSpec {
  id: string;
  name: string;
  brand: "ARRI" | "RED" | "Sony" | "Canon" | "Blackmagic";
  averagePowerDrawWatts: number; // Base body + monitor + EVF
  nativeBatteryType: "V-Mount / Gold-Mount" | "Sony BP-U" | "Sony NP-FZ100" | "Canon BP-A" | "L-Mount / V-Mount";
  mediaSlotType: "Codex Compact Drive" | "CFexpress Type B" | "CFexpress Type A / SD" | "CFexpress Type B / SD" | "CFast 2.0 / USB-C";
  supportedCodecs: {
    id: string;
    label: string;
    resolution: string;
    bitrateMBpsAt24fps: number; // Megabytes per second at 24fps
    description: string;
  }[];
}

export interface BatterySpec {
  id: string;
  name: string;
  mountType: "V-Mount" | "Gold-Mount" | "Sony BP-U" | "Sony NP-FZ100" | "Canon BP-A";
  capacityWh: number;
  voltage: number;
  weightGrams: number;
  pricePerDay: number;
  description: string;
  matchedRentalSlug?: string;
}

export interface MediaCardSpec {
  id: string;
  name: string;
  formFactor: "Codex Compact Drive" | "CFexpress Type B" | "CFexpress Type A" | "SDXC UHS-II V90";
  capacityGB: number;
  readWriteSpeedMBps: number;
  pricePerDay: number;
  description: string;
  matchedRentalSlug?: string;
}

export const CINE_POWER_CODECS: CameraPowerAndCodecSpec[] = [
  {
    id: "arri-alexa-35",
    name: "ARRI Alexa 35",
    brand: "ARRI",
    averagePowerDrawWatts: 90,
    nativeBatteryType: "V-Mount / Gold-Mount",
    mediaSlotType: "Codex Compact Drive",
    supportedCodecs: [
      {
        id: "arriraw-46k-og",
        label: "ARRIRAW 4.6K 3:2 Open Gate (4608 x 3164)",
        resolution: "4.6K Open Gate",
        bitrateMBpsAt24fps: 220,
        description: "Uncompressed raw master format delivering maximum dynamic range and REVEAL color science.",
      },
      {
        id: "prores-4444-xq",
        label: "Apple ProRes 4444 XQ 4.6K",
        resolution: "4.6K 16:9",
        bitrateMBpsAt24fps: 165,
        description: "Top-tier 12-bit mastering codec for high-end visual effects and heavy color grading.",
      },
      {
        id: "prores-422-hq",
        label: "Apple ProRes 422 HQ 4K UHD",
        resolution: "4K UHD",
        bitrateMBpsAt24fps: 92,
        description: "Standard broadcast and commercial delivery codec balancing pristine quality with manageable file sizes.",
      },
    ],
  },
  {
    id: "arri-alexa-mini-lf",
    name: "ARRI Alexa Mini LF",
    brand: "ARRI",
    averagePowerDrawWatts: 65,
    nativeBatteryType: "V-Mount / Gold-Mount",
    mediaSlotType: "Codex Compact Drive",
    supportedCodecs: [
      {
        id: "arriraw-45k-lf",
        label: "ARRIRAW 4.5K Open Gate (4448 x 3096)",
        resolution: "4.5K Open Gate",
        bitrateMBpsAt24fps: 205,
        description: "Full large format uncompressed raw with legendary ARRI ALEV III organic color roll-off.",
      },
      {
        id: "prores-4444-lf",
        label: "Apple ProRes 4444 4.5K",
        resolution: "4.5K Open Gate",
        bitrateMBpsAt24fps: 135,
        description: "12-bit production workhorse for commercial cinema and long-form narratives.",
      },
      {
        id: "prores-422-hq-lf",
        label: "Apple ProRes 422 HQ 4K",
        resolution: "4K UHD",
        bitrateMBpsAt24fps: 88,
        description: "Efficient 10-bit cinema workflow.",
      },
    ],
  },
  {
    id: "red-v-raptor-8k",
    name: "RED V-Raptor 8K VV",
    brand: "RED",
    averagePowerDrawWatts: 75,
    nativeBatteryType: "V-Mount / Gold-Mount",
    mediaSlotType: "CFexpress Type B",
    supportedCodecs: [
      {
        id: "r3d-hq-8k",
        label: "REDCODE RAW HQ 8K (8192 x 4320)",
        resolution: "8K VistaVision",
        bitrateMBpsAt24fps: 300,
        description: "Maximum quality 8K raw 16-bit capture optimized for high VFX, re-framing, and IMAX presentation.",
      },
      {
        id: "r3d-mq-8k",
        label: "REDCODE RAW MQ 8K (8192 x 4320)",
        resolution: "8K VistaVision",
        bitrateMBpsAt24fps: 200,
        description: "Standard cinema mode providing optimal compression efficiency for narrative features.",
      },
      {
        id: "r3d-lq-8k",
        label: "REDCODE RAW LQ 8K (8192 x 4320)",
        resolution: "8K VistaVision",
        bitrateMBpsAt24fps: 130,
        description: "Long-take documentary and extended interview mode.",
      },
      {
        id: "prores-422-hq-raptor",
        label: "Apple ProRes 422 HQ 4K DCI",
        resolution: "4K DCI Proxy / Standalone",
        bitrateMBpsAt24fps: 45,
        description: "Instant edit-ready 4K 10-bit proxy.",
      },
    ],
  },
  {
    id: "red-komodo-6k",
    name: "RED Komodo 6K",
    brand: "RED",
    averagePowerDrawWatts: 37,
    nativeBatteryType: "V-Mount / Gold-Mount",
    mediaSlotType: "CFast 2.0 / USB-C",
    supportedCodecs: [
      {
        id: "r3d-hq-6k",
        label: "REDCODE RAW HQ 6K (6144 x 3240)",
        resolution: "6K Super 35",
        bitrateMBpsAt24fps: 280,
        description: "Global shutter high-detail cinema raw for car rigs and rapid action.",
      },
      {
        id: "r3d-mq-6k",
        label: "REDCODE RAW MQ 6K",
        resolution: "6K Super 35",
        bitrateMBpsAt24fps: 180,
        description: "Balanced cinema production raw.",
      },
    ],
  },
  {
    id: "sony-fx6",
    name: "Sony FX6 Cinema Line",
    brand: "Sony",
    averagePowerDrawWatts: 20,
    nativeBatteryType: "Sony BP-U",
    mediaSlotType: "CFexpress Type A / SD",
    supportedCodecs: [
      {
        id: "xavc-i-4k",
        label: "XAVC-I 4K DCI (4096 x 2160) 10-bit 4:2:2",
        resolution: "4K DCI",
        bitrateMBpsAt24fps: 30,
        description: "All-Intra frame-by-frame master recording for documentary and commercial.",
      },
      {
        id: "xavc-l-4k",
        label: "XAVC-L 4K UHD (3840 x 2160) Long-GOP",
        resolution: "4K UHD",
        bitrateMBpsAt24fps: 12.5,
        description: "High efficiency Long GOP 10-bit recording for ultra-long event takes.",
      },
      {
        id: "raw-external-16bit",
        label: "16-Bit Linear RAW (External via SDI to Shogun)",
        resolution: "4K DCI RAW",
        bitrateMBpsAt24fps: 185,
        description: "Uncompressed ProRes RAW / CinemaDNG over 12G-SDI output.",
      },
    ],
  },
  {
    id: "sony-fx3",
    name: "Sony FX3 / A7S III",
    brand: "Sony",
    averagePowerDrawWatts: 14,
    nativeBatteryType: "Sony NP-FZ100",
    mediaSlotType: "CFexpress Type A / SD",
    supportedCodecs: [
      {
        id: "xavc-si-4k",
        label: "XAVC S-I 4K All-Intra 10-bit 4:2:2",
        resolution: "4K UHD",
        bitrateMBpsAt24fps: 30,
        description: "High bitrate intra-frame capture with superb color fidelity.",
      },
      {
        id: "xavc-hs-4k",
        label: "XAVC HS 4K H.265 10-bit",
        resolution: "4K UHD",
        bitrateMBpsAt24fps: 12.5,
        description: "Next-gen HEVC compression for compact file storage.",
      },
    ],
  },
  {
    id: "canon-c500-mk-ii",
    name: "Canon EOS C500 Mark II",
    brand: "Canon",
    averagePowerDrawWatts: 34,
    nativeBatteryType: "Canon BP-A",
    mediaSlotType: "CFexpress Type B",
    supportedCodecs: [
      {
        id: "canon-raw-light-59k",
        label: "Cinema RAW Light 5.9K (5952 x 3140)",
        resolution: "5.9K Full Frame",
        bitrateMBpsAt24fps: 260,
        description: "Canon proprietary 12-bit RAW Light format offering maximum latitude and Dual Pixel AF tracking.",
      },
      {
        id: "xf-avc-4k",
        label: "XF-AVC 4K Intra 10-bit 4:2:2",
        resolution: "4K DCI",
        bitrateMBpsAt24fps: 51,
        description: "Broadcaster standard robust intra-frame MXF container.",
      },
    ],
  },
  {
    id: "blackmagic-cinema-6k",
    name: "Blackmagic Cinema Camera 6K",
    brand: "Blackmagic",
    averagePowerDrawWatts: 26,
    nativeBatteryType: "Sony NP-FZ100",
    mediaSlotType: "CFexpress Type B",
    supportedCodecs: [
      {
        id: "braw-31-6k",
        label: "Blackmagic RAW 3:1 6K Open Gate (6048 x 4032)",
        resolution: "6K Open Gate",
        bitrateMBpsAt24fps: 136,
        description: "Near-lossless 12-bit RAW with embedded DaVinci Resolve color metadata.",
      },
      {
        id: "braw-51-6k",
        label: "Blackmagic RAW 5:1 6K Open Gate",
        resolution: "6K Open Gate",
        bitrateMBpsAt24fps: 81,
        description: "Standard cinema compression sweet spot.",
      },
      {
        id: "braw-81-6k",
        label: "Blackmagic RAW 8:1 6K Open Gate",
        resolution: "6K Open Gate",
        bitrateMBpsAt24fps: 51,
        description: "Efficient multi-camera indie shoot codec.",
      },
    ],
  },
];

export const BATTERY_CATALOG: BatterySpec[] = [
  {
    id: "core-swx-hypercore-150",
    name: "Core SWX Hypercore NEO 150 (147Wh V-Mount)",
    mountType: "V-Mount",
    capacityWh: 147,
    voltage: 14.8,
    weightGrams: 890,
    pricePerDay: 35,
    description: "Industry standard high-draw 16A peak V-mount brick with OLED runtime countdown display.",
    matchedRentalSlug: "core-swx-hypercore-150",
  },
  {
    id: "anton-bauer-titon-micro-90",
    name: "Anton Bauer Titon Micro 90 (94Wh V-Mount)",
    mountType: "V-Mount",
    capacityWh: 94,
    voltage: 14.4,
    weightGrams: 520,
    pricePerDay: 28,
    description: "Flight-safe compact V-Mount battery under 100Wh for airline carry-on and gimbal balancing.",
    matchedRentalSlug: "anton-bauer-titon-90",
  },
  {
    id: "bebob-v290-micro",
    name: "Bebob V290 Micro (294Wh High-Capacity V-Mount)",
    mountType: "V-Mount",
    capacityWh: 294,
    voltage: 14.4,
    weightGrams: 1450,
    pricePerDay: 55,
    description: "Massive 294Wh capacity brick engineered for all-day studio and high-power cinema builds.",
    matchedRentalSlug: "bebob-v290-micro",
  },
  {
    id: "sony-bpu-70",
    name: "Sony BP-U70 Lithium-Ion Battery (72Wh)",
    mountType: "Sony BP-U",
    capacityWh: 72,
    voltage: 14.4,
    weightGrams: 450,
    pricePerDay: 22,
    description: "OEM Sony battery for FX6, FX9, and FS7 with direct body communication.",
    matchedRentalSlug: "sony-bp-u70",
  },
  {
    id: "canon-bpa-60",
    name: "Canon BP-A60 High Capacity Pack (90Wh)",
    mountType: "Canon BP-A",
    capacityWh: 90,
    voltage: 14.4,
    weightGrams: 434,
    pricePerDay: 25,
    description: "Native battery pack for Canon EOS C500 Mk II, C300 Mk III, and C70.",
    matchedRentalSlug: "canon-bp-a60",
  },
  {
    id: "sony-np-fz100-pack",
    name: "Sony NP-FZ100 Dual Pack (32.8Wh Total)",
    mountType: "Sony NP-FZ100",
    capacityWh: 32.8,
    voltage: 7.2,
    weightGrams: 170,
    pricePerDay: 15,
    description: "Dual compact battery pack for Sony FX3, A7S III, and Blackmagic Cinema 6K.",
    matchedRentalSlug: "sony-np-fz100",
  },
];

export const MEDIA_CARD_CATALOG: MediaCardSpec[] = [
  {
    id: "codex-compact-drive-1tb",
    name: "Codex Compact Drive 1TB (ARRI Certified)",
    formFactor: "Codex Compact Drive",
    capacityGB: 960,
    readWriteSpeedMBps: 2800,
    pricePerDay: 65,
    description: "High-speed NVMe PCIe drive certified for Alexa 35 and Alexa Mini LF ARRIRAW capture.",
    matchedRentalSlug: "codex-compact-drive-1tb",
  },
  {
    id: "codex-compact-drive-2tb",
    name: "Codex Compact Drive 2TB (ARRI Certified)",
    formFactor: "Codex Compact Drive",
    capacityGB: 1920,
    readWriteSpeedMBps: 2800,
    pricePerDay: 110,
    description: "Double capacity 2TB drive for full day 4.6K ARRIRAW Open Gate filming.",
    matchedRentalSlug: "codex-compact-drive-2tb",
  },
  {
    id: "red-pro-cfexpress-2tb",
    name: "RED PRO CFexpress 2TB Type B (RED Certified)",
    formFactor: "CFexpress Type B",
    capacityGB: 2000,
    readWriteSpeedMBps: 1750,
    pricePerDay: 75,
    description: "Official RED certified media for continuous 8K 120fps REDCODE RAW HQ recording on V-Raptor.",
    matchedRentalSlug: "red-pro-cfexpress-2tb",
  },
  {
    id: "angelbird-cfexpress-1tb",
    name: "Angelbird AV PRO CFexpress Type B 1TB",
    formFactor: "CFexpress Type B",
    capacityGB: 1024,
    readWriteSpeedMBps: 1700,
    pricePerDay: 45,
    description: "High thermal stability CFexpress B card for Canon C500 Mk II, Nikon Z9, and Blackmagic.",
    matchedRentalSlug: "angelbird-cfexpress-1tb",
  },
  {
    id: "sony-tough-cfexpress-a-960gb",
    name: "Sony TOUGH CFexpress Type A 960GB",
    formFactor: "CFexpress Type A",
    capacityGB: 960,
    readWriteSpeedMBps: 800,
    pricePerDay: 60,
    description: "Ultra-durable rugged Type A media for high frame rate 4K 120fps on Sony FX6 & FX3.",
    matchedRentalSlug: "sony-tough-cfexpress-960gb",
  },
  {
    id: "sandisk-v90-sdxc-256gb",
    name: "SanDisk Extreme PRO SDXC UHS-II V90 256GB",
    formFactor: "SDXC UHS-II V90",
    capacityGB: 256,
    readWriteSpeedMBps: 300,
    pricePerDay: 20,
    description: "Guaranteed 90MB/s sustained write for XAVC-I and 4K ProRes capture.",
    matchedRentalSlug: "sandisk-v90-256gb",
  },
];
