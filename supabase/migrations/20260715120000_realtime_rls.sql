-- AUREVIA Real-Time Additive Migration
-- Adds: audit_logs, inventory functions, RLS policies, Realtime publications
-- Apply AFTER 20260715000000_schema.sql

-- ─── 1. AUDIT LOGS TABLE ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  action VARCHAR(100) NOT NULL,
  table_name VARCHAR(100) NOT NULL,
  record_id UUID NOT NULL,
  changed_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  old_data JSONB,
  new_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index for fast lookups by record
CREATE INDEX IF NOT EXISTS idx_audit_logs_record ON audit_logs(record_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_changed_by ON audit_logs(changed_by);

-- ─── 2. COUPONS TABLE (if not already exists) ─────────────────
CREATE TABLE IF NOT EXISTS coupons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code VARCHAR(50) UNIQUE NOT NULL,
  discount_percent NUMERIC(5,2) NOT NULL DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  valid_from TIMESTAMP WITH TIME ZONE,
  valid_until TIMESTAMP WITH TIME ZONE,
  max_uses INTEGER,
  used_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO coupons (code, discount_percent, is_active) VALUES
  ('AUREVIA10', 10, true),
  ('PREM15', 15, true),
  ('WELCOME20', 20, true)
ON CONFLICT (code) DO NOTHING;

-- ─── 3. DELIVERY_METHOD ENUM (if not already present) ─────────
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'delivery_method') THEN
    CREATE TYPE delivery_method AS ENUM ('pickup', 'delivery');
  END IF;
END $$;

-- ─── 4. ADD MISSING COLUMNS TO BOOKINGS ───────────────────────
ALTER TABLE bookings
  ADD COLUMN IF NOT EXISTS contact_email VARCHAR(255),
  ADD COLUMN IF NOT EXISTS delivery_address TEXT,
  ADD COLUMN IF NOT EXISTS notes TEXT,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;

-- ─── 5. INVENTORY RESERVATION FUNCTION ───────────────────────
-- Atomically assigns available inventory_units to a booking
-- Prevents double-booking via transaction locking
CREATE OR REPLACE FUNCTION reserve_inventory_for_booking(p_booking_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_item RECORD;
  v_unit_id UUID;
BEGIN
  -- For each booking item, assign a free unit (with row-level lock)
  FOR v_item IN
    SELECT bi.id AS item_id, bi.product_id, bi.quantity
    FROM booking_items bi
    WHERE bi.booking_id = p_booking_id
      AND bi.inventory_unit_id IS NULL
  LOOP
    -- Find and lock a free unit for this product
    SELECT iu.id INTO v_unit_id
    FROM inventory_units iu
    WHERE iu.product_id = v_item.product_id
      AND iu.status = 'available'
    LIMIT 1
    FOR UPDATE SKIP LOCKED;

    IF v_unit_id IS NULL THEN
      RAISE EXCEPTION 'No available inventory unit for product %', v_item.product_id;
    END IF;

    -- Mark unit as rented
    UPDATE inventory_units
    SET status = 'rented', updated_at = NOW()
    WHERE id = v_unit_id;

    -- Link unit to booking item
    UPDATE booking_items
    SET inventory_unit_id = v_unit_id
    WHERE id = v_item.item_id;
  END LOOP;

  RETURN TRUE;
EXCEPTION
  WHEN OTHERS THEN
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ─── 6. INVENTORY RELEASE FUNCTION ───────────────────────────
-- Releases inventory_units back to 'available' when booking ends
CREATE OR REPLACE FUNCTION release_inventory_for_booking(p_booking_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  -- Reset all units linked to this booking back to 'available'
  UPDATE inventory_units
  SET status = 'available', updated_at = NOW()
  WHERE id IN (
    SELECT bi.inventory_unit_id
    FROM booking_items bi
    WHERE bi.booking_id = p_booking_id
      AND bi.inventory_unit_id IS NOT NULL
  );

  -- Clear inventory_unit_id links
  UPDATE booking_items
  SET inventory_unit_id = NULL
  WHERE booking_id = p_booking_id;

  RETURN TRUE;
EXCEPTION
  WHEN OTHERS THEN
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ─── 7. UPDATED_AT TRIGGER ────────────────────────────────────
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_bookings_updated_at') THEN
    CREATE TRIGGER set_bookings_updated_at
      BEFORE UPDATE ON bookings
      FOR EACH ROW EXECUTE FUNCTION set_updated_at();
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_inventory_updated_at') THEN
    CREATE TRIGGER set_inventory_updated_at
      BEFORE UPDATE ON inventory_units
      FOR EACH ROW EXECUTE FUNCTION set_updated_at();
  END IF;
END $$;

-- ─── 8. ROW LEVEL SECURITY ───────────────────────────────────
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_addons ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_units ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Profiles: users see only their own
DROP POLICY IF EXISTS "profiles_select_own" ON profiles;
CREATE POLICY "profiles_select_own" ON profiles
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
CREATE POLICY "profiles_update_own" ON profiles
  FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_insert_self" ON profiles;
CREATE POLICY "profiles_insert_self" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Admin can read all profiles
DROP POLICY IF EXISTS "profiles_admin_all" ON profiles;
CREATE POLICY "profiles_admin_all" ON profiles
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'staff'))
  );

-- Bookings: customers see only their own
DROP POLICY IF EXISTS "bookings_customer_select" ON bookings;
CREATE POLICY "bookings_customer_select" ON bookings
  FOR SELECT USING (profile_id = auth.uid());

DROP POLICY IF EXISTS "bookings_customer_insert" ON bookings;
CREATE POLICY "bookings_customer_insert" ON bookings
  FOR INSERT WITH CHECK (profile_id = auth.uid());

-- Admin sees all bookings
DROP POLICY IF EXISTS "bookings_admin_all" ON bookings;
CREATE POLICY "bookings_admin_all" ON bookings
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'staff'))
  );

-- Inventory: all authenticated users can read (for availability display)
DROP POLICY IF EXISTS "inventory_read_all" ON inventory_units;
CREATE POLICY "inventory_read_all" ON inventory_units
  FOR SELECT USING (auth.role() = 'authenticated');

-- Only admins can modify inventory
DROP POLICY IF EXISTS "inventory_admin_write" ON inventory_units;
CREATE POLICY "inventory_admin_write" ON inventory_units
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'staff'))
  );

-- Audit logs: admin read-only
DROP POLICY IF EXISTS "audit_logs_admin_select" ON audit_logs;
CREATE POLICY "audit_logs_admin_select" ON audit_logs
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Booking Items RLS Policies
DROP POLICY IF EXISTS "booking_items_customer_select" ON booking_items;
CREATE POLICY "booking_items_customer_select" ON booking_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM bookings
      WHERE bookings.id = booking_items.booking_id AND bookings.profile_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "booking_items_admin_all" ON booking_items;
CREATE POLICY "booking_items_admin_all" ON booking_items
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'staff'))
  );

-- Payments RLS Policies
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "payments_customer_select" ON payments;
CREATE POLICY "payments_customer_select" ON payments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM bookings
      WHERE bookings.id = payments.booking_id AND bookings.profile_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "payments_admin_all" ON payments;
CREATE POLICY "payments_admin_all" ON payments
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'staff'))
  );

-- Processed Events RLS Policies
ALTER TABLE processed_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "processed_events_admin_all" ON processed_events;
CREATE POLICY "processed_events_admin_all" ON processed_events
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'staff'))
  );

-- Coupons RLS Policies
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "coupons_read_active" ON coupons;
CREATE POLICY "coupons_read_active" ON coupons
  FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "coupons_admin_all" ON coupons;
CREATE POLICY "coupons_admin_all" ON coupons
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'staff'))
  );

-- ─── 9. ENABLE SUPABASE REALTIME ─────────────────────────────
-- Grant Realtime access to required tables
-- (You must also enable these in Dashboard → Database → Replication)
DO $$
BEGIN
  -- Add tables to publication if they exist and aren't already included
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'bookings'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE bookings;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'inventory_units'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE inventory_units;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'profiles'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE profiles;
  END IF;
END $$;

-- ─── 10. SEED ADMIN USER ROLE ────────────────────────────────
-- After running this migration, manually set your admin user's role:
-- UPDATE profiles SET role = 'admin' WHERE email = 'premmundargi135@gmail.com';
