// ─────────────────────────────────────────────────────────────
// Supabase Database Type Definitions — AUREVIA
// Mirrors supabase/migrations/20260715000000_schema.sql
// ─────────────────────────────────────────────────────────────

export type BookingStatus =
  | "pending"
  | "confirmed"
  | "pending_payment"
  | "paid"
  | "approval_pending"
  | "approved"
  | "ready_for_pickup"
  | "picked_up"
  | "rented"
  | "returned"
  | "completed"
  | "rejected"
  | "cancelled"
  | "payment_failed"
  | "overdue"
  | "maintenance";

export type PaymentStatus = "unpaid" | "paid" | "refunded";
export type DeliveryMethod = "pickup" | "delivery";
export type InventoryStatus = "available" | "rented" | "maintenance" | "retired";
export type UserRole = "customer" | "staff" | "admin";

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string;
          email: string;
          phone: string | null;
          role: UserRole;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["profiles"]["Row"], "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]>;
      };
      products: {
        Row: {
          id: string;
          name: string;
          slug: string;
          brand_id: string;
          category_id: string;
          description: string;
          daily_rate: number;
          weekly_rate: number | null;
          is_featured: boolean;
          is_available: boolean;
          image_urls: string[];
          specs: Record<string, string>;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["products"]["Row"], "created_at">;
        Update: Partial<Database["public"]["Tables"]["products"]["Insert"]>;
      };
      inventory_units: {
        Row: {
          id: string;
          product_id: string;
          serial_number: string | null;
          status: InventoryStatus;
          condition_notes: string | null;
          last_inspected_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["inventory_units"]["Row"], "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["inventory_units"]["Insert"]>;
      };
      bookings: {
        Row: {
          id: string;
          profile_id: string;
          reference_code: string;
          start_date: string;
          end_date: string;
          total_rental_fee: number;
          tax_fee: number;
          delivery_fee: number;
          discount_amount: number;
          total_payable: number;
          status: BookingStatus;
          payment_status: PaymentStatus;
          delivery_method: DeliveryMethod;
          contact_name: string;
          contact_phone: string;
          contact_email: string | null;
          delivery_address: string | null;
          coupon_applied: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["bookings"]["Row"], "id" | "created_at" | "updated_at" | "reference_code">;
        Update: Partial<Pick<Database["public"]["Tables"]["bookings"]["Row"],
          "status" | "payment_status" | "notes" | "delivery_address">>;
      };
      booking_items: {
        Row: {
          id: string;
          booking_id: string;
          product_id: string;
          inventory_unit_id: string | null;
          quantity: number;
          unit_price: number;
        };
        Insert: Omit<Database["public"]["Tables"]["booking_items"]["Row"], "id">;
        Update: Partial<Database["public"]["Tables"]["booking_items"]["Insert"]>;
      };
      booking_addons: {
        Row: {
          id: string;
          booking_id: string;
          addon_id: string;
          price: number;
        };
        Insert: Omit<Database["public"]["Tables"]["booking_addons"]["Row"], "id">;
        Update: Partial<Database["public"]["Tables"]["booking_addons"]["Insert"]>;
      };
      audit_logs: {
        Row: {
          id: string;
          action: string;
          table_name: string;
          record_id: string;
          changed_by: string | null;
          old_data: Record<string, unknown> | null;
          new_data: Record<string, unknown> | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["audit_logs"]["Row"], "id" | "created_at">;
        Update: never;
      };
      processed_events: {
        Row: {
          event_key: string;
          provider_event_id: string | null;
          booking_id: string | null;
          notification_type: string | null;
          status: string;
          attempt_count: number;
          created_at: string;
          processed_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["processed_events"]["Row"], "created_at" | "processed_at">;
        Update: Partial<Database["public"]["Tables"]["processed_events"]["Insert"]>;
      };
    };
    Views: Record<string, never>;
    Functions: {
      reserve_inventory_for_booking: {
        Args: { p_booking_id: string };
        Returns: boolean;
      };
      release_inventory_for_booking: {
        Args: { p_booking_id: string };
        Returns: boolean;
      };
    };
    Enums: {
      booking_status: BookingStatus;
      payment_status: PaymentStatus;
      delivery_method: DeliveryMethod;
      inventory_status: InventoryStatus;
      user_role: UserRole;
    };
  };
}

// Convenience row types
export type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];
export type ProductRow = Database["public"]["Tables"]["products"]["Row"];
export type InventoryUnitRow = Database["public"]["Tables"]["inventory_units"]["Row"];
export type BookingRow = Database["public"]["Tables"]["bookings"]["Row"];
export type BookingItemRow = Database["public"]["Tables"]["booking_items"]["Row"];
export type BookingAddonRow = Database["public"]["Tables"]["booking_addons"]["Row"];
export type AuditLogRow = Database["public"]["Tables"]["audit_logs"]["Row"];

// Enriched booking with joined items (used in dashboard/admin)
export interface BookingWithItems extends BookingRow {
  booking_items: (BookingItemRow & { product?: ProductRow })[];
  booking_addons: BookingAddonRow[];
  profile?: ProfileRow;
}
