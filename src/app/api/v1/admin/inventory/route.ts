import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/lib/api/response";
import { verifyApiAuth, recordAuditLog } from "@/lib/auth/rbac";
import { createServiceSupabaseClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  try {
    const { user, response } = await verifyApiAuth(req, ["admin", "staff", "super_admin"]);
    if (response || !user) return response!;

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search")?.toLowerCase();
    const status = searchParams.get("status");

    const supabase = await createServiceSupabaseClient();

    const { data: units, error } = await supabase
      .from("inventory_units")
      .select("*, product:products(name, slug, daily_price)")
      .order("created_at", { ascending: false });

    if (error) {
      return errorResponse("FETCH_INVENTORY_FAILED", error.message, 500);
    }

    let items = units || [];

    if (status && status !== "ALL") {
      items = items.filter((u: any) => u.status === status.toLowerCase());
    }

    if (search) {
      items = items.filter(
        (u: any) =>
          u.serial_number?.toLowerCase().includes(search) ||
          u.name?.toLowerCase().includes(search) ||
          u.product?.name?.toLowerCase().includes(search)
      );
    }

    return successResponse(items, "Inventory units fetched successfully");
  } catch (err: any) {
    return errorResponse("ADMIN_INVENTORY_ERROR", err.message || "Failed to load inventory", 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const { user, response } = await verifyApiAuth(req, ["admin", "staff", "super_admin"]);
    if (response || !user) return response!;

    const body = await req.json();
    const { productId, serialNumber, name, status, condition, notes } = body;

    if (!productId || !serialNumber || !name) {
      return errorResponse("INVALID_INVENTORY_DATA", "productId, serialNumber, and name are required", 400);
    }

    const supabase = await createServiceSupabaseClient();

    const { data: newUnit, error } = await supabase
      .from("inventory_units")
      .insert({
        product_id: productId,
        serial_number: serialNumber,
        name,
        status: status || "available",
        condition: condition || "excellent",
        notes: notes || null,
      })
      .select()
      .single();

    if (error || !newUnit) {
      return errorResponse("CREATE_UNIT_FAILED", error?.message || "Failed to create inventory unit", 500);
    }

    await recordAuditLog({
      actorId: user.id,
      actorEmail: user.email,
      action: "inventory.created",
      resource: "inventory_units",
      resourceId: newUnit.id,
      metadata: { serialNumber, name, status: newUnit.status },
    });

    return successResponse(newUnit, "Inventory unit added successfully", 201);
  } catch (err: any) {
    return errorResponse("ADMIN_INVENTORY_CREATE_FAILED", err.message || "Failed to add inventory unit", 500);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { user, response } = await verifyApiAuth(req, ["admin", "staff", "super_admin"]);
    if (response || !user) return response!;

    const body = await req.json();
    const { id, status, condition, notes } = body;

    if (!id) {
      return errorResponse("INVALID_UNIT_ID", "inventory unit id is required", 400);
    }

    const supabase = await createServiceSupabaseClient();

    const updatePayload: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };
    if (status) updatePayload.status = status;
    if (condition) updatePayload.condition = condition;
    if (notes !== undefined) updatePayload.notes = notes;

    const { data: updatedUnit, error } = await supabase
      .from("inventory_units")
      .update(updatePayload)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return errorResponse("UPDATE_UNIT_FAILED", error.message, 500);
    }

    await recordAuditLog({
      actorId: user.id,
      actorEmail: user.email,
      action: "inventory.updated",
      resource: "inventory_units",
      resourceId: id,
      metadata: { status, condition, notes },
    });

    return successResponse(updatedUnit, "Inventory unit status updated successfully");
  } catch (err: any) {
    return errorResponse("ADMIN_INVENTORY_UPDATE_FAILED", err.message || "Failed to update inventory unit", 500);
  }
}
