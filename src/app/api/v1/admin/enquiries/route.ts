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
    const { data: setting } = await supabase
      .from("website_settings")
      .select("value")
      .eq("key", "aurevia_online_enquiries")
      .maybeSingle();

    let enquiries: any[] = [];
    if (setting?.value) {
      try {
        enquiries = JSON.parse(setting.value);
        if (!Array.isArray(enquiries)) enquiries = [];
      } catch {}
    }

    if (status && status !== "all") {
      enquiries = enquiries.filter((e) => e.status === status);
    }

    return NextResponse.json({
      success: true,
      data: enquiries,
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
    const { enquiryId, responseText, respondedBy } = body;

    if (!enquiryId || !responseText) {
      return NextResponse.json({ success: false, error: "enquiryId and responseText are required" }, { status: 400 });
    }

    const supabase = await createServiceSupabaseClient();
    const { data: setting } = await supabase
      .from("website_settings")
      .select("value")
      .eq("key", "aurevia_online_enquiries")
      .maybeSingle();

    let enquiries: any[] = [];
    if (setting?.value) {
      try {
        enquiries = JSON.parse(setting.value);
        if (!Array.isArray(enquiries)) enquiries = [];
      } catch {}
    }

    const idx = enquiries.findIndex((e) => e.id === enquiryId);
    if (idx === -1) {
      return NextResponse.json({ success: false, error: "Enquiry not found" }, { status: 404 });
    }

    const newResponse = {
      id: `resp-${Date.now()}`,
      responseText: responseText.trim(),
      sentAt: new Date().toISOString(),
      respondedBy: respondedBy || "AUREVIA Concierge Team",
    };

    enquiries[idx] = {
      ...enquiries[idx],
      status: "resolved",
      responses: [...(enquiries[idx].responses || []), newResponse],
    };

    // Save back to Supabase
    await supabase.from("website_settings").upsert({
      key: "aurevia_online_enquiries",
      value: JSON.stringify(enquiries),
    });

    // Record Audit Log
    await recordAuditLog({
      actorId: user.id,
      actorEmail: user.email,
      action: "enquiry.responded",
      resource: "website_settings",
      resourceId: enquiryId,
      metadata: { recipient: enquiries[idx].customerEmail },
    }).catch(() => {});

    // Broadcast Realtime Event
    realtimeHub.broadcast("ENQUIRY_UPDATED", { enquiryId, status: "resolved" }, "admin");

    // Send email response to customer via Gmail SMTP
    const targetEnquiry = enquiries[idx];
    const emailSubject = `Re: [${targetEnquiry.referenceNo}] ${targetEnquiry.subject}`;
    const html = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f4f4f5; padding: 32px 0;">
        <div style="max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 8px; border: 1px solid #e4e4e7; overflow: hidden;">
          <div style="padding: 24px 32px; border-bottom: 1px solid #e4e4e7;">
            <p style="margin: 0; font-size: 18px; font-weight: 700; color: #0a0a0a; font-family: Georgia, serif; letter-spacing: 0.15em;">AUREVIA</p>
            <p style="margin: 4px 0 0; font-size: 10px; color: #71717a; text-transform: uppercase;">Concierge Customer Support</p>
          </div>
          <div style="padding: 32px;">
            <p style="margin: 0 0 16px; font-size: 14px; font-weight: 600; color: #0a0a0a;">Dear ${targetEnquiry.customerName},</p>
            <p style="font-size: 14px; line-height: 1.6; color: #3f3f46;">${responseText.replace(/\n/g, "<br>")}</p>
            <div style="margin-top: 24px; padding: 16px; background-color: #f4f4f5; border-radius: 6px; font-size: 12px; color: #71717a;">
              <strong>Original Inquiry (${targetEnquiry.referenceNo}):</strong><br>
              "${targetEnquiry.message}"
            </div>
          </div>
          <div style="padding: 20px 32px; border-top: 1px solid #e4e4e7; font-size: 11px; color: #a1a1aa;">
            AUREVIA Luxury Camera Rentals · Concierge Team<br>
            Reply directly to this email for further assistance.
          </div>
        </div>
      </div>
    `;

    await sendEmail({
      to: targetEnquiry.customerEmail,
      subject: emailSubject,
      html,
      text: `Dear ${targetEnquiry.customerName},\n\n${responseText}\n\nOriginal Inquiry: ${targetEnquiry.message}`,
      idempotencyKey: `enq-resp-${enquiryId}-${Date.now()}`,
      notificationType: "enquiry_response",
    }).catch((e) => console.error("[Admin Enquiries POST] sendEmail error:", e));

    return NextResponse.json({
      success: true,
      data: targetEnquiry,
      message: "Response sent to customer via email & query marked as resolved.",
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
    const { id, status } = body;

    const supabase = await createServiceSupabaseClient();
    const { data: setting } = await supabase
      .from("website_settings")
      .select("value")
      .eq("key", "aurevia_online_enquiries")
      .maybeSingle();

    let enquiries: any[] = [];
    if (setting?.value) {
      try {
        enquiries = JSON.parse(setting.value);
        if (!Array.isArray(enquiries)) enquiries = [];
      } catch {}
    }

    const idx = enquiries.findIndex((e) => e.id === id);
    if (idx !== -1) {
      enquiries[idx].status = status;
      await supabase.from("website_settings").upsert({
        key: "aurevia_online_enquiries",
        value: JSON.stringify(enquiries),
      });
      realtimeHub.broadcast("ENQUIRY_UPDATED", { enquiryId: id, status }, "admin");
      return NextResponse.json({ success: true, data: enquiries[idx] });
    }

    return NextResponse.json({ success: false, error: "Enquiry not found" }, { status: 404 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "An unexpected error occurred";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
