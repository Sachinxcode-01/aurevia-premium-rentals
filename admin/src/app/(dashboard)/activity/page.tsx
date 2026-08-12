"use client";

import React from "react";
import { Activity, ShieldCheck, Lock, User, Clock } from "lucide-react";

interface AuditLog {
  id: string;
  actor: string;
  role: string;
  action: string;
  target: string;
  timestamp: string;
  ip: string;
}

const MOCK_AUDITS: AuditLog[] = [
  { id: "AUD-991", actor: "Prem Mundargi", role: "SUPER_ADMIN", action: "Approved Booking #AUR-1042", target: "Booking AUR-1042", timestamp: "12 Aug 2026, 09:15 AM", ip: "157.48.12.90" },
  { id: "AUD-990", actor: "Sachin K", role: "ADMIN", action: "Verified KYC for Rahul Verma", target: "Customer CUST-001", timestamp: "12 Aug 2026, 08:30 AM", ip: "157.48.12.92" },
  { id: "AUD-989", actor: "Prem Mundargi", role: "SUPER_ADMIN", action: "Added Equipment INV-004", target: "Inventory Fleet", timestamp: "11 Aug 2026, 05:40 PM", ip: "157.48.12.90" },
];

export default function AdminActivityPage() {
  return (
    <div className="space-y-6 pb-12">
      <div className="border-b border-white/5 pb-6">
        <h1 className="text-2xl font-light text-[#f5f1e8] font-serif flex items-center gap-3">
          <Activity className="text-[#d8b36a]" size={24} />
          System Audit &amp; Security Logs
        </h1>
        <p className="text-xs text-[#9a9995] font-light mt-1">
          Immutable audit trails of staff actions, security authentication, and status overrides.
        </p>
      </div>

      <div className="admin-card rounded-2xl overflow-hidden border border-white/10">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="bg-[#0c0c0c] border-b border-white/10 text-[#9a9995] font-mono text-[10px] uppercase">
              <th className="p-4">Log Ref</th>
              <th className="p-4">Actor</th>
              <th className="p-4">Role</th>
              <th className="p-4">Action Summary</th>
              <th className="p-4">Target Entity</th>
              <th className="p-4">Timestamp</th>
              <th className="p-4 font-mono">IP Address</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 text-[#f5f1e8] font-mono">
            {MOCK_AUDITS.map((log) => (
              <tr key={log.id} className="hover:bg-white/5 transition">
                <td className="p-4 text-[#d8b36a]">{log.id}</td>
                <td className="p-4 font-sans font-medium">{log.actor}</td>
                <td className="p-4 text-[10px] text-[#d8b36a]">{log.role}</td>
                <td className="p-4 font-sans text-[#f5f1e8]">{log.action}</td>
                <td className="p-4 text-[#9a9995]">{log.target}</td>
                <td className="p-4 text-[11px] text-[#9a9995]">{log.timestamp}</td>
                <td className="p-4 text-[#9a9995]">{log.ip}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
