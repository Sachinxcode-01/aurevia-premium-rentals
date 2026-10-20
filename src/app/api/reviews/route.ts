import { NextRequest, NextResponse } from "next/server";
import { createServiceSupabaseClient } from "@/lib/supabase/server";
import { realtimeHub } from "@/lib/realtime/realtimeHub";

export async function GET(req: NextRequest) {
  try {
    const supabase = await createServiceSupabaseClient();
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get("productId");

    let query = supabase
      .from("reviews")
      .select("*")
      .eq("is_approved", true)
      .order("created_at", { ascending: false });

    if (productId) {
      query = query.eq("product_id", productId);
    }

    const { data, error } = await query;
    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    const formatted = (data || []).map((r: any) => ({
      id: r.id,
      productId: r.product_id,
      authorName: r.author_name || "Verified Creator",
      rating: r.rating || 5,
      quote: r.quote || "",
      isApproved: true,
      createdAt: r.created_at,
    }));

    return NextResponse.json({ success: true, data: formatted });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to fetch reviews";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { authorName, rating, quote, productId } = body;

    if (!authorName || !quote) {
      return NextResponse.json(
        { success: false, error: "Author name and review feedback are required." },
        { status: 400 }
      );
    }

    const numericRating = Math.min(5, Math.max(1, Number(rating) || 5));
    const targetProductId = productId || "p1000000-0000-0000-0000-000000000001";

    const supabase = await createServiceSupabaseClient();
    const { data, error } = await supabase
      .from("reviews")
      .insert({
        product_id: targetProductId,
        author_name: String(authorName).trim(),
        rating: numericRating,
        quote: String(quote).trim(),
        is_approved: false, // New reviews require admin moderation
      })
      .select()
      .single();

    if (error) {
      console.error("[Reviews POST Error]:", error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    const newReview = {
      id: data.id,
      customerName: data.author_name,
      customerEmail: "",
      productName: "Cinema Equipment",
      rating: data.rating,
      title: "Customer Review",
      comment: data.quote,
      status: "pending" as const,
      verifiedRental: true,
      createdAt: data.created_at,
    };

    // Broadcast to Admin real-time system so Admin panel updates instantly!
    try {
      realtimeHub.broadcast("REVIEW_CREATED", newReview, "public_website");
    } catch (e) {
      console.warn("Failed to broadcast REVIEW_CREATED event:", e);
    }

    return NextResponse.json({
      success: true,
      data: newReview,
      message: "Your review has been submitted and queued for moderation by the AUREVIA Concierge.",
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to submit review";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
