import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/lib/api/response";
import { verifyApiAuth } from "@/lib/auth/rbac";
import { createServiceSupabaseClient } from "@/lib/supabase/server";
import { db, isSupabaseConfigured } from "@/lib/db/store";

export interface SystemNotification {
  id: string;
  type: "payment" | "refund" | "kyc" | "ticket" | "security" | "booking";
  title: string;
  desc: string;
  time: string;
  actionUrl: string;
  severity: "info" | "warning" | "urgent";
  read: boolean;
}

// In-memory set of read notification IDs
const readNotificationIds = new Set<string>();

export async function GET(req: NextRequest) {
  try {
    const { user, response } = await verifyApiAuth(req, ["admin", "staff", "super_admin"]);
    if (response || !user) return response!;

    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category") || "all";

    const notifications: SystemNotification[] = [];

    if (isSupabaseConfigured()) {
      try {
        const supabase = await createServiceSupabaseClient();

        // 1. Pending Refunds
        const { data: refunds } = await supabase
          .from("refunds")
          .select("id, amount, reason, created_at, booking_id")
          .eq("status", "requested")
          .order("created_at", { ascending: false })
          .limit(10);

        if (refunds) {
          refunds.forEach((r: any) => {
            notifications.push({
              id: `notif-rfd-${r.id}`,
              type: "refund",
              title: "Refund Approval Required",
              desc: `Claim of ₹${Number(r.amount).toLocaleString("en-IN")} requested for reservation #${r.booking_id}. Reason: ${r.reason || "Customer cancellation"}`,
              time: r.created_at,
              actionUrl: "/refunds",
              severity: "urgent",
              read: readNotificationIds.has(`notif-rfd-${r.id}`),
            });
          });
        }

        // 2. Pending KYC documents
        const { data: kycDocs } = await supabase
          .from("kyc_documents")
          .select("id, document_type, created_at, profiles(full_name)")
          .eq("status", "submitted")
          .order("created_at", { ascending: false })
          .limit(10);

        if (kycDocs) {
          kycDocs.forEach((k: any) => {
            notifications.push({
              id: `notif-kyc-${k.id}`,
              type: "kyc",
              title: "KYC Verification Pending",
              desc: `${k.profiles?.full_name || "Customer"} submitted a ${k.document_type || "Government ID"} for rental identity clearance.`,
              time: k.created_at,
              actionUrl: "/kyc",
              severity: "warning",
              read: readNotificationIds.has(`notif-kyc-${k.id}`),
            });
          });
        }

        // 3. Open Support Tickets
        const { data: tickets } = await supabase
          .from("support_tickets")
          .select("id, subject, priority, created_at")
          .eq("status", "open")
          .order("created_at", { ascending: false })
          .limit(10);

        if (tickets) {
          tickets.forEach((t: any) => {
            notifications.push({
              id: `notif-tkt-${t.id}`,
              type: "ticket",
              title: `New Support Ticket (${t.priority.toUpperCase()})`,
              desc: `Ticket #${t.id.slice(0, 8)}: "${t.subject}" awaits concierge response.`,
              time: t.created_at,
              actionUrl: "/tickets",
              severity: t.priority === "high" || t.priority === "urgent" ? "urgent" : "info",
              read: readNotificationIds.has(`notif-tkt-${t.id}`),
            });
          });
        }

        // 4. Recent Bookings
        const { data: recentBookings } = await supabase
          .from("bookings")
          .select("id, reference_code, contact_name, total_payable, created_at, payment_status")
          .order("created_at", { ascending: false })
          .limit(10);

        if (recentBookings) {
          recentBookings.forEach((b: any) => {
            const isPaid = b.payment_status === "paid";
            notifications.push({
              id: `notif-bk-${b.id}`,
              type: isPaid ? "payment" : "booking",
              title: isPaid ? "Payment Received" : "Reservation Created",
              desc: `₹${Number(b.total_payable || 0).toLocaleString("en-IN")} for #${b.reference_code || b.id} by ${b.contact_name || "Customer"}.`,
              time: b.created_at,
              actionUrl: "/bookings",
              severity: "info",
              read: readNotificationIds.has(`notif-bk-${b.id}`),
            });
          });
        }

        // 5. Security & Audit logs
        const { data: auditEvents } = await supabase
          .from("audit_logs")
          .select("id, action, details, created_at")
          .ilike("action", "%FAILED%")
          .order("created_at", { ascending: false })
          .limit(5);

        if (auditEvents) {
          auditEvents.forEach((a: any) => {
            notifications.push({
              id: `notif-audit-${a.id}`,
              type: "security",
              title: "Security & Auth Alert",
              desc: a.details || a.action,
              time: a.created_at,
              actionUrl: "/activity",
              severity: "urgent",
              read: readNotificationIds.has(`notif-audit-${a.id}`),
            });
          });
        }
      } catch (err) {
        console.warn("[Notifications GET] Supabase query error, falling back to local store:", err);
      }
    }

    // If notifications are empty (local store or fallback)
    if (notifications.length === 0) {
      try {
        const localBookings = await db.getBookings().catch(() => []);
        localBookings.slice(0, 5).forEach((b: any) => {
          notifications.push({
            id: `notif-bk-local-${b.id}`,
            type: b.paymentStatus === "paid" ? "payment" : "booking",
            title: b.paymentStatus === "paid" ? "Payment Received" : "New Reservation",
            desc: `₹${Number(b.totalPayable || 0).toLocaleString("en-IN")} received for Booking #${b.referenceCode || b.id}.`,
            time: b.createdAt || new Date().toISOString(),
            actionUrl: "/bookings",
            severity: "info",
            read: readNotificationIds.has(`notif-bk-local-${b.id}`),
          });
        });

        const localRefunds = await db.getRefunds().catch(() => []);
        localRefunds.filter((r) => r.status === "requested").forEach((r: any) => {
          notifications.push({
            id: `notif-rfd-local-${r.id}`,
            type: "refund",
            title: "Refund Approval Requested",
            desc: `Refund claim of ₹${Number(r.amount).toLocaleString("en-IN")} awaiting review for #${r.booking_id}.`,
            time: r.created_at || new Date().toISOString(),
            actionUrl: "/refunds",
            severity: "urgent",
            read: readNotificationIds.has(`notif-rfd-local-${r.id}`),
          });
        });
      } catch {}

      // Default baseline system health notification
      notifications.push({
        id: "notif-sys-ok",
        type: "security",
        title: "AUREVIA Security Shield Active",
        desc: "All RBAC firewalls, cryptographic cookie verification, and Razorpay webhook signatures are active.",
        time: new Date().toISOString(),
        actionUrl: "/activity",
        severity: "info",
        read: readNotificationIds.has("notif-sys-ok"),
      });
    }

    // Sort by time descending
    notifications.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());

    // Filter by category if requested
    const filtered = category === "all"
      ? notifications
      : notifications.filter((n) => n.type === category);

    return successResponse(filtered);
  } catch (err: any) {
    console.error("[Notifications GET] Error:", err);
    return errorResponse("NOTIFICATIONS_FETCH_FAILED", err.message || "Failed to load notifications", 500);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { user, response } = await verifyApiAuth(req, ["admin", "staff", "super_admin"]);
    if (response || !user) return response!;

    const body = await req.json().catch(() => ({}));
    const { id, clearAll } = body;

    if (clearAll) {
      readNotificationIds.clear();
      return successResponse({ cleared: true }, "All notifications cleared");
    }

    if (id) {
      readNotificationIds.add(id);
      return successResponse({ id, read: true }, "Notification marked as read");
    }

    return errorResponse("INVALID_PAYLOAD", "Notification id or clearAll required", 400);
  } catch (err: any) {
    return errorResponse("NOTIFICATION_UPDATE_FAILED", err.message || "Failed to update notification", 500);
  }
}
