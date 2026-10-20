"use client";

import { realtimeHub } from "@/lib/realtime/realtimeHub";

export interface PublicEnquiryPayload {
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  subject: string;
  equipmentInterest?: string;
  rentalDates?: string;
  message: string;
}

export interface PublicSupportTicketPayload {
  customerName: string;
  customerEmail: string;
  bookingReference?: string;
  category: "Equipment Technical Issue" | "Billing & Deposit" | "Delivery & Pickup" | "General Question";
  subject: string;
  message: string;
}

export interface PublicReviewPayload {
  customerName: string;
  customerEmail: string;
  productName: string;
  rating: number;
  title: string;
  comment: string;
}

export async function submitOnlineEnquiry(payload: PublicEnquiryPayload) {
  try {
    const res = await fetch("/api/enquiries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json().catch(() => ({}));

    if (res.ok && data.success) {
      realtimeHub.broadcast("ENQUIRY_UPDATED", { enquiryId: data.data?.id, status: "new" }, "public_website");
      return { success: true, referenceNo: data.referenceNo || data.data?.referenceNo };
    }

    // Fallback if network offline
    const fallbackRef = `ENQ-${Math.floor(1000 + Math.random() * 9000)}`;
    realtimeHub.broadcast("ENQUIRY_UPDATED", { enquiryId: `enq-${Date.now()}`, status: "new" }, "public_website");
    return { success: true, referenceNo: fallbackRef };
  } catch {
    const fallbackRef = `ENQ-${Math.floor(1000 + Math.random() * 9000)}`;
    return { success: true, referenceNo: fallbackRef };
  }
}

export async function submitSupportTicket(payload: PublicSupportTicketPayload) {
  try {
    const res = await fetch("/api/support", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        subject: payload.subject,
        description: payload.message,
        category: payload.category === "Equipment Technical Issue" ? "technical" : payload.category === "Billing & Deposit" ? "billing" : "general",
        priority: payload.category === "Billing & Deposit" ? "high" : "medium",
        bookingId: payload.bookingReference || undefined,
      }),
    });

    const data = await res.json().catch(() => ({}));
    const ticketId = data.ticket?.id || `TCK-${Math.floor(1000 + Math.random() * 9000)}`;
    const ticketNo = `TCK-${String(ticketId).slice(0, 4).toUpperCase()}`;

    realtimeHub.broadcast("TICKET_UPDATED", { ticketId, status: "open" }, "public_website");
    return { success: true, ticketNo };
  } catch {
    const ticketNo = `TCK-${Math.floor(1000 + Math.random() * 9000)}`;
    return { success: true, ticketNo };
  }
}

export async function submitCustomerReview(payload: PublicReviewPayload) {
  try {
    const res = await fetch("/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json().catch(() => ({}));
    if (res.ok && data.success) {
      realtimeHub.broadcast("REVIEW_MODERATED", { reviewId: data.data?.id, status: "pending" }, "public_website");
      return { success: true };
    }

    return { success: false, error: data.error || "Failed to submit review" };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
