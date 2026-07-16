"use client";

import React, { useState, useEffect } from "react";
import Navbar from "@/components/navigation/Navbar";
import { useCart } from "@/hooks/useCart";
import { useToast } from "@/hooks/useToast";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Lock, Mail, CheckCircle, Loader2, Eye, EyeOff,
  ShieldAlert, ArrowRight, RefreshCw
} from "lucide-react";
import Link from "next/link";
import { signInAction, resendVerificationAction } from "@/lib/actions/auth";
import { animate } from "animejs";

export default function LoginPage() {
  const { cart } = useCart();
  const toast = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw]     = useState(false);
  const [loading, setLoading]   = useState(false);
  const [success, setSuccess]   = useState(false);
  const [needsVerif, setNeedsVerif] = useState(false);
  const [resending, setResending]   = useState(false);
  const [resent, setResent]         = useState(false);

  const redirectPath = searchParams.get("redirect") ?? "";
  const verificationError = searchParams.get("error") === "verification_failed";

  useEffect(() => {
    animate(".auth-panel", {
      opacity: [0, 1],
      translateY: [24, 0],
      duration: 700,
      easing: "easeOutQuart",
    });
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setNeedsVerif(false);

    const result = await signInAction(email, password);

    if (result.success) {
      setSuccess(true);
      toast.success("Welcome back to AUREVIA.");
      setTimeout(() => {
        const dest = redirectPath || (result.role === "admin" || result.role === "staff" ? "/admin" : "/dashboard");
        router.push(dest);
      }, 800);
    } else {
      if (result.needsVerification) {
        setNeedsVerif(true);
      } else {
        toast.error(result.error ?? "Sign-in failed.");
        // Shake animation on error
        animate(".auth-panel", {
          translateX: [0, -8, 8, -6, 6, -4, 4, 0],
          duration: 500,
          easing: "easeInOutSine",
        });
      }
    }
    setLoading(false);
  };

  const handleResend = async () => {
    if (!email) { toast.error("Enter your email address first."); return; }
    setResending(true);
    const result = await resendVerificationAction(email);
    setResending(false);
    if (result.success) { setResent(true); toast.success("Verification email resent!"); }
    else toast.error(result.error ?? "Failed to resend.");
  };

  return (
    <div className="min-h-screen bg-obsidian text-ivory flex flex-col">
      <Navbar cartItemCount={cart.length} />

      {/* Background decoration */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-gold-champagne/3 blur-[120px]" />
      </div>

      <div className="flex-1 flex items-center justify-center px-6 pt-36 pb-12 relative">
        <div className="auth-panel opacity-0 glass-panel-gold border-gold-border rounded-2xl max-w-sm w-full p-8 shadow-2xl space-y-6">

          {/* Header */}
          <div className="text-center space-y-1.5">
            <div className="w-10 h-10 rounded-full bg-gold-champagne/10 border border-gold-border flex items-center justify-center mx-auto mb-3">
              <Lock size={16} className="text-gold-champagne" />
            </div>
            <span className="text-[9px] uppercase tracking-[0.2em] text-gold-champagne font-mono block">Vault Access</span>
            <h1 className="serif-heading text-2xl font-light text-ivory">Sign In to AUREVIA</h1>
            <p className="text-[11px] text-muted-gray">Premium camera rental platform by Prem</p>
          </div>

          {/* Verification error from callback */}
          {verificationError && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-mono rounded-lg flex items-start gap-2">
              <ShieldAlert size={13} className="shrink-0 mt-0.5" />
              Email verification link expired or invalid. Please request a new one.
            </div>
          )}

          {/* Needs verification banner */}
          {needsVerif && (
            <div className="p-3.5 bg-amber-500/10 border border-amber-500/20 rounded-lg space-y-2.5">
              <div className="flex items-start gap-2 text-amber-400 text-xs font-mono">
                <ShieldAlert size={13} className="shrink-0 mt-0.5" />
                <span>Your email is not verified yet. Check your inbox for the verification link.</span>
              </div>
              <button
                onClick={handleResend}
                disabled={resending || resent}
                className="w-full py-1.5 border border-amber-500/30 text-amber-400 text-[10px] font-mono uppercase tracking-wider rounded hover:bg-amber-500/10 transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {resending ? <><Loader2 size={10} className="animate-spin" /> Resending...</> : resent ? <><CheckCircle size={10} /> Sent! Check inbox</> : <><RefreshCw size={10} /> Resend Verification Email</>}
              </button>
            </div>
          )}

          {/* Success */}
          {success && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono rounded-lg flex items-center gap-1.5 justify-center">
              <CheckCircle size={13} />
              Authentication success. Redirecting...
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] text-muted-gray uppercase font-mono tracking-wider block">Email Address</label>
              <div className="relative">
                <Mail size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-gray pointer-events-none" />
                <input
                  type="email"
                  required
                  id="login-email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full bg-white/5 border border-white/10 text-xs rounded-lg p-2.5 pl-8 focus:outline-none focus:border-gold-champagne/50 focus:bg-white/8 transition placeholder-white/20"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-[10px] text-muted-gray uppercase font-mono tracking-wider">Password</label>
                <Link href="/forgot-password" className="text-[10px] text-gold-champagne/70 hover:text-gold-champagne transition font-mono">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-gray pointer-events-none" />
                <input
                  type={showPw ? "text" : "password"}
                  required
                  id="login-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-white/5 border border-white/10 text-xs rounded-lg p-2.5 pl-8 pr-10 focus:outline-none focus:border-gold-champagne/50 focus:bg-white/8 transition placeholder-white/20"
                />
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-gray hover:text-ivory transition cursor-pointer"
                  tabIndex={-1}
                >
                  {showPw ? <EyeOff size={13} /> : <Eye size={13} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              id="login-submit"
              disabled={loading || success}
              className="w-full py-3 bg-gold-champagne hover:bg-gold-warm disabled:opacity-60 text-obsidian text-xs font-bold uppercase tracking-wider rounded-lg transition cursor-pointer flex items-center justify-center gap-2 mt-2"
            >
              {loading
                ? <><Loader2 size={13} className="animate-spin" /> Signing In...</>
                : <><ArrowRight size={13} /> Sign In</>
              }
            </button>
          </form>

          {/* Footer */}
          <div className="text-center text-[11px] text-muted-gray space-y-1.5 pt-1">
            <p>
              New to AUREVIA?{" "}
              <Link href="/register" className="text-gold-champagne hover:underline font-medium">
                Create account
              </Link>
            </p>
            <p className="text-[10px] text-muted-gray/50">
              Protected by Supabase Auth · AUREVIA © 2026
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
