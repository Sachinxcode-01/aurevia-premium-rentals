"use client";

import React, { useState } from "react";
import { UserCog, Plus, ShieldCheck, Lock, UserX } from "lucide-react";

interface StaffUser {
  id: string;
  name: string;
  email: string;
  role: "SUPER_ADMIN" | "ADMIN" | "STAFF";
  status: "ACTIVE" | "INACTIVE";
  lastLogin: string;
}

const MOCK_STAFF: StaffUser[] = [
  { id: "STF-01", name: "Prem Mundargi", email: "premmundargi135@gmail.com", role: "SUPER_ADMIN", status: "ACTIVE", lastLogin: "Active Now" },
  { id: "STF-02", name: "Sachin K", email: "sachiii8827@gmail.com", role: "ADMIN", status: "ACTIVE", lastLogin: "2 hours ago" },
];

export default function AdminStaffPage() {
  const [staff] = useState<StaffUser[]>(MOCK_STAFF);

  return (
    <div className="space-y-6 pb-12">
      <div className="border-b border-white/5 pb-6">
        <h1 className="text-2xl font-light text-[#f5f1e8] font-serif flex items-center gap-3">
          <UserCog className="text-[#d8b36a]" size={24} />
          Staff Access &amp; RBAC Roles
        </h1>
        <p className="text-xs text-[#9a9995] font-light mt-1">
          Super Admin permissions management, administrative staff credentials, and active session revocation.
        </p>
      </div>

      <div className="admin-card rounded-2xl overflow-hidden border border-white/10">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="bg-[#0c0c0c] border-b border-white/10 text-[#9a9995] font-mono text-[10px] uppercase">
              <th className="p-4">Staff Ref</th>
              <th className="p-4">Name</th>
              <th className="p-4">Email</th>
              <th className="p-4">Role</th>
              <th className="p-4">Last Active</th>
              <th className="p-4 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 text-[#f5f1e8] font-mono">
            {staff.map((s) => (
              <tr key={s.id} className="hover:bg-white/5 transition">
                <td className="p-4 text-[#d8b36a]">{s.id}</td>
                <td className="p-4 font-sans font-medium">{s.name}</td>
                <td className="p-4 text-[#9a9995]">{s.email}</td>
                <td className="p-4 font-bold text-[#d8b36a]">{s.role}</td>
                <td className="p-4 text-[#9a9995] font-sans">{s.lastLogin}</td>
                <td className="p-4 text-right font-sans">
                  <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                    {s.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
