"use client";

import { useEffect, useState, useRef } from "react";
import { getClient } from "@/lib/supabase/client";
import type { RealtimeChannel } from "@supabase/supabase-js";

/**
 * Returns the real-time count of available inventory units for a product.
 * Updates automatically when any unit for that product changes status.
 */
export function useInventoryAvailability(productId: string | null) {
  const [availableCount, setAvailableCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const channelRef = useRef<RealtimeChannel | null>(null);

  useEffect(() => {
    if (!productId) {
      setLoading(false);
      return;
    }

    const supabase = getClient();

    // Initial fetch
    supabase
      .from("inventory_units")
      .select("id", { count: "exact" })
      .eq("product_id", productId)
      .eq("status", "available")
      .then(({ count }) => {
        setAvailableCount(count ?? 0);
        setLoading(false);
      });

    // Subscribe to changes
    const channel = supabase
      .channel(`inventory:product:${productId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "inventory_units",
          filter: `product_id=eq.${productId}`,
        },
        async () => {
          // Re-count on any unit status change
          const { count } = await supabase
            .from("inventory_units")
            .select("id", { count: "exact" })
            .eq("product_id", productId)
            .eq("status", "available");
          setAvailableCount(count ?? 0);
        }
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      if (channelRef.current) supabase.removeChannel(channelRef.current);
    };
  }, [productId]);

  return { availableCount, loading };
}
