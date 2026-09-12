import test from "node:test";
import assert from "node:assert/strict";

test("Coupon Management & Discount Valuation", async (t) => {
  await t.test("evaluates percentage discount correctly with cap", () => {
    const coupon = {
      code: "AUREVIA10",
      discountType: "percentage",
      discountValue: 10,
      minOrderAmount: 10000,
      maxDiscountAmount: 3000,
      usageLimit: 100,
      usedCount: 34,
    };

    const orderAmount = 25000;
    const meetsMin = orderAmount >= (coupon.minOrderAmount || 0);
    assert.equal(meetsMin, true);

    const rawDiscount = (orderAmount * coupon.discountValue) / 100;
    const cappedDiscount = coupon.maxDiscountAmount ? Math.min(rawDiscount, coupon.maxDiscountAmount) : rawDiscount;
    assert.equal(cappedDiscount, 2500); // 10% of 25000 is 2500, which is < 3000 cap
  });

  await t.test("rejects order below minimum order requirement", () => {
    const coupon = {
      code: "CINEMA5000",
      discountType: "fixed",
      discountValue: 5000,
      minOrderAmount: 40000,
      usageLimit: 20,
      usedCount: 5,
    };

    const orderAmount = 15000;
    const valid = orderAmount >= (coupon.minOrderAmount || 0);
    assert.equal(valid, false);
  });

  await t.test("enforces usage limit boundary", () => {
    const exhaustedCoupon = {
      code: "FLASH100",
      discountType: "percentage",
      discountValue: 50,
      usageLimit: 10,
      usedCount: 10,
      active: true,
    };

    const canUse = exhaustedCoupon.active && exhaustedCoupon.usedCount < exhaustedCoupon.usageLimit;
    assert.equal(canUse, false);
  });
});

test("Customer CRM Metrics & VIP Tiering", async (t) => {
  await t.test("aggregates cumulative spend and assigns VIP status", () => {
    const customerBookings = [
      { id: "b1", totalAmount: 45000, status: "completed" },
      { id: "b2", totalAmount: 62000, status: "completed" },
      { id: "b3", totalAmount: 18000, status: "cancelled" }, // cancelled should not count to spend
    ];

    const totalSpend = customerBookings
      .filter((b) => b.status === "completed" || b.status === "confirmed" || b.status === "rented")
      .reduce((sum, b) => sum + b.totalAmount, 0);

    assert.equal(totalSpend, 107000);

    const isVip = totalSpend >= 100000;
    assert.equal(isVip, true);
  });

  await t.test("computes AOV across settled gateway transactions", () => {
    const transactions = [
      { id: "tx-1", amount: 15000, status: "PAID" },
      { id: "tx-2", amount: 35000, status: "PAID" },
      { id: "tx-3", amount: 10000, status: "FAILED" },
      { id: "tx-4", amount: 25000, status: "PAID" },
    ];

    const settled = transactions.filter((t) => t.status === "PAID");
    const totalVolume = settled.reduce((sum, t) => sum + t.amount, 0);
    const aov = Math.round(totalVolume / settled.length);

    assert.equal(totalVolume, 75000);
    assert.equal(settled.length, 3);
    assert.equal(aov, 25000);
  });
});

test("Pelican Flight-Case Inspection & Settlement Calculator", async (t) => {
  await t.test("computes overdue fees and net deposit refund correctly", () => {
    const deposit = 50000;
    const hoursOverdue = 4;
    const hourlyOverdueRate = 600;
    const conditionFee = 1500; // missing lens cap/accessory

    const overdueFee = hoursOverdue * hourlyOverdueRate;
    assert.equal(overdueFee, 2400);

    const totalDamageCharge = overdueFee + conditionFee;
    assert.equal(totalDamageCharge, 3900);

    const netRefund = deposit - totalDamageCharge;
    assert.equal(netRefund, 46100);
    assert.ok(netRefund > 0);
  });

  await t.test("handles total loss where damage exceeds deposit", () => {
    const deposit = 15000;
    const damageCharge = 22000; // severe optical element scratch

    const netRefund = Math.max(0, deposit - damageCharge);
    assert.equal(netRefund, 0);

    const penaltyOwed = Math.max(0, damageCharge - deposit);
    assert.equal(penaltyOwed, 7000);
  });
});
