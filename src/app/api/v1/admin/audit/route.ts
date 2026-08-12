import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/lib/api/response";
import { verifyApiAuth } from "@/lib/auth/rbac";
import { createServiceSupabaseClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  try {
    const { user, response } = await verifyApiAuth(req, ["admin", "staff", "super_admin"]);
    if (response || !user) return response!;

    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "50", 10);

    const supabase = await createServiceSupabaseClient();

    const { data: logs, error } = await supabase
      .from("audit_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      return errorResponse("FETCH_AUDIT_LOGS_FAILED", error.message, 500);
    }

    return successResponse(logs || [], "Audit log records retrieved");
  } catch (err: any) {
    return errorResponse("ADMIN_AUDIT_ERROR", err.message || "Failed to load audit logs", 500);
  }
}
