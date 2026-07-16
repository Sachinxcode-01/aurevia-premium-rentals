"use client";

import React, { useState, useEffect } from "react";
import Navbar from "@/components/navigation/Navbar";
import { useCart } from "@/hooks/useCart";
import { useToast } from "@/hooks/useToast";
import { Mail, ArrowRight, Loader2, CheckCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { forgotPasswordAction } from "@/lib/actions/auth";
import { animate } from "animejs";

export default function ForgotPasswordPage() {
  const { cart } = useCart();
  const toast = useToast();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    animate(".auth-panel", {
      opacity: [0, 1],
      translateY: [24, 0],
      duration: 700,
      easing: "easeOutQuart",
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const result = await forgotPasswordAction(email);
    setLoading(false);
    if (result.success) {
      setSent(true);
    } else {
      toast.error(result.error ?? "Failed to send reset email.");
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
              <Mail size={16} className="text-gold-champagne" />
            </div>
            <span className="text-[9px] uppercase tracking-[0.2em] text-gold-champagne font-mono block">Account Recovery</span>
            <h1 className="serif-heading text-2xl font-light text-ivory">Reset Password</h1>
            <p className="text-[11px] text-muted-gray leading-relaxed">
              Enter your email and we&apos;ll send a secure reset link to your inbox.
            </p>
          </div>

          {sent ? (
            <div className="space-y-4 text-center">
              <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto">
                <CheckCircle size={24} className="text-emerald-400" />
              </div>
              <div>
                <p className="text-sm font-semibold text-ivory mb-1">Check your inbox</p>
                <p className="text-[11px] text-muted-gray leading-relaxed">
                  We sent a password reset link to{" "}
                  <span className="font-mono text-ivory">{email}</span>.
                  The link expires in 1 hour.
                </p>
              </div>
              <p className="text-[11px] text-muted-gray/60">
                Didn&apos;t receive it? Check your spam folder or{" "}
                <button onClick={() => setSent(false)} className="text-gold-champagne hover:underline cursor-pointer">
                  try again
                </button>.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] text-muted-gray uppercase font-mono tracking-wider block">Email Address</label>
                <div className="relative">
                  <Mail size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-gray pointer-events-none" />
                  <input
                    type="email" required id="forgot-email"
                    value={email} onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="w-full bg-white/5 border border-white/10 text-xs rounded-lg p-2.5 pl-8 focus:outline-none focus:border-gold-champagne/50 transition placeholder-white/20"
                  />
                </div>
              </div>
              <button
                type="submit" id="forgot-submit"
                disabled={loading}
                className="w-full py-3 bg-gold-champagne hover:bg-gold-warm disabled:opacity-60 text-obsidian text-xs font-bold uppercase tracking-wider rounded-lg transition cursor-pointer flex items-center justify-center gap-2"
              >
                {loading ? <><Loader2 size={13} className="animate-spin" /> Sending...</> : <><ArrowRight size={13} /> Send Reset Link</>}
              </button>
            </form>
          )}

          <div className="text-center">
            <Link href="/login" className="text-[11px] text-muted-gray hover:text-gold-champagne transition flex items-center justify-center gap-1">
              <ArrowLeft size={11} /> Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
