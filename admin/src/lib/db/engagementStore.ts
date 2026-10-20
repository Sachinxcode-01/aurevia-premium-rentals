/**
 * Aurevia Admin Customer Engagement Store
 */

export interface CustomerReview {
  id: string;
  customerName: string;
  customerEmail: string;
  avatarUrl?: string;
  productName: string;
  rating: number;
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

const INITIAL_REVIEWS: CustomerReview[] = [
  {
    id: "42d101ea-59f2-4a8d-a86b-ca96ea6fc2d5",
    customerName: "Aravind Sen",
    customerEmail: "",
    productName: "Canon EOS R5 C Cinema Camera",
    rating: 5,
    title: "Pristine equipment and elite service",
    comment: "AUREVIA provides pristine equipment that meets exact set standards. Their service is truly elite, matching the quality of the glass they rent.",
    status: "approved",
    verifiedRental: true,
    createdAt: "2026-07-16T17:48:35.145583+00:00",
  },
];

const INITIAL_ENQUIRIES: OnlineEnquiry[] = [
  {
    id: "enq-101",
    referenceNo: "ENQ-9082",
    customerName: "Rahul Mehta",
    customerEmail: "rahul.mehta@studio.in",
    customerPhone: "+91 98765 43210",
    subject: "Bulk Equipment Inquiry for 3-Day Music Festival Shoot",
    equipmentInterest: "Sony FX6 (x3), Sony 70-200mm f/2.8 GM II, DJI Ronin 2",
    rentalDates: "Aug 25, 2026 - Aug 28, 2026",
    message: "Hi Aurevia Concierge, we are planning a major live music festival shoot in Goa next week. We need 3 Sony FX6 cinema cameras with dual slot tough SD cards and wireless Video Transmitters. Can you provide a custom package quote with delivery to location?",
    status: "new",
    priority: "high",
    createdAt: "2026-08-12T09:00:00Z",
    responses: [],
  },
  {
    id: "enq-102",
    referenceNo: "ENQ-8841",
    customerName: "Sneha Reddy",
    customerEmail: "sneha.reddy@fashionfilm.com",
    customerPhone: "+91 99123 88765",
    subject: "Hasselblad H6D-100c Availability & Lens Options",
    equipmentInterest: "Hasselblad H6D-100c Medium Format + HC 100mm f/2.2",
    rentalDates: "Sep 02, 2026 - Sep 04, 2026",
    message: "We have an editorial cover shoot in Bangalore studio. Is the Hasselblad 100c available for these dates and does it come with tethering cables for Capture One Pro?",
    status: "in_progress",
    priority: "medium",
    createdAt: "2026-08-11T15:30:00Z",
    responses: [
      {
        id: "resp-1",
        responseText: "Hello Sneha, Yes the Hasselblad H6D-100c is available for Sep 2-4. It includes tethering USB-C cables, dual batteries, and charger. I can lock this reservation for you.",
        sentAt: "2026-08-11T17:00:00Z",
        respondedBy: "AUREVIA Concierge Team",
      },
    ],
  },
];

const INITIAL_TICKETS: SupportTicket[] = [
  {
    id: "tck-101",
    ticketNo: "TCK-4091",
    customerName: "Prem Mundargi",
    customerEmail: "sachiii8827@gmail.com",
    bookingReference: "AV-2026-84920",
    category: "Billing & Deposit",
    subject: "Security deposit refund status for completed rental",
    status: "open",
    priority: "urgent",
    createdAt: "2026-08-12T07:30:00Z",
    updatedAt: "2026-08-12T07:30:00Z",
    messages: [
      {
        id: "msg-1",
        sender: "customer",
        senderName: "Prem Mundargi",
        text: "Hi Concierge, I returned the Sony A7 IV setup yesterday evening. The gear inspection was completed and marked good order. Could you please confirm when the ₹5,000 security deposit release will reflect in my account?",
        sentAt: "2026-08-12T07:30:00Z",
      },
    ],
  },
];

class EngagementStore {
  private reviewsKey = "aurevia_reviews_v1";
  private enquiriesKey = "aurevia_enquiries_v1";
  private ticketsKey = "aurevia_tickets_v1";

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

  public updateReviewStatus(id: string, status: "approved" | "rejected", adminNote?: string): CustomerReview | null {
    const reviews = this.getReviews();
    const idx = reviews.findIndex((r: CustomerReview) => r.id === id);
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

  public deleteReview(id: string): boolean {
    const reviews = this.getReviews().filter((r: CustomerReview) => r.id !== id);
    if (typeof window !== "undefined") {
      localStorage.setItem(this.reviewsKey, JSON.stringify(reviews));
    }
    return true;
  }

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

  public respondToEnquiry(id: string, responseText: string, respondedBy = "AUREVIA Concierge"): OnlineEnquiry | null {
    const enquiries = this.getEnquiries();
    const idx = enquiries.findIndex((e: OnlineEnquiry) => e.id === id);
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
    const idx = enquiries.findIndex((e: OnlineEnquiry) => e.id === id);
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
    const idx = tickets.findIndex((t: SupportTicket) => t.id === ticketId);
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
    const idx = tickets.findIndex((t: SupportTicket) => t.id === ticketId);
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
