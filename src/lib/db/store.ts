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
  securityDeposit: number;
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
  // Extended logistics upgrades
  emergencyContact: string;
  companyOrCollege?: string;
  depositStatus: "pending" | "collected" | "partially_refunded" | "fully_refunded" | "deducted";
  depositPaymentMethod: "razorpay" | "cash";
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
    depositStatus: "collected",
    depositPaymentMethod: "razorpay",
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
    depositStatus: "fully_refunded",
    depositPaymentMethod: "razorpay",
    agreementAccepted: true,
    statusHistory: [],
    auditLogs: [],
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

let serverInventoryUnits: InventoryUnit[] = [
  {
    id: "u1",
    productId: "p1000000-0000-0000-0000-000000000001",
    serialNumber: "CN-CAM-01",
    name: "Canon Camera 1",
    status: "available",
    condition: "excellent",
  },
  {
    id: "u2",
    productId: "p1000000-0000-0000-0000-000000000001",
    serialNumber: "CN-CAM-02",
    name: "Canon Camera 2",
    status: "available",
    condition: "good",
  },
  {
    id: "u3",
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
    const start = new Date(startDateStr);
    const end = new Date(endDateStr);
    if (isNaN(start.getTime()) || isNaN(end.getTime()) || start > end) {
      return { available: false, remainingQty: 0 };
    }

    const units = this.getInventoryUnits().filter(
      (u) => u.productId === productId && u.status !== "decommissioned" && u.status !== "maintenance"
    );
    const bookings = getLocalBookings().filter(
      (b) =>
        (["approved", "ready_for_pickup", "rented", "overdue"].includes(b.status)) &&
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

  async createBooking(booking: Omit<Booking, "id" | "createdAt" | "status" | "paymentStatus" | "depositStatus" | "agreementAccepted" | "statusHistory" | "auditLogs">): Promise<Booking> {
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
      depositStatus: "pending",
      depositPaymentMethod: booking.deliveryMethod === "pickup" ? "razorpay" : "razorpay", // Default to Razorpay
      agreementAccepted: false,
      lateFee: 0,
      damageDescription: "",
      damageCost: 0,
      statusHistory: [
        { status: "pending_payment", timestamp: new Date().toISOString(), note: "Booking initiated, pending checkout payment." }
      ],
      auditLogs: [
        { action: "booking_created", timestamp: new Date().toISOString(), performedBy: "customer", details: `Booking reference ${refCode} initialized.` }
      ],
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
    note: string = "",
    performedBy: string = "system"
  ): Promise<Booking | null> {
    const bookings = getLocalBookings();
    const idx = bookings.findIndex((b) => b.id === bookingId);
    if (idx === -1) return null;

    const oldStatus = bookings[idx].status;

    // Validate workflow transitions
    const invalidTransitions: Record<string, string[]> = {
      cancelled: ["paid", "approval_pending", "approved", "ready_for_pickup", "rented", "returned", "completed"],
      rejected: ["paid", "approved", "ready_for_pickup", "rented", "returned", "completed"],
      completed: ["pending_payment", "paid", "approval_pending", "approved", "rented"],
      rented: ["pending_payment", "paid", "approval_pending"],
    };

    if (invalidTransitions[oldStatus]?.includes(status)) {
      throw new Error(`Invalid status transition: Cannot change from ${oldStatus} to ${status}.`);
    }

    bookings[idx].status = status;
    
    // Auto align paymentStatus
    if (status === "paid" || status === "approval_pending") {
      bookings[idx].paymentStatus = "paid";
    } else if (status === "cancelled" || status === "rejected") {
      // Re-assign items
      bookings[idx].items = bookings[idx].items.map(item => ({ ...item, inventoryUnitId: undefined }));
    }

    // Append logs
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

    saveLocalBookings([...bookings]);
    return bookings[idx];
  },

  // Digital Agreement accepts
  async acceptAgreement(bookingId: string, ip: string): Promise<Booking | null> {
    const bookings = getLocalBookings();
    const idx = bookings.findIndex((b) => b.id === bookingId);
    if (idx === -1) return null;

    const booking = bookings[idx];
    if (booking.status !== "approved") {
      throw new Error("Rental agreement can only be accepted after the booking has been approved by administration.");
    }

    // Generate random 6 digit OTP
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

    saveLocalBookings(bookings);
    return bookings[idx];
  },

  // Secure OTP handover check
  async confirmHandover(
    bookingId: string,
    otp: string,
    remarks: string,
    serialVerified: boolean
  ): Promise<Booking | null> {
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
    bookings[idx].depositStatus = "collected"; // deposit is collected at pickup/checkout
    bookings[idx].pickupRemarks = remarks;
    bookings[idx].pickupHandoverAt = new Date().toISOString();
    bookings[idx].pickupConditionPhotos = [
      "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=400&q=80"
    ]; // mock photo handover

    // Set units status to rented
    const assignedUnits = booking.items.map(item => item.inventoryUnitId).filter(Boolean) as string[];
    const units = this.getInventoryUnits();
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

  // 4b. Inventory units operations
  getInventoryUnits(): InventoryUnit[] {
    return getLocalInventoryUnits();
  },

  async updateInventoryUnitStatus(unitId: string, status: InventoryUnit["status"]): Promise<InventoryUnit | null> {
    const units = getLocalInventoryUnits();
    const idx = units.findIndex((u) => u.id === unitId);
    if (idx === -1) return null;
    units[idx].status = status;
    saveLocalInventoryUnits(units);
    return units[idx];
  },

  async assignAvailableUnit(bookingId: string): Promise<boolean> {
    const bookings = getLocalBookings();
    const bIdx = bookings.findIndex((b) => b.id === bookingId);
    if (bIdx === -1) return false;

    const booking = bookings[bIdx];
    const start = new Date(booking.startDate);
    const end = new Date(booking.endDate);

    const updatedItems = [...booking.items];

    for (let i = 0; i < updatedItems.length; i++) {
      const item = updatedItems[i];
      const units = this.getInventoryUnits().filter(
        (u) => u.productId === item.productId && u.status !== "decommissioned" && u.status !== "maintenance"
      );

      const overlappingBookings = bookings.filter(
        (ob) =>
          ob.id !== bookingId &&
          (["approved", "ready_for_pickup", "rented", "overdue"].includes(ob.status)) &&
          new Date(ob.startDate) <= end &&
          new Date(ob.endDate) >= start
      );

      const freeUnit = units.find((unit) => {
        return !overlappingBookings.some((ob) =>
          ob.items.some((oi) => oi.productId === item.productId && oi.inventoryUnitId === unit.id)
        );
      });

      if (!freeUnit) return false; // Double booking conflict!

      updatedItems[i] = {
        ...item,
        inventoryUnitId: freeUnit.id,
      };
    }

    bookings[bIdx].items = updatedItems;
    // Transition to paid, then automatically wait for admin review
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

    saveLocalBookings(bookings);
    return true;
  },

  async reassignBookingUnit(bookingId: string, productId: string, newUnitId: string): Promise<boolean> {
    const bookings = getLocalBookings();
    const bIdx = bookings.findIndex((b) => b.id === bookingId);
    if (bIdx === -1) return false;

    const booking = bookings[bIdx];
    const start = new Date(booking.startDate);
    const end = new Date(booking.endDate);

    const overlapping = bookings.filter(
      (ob) =>
        ob.id !== bookingId &&
        (["approved", "ready_for_pickup", "rented", "overdue"].includes(ob.status)) &&
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

  async processReturn(
    bookingId: string,
    condition: "good" | "damaged",
    damageDescription?: string,
    damageCost?: number,
    remarks: string = "",
    lateFeeOverride?: number
  ): Promise<Booking | null> {
    const bookings = getLocalBookings();
    const idx = bookings.findIndex((b) => b.id === bookingId);
    if (idx === -1) return null;

    const booking = bookings[idx];
    
    // Calculate late fees (₹999 per day overdue)
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
    ]; // mock photo returned

    // Update Security Deposit Status
    if (totalDeductions === 0) {
      bookings[idx].depositStatus = "fully_refunded";
    } else if (totalDeductions >= booking.securityDeposit) {
      bookings[idx].depositStatus = "deducted";
    } else {
      bookings[idx].depositStatus = "partially_refunded";
    }

    // Restore units (maintenance if damaged, available otherwise)
    const assignedUnits = booking.items.map((item) => item.inventoryUnitId).filter(Boolean) as string[];
    const units = this.getInventoryUnits();
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
      details: `Returned gear condition: ${condition.toUpperCase()}. Late Fee: ₹${lateFee}, Damage Cost: ₹${cost}. Deposit refunded: ${bookings[idx].depositStatus}`
    });

    saveLocalInventoryUnits(units);
    saveLocalBookings(bookings);
    return bookings[idx];
  },

  async updateDepositStatus(
    bookingId: string,
    depositStatus: "pending" | "collected" | "partially_refunded" | "fully_refunded" | "deducted",
    message: string = ""
  ): Promise<Booking | null> {
    const bookings = getLocalBookings();
    const idx = bookings.findIndex((b) => b.id === bookingId);
    if (idx === -1) return null;

    bookings[idx].depositStatus = depositStatus;
    bookings[idx].auditLogs.push({
      action: "deposit_status_change",
      timestamp: new Date().toISOString(),
      performedBy: "admin",
      details: `Security deposit status updated to ${depositStatus.toUpperCase()}. Message: ${message}`
    });

    saveLocalBookings(bookings);
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
    
    // Revenue calculations: only verified/paid bookings, excluding security deposit!
    const paidBookings = bookings.filter((b) => b.paymentStatus === "paid" && b.status !== "cancelled" && b.status !== "rejected");
    
    const revenueTotal = paidBookings.reduce((sum, b) => sum + (b.totalPayable - b.securityDeposit), 0);

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const revenueMonth = paidBookings
      .filter((b) => new Date(b.createdAt) >= startOfMonth)
      .reduce((sum, b) => sum + (b.totalPayable - b.securityDeposit), 0);

    const bookingsTotalCount = bookings.length;
    const bookingsPendingCount = bookings.filter((b) => b.status === "pending_payment").length;
    const bookingsConfirmedCount = bookings.filter((b) => b.status === "approved" || b.status === "ready_for_pickup").length;
    
    const activeRentalsCount = bookings.filter(
      (b) => b.status === "rented"
    ).length;

    // Physical units stats
    const units = this.getInventoryUnits();
    const inventoryTotal = units.length;
    const inventoryRented = units.filter((u) => u.status === "rented").length;
    const inventoryAvailable = units.filter((u) => u.status === "available").length;

    // Revenue by category mapping
    const catMap: Record<string, number> = {};
    paidBookings.forEach((b) => {
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
    paidBookings.forEach((b) => {
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

    paidBookings.forEach((b) => {
      const bDate = new Date(b.createdAt);
      const dateStr = bDate.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      if (dateStr in trendMap) {
        trendMap[dateStr] += (b.totalPayable - b.securityDeposit);
      }
    });

    const revenueTrend = Object.entries(trendMap).map(([date, amount]) => ({
      date,
      amount,
    }));

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
};
