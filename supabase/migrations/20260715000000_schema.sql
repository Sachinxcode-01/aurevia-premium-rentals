-- AUREVIA Premium Camera Rentals Database Migration Schema
-- Created on: 2026-07-15

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Define Enums
CREATE TYPE user_role AS ENUM ('customer', 'staff', 'admin');
CREATE TYPE inventory_status AS ENUM ('available', 'rented', 'maintenance', 'decommissioned');
CREATE TYPE booking_status AS ENUM ('pending', 'confirmed', 'picked_up', 'returned', 'cancelled', 'rejected');
CREATE TYPE payment_status AS ENUM ('unpaid', 'paid', 'refunded');
CREATE TYPE deposit_status AS ENUM ('held', 'released', 'forfeited');
CREATE TYPE damage_report_status AS ENUM ('pending', 'paid', 'waived');

-- 1. Profiles Table (Linked to Supabase auth.users)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    role user_role DEFAULT 'customer',
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. User Addresses Table
CREATE TABLE IF NOT EXISTS addresses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    address_line1 VARCHAR(255) NOT NULL,
    address_line2 VARCHAR(255),
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    postal_code VARCHAR(20) NOT NULL,
    country VARCHAR(100) DEFAULT 'India',
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Brands Table
CREATE TABLE IF NOT EXISTS brands (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) UNIQUE NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    logo_url TEXT
);

-- 4. Categories Table
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) UNIQUE NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT
);

-- 5. Products Table (Primary Equipment Entity)
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    brand_id UUID REFERENCES brands(id) ON DELETE RESTRICT,
    category_id UUID REFERENCES categories(id) ON DELETE RESTRICT,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT NOT NULL,
    daily_price NUMERIC(10, 2) NOT NULL CHECK (daily_price >= 0),
    weekly_price NUMERIC(10, 2) NOT NULL CHECK (weekly_price >= 0),
    security_deposit NUMERIC(10, 2) NOT NULL CHECK (security_deposit >= 0),
    inventory_qty INTEGER NOT NULL DEFAULT 1 CHECK (inventory_qty >= 0),
    rating NUMERIC(3, 2) DEFAULT 5.0,
    is_featured BOOLEAN DEFAULT false,
    is_archived BOOLEAN DEFAULT false,
    specs_json JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Product Images
CREATE TABLE IF NOT EXISTS product_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    is_primary BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. Product Specifications (Table for fine filtering search index)
CREATE TABLE IF NOT EXISTS product_specifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    spec_key VARCHAR(100) NOT NULL,
    spec_value VARCHAR(255) NOT NULL,
    UNIQUE (product_id, spec_key)
);

-- 8. Inventory Units (Physical serial number tracking)
CREATE TABLE IF NOT EXISTS inventory_units (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    serial_number VARCHAR(100) UNIQUE NOT NULL,
    status inventory_status DEFAULT 'available',
    last_inspected TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 9. Product Addons
CREATE TABLE IF NOT EXISTS product_addons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
    is_available BOOLEAN DEFAULT true
);

-- 10. Availability Blocks (For maintenance, manual hold, etc.)
CREATE TABLE IF NOT EXISTS availability_blocks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    reason TEXT,
    CHECK (start_date <= end_date)
);

-- 11. Wishlists
CREATE TABLE IF NOT EXISTS wishlists (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(profile_id, product_id)
);

-- 12. Bookings (Reservations Engine)
CREATE TABLE IF NOT EXISTS bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    reference_code VARCHAR(50) UNIQUE NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    total_rental_fee NUMERIC(10, 2) NOT NULL,
    security_deposit NUMERIC(10, 2) NOT NULL,
    tax_fee NUMERIC(10, 2) NOT NULL DEFAULT 0.0,
    delivery_fee NUMERIC(10, 2) NOT NULL DEFAULT 0.0,
    discount_amount NUMERIC(10, 2) NOT NULL DEFAULT 0.0,
    total_payable NUMERIC(10, 2) NOT NULL,
    status booking_status DEFAULT 'pending',
    payment_status payment_status DEFAULT 'unpaid',
    delivery_method VARCHAR(50) DEFAULT 'pickup', -- pickup or delivery
    shipping_address_id UUID REFERENCES addresses(id) ON DELETE SET NULL,
    contact_name VARCHAR(255) NOT NULL,
    contact_phone VARCHAR(50) NOT NULL,
    coupon_applied VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CHECK (start_date <= end_date)
);

-- 13. Booking Items
CREATE TABLE IF NOT EXISTS booking_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE RESTRICT,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price NUMERIC(10, 2) NOT NULL,
    inventory_unit_id UUID REFERENCES inventory_units(id) ON DELETE SET NULL
);

-- 14. Booking Addons
CREATE TABLE IF NOT EXISTS booking_addons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
    addon_id UUID REFERENCES product_addons(id) ON DELETE RESTRICT,
    price NUMERIC(10, 2) NOT NULL
);

-- 15. Payments
CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
    transaction_id VARCHAR(255) NOT NULL,
    amount NUMERIC(10, 2) NOT NULL,
    status VARCHAR(50) NOT NULL, -- success, failed, pending
    payment_method VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 16. Security Deposits Status Tracking
CREATE TABLE IF NOT EXISTS deposits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
    amount NUMERIC(10, 2) NOT NULL,
    status deposit_status DEFAULT 'held',
    notes TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 17. Gear Returns
CREATE TABLE IF NOT EXISTS returns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
    returned_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    condition VARCHAR(50) DEFAULT 'good', -- good, damaged
    notes TEXT
);

-- 18. Damage Reports
CREATE TABLE IF NOT EXISTS damage_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    return_id UUID REFERENCES returns(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    cost_assessed NUMERIC(10, 2) NOT NULL DEFAULT 0.0,
    status damage_report_status DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 19. Product Reviews
CREATE TABLE IF NOT EXISTS reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 20. Coupons
CREATE TABLE IF NOT EXISTS coupons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(50) UNIQUE NOT NULL,
    discount_percent NUMERIC(5, 2) NOT NULL CHECK (discount_percent >= 0 AND discount_percent <= 100),
    max_discount NUMERIC(10, 2),
    active_until DATE NOT NULL,
    is_active BOOLEAN DEFAULT true
);

-- 21. Notifications
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 22. Website Settings
CREATE TABLE IF NOT EXISTS website_settings (
    key VARCHAR(255) PRIMARY KEY,
    value TEXT NOT NULL
);

-- 23. Testimonials
CREATE TABLE IF NOT EXISTS testimonials (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    author_name VARCHAR(100) NOT NULL,
    author_title VARCHAR(150),
    quote TEXT NOT NULL,
    rating INTEGER DEFAULT 5,
    avatar_url TEXT
);

-- 24. FAQs
CREATE TABLE IF NOT EXISTS faqs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    category VARCHAR(100) DEFAULT 'General'
);

-- 25. Audit Logs
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    action VARCHAR(255) NOT NULL,
    details TEXT,
    ip_address VARCHAR(45),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- CREATE INDEXES FOR RAPID QUERYING
CREATE INDEX idx_products_slug ON products(slug);
CREATE INDEX idx_products_brand ON products(brand_id);
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_bookings_user ON bookings(profile_id);
CREATE INDEX idx_bookings_dates ON bookings(start_date, end_date);
CREATE INDEX idx_bookings_ref ON bookings(reference_code);
CREATE INDEX idx_inventory_units_product ON inventory_units(product_id);
CREATE INDEX idx_reviews_product ON reviews(product_id);

-- ==============================================
-- LUXURY SEED DATA INJECTION
-- ==============================================

-- 1. Insert Brands
INSERT INTO brands (id, name, slug) VALUES 
('b1000000-0000-0000-0000-000000000001', 'Canon', 'canon'),
('b1000000-0000-0000-0000-000000000002', 'Sony', 'sony'),
('b1000000-0000-0000-0000-000000000003', 'Nikon', 'nikon'),
('b1000000-0000-0000-0000-000000000004', 'DJI', 'dji'),
('b1000000-0000-0000-0000-000000000005', 'RED Digital', 'red');

-- 2. Insert Categories
INSERT INTO categories (id, name, slug, description) VALUES
('c1000000-0000-0000-0000-000000000001', 'DSLR Cameras', 'dslr-cameras', 'Traditional high-end optical viewfinder professional cameras'),
('c1000000-0000-0000-0000-000000000002', 'Mirrorless Cameras', 'mirrorless-cameras', 'Modern digital high-performance mirrorless bodies'),
('c1000000-0000-0000-0000-000000000003', 'Cinema Cameras', 'cinema-cameras', 'Industry-standard film production cameras'),
('c1000000-0000-0000-0000-000000000004', 'Professional Lenses', 'professional-lenses', 'Ultra-sharp luxury glass optics and cinema lenses'),
('c1000000-0000-0000-0000-000000000005', 'Gimbals & Stabilizers', 'gimbals', 'Sturdy carbon stabilizers and motorized gimbals'),
('c1000000-0000-0000-0000-000000000006', 'Professional Lighting', 'lighting', 'Studio strobes, continuous LED matrices, and softboxes'),
('c1000000-0000-0000-0000-000000000007', 'Audio Equipment', 'audio', 'Wireless lavalier systems, shotgun microphones, and recorders'),
('c1000000-0000-0000-0000-000000000008', 'Production Accessories', 'accessories', 'Luxury tripods, matte boxes, monitors, and media cards');

-- 3. Insert Products
INSERT INTO products (id, brand_id, category_id, name, slug, description, daily_price, weekly_price, security_deposit, inventory_qty, rating, is_featured, specs_json) VALUES
-- Flagship Canon EOS R5
('p1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000002', 'Canon EOS R5', 'canon-eos-r5', 'A game-changing mirrorless body offering 45MP stills and internal 8K RAW video recording. Features 5-axis in-body image stabilization (IBIS), 20 fps mechanical/electronic shutter, and outstanding Dual Pixel AF II for commercial shoots.', 3499.00, 19999.00, 15000.00, 5, 4.95, true, '{"sensor": "45MP Full-Frame CMOS", "video": "8K RAW Internal", "stabilization": "8-stops IBIS", "iso": "100 - 51,200", "weight": "738g"}'),

-- Sony FX3 Cinema Camera
('p1000000-0000-0000-0000-000000000002', 'b1000000-0000-0000-0000-000000000002', 'c1000000-0000-0000-0000-000000000003', 'Sony FX3 Cinema Camera', 'sony-fx3', 'Part of Sony''s Cinema Line, the FX3 offers high sensitivity, cinematic color science, and an incredibly compact design. Features 12.1MP Exmor R sensor optimized for 4K video, 15+ stops of dynamic range, and S-Cinetone color profile.', 4499.00, 26999.00, 20000.00, 3, 4.98, true, '{"sensor": "12.1MP Full-Frame Exmor R", "video": "4K 120p Internal", "dynamic_range": "15+ Stops", "iso": "80 - 409,600", "weight": "715g"}'),

-- Nikon Z8
('p1000000-0000-0000-0000-000000000003', 'b1000000-0000-0000-0000-000000000003', 'c1000000-0000-0000-0000-000000000002', 'Nikon Z8 Mirrorless Camera', 'nikon-z8', 'A compact powerhouse inheriting the flagship Z9 features. Equipped with a 45.7MP stacked sensor, blackout-free viewfinder, 8K 60p internal N-RAW video, and state-of-the-art deep learning subject detection autofocus.', 3799.00, 22999.00, 18000.00, 2, 4.88, false, '{"sensor": "45.7MP Stacked CMOS", "video": "8K 60p N-RAW Internal", "stabilization": "5.5-stops IBIS", "iso": "64 - 25,600", "weight": "910g"}'),

-- Canon RF 24-70mm f/2.8L IS USM
('p1000000-0000-0000-0000-000000000004', 'b1000000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000004', 'Canon RF 24-70mm f/2.8L IS USM', 'canon-rf-24-70mm-f2-8l', 'The workhorse zoom lens for the Canon EOS R system. Constant f/2.8 aperture, L-series optical performance, Nano USM AF motor, and 5 stops of image stabilization make it ideal for portraits, landscapes, and documentary video.', 1499.00, 8999.00, 6000.00, 8, 4.90, true, '{"focal_range": "24-70mm", "aperture": "f/2.8 constant", "filter_size": "82mm", "lens_mount": "Canon RF", "weight": "900g"}'),

-- Canon RF 70-200mm f/2.8L IS USM
('p1000000-0000-0000-0000-000000000005', 'b1000000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000004', 'Canon RF 70-200mm f/2.8L IS USM', 'canon-rf-70-200mm-f2-8l', 'Unbelievably compact telephoto zoom lens that delivers pristine L-series optical quality. Features a fast constant f/2.8 aperture, dual Nano USM focus motors, 5 stops of optical stabilization, and weather-sealed construction.', 1999.00, 11999.00, 8000.00, 4, 4.92, false, '{"focal_range": "70-200mm", "aperture": "f/2.8 constant", "filter_size": "77mm", "lens_mount": "Canon RF", "weight": "1070g"}'),

-- DJI RS 3 Pro Gimbal
('p1000000-0000-0000-0000-000000000006', 'b1000000-0000-0000-0000-000000000004', 'c1000000-0000-0000-0000-000000000005', 'DJI RS 3 Pro Gimbal Stabilizer', 'dji-rs-3-pro', 'An advanced expansion platform that empowers videographers with modular stabilization tools. Features extended carbon fiber axis arms, automated axis locks, LiDAR focusing support, and 4.5kg payload capacity.', 1299.00, 7499.00, 5000.00, 4, 4.82, false, '{"payload": "4.5kg (10 lbs)", "weight": "1.5kg", "battery_life": "12 hours", "material": "Carbon Fiber", "modes": "Pan Follow, FPV, 3D Roll"}');

-- 4. Insert Product Images
INSERT INTO product_images (product_id, image_url, is_primary) VALUES
('p1000000-0000-0000-0000-000000000001', '/assets/canon-sequence/frame-210.jpg', true),
('p1000000-0000-0000-0000-000000000002', 'https://images.unsplash.com/photo-1619597455322-4fbbd820250a?q=80&w=600&auto=format&fit=crop', true),
('p1000000-0000-0000-0000-000000000003', 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=600&auto=format&fit=crop', true),
('p1000000-0000-0000-0000-000000000004', 'https://images.unsplash.com/photo-1617005082133-548c4dd27f35?q=80&w=600&auto=format&fit=crop', true),
('p1000000-0000-0000-0000-000000000005', 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?q=80&w=600&auto=format&fit=crop', true),
('p1000000-0000-0000-0000-000000000006', 'https://images.unsplash.com/photo-1590233464442-5132610b6ab4?q=80&w=600&auto=format&fit=crop', true);

-- 5. Insert Product Addons
INSERT INTO product_addons (id, name, description, price) VALUES
('a1000000-0000-0000-0000-000000000001', 'Sandisk Extreme PRO CFexpress 512GB', 'High-speed media card for 8K video capture', 499.00),
('a1000000-0000-0000-0000-000000000002', 'Extra LP-E6NH Rechargeable Battery', 'Provides up to 2 hours of extra continuous shoot time', 199.00),
('a1000000-0000-0000-0000-000000000003', 'Atomos Ninja V 5" 4K Monitor-Recorder', 'External monitor for advanced exposure tools and ProRes recording', 999.00);

-- 6. Insert Physical Inventory Units
INSERT INTO inventory_units (product_id, serial_number, status) VALUES
('p1000000-0000-0000-0000-000000000001', 'CN-R5-99801', 'available'),
('p1000000-0000-0000-0000-000000000001', 'CN-R5-99802', 'available'),
('p1000000-0000-0000-0000-000000000001', 'CN-R5-99803', 'available'),
('p1000000-0000-0000-0000-000000000002', 'SN-FX3-10201', 'available'),
('p1000000-0000-0000-0000-000000000002', 'SN-FX3-10202', 'available'),
('p1000000-0000-0000-0000-000000000003', 'NK-Z8-44901', 'available'),
('p1000000-0000-0000-0000-000000000004', 'CN-2470-38801', 'available'),
('p1000000-0000-0000-0000-000000000005', 'CN-70200-72101', 'available'),
('p1000000-0000-0000-0000-000000000006', 'DJ-RS3P-55201', 'available');

-- 7. Insert Testimonials
INSERT INTO testimonials (author_name, author_title, quote, rating) VALUES
('Aravind Sen', 'Commercial Film Director', 'AUREVIA provides pristine equipment that meets exact set standards. Their service is truly elite, matching the quality of the glass they rent.', 5),
('Rhea Kapoor', 'Fashion Photographer, Vogue', 'The Canon EOS R5 sequence was flawless. Renting from Aurevia feels like a bespoke luxury experience, from reservation to concierge pickup.', 5),
('Vikram Mehta', 'Wildlife Documentarian', 'Having high-quality cinema gear ready on demand has simplified our production pipeline. Zero issues with custom booking setups.', 5);

-- 8. Insert FAQs
INSERT INTO faqs (question, answer, category) VALUES
('What is the security deposit and how is it processed?', 'The security deposit is a temporary pre-authorization held on your card or paid online. It is fully refunded within 24-48 hours after returning the equipment in original inspected condition.', 'Security'),
('Can I extend my rental period mid-booking?', 'Yes, extensions are allowed subject to equipment availability. Please submit an extension request from your dashboard or contact our concierge immediately.', 'Rentals'),
('Do you offer delivery to shooting locations?', 'Absolutely. We offer high-security delivery directly to your studio or field location in custom protective hard cases. Rates vary based on distance and urgency.', 'Shipping'),
('What happens in case of accidental damage?', 'We require checking the equipment details upon receipt. We offer optional damage waivers during checkout to protect against minor accidents. Severe damages are assessed and billed according to repair cost.', 'Damage & Insurance');
