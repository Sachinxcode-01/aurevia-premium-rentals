import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/lib/api/response";
import { verifyApiAuth, recordAuditLog } from "@/lib/auth/rbac";
import { createServiceSupabaseClient } from "@/lib/supabase/server";
import { realtimeHub } from "@/lib/realtime/realtimeHub";

async function getKycRegistry(supabase: any): Promise<any[]> {
  try {
    const { data } = await supabase
      .from("website_settings")
      .select("value")
      .eq("key", "aurevia_kyc_registry")
      .maybeSingle();

    if (data?.value) {
      const parsed = JSON.parse(data.value);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {}
  return [];
}

async function saveKycRegistry(supabase: any, docs: any[]) {
  await supabase.from("website_settings").upsert({
    key: "aurevia_kyc_registry",
    value: JSON.stringify(docs),
  });
}

export async function GET(req: NextRequest) {
  try {
    const { user, response } = await verifyApiAuth(req, ["admin", "staff", "super_admin"]);
    if (response || !user) return response!;

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");

    const supabase = await createServiceSupabaseClient();
    let docs = await getKycRegistry(supabase);

    if (status && status !== "ALL") {
      docs = docs.filter((d) => (d.status || "").toLowerCase() === status.toLowerCase());
    }

    return successResponse(docs, "Admin KYC submissions loaded");
  } catch (err: any) {
    return errorResponse("ADMIN_KYC_ERROR", err.message || "Failed to load admin KYC list", 500);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { user, response } = await verifyApiAuth(req, ["admin", "staff", "super_admin"]);
    if (response || !user) return response!;

    const body = await req.json();
    const { id, status, rejectionReason } = body;

    if (!id || !status) {
      return errorResponse("INVALID_KYC_ACTION", "document id and target status are required", 400);
    }

    const normStatus = status.toLowerCase();
    if (!["approved", "rejected", "reupload_required"].includes(normStatus)) {
      return errorResponse("INVALID_KYC_STATUS", `Status '${status}' is invalid for KYC review`, 400);
    }

    const supabase = await createServiceSupabaseClient();
    const docs = await getKycRegistry(supabase);
    const idx = docs.findIndex((d) => d.id === id);

    if (idx === -1) {
      return errorResponse("KYC_NOT_FOUND", "KYC submission not found", 404);
    }

    docs[idx] = {
      ...docs[idx],
      status: normStatus,
      rejection_reason: rejectionReason || null,
      reviewed_by: user.id,
      reviewed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    await saveKycRegistry(supabase, docs);

    // Record Audit Trail
    await recordAuditLog({
      actorId: user.id,
      actorEmail: user.email,
      action: `kyc.${normStatus}`,
      resource: "kyc_registry",
      resourceId: id,
      metadata: { profileId: docs[idx].profile_id, rejectionReason },
    }).catch(() => {});

    // Notify Customer in Supabase notifications table
    if (docs[idx].profile_id) {
      await supabase.from("notifications").insert({
        profile_id: docs[idx].profile_id,
        title: normStatus === "approved" ? "KYC Approved! 🎉" : "KYC Document Verification Status",
        message:
          normStatus === "approved"
            ? "Your identity verification has been approved. You are now verified for premium gear rentals."
            : `Your KYC document verification status is: ${status.toUpperCase()}. ${rejectionReason ? `Reason: ${rejectionReason}` : ""}`,
      }).catch(() => {});
    }

    realtimeHub.broadcast("KYC_STATUS_UPDATED", { id, status: normStatus }, "admin");
    return successResponse(docs[idx], `KYC submission successfully updated to '${status}'`);
  } catch (err: any) {
    return errorResponse("ADMIN_KYC_UPDATE_FAILED", err.message || "Failed to process KYC review", 500);
  }
}
