import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import { db } from "@/lib/db/store";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { bookingId } = body;

    if (!bookingId) {
      return NextResponse.json({ error: "Missing bookingId." }, { status: 400 });
    }

    // Retrieve booking details
    const booking = await db.getBookingById(bookingId);
    if (!booking) {
      return NextResponse.json({ error: "Booking not found." }, { status: 404 });
    }

    const damageCost = Number(booking.damageCost || 0);
    const lateFee = Number(booking.lateFee || 0);
    const totalPenalty = damageCost + lateFee;

    if (totalPenalty <= 0) {
      return NextResponse.json({ error: "No penalty charges assessed for this booking." }, { status: 400 });
    }

    if (booking.penaltyPaymentStatus === "paid") {
      return NextResponse.json({ error: "Penalty charges have already been paid." }, { status: 400 });
    }

    // Initialize Razorpay
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      return NextResponse.json({ error: "Razorpay API credentials not configured." }, { status: 401 });
    }

    const razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });

    const amountPaise = Math.round(totalPenalty * 100);

    const order = await razorpay.orders.create({
      amount: amountPaise,
      currency: "INR",
      receipt: `penalty_${bookingId}_${Date.now()}`,
      notes: {
        bookingId,
        referenceCode: booking.referenceCode,
        contactName: booking.contactName,
        contactEmail: booking.contactEmail,
        contactPhone: booking.contactPhone,
        type: "penalty"
      }
    });

    return NextResponse.json({
      order_id: order.id,
      amount: order.amount,
      currency: order.currency,
      key_id: keyId
    });
  } catch (err: any) {
    console.error("Penalty order creation failed:", err);
    return NextResponse.json({ error: err.message || "Failed to create Razorpay order." }, { status: 500 });
  }
}
