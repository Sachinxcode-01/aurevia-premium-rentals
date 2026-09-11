"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Shield, ShieldCheck, Key, Copy, Check, Loader2, X, AlertCircle } from "lucide-react";
import { enrollMFAAction, verifyMFAEnrollmentAction } from "@/lib/actions/mfa";
import { useToast } from "@/hooks/useToast";

interface MFASetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function MFASetupModal({ isOpen, onClose, onSuccess }: MFASetupModalProps) {
  const toast = useToast();
  const [step, setStep] = useState<"init" | "qr" | "success">("init");
  const [loading, setLoading] = useState(false);
  const [factorId, setFactorId] = useState("");
  const [secret, setSecret] = useState("");
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [code, setCode] = useState("");
  const [copied, setCopied] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  if (!isOpen) return null;

  const handleStartEnrollment = async () => {
    setLoading(true);
    setErrorMsg("");
    const res = await enrollMFAAction();
    setLoading(false);

    if (res.success && res.qrCodeUrl && res.secret && res.factorId) {
      setFactorId(res.factorId);
      setSecret(res.secret);
      setQrCodeUrl(res.qrCodeUrl);
      setStep("qr");
    } else {
      setErrorMsg(res.error || "Could not initialize authenticator. Please try again.");
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length !== 6) {
      setErrorMsg("Please enter the complete 6-digit code.");
      return;
    }

    setLoading(true);
    setErrorMsg("");
    const res = await verifyMFAEnrollmentAction(factorId, code);
    setLoading(false);

    if (res.success) {
      setStep("success");
      toast.success("Two-Factor Authentication activated successfully.");
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1500);
    } else {
      setErrorMsg(res.error || "Invalid verification code. Please check your authenticator app.");
    }
  };

  const handleCopySecret = () => {
    if (!secret) return;
    navigator.clipboard.writeText(secret);
    setCopied(true);
    toast.success("Secret key copied to clipboard.");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md bg-obsidian border border-gold-champagne/30 rounded-2xl shadow-2xl p-6 md:p-8 space-y-6 text-ivory">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-muted-gray hover:text-ivory transition cursor-pointer p-1"
          aria-label="Close modal"
        >
          <X size={18} />
        </button>

        {/* Modal Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-full bg-gold-champagne/10 border border-gold-champagne/30 flex items-center justify-center mx-auto text-gold-champagne">
            <Shield size={22} />
          </div>
          <h3 className="text-lg font-serif tracking-wide text-ivory">
            Two-Factor Authentication (TOTP)
          </h3>
          <p className="text-xs text-muted-gray">
            Protect your AUREVIA vault account with production-grade authenticator security.
          </p>
        </div>

        {errorMsg && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-mono rounded-lg flex items-start gap-2">
            <AlertCircle size={14} className="shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {step === "init" && (
          <div className="space-y-4 pt-2">
            <div className="bg-charcoal/40 border border-white/5 p-4 rounded-xl space-y-3 text-xs text-muted-gray">
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-gold-champagne/20 text-gold-champagne flex items-center justify-center font-mono text-[10px] shrink-0 mt-0.5">1</span>
                <span>Use any standard authenticator app (Google Authenticator, Apple Passwords, Microsoft Authenticator, or 1Password).</span>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-gold-champagne/20 text-gold-champagne flex items-center justify-center font-mono text-[10px] shrink-0 mt-0.5">2</span>
                <span>Scan the encrypted QR code or enter the secret key manually.</span>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-gold-champagne/20 text-gold-champagne flex items-center justify-center font-mono text-[10px] shrink-0 mt-0.5">3</span>
                <span>Verify with a live 6-digit code to activate two-factor protection.</span>
              </div>
            </div>

            <button
              onClick={handleStartEnrollment}
              disabled={loading}
              className="w-full py-3 bg-gold-champagne text-obsidian font-mono text-xs uppercase tracking-widest font-semibold rounded-xl hover:bg-gold-light transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  Generating Secret Key...
                </>
              ) : (
                <>
                  <Key size={14} />
                  Configure Authenticator App
                </>
              )}
            </button>
          </div>
        )}

        {step === "qr" && (
          <form onSubmit={handleVerifyCode} className="space-y-5">
            {/* QR Code Container */}
            <div className="flex flex-col items-center justify-center space-y-3">
              <div className="p-3 bg-white rounded-xl shadow-inner border-2 border-gold-champagne/40">
                {qrCodeUrl && (
                  <Image
                    src={qrCodeUrl}
                    alt="AUREVIA TOTP QR Code"
                    width={180}
                    height={180}
                    className="rounded"
                    unoptimized
                  />
                )}
              </div>
              <span className="text-[10px] font-mono text-muted-gray uppercase tracking-wider">
                Scan with your authenticator application
              </span>
            </div>

            {/* Secret key fallback */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono text-muted-gray uppercase tracking-wider block">
                Can&apos;t scan? Enter code manually:
              </label>
              <div className="flex items-center gap-2 p-2.5 bg-charcoal/60 border border-white/10 rounded-lg text-xs font-mono text-ivory">
                <span className="truncate flex-1 select-all">{secret}</span>
                <button
                  type="button"
                  onClick={handleCopySecret}
                  className="p-1 text-gold-champagne hover:text-ivory transition cursor-pointer shrink-0"
                  title="Copy secret"
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                </button>
              </div>
            </div>

            {/* Verification Code Input */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono text-muted-gray uppercase tracking-wider block">
                Enter 6-Digit Code from Authenticator:
              </label>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                required
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="123456"
                className="w-full text-center text-xl tracking-[0.3em] font-mono py-2.5 bg-charcoal/50 border border-gold-champagne/30 rounded-lg focus:outline-none focus:border-gold-champagne text-gold-champagne"
                autoFocus
              />
            </div>

            <button
              type="submit"
              disabled={loading || code.length !== 6}
              className="w-full py-3 bg-gold-champagne text-obsidian font-mono text-xs uppercase tracking-widest font-semibold rounded-xl hover:bg-gold-light transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  Verifying OTP...
                </>
              ) : (
                <>
                  <ShieldCheck size={14} />
                  Activate 2FA Protection
                </>
              )}
            </button>
          </form>
        )}

        {step === "success" && (
          <div className="text-center py-6 space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto animate-bounce">
              <Check size={24} />
            </div>
            <h4 className="text-base font-serif text-ivory">2FA Successfully Activated</h4>
            <p className="text-xs text-muted-gray font-mono">
              Your account is now secured with TOTP authenticator verification.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
