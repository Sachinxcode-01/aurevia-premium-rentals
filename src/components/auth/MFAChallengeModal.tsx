"use client";

import React, { useState } from "react";
import { ShieldAlert, KeyRound, Loader2, ArrowRight, X } from "lucide-react";
import { challengeAndVerifyMFAAction } from "@/lib/actions/mfa";
import { useToast } from "@/hooks/useToast";

interface MFAChallengeModalProps {
  isOpen: boolean;
  factorId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function MFAChallengeModal({
  isOpen,
  factorId,
  onSuccess,
  onCancel,
}: MFAChallengeModalProps) {
  const toast = useToast();
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  if (!isOpen) return null;

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length !== 6) {
      setErrorMsg("Please enter the complete 6-digit code.");
      return;
    }

    setLoading(true);
    setErrorMsg("");

    const res = await challengeAndVerifyMFAAction(factorId, code);
    setLoading(false);

    if (res.success) {
      toast.success("Identity verified. Accessing vault...");
      onSuccess();
    } else {
      setErrorMsg(res.error || "Invalid authentication code. Please try again.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-sm bg-obsidian border border-gold-champagne/40 rounded-2xl shadow-2xl p-6 md:p-8 space-y-6 text-ivory">
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 text-muted-gray hover:text-ivory transition cursor-pointer p-1"
          aria-label="Cancel"
        >
          <X size={18} />
        </button>

        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-full bg-gold-champagne/10 border border-gold-champagne/30 flex items-center justify-center mx-auto text-gold-champagne">
            <KeyRound size={22} />
          </div>
          <h3 className="text-lg font-serif tracking-wide text-ivory">
            Two-Factor Challenge
          </h3>
          <p className="text-xs text-muted-gray">
            Enter the 6-digit code from your authenticator app to complete sign-in.
          </p>
        </div>

        {errorMsg && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-mono rounded-lg flex items-start gap-2">
            <ShieldAlert size={14} className="shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleVerify} className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-[10px] font-mono text-muted-gray uppercase tracking-wider block text-center">
              Authenticator Security Code
            </label>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              required
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              placeholder="000000"
              className="w-full text-center text-2xl tracking-[0.3em] font-mono py-3 bg-charcoal/50 border border-gold-champagne/40 rounded-xl focus:outline-none focus:border-gold-champagne text-gold-champagne"
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
                Verifying...
              </>
            ) : (
              <>
                Confirm & Enter Vault
                <ArrowRight size={14} />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
