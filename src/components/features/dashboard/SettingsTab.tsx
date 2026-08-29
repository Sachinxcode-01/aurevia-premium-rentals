"use client";

import React, { useState } from "react";
import { User, Lock, Phone, Mail, ShieldCheck, CheckCircle2 } from "lucide-react";

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
  const [name, setName] = useState(String(profile?.full_name || profile?.fullName || ""));
  const [phone, setPhone] = useState(String(profile?.phone || ""));
  const [newPw, setNewPw] = useState("");
  const [cfmPw, setCfmPw] = useState("");

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

      {/* ─── 3. VERIFIED KYC BADGE ─── */}
      <div className="rounded-3xl border border-emerald-500/30 bg-emerald-950/20 p-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ShieldCheck className="h-8 w-8 text-emerald-400" />
          <div>
            <h4 className="text-sm font-bold text-white">Tier 1 Verified Cinema Partner</h4>
            <p className="text-xs text-neutral-400">
              Zero Security Deposit Scheme active. Optical equipment dispatched without cash collateral.
            </p>
          </div>
        </div>

        <span className="rounded-full bg-emerald-500/20 border border-emerald-500/40 px-3 py-1 text-xs font-mono font-bold text-emerald-300">
          KYC APPROVED
        </span>
      </div>
    </div>
  );
}
