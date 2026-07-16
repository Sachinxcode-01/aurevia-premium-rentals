import { NextResponse } from "next/server";
import { db } from "@/lib/db/store";
import { createClient } from "@supabase/supabase-js";
import { 
  sendPickupReminder, 
  sendReturnReminder, 
  sendPickupOTP,
  sendPaymentReceived,
  sendBookingApproved,
  sendBookingCompletion,
  sendBookingCancelled
} from "@/lib/email/mailer";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");
    const authHeader = request.headers.get("Authorization");
    const cronSecret = process.env.CRON_SECRET;
    const adminSecret = process.env.ADMIN_SEED_SECRET;

    // Verify authentication
    const isAuthorized = 
      (cronSecret && authHeader === `Bearer ${cronSecret}`) ||
      (adminSecret && token === adminSecret) ||
      (process.env.NODE_ENV === "development");

    if (!isAuthorized) {
      return NextResponse.json({ error: "Unauthorized access." }, { status: 401 });
    }

    const todayStr = new Date().toISOString().split("T")[0];
    const now = new Date();

    // Initialize Supabase Client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const log: string[] = [];

    // ─── 1. AUTO-CANCEL UNPAID BOOKINGS (> 1 HOUR OLD) ───────────────────
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    
    let bookingsToCancel: any[] = [];
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && !process.env.NEXT_PUBLIC_SUPABASE_URL.includes("your-project-id")) {
      const { data } = await supabase
        .from("bookings")
        .select("*")
        .eq("status", "pending")
        .eq("payment_status", "unpaid")
        .lt("created_at", oneHourAgo);
      bookingsToCancel = data || [];
    } else {
      // Mock local bookings auto-cancellation
      const localBookings = JSON.parse(localStorage.getItem("aurevia_bookings") || "[]");
      bookingsToCancel = localBookings.filter((b: any) => 
        b.status === "pending" && 
        b.paymentStatus === "unpaid" && 
        new Date(b.createdAt) < new Date(Date.now() - 60 * 60 * 1000)
      );
    }

    for (const b of bookingsToCancel) {
      await db.updateBookingStatus(
        b.id, 
        "cancelled", 
        "Unpaid reservation automatically cancelled after 1 hour.", 
        "cron_system"
      );
      log.push(`Auto-cancelled unpaid booking ${b.reference_code || b.referenceCode}`);
    }

    // ─── 2. AUTO-TRANSITION RENTALS TO OVERDUE ────────────────────────────
    let rentalsToOverdue: any[] = [];
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && !process.env.NEXT_PUBLIC_SUPABASE_URL.includes("your-project-id")) {
      const { data } = await supabase
        .from("bookings")
        .select("*")
        .eq("status", "rented")
        .lt("end_date", todayStr);
      rentalsToOverdue = data || [];
    } else {
      const localBookings = JSON.parse(localStorage.getItem("aurevia_bookings") || "[]");
      rentalsToOverdue = localBookings.filter((b: any) => b.status === "rented" && b.endDate < todayStr);
    }

    for (const b of rentalsToOverdue) {
      await db.updateBookingStatus(
        b.id, 
        "overdue", 
        "Active rental marked overdue. Expected return date was " + b.end_date, 
        "cron_system"
      );
      log.push(`Marked booking ${b.reference_code || b.referenceCode} as OVERDUE`);
    }

    // ─── 3. SEND AUTOMATED REMINDERS (PICKUPS & RETURNS) ──────────────────
    // Fetch all active bookings
    const bookings = await db.getBookings();
    
    // Pickups reminder: status = approved/ready_for_pickup, starting today or tomorrow
    const tomorrowStr = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split("T")[0];
    const pickupsNeedReminder = bookings.filter(b => 
      (b.status === "approved" || b.status === "ready_for_pickup") && 
      (b.startDate === todayStr || b.startDate === tomorrowStr)
    );

    for (const b of pickupsNeedReminder) {
      const eventKey = `email:pickup_reminder:${b.id}`;
      // In db check if already sent
      const isDuplicate = await db.checkIdempotency(eventKey, undefined, b.id, "pickup_reminder");
      if (!isDuplicate) {
        await sendPickupReminder(b);
        log.push(`Sent pickup reminder for booking ${b.referenceCode}`);
      }
    }

    // Returns reminder: status = rented, ending today or tomorrow
    const returnsNeedReminder = bookings.filter(b => 
      b.status === "rented" && 
      (b.endDate === todayStr || b.endDate === tomorrowStr)
    );

    for (const b of returnsNeedReminder) {
      const eventKey = `email:return_reminder:${b.id}`;
      const isDuplicate = await db.checkIdempotency(eventKey, undefined, b.id, "return_reminder");
      if (!isDuplicate) {
        await sendReturnReminder(b);
        log.push(`Sent return reminder for booking ${b.referenceCode}`);
      }
    }

    // ─── 4. FAILED EMAIL RETRIES ──────────────────────────────────────────
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && !process.env.NEXT_PUBLIC_SUPABASE_URL.includes("your-project-id")) {
      const { data: failedEvents } = await supabase
        .from("processed_events")
        .select("*")
        .eq("status", "failed")
        .like("event_key", "email:%");

      if (failedEvents && failedEvents.length > 0) {
        log.push(`Found ${failedEvents.length} failed email notification events. Retrying...`);
        for (const event of failedEvents) {
          // Delete from processed_events to clear idempotency constraint for retry
          await supabase.from("processed_events").delete().eq("event_key", event.event_key);
          
          const booking = await db.getBookingById(event.booking_id);
          if (!booking) continue;

          try {
            if (event.notification_type === "payment_received") {
              await sendPaymentReceived(booking);
            } else if (event.notification_type === "booking_approved") {
              await sendBookingApproved(booking);
            } else if (event.notification_type === "pickup_otp") {
              await sendPickupOTP(booking, booking.pickupOTP || "");
            } else if (event.notification_type === "pickup_reminder") {
              await sendPickupReminder(booking);
            } else if (event.notification_type === "return_reminder") {
              await sendReturnReminder(booking);
            } else if (event.notification_type === "booking_completion") {
              await sendBookingCompletion(booking);
            } else if (event.notification_type === "booking_cancelled") {
              await sendBookingCancelled(booking);
            }
            log.push(`Successfully retried and sent email for event: ${event.event_key}`);
          } catch (retryErr: any) {
            // Re-log failure
            await db.logProcessedEvent(event.event_key, "failed", (event.attempt_count || 1) + 1, undefined, event.booking_id, event.notification_type);
            log.push(`Retry failed again for event ${event.event_key}: ${retryErr.message}`);
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      timestamp: now.toISOString(),
      logs: log
    });
  } catch (err: any) {
    console.error("Cron booking-ops handler error:", err);
    return NextResponse.json({ error: "Internal automation processing failure.", details: err.message }, { status: 500 });
  }
}
