import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/lib/api/response";
import { verifyApiAuth, recordAuditLog } from "@/lib/auth/rbac";
import { createServiceSupabaseClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/db/store";

export interface StaffUser {
  id: string;
  name: string;
  email: string;
  role: "super_admin" | "admin" | "staff";
  status: "ACTIVE" | "INACTIVE";
  lastLogin: string;
  phone?: string;
  createdAt: string;
}

const DEFAULT_STAFF: StaffUser[] = [
  {
    id: "STF-01",
    name: "Prem Mundargi",
    email: "premmundargi135@gmail.com",
    role: "super_admin",
    status: "ACTIVE",
    lastLogin: "Active Now",
    phone: "+91 91138 27339",
    createdAt: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "STF-02",
    name: "Sachin K",
    email: "sachiii8827@gmail.com",
    role: "admin",
    status: "ACTIVE",
    lastLogin: "2 hours ago",
    phone: "+91 88270 00000",
    createdAt: "2026-01-15T00:00:00.000Z",
  },
];

const inMemoryStaff: StaffUser[] = [...DEFAULT_STAFF];

export async function GET(req: NextRequest) {
  try {
    const { user, response } = await verifyApiAuth(req, ["admin", "staff", "super_admin"]);
    if (response || !user) return response!;

    if (isSupabaseConfigured()) {
      try {
        const supabase = await createServiceSupabaseClient();
        const { data: profiles, error } = await supabase
          .from("profiles")
          .select("id, full_name, email, role, phone, updated_at, created_at")
          .in("role", ["admin", "staff", "super_admin"])
          .order("created_at", { ascending: true });

        if (!error && profiles && profiles.length > 0) {
          const mapped: StaffUser[] = profiles.map((p: any) => ({
            id: p.id,
            name: p.full_name || "Team Member",
            email: p.email || "",
            role: (p.role as any) || "staff",
            status: "ACTIVE",
            lastLogin: p.updated_at ? new Date(p.updated_at).toLocaleDateString() : "Recently",
            phone: p.phone || "",
            createdAt: p.created_at || new Date().toISOString(),
          }));
          return successResponse(mapped);
        }
      } catch (err) {
        console.warn("[Staff GET] Supabase fallback to memory:", err);
      }
    }

    return successResponse(inMemoryStaff);
  } catch (err: any) {
    console.error("[Staff GET] Error:", err);
    return errorResponse("STAFF_FETCH_FAILED", err.message || "Failed to load staff list", 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const { user, response } = await verifyApiAuth(req, ["super_admin", "admin"]);
    if (response || !user) return response!;

    const body = await req.json().catch(() => ({}));
    const { name, email, role, phone } = body;

    if (!name || !email || !role) {
      return errorResponse("MISSING_FIELDS", "Name, email, and role are required", 400);
    }

    if (!["super_admin", "admin", "staff"].includes(role)) {
      return errorResponse("INVALID_ROLE", "Role must be super_admin, admin, or staff", 400);
    }

    const newStaff: StaffUser = {
      id: `STF-${Math.floor(100 + Math.random() * 900)}`,
      name,
      email,
      role,
      status: "ACTIVE",
      lastLogin: "Invited",
      phone: phone || "",
      createdAt: new Date().toISOString(),
    };

    if (isSupabaseConfigured()) {
      try {
        const supabase = await createServiceSupabaseClient();
        await supabase.from("profiles").upsert({
          id: newStaff.id,
          full_name: name,
          email,
          role,
          phone: phone || null,
          created_at: new Date().toISOString(),
        }, { onConflict: "email" });
      } catch (err) {
        console.warn("[Staff POST] Supabase insert warning:", err);
      }
    }

    inMemoryStaff.push(newStaff);

    await recordAuditLog({
      actorId: user.id,
      actorEmail: user.email,
      action: "CREATE_STAFF_MEMBER",
      resource: "profiles",
      resourceId: newStaff.id,
      metadata: { name, email, role },
    });

    return successResponse(newStaff, "Staff member invited/created successfully");
  } catch (err: any) {
    console.error("[Staff POST] Error:", err);
    return errorResponse("STAFF_CREATE_FAILED", err.message || "Failed to create staff member", 500);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { user, response } = await verifyApiAuth(req, ["super_admin", "admin"]);
    if (response || !user) return response!;

    const body = await req.json().catch(() => ({}));
    const { id, role, status } = body;

    if (!id) {
      return errorResponse("MISSING_ID", "Staff id is required", 400);
    }

    if (isSupabaseConfigured()) {
      try {
        const supabase = await createServiceSupabaseClient();
        const updateData: any = {};
        if (role) updateData.role = role;
        if (Object.keys(updateData).length > 0) {
          await supabase.from("profiles").update(updateData).eq("id", id);
        }
      } catch (err) {
        console.warn("[Staff PATCH] Supabase error:", err);
      }
    }

    const sIdx = inMemoryStaff.findIndex((s) => s.id === id);
    if (sIdx !== -1) {
      if (role) inMemoryStaff[sIdx].role = role;
      if (status) inMemoryStaff[sIdx].status = status;
    }

    await recordAuditLog({
      actorId: user.id,
      actorEmail: user.email,
      action: "UPDATE_STAFF_STATUS",
      resource: "profiles",
      resourceId: id,
      metadata: { role, status },
    });

    return successResponse({ id, role, status }, "Staff member permissions updated");
  } catch (err: any) {
    console.error("[Staff PATCH] Error:", err);
    return errorResponse("STAFF_UPDATE_FAILED", err.message || "Failed to update staff member", 500);
  }
}
