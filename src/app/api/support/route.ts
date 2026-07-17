import { NextResponse } from "next/server";
import { db } from "@/lib/db/store";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const { isSupabaseConfigured } = await import("@/lib/db/store");
    const body = await request.json().catch(() => ({}));
    const { bookingId, subject, description, category, priority } = body;

    if (!subject || !description || !category) {
      return NextResponse.json({ error: "Missing required fields (subject, description, category)." }, { status: 400 });
    }

    let profileId = "";
    let userEmail = "";

    // 1. Authenticate user
    if (isSupabaseConfigured()) {
      const supabase = await createServerSupabaseClient();
      const { data: { user }, error: authErr } = await supabase.auth.getUser();
      if (authErr || !user) {
        return NextResponse.json({ error: "Unauthorized. Must be signed in." }, { status: 401 });
      }
      profileId = user.id;
      userEmail = user.email || "";
    } else {
      const profile = await db.getProfile();
      profileId = profile.id;
      userEmail = profile.email;
    }

    // 2. Routing: technical to Sachin, rental to Prem
    const assignedTo = category === "technical" ? "sachin@aurevia.com" : "prem@aurevia.com";

    // 3. Create Ticket
    const ticket = await db.createSupportTicket({
      profileId,
      bookingId,
      subject,
      description,
      category,
      priority: priority || "medium",
      assignedTo,
    });

    if (!ticket) {
      return NextResponse.json({ error: "Failed to create support ticket." }, { status: 500 });
    }

    if (typeof window === "undefined") {
      import("@/lib/email/mailer").then((m) => {
        // Send alert to assignee
        const mailBody = `New Support Ticket #${ticket.id}\nCategory: ${category}\nFrom: ${userEmail}\nSubject: ${subject}\n\nDescription:\n${description}`;
        m.sendEmail({
          to: assignedTo,
          subject: `[AUREVIA Support] ${priority.toUpperCase()} - ${subject}`,
          text: mailBody,
          html: mailBody.replace(/\n/g, "<br/>"),
        }).catch((e) => console.error("Support assignee email fail:", e));

        // Send confirmation to customer
        const customerBody = `Hi,\n\nWe have received your support request regarding "${subject}". An agent (${assignedTo}) has been assigned to look into your ticket.\n\nTicket Details:\n- Category: ${category}\n- Status: Open\n\nThanks,\nAurevia Support Desk`;
        m.sendEmail({
          to: userEmail,
          subject: `[AUREVIA Support] Ticket Received: ${subject}`,
          text: customerBody,
          html: customerBody.replace(/\n/g, "<br/>"),
        }).catch((e) => console.error("Customer support email fail:", e));
      });
    }

    return NextResponse.json({ success: true, ticket });
  } catch (err: any) {
    console.error("Support ticket creation error:", err);
    return NextResponse.json({ error: err.message || "Failed to create ticket." }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const { isSupabaseConfigured } = await import("@/lib/db/store");
    let profileId: string | undefined = undefined;

    // Authenticate
    if (isSupabaseConfigured()) {
      const supabase = await createServerSupabaseClient();
      const { data: { user }, error: authErr } = await supabase.auth.getUser();
      if (authErr || !user) {
        return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
      }
      
      const { data } = await supabase.from("profiles").select("role").eq("id", user.id).single();
      const profileRaw = data as any;
      const isAdmin = profileRaw && ["admin", "staff"].includes(profileRaw.role);
      
      // Admin sees all tickets; user sees own tickets
      if (!isAdmin) {
        profileId = user.id;
      }
    } else {
      const profile = await db.getProfile();
      if (profile.role !== "admin" && profile.role !== "staff") {
        profileId = profile.id;
      }
    }

    const tickets = await db.getSupportTickets(profileId);
    return NextResponse.json({ success: true, tickets });
  } catch (err: any) {
    console.error("Support ticket list error:", err);
    return NextResponse.json({ error: err.message || "Failed to list tickets." }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const { isSupabaseConfigured } = await import("@/lib/db/store");
    const body = await request.json().catch(() => ({}));
    const { ticketId, status } = body;

    if (!ticketId || !status) {
      return NextResponse.json({ error: "Missing required fields (ticketId, status)." }, { status: 400 });
    }

    // Authenticate and verify role
    if (isSupabaseConfigured()) {
      const supabase = await createServerSupabaseClient();
      const { data: { user }, error: authErr } = await supabase.auth.getUser();
      if (authErr || !user) {
        return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
      }

      const { data } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();
      
      const profile = data as any;
      if (profile?.role !== "admin" && profile?.role !== "staff") {
        return NextResponse.json({ error: "Access denied." }, { status: 403 });
      }
    } else {
      const profile = await db.getProfile();
      if (profile.role !== "admin" && profile.role !== "staff") {
        return NextResponse.json({ error: "Access denied." }, { status: 403 });
      }
    }

    let ticket = null;
    if (status === "resolved") {
      const ok = await db.resolveSupportTicket(ticketId);
      if (ok) {
        ticket = await db.getSupportTicketById(ticketId);
      }
    }
    if (!ticket) {
      return NextResponse.json({ error: "Failed to update support ticket." }, { status: 500 });
    }

    // Notify customer on resolution
    if (status === "resolved" && typeof window === "undefined") {
      import("@/lib/email/mailer").then(async (m) => {
        // Fetch ticket owner details if possible
        let customerEmail = "customer@aurevia.com";
        if (isSupabaseConfigured()) {
          const supabase = await createServerSupabaseClient();
          const { data } = await supabase.from("profiles").select("email").eq("id", ticket.profile_id).single();
          const customerProfile = data as any;
          if (customerProfile?.email) customerEmail = customerProfile.email;
        } else {
          const profile = await db.getProfile();
          customerEmail = profile.email;
        }

        const resolveBody = `Hi,\n\nYour support ticket regarding "${ticket.subject}" has been marked as RESOLVED by our engineering/rental team.\n\nIf you have any further questions or if the issue persists, please reply in the customer support thread inside your Aurevia dashboard.\n\nThanks,\nAurevia Support Desk`;
        m.sendEmail({
          to: customerEmail,
          subject: `[AUREVIA Support] Ticket Resolved: ${ticket.subject}`,
          text: resolveBody,
          html: resolveBody.replace(/\n/g, "<br/>"),
        }).catch((e) => console.error("Customer ticket resolved email fail:", e));
      });
    }

    return NextResponse.json({ success: true, ticket });
  } catch (err: any) {
    console.error("Support ticket update error:", err);
    return NextResponse.json({ error: err.message || "Failed to update ticket." }, { status: 500 });
  }
}
