import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/lib/api/response";
import { verifyApiAuth, recordAuditLog } from "@/lib/auth/rbac";
import { createServiceSupabaseClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  try {
    const { user, response } = await verifyApiAuth(req, ["admin", "staff", "super_admin"]);
    if (response || !user) return response!;

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search")?.toLowerCase();
    const status = searchParams.get("status");
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "25", 10);

    const supabase = await createServiceSupabaseClient();

    let query = supabase
      .from("bookings")
      .select("*, booking_items(*, product:products(name, slug))", { count: "exact" })
      .order("created_at", { ascending: false });

    if (status && status !== "ALL") {
      query = query.eq("status", status.toLowerCase());
    }

    const { data: dbBookings, count, error } = await query;

    if (error) {
      return errorResponse("FETCH_ADMIN_BOOKINGS_FAILED", error.message, 500);
    }

    let items = dbBookings || [];

    if (search) {
      items = items.filter(
        (b: any) =>
          b.reference_code?.toLowerCase().includes(search) ||
          b.contact_name?.toLowerCase().includes(search) ||
          b.contact_phone?.includes(search)
      );
    }

    const total = count || items.length;
    const pages = Math.ceil(total / limit) || 1;
    const start = (page - 1) * limit;
    const paginatedItems = items.slice(start, start + limit);

    return successResponse(paginatedItems, "Admin bookings fetched successfully", 200, {
      page,
      limit,
      total,
      pages,
    });
  } catch (err: any) {
    return errorResponse("ADMIN_BOOKINGS_ERROR", err.message || "Failed to load admin bookings", 500);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { user, response } = await verifyApiAuth(req, ["admin", "staff", "super_admin"]);
    if (response || !user) return response!;

    const body = await req.json();
    const { bookingId, status, notes } = body;

    if (!bookingId || !status) {
      return errorResponse("INVALID_STATUS_UPDATE", "bookingId and new status are required", 400);
    }

    const validStatuses = [
      "pending",
      "paid",
      "approval_pending",
      "approved",
      "ready_for_pickup",
      "rented",
      "returned",
      "completed",
      "cancelled",
      "rejected",
      "overdue",
    ];

    if (!validStatuses.includes(status.toLowerCase())) {
      return errorResponse("INVALID_STATUS_VALUE", `Status '${status}' is not a valid booking status`, 400);
    }

    const supabase = await createServiceSupabaseClient();

    // Fetch existing booking
    const { data: existingBooking, error: fetchErr } = await supabase
      .from("bookings")
      .select("*")
      .eq("id", bookingId)
      .single();

    if (fetchErr || !existingBooking) {
      return errorResponse("BOOKING_NOT_FOUND", "Booking record not found", 404);
    }

    // Status transition safety check
    if (existingBooking.status === "completed" && status.toLowerCase() === "pending") {
      return errorResponse("INVALID_TRANSITION", "Cannot revert completed booking to pending status", 400);
    }

    // Update status
    const { data: updatedBooking, error: updateErr } = await supabase
      .from("bookings")
      .update({
        status: status.toLowerCase(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", bookingId)
      .select()
      .single();

    if (updateErr) {
      return errorResponse("UPDATE_BOOKING_FAILED", updateErr.message, 500);
    }

    // Record Audit Trail
    await recordAuditLog({
      actorId: user.id,
      actorEmail: user.email,
      action: "booking.updated",
      resource: "bookings",
      resourceId: bookingId,
      metadata: {
        previousStatus: existingBooking.status,
        newStatus: status,
        notes: notes || "Updated by Admin",
      },
    });

    // Notify Customer
    if (existingBooking.profile_id) {
      await supabase.from("notifications").insert({
        profile_id: existingBooking.profile_id,
        title: `Booking #${existingBooking.reference_code} Status Updated`,
        message: `Your booking status is now: ${status.replace(/_/g, " ").toUpperCase()}`,
      });
    }

    return successResponse(updatedBooking, `Booking status successfully updated to '${status}'`);
  } catch (err: any) {
    return errorResponse("ADMIN_BOOKING_UPDATE_FAILED", err.message || "Failed to update booking status", 500);
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { user, response } = await verifyApiAuth(req, ["admin", "staff", "super_admin"]);
    if (response || !user) return response!;

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return errorResponse("INVALID_DELETE_REQUEST", "Booking ID parameter is required", 400);
    }

    const supabase = await createServiceSupabaseClient();

    // Delete booking items first to prevent FK constraint issues
    await supabase.from("booking_items").delete().eq("booking_id", id);
    const { error } = await supabase.from("bookings").delete().eq("id", id);

    if (error) {
      return errorResponse("DELETE_BOOKING_FAILED", error.message, 500);
    }

    await recordAuditLog({
      actorId: user.id,
      actorEmail: user.email,
      action: "booking.deleted",
      resource: "bookings",
      resourceId: id,
      metadata: { deletedAt: new Date().toISOString() },
    });

    return successResponse(null, `Booking ${id} successfully deleted from system`);
  } catch (err: any) {
    return errorResponse("ADMIN_BOOKING_DELETE_FAILED", err.message || "Failed to delete booking", 500);
  }
}
