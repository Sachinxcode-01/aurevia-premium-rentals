import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/lib/api/response";
import { verifyApiAuth, recordAuditLog } from "@/lib/auth/rbac";
import { createServiceSupabaseClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/db/store";

export interface OperationalSettings {
  minDeposit: number;
  lateFeeHourly: number;
  gstRate: number;
  cancellationWindowHours: number;
  conciergePhone: string;
  supportEmail: string;
  studioAddress: string;
  autoMaintenanceHold: boolean;
  maintenanceThresholdDays: number;
  enableEmailAlerts: boolean;
  updatedAt?: string;
  updatedBy?: string;
}

const DEFAULT_SETTINGS: OperationalSettings = {
  minDeposit: 2000,
  lateFeeHourly: 500,
  gstRate: 18,
  cancellationWindowHours: 24,
  conciergePhone: "+91 91138 27339",
  supportEmail: "concierge@aurevia.com",
  studioAddress: "Near DC Office, Gadag - 582101, Karnataka",
  autoMaintenanceHold: true,
  maintenanceThresholdDays: 30,
  enableEmailAlerts: true,
};

// In-memory fallback for local development or mock mode
let inMemorySettings: OperationalSettings = { ...DEFAULT_SETTINGS };

export async function GET(req: NextRequest) {
  try {
    const { user, response } = await verifyApiAuth(req, ["admin", "staff", "super_admin"]);
    if (response || !user) return response!;

    if (isSupabaseConfigured()) {
      try {
        const supabase = await createServiceSupabaseClient();
        const { data } = await supabase
          .from("website_settings")
          .select("value")
          .eq("key", "operational_settings")
          .maybeSingle();

        if (data?.value) {
          const parsed = JSON.parse(data.value);
          return successResponse({ ...DEFAULT_SETTINGS, ...parsed });
        }
      } catch (err) {
        console.warn("[Settings GET] Supabase fallback to memory:", err);
      }
    }

    return successResponse(inMemorySettings);
  } catch (err: any) {
    console.error("[Settings GET] Error:", err);
    return errorResponse("SETTINGS_FETCH_FAILED", err.message || "Failed to fetch settings", 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const { user, response } = await verifyApiAuth(req, ["admin", "staff", "super_admin"]);
    if (response || !user) return response!;

    const body = await req.json().catch(() => ({}));

    const updated: OperationalSettings = {
      ...inMemorySettings,
      minDeposit: Number(body.minDeposit ?? inMemorySettings.minDeposit),
      lateFeeHourly: Number(body.lateFeeHourly ?? inMemorySettings.lateFeeHourly),
      gstRate: Number(body.gstRate ?? inMemorySettings.gstRate),
      cancellationWindowHours: Number(body.cancellationWindowHours ?? inMemorySettings.cancellationWindowHours),
      conciergePhone: String(body.conciergePhone ?? inMemorySettings.conciergePhone),
      supportEmail: String(body.supportEmail ?? inMemorySettings.supportEmail),
      studioAddress: String(body.studioAddress ?? inMemorySettings.studioAddress),
      autoMaintenanceHold: Boolean(body.autoMaintenanceHold ?? inMemorySettings.autoMaintenanceHold),
      maintenanceThresholdDays: Number(body.maintenanceThresholdDays ?? inMemorySettings.maintenanceThresholdDays),
      enableEmailAlerts: Boolean(body.enableEmailAlerts ?? inMemorySettings.enableEmailAlerts),
      updatedAt: new Date().toISOString(),
      updatedBy: user.email || user.fullName,
    };

    if (isSupabaseConfigured()) {
      try {
        const supabase = await createServiceSupabaseClient();
        await supabase
          .from("website_settings")
          .upsert({
            key: "operational_settings",
            value: JSON.stringify(updated),
          }, { onConflict: "key" });
      } catch (err) {
        console.warn("[Settings POST] Supabase upsert error, keeping in memory:", err);
      }
    }

    inMemorySettings = updated;

    await recordAuditLog({
      actorId: user.id,
      actorEmail: user.email,
      action: "UPDATE_OPERATIONAL_SETTINGS",
      resource: "website_settings",
      resourceId: "operational_settings",
      metadata: updated as any,
    });

    return successResponse(updated, "Operational settings updated successfully");
  } catch (err: any) {
    console.error("[Settings POST] Error:", err);
    return errorResponse("SETTINGS_SAVE_FAILED", err.message || "Failed to update settings", 500);
  }
}
