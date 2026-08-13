import { createClient } from "@/lib/supabase/client";

export interface GearBundleItem {
  id: string;
  name: string;
  category: string;
  dailyPrice: number;
  quantity: number;
  imageUrl?: string;
}

export interface GearBundle {
  id: string;
  name: string;
  slug: string;
  tagline: string;
  description: string;
  badge: string;
  discountPercentage: number;
  imageUrl: string;
  isFeatured: boolean;
  items: GearBundleItem[];
  originalDailyTotal: number;
  discountedDailyTotal: number;
}

// Fallback high-end curated gear packages for instant demonstration
const MOCK_BUNDLES: GearBundle[] = [
  {
    id: "bundle-cinema-master",
    name: "Cinema Master 8K Production Rig",
    slug: "cinema-master-8k-rig",
    tagline: "Complete 8K cinema ecosystem for commercial & feature films",
    description: "Features the Canon EOS R5 C paired with RF 24-70mm f/2.8L, Atomos Ninja V+ HDR monitor, dual CFexpress cards, and high-capacity V-mount power.",
    badge: "SAVE 20%",
    discountPercentage: 20,
    imageUrl: "/assets/canon-sequence/frame-120.jpg",
    isFeatured: true,
    originalDailyTotal: 12500,
    discountedDailyTotal: 10000,
    items: [
      { id: "prod-r5c", name: "Canon EOS R5 C Cinema Camera", category: "Cameras", dailyPrice: 6500, quantity: 1 },
      { id: "prod-2470", name: "Canon RF 24-70mm f/2.8L IS USM", category: "Lenses", dailyPrice: 3000, quantity: 1 },
      { id: "prod-ninja", name: "Atomos Ninja V+ 8K Monitor/Recorder", category: "Accessories", dailyPrice: 1800, quantity: 1 },
      { id: "prod-mic", name: "Sennheiser MKH-416 Shotgun Mic", category: "Audio", dailyPrice: 1200, quantity: 1 }
    ]
  },
  {
    id: "bundle-wedding-master",
    name: "Wedding & Event Dual-Camera Package",
    slug: "wedding-dual-cam-kit",
    tagline: "Unmatched low-light versatility and dual-angle coverage",
    description: "Includes two Canon R5 camera bodies, RF 50mm f/1.2L for dreamy portraits, RF 70-200mm f/2.8L for distance ceremony capture, and DJI RS 3 Pro Gimbal.",
    badge: "POPULAR BUNDLE",
    discountPercentage: 18,
    imageUrl: "/assets/canon-sequence/frame-180.jpg",
    isFeatured: true,
    originalDailyTotal: 14000,
    discountedDailyTotal: 11480,
    items: [
      { id: "prod-r5-1", name: "Canon EOS R5 Mirrorless Body (x2)", category: "Cameras", dailyPrice: 7000, quantity: 2 },
      { id: "prod-50mm", name: "Canon RF 50mm f/1.2L USM", category: "Lenses", dailyPrice: 2800, quantity: 1 },
      { id: "prod-70200", name: "Canon RF 70-200mm f/2.8L IS USM", category: "Lenses", dailyPrice: 3200, quantity: 1 },
      { id: "prod-rs3", name: "DJI RS 3 Pro Gimbal Stabilizer", category: "Gimbals", dailyPrice: 1000, quantity: 1 }
    ]
  },
  {
    id: "bundle-documentary-light",
    name: "Run-and-Gun Documentary Lighting & Audio Kit",
    slug: "run-and-gun-doc-kit",
    tagline: "Ultra-portable cinematic light & crystal-clear audio setup",
    description: "Aputure 300d II Daylight COB light with Light Dome II, Rode Wireless GO II dual mics, and C-stands.",
    badge: "INDIE FAVORITE",
    discountPercentage: 15,
    imageUrl: "/assets/canon-sequence/frame-060.jpg",
    isFeatured: true,
    originalDailyTotal: 5800,
    discountedDailyTotal: 4930,
    items: [
      { id: "prod-aputure", name: "Aputure LS C300d II Light Kit", category: "Lighting", dailyPrice: 2800, quantity: 1 },
      { id: "prod-rodedual", name: "Rode Wireless GO II Dual Channel", category: "Audio", dailyPrice: 1500, quantity: 1 },
      { id: "prod-cstand", name: "Heavy-Duty Turtle Base C-Stand (x2)", category: "Accessories", dailyPrice: 1500, quantity: 2 }
    ]
  }
];

export async function fetchGearBundles(): Promise<GearBundle[]> {
  try {
    const supabase = createClient();
    const { data: dbBundles, error } = await supabase
      .from("gear_bundles")
      .select(`
        id,
        name,
        slug,
        tagline,
        description,
        badge,
        discount_percentage,
        image_url,
        is_featured,
        gear_bundle_items (
          quantity,
          products (
            id,
            name,
            daily_price,
            categories ( name )
          )
        )
      `)
      .eq("is_featured", true);

    if (error || !dbBundles || dbBundles.length === 0) {
      return MOCK_BUNDLES;
    }

    return dbBundles.map((b: any) => {
      const items: GearBundleItem[] = (b.gear_bundle_items || []).map((bi: any) => ({
        id: bi.products?.id || "",
        name: bi.products?.name || "Equipment Item",
        category: bi.products?.categories?.name || "Gear",
        dailyPrice: Number(bi.products?.daily_price || 0),
        quantity: bi.quantity || 1
      }));

      const originalDailyTotal = items.reduce((sum, item) => sum + (item.dailyPrice * item.quantity), 0);
      const discountPercentage = Number(b.discount_percentage || 15);
      const discountedDailyTotal = Math.round(originalDailyTotal * (1 - discountPercentage / 100));

      return {
        id: b.id,
        name: b.name,
        slug: b.slug,
        tagline: b.tagline || "",
        description: b.description,
        badge: b.badge || "BUNDLE",
        discountPercentage,
        imageUrl: b.image_url || "/assets/canon-sequence/frame-120.jpg",
        isFeatured: b.is_featured,
        items,
        originalDailyTotal,
        discountedDailyTotal
      };
    });
  } catch {
    return MOCK_BUNDLES;
  }
}
