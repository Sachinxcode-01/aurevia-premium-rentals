import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/lib/api/response";
import { verifyApiAuth, recordAuditLog } from "@/lib/auth/rbac";
import { createServiceSupabaseClient } from "@/lib/supabase/server";
import { calculateBookingPrice } from "@/lib/services/pricingService";

export async function GET(req: NextRequest) {
  try {
    const { user, response } = await verifyApiAuth(req, ["customer", "staff", "admin", "super_admin"]);
    if (response || !user) return response!;

    const supabase = await createServiceSupabaseClient();

    const { data: bookings, error } = await supabase
      .from("bookings")
      .select("*, booking_items(*, product:products(name, slug, daily_price))")
      .eq("profile_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      return errorResponse("FETCH_BOOKINGS_FAILED", error.message, 500);
    }

    return successResponse(bookings || [], "User bookings retrieved successfully");
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Failed to fetch bookings";
    return errorResponse("SERVER_ERROR", errorMsg, 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const { user, response } = await verifyApiAuth(req, ["customer", "staff", "admin", "super_admin"]);
    if (response || !user) return response!;

    const body = await req.json();
    const { items, startDate, endDate, deliveryMethod, contactName, contactPhone, couponCode } = body;

    if (!items || !Array.isArray(items) || items.length === 0 || !startDate || !endDate) {
      return errorResponse("INVALID_BOOKING_DATA", "items array, startDate, and endDate are required", 400);
    }

    const supabase = await createServiceSupabaseClient();

    // 1. Calculate Server-Side Pricing
    let totalRentalFee = 0;
    const itemRecords: Array<{ product_id: string; quantity: number; unit_price: number }> = [];

    for (const item of items) {
      const productId = item.productId || item.id;
      const quantity = item.quantity || 1;

      const { data: prod } = await supabase
        .from("products")
        .select("id, name, daily_price, weekly_price")
        .or(`id.eq.${productId},slug.eq.${productId}`)
        .single();

      const dailyPrice = prod?.daily_price ? Number(prod.daily_price) : (item.unitPrice || 1500);
      const pricingBreakdown = calculateBookingPrice({
        startDate,
        endDate,
        items: [{ productId, dailyPrice, quantity }],
      });

      totalRentalFee += pricingBreakdown.subtotal;

      itemRecords.push({
        product_id: prod?.id || productId,
        quantity,
        unit_price: dailyPrice,
      });
    }

    const taxFee = 0;
    const deliveryFee = deliveryMethod === "delivery" ? 500 : 0;
    let discountAmount = 0;

    if (couponCode) {
      const { data: coupon } = await supabase
        .from("coupons")
        .select("*")
        .eq("code", couponCode.toUpperCase())
        .eq("is_active", true)
        .single();

      if (coupon) {
        discountAmount = Math.round((totalRentalFee * Number(coupon.discount_percent || 0)) / 100);
        if (coupon.max_discount && discountAmount > Number(coupon.max_discount)) {
          discountAmount = Number(coupon.max_discount);
        }
      }
    }

    const totalPayable = Math.max(0, totalRentalFee + taxFee + deliveryFee - discountAmount);
    const referenceCode = `AUR-${Math.floor(100000 + Math.random() * 900000)}`;

    // 2. Insert Booking Record Atomically
    const { data: booking, error: bookingErr } = await supabase
      .from("bookings")
      .insert({
        profile_id: user.id,
        reference_code: referenceCode,
        start_date: startDate,
        end_date: endDate,
        total_rental_fee: totalRentalFee,
        tax_fee: taxFee,
        delivery_fee: deliveryFee,
        discount_amount: discountAmount,
        total_payable: totalPayable,
        status: "pending",
        payment_status: "unpaid",
        delivery_method: deliveryMethod || "pickup",
        contact_name: contactName || user.fullName,
        contact_phone: contactPhone || user.phone || "",
        coupon_applied: couponCode || null,
      })
      .select()
      .single();

    if (bookingErr || !booking) {
      return errorResponse("CREATE_BOOKING_FAILED", bookingErr?.message || "Failed to save booking", 500);
    }

    // 3. Insert Booking Items
    const bookingItemsToInsert = itemRecords.map((ir) => ({
      booking_id: booking.id,
      product_id: ir.product_id,
      quantity: ir.quantity,
      unit_price: ir.unit_price,
    }));

    await supabase.from("booking_items").insert(bookingItemsToInsert);

    // 4. Audit Log & Notifications
    await recordAuditLog({
      actorId: user.id,
      actorEmail: user.email,
      action: "booking.created",
      resource: "bookings",
      resourceId: booking.id,
      metadata: { referenceCode, totalPayable, startDate, endDate },
    });

    await supabase.from("notifications").insert({
      profile_id: user.id,
      title: "Booking Initiated",
      message: `Your reservation request #${referenceCode} has been created. Complete payment to confirm.`,
    });

    return successResponse(
      {
        bookingId: booking.id,
        referenceCode,
        totalPayable,
        status: booking.status,
        paymentStatus: booking.payment_status,
      },
      "Booking created successfully",
      201
    );
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Failed to create booking";
    return errorResponse("CREATE_BOOKING_FAILED", errorMsg, 500);
  }
}
