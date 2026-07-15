"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { getClient } from "@/lib/supabase/client";
import type { RealtimeChannel } from "@supabase/supabase-js";
import type { BookingWithItems } from "@/lib/supabase/types";
import { getUserBookingsAction } from "@/lib/actions/bookings";

interface UseRealtimeBookingsReturn {
  bookings: BookingWithItems[];
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

/**
 * Subscribes to the current user's bookings in real time.
 * Falls back to polling every 30s if WebSocket connection drops.
 */
export function useRealtimeBookings(): UseRealtimeBookingsReturn {
  const [bookings, setBookings] = useState<BookingWithItems[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const pollTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchBookings = useCallback(async () => {
    try {
      const data = await getUserBookingsAction();
      setBookings(data as BookingWithItems[]);
      setError(null);
    } catch (e) {
      setError("Failed to load bookings.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const supabase = getClient();
    fetchBookings();

    // Get current user for filtered subscription
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;

      // Subscribe to INSERT / UPDATE on bookings filtered by profile_id
      const channel: RealtimeChannel = supabase
        .channel(`bookings:user:${user.id}`)
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "bookings",
            filter: `profile_id=eq.${user.id}`,
          },
          () => {
            fetchBookings();
          }
        )
        .subscribe((status) => {
          if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
            if (!pollTimerRef.current) {
              pollTimerRef.current = setInterval(fetchBookings, 30_000);
            }
          } else if (status === "SUBSCRIBED") {
            if (pollTimerRef.current) {
              clearInterval(pollTimerRef.current);
              pollTimerRef.current = null;
            }
          }
        });

      channelRef.current = channel;
    });

    return () => {
      if (channelRef.current) supabase.removeChannel(channelRef.current);
      if (pollTimerRef.current) clearInterval(pollTimerRef.current);
    };
  }, [fetchBookings]);

  return { bookings, loading, error, refresh: fetchBookings };
}
