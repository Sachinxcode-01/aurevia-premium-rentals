"use client";

import { realtimeHub } from "@/lib/realtime/realtimeHub";

export interface PublicEnquiryPayload {
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  subject: string;
  equipmentInterest?: string;
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

export function submitOnlineEnquiry(payload: PublicEnquiryPayload) {
  try {
    const existingStr = typeof window !== "undefined" ? localStorage.getItem("aurevia_admin_enquiries") : null;
    const existing = existingStr ? JSON.parse(existingStr) : [];

    const refNo = `ENQ-${Math.floor(1000 + Math.random() * 9000)}`;
    const newEnquiry = {
      id: `enq-${Date.now()}`,
      referenceNo: refNo,
      customerName: payload.customerName,
      customerEmail: payload.customerEmail,
      customerPhone: payload.customerPhone || "Not provided",
      subject: payload.subject,
      equipmentInterest: payload.equipmentInterest || "General Camera Rental",
      message: payload.message,
      status: "new",
      priority: payload.subject === "rental" ? "high" : "medium",
      createdAt: new Date().toISOString(),
      responses: []
    };

    const updated = [newEnquiry, ...existing];
    if (typeof window !== "undefined") {
      localStorage.setItem("aurevia_admin_enquiries", JSON.stringify(updated));
    }

    // Broadcast live event to Admin Panel (:3002)
    realtimeHub.broadcast("ENQUIRY_UPDATED", { enquiryId: newEnquiry.id, status: "new" }, "public");
    return { success: true, referenceNo: refNo };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export function submitSupportTicket(payload: PublicSupportTicketPayload) {
  try {
    const existingStr = typeof window !== "undefined" ? localStorage.getItem("aurevia_admin_tickets") : null;
    const existing = existingStr ? JSON.parse(existingStr) : [];

    const ticketNo = `TCK-${Math.floor(1000 + Math.random() * 9000)}`;
    const nowStr = new Date().toISOString();
    const newTicket = {
      id: `tck-${Date.now()}`,
      ticketNo,
      customerName: payload.customerName,
      customerEmail: payload.customerEmail,
      bookingReference: payload.bookingReference || undefined,
      category: payload.category,
      subject: payload.subject,
      status: "open",
      priority: "normal",
      createdAt: nowStr,
      updatedAt: nowStr,
      messages: [
        {
          id: `msg-${Date.now()}`,
          sender: "customer",
          senderName: payload.customerName,
          text: payload.message,
          sentAt: nowStr
        }
      ]
    };

    const updated = [newTicket, ...existing];
    if (typeof window !== "undefined") {
      localStorage.setItem("aurevia_admin_tickets", JSON.stringify(updated));
    }

    // Broadcast live event to Admin Panel
    realtimeHub.broadcast("TICKET_UPDATED", { ticketId: newTicket.id, status: "open" }, "public");
    return { success: true, ticketNo };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export function submitCustomerReview(payload: PublicReviewPayload) {
  try {
    const existingStr = typeof window !== "undefined" ? localStorage.getItem("aurevia_admin_reviews") : null;
    const existing = existingStr ? JSON.parse(existingStr) : [];

    const newReview = {
      id: `rev-${Date.now()}`,
      customerName: payload.customerName,
      customerEmail: payload.customerEmail,
      productName: payload.productName,
      rating: payload.rating,
      title: payload.title,
      comment: payload.comment,
      status: "pending", // Enters admin moderation queue
      verifiedRental: true,
      createdAt: new Date().toISOString()
    };

    const updated = [newReview, ...existing];
    if (typeof window !== "undefined") {
      localStorage.setItem("aurevia_admin_reviews", JSON.stringify(updated));
    }

    // Broadcast live event to Admin Panel
    realtimeHub.broadcast("REVIEW_MODERATED", { reviewId: newReview.id, status: "pending" }, "public");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
