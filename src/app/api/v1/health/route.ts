import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/lib/api/response";
import { createServiceSupabaseClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  try {
    const supabase = await createServiceSupabaseClient();
    const startTime = Date.now();
    
    // Test database ping
    const { data, error } = await supabase.from("products").select("id").limit(1);
    const dbLatency = Date.now() - startTime;

    if (error) {
      return errorResponse("DATABASE_ERROR", "Database connection check failed", 500, { error: error.message });
    }

    return successResponse({
      status: "healthy",
      timestamp: new Date().toISOString(),
      version: "1.0.0",
      services: {
        api: "online",
        database: "online",
        dbLatencyMs: dbLatency,
      },
    }, "AUREVIA API is operating normally");
  } catch (err: any) {
    return errorResponse("HEALTH_CHECK_FAILED", err.message || "Health check failed", 500);
  }
}
