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

    // 2. Validate Coupon server-side if present
    let couponObj = null;
    if (couponCode) {
      const couponRes = await validateCoupon(couponCode, 1000);
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

    // 3. Fetch authoritative product pricing from database
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

    if (!keyId || !keySecret) {
      // In development or when credentials are missing, return mock order for seamless local testing
      return apiSuccess({
        order_id: `order_demo_${Date.now()}`,
        amount: amountPaise,
        currency: "INR",
        breakdown: pricing,
      });
    }

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
      breakdown: pricing,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Failed to create Razorpay order.";
    return apiError(errorMsg, "ORDER_CREATION_FAILED", 500);
  }
}
