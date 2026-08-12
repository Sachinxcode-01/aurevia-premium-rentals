import { useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://mock.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "mock-anon-key";

const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);

export interface RealtimeChangeEvent {
  table: string;
  payload: Record<string, unknown>;
}

export function useAdminRealtime(onDatabaseChange: (change: RealtimeChangeEvent) => void) {
  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
      return;
    }

    const channel = supabaseClient
      .channel("admin-realtime-sync")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "bookings" },
        (payload) => onDatabaseChange({ table: "bookings", payload })
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "inventory_units" },
        (payload) => onDatabaseChange({ table: "inventory_units", payload })
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "kyc_documents" },
        (payload) => onDatabaseChange({ table: "kyc_documents", payload })
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "payments" },
        (payload) => onDatabaseChange({ table: "payments", payload })
      )
      .subscribe();

    return () => {
      supabaseClient.removeChannel(channel);
    };
  }, [onDatabaseChange]);
}
