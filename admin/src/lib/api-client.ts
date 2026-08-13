/* Strongly-Typed Admin API Client for AUREVIA Admin Website */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

async function fetchAdminApi<T>(endpoint: string, options: RequestInit = {}): Promise<{ success: boolean; data?: T; error?: { code: string; message: string }; message?: string }> {
  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      credentials: "include",
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
        message: err.message || "Failed to reach central Aurevia API",
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
    list: (limit = 50) => fetchAdminApi<any[]>(`/api/v1/admin/audit?limit=${limit}`),
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
};
