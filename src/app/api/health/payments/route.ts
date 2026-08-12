import { NextResponse } from "next/server";

export async function GET() {
  const keyId     = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  const isConfigured =
    !!keyId &&
    !!keySecret &&
    !keyId.includes("PLACEHOLDER") &&
    !keySecret.includes("PLACEHOLDER");

  if (!isConfigured) {
    return NextResponse.json(
      { status: "unconfigured", message: "Razorpay credentials are missing." },
      { status: 503 }
    );
  }

  // Determine mode from key prefix — never expose the actual key values
  const mode: "live" | "test" | "unknown" = keyId.startsWith("rzp_live_")
    ? "live"
    : keyId.startsWith("rzp_test_")
    ? "test"
    : "unknown";

  const webhookConfigured =
    !!process.env.RAZORPAY_WEBHOOK_SECRET &&
    !process.env.RAZORPAY_WEBHOOK_SECRET.includes("PLACEHOLDER");

  return NextResponse.json({
    status: "ok",
    mode,
    webhook_configured: webhookConfigured,
    // Show only the non-sensitive prefix of the key (e.g. rzp_live_XXXXX)
    key_prefix: keyId.slice(0, 16) + "...",
    timestamp: new Date().toISOString(),
  });
}
