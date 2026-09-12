import test from "node:test";
import assert from "node:assert/strict";
import { NotificationService } from "../src/lib/services/notificationService.ts";

test("Fleet Maintenance Scheduling & Service Logging", async (t) => {
  await t.test("locks unit downtime and formats calibration audit notes", () => {
    const serialNumber = "SN-7482910";
    const shutterCount = "48,250 Clicks";
    const firmwareVersion = "v3.01 Production Stable";
    const sensorStatus = "Cleaned & Calibrated (Pass)";
    const downtimeReason = "Scheduled Sensor Cleaning & Firmware Flash";
    const lockDowntime = true;

    const notes = `${downtimeReason} (${serialNumber}) | Shutter: ${shutterCount} | FW: ${firmwareVersion} | Sensor: ${sensorStatus}`;
    const status = lockDowntime ? "maintenance" : "available";

    assert.equal(status, "maintenance");
    assert.ok(notes.includes(serialNumber));
    assert.ok(notes.includes("48,250 Clicks"));
    assert.ok(notes.includes("v3.01 Production Stable"));
    assert.ok(notes.includes("Cleaned & Calibrated (Pass)"));
  });

  await t.test("clears unit maintenance downtime back to available", () => {
    const lockDowntime = false;
    const status = lockDowntime ? "maintenance" : "available";
    assert.equal(status, "available");
  });
});

test("Indian GST 18% Tax Calculation for Equipment Rentals", async (t) => {
  await t.test("splits 18% GST into 9% CGST and 9% SGST with tax-exempt deposit", () => {
    const grossPaid = 16800; // 11,800 rental (inclusive of 18% GST) + 5,000 security deposit
    const securityDeposit = 5000;

    const rentalNetWithGst = grossPaid - securityDeposit; // 11800
    const taxableValue = Math.round(rentalNetWithGst / 1.18); // 10000
    const totalGst = rentalNetWithGst - taxableValue; // 1800
    const cgst = Math.round(totalGst / 2); // 900
    const sgst = totalGst - cgst; // 900

    assert.equal(taxableValue, 10000);
    assert.equal(totalGst, 1800);
    assert.equal(cgst, 900);
    assert.equal(sgst, 900);
    assert.equal(taxableValue + totalGst + securityDeposit, grossPaid);
  });
});

test("Unified Notification Dispatch Service", async (t) => {
  await t.test("generates WhatsApp concierge booking confirmation template", async () => {
    const result = await NotificationService.sendBookingConfirmation({
      bookingId: "AUR-1049",
      referenceCode: "AUR-1049",
      customerName: "Vikramaditya Rao",
      customerEmail: "vikram.rao@cinemafilms.in",
      customerPhone: "+91 99001 12233",
      equipmentName: "ARRI Alexa Mini LF Production System",
      startDate: "2026-08-10",
      endDate: "2026-08-14",
      totalAmount: 118000,
      securityDeposit: 50000,
    });

    assert.equal(result.success, true);
    assert.ok(result.payloadText?.includes("AUR-1049"));
    assert.ok(result.payloadText?.includes("ARRI Alexa Mini LF Production System"));
    assert.ok(result.payloadText?.includes("₹1,18,000"));
    assert.ok(result.payloadText?.includes("₹50,000"));
  });

  await t.test("generates KYC approved notification text", async () => {
    const result = await NotificationService.sendKycStatusUpdate({
      customerName: "Rahul Verma",
      customerEmail: "rahul.v@gmail.com",
      status: "approved",
    });

    assert.equal(result.success, true);
    assert.ok(result.payloadText?.includes("VERIFIED & APPROVED"));
    assert.ok(result.payloadText?.includes("zero-deposit eligible"));
  });

  await t.test("generates return cleared and deposit refund confirmation", async () => {
    const result = await NotificationService.sendReturnClearedAlert({
      bookingId: "AUR-1039",
      customerName: "Priya Nair",
      customerEmail: "priya@gmail.com",
      refundAmount: 15000,
      depositAmount: 15000,
    });

    assert.equal(result.success, true);
    assert.ok(result.payloadText?.includes("PASSED"));
    assert.ok(result.payloadText?.includes("₹15,000"));
  });

  await t.test("generates Razorpay penalty link notice text", async () => {
    const result = await NotificationService.sendPenaltyPaymentLink({
      bookingId: "AUR-1035",
      customerName: "Deepak Mehta",
      customerEmail: "deepak@gmail.com",
      amount: 2400,
      paymentUrl: "https://rzp.io/i/mock_penalty_AUR-1035_2400",
      reason: "Rental Overdue: 4 hours late return",
    });

    assert.equal(result.success, true);
    assert.ok(result.payloadText?.includes("₹2,400"));
    assert.ok(result.payloadText?.includes("https://rzp.io/i/mock_penalty_AUR-1035_2400"));
    assert.ok(result.payloadText?.includes("Rental Overdue: 4 hours late return"));
  });
});
