import { NextRequest, NextResponse } from "next/server";
import { engagementStore } from "@/lib/db/engagementStore";
import { sendEmail } from "@/lib/email/mailer";
import { verifyApiAuth } from "@/lib/auth/rbac";

export async function GET(req: NextRequest) {
  try {
    const { user, response } = await verifyApiAuth(req, ["admin", "staff", "super_admin"]);
    if (response || !user) return response!;

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");

    let tickets = engagementStore.getTickets();
    if (status && status !== "all") {
      tickets = tickets.filter((t) => t.status === status);
    }

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

    const updatedTicket = engagementStore.replyToTicket(ticketId, replyText, senderName || "AUREVIA Support");

    if (!updatedTicket) {
      return NextResponse.json({ success: false, error: "Ticket not found" }, { status: 404 });
    }

    // Send email notification to customer
    const emailSubject = `Update on Support Ticket [${updatedTicket.ticketNo}]: ${updatedTicket.subject}`;
    const html = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f4f4f5; padding: 32px 0;">
        <div style="max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 8px; border: 1px solid #e4e4e7; overflow: hidden;">
          <div style="padding: 24px 32px; border-bottom: 1px solid #e4e4e7;">
            <p style="margin: 0; font-size: 18px; font-weight: 700; color: #0a0a0a; font-family: Georgia, serif; letter-spacing: 0.15em;">AUREVIA</p>
            <p style="margin: 4px 0 0; font-size: 10px; color: #71717a; text-transform: uppercase;">Concierge Support Response</p>
          </div>
          <div style="padding: 32px;">
            <p style="margin: 0 0 16px; font-size: 14px; font-weight: 600; color: #0a0a0a;">Dear ${updatedTicket.customerName},</p>
            <p style="font-size: 14px; line-height: 1.6; color: #3f3f46;">Our support team has updated your ticket <strong>${updatedTicket.ticketNo}</strong>:</p>
            <div style="margin: 16px 0; padding: 16px; background-color: #f4f4f5; border-left: 3px solid #0a0a0a; font-size: 14px; color: #18181b;">
              ${replyText.replace(/\n/g, "<br>")}
            </div>
            <p style="font-size: 12px; color: #71717a;">Log in to your account dashboard to view full ticket history.</p>
          </div>
          <div style="padding: 20px 32px; border-top: 1px solid #e4e4e7; font-size: 11px; color: #a1a1aa;">
            AUREVIA Luxury Camera Rentals · Customer Care
          </div>
        </div>
      </div>
    `;

    await sendEmail({
      to: updatedTicket.customerEmail,
      subject: emailSubject,
      html,
      text: `Dear ${updatedTicket.customerName},\n\nSupport Ticket Update [${updatedTicket.ticketNo}]:\n${replyText}`,
      idempotencyKey: `tck-resp-${ticketId}-${Date.now()}`,
      notificationType: "ticket_reply",
    });

    return NextResponse.json({
      success: true,
      data: updatedTicket,
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

    const updated = engagementStore.updateTicketStatus(ticketId, status, priority);
    return NextResponse.json({ success: true, data: updated });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "An unexpected error occurred";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
