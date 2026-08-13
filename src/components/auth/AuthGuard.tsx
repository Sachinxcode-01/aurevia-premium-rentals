"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUserAction } from "@/lib/actions/auth";
import { db } from "@/lib/db/store";
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
 * edge cases where middleware can't run (e.g., Supabase not configured or local profile fallback).
 */
export function AuthGuard({ children, requiredRole, allowAdmin = true }: AuthGuardProps) {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    let mounted = true;

    // Safety timeout: 2.5 seconds max for session verification so user is never stuck
    const timeoutId = setTimeout(() => {
      if (mounted) {
        console.warn("[AuthGuard] Session check timed out — proceeding");
        setAllowed(true);
        setChecking(false);
      }
    }, 2500);

    const checkAuth = async () => {
      try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
        const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
        const isSupabaseConfigured =
          supabaseUrl.startsWith("https://") &&
          supabaseUrl.includes(".supabase.co") &&
          !supabaseUrl.includes("PLACEHOLDER") &&
          !supabaseUrl.includes("YOUR_") &&
          supabaseKey.length > 20 &&
          !supabaseKey.includes("PLACEHOLDER");

        if (!isSupabaseConfigured) {
          if (mounted) {
            clearTimeout(timeoutId);
            setAllowed(true);
            setChecking(false);
          }
          return;
        }

        // Try getting authenticated user profile from Supabase server action
        const profile = await getCurrentUserAction();

        if (mounted) {
          clearTimeout(timeoutId);

          if (profile) {
            const role = String(profile.role ?? "customer");
            if (requiredRole === "admin" && role !== "admin" && role !== "staff") {
              router.replace("/dashboard");
              setChecking(false);
              return;
            }
            setAllowed(true);
            setChecking(false);
          } else {
            // Check local profile fallback (for demo mode / local guest checkout)
            const localProfile = await db.getProfile().catch(() => null);
            if (localProfile) {
              setAllowed(true);
              setChecking(false);
            } else {
              setChecking(false);
              router.replace("/login");
            }
          }
        }
      } catch (err) {
        if (mounted) {
          clearTimeout(timeoutId);
          setAllowed(true);
          setChecking(false);
        }
      }
    };

    checkAuth();

    return () => {
      mounted = false;
      clearTimeout(timeoutId);
    };
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
