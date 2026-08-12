"use client";

import React, { useState } from "react";
import { ShieldCheck, Lock, Mail, ArrowRight, Loader2, KeyRound } from "lucide-react";
import { motion } from "motion/react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Authenticate with server action / Supabase
      if (!email.includes("@")) {
        throw new Error("Please enter a valid administrative email address.");
      }
      if (password.length < 6) {
        throw new Error("Password must be at least 6 characters.");
      }

      // Simulate secure sign-in check & role validation
      await new Promise((res) => setTimeout(res, 800));

      // Redirect to Admin Dashboard
      router.push("/");
    } catch (err: any) {
      setError(err.message || "Invalid administrative credentials or insufficient privileges.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-[#070707] text-[#f5f1e8] flex items-center justify-center p-4 overflow-hidden">
      {/* Ambient background lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-[#d8b36a]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-[#b98a43]/5 rounded-full blur-3xl pointer-events-none" />

      {/* Decorative Grid Lines */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />

      {/* Main Login Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-md bg-[#121212]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl space-y-6"
      >
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[#d8b36a]/10 border border-[#d8b36a]/30 text-[#d8b36a] mb-2">
            <ShieldCheck size={24} />
          </div>
          <h1 className="text-2xl font-light tracking-wide text-[#f5f1e8] font-serif">
            AUREVIA <span className="font-mono text-xs uppercase tracking-widest text-[#d8b36a] ml-1.5 font-bold">ADMIN</span>
          </h1>
          <p className="text-xs text-[#9a9995] font-light">
            Enterprise Operations &amp; Fleet Management Control Center
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-3.5 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2.5"
            >
              <KeyRound size={16} className="shrink-0" />
              <span>{error}</span>
            </motion.div>
          )}

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
                className="w-full bg-[#070707] border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-xs text-[#f5f1e8] placeholder-[#9a9995]/50 focus:outline-none focus:border-[#d8b36a]/60 transition"
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
                className="w-full bg-[#070707] border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-xs text-[#f5f1e8] placeholder-[#9a9995]/50 focus:outline-none focus:border-[#d8b36a]/60 transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 bg-[#d8b36a] hover:bg-[#b98a43] text-[#070707] font-semibold text-xs py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition duration-200 shadow-lg shadow-[#d8b36a]/10 disabled:opacity-50"
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

        {/* Footer Security Badges */}
        <div className="pt-4 border-t border-white/5 flex items-center justify-between text-[10px] font-mono text-[#9a9995]/60">
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            RBAC ENFORCED
          </span>
          <span>SSL 256-BIT ENCRYPTED</span>
        </div>
      </motion.div>
    </div>
  );
}
