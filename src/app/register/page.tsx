"use client";

import React, { useState, useEffect } from "react";
import Navbar from "@/components/navigation/Navbar";
import { useCart } from "@/hooks/useCart";
import { useToast } from "@/hooks/useToast";
import { useRouter } from "next/navigation";
import {
  Lock, Mail, User, Phone, CheckCircle, Loader2,
  Eye, EyeOff, ArrowRight, ShieldCheck
} from "lucide-react";
import Link from "next/link";
import { signUpAction } from "@/lib/actions/auth";
import { animate } from "animejs";

export default function RegisterPage() {
  const { cart } = useCart();
  const toast = useToast();
  const router = useRouter();

  const [name, setName]           = useState("");
  const [email, setEmail]         = useState("");
  const [phone, setPhone]         = useState("");
  const [password, setPassword]   = useState("");
  const [confirm, setConfirm]     = useState("");
  const [showPw, setShowPw]       = useState(false);
  const [showCfm, setShowCfm]     = useState(false);
  const [loading, setLoading]     = useState(false);
  const [success, setSuccess]     = useState(false);
  const [needsVerif, setNeedsVerif] = useState(false);

  useEffect(() => {
    animate(".auth-panel", {
      opacity: [0, 1],
      translateY: [24, 0],
      duration: 700,
      easing: "easeOutQuart",
    });
  }, []);

  const pwStrength = (() => {
    if (password.length === 0) return 0;
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    return score;
  })();

  const strengthLabel = ["", "Weak", "Fair", "Good", "Strong"][pwStrength];
  const strengthColor = ["", "bg-rose-500", "bg-amber-500", "bg-teal-500", "bg-emerald-500"][pwStrength];

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirm) {
      toast.error("Passwords do not match.");
      animate(".auth-panel", {
        translateX: [0, -8, 8, -6, 6, 0],
        duration: 500,
        easing: "easeInOutSine",
      });
      return;
    }
    setLoading(true);

    const result = await signUpAction(email, password, name, phone);

    if (result.success) {
      setSuccess(true);
      if (result.needsVerification) {
        setNeedsVerif(true);
      } else {
        toast.success("Account created! Redirecting...");
        setTimeout(() => router.push("/dashboard"), 1500);
      }
    } else {
      toast.error(result.error ?? "Registration failed. Please try again.");
      animate(".auth-panel", {
        translateX: [0, -8, 8, -6, 6, 0],
        duration: 500,
        easing: "easeInOutSine",
      });
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-obsidian text-ivory flex flex-col">
      <Navbar cartItemCount={cart.length} />

      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-gold-champagne/3 blur-[120px]" />
      </div>

      <div className="flex-1 flex items-center justify-center px-6 pt-32 pb-12 relative">
        <div className="auth-panel opacity-0 glass-panel-gold border-gold-border rounded-2xl max-w-sm w-full p-8 shadow-2xl space-y-6">

          {/* Header */}
          <div className="text-center space-y-1.5">
            <div className="w-10 h-10 rounded-full bg-gold-champagne/10 border border-gold-border flex items-center justify-center mx-auto mb-3">
              <User size={16} className="text-gold-champagne" />
            </div>
            <span className="text-[9px] uppercase tracking-[0.2em] text-gold-champagne font-mono block">Club Membership</span>
            <h1 className="serif-heading text-2xl font-light text-ivory">Create AUREVIA Profile</h1>
            <p className="text-[11px] text-muted-gray">Premium camera rental — by Prem</p>
          </div>

          {/* Verification required state */}
          {needsVerif && (
            <div className="p-4 bg-teal-500/10 border border-teal-500/20 rounded-lg space-y-2 text-center">
              <ShieldCheck size={22} className="text-teal-400 mx-auto" />
              <p className="text-teal-400 text-xs font-semibold">Verify your email to continue</p>
              <p className="text-[11px] text-muted-gray leading-relaxed">
                We sent a verification link to <span className="text-ivory font-mono">{email}</span>.
                Click the link in the email to activate your account.
              </p>
              <Link href="/login" className="block mt-2 text-[11px] text-gold-champagne hover:underline">
                Back to Sign In
              </Link>
            </div>
          )}

          {/* Success (no verification required) */}
          {success && !needsVerif && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono rounded-lg flex items-center gap-1.5 justify-center">
              <CheckCircle size={13} /> Profile Created. Redirecting...
            </div>
          )}

          {/* Form */}
          {!needsVerif && (
            <form onSubmit={handleRegister} className="space-y-4">
              {/* Full Name */}
              <div className="space-y-1.5">
                <label className="text-[10px] text-muted-gray uppercase font-mono tracking-wider block">Full Name</label>
                <div className="relative">
                  <User size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-gray pointer-events-none" />
                  <input
                    type="text" required id="reg-name"
                    placeholder="Your full name"
                    value={name} onChange={(e) => setName(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 text-xs rounded-lg p-2.5 pl-8 focus:outline-none focus:border-gold-champagne/50 transition placeholder-white/20"
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <label className="text-[10px] text-muted-gray uppercase font-mono tracking-wider block">Email Address</label>
                <div className="relative">
                  <Mail size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-gray pointer-events-none" />
                  <input
                    type="email" required id="reg-email"
                    placeholder="your@email.com"
                    value={email} onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 text-xs rounded-lg p-2.5 pl-8 focus:outline-none focus:border-gold-champagne/50 transition placeholder-white/20"
                  />
                </div>
              </div>

              {/* Phone */}
              <div className="space-y-1.5">
                <label className="text-[10px] text-muted-gray uppercase font-mono tracking-wider block">Phone Number <span className="text-muted-gray/50">(optional)</span></label>
                <div className="relative">
                  <Phone size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-gray pointer-events-none" />
                  <input
                    type="tel" id="reg-phone"
                    placeholder="+91 98000 00000"
                    value={phone} onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 text-xs rounded-lg p-2.5 pl-8 focus:outline-none focus:border-gold-champagne/50 transition placeholder-white/20"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label className="text-[10px] text-muted-gray uppercase font-mono tracking-wider block">Password</label>
                <div className="relative">
                  <Lock size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-gray pointer-events-none" />
                  <input
                    type={showPw ? "text" : "password"} required id="reg-password"
                    minLength={6} placeholder="Min 6 characters"
                    value={password} onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 text-xs rounded-lg p-2.5 pl-8 pr-10 focus:outline-none focus:border-gold-champagne/50 transition placeholder-white/20"
                  />
                  <button type="button" onClick={() => setShowPw(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-gray hover:text-ivory transition cursor-pointer" tabIndex={-1}>
                    {showPw ? <EyeOff size={13} /> : <Eye size={13} />}
                  </button>
                </div>
                {/* Strength bar */}
                {password.length > 0 && (
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1 flex-1">
                      {[1, 2, 3, 4].map((i) => (
                        <div key={i} className={`h-0.5 flex-1 rounded-full transition-all duration-300 ${i <= pwStrength ? strengthColor : "bg-white/10"}`} />
                      ))}
                    </div>
                    <span className="text-[9px] font-mono text-muted-gray">{strengthLabel}</span>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div className="space-y-1.5">
                <label className="text-[10px] text-muted-gray uppercase font-mono tracking-wider block">Confirm Password</label>
                <div className="relative">
                  <Lock size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-gray pointer-events-none" />
                  <input
                    type={showCfm ? "text" : "password"} required id="reg-confirm"
                    placeholder="Repeat password"
                    value={confirm} onChange={(e) => setConfirm(e.target.value)}
                    className={`w-full bg-white/5 border text-xs rounded-lg p-2.5 pl-8 pr-10 focus:outline-none transition placeholder-white/20 ${confirm.length > 0 && confirm !== password ? "border-rose-500/50 focus:border-rose-500/70" : "border-white/10 focus:border-gold-champagne/50"}`}
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
                type="submit" id="reg-submit"
                disabled={loading || success}
                className="w-full py-3 bg-gold-champagne hover:bg-gold-warm disabled:opacity-60 text-obsidian text-xs font-bold uppercase tracking-wider rounded-lg transition cursor-pointer flex items-center justify-center gap-2 mt-2"
              >
                {loading ? <><Loader2 size={13} className="animate-spin" /> Creating Account...</> : <><ArrowRight size={13} /> Create Account</>}
              </button>
            </form>
          )}

          {/* Footer */}
          {!needsVerif && (
            <p className="text-center text-[11px] text-muted-gray">
              Already a member?{" "}
              <Link href="/login" className="text-gold-champagne hover:underline font-medium">Sign in</Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
