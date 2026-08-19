-- ============================================================================
-- AUREVIA Supabase Realtime & Database Production Hardening
-- Migration ID: 20260819120000_realtime_hardening.sql
-- ============================================================================

-- ─── 1. REALTIME PUBLICATIONS HARDENING ──────────────────────────────────
-- Enable Realtime on operational tables that require live synchronization
DO $$
BEGIN
  -- bookings
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'bookings'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE bookings;
  END IF;

  -- inventory_units
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'inventory_units'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE inventory_units;
  END IF;

  -- profiles
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'profiles'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE profiles;
  END IF;

  -- support_tickets
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'support_tickets'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE support_tickets;
  END IF;

  -- ticket_replies
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'ticket_replies'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE ticket_replies;
  END IF;

  -- notifications
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'notifications'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
  END IF;

  -- payments
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'payments'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE payments;
  END IF;
END $$;

-- ─── 2. PRODUCTION QUERY INDEXES ──────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_bookings_profile_status ON public.bookings(profile_id, status);
CREATE INDEX IF NOT EXISTS idx_bookings_created_at ON public.bookings(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_inventory_units_status ON public.inventory_units(status);
CREATE INDEX IF NOT EXISTS idx_payments_booking_status ON public.payments(booking_id, status);
CREATE INDEX IF NOT EXISTS idx_support_tickets_profile_status ON public.support_tickets(profile_id, status);
CREATE INDEX IF NOT EXISTS idx_ticket_replies_ticket_created ON public.ticket_replies(ticket_id, created_at ASC);

-- ─── 3. RLS SECURITY HARDENING ────────────────────────────────────────────
-- Ensure strict customer isolation & server-side admin privileges
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_units ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Helper function to check if current user is admin/staff
CREATE OR REPLACE FUNCTION public.is_admin_or_staff()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role IN ('admin', 'staff')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
