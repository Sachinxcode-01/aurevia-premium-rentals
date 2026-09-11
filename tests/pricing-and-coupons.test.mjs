import { test, describe } from "node:test";
import assert from "node:assert/strict";

// Import pricing service logic
import { calculateBookingPrice } from "../src/lib/services/pricingService.ts";

describe("AUREVIA Pricing & Coupon Engine", () => {
  test("Calculates correct base rental for single-day booking", () => {
    const pricing = calculateBookingPrice({
      startDate: "2026-10-01",
      endDate: "2026-10-01",
      items: [{ productId: "cam-1", dailyPrice: 3499, quantity: 1 }],
      coupon: null,
      deliveryMethod: "pickup",
    });

    assert.equal(pricing.rentalDays, 1);
    assert.equal(pricing.subtotal, 3499);
    assert.equal(pricing.discountAmount, 0);
    assert.equal(pricing.deliveryFee, 0);
    assert.equal(pricing.taxFee, 0);
    assert.equal(pricing.totalPayable, 3499);
  });

  test("Calculates correct multi-day rental with 3 days duration", () => {
    const pricing = calculateBookingPrice({
      startDate: "2026-10-01",
      endDate: "2026-10-03",
      items: [{ productId: "cam-1", dailyPrice: 3499, quantity: 1 }],
      coupon: null,
      deliveryMethod: "pickup",
    });

    assert.equal(pricing.rentalDays, 3);
    assert.equal(pricing.subtotal, 3499 * 3);
    assert.equal(pricing.totalPayable, 3499 * 3);
  });

  test("Applies percentage coupon correctly (WELCOME20 - 20% off)", () => {
    const subtotal = 10000;
    const coupon = {
      code: "WELCOME20",
      discountPercent: 20,
      isActive: true,
      minBookingAmount: 0,
      maxDiscount: null,
    };

    const pricing = calculateBookingPrice({
      startDate: "2026-10-01",
      endDate: "2026-10-02",
      items: [{ productId: "cam-1", dailyPrice: 5000, quantity: 1 }],
      coupon,
      deliveryMethod: "pickup",
    });

    assert.equal(pricing.subtotal, 10000);
    assert.equal(pricing.discountAmount, 2000);
    assert.equal(pricing.totalPayable, 8000);
  });

  test("Applies flat coupon discount (AUREVIA199)", () => {
    const coupon = {
      code: "AUREVIA199",
      discountPercent: 0,
      discountFlat: 199,
      isActive: true,
    };

    const pricing = calculateBookingPrice({
      startDate: "2026-10-01",
      endDate: "2026-10-01",
      items: [{ productId: "cam-1", dailyPrice: 799, quantity: 1 }],
      coupon,
      deliveryMethod: "pickup",
    });

    assert.equal(pricing.subtotal, 799);
    assert.equal(pricing.discountAmount, 199);
    assert.equal(pricing.totalPayable, 600);
  });

  test("Enforces maximum discount ceiling when maxDiscount is set", () => {
    const coupon = {
      code: "BIGSAVE50",
      discountPercent: 50,
      maxDiscount: 1500,
      isActive: true,
    };

    const pricing = calculateBookingPrice({
      startDate: "2026-10-01",
      endDate: "2026-10-04",
      items: [{ productId: "cam-1", dailyPrice: 2000, quantity: 1 }],
      coupon,
      deliveryMethod: "pickup",
    });

    // Subtotal = 8000. 50% = 4000, but capped at 1500
    assert.equal(pricing.subtotal, 8000);
    assert.equal(pricing.discountAmount, 1500);
    assert.equal(pricing.totalPayable, 6500);
  });

  test("Applies delivery fee when delivery method is chosen", () => {
    const pricing = calculateBookingPrice({
      startDate: "2026-10-01",
      endDate: "2026-10-01",
      items: [{ productId: "cam-1", dailyPrice: 1000, quantity: 1 }],
      coupon: null,
      deliveryMethod: "delivery",
    });

    assert.equal(pricing.deliveryFee, 500);
    assert.equal(pricing.totalPayable, 1500);
  });
});
