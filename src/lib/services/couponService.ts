import { createServiceSupabaseClient } from "@/lib/supabase/server";

export interface CouponValidationResult {
  valid: boolean;
  code?: string;
  discountPercent?: number;
  discountFlat?: number;
  maxDiscount?: number;
  minBookingAmount?: number;
  reason?: string;
}

export async function validateCoupon(
  code: string,
  bookingSubtotal: number,
  userId?: string
): Promise<CouponValidationResult> {
  const normalizedCode = code.trim().toUpperCase();

  const { isSupabaseConfigured, db } = await import("@/lib/db/store");

  if (!isSupabaseConfigured()) {
    const coupon = await db.getCouponByCode(normalizedCode);
    if (!coupon) {
      return { valid: false, reason: "Invalid promo code" };
    }
    if (!coupon.isActive) {
      return { valid: false, reason: "This coupon is inactive or expired" };
    }
    const expiry = new Date(coupon.activeUntil).getTime();
    if (expiry < Date.now()) {
      return { valid: false, reason: "Coupon has expired" };
    }
    return {
      valid: true,
      code: coupon.code,
      discountPercent: coupon.discountPercent,
      discountFlat: coupon.discountFlat,
      maxDiscount: coupon.maxDiscount,
      minBookingAmount: 0,
    };
  }

  const supabase = await createServiceSupabaseClient();
  const { data: coupon, error } = await (supabase as unknown as {
    from: (table: string) => {
      select: (cols: string) => {
        eq: (col: string, val: string) => {
          maybeSingle: () => Promise<{
            data: {
              code: string;
              is_active: boolean;
              active_until?: string;
              min_booking_amount?: number;
              usage_limit?: number;
              times_used: number;
              per_user_limit?: number;
              discount_percent?: number;
              discount_flat?: number;
              max_discount_amount?: number;
            } | null;
            error: Error | null;
          }>;
        };
      };
    };
  })
    .from("coupons")
    .select("*")
    .eq("code", normalizedCode)
    .maybeSingle();

  if (error || !coupon) {
    return { valid: false, reason: "Invalid coupon code" };
  }

  if (!coupon.is_active) {
    return { valid: false, reason: "Coupon is currently inactive" };
  }

  if (coupon.active_until && new Date(coupon.active_until).getTime() < Date.now()) {
    return { valid: false, reason: "Coupon has expired" };
  }

  if (coupon.min_booking_amount && bookingSubtotal < coupon.min_booking_amount) {
    return { valid: false, reason: `Minimum booking total of ₹${coupon.min_booking_amount} required` };
  }

  if (coupon.usage_limit && coupon.times_used >= coupon.usage_limit) {
    return { valid: false, reason: "Coupon limit reached" };
  }

  if (userId && coupon.per_user_limit) {
    const { count } = await (supabase as unknown as {
      from: (table: string) => {
        select: (cols: string, opts: { count: string; head: boolean }) => {
          eq: (col: string, val: string) => {
            eq: (col: string, val: string) => Promise<{ count: number | null }>;
          };
        };
      };
    })
      .from("bookings")
      .select("id", { count: "exact", head: true })
      .eq("profile_id", userId)
      .eq("coupon_applied", normalizedCode);

    if (count && count >= coupon.per_user_limit) {
      return { valid: false, reason: "You have reached the usage limit for this promo code" };
    }
  }

  return {
    valid: true,
    code: coupon.code,
    discountPercent: Number(coupon.discount_percent || 0),
    discountFlat: Number(coupon.discount_flat || 0),
    maxDiscount: coupon.max_discount_amount ? Number(coupon.max_discount_amount) : undefined,
    minBookingAmount: coupon.min_booking_amount ? Number(coupon.min_booking_amount) : 0,
  };
}
