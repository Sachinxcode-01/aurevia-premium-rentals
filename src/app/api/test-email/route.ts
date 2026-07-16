import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    // 1. Disable in production
    if (process.env.NODE_ENV === "production") {
      return NextResponse.json({ error: "Email testing endpoint is disabled in production." }, { status: 403 });
    }

    // 2. Validate header-based authorization
    const secret = request.headers.get("x-seed-secret");
    const expectedSecret = process.env.ADMIN_SEED_SECRET;

    if (!expectedSecret || secret !== expectedSecret) {
      return NextResponse.json({ error: "Unauthorized. Missing or invalid authentication header." }, { status: 401 });
    }

    const testBooking = {
      referenceCode: "AV-TEST-99999",
      contactEmail: "premmundargi135@gmail.com",
      contactName: "Prem Mundargi Test",
      totalPayable: 799,
      endDate: new Date(Date.now() + 86400000).toISOString(),
    };

    const { sendPaymentReceived } = await import("@/lib/email/mailer");
    await sendPaymentReceived(testBooking);

    return NextResponse.json({
      success: true,
      message: "SMTP check succeeded: transactional payment emails dispatched to Prem and Customer.",
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
