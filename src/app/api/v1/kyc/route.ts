import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/lib/api/response";
import { verifyApiAuth, recordAuditLog } from "@/lib/auth/rbac";
import { createServiceSupabaseClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  try {
    const { user, response } = await verifyApiAuth(req);
    if (response || !user) return response!;

    const supabase = await createServiceSupabaseClient();

    const { data: docs, error } = await supabase
      .from("kyc_documents")
      .select("*")
      .eq("profile_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      return errorResponse("FETCH_KYC_FAILED", error.message, 500);
    }

    return successResponse(docs || [], "KYC documents retrieved");
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Failed to fetch KYC data";
    return errorResponse("SERVER_ERROR", errorMsg, 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const { user, response } = await verifyApiAuth(req);
    if (response || !user) return response!;

    const body = await req.json();
    const { documentType, documentNumber, filePath, fileSize, mimeType } = body;

    if (!documentType || !filePath) {
      return errorResponse("INVALID_KYC_DATA", "documentType and filePath are required", 400);
    }

    const supabase = await createServiceSupabaseClient();

    // Insert or update KYC Document
    const { data: doc, error } = await supabase
      .from("kyc_documents")
      .insert({
        profile_id: user.id,
        document_type: documentType,
        document_number: documentNumber || null,
        file_path: filePath,
        file_size: fileSize || 1024,
        mime_type: mimeType || "image/jpeg",
        status: "pending",
      })
      .select()
      .single();

    if (error || !doc) {
      return errorResponse("SAVE_KYC_FAILED", error?.message || "Failed to save KYC record", 500);
    }

    // Record Audit & Notifications
    await recordAuditLog({
      actorId: user.id,
      actorEmail: user.email,
      action: "kyc.submitted",
      resource: "kyc_documents",
      resourceId: doc.id,
      metadata: { documentType, status: "pending" },
    });

    await supabase.from("notifications").insert({
      profile_id: user.id,
      title: "KYC Verification Submitted",
      message: "Your identity verification document has been submitted and is pending admin approval.",
    });

    return successResponse(doc, "KYC document submitted successfully. Verification pending.", 201);
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Failed to submit KYC document";
    return errorResponse("SUBMIT_KYC_FAILED", errorMsg, 500);
  }
}
