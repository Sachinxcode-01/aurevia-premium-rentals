import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/lib/api/response";
import { verifyApiAuth, recordAuditLog } from "@/lib/auth/rbac";
import { createServiceSupabaseClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/db/store";
import { sendEmail } from "@/lib/email/mailer";

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

async function sendStaffInviteNotification(email: string, name: string, role: string, adminUrl: string) {
  try {
    await sendEmail({
      to: email,
      subject: `AUREVIA Staff Invitation — ${role.toUpperCase()} Access Granted`,
      html: `
        <div style="background-color: #0c0d0e; color: #f5f1e8; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 40px; border-radius: 12px; max-width: 600px; margin: auto; border: 1px solid rgba(216, 179, 106, 0.2);">
          <div style="text-align: center; margin-bottom: 24px;">
            <h1 style="color: #d8b36a; font-family: serif; letter-spacing: 2px; margin: 0; font-size: 24px;">AUREVIA</h1>
            <p style="color: #9a9995; font-size: 11px; text-transform: uppercase; letter-spacing: 2px; margin-top: 4px;">Executive Cinema Logistics</p>
          </div>
          <p style="font-size: 15px; line-height: 1.6;">Hello <strong>${name}</strong>,</p>
          <p style="font-size: 14px; line-height: 1.6; color: #d4d0c7;">
            You have been granted official administrative credentials to the AUREVIA Operations Terminal with the role:
            <span style="display: inline-block; background: rgba(216, 179, 106, 0.15); color: #d8b36a; border: 1px solid rgba(216, 179, 106, 0.3); padding: 2px 8px; border-radius: 4px; font-weight: bold; font-family: monospace;">${role.toUpperCase()}</span>.
          </p>
          <div style="margin: 32px 0; text-align: center;">
            <a href="${adminUrl}" style="background-color: #d8b36a; color: #0c0d0e; padding: 14px 28px; border-radius: 8px; font-weight: 600; font-size: 14px; text-decoration: none; display: inline-block; letter-spacing: 0.5px;">
              Access Administrative Terminal →
            </a>
          </div>
          <p style="font-size: 12px; color: #9a9995; border-top: 1px solid rgba(255,255,255,0.08); padding-top: 20px; line-height: 1.5;">
            Security Notice: If you did not request this invitation or do not recognize this organization, please contact security@aurevia.com immediately.
          </p>
        </div>
      `,
      text: `Hello ${name},\n\nYou have been granted administrative credentials for AUREVIA Operations with role: ${role.toUpperCase()}.\nAccess the portal at: ${adminUrl}`,
      notificationType: "staff_invitation",
    });
  } catch (err) {
    console.warn("[Staff Email Warning] Failed to dispatch invitation email:", err);
  }
}

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
    const { action, id, name, email, role, phone } = body;

    // Resend invite action
    if (action === "resend_invite") {
      if (!id) {
        return errorResponse("MISSING_ID", "Staff id is required to resend invitation", 400);
      }

      const target = inMemoryStaff.find((s) => s.id === id);
      if (!target) {
        return errorResponse("NOT_FOUND", "Staff member not found", 404);
      }

      const adminUrl = process.env.ADMIN_URL || process.env.NEXT_PUBLIC_ADMIN_URL || "http://localhost:3002";

      if (isSupabaseConfigured()) {
        try {
          const supabase = await createServiceSupabaseClient();
          await supabase.auth.admin.inviteUserByEmail(target.email, {
            data: { role: target.role, full_name: target.name },
          });
        } catch (err) {
          console.warn("[Staff Resend Invite] Supabase invite warning:", err);
        }
      }

      await sendStaffInviteNotification(target.email, target.name, target.role, adminUrl);

      await recordAuditLog({
        actorId: user.id,
        actorEmail: user.email,
        action: "RESEND_STAFF_INVITATION",
        resource: "profiles",
        resourceId: target.id,
        metadata: { targetEmail: target.email, role: target.role },
      });

      return successResponse({ id: target.id, email: target.email }, "Staff invitation re-dispatched successfully");
    }

    // Regular staff creation/invitation
    if (!name || !email || !role) {
      return errorResponse("MISSING_FIELDS", "Name, email, and role are required", 400);
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return errorResponse("INVALID_EMAIL", "A valid email address is required", 400);
    }

    if (!["super_admin", "admin", "staff"].includes(role)) {
      return errorResponse("INVALID_ROLE", "Role must be super_admin, admin, or staff", 400);
    }

    // Role Escalation Protection: Only super_admin can create another admin or super_admin
    if (role !== "staff" && user.role !== "super_admin") {
      return errorResponse("FORBIDDEN_ROLE_ESCALATION", "Only Super Admins can invite admin or super_admin members", 403);
    }

    // Check duplicate email in memory
    const existingMemory = inMemoryStaff.find((s) => s.email.toLowerCase() === email.toLowerCase());
    if (existingMemory) {
      return errorResponse("STAFF_ALREADY_EXISTS", `Staff account with email ${email} already exists`, 409);
    }

    const newStaff: StaffUser = {
      id: `STF-${Math.floor(100 + Math.random() * 900)}`,
      name,
      email: email.toLowerCase(),
      role,
      status: "ACTIVE",
      lastLogin: "Invited",
      phone: phone || "",
      createdAt: new Date().toISOString(),
    };

    const adminUrl = process.env.ADMIN_URL || process.env.NEXT_PUBLIC_ADMIN_URL || "http://localhost:3002";

    if (isSupabaseConfigured()) {
      try {
        const supabase = await createServiceSupabaseClient();
        await supabase.from("profiles").upsert({
          id: newStaff.id,
          full_name: name,
          email: newStaff.email,
          role,
          phone: phone || null,
          created_at: new Date().toISOString(),
        }, { onConflict: "email" });

        // Trigger Supabase Auth invitation if supported
        await supabase.auth.admin.inviteUserByEmail(newStaff.email, {
          data: { role, full_name: name },
        });
      } catch (err) {
        console.warn("[Staff POST] Supabase invite/upsert warning:", err);
      }
    }

    // Send automated email invite via configured SMTP or mock logger
    await sendStaffInviteNotification(newStaff.email, newStaff.name, newStaff.role, adminUrl);

    inMemoryStaff.push(newStaff);

    await recordAuditLog({
      actorId: user.id,
      actorEmail: user.email,
      action: "CREATE_STAFF_MEMBER",
      resource: "profiles",
      resourceId: newStaff.id,
      metadata: { name, email: newStaff.email, role },
    });

    return successResponse(newStaff, "Staff member invited and created successfully");
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

    const sIdx = inMemoryStaff.findIndex((s) => s.id === id);
    const targetStaff = sIdx !== -1 ? inMemoryStaff[sIdx] : null;

    // RBAC Permissions Barrier:
    // 1. Regular admins cannot modify super_admins
    if (targetStaff && targetStaff.role === "super_admin" && user.role !== "super_admin") {
      return errorResponse("FORBIDDEN", "Only Super Admins can modify Super Admin accounts", 403);
    }

    // 2. Regular admins cannot elevate anyone to super_admin
    if (role === "super_admin" && user.role !== "super_admin") {
      return errorResponse("FORBIDDEN", "Only Super Admins can promote accounts to Super Admin", 403);
    }

    // 3. Regular admins cannot modify another admin
    if (targetStaff && targetStaff.role === "admin" && user.role !== "super_admin" && targetStaff.id !== user.id) {
      return errorResponse("FORBIDDEN", "Admins cannot modify other admin credentials", 403);
    }

    // 4. Protect against demoting or deactivating the last active super_admin
    if (targetStaff && targetStaff.role === "super_admin" && (role && role !== "super_admin" || status === "INACTIVE")) {
      const activeSuperAdmins = inMemoryStaff.filter((s) => s.role === "super_admin" && s.status === "ACTIVE" && s.id !== id);
      if (activeSuperAdmins.length === 0) {
        return errorResponse("PROTECTED_SUPER_ADMIN", "Cannot demote or deactivate the only active Super Admin", 400);
      }
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

    const oldRole = targetStaff?.role;
    const oldStatus = targetStaff?.status;

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
      metadata: {
        targetId: id,
        oldRole,
        newRole: role || oldRole,
        oldStatus,
        newStatus: status || oldStatus,
        updatedBy: user.email,
      },
    });

    return successResponse({ id, role: role || oldRole, status: status || oldStatus }, "Staff member permissions updated successfully");
  } catch (err: any) {
    console.error("[Staff PATCH] Error:", err);
    return errorResponse("STAFF_UPDATE_FAILED", err.message || "Failed to update staff member", 500);
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { user, response } = await verifyApiAuth(req, ["super_admin", "admin"]);
    if (response || !user) return response!;

    // Accept id from query string or JSON body
    const searchParams = req.nextUrl.searchParams;
    let id = searchParams.get("id");

    if (!id) {
      const body = await req.json().catch(() => ({}));
      id = body.id;
    }

    if (!id) {
      return errorResponse("MISSING_ID", "Staff ID is required for deletion", 400);
    }

    // 1. Self-Deletion Prevention
    if (user.id === id) {
      return errorResponse("SELF_DELETION_FORBIDDEN", "You cannot delete your own administrative account", 400);
    }

    const sIdx = inMemoryStaff.findIndex((s) => s.id === id);
    const target = sIdx !== -1 ? inMemoryStaff[sIdx] : null;

    if (target && target.email.toLowerCase() === user.email.toLowerCase()) {
      return errorResponse("SELF_DELETION_FORBIDDEN", "You cannot delete your own administrative account", 400);
    }

    // 2. Protected Root Super Admin
    if (id === "STF-01" || (target && target.email === "premmundargi135@gmail.com")) {
      return errorResponse("ROOT_ADMIN_PROTECTED", "The root Super Admin account cannot be deleted", 403);
    }

    // 3. RBAC Barrier
    if (target && target.role === "super_admin") {
      if (user.role !== "super_admin") {
        return errorResponse("FORBIDDEN", "Only Super Admins can remove another Super Admin", 403);
      }
      const remainingSuperAdmins = inMemoryStaff.filter((s) => s.role === "super_admin" && s.id !== id);
      if (remainingSuperAdmins.length === 0) {
        return errorResponse("LAST_SUPER_ADMIN", "Cannot delete the only remaining Super Admin account", 400);
      }
    } else if (target && target.role === "admin" && user.role !== "super_admin") {
      return errorResponse("FORBIDDEN", "Admins cannot delete other administrators", 403);
    }

    // 4. Supabase profile removal/downgrade
    if (isSupabaseConfigured()) {
      try {
        const supabase = await createServiceSupabaseClient();
        // Soft delete: downgrade role to customer or remove profile record
        await supabase.from("profiles").update({ role: "customer" }).eq("id", id);
      } catch (err) {
        console.warn("[Staff DELETE] Supabase downgrade warning:", err);
      }
    }

    // 5. In-memory splice
    if (sIdx !== -1) {
      inMemoryStaff.splice(sIdx, 1);
    }

    // 6. Comprehensive Audit Log
    await recordAuditLog({
      actorId: user.id,
      actorEmail: user.email,
      action: "DELETE_STAFF_MEMBER",
      resource: "profiles",
      resourceId: id,
      metadata: {
        deletedStaffId: id,
        deletedStaffName: target?.name,
        deletedStaffEmail: target?.email,
        deletedStaffRole: target?.role,
        deletedBy: user.email,
      },
    });

    return successResponse({ id, deleted: true }, `Staff member ${target?.name || id} removed successfully`);
  } catch (err: any) {
    console.error("[Staff DELETE] Error:", err);
    return errorResponse("STAFF_DELETE_FAILED", err.message || "Failed to remove staff member", 500);
  }
}
