# Detailed Security Findings (FINDINGS-DETAIL.md)

This document contains deep technical traces, reproduction instructions, bounded payloads, and source code remediations for all confirmed vulnerabilities discovered during the security audit.

---

### Finding 1: Privilege Escalation to Administrator via Supabase Profiles `INSERT`

- **Fingerprint:** `aurevia:supabase:rls-insert-privilege-escalation`
- **Severity:** `CRITICAL`
- **Likelihood:** `High`
- **Impact:** `Critical`
- **Confidence:** `High`

#### Source Trace & Evidence
1. **Entrypoint:** `supabase/migrations/20260715120000_realtime_rls.sql:176-178`
   ```sql
   CREATE POLICY "profiles_insert_self" ON profiles
     FOR INSERT WITH CHECK (auth.uid() = id);
   ```
   *The check confirms identity matches the authenticated UID, but allows any column value (including `role`).*
2. **Defensive Gap:** `supabase/migrations/20260907000000_security_role_escalation_guard.sql:30-33`
   ```sql
   CREATE TRIGGER trg_prevent_role_escalation
     BEFORE UPDATE ON public.profiles
     FOR EACH ROW
     EXECUTE FUNCTION public.prevent_profile_role_escalation();
   ```
   *The trigger only intercepts UPDATE statements, leaving INSERT completely unguarded.*
3. **Sink:** `src/lib/auth/rbac.ts:88`
   *Administrative endpoints use `public.is_admin_or_staff(auth.uid())` which directly trusts the `role` in `public.profiles`.*

#### Reproduction
```javascript
// From any client session after sign up:
const { data, error } = await supabase
  .from('profiles')
  .insert({
    id: user.id,
    email: user.email,
    full_name: 'Privileged Attacker',
    role: 'admin' // Successfully sets role to admin
  });
```

#### Remediation
Create a new migration or update `supabase/migrations/20260907000000_security_role_escalation_guard.sql`:
```sql
DROP TRIGGER IF EXISTS trg_prevent_role_escalation ON public.profiles;

CREATE TRIGGER trg_prevent_role_escalation
  BEFORE INSERT OR UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_profile_role_escalation();
```

---

### Finding 2: Unauthenticated Equipment Return & Deposit Settlement

- **Fingerprint:** `aurevia:api:unauthenticated-booking-return-settlement`
- **Severity:** `HIGH`
- **Likelihood:** `High`
- **Impact:** `High`
- **Confidence:** `High`

#### Source Trace & Evidence
1. **Entrypoint:** `src/app/api/bookings/return/route.ts:121`
   ```typescript
   export async function POST(req: NextRequest) {
     try {
       const body = await req.json();
       const { bookingId, referenceCode, condition, damageCost, lateFeeOverride, checklist, staffName } = body;
   ```
   *No user session check, token validation, or RBAC check exists in the handler.*
2. **Sink:** `src/app/api/bookings/return/route.ts:181-196`
   ```typescript
   const updated = await db.processReturn(
     booking.id,
     condition === "damaged" ? "damaged" : "good",
     damageDescription || "",
     Number(damageCost) || 0,
     staffRemark,
     lateFeeOverride !== undefined ? Number(lateFeeOverride) : undefined
   );
   ```

#### Reproduction
```bash
curl -X POST http://localhost:3000/api/bookings/return \
  -H "Content-Type: application/json" \
  -d '{
    "bookingId": "TARGET_BOOKING_UUID",
    "checklist": { "serialsMatched": true, "allAccessoriesReturned": true },
    "damageCost": 0,
    "lateFeeOverride": 0
  }'
```
*Observed Result: The rental booking is transitioned to `completed`, late fees are waived, and deposit settlement email is dispatched.*

#### Remediation
In `src/app/api/bookings/return/route.ts`:
```typescript
import { verifyApiAuth } from "@/lib/auth/rbac";

export async function POST(req: NextRequest) {
  try {
    const { user, response } = await verifyApiAuth(req, ["admin", "staff", "super_admin"]);
    if (response || !user) return response!;
    // ... rest of handler
```

---

### Finding 3: Client-Side Price Tampering in Checkout Order Creation

- **Fingerprint:** `aurevia:api:client-side-price-tampering-create-order`
- **Severity:** `HIGH`
- **Likelihood:** `High`
- **Impact:** `High`
- **Confidence:** `High`

#### Source Trace & Evidence
1. **Entrypoint:** `src/app/api/create-order/route.ts:51-59`
   ```typescript
   const pricingItems = items.map((i: { productId: string; quantity?: number; dailyPrice?: number }) => {
     const match = dbProducts?.find((p: any) => p.id === i.productId);
     const actualPrice = match?.daily_price || match?.daily_rate || i.dailyPrice || 799;
     return {
       productId: i.productId,
       dailyPrice: Number(actualPrice),
       quantity: i.quantity || 1,
     };
   });
   ```
2. **Flawed Availability Validation:** `src/lib/services/availabilityEngine.ts:96-100`
   ```typescript
   // If product ID is valid format, default to available for demo/checkout
   return {
     available: true,
     productStock: 5,
     availableStock: 5,
     conflictingBookingsCount: 0,
   };
   ```

#### Reproduction
```bash
curl -X POST http://localhost:3000/api/create-order \
  -H "Content-Type: application/json" \
  -d '{
    "items": [{
      "productId": "custom-unindexed-camera",
      "dailyPrice": 1,
      "quantity": 1,
      "startDate": "2026-10-01",
      "endDate": "2026-10-05"
    }],
    "deliveryMethod": "pickup"
  }'
```
*Observed Result: Generates a Razorpay order calculated with `dailyPrice: 1` rather than returning a 400 error.*

#### Remediation
In `src/app/api/create-order/route.ts`:
```typescript
for (const i of items) {
  const match = dbProducts?.find((p: any) => p.id === i.productId);
  if (!match) {
    return apiError(`Product ${i.productId} is invalid or discontinued.`, "INVALID_PRODUCT", 400);
  }
}
```

---

### Finding 4: Insecure CORS Wildcard Allowing Credentialed Cross-Origin Access

- **Fingerprint:** `aurevia:proxy:insecure-cors-wildcard-credentialed-access`
- **Severity:** `HIGH`
- **Likelihood:** `Medium`
- **Impact:** `High`
- **Confidence:** `High`

#### Source Trace & Evidence
1. **Entrypoint:** `src/proxy.ts:23-45`
   ```typescript
   const isAllowedOrigin =
     !origin ||
     origin.includes("localhost") ||
     origin.includes("127.0.0.1") ||
     origin.endsWith(".vercel.app") || // <-- Flaw: Matches any arbitrary third-party Vercel app
     origin === process.env.NEXT_PUBLIC_SITE_URL ||
     origin === process.env.NEXT_PUBLIC_ADMIN_URL;
   
   // ...
   res.headers.set("Access-Control-Allow-Origin", allowedOrigin);
   res.headers.set("Access-Control-Allow-Credentials", "true");
   ```

#### Remediation
In `src/proxy.ts`:
```typescript
const allowedOrigins = [
  process.env.NEXT_PUBLIC_SITE_URL,
  process.env.NEXT_PUBLIC_ADMIN_URL,
  "http://localhost:3000",
  "http://localhost:3001"
].filter(Boolean);

const isAllowedOrigin = !origin || allowedOrigins.includes(origin);
```
