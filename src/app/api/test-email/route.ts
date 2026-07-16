import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const secret = searchParams.get("secret");

    const expectedSecret = process.env.ADMIN_SEED_SECRET || "testsecret";
    if (secret !== expectedSecret) {
      return NextResponse.json({ error: "Unauthorized. Please specify the correct secret query parameter." }, { status: 401 });
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
