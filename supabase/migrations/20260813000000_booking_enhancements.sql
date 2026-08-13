-- Migration: 20260813000000_booking_enhancements.sql
-- Description: Adds deposit pre-auth tracking, gear bundles schema, and RPC availability checking with buffer days.

-- 1. Extend bookings table for deposit tracking
ALTER TABLE bookings 
  ADD COLUMN IF NOT EXISTS deposit_status VARCHAR(50) DEFAULT 'none',
  ADD COLUMN IF NOT EXISTS deposit_amount NUMERIC(10, 2) DEFAULT 0.0,
  ADD COLUMN IF NOT EXISTS reminder_sent_at TIMESTAMP WITH TIME ZONE;

-- 2. Gear Bundles / Packages Tables
CREATE TABLE IF NOT EXISTS gear_bundles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    tagline VARCHAR(255),
    description TEXT NOT NULL,
    badge VARCHAR(50) DEFAULT 'BUNDLE SAVINGS',
    discount_percentage NUMERIC(5, 2) NOT NULL DEFAULT 15.0,
    image_url TEXT,
    is_featured BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS gear_bundle_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    bundle_id UUID REFERENCES gear_bundles(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
    UNIQUE (bundle_id, product_id)
);

-- 3. Availability Check Function (RPC with Turnaround Buffer Days)
CREATE OR REPLACE FUNCTION check_gear_availability(
    p_product_id UUID,
    p_start_date DATE,
    p_end_date DATE,
    p_buffer_days INT DEFAULT 1
)
RETURNS TABLE (
    is_available BOOLEAN,
    available_qty INT,
    total_inventory INT,
    conflict_reason TEXT
) 
LANGUAGE plpgsql
AS $$
DECLARE
    v_total_qty INT;
    v_booked_qty INT;
    v_block_count INT;
    v_effective_start DATE;
    v_effective_end DATE;
BEGIN
    -- Apply turnaround buffer window
    v_effective_start := p_start_date - (p_buffer_days || ' days')::INTERVAL;
    v_effective_end := p_end_date + (p_buffer_days || ' days')::INTERVAL;

    -- Get total product inventory
    SELECT inventory_qty INTO v_total_qty
    FROM products
    WHERE id = p_product_id AND is_archived = false;

    IF v_total_qty IS NULL THEN
        RETURN QUERY SELECT false, 0, 0, 'Product not found or archived'::TEXT;
        RETURN;
    END IF;

    -- Check availability blocks
    SELECT COUNT(*) INTO v_block_count
    FROM availability_blocks
    WHERE product_id = p_product_id
      AND start_date <= p_end_date
      AND end_date >= p_start_date;

    IF v_block_count > 0 THEN
        RETURN QUERY SELECT false, 0, v_total_qty, 'Blocked for scheduled maintenance'::TEXT;
        RETURN;
    END IF;

    -- Calculate max overlapping booked quantity during effective window
    SELECT COALESCE(SUM(bi.quantity), 0) INTO v_booked_qty
    FROM booking_items bi
    JOIN bookings b ON bi.booking_id = b.id
    WHERE bi.product_id = p_product_id
      AND b.status IN ('pending', 'confirmed', 'picked_up')
      AND b.start_date <= v_effective_end
      AND b.end_date >= v_effective_start;

    IF (v_total_qty - v_booked_qty) > 0 THEN
        RETURN QUERY SELECT true, (v_total_qty - v_booked_qty)::INT, v_total_qty, NULL::TEXT;
    ELSE
        RETURN QUERY SELECT false, 0, v_total_qty, 'Gear fully reserved for requested dates (including turnaround buffer)'::TEXT;
    END IF;
END;
$$;
