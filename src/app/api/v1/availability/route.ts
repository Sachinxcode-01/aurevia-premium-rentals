import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/lib/api/response";
import { createServiceSupabaseClient } from "@/lib/supabase/server";
import { checkProductAvailability } from "@/lib/services/availabilityEngine";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const equipmentId = searchParams.get("equipmentId") || searchParams.get("productId") || searchParams.get("slug");
    const pickupDate = searchParams.get("pickupDate") || searchParams.get("startDate");
    const returnDate = searchParams.get("returnDate") || searchParams.get("endDate");

    if (!equipmentId || !pickupDate || !returnDate) {
      return errorResponse(
        "INVALID_PARAMETERS",
        "Missing required query parameters: equipmentId (or slug), pickupDate, and returnDate",
        400
      );
    }

    const start = new Date(pickupDate);
    const end = new Date(returnDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime()) || start > end) {
      return errorResponse("INVALID_DATES", "pickupDate must be a valid date before or equal to returnDate", 400);
    }

    const supabase = await createServiceSupabaseClient();

    // 1. Resolve product ID from slug if necessary
    let productId = equipmentId;
    const { data: prodData } = await supabase
      .from("products")
      .select("id, inventory_qty")
      .or(`id.eq.${equipmentId},slug.eq.${equipmentId}`)
      .single();

    if (prodData) {
      productId = prodData.id;
    }

    // 2. Count active physical inventory units that are available
    const { data: units } = await supabase
      .from("inventory_units")
      .select("id, status")
      .eq("product_id", productId);

    let totalPhysicalUnits = prodData?.inventory_qty || 1;
    let maintenanceUnitsCount = 0;

    if (units && units.length > 0) {
      totalPhysicalUnits = units.length;
      maintenanceUnitsCount = units.filter((u: { status?: string }) => u.status === "maintenance" || u.status === "decommissioned").length;
    }

    const usableUnits = Math.max(0, totalPhysicalUnits - maintenanceUnitsCount);

    // 3. Count overlapping bookings
    const { data: overlappingBookings } = await supabase
      .from("bookings")
      .select("id, booking_items(quantity, product_id)")
      .in("status", ["pending", "confirmed", "picked_up", "rented"])
      .lte("start_date", returnDate)
      .gte("end_date", pickupDate);

    let bookedCount = 0;
    if (overlappingBookings) {
      for (const booking of overlappingBookings as Array<{ booking_items?: Array<{ product_id: string; quantity: number }> }>) {
        if (booking.booking_items) {
          for (const item of booking.booking_items) {
            if (item.product_id === productId) {
              bookedCount += item.quantity || 1;
            }
          }
        }
      }
    }

    // 4. Count manual availability blocks
    const { data: blocks } = await supabase
      .from("availability_blocks")
      .select("id")
      .eq("product_id", productId)
      .lte("start_date", returnDate)
      .gte("end_date", pickupDate);

    const blockedCount = blocks ? blocks.length : 0;

    // Fallback check using local availabilityEngine
    const localCheck = await checkProductAvailability(productId, pickupDate, returnDate);

    const finalBooked = Math.max(bookedCount, localCheck.available ? 0 : 1);
    const availableCount = Math.max(0, usableUnits - finalBooked - blockedCount);
    const isAvailable = availableCount > 0;

    return successResponse(
      {
        equipmentId: productId,
        pickupDate,
        returnDate,
        totalUnits: totalPhysicalUnits,
        usableUnits,
        maintenanceUnits: maintenanceUnitsCount,
        bookedUnits: finalBooked,
        availableCount,
        isAvailable,
      },
      isAvailable
        ? `Equipment is available for rental (${availableCount} unit(s) remaining)`
        : "Equipment is unavailable for the selected dates"
    );
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Failed to check availability";
    return errorResponse("AVAILABILITY_CHECK_FAILED", errorMsg, 500);
  }
}
