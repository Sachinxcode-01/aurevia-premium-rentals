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
}

export interface BookingAddonSelection {
  addonId: string;
  price: number;
}

export interface Booking {
  id: string;
  profileId: string;
  referenceCode: string;
  startDate: string;
  endDate: string;
  totalRentalFee: number;
  securityDeposit: number;
  taxFee: number;
  deliveryFee: number;
  discountAmount: number;
  totalPayable: number;
  status: "pending" | "confirmed" | "picked_up" | "returned" | "cancelled" | "rejected";
  paymentStatus: "unpaid" | "paid" | "refunded";
  deliveryMethod: "pickup" | "delivery";
  contactName: string;
  contactPhone: string;
  couponApplied?: string;
  items: BookingItem[];
  addons: BookingAddonSelection[];
  createdAt: string;
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
  // Seed an initial booking to make dashboards populated
  {
    id: "bk-seed-1",
    profileId: "usr-prem",
    referenceCode: "AV-2026-88091",
    startDate: "2026-07-20",
    endDate: "2026-07-25",
    totalRentalFee: 17495.00, // 5 days Canon R5
    securityDeposit: 15000.00,
    taxFee: 3149.10,
    deliveryFee: 500.00,
    discountAmount: 1749.50, // 10% coupon
    totalPayable: 19394.60,
    status: "confirmed",
    paymentStatus: "paid",
    deliveryMethod: "delivery",
    contactName: "Prem Kumar",
    contactPhone: "9686909048",
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
  },
  {
    id: "bk-seed-2",
    profileId: "usr-rhea",
    referenceCode: "AV-2026-44120",
    startDate: "2026-07-02",
    endDate: "2026-07-04",
    totalRentalFee: 8998.00, // 2 days Sony FX3
    securityDeposit: 20000.00,
    taxFee: 1619.64,
    deliveryFee: 0.00,
    discountAmount: 0.00,
    totalPayable: 30617.64,
    status: "returned",
    paymentStatus: "paid",
    deliveryMethod: "pickup",
    contactName: "Rhea Sen",
    contactPhone: "9876543210",
    items: [
      {
        productId: "p1000000-0000-0000-0000-000000000002",
        quantity: 1,
        unitPrice: 4499.00,
      }
    ],
    addons: [],
    createdAt: "2026-07-01T15:30:00.000Z",
  }
];

let serverProfile: UserProfile = {
  id: "usr-prem",
  fullName: "Prem Kumar",
  email: "contact@prem.dev",
  phone: "9686909048",
  role: "admin", // Admin access enabled by default for local testing
};

// Local storage helpers
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
// DATABASE API METHODS (Dual-mode abstraction)
// ----------------------------------------------------

export const db = {
  // 1. Brands
  async getBrands(): Promise<Brand[]> {
    return MOCK_BRANDS;
  },

  // 2. Categories
  async getCategories(): Promise<Category[]> {
    return MOCK_CATEGORIES;
  },

  // 3. Products
  async getProducts(filters?: {
    categorySlug?: string;
    brandSlug?: string;
    search?: string;
    featuredOnly?: boolean;
  }): Promise<Product[]> {
    let products = [...MOCK_PRODUCTS];

    if (filters?.featuredOnly) {
      products = products.filter((p) => p.isFeatured);
    }

    if (filters?.categorySlug) {
      const category = MOCK_CATEGORIES.find((c) => c.slug === filters.categorySlug);
      if (category) {
        products = products.filter((p) => p.categoryId === category.id);
      }
    }

    if (filters?.brandSlug) {
      const brand = MOCK_BRANDS.find((b) => b.slug === filters.brandSlug);
      if (brand) {
        products = products.filter((p) => p.brandId === brand.id);
      }
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
    const product = MOCK_PRODUCTS.find((p) => p.slug === slug);
    return product || null;
  },

  async getProductById(id: string): Promise<Product | null> {
    const product = MOCK_PRODUCTS.find((p) => p.id === id);
    return product || null;
  },

  async getAddons(): Promise<ProductAddon[]> {
    return MOCK_ADDONS;
  },

  // 4. Booking Reservations Engine
  async checkAvailability(
    productId: string,
    startDateStr: string,
    endDateStr: string
  ): Promise<{ available: boolean; remainingQty: number }> {
    const product = await this.getProductById(productId);
    if (!product) return { available: false, remainingQty: 0 };

    const totalQty = product.inventoryQty;
    const start = new Date(startDateStr);
    const end = new Date(endDateStr);

    if (isNaN(start.getTime()) || isNaN(end.getTime()) || start > end) {
      return { available: false, remainingQty: 0 };
    }

    // Get all overlapping active bookings
    const bookings = getLocalBookings().filter(
      (b) =>
        b.status !== "cancelled" &&
        b.status !== "rejected" &&
        new Date(b.startDate) <= end &&
        new Date(b.endDate) >= start
    );

    // Sum up currently reserved quantity for overlapping ranges
    let maxReserved = 0;
    // Iterate day-by-day inside the requested range to check peak load
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dayReserved = bookings.reduce((sum, b) => {
        const bStart = new Date(b.startDate);
        const bEnd = new Date(b.endDate);
        if (d >= bStart && d <= bEnd) {
          const item = b.items.find((i) => i.productId === productId);
          return sum + (item ? item.quantity : 0);
        }
        return sum;
      }, 0);
      maxReserved = Math.max(maxReserved, dayReserved);
    }

    const remainingQty = totalQty - maxReserved;
    return {
      available: remainingQty > 0,
      remainingQty: Math.max(0, remainingQty),
    };
  },

  async createBooking(booking: Omit<Booking, "id" | "createdAt" | "status" | "paymentStatus">): Promise<Booking> {
    // Re-verify availability server-side
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

    const newBooking: Booking = {
      ...booking,
      id: `bk-${Math.random().toString(36).substring(2, 11)}`,
      status: "pending",
      paymentStatus: "unpaid",
      createdAt: new Date().toISOString(),
    };

    const currentBookings = getLocalBookings();
    saveLocalBookings([newBooking, ...currentBookings]);
    return newBooking;
  },

  async getBookings(profileId?: string): Promise<Booking[]> {
    const bookings = getLocalBookings();
    if (profileId) {
      return bookings.filter((b) => b.profileId === profileId);
    }
    return bookings;
  },

  async getBookingById(id: string): Promise<Booking | null> {
    const booking = getLocalBookings().find((b) => b.id === id);
    return booking || null;
  },

  async updateBookingStatus(
    bookingId: string,
    status: Booking["status"],
    paymentStatus?: Booking["paymentStatus"]
  ): Promise<Booking | null> {
    const bookings = getLocalBookings();
    const idx = bookings.findIndex((b) => b.id === bookingId);
    if (idx === -1) return null;

    bookings[idx].status = status;
    if (paymentStatus) {
      bookings[idx].paymentStatus = paymentStatus;
    }
    bookings[idx].createdAt = bookings[idx].createdAt; // keep original timestamp

    saveLocalBookings([...bookings]);
    return bookings[idx];
  },

  // 5. Customer Profile
  async getProfile(): Promise<UserProfile> {
    return getLocalProfile();
  },

  async updateProfile(profile: Partial<UserProfile>): Promise<UserProfile> {
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
    const bookings = getLocalBookings();
    
    // Revenue calculations
    const revenueTotal = bookings
      .filter((b) => b.status !== "cancelled" && b.status !== "rejected")
      .reduce((sum, b) => sum + b.totalRentalFee, 0);

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const revenueMonth = bookings
      .filter((b) => b.status !== "cancelled" && b.status !== "rejected" && new Date(b.createdAt) >= startOfMonth)
      .reduce((sum, b) => sum + b.totalRentalFee, 0);

    const bookingsTotalCount = bookings.length;
    const bookingsPendingCount = bookings.filter((b) => b.status === "pending").length;
    const bookingsConfirmedCount = bookings.filter((b) => b.status === "confirmed").length;
    
    const activeRentalsCount = bookings.filter(
      (b) => b.status === "confirmed" || b.status === "picked_up"
    ).length;

    // Inventory status
    const inventoryTotal = MOCK_PRODUCTS.reduce((sum, p) => sum + p.inventoryQty, 0);
    const inventoryRented = bookings
      .filter((b) => (b.status === "confirmed" || b.status === "picked_up") && new Date(b.startDate) <= now && new Date(b.endDate) >= now)
      .reduce((sum, b) => sum + b.items.reduce((itemSum, item) => itemSum + item.quantity, 0), 0);
    
    const inventoryAvailable = Math.max(0, inventoryTotal - inventoryRented);

    // Revenue by category mapping
    const catMap: Record<string, number> = {};
    bookings
      .filter((b) => b.status !== "cancelled" && b.status !== "rejected")
      .forEach((b) => {
        b.items.forEach((item) => {
          const prod = MOCK_PRODUCTS.find((p) => p.id === item.productId);
          const cat = MOCK_CATEGORIES.find((c) => c.id === prod?.categoryId);
          if (cat) {
            catMap[cat.name] = (catMap[cat.name] || 0) + (item.quantity * item.unitPrice);
          }
        });
      });
    const revenueByCategory = Object.entries(catMap).map(([category, value]) => ({
      category,
      value,
    }));

    // Revenue by brand
    const brandMap: Record<string, number> = {};
    bookings
      .filter((b) => b.status !== "cancelled" && b.status !== "rejected")
      .forEach((b) => {
        b.items.forEach((item) => {
          const prod = MOCK_PRODUCTS.find((p) => p.id === item.productId);
          const brand = MOCK_BRANDS.find((br) => br.id === prod?.brandId);
          if (brand) {
            brandMap[brand.name] = (brandMap[brand.name] || 0) + (item.quantity * item.unitPrice);
          }
        });
      });
    const revenueByBrand = Object.entries(brandMap).map(([brand, value]) => ({
      brand,
      value,
    }));

    // Daily Revenue trend (last 7 days helper)
    const trendMap: Record<string, number> = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      trendMap[dateStr] = 0;
    }

    bookings
      .filter((b) => b.status !== "cancelled" && b.status !== "rejected")
      .forEach((b) => {
        const bDate = new Date(b.createdAt);
        const dateStr = bDate.toLocaleDateString("en-US", { month: "short", day: "numeric" });
        if (dateStr in trendMap) {
          trendMap[dateStr] += b.totalRentalFee;
        }
      });

    const revenueTrend = Object.entries(trendMap).map(([date, amount]) => ({
      date,
      amount,
    }));

    // Utilization calculation
    const utilizationRate = Math.round((inventoryRented / inventoryTotal) * 100) || 15;

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
};
