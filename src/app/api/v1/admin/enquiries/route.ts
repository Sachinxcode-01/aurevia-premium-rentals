import { NextRequest, NextResponse } from "next/server";
import { engagementStore } from "@/lib/db/engagementStore";
import { sendEmail } from "@/lib/email/mailer";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");

    let enquiries = engagementStore.getEnquiries();
    if (status && status !== "all") {
      enquiries = enquiries.filter((e) => e.status === status);
    }

    return NextResponse.json({
      success: true,
      data: enquiries,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { enquiryId, responseText, respondedBy } = body;

    if (!enquiryId || !responseText) {
      return NextResponse.json({ success: false, error: "enquiryId and responseText are required" }, { status: 400 });
    }

    const updatedEnquiry = engagementStore.respondToEnquiry(enquiryId, responseText, respondedBy || "AUREVIA Concierge Team");

    if (!updatedEnquiry) {
      return NextResponse.json({ success: false, error: "Enquiry not found" }, { status: 404 });
    }

    // Send email response to customer via Gmail SMTP
    const emailSubject = `Re: [${updatedEnquiry.referenceNo}] ${updatedEnquiry.subject}`;
    const html = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f4f4f5; padding: 32px 0;">
        <div style="max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 8px; border: 1px solid #e4e4e7; overflow: hidden;">
          <div style="padding: 24px 32px; border-bottom: 1px solid #e4e4e7;">
            <p style="margin: 0; font-size: 18px; font-weight: 700; color: #0a0a0a; font-family: Georgia, serif; letter-spacing: 0.15em;">AUREVIA</p>
            <p style="margin: 4px 0 0; font-size: 10px; color: #71717a; text-transform: uppercase;">Concierge Customer Support</p>
          </div>
          <div style="padding: 32px;">
            <p style="margin: 0 0 16px; font-size: 14px; font-weight: 600; color: #0a0a0a;">Dear ${updatedEnquiry.customerName},</p>
            <p style="font-size: 14px; line-height: 1.6; color: #3f3f46;">${responseText.replace(/\n/g, "<br>")}</p>
            <div style="margin-top: 24px; padding: 16px; background-color: #f4f4f5; border-radius: 6px; font-size: 12px; color: #71717a;">
              <strong>Original Inquiry (${updatedEnquiry.referenceNo}):</strong><br>
              "${updatedEnquiry.message}"
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
      to: updatedEnquiry.customerEmail,
      subject: emailSubject,
      html,
      text: `Dear ${updatedEnquiry.customerName},\n\n${responseText}\n\nOriginal Inquiry: ${updatedEnquiry.message}`,
      idempotencyKey: `enq-resp-${enquiryId}-${Date.now()}`,
      notificationType: "enquiry_response",
    });

    return NextResponse.json({
      success: true,
      data: updatedEnquiry,
      message: "Response sent to customer via email & query marked as resolved.",
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, status, adminNotes } = body;

    const updated = engagementStore.updateEnquiryStatus(id, status, adminNotes);
    return NextResponse.json({ success: true, data: updated });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
