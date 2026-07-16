-- Aurevia Database Schema Upgrade
-- Upgrades schema to support flat discounts, limits, time slots, document verification, damage/late returns logging

-- 1. Alter Coupons Table
ALTER TABLE coupons ADD COLUMN IF NOT EXISTS discount_flat NUMERIC(10, 2) DEFAULT 0.0;
ALTER TABLE coupons ADD COLUMN IF NOT EXISTS activation_date DATE DEFAULT '2026-07-01';
ALTER TABLE coupons ADD COLUMN IF NOT EXISTS usage_limit INTEGER DEFAULT 100;
ALTER TABLE coupons ADD COLUMN IF NOT EXISTS per_user_limit INTEGER DEFAULT 1;

-- 2. Alter Bookings Table
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS document_url TEXT;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS document_status VARCHAR(50) DEFAULT 'pending';
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS pickup_time VARCHAR(20);
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS return_time VARCHAR(20);
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS late_fee NUMERIC(10, 2) DEFAULT 0.0;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS returned_condition VARCHAR(50);
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS damage_description TEXT;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS damage_cost NUMERIC(10, 2) DEFAULT 0.0;

-- 3. Clean up other mock products to match Prem's 3 real camera inventory
DELETE FROM product_images WHERE product_id NOT IN (
    'p1000000-0000-0000-0000-000000000001', 
    'p1000000-0000-0000-0000-000000000003'
);
DELETE FROM product_specifications WHERE product_id NOT IN (
    'p1000000-0000-0000-0000-000000000001', 
    'p1000000-0000-0000-0000-000000000003'
);
DELETE FROM booking_items WHERE product_id NOT IN (
    'p1000000-0000-0000-0000-000000000001', 
    'p1000000-0000-0000-0000-000000000003'
);
DELETE FROM inventory_units WHERE product_id NOT IN (
    'p1000000-0000-0000-0000-000000000001', 
    'p1000000-0000-0000-0000-000000000003'
);
DELETE FROM products WHERE id NOT IN (
    'p1000000-0000-0000-0000-000000000001', 
    'p1000000-0000-0000-0000-000000000003'
);

-- 4. Set Daily Pricing for Remaining Cameras
UPDATE products 
SET name = 'Canon Camera', 
    daily_price = 799.00, 
    weekly_price = 4999.00, 
    inventory_qty = 2 
WHERE id = 'p1000000-0000-0000-0000-000000000001';

UPDATE products 
SET name = 'Nikon Camera', 
    daily_price = 799.00, 
    weekly_price = 4999.00, 
    inventory_qty = 1 
WHERE id = 'p1000000-0000-0000-0000-000000000003';

-- 5. Set up 3 specific physical camera units
INSERT INTO inventory_units (id, product_id, serial_number, status) VALUES
('u1000000-0000-0000-0000-000000000001', 'p1000000-0000-0000-0000-000000000001', 'CN-CAM-01', 'available'),
('u1000000-0000-0000-0000-000000000002', 'p1000000-0000-0000-0000-000000000001', 'CN-CAM-02', 'available'),
('u1000000-0000-0000-0000-000000000003', 'p1000000-0000-0000-0000-000000000003', 'NK-CAM-01', 'available')
ON CONFLICT (serial_number) DO UPDATE SET status = 'available';

-- 6. Insert new flat discount Coupon
INSERT INTO coupons (id, code, discount_percent, discount_flat, max_discount, active_until, is_active, activation_date, usage_limit, per_user_limit) VALUES
('c1000000-0000-0000-0000-000000000199', 'AUREVIA199', 0.00, 199.00, 10000.00, '2026-12-31', true, '2026-07-01', 100, 1)
ON CONFLICT (code) DO UPDATE SET is_active = true, discount_flat = 199.00;
