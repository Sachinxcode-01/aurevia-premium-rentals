import { NextResponse } from "next/server";
import { createServiceSupabaseClient } from "@/lib/supabase/server";
import { db } from "@/lib/db/store";
import { sendReturnReminder } from "@/lib/email/mailer";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");
    const authHeader = request.headers.get("Authorization");
    const cronSecret = process.env.CRON_SECRET;
    const adminSecret = process.env.ADMIN_SEED_SECRET;

    // Verify authorization
    const isAuthorized =
      (cronSecret && authHeader === `Bearer ${cronSecret}`) ||
      (adminSecret && token === adminSecret) ||
      (process.env.NODE_ENV === "development");

    if (!isAuthorized) {
      return NextResponse.json({ error: "Unauthorized access." }, { status: 401 });
    }

    // Query bookings due for return tomorrow that haven't received reminder yet
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateStr = tomorrow.toISOString().split("T")[0];

    const isSupabaseConfigured =
      process.env.NEXT_PUBLIC_SUPABASE_URL &&
      !process.env.NEXT_PUBLIC_SUPABASE_URL.includes("your-project-id");

    let dueBookings: any[] = [];

    if (isSupabaseConfigured) {
      const supabase = await createServiceSupabaseClient();
      const { data, error } = await supabase
        .from("bookings")
        .select("id, reference_code, contact_name, contact_phone, contact_email, end_date, status")
        .eq("end_date", dateStr)
        .in("status", ["rented", "approved", "ready_for_pickup"]);

      if (!error && data) {
        dueBookings = data;
      }
    } else {
      const allBookings = await db.getBookings();
      dueBookings = allBookings.filter(
        (b) =>
          b.endDate === dateStr &&
          (b.status === "rented" || b.status === "approved" || b.status === "ready_for_pickup")
      );
    }

    const dispatched: string[] = [];

    for (const booking of dueBookings) {
      const bookingId = booking.id;
      const refCode = booking.reference_code || booking.referenceCode;
      const eventKey = `email:return_reminder:${bookingId}`;

      const isDuplicate = await db.checkIdempotency(eventKey, undefined, bookingId, "return_reminder");
      if (!isDuplicate) {
        await sendReturnReminder(booking);
        dispatched.push(refCode);
      }
    }

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      targetDate: dateStr,
      processedCount: dueBookings.length,
      dispatchedCount: dispatched.length,
      dispatchedBookings: dispatched,
      message: `Checked return reminders for date: ${dateStr}. ${dispatched.length} reminder emails dispatched.`
    });
  } catch (err: any) {
    console.error("Cron reminders error:", err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}
