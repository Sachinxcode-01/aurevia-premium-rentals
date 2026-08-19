"use server";

import { createClient as createSupabaseClient } from "@supabase/supabase-js";

export type SecurityEventType =
  | "ADMIN_LOGIN_SUCCESS"
  | "ADMIN_LOGIN_FAILED"
  | "GOOGLE_ADMIN_LOGIN"
  | "UNAUTHORIZED_ACCESS_ATTEMPT"
  | "RATE_LIMIT_EXCEEDED"
  | "ADMIN_LOGOUT";

export interface AuditLogPayload {
  eventType: SecurityEventType;
  userId?: string | null;
  email?: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  severity?: "INFO" | "WARNING" | "CRITICAL";
  details?: Record<string, unknown> | null;
}

export async function logSecurityEvent(payload: AuditLogPayload): Promise<void> {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://uoutovqmmxzawhvpahcg.supabase.co";
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
    
    if (!url || !key) return;

    const supabase = createSupabaseClient(url, key);

    await supabase.from("audit_logs").insert([
      {
        user_id: payload.userId || null,
        user_email: payload.email || null,
        action: payload.eventType,
        resource: "admin_portal",
        ip_address: payload.ipAddress || "client_browser",
        user_agent: payload.userAgent || "browser",
        severity: payload.severity || (payload.eventType.includes("FAILED") || payload.eventType.includes("UNAUTHORIZED") ? "WARNING" : "INFO"),
        details: payload.details || {},
        created_at: new Date().toISOString(),
      },
    ] as never[]);
  } catch (err) {
    console.error("Failed to write security audit log:", err);
  }
}
