import {
  Brand,
  Category,
  Product,
  ProductAddon,
  Testimonial,
  FAQ,
  Coupon,
  MOCK_BRANDS,
  MOCK_CATEGORIES,
  MOCK_PRODUCTS,
  MOCK_ADDONS,
  MOCK_TESTIMONIALS,
  MOCK_FAQS,
  MOCK_COUPONS,
} from "./mockData";

export interface BookingItem {
  productId: string;
  quantity: number;
  unitPrice: number;
  inventoryUnitId?: string; // assigned physical camera unit
}

export interface BookingAddonSelection {
  addonId: string;
  price: number;
}

export interface InventoryUnit {
  id: string;
  productId: string;
  serialNumber: string;
  name: string;
  status: "available" | "rented" | "maintenance" | "decommissioned";
  condition: "excellent" | "good" | "fair" | "damaged";
  notes?: string;
}

export interface Booking {
  id: string;
  profileId: string;
  referenceCode: string;
  startDate: string;
  endDate: string;
  totalRentalFee: number;
  taxFee: number;
  deliveryFee: number;
  discountAmount: number;
  totalPayable: number;
  status: "pending_payment" | "paid" | "approval_pending" | "approved" | "ready_for_pickup" | "rented" | "returned" | "completed" | "rejected" | "cancelled" | "payment_failed" | "overdue" | "maintenance";
  paymentStatus: "unpaid" | "paid" | "refunded";
  deliveryMethod: "pickup" | "delivery";
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  couponApplied?: string;
  items: BookingItem[];
  addons: BookingAddonSelection[];
  createdAt: string;
  pickupTime?: string;
  returnTime?: string;
  emergencyContact: string;
  companyOrCollege?: string;
  agreementAccepted: boolean;
  agreementAcceptedAt?: string;
  agreementIP?: string;
  pickupOTP?: string;
  pickupRemarks?: string;
  pickupConditionPhotos?: string[];
  pickupHandoverAt?: string;
  returnInspectionAt?: string;
  returnRemarks?: string;
  returnConditionPhotos?: string[];
  lateFee?: number;
  damageDescription?: string;
  damageCost?: number;
  penaltyPaymentStatus?: "none" | "unpaid" | "paid";
  statusHistory: { status: string; timestamp: string; note: string }[];
  auditLogs: { action: string; timestamp: string; performedBy: string; details: string }[];
}

export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  role: "customer" | "staff" | "admin";
  avatarUrl?: string;
}

export interface WaitlistEntry {
  id: string;
  productId: string;
  name: string;
  email: string;
  phone: string;
  status: "pending" | "notified" | "cancelled";
  startDate?: string;
  endDate?: string;
  createdAt: string;
}

export interface Review {
  id: string;
  productId: string;
  authorName: string;
  rating: number;
  quote: string;
  isApproved: boolean;
  createdAt: string;
}

// In-Memory state for Server Side reviews & waitlists
let serverReviews: Review[] = [
  {
    id: "rev-1",
    productId: "p1000000-0000-0000-0000-000000000001",
    authorName: "Aravind Sen",
    rating: 5,
    quote: "AUREVIA provides pristine equipment that meets exact set standards. Their service is truly elite, matching the quality of the glass they rent.",
    isApproved: true,
    createdAt: new Date().toISOString()
  },
  {
    id: "rev-2",
    productId: "p1000000-0000-0000-0000-000000000001",
    authorName: "Rhea Kapoor",
    rating: 5,
    quote: "The Canon EOS R5 sequence was flawless. Renting from Aurevia feels like a bespoke luxury experience, from reservation to concierge pickup.",
    isApproved: true,
    createdAt: new Date().toISOString()
  },
  {
    id: "rev-3",
    productId: "p1000000-0000-0000-0000-000000000003",
    authorName: "Vikram Mehta",
    rating: 5,
    quote: "Having high-quality cinema gear ready on demand has simplified our production pipeline. Zero issues with custom booking setups.",
    isApproved: true,
    createdAt: new Date().toISOString()
  }
];

let serverWaitlist: WaitlistEntry[] = [];

// In-Memory state for Server Side rendering, initialized with seed data
let serverBookings: Booking[] = [
  {
    id: "bk-seed-1",
    profileId: "usr-prem",
    referenceCode: "AV-2026-88091",
    startDate: "2026-07-20",
    endDate: "2026-07-25",
    totalRentalFee: 17495.00,
    taxFee: 0.00,
    deliveryFee: 0.00,
    discountAmount: 1749.50,
    totalPayable: 15745.50,
    status: "approved",
    paymentStatus: "paid",
    deliveryMethod: "delivery",
    contactName: "Prem Kumar",
    contactPhone: "9686909048",
    contactEmail: "contact@prem.dev",
    couponApplied: "AUREVIA10",
    items: [
      {
        productId: "p1000000-0000-0000-0000-000000000001",
        quantity: 1,
        unitPrice: 3499.00,
      }
    ],
    addons: [
      { addonId: "a1000000-0000-0000-0000-000000000001", price: 499.00 }
    ],
    createdAt: "2026-07-14T10:00:00.000Z",
    emergencyContact: "Aswin Kumar - 9876543210",
    agreementAccepted: true,
    statusHistory: [],
    auditLogs: [],
  },
  {
    id: "bk-seed-2",
    profileId: "usr-rhea",
    referenceCode: "AV-2026-44120",
    startDate: "2026-07-02",
    endDate: "2026-07-04",
    totalRentalFee: 8998.00,
    taxFee: 0.00,
    deliveryFee: 0.00,
    discountAmount: 0.00,
    totalPayable: 8998.00,
    status: "returned",
    paymentStatus: "paid",
    deliveryMethod: "pickup",
    contactName: "Rhea Sen",
    contactPhone: "9876543210",
    contactEmail: "rhea@sen.me",
    items: [
      {
        productId: "p1000000-0000-0000-0000-000000000002",
        quantity: 1,
        unitPrice: 4499.00,
      }
    ],
    addons: [],
    createdAt: "2026-07-01T15:30:00.000Z",
    emergencyContact: "Raj Sen - 9876543211",
    agreementAccepted: true,
    statusHistory: [],
    auditLogs: [],
  }
];

let serverProfile: UserProfile = {
  id: "usr-prem",
  fullName: "Prem Mundargi",
  email: "premmundargi135@gmail.com",
  phone: "9686909048",
  role: "admin",
};

const isClient = typeof window !== "undefined";

function getLocalBookings(): Booking[] {
  if (!isClient) return serverBookings;
  const stored = localStorage.getItem("aurevia_bookings");
  if (!stored) {
    localStorage.setItem("aurevia_bookings", JSON.stringify(serverBookings));
    return serverBookings;
  }
  return JSON.parse(stored);
}

function saveLocalBookings(bookings: Booking[]) {
  serverBookings = bookings;
  if (isClient) {
    localStorage.setItem("aurevia_bookings", JSON.stringify(bookings));
  }
}

let serverInventoryUnits: InventoryUnit[] = [
  {
    id: "u1000000-0000-0000-0000-000000000001",
    productId: "p1000000-0000-0000-0000-000000000001",
    serialNumber: "CN-CAM-01",
    name: "Canon Camera 1",
    status: "available",
    condition: "excellent",
  },
  {
    id: "u1000000-0000-0000-0000-000000000002",
    productId: "p1000000-0000-0000-0000-000000000001",
    serialNumber: "CN-CAM-02",
    name: "Canon Camera 2",
    status: "available",
    condition: "good",
  },
  {
    id: "u1000000-0000-0000-0000-000000000003",
    productId: "p1000000-0000-0000-0000-000000000003",
    serialNumber: "NK-CAM-01",
    name: "Nikon Camera 1",
    status: "available",
    condition: "excellent",
  },
];

function getLocalInventoryUnits(): InventoryUnit[] {
  if (!isClient) return serverInventoryUnits;
  const stored = localStorage.getItem("aurevia_inventory_units");
  if (!stored) {
    localStorage.setItem("aurevia_inventory_units", JSON.stringify(serverInventoryUnits));
    return serverInventoryUnits;
  }
  return JSON.parse(stored);
}

function saveLocalInventoryUnits(units: InventoryUnit[]) {
  serverInventoryUnits = units;
  if (isClient) {
    localStorage.setItem("aurevia_inventory_units", JSON.stringify(units));
  }
}

function getLocalProfile(): UserProfile {
  if (!isClient) return serverProfile;
  const stored = localStorage.getItem("aurevia_profile");
  if (!stored) {
    localStorage.setItem("aurevia_profile", JSON.stringify(serverProfile));
    return serverProfile;
  }
  return JSON.parse(stored);
}

function saveLocalProfile(profile: UserProfile) {
  serverProfile = profile;
  if (isClient) {
    localStorage.setItem("aurevia_profile", JSON.stringify(profile));
  }
}

function getLocalReviews(): Review[] {
  if (!isClient) return serverReviews;
  const stored = localStorage.getItem("aurevia_reviews");
  if (!stored) {
    localStorage.setItem("aurevia_reviews", JSON.stringify(serverReviews));
    return serverReviews;
  }
  return JSON.parse(stored);
}

function saveLocalReviews(reviews: Review[]) {
  serverReviews = reviews;
  if (isClient) {
    localStorage.setItem("aurevia_reviews", JSON.stringify(reviews));
  }
}

function getLocalWaitlist(): WaitlistEntry[] {
  if (!isClient) return serverWaitlist;
  const stored = localStorage.getItem("aurevia_waitlist");
  if (!stored) {
    localStorage.setItem("aurevia_waitlist", JSON.stringify(serverWaitlist));
    return serverWaitlist;
  }
  return JSON.parse(stored);
}

function saveLocalWaitlist(waitlist: WaitlistEntry[]) {
  serverWaitlist = waitlist;
  if (isClient) {
    localStorage.setItem("aurevia_waitlist", JSON.stringify(waitlist));
  }
}

// Local mock storage helpers
let serverDrafts: any[] = [];
let serverHistory: any[] = [];
let serverRefunds: any[] = [];
let serverMaintenance: any[] = [];
let serverTickets: any[] = [];
let serverReplies: any[] = [];
let serverWebsiteSettings: Record<string, string> = {
  homepage_banner_title: "Frame the Extraordinary",
  homepage_banner_subtitle: "Rent premium DSLR, mirrorless, cinema cameras, lenses and professional production gear.",
  homepage_banner_image: "/assets/canon-sequence/frame-210.jpg",
  announcement_bar_text: "⚡ SPECIAL OFFER: Save ₹199/day on all cameras with coupon AUREVIA199!",
  announcement_bar_active: "true",
  rental_terms: "1. No security deposit or KYC required.\n2. Flat daily rate billing.\n3. Cancel 24h prior for 100% refund.",
  contact_phone: "+91 96869 09048",
  contact_email: "prem@aurevia.com",
  contact_address: "Aurevia Studio Vault, Gadag, Karnataka",
};

let previewModeActive = false;

function getLocalDrafts(): any[] {
  if (!isClient) return serverDrafts;
  const stored = localStorage.getItem("aurevia_drafts");
  return stored ? JSON.parse(stored) : serverDrafts;
}

function saveLocalDrafts(drafts: any[]) {
  serverDrafts = drafts;
  if (isClient) {
    localStorage.setItem("aurevia_drafts", JSON.stringify(drafts));
  }
}

function getLocalHistory(): any[] {
  if (!isClient) return serverHistory;
  const stored = localStorage.getItem("aurevia_history");
  return stored ? JSON.parse(stored) : serverHistory;
}

function saveLocalHistory(hist: any[]) {
  serverHistory = hist;
  if (isClient) {
    localStorage.setItem("aurevia_history", JSON.stringify(hist));
  }
}

function getLocalRefunds(): any[] {
  if (!isClient) return serverRefunds;
  const stored = localStorage.getItem("aurevia_refunds");
  return stored ? JSON.parse(stored) : serverRefunds;
}

function saveLocalRefunds(refs: any[]) {
  serverRefunds = refs;
  if (isClient) {
    localStorage.setItem("aurevia_refunds", JSON.stringify(refs));
  }
}

function getLocalMaintenance(): any[] {
  if (!isClient) return serverMaintenance;
  const stored = localStorage.getItem("aurevia_maintenance");
  return stored ? JSON.parse(stored) : serverMaintenance;
}

function saveLocalMaintenance(maint: any[]) {
  serverMaintenance = maint;
  if (isClient) {
    localStorage.setItem("aurevia_maintenance", JSON.stringify(maint));
  }
}

function getLocalTickets(): any[] {
  if (!isClient) return serverTickets;
  const stored = localStorage.getItem("aurevia_tickets");
  return stored ? JSON.parse(stored) : serverTickets;
}

function saveLocalTickets(tix: any[]) {
  serverTickets = tix;
  if (isClient) {
    localStorage.setItem("aurevia_tickets", JSON.stringify(tix));
  }
}

function getLocalReplies(): any[] {
  if (!isClient) return serverReplies;
  const stored = localStorage.getItem("aurevia_replies");
  return stored ? JSON.parse(stored) : serverReplies;
}

function saveLocalReplies(reps: any[]) {
  serverReplies = reps;
  if (isClient) {
    localStorage.setItem("aurevia_replies", JSON.stringify(reps));
  }
}

function getLocalSettings(): Record<string, string> {
  if (!isClient) return serverWebsiteSettings;
  const stored = localStorage.getItem("aurevia_website_settings");
  if (!stored) {
    localStorage.setItem("aurevia_website_settings", JSON.stringify(serverWebsiteSettings));
    return serverWebsiteSettings;
  }
  return JSON.parse(stored);
}

function saveLocalSettings(settings: Record<string, string>) {
  serverWebsiteSettings = settings;
  if (isClient) {
    localStorage.setItem("aurevia_website_settings", JSON.stringify(settings));
  }
}

function getLocalProducts(): Product[] {
  if (!isClient) return MOCK_PRODUCTS;
  const stored = localStorage.getItem("aurevia_products");
  if (!stored) {
    localStorage.setItem("aurevia_products", JSON.stringify(MOCK_PRODUCTS));
    return MOCK_PRODUCTS;
  }
  return JSON.parse(stored);
}

function saveLocalProducts(products: Product[]) {
  if (isClient) {
    localStorage.setItem("aurevia_products", JSON.stringify(products));
  }
}

function getLocalCoupons(): Coupon[] {
  if (!isClient) return MOCK_COUPONS;
  const stored = localStorage.getItem("aurevia_coupons");
  if (!stored) {
    localStorage.setItem("aurevia_coupons", JSON.stringify(MOCK_COUPONS));
    return MOCK_COUPONS;
  }
  return JSON.parse(stored);
}

function saveLocalCoupons(coupons: Coupon[]) {
  if (isClient) {
    localStorage.setItem("aurevia_coupons", JSON.stringify(coupons));
  }
}

function getLocalFAQs(): FAQ[] {
  if (!isClient) return MOCK_FAQS;
  const stored = localStorage.getItem("aurevia_faqs");
  if (!stored) {
    localStorage.setItem("aurevia_faqs", JSON.stringify(MOCK_FAQS));
    return MOCK_FAQS;
  }
  return JSON.parse(stored);
}

function saveLocalFAQs(faqs: FAQ[]) {
  if (isClient) {
    localStorage.setItem("aurevia_faqs", JSON.stringify(faqs));
  }
}

function getLocalTestimonials(): Testimonial[] {
  if (!isClient) return MOCK_TESTIMONIALS;
  const stored = localStorage.getItem("aurevia_testimonials");
  if (!stored) {
    localStorage.setItem("aurevia_testimonials", JSON.stringify(MOCK_TESTIMONIALS));
    return MOCK_TESTIMONIALS;
  }
  return JSON.parse(stored);
}

function saveLocalTestimonials(testimonials: Testimonial[]) {
  if (isClient) {
    localStorage.setItem("aurevia_testimonials", JSON.stringify(testimonials));
  }
}

// ----------------------------------------------------

// SUPABASE CLIENT SELECTOR & DUAL-MODE LOGIC
// ----------------------------------------------------
export const isSupabaseConfigured = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return false;
  // Reject any placeholder values
  if (url.includes("PLACEHOLDER") || url.includes("your-project-id") || url.includes("YOUR_")) return false;
  if (anonKey.includes("PLACEHOLDER") || anonKey.includes("YOUR_")) return false;
  // Must look like a real Supabase URL
  return url.startsWith("https://") && url.includes(".supabase.co");
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function getSupabase(): Promise<any> {
  if (typeof window !== "undefined") {
    const { getClient } = await import("@/lib/supabase/client");
    return getClient() as any;
  } else {
    const { createClient } = await import("@supabase/supabase-js");
    return createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    ) as any;
  }
}

function mapDbProductToApp(p: any): Product {
  return {
    id: p.id,
    brandId: p.brand_id,
    categoryId: p.category_id,
    name: p.name,
    slug: p.slug,
    description: p.description,
    dailyPrice: Number(p.daily_price || p.daily_rate || 799),
    weeklyPrice: Number(p.weekly_price || p.weekly_rate || 4999),
    inventoryQty: Number(p.inventory_qty || 1),
    rating: Number(p.rating || 5.0),
    isFeatured: p.is_featured || false,
    isArchived: p.is_archived || false,
    specs: p.specs_json || p.specs || {},
    imagePrimary: p.image_primary || (p.product_images && p.product_images.length > 0 ? p.product_images[0].image_url : "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=400&q=80"),
    images: p.product_images && p.product_images.length > 0 ? p.product_images.map((img: any) => img.image_url) : ["https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=400&q=80"],
  };
}

function mapDbBookingToApp(b: any): Booking {
  return {
    id: b.id,
    profileId: b.profile_id,
    referenceCode: b.reference_code,
    startDate: b.start_date,
    endDate: b.end_date,
    totalRentalFee: Number(b.total_rental_fee || 0),
    taxFee: Number(b.tax_fee || 0),
    deliveryFee: Number(b.delivery_fee || 0),
    discountAmount: Number(b.discount_amount || 0),
    totalPayable: Number(b.total_payable || 0),
    status: b.status,
    paymentStatus: b.payment_status || "unpaid",
    deliveryMethod: b.delivery_method || "pickup",
    contactName: b.contact_name || "",
    contactPhone: b.contact_phone || "",
    contactEmail: b.contact_email || "",
    couponApplied: b.coupon_applied || undefined,
    createdAt: b.created_at,
    pickupTime: b.pickup_time || undefined,
    returnTime: b.return_time || undefined,
    emergencyContact: b.emergency_contact || "",
    companyOrCollege: b.company_or_college || undefined,
    agreementAccepted: b.agreement_accepted || false,
    agreementAcceptedAt: b.agreement_accepted_at || undefined,
    agreementIP: b.agreement_ip || undefined,
    pickupOTP: b.pickup_otp || undefined,
    pickupRemarks: b.pickup_remarks || undefined,
    pickupConditionPhotos: b.pickup_condition_photos || undefined,
    pickupHandoverAt: b.pickup_handover_at || undefined,
    returnInspectionAt: b.return_inspection_at || undefined,
    returnRemarks: b.return_remarks || undefined,
    returnConditionPhotos: b.return_condition_photos || undefined,
    lateFee: Number(b.late_fee || 0),
    damageDescription: b.damage_description || "",
    damageCost: Number(b.damage_cost || 0),
    penaltyPaymentStatus: b.penalty_payment_status || "none",
    statusHistory: Array.isArray(b.status_history) ? b.status_history : [],
    auditLogs: Array.isArray(b.audit_logs) ? b.audit_logs : [],
    items: Array.isArray(b.booking_items)
      ? b.booking_items.map((item: any) => ({
          productId: item.product_id,
          quantity: item.quantity,
          unitPrice: Number(item.unit_price || 799),
          inventoryUnitId: item.inventory_unit_id || undefined,
        }))
      : [],
    addons: Array.isArray(b.booking_addons)
      ? b.booking_addons.map((add: any) => ({
          addonId: add.addon_id,
          price: Number(add.price || 0),
        }))
      : [],
  };
}

export const db = {
  // 1. Brands
  async getBrands(): Promise<Brand[]> {
    if (isSupabaseConfigured()) {
      const supabase = await getSupabase();
      const { data, error } = await supabase.from("brands").select("*");
      if (!error && data && data.length > 0) {
        return data.map((b: any) => ({ id: b.id, name: b.name, slug: b.slug, logoUrl: b.logo_url }));
      }
    }
    return MOCK_BRANDS;
  },

  // 2. Categories
  async getCategories(): Promise<Category[]> {
    if (isSupabaseConfigured()) {
      const supabase = await getSupabase();
      const { data, error } = await supabase.from("categories").select("*");
      if (!error && data && data.length > 0) {
        return data.map((c: any) => ({ id: c.id, name: c.name, slug: c.slug, description: c.description || "" }));
      }
    }
    return MOCK_CATEGORIES;
  },

  // 3. Products
  async getProducts(filters?: {
    categorySlug?: string;
    brandSlug?: string;
    search?: string;
    featuredOnly?: boolean;
  }): Promise<Product[]> {
    let products: Product[] = [];

    if (isSupabaseConfigured()) {
      const supabase = await getSupabase();
      const { data: dbProds, error } = await supabase
        .from("products")
        .select("*, product_images(*)")
        .eq("is_archived", false);

      if (!error && dbProds) {
        products = (dbProds as any[]).map(mapDbProductToApp);

        if (filters?.featuredOnly) {
          products = products.filter((p: Product) => p.isFeatured);
        }
        if (filters?.categorySlug) {
          const { data: cat } = await supabase.from("categories").select("id").eq("slug", filters.categorySlug).single();
          if (cat) {
            products = products.filter((p: Product) => p.categoryId === (cat as any).id);
          }
        }
        if (filters?.brandSlug) {
          const { data: brand } = await supabase.from("brands").select("id").eq("slug", filters.brandSlug).single();
          if (brand) {
            products = products.filter((p: Product) => p.brandId === (brand as any).id);
          }
        }
        if (filters?.search) {
          const q = filters.search.toLowerCase();
          products = products.filter(
            (p: Product) =>
              p.name.toLowerCase().includes(q) ||
              p.description.toLowerCase().includes(q)
          );
        }
      }
    } else {
      // Mock Fallback
      products = getLocalProducts();
      if (filters?.featuredOnly) products = products.filter((p) => p.isFeatured);
      if (filters?.categorySlug) {
        const cat = MOCK_CATEGORIES.find((c) => c.slug === filters.categorySlug);
        if (cat) products = products.filter((p) => p.categoryId === cat.id);
      }
      if (filters?.brandSlug) {
        const brand = MOCK_BRANDS.find((b) => b.slug === filters.brandSlug);
        if (brand) products = products.filter((p) => p.brandId === brand.id);
      }
      if (filters?.search) {
        const query = filters.search.toLowerCase();
        products = products.filter(
          (p) =>
            p.name.toLowerCase().includes(query) ||
            p.description.toLowerCase().includes(query) ||
            Object.values(p.specs).some((val) => val.toLowerCase().includes(query))
        );
      }
      products = products.filter((p) => !p.isArchived);
    }

    // Merge content drafts if preview mode is active
    if (this.getPreviewMode()) {
      const drafts = await this.getDrafts("product");
      products = products.map((p) => {
        const draft = drafts.find((d) => d.item_id === p.id);
        return draft ? { ...p, ...draft.draft_data } : p;
      });
    }

    return products;
  },

  async getProductBySlug(slug: string): Promise<Product | null> {
    const products = await this.getProducts();
    const product = products.find((p) => p.slug === slug);
    return product || null;
  },

  async getProductById(id: string): Promise<Product | null> {
    const products = await this.getProducts();
    const product = products.find((p) => p.id === id);
    return product || null;
  },


  async getAddons(): Promise<ProductAddon[]> {
    if (isSupabaseConfigured()) {
      const supabase = await getSupabase();
      const { data, error } = await supabase.from("product_addons").select("*").eq("is_available", true);
      if (!error && data) {
        return data.map((a: any) => ({
          id: a.id,
          name: a.name,
          description: a.description || "",
          price: Number(a.price),
          isAvailable: a.is_available,
        }));
      }
    }
    return MOCK_ADDONS;
  },

  // 4. Booking Reservations Engine
  async checkAvailability(
    productId: string,
    startDateStr: string,
    endDateStr: string
  ): Promise<{ available: boolean; remainingQty: number }> {
    if (isSupabaseConfigured()) {
      const supabase = await getSupabase();
      const { data: dbBookings } = await supabase
        .from("bookings")
        .select(`
          status, start_date, end_date,
          booking_items (product_id, inventory_unit_id)
        `);

      const { data: dbUnits } = await supabase
        .from("inventory_units")
        .select("*")
        .eq("product_id", productId);

      if (dbUnits) {
        const activeUnits = (dbUnits as any[]).filter((u: any) => u.status !== "decommissioned" && u.status !== "maintenance");
        const activeBookings = ((dbBookings || []) as any[]).filter(
          (b: any) =>
            ["paid", "approval_pending", "approved", "ready_for_pickup", "rented", "returned", "completed", "overdue"].includes(b.status) &&
            new Date(b.start_date) <= new Date(endDateStr) &&
            new Date(b.end_date) >= new Date(startDateStr)
        );

        let freeCount = 0;
        activeUnits.forEach((unit: any) => {
          const isBooked = activeBookings.some((b: any) =>
            b.booking_items.some((oi: any) => oi.product_id === productId && oi.inventory_unit_id === unit.id)
          );
          if (!isBooked) freeCount++;
        });

        return {
          available: freeCount > 0,
          remainingQty: freeCount,
        };
      }
    }

    // Mock fallback
    const start = new Date(startDateStr);
    const end = new Date(endDateStr);
    if (isNaN(start.getTime()) || isNaN(end.getTime()) || start > end) {
      return { available: false, remainingQty: 0 };
    }

    const units = (await this.getInventoryUnits()).filter(
      (u) => u.productId === productId && u.status !== "decommissioned" && u.status !== "maintenance"
    );
    const bookings = getLocalBookings().filter(
      (b) =>
        (["paid", "approval_pending", "approved", "ready_for_pickup", "rented", "returned", "completed", "overdue"].includes(b.status)) &&
        new Date(b.startDate) <= end &&
        new Date(b.endDate) >= start
    );

    let freeCount = 0;
    units.forEach((unit) => {
      const isBooked = bookings.some((b) =>
        b.items.some((item) => item.productId === productId && item.inventoryUnitId === unit.id)
      );
      if (!isBooked) {
        freeCount++;
      }
    });

    return {
      available: freeCount > 0,
      remainingQty: freeCount,
    };
  },

  async createBooking(booking: Omit<Booking, "id" | "createdAt" | "status" | "paymentStatus" | "depositStatus" | "statusHistory" | "auditLogs">): Promise<Booking> {
    if (isSupabaseConfigured()) {
      const supabase = await getSupabase();
      const refCode = `AV-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;

      const { data: dbB, error: bErr } = await supabase
        .from("bookings")
        .insert({
          profile_id: booking.profileId,
          reference_code: refCode,
          start_date: booking.startDate,
          end_date: booking.endDate,
          total_rental_fee: booking.totalRentalFee,
          tax_fee: booking.taxFee,
          delivery_fee: booking.deliveryFee,
          discount_amount: booking.discountAmount,
          total_payable: booking.totalPayable,
          status: "pending_payment",
          payment_status: "unpaid",
          delivery_method: booking.deliveryMethod,
          contact_name: booking.contactName,
          contact_phone: booking.contactPhone,
          contact_email: booking.contactEmail,
          emergency_contact: booking.emergencyContact,
          company_or_college: booking.companyOrCollege || null,
          agreement_accepted: booking.agreementAccepted || false,
          agreement_accepted_at: booking.agreementAcceptedAt || null,
          agreement_ip: booking.agreementIP || null,
          status_history: [
            { status: "pending_payment", timestamp: new Date().toISOString(), note: "Booking initiated, terms agreed, pending checkout payment." }
          ],
          audit_logs: [
            { action: "booking_created", timestamp: new Date().toISOString(), performedBy: "customer", details: `Booking reference ${refCode} initialized after terms acceptance.` }
          ],
        })
        .select()
        .single();

      if (bErr || !dbB) throw new Error(bErr?.message || "Failed to insert booking draft");

      // Insert Items
      if (booking.items && booking.items.length > 0) {
        const { error: iErr } = await supabase
          .from("booking_items")
          .insert(
            booking.items.map((item) => ({
              booking_id: dbB.id,
              product_id: item.productId,
              quantity: item.quantity,
              unit_price: item.unitPrice,
            }))
          );
        if (iErr) console.error("Error inserting booking items:", iErr);
      }

      // Insert Addons
      if (booking.addons && booking.addons.length > 0) {
        const { error: aErr } = await supabase
          .from("booking_addons")
          .insert(
            booking.addons.map((addon) => ({
              booking_id: dbB.id,
              addon_id: addon.addonId,
              price: addon.price,
            }))
          );
        if (aErr) console.error("Error inserting booking addons:", aErr);
      }

      const fullyJoined = await this.getBookingById(dbB.id);
      if (fullyJoined) return fullyJoined;
    }

    // Mock fallback
    for (const item of booking.items) {
      const { available, remainingQty } = await this.checkAvailability(
        item.productId,
        booking.startDate,
        booking.endDate
      );
      if (!available || remainingQty < item.quantity) {
        throw new Error(
          `Inventory conflict: Not enough stock remaining for one of the products.`
        );
      }
    }

    const refCode = booking.referenceCode;
    const newBooking: Booking = {
      ...booking,
      id: `bk-${Math.random().toString(36).substring(2, 11)}`,
      status: "pending_payment",
      paymentStatus: "unpaid",
      createdAt: new Date().toISOString(),
      agreementAccepted: booking.agreementAccepted || false,
      agreementAcceptedAt: booking.agreementAcceptedAt,
      agreementIP: booking.agreementIP,
      lateFee: 0,
      damageDescription: "",
      damageCost: 0,
      statusHistory: [
        { status: "pending_payment", timestamp: new Date().toISOString(), note: "Booking initiated, terms agreed, pending checkout payment." }
      ],
      auditLogs: [
        { action: "booking_created", timestamp: new Date().toISOString(), performedBy: "customer", details: `Booking reference ${refCode} initialized after terms acceptance.` }
      ],
    };

    const currentBookings = getLocalBookings();
    saveLocalBookings([newBooking, ...currentBookings]);
    return newBooking;
  },

  async getBookings(profileId?: string): Promise<Booking[]> {
    if (isSupabaseConfigured()) {
      const supabase = await getSupabase();
      let query = supabase
        .from("bookings")
        .select(`
          *,
          booking_items (id, booking_id, product_id, inventory_unit_id, quantity, unit_price),
          booking_addons (id, booking_id, addon_id, price)
        `);
      if (profileId) {
        query = query.eq("profile_id", profileId);
      }
      const { data, error } = await query.order("created_at", { ascending: false });
      if (!error && data) return data.map(mapDbBookingToApp);
    }

    // Mock
    const bookings = getLocalBookings();
    if (profileId) {
      return bookings.filter((b) => b.profileId === profileId);
    }
    return bookings;
  },

  async getBookingById(id: string): Promise<Booking | null> {
    if (isSupabaseConfigured()) {
      const supabase = await getSupabase();
      const { data, error } = await supabase
        .from("bookings")
        .select(`
          *,
          booking_items (id, booking_id, product_id, inventory_unit_id, quantity, unit_price),
          booking_addons (id, booking_id, addon_id, price)
        `)
        .eq("id", id)
        .single();
      if (!error && data) return mapDbBookingToApp(data);
    }

    const booking = getLocalBookings().find((b) => b.id === id);
    return booking || null;
  },

  async updateBookingStatus(
    bookingId: string,
    status: Booking["status"],
    note: string = "",
    performedBy: string = "system"
  ): Promise<Booking | null> {
    if (isSupabaseConfigured()) {
      const supabase = await getSupabase();
      const { data: b, error } = await supabase.from("bookings").select("*").eq("id", bookingId).single();
      if (!error && b) {
        const statusHistory = b.status_history || [];
        const auditLogs = b.audit_logs || [];

        statusHistory.push({
          status,
          timestamp: new Date().toISOString(),
          note: note || `Status updated from ${b.status} to ${status}.`
        });

        auditLogs.push({
          action: "status_transition",
          timestamp: new Date().toISOString(),
          performedBy,
          details: `Transitioned booking status from ${b.status} to ${status}. Note: ${note}`
        });

        if (status === "cancelled" || status === "rejected") {
          await supabase.rpc("release_inventory_for_booking", { p_booking_id: bookingId });
          const { data: items } = await supabase.from("booking_items").select("product_id").eq("booking_id", bookingId);
          if (items) {
            for (const item of items) {
              this.checkAndNotifyWaitlist(item.product_id, b.start_date, b.end_date).catch(e => console.error(e));
            }
          }
        }

        let paymentStatus = b.payment_status;
        if (status === "paid" || status === "approval_pending") {
          paymentStatus = "paid";
        }

        await supabase
          .from("bookings")
          .update({
            status,
            payment_status: paymentStatus,
            status_history: statusHistory,
            audit_logs: auditLogs,
          })
          .eq("id", bookingId);

        const updatedBooking = await this.getBookingById(bookingId);
        if (updatedBooking && typeof window === "undefined") {
          import("@/lib/email/mailer").then((m) => {
            if (status === "approved") {
              m.sendBookingApproved(updatedBooking).catch(err => console.error("Approved email failed:", err));
            } else if (status === "rejected") {
              m.sendBookingRejected(updatedBooking, note).catch(err => console.error("Rejected email failed:", err));
            } else if (status === "cancelled") {
              m.sendBookingCancelled(updatedBooking).catch(err => console.error("Cancelled email failed:", err));
            }
          });
        }
        return updatedBooking;
      }
    }

    // Mock
    const bookings = getLocalBookings();
    const idx = bookings.findIndex((b) => b.id === bookingId);
    if (idx === -1) return null;

    const oldStatus = bookings[idx].status;
    bookings[idx].status = status;
    
    if (status === "paid" || status === "approval_pending") {
      bookings[idx].paymentStatus = "paid";
    } else if (status === "cancelled" || status === "rejected") {
      bookings[idx].items = bookings[idx].items.map(item => ({ ...item, inventoryUnitId: undefined }));
      for (const item of bookings[idx].items) {
        this.checkAndNotifyWaitlist(item.productId, bookings[idx].startDate, bookings[idx].endDate).catch(e => console.error(e));
      }
    }

    bookings[idx].statusHistory.push({
      status,
      timestamp: new Date().toISOString(),
      note: note || `Status updated from ${oldStatus} to ${status}.`
    });

    bookings[idx].auditLogs.push({
      action: "status_transition",
      timestamp: new Date().toISOString(),
      performedBy,
      details: `Transitioned booking status from ${oldStatus} to ${status}. Note: ${note}`
    });

    const updatedBooking = bookings[idx];
    if (typeof window === "undefined") {
      import("@/lib/email/mailer").then((m) => {
        if (status === "approved") {
          m.sendBookingApproved(updatedBooking).catch(err => console.error("Approved email failed:", err));
        } else if (status === "rejected") {
          m.sendBookingRejected(updatedBooking, note).catch(err => console.error("Rejected email failed:", err));
        } else if (status === "cancelled") {
          m.sendBookingCancelled(updatedBooking).catch(err => console.error("Cancelled email failed:", err));
        }
      });
    }
    saveLocalBookings([...bookings]);
    return bookings[idx];
  },

  async acceptAgreement(bookingId: string, ip: string): Promise<Booking | null> {
    if (isSupabaseConfigured()) {
      const supabase = await getSupabase();
      const { data: b, error } = await supabase.from("bookings").select("*").eq("id", bookingId).single();
      if (!error && b) {
        if (b.status !== "approved") {
          throw new Error("Rental agreement can only be accepted after the booking has been approved by administration.");
        }

        const pickupOTP = String(Math.floor(100000 + Math.random() * 900000));
        const statusHistory = b.status_history || [];
        const auditLogs = b.audit_logs || [];

        statusHistory.push({
          status: "ready_for_pickup",
          timestamp: new Date().toISOString(),
          note: "Renter signed digital agreement. Handover OTP generated."
        });

        auditLogs.push({
          action: "agreement_signed",
          timestamp: new Date().toISOString(),
          performedBy: "customer",
          details: `Renter accepted terms and signed agreement from IP ${ip}. OTP: ${pickupOTP}`
        });

        await supabase
          .from("bookings")
          .update({
            agreement_accepted: true,
            agreement_accepted_at: new Date().toISOString(),
            agreement_ip: ip || "127.0.0.1",
            pickup_otp: pickupOTP,
            status: "ready_for_pickup",
            status_history: statusHistory,
            audit_logs: auditLogs,
          })
          .eq("id", bookingId);

        const updated = await this.getBookingById(bookingId);
        if (updated && typeof window === "undefined") {
          import("@/lib/email/mailer").then((m) => {
            m.sendPickupOTP(updated, pickupOTP).catch(err => console.error("OTP email failed:", err));
          });
        }
        return updated;
      }
    }

    // Mock
    const bookings = getLocalBookings();
    const idx = bookings.findIndex((b) => b.id === bookingId);
    if (idx === -1) return null;

    const booking = bookings[idx];
    if (booking.status !== "approved") {
      throw new Error("Rental agreement can only be accepted after the booking has been approved by administration.");
    }

    const pickupOTP = String(Math.floor(100000 + Math.random() * 900000));
    bookings[idx].agreementAccepted = true;
    bookings[idx].agreementAcceptedAt = new Date().toISOString();
    bookings[idx].agreementIP = ip || "127.0.0.1";
    bookings[idx].pickupOTP = pickupOTP;
    bookings[idx].status = "ready_for_pickup";

    bookings[idx].statusHistory.push({
      status: "ready_for_pickup",
      timestamp: new Date().toISOString(),
      note: "Renter signed digital agreement. Handover OTP generated."
    });

    bookings[idx].auditLogs.push({
      action: "agreement_signed",
      timestamp: new Date().toISOString(),
      performedBy: "customer",
      details: `Renter accepted terms and signed agreement from IP ${ip}. OTP: ${pickupOTP}`
    });

    const updated = bookings[idx];
    if (typeof window === "undefined") {
      import("@/lib/email/mailer").then((m) => {
        m.sendPickupOTP(updated, pickupOTP).catch(err => console.error("OTP email failed:", err));
      });
    }
    saveLocalBookings(bookings);
    return bookings[idx];
  },

  async confirmHandover(
    bookingId: string,
    otp: string,
    remarks: string,
    serialVerified: boolean
  ): Promise<Booking | null> {
    if (isSupabaseConfigured()) {
      const supabase = await getSupabase();
      const booking = await this.getBookingById(bookingId);
      if (booking) {
        if (booking.pickupOTP !== otp) throw new Error("Invalid pickup OTP code.");
        if (!serialVerified) throw new Error("Handover checklist error: Equipment serial numbers must be physically verified before handover.");

        // Set units status to rented
        const assignedUnits = booking.items.map(item => item.inventoryUnitId).filter(Boolean) as string[];
        for (const uId of assignedUnits) {
          await supabase.from("inventory_units").update({ status: "rented" }).eq("id", uId);
        }

        const statusHistory = booking.statusHistory || [];
        const auditLogs = booking.auditLogs || [];

        statusHistory.push({
          status: "rented",
          timestamp: new Date().toISOString(),
          note: `Equipment handed over to customer. Remarks: ${remarks}`
        });

        auditLogs.push({
          action: "equipment_handover",
          timestamp: new Date().toISOString(),
          performedBy: "admin",
          details: `Verified pickup OTP successfully. Transferred gear serial numbers ${assignedUnits.join(", ")} to customer.`
        });

        await supabase
          .from("bookings")
          .update({
            status: "rented",
            pickup_remarks: remarks,
            pickup_handover_at: new Date().toISOString(),
            pickup_condition_photos: ["https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=400&q=80"],
            status_history: statusHistory,
            audit_logs: auditLogs,
          })
          .eq("id", bookingId);

        return await this.getBookingById(bookingId);
      }
    }

    // Mock
    const bookings = getLocalBookings();
    const idx = bookings.findIndex((b) => b.id === bookingId);
    if (idx === -1) return null;

    const booking = bookings[idx];
    if (booking.pickupOTP !== otp) {
      throw new Error("Invalid pickup OTP code.");
    }
    if (!serialVerified) {
      throw new Error("Handover checklist error: Equipment serial numbers must be physically verified before handover.");
    }

    bookings[idx].status = "rented";
    bookings[idx].pickupRemarks = remarks;
    bookings[idx].pickupHandoverAt = new Date().toISOString();
    bookings[idx].pickupConditionPhotos = [
      "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=400&q=80"
    ];

    const assignedUnits = booking.items.map(item => item.inventoryUnitId).filter(Boolean) as string[];
    const units = await this.getInventoryUnits();
    assignedUnits.forEach((uId) => {
      const uIdx = units.findIndex(u => u.id === uId);
      if (uIdx !== -1) {
        units[uIdx].status = "rented";
      }
    });

    bookings[idx].statusHistory.push({
      status: "rented",
      timestamp: new Date().toISOString(),
      note: `Equipment handed over to customer. Remarks: ${remarks}`
    });

    bookings[idx].auditLogs.push({
      action: "equipment_handover",
      timestamp: new Date().toISOString(),
      performedBy: "admin",
      details: `Verified pickup OTP successfully. Transferred gear serial numbers ${assignedUnits.join(", ")} to customer.`
    });

    saveLocalInventoryUnits(units);
    saveLocalBookings(bookings);
    return bookings[idx];
  },

  async processReturn(
    bookingId: string,
    condition: "good" | "damaged",
    damageDescription?: string,
    damageCost?: number,
    remarks: string = "",
    lateFeeOverride?: number
  ): Promise<Booking | null> {
    if (isSupabaseConfigured()) {
      const supabase = await getSupabase();
      const booking = await this.getBookingById(bookingId);
      if (booking) {
        const today = new Date();
        today.setHours(0,0,0,0);
        const expectedReturn = new Date(booking.endDate);
        expectedReturn.setHours(0,0,0,0);

        let lateFee = 0;
        if (lateFeeOverride !== undefined) {
          lateFee = lateFeeOverride;
        } else if (today > expectedReturn) {
          const diffTime = today.getTime() - expectedReturn.getTime();
          const overdueDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          lateFee = overdueDays * 999;
        }

        const cost = damageCost || 0;
        const totalDeductions = lateFee + cost;

        // depositStatus removed

        const assignedUnits = booking.items.map((item) => item.inventoryUnitId).filter(Boolean) as string[];
        for (const uId of assignedUnits) {
          if (condition === "damaged") {
            await supabase.from("inventory_units").update({ status: "maintenance" }).eq("id", uId);
          } else {
            await supabase.from("inventory_units").update({ status: "available" }).eq("id", uId);
          }
        }

        if (condition !== "damaged") {
          for (const item of booking.items) {
            this.checkAndNotifyWaitlist(item.productId, booking.startDate, booking.endDate).catch(e => console.error(e));
          }
        }

        const statusHistory = booking.statusHistory || [];
        const auditLogs = booking.auditLogs || [];

        statusHistory.push({
          status: "completed",
          timestamp: new Date().toISOString(),
          note: `Return processed. Condition: ${condition}. Late fee: ₹${lateFee}, Damage: ₹${cost}.`
        });

        auditLogs.push({
          action: "return_inspection",
          timestamp: new Date().toISOString(),
          performedBy: "admin",
          details: `Returned gear condition: ${condition.toUpperCase()}. Late Fee: ₹${lateFee}, Damage Cost: ₹${cost}.`
        });

        await supabase
          .from("bookings")
          .update({
            status: "completed",
            late_fee: lateFee,
            damage_description: damageDescription || "",
            damage_cost: cost,
            return_remarks: remarks,
            return_inspection_at: new Date().toISOString(),
            return_condition_photos: ["https://images.unsplash.com/photo-1453974336185-b58122a72a11?auto=format&fit=crop&w=400&q=80"],
            status_history: statusHistory,
            audit_logs: auditLogs,
          })
          .eq("id", bookingId);

        const updated = await this.getBookingById(bookingId);
        if (updated && typeof window === "undefined") {
          import("@/lib/email/mailer").then((m) => {
            if (totalDeductions > 0) {
              const type = (lateFee > 0 && cost > 0) ? "both" : (lateFee > 0 ? "late" : "damage");
              m.sendLateReturnDamageCharge(updated, type, totalDeductions, `${damageDescription || ''} ${remarks || ''}`).then(() => {
                m.sendBookingCompletion(updated).catch(e => console.error(e));
              });
            } else {
              m.sendBookingCompletion(updated).catch(e => console.error(e));
            }
          });
        }
        return updated;
      }
    }

    // Mock
    const bookings = getLocalBookings();
    const idx = bookings.findIndex((b) => b.id === bookingId);
    if (idx === -1) return null;

    const booking = bookings[idx];
    const today = new Date();
    today.setHours(0,0,0,0);
    const expectedReturn = new Date(booking.endDate);
    expectedReturn.setHours(0,0,0,0);

    let lateFee = 0;
    if (lateFeeOverride !== undefined) {
      lateFee = lateFeeOverride;
    } else if (today > expectedReturn) {
      const diffTime = today.getTime() - expectedReturn.getTime();
      const overdueDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      lateFee = overdueDays * 999;
    }

    const cost = damageCost || 0;
    const totalDeductions = lateFee + cost;
    
    bookings[idx].status = "completed";
    bookings[idx].lateFee = lateFee;
    bookings[idx].damageDescription = damageDescription || "";
    bookings[idx].damageCost = cost;
    bookings[idx].returnRemarks = remarks;
    bookings[idx].returnInspectionAt = new Date().toISOString();
    bookings[idx].returnConditionPhotos = [
      "https://images.unsplash.com/photo-1453974336185-b58122a72a11?auto=format&fit=crop&w=400&q=80"
    ];

    // depositStatus mock logic removed

    const assignedUnits = booking.items.map((item) => item.inventoryUnitId).filter(Boolean) as string[];
    const units = await this.getInventoryUnits();
    assignedUnits.forEach((uId) => {
      const uIdx = units.findIndex((u) => u.id === uId);
      if (uIdx !== -1) {
        if (condition === "damaged") {
          units[uIdx].status = "maintenance";
          units[uIdx].condition = "damaged";
        } else {
          units[uIdx].status = "available";
        }
      }
    });

    if (condition !== "damaged") {
      for (const item of booking.items) {
        this.checkAndNotifyWaitlist(item.productId, booking.startDate, booking.endDate).catch(e => console.error(e));
      }
    }

    bookings[idx].statusHistory.push({
      status: "completed",
      timestamp: new Date().toISOString(),
      note: `Return processed. Condition: ${condition}. Late fee: ₹${lateFee}, Damage: ₹${cost}.`
    });

    bookings[idx].auditLogs.push({
      action: "return_inspection",
      timestamp: new Date().toISOString(),
      performedBy: "admin",
      details: `Returned gear condition: ${condition.toUpperCase()}. Late Fee: ₹${lateFee}, Damage Cost: ₹${cost}.`
    });

    const updated = bookings[idx];
    if (typeof window === "undefined") {
      import("@/lib/email/mailer").then((m) => {
        if (totalDeductions > 0) {
          const type = (lateFee > 0 && cost > 0) ? "both" : (lateFee > 0 ? "late" : "damage");
          m.sendLateReturnDamageCharge(updated, type, totalDeductions, `${damageDescription || ''} ${remarks || ''}`).then(() => {
            m.sendBookingCompletion(updated).catch(e => console.error(e));
          });
        } else {
          m.sendBookingCompletion(updated).catch(e => console.error(e));
        }
      });
    }
    saveLocalInventoryUnits(units);
    saveLocalBookings(bookings);
    return bookings[idx];
  },

  async checkIdempotency(
    eventKey: string,
    providerEventId?: string,
    bookingId?: string,
    notificationType?: string
  ): Promise<boolean> {
    if (isSupabaseConfigured()) {
      const supabase = await getSupabase();
      const { data: existing } = await supabase
        .from("processed_events")
        .select("event_key")
        .eq("event_key", eventKey)
        .single();

      if (existing) {
        return true;
      }

      const { error } = await supabase
        .from("processed_events")
        .insert({
          event_key: eventKey,
          provider_event_id: providerEventId || null,
          booking_id: bookingId || null,
          notification_type: notificationType || null,
          status: "processed",
          attempt_count: 1
        });

      if (error) {
        return true;
      }
      return false;
    }
    return false;
  },

  async logProcessedEvent(
    eventKey: string,
    status: "processed" | "failed",
    attemptCount: number,
    providerEventId?: string,
    bookingId?: string,
    notificationType?: string
  ): Promise<void> {
    if (isSupabaseConfigured()) {
      const supabase = await getSupabase();
      await supabase
        .from("processed_events")
        .upsert({
          event_key: eventKey,
          provider_event_id: providerEventId || null,
          booking_id: bookingId || null,
          notification_type: notificationType || null,
          status,
          attempt_count: attemptCount,
          processed_at: new Date().toISOString()
        });
    }
  },

  // 5. Customer Profile
  async getProfile(): Promise<UserProfile> {
    if (isSupabaseConfigured()) {
      const supabase = await getSupabase();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data, error } = await supabase.from("profiles").select("*").eq("id", user.id).single();
        if (!error && data) {
          return {
            id: data.id,
            fullName: data.full_name,
            email: data.email,
            phone: data.phone || "",
            role: data.role || "customer",
            avatarUrl: data.avatar_url || "",
          };
        }
      }
    }
    return getLocalProfile();
  },

  async updateProfile(profile: Partial<UserProfile>): Promise<UserProfile> {
    if (isSupabaseConfigured()) {
      const supabase = await getSupabase();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data, error } = await supabase
          .from("profiles")
          .update({
            full_name: profile.fullName,
            phone: profile.phone,
            avatar_url: profile.avatarUrl,
          })
          .eq("id", user.id)
          .select()
          .single();

        if (!error && data) {
          return {
            id: data.id,
            fullName: data.full_name,
            email: data.email,
            phone: data.phone || "",
            role: data.role || "customer",
            avatarUrl: data.avatar_url || "",
          };
        }
      }
    }

    const current = getLocalProfile();
    const updated = { ...current, ...profile };
    saveLocalProfile(updated);
    return updated;
  },

  // 6. Testimonials & FAQs & Coupon Codes
  async getTestimonials(): Promise<Testimonial[]> {
    let testimonials: Testimonial[] = [];
    if (isSupabaseConfigured()) {
      const supabase = await getSupabase();
      const { data, error } = await supabase.from("testimonials").select("*");
      if (!error && data) {
        testimonials = data.map((t: any) => ({
          id: t.id,
          authorName: t.author_name,
          authorTitle: t.author_title,
          quote: t.quote,
          rating: Number(t.rating || 5),
          avatarUrl: t.avatar_url,
        }));
      }
    } else {
      testimonials = getLocalTestimonials();
    }

    if (this.getPreviewMode()) {
      const drafts = await this.getDrafts("testimonial");
      testimonials = testimonials.map((t) => {
        const draft = drafts.find((d) => d.item_id === t.id);
        return draft ? { ...t, ...draft.draft_data } : t;
      });
    }
    return testimonials;
  },

  async getFAQs(): Promise<FAQ[]> {
    let faqs: FAQ[] = [];
    if (isSupabaseConfigured()) {
      const supabase = await getSupabase();
      const { data, error } = await supabase.from("faqs").select("*");
      if (!error && data) faqs = data;
    } else {
      faqs = getLocalFAQs();
    }

    if (this.getPreviewMode()) {
      const drafts = await this.getDrafts("faq");
      faqs = faqs.map((f) => {
        const draft = drafts.find((d) => d.item_id === f.id);
        return draft ? { ...f, ...draft.draft_data } : f;
      });
    }
    return faqs;
  },

  async getCoupon(code: string): Promise<Coupon | null> {
    if (this.getPreviewMode()) {
      const draft = await this.getDraft("coupon", code);
      if (draft) return draft.draft_data;
    }

    if (isSupabaseConfigured()) {
      const supabase = await getSupabase();
      const { data, error } = await supabase
        .from("coupons")
        .select("*")
        .eq("code", code.toUpperCase())
        .eq("is_active", true)
        .single();
      if (!error && data) {
        return {
          id: data.id,
          code: data.code,
          discountPercent: Number(data.discount_percent || 0),
          discountFlat: Number(data.discount_flat || 0),
          isActive: data.is_active,
          activeUntil: data.valid_until || data.active_until || "",
          activationDate: data.activation_date || "",
          usageLimit: data.usage_limit || 100,
          perUserLimit: data.per_user_limit || 1,
        };
      }
    }
    const coupons = getLocalCoupons();
    const coupon = coupons.find(
      (c) => c.code.toUpperCase() === code.toUpperCase() && c.isActive
    );
    return coupon || null;
  },


  // 7. Advanced Admin Analytics Report
  async getAdminStats(): Promise<{
    revenueTotal: number;
    revenueMonth: number;
    bookingsTotalCount: number;
    bookingsPendingCount: number;
    bookingsConfirmedCount: number;
    activeRentalsCount: number;
    inventoryTotal: number;
    inventoryRented: number;
    inventoryAvailable: number;
    revenueByCategory: { category: string; value: number }[];
    revenueByBrand: { brand: string; value: number }[];
    revenueTrend: { date: string; amount: number }[];
    utilizationRate: number;
    revenuePerCamera: Record<string, number>;
    couponPerformance: Record<string, number>;
    waitlistCount: number;
  }> {
    const bookings = await this.getBookings();
    const paidBookings = bookings.filter((b) => b.paymentStatus === "paid" && b.status !== "cancelled" && b.status !== "rejected");
    
    const revenueTotal = paidBookings.reduce((sum, b) => sum + b.totalPayable, 0);

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const revenueMonth = paidBookings
      .filter((b) => new Date(b.createdAt) >= startOfMonth)
      .reduce((sum, b) => sum + b.totalPayable, 0);

    const bookingsTotalCount = bookings.length;
    const bookingsPendingCount = bookings.filter((b) => b.status === "pending_payment").length;
    const bookingsConfirmedCount = bookings.filter((b) => b.status === "approved" || b.status === "ready_for_pickup").length;
    
    const activeRentalsCount = bookings.filter((b) => b.status === "rented").length;

    // Physical units stats
    const units = await this.getInventoryUnits();
    const inventoryTotal = units.length;
    const inventoryRented = units.filter((u) => u.status === "rented").length;
    const inventoryAvailable = units.filter((u) => u.status === "available").length;

    // Revenue by category mapping
    const catMap: Record<string, number> = {};
    for (const b of paidBookings) {
      for (const item of b.items) {
        const prod = await this.getProductById(item.productId);
        const cat = MOCK_CATEGORIES.find((c) => c.id === prod?.categoryId);
        if (cat) {
          catMap[cat.name] = (catMap[cat.name] || 0) + (item.quantity * item.unitPrice);
        }
      }
    }
    const revenueByCategory = Object.entries(catMap).map(([category, value]) => ({ category, value }));

    // Revenue by brand
    const brandMap: Record<string, number> = {};
    for (const b of paidBookings) {
      for (const item of b.items) {
        const prod = await this.getProductById(item.productId);
        const brand = MOCK_BRANDS.find((br) => br.id === prod?.brandId);
        if (brand) {
          brandMap[brand.name] = (brandMap[brand.name] || 0) + (item.quantity * item.unitPrice);
        }
      }
    }
    const revenueByBrand = Object.entries(brandMap).map(([brand, value]) => ({ brand, value }));

    // Daily Revenue trend
    const trendMap: Record<string, number> = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      trendMap[dateStr] = 0;
    }

    paidBookings.forEach((b) => {
      const bDate = new Date(b.createdAt);
      const dateStr = bDate.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      if (dateStr in trendMap) {
        trendMap[dateStr] += b.totalPayable;
      }
    });

    const revenueTrend = Object.entries(trendMap).map(([date, amount]) => ({ date, amount }));
    const utilizationRate = Math.round((inventoryRented / inventoryTotal) * 100) || 0;

    // Additional operations statistics
    const revenuePerCamera: Record<string, number> = {
      "p1000000-0000-0000-0000-000000000001": 0, // Canon
      "p1000000-0000-0000-0000-000000000003": 0  // Nikon
    };
    paidBookings.forEach((b) => {
      b.items.forEach((item) => {
        const itemRev = item.unitPrice * item.quantity;
        revenuePerCamera[item.productId] = (revenuePerCamera[item.productId] || 0) + itemRev;
      });
    });

    const couponPerformance: Record<string, number> = {};
    paidBookings.forEach((b) => {
      if (b.couponApplied) {
        couponPerformance[b.couponApplied] = (couponPerformance[b.couponApplied] || 0) + 1;
      }
    });

    const waitlist = await this.getWaitlist();
    const waitlistCount = waitlist.length;

    return {
      revenueTotal,
      revenueMonth,
      bookingsTotalCount,
      bookingsPendingCount,
      bookingsConfirmedCount,
      activeRentalsCount,
      inventoryTotal,
      inventoryRented,
      inventoryAvailable,
      revenueByCategory,
      revenueByBrand,
      revenueTrend,
      utilizationRate,
      revenuePerCamera,
      couponPerformance,
      waitlistCount,
    };
  },

  async getInventoryUnits(): Promise<InventoryUnit[]> {
    if (isSupabaseConfigured()) {
      const supabase = await getSupabase();
      const { data, error } = await supabase.from("inventory_units").select("*");
      if (!error && data) {
        return data.map((u: any) => ({
          id: u.id,
          productId: u.product_id,
          serialNumber: u.serial_number,
          name: u.serial_number === "CN-CAM-01" ? "Canon Camera 1" : u.serial_number === "CN-CAM-02" ? "Canon Camera 2" : "Nikon Camera 1",
          status: u.status,
          condition: u.status === "maintenance" ? "damaged" : "excellent",
        }));
      }
    }
    return getLocalInventoryUnits();
  },

  async updateInventoryUnitStatus(unitId: string, status: InventoryUnit["status"]): Promise<InventoryUnit | null> {
    if (isSupabaseConfigured()) {
      const supabase = await getSupabase();
      const { data, error } = await supabase
        .from("inventory_units")
        .update({ status })
        .eq("id", unitId)
        .select()
        .single();
      if (!error && data) {
        return {
          id: data.id,
          productId: data.product_id,
          serialNumber: data.serial_number,
          name: data.serial_number === "CN-CAM-01" ? "Canon Camera 1" : data.serial_number === "CN-CAM-02" ? "Canon Camera 2" : "Nikon Camera 1",
          status: data.status,
          condition: data.status === "maintenance" ? "damaged" : "excellent",
        };
      }
    }

    const units = getLocalInventoryUnits();
    const idx = units.findIndex((u) => u.id === unitId);
    if (idx === -1) return null;
    units[idx].status = status;
    saveLocalInventoryUnits(units);
    return units[idx];
  },

  async assignAvailableUnit(bookingId: string): Promise<boolean> {
    if (isSupabaseConfigured()) {
      const supabase = await getSupabase();
      const { data: assigned, error: rpcErr } = await supabase.rpc("reserve_inventory_for_booking", { p_booking_id: bookingId });
      if (rpcErr || !assigned) {
        console.error("RPC reserve_inventory_for_booking failed:", rpcErr);
        return false;
      }

      const { data: b } = await supabase.from("bookings").select("status_history, audit_logs").eq("id", bookingId).single();
      const statusHistory = b?.status_history || [];
      const auditLogs = b?.audit_logs || [];

      statusHistory.push({
        status: "approval_pending",
        timestamp: new Date().toISOString(),
        note: "Payment confirmed. Booking submitted for admin approval."
      });

      auditLogs.push({
        action: "payment_received",
        timestamp: new Date().toISOString(),
        performedBy: "razorpay_system",
        details: "Razorpay payment signature verified. Placed reservation into Approval Pending tab."
      });

      const { error: updErr } = await supabase
        .from("bookings")
        .update({
          status: "approval_pending",
          payment_status: "paid",
          status_history: statusHistory,
          audit_logs: auditLogs,
        })
        .eq("id", bookingId);

      if (updErr) {
        console.error("Failed to update status after unit assignment:", updErr);
        return false;
      }

      const updated = await this.getBookingById(bookingId);
      if (updated && typeof window === "undefined") {
        import("@/lib/email/mailer").then((m) => {
          m.sendPaymentReceived(updated).catch((e) => console.error("Payment received email failed:", e));
        });
      }

      return true;
    }

    // Mock
    const bookings = getLocalBookings();
    const bIdx = bookings.findIndex((b) => b.id === bookingId);
    if (bIdx === -1) return false;

    const booking = bookings[bIdx];
    const start = new Date(booking.startDate);
    const end = new Date(booking.endDate);

    const updatedItems = [...booking.items];

    for (let i = 0; i < updatedItems.length; i++) {
      const item = updatedItems[i];
      const units = (await this.getInventoryUnits()).filter(
        (u) => u.productId === item.productId && u.status !== "decommissioned" && u.status !== "maintenance"
      );

      const overlappingBookings = bookings.filter(
        (ob) =>
          ob.id !== bookingId &&
          (["paid", "approval_pending", "approved", "ready_for_pickup", "rented", "returned", "completed", "overdue"].includes(ob.status)) &&
          new Date(ob.startDate) <= end &&
          new Date(ob.endDate) >= start
      );

      const freeUnit = units.find((unit) => {
        return !overlappingBookings.some((ob) =>
          ob.items.some((oi) => oi.productId === item.productId && oi.inventoryUnitId === unit.id)
        );
      });

      if (!freeUnit) return false;

      updatedItems[i] = {
        ...item,
        inventoryUnitId: freeUnit.id,
      };
    }

    bookings[bIdx].items = updatedItems;
    bookings[bIdx].status = "approval_pending";
    bookings[bIdx].paymentStatus = "paid";
    
    bookings[bIdx].statusHistory.push({
      status: "approval_pending",
      timestamp: new Date().toISOString(),
      note: "Payment confirmed. Booking submitted for admin approval."
    });

    bookings[bIdx].auditLogs.push({
      action: "payment_received",
      timestamp: new Date().toISOString(),
      performedBy: "razorpay_system",
      details: "Razorpay payment signature verified. Placed reservation into Approval Pending tab."
    });

    const updated = bookings[bIdx];
    if (typeof window === "undefined") {
      import("@/lib/email/mailer").then((m) => {
        m.sendPaymentReceived(updated).catch((e) => console.error("Payment received email failed:", e));
      });
    }
    saveLocalBookings(bookings);
    return true;
  },

  async reassignBookingUnit(bookingId: string, productId: string, newUnitId: string): Promise<boolean> {
    if (isSupabaseConfigured()) {
      const supabase = await getSupabase();
      const { error } = await supabase
        .from("booking_items")
        .update({ inventory_unit_id: newUnitId })
        .eq("booking_id", bookingId)
        .eq("product_id", productId);

      if (!error) {
        const { data: b } = await supabase.from("bookings").select("audit_logs").eq("id", bookingId).single();
        const auditLogs = b?.audit_logs || [];
        auditLogs.push({
          action: "unit_reassignment",
          timestamp: new Date().toISOString(),
          performedBy: "admin",
          details: `Reassigned camera unit for product ${productId} to serial ${newUnitId}.`
        });
        await supabase.from("bookings").update({ audit_logs: auditLogs }).eq("id", bookingId);
        return true;
      }
      return false;
    }

    // Mock
    const bookings = getLocalBookings();
    const bIdx = bookings.findIndex((b) => b.id === bookingId);
    if (bIdx === -1) return false;

    const booking = bookings[bIdx];
    const start = new Date(booking.startDate);
    const end = new Date(booking.endDate);

    const overlapping = bookings.filter(
      (ob) =>
        ob.id !== bookingId &&
        (["paid", "approval_pending", "approved", "ready_for_pickup", "rented", "returned", "completed", "overdue"].includes(ob.status)) &&
        new Date(ob.startDate) <= end &&
        new Date(ob.endDate) >= start
    );

    const isUnitBooked = overlapping.some((ob) =>
      ob.items.some((oi) => oi.productId === productId && oi.inventoryUnitId === newUnitId)
    );

    if (isUnitBooked) return false;

    const updatedItems = booking.items.map((item) => {
      if (item.productId === productId) {
        return { ...item, inventoryUnitId: newUnitId };
      }
      return item;
    });

    bookings[bIdx].items = updatedItems;
    bookings[bIdx].auditLogs.push({
      action: "unit_reassignment",
      timestamp: new Date().toISOString(),
      performedBy: "admin",
      details: `Reassigned camera unit for product ${productId} to serial ${newUnitId}.`
    });

    saveLocalBookings(bookings);
    return true;
  },

  // ─── WAITLIST METHODS ──────────────────────────────────────────────────
  async addToWaitlist(entry: { productId: string; name: string; email: string; phone: string; startDate?: string; endDate?: string }): Promise<WaitlistEntry> {
    const newEntry: WaitlistEntry = {
      id: `wl-${Math.random().toString(36).substring(2, 11)}`,
      productId: entry.productId,
      name: entry.name,
      email: entry.email,
      phone: entry.phone,
      status: "pending",
      startDate: entry.startDate,
      endDate: entry.endDate,
      createdAt: new Date().toISOString()
    };

    if (isSupabaseConfigured()) {
      const supabase = await getSupabase();
      const { data, error } = await supabase
        .from("waitlist")
        .insert({
          product_id: entry.productId,
          name: entry.name,
          email: entry.email,
          phone: entry.phone,
          status: "pending",
          start_date: entry.startDate,
          end_date: entry.endDate
        })
        .select()
        .single();
      if (!error && data) {
        return {
          id: data.id,
          productId: data.product_id,
          name: data.name,
          email: data.email,
          phone: data.phone,
          status: data.status,
          startDate: data.start_date,
          endDate: data.end_date,
          createdAt: data.created_at
        };
      }
    }

    const waitlist = getLocalWaitlist();
    waitlist.push(newEntry);
    saveLocalWaitlist(waitlist);
    return newEntry;
  },

  async getWaitlist(productId?: string): Promise<WaitlistEntry[]> {
    if (isSupabaseConfigured()) {
      const supabase = await getSupabase();
      let query = supabase.from("waitlist").select("*");
      if (productId) {
        query = query.eq("product_id", productId);
      }
      const { data, error } = await query;
      if (!error && data) {
        return data.map((d: any) => ({
          id: d.id,
          productId: d.product_id,
          name: d.name,
          email: d.email,
          phone: d.phone,
          status: d.status,
          startDate: d.start_date,
          endDate: d.end_date,
          createdAt: d.created_at
        }));
      }
    }

    const waitlist = getLocalWaitlist();
    if (productId) {
      return waitlist.filter((w) => w.productId === productId);
    }
    return waitlist;
  },

  async resolveWaitlist(waitlistId: string, status: "notified" | "cancelled" = "notified"): Promise<boolean> {
    if (isSupabaseConfigured()) {
      const supabase = await getSupabase();
      const { error } = await supabase
        .from("waitlist")
        .update({ status })
        .eq("id", waitlistId);
      return !error;
    }

    const waitlist = getLocalWaitlist();
    const idx = waitlist.findIndex((w) => w.id === waitlistId);
    if (idx !== -1) {
      waitlist[idx].status = status;
      saveLocalWaitlist(waitlist);
      return true;
    }
    return false;
  },

  async purgeExpiredWaitlist(): Promise<void> {
    const todayStr = new Date().toISOString().split("T")[0];
    if (isSupabaseConfigured()) {
      const supabase = await getSupabase();
      await supabase
        .from("waitlist")
        .delete()
        .lt("end_date", todayStr);
    }
    const waitlist = getLocalWaitlist();
    const active = waitlist.filter((w) => !w.endDate || w.endDate >= todayStr);
    saveLocalWaitlist(active);
  },

  async checkAndNotifyWaitlist(productId: string, startDate: string, endDate: string): Promise<void> {
    const list = await this.getWaitlist(productId);
    const pendingList = list.filter((w) => w.status === "pending");
    
    for (const entry of pendingList) {
      if (entry.startDate && entry.endDate) {
        const overlap = (new Date(entry.startDate) <= new Date(endDate)) && (new Date(entry.endDate) >= new Date(startDate));
        if (overlap) {
          const { available } = await this.checkAvailability(productId, entry.startDate, entry.endDate);
          if (available) {
            await this.resolveWaitlist(entry.id, "notified");
            
            if (typeof window === "undefined") {
              const { sendEmail } = await import("@/lib/email/mailer");
              const p = MOCK_PRODUCTS.find((x) => x.id === productId);
              const name = p ? p.name : "Camera";
              
              const subject = `AUREVIA Gear Available: ${name}`;
              const text = `Hello ${entry.name},\n\nGood news! The ${name} you were waitlisted for is now available for your requested dates: ${entry.startDate} to ${entry.endDate}.\n\nVisit our site and book it now before it gets reserved!\n\nBest regards,\nAUREVIA Concierge`;
              const html = `<div style="background-color:#080808;color:#F5F1E8;font-family:Georgia,serif;padding:30px;border:1px solid #D8B36A;">
                <h2 style="color:#D8B36A;text-transform:uppercase;letter-spacing:0.1em;">AUREVIA Gear Available</h2>
                <p>Hello ${entry.name},</p>
                <p>Good news! The <strong>${name}</strong> you were waitlisted for is now available for your requested dates: <strong>${entry.startDate} to ${entry.endDate}</strong>.</p>
                <p>Reserve it now on our platform before it gets booked again.</p>
                <p><a href="http://localhost:3000/gear/${p?.slug || ''}" style="color:#D8B36A;text-decoration:underline;">Book ${name} Now</a></p>
                <p style="color:#9A9995;font-size:11px;margin-top:20px;">This is an automated alert based on your waitlist request.</p>
              </div>`;
              
              await sendEmail({
                to: entry.email,
                subject,
                text,
                html,
                bookingId: entry.id,
                notificationType: "waitlist_alert"
              }).catch(e => console.error("Waitlist email failed:", e));
            }
          }
        }
      }
    }
  },

  // ─── REVIEWS METHODS ───────────────────────────────────────────────────
  async getReviews(productId?: string, approvedOnly = true): Promise<Review[]> {
    if (isSupabaseConfigured()) {
      const supabase = await getSupabase();
      let query = supabase.from("reviews").select("*");
      if (productId) {
        query = query.eq("product_id", productId);
      }
      if (approvedOnly) {
        query = query.eq("is_approved", true);
      }
      const { data, error } = await query;
      if (!error && data) {
        return data.map((d: any) => ({
          id: d.id,
          productId: d.product_id,
          authorName: d.author_name,
          rating: d.rating,
          quote: d.quote,
          isApproved: d.is_approved,
          createdAt: d.created_at
        }));
      }
    }

    const reviews = getLocalReviews();
    let filtered = reviews;
    if (productId) {
      filtered = filtered.filter((r) => r.productId === productId);
    }
    if (approvedOnly) {
      filtered = filtered.filter((r) => r.isApproved);
    }
    return filtered;
  },

  async submitReview(entry: { productId: string; authorName: string; rating: number; quote: string }): Promise<Review> {
    const newReview: Review = {
      id: `rev-${Math.random().toString(36).substring(2, 11)}`,
      productId: entry.productId,
      authorName: entry.authorName,
      rating: entry.rating,
      quote: entry.quote,
      isApproved: false, // Moderated by default
      createdAt: new Date().toISOString()
    };

    if (isSupabaseConfigured()) {
      const supabase = await getSupabase();
      const { data, error } = await supabase
        .from("reviews")
        .insert({
          product_id: entry.productId,
          author_name: entry.authorName,
          rating: entry.rating,
          quote: entry.quote,
          is_approved: false
        })
        .select()
        .single();
      if (!error && data) {
        return {
          id: data.id,
          productId: data.product_id,
          authorName: data.author_name,
          rating: data.rating,
          quote: data.quote,
          isApproved: data.is_approved,
          createdAt: data.created_at
        };
      }
    }

    const reviews = getLocalReviews();
    reviews.push(newReview);
    saveLocalReviews(reviews);
    return newReview;
  },

  async approveReview(reviewId: string): Promise<boolean> {
    if (isSupabaseConfigured()) {
      const supabase = await getSupabase();
      const { error } = await supabase
        .from("reviews")
        .update({ is_approved: true })
        .eq("id", reviewId);
      return !error;
    }

    const reviews = getLocalReviews();
    const idx = reviews.findIndex((r) => r.id === reviewId);
    if (idx !== -1) {
      reviews[idx].isApproved = true;
      saveLocalReviews(reviews);
      return true;
    }
    return false;
  },

  async deleteReview(reviewId: string): Promise<boolean> {
    if (isSupabaseConfigured()) {
      const supabase = await getSupabase();
      const { error } = await supabase
        .from("reviews")
        .delete()
        .eq("id", reviewId);
      return !error;
    }

    const reviews = getLocalReviews();
    const filtered = reviews.filter((r) => r.id !== reviewId);
    saveLocalReviews(filtered);
    return true;
  },

  // ─── BOOKED DATES INQUIRY ──────────────────────────────────────────────
  async getBookedDates(productId: string): Promise<{ startDate: string; endDate: string }[]> {
    if (isSupabaseConfigured()) {
      const supabase = await getSupabase();
      const { data, error } = await (supabase
        .from("bookings")
        .select("start_date, end_date, booking_items!inner(product_id)") as any)
        .eq("booking_items.product_id", productId)
        .in("status", ["paid", "approval_pending", "approved", "ready_for_pickup", "rented", "returned", "completed", "overdue"]);
      
      if (!error && data) {
        return data.map((d: any) => ({
          startDate: d.start_date,
          endDate: d.end_date
        }));
      }
    }

    const bookings = getLocalBookings();
    return bookings
      .filter(
        (b) =>
          ["paid", "approval_pending", "approved", "ready_for_pickup", "rented", "returned", "completed", "overdue"].includes(b.status) &&
          b.items.some((item) => item.productId === productId)
      )
      .map((b) => ({
        startDate: b.startDate,
        endDate: b.endDate
      }));
  },

  async payPenalty(bookingId: string): Promise<boolean> {
    if (isSupabaseConfigured()) {
      const supabase = await getSupabase();
      const { error } = await supabase
        .from("bookings")
        .update({ penalty_payment_status: "paid" })
        .eq("id", bookingId);
      return !error;
    }
    const bookings = getLocalBookings();
    const idx = bookings.findIndex((b) => b.id === bookingId);
    if (idx !== -1) {
      bookings[idx].penaltyPaymentStatus = "paid";
      saveLocalBookings(bookings);
      return true;
    }
    return false;
  },

  async assessPenalty(bookingId: string, payload: { damageCost: number; lateFee: number; damageDescription: string }): Promise<boolean> {
    if (isSupabaseConfigured()) {
      const supabase = await getSupabase();
      const { error } = await supabase
        .from("bookings")
        .update({
          damage_cost: payload.damageCost,
          late_fee: payload.lateFee,
          damage_description: payload.damageDescription,
          penalty_payment_status: (payload.damageCost > 0 || payload.lateFee > 0) ? "unpaid" : "none"
        })
        .eq("id", bookingId);
      return !error;
    }
    const bookings = getLocalBookings();
    const idx = bookings.findIndex((b) => b.id === bookingId);
    if (idx !== -1) {
      bookings[idx].damageCost = payload.damageCost;
      bookings[idx].lateFee = payload.lateFee;
      bookings[idx].damageDescription = payload.damageDescription;
      bookings[idx].penaltyPaymentStatus = (payload.damageCost > 0 || payload.lateFee > 0) ? "unpaid" : "none";
      saveLocalBookings(bookings);
      return true;
    }
    return false;
  },

  // ----------------------------------------------------
  // CMS Drafts, Preview, Publish, Rollback
  // ----------------------------------------------------
  async saveDraft(itemType: string, itemId: string, draftData: any): Promise<boolean> {
    if (isSupabaseConfigured()) {
      const supabase = await getSupabase();
      const { error } = await supabase
        .from("content_drafts")
        .upsert({
          item_type: itemType,
          item_id: itemId,
          draft_data: draftData,
          updated_at: new Date().toISOString(),
        }, { onConflict: "item_type,item_id" });
      return !error;
    }
    const drafts = getLocalDrafts();
    const idx = drafts.findIndex((d) => d.item_type === itemType && d.item_id === itemId);
    if (idx !== -1) {
      drafts[idx].draft_data = draftData;
      drafts[idx].updated_at = new Date().toISOString();
    } else {
      drafts.push({
        id: `draft_${Date.now()}`,
        item_type: itemType,
        item_id: itemId,
        draft_data: draftData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    }
    saveLocalDrafts(drafts);
    return true;
  },

  async getDraft(itemType: string, itemId: string): Promise<any | null> {
    if (isSupabaseConfigured()) {
      const supabase = await getSupabase();
      const { data, error } = await supabase
        .from("content_drafts")
        .select("*")
        .eq("item_type", itemType)
        .eq("item_id", itemId)
        .maybeSingle();
      if (!error && data) return data;
      return null;
    }
    const drafts = getLocalDrafts();
    const draft = drafts.find((d) => d.item_type === itemType && d.item_id === itemId);
    return draft || null;
  },

  async getDrafts(itemType?: string): Promise<any[]> {
    if (isSupabaseConfigured()) {
      const supabase = await getSupabase();
      let query = supabase.from("content_drafts").select("*");
      if (itemType) {
        query = query.eq("item_type", itemType);
      }
      const { data, error } = await query;
      return error ? [] : data;
    }
    const drafts = getLocalDrafts();
    if (itemType) {
      return drafts.filter((d) => d.item_type === itemType);
    }
    return drafts;
  },

  async publishDraft(itemType: string, itemId: string, publishedBy = "admin"): Promise<boolean> {
    const draft = await this.getDraft(itemType, itemId);
    if (!draft) return false;

    const draftData = draft.draft_data;

    // Save history / backup current live before publishing
    let currentLive: any = null;
    if (itemType === "settings") {
      const liveVal = await this.getWebsiteSetting(itemId);
      currentLive = { value: liveVal };
    } else if (itemType === "product") {
      currentLive = await this.getProductById(itemId);
    } else if (itemType === "coupon") {
      currentLive = await this.getCoupon(itemId);
    } else if (itemType === "faq") {
      const faqs = await this.getFAQs();
      currentLive = faqs.find((f: any) => f.id === itemId) || null;
    } else if (itemType === "testimonial") {
      const testimonials = await this.getTestimonials();
      currentLive = testimonials.find((t: any) => t.id === itemId) || null;
    }

    if (currentLive) {
      if (isSupabaseConfigured()) {
        const supabase = await getSupabase();
        await supabase.from("content_history").insert({
          item_type: itemType,
          item_id: itemId,
          published_data: currentLive,
          published_by: publishedBy,
        });
      } else {
        const history = getLocalHistory();
        history.push({
          id: `hist_${Date.now()}`,
          item_type: itemType,
          item_id: itemId,
          published_data: currentLive,
          published_by: publishedBy,
          published_at: new Date().toISOString(),
        });
        saveLocalHistory(history);
      }
    }

    // Publish: Write draft data to actual tables
    if (isSupabaseConfigured()) {
      const supabase = await getSupabase();
      if (itemType === "settings") {
        await supabase.from("website_settings").upsert({
          key: itemId,
          value: typeof draftData === "object" ? JSON.stringify(draftData) : String(draftData),
        });
      } else if (itemType === "product") {
        await supabase.from("products").update({
          name: draftData.name,
          description: draftData.description,
          daily_price: draftData.dailyPrice || draftData.dailyPrice === 0 ? draftData.dailyPrice : draftData.daily_price,
          specs_json: draftData.specs,
        }).eq("id", itemId);
      } else if (itemType === "coupon") {
        // Find existing record or insert
        const { data: couponExists } = await supabase.from("coupons").select("id").eq("code", itemId).maybeSingle();
        if (couponExists) {
          await supabase.from("coupons").update({
            is_active: draftData.isActive,
            active_until: draftData.activeUntil,
          }).eq("code", itemId);
        } else {
          await supabase.from("coupons").insert({
            code: itemId,
            discount_percent: draftData.discountPercent || 0,
            discount_flat: draftData.discountFlat || 0,
            is_active: draftData.isActive,
            active_until: draftData.activeUntil,
          });
        }
      } else if (itemType === "faq") {
        await supabase.from("faqs").upsert({
          id: itemId,
          question: draftData.question,
          answer: draftData.answer,
          category: draftData.category,
        });
      } else if (itemType === "testimonial") {
        await supabase.from("testimonials").upsert({
          id: itemId,
          author_name: draftData.authorName,
          author_title: draftData.authorTitle,
          quote: draftData.quote,
          rating: draftData.rating,
        });
      }

      // Delete draft
      await supabase.from("content_drafts").delete().eq("item_type", itemType).eq("item_id", itemId);
    } else {
      // Mock publish
      if (itemType === "settings") {
        const settings = getLocalSettings();
        settings[itemId] = typeof draftData === "object" ? JSON.stringify(draftData) : String(draftData);
        saveLocalSettings(settings);
      } else if (itemType === "product") {
        const products = getLocalProducts();
        const pIdx = products.findIndex((p) => p.id === itemId);
        if (pIdx !== -1) {
          products[pIdx] = { ...products[pIdx], ...draftData };
          saveLocalProducts(products);
        }
      } else if (itemType === "coupon") {
        const coupons = getLocalCoupons();
        const cIdx = coupons.findIndex((c) => c.code.toUpperCase() === itemId.toUpperCase());
        if (cIdx !== -1) {
          coupons[cIdx] = { ...coupons[cIdx], ...draftData };
        } else {
          coupons.push({ id: `c_${Date.now()}`, code: itemId.toUpperCase(), ...draftData });
        }
        saveLocalCoupons(coupons);
      } else if (itemType === "faq") {
        const faqs = getLocalFAQs();
        const fIdx = faqs.findIndex((f) => f.id === itemId);
        if (fIdx !== -1) {
          faqs[fIdx] = { ...faqs[fIdx], ...draftData };
        } else {
          faqs.push({ id: itemId, ...draftData });
        }
        saveLocalFAQs(faqs);
      } else if (itemType === "testimonial") {
        const testimonials = getLocalTestimonials();
        const tIdx = testimonials.findIndex((t) => t.id === itemId);
        if (tIdx !== -1) {
          testimonials[tIdx] = { ...testimonials[tIdx], ...draftData };
        } else {
          testimonials.push({ id: itemId, ...draftData });
        }
        saveLocalTestimonials(testimonials);
      }

      // Delete draft
      const drafts = getLocalDrafts();
      const updatedDrafts = drafts.filter((d) => !(d.item_type === itemType && d.item_id === itemId));
      saveLocalDrafts(updatedDrafts);
    }

    return true;
  },

  async rollbackVersion(itemType: string, itemId: string): Promise<boolean> {
    if (isSupabaseConfigured()) {
      const supabase = await getSupabase();
      const { data: historyList, error } = await supabase
        .from("content_history")
        .select("*")
        .eq("item_type", itemType)
        .eq("item_id", itemId)
        .order("published_at", { ascending: false });
      
      if (error || !historyList || historyList.length === 0) return false;

      const latestHistory = historyList[0];
      const prevData = latestHistory.published_data;

      // Write back prevData to actual table
      if (itemType === "settings") {
        await supabase.from("website_settings").upsert({
          key: itemId,
          value: typeof prevData.value === "object" ? JSON.stringify(prevData.value) : String(prevData.value),
        });
      } else if (itemType === "product") {
        await supabase.from("products").update({
          name: prevData.name,
          description: prevData.description,
          daily_price: prevData.dailyPrice || prevData.daily_price || 799,
          specs_json: prevData.specs || prevData.specs_json || {},
        }).eq("id", itemId);
      } else if (itemType === "coupon") {
        await supabase.from("coupons").update({
          is_active: prevData.isActive || prevData.is_active || false,
          active_until: prevData.activeUntil || prevData.active_until || "",
        }).eq("code", itemId);
      } else if (itemType === "faq") {
        await supabase.from("faqs").upsert({
          id: itemId,
          question: prevData.question,
          answer: prevData.answer,
          category: prevData.category,
        });
      } else if (itemType === "testimonial") {
        await supabase.from("testimonials").upsert({
          id: itemId,
          author_name: prevData.authorName || prevData.author_name,
          author_title: prevData.authorTitle || prevData.author_title,
          quote: prevData.quote,
          rating: prevData.rating,
        });
      }

      // Delete the history entry we rolled back to
      await supabase.from("content_history").delete().eq("id", latestHistory.id);
      return true;
    }

    const history = getLocalHistory();
    let hIdx = -1;
    for (let i = history.length - 1; i >= 0; i--) {
      if (history[i].item_type === itemType && history[i].item_id === itemId) {
        hIdx = i;
        break;
      }
    }

    if (hIdx === -1) return false;

    const prevData = history[hIdx].published_data;

    if (itemType === "settings") {
      const settings = getLocalSettings();
      settings[itemId] = prevData.value;
      saveLocalSettings(settings);
    } else if (itemType === "product") {
      const products = getLocalProducts();
      const pIdx = products.findIndex((p) => p.id === itemId);
      if (pIdx !== -1) {
        products[pIdx] = { ...products[pIdx], ...prevData };
        saveLocalProducts(products);
      }
    } else if (itemType === "coupon") {
      const coupons = getLocalCoupons();
      const cIdx = coupons.findIndex((c) => c.code.toUpperCase() === itemId.toUpperCase());
      if (cIdx !== -1) {
        coupons[cIdx] = { ...coupons[cIdx], ...prevData };
        saveLocalCoupons(coupons);
      }
    } else if (itemType === "faq") {
      const faqs = getLocalFAQs();
      const fIdx = faqs.findIndex((f) => f.id === itemId);
      if (fIdx !== -1) {
        faqs[fIdx] = prevData;
        saveLocalFAQs(faqs);
      }
    } else if (itemType === "testimonial") {
      const testimonials = getLocalTestimonials();
      const tIdx = testimonials.findIndex((t) => t.id === itemId);
      if (tIdx !== -1) {
        testimonials[tIdx] = prevData;
        saveLocalTestimonials(testimonials);
      }
    }

    history.splice(hIdx, 1);
    saveLocalHistory(history);
    return true;
  },

  async getContentHistory(itemType: string, itemId: string): Promise<any[]> {
    if (isSupabaseConfigured()) {
      const supabase = await getSupabase();
      const { data, error } = await supabase
        .from("content_history")
        .select("*")
        .eq("item_type", itemType)
        .eq("item_id", itemId)
        .order("published_at", { ascending: false });
      return error ? [] : data;
    }
    const history = getLocalHistory();
    return history.filter((h) => h.item_type === itemType && h.item_id === itemId);
  },

  setPreviewMode(enabled: boolean): void {
    previewModeActive = enabled;
    if (typeof window !== "undefined") {
      if (enabled) {
        sessionStorage.setItem("aurevia_preview_mode", "true");
      } else {
        sessionStorage.removeItem("aurevia_preview_mode");
      }
    }
  },

  getPreviewMode(): boolean {
    if (typeof window !== "undefined") {
      return sessionStorage.getItem("aurevia_preview_mode") === "true";
    }
    return previewModeActive;
  },

  async getWebsiteSetting(key: string): Promise<string | null> {
    if (this.getPreviewMode()) {
      const draft = await this.getDraft("settings", key);
      if (draft) return draft.draft_data.value ?? draft.draft_data;
    }

    if (isSupabaseConfigured()) {
      const supabase = await getSupabase();
      const { data, error } = await supabase
        .from("website_settings")
        .select("value")
        .eq("key", key)
        .maybeSingle();
      if (!error && data) return data.value;
    }

    const settings = getLocalSettings();
    return settings[key] || null;
  },

  async saveWebsiteSetting(key: string, value: string): Promise<boolean> {
    if (isSupabaseConfigured()) {
      const supabase = await getSupabase();
      const { error } = await supabase
        .from("website_settings")
        .upsert({ key, value });
      return !error;
    }
    const settings = getLocalSettings();
    settings[key] = value;
    saveLocalSettings(settings);
    return true;
  },

  async getAllWebsiteSettings(): Promise<Record<string, string>> {
    const defaultSettings = getLocalSettings();
    const settings: Record<string, string> = { ...defaultSettings };

    if (isSupabaseConfigured()) {
      const supabase = await getSupabase();
      const { data, error } = await supabase.from("website_settings").select("*");
      if (!error && data) {
        data.forEach((row: any) => {
          settings[row.key] = row.value;
        });
      }
    }

    if (this.getPreviewMode()) {
      const drafts = await this.getDrafts("settings");
      drafts.forEach((d) => {
        settings[d.item_id] = d.draft_data.value ?? d.draft_data;
      });
    }

    return settings;
  },

  // ----------------------------------------------------
  // Cancellations & Refunds
  // ----------------------------------------------------
  async requestRefund(bookingId: string, amount: number, reason: string): Promise<boolean> {
    if (isSupabaseConfigured()) {
      const supabase = await getSupabase();
      const { error } = await supabase
        .from("refunds")
        .insert({
          booking_id: bookingId,
          amount: amount,
          status: "requested",
          reason: reason,
        });
      return !error;
    }
    const refunds = getLocalRefunds();
    refunds.push({
      id: `ref_${Date.now()}`,
      booking_id: bookingId,
      amount: amount,
      status: "requested",
      reason: reason,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
    saveLocalRefunds(refunds);
    return true;
  },

  async getRefunds(): Promise<any[]> {
    if (isSupabaseConfigured()) {
      const supabase = await getSupabase();
      const { data, error } = await supabase
        .from("refunds")
        .select("*, booking:bookings(*)")
        .order("created_at", { ascending: false });
      return error ? [] : data;
    }
    const refunds = getLocalRefunds();
    const bookings = getLocalBookings();
    return refunds.map((r) => {
      const b = bookings.find((bk) => bk.id === r.booking_id);
      return {
        ...r,
        booking: b ? {
          reference_code: b.referenceCode,
          contact_name: b.contactName,
          total_payable: b.totalPayable,
          payment_status: b.paymentStatus,
          status: b.status,
        } : null
      };
    }).sort((a, b) => b.created_at.localeCompare(a.created_at));
  },

  async getRefundById(id: string): Promise<any | null> {
    if (isSupabaseConfigured()) {
      const supabase = await getSupabase();
      const { data, error } = await supabase
        .from("refunds")
        .select("*, booking:bookings(*)")
        .eq("id", id)
        .maybeSingle();
      if (!error && data) return data;
      return null;
    }
    const refunds = getLocalRefunds();
    const r = refunds.find((ref) => ref.id === id);
    if (!r) return null;
    const bookings = getLocalBookings();
    const b = bookings.find((bk) => bk.id === r.booking_id);
    return {
      ...r,
      booking: b ? {
        id: b.id,
        reference_code: b.referenceCode,
        contact_name: b.contactName,
        total_payable: b.totalPayable,
        payment_status: b.paymentStatus,
        status: b.status,
      } : null
    };
  },

  async getRefundByBookingId(bookingId: string): Promise<any | null> {
    if (isSupabaseConfigured()) {
      const supabase = await getSupabase();
      const { data, error } = await supabase
        .from("refunds")
        .select("*")
        .eq("booking_id", bookingId)
        .maybeSingle();
      if (!error && data) return data;
      return null;
    }
    const refunds = getLocalRefunds();
    return refunds.find((r) => r.booking_id === bookingId) || null;
  },

  async updateRefundStatus(refundId: string, status: string, notes?: string, razorpayRefundId?: string): Promise<boolean> {
    if (isSupabaseConfigured()) {
      const supabase = await getSupabase();
      const updateData: any = { status, updated_at: new Date().toISOString() };
      if (notes) updateData.admin_notes = notes;
      if (razorpayRefundId) updateData.razorpay_refund_id = razorpayRefundId;

      const { error } = await supabase
        .from("refunds")
        .update(updateData)
        .eq("id", refundId);
      return !error;
    }
    const refunds = getLocalRefunds();
    const idx = refunds.findIndex((r) => r.id === refundId);
    if (idx !== -1) {
      refunds[idx].status = status;
      if (notes) refunds[idx].admin_notes = notes;
      if (razorpayRefundId) refunds[idx].razorpay_refund_id = razorpayRefundId;
      refunds[idx].updated_at = new Date().toISOString();
      saveLocalRefunds(refunds);
      return true;
    }
    return false;
  },

  // ----------------------------------------------------
  // Camera Maintenance System
  // ----------------------------------------------------
  async createMaintenanceRecord(record: {
    inventoryUnitId: string;
    conditionBefore: string;
    maintenanceReason: string;
    repairCost: number;
    serviceProvider: string;
    expectedReturnDate: string;
  }): Promise<any> {
    // Force set unit status to maintenance
    await this.updateInventoryUnitStatus(record.inventoryUnitId, "maintenance");

    if (isSupabaseConfigured()) {
      const supabase = await getSupabase();
      const { data, error } = await supabase
        .from("maintenance_records")
        .insert({
          inventory_unit_id: record.inventoryUnitId,
          condition_before: record.conditionBefore,
          maintenance_reason: record.maintenanceReason,
          repair_cost: record.repairCost,
          service_provider: record.serviceProvider,
          expected_return_date: record.expectedReturnDate,
        })
        .select("*")
        .single();
      return error ? null : data;
    }

    const records = getLocalMaintenance();
    const newRecord = {
      id: `maint_${Date.now()}`,
      inventory_unit_id: record.inventoryUnitId,
      condition_before: record.conditionBefore,
      maintenance_reason: record.maintenanceReason,
      repair_cost: record.repairCost,
      service_provider: record.serviceProvider,
      expected_return_date: record.expectedReturnDate,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    records.push(newRecord);
    saveLocalMaintenance(records);
    return newRecord;
  },

  async getMaintenanceRecords(unitId?: string): Promise<any[]> {
    if (isSupabaseConfigured()) {
      const supabase = await getSupabase();
      let query = supabase.from("maintenance_records").select("*, inventory_units(*)");
      if (unitId) {
        query = query.eq("inventory_unit_id", unitId);
      }
      const { data, error } = await query.order("created_at", { ascending: false });
      return error ? [] : data;
    }
    const records = getLocalMaintenance();
    const units = await this.getInventoryUnits();
    const filtered = unitId ? records.filter((r) => r.inventory_unit_id === unitId) : records;
    return filtered.map((r) => {
      const u = units.find((unit) => unit.id === r.inventory_unit_id);
      return {
        ...r,
        inventory_units: u ? {
          id: u.id,
          serial_number: u.serialNumber,
          status: u.status,
        } : null
      };
    }).sort((a, b) => b.created_at.localeCompare(a.created_at));
  },

  async completeMaintenance(recordId: string, actualReturnDate: string, repairCost: number, conditionAfter: string): Promise<boolean> {
    let unitId = "";

    if (isSupabaseConfigured()) {
      const supabase = await getSupabase();
      const { data: rec } = await supabase.from("maintenance_records").select("inventory_unit_id").eq("id", recordId).single();
      if (rec) {
        unitId = rec.inventory_unit_id;
        const { error } = await supabase
          .from("maintenance_records")
          .update({
            actual_return_date: actualReturnDate,
            repair_cost: repairCost,
            condition_after: conditionAfter,
            updated_at: new Date().toISOString(),
          })
          .eq("id", recordId);
        
        if (!error && unitId) {
          await this.updateInventoryUnitStatus(unitId, "available");
          // Update last inspected time
          await supabase.from("inventory_units").update({ last_inspected: new Date().toISOString() }).eq("id", unitId);
          return true;
        }
      }
      return false;
    }

    const records = getLocalMaintenance();
    const idx = records.findIndex((r) => r.id === recordId);
    if (idx !== -1) {
      records[idx].actual_return_date = actualReturnDate;
      records[idx].repair_cost = repairCost;
      records[idx].condition_after = conditionAfter;
      records[idx].updated_at = new Date().toISOString();
      unitId = records[idx].inventory_unit_id;
      saveLocalMaintenance(records);

      if (unitId) {
        await this.updateInventoryUnitStatus(unitId, "available");
        const units = await this.getInventoryUnits();
        const uIdx = units.findIndex((u) => u.id === unitId);
        if (uIdx !== -1) {
          // in mock, check details lastInspectedAt
          (units[uIdx] as any).lastInspectedAt = new Date().toISOString();
          saveLocalInventoryUnits(units);
        }
      }
      return true;
    }
    return false;
  },

  // ----------------------------------------------------
  // Customer Support Centre
  // ----------------------------------------------------
  async createSupportTicket(ticket: {
    profileId: string;
    bookingId?: string;
    subject: string;
    description: string;
    category: string;
    priority: string;
    assignedTo: string;
  }): Promise<any> {
    if (isSupabaseConfigured()) {
      const supabase = await getSupabase();
      const { data, error } = await supabase
        .from("support_tickets")
        .insert({
          profile_id: ticket.profileId,
          booking_id: ticket.bookingId || null,
          subject: ticket.subject,
          description: ticket.description,
          category: ticket.category,
          priority: ticket.priority,
          assigned_to: ticket.assignedTo,
          status: "open",
        })
        .select("*")
        .single();
      return error ? null : data;
    }

    const tickets = getLocalTickets();
    const newTicket = {
      id: `tkt_${Date.now()}`,
      profile_id: ticket.profileId,
      booking_id: ticket.bookingId || null,
      subject: ticket.subject,
      description: ticket.description,
      category: ticket.category,
      priority: ticket.priority,
      assigned_to: ticket.assignedTo,
      status: "open",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    tickets.push(newTicket);
    saveLocalTickets(tickets);
    return newTicket;
  },

  async getSupportTickets(profileId?: string): Promise<any[]> {
    if (isSupabaseConfigured()) {
      const supabase = await getSupabase();
      let query = supabase.from("support_tickets").select("*, bookings(*), profiles(*)");
      if (profileId) {
        query = query.eq("profile_id", profileId);
      }
      const { data, error } = await query.order("created_at", { ascending: false });
      return error ? [] : data;
    }
    const tickets = getLocalTickets();
    const bookings = getLocalBookings();
    const profiles = [getLocalProfile()]; // assume single local user profile
    const filtered = profileId ? tickets.filter((t) => t.profile_id === profileId) : tickets;
    return filtered.map((t) => {
      const b = bookings.find((bk) => bk.id === t.booking_id);
      const p = profiles.find((prof) => prof.id === t.profile_id);
      return {
        ...t,
        bookings: b ? { reference_code: b.referenceCode } : null,
        profiles: p ? { full_name: p.fullName, email: p.email } : null
      };
    }).sort((a, b) => b.created_at.localeCompare(a.created_at));
  },

  async getSupportTicketById(id: string): Promise<any | null> {
    if (isSupabaseConfigured()) {
      const supabase = await getSupabase();
      const { data, error } = await supabase
        .from("support_tickets")
        .select("*, bookings(*), profiles(*)")
        .eq("id", id)
        .maybeSingle();
      if (!error && data) return data;
      return null;
    }
    const tickets = getLocalTickets();
    const t = tickets.find((tix) => tix.id === id);
    if (!t) return null;
    const bookings = getLocalBookings();
    const b = bookings.find((bk) => bk.id === t.booking_id);
    const p = getLocalProfile();
    return {
      ...t,
      bookings: b ? { reference_code: b.referenceCode } : null,
      profiles: p ? { full_name: p.fullName, email: p.email } : null
    };
  },

  async addTicketReply(reply: {
    ticketId: string;
    senderId: string;
    message: string;
  }): Promise<any> {
    // Automatically update ticket status to Replied or open depending on actor
    const ticket = await this.getSupportTicketById(reply.ticketId);
    let nextStatus = "replied";
    if (ticket && ticket.profile_id === reply.senderId) {
      nextStatus = "open"; // customer replied, goes back to open for admin attention
    }

    if (isSupabaseConfigured()) {
      const supabase = await getSupabase();
      const { data, error } = await supabase
        .from("ticket_replies")
        .insert({
          ticket_id: reply.ticketId,
          sender_id: reply.senderId,
          message: reply.message,
        })
        .select("*")
        .single();
      
      if (!error) {
        await supabase.from("support_tickets").update({ status: nextStatus, updated_at: new Date().toISOString() }).eq("id", reply.ticketId);
      }
      return error ? null : data;
    }

    const replies = getLocalReplies();
    const newReply = {
      id: `rep_${Date.now()}`,
      ticket_id: reply.ticketId,
      sender_id: reply.senderId,
      message: reply.message,
      created_at: new Date().toISOString(),
    };
    replies.push(newReply);
    saveLocalReplies(replies);

    const tickets = getLocalTickets();
    const tIdx = tickets.findIndex((t) => t.id === reply.ticketId);
    if (tIdx !== -1) {
      tickets[tIdx].status = nextStatus;
      tickets[tIdx].updated_at = new Date().toISOString();
      saveLocalTickets(tickets);
    }
    return newReply;
  },

  async getTicketReplies(ticketId: string): Promise<any[]> {
    if (isSupabaseConfigured()) {
      const supabase = await getSupabase();
      const { data, error } = await supabase
        .from("ticket_replies")
        .select("*, profiles(*)")
        .eq("ticket_id", ticketId)
        .order("created_at", { ascending: true });
      return error ? [] : data;
    }
    const replies = getLocalReplies();
    const profile = getLocalProfile();
    return replies
      .filter((r) => r.ticket_id === ticketId)
      .map((r) => ({
        ...r,
        profiles: {
          id: profile.id,
          full_name: r.sender_id === profile.id ? profile.fullName : "Admin Support",
          role: r.sender_id === profile.id ? "customer" : "admin"
        }
      })).sort((a, b) => a.created_at.localeCompare(b.created_at));
  },

  async resolveSupportTicket(ticketId: string): Promise<boolean> {
    if (isSupabaseConfigured()) {
      const supabase = await getSupabase();
      const { error } = await supabase
        .from("support_tickets")
        .update({ status: "resolved", updated_at: new Date().toISOString() })
        .eq("id", ticketId);
      return !error;
    }
    const tickets = getLocalTickets();
    const tIdx = tickets.findIndex((t) => t.id === ticketId);
    if (tIdx !== -1) {
      tickets[tIdx].status = "resolved";
      tickets[tIdx].updated_at = new Date().toISOString();
      saveLocalTickets(tickets);
      return true;
    }
    return false;
  },

  // ----------------------------------------------------
  // Checklist updates & Penalty links
  // ----------------------------------------------------
  async updateChecklists(bookingId: string, type: "pickup" | "return", checklist: any, remarks?: string): Promise<boolean> {
    if (isSupabaseConfigured()) {
      const supabase = await getSupabase();
      const updateData: any = {};
      if (type === "pickup") {
        updateData.pickup_checklist = checklist;
        if (remarks) updateData.pickup_remarks = remarks;
      } else {
        updateData.return_checklist = checklist;
        if (remarks) updateData.return_remarks = remarks;
      }

      const { error } = await supabase
        .from("bookings")
        .update(updateData)
        .eq("id", bookingId);
      return !error;
    }

    const bookings = getLocalBookings();
    const idx = bookings.findIndex((b) => b.id === bookingId);
    if (idx !== -1) {
      if (type === "pickup") {
        (bookings[idx] as any).pickupChecklist = checklist;
        if (remarks) bookings[idx].pickupRemarks = remarks;
      } else {
        (bookings[idx] as any).returnChecklist = checklist;
        if (remarks) bookings[idx].returnRemarks = remarks;
      }
      saveLocalBookings(bookings);
      return true;
    }
    return false;
  },

  async updatePenaltyPaymentUrl(bookingId: string, url: string): Promise<boolean> {
    if (isSupabaseConfigured()) {
      const supabase = await getSupabase();
      const { error } = await supabase
        .from("bookings")
        .update({ penalty_payment_url: url })
        .eq("id", bookingId);
      return !error;
    }
    const bookings = getLocalBookings();
    const idx = bookings.findIndex((b) => b.id === bookingId);
    if (idx !== -1) {
      (bookings[idx] as any).penaltyPaymentUrl = url;
      saveLocalBookings(bookings);
      return true;
    }
    return false;
  },
};

