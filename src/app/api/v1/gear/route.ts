import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/lib/api/response";
import { createServiceSupabaseClient } from "@/lib/supabase/server";
import { MOCK_PRODUCTS } from "@/lib/db/mockData";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search")?.toLowerCase();
    const category = searchParams.get("category");
    const brand = searchParams.get("brand");
    const featured = searchParams.get("featured") === "true";
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "24", 10);

    const supabase = await createServiceSupabaseClient();

    let query = supabase.from("products").select("*, brand:brands(name, slug), category:categories(name, slug), product_images(image_url, is_primary)", { count: "exact" });

    if (featured) query = query.eq("is_featured", true);
    query = query.eq("is_archived", false);

    const { data: dbProducts, count } = await query;

    let items: any[] = dbProducts || [];

    // Fallback to MOCK_PRODUCTS if database table is empty/unseeded
    if (items.length === 0) {
      let fallback = [...MOCK_PRODUCTS];
      if (featured) fallback = fallback.filter((p) => p.isFeatured);
      if (category && category !== "all") fallback = fallback.filter((p) => (p as any).category === category || (p as any).categoryId === category);
      if (brand && brand !== "all") fallback = fallback.filter((p) => (p as any).brand === brand || (p as any).brandId === brand);
      if (search) fallback = fallback.filter((p) => p.name.toLowerCase().includes(search) || p.description.toLowerCase().includes(search));

      const total = fallback.length;
      const pages = Math.ceil(total / limit) || 1;
      const start = (page - 1) * limit;
      const paginatedItems = fallback.slice(start, start + limit);

      return successResponse(paginatedItems, "Gear items retrieved successfully", 200, {
        page,
        limit,
        total,
        pages,
      });
    }

    // Apply filter in JS if needed
    if (search) items = items.filter((i: any) => i.name?.toLowerCase().includes(search) || i.description?.toLowerCase().includes(search));

    const total = count || items.length;
    const pages = Math.ceil(total / limit) || 1;
    const start = (page - 1) * limit;
    const paginatedItems = items.slice(start, start + limit);

    return successResponse(paginatedItems, "Gear items retrieved successfully", 200, {
      page,
      limit,
      total,
      pages,
    });
  } catch (err: any) {
    return errorResponse("FETCH_GEAR_FAILED", err.message || "Failed to fetch gear", 500);
  }
}
