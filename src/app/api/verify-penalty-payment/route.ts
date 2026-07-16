import { NextResponse } from "next/server";
import crypto from "crypto";
import { db } from "@/lib/db/store";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, bookingId } = body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !bookingId) {
      return NextResponse.json(
        { error: "Missing required payment verification fields." },
        { status: 400 }
      );
    }

    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keySecret) {
      return NextResponse.json(
        { error: "Razorpay API secret is not configured on the server." },
        { status: 401 }
      );
    }

    const generated_signature = crypto
      .createHmac("sha256", keySecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    const signaturesMatch = (() => {
      try {
        return crypto.timingSafeEqual(
          Buffer.from(generated_signature, "hex"),
          Buffer.from(razorpay_signature, "hex")
        );
      } catch {
        return false;
      }
    })();

    if (signaturesMatch) {
      // 1. Transaction verified, update penalty status in database
      const success = await db.payPenalty(bookingId);
      if (success) {
        return NextResponse.json({ success: true });
      } else {
        return NextResponse.json({ error: "Failed to update penalty status in database." }, { status: 500 });
      }
    } else {
      return NextResponse.json({ error: "Payment verification failed. Signature mismatch." }, { status: 400 });
    }
  } catch (err: any) {
    console.error("Penalty verification error:", err);
    return NextResponse.json({ error: err.message || "Internal server error during verification." }, { status: 500 });
  }
}
