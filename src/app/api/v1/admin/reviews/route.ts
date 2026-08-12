import { NextRequest, NextResponse } from "next/server";
import { engagementStore } from "@/lib/db/engagementStore";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");

    let reviews = engagementStore.getReviews();
    if (status && status !== "all") {
      reviews = reviews.filter((r) => r.status === status);
    }

    return NextResponse.json({
      success: true,
      data: reviews,
      summary: {
        total: reviews.length,
        approved: reviews.filter((r) => r.status === "approved").length,
        pending: reviews.filter((r) => r.status === "pending").length,
        rejected: reviews.filter((r) => r.status === "rejected").length,
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "An unexpected error occurred";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, status, adminNote } = body;

    if (!id || !status) {
      return NextResponse.json({ success: false, error: "Review ID and status required" }, { status: 400 });
    }

    const updated = engagementStore.updateReviewStatus(id, status, adminNote);
    if (!updated) {
      return NextResponse.json({ success: false, error: "Review not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: updated,
      message: `Review has been marked as ${status}.`,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "An unexpected error occurred";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ success: false, error: "ID required" }, { status: 400 });
    }

    engagementStore.deleteReview(id);
    return NextResponse.json({ success: true, message: "Review deleted." });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "An unexpected error occurred";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
