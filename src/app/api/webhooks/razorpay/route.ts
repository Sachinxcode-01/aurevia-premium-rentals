import { NextResponse } from "next/server";
import crypto from "crypto";
import { db } from "@/lib/db/store";
import { createClient } from "@supabase/supabase-js";

export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get("x-razorpay-signature");
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

    if (!signature) {
      return NextResponse.json({ error: "Missing webhook signature header." }, { status: 400 });
    }

    if (!webhookSecret || webhookSecret.includes("PLACEHOLDER")) {
      return NextResponse.json({ error: "Razorpay Webhook Secret is not configured on the server." }, { status: 500 });
    }

    // 1. Webhook Signature Verification
    const expectedSignature = crypto
      .createHmac("sha256", webhookSecret)
      .update(rawBody)
      .digest("hex");

    if (expectedSignature !== signature) {
      return NextResponse.json({ error: "Webhook signature verification failed." }, { status: 400 });
    }

    const body = JSON.parse(rawBody);
    const event = body.event;

    // We process only payment.captured and order.paid
    if (event === "payment.captured" || event === "order.paid") {
      const paymentEntity = body.payload?.payment?.entity;
      const orderEntity = body.payload?.order?.entity;

      const transactionId = paymentEntity?.id || "";
      const orderId = paymentEntity?.order_id || orderEntity?.id || "";
      const amountPaise = paymentEntity?.amount || orderEntity?.amount || 0;
      const amountInr = amountPaise / 100;
      const method = paymentEntity?.method || "razorpay";
      const referenceCode = paymentEntity?.notes?.receipt || orderEntity?.receipt || "";

      if (!referenceCode && !orderId) {
        return NextResponse.json({ error: "Missing receipt reference in webhook payload." }, { status: 400 });
      }

      // Initialize Supabase Client
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
      const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
      const supabase = createClient(supabaseUrl, supabaseKey);

      // 2. Find booking by reference code (or order ID in notes)
      let bookingRow: any = null;
      if (referenceCode) {
        const { data } = await supabase
          .from("bookings")
          .select("*")
          .eq("reference_code", referenceCode)
          .single();
        bookingRow = data;
      }

      if (!bookingRow && orderId) {
        const { data } = await supabase
          .from("bookings")
          .select("*")
          .eq("notes", orderId)
          .single();
        bookingRow = data;
      }

      if (!bookingRow) {
        return NextResponse.json({ error: `Booking not found for reference code: ${referenceCode}` }, { status: 404 });
      }

      const bookingId = bookingRow.id;
      const eventKey = `webhook:razorpay:${body.id || transactionId}`;

      // 3. PostgreSQL Database Idempotency Check
      const isEventProcessed = await db.checkIdempotency(eventKey, body.id || transactionId, bookingId, "razorpay_webhook");
      if (isEventProcessed) {
        return NextResponse.json({ received: true, message: "Webhook event already processed." });
      }

      // 4. Validate order amount server-side (₹799 or ₹600 coupon daily checkout rates)
      const expectedAmount = Number(bookingRow.total_payable || 0);
      if (Math.abs(amountInr - expectedAmount) > 0.01) {
        // Tampered checkout payment! Block and cancel the booking.
        await db.updateBookingStatus(
          bookingId,
          "cancelled",
          `Fraud check: Payment amount mismatch. Expected ₹${expectedAmount}, but received ₹${amountInr}. Refusing handover.`,
          "razorpay_webhook"
        );

        // Mark the event attempt as logged/finished with fraud details
        await db.logProcessedEvent(eventKey, "failed", 1, body.id || transactionId, bookingId, "razorpay_webhook_fraud");
        return NextResponse.json({ error: "Fraudulent payment: Amount mismatch." }, { status: 400 });
      }

      // 5. Atomic db verification and unit allocation
      if (bookingRow.payment_status !== "paid") {
        const assigned = await db.assignAvailableUnit(bookingId);

        if (assigned) {
          // Record successful payment entry
          await supabase.from("payments").insert({
            booking_id: bookingId,
            transaction_id: transactionId || `txn_${Date.now()}`,
            amount: amountInr,
            status: "success",
            payment_method: method,
          });

          // Mark event as processed successfully
          await db.logProcessedEvent(eventKey, "processed", 1, body.id || transactionId, bookingId, "razorpay_webhook");
          return NextResponse.json({ success: true, message: "Payment confirmed and unit assigned successfully." });
        } else {
          // Double-booking conflict (exhausted physical camera stock concurrently)
          await db.updateBookingStatus(
            bookingId,
            "cancelled",
            "Inventory collision check failed: camera stock booked concurrently during checkout.",
            "razorpay_webhook"
          );

          await supabase.from("payments").insert({
            booking_id: bookingId,
            transaction_id: transactionId || `txn_${Date.now()}`,
            amount: amountInr,
            status: "failed",
            payment_method: method,
          });

          await db.logProcessedEvent(eventKey, "failed", 1, body.id || transactionId, bookingId, "razorpay_webhook_collision");
          return NextResponse.json({ error: "Inventory collision: booking cancelled for refund." }, { status: 409 });
        }
      }

      return NextResponse.json({ received: true, message: "Booking already marked paid." });
    }

    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.error("Razorpay webhook processing error:", err);
    // Secure error wrapping - do not leak internal system exceptions to client
    return NextResponse.json({ error: "Internal processing failure." }, { status: 500 });
  }
}
