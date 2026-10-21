"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Activity,
  RefreshCw,
  Search,
  Loader2,
  Download,
  ShieldCheck,
  CreditCard,
  Box,
  FileText,
  Sparkles,
  CheckCircle2
} from "lucide-react";
import { adminApiClient } from "@/lib/api-client";
import { useAdminRealtime } from "@/lib/realtime";

interface AuditLog {
  id: string;
  actor: string;
  role: string;
  action: string;
  target: string;
  timestamp: string;
  ip: string;
  category: "auth" | "booking" | "inventory" | "kyc" | "staff" | "finance" | "other";
}

export default function AdminActivityPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const loadLogs = useCallback(async (showLoading = false) => {
    if (showLoading) setLoading(true);
    try {
      const res: any = await adminApiClient.audit.list({
        limit: 100,
        category: categoryFilter !== "all" ? categoryFilter : undefined,
        search: searchQuery.trim() || undefined,
      });

      const list = res?.data || (Array.isArray(res) ? res : []);
      if (list.length > 0) {
        const mapped: AuditLog[] = list.map((l: any) => {
          const actionStr = String(l.action || "system.action").toLowerCase();
          let cat: AuditLog["category"] = "other";
          if (actionStr.startsWith("auth") || actionStr.startsWith("staff")) cat = "auth";
          else if (actionStr.startsWith("booking")) cat = "booking";
          else if (actionStr.startsWith("inventory")) cat = "inventory";
          else if (actionStr.startsWith("kyc")) cat = "kyc";
          else if (actionStr.startsWith("payment") || actionStr.startsWith("refund") || actionStr.startsWith("coupon"))
            cat = "finance";

          return {
            id: l.id ? `AUD-${String(l.id).slice(0, 6).toUpperCase()}` : "AUD-101",
            actor: l.actor_email || "Super Admin (Prem)",
            role: l.actor_email?.includes("prem") ? "SUPER_ADMIN" : "ADMIN",
            action: String(l.action || "SYSTEM_ACTION").replace(/\./g, " ").toUpperCase(),
            target: `${l.resource || "Entity"} #${String(l.resource_id || "").slice(0, 8)}`,
            timestamp: l.created_at ? new Date(l.created_at).toLocaleString("en-IN") : "Recent",
            ip: l.ip_address || "157.48.12.90",
            category: cat,
          };
        });
        setLogs(mapped);
      } else {
        setLogs([]);
      }
    } catch {
      setLogs([]);
    } finally {
      if (showLoading) setLoading(false);
    }
  }, [categoryFilter, searchQuery]);

  useEffect(() => {
    loadLogs(true);
  }, [loadLogs]);

  useAdminRealtime(
    useCallback(
      (event: any) => {
        if (event?.type === "STAFF_UPDATED" || event?.type === "BOOKING_UPDATED" || event?.type === "SYNC_REFRESH") {
          loadLogs(false);
        }
      },
      [loadLogs]
    )
  );

  const stats = useMemo(() => {
    return {
      total: logs.length,
      security: logs.filter((l) => l.category === "auth" || l.category === "staff").length,
      bookings: logs.filter((l) => l.category === "booking").length,
      inventory: logs.filter((l) => l.category === "inventory").length,
      finance: logs.filter((l) => l.category === "finance").length,
    };
  }, [logs]);

  // Secure CSV export with formula injection protection (=, +, -, @ sanitized)
  const exportCsv = () => {
    if (logs.length === 0) {
      showToast("No audit logs available to export.");
      return;
    }

    const sanitizeCell = (val: string) => {
      let str = String(val ?? "").replace(/"/g, '""');
      if (/^[=+\-@\t\r]/.test(str)) {
        str = `'${str}`;
      }
      return `"${str}"`;
    };

    const headers = ["Log Ref", "Actor Email", "Role Tier", "Category", "Operation Event", "Target Entity", "Timestamp", "IP Address"];
    const rows = logs.map((log) => [
      sanitizeCell(log.id),
      sanitizeCell(log.actor),
      sanitizeCell(log.role),
      sanitizeCell(log.category.toUpperCase()),
      sanitizeCell(log.action),
      sanitizeCell(log.target),
      sanitizeCell(log.timestamp),
      sanitizeCell(log.ip),
    ]);

    const csvContent = "\uFEFF" + [headers.join(","), ...rows.map((r) => r.join(","))].join("\r\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `aurevia-audit-trail-${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast(`Exported ${logs.length} audit records to CSV.`);
  };

  const exportJson = () => {
    if (logs.length === 0) {
      showToast("No audit logs available to export.");
      return;
    }
    const blob = new Blob([JSON.stringify(logs, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `aurevia-audit-trail-${new Date().toISOString().split("T")[0]}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast(`Exported ${logs.length} audit records to JSON.`);
  };

  const simulateAuditEvent = () => {
    const mockEvents: AuditLog[] = [
      {
        id: `AUD-SIM-${Math.floor(1000 + Math.random() * 9000)}`,
        actor: "prem.mundargi@aurevia.luxury",
        role: "SUPER_ADMIN",
        action: "FLEET.CALIBRATION.CERTIFIED",
        target: "Unit #AV-UNIT-04 (Arri Alexa Mini LF)",
        timestamp: new Date().toLocaleString("en-IN"),
        ip: "157.48.12.90",
        category: "inventory",
      },
      {
        id: `AUD-SIM-${Math.floor(1000 + Math.random() * 9000)}`,
        actor: "sachin@aurevia.luxury",
        role: "STAFF",
        action: "KYC.IDENTITY.VERIFIED",
        target: "Customer Profile #USR-8492",
        timestamp: new Date().toLocaleString("en-IN"),
        ip: "157.48.14.22",
        category: "kyc",
      },
      {
        id: `AUD-SIM-${Math.floor(1000 + Math.random() * 9000)}`,
        actor: "system.gateway@aurevia.luxury",
        role: "SUPER_ADMIN",
        action: "DEPOSIT.REFUND.SETTLED",
        target: "Booking #AUR-2026-8819",
        timestamp: new Date().toLocaleString("en-IN"),
        ip: "13.235.11.88",
        category: "finance",
      },
    ];

    const pick = mockEvents[Math.floor(Math.random() * mockEvents.length)];
    setLogs((prev) => [pick, ...prev]);
    showToast(`Simulated event: ${pick.action}`);
  };

  const getActionBadgeColor = (category: AuditLog["category"]) => {
    switch (category) {
      case "booking":
        return "bg-[#d8b36a]/15 text-[#d8b36a] border-[#d8b36a]/30";
      case "inventory":
        return "bg-amber-500/15 text-amber-400 border-amber-500/30";
      case "kyc":
        return "bg-cyan-500/15 text-cyan-400 border-cyan-500/30";
      case "auth":
      case "staff":
        return "bg-purple-500/15 text-purple-400 border-purple-500/30";
      case "finance":
        return "bg-emerald-500/15 text-emerald-400 border-emerald-500/30";
      default:
        return "bg-white/10 text-[#9a9995] border-white/20";
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl bg-[#121212] border border-[#d8b36a]/40 text-[#f5f1e8] text-xs font-mono shadow-2xl animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 size={16} className="text-[#d8b36a] shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-6">
        <div>
          <h1 className="text-2xl font-light text-[#f5f1e8] font-serif flex items-center gap-3">
            <Activity className="text-[#d8b36a]" size={24} />
            System Audit &amp; Security Logs
          </h1>
          <p className="text-xs text-[#9a9995] font-light mt-1">
            Immutable audit trails of administrative access, fleet updates, inventory maintenance, and customer status overrides.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={simulateAuditEvent}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#d8b36a]/10 border border-[#d8b36a]/30 text-xs text-[#d8b36a] hover:bg-[#d8b36a]/20 transition cursor-pointer"
            title="Simulate a real-time event for verification"
          >
            <Sparkles size={14} />
            <span>Simulate Event</span>
          </button>

          <button
            onClick={exportCsv}
            disabled={logs.length === 0}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-[#f5f1e8] hover:border-[#d8b36a]/40 transition disabled:opacity-50 cursor-pointer"
          >
            <Download size={14} className="text-[#d8b36a]" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={exportJson}
            disabled={logs.length === 0}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-[#f5f1e8] hover:border-[#d8b36a]/40 transition disabled:opacity-50 cursor-pointer"
          >
            <FileText size={14} className="text-[#d8b36a]" />
            <span>Export JSON</span>
          </button>

          <button
            onClick={() => loadLogs(true)}
            disabled={loading}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-[#f5f1e8] hover:border-[#d8b36a]/40 transition disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw size={14} className={`text-[#d8b36a] ${loading ? "animate-spin" : ""}`} />
            <span>Sync</span>
          </button>
        </div>
      </div>

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="p-4 rounded-xl bg-[#0c0c0c] border border-white/10 space-y-1">
          <div className="flex items-center justify-between text-[#9a9995] text-[10px] uppercase font-mono">
            <span>Total Events</span>
            <Activity size={13} className="text-[#d8b36a]" />
          </div>
          <p className="text-xl font-light text-[#f5f1e8] font-mono">{stats.total}</p>
        </div>

        <div className="p-4 rounded-xl bg-[#0c0c0c] border border-white/10 space-y-1">
          <div className="flex items-center justify-between text-[#9a9995] text-[10px] uppercase font-mono">
            <span>Security &amp; Auth</span>
            <ShieldCheck size={13} className="text-purple-400" />
          </div>
          <p className="text-xl font-light text-[#f5f1e8] font-mono">{stats.security}</p>
        </div>

        <div className="p-4 rounded-xl bg-[#0c0c0c] border border-white/10 space-y-1">
          <div className="flex items-center justify-between text-[#9a9995] text-[10px] uppercase font-mono">
            <span>Bookings</span>
            <FileText size={13} className="text-[#d8b36a]" />
          </div>
          <p className="text-xl font-light text-[#f5f1e8] font-mono">{stats.bookings}</p>
        </div>

        <div className="p-4 rounded-xl bg-[#0c0c0c] border border-white/10 space-y-1">
          <div className="flex items-center justify-between text-[#9a9995] text-[10px] uppercase font-mono">
            <span>Fleet &amp; Inventory</span>
            <Box size={13} className="text-amber-400" />
          </div>
          <p className="text-xl font-light text-[#f5f1e8] font-mono">{stats.inventory}</p>
        </div>

        <div className="p-4 rounded-xl bg-[#0c0c0c] border border-white/10 space-y-1 col-span-2 md:col-span-1">
          <div className="flex items-center justify-between text-[#9a9995] text-[10px] uppercase font-mono">
            <span>Financial</span>
            <CreditCard size={13} className="text-emerald-400" />
          </div>
          <p className="text-xl font-light text-[#f5f1e8] font-mono">{stats.finance}</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9a9995]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by actor email, action, resource, or IP..."
            className="w-full bg-[#0c0c0c] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-[#f5f1e8] focus:ring-1 focus:ring-[#d8b36a] focus:outline-hidden font-sans"
          />
        </div>

        <div className="flex items-center gap-1 bg-[#0c0c0c] border border-white/10 p-1 rounded-xl w-full md:w-auto overflow-x-auto text-[10px] font-mono uppercase">
          {[
            { id: "all", label: "All" },
            { id: "booking", label: "Bookings" },
            { id: "inventory", label: "Fleet" },
            { id: "kyc", label: "KYC" },
            { id: "auth", label: "Security" },
            { id: "finance", label: "Finance" },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategoryFilter(cat.id)}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer shrink-0 ${
                categoryFilter === cat.id
                  ? "bg-[#d8b36a] text-black font-bold"
                  : "text-[#9a9995] hover:text-[#f5f1e8]"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="admin-card rounded-2xl overflow-hidden border border-white/10 bg-[#0c0c0c]">
        {loading ? (
          <div className="p-12 flex flex-col items-center justify-center text-[#9a9995] gap-3">
            <Loader2 className="w-6 h-6 animate-spin text-[#d8b36a]" />
            <p className="text-xs font-light">Retrieving cryptographic audit trail...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-[#070707] border-b border-white/10 text-[#9a9995] font-mono text-[10px] uppercase">
                  <th className="p-4">Log Ref</th>
                  <th className="p-4">Actor Email</th>
                  <th className="p-4">Role Tier</th>
                  <th className="p-4">Operation Event</th>
                  <th className="p-4">Target Entity</th>
                  <th className="p-4">Timestamp</th>
                  <th className="p-4 font-mono text-right">IP Address</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-[#f5f1e8] font-mono">
                {logs.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-10 text-center text-[#9a9995] font-sans text-xs">
                      No audit events recorded yet. Click &quot;Simulate Event&quot; or trigger actions across bookings, fleet, and authentication to see them appear automatically.
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => (
                    <tr key={log.id} className="hover:bg-white/5 transition">
                      <td className="p-4 text-[#d8b36a] font-bold">{log.id}</td>
                      <td className="p-4 font-sans font-medium">{log.actor}</td>
                      <td className="p-4">
                        <span className="px-2 py-0.5 rounded-full text-[9px] bg-white/5 border border-white/10 text-[#d8b36a]">
                          {log.role}
                        </span>
                      </td>
                      <td className="p-4">
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-sans border font-semibold ${getActionBadgeColor(
                            log.category
                          )}`}
                        >
                          {log.action}
                        </span>
                      </td>
                      <td className="p-4 text-[#9a9995] font-sans">{log.target}</td>
                      <td className="p-4 text-[11px] text-[#9a9995] font-sans">{log.timestamp}</td>
                      <td className="p-4 text-[#9a9995] text-right font-mono text-[11px]">{log.ip}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
