import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/lib/api/response";
import { verifyApiAuth, recordAuditLog } from "@/lib/auth/rbac";
import { createServiceSupabaseClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function GET(req: NextRequest) {
  try {
    const { user, response } = await verifyApiAuth(req, ["admin", "staff", "super_admin"]);
    if (response || !user) return response!;

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search")?.toLowerCase();

    const supabase = await createServiceSupabaseClient();

    const query = supabase
      .from("products")
      .select("*, brand:brands(name, slug), category:categories(name, slug)")
      .order("created_at", { ascending: false });

    const { data: dbProducts, error } = await query;

    if (error) {
      return errorResponse("FETCH_ADMIN_PRODUCTS_FAILED", error.message, 500);
    }

    let items = dbProducts || [];

    if (search) {
      items = items.filter(
        (p: any) =>
          p.name?.toLowerCase().includes(search) ||
          p.slug?.toLowerCase().includes(search) ||
          p.description?.toLowerCase().includes(search)
      );
    }

    return successResponse(items, "Admin products fetched successfully");
  } catch (err: any) {
    return errorResponse("ADMIN_PRODUCTS_ERROR", err.message || "Failed to fetch products", 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const { user, response } = await verifyApiAuth(req, ["admin", "staff", "super_admin"]);
    if (response || !user) return response!;

    const body = await req.json();
    const {
      name,
      slug,
      brandId,
      categoryId,
      description,
      dailyPrice,
      weeklyPrice,
      monthlyPrice,
      securityDeposit,
      inventoryQty,
      imageUrl,
      specifications,
      isFeatured,
    } = body;

    if (!name || !dailyPrice) {
      return errorResponse("INVALID_PRODUCT_DATA", "Name and dailyPrice are required", 400);
    }

    const generatedSlug =
      slug ||
      name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

    const supabase = await createServiceSupabaseClient();

    const { data: newProduct, error } = await supabase
      .from("products")
      .insert({
        name,
        slug: generatedSlug,
        brand_id: brandId || null,
        category_id: categoryId || null,
        description: description || "",
        daily_price: dailyPrice,
        weekly_price: weeklyPrice || Math.round(dailyPrice * 5),
        monthly_price: monthlyPrice || Math.round(dailyPrice * 18),
        security_deposit: securityDeposit || 5000,
        inventory_qty: inventoryQty || 1,
        image_url: imageUrl || "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=400",
        specifications: specifications || {},
        is_featured: isFeatured ?? false,
        is_archived: false,
      })
      .select()
      .single();

    if (error || !newProduct) {
      return errorResponse("CREATE_PRODUCT_FAILED", error?.message || "Failed to create camera product", 500);
    }

    // Auto-create initial inventory unit for physical tracking
    for (let i = 1; i <= (inventoryQty || 1); i++) {
      await supabase.from("inventory_units").insert({
        product_id: newProduct.id,
        serial_number: `${newProduct.slug.toUpperCase()}-00${i}`,
        name: `${newProduct.name} - Unit ${i}`,
        status: "available",
        condition: "excellent",
      });
    }

    await recordAuditLog({
      actorId: user.id,
      actorEmail: user.email,
      action: "product.created",
      resource: "products",
      resourceId: newProduct.id,
      metadata: { name: newProduct.name, dailyPrice },
    });

    revalidatePath("/explore");
    revalidatePath("/gear");
    revalidatePath("/");

    return successResponse(newProduct, "Camera product created successfully", 201);
  } catch (err: any) {
    return errorResponse("ADMIN_PRODUCT_CREATE_FAILED", err.message || "Failed to create camera product", 500);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { user, response } = await verifyApiAuth(req, ["admin", "staff", "super_admin"]);
    if (response || !user) return response!;

    const body = await req.json();
    const {
      id,
      name,
      description,
      dailyPrice,
      weeklyPrice,
      monthlyPrice,
      securityDeposit,
      inventoryQty,
      imageUrl,
      specifications,
      isFeatured,
      isArchived,
    } = body;

    if (!id) {
      return errorResponse("INVALID_PRODUCT_ID", "Product ID is required for update", 400);
    }

    const supabase = await createServiceSupabaseClient();

    const updatePayload: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };

    if (name) updatePayload.name = name;
    if (description !== undefined) updatePayload.description = description;
    if (dailyPrice !== undefined) updatePayload.daily_price = dailyPrice;
    if (weeklyPrice !== undefined) updatePayload.weekly_price = weeklyPrice;
    if (monthlyPrice !== undefined) updatePayload.monthly_price = monthlyPrice;
    if (securityDeposit !== undefined) updatePayload.security_deposit = securityDeposit;
    if (inventoryQty !== undefined) updatePayload.inventory_qty = inventoryQty;
    if (imageUrl) updatePayload.image_url = imageUrl;
    if (specifications) updatePayload.specifications = specifications;
    if (isFeatured !== undefined) updatePayload.is_featured = isFeatured;
    if (isArchived !== undefined) updatePayload.is_archived = isArchived;

    const { data: updatedProduct, error } = await supabase
      .from("products")
      .update(updatePayload)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return errorResponse("UPDATE_PRODUCT_FAILED", error.message, 500);
    }

    await recordAuditLog({
      actorId: user.id,
      actorEmail: user.email,
      action: "product.updated",
      resource: "products",
      resourceId: id,
      metadata: updatePayload,
    });

    revalidatePath("/explore");
    revalidatePath("/gear");
    revalidatePath("/");

    return successResponse(updatedProduct, "Camera product updated successfully");
  } catch (err: any) {
    return errorResponse("ADMIN_PRODUCT_UPDATE_FAILED", err.message || "Failed to update camera product", 500);
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { user, response } = await verifyApiAuth(req, ["admin", "staff", "super_admin"]);
    if (response || !user) return response!;

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return errorResponse("INVALID_DELETE_REQUEST", "Product ID is required", 400);
    }

    const supabase = await createServiceSupabaseClient();

    // Soft delete / archive product
    const { data: archivedProduct, error } = await supabase
      .from("products")
      .update({ is_archived: true, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return errorResponse("DELETE_PRODUCT_FAILED", error.message, 500);
    }

    await recordAuditLog({
      actorId: user.id,
      actorEmail: user.email,
      action: "product.deactivated",
      resource: "products",
      resourceId: id,
    });

    revalidatePath("/explore");
    revalidatePath("/gear");
    revalidatePath("/");

    return successResponse(archivedProduct, "Product successfully deactivated and archived");
  } catch (err: any) {
    return errorResponse("ADMIN_PRODUCT_DELETE_FAILED", err.message || "Failed to deactivate product", 500);
  }
}
