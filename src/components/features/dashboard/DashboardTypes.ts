import React from "react";
import { Product } from "@/lib/db/mockData";

export type DashTab = "overview" | "bookings" | "invoices" | "support" | "settings";
export type BookingFilter = "all" | "upcoming" | "active" | "completed" | "cancelled";

export interface SupportTicket {
  id: string;
  subject: string;
  category: string;
  status: "open" | "in_progress" | "resolved" | "closed";
  priority: "low" | "medium" | "high";
  created_at: string;
  updated_at: string;
  messages: Array<{
    id: string;
    sender: "customer" | "support";
    text: string;
    timestamp: string;
  }>;
}

export const STATUS_STYLES: Record<string, string> = {
  pending_payment:  "bg-amber-500/10 border-amber-500/30 text-amber-400",
  paid:             "bg-blue-500/10 border-blue-500/30 text-blue-400",
  approval_pending: "bg-orange-500/10 border-orange-500/30 text-orange-400",
  approved:         "bg-teal-500/10 border-teal-500/30 text-teal-400",
  ready_for_pickup: "bg-emerald-500/10 border-emerald-500/30 text-emerald-400",
  rented:           "bg-indigo-500/10 border-indigo-500/30 text-indigo-400",
  returned:         "bg-purple-500/10 border-purple-500/30 text-purple-400",
  completed:        "bg-white/5 border-white/15 text-muted-gray",
  rejected:         "bg-red-500/10 border-red-500/30 text-red-400",
  cancelled:        "bg-red-500/10 border-red-500/30 text-red-400",
  payment_failed:   "bg-rose-500/10 border-rose-500/30 text-rose-400",
  overdue:          "bg-rose-600/20 border-rose-500/40 text-rose-400 animate-pulse",
  maintenance:      "bg-amber-600/15 border-amber-500/30 text-amber-400",
};

export const TIMELINE_STEPS = [
  { key: "pending_payment",  label: "Pending\nPayment" },
  { key: "paid",             label: "Paid" },
  { key: "approval_pending", label: "Approval\nPending" },
  { key: "approved",         label: "Approved" },
  { key: "ready_for_pickup", label: "Ready for\nPickup" },
  { key: "rented",           label: "Rented" },
  { key: "completed",        label: "Completed" },
];

export const STEP_ORDER = TIMELINE_STEPS.map((s) => s.key);

export function filterBookings(bookings: any[], filter: BookingFilter) {
  if (filter === "all") return bookings;
  if (filter === "upcoming")
    return bookings.filter((b) =>
      ["pending_payment", "paid", "approval_pending", "approved", "ready_for_pickup"].includes(b.status)
    );
  if (filter === "active") return bookings.filter((b) => ["rented", "overdue"].includes(b.status));
  if (filter === "completed") return bookings.filter((b) => ["completed", "returned"].includes(b.status));
  if (filter === "cancelled") return bookings.filter((b) => ["cancelled", "rejected", "payment_failed"].includes(b.status));
  return bookings;
}

export function canCancel(status: string) {
  return ["pending_payment", "paid", "approval_pending"].includes(status);
}
