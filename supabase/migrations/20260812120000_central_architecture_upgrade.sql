-- ============================================================================
-- AUREVIA Central Architecture & Audit Logs Migration
-- Migration ID: 20260812120000_central_architecture_upgrade.sql
-- ============================================================================

-- 1. Audit Logs Table for privileged actions
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    actor_email TEXT,
    action TEXT NOT NULL,
    resource TEXT NOT NULL,
    resource_id TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    ip_address TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Indexes for High-Frequency Operational Queries
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_resource ON public.audit_logs(resource, resource_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status_dates ON public.bookings(status, start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_bookings_profile_created ON public.bookings(profile_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_payments_booking_created ON public.payments(booking_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_kyc_documents_status ON public.kyc_documents(status);

-- 3. RLS Policies for audit_logs
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'audit_logs' AND policyname = 'Admins and staff can view audit logs') THEN
    CREATE POLICY "Admins and staff can view audit logs" ON public.audit_logs FOR SELECT USING (
      EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'staff')
      )
    );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'audit_logs' AND policyname = 'Admins and staff can insert audit logs') THEN
    CREATE POLICY "Admins and staff can insert audit logs" ON public.audit_logs FOR INSERT WITH CHECK (
      EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'staff')
      )
    );
  END IF;
END $$;
