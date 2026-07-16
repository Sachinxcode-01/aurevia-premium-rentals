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

    if (!webhookSecret) {
      return NextResponse.json({ error: "Razorpay Webhook Secret is not configured on the server." }, { status: 500 });
    }

    // 1. Signature Verification
    const expectedSignature = crypto
      .createHmac("sha256", webhookSecret)
      .update(rawBody)
      .digest("hex");

    if (expectedSignature !== signature) {
      return NextResponse.json({ error: "Webhook signature verification failed." }, { status: 400 });
    }

    // Parse payload
    const body = JSON.parse(rawBody);
    const event = body.event;

    // Supported payment confirmation events
    if (event === "payment.captured" || event === "order.paid") {
      const paymentEntity = body.payload?.payment?.entity;
      const orderEntity = body.payload?.order?.entity;

      const transactionId = paymentEntity?.id || "";
      const orderId = paymentEntity?.order_id || orderEntity?.id || "";
      const amountPaise = paymentEntity?.amount || orderEntity?.amount || 0;
      const amountInr = amountPaise / 100;
      const method = paymentEntity?.method || "razorpay";

      // Attempt to extract receipt (which is the booking reference code)
      const referenceCode = paymentEntity?.notes?.receipt || orderEntity?.receipt || "";

      if (!referenceCode && !orderId) {
        return NextResponse.json({ error: "Missing receipt or order_id in webhook payload." }, { status: 400 });
      }

      // Initialize Supabase Client
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
      const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
      const supabase = createClient(supabaseUrl, supabaseKey);

      // 2. Idempotency Check (prevent duplicate processing)
      if (transactionId) {
        const { data: existingPayment } = await supabase
          .from("payments")
          .select("id")
          .eq("transaction_id", transactionId)
          .single();

        if (existingPayment) {
          return NextResponse.json({ received: true, message: "Duplicate webhook event bypassed." });
        }
      }

      // 3. Find booking by reference code (or order ID in notes)
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
        // Fallback search by reference code format in notes if orderId matches or search in logs
        // Usually, reference_code is AV-YYYY-XXXXX
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

      // 4. Confirm Payment and Assign Inventory Unit
      if (bookingRow.payment_status !== "paid") {
        // Call store method to assign unit and update status to approval_pending/paid
        const assigned = await db.assignAvailableUnit(bookingId);

        if (assigned) {
          // Record the transaction
          await supabase.from("payments").insert({
            booking_id: bookingId,
            transaction_id: transactionId || `txn_${Date.now()}`,
            amount: amountInr,
            status: "success",
            payment_method: method,
          });

          return NextResponse.json({ success: true, message: "Payment confirmed and unit assigned successfully." });
        } else {
          // Double-booking conflict (no units left) - cancel/refund booking
          await db.updateBookingStatus(bookingId, "cancelled", "Inventory conflict: Camera booked by another user during payment process.", "razorpay_webhook");
          
          await supabase.from("payments").insert({
            booking_id: bookingId,
            transaction_id: transactionId || `txn_${Date.now()}`,
            amount: amountInr,
            status: "failed",
            payment_method: method,
          });

          return NextResponse.json({ error: "Inventory conflict: Booking cancelled and flagged for refund." }, { status: 409 });
        }
      }

      return NextResponse.json({ received: true, message: "Payment already processed." });
    }

    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.error("Razorpay webhook error:", err);
    return NextResponse.json({ error: err.message || "Internal server error during webhook processing." }, { status: 500 });
  }
}
