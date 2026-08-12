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
  const supabase = await createServiceSupabaseClient();

  const { data: product, error: prodErr } = await (supabase as unknown as {
    from: (table: string) => {
      select: (cols: string) => {
        eq: (col: string, val: string) => {
          single: () => Promise<{ data: { id: string; inventory_qty: number; is_available: boolean } | null; error: Error | null }>;
        };
      };
    };
  })
    .from("products")
    .select("id, inventory_qty, is_available")
    .eq("id", productId)
    .single();

  if (prodErr || !product || !product.is_available) {
    return { available: false, productStock: 0, availableStock: 0, conflictingBookingsCount: 0, reason: "Equipment unavailable" };
  }

  const totalStock = product.inventory_qty ?? 1;

  // Active bookings overlapping date range
  const { data: overlappingBookings, error: bookErr } = await (supabase as unknown as {
    from: (table: string) => {
      select: (cols: string) => {
        not: (col: string, op: string, vals: string) => {
          lte: (col: string, val: string) => {
            gte: (col: string, val: string) => Promise<{
              data: Array<{ id: string; booking_items: Array<{ product_id: string; quantity: number }> }> | null;
              error: Error | null;
            }>;
          };
        };
      };
    };
  })
    .from("bookings")
    .select("id, booking_items(product_id, quantity)")
    .not("status", "in", '("cancelled","rejected","completed","returned")')
    .lte("start_date", endDate)
    .gte("end_date", startDate);

  if (bookErr) {
    return { available: false, productStock: totalStock, availableStock: 0, conflictingBookingsCount: 0, reason: "Database availability check error" };
  }

  let rentedCount = 0;
  if (overlappingBookings) {
    for (const b of overlappingBookings) {
      if (b.booking_items) {
        for (const item of b.booking_items) {
          if (item.product_id === productId) {
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
}
