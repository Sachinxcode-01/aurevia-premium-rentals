-- ============================================================================
-- AUREVIA Production Hardening: Privilege Escalation Guard
-- Prevents non-administrative callers from updating their own 'role' column
-- ============================================================================

CREATE OR REPLACE FUNCTION public.prevent_profile_role_escalation()
RETURNS TRIGGER AS $$
BEGIN
  -- On INSERT: prevent assigning roles other than 'customer' unless service_role or admin
  IF TG_OP = 'INSERT' THEN
    IF NEW.role IS NOT NULL AND NEW.role != 'customer' THEN
      IF current_setting('request.jwt.claim.role', true) = 'service_role' THEN
        RETURN NEW;
      END IF;
      IF public.is_admin_or_staff(auth.uid()::text) THEN
        RETURN NEW;
      END IF;
      RAISE EXCEPTION 'Security Exception: Assigning administrative role during registration is forbidden.';
    END IF;
    RETURN NEW;
  END IF;

  -- On UPDATE: If role has not changed, permit update without restriction
  IF NEW.role IS NOT DISTINCT FROM OLD.role THEN
    RETURN NEW;
  END IF;

  -- Allow operations executed under the trusted service_role key
  IF current_setting('request.jwt.claim.role', true) = 'service_role' THEN
    RETURN NEW;
  END IF;

  -- Allow verified admin or staff members to manage roles
  IF public.is_admin_or_staff(auth.uid()::text) THEN
    RETURN NEW;
  END IF;

  -- Forbid customer or unauthorized role tampering
  RAISE EXCEPTION 'Security Exception: Modifying user authorization role is forbidden.';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_prevent_role_escalation ON public.profiles;
CREATE TRIGGER trg_prevent_role_escalation
  BEFORE INSERT OR UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_profile_role_escalation();
