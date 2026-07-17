import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import { db } from "@/lib/db/store";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const { isSupabaseConfigured } = await import("@/lib/db/store");
    const body = await request.json().catch(() => ({}));
    const { refundId, action, adminNotes } = body; // action: "approve" | "reject"

    if (!refundId || !action) {
      return NextResponse.json({ error: "Missing required fields (refundId, action)." }, { status: 400 });
    }

    let actorName = "Admin";
    let actorEmail = "";

    // 1. Authorize Admin/Staff
    if (isSupabaseConfigured()) {
      const supabase = await createServerSupabaseClient();
      const { data: { user }, error: authErr } = await supabase.auth.getUser();
      if (authErr || !user) {
        return NextResponse.json({ error: "Unauthorized. Must be logged in." }, { status: 401 });
      }
      
      const { data } = await supabase.from("profiles").select("role, full_name, email").eq("id", user.id).single();
      const profileRaw = data as any;
      if (!profileRaw || !["admin", "staff"].includes(profileRaw.role)) {
        return NextResponse.json({ error: "Forbidden. Insufficient permissions." }, { status: 403 });
      }
      actorName = profileRaw.full_name || "Admin";
      actorEmail = profileRaw.email || "";
    } else {
      // Mock mode auth fallback
      const profile = await db.getProfile();
      if (!["admin", "staff"].includes(profile.role)) {
        return NextResponse.json({ error: "Forbidden. Insufficient permissions." }, { status: 403 });
      }
      actorName = profile.fullName;
      actorEmail = profile.email;
    }

    // 2. Fetch refund request details
    const refund = await db.getRefundById(refundId);
    if (!refund) {
      return NextResponse.json({ error: "Refund request not found." }, { status: 404 });
    }

    if (refund.status !== "requested") {
      return NextResponse.json({ error: `Refund request already processed (status: ${refund.status}).` }, { status: 400 });
    }

    const bookingId = refund.booking_id;
    const amount = Number(refund.amount);

    if (action === "reject") {
      await db.updateRefundStatus(refundId, "failed", adminNotes || "Rejected by admin");
      
      // Log audit
      if (isSupabaseConfigured()) {
        const supabase = await createServerSupabaseClient();
        await (supabase.from("audit_logs") as any).insert({
          action: "refund_rejected",
          details: `Refund rejected by ${actorName} (${actorEmail}). Reason: ${adminNotes || 'N/A'}. Booking: ${bookingId}`,
          ip_address: request.headers.get("x-forwarded-for") || "127.0.0.1",
        });
      }
      return NextResponse.json({ success: true, message: "Refund request rejected successfully." });
    }

    // 3. Process Refund Approve
    if (isSupabaseConfigured()) {
      const supabase = await createServerSupabaseClient();

      // Find successful transaction/payment ID from payments table
      const { data } = await supabase
        .from("payments")
        .select("transaction_id")
        .eq("booking_id", bookingId)
        .eq("status", "success")
        .maybeSingle();

      const payment = data as any;
      if (!payment || !payment.transaction_id) {
        return NextResponse.json({ error: "No successful payment transaction found for this booking." }, { status: 400 });
      }

      // Initialize Razorpay SDK
      const keyId = process.env.RAZORPAY_KEY_ID;
      const keySecret = process.env.RAZORPAY_KEY_SECRET;
      if (!keyId || !keySecret) {
        return NextResponse.json({ error: "Razorpay keys not configured." }, { status: 500 });
      }

      const razorpay = new Razorpay({
        key_id: keyId,
        key_secret: keySecret,
      });

      // Call Razorpay Refund API (amount in paise)
      const amountPaise = Math.round(amount * 100);
      try {
        console.log(`Initiating Razorpay refund for payment ${payment.transaction_id} of amount ₹${amount}...`);
        const rpRefund = await razorpay.payments.refund(payment.transaction_id, {
          amount: amountPaise,
          notes: {
            booking_id: bookingId,
            refund_reason: adminNotes || "Customer cancellation approved",
          }
        });

        // Update database: refund status and booking status
        await db.updateRefundStatus(refundId, "completed", adminNotes || "Approved", rpRefund.id);
        await (supabase.from("bookings") as any).update({ payment_status: "refunded", status: "cancelled" }).eq("id", bookingId);
        
        // Log audit
        await (supabase.from("audit_logs") as any).insert({
          action: "refund_approved_success",
          details: `Refund approved by ${actorName}. Rzp Refund ID: ${rpRefund.id}. Amount: ₹${amount}. Booking: ${bookingId}`,
          ip_address: request.headers.get("x-forwarded-for") || "127.0.0.1",
        });
      } catch (err: any) {
        console.error("Razorpay refund API call failed:", err);
        await db.updateRefundStatus(refundId, "failed", `Razorpay API error: ${err.message}`);
        return NextResponse.json({ error: `Razorpay Refund failed: ${err.message}` }, { status: 500 });
      }
    } else {
      // Mock mode refund logic
      await db.updateRefundStatus(refundId, "completed", adminNotes || "Mock Refund Approved", `mock_ref_${Date.now()}`);
      
      const bookings = (db as any).getLocalBookings ? (db as any).getLocalBookings() : [];
      const bIdx = bookings.findIndex((b: any) => b.id === bookingId);
      if (bIdx !== -1) {
        bookings[bIdx].paymentStatus = "refunded";
        bookings[bIdx].status = "cancelled";
        if ((db as any).saveLocalBookings) {
          (db as any).saveLocalBookings(bookings);
        }
      }
    }

    // Automatic email notify
    const updatedBooking = await db.getBookingById(bookingId);
    if (updatedBooking) {
      if (typeof window === "undefined") {
        import("@/lib/email/mailer").then((m) => {
          m.sendBookingCancelled(updatedBooking).catch((e) => console.error("Email send failed", e));
        });
      }
    }

    return NextResponse.json({ success: true, message: "Refund processed successfully." });
  } catch (err: any) {
    console.error("Refund handler error:", err);
    return NextResponse.json({ error: err.message || "Failed to process refund." }, { status: 500 });
  }
}
