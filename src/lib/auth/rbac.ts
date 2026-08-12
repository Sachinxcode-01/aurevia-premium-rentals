import { NextRequest } from "next/server";
import { createServerSupabaseClient, createServiceSupabaseClient } from "../supabase/server";
import { errorResponse } from "../api/response";

export type UserRole = "customer" | "staff" | "admin" | "super_admin";

export interface AuthenticatedUser {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  phone?: string;
}

export async function verifyApiAuth(
  req: NextRequest,
  allowedRoles?: UserRole[]
): Promise<{ user: AuthenticatedUser | null; response: ReturnType<typeof errorResponse> | null }> {
  try {
    const supabase = await createServerSupabaseClient();
    
    // 1. Get user from current session cookie or Bearer token
    let authUser = null;
    const authHeader = req.headers.get("authorization");
    
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];
      const { data, error } = await supabase.auth.getUser(token);
      if (!error && data.user) {
        authUser = data.user;
      }
    }

    if (!authUser) {
      const { data, error } = await supabase.auth.getUser();
      if (!error && data.user) {
        authUser = data.user;
      }
    }

    if (!authUser) {
      return {
        user: null,
        response: errorResponse("UNAUTHORIZED", "Authentication required to access this resource", 401),
      };
    }

    // 2. Fetch full profile to verify role
    const serviceClient = await createServiceSupabaseClient();
    const { data: profile } = await serviceClient
      .from("profiles")
      .select("id, email, full_name, role, phone")
      .eq("id", authUser.id)
      .single();

    if (!profile) {
      // Fallback if profile row isn't initialized yet
      const defaultRole: UserRole = (authUser.user_metadata?.role as UserRole) || "customer";
      const user: AuthenticatedUser = {
        id: authUser.id,
        email: authUser.email || "",
        fullName: authUser.user_metadata?.full_name || "User",
        role: defaultRole,
        phone: authUser.phone,
      };

      if (allowedRoles && !allowedRoles.includes(user.role)) {
        return {
          user: null,
          response: errorResponse("FORBIDDEN", "Insufficient permissions to perform this action", 403),
        };
      }

      return { user, response: null };
    }

    const user: AuthenticatedUser = {
      id: profile.id,
      email: profile.email,
      fullName: profile.full_name || "User",
      role: (profile.role as UserRole) || "customer",
      phone: profile.phone,
    };

    // 3. Verify Role Requirements
    if (allowedRoles && allowedRoles.length > 0) {
      // super_admin has access to everything
      const hasPermission =
        user.role === "super_admin" || allowedRoles.includes(user.role);

      if (!hasPermission) {
        return {
          user: null,
          response: errorResponse(
            "FORBIDDEN",
            `Role '${user.role}' is not authorized for this route`,
            403
          ),
        };
      }
    }

    return { user, response: null };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Authentication error";
    console.error("Auth verification error:", errorMsg);
    return {
      user: null,
      response: errorResponse("INTERNAL_AUTH_ERROR", "Failed to verify authentication credentials", 500),
    };
  }
}

/** Record Audit Log Event in database */
export async function recordAuditLog(params: {
  actorId?: string;
  actorEmail?: string;
  action: string;
  resource: string;
  resourceId?: string;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
}) {
  try {
    const serviceClient = await createServiceSupabaseClient();
    await serviceClient.from("audit_logs").insert({
      actor_id: params.actorId || null,
      actor_email: params.actorEmail || "system",
      action: params.action,
      resource: params.resource,
      resource_id: params.resourceId || null,
      metadata: params.metadata || {},
      ip_address: params.ipAddress || "0.0.0.0",
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Audit log error";
    console.error("Failed to write audit log:", errorMsg);
  }
}
