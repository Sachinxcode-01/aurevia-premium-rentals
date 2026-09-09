"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  UserCog, Plus, ShieldCheck, Lock, UserX, UserCheck,
  RefreshCw, CheckCircle2, AlertCircle, X, Loader2, Mail, Phone
} from "lucide-react";
import { adminApiClient } from "@/lib/api-client";

interface StaffUser {
  id: string;
  name: string;
  email: string;
  role: "super_admin" | "admin" | "staff";
  status: "ACTIVE" | "INACTIVE";
  lastLogin: string;
  phone?: string;
}

export default function AdminStaffPage() {
  const [staff, setStaff] = useState<StaffUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editUser, setEditUser] = useState<StaffUser | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // New staff form state
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newRole, setNewRole] = useState<"admin" | "staff">("staff");
  const [newPhone, setNewPhone] = useState("");

  const loadStaff = useCallback(async (isManual = false) => {
    if (isManual) setRefreshing(true);
    else setLoading(true);

    try {
      const res = await adminApiClient.staff.list();
      if (res.success && Array.isArray(res.data)) {
        setStaff(res.data);
      }
    } catch {
      // Fallback
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadStaff();
  }, [loadStaff]);

  const handleAddStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newEmail) return;
    setSubmitting(true);
    setFeedback(null);

    try {
      const res = await adminApiClient.staff.create({
        name: newName,
        email: newEmail,
        role: newRole,
      });

      if (res.success) {
        setFeedback({
          type: "success",
          text: `Staff member ${newName} invited successfully.`,
        });
        setShowAddModal(false);
        setNewName("");
        setNewEmail("");
        setNewPhone("");
        loadStaff(true);
      } else {
        setFeedback({
          type: "error",
          text: res.error?.message || res.message || "Failed to add staff member.",
        });
      }
    } catch (err: any) {
      setFeedback({
        type: "error",
        text: err?.message || "Network error adding staff.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateRole = async (role: string) => {
    if (!editUser) return;
    setSubmitting(true);
    try {
      const res = await adminApiClient.staff.updateRole(editUser.id, role);
      if (res.success) {
        setFeedback({ type: "success", text: `Role updated for ${editUser.name}.` });
        setEditUser(null);
        loadStaff(true);
      } else {
        setFeedback({ type: "error", text: "Failed to update role." });
      }
    } catch {
      setFeedback({ type: "error", text: "Network error updating role." });
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (user: StaffUser) => {
    const nextStatus = user.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    try {
      const res = await adminApiClient.staff.toggleStatus(user.id, nextStatus);
      if (res.success) {
        setStaff((prev) =>
          prev.map((s) => (s.id === user.id ? { ...s, status: nextStatus } : s))
        );
        setFeedback({
          type: "success",
          text: `Staff member ${user.name} marked as ${nextStatus}.`,
        });
      }
    } catch {
      setFeedback({ type: "error", text: "Failed to update user status." });
    }
  };

  return (
    <div className="space-y-6 pb-12 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-6">
        <div>
          <h1 className="text-2xl font-light text-[#f5f1e8] font-serif flex items-center gap-3">
            <UserCog className="text-[#d8b36a]" size={24} />
            Staff Access &amp; RBAC Roles
          </h1>
          <p className="text-xs text-[#9a9995] font-light mt-1">
            Super Admin access controls, administrative staff credentials, and active permission management.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => loadStaff(true)}
            disabled={refreshing}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-white/10 text-xs text-[#9a9995] hover:text-[#f5f1e8] hover:border-white/20 transition"
          >
            <RefreshCw size={13} className={refreshing ? "animate-spin text-[#d8b36a]" : ""} />
            Refresh
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#d8b36a] text-[#070707] font-semibold text-xs hover:bg-[#b98a43] transition shadow-lg shadow-[#d8b36a]/10"
          >
            <Plus size={14} />
            Invite Staff Member
          </button>
        </div>
      </div>

      {/* Feedback banner */}
      {feedback && (
        <div
          className={`p-3.5 rounded-xl border text-xs flex items-center justify-between ${
            feedback.type === "success"
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
              : "bg-red-500/10 border-red-500/30 text-red-400"
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === "success" ? <CheckCircle2 size={15} /> : <AlertCircle size={15} />}
            <span>{feedback.text}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="opacity-70 hover:opacity-100">
            <X size={14} />
          </button>
        </div>
      )}

      {/* Table */}
      <div className="admin-card rounded-2xl overflow-hidden border border-white/10 bg-[#0c0c0c]">
        {loading ? (
          <div className="p-12 text-center text-[#9a9995] text-xs flex flex-col items-center gap-3">
            <Loader2 size={20} className="animate-spin text-[#d8b36a]" />
            Loading team permissions...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-[#070707] border-b border-white/10 text-[#9a9995] font-mono text-[10px] uppercase">
                  <th className="p-4">Staff Ref</th>
                  <th className="p-4">Name</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">Role</th>
                  <th className="p-4">Last Active</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-[#f5f1e8] font-mono">
                {staff.map((s) => (
                  <tr key={s.id} className="hover:bg-white/5 transition">
                    <td className="p-4 text-[#d8b36a]">{s.id}</td>
                    <td className="p-4 font-sans font-medium">{s.name}</td>
                    <td className="p-4 text-[#9a9995] font-sans">{s.email}</td>
                    <td className="p-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] uppercase font-bold ${
                          s.role === "super_admin"
                            ? "bg-[#d8b36a]/15 text-[#d8b36a] border border-[#d8b36a]/30"
                            : s.role === "admin"
                            ? "bg-purple-500/15 text-purple-400 border border-purple-500/30"
                            : "bg-sky-500/15 text-sky-400 border border-sky-500/30"
                        }`}
                      >
                        {s.role}
                      </span>
                    </td>
                    <td className="p-4 text-[#9a9995] font-sans">{s.lastLogin}</td>
                    <td className="p-4 font-sans">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] ${
                          s.status === "ACTIVE"
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                            : "bg-red-500/10 text-red-400 border border-red-500/30"
                        }`}
                      >
                        {s.status}
                      </span>
                    </td>
                    <td className="p-4 text-right font-sans">
                      {s.role !== "super_admin" ? (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setEditUser(s)}
                            className="px-2 py-1 rounded-lg border border-white/10 text-[11px] text-[#9a9995] hover:text-[#f5f1e8] hover:border-white/20 transition"
                          >
                            Edit Role
                          </button>
                          <button
                            onClick={() => handleToggleStatus(s)}
                            className={`px-2 py-1 rounded-lg border text-[11px] transition ${
                              s.status === "ACTIVE"
                                ? "border-red-500/20 text-red-400 hover:bg-red-500/10"
                                : "border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/10"
                            }`}
                          >
                            {s.status === "ACTIVE" ? "Deactivate" : "Activate"}
                          </button>
                        </div>
                      ) : (
                        <span className="text-[11px] text-[#d8b36a]/70 font-mono">
                          Protected
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Invite Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleAddStaff}
            className="bg-[#0e0e0e] border border-white/15 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-base font-medium text-[#f5f1e8] flex items-center gap-2">
                <Plus size={18} className="text-[#d8b36a]" />
                Invite Staff Member
              </h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-[#9a9995] hover:text-[#f5f1e8]"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-[11px] uppercase font-mono text-[#9a9995] mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Patil"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-[#070707] border border-white/10 text-[#f5f1e8] focus:border-[#d8b36a] outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] uppercase font-mono text-[#9a9995] mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  placeholder="ramesh@aurevia.com"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-[#070707] border border-white/10 text-[#f5f1e8] focus:border-[#d8b36a] outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] uppercase font-mono text-[#9a9995] mb-1">
                  Role Permission
                </label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value as any)}
                  className="w-full p-2.5 rounded-xl bg-[#070707] border border-white/10 text-[#f5f1e8] focus:border-[#d8b36a] outline-none"
                >
                  <option value="staff">Staff (Inventory &amp; Verification Access)</option>
                  <option value="admin">Admin (Bookings, Refunds &amp; Settings Access)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] uppercase font-mono text-[#9a9995] mb-1">
                  Phone (Optional)
                </label>
                <input
                  type="text"
                  placeholder="+91 98000 00000"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-[#070707] border border-white/10 text-[#f5f1e8] focus:border-[#d8b36a] outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 rounded-xl border border-white/10 text-xs text-[#9a9995] hover:text-[#f5f1e8] transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-2 rounded-xl bg-[#d8b36a] text-[#070707] font-semibold text-xs hover:bg-[#b98a43] transition flex items-center gap-2"
              >
                {submitting && <Loader2 size={13} className="animate-spin" />}
                Send Invitation
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Edit Role Modal */}
      {editUser && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0e0e0e] border border-white/15 rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-base font-medium text-[#f5f1e8]">
                Edit Role: {editUser.name}
              </h3>
              <button
                onClick={() => setEditUser(null)}
                className="text-[#9a9995] hover:text-[#f5f1e8]"
              >
                <X size={16} />
              </button>
            </div>

            <p className="text-xs text-[#9a9995]">
              Select new access tier for this account:
            </p>

            <div className="space-y-2">
              <button
                onClick={() => handleUpdateRole("staff")}
                disabled={submitting}
                className={`w-full p-3 rounded-xl border text-left text-xs transition flex items-center justify-between ${
                  editUser.role === "staff"
                    ? "border-[#d8b36a] bg-[#d8b36a]/10 text-[#d8b36a]"
                    : "border-white/10 hover:border-white/20 text-[#f5f1e8]"
                }`}
              >
                <div>
                  <span className="font-semibold block">STAFF</span>
                  <span className="text-[10px] text-[#9a9995]">
                    Can verify KYC, inspect returns, and manage equipment units
                  </span>
                </div>
              </button>

              <button
                onClick={() => handleUpdateRole("admin")}
                disabled={submitting}
                className={`w-full p-3 rounded-xl border text-left text-xs transition flex items-center justify-between ${
                  editUser.role === "admin"
                    ? "border-[#d8b36a] bg-[#d8b36a]/10 text-[#d8b36a]"
                    : "border-white/10 hover:border-white/20 text-[#f5f1e8]"
                }`}
              >
                <div>
                  <span className="font-semibold block">ADMIN</span>
                  <span className="text-[10px] text-[#9a9995]">
                    Can authorize refunds, manage coupons, and adjust operational settings
                  </span>
                </div>
              </button>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setEditUser(null)}
                className="px-4 py-2 rounded-xl border border-white/10 text-xs text-[#9a9995] hover:text-[#f5f1e8] transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
