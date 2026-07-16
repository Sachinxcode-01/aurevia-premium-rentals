-- Aurevia Database Operations & Logistics Schema Upgrade
-- Alters database schema to support the complete operational workflow without document uploads

-- 1. Alter Bookings Table with operational and auditing fields
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS emergency_contact VARCHAR(100);
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS company_or_college VARCHAR(100);

-- Security Deposit tracking
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS deposit_status VARCHAR(50) DEFAULT 'pending';
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS deposit_payment_method VARCHAR(50) DEFAULT 'razorpay';

-- Digital agreement fields
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS agreement_accepted BOOLEAN DEFAULT false;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS agreement_accepted_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS agreement_ip VARCHAR(50);

-- Handover / Pickup fields
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS pickup_otp VARCHAR(10);
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS pickup_remarks TEXT;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS pickup_condition_photos TEXT[];
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS pickup_handover_at TIMESTAMP WITH TIME ZONE;

-- Return inspection fields
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS return_inspection_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS return_remarks TEXT;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS return_condition_photos TEXT[];

-- Audit logs & status history as JSON arrays for structural logging
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS status_history JSONB DEFAULT '[]'::jsonb;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS audit_logs JSONB DEFAULT '[]'::jsonb;

-- 2. Drop the redundant document upload fields to enforce strict KYC-free operational rules
ALTER TABLE bookings DROP COLUMN IF EXISTS document_url;
ALTER TABLE bookings DROP COLUMN IF EXISTS document_status;
