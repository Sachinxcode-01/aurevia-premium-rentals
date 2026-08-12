import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/lib/api/response";
import { verifyApiAuth, recordAuditLog } from "@/lib/auth/rbac";
import { createServiceSupabaseClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  try {
    const { user, response } = await verifyApiAuth(req, ["admin", "staff", "super_admin"]);
    if (response || !user) return response!;

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");

    const supabase = await createServiceSupabaseClient();

    let query = supabase
      .from("kyc_documents")
      .select("*, profile:profiles(full_name, email, phone, role)")
      .order("created_at", { ascending: false });

    if (status && status !== "ALL") {
      query = query.eq("status", status.toLowerCase());
    }

    const { data: docs, error } = await query;

    if (error) {
      return errorResponse("FETCH_ADMIN_KYC_FAILED", error.message, 500);
    }

    return successResponse(docs || [], "Admin KYC submissions loaded");
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

    if (!["approved", "rejected", "reupload_required"].includes(status.toLowerCase())) {
      return errorResponse("INVALID_KYC_STATUS", `Status '${status}' is invalid for KYC review`, 400);
    }

    const supabase = await createServiceSupabaseClient();

    const { data: updatedDoc, error } = await supabase
      .from("kyc_documents")
      .update({
        status: status.toLowerCase(),
        rejection_reason: rejectionReason || null,
        reviewed_by: user.id,
        reviewed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error || !updatedDoc) {
      return errorResponse("UPDATE_KYC_FAILED", error?.message || "Failed to update KYC status", 500);
    }

    // Record Audit Trail
    await recordAuditLog({
      actorId: user.id,
      actorEmail: user.email,
      action: `kyc.${status.toLowerCase()}`,
      resource: "kyc_documents",
      resourceId: id,
      metadata: { profileId: updatedDoc.profile_id, rejectionReason },
    });

    // Notify Customer
    if (updatedDoc.profile_id) {
      await supabase.from("notifications").insert({
        profile_id: updatedDoc.profile_id,
        title: status === "approved" ? "KYC Approved! 🎉" : "KYC Document Verification Status",
        message:
          status === "approved"
            ? "Your identity verification has been approved. You are now verified for premium gear rentals."
            : `Your KYC document verification status is: ${status.toUpperCase()}. ${rejectionReason ? `Reason: ${rejectionReason}` : ""}`,
      });
    }

    return successResponse(updatedDoc, `KYC submission successfully updated to '${status}'`);
  } catch (err: any) {
    return errorResponse("ADMIN_KYC_UPDATE_FAILED", err.message || "Failed to process KYC review", 500);
  }
}
