-- AUREVIA Production Performance Indexes & Idempotency Safety
-- Apply AFTER all previous migrations (20260716130000_ops_upgrade.sql)
-- Safe to run multiple times (all use IF NOT EXISTS or ON CONFLICT DO NOTHING)

-- ─── 1. BOOKINGS TABLE INDEXES ────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_bookings_profile_id       ON bookings(profile_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status           ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_payment_status   ON bookings(payment_status);
CREATE INDEX IF NOT EXISTS idx_bookings_reference_code   ON bookings(reference_code);
CREATE INDEX IF NOT EXISTS idx_bookings_start_date       ON bookings(start_date);
CREATE INDEX IF NOT EXISTS idx_bookings_end_date         ON bookings(end_date);
CREATE INDEX IF NOT EXISTS idx_bookings_created_at       ON bookings(created_at DESC);
-- Composite for availability check queries
CREATE INDEX IF NOT EXISTS idx_bookings_dates_status     ON bookings(start_date, end_date, status);

-- ─── 2. BOOKING ITEMS TABLE INDEXES ──────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_booking_items_booking_id  ON booking_items(booking_id);
CREATE INDEX IF NOT EXISTS idx_booking_items_product_id  ON booking_items(product_id);

-- ─── 3. INVENTORY UNITS INDEXES ──────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_inventory_units_product_id ON inventory_units(product_id);
CREATE INDEX IF NOT EXISTS idx_inventory_units_status     ON inventory_units(status);
-- Composite for atomic unit assignment queries
CREATE INDEX IF NOT EXISTS idx_inventory_available        ON inventory_units(product_id, status) WHERE status = 'available';

-- ─── 4. PAYMENTS TABLE INDEXES ───────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_payments_booking_id       ON payments(booking_id);
CREATE INDEX IF NOT EXISTS idx_payments_status           ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_transaction_id   ON payments(transaction_id);

-- ─── 5. PROFILES TABLE INDEXES ───────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_profiles_email            ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_role             ON profiles(role);

-- ─── 6. COUPONS TABLE INDEXES ────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_coupons_code              ON coupons(code);
CREATE INDEX IF NOT EXISTS idx_coupons_is_active         ON coupons(is_active);

-- ─── 7. IDEMPOTENCY / PROCESSED EVENTS TABLE ─────────────────────────────
-- Ensures webhook + email events are never processed twice
CREATE TABLE IF NOT EXISTS processed_events (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_key     TEXT UNIQUE NOT NULL,            -- e.g. "webhook:razorpay:pay_xxx"
  status        VARCHAR(50) DEFAULT 'processed', -- processed | failed
  attempt_count INTEGER DEFAULT 1,
  external_id   TEXT,                            -- Razorpay payment/order ID
  booking_id    UUID REFERENCES bookings(id) ON DELETE SET NULL,
  event_type    TEXT,                            -- razorpay_webhook | email_booking_confirmed | etc.
  created_at    TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Fast lookup by event key (primary idempotency check)
CREATE INDEX IF NOT EXISTS idx_processed_events_event_key  ON processed_events(event_key);
CREATE INDEX IF NOT EXISTS idx_processed_events_booking_id ON processed_events(booking_id);

-- ─── 8. AUDIT LOGS TABLE INDEXES ─────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_audit_logs_booking_id     ON audit_logs(record_id) WHERE table_name = 'bookings';
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at     ON audit_logs(created_at DESC);

-- ─── 9. INSERT PRODUCTION COUPON DATA ────────────────────────────────────
-- Ensure AUREVIA199 flat ₹199 coupon is present and active
INSERT INTO coupons (
  code, discount_percent, discount_flat, is_active,
  valid_from, valid_until, max_uses, per_user_limit
) VALUES (
  'AUREVIA199', 0, 199.00, true,
  '2026-07-01 00:00:00+05:30',
  '2026-12-31 23:59:59+05:30',
  100, 1
) ON CONFLICT (code) DO UPDATE SET
  is_active       = true,
  discount_flat   = 199.00,
  valid_until     = '2026-12-31 23:59:59+05:30';

INSERT INTO coupons (code, discount_percent, is_active, valid_until) VALUES
  ('AUREVIA10',  10, true, '2026-12-31 23:59:59+05:30'),
  ('WELCOMEPREM', 15, true, '2026-12-31 23:59:59+05:30')
ON CONFLICT (code) DO NOTHING;
