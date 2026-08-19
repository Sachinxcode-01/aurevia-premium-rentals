import { useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { realtimeHub } from "@/lib/realtime/realtimeHub";

export function useAdminRealtime(onDatabaseChange: (payload: any) => void) {
  useEffect(() => {
    // 1. Setup Supabase Postgres Realtime Subscription
    let channel: any = null;
    try {
      const supabase = createClient();
      channel = supabase
        .channel("admin-realtime-hub")
        .on("postgres_changes", { event: "*", schema: "public", table: "bookings" }, (payload) => onDatabaseChange({ table: "bookings", payload }))
        .on("postgres_changes", { event: "*", schema: "public", table: "enquiries" }, (payload) => onDatabaseChange({ table: "enquiries", payload }))
        .on("postgres_changes", { event: "*", schema: "public", table: "reviews" }, (payload) => onDatabaseChange({ table: "reviews", payload }))
        .on("postgres_changes", { event: "*", schema: "public", table: "support_tickets" }, (payload) => onDatabaseChange({ table: "support_tickets", payload }))
        .on("postgres_changes", { event: "*", schema: "public", table: "kyc_verifications" }, (payload) => onDatabaseChange({ table: "kyc_verifications", payload }))
        .on("postgres_changes", { event: "*", schema: "public", table: "inventory_units" }, (payload) => onDatabaseChange({ table: "inventory_units", payload }))
        .on("postgres_changes", { event: "*", schema: "public", table: "payments" }, (payload) => onDatabaseChange({ table: "payments", payload }))
        .on("postgres_changes", { event: "*", schema: "public", table: "refunds" }, (payload) => onDatabaseChange({ table: "refunds", payload }))
        .subscribe();
    } catch {}

    // 2. Setup RealtimeHub (BroadcastChannel / LocalStorage Signal) subscriptions
    const unsubBooking = realtimeHub.subscribe("BOOKING_UPDATED", (payload) => onDatabaseChange({ type: "BOOKING_UPDATED", payload }));
    const unsubEnquiry = realtimeHub.subscribe("ENQUIRY_UPDATED", (payload) => onDatabaseChange({ type: "ENQUIRY_UPDATED", payload }));
    const unsubTicket = realtimeHub.subscribe("TICKET_UPDATED", (payload) => onDatabaseChange({ type: "TICKET_UPDATED", payload }));
    const unsubReview = realtimeHub.subscribe("REVIEW_MODERATED", (payload) => onDatabaseChange({ type: "REVIEW_MODERATED", payload }));
    const unsubKyc = realtimeHub.subscribe("KYC_STATUS_UPDATED", (payload) => onDatabaseChange({ type: "KYC_STATUS_UPDATED", payload }));
    const unsubInventory = realtimeHub.subscribe("INVENTORY_UPDATED", (payload) => onDatabaseChange({ type: "INVENTORY_UPDATED", payload }));

    // 3. Fallback Polling (Every 4 seconds for instant responsiveness)
    const interval = setInterval(() => {
      onDatabaseChange({ type: "POLL_TICK" });
    }, 4000);

    // 4. Instant Mobile Tab Focus & Online Reconnect Sync Trigger
    const handleVisibilityOrOnline = () => {
      if (document.visibilityState === "visible" && navigator.onLine) {
        onDatabaseChange({ type: "SYNC_REFRESH" });
      }
    };

    window.addEventListener("visibilitychange", handleVisibilityOrOnline);
    window.addEventListener("online", handleVisibilityOrOnline);
    window.addEventListener("focus", handleVisibilityOrOnline);

    return () => {
      if (channel) {
        try {
          const supabase = createClient();
          supabase.removeChannel(channel);
        } catch {}
      }
      unsubBooking();
      unsubEnquiry();
      unsubTicket();
      unsubReview();
      unsubKyc();
      unsubInventory();
      clearInterval(interval);
      window.removeEventListener("visibilitychange", handleVisibilityOrOnline);
      window.removeEventListener("online", handleVisibilityOrOnline);
      window.removeEventListener("focus", handleVisibilityOrOnline);
    };
  }, [onDatabaseChange]);
}
