"use client";

import React, { useState, useEffect } from "react";
import Navbar from "@/components/navigation/Navbar";
import { useCart } from "@/hooks/useCart";
import { useToast } from "@/hooks/useToast";
import { useRouter } from "next/navigation";
import { Mail, ArrowRight, Loader2, CheckCircle, ArrowLeft, KeyRound, Lock, Eye, EyeOff, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { sendResetOTPAction, verifyOTPAndResetPasswordAction } from "@/lib/actions/auth";
import { animate } from "animejs";

export default function ForgotPasswordPage() {
  const { cart } = useCart();
  const toast = useToast();
  const router = useRouter();

  const [step, setStep] = useState<"request" | "verify">("request");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [showCfm, setShowCfm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    animate(".auth-panel", {
      opacity: [0, 1],
      translateY: [24, 0],
      duration: 700,
      easing: "easeOutQuart",
    });
  }, [step]);

  // Step 1: Send OTP to Email
  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      toast.error("Please enter a valid email address.");
      return;
    }

    setLoading(true);
    const result = await sendResetOTPAction(email);
    setLoading(false);

    if (result.success) {
      toast.success("6-digit verification code sent to your email!");
      setStep("verify");
    } else {
      toast.error(result.error ?? "Failed to send verification email.");
    }
  };

  // Step 2: Verify OTP & Reset Password Directly on Website
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || otp.length < 6) {
      toast.error("Please enter the 6-digit OTP code sent to your email.");
      return;
    }

    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    setLoading(true);
    const result = await verifyOTPAndResetPasswordAction(email, otp, newPassword);
    setLoading(false);

    if (result.success) {
      setSuccess(true);
      toast.success("Password updated successfully!");
      setTimeout(() => router.push("/login"), 1800);
    } else {
      toast.error(result.error ?? "Invalid code or password reset failed.");
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

          {success ? (
            <div className="text-center space-y-4 py-4">
              <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto">
                <CheckCircle size={26} className="text-emerald-400" />
              </div>
              <div className="space-y-1">
                <h2 className="text-lg font-semibold text-ivory">Password Reset Complete!</h2>
                <p className="text-[11px] text-muted-gray">Your new password is now active. Redirecting to sign in...</p>
              </div>
            </div>
          ) : step === "request" ? (
            /* STEP 1: Request OTP */
            <>
              <div className="text-center space-y-1.5">
                <div className="w-10 h-10 rounded-full bg-gold-champagne/10 border border-gold-border flex items-center justify-center mx-auto mb-3">
                  <Mail size={16} className="text-gold-champagne" />
                </div>
                <span className="text-[9px] uppercase tracking-[0.2em] text-gold-champagne font-mono block">Website Reset · Email OTP</span>
                <h1 className="serif-heading text-2xl font-light text-ivory">Forgot Password</h1>
                <p className="text-[11px] text-muted-gray leading-relaxed">
                  Enter your email address to receive a 6-digit verification code.
                </p>
              </div>

              <form onSubmit={handleSendOTP} className="space-y-4">
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
                  {loading ? <><Loader2 size={13} className="animate-spin" /> Sending Code...</> : <><ArrowRight size={13} /> Send Verification OTP</>}
                </button>
              </form>
            </>
          ) : (
            /* STEP 2: Verify OTP & Reset Password Directly */
            <>
              <div className="text-center space-y-1.5">
                <div className="w-10 h-10 rounded-full bg-gold-champagne/10 border border-gold-border flex items-center justify-center mx-auto mb-3">
                  <ShieldCheck size={16} className="text-gold-champagne" />
                </div>
                <span className="text-[9px] uppercase tracking-[0.2em] text-gold-champagne font-mono block">Step 2 of 2</span>
                <h1 className="serif-heading text-2xl font-light text-ivory">Enter OTP & New Password</h1>
                <p className="text-[11px] text-muted-gray leading-relaxed">
                  We sent a 6-digit code to <span className="text-ivory font-mono">{email}</span>.
                </p>
              </div>

              <form onSubmit={handleResetPassword} className="space-y-4">
                {/* OTP Input */}
                <div className="space-y-1.5">
                  <label className="text-[10px] text-muted-gray uppercase font-mono tracking-wider block">6-Digit Verification Code</label>
                  <div className="relative">
                    <KeyRound size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gold-champagne pointer-events-none" />
                    <input
                      type="text" required maxLength={6} id="otp-input"
                      value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                      placeholder="e.g. 849201"
                      className="w-full bg-white/5 border border-gold-border text-center tracking-[0.3em] font-mono text-sm font-bold text-gold-champagne rounded-lg p-2.5 pl-8 focus:outline-none focus:border-gold-champagne transition placeholder-white/20"
                    />
                  </div>
                </div>

                {/* New Password Input */}
                <div className="space-y-1.5">
                  <label className="text-[10px] text-muted-gray uppercase font-mono tracking-wider block">New Password</label>
                  <div className="relative">
                    <Lock size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-gray pointer-events-none" />
                    <input
                      type={showPw ? "text" : "password"} required minLength={6} id="new-password"
                      value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Min 6 characters"
                      className="w-full bg-white/5 border border-white/10 text-xs rounded-lg p-2.5 pl-8 pr-10 focus:outline-none focus:border-gold-champagne/50 transition placeholder-white/20"
                    />
                    <button type="button" onClick={() => setShowPw(v => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-gray hover:text-ivory transition cursor-pointer" tabIndex={-1}>
                      {showPw ? <EyeOff size={13} /> : <Eye size={13} />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password Input */}
                <div className="space-y-1.5">
                  <label className="text-[10px] text-muted-gray uppercase font-mono tracking-wider block">Confirm Password</label>
                  <div className="relative">
                    <Lock size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-gray pointer-events-none" />
                    <input
                      type={showCfm ? "text" : "password"} required id="confirm-password"
                      value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter password"
                      className={`w-full bg-white/5 border text-xs rounded-lg p-2.5 pl-8 pr-10 focus:outline-none transition placeholder-white/20 ${confirmPassword.length > 0 && confirmPassword !== newPassword ? "border-rose-500/50" : "border-white/10 focus:border-gold-champagne/50"}`}
                    />
                    <button type="button" onClick={() => setShowCfm(v => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-gray hover:text-ivory transition cursor-pointer" tabIndex={-1}>
                      {showCfm ? <EyeOff size={13} /> : <Eye size={13} />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit" id="reset-password-submit"
                  disabled={loading}
                  className="w-full py-3 bg-gold-champagne hover:bg-gold-warm disabled:opacity-60 text-obsidian text-xs font-bold uppercase tracking-wider rounded-lg transition cursor-pointer flex items-center justify-center gap-2"
                >
                  {loading ? <><Loader2 size={13} className="animate-spin" /> Resetting...</> : <><ArrowRight size={13} /> Reset Password Now</>}
                </button>

                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => setStep("request")}
                    className="text-[10px] text-muted-gray hover:text-gold-champagne transition cursor-pointer"
                  >
                    Didn&apos;t get the code? Resend OTP
                  </button>
                </div>
              </form>
            </>
          )}

          <div className="text-center pt-2">
            <Link href="/login" className="text-[11px] text-muted-gray hover:text-gold-champagne transition flex items-center justify-center gap-1">
              <ArrowLeft size={11} /> Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
