import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { logSecurityEvent } from "@/lib/auditLogger";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (code) {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { error: exchangeErr } = await supabase.auth.exchangeCodeForSession(code);

    if (!exchangeErr) {
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        // Verify RBAC privileges
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single();

        const role = profile?.role || user.user_metadata?.role || "customer";

        if (!["admin", "staff", "super_admin"].includes(role)) {
          // Revoke non-admin session
          await supabase.auth.signOut();

          await logSecurityEvent({
            eventType: "UNAUTHORIZED_ACCESS_ATTEMPT",
            userId: user.id,
            email: user.email,
            severity: "CRITICAL",
            details: { authProvider: "google", attemptedRole: role },
          });

          return NextResponse.redirect(
            `${origin}/admin-login?error=${encodeURIComponent(
              "Access Denied: Google account does not have administrative privileges."
            )}`
          );
        }

        // Log successful Google Admin login
        await logSecurityEvent({
          eventType: "GOOGLE_ADMIN_LOGIN",
          userId: user.id,
          email: user.email,
          severity: "INFO",
          details: { role },
        });

        return NextResponse.redirect(`${origin}${next}`);
      }
    }
  }

  return NextResponse.redirect(`${origin}/admin-login?error=auth_failed`);
}
