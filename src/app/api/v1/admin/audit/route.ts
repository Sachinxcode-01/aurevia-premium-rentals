import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/lib/api/response";
import { verifyApiAuth } from "@/lib/auth/rbac";
import { createServiceSupabaseClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  try {
    const { user, response } = await verifyApiAuth(req, ["admin", "staff", "super_admin"]);
    if (response || !user) return response!;

    const { searchParams } = new URL(req.url);
    const limit = Math.min(200, parseInt(searchParams.get("limit") || "50", 10));
    const category = searchParams.get("category")?.toLowerCase() || "all";
    const search = searchParams.get("search")?.toLowerCase().trim();

    const supabase = await createServiceSupabaseClient();

    let query = supabase
      .from("audit_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (category && category !== "all") {
      query = query.ilike("action", `${category}%`);
    }

    const { data: logs, error } = await query;

    if (error) {
      return errorResponse("FETCH_AUDIT_LOGS_FAILED", error.message, 500);
    }

    let records = logs || [];

    // Memory filter for deeper keyword search across multiple fields
    if (search) {
      records = records.filter(
        (log: any) =>
          log.actor_email?.toLowerCase().includes(search) ||
          log.action?.toLowerCase().includes(search) ||
          log.resource?.toLowerCase().includes(search) ||
          log.resource_id?.toLowerCase().includes(search) ||
          log.ip_address?.includes(search)
      );
    }

    return successResponse(records, "Audit log records retrieved");
  } catch (err: any) {
    return errorResponse("ADMIN_AUDIT_ERROR", err.message || "Failed to load audit logs", 500);
  }
}
