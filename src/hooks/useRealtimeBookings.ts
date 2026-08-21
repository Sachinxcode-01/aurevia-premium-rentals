"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { getClient } from "@/lib/supabase/client";
import type { RealtimeChannel } from "@supabase/supabase-js";
import type { BookingWithItems } from "@/lib/supabase/types";
import { getUserBookingsAction } from "@/lib/actions/bookings";
import { db } from "@/lib/db/store";

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
      const isSupabase = process.env.NEXT_PUBLIC_SUPABASE_URL && !process.env.NEXT_PUBLIC_SUPABASE_URL.includes("your-project-id");
      if (!isSupabase) {
        const local = await db.getBookings("usr-prem");
        setBookings(local as any);
        setError(null);
        return;
      }
      const data = await getUserBookingsAction();
      setBookings(data as BookingWithItems[]);
      setError(null);
    } catch {
      setError("Failed to load bookings.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const isSupabase = process.env.NEXT_PUBLIC_SUPABASE_URL && !process.env.NEXT_PUBLIC_SUPABASE_URL.includes("your-project-id");
    fetchBookings();
    if (!isSupabase) return;

    const supabase = getClient();
    let isCancelled = false;

    // Get current user for filtered subscription
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user || isCancelled) return;

      const channelName = `bookings:user:${user.id}`;
      const existingChannel = supabase.getChannels().find((ch) => ch.topic === `realtime:${channelName}` || ch.topic === channelName);
      if (existingChannel) {
        supabase.removeChannel(existingChannel);
      }

      // Subscribe to INSERT / UPDATE on bookings filtered by profile_id
      const channel: RealtimeChannel = supabase
        .channel(channelName)
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
      isCancelled = true;
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
      if (pollTimerRef.current) {
        clearInterval(pollTimerRef.current);
        pollTimerRef.current = null;
      }
    };
  }, [fetchBookings]);

  return { bookings, loading, error, refresh: fetchBookings };
}
