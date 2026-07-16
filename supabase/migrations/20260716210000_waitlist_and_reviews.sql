-- AUREVIA Waitlist and Reviews Schema
-- Support for Customer Testimonials, Product Reviews, and Out-of-Stock Waitlists
-- Created on: 2026-07-16

-- ─── 1. WAITLIST TABLE ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS waitlist (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id  UUID REFERENCES products(id) ON DELETE CASCADE,
  name        VARCHAR(255) NOT NULL,
  email       VARCHAR(255) NOT NULL,
  phone       VARCHAR(50) NOT NULL,
  status      VARCHAR(50) DEFAULT 'pending', -- pending | notified | cancelled
  created_at  TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- RLS for Waitlist
ALTER TABLE waitlist ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public inserts on waitlist"
  ON waitlist FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow admin and staff read on waitlist"
  ON waitlist FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND (profiles.role = 'admin' OR profiles.role = 'staff')
    )
  );

CREATE POLICY "Allow admin and staff updates on waitlist"
  ON waitlist FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND (profiles.role = 'admin' OR profiles.role = 'staff')
    )
  );

-- Indexes for waitlist
CREATE INDEX IF NOT EXISTS idx_waitlist_product_id ON waitlist(product_id);
CREATE INDEX IF NOT EXISTS idx_waitlist_status     ON waitlist(status);

-- ─── 2. REVIEWS TABLE ────────────────────────────────────────────────────
DROP TABLE IF EXISTS reviews CASCADE;
CREATE TABLE IF NOT EXISTS reviews (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id  UUID REFERENCES products(id) ON DELETE CASCADE,
  author_name VARCHAR(255) NOT NULL,
  rating      INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  quote       TEXT NOT NULL,
  is_approved BOOLEAN DEFAULT false,
  created_at  TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- RLS for Reviews
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to approved reviews"
  ON reviews FOR SELECT
  USING (is_approved = true);

CREATE POLICY "Allow public insert access to reviews"
  ON reviews FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow admin/staff full access to reviews"
  ON reviews FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND (profiles.role = 'admin' OR profiles.role = 'staff')
    )
  );

-- Indexes for reviews
CREATE INDEX IF NOT EXISTS idx_reviews_product_id ON reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_reviews_is_approved ON reviews(is_approved);

-- ─── 3. SEED INITIAL CUSTOMER REVIEWS ────────────────────────────────────
INSERT INTO reviews (product_id, author_name, rating, quote, is_approved)
VALUES
  (
    'p1000000-0000-0000-0000-000000000001',
    'Aravind Sen',
    5,
    'AUREVIA provides pristine equipment that meets exact set standards. Their service is truly elite, matching the quality of the glass they rent.',
    true
  ),
  (
    'p1000000-0000-0000-0000-000000000001',
    'Rhea Kapoor',
    5,
    'The Canon EOS R5 sequence was flawless. Renting from Aurevia feels like a bespoke luxury experience, from reservation to concierge pickup.',
    true
  ),
  (
    'p1000000-0000-0000-0000-000000000003',
    'Vikram Mehta',
    5,
    'Having high-quality cinema gear ready on demand has simplified our production pipeline. Zero issues with custom booking setups.',
    true
  )
ON CONFLICT DO NOTHING;
