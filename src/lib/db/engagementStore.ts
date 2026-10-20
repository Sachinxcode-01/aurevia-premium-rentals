/**
 * Aurevia Customer Engagement Store
 * Manages Reviews, Online Enquiries, and Support Tickets with full state persistence.
 */

export interface CustomerReview {
  id: string;
  customerName: string;
  customerEmail: string;
  avatarUrl?: string;
  productName: string;
  rating: number; // 1 to 5
  title: string;
  comment: string;
  status: "pending" | "approved" | "rejected";
  verifiedRental: boolean;
  createdAt: string;
  adminNote?: string;
}

export interface EnquiryResponse {
  id: string;
  responseText: string;
  sentAt: string;
  respondedBy: string;
}

export interface OnlineEnquiry {
  id: string;
  referenceNo: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  subject: string;
  equipmentInterest: string;
  rentalDates?: string;
  message: string;
  status: "new" | "in_progress" | "resolved" | "archived";
  priority: "high" | "medium" | "low";
  createdAt: string;
  responses: EnquiryResponse[];
  adminNotes?: string;
}

export interface TicketMessage {
  id: string;
  sender: "customer" | "admin";
  senderName: string;
  text: string;
  sentAt: string;
}

export interface SupportTicket {
  id: string;
  ticketNo: string;
  customerName: string;
  customerEmail: string;
  bookingReference?: string;
  category: "Equipment Technical Issue" | "Billing & Deposit" | "Delivery & Pickup" | "General Question";
  subject: string;
  status: "open" | "pending_customer" | "resolved" | "closed";
  priority: "urgent" | "normal" | "low";
  createdAt: string;
  updatedAt: string;
  messages: TicketMessage[];
}

// ─── Initial Seed Data ───────────────────────────────────────────────

const INITIAL_REVIEWS: CustomerReview[] = [];

const INITIAL_ENQUIRIES: OnlineEnquiry[] = [];

const INITIAL_TICKETS: SupportTicket[] = [];

// ─── Store State Management ───────────────────────────────────────────

class EngagementStore {
  private reviewsKey = "aurevia_reviews_v1";
  private enquiriesKey = "aurevia_enquiries_v1";
  private ticketsKey = "aurevia_tickets_v1";

  // --- REVIEWS ---
  public getReviews(): CustomerReview[] {
    if (typeof window === "undefined") return INITIAL_REVIEWS;
    try {
      const stored = localStorage.getItem(this.reviewsKey);
      if (!stored) {
        localStorage.setItem(this.reviewsKey, JSON.stringify(INITIAL_REVIEWS));
        return INITIAL_REVIEWS;
      }
      return JSON.parse(stored);
    } catch {
      return INITIAL_REVIEWS;
    }
  }

  public getApprovedReviews(): CustomerReview[] {
    return this.getReviews().filter((r) => r.status === "approved");
  }

  public updateReviewStatus(id: string, status: "approved" | "rejected", adminNote?: string): CustomerReview | null {
    const reviews = this.getReviews();
    const idx = reviews.findIndex((r) => r.id === id);
    if (idx === -1) return null;

    reviews[idx] = {
      ...reviews[idx],
      status,
      ...(adminNote ? { adminNote } : {}),
    };

    if (typeof window !== "undefined") {
      localStorage.setItem(this.reviewsKey, JSON.stringify(reviews));
    }
    return reviews[idx];
  }

  public addReview(review: Omit<CustomerReview, "id" | "createdAt" | "status">): CustomerReview {
    const reviews = this.getReviews();
    const newRev: CustomerReview = {
      ...review,
      id: `rev-${Date.now()}`,
      status: "pending", // Always pending moderation by default!
      createdAt: new Date().toISOString(),
    };
    reviews.unshift(newRev);
    if (typeof window !== "undefined") {
      localStorage.setItem(this.reviewsKey, JSON.stringify(reviews));
    }
    return newRev;
  }

  public deleteReview(id: string): boolean {
    const reviews = this.getReviews().filter((r) => r.id !== id);
    if (typeof window !== "undefined") {
      localStorage.setItem(this.reviewsKey, JSON.stringify(reviews));
    }
    return true;
  }

  // --- ENQUIRIES ---
  public getEnquiries(): OnlineEnquiry[] {
    if (typeof window === "undefined") return INITIAL_ENQUIRIES;
    try {
      const stored = localStorage.getItem(this.enquiriesKey);
      if (!stored) {
        localStorage.setItem(this.enquiriesKey, JSON.stringify(INITIAL_ENQUIRIES));
        return INITIAL_ENQUIRIES;
      }
      return JSON.parse(stored);
    } catch {
      return INITIAL_ENQUIRIES;
    }
  }

  public addEnquiry(enquiry: Omit<OnlineEnquiry, "id" | "referenceNo" | "createdAt" | "status" | "responses">): OnlineEnquiry {
    const enquiries = this.getEnquiries();
    const newEnq: OnlineEnquiry = {
      ...enquiry,
      id: `enq-${Date.now()}`,
      referenceNo: `ENQ-${Math.floor(1000 + Math.random() * 9000)}`,
      status: "new",
      createdAt: new Date().toISOString(),
      responses: [],
    };
    enquiries.unshift(newEnq);
    if (typeof window !== "undefined") {
      localStorage.setItem(this.enquiriesKey, JSON.stringify(enquiries));
    }
    return newEnq;
  }

  public respondToEnquiry(id: string, responseText: string, respondedBy = "AUREVIA Concierge"): OnlineEnquiry | null {
    const enquiries = this.getEnquiries();
    const idx = enquiries.findIndex((e) => e.id === id);
    if (idx === -1) return null;

    const newResponse: EnquiryResponse = {
      id: `resp-${Date.now()}`,
      responseText,
      sentAt: new Date().toISOString(),
      respondedBy,
    };

    enquiries[idx] = {
      ...enquiries[idx],
      status: "resolved",
      responses: [...enquiries[idx].responses, newResponse],
    };

    if (typeof window !== "undefined") {
      localStorage.setItem(this.enquiriesKey, JSON.stringify(enquiries));
    }
    return enquiries[idx];
  }

  public updateEnquiryStatus(id: string, status: OnlineEnquiry["status"], adminNotes?: string): OnlineEnquiry | null {
    const enquiries = this.getEnquiries();
    const idx = enquiries.findIndex((e) => e.id === id);
    if (idx === -1) return null;

    enquiries[idx] = {
      ...enquiries[idx],
      status,
      ...(adminNotes ? { adminNotes } : {}),
    };

    if (typeof window !== "undefined") {
      localStorage.setItem(this.enquiriesKey, JSON.stringify(enquiries));
    }
    return enquiries[idx];
  }

  // --- SUPPORT TICKETS ---
  public getTickets(): SupportTicket[] {
    if (typeof window === "undefined") return INITIAL_TICKETS;
    try {
      const stored = localStorage.getItem(this.ticketsKey);
      if (!stored) {
        localStorage.setItem(this.ticketsKey, JSON.stringify(INITIAL_TICKETS));
        return INITIAL_TICKETS;
      }
      return JSON.parse(stored);
    } catch {
      return INITIAL_TICKETS;
    }
  }

  public replyToTicket(ticketId: string, replyText: string, senderName = "AUREVIA Support"): SupportTicket | null {
    const tickets = this.getTickets();
    const idx = tickets.findIndex((t) => t.id === ticketId);
    if (idx === -1) return null;

    const newMsg: TicketMessage = {
      id: `msg-${Date.now()}`,
      sender: "admin",
      senderName,
      text: replyText,
      sentAt: new Date().toISOString(),
    };

    tickets[idx] = {
      ...tickets[idx],
      status: "pending_customer",
      updatedAt: new Date().toISOString(),
      messages: [...tickets[idx].messages, newMsg],
    };

    if (typeof window !== "undefined") {
      localStorage.setItem(this.ticketsKey, JSON.stringify(tickets));
    }
    return tickets[idx];
  }

  public updateTicketStatus(ticketId: string, status: SupportTicket["status"], priority?: SupportTicket["priority"]): SupportTicket | null {
    const tickets = this.getTickets();
    const idx = tickets.findIndex((t) => t.id === ticketId);
    if (idx === -1) return null;

    tickets[idx] = {
      ...tickets[idx],
      status,
      ...(priority ? { priority } : {}),
      updatedAt: new Date().toISOString(),
    };

    if (typeof window !== "undefined") {
      localStorage.setItem(this.ticketsKey, JSON.stringify(tickets));
    }
    return tickets[idx];
  }
}

export const engagementStore = new EngagementStore();
