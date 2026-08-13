import Razorpay from "razorpay";
import { apiError, apiSuccess } from "@/lib/utils/apiResponse";
import { checkProductAvailability } from "@/lib/services/availabilityEngine";
import { validateCoupon } from "@/lib/services/couponService";
import { calculateBookingPrice } from "@/lib/services/pricingService";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { items, deliveryMethod, couponCode, receipt } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return apiError("Invalid booking payload. Missing items.", "BAD_REQUEST", 400);
    }

    const firstItem = items[0];
    const startDate = firstItem.startDate || body.startDate;
    const endDate = firstItem.endDate || body.endDate;

    if (!startDate || !endDate) {
      return apiError("Rental dates are required.", "INVALID_DATES", 400);
    }

    // 1. Real-time availability check for each item
    for (const item of items) {
      const avail = await checkProductAvailability(
        item.productId,
        startDate,
        endDate,
        item.quantity || 1
      );

      if (!avail.available) {
        return apiError(
          avail.reason || "One or more selected items are unavailable for the selected dates.",
          "EQUIPMENT_UNAVAILABLE",
          409
        );
      }
    }

    // 2. Fetch authoritative product pricing from database
    const { createServiceSupabaseClient } = await import("@/lib/supabase/server");
    const supabase = await createServiceSupabaseClient();
    const productIds = items.map((i: { productId: string }) => i.productId);
    const { data: dbProducts } = await supabase
      .from("products")
      .select("id, daily_price, daily_rate")
      .in("id", productIds);

    const pricingItems = items.map((i: { productId: string; quantity?: number; dailyPrice?: number }) => {
      const match = dbProducts?.find((p: { id: string; daily_price?: number; daily_rate?: number }) => p.id === i.productId);
      const actualPrice = match?.daily_price || match?.daily_rate || i.dailyPrice || 799;
      return {
        productId: i.productId,
        dailyPrice: Number(actualPrice),
        quantity: i.quantity || 1,
      };
    });

    // Compute base subtotal without coupon to accurately validate minimum coupon requirement
    const basePricing = calculateBookingPrice({
      startDate,
      endDate,
      items: pricingItems,
      coupon: null,
      deliveryMethod,
    });

    // 3. Validate Coupon server-side if present
    let couponObj = null;
    if (couponCode) {
      const couponRes = await validateCoupon(couponCode, basePricing.subtotal);
      if (!couponRes.valid) {
        return apiError(couponRes.reason || "Invalid coupon code.", "INVALID_COUPON", 400);
      }
      couponObj = {
        code: couponRes.code!,
        discountPercent: couponRes.discountPercent,
        discountFlat: couponRes.discountFlat,
        maxDiscount: couponRes.maxDiscount,
        minBookingAmount: couponRes.minBookingAmount,
        isActive: true,
      };
    }

    // Centralized pricing calculation
    const pricing = calculateBookingPrice({
      startDate,
      endDate,
      items: pricingItems,
      coupon: couponObj,
      deliveryMethod,
    });

    const amountPaise = Math.round(pricing.totalPayable * 100);

    if (amountPaise < 100) {
      return apiError("Amount must be at least ₹1.", "MINIMUM_AMOUNT_REQUIRED", 400);
    }

    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret || keyId.includes("PLACEHOLDER") || keySecret.includes("PLACEHOLDER")) {
      // In development or when credentials are missing/placeholder, return mock order for seamless testing
      return apiSuccess({
        order_id: `order_demo_${Date.now()}`,
        amount: amountPaise,
        currency: "INR",
        key_id: keyId || "rzp_live_TOkNIiR8SNbuUI",
        breakdown: pricing,
      });
    }

    try {
      const razorpay = new Razorpay({
        key_id: keyId,
        key_secret: keySecret,
      });

      const order = await razorpay.orders.create({
        amount: amountPaise,
        currency: "INR",
        receipt: receipt || `rcpt_${Date.now()}`,
        notes: {
          contactEmail: body.contactEmail || "",
          contactName: body.contactName || "",
          contactPhone: body.contactPhone || "",
        },
      });

      return apiSuccess({
        order_id: order.id,
        amount: order.amount,
        currency: order.currency,
        key_id: keyId,
        breakdown: pricing,
      });
    } catch (rzpErr: any) {
      console.error("Razorpay API order creation error:", rzpErr);
      const errorMsg =
        rzpErr?.error?.description ||
        rzpErr?.description ||
        (rzpErr instanceof Error ? rzpErr.message : null) ||
        "Failed to create Razorpay order.";

      // Fallback to demo mode if Razorpay API keys fail authentication or credentials are invalid
      if (!process.env.RAZORPAY_KEY_SECRET || errorMsg.includes("Authentication") || errorMsg.includes("key")) {
        return apiSuccess({
          order_id: `order_demo_${Date.now()}`,
          amount: amountPaise,
          currency: "INR",
          key_id: keyId,
          breakdown: pricing,
          warning: errorMsg,
        });
      }

      return apiError(errorMsg, "ORDER_CREATION_FAILED", 500);
    }
  } catch (err: unknown) {
    console.error("Unexpected error in /api/create-order:", err);
    const errorMsg =
      (err as any)?.error?.description ||
      (err as any)?.description ||
      (err instanceof Error ? err.message : null) ||
      "Failed to create Razorpay order.";
    return apiError(errorMsg, "ORDER_CREATION_FAILED", 500);
  }
}
