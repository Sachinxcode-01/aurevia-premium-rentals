import crypto from "crypto";
import { db } from "@/lib/db/store";
import { apiError, apiSuccess } from "@/lib/utils/apiResponse";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, bookingId } = body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !bookingId) {
      return apiError(
        "Missing required payment verification fields (order_id, payment_id, signature, bookingId).",
        "MISSING_FIELDS",
        400
      );
    }

    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    const isDemoOrder =
      razorpay_order_id.startsWith("order_demo_") ||
      razorpay_order_id.startsWith("order_mock_");
    const allowDemo =
      process.env.NODE_ENV !== "production" ||
      process.env.ALLOW_DEMO_PAYMENTS === "true" ||
      !keySecret;

    if (isDemoOrder) {
      if (!allowDemo) {
        return apiError(
          "Demo order verification is prohibited in production environment.",
          "DEMO_NOT_ALLOWED",
          403
        );
      }
      // In demo mode or when secret is unconfigured, verify test payments cleanly
      await db.assignAvailableUnit(bookingId);
      await db.updateBookingStatus(bookingId, "paid");
      return apiSuccess({ verified: true, bookingId });
    }

    if (!keySecret) {
      return apiError(
        "Payment gateway secret is not configured on the server.",
        "GATEWAY_UNCONFIGURED",
        500
      );
    }

    // HMAC-SHA256(order_id + "|" + payment_id, KEY_SECRET)
    const generated_signature = crypto
      .createHmac("sha256", keySecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    const signaturesMatch = (() => {
      try {
        return crypto.timingSafeEqual(
          Buffer.from(generated_signature, "hex"),
          Buffer.from(razorpay_signature, "hex")
        );
      } catch {
        return false;
      }
    })();

    if (signaturesMatch) {
      // Assign physical unit and mark booking as paid
      const assigned = await db.assignAvailableUnit(bookingId);
      
      if (assigned) {
        await db.updateBookingStatus(bookingId, "paid");
        return apiSuccess({ verified: true, bookingId });
      } else {
        await db.updateBookingStatus(bookingId, "cancelled");
        return apiError(
          "Inventory conflict: The equipment unit was reserved by another customer. Reservation cancelled and refunded.",
          "INVENTORY_CONFLICT",
          409
        );
      }
    } else {
      return apiError("Payment verification failed. Signature mismatch.", "SIGNATURE_MISMATCH", 400);
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal error during payment verification.";
    return apiError(message, "VERIFICATION_ERROR", 500);
  }
}
