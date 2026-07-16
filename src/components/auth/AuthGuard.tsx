"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUserAction } from "@/lib/actions/auth";
import { Loader2 } from "lucide-react";

interface AuthGuardProps {
  children: React.ReactNode;
  requiredRole?: "admin" | "staff" | "customer" | null;
  /** If true, admin/staff are also allowed (default: false) */
  allowAdmin?: boolean;
}

/**
 * Client-side auth guard — secondary safety net alongside middleware.
 * Middleware handles the primary server-side redirect; this handles
 * edge cases where middleware can't run (e.g., Supabase not configured).
 */
export function AuthGuard({ children, requiredRole, allowAdmin = true }: AuthGuardProps) {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    // If Supabase is not configured, skip auth check (local dev mode)
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
    const isSupabaseConfigured = supabaseUrl.length > 0 && !supabaseUrl.includes("your-project-id");

    if (!isSupabaseConfigured) {
      setAllowed(true);
      setChecking(false);
      return;
    }

    getCurrentUserAction().then((profile) => {
      if (!profile) {
        router.replace("/login");
        return;
      }

      const role = String(profile.role ?? "customer");

      if (requiredRole === "admin" && role !== "admin" && role !== "staff") {
        router.replace("/dashboard");
        return;
      }

      setAllowed(true);
      setChecking(false);
    });
  }, [router, requiredRole]);

  if (checking) {
    return (
      <div className="min-h-screen bg-obsidian flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 size={24} className="animate-spin text-gold-champagne" />
          <p className="text-[11px] text-muted-gray font-mono uppercase tracking-wider">Verifying session...</p>
        </div>
      </div>
    );
  }

  if (!allowed) return null;

  return <>{children}</>;
}
