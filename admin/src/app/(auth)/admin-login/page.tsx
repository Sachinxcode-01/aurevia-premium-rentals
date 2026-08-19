"use client";

import React, { useState, useEffect, Suspense } from "react";
import { ShieldCheck, Lock, Mail, ArrowRight, Loader2, AlertTriangle } from "lucide-react";
import { motion } from "motion/react";
import { useRouter, useSearchParams } from "next/navigation";
import { adminSignInWithPasswordAction, adminSignInWithGoogleAction } from "@/lib/actions/adminAuth";
import { AdminLogo } from "@/components/ui/AdminLogo";

function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const errParam = searchParams.get("error");
    if (errParam === "unauthorized") {
      setError("Session expired or unauthorized. Please sign in with an administrative account.");
    } else if (errParam === "insufficient_permissions" || errParam === "access_denied") {
      setError("Access Denied: Your account does not have administrative privileges.");
    } else if (errParam) {
      setError(decodeURIComponent(errParam));
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (!email.includes("@")) {
        throw new Error("Please enter a valid administrative email address.");
      }
      if (password.length < 6) {
        throw new Error("Password must be at least 6 characters.");
      }

      const res = await adminSignInWithPasswordAction(email, password);

      if (!res.success) {
        throw new Error(res.error || "Invalid administrative credentials.");
      }

      router.push("/");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Invalid administrative credentials.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    setError(null);

    try {
      const res = await adminSignInWithGoogleAction();
      if (!res.success || !res.url) {
        throw new Error(res.error || "Failed to initiate Google Admin authentication.");
      }
      window.location.href = res.url;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Google authentication error.";
      setError(msg);
      setGoogleLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="relative z-10 w-full max-w-md bg-[#121212]/90 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl space-y-6"
    >
      {/* Header */}
      <div className="text-center flex flex-col items-center space-y-3 pb-1">
        <AdminLogo variant="wordmark" width={150} height={38} className="my-1" />
        <div className="space-y-1">
          <h1 className="text-xs font-mono tracking-widest text-[#d8b36a] font-bold uppercase">
            ENTERPRISE SECURITY &amp; OPERATIONS TERMINAL
          </h1>
          <p className="text-[11px] text-[#9a9995] font-light">
            AUREVIA Concierge Operations &amp; Fleet Control Center
          </p>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5 leading-relaxed"
        >
          <AlertTriangle size={16} className="shrink-0 text-rose-400 mt-0.5" />
          <span>{error}</span>
        </motion.div>
      )}

      {/* Google Login Button */}
      <button
        type="button"
        onClick={handleGoogleSignIn}
        disabled={googleLoading || loading}
        className="w-full py-3 px-4 bg-white/5 hover:bg-white/10 border border-white/15 rounded-xl text-xs font-mono text-white font-semibold flex items-center justify-center gap-3 transition cursor-pointer disabled:opacity-50"
      >
        {googleLoading ? (
          <Loader2 size={16} className="animate-spin text-[#d8b36a]" />
        ) : (
          <svg className="w-4 h-4" viewBox="0 0 24 24">
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
        )}
        <span>SIGN IN WITH GOOGLE ADMIN</span>
      </button>

      <div className="flex items-center gap-3">
        <div className="h-px bg-white/10 flex-1" />
        <span className="text-[10px] font-mono uppercase text-gray-500 tracking-wider">or sign in with password</span>
        <div className="h-px bg-white/10 flex-1" />
      </div>

      {/* Email + Password Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-[11px] font-mono text-[#9a9995] uppercase tracking-wider">
            Administrative Email
          </label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9a9995]" size={16} />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@aurevia.com"
              className="w-full bg-[#070707] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-[#f5f1e8] placeholder-[#9a9995]/50 focus:outline-none focus:border-[#d8b36a]/60 transition"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-[11px] font-mono text-[#9a9995] uppercase tracking-wider">
            Security Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9a9995]" size={16} />
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full bg-[#070707] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-[#f5f1e8] placeholder-[#9a9995]/50 focus:outline-none focus:border-[#d8b36a]/60 transition"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || googleLoading}
          className="w-full mt-2 bg-[#d8b36a] hover:bg-[#b98a43] text-[#070707] font-semibold text-xs py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition duration-200 shadow-lg shadow-[#d8b36a]/10 disabled:opacity-50 cursor-pointer"
        >
          {loading ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              <span>AUTHENTICATING SERVER SESSION...</span>
            </>
          ) : (
            <>
              <span>SIGN IN SECURELY</span>
              <ArrowRight size={14} />
            </>
          )}
        </button>
      </form>

      {/* Footer Security Badges & Quick Demo Fill */}
      <div className="space-y-2 pt-4 border-t border-white/5">
        <button
          type="button"
          onClick={() => {
            setEmail("premmundargi135@gmail.com");
            setPassword("AureviaAdmin@2026");
          }}
          className="w-full py-2 px-3 bg-[#070707] hover:bg-white/5 border border-[#d8b36a]/30 rounded-xl text-left text-[11px] font-mono text-[#d8b36a] flex items-center justify-between cursor-pointer transition"
        >
          <span>Fill Admin Credentials (Prem)</span>
          <span className="text-[10px] text-white/50">Click to fill</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setEmail("sachiii8827@gmail.com");
            setPassword("AureviaStaff@2026");
          }}
          className="w-full py-2 px-3 bg-[#070707] hover:bg-white/5 border border-white/10 rounded-xl text-left text-[11px] font-mono text-[#9a9995] flex items-center justify-between cursor-pointer transition"
        >
          <span>Fill Staff Credentials (Sachin)</span>
          <span className="text-[10px] text-white/50">Click to fill</span>
        </button>

        <div className="flex items-center justify-between text-[10px] font-mono text-[#9a9995]/60 pt-1">
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            RBAC &amp; RATE-LIMIT PROTECTED
          </span>
          <span>SSL 256-BIT ENCRYPTED</span>
        </div>
      </div>
    </motion.div>
  );
}

export default function AdminLoginPage() {
  return (
    <div className="relative min-h-screen bg-[#070707] text-[#f5f1e8] flex items-center justify-center p-4 overflow-hidden">
      {/* Ambient background lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-[#d8b36a]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-[#b98a43]/5 rounded-full blur-3xl pointer-events-none" />

      {/* Decorative Grid Lines */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />

      <Suspense fallback={
        <div className="p-8 bg-[#121212] rounded-2xl border border-white/10 text-center font-mono text-xs text-gray-400">
          <Loader2 size={24} className="animate-spin text-[#d8b36a] mx-auto mb-2" />
          Loading Admin Security Terminal...
        </div>
      }>
        <AdminLoginForm />
      </Suspense>
    </div>
  );
}
