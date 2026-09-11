import { test, describe } from "node:test";
import assert from "node:assert/strict";
import crypto from "node:crypto";

describe("AUREVIA Razorpay Payment Signature Verification", () => {
  const secret = "test_secret_key_1234567890abcdef";

  function verifyPaymentSignature({ orderId, paymentId, signature, keySecret }) {
    if (!orderId || !paymentId || !signature || !keySecret) return false;
    const generated = crypto
      .createHmac("sha256", keySecret)
      .update(`${orderId}|${paymentId}`)
      .digest("hex");

    try {
      return crypto.timingSafeEqual(
        Buffer.from(generated, "hex"),
        Buffer.from(signature, "hex")
      );
    } catch {
      return false;
    }
  }

  test("Successfully validates authentic Razorpay signature", () => {
    const orderId = "order_N1X98y20kLPq";
    const paymentId = "pay_N1X9G6g782klP";

    // Generate genuine signature
    const signature = crypto
      .createHmac("sha256", secret)
      .update(`${orderId}|${paymentId}`)
      .digest("hex");

    const isValid = verifyPaymentSignature({
      orderId,
      paymentId,
      signature,
      keySecret: secret,
    });

    assert.equal(isValid, true);
  });

  test("Rejects tampered signature", () => {
    const orderId = "order_N1X98y20kLPq";
    const paymentId = "pay_N1X9G6g782klP";
    const tamperedSignature = "abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789";

    const isValid = verifyPaymentSignature({
      orderId,
      paymentId,
      signature: tamperedSignature,
      keySecret: secret,
    });

    assert.equal(isValid, false);
  });

  test("Rejects mismatched order ID with original signature", () => {
    const orderId = "order_N1X98y20kLPq";
    const paymentId = "pay_N1X9G6g782klP";

    const signature = crypto
      .createHmac("sha256", secret)
      .update(`${orderId}|${paymentId}`)
      .digest("hex");

    const isValid = verifyPaymentSignature({
      orderId: "order_DIFFERENT_ID",
      paymentId,
      signature,
      keySecret: secret,
    });

    assert.equal(isValid, false);
  });

  test("Rejects malformed signature string gracefully without crashing", () => {
    const isValid = verifyPaymentSignature({
      orderId: "order_123",
      paymentId: "pay_123",
      signature: "not_a_valid_hex_length",
      keySecret: secret,
    });

    assert.equal(isValid, false);
  });
});
