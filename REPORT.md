# Security Audit Report: Aurevia Premium Rentals

**Run Profile:** `standard`  
**Execution Policy:** `sandboxed-source-and-local-only` (Static analysis + Bounded local validation)  
**Target Repository:** `aurevia-app` (Next.js 16 + Supabase + Razorpay)  
**Audit Harness:** `cloudflare/security-audit-skill`  

---

## 1. Security Posture Summary

Aurevia implements several defensive measures (e.g., custom RBAC middleware, Supabase JWT checks, and role validation). However, the audit identified critical gaps at key architectural trust boundaries:
1. **Database RLS Boundary:** Supabase Row Level Security allows self-service privilege escalation on account creation.
2. **Operational API Boundary:** Critical equipment return & financial refund endpoints lack authentication.
3. **Financial Gateway Boundary:** Checkout order generation permits client-side price parameter tampering for uncataloged item IDs.
4. **Network & Origin Boundary:** Permissive CORS regex matching permits credentialed cross-origin access from arbitrary Vercel deployments.

---

## 2. Confirmed Findings Summary

| Severity | Fingerprint | Title | Affected Boundary | Demonstrated Result |
| :--- | :--- | :--- | :--- | :--- |
| **CRITICAL** | `aurevia:supabase:rls-insert-privilege-escalation` | Privilege escalation to administrator via Supabase `profiles` INSERT | Client -> Supabase Database RLS | Authenticated user registers and inserts `role='admin'`, bypassing RBAC. |
| **HIGH** | `aurevia:api:unauthenticated-booking-return-settlement` | Unauthenticated access to equipment return & refund settlement | Public Web -> Operational Backend | Any anonymous caller can mark rentals returned, zero late fees, and trigger deposit refunds. |
| **HIGH** | `aurevia:api:client-side-price-tampering-create-order` | Client-controlled price tampering in checkout orders via uncataloged fallback | Client Cart -> Razorpay Order Creation | Caller supplies custom `dailyPrice: 1` with uncataloged ID; gateway order created at ₹1/day. |
| **HIGH** | `aurevia:proxy:insecure-cors-wildcard-credentialed-access` | Permissive CORS origin regex allowing credentialed cross-origin access | Cross-Origin Web -> Protected APIs | Any third-party app on `*.vercel.app` can issue credentialed requests to read user data. |

---

## 3. Detailed Vulnerability Analyses

### 1. Privilege Escalation to Administrator via Supabase Profiles `INSERT`
- **Severity:** `CRITICAL` (Likelihood: High, Impact: Critical)
- **Primary Source:** [`supabase/migrations/20260907000000_security_role_escalation_guard.sql:30-33`](supabase/migrations/20260907000000_security_role_escalation_guard.sql) & [`supabase/migrations/20260715120000_realtime_rls.sql:176-178`](supabase/migrations/20260715120000_realtime_rls.sql)
- **Root Cause:** The guard trigger `trg_prevent_role_escalation` is attached to `BEFORE UPDATE ON public.profiles` only. The RLS policy `profiles_insert_self` allows `FOR INSERT WITH CHECK (auth.uid() = id)` without validating the `role` field.
- **Remediation:**
  Update the trigger to intercept both `INSERT` and `UPDATE`:
  ```sql
  DROP TRIGGER IF EXISTS trg_prevent_role_escalation ON public.profiles;
  CREATE TRIGGER trg_prevent_role_escalation
    BEFORE INSERT OR UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.prevent_profile_role_escalation();
  ```

---

### 2. Unauthenticated Equipment Return & Deposit Settlement
- **Severity:** `HIGH` (Likelihood: High, Impact: High)
- **Primary Source:** [`src/app/api/bookings/return/route.ts:121`](src/app/api/bookings/return/route.ts)
- **Root Cause:** The `POST /api/bookings/return` route handler performs return operations, updates physical inventory status, and computes deposit refunds without invoking `verifyApiAuth()` or session verification.
- **Remediation:**
  Add staff and admin authorization check:
  ```typescript
  const { user, response } = await verifyApiAuth(req, ["admin", "staff", "super_admin"]);
  if (response || !user) return response!;
  ```

---

### 3. Client-Side Price Tampering in Checkout Order Creation
- **Severity:** `HIGH` (Likelihood: High, Impact: High)
- **Primary Source:** [`src/app/api/create-order/route.ts:53`](src/app/api/create-order/route.ts) & [`src/lib/services/availabilityEngine.ts:96-100`](src/lib/services/availabilityEngine.ts)
- **Root Cause:** When an item ID is not in `dbProducts`, `api/create-order` falls back to `i.dailyPrice` from user input, while `availabilityEngine` treats uncataloged products as available by default.
- **Remediation:**
  Enforce that all products must exist in the authoritative database, and fail with 400 Bad Request if missing:
  ```typescript
  if (!match) {
    return apiError("Invalid or uncataloged product selected.", "INVALID_PRODUCT", 400);
  }
  ```

---

### 4. Overly Permissive CORS Origin Allowing Credentialed Cross-Origin Access
- **Severity:** `HIGH` (Likelihood: Medium, Impact: High)
- **Primary Source:** [`src/proxy.ts:23-45`](src/proxy.ts)
- **Root Cause:** `origin.endsWith(".vercel.app")` matches any third-party app hosted on Vercel and sets `Access-Control-Allow-Credentials: true`.
- **Remediation:**
  Match against an explicit whitelist of trusted domains:
  ```typescript
  const allowed = [
    process.env.NEXT_PUBLIC_SITE_URL,
    process.env.NEXT_PUBLIC_ADMIN_URL,
    "http://localhost:3000",
    "http://localhost:3001"
  ].filter(Boolean);
  const isAllowedOrigin = origin && allowed.includes(origin);
  ```

---

## 4. Hardening Recommendations

1. **Remove Hardcoded Default Credentials:** Remove fallback passwords in [`src/app/api/auth/admin-seed/route.ts`](src/app/api/auth/admin-seed/route.ts).
2. **Constant-Time Comparison for Webhooks:** In [`src/app/api/webhooks/razorpay/route.ts`](src/app/api/webhooks/razorpay/route.ts), use `crypto.timingSafeEqual()` instead of `!==` to prevent timing attacks.
3. **Avoid Token in GET Query Strings:** In [`src/app/api/cron/booking-ops/route.ts`](src/app/api/cron/booking-ops/route.ts), rely strictly on `Authorization: Bearer <token>` headers instead of `?token=...` URL queries.
