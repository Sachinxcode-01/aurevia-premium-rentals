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

// ----------------------------------------------------
// SUPABASE CLIENT SELECTOR & DUAL-MODE LOGIC
// ----------------------------------------------------
const isSupabaseConfigured = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  return url && url.length > 0 && !url.includes("your-project-id");
};

async function getSupabase() {
  if (typeof window !== "undefined") {
    const { getClient } = await import("@/lib/supabase/client");
    return getClient();
  } else {
    const { createClient } = await import("@supabase/supabase-js");
    return createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
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
    if (isSupabaseConfigured()) {
      const supabase = await getSupabase();
      const { data: dbProds, error } = await supabase
        .from("products")
        .select("*, product_images(*)")
        .eq("is_archived", false);

      if (!error && dbProds) {
        let products = dbProds.map(mapDbProductToApp);

        if (filters?.featuredOnly) {
          products = products.filter((p) => p.isFeatured);
        }
        if (filters?.categorySlug) {
          const { data: cat } = await supabase.from("categories").select("id").eq("slug", filters.categorySlug).single();
          if (cat) {
            products = products.filter((p) => p.categoryId === cat.id);
          }
        }
        if (filters?.brandSlug) {
          const { data: brand } = await supabase.from("brands").select("id").eq("slug", filters.brandSlug).single();
          if (brand) {
            products = products.filter((p) => p.brandId === brand.id);
          }
        }
        if (filters?.search) {
          const q = filters.search.toLowerCase();
          products = products.filter(
            (p) =>
              p.name.toLowerCase().includes(q) ||
              p.description.toLowerCase().includes(q)
          );
        }
        return products;
      }
    }

    // Mock Fallback
    let products = [...MOCK_PRODUCTS];
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
    return products.filter((p) => !p.isArchived);
  },

  async getProductBySlug(slug: string): Promise<Product | null> {
    if (isSupabaseConfigured()) {
      const supabase = await getSupabase();
      const { data, error } = await supabase
        .from("products")
        .select("*, product_images(*)")
        .eq("slug", slug)
        .single();
      if (!error && data) return mapDbProductToApp(data);
    }
    const product = MOCK_PRODUCTS.find((p) => p.slug === slug);
    return product || null;
  },

  async getProductById(id: string): Promise<Product | null> {
    if (isSupabaseConfigured()) {
      const supabase = await getSupabase();
      const { data, error } = await supabase
        .from("products")
        .select("*, product_images(*)")
        .eq("id", id)
        .single();
      if (!error && data) return mapDbProductToApp(data);
    }
    const product = MOCK_PRODUCTS.find((p) => p.id === id);
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
        const activeUnits = dbUnits.filter((u) => u.status !== "decommissioned" && u.status !== "maintenance");
        const activeBookings = (dbBookings || []).filter(
          (b) =>
            ["paid", "approval_pending", "approved", "ready_for_pickup", "rented", "returned", "completed", "overdue"].includes(b.status) &&
            new Date(b.start_date) <= new Date(endDateStr) &&
            new Date(b.end_date) >= new Date(startDateStr)
        );

        let freeCount = 0;
        activeUnits.forEach((unit) => {
          const isBooked = activeBookings.some((b) =>
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
    return MOCK_TESTIMONIALS;
  },

  async getFAQs(): Promise<FAQ[]> {
    return MOCK_FAQS;
  },

  async getCoupon(code: string): Promise<Coupon | null> {
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
    const coupon = MOCK_COUPONS.find(
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
};
