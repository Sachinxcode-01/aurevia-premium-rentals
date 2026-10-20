import { NextRequest, NextResponse } from "next/server";
import { verifyApiAuth } from "@/lib/auth/rbac";
import { createServiceSupabaseClient } from "@/lib/supabase/server";
import { realtimeHub } from "@/lib/realtime/realtimeHub";

export async function GET(req: NextRequest) {
  try {
    const { user, response } = await verifyApiAuth(req, ["admin", "staff", "super_admin"]);
    if (response || !user) return response!;

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");

    const supabase = await createServiceSupabaseClient();

    // Fetch all reviews from Supabase reviews table
    let query = supabase
      .from("reviews")
      .select("*")
      .order("created_at", { ascending: false });

    if (status === "approved") {
      query = query.eq("is_approved", true);
    } else if (status === "pending") {
      query = query.eq("is_approved", false);
    }

    const { data: dbReviews, error } = await query;
    if (error) {
      console.error("[Admin Reviews GET error]:", error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    // Optionally lookup product names for richer display
    const { data: products } = await supabase.from("products").select("id, name");
    const productMap = new Map<string, string>();
    (products || []).forEach((p: any) => {
      productMap.set(p.id, p.name);
    });

    const reviews = (dbReviews || []).map((r: any) => ({
      id: r.id,
      customerName: r.author_name || "Verified Client",
      customerEmail: "",
      productName: productMap.get(r.product_id) || "Cinema Camera / Optical Gear",
      rating: r.rating || 5,
      title: "Client Feedback",
      comment: r.quote || "",
      status: r.is_approved ? "approved" : "pending",
      verifiedRental: true,
      createdAt: r.created_at || new Date().toISOString(),
      adminNote: undefined,
    }));

    const total = reviews.length;
    const approved = reviews.filter((r: { status: string }) => r.status === "approved").length;
    const pending = reviews.filter((r: { status: string }) => r.status === "pending").length;
    const rejected = reviews.filter((r: { status: string }) => r.status === "rejected").length;

    return NextResponse.json({
      success: true,
      data: reviews,
      summary: {
        total,
        approved,
        pending,
        rejected,
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "An unexpected error occurred";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { user, response } = await verifyApiAuth(req, ["admin", "staff", "super_admin"]);
    if (response || !user) return response!;

    const body = await req.json();
    const { id, status, adminNote } = body;

    if (!id || !status) {
      return NextResponse.json({ success: false, error: "Review ID and status required" }, { status: 400 });
    }

    const isApproved = status === "approved";
    const supabase = await createServiceSupabaseClient();

    const { data: updated, error } = await supabase
      .from("reviews")
      .update({
        is_approved: isApproved,
      })
      .eq("id", id)
      .select()
      .single();

    if (error || !updated) {
      return NextResponse.json({ success: false, error: error?.message || "Review not found" }, { status: 404 });
    }

    const mapped = {
      id: updated.id,
      customerName: updated.author_name,
      rating: updated.rating,
      comment: updated.quote,
      status: updated.is_approved ? "approved" : "rejected",
      adminNote,
    };

    // Broadcast review moderation so public site and other admin sessions update in real time
    try {
      realtimeHub.broadcast("REVIEW_MODERATED", mapped, "admin");
    } catch (e) {
      console.warn("Failed to broadcast REVIEW_MODERATED:", e);
    }

    return NextResponse.json({
      success: true,
      data: mapped,
      message: `Review has been marked as ${status}.`,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "An unexpected error occurred";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { user, response } = await verifyApiAuth(req, ["admin", "staff", "super_admin"]);
    if (response || !user) return response!;

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ success: false, error: "Review ID is required" }, { status: 400 });
    }

    const supabase = await createServiceSupabaseClient();
    const { error } = await supabase.from("reviews").delete().eq("id", id);

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    try {
      realtimeHub.broadcast("REVIEW_DELETED", { id }, "admin");
    } catch (e) {
      console.warn("Failed to broadcast REVIEW_DELETED:", e);
    }

    return NextResponse.json({ success: true, message: "Review deleted from database successfully." });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "An unexpected error occurred";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
