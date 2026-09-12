import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/lib/api/response";
import { verifyApiAuth, recordAuditLog } from "@/lib/auth/rbac";
import { createServiceSupabaseClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/db/store";
import { realtimeHub } from "@/lib/realtime/realtimeHub";

export interface AdminCoupon {
  id: string;
  code: string;
  type: "flat" | "percentage";
  value: number;
  minBooking: number;
  maxDiscount?: number;
  usageLimit: number;
  usedCount: number;
  revenueGenerated: number;
  active: boolean;
  activeUntil?: string;
  createdAt: string;
}

const DEFAULT_COUPONS: AdminCoupon[] = [
  {
    id: "c_aurevia199",
    code: "AUREVIA199",
    type: "flat",
    value: 199,
    minBooking: 2500,
    maxDiscount: 199,
    usageLimit: 500,
    usedCount: 42,
    revenueGenerated: 210000,
    active: true,
    activeUntil: "2026-12-31T23:59:59.000Z",
    createdAt: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "c_welcome20",
    code: "WELCOME20",
    type: "percentage",
    value: 20,
    minBooking: 5000,
    maxDiscount: 5000,
    usageLimit: 200,
    usedCount: 78,
    revenueGenerated: 780000,
    active: true,
    activeUntil: "2026-12-31T23:59:59.000Z",
    createdAt: "2026-01-05T00:00:00.000Z",
  },
  {
    id: "c_prem15",
    code: "PREM15",
    type: "percentage",
    value: 15,
    minBooking: 10000,
    maxDiscount: 7500,
    usageLimit: 100,
    usedCount: 19,
    revenueGenerated: 342000,
    active: true,
    activeUntil: "2026-12-31T23:59:59.000Z",
    createdAt: "2026-01-15T00:00:00.000Z",
  },
];

const inMemoryCoupons: AdminCoupon[] = [...DEFAULT_COUPONS];

export async function GET(req: NextRequest) {
  try {
    const { user, response } = await verifyApiAuth(req, ["admin", "staff", "super_admin"]);
    if (response || !user) return response!;

    if (isSupabaseConfigured()) {
      try {
        const supabase = await createServiceSupabaseClient();
        const { data: dbCoupons, error } = await supabase
          .from("coupons")
          .select("*")
          .order("created_at", { ascending: false });

        if (!error && dbCoupons && dbCoupons.length > 0) {
          const mapped: AdminCoupon[] = dbCoupons.map((c: any) => ({
            id: c.id,
            code: c.code,
            type: c.discount_flat && Number(c.discount_flat) > 0 ? "flat" : "percentage",
            value: Number(c.discount_flat || c.discount_percent || 0),
            minBooking: Number(c.min_booking_amount || 0),
            maxDiscount: c.max_discount_amount ? Number(c.max_discount_amount) : undefined,
            usageLimit: Number(c.usage_limit || 100),
            usedCount: Number(c.used_count || 0),
            revenueGenerated: Number(c.revenue_generated || 0),
            active: Boolean(c.is_active),
            activeUntil: c.active_until || undefined,
            createdAt: c.created_at || new Date().toISOString(),
          }));
          return successResponse(mapped, "Coupons retrieved from database");
        }
      } catch (err) {
        console.warn("[Coupons GET] Supabase fallback to memory:", err);
      }
    }

    return successResponse(inMemoryCoupons, "Coupons retrieved from memory");
  } catch (err: any) {
    console.error("[Coupons GET] Error:", err);
    return errorResponse("COUPONS_FETCH_FAILED", err.message || "Failed to load coupons", 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const { user, response } = await verifyApiAuth(req, ["super_admin", "admin"]);
    if (response || !user) return response!;

    const body = await req.json().catch(() => ({}));
    const { code, type, value, minBooking, maxDiscount, usageLimit, activeUntil } = body;

    if (!code || !type || value === undefined || value === null) {
      return errorResponse("MISSING_FIELDS", "Coupon code, type, and discount value are required", 400);
    }

    const cleanCode = String(code).trim().toUpperCase().replace(/[^A-Z0-9_-]/g, "");
    if (cleanCode.length < 3) {
      return errorResponse("INVALID_CODE", "Coupon code must be at least 3 alphanumeric characters", 400);
    }

    if (!["flat", "percentage"].includes(type)) {
      return errorResponse("INVALID_TYPE", "Coupon type must be 'flat' or 'percentage'", 400);
    }

    const numValue = Number(value);
    if (isNaN(numValue) || numValue <= 0) {
      return errorResponse("INVALID_VALUE", "Coupon discount value must be a positive number", 400);
    }

    if (type === "percentage" && numValue > 100) {
      return errorResponse("INVALID_PERCENTAGE", "Percentage discount cannot exceed 100%", 400);
    }

    // Check duplicate code
    const existing = inMemoryCoupons.find((c) => c.code.toUpperCase() === cleanCode);
    if (existing) {
      return errorResponse("COUPON_ALREADY_EXISTS", `Coupon '${cleanCode}' already exists`, 409);
    }

    const newCoupon: AdminCoupon = {
      id: `cpn_${cleanCode.toLowerCase()}_${Date.now().toString(36)}`,
      code: cleanCode,
      type,
      value: numValue,
      minBooking: Number(minBooking || 0),
      maxDiscount: maxDiscount ? Number(maxDiscount) : undefined,
      usageLimit: Number(usageLimit || 100),
      usedCount: 0,
      revenueGenerated: 0,
      active: true,
      activeUntil: activeUntil || undefined,
      createdAt: new Date().toISOString(),
    };

    if (isSupabaseConfigured()) {
      try {
        const supabase = await createServiceSupabaseClient();
        await supabase.from("coupons").upsert({
          id: newCoupon.id,
          code: cleanCode,
          discount_percent: type === "percentage" ? numValue : 0,
          discount_flat: type === "flat" ? numValue : 0,
          min_booking_amount: newCoupon.minBooking,
          max_discount_amount: newCoupon.maxDiscount || null,
          usage_limit: newCoupon.usageLimit,
          is_active: true,
          active_until: newCoupon.activeUntil || null,
          created_at: newCoupon.createdAt,
        }, { onConflict: "code" });
      } catch (err) {
        console.warn("[Coupons POST] Supabase insert warning:", err);
      }
    }

    inMemoryCoupons.unshift(newCoupon);

    // Broadcast across realtimeHub so customer storefront & admin tabs update
    realtimeHub.broadcast("COUPON_UPDATED", { action: "create", coupon: newCoupon }, "admin");

    await recordAuditLog({
      actorId: user.id,
      actorEmail: user.email,
      action: "CREATE_COUPON",
      resource: "coupons",
      resourceId: newCoupon.id,
      metadata: { code: cleanCode, type, value: numValue },
    });

    return successResponse(newCoupon, `Coupon '${cleanCode}' created successfully`);
  } catch (err: any) {
    console.error("[Coupons POST] Error:", err);
    return errorResponse("COUPON_CREATE_FAILED", err.message || "Failed to create coupon", 500);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { user, response } = await verifyApiAuth(req, ["super_admin", "admin"]);
    if (response || !user) return response!;

    const body = await req.json().catch(() => ({}));
    const { code, id, active, value, minBooking, maxDiscount, usageLimit } = body;

    const identifier = code || id;
    if (!identifier) {
      return errorResponse("MISSING_IDENTIFIER", "Coupon code or ID is required for update", 400);
    }

    const cIdx = inMemoryCoupons.findIndex(
      (c) => c.code.toUpperCase() === String(identifier).toUpperCase() || c.id === identifier
    );

    if (cIdx === -1 && !isSupabaseConfigured()) {
      return errorResponse("NOT_FOUND", "Coupon not found", 404);
    }

    const targetCoupon = inMemoryCoupons[cIdx];
    const newActiveState = active !== undefined ? Boolean(active) : targetCoupon?.active;

    if (isSupabaseConfigured()) {
      try {
        const supabase = await createServiceSupabaseClient();
        const updatePayload: Record<string, any> = {};
        if (active !== undefined) updatePayload.is_active = Boolean(active);
        if (value !== undefined) {
          if (targetCoupon?.type === "percentage") updatePayload.discount_percent = Number(value);
          else updatePayload.discount_flat = Number(value);
        }
        if (minBooking !== undefined) updatePayload.min_booking_amount = Number(minBooking);
        if (maxDiscount !== undefined) updatePayload.max_discount_amount = Number(maxDiscount);
        if (usageLimit !== undefined) updatePayload.usage_limit = Number(usageLimit);

        await supabase.from("coupons").update(updatePayload).or(`code.eq.${identifier},id.eq.${identifier}`);
      } catch (err) {
        console.warn("[Coupons PATCH] Supabase error:", err);
      }
    }

    if (cIdx !== -1) {
      if (active !== undefined) inMemoryCoupons[cIdx].active = Boolean(active);
      if (value !== undefined) inMemoryCoupons[cIdx].value = Number(value);
      if (minBooking !== undefined) inMemoryCoupons[cIdx].minBooking = Number(minBooking);
      if (maxDiscount !== undefined) inMemoryCoupons[cIdx].maxDiscount = Number(maxDiscount);
      if (usageLimit !== undefined) inMemoryCoupons[cIdx].usageLimit = Number(usageLimit);
    }

    realtimeHub.broadcast("COUPON_UPDATED", { action: "update", code: identifier, active: newActiveState }, "admin");

    await recordAuditLog({
      actorId: user.id,
      actorEmail: user.email,
      action: "UPDATE_COUPON",
      resource: "coupons",
      resourceId: identifier,
      metadata: { code: identifier, active: newActiveState },
    });

    return successResponse({ code: identifier, active: newActiveState }, "Coupon updated successfully");
  } catch (err: any) {
    console.error("[Coupons PATCH] Error:", err);
    return errorResponse("COUPON_UPDATE_FAILED", err.message || "Failed to update coupon", 500);
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { user, response } = await verifyApiAuth(req, ["super_admin", "admin"]);
    if (response || !user) return response!;

    const { searchParams } = new URL(req.url);
    const code = searchParams.get("code") || searchParams.get("id");

    if (!code) {
      return errorResponse("MISSING_CODE", "Coupon code or ID is required for deletion", 400);
    }

    const cIdx = inMemoryCoupons.findIndex(
      (c) => c.code.toUpperCase() === code.toUpperCase() || c.id === code
    );

    if (cIdx !== -1) {
      inMemoryCoupons.splice(cIdx, 1);
    }

    if (isSupabaseConfigured()) {
      try {
        const supabase = await createServiceSupabaseClient();
        await supabase.from("coupons").delete().or(`code.eq.${code},id.eq.${code}`);
      } catch (err) {
        console.warn("[Coupons DELETE] Supabase delete warning:", err);
      }
    }

    realtimeHub.broadcast("COUPON_UPDATED", { action: "delete", code }, "admin");

    await recordAuditLog({
      actorId: user.id,
      actorEmail: user.email,
      action: "DELETE_COUPON",
      resource: "coupons",
      resourceId: code,
      metadata: { code, deletedBy: user.email },
    });

    return successResponse({ code, deleted: true }, `Coupon '${code}' removed successfully`);
  } catch (err: any) {
    console.error("[Coupons DELETE] Error:", err);
    return errorResponse("COUPON_DELETE_FAILED", err.message || "Failed to delete coupon", 500);
  }
}
