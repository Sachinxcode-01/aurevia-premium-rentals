"use client";

import React, { useState, useEffect, Suspense } from "react";
import Navbar from "@/components/navigation/Navbar";
import { useCart } from "@/hooks/useCart";
import { useToast } from "@/hooks/useToast";
import { useRouter } from "next/navigation";
import { Lock, Eye, EyeOff, CheckCircle, Loader2, ArrowRight } from "lucide-react";
import Link from "next/link";
import { resetPasswordAction } from "@/lib/actions/auth";
import { animate } from "animejs";

function ResetPasswordForm() {
  const { cart } = useCart();
  const toast = useToast();
  const router = useRouter();

  const [password, setPassword]   = useState("");
  const [confirm, setConfirm]     = useState("");
  const [showPw, setShowPw]       = useState(false);
  const [showCfm, setShowCfm]     = useState(false);
  const [loading, setLoading]     = useState(false);
  const [success, setSuccess]     = useState(false);

  useEffect(() => {
    animate(".auth-panel", {
      opacity: [0, 1],
      translateY: [24, 0],
      duration: 700,
      easing: "easeOutQuart",
    });
  }, []);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) { toast.error("Password must be at least 6 characters."); return; }
    if (password !== confirm) { toast.error("Passwords do not match."); return; }

    setLoading(true);
    const result = await resetPasswordAction(password);
    setLoading(false);

    if (result.success) {
      setSuccess(true);
      toast.success("Password reset successfully!");
      setTimeout(() => router.push("/login"), 2000);
    } else {
      toast.error(result.error ?? "Failed to reset password.");
    }
  };

  return (
    <div className="min-h-screen bg-obsidian text-ivory flex flex-col">
      <Navbar cartItemCount={cart.length} />

      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-gold-champagne/3 blur-[100px]" />
      </div>

      <div className="flex-1 flex items-center justify-center px-6 pt-36 pb-12 relative">
        <div className="auth-panel opacity-0 glass-panel-gold border-gold-border rounded-2xl max-w-sm w-full p-8 shadow-2xl space-y-6">

          <div className="text-center space-y-1.5">
            <div className="w-10 h-10 rounded-full bg-gold-champagne/10 border border-gold-border flex items-center justify-center mx-auto mb-3">
              <Lock size={16} className="text-gold-champagne" />
            </div>
            <span className="text-[9px] uppercase tracking-[0.2em] text-gold-champagne font-mono block">New Credentials</span>
            <h1 className="serif-heading text-2xl font-light text-ivory">Set New Password</h1>
            <p className="text-[11px] text-muted-gray">Choose a strong password for your AUREVIA account.</p>
          </div>

          {success ? (
            <div className="text-center space-y-3 py-4">
              <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto">
                <CheckCircle size={24} className="text-emerald-400" />
              </div>
              <p className="text-sm font-semibold text-emerald-400">Password Updated!</p>
              <p className="text-[11px] text-muted-gray">Redirecting to sign in...</p>
            </div>
          ) : (
            <form onSubmit={handleReset} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] text-muted-gray uppercase font-mono tracking-wider block">New Password</label>
                <div className="relative">
                  <Lock size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-gray pointer-events-none" />
                  <input
                    type={showPw ? "text" : "password"} required id="reset-password"
                    minLength={6} placeholder="Min 6 characters"
                    value={password} onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 text-xs rounded-lg p-2.5 pl-8 pr-10 focus:outline-none focus:border-gold-champagne/50 transition placeholder-white/20"
                  />
                  <button type="button" onClick={() => setShowPw(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-gray hover:text-ivory transition cursor-pointer" tabIndex={-1}>
                    {showPw ? <EyeOff size={13} /> : <Eye size={13} />}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] text-muted-gray uppercase font-mono tracking-wider block">Confirm Password</label>
                <div className="relative">
                  <Lock size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-gray pointer-events-none" />
                  <input
                    type={showCfm ? "text" : "password"} required id="reset-confirm"
                    placeholder="Repeat password"
                    value={confirm} onChange={(e) => setConfirm(e.target.value)}
                    className={`w-full bg-white/5 border text-xs rounded-lg p-2.5 pl-8 pr-10 focus:outline-none transition placeholder-white/20 ${confirm.length > 0 && confirm !== password ? "border-rose-500/50" : "border-white/10 focus:border-gold-champagne/50"}`}
                  />
                  <button type="button" onClick={() => setShowCfm(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-gray hover:text-ivory transition cursor-pointer" tabIndex={-1}>
                    {showCfm ? <EyeOff size={13} /> : <Eye size={13} />}
                  </button>
                </div>
                {confirm.length > 0 && confirm !== password && (
                  <p className="text-[10px] text-rose-400 font-mono">Passwords do not match</p>
                )}
              </div>

              <button
                type="submit" id="reset-submit"
                disabled={loading}
                className="w-full py-3 bg-gold-champagne hover:bg-gold-warm disabled:opacity-60 text-obsidian text-xs font-bold uppercase tracking-wider rounded-lg transition cursor-pointer flex items-center justify-center gap-2"
              >
                {loading ? <><Loader2 size={13} className="animate-spin" /> Updating...</> : <><ArrowRight size={13} /> Set New Password</>}
              </button>
            </form>
          )}

          <div className="text-center">
            <Link href="/login" className="text-[11px] text-muted-gray hover:text-gold-champagne transition">
              Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordForm />
    </Suspense>
  );
}
