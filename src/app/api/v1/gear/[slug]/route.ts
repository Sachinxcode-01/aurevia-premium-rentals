import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/lib/api/response";
import { createServiceSupabaseClient } from "@/lib/supabase/server";
import { MOCK_PRODUCTS } from "@/lib/db/mockData";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const supabase = await createServiceSupabaseClient();

    const { data: product, error } = await supabase
      .from("products")
      .select("*, brand:brands(name, slug), category:categories(name, slug), product_images(image_url, is_primary)")
      .eq("slug", slug)
      .single();

    if (product) {
      return successResponse(product, "Product details retrieved");
    }

    // Fallback to mock product if DB unseeded
    const mockItem = MOCK_PRODUCTS.find((p) => p.slug === slug || p.id === slug);
    if (mockItem) {
      return successResponse(mockItem, "Product details retrieved");
    }

    return errorResponse("PRODUCT_NOT_FOUND", `No equipment found matching slug '${slug}'`, 404);
  } catch (err: any) {
    return errorResponse("FETCH_PRODUCT_FAILED", err.message || "Failed to fetch product details", 500);
  }
}
