import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/lib/api/response";
import { verifyApiAuth, recordAuditLog } from "@/lib/auth/rbac";
import { createServiceSupabaseClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/db/store";
import { realtimeHub } from "@/lib/realtime/realtimeHub";

export interface CustomerRecord {
  id: string;
  name: string;
  email: string;
  phone: string;
  joined: string;
  kycStatus: "VERIFIED" | "PENDING" | "REJECTED" | "UNSUBMITTED";
  bookingsCount: number;
  totalSpend: number;
  status: "ACTIVE" | "SUSPENDED";
  lastActive?: string;
}

const DEFAULT_CUSTOMERS: CustomerRecord[] = [
  {
    id: "CUST-001",
    name: "Rahul Verma",
    email: "rahul.v@gmail.com",
    phone: "+91 98765 43210",
    joined: "15 Jan 2026",
    kycStatus: "VERIFIED",
    bookingsCount: 8,
    totalSpend: 112450,
    status: "ACTIVE",
    lastActive: "Today",
  },
  {
    id: "CUST-002",
    name: "Ananya Sharma",
    email: "ananya.sharma@yahoo.com",
    phone: "+91 98123 45678",
    joined: "02 Feb 2026",
    kycStatus: "PENDING",
    bookingsCount: 3,
    totalSpend: 42000,
    status: "ACTIVE",
    lastActive: "Yesterday",
  },
  {
    id: "CUST-003",
    name: "Vikramaditya Rao",
    email: "vikram.rao@cinemafilms.in",
    phone: "+91 99001 12233",
    joined: "10 Mar 2026",
    kycStatus: "VERIFIED",
    bookingsCount: 14,
    totalSpend: 289000,
    status: "ACTIVE",
    lastActive: "3 days ago",
  },
];

const inMemoryCustomers: CustomerRecord[] = [...DEFAULT_CUSTOMERS];

export async function GET(req: NextRequest) {
  try {
    const { user, response } = await verifyApiAuth(req, ["admin", "staff", "super_admin"]);
    if (response || !user) return response!;

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search")?.toLowerCase();
    const statusFilter = searchParams.get("status");

    if (isSupabaseConfigured()) {
      try {
        const supabase = await createServiceSupabaseClient();

        // 1. Fetch customer profiles
        const { data: profiles, error: profileErr } = await supabase
          .from("profiles")
          .select("id, full_name, email, phone, role, created_at, updated_at")
          .in("role", ["customer"])
          .order("created_at", { ascending: false });

        if (!profileErr && profiles && profiles.length > 0) {
          // 2. Fetch all bookings to calculate real spend & bookings count
          const { data: bookings } = await supabase
            .from("bookings")
            .select("id, profile_id, total_payable, payment_status, created_at");

          // 3. Fetch all KYC records
          const { data: kycDocs } = await supabase
            .from("kyc_documents")
            .select("profile_id, status");

          const kycMap = new Map<string, string>();
          (kycDocs || []).forEach((k: any) => {
            if (k.profile_id) kycMap.set(k.profile_id, k.status);
          });

          const spendMap = new Map<string, number>();
          const countMap = new Map<string, number>();

          (bookings || []).forEach((b: any) => {
            if (!b.profile_id) return;
            countMap.set(b.profile_id, (countMap.get(b.profile_id) || 0) + 1);
            if (b.payment_status === "paid" || b.payment_status === "completed") {
              spendMap.set(b.profile_id, (spendMap.get(b.profile_id) || 0) + Number(b.total_payable || 0));
            }
          });

          let mapped: CustomerRecord[] = profiles.map((p: any) => {
            const rawKyc = kycMap.get(p.id);
            let kycStatus: CustomerRecord["kycStatus"] = "UNSUBMITTED";
            if (rawKyc === "approved") kycStatus = "VERIFIED";
            else if (rawKyc === "rejected") kycStatus = "REJECTED";
            else if (rawKyc === "pending" || rawKyc === "submitted") kycStatus = "PENDING";

            return {
              id: p.id,
              name: p.full_name || "Valued Filmmaker",
              email: p.email || "",
              phone: p.phone || "—",
              joined: p.created_at ? new Date(p.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "Recently",
              kycStatus,
              bookingsCount: countMap.get(p.id) || 0,
              totalSpend: spendMap.get(p.id) || 0,
              status: "ACTIVE",
              lastActive: p.updated_at ? new Date(p.updated_at).toLocaleDateString() : "Recently",
            };
          });

          if (search) {
            mapped = mapped.filter(
              (c) =>
                c.name.toLowerCase().includes(search) ||
                c.email.toLowerCase().includes(search) ||
                c.phone.includes(search)
            );
          }

          if (statusFilter && statusFilter !== "ALL") {
            mapped = mapped.filter((c) => c.status === statusFilter);
          }

          return successResponse(mapped, "Customers loaded from database");
        }
      } catch (err) {
        console.warn("[Customers GET] Supabase fallback to memory:", err);
      }
    }

    let results = [...inMemoryCustomers];
    if (search) {
      results = results.filter(
        (c) =>
          c.name.toLowerCase().includes(search) ||
          c.email.toLowerCase().includes(search) ||
          c.phone.includes(search)
      );
    }
    if (statusFilter && statusFilter !== "ALL") {
      results = results.filter((c) => c.status === statusFilter);
    }

    return successResponse(results, "Customers loaded from memory");
  } catch (err: any) {
    console.error("[Customers GET] Error:", err);
    return errorResponse("CUSTOMERS_FETCH_FAILED", err.message || "Failed to load customers", 500);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { user, response } = await verifyApiAuth(req, ["super_admin", "admin"]);
    if (response || !user) return response!;

    const body = await req.json().catch(() => ({}));
    const { id, status } = body;

    if (!id || !status) {
      return errorResponse("MISSING_FIELDS", "Customer ID and target status are required", 400);
    }

    if (!["ACTIVE", "SUSPENDED"].includes(status)) {
      return errorResponse("INVALID_STATUS", "Status must be ACTIVE or SUSPENDED", 400);
    }

    const cIdx = inMemoryCustomers.findIndex((c) => c.id === id);
    if (cIdx !== -1) {
      inMemoryCustomers[cIdx].status = status;
    }

    if (isSupabaseConfigured()) {
      try {
        const supabase = await createServiceSupabaseClient();
        await supabase.from("profiles").update({ updated_at: new Date().toISOString() }).eq("id", id);
      } catch (err) {
        console.warn("[Customers PATCH] Supabase error:", err);
      }
    }

    realtimeHub.broadcast("CUSTOMER_UPDATED", { customerId: id, status }, "admin");

    await recordAuditLog({
      actorId: user.id,
      actorEmail: user.email,
      action: status === "SUSPENDED" ? "SUSPEND_CUSTOMER" : "ACTIVATE_CUSTOMER",
      resource: "profiles",
      resourceId: id,
      metadata: { customerId: id, status, updatedBy: user.email },
    });

    return successResponse({ id, status }, `Customer marked as ${status}`);
  } catch (err: any) {
    console.error("[Customers PATCH] Error:", err);
    return errorResponse("CUSTOMER_UPDATE_FAILED", err.message || "Failed to update customer status", 500);
  }
}
