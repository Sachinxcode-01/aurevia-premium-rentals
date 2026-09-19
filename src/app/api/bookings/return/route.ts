import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/lib/api/response";
import { db } from "@/lib/db/store";
import { sendReturnSettlementReceipt } from "@/lib/email/mailer";
import { verifyApiAuth } from "@/lib/auth/rbac";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const ref = searchParams.get("ref") || searchParams.get("referenceCode") || searchParams.get("id");

    if (!ref) {
      return errorResponse(
        "MISSING_REFERENCE",
        "Booking reference code or identifier is required.",
        400
      );
    }

    const booking = (await db.getBookingByReference(ref)) || (await db.getBookingById(ref));
    if (!booking) {
      return errorResponse(
        "BOOKING_NOT_FOUND",
        `No booking was found matching reference "${ref}".`,
        404
      );
    }

    // Resolve products and inventory units
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

    // Overdue and late fee calculation
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const expectedReturn = new Date(booking.endDate);
    expectedReturn.setHours(0, 0, 0, 0);

    let overdueDays = 0;
    if (today > expectedReturn) {
      const diffTime = today.getTime() - expectedReturn.getTime();
      overdueDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }

    const dailyLateFeeRate = 999;
    const estimatedLateFee = overdueDays * dailyLateFeeRate;

    // Approximate security deposit held (default ₹5,000 if not explicitly stored)
    const securityDepositHeld = 5000;

    const isAlreadyReturned =
      booking.status === "completed" ||
      booking.status === "returned";

    const canReturn =
      booking.status === "rented" ||
      booking.status === "overdue" ||
      booking.status === "approved" ||
      booking.status === "ready_for_pickup";

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
          pickupHandoverAt: booking.pickupHandoverAt,
          returnInspectionAt: booking.returnInspectionAt,
          returnRemarks: booking.returnRemarks,
          lateFee: booking.lateFee || 0,
          damageCost: booking.damageCost || 0,
          damageDescription: booking.damageDescription || "",
          items: enrichedItems,
        },
        overdueDays,
        dailyLateFeeRate,
        estimatedLateFee,
        securityDepositHeld,
        canReturn,
        isAlreadyReturned,
      },
      "Return inspection data loaded successfully."
    );
  } catch (err: any) {
    console.error("[Booking Return GET Error]:", err);
    return errorResponse(
      "RETURN_FETCH_FAILED",
      err?.message || "Failed to load return inspection data.",
      500
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const { isSupabaseConfigured } = await import("@/lib/db/store");
    if (isSupabaseConfigured()) {
      const { user, response } = await verifyApiAuth(req, ["admin", "staff", "super_admin"]);
      if (response || !user) return response!;
    }

    const body = await req.json();
    const {
      bookingId,
      referenceCode,
      condition,
      damageDescription,
      damageCost,
      remarks,
      lateFeeOverride,
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

    const booking =
      (await db.getBookingById(targetRef)) ||
      (await db.getBookingByReference(targetRef));

    if (!booking) {
      return errorResponse("BOOKING_NOT_FOUND", "Booking record not found.", 404);
    }

    if (booking.status === "completed") {
      return errorResponse(
        "ALREADY_COMPLETED",
        `Booking ${booking.referenceCode} has already been marked as returned and completed.`,
        400
      );
    }

    // Validation: Return inspection checklist
    if (!checklist?.serialsMatched) {
      return errorResponse(
        "CHECKLIST_INCOMPLETE",
        "Hardware serial numbers must be verified against the returned units.",
        400
      );
    }

    if (!checklist?.allAccessoriesReturned) {
      return errorResponse(
        "CHECKLIST_INCOMPLETE",
        "Accessories and Pelican cases must be accounted for before completing return.",
        400
      );
    }

    const staffRemark = `Return inspected by ${staffName || "Studio Counter Staff"}. ${remarks || ""}`.trim();

    // Call processReturn
    const updated = await db.processReturn(
      booking.id,
      condition === "damaged" ? "damaged" : "good",
      damageDescription || "",
      Number(damageCost) || 0,
      staffRemark,
      lateFeeOverride !== undefined ? Number(lateFeeOverride) : undefined
    );

    // Asynchronously dispatch return clearance & deposit settlement receipt email
    const deposit = 5000;
    const assessedDamage = Number(damageCost) || 0;
    const appliedLateFee = lateFeeOverride !== undefined ? Number(lateFeeOverride) : 0;
    const netRefund = Math.max(0, deposit - assessedDamage - appliedLateFee);

    sendReturnSettlementReceipt(updated || booking, {
      condition: condition === "damaged" ? "damaged" : "good",
      damageCost: assessedDamage,
      damageDescription,
      lateFee: appliedLateFee,
      depositHeld: deposit,
      netRefundable: netRefund,
      staffName,
      remarks: staffRemark,
    }).catch((err) => console.error("[Return Email Error]:", err));

    return successResponse(
      updated,
      `Return inspection complete for booking #${booking.referenceCode}. Equipment inventory status updated.`
    );
  } catch (err: any) {
    console.error("[Booking Return POST Error]:", err);
    return errorResponse(
      "RETURN_PROCESS_FAILED",
      err?.message || "Failed to process equipment return.",
      500
    );
  }
}
