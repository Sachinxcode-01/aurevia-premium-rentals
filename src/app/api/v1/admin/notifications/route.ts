import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/lib/api/response";
import { verifyApiAuth } from "@/lib/auth/rbac";
import { createServiceSupabaseClient } from "@/lib/supabase/server";

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

export async function GET(req: NextRequest) {
  try {
    const { user, response } = await verifyApiAuth(req, ["admin", "staff", "super_admin"]);
    if (response || !user) return response!;

    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category") || "all";

    const notifications: SystemNotification[] = [];
    const seenIds = new Set<string>();

    const supabase = await createServiceSupabaseClient();

    // 1. Fetch real Supabase notifications from `notifications` table
    try {
      const { data: dbNotifs, error: nErr } = await supabase
        .from("notifications")
        .select("id, profile_id, title, message, is_read, created_at, profile:profiles(full_name, email)")
        .order("created_at", { ascending: false })
        .limit(40);

      if (!nErr && dbNotifs) {
        dbNotifs.forEach((n: any) => {
          if (!seenIds.has(n.id)) {
            seenIds.add(n.id);

            // Infer notification type & action URL from title & message
            const titleLower = (n.title || "").toLowerCase();
            const msgLower = (n.message || "").toLowerCase();
            let type: SystemNotification["type"] = "booking";
            let actionUrl = "/bookings";
            let severity: SystemNotification["severity"] = "info";

            if (titleLower.includes("refund") || msgLower.includes("refund")) {
              type = "refund";
              actionUrl = "/refunds";
              severity = "urgent";
            } else if (titleLower.includes("kyc") || msgLower.includes("kyc") || titleLower.includes("identity")) {
              type = "kyc";
              actionUrl = "/kyc";
              severity = "warning";
            } else if (titleLower.includes("ticket") || msgLower.includes("ticket") || titleLower.includes("support")) {
              type = "ticket";
              actionUrl = "/tickets";
              severity = "urgent";
            } else if (titleLower.includes("enquiry") || titleLower.includes("inquiry")) {
              type = "ticket";
              actionUrl = "/enquiries";
              severity = "info";
            } else if (titleLower.includes("payment") || msgLower.includes("payment")) {
              type = "payment";
              actionUrl = "/payments";
              severity = "info";
            }

            notifications.push({
              id: n.id,
              type,
              title: n.title || "Notification",
              desc: n.message || "",
              time: n.created_at || new Date().toISOString(),
              actionUrl,
              severity,
              read: Boolean(n.is_read),
            });
          }
        });
      }
    } catch (err) {
      console.warn("[Notifications GET] Error querying notifications table:", err);
    }

    // 2. Fetch Pending Refunds
    try {
      const { data: refunds } = await supabase
        .from("refunds")
        .select("id, amount, reason, created_at, booking_id")
        .eq("status", "requested")
        .order("created_at", { ascending: false })
        .limit(10);

      if (refunds) {
        refunds.forEach((r: any) => {
          const id = `notif-rfd-${r.id}`;
          if (!seenIds.has(id)) {
            seenIds.add(id);
            notifications.push({
              id,
              type: "refund",
              title: "Refund Approval Required",
              desc: `Claim of ₹${Number(r.amount).toLocaleString("en-IN")} requested for reservation #${r.booking_id}. Reason: ${r.reason || "Customer cancellation"}`,
              time: r.created_at,
              actionUrl: "/refunds",
              severity: "urgent",
              read: false,
            });
          }
        });
      }
    } catch {}

    // 3. Fetch Open Support Tickets
    try {
      const { data: tickets } = await supabase
        .from("support_tickets")
        .select("id, subject, priority, created_at")
        .eq("status", "open")
        .order("created_at", { ascending: false })
        .limit(10);

      if (tickets) {
        tickets.forEach((t: any) => {
          const id = `notif-tkt-${t.id}`;
          if (!seenIds.has(id)) {
            seenIds.add(id);
            notifications.push({
              id,
              type: "ticket",
              title: `New Support Ticket (${(t.priority || "normal").toUpperCase()})`,
              desc: `Ticket #${t.id.slice(0, 8)}: "${t.subject}" awaits concierge response.`,
              time: t.created_at,
              actionUrl: "/tickets",
              severity: t.priority === "high" || t.priority === "urgent" ? "urgent" : "info",
              read: false,
            });
          }
        });
      }
    } catch {}

    // 4. Sort strictly descending by timestamp
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

    const supabase = await createServiceSupabaseClient();

    if (clearAll) {
      await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("is_read", false);

      return successResponse({ cleared: true }, "All notifications marked as read");
    }

    if (id) {
      // If it's a UUID matching notifications table
      const isUUID = /^[0-9a-fA-F-]{36}$/.test(id);
      if (isUUID) {
        await supabase
          .from("notifications")
          .update({ is_read: true })
          .eq("id", id);
      }

      return successResponse({ id, read: true }, "Notification marked as read");
    }

    return errorResponse("INVALID_PAYLOAD", "Notification id or clearAll required", 400);
  } catch (err: any) {
    return errorResponse("NOTIFICATION_UPDATE_FAILED", err.message || "Failed to update notification", 500);
  }
}
