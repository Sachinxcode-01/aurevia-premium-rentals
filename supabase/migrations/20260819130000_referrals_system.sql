-- ============================================================================
-- AUREVIA Production Realtime Referral & Rewards Architecture
-- Migration ID: 20260819130000_referrals_system.sql
-- ============================================================================

-- 1. Referrals Table
CREATE TABLE IF NOT EXISTS public.referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  referred_name TEXT NOT NULL,
  referred_email TEXT NOT NULL,
  code_used TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'rewarded', 'rejected')),
  reward_amount NUMERIC(10,2) NOT NULL DEFAULT 500.00,
  friend_discount NUMERIC(10,2) NOT NULL DEFAULT 200.00,
  booking_id UUID REFERENCES public.bookings(id) ON DELETE SET NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Indexes for Query Speed
CREATE INDEX IF NOT EXISTS idx_referrals_referrer_id ON public.referrals(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referrals_code_used ON public.referrals(code_used);
CREATE INDEX IF NOT EXISTS idx_referrals_status ON public.referrals(status);

-- 3. Enable RLS
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

-- Referrer can view their own referrals
DROP POLICY IF EXISTS "referrals_user_select" ON public.referrals;
CREATE POLICY "referrals_user_select" ON public.referrals
  FOR SELECT USING (referrer_id = auth.uid());

-- Admins full access
DROP POLICY IF EXISTS "referrals_admin_all" ON public.referrals;
CREATE POLICY "referrals_admin_all" ON public.referrals
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'staff')
    )
  );

-- 4. Enable Supabase Realtime for Referrals
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'referrals'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE referrals;
  END IF;
END $$;

-- 5. Timestamp Trigger
DROP TRIGGER IF EXISTS set_referrals_updated_at ON public.referrals;
CREATE TRIGGER set_referrals_updated_at
  BEFORE UPDATE ON public.referrals
  FOR EACH ROW
  EXECUTE FUNCTION public.update_timestamp();
