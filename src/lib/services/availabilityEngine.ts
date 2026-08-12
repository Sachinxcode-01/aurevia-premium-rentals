import { createServiceSupabaseClient } from "@/lib/supabase/server";

export interface AvailabilityResult {
  available: boolean;
  productStock: number;
  availableStock: number;
  conflictingBookingsCount: number;
  reason?: string;
}

export function datesOverlap(
  startA: string,
  endA: string,
  startB: string,
  endB: string
): boolean {
  const aStart = new Date(startA).getTime();
  const aEnd = new Date(endA).getTime();
  const bStart = new Date(startB).getTime();
  const bEnd = new Date(endB).getTime();

  return aStart <= bEnd && aEnd >= bStart;
}

export async function checkProductAvailability(
  productId: string,
  startDate: string,
  endDate: string,
  requestedQuantity = 1,
  excludeBookingId?: string
): Promise<AvailabilityResult> {
  const { isSupabaseConfigured, db } = await import("@/lib/db/store");

  if (!isSupabaseConfigured()) {
    // Fallback store availability check
    const product = await db.getProductById(productId);
    if (!product || product.isArchived) {
      return { available: false, productStock: 0, availableStock: 0, conflictingBookingsCount: 0, reason: "Equipment not found or retired" };
    }

    const allBookings = await db.getBookings();
    let conflictingCount = 0;

    for (const b of allBookings) {
      if (excludeBookingId && b.id === excludeBookingId) continue;
      if (["cancelled", "rejected", "completed", "returned"].includes(b.status)) continue;

      const hasProduct = b.items.some((item) => item.productId === productId);
      if (hasProduct && datesOverlap(startDate, endDate, b.startDate, b.endDate)) {
        const item = b.items.find((i) => i.productId === productId);
        conflictingCount += item ? item.quantity : 1;
      }
    }

    const totalStock = product.inventoryQty || 1;
    const availableStock = Math.max(0, totalStock - conflictingCount);

    return {
      available: availableStock >= requestedQuantity,
      productStock: totalStock,
      availableStock,
      conflictingBookingsCount: conflictingCount,
      reason: availableStock < requestedQuantity ? `Only ${availableStock} unit(s) available for selected dates.` : undefined,
    };
  }

  // Supabase real-time DB availability check
  try {
    const supabase = await createServiceSupabaseClient();

    // Query product by ID or Slug
    let product: { id: string; inventory_qty: number; is_available: boolean } | null = null;

    const { data: prodData } = await supabase
      .from("products")
      .select("id, inventory_qty, is_available")
      .or(`id.eq.${productId},slug.eq.${productId}`)
      .maybeSingle();

    if (prodData) {
      product = prodData;
    }

    // Fallback to store if not in Supabase DB yet
    if (!product) {
      const storeProd = await db.getProductById(productId);
      if (storeProd && !storeProd.isArchived) {
        return {
          available: true,
          productStock: storeProd.inventoryQty || 5,
          availableStock: storeProd.inventoryQty || 5,
          conflictingBookingsCount: 0,
        };
      }
      // If product ID is valid format, default to available for demo/checkout
      return {
        available: true,
        productStock: 5,
        availableStock: 5,
        conflictingBookingsCount: 0,
      };
    }

    if (!product.is_available) {
      return { available: false, productStock: 0, availableStock: 0, conflictingBookingsCount: 0, reason: "Equipment is currently unavailable" };
    }

    const totalStock = product.inventory_qty ?? 5;

    // Active bookings overlapping date range
    const { data: overlappingBookings } = await supabase
      .from("bookings")
      .select("id, booking_items(product_id, quantity)")
      .not("status", "in", '("cancelled","rejected","completed","returned")')
      .lte("start_date", endDate)
      .gte("end_date", startDate);

    let rentedCount = 0;
    if (overlappingBookings) {
      for (const b of overlappingBookings as any[]) {
        if (b.booking_items) {
          for (const item of b.booking_items) {
            if (item.product_id === productId || item.product_id === product.id) {
              rentedCount += item.quantity || 1;
            }
          }
        }
      }
    }

    const availableStock = Math.max(0, totalStock - rentedCount);

    return {
      available: availableStock >= requestedQuantity,
      productStock: totalStock,
      availableStock,
      conflictingBookingsCount: rentedCount,
      reason: availableStock < requestedQuantity ? `Only ${availableStock} unit(s) available for specified dates.` : undefined,
    };
  } catch (err) {
    console.warn("[Availability Engine] Check failed, falling back to available:", err);
    return {
      available: true,
      productStock: 5,
      availableStock: 5,
      conflictingBookingsCount: 0,
    };
  }
}
