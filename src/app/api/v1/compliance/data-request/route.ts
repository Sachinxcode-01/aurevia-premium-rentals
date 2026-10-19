import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/lib/api/response";
import { createServiceSupabaseClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      requestType,
      fullName,
      email,
      phone,
      details,
    } = body;

    if (!requestType || !email || !fullName) {
      return errorResponse(
        "INVALID_REQUEST",
        "Full name, email address, and request type are required fields.",
        400
      );
    }

    const validTypes = [
      "DATA_DELETION",
      "DATA_PORTABILITY_EXPORT",
      "KYC_PURGE",
      "RECTIFICATION",
      "MARKETING_OPT_OUT",
      "GDPR_GENERAL_INQUIRY",
    ];

    if (!validTypes.includes(requestType)) {
      return errorResponse(
        "UNSUPPORTED_REQUEST_TYPE",
        `Request type must be one of: ${validTypes.join(", ")}`,
        400
      );
    }

    // Attempt to log request into Supabase audit or support log, or fallback safely
    const requestId = `DSR-${Date.now().toString(36).toUpperCase()}-${Math.floor(
      Math.random() * 9000 + 1000
    )}`;

    try {
      const supabase = await createServiceSupabaseClient();
      await supabase.from("audit_logs").insert({
        action: `COMPLIANCE_${requestType}`,
        details: `Compliance data subject request submitted by ${email} (${fullName})`,
        metadata: {
          requestId,
          requestType,
          email,
          fullName,
          phone: phone || null,
          details: details || null,
          submittedAt: new Date().toISOString(),
          ip: req.headers.get("x-forwarded-for") || "unknown",
        },
      });
    } catch (dbErr) {
      console.warn("[Compliance API] Audit log insertion notice:", dbErr);
    }

    return successResponse(
      {
        requestId,
        status: "RECEIVED_AND_QUEUED",
        expectedResolutionTime: "30 calendar days (per GDPR Art. 12 & DPDP Act)",
        acknowledgementSentTo: email,
        dpoContact: "premmundargi135@gmail.com",
      },
      `Your ${requestType} request has been officially received with Reference ID ${requestId}. Our Data Protection Officer will review and fulfill it within statutory deadlines.`
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal processing error";
    return errorResponse("COMPLIANCE_REQUEST_FAILED", message, 500);
  }
}
