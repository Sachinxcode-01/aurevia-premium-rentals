"use server";

import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { checkRateLimit, recordFailedAttempt, resetRateLimit } from "@/lib/rateLimit";
import { logSecurityEvent } from "@/lib/auditLogger";

export interface AdminAuthResult {
  success: boolean;
  error?: string;
  url?: string;
}

export async function adminSignInWithPasswordAction(
  email: string,
  pass: string
): Promise<AdminAuthResult> {
  const cleanEmail = email.toLowerCase().trim();
  const rateLimitKey = `admin_login:${cleanEmail}`;

  // 1. Check Rate Limit
  const rateCheck = checkRateLimit(rateLimitKey);
  if (!rateCheck.allowed) {
    await logSecurityEvent({
      eventType: "RATE_LIMIT_EXCEEDED",
      email: cleanEmail,
      severity: "CRITICAL",
      details: { reason: rateCheck.message },
    });
    return { success: false, error: rateCheck.message };
  }

  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    // 2. Sign In with Supabase
    const { data: authData, error: authErr } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password: pass,
    });

    if (authErr || !authData.user) {
      const failRecord = recordFailedAttempt(rateLimitKey);
      await logSecurityEvent({
        eventType: "ADMIN_LOGIN_FAILED",
        email: cleanEmail,
        severity: "WARNING",
        details: { authError: authErr?.message, remainingAttempts: failRecord.remainingAttempts },
      });
      return {
        success: false,
        error: authErr?.message || "Invalid administrative credentials.",
      };
    }

    // 3. Verify RBAC Admin/Staff Role
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", authData.user.id)
      .single();

    const role = profile?.role || authData.user.user_metadata?.role || "customer";

    if (!["admin", "staff", "super_admin"].includes(role)) {
      await supabase.auth.signOut();
      recordFailedAttempt(rateLimitKey);
      await logSecurityEvent({
        eventType: "UNAUTHORIZED_ACCESS_ATTEMPT",
        userId: authData.user.id,
        email: cleanEmail,
        severity: "CRITICAL",
        details: { attemptedRole: role },
      });
      return {
        success: false,
        error: "Access Denied: Your account does not have administrative privileges.",
      };
    }

    // 4. Success -> Reset Rate Limit & Log Audit Event
    resetRateLimit(rateLimitKey);
    await logSecurityEvent({
      eventType: "ADMIN_LOGIN_SUCCESS",
      userId: authData.user.id,
      email: cleanEmail,
      severity: "INFO",
      details: { role },
    });

    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Authentication error";
    return { success: false, error: msg };
  }
}

export async function adminSignInWithGoogleAction(): Promise<AdminAuthResult> {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const origin = process.env.NEXT_PUBLIC_SITE_URL ?? process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3002";

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${origin}/auth/callback`,
        queryParams: {
          access_type: "offline",
          prompt: "consent",
        },
      },
    });

    if (error || !data.url) {
      return { success: false, error: error?.message || "Failed to initiate Google Admin Auth" };
    }

    return { success: true, url: data.url };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Google Admin Auth error";
    return { success: false, error: msg };
  }
}

export async function adminSignOutAction(): Promise<AdminAuthResult> {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      await logSecurityEvent({
        eventType: "ADMIN_LOGOUT",
        userId: user.id,
        email: user.email,
        severity: "INFO",
      });
    }

    await supabase.auth.signOut();
    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Sign out error";
    return { success: false, error: msg };
  }
}
