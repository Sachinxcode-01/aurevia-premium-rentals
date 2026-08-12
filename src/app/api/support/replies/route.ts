import { NextResponse } from "next/server";
import { db } from "@/lib/db/store";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  try {
    const { isSupabaseConfigured } = await import("@/lib/db/store");
    const { searchParams } = new URL(request.url);
    const ticketId = searchParams.get("ticketId");

    if (!ticketId) {
      return NextResponse.json({ error: "Missing ticketId." }, { status: 400 });
    }

    // Authenticate
    if (isSupabaseConfigured()) {
      const supabase = await createServerSupabaseClient();
      const { data: { user }, error: authErr } = await supabase.auth.getUser();
      if (authErr || !user) {
        return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
      }
    }

    const replies = await db.getTicketReplies(ticketId);
    return NextResponse.json({ success: true, replies });
  } catch (err: any) {
    console.error("Support replies fetch error:", err);
    return NextResponse.json({ error: err.message || "Failed to fetch replies." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { isSupabaseConfigured } = await import("@/lib/db/store");
    const body = await request.json().catch(() => ({}));
    const { ticketId, message } = body;

    if (!ticketId || !message) {
      return NextResponse.json({ error: "Missing required fields (ticketId, message)." }, { status: 400 });
    }

    let senderId = "";

    // Authenticate
    if (isSupabaseConfigured()) {
      const supabase = await createServerSupabaseClient();
      const { data: { user }, error: authErr } = await supabase.auth.getUser();
      if (authErr || !user) {
        return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
      }
      senderId = user.id;
    } else {
      const profile = await db.getProfile();
      senderId = profile.id;
    }

    const reply = await db.addTicketReply({
      ticketId,
      senderId,
      message,
    });

    if (!reply) {
      return NextResponse.json({ error: "Failed to submit reply." }, { status: 500 });
    }

    return NextResponse.json({ success: true, reply });
  } catch (err: any) {
    console.error("Support reply creation error:", err);
    return NextResponse.json({ error: err.message || "Failed to submit reply." }, { status: 500 });
  }
}
