import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import { db } from "@/lib/db/store";
import { MOCK_PRODUCTS } from "@/lib/db/mockData";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { items, addons, deliveryMethod, couponCode, receipt } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "Invalid booking payload. Missing items." },
        { status: 400 }
      );
    }

    // 1. Secure Pricing Recalculation
    let rentalFee = 0;
    let depositFee = 0;
    let totalDiscount = 0;

    for (const item of items) {
      const product = MOCK_PRODUCTS.find((p) => p.id === item.productId);
      if (!product) {
        return NextResponse.json(
          { error: `Product ${item.productId} not found.` },
          { status: 400 }
        );
      }

      // Check availability for dates
      const { available } = await db.checkAvailability(
        item.productId,
        item.startDate,
        item.endDate
      );
      if (!available) {
        return NextResponse.json(
          { error: `Camera is not available for the selected dates.` },
          { status: 400 }
        );
      }

      const start = new Date(item.startDate);
      const end = new Date(item.endDate);
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1 || 1;

      // Force regular pricing: 799 INR per camera per day (never trust client)
      const baseCost = 799 * days * item.quantity;
      rentalFee += baseCost;

      // 2. Validate Coupon server-side
      if (couponCode) {
        if (couponCode.toUpperCase() === "AUREVIA199") {
          const todayStr = new Date().toISOString().split("T")[0];
          // Check dates: active between 2026-07-01 and 2026-12-31
          if (todayStr < "2026-07-01" || todayStr > "2026-12-31") {
            return NextResponse.json({ error: "Coupon code has expired." }, { status: 400 });
          }

          // Check limits from database bookings
          const allBookings = await db.getBookings();
          const paidBookingsWithCoupon = allBookings.filter(
            (b) => b.couponApplied === "AUREVIA199" && (b.paymentStatus === "paid" || b.status !== "cancelled")
          );

          // Total usage limit
          if (paidBookingsWithCoupon.length >= 100) {
            return NextResponse.json({ error: "Coupon total usage limit reached." }, { status: 400 });
          }

          // Per-user limit
          let currentUserId = "usr-prem";
          let currentUserEmail = body.contactEmail || "";
          let currentUserPhone = body.contactPhone || "";
          try {
            const supabase = await createServerSupabaseClient();
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
              currentUserId = user.id;
              currentUserEmail = user.email || currentUserEmail;
              currentUserPhone = user.phone || currentUserPhone;
            }
          } catch (e) {
            const localProfile = await db.getProfile().catch(() => null);
            if (localProfile) {
              currentUserId = localProfile.id;
              currentUserEmail = localProfile.email;
              currentUserPhone = localProfile.phone;
            }
          }

          const userHasUsed = paidBookingsWithCoupon.some(
            (b) =>
              b.profileId === currentUserId ||
              b.contactPhone === currentUserPhone ||
              b.contactEmail === currentUserEmail ||
              b.contactPhone === body.contactPhone ||
              b.contactEmail === body.contactEmail
          );
          if (userHasUsed) {
            return NextResponse.json({ error: "Coupon per-user usage limit reached." }, { status: 400 });
          }

          // Apply Flat ₹199 discount per camera unit per day
          totalDiscount += 199.00 * days * item.quantity;
        } else if (couponCode.toUpperCase() === "AUREVIA10") {
          totalDiscount += baseCost * 0.10;
        } else if (couponCode.toUpperCase() === "WELCOMEPREM") {
          totalDiscount += baseCost * 0.15;
        }
      }
    }

    // Zero out security deposits, taxes (GST), and delivery/shipping fees
    const taxFee = 0;
    const deliveryFee = 0;
    const totalPayable = rentalFee - totalDiscount;
    const amountPaise = Math.round(totalPayable * 100);

    // Validate amount >= 100 paise
    if (amountPaise < 100) {
      return NextResponse.json(
        { error: "Amount must be at least 100 paise (1 INR)." },
        { status: 400 }
      );
    }

    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      return NextResponse.json(
        { error: "Razorpay API credentials not configured." },
        { status: 401 }
      );
    }

    const razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });

    const order = await razorpay.orders.create({
      amount: amountPaise,
      currency: "INR",
      receipt: receipt || `receipt_${Date.now()}`,
      notes: {
        emergencyContact: body.emergencyContact || "",
        companyOrCollege: body.companyOrCollege || "",
        contactEmail: body.contactEmail || "",
        contactName: body.contactName || "",
        contactPhone: body.contactPhone || "",
      }
    });

    return NextResponse.json({
      order_id: order.id,
      amount: order.amount,
      currency: order.currency,
    });
  } catch (err: any) {
    console.error("Razorpay order creation error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to create Razorpay order." },
      { status: 500 }
    );
  }
}
