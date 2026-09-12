import test from "node:test";
import assert from "node:assert/strict";

/**
 * Phase 3 Test Suite:
 * 1. Security Audit Trail Categorization & Query Filtering
 * 2. Referral Program Credit & Discount Calculation
 * 3. Equipment Asset QR Tag Encoding & Verification
 */

// 1. Audit Trail Categorization Logic
function categorizeAuditLog(action) {
  const act = (action || "").toLowerCase();
  if (act.includes("auth") || act.includes("login") || act.includes("logout") || act.includes("password")) {
    return "auth";
  }
  if (act.includes("booking") || act.includes("reservation") || act.includes("order") || act.includes("cancel")) {
    return "booking";
  }
  if (act.includes("inventory") || act.includes("equipment") || act.includes("maintenance") || act.includes("camera")) {
    return "inventory";
  }
  if (act.includes("kyc") || act.includes("verification") || act.includes("identity") || act.includes("document")) {
    return "kyc";
  }
  if (act.includes("finance") || act.includes("refund") || act.includes("payout") || act.includes("tax") || act.includes("payment")) {
    return "finance";
  }
  return "system";
}

function filterAuditLogs(logs, { category, search, limit } = {}) {
  let filtered = [...logs];

  if (category && category !== "all") {
    filtered = filtered.filter((log) => categorizeAuditLog(log.action) === category.toLowerCase());
  }

  if (search && search.trim()) {
    const q = search.trim().toLowerCase();
    filtered = filtered.filter((log) => {
      const actionMatch = log.action?.toLowerCase().includes(q);
      const actorMatch = log.actor?.toLowerCase().includes(q);
      const detailsMatch = typeof log.details === "string"
        ? log.details.toLowerCase().includes(q)
        : JSON.stringify(log.details || {}).toLowerCase().includes(q);
      return actionMatch || actorMatch || detailsMatch;
    });
  }

  if (typeof limit === "number" && limit > 0) {
    filtered = filtered.slice(0, limit);
  }

  return filtered;
}

test("Security Audit Trail Categorization & Filtering Engine", async (t) => {
  const sampleLogs = [
    { id: "1", action: "USER_LOGIN_SUCCESS", actor: "admin@aurevia.com", details: "Admin session initiated" },
    { id: "2", action: "BOOKING_DISPATCHED", actor: "operations@aurevia.com", details: { bookingId: "AUR-1092" } },
    { id: "3", action: "INVENTORY_MAINTENANCE_LOGGED", actor: "tech@aurevia.com", details: "Calibrated Sony FX6" },
    { id: "4", action: "KYC_VERIFICATION_APPROVED", actor: "compliance@aurevia.com", details: { userId: "usr_99" } },
    { id: "5", action: "REFUND_ISSUED_MANUALLY", actor: "finance@aurevia.com", details: { amount: 5000 } },
    { id: "6", action: "SYSTEM_SETTINGS_UPDATED", actor: "superadmin@aurevia.com", details: "Referral rules saved" },
  ];

  await t.test("accurately categorizes diverse audit action events", () => {
    assert.equal(categorizeAuditLog("USER_LOGIN_SUCCESS"), "auth");
    assert.equal(categorizeAuditLog("BOOKING_CONFIRMED"), "booking");
    assert.equal(categorizeAuditLog("INVENTORY_MAINTENANCE_LOGGED"), "inventory");
    assert.equal(categorizeAuditLog("KYC_VERIFICATION_APPROVED"), "kyc");
    assert.equal(categorizeAuditLog("REFUND_ISSUED_MANUALLY"), "finance");
    assert.equal(categorizeAuditLog("SYSTEM_SETTINGS_UPDATED"), "system");
  });

  await t.test("filters audit trail by security category", () => {
    const bookingLogs = filterAuditLogs(sampleLogs, { category: "booking" });
    assert.equal(bookingLogs.length, 1);
    assert.equal(bookingLogs[0].action, "BOOKING_DISPATCHED");

    const kycLogs = filterAuditLogs(sampleLogs, { category: "kyc" });
    assert.equal(kycLogs.length, 1);
    assert.equal(kycLogs[0].action, "KYC_VERIFICATION_APPROVED");
  });

  await t.test("performs keyword search across actor and action", () => {
    const searchSuperAdmin = filterAuditLogs(sampleLogs, { search: "superadmin@" });
    assert.equal(searchSuperAdmin.length, 1);
    assert.equal(searchSuperAdmin[0].actor, "superadmin@aurevia.com");

    const searchSony = filterAuditLogs(sampleLogs, { search: "Sony FX6" });
    assert.equal(searchSony.length, 1);
    assert.equal(searchSony[0].action, "INVENTORY_MAINTENANCE_LOGGED");
  });

  await t.test("respects pagination limit parameter", () => {
    const limited = filterAuditLogs(sampleLogs, { limit: 2 });
    assert.equal(limited.length, 2);
  });
});

// 2. Referral Rewards & Discount Calculation
function calculateReferralBenefit({
  orderAmount,
  friendDiscountPercent = 10,
  maxFriendDiscount = 2000,
  referrerCreditAmount = 500,
  minOrderValueForReferral = 3000,
}) {
  if (orderAmount < minOrderValueForReferral) {
    return {
      eligible: false,
      reason: `Order value ₹${orderAmount} is below minimum threshold ₹${minOrderValueForReferral}`,
      friendDiscount: 0,
      referrerCredit: 0,
      finalPayable: orderAmount,
    };
  }

  const rawDiscount = (orderAmount * friendDiscountPercent) / 100;
  const friendDiscount = Math.min(rawDiscount, maxFriendDiscount);
  const finalPayable = Math.max(0, orderAmount - friendDiscount);

  return {
    eligible: true,
    friendDiscount,
    referrerCredit: referrerCreditAmount,
    finalPayable,
  };
}

test("Referral Program & Client Reward Mechanics", async (t) => {
  await t.test("calculates 10% friend discount up to maximum cap with referrer credit", () => {
    const calculation = calculateReferralBenefit({
      orderAmount: 15000,
      friendDiscountPercent: 10,
      maxFriendDiscount: 2000,
      referrerCreditAmount: 500,
      minOrderValueForReferral: 3000,
    });

    assert.equal(calculation.eligible, true);
    assert.equal(calculation.friendDiscount, 1500); // 10% of 15000 = 1500 <= 2000
    assert.equal(calculation.referrerCredit, 500);
    assert.equal(calculation.finalPayable, 13500);
  });

  await t.test("clamps friend discount when exceeding max cap", () => {
    const calculation = calculateReferralBenefit({
      orderAmount: 50000, // 10% would be 5000, capped at 2000
      friendDiscountPercent: 10,
      maxFriendDiscount: 2000,
      referrerCreditAmount: 500,
    });

    assert.equal(calculation.eligible, true);
    assert.equal(calculation.friendDiscount, 2000);
    assert.equal(calculation.finalPayable, 48000);
  });

  await t.test("rejects orders below minimum qualifying threshold", () => {
    const calculation = calculateReferralBenefit({
      orderAmount: 1999,
      minOrderValueForReferral: 3000,
    });

    assert.equal(calculation.eligible, false);
    assert.equal(calculation.friendDiscount, 0);
    assert.equal(calculation.referrerCredit, 0);
    assert.equal(calculation.finalPayable, 1999);
  });
});

// 3. Equipment Asset QR & Barcode Tag Payload
function generateAssetTagPayload(item) {
  const baseUrl = "https://aurevia.com/asset";
  const encodedId = encodeURIComponent(item.id || "");
  const encodedSn = encodeURIComponent(item.serialNumber || "");
  const qrUrl = `${baseUrl}/${encodedId}?sn=${encodedSn}`;
  const deepLink = `aurevia://asset/${encodedId}?sn=${encodedSn}`;

  return {
    qrUrl,
    deepLink,
    printableLabel: {
      assetId: item.id,
      serialNumber: item.serialNumber,
      brand: item.brand,
      name: item.name,
      vaultLocation: item.vaultLocation || "Studio Vault Rack A-01",
      securitySeal: `AUR-SEC-${(item.serialNumber || "0000").replace(/[^a-zA-Z0-9]/g, "").slice(-6).toUpperCase()}`,
      generatedAt: new Date().toISOString().split("T")[0],
    },
  };
}

test("Equipment Asset QR Tag Encoding & Verification", async (t) => {
  const item = {
    id: "INV-001",
    name: "Canon EOS R5 C Cinema Camera",
    brand: "Canon",
    serialNumber: "CN-R5C-88421",
    vaultLocation: "Vault Rack A-01",
  };

  await t.test("generates valid QR URL and deep link payload", () => {
    const payload = generateAssetTagPayload(item);

    assert.ok(payload.qrUrl.includes("https://aurevia.com/asset/INV-001"));
    assert.ok(payload.qrUrl.includes("sn=CN-R5C-88421"));
    assert.ok(payload.deepLink.startsWith("aurevia://asset/"));
    assert.equal(payload.printableLabel.assetId, "INV-001");
    assert.equal(payload.printableLabel.serialNumber, "CN-R5C-88421");
    assert.equal(payload.printableLabel.securitySeal, "AUR-SEC-C88421");
  });
});
