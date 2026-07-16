import { NextResponse } from "next/server";
import crypto from "crypto";
import { db } from "@/lib/db/store";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, bookingId } = body;

    // Missing fields: return 400
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !bookingId) {
      return NextResponse.json(
        { error: "Missing required payment verification fields (order_id, payment_id, signature, bookingId)." },
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

    // Algorithm: HMAC-SHA256(order_id + "|" + payment_id, KEY_SECRET)
    const generated_signature = crypto
      .createHmac("sha256", keySecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    // Compare generated signature with razorpay_signature
    if (generated_signature === razorpay_signature) {
      // 1. Transaction is verified. Now assign the physical unit atomically!
      const assigned = await db.assignAvailableUnit(bookingId);
      
      if (assigned) {
        return NextResponse.json({ success: true });
      } else {
        // Double booking conflict: refund/cancel booking
        await db.updateBookingStatus(bookingId, "cancelled");
        return NextResponse.json(
          { error: "Inventory conflict: The camera was booked by another user during checkout. Payment refunded." },
          { status: 400 }
        );
      }
    } else {
      // Signature mismatch: return 400, do NOT mark as paid
      return NextResponse.json(
        { error: "Payment verification failed. Signature mismatch." },
        { status: 400 }
      );
    }
  } catch (err: any) {
    console.error("Razorpay verification error:", err);
    return NextResponse.json(
      { error: err.message || "Internal server error during verification." },
      { status: 500 }
    );
  }
}
