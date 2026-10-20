import { NextRequest, NextResponse } from "next/server";
import { createServiceSupabaseClient } from "@/lib/supabase/server";
import { sendEmail } from "@/lib/email/mailer";
import { verifyApiAuth, recordAuditLog } from "@/lib/auth/rbac";
import { realtimeHub } from "@/lib/realtime/realtimeHub";

export async function GET(req: NextRequest) {
  try {
    const { user, response } = await verifyApiAuth(req, ["admin", "staff", "super_admin"]);
    if (response || !user) return response!;

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");

    const supabase = await createServiceSupabaseClient();
    let query = supabase
      .from("support_tickets")
      .select("*, profile:profiles(id, full_name, email, phone), booking:bookings(id, reference_code), replies:ticket_replies(*, profile:profiles(id, full_name, role))")
      .order("created_at", { ascending: false });

    if (status && status !== "all") {
      query = query.eq("status", status);
    }

    const { data: dbTickets, error } = await query;
    if (error) {
      console.warn("[Admin Tickets GET] Supabase query notice:", error.message);
      return NextResponse.json({ success: true, data: [] });
    }

    // Transform into admin client shape
    const tickets = (dbTickets || []).map((t: any) => {
      const ticketNo = `TCK-${t.id.slice(0, 4).toUpperCase()}`;
      const messages: any[] = [];

      // Initial ticket description message
      if (t.description) {
        messages.push({
          id: `msg-init-${t.id}`,
          sender: "customer",
          senderName: t.profile?.full_name || "Customer",
          text: t.description,
          sentAt: t.created_at,
        });
      }

      // Add conversation replies
      if (Array.isArray(t.replies)) {
        t.replies.forEach((r: any) => {
          const isAdmin = r.profile?.role === "admin" || r.profile?.role === "staff";
          messages.push({
            id: r.id,
            sender: isAdmin ? "admin" : "customer",
            senderName: r.profile?.full_name || (isAdmin ? "AUREVIA Concierge" : "Customer"),
            text: r.message,
            sentAt: r.created_at,
          });
        });
      }

      return {
        id: t.id,
        ticketNo,
        customerName: t.profile?.full_name || "Customer",
        customerEmail: t.profile?.email || "",
        customerPhone: t.profile?.phone || undefined,
        bookingReference: t.booking?.reference_code || t.booking_id || undefined,
        category: t.category || "General Question",
        subject: t.subject,
        status: t.status || "open",
        priority: t.priority || "normal",
        createdAt: t.created_at,
        updatedAt: t.updated_at || t.created_at,
        messages,
      };
    });

    return NextResponse.json({
      success: true,
      data: tickets,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "An unexpected error occurred";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { user, response } = await verifyApiAuth(req, ["admin", "staff", "super_admin"]);
    if (response || !user) return response!;

    const body = await req.json();
    const { ticketId, replyText, senderName } = body;

    if (!ticketId || !replyText) {
      return NextResponse.json({ success: false, error: "ticketId and replyText are required" }, { status: 400 });
    }

    const supabase = await createServiceSupabaseClient();

    // 1. Fetch ticket details
    const { data: ticket, error: tErr } = await supabase
      .from("support_tickets")
      .select("*, profile:profiles(id, full_name, email)")
      .eq("id", ticketId)
      .single();

    if (tErr || !ticket) {
      return NextResponse.json({ success: false, error: "Ticket not found" }, { status: 404 });
    }

    // 2. Insert reply message into ticket_replies
    const { data: reply, error: rErr } = await supabase
      .from("ticket_replies")
      .insert({
        ticket_id: ticketId,
        sender_id: user.id,
        message: replyText.trim(),
      })
      .select()
      .single();

    if (rErr) {
      return NextResponse.json({ success: false, error: rErr.message }, { status: 500 });
    }

    // 3. Update ticket status & updatedAt timestamp
    await supabase
      .from("support_tickets")
      .update({
        status: "pending_customer",
        updated_at: new Date().toISOString(),
      })
      .eq("id", ticketId);

    // 4. Audit Log
    await recordAuditLog({
      actorId: user.id,
      actorEmail: user.email,
      action: "ticket.reply_sent",
      resource: "support_tickets",
      resourceId: ticketId,
      metadata: { replyId: reply.id },
    }).catch(() => {});

    // 5. Broadcast Realtime Event
    realtimeHub.broadcast("TICKET_UPDATED", { ticketId, status: "pending_customer" }, "admin");

    // 6. Send email notification to customer
    const ticketNo = `TCK-${ticket.id.slice(0, 4).toUpperCase()}`;
    const customerEmail = ticket.profile?.email;
    const customerName = ticket.profile?.full_name || "Valued Filmmaker";

    if (customerEmail) {
      const emailSubject = `Update on Support Ticket [${ticketNo}]: ${ticket.subject}`;
      const html = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f4f4f5; padding: 32px 0;">
          <div style="max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 8px; border: 1px solid #e4e4e7; overflow: hidden;">
            <div style="padding: 24px 32px; border-bottom: 1px solid #e4e4e7;">
              <p style="margin: 0; font-size: 18px; font-weight: 700; color: #0a0a0a; font-family: Georgia, serif; letter-spacing: 0.15em;">AUREVIA</p>
              <p style="margin: 4px 0 0; font-size: 10px; color: #71717a; text-transform: uppercase;">Concierge Support Response</p>
            </div>
            <div style="padding: 32px;">
              <p style="margin: 0 0 16px; font-size: 14px; font-weight: 600; color: #0a0a0a;">Dear ${customerName},</p>
              <p style="font-size: 14px; line-height: 1.6; color: #3f3f46;">Our support team has updated your ticket <strong>${ticketNo}</strong>:</p>
              <div style="margin: 16px 0; padding: 16px; background-color: #f4f4f5; border-left: 3px solid #0a0a0a; font-size: 14px; color: #18181b;">
                ${replyText.replace(/\n/g, "<br>")}
              </div>
              <p style="font-size: 12px; color: #71717a;">Log in to your account dashboard to view full ticket history.</p>
            </div>
            <div style="padding: 20px 32px; border-top: 1px solid #e4e4e7; font-size: 11px; color: #a1a1aa;">
              AUREVIA Luxury Camera Rentals · Concierge Customer Care
            </div>
          </div>
        </div>
      `;

      await sendEmail({
        to: customerEmail,
        subject: emailSubject,
        html,
        text: `Dear ${customerName},\n\nSupport Ticket Update [${ticketNo}]:\n${replyText}`,
        idempotencyKey: `tck-resp-${ticketId}-${Date.now()}`,
        notificationType: "ticket_reply",
      }).catch((e) => console.error("[Admin Tickets POST] sendEmail error:", e));
    }

    return NextResponse.json({
      success: true,
      data: { ticketId, status: "pending_customer", reply },
      message: "Ticket reply posted & customer notified via email.",
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "An unexpected error occurred";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { user, response } = await verifyApiAuth(req, ["admin", "staff", "super_admin"]);
    if (response || !user) return response!;

    const body = await req.json();
    const { ticketId, status, priority } = body;

    if (!ticketId) {
      return NextResponse.json({ success: false, error: "ticketId is required" }, { status: 400 });
    }

    const supabase = await createServiceSupabaseClient();
    const updatePayload: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };
    if (status) updatePayload.status = status;
    if (priority) updatePayload.priority = priority;

    const { data: updated, error } = await supabase
      .from("support_tickets")
      .update(updatePayload)
      .eq("id", ticketId)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    realtimeHub.broadcast("TICKET_UPDATED", { ticketId, status, priority }, "admin");
    return NextResponse.json({ success: true, data: updated });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "An unexpected error occurred";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
