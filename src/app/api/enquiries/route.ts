import { NextRequest, NextResponse } from "next/server";
import { createServiceSupabaseClient } from "@/lib/supabase/server";
import { realtimeHub } from "@/lib/realtime/realtimeHub";
import { sendEmail } from "@/lib/email/mailer";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { customerName, customerEmail, customerPhone, subject, equipmentInterest, rentalDates, message } = body;

    if (!customerName || !customerEmail || !message) {
      return NextResponse.json({ success: false, error: "Name, email, and message are required" }, { status: 400 });
    }

    const refNo = `ENQ-${Math.floor(1000 + Math.random() * 9000)}`;
    const newEnquiry = {
      id: `enq-${Date.now()}`,
      referenceNo: refNo,
      customerName: customerName.trim(),
      customerEmail: customerEmail.trim().toLowerCase(),
      customerPhone: customerPhone?.trim() || "Not provided",
      subject: subject || "Rental Inquiry",
      equipmentInterest: equipmentInterest?.trim() || "General Cinema Gear",
      rentalDates: rentalDates?.trim() || undefined,
      message: message.trim(),
      status: "new",
      priority: subject === "rental" || subject === "urgent" ? "high" : "medium",
      createdAt: new Date().toISOString(),
      responses: [],
    };

    const supabase = await createServiceSupabaseClient();

    // 1. Fetch existing enquiries from Supabase website_settings
    const { data: existingSetting } = await supabase
      .from("website_settings")
      .select("value")
      .eq("key", "aurevia_online_enquiries")
      .maybeSingle();

    let enquiries: any[] = [];
    if (existingSetting?.value) {
      try {
        enquiries = JSON.parse(existingSetting.value);
        if (!Array.isArray(enquiries)) enquiries = [];
      } catch {}
    }

    // Prepend new enquiry
    enquiries.unshift(newEnquiry);

    // Persist back to Supabase
    await supabase.from("website_settings").upsert({
      key: "aurevia_online_enquiries",
      value: JSON.stringify(enquiries),
    });

    // 2. Insert notification into Supabase notifications table
    await supabase.from("notifications").insert({
      title: "New Online Enquiry",
      message: `Enquiry #${refNo} received from ${customerName} (${customerEmail}): "${subject || "Rental inquiry"}"`,
    }).catch(() => {});

    // 3. Broadcast Realtime Event to Admin Panel
    realtimeHub.broadcast("ENQUIRY_UPDATED", { enquiryId: newEnquiry.id, status: "new" }, "public_website");

    // 4. Send Confirmation Email to Customer & Alert to Owner
    const ownerEmail = "premmundargi135@gmail.com";
    sendEmail({
      to: customerEmail,
      subject: `[${refNo}] We received your inquiry - AUREVIA Concierge`,
      text: `Hello ${customerName},\n\nThank you for reaching out to AUREVIA. We have received your inquiry #${refNo} regarding "${subject}". Our concierge team will review your request and reply shortly.\n\nBest regards,\nAUREVIA Concierge Team`,
      html: `
        <div style="font-family: -apple-system, sans-serif; padding: 24px; color: #18181b;">
          <h2 style="color: #0a0a0a;">Inquiry Received [${refNo}]</h2>
          <p>Hello <strong>${customerName}</strong>,</p>
          <p>Thank you for contacting AUREVIA. Our concierge team has received your message regarding <strong>${subject}</strong> and will get back to you promptly.</p>
          <blockquote style="background: #f4f4f5; padding: 12px; border-left: 3px solid #d8b36a; margin: 16px 0;">
            ${message.replace(/\n/g, "<br>")}
          </blockquote>
          <p style="font-size: 12px; color: #71717a;">AUREVIA Luxury Camera Rentals · Customer Care</p>
        </div>
      `,
      notificationType: "general",
    }).catch(() => {});

    sendEmail({
      to: ownerEmail,
      subject: `[AUREVIA Enquiry #${refNo}] ${customerName} - ${subject}`,
      text: `New online inquiry #${refNo} from ${customerName} (${customerEmail}, ${customerPhone || "N/A"}):\n\nGear: ${equipmentInterest || "General"}\nDates: ${rentalDates || "N/A"}\n\nMessage:\n${message}`,
      notificationType: "general",
    }).catch(() => {});

    return NextResponse.json({
      success: true,
      referenceNo: refNo,
      data: newEnquiry,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to submit enquiry";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
