export interface Brand {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
}

export interface Product {
  id: string;
  brandId: string;
  categoryId: string;
  name: string;
  slug: string;
  description: string;
  dailyPrice: number;
  weeklyPrice: number;
  securityDeposit: number;
  inventoryQty: number;
  rating: number;
  isFeatured: boolean;
  isArchived: boolean;
  specs: Record<string, string>;
  imagePrimary: string;
  images: string[];
}

export interface ProductAddon {
  id: string;
  name: string;
  description: string;
  price: number;
  isAvailable: boolean;
}

export interface Testimonial {
  id: string;
  authorName: string;
  authorTitle: string;
  quote: string;
  rating: number;
  avatarUrl?: string;
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
}

export interface Coupon {
  id: string;
  code: string;
  discountPercent: number;
  discountFlat?: number;
  maxDiscount?: number;
  activeUntil: string;
  isActive: boolean;
  activationDate?: string;
  usageLimit?: number;
  perUserLimit?: number;
}

// ----------------------------------------------------
// Mock Seeds matching the SQL Schema
// ----------------------------------------------------

export const MOCK_BRANDS: Brand[] = [
  { id: "b1000000-0000-0000-0000-000000000001", name: "Canon", slug: "canon" },
  { id: "b1000000-0000-0000-0000-000000000002", name: "Sony", slug: "sony" },
  { id: "b1000000-0000-0000-0000-000000000003", name: "Nikon", slug: "nikon" },
  { id: "b1000000-0000-0000-0000-000000000004", name: "DJI", slug: "dji" },
  { id: "b1000000-0000-0000-0000-000000000005", name: "RED Digital", slug: "red" },
];

export const MOCK_CATEGORIES: Category[] = [
  {
    id: "c1000000-0000-0000-0000-000000000001",
    name: "DSLR Cameras",
    slug: "dslr-cameras",
    description: "Traditional high-end optical viewfinder professional cameras",
  },
  {
    id: "c1000000-0000-0000-0000-000000000002",
    name: "Mirrorless Cameras",
    slug: "mirrorless-cameras",
    description: "Modern digital high-performance mirrorless bodies",
  },
  {
    id: "c1000000-0000-0000-0000-000000000003",
    name: "Cinema Cameras",
    slug: "cinema-cameras",
    description: "Industry-standard film production cameras",
  },
  {
    id: "c1000000-0000-0000-0000-000000000004",
    name: "Professional Lenses",
    slug: "professional-lenses",
    description: "Ultra-sharp luxury glass optics and cinema lenses",
  },
  {
    id: "c1000000-0000-0000-0000-000000000005",
    name: "Gimbals & Stabilizers",
    slug: "gimbals",
    description: "Sturdy carbon stabilizers and motorized gimbals",
  },
  {
    id: "c1000000-0000-0000-0000-000000000006",
    name: "Professional Lighting",
    slug: "lighting",
    description: "Studio strobes, continuous LED matrices, and softboxes",
  },
  {
    id: "c1000000-0000-0000-0000-000000000007",
    name: "Audio Equipment",
    slug: "audio",
    description: "Wireless lavalier systems, shotgun microphones, and recorders",
  },
  {
    id: "c1000000-0000-0000-0000-000000000008",
    name: "Production Accessories",
    slug: "accessories",
    description: "Luxury tripods, matte boxes, monitors, and media cards",
  },
];

export const MOCK_PRODUCTS: Product[] = [
  {
    id: "p1000000-0000-0000-0000-000000000001",
    brandId: "b1000000-0000-0000-0000-000000000001",
    categoryId: "c1000000-0000-0000-0000-000000000002",
    name: "Canon Camera",
    slug: "canon-eos-r5",
    description: "A professional Canon camera body offering high-performance stills and internal video recording. Features 5-axis image stabilization and outstanding autofocus for commercial shoots.",
    dailyPrice: 799.00,
    weeklyPrice: 4999.00,
    securityDeposit: 5000.00,
    inventoryQty: 2,
    rating: 4.95,
    isFeatured: true,
    isArchived: false,
    specs: {
      sensor: "45MP Full-Frame CMOS",
      video: "8K RAW Internal",
      stabilization: "8-stops IBIS",
      iso: "100 - 51,200",
      weight: "738g",
    },
    imagePrimary: "/assets/canon-sequence/frame-210.jpg",
    images: ["/assets/canon-sequence/frame-210.jpg"],
  },
  {
    id: "p1000000-0000-0000-0000-000000000003",
    brandId: "b1000000-0000-0000-0000-000000000003",
    categoryId: "c1000000-0000-0000-0000-000000000002",
    name: "Nikon Camera",
    slug: "nikon-z8",
    description: "A compact professional Nikon body inheriting advanced features. Equipped with a stacked sensor, high-speed autofocus, and deep learning subject tracking.",
    dailyPrice: 799.00,
    weeklyPrice: 4999.00,
    securityDeposit: 5000.00,
    inventoryQty: 1,
    rating: 4.88,
    isFeatured: true,
    isArchived: false,
    specs: {
      sensor: "45.7MP Stacked CMOS",
      video: "8K 60p N-RAW Internal",
      stabilization: "5.5-stops IBIS",
      iso: "64 - 25,600",
      weight: "910g",
    },
    imagePrimary: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=600&auto=format&fit=crop",
    images: ["https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=600&auto=format&fit=crop"],
  },
];

export const MOCK_ADDONS: ProductAddon[] = [
  {
    id: "a1000000-0000-0000-0000-000000000001",
    name: "Sandisk Extreme PRO CFexpress 512GB",
    description: "High-speed media card for 8K video capture",
    price: 499.00,
    isAvailable: true,
  },
  {
    id: "a1000000-0000-0000-0000-000000000002",
    name: "Extra LP-E6NH Rechargeable Battery",
    description: "Provides up to 2 hours of extra continuous shoot time",
    price: 199.00,
    isAvailable: true,
  },
  {
    id: "a1000000-0000-0000-0000-000000000003",
    name: "Atomos Ninja V 5\" 4K Monitor-Recorder",
    description: "External monitor for advanced exposure tools and ProRes recording",
    price: 999.00,
    isAvailable: true,
  },
];

export const MOCK_TESTIMONIALS: Testimonial[] = [
  {
    id: "t1",
    authorName: "Aravind Sen",
    authorTitle: "Commercial Film Director",
    quote: "AUREVIA provides pristine equipment that meets exact set standards. Their service is truly elite, matching the quality of the glass they rent.",
    rating: 5,
  },
  {
    id: "t2",
    authorName: "Rhea Kapoor",
    authorTitle: "Fashion Photographer, Vogue",
    quote: "The Canon EOS R5 sequence was flawless. Renting from Aurevia feels like a bespoke luxury experience, from reservation to concierge pickup.",
    rating: 5,
  },
  {
    id: "t3",
    authorName: "Vikram Mehta",
    authorTitle: "Wildlife Documentarian",
    quote: "Having high-quality cinema gear ready on demand has simplified our production pipeline. Zero issues with custom booking setups.",
    rating: 5,
  },
];

export const MOCK_FAQS: FAQ[] = [
  {
    id: "f1",
    question: "What is the security deposit and how is it processed?",
    answer: "The security deposit is a temporary pre-authorization held on your card or paid online. It is fully refunded within 24-48 hours after returning the equipment in original inspected condition.",
    category: "Security",
  },
  {
    id: "f2",
    question: "Can I extend my rental period mid-booking?",
    answer: "Yes, extensions are allowed subject to equipment availability. Please submit an extension request from your dashboard or contact our concierge immediately.",
    category: "Rentals",
  },
  {
    id: "f3",
    question: "Do you offer delivery to shooting locations?",
    answer: "Absolutely. We offer high-security delivery directly to your studio or field location in custom protective hard cases. Rates vary based on distance and urgency.",
    category: "Shipping",
  },
  {
    id: "f4",
    question: "What happens in case of accidental damage?",
    answer: "We require checking the equipment details upon receipt. We offer optional damage waivers during checkout to protect against minor accidents. Severe damages are assessed and billed according to repair cost.",
    category: "Damage & Insurance",
  },
];

export const MOCK_COUPONS: Coupon[] = [
  {
    id: "c_aurevia199",
    code: "AUREVIA199",
    discountPercent: 0,
    discountFlat: 199.00,
    activeUntil: "2026-12-31",
    isActive: true,
    activationDate: "2026-07-01",
    usageLimit: 100,
    perUserLimit: 1,
  },
  {
    id: "c1",
    code: "AUREVIA10",
    discountPercent: 10,
    activeUntil: "2026-12-31",
    isActive: true,
  },
  {
    id: "c2",
    code: "WELCOMEPREM",
    discountPercent: 15,
    activeUntil: "2026-12-31",
    isActive: true,
  },
];
