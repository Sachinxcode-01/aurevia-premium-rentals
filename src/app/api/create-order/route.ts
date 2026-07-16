import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import { db } from "@/lib/db/store";
import { MOCK_PRODUCTS } from "@/lib/db/mockData";

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

      const baseCost = product.dailyPrice * days * item.quantity;
      rentalFee += baseCost;
      depositFee += product.securityDeposit * item.quantity;

      // Addons Calculation
      if (addons && Array.isArray(addons)) {
        addons.forEach((addId) => {
          if (addId === "a1000000-0000-0000-0000-000000000001") rentalFee += 499 * days * item.quantity;
          if (addId === "a1000000-0000-0000-0000-000000000002") rentalFee += 199 * days * item.quantity;
          if (addId === "a1000000-0000-0000-0000-000000000003") rentalFee += 999 * days * item.quantity;
        });
      }

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
            (b) => b.couponApplied === "AUREVIA199" && b.paymentStatus === "paid"
          );

          // Total usage limit
          if (paidBookingsWithCoupon.length >= 100) {
            return NextResponse.json({ error: "Coupon total usage limit reached." }, { status: 400 });
          }

          // Per-user limit (check simulated profileId or phone)
          const userHasUsed = paidBookingsWithCoupon.some(
            (b) => b.profileId === "usr-prem" || b.contactPhone === "9686909048"
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

    const taxFee = Math.round((rentalFee - totalDiscount) * 0.18 * 100) / 100;
    const deliveryFee = deliveryMethod === "delivery" ? 500 : 0;
    const totalPayable = rentalFee + depositFee + taxFee + deliveryFee - totalDiscount;
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
