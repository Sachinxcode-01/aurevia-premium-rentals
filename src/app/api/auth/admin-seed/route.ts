import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServiceSupabaseClient } from "@/lib/supabase/server";

/**
 * POST /api/auth/admin-seed
 * Seeds Prem (admin) and Sachin (staff) accounts into Supabase.
 * Protected by ADMIN_SEED_SECRET env var header.
 *
 * Usage (run once):
 *   curl -X POST http://localhost:3000/api/auth/admin-seed \
 *     -H "x-seed-secret: <ADMIN_SEED_SECRET>"
 */
export async function POST(request: NextRequest) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Admin seeding is disabled in production." }, { status: 403 });
  }

  const secret = request.headers.get("x-seed-secret");
  const expectedSecret = process.env.ADMIN_SEED_SECRET;

  if (!expectedSecret || secret !== expectedSecret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = await createServiceSupabaseClient();

  const adminEmail    = process.env.ADMIN_EMAIL    ?? "premmundargi135@gmail.com";
  const adminPassword = process.env.ADMIN_PASSWORD ?? "AureviaAdmin@2026";
  const adminName     = process.env.ADMIN_NAME     ?? "Prem Mundargi";

  const staffEmail    = process.env.STAFF_EMAIL    ?? "sachiii8827@gmail.com";
  const staffPassword = process.env.STAFF_PASSWORD ?? "AureviaStaff@2026";
  const staffName     = process.env.STAFF_NAME     ?? "Sachin";

  const results: Record<string, unknown> = {};

  // ── Seed Admin (Prem) ──────────────────────────────────────
  const { data: adminUser, error: adminErr } = await (supabase as any).auth.admin.createUser({
    email: adminEmail,
    password: adminPassword,
    email_confirm: true,
    user_metadata: { full_name: adminName },
  });

  if (adminErr && !adminErr.message.includes("already been registered")) {
    results.admin = { success: false, error: adminErr.message };
  } else {
    const adminId = adminUser?.user?.id;
    if (adminId) {
      await supabase.from("profiles").upsert([{
        id: adminId,
        full_name: adminName,
        email: adminEmail,
        phone: process.env.ADMIN_PHONE ?? "9686909048",
        role: "admin",
        avatar_url: null,
      }] as never[]);
    }
    results.admin = { success: true, email: adminEmail };
  }

  // ── Seed Staff (Sachin) ────────────────────────────────────
  const { data: staffUser, error: staffErr } = await (supabase as any).auth.admin.createUser({
    email: staffEmail,
    password: staffPassword,
    email_confirm: true,
    user_metadata: { full_name: staffName },
  });

  if (staffErr && !staffErr.message.includes("already been registered")) {
    results.staff = { success: false, error: staffErr.message };
  } else {
    const staffId = staffUser?.user?.id;
    if (staffId) {
      await supabase.from("profiles").upsert([{
        id: staffId,
        full_name: staffName,
        email: staffEmail,
        phone: process.env.STAFF_PHONE ?? "",
        role: "staff",
        avatar_url: null,
      }] as never[]);
    }
    results.staff = { success: true, email: staffEmail };
  }

  return NextResponse.json({ seeded: true, results });
}
