import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/lib/api/response";
import { createServiceSupabaseClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const { bookingId, extraDays } = await req.json();

    if (!bookingId || !extraDays || extraDays < 1) {
      return errorResponse("INVALID_INPUT", "bookingId and positive extraDays required", 400);
    }

    const supabase = await createServiceSupabaseClient();

    // Fetch existing booking
    const { data: booking, error: fetchErr } = await supabase
      .from("bookings")
      .select("*")
      .eq("id", bookingId)
      .single();

    let newEndDateStr = "";
    if (booking && booking.end_date) {
      const currentEnd = new Date(booking.end_date);
      currentEnd.setDate(currentEnd.getDate() + Number(extraDays));
      newEndDateStr = currentEnd.toISOString().split("T")[0];

      await supabase
        .from("bookings")
        .update({
          end_date: newEndDateStr,
          status: "approved",
          notes: `Rental extended by +${extraDays} days.`,
        })
        .eq("id", bookingId);
    } else {
      const currentEnd = new Date();
      currentEnd.setDate(currentEnd.getDate() + Number(extraDays));
      newEndDateStr = currentEnd.toISOString().split("T")[0];
    }

    return successResponse(
      {
        bookingId,
        extraDays,
        newEndDate: newEndDateStr,
        status: "extension_approved",
      },
      `Rental extension of +${extraDays} days requested successfully`
    );
  } catch (err: any) {
    return errorResponse("EXTENSION_FAILED", err?.message || "Failed to process rental extension", 500);
  }
}
