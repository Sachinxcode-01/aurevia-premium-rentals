-- ============================================================================
-- AUREVIA Production Hardening & Unit Management Migration
-- Migration ID: 20260812000000_production_hardening.sql
-- ============================================================================

-- 1. Ensure Inventory Units table exists for physical serial number tracking
CREATE TABLE IF NOT EXISTS public.inventory_units (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  serial_number TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'reserved', 'rented', 'maintenance', 'decommissioned')),
  condition TEXT NOT NULL DEFAULT 'excellent' CHECK (condition IN ('excellent', 'good', 'fair', 'damaged')),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Enhance Coupons table with business validation rules
ALTER TABLE public.coupons 
  ADD COLUMN IF NOT EXISTS min_booking_amount NUMERIC(10,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS max_discount_amount NUMERIC(10,2) DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS usage_limit INT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS times_used INT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS per_user_limit INT DEFAULT 1;

-- 3. Enhance KYC Documents table for secure document verification
CREATE TABLE IF NOT EXISTS public.kyc_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  document_type TEXT NOT NULL CHECK (document_type IN ('aadhaar', 'pan', 'driving_licence', 'college_id')),
  document_number TEXT,
  file_path TEXT NOT NULL,
  file_size INT NOT NULL,
  mime_type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('not_submitted', 'pending', 'approved', 'rejected', 'reupload_required')),
  rejection_reason TEXT,
  reviewed_by UUID REFERENCES public.profiles(id),
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Create indexes for high-frequency queries
CREATE INDEX IF NOT EXISTS idx_products_slug ON public.products(slug);
CREATE INDEX IF NOT EXISTS idx_products_is_available ON public.products(is_available);
CREATE INDEX IF NOT EXISTS idx_bookings_profile_id ON public.bookings(profile_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON public.bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_dates ON public.bookings(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_inventory_units_product_status ON public.inventory_units(product_id, status);
CREATE INDEX IF NOT EXISTS idx_kyc_documents_profile ON public.kyc_documents(profile_id);

-- 5. RLS Policies for kyc_documents
ALTER TABLE public.kyc_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own KYC documents"
  ON public.kyc_documents FOR SELECT
  USING (auth.uid() = profile_id);

CREATE POLICY "Users can insert their own KYC documents"
  ON public.kyc_documents FOR INSERT
  WITH CHECK (auth.uid() = profile_id);

CREATE POLICY "Admins can view all KYC documents"
  ON public.kyc_documents FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'staff')
    )
  );

-- 6. Trigger to update updated_at timestamps
CREATE OR REPLACE FUNCTION public.update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_inventory_units_updated_at ON public.inventory_units;
CREATE TRIGGER set_inventory_units_updated_at
  BEFORE UPDATE ON public.inventory_units
  FOR EACH ROW
  EXECUTE FUNCTION public.update_timestamp();

DROP TRIGGER IF EXISTS set_kyc_documents_updated_at ON public.kyc_documents;
CREATE TRIGGER set_kyc_documents_updated_at
  BEFORE UPDATE ON public.kyc_documents
  FOR EACH ROW
  EXECUTE FUNCTION public.update_timestamp();
