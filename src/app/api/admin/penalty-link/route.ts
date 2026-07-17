import { NextResponse } from "next/server";
import { db } from "@/lib/db/store";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import Razorpay from "razorpay";

export async function POST(request: Request) {
  try {
    const { isSupabaseConfigured } = await import("@/lib/db/store");
    const body = await request.json().catch(() => ({}));
    const { bookingId, amount, description } = body;

    if (!bookingId || !amount) {
      return NextResponse.json({ error: "Missing required fields (bookingId, amount)." }, { status: 400 });
    }

    // Authenticate admin
    if (isSupabaseConfigured()) {
      const supabase = await createServerSupabaseClient();
      const { data: { user }, error: authErr } = await supabase.auth.getUser();
      if (authErr || !user) {
        return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
      }

      // Check role
      const { data } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();
      
      const profile = data as any;
      if (profile?.role !== "admin" && profile?.role !== "staff") {
        return NextResponse.json({ error: "Access denied." }, { status: 403 });
      }
    }

    // Generate Razorpay Payment Link
    let paymentUrl = "";
    const razorpayKeyId = process.env.RAZORPAY_KEY_ID;
    const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET;

    if (razorpayKeyId && razorpayKeySecret && razorpayKeyId !== "your-razorpay-key-id") {
      const rzp = new Razorpay({
        key_id: razorpayKeyId,
        key_secret: razorpayKeySecret,
      });

      const orderRef = `penalty_${bookingId}_${Date.now().toString().slice(-4)}`;
      const link = await rzp.paymentLink.create({
        amount: Math.round(amount * 100), // in paise
        currency: "INR",
        accept_partial: false,
        description: description || `Late return/damage penalty for AUREVIA booking ${bookingId}`,
        reference_id: orderRef,
        callback_url: `${request.headers.get("origin") || "http://localhost:3000"}/dashboard`,
        callback_method: "get"
      });

      paymentUrl = link.short_url;
    } else {
      // Fallback/Mock Mode Payment Link
      paymentUrl = `https://rzp.io/i/mock_penalty_${bookingId}_${amount}`;
    }

    // Update booking in DB
    await db.updatePenaltyPaymentUrl(bookingId, paymentUrl);

    return NextResponse.json({ success: true, paymentUrl });
  } catch (err: any) {
    console.error("Penalty link generation error:", err);
    return NextResponse.json({ error: err.message || "Failed to generate payment link." }, { status: 500 });
  }
}
