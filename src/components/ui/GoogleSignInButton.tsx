"use client";

import React, { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/hooks/useToast";
import { Loader2 } from "lucide-react";

interface GoogleSignInButtonProps {
  redirectPath?: string;
  className?: string;
  label?: string;
}

export function GoogleSignInButton({
  redirectPath,
  className = "",
  label = "Continue with Google",
}: GoogleSignInButtonProps) {
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      const supabase = createClient();

      const callbackPath = redirectPath
        ? `/auth/callback?next=${encodeURIComponent(redirectPath)}`
        : `/auth/callback`;

      const redirectTo = `${window.location.origin}${callbackPath}`;

      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo,
          queryParams: {
            access_type: "offline",
            prompt: "consent",
          },
        },
      });

      if (error) {
        setLoading(false);
        toast.error("Unable to sign in with Google. Please try again.");
        console.error("Google Auth Error:", error.message);
      }
    } catch (err: unknown) {
      setLoading(false);
      const msg = err instanceof Error ? err.message : "Google Auth failed";
      toast.error("Unable to sign in with Google. Please try again.");
      console.error("Google Auth Exception:", msg);
    }
  };

  return (
    <button
      type="button"
      onClick={handleGoogleSignIn}
      disabled={loading}
      className={`w-full py-3 px-4 bg-[#121214] hover:bg-white/10 border border-white/10 hover:border-gold-champagne/40 text-ivory text-xs font-semibold rounded-lg transition-all duration-200 cursor-pointer flex items-center justify-center gap-3 disabled:opacity-60 disabled:cursor-not-allowed shadow-md shadow-black/40 group ${className}`}
    >
      {loading ? (
        <>
          <Loader2 size={16} className="animate-spin text-gold-champagne" />
          <span>Signing in with Google...</span>
        </>
      ) : (
        <>
          <svg className="w-4 h-4 shrink-0 transition-transform duration-200 group-hover:scale-110" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span className="tracking-wide">{label}</span>
        </>
      )}
    </button>
  );
}
