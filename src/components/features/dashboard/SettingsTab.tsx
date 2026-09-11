"use client";

import React, { useState, useEffect, useCallback } from "react";
import { User, Lock, Shield } from "lucide-react";
import CustomerKycSection from "./CustomerKycSection";
import MFASetupModal from "@/components/auth/MFASetupModal";
import { getMFAStatusAction, unenrollMFAAction } from "@/lib/actions/mfa";
import { useToast } from "@/hooks/useToast";

interface SettingsTabProps {
  profile: any;
  onSaveProfile: (name: string, phone: string) => Promise<void>;
  savingProfile: boolean;
  onChangePassword: (newPw: string, cfmPw: string) => Promise<void>;
  savingPassword: boolean;
}

export default function SettingsTab({
  profile,
  onSaveProfile,
  savingProfile,
  onChangePassword,
  savingPassword,
}: SettingsTabProps) {
  const toast = useToast();
  const [name, setName] = useState(String(profile?.full_name || profile?.fullName || ""));
  const [phone, setPhone] = useState(String(profile?.phone || ""));
  const [newPw, setNewPw] = useState("");
  const [cfmPw, setCfmPw] = useState("");

  // MFA State
  const [mfaEnabled, setMfaEnabled] = useState(false);
  const [mfaLoading, setMfaLoading] = useState(true);
  const [mfaFactorId, setMfaFactorId] = useState<string | null>(null);
  const [mfaModalOpen, setMfaModalOpen] = useState(false);
  const [disablingMfa, setDisablingMfa] = useState(false);

  const loadMFAStatus = useCallback(async () => {
    setMfaLoading(true);
    const res = await getMFAStatusAction();
    setMfaLoading(false);
    if (res.success) {
      setMfaEnabled(res.isEnabled);
      const verified = res.factors.find((f) => f.status === "verified");
      setMfaFactorId(verified?.id || null);
    }
  }, []);

  useEffect(() => {
    loadMFAStatus();
  }, [loadMFAStatus]);

  const handleDisableMFA = async () => {
    if (!mfaFactorId) return;
    if (!confirm("Are you sure you want to disable Two-Factor Authentication on your account?")) return;
    setDisablingMfa(true);
    const res = await unenrollMFAAction(mfaFactorId);
    setDisablingMfa(false);
    if (res.success) {
      toast.success("Two-Factor Authentication has been disabled.");
      loadMFAStatus();
    } else {
      toast.error(res.error || "Failed to disable 2FA.");
    }
  };

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveProfile(name, phone);
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onChangePassword(newPw, cfmPw);
    setNewPw("");
    setCfmPw("");
  };

  return (
    <div className="space-y-8 max-w-3xl">
      {/* ─── 1. PROFILE INFORMATION CARD ─── */}
      <div className="dash-card rounded-3xl border border-white/10 bg-neutral-900/80 p-6 shadow-2xl backdrop-blur-xl">
        <div className="flex items-center gap-3 border-b border-white/10 pb-4 mb-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-400/10 text-amber-400 border border-amber-400/20">
            <User className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Filmmaker Profile &amp; Contact</h3>
            <p className="text-xs text-neutral-400">
              Manage your verified credentials and studio dispatch contact details.
            </p>
          </div>
        </div>

        <form onSubmit={handleProfileSubmit} className="space-y-4 text-xs">
          <div>
            <label className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 block mb-1">
              Full Legal Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-black/60 p-2.5 text-white placeholder:text-neutral-600 focus:border-amber-400 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 block mb-1">
                Email Address (Read-Only)
              </label>
              <input
                type="email"
                disabled
                value={String(profile?.email || "creator@cinemahouse.com")}
                className="w-full rounded-xl border border-white/5 bg-neutral-950 p-2.5 text-neutral-500 font-mono"
              />
            </div>

            <div>
              <label className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 block mb-1">
                Mobile Number
              </label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-black/60 p-2.5 text-white placeholder:text-neutral-600 focus:border-amber-400 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end pt-3 border-t border-white/5">
            <button
              type="submit"
              disabled={savingProfile}
              className="rounded-xl bg-amber-400 px-5 py-2 text-xs font-bold text-black hover:bg-amber-300 transition-colors disabled:opacity-50"
            >
              {savingProfile ? "Saving..." : "Save Profile Changes"}
            </button>
          </div>
        </form>
      </div>

      {/* ─── 2. SECURITY & AUTHENTICATION ─── */}
      <div className="dash-card rounded-3xl border border-white/10 bg-neutral-900/80 p-6 shadow-2xl backdrop-blur-xl">
        <div className="flex items-center gap-3 border-b border-white/10 pb-4 mb-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-400/10 text-cyan-400 border border-cyan-400/20">
            <Lock className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Security &amp; Password</h3>
            <p className="text-xs text-neutral-400">
              Update your account password to safeguard access to your vault reservations.
            </p>
          </div>
        </div>

        <form onSubmit={handlePasswordSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 block mb-1">
                New Password
              </label>
              <input
                type="password"
                required
                minLength={6}
                placeholder="••••••••"
                value={newPw}
                onChange={(e) => setNewPw(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-black/60 p-2.5 text-white placeholder:text-neutral-600 focus:border-amber-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 block mb-1">
                Confirm New Password
              </label>
              <input
                type="password"
                required
                minLength={6}
                placeholder="••••••••"
                value={cfmPw}
                onChange={(e) => setCfmPw(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-black/60 p-2.5 text-white placeholder:text-neutral-600 focus:border-amber-400 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end pt-3 border-t border-white/5">
            <button
              type="submit"
              disabled={savingPassword || !newPw}
              className="rounded-xl border border-cyan-400/30 bg-cyan-400/10 px-5 py-2 text-xs font-bold text-cyan-300 hover:bg-cyan-400/20 transition-colors disabled:opacity-50"
            >
              {savingPassword ? "Updating..." : "Update Password"}
            </button>
          </div>
        </form>
      </div>

      {/* ─── 3. TWO-FACTOR AUTHENTICATION (TOTP) ─── */}
      <div className="dash-card rounded-3xl border border-white/10 bg-neutral-900/80 p-6 shadow-2xl backdrop-blur-xl">
        <div className="flex items-center gap-3 border-b border-white/10 pb-4 mb-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold-champagne/10 text-gold-champagne border border-gold-champagne/20">
            <Shield className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white">Two-Factor Authentication (MFA)</h3>
              {mfaLoading ? (
                <span className="text-[10px] font-mono text-neutral-500">Checking...</span>
              ) : mfaEnabled ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono uppercase bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Active (TOTP)
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-mono uppercase bg-neutral-800 border border-white/10 text-neutral-400">
                  Disabled
                </span>
              )}
            </div>
            <p className="text-xs text-neutral-400 mt-1">
              Enhance vault reservation security by requiring a 6-digit TOTP code on every login.
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs">
          <p className="text-neutral-400 text-xs">
            {mfaEnabled
              ? "Your account is protected by an authenticator application (Google Authenticator, Apple Passwords, 1Password)."
              : "Protect your filmmaker credentials from unauthorized access. Supports all standard TOTP authenticators."}
          </p>
          {mfaEnabled ? (
            <button
              type="button"
              onClick={handleDisableMFA}
              disabled={disablingMfa}
              className="shrink-0 px-4 py-2 border border-rose-500/30 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 rounded-xl text-xs font-mono font-medium transition cursor-pointer disabled:opacity-50"
            >
              {disablingMfa ? "Disabling..." : "Disable 2FA"}
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setMfaModalOpen(true)}
              className="shrink-0 px-5 py-2 bg-gold-champagne text-obsidian font-mono font-bold text-xs uppercase tracking-wider rounded-xl hover:bg-gold-light transition cursor-pointer"
            >
              Configure 2FA
            </button>
          )}
        </div>

        <MFASetupModal
          isOpen={mfaModalOpen}
          onClose={() => setMfaModalOpen(false)}
          onSuccess={() => {
            loadMFAStatus();
          }}
        />
      </div>

      {/* ─── 3. INTERACTIVE KYC DOCUMENT VERIFICATION ─── */}
      <CustomerKycSection profile={profile} />
    </div>
  );
}
