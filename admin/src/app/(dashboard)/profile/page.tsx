"use client";

import React from "react";
import { User, ShieldCheck, Mail, Phone, Lock } from "lucide-react";

export default function AdminProfilePage() {
  return (
    <div className="space-y-6 pb-12">
      <div className="border-b border-white/5 pb-6">
        <h1 className="text-2xl font-light text-[#f5f1e8] font-serif flex items-center gap-3">
          <User className="text-[#d8b36a]" size={24} />
          Admin Profile &amp; Credentials
        </h1>
        <p className="text-xs text-[#9a9995] font-light mt-1">
          Super Admin account metadata, active sessions, and password management.
        </p>
      </div>

      <div className="admin-card p-6 rounded-2xl border border-white/10 space-y-4 max-w-xl text-xs">
        <div className="flex items-center gap-4 border-b border-white/10 pb-4">
          <div className="w-12 h-12 rounded-full bg-[#d8b36a]/20 border border-[#d8b36a] text-[#d8b36a] font-bold text-lg flex items-center justify-center font-serif">
            PM
          </div>
          <div>
            <h3 className="text-base font-semibold text-[#f5f1e8]">Prem Mundargi</h3>
            <p className="text-xs text-[#d8b36a] font-mono">SUPER_ADMIN</p>
          </div>
        </div>

        <div className="space-y-2 text-[#9a9995] font-mono">
          <p className="flex items-center gap-2"><Mail size={14} className="text-[#d8b36a]" /> premmundargi135@gmail.com</p>
          <p className="flex items-center gap-2"><Phone size={14} className="text-[#d8b36a]" /> +91 96869 09048</p>
          <p className="flex items-center gap-2"><ShieldCheck size={14} className="text-emerald-400" /> Session Authenticated via Supabase SSR</p>
        </div>
      </div>
    </div>
  );
}
