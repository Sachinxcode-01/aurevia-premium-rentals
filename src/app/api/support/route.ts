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

    // 1. Authenticate user with fallback
    if (isSupabaseConfigured()) {
      try {
        const supabase = await createServerSupabaseClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          profileId = user.id;
          userEmail = user.email || "";
        }
      } catch {
        // Fallback to profile
      }
    }
    
    if (!profileId) {
      const profile = await db.getProfile();
      profileId = profile.id || "usr-prem";
      userEmail = profile.email || "customer@aurevia.com";
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

export async function GET() {
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
    const ticketsWithReplies = await Promise.all(
      tickets.map(async (t) => {
        const replies = await db.getTicketReplies(t.id).catch(() => []);
        return { ...t, replies };
      })
    );

    return NextResponse.json({ success: true, tickets: ticketsWithReplies });
  } catch (err: any) {
    console.error("Support ticket list error:", err);
    return NextResponse.json({ error: err.message || "Failed to list tickets." }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const { isSupabaseConfigured } = await import("@/lib/db/store");
    const body = await request.json().catch(() => ({}));
    const { ticketId, status, message } = body;

    if (!ticketId) {
      return NextResponse.json({ error: "Missing required field ticketId." }, { status: 400 });
    }

    let actorId = "";
    let actorEmail = "";
    let isAdmin = false;

    // Authenticate
    if (isSupabaseConfigured()) {
      const supabase = await createServerSupabaseClient();
      const { data: { user }, error: authErr } = await supabase.auth.getUser();
      if (authErr || !user) {
        return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
      }
      actorId = user.id;
      actorEmail = user.email || "";

      const { data } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();
      
      const profile = data as any;
      isAdmin = profile?.role === "admin" || profile?.role === "staff";
    } else {
      const profile = await db.getProfile();
      actorId = profile.id;
      actorEmail = profile.email;
      isAdmin = profile.role === "admin" || profile.role === "staff";
    }

    // 1. If sending a reply message
    if (message) {
      const reply = await db.addTicketReply({
        ticketId,
        senderId: actorId,
        message,
      });

      // Email alert if admin replies to customer
      if (isAdmin && typeof window === "undefined") {
        import("@/lib/email/mailer").then(async (m) => {
          const ticket = await db.getSupportTicketById(ticketId);
          if (ticket) {
            const customerEmail = ticket.profiles?.email || "customer@aurevia.com";
            const replyBody = `Hi,\n\nSupport has replied to your ticket "${ticket.subject}":\n\n"${message}"\n\nYou can view and reply from your dashboard.\n\nThanks,\nAUREVIA Support`;
            m.sendEmail({
              to: customerEmail,
              subject: `[AUREVIA Support] Reply on: ${ticket.subject}`,
              text: replyBody,
              html: replyBody.replace(/\n/g, "<br/>"),
            }).catch(() => {});
          }
        });
      }

      return NextResponse.json({ success: true, reply });
    }

    // 2. If updating status
    if (status) {
      if (!isAdmin) {
        return NextResponse.json({ error: "Access denied." }, { status: 403 });
      }

      let ticket = null;
      if (status === "resolved") {
        const ok = await db.resolveSupportTicket(ticketId);
        if (ok) {
          ticket = await db.getSupportTicketById(ticketId);
        }
      } else {
        ticket = await db.getSupportTicketById(ticketId);
      }

      if (!ticket) {
        return NextResponse.json({ error: "Failed to update support ticket." }, { status: 500 });
      }

      // Notify customer on resolution
      if (status === "resolved" && typeof window === "undefined") {
        import("@/lib/email/mailer").then(async (m) => {
          let customerEmail = "customer@aurevia.com";
          if (isSupabaseConfigured()) {
            const supabase = await createServerSupabaseClient();
            const { data } = await supabase.from("profiles").select("email").eq("id", ticket.profile_id).single();
            const customerProfile = data as any;
            if (customerProfile?.email) customerEmail = customerProfile.email;
          } else {
            customerEmail = actorEmail;
          }

          const resolveBody = `Hi,\n\nYour support ticket regarding "${ticket.subject}" has been marked as RESOLVED by our team.\n\nThanks,\nAurevia Support Desk`;
          m.sendEmail({
            to: customerEmail,
            subject: `[AUREVIA Support] Ticket Resolved: ${ticket.subject}`,
            text: resolveBody,
            html: resolveBody.replace(/\n/g, "<br/>"),
          }).catch((e) => console.error("Customer ticket resolved email fail:", e));
        });
      }

      return NextResponse.json({ success: true, ticket });
    }

    return NextResponse.json({ error: "Nothing to update. Provide status or message." }, { status: 400 });
  } catch (err: any) {
    console.error("Support ticket update error:", err);
    return NextResponse.json({ error: err.message || "Failed to update ticket." }, { status: 500 });
  }
}
