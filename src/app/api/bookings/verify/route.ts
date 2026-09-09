import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/lib/api/response";
import { db } from "@/lib/db/store";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const ref = searchParams.get("ref") || searchParams.get("referenceCode") || searchParams.get("id");
    const otp = searchParams.get("otp");

    if (!ref) {
      return errorResponse(
        "MISSING_REFERENCE",
        "Booking reference code or identifier is required.",
        400
      );
    }

    // Lookup booking by reference code or ID
    const booking = (await db.getBookingByReference(ref)) || (await db.getBookingById(ref));
    if (!booking) {
      return errorResponse(
        "BOOKING_NOT_FOUND",
        `No booking was found matching reference "${ref}".`,
        404
      );
    }

    // Resolve products and inventory units for human-readable equipment list
    const [allProducts, allUnits] = await Promise.all([
      db.getProducts().catch(() => []),
      db.getInventoryUnits().catch(() => []),
    ]);

    const enrichedItems = (booking.items || []).map((item, idx) => {
      const prod = allProducts.find((p) => p.id === item.productId);
      const unit = item.inventoryUnitId
        ? allUnits.find((u) => u.id === item.inventoryUnitId)
        : null;

      return {
        productId: item.productId,
        productName: prod?.name || `Cinema Equipment Package #${idx + 1}`,
        productImage: prod?.imagePrimary || "/images/placeholder-camera.jpg",
        quantity: item.quantity || 1,
        unitPrice: item.unitPrice || 0,
        inventoryUnitId: item.inventoryUnitId || `AV-UNIT-0${idx + 1}`,
        serialNumber: unit?.serialNumber || `AV-SN-${(item.productId || "CINEMA").slice(0, 4).toUpperCase()}-0${idx + 1}`,
        condition: unit?.condition || "Pristine / Calibrated",
      };
    });

    const isOtpMatched = Boolean(
      otp && booking.pickupOTP && otp.trim() === booking.pickupOTP.trim()
    );

    const isHandoverComplete =
      booking.status === "rented" ||
      booking.status === "completed" ||
      booking.status === "returned";

    const canHandover =
      booking.status === "approved" ||
      booking.status === "ready_for_pickup" ||
      booking.status === "paid";

    return successResponse(
      {
        booking: {
          id: booking.id,
          referenceCode: booking.referenceCode,
          status: booking.status,
          paymentStatus: booking.paymentStatus,
          startDate: booking.startDate,
          endDate: booking.endDate,
          deliveryMethod: booking.deliveryMethod,
          totalPayable: booking.totalPayable,
          contactName: booking.contactName,
          contactPhone: booking.contactPhone,
          contactEmail: booking.contactEmail,
          agreementAccepted: booking.agreementAccepted,
          agreementAcceptedAt: booking.agreementAcceptedAt,
          pickupOTP: booking.pickupOTP,
          pickupHandoverAt: booking.pickupHandoverAt,
          pickupRemarks: booking.pickupRemarks,
          items: enrichedItems,
        },
        otpValid: isOtpMatched,
        canHandover,
        isHandoverComplete,
      },
      "Booking verification data retrieved successfully."
    );
  } catch (err: any) {
    console.error("[Booking Verification GET Error]:", err);
    return errorResponse(
      "VERIFICATION_FETCH_FAILED",
      err?.message || "Failed to retrieve booking verification data.",
      500
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      bookingId,
      referenceCode,
      otp,
      remarks,
      checklist,
      staffName,
    } = body;

    const targetRef = bookingId || referenceCode;
    if (!targetRef) {
      return errorResponse(
        "INVALID_PAYLOAD",
        "Booking ID or reference code is required.",
        400
      );
    }

    if (!otp) {
      return errorResponse("MISSING_OTP", "Handover OTP is required.", 400);
    }

    const booking =
      (await db.getBookingById(targetRef)) ||
      (await db.getBookingByReference(targetRef));

    if (!booking) {
      return errorResponse("BOOKING_NOT_FOUND", "Booking record not found.", 404);
    }

    if (booking.status === "rented" || booking.status === "completed") {
      return errorResponse(
        "ALREADY_DISPATCHED",
        `Booking ${booking.referenceCode} has already been handed over (Status: ${booking.status.toUpperCase()}).`,
        400
      );
    }

    // Verify OTP
    if (booking.pickupOTP && booking.pickupOTP.trim() !== String(otp).trim()) {
      return errorResponse(
        "INVALID_OTP",
        "The entered Handover OTP does not match the customer's secure pass.",
        400
      );
    }

    // Verify Physical Serial Checklist
    if (!checklist?.serialsVerified) {
      return errorResponse(
        "SERIALS_NOT_VERIFIED",
        "Handover requirement: Equipment serial numbers must be verified against physical unit tags before dispatch.",
        400
      );
    }

    const staffRemark = `Handover completed by ${staffName || "Studio Counter Staff"}. ${remarks || ""}`.trim();

    // Confirm Handover in Store
    const updated = await db.confirmHandover(
      booking.id,
      String(otp).trim(),
      staffRemark,
      true
    );

    return successResponse(
      updated,
      `Equipment successfully handed over for booking #${booking.referenceCode}. Renter is now cleared.`
    );
  } catch (err: any) {
    console.error("[Booking Handover POST Error]:", err);
    return errorResponse(
      "HANDOVER_DISPATCH_FAILED",
      err?.message || "Failed to execute equipment handover.",
      500
    );
  }
}
