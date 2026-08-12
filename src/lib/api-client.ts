/* eslint-disable @typescript-eslint/no-explicit-any */
/* Strongly-Typed API Client for AUREVIA Customer & Admin Applications */

const API_BASE = typeof window !== "undefined" ? "" : (process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000");

async function fetchApi<T>(endpoint: string, options: RequestInit = {}): Promise<{ success: boolean; data?: T; error?: { code: string; message: string }; message?: string }> {
  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    });

    const json = await res.json();
    return json;
  } catch (err: any) {
    return {
      success: false,
      error: {
        code: "NETWORK_ERROR",
        message: err.message || "Network error occurred while reaching server",
      },
    };
  }
}

export const apiClient = {
  gear: {
    list: (params?: { category?: string; brand?: string; search?: string; featured?: boolean; page?: number; limit?: number }) => {
      const query = new URLSearchParams();
      if (params?.category) query.append("category", params.category);
      if (params?.brand) query.append("brand", params.brand);
      if (params?.search) query.append("search", params.search);
      if (params?.featured) query.append("featured", "true");
      if (params?.page) query.append("page", String(params.page));
      if (params?.limit) query.append("limit", String(params.limit));

      return fetchApi<any[]>(`/api/v1/gear?${query.toString()}`);
    },
    getBySlug: (slug: string) => fetchApi<any>(`/api/v1/gear/${slug}`),
  },

  availability: {
    check: (equipmentId: string, pickupDate: string, returnDate: string) => {
      const query = new URLSearchParams({ equipmentId, pickupDate, returnDate });
      return fetchApi<{ availableCount: number; isAvailable: boolean; usableUnits: number; bookedUnits: number }>(`/api/v1/availability?${query.toString()}`);
    },
  },

  booking: {
    create: (data: { items: any[]; startDate: string; endDate: string; deliveryMethod?: string; contactName?: string; contactPhone?: string; couponCode?: string }) =>
      fetchApi<{ bookingId: string; referenceCode: string; totalPayable: number }>("/api/v1/bookings", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    getMine: () => fetchApi<any[]>("/api/v1/bookings"),
  },

  payments: {
    createOrder: (bookingId: string, amount?: number) =>
      fetchApi<{ orderId: string; amount: number; currency: string; keyId: string }>("/api/v1/payments/order", {
        method: "POST",
        body: JSON.stringify({ bookingId, amount }),
      }),
  },

  kyc: {
    submit: (data: { documentType: string; documentNumber?: string; filePath: string }) =>
      fetchApi<any>("/api/v1/kyc", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    getMine: () => fetchApi<any[]>("/api/v1/kyc"),
  },

  health: {
    check: () => fetchApi<any>("/api/v1/health"),
  },
};

export const adminApiClient = {
  dashboard: (range = "30D") => fetchApi<any>(`/api/v1/admin/dashboard?range=${range}`),

  bookings: {
    list: (params?: { status?: string; search?: string; page?: number; limit?: number }) => {
      const query = new URLSearchParams();
      if (params?.status) query.append("status", params.status);
      if (params?.search) query.append("search", params.search);
      if (params?.page) query.append("page", String(params.page));
      if (params?.limit) query.append("limit", String(params.limit));

      return fetchApi<any[]>(`/api/v1/admin/bookings?${query.toString()}`);
    },
    updateStatus: (bookingId: string, status: string, notes?: string) =>
      fetchApi<any>("/api/v1/admin/bookings", {
        method: "PATCH",
        body: JSON.stringify({ bookingId, status, notes }),
      }),
  },

  inventory: {
    list: (params?: { status?: string; search?: string }) => {
      const query = new URLSearchParams();
      if (params?.status) query.append("status", params.status);
      if (params?.search) query.append("search", params.search);
      return fetchApi<any[]>(`/api/v1/admin/inventory?${query.toString()}`);
    },
    add: (unit: { productId: string; serialNumber: string; name: string; status?: string; condition?: string; notes?: string }) =>
      fetchApi<any>("/api/v1/admin/inventory", {
        method: "POST",
        body: JSON.stringify(unit),
      }),
    update: (id: string, payload: { status?: string; condition?: string; notes?: string }) =>
      fetchApi<any>("/api/v1/admin/inventory", {
        method: "PATCH",
        body: JSON.stringify({ id, ...payload }),
      }),
  },

  kyc: {
    list: (status?: string) => {
      const query = new URLSearchParams();
      if (status) query.append("status", status);
      return fetchApi<any[]>(`/api/v1/admin/kyc?${query.toString()}`);
    },
    review: (id: string, status: "approved" | "rejected" | "reupload_required", rejectionReason?: string) =>
      fetchApi<any>("/api/v1/admin/kyc", {
        method: "PATCH",
        body: JSON.stringify({ id, status, rejectionReason }),
      }),
  },

  analytics: (range = "30d") => fetchApi<any>(`/api/v1/admin/analytics?range=${range}`),

  audit: {
    list: (limit = 50) => fetchApi<any[]>(`/api/v1/admin/audit?limit=${limit}`),
  },

  reviews: {
    list: (status = "all") => fetchApi<any>(`/api/v1/admin/reviews?status=${status}`),
    updateStatus: (id: string, status: "approved" | "rejected", adminNote?: string) =>
      fetchApi<any>("/api/v1/admin/reviews", {
        method: "PATCH",
        body: JSON.stringify({ id, status, adminNote }),
      }),
    delete: (id: string) =>
      fetchApi<any>(`/api/v1/admin/reviews?id=${id}`, {
        method: "DELETE",
      }),
  },

  enquiries: {
    list: (status = "all") => fetchApi<any>(`/api/v1/admin/enquiries?status=${status}`),
    respond: (enquiryId: string, responseText: string, respondedBy?: string) =>
      fetchApi<any>("/api/v1/admin/enquiries", {
        method: "POST",
        body: JSON.stringify({ enquiryId, responseText, respondedBy }),
      }),
    updateStatus: (id: string, status: string, adminNotes?: string) =>
      fetchApi<any>("/api/v1/admin/enquiries", {
        method: "PATCH",
        body: JSON.stringify({ id, status, adminNotes }),
      }),
  },

  tickets: {
    list: (status = "all") => fetchApi<any>(`/api/v1/admin/tickets?status=${status}`),
    reply: (ticketId: string, replyText: string, senderName?: string) =>
      fetchApi<any>("/api/v1/admin/tickets", {
        method: "POST",
        body: JSON.stringify({ ticketId, replyText, senderName }),
      }),
    updateStatus: (ticketId: string, status: string, priority?: string) =>
      fetchApi<any>("/api/v1/admin/tickets", {
        method: "PATCH",
        body: JSON.stringify({ ticketId, status, priority }),
      }),
  },
};
