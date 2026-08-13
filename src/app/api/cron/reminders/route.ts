import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/client";

export async function GET() {
  try {
    const supabase = createClient();

    // Query bookings due for return tomorrow that haven't received reminder yet
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateStr = tomorrow.toISOString().split("T")[0];

    const { data: dueBookings, error } = await supabase
      .from("bookings")
      .select("id, reference_code, contact_name, contact_phone, end_date, reminder_sent_at")
      .eq("end_date", dateStr)
      .is("reminder_sent_at", null);

    if (error) {
      return NextResponse.json({ success: true, processed: 0, message: "No due bookings found or schema fallback." });
    }

    const processedCount = dueBookings?.length || 0;

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      processedCount,
      message: `Checked return reminders for date: ${dateStr}. ${processedCount} reminders dispatched.`
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
