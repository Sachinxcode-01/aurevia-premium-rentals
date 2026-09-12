import { createClient } from "@/utils/supabase/client";

function getApiBase(): string {
  if (process.env.NEXT_PUBLIC_API_URL) return process.env.NEXT_PUBLIC_API_URL;
  if (typeof window !== "undefined") {
    const host = window.location.hostname;
    if (host === "localhost" || host === "127.0.0.1") {
      return "http://localhost:3000";
    }
    return "https://aurevia-premium-rentals.vercel.app";
  }
  return "https://aurevia-premium-rentals.vercel.app";
}

async function fetchAdminApi<T>(endpoint: string, options: RequestInit = {}): Promise<{ success: boolean; data?: T; error?: { code: string; message: string }; message?: string }> {
  try {
    const baseUrl = getApiBase();
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string>),
    };

    if (typeof window !== "undefined") {
      try {
        const supabase = createClient();
        const { data } = await supabase.auth.getSession();
        if (data?.session?.access_token) {
          headers["Authorization"] = `Bearer ${data.session.access_token}`;
        }
      } catch {}
    }

    const res = await fetch(`${baseUrl}${endpoint}`, {
      credentials: "include",
      headers,
      ...options,
    });

    const json = await res.json();
    return json;
  } catch (err: any) {
    console.warn("[Admin API] Fetch warning:", err?.message);
    return {
      success: false,
      error: {
        code: "NETWORK_ERROR",
        message: err?.message || "Failed to reach central Aurevia API",
      },
    };
  }
}

export const adminApiClient = {
  dashboard: (range = "30D") => fetchAdminApi<any>(`/api/v1/admin/dashboard?range=${range}`),

  bookings: {
    list: (params?: { status?: string; search?: string; page?: number; limit?: number }) => {
      const query = new URLSearchParams();
      if (params?.status) query.append("status", params.status);
      if (params?.search) query.append("search", params.search);
      if (params?.page) query.append("page", String(params.page));
      if (params?.limit) query.append("limit", String(params.limit));

      return fetchAdminApi<any[]>(`/api/v1/admin/bookings?${query.toString()}`);
    },
    updateStatus: (bookingId: string, status: string, notes?: string) =>
      fetchAdminApi<any>("/api/v1/admin/bookings", {
        method: "PATCH",
        body: JSON.stringify({ bookingId, status, notes }),
      }),
    delete: (bookingId: string) =>
      fetchAdminApi<any>(`/api/v1/admin/bookings?id=${bookingId}`, {
        method: "DELETE",
      }),
  },

  inventory: {
    list: (params?: { status?: string; search?: string }) => {
      const query = new URLSearchParams();
      if (params?.status) query.append("status", params.status);
      if (params?.search) query.append("search", params.search);
      return fetchAdminApi<any[]>(`/api/v1/admin/inventory?${query.toString()}`);
    },
    add: (unit: { productId: string; serialNumber: string; name: string; status?: string; condition?: string; notes?: string }) =>
      fetchAdminApi<any>("/api/v1/admin/inventory", {
        method: "POST",
        body: JSON.stringify(unit),
      }),
    update: (id: string, payload: { status?: string; condition?: string; notes?: string }) =>
      fetchAdminApi<any>("/api/v1/admin/inventory", {
        method: "PATCH",
        body: JSON.stringify({ id, ...payload }),
      }),
  },

  products: {
    list: (search?: string) => {
      const query = new URLSearchParams();
      if (search) query.append("search", search);
      return fetchAdminApi<any[]>(`/api/v1/admin/products?${query.toString()}`);
    },
    add: (product: {
      name: string;
      slug?: string;
      description?: string;
      dailyPrice: number;
      securityDeposit?: number;
      inventoryQty?: number;
      imageUrl?: string;
      specifications?: Record<string, any>;
      isFeatured?: boolean;
    }) =>
      fetchAdminApi<any>("/api/v1/admin/products", {
        method: "POST",
        body: JSON.stringify(product),
      }),
    update: (id: string, payload: Record<string, any>) =>
      fetchAdminApi<any>("/api/v1/admin/products", {
        method: "PATCH",
        body: JSON.stringify({ id, ...payload }),
      }),
    delete: (id: string) =>
      fetchAdminApi<any>(`/api/v1/admin/products?id=${id}`, {
        method: "DELETE",
      }),
  },

  kyc: {
    list: (status?: string) => {
      const query = new URLSearchParams();
      if (status) query.append("status", status);
      return fetchAdminApi<any[]>(`/api/v1/admin/kyc?${query.toString()}`);
    },
    review: (id: string, status: "approved" | "rejected" | "reupload_required", rejectionReason?: string) =>
      fetchAdminApi<any>("/api/v1/admin/kyc", {
        method: "PATCH",
        body: JSON.stringify({ id, status, rejectionReason }),
      }),
  },

  analytics: (range = "30d") => fetchAdminApi<any>(`/api/v1/admin/analytics?range=${range}`),

  audit: {
    list: (params?: number | { limit?: number; category?: string; search?: string }) => {
      if (typeof params === "number") {
        return fetchAdminApi<any[]>(`/api/v1/admin/audit?limit=${params}`);
      }
      const query = new URLSearchParams();
      if (params?.limit) query.set("limit", String(params.limit));
      if (params?.category && params.category !== "all") query.set("category", params.category);
      if (params?.search) query.set("search", params.search);
      const qs = query.toString();
      return fetchAdminApi<any[]>(`/api/v1/admin/audit${qs ? `?${qs}` : ""}`);
    },
  },

  reviews: {
    list: (status = "all") => fetchAdminApi<any>(`/api/v1/admin/reviews?status=${status}`),
    updateStatus: (id: string, status: "approved" | "rejected", adminNote?: string) =>
      fetchAdminApi<any>("/api/v1/admin/reviews", {
        method: "PATCH",
        body: JSON.stringify({ id, status, adminNote }),
      }),
    delete: (id: string) =>
      fetchAdminApi<any>(`/api/v1/admin/reviews?id=${id}`, {
        method: "DELETE",
      }),
  },

  enquiries: {
    list: (status = "all") => fetchAdminApi<any>(`/api/v1/admin/enquiries?status=${status}`),
    respond: (enquiryId: string, responseText: string, respondedBy?: string) =>
      fetchAdminApi<any>("/api/v1/admin/enquiries", {
        method: "POST",
        body: JSON.stringify({ enquiryId, responseText, respondedBy }),
      }),
    updateStatus: (id: string, status: string, adminNotes?: string) =>
      fetchAdminApi<any>("/api/v1/admin/enquiries", {
        method: "PATCH",
        body: JSON.stringify({ id, status, adminNotes }),
      }),
  },

  tickets: {
    list: (status = "all") => fetchAdminApi<any>(`/api/v1/admin/tickets?status=${status}`),
    reply: (ticketId: string, replyText: string, senderName?: string) =>
      fetchAdminApi<any>("/api/v1/admin/tickets", {
        method: "POST",
        body: JSON.stringify({ ticketId, replyText, senderName }),
      }),
    updateStatus: (ticketId: string, status: string, priority?: string) =>
      fetchAdminApi<any>("/api/v1/admin/tickets", {
        method: "PATCH",
        body: JSON.stringify({ ticketId, status, priority }),
      }),
  },

  refunds: {
    list: () => fetchAdminApi<any[]>("/api/admin/refund"),
    process: (refundId: string, action: "approve" | "reject", adminNotes?: string) =>
      fetchAdminApi<any>("/api/admin/refund", {
        method: "POST",
        body: JSON.stringify({ refundId, action, adminNotes }),
      }),
  },

  settings: {
    get: () => fetchAdminApi<any>("/api/v1/admin/settings"),
    update: (payload: Record<string, any>) =>
      fetchAdminApi<any>("/api/v1/admin/settings", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
  },

  notifications: {
    list: (category = "all") => fetchAdminApi<any[]>(`/api/v1/admin/notifications?category=${category}`),
    markRead: (id: string) =>
      fetchAdminApi<any>("/api/v1/admin/notifications", {
        method: "PATCH",
        body: JSON.stringify({ id, read: true }),
      }),
  },

  staff: {
    list: () => fetchAdminApi<any[]>("/api/v1/admin/staff"),
    create: (payload: { name: string; email: string; role: string }) =>
      fetchAdminApi<any>("/api/v1/admin/staff", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    updateRole: (id: string, role: string) =>
      fetchAdminApi<any>("/api/v1/admin/staff", {
        method: "PATCH",
        body: JSON.stringify({ id, role }),
      }),
    toggleStatus: (id: string, status: string) =>
      fetchAdminApi<any>("/api/v1/admin/staff", {
        method: "PATCH",
        body: JSON.stringify({ id, status }),
      }),
    delete: (id: string) =>
      fetchAdminApi<any>(`/api/v1/admin/staff?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      }),
    resendInvite: (id: string) =>
      fetchAdminApi<any>("/api/v1/admin/staff", {
        method: "POST",
        body: JSON.stringify({ action: "resend_invite", id }),
      }),
  },

  coupons: {
    list: () => fetchAdminApi<any[]>("/api/v1/admin/coupons"),
    create: (payload: {
      code: string;
      discountType: "percentage" | "fixed";
      discountValue: number;
      minRentalDays?: number;
      minOrderAmount?: number;
      maxDiscountAmount?: number;
      expiresAt?: string;
      usageLimit?: number;
    }) =>
      fetchAdminApi<any>("/api/v1/admin/coupons", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    toggleStatus: (id: string, active: boolean) =>
      fetchAdminApi<any>("/api/v1/admin/coupons", {
        method: "PATCH",
        body: JSON.stringify({ id, active }),
      }),
    delete: (id: string) =>
      fetchAdminApi<any>(`/api/v1/admin/coupons?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      }),
  },

  customers: {
    list: (query?: { search?: string; status?: string; tier?: string }) => {
      const searchParams = new URLSearchParams();
      if (query?.search) searchParams.set("search", query.search);
      if (query?.status && query.status !== "all") searchParams.set("status", query.status);
      if (query?.tier && query.tier !== "all") searchParams.set("tier", query.tier);
      const qs = searchParams.toString();
      return fetchAdminApi<any>(`/api/v1/admin/customers${qs ? `?${qs}` : ""}`);
    },
    toggleStatus: (id: string, status: "active" | "suspended") =>
      fetchAdminApi<any>("/api/v1/admin/customers", {
        method: "PATCH",
        body: JSON.stringify({ id, status }),
      }),
  },

  payments: {
    list: (query?: { limit?: number; status?: string }) => {
      const searchParams = new URLSearchParams();
      if (query?.limit) searchParams.set("limit", String(query.limit));
      if (query?.status && query.status !== "all") searchParams.set("status", query.status);
      const qs = searchParams.toString();
      return fetchAdminApi<any>(`/api/v1/admin/payments${qs ? `?${qs}` : ""}`);
    },
  },

  returns: {
    generatePenaltyLink: (payload: { bookingId: string; amount: number; description?: string }) =>
      fetchAdminApi<{ success: boolean; paymentUrl: string; error?: string }>("/api/admin/penalty-link", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
  },
};
