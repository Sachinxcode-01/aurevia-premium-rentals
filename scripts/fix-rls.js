const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// Load environment variables from .env.local if present
const envLocalPath = path.join(__dirname, '..', '.env.local');
if (fs.existsSync(envLocalPath)) {
  const envContent = fs.readFileSync(envLocalPath, 'utf8');
  envContent.split('\n').forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    const match = trimmed.match(/^([^=]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      let val = match[2].trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      process.env[key] = val;
    }
  });
}

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("DATABASE_URL is not defined in env variables.");
  process.exit(1);
}

const client = new Client({
  connectionString,
  ssl: { rejectUnauthorized: false }
});

const sql = `
-- Profiles policies
DROP POLICY IF EXISTS "profiles_select_own" ON profiles;
CREATE POLICY "profiles_select_own" ON profiles FOR SELECT USING (auth.uid()::text = id);

DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
CREATE POLICY "profiles_update_own" ON profiles FOR UPDATE USING (auth.uid()::text = id);

DROP POLICY IF EXISTS "profiles_insert_self" ON profiles;
CREATE POLICY "profiles_insert_self" ON profiles FOR INSERT WITH CHECK (auth.uid()::text = id);

DROP POLICY IF EXISTS "profiles_admin_all" ON profiles;
CREATE POLICY "profiles_admin_all" ON profiles FOR ALL USING (public.is_admin_or_staff(auth.uid()::text));

-- Bookings policies
DROP POLICY IF EXISTS "bookings_customer_select" ON bookings;
CREATE POLICY "bookings_customer_select" ON bookings FOR SELECT USING (profile_id = auth.uid()::text);

DROP POLICY IF EXISTS "bookings_customer_insert" ON bookings;
CREATE POLICY "bookings_customer_insert" ON bookings FOR INSERT WITH CHECK (profile_id = auth.uid()::text);

DROP POLICY IF EXISTS "bookings_admin_all" ON bookings;
CREATE POLICY "bookings_admin_all" ON bookings FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid()::text AND role IN ('admin', 'staff')));

-- Inventory policies
DROP POLICY IF EXISTS "inventory_admin_write" ON inventory_units;
CREATE POLICY "inventory_admin_write" ON inventory_units FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid()::text AND role IN ('admin', 'staff')));

-- Audit logs policies
DROP POLICY IF EXISTS "audit_logs_admin_select" ON audit_logs;
CREATE POLICY "audit_logs_admin_select" ON audit_logs FOR SELECT USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid()::text AND role = 'admin'));

DROP POLICY IF EXISTS "audit_logs_customer_insert" ON audit_logs;
CREATE POLICY "audit_logs_customer_insert" ON audit_logs FOR INSERT WITH CHECK (true);

-- Booking Items policies
DROP POLICY IF EXISTS "booking_items_customer_select" ON booking_items;
CREATE POLICY "booking_items_customer_select" ON booking_items FOR SELECT USING (EXISTS (SELECT 1 FROM bookings WHERE bookings.id = booking_items.booking_id AND bookings.profile_id = auth.uid()::text));

DROP POLICY IF EXISTS "booking_items_customer_insert" ON booking_items;
CREATE POLICY "booking_items_customer_insert" ON booking_items FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM bookings WHERE bookings.id = booking_items.booking_id AND bookings.profile_id = auth.uid()::text));

DROP POLICY IF EXISTS "booking_items_admin_all" ON booking_items;
CREATE POLICY "booking_items_admin_all" ON booking_items FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid()::text AND role IN ('admin', 'staff')));

-- Payments policies
DROP POLICY IF EXISTS "payments_customer_select" ON payments;
CREATE POLICY "payments_customer_select" ON payments FOR SELECT USING (EXISTS (SELECT 1 FROM bookings WHERE bookings.id = payments.booking_id AND bookings.profile_id = auth.uid()::text));

DROP POLICY IF EXISTS "payments_admin_all" ON payments;
CREATE POLICY "payments_admin_all" ON payments FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid()::text AND role IN ('admin', 'staff')));

-- Processed Events policies
DROP POLICY IF EXISTS "processed_events_admin_all" ON processed_events;
CREATE POLICY "processed_events_admin_all" ON processed_events FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid()::text AND role IN ('admin', 'staff')));

-- Coupons policies
DROP POLICY IF EXISTS "coupons_admin_all" ON coupons;
CREATE POLICY "coupons_admin_all" ON coupons FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid()::text AND role IN ('admin', 'staff')));

-- Reviews policies
DROP POLICY IF EXISTS "Allow admin/staff full access to reviews" ON reviews;
CREATE POLICY "Allow admin/staff full access to reviews" ON reviews FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid()::text AND (profiles.role = 'admin' OR profiles.role = 'staff')));

-- Booking Addons policies
DROP POLICY IF EXISTS "booking_addons_customer_select" ON booking_addons;
CREATE POLICY "booking_addons_customer_select" ON booking_addons FOR SELECT USING (EXISTS (SELECT 1 FROM bookings WHERE bookings.id = booking_addons.booking_id AND bookings.profile_id = auth.uid()::text));

DROP POLICY IF EXISTS "booking_addons_customer_insert" ON booking_addons;
CREATE POLICY "booking_addons_customer_insert" ON booking_addons FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM bookings WHERE bookings.id = booking_addons.booking_id AND bookings.profile_id = auth.uid()::text));
`;

async function main() {
  try {
    await client.connect();
    console.log("Connected to Supabase DB. Updating policies with ::text casts...");
    await client.query(sql);
    console.log("All RLS policies updated successfully!");
  } catch (err) {
    console.error("Failed to update policies:", err);
  } finally {
    await client.end();
  }
}
main();
