"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { getClient } from "@/lib/supabase/client";
import type { RealtimeChannel } from "@supabase/supabase-js";
import type { BookingWithItems } from "@/lib/supabase/types";
import { getAllBookingsAction } from "@/lib/actions/bookings";
import { db } from "@/lib/db/store";

export interface AdminRealtimeAlert {
  id: string;
  message: string;
  bookingRef?: string;
  type: "new_booking" | "status_change" | "overdue";
  timestamp: string;
  read: boolean;
}

interface UseAdminRealtimeReturn {
  bookings: BookingWithItems[];
  loading: boolean;
  alerts: AdminRealtimeAlert[];
  unreadCount: number;
  markAllRead: () => void;
  dismissAlert: (id: string) => void;
  refresh: () => void;
}

export function useAdminRealtime(): UseAdminRealtimeReturn {
  const [bookings, setBookings] = useState<BookingWithItems[]>([]);
  const [loading, setLoading] = useState(true);
  const [alerts, setAlerts] = useState<AdminRealtimeAlert[]>([]);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const pollTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isFirstLoad = useRef(true);

  const fetchBookings = useCallback(async () => {
    try {
      const isSupabase = process.env.NEXT_PUBLIC_SUPABASE_URL && !process.env.NEXT_PUBLIC_SUPABASE_URL.includes("your-project-id");
      if (!isSupabase) {
        const local = await db.getBookings();
        setBookings(local as any);
        setLoading(false);
        return;
      }
      const data = await getAllBookingsAction();
      setBookings(data as BookingWithItems[]);
    } catch {
      // Silent — error state handled by UI
    } finally {
      setLoading(false);
    }
  }, []);

  const addAlert = useCallback((alert: Omit<AdminRealtimeAlert, "id" | "timestamp" | "read">) => {
    const newAlert: AdminRealtimeAlert = {
      ...alert,
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      read: false,
    };
    setAlerts((prev) => [newAlert, ...prev].slice(0, 50)); // Max 50 alerts
  }, []);

  useEffect(() => {
    const isSupabase = process.env.NEXT_PUBLIC_SUPABASE_URL && !process.env.NEXT_PUBLIC_SUPABASE_URL.includes("your-project-id");
    fetchBookings();
    if (!isSupabase) {
      setLoading(false);
      return;
    }

    const supabase = getClient();
    const channel = supabase
      .channel("admin:bookings:all")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "bookings" },
        (payload) => {
          if (isFirstLoad.current) return; // Don't alert on initial data load
          const booking = payload.new as { reference_code: string; contact_name: string };
          addAlert({
            type: "new_booking",
            message: `New booking from ${booking.contact_name}`,
            bookingRef: booking.reference_code,
          });
          fetchBookings();
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "bookings" },
        (payload) => {
          const newBooking = payload.new as { status: string; reference_code: string };
          const oldBooking = payload.old as { status: string };
          if (newBooking.status !== oldBooking.status) {
            addAlert({
              type: "status_change",
              message: `Booking ${newBooking.reference_code} → ${newBooking.status}`,
              bookingRef: newBooking.reference_code,
            });
          }
          fetchBookings();
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "inventory_units" },
        () => {
          fetchBookings();
        }
      )
      .subscribe((status) => {
        if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
          if (!pollTimerRef.current) {
            pollTimerRef.current = setInterval(fetchBookings, 15_000);
          }
        } else if (status === "SUBSCRIBED") {
          isFirstLoad.current = false;
          if (pollTimerRef.current) {
            clearInterval(pollTimerRef.current);
            pollTimerRef.current = null;
          }
        }
      });

    channelRef.current = channel;

    return () => {
      if (channelRef.current) supabase.removeChannel(channelRef.current);
      if (pollTimerRef.current) clearInterval(pollTimerRef.current);
    };
  }, [fetchBookings, addAlert]);

  const unreadCount = alerts.filter((a) => !a.read).length;

  const markAllRead = useCallback(() => {
    setAlerts((prev) => prev.map((a) => ({ ...a, read: true })));
  }, []);

  const dismissAlert = useCallback((id: string) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  }, []);

  return { bookings, loading, alerts, unreadCount, markAllRead, dismissAlert, refresh: fetchBookings };
}
