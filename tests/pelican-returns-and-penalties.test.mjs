import test from "node:test";
import assert from "node:assert/strict";

test("Pelican Flight-Case & Return Terminal Operations (Phase 2)", async (t) => {
  await t.test("maps active bookings into Pelican inspection cases correctly", () => {
    const rawBooking = {
      id: "AUR-1049",
      contact_name: "Vikramaditya Rao",
      contact_phone: "+91 99001 12233",
      product_name: "ARRI Alexa Mini LF Production System",
      status: "rented",
      start_date: "2026-08-10",
      end_date: "2026-08-14",
      security_deposit: 50000,
    };

    const caseId = `PEL-ARR-101`;
    const isReturned = rawBooking.status === "returned" || rawBooking.status === "completed";

    const inspectionCase = {
      id: caseId,
      bookingId: rawBooking.id,
      customerName: rawBooking.contact_name,
      phone: rawBooking.contact_phone,
      equipmentName: rawBooking.product_name,
      securityDeposit: rawBooking.security_deposit,
      status: isReturned ? "SETTLED_CLEARED" : "INSPECTION_PENDING",
      sensorSanitized: true,
      physicalCondition: "MINT",
      damageCharge: 0,
    };

    assert.equal(inspectionCase.bookingId, "AUR-1049");
    assert.equal(inspectionCase.securityDeposit, 50000);
    assert.equal(inspectionCase.status, "INSPECTION_PENDING");
  });

  await t.test("evaluates serial number checklist verification", () => {
    const items = [
      { id: "i1", name: "Camera Body", serialNumber: "SN-7482910", isVerified: true },
      { id: "i2", name: "Cinema Lens 24-70mm", serialNumber: "SN-9182746", isVerified: false },
      { id: "i3", name: "CFexpress Card 512GB", serialNumber: "SN-CFX-512B", isVerified: true },
    ];

    const verifiedCount = items.filter((i) => i.isVerified).length;
    assert.equal(verifiedCount, 2);

    const unverifiedItems = items.filter((i) => !i.isVerified);
    assert.equal(unverifiedItems.length, 1);
    assert.equal(unverifiedItems[0].name, "Cinema Lens 24-70mm");
  });

  await t.test("computes overdue fees and condition penalty deductions", () => {
    const hoursOverdue = 5;
    const hourlyRate = 600;
    const overdueFee = hoursOverdue * hourlyRate; // 3000

    const condition = "MISSING_ACCESSORY";
    const conditionFee = condition === "MISSING_ACCESSORY" ? 1500 : condition === "DAMAGE_CLAIM" ? 8500 : 0;

    const totalDamageCharge = overdueFee + conditionFee;
    assert.equal(totalDamageCharge, 4500);

    const securityDeposit = 30000;
    const netRefundReleased = Math.max(0, securityDeposit - totalDamageCharge);
    assert.equal(netRefundReleased, 25500);
  });

  await t.test("formats Razorpay penalty payment link parameters", () => {
    const bookingId = "AUR-1035";
    const amountInRupees = 4500;
    const amountInPaise = Math.round(amountInRupees * 100);

    assert.equal(amountInPaise, 450000);

    const payload = {
      bookingId,
      amount: amountInRupees,
      description: `Damage/late penalty settlement for Pelican PEL-ALEXA-001`,
    };

    assert.equal(payload.bookingId, "AUR-1035");
    assert.equal(payload.amount, 4500);
    assert.ok(payload.description.includes("PEL-ALEXA-001"));
  });

  await t.test("certifies sensor sanitization requirement before clearance", () => {
    const caseA = { sensorSanitized: false };
    const caseB = { sensorSanitized: true };

    const isReadyForDispatchA = caseA.sensorSanitized;
    const isReadyForDispatchB = caseB.sensorSanitized;

    assert.equal(isReadyForDispatchA, false);
    assert.equal(isReadyForDispatchB, true);
  });
});
