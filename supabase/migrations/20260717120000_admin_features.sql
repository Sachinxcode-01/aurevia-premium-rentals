-- AUREVIA Premium Rentals Database Upgrade Migration
-- Version: 20260717120000
-- Description: Adds CMS settings drafts, refunds tracking, maintenance, digital checklists, and support ticket system with RLS.

-- 1. Alter website_settings with RLS policies if not already present
ALTER TABLE IF EXISTS website_settings ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'website_settings' AND policyname = 'Allow public read website_settings'
  ) THEN
    CREATE POLICY "Allow public read website_settings" ON website_settings FOR SELECT USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'website_settings' AND policyname = 'Allow admin/staff full access website_settings'
  ) THEN
    CREATE POLICY "Allow admin/staff full access website_settings" ON website_settings FOR ALL USING (
      EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()::text AND (profiles.role = 'admin' OR profiles.role = 'staff')
      )
    );
  END IF;
END $$;

-- 2. CMS Drafts & History Tables
CREATE TABLE IF NOT EXISTS content_drafts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    item_type VARCHAR(100) NOT NULL, -- 'product', 'coupon', 'faq', 'testimonial', 'settings'
    item_id VARCHAR(100) NOT NULL, -- ID of record or setting key
    draft_data JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(item_type, item_id)
);

CREATE TABLE IF NOT EXISTS content_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    item_type VARCHAR(100) NOT NULL,
    item_id VARCHAR(100) NOT NULL,
    published_data JSONB NOT NULL,
    published_by VARCHAR(255) NOT NULL,
    published_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE content_drafts ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_history ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'content_drafts' AND policyname = 'Allow public read content_drafts') THEN
    CREATE POLICY "Allow public read content_drafts" ON content_drafts FOR SELECT USING (true);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'content_drafts' AND policyname = 'Allow admin/staff full access content_drafts') THEN
    CREATE POLICY "Allow admin/staff full access content_drafts" ON content_drafts FOR ALL USING (
      EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()::text AND (profiles.role = 'admin' OR profiles.role = 'staff')
      )
    );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'content_history' AND policyname = 'Allow public read content_history') THEN
    CREATE POLICY "Allow public read content_history" ON content_history FOR SELECT USING (true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'content_history' AND policyname = 'Allow admin/staff full access content_history') THEN
    CREATE POLICY "Allow admin/staff full access content_history" ON content_history FOR ALL USING (
      EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()::text AND (profiles.role = 'admin' OR profiles.role = 'staff')
      )
    );
  END IF;
END $$;

-- 3. Refunds Table
CREATE TABLE IF NOT EXISTS refunds (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id VARCHAR(255) REFERENCES bookings(id) ON DELETE CASCADE,
    razorpay_refund_id VARCHAR(255),
    amount NUMERIC(10, 2) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'requested', -- 'requested', 'processing', 'completed', 'failed'
    reason TEXT,
    admin_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE refunds ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'refunds' AND policyname = 'Allow users to view own refunds') THEN
    CREATE POLICY "Allow users to view own refunds" ON refunds FOR SELECT USING (
      EXISTS (
        SELECT 1 FROM bookings
        WHERE bookings.id = refunds.booking_id AND bookings.profile_id::text = auth.uid()::text
      )
    );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'refunds' AND policyname = 'Allow admin/staff full access to refunds') THEN
    CREATE POLICY "Allow admin/staff full access to refunds" ON refunds FOR ALL USING (
      EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()::text AND (profiles.role = 'admin' OR profiles.role = 'staff')
      )
    );
  END IF;
END $$;

-- 4. Maintenance Records Table
CREATE TABLE IF NOT EXISTS maintenance_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    inventory_unit_id VARCHAR(255) REFERENCES inventory_units(id) ON DELETE CASCADE,
    condition_before VARCHAR(50) NOT NULL,
    condition_after VARCHAR(50),
    maintenance_reason TEXT NOT NULL,
    repair_cost NUMERIC(10, 2) DEFAULT 0.0,
    service_provider VARCHAR(255),
    expected_return_date DATE,
    actual_return_date DATE,
    condition_photos TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE maintenance_records ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'maintenance_records' AND policyname = 'Allow admin/staff full access to maintenance_records') THEN
    CREATE POLICY "Allow admin/staff full access to maintenance_records" ON maintenance_records FOR ALL USING (
      EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()::text AND (profiles.role = 'admin' OR profiles.role = 'staff')
      )
    );
  END IF;
END $$;

-- 5. Alter bookings table to support checklists and late/damage payment request urls
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS pickup_checklist JSONB DEFAULT '{"body": false, "lens": false, "battery": false, "charger": false, "memory_card": false, "bag": false, "accessories": false}'::jsonb;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS return_checklist JSONB DEFAULT '{"body": false, "lens": false, "battery": false, "charger": false, "memory_card": false, "bag": false, "accessories": false}'::jsonb;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS penalty_payment_url TEXT;

-- 6. Support Tickets and Replies
CREATE TABLE IF NOT EXISTS support_tickets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id VARCHAR(255) REFERENCES profiles(id) ON DELETE CASCADE,
    booking_id VARCHAR(255) REFERENCES bookings(id) ON DELETE SET NULL,
    subject VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(50) NOT NULL, -- 'technical', 'rental'
    priority VARCHAR(20) NOT NULL DEFAULT 'medium', -- 'low', 'medium', 'high'
    status VARCHAR(20) NOT NULL DEFAULT 'open', -- 'open', 'replied', 'resolved'
    assigned_to VARCHAR(100) NOT NULL, -- Sachin or Prem email
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS ticket_replies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ticket_id UUID REFERENCES support_tickets(id) ON DELETE CASCADE,
    sender_id VARCHAR(255) REFERENCES profiles(id) ON DELETE SET NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_replies ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'support_tickets' AND policyname = 'Allow users to view own support_tickets') THEN
    CREATE POLICY "Allow users to view own support_tickets" ON support_tickets FOR SELECT USING (profile_id::text = auth.uid()::text);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'support_tickets' AND policyname = 'Allow users to insert support_tickets') THEN
    CREATE POLICY "Allow users to insert support_tickets" ON support_tickets FOR INSERT WITH CHECK (profile_id::text = auth.uid()::text);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'support_tickets' AND policyname = 'Allow admin/staff full access to support_tickets') THEN
    CREATE POLICY "Allow admin/staff full access to support_tickets" ON support_tickets FOR ALL USING (
      EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()::text AND (profiles.role = 'admin' OR profiles.role = 'staff')
      )
    );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'ticket_replies' AND policyname = 'Allow users to view own ticket_replies') THEN
    CREATE POLICY "Allow users to view own ticket_replies" ON ticket_replies FOR SELECT USING (
      EXISTS (
        SELECT 1 FROM support_tickets
        WHERE support_tickets.id = ticket_replies.ticket_id AND (support_tickets.profile_id::text = auth.uid()::text OR EXISTS (
          SELECT 1 FROM profiles WHERE profiles.id = auth.uid()::text AND (profiles.role = 'admin' OR profiles.role = 'staff')
        ))
      )
    );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'ticket_replies' AND policyname = 'Allow users to insert ticket_replies') THEN
    CREATE POLICY "Allow users to insert ticket_replies" ON ticket_replies FOR INSERT WITH CHECK (
      EXISTS (
        SELECT 1 FROM support_tickets
        WHERE support_tickets.id = ticket_replies.ticket_id AND (support_tickets.profile_id::text = auth.uid()::text OR EXISTS (
          SELECT 1 FROM profiles WHERE profiles.id = auth.uid()::text AND (profiles.role = 'admin' OR profiles.role = 'staff')
        ))
      )
    );
  END IF;
END $$;

-- 7. Add Index structures for speed
CREATE INDEX IF NOT EXISTS idx_refunds_booking_id ON refunds(booking_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_unit_id ON maintenance_records(inventory_unit_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_profile ON support_tickets(profile_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_booking ON support_tickets(booking_id);
CREATE INDEX IF NOT EXISTS idx_ticket_replies_ticket ON ticket_replies(ticket_id);
