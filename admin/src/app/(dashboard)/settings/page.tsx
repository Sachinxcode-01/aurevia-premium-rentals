"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Settings, Save, ShieldCheck, DollarSign, Clock, MapPin,
  Phone, Mail, CheckCircle2, AlertCircle, Wrench, Loader2
} from "lucide-react";
import { adminApiClient } from "@/lib/api-client";

type SettingsTab = "financial" | "concierge" | "automation";

interface SettingsForm {
  minDeposit: number;
  lateFeeHourly: number;
  gstRate: number;
  cancellationWindowHours: number;
  conciergePhone: string;
  supportEmail: string;
  studioAddress: string;
  autoMaintenanceHold: boolean;
  maintenanceThresholdDays: number;
  enableEmailAlerts: boolean;
  updatedAt?: string;
  updatedBy?: string;
}

const INITIAL_STATE: SettingsForm = {
  minDeposit: 2000,
  lateFeeHourly: 500,
  gstRate: 18,
  cancellationWindowHours: 24,
  conciergePhone: "+91 91138 27339",
  supportEmail: "concierge@aurevia.com",
  studioAddress: "Near DC Office, Gadag - 582101, Karnataka",
  autoMaintenanceHold: true,
  maintenanceThresholdDays: 30,
  enableEmailAlerts: true,
};

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>("financial");
  const [form, setForm] = useState<SettingsForm>(INITIAL_STATE);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const loadSettings = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminApiClient.settings.get();
      if (res.success && res.data) {
        setForm((prev) => ({ ...prev, ...res.data }));
      }
    } catch {
      // Use initial state fallback
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const handleChange = (field: keyof SettingsForm, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFeedback(null);

    try {
      const res = await adminApiClient.settings.update(form);
      if (res.success) {
        setFeedback({
          type: "success",
          message: "Operational settings successfully saved and applied to system.",
        });
        if (res.data) {
          setForm((prev) => ({ ...prev, ...res.data }));
        }
      } else {
        setFeedback({
          type: "error",
          message: res.error?.message || res.message || "Failed to update settings.",
        });
      }
    } catch (err: any) {
      setFeedback({
        type: "error",
        message: err?.message || "Network error while saving settings.",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 pb-12 max-w-4xl">
      {/* Header */}
      <div className="border-b border-white/5 pb-6">
        <h1 className="text-2xl font-light text-[#f5f1e8] font-serif flex items-center gap-3">
          <Settings className="text-[#d8b36a]" size={24} />
          Operational &amp; Business Rules Settings
        </h1>
        <p className="text-xs text-[#9a9995] font-light mt-1">
          Configure security deposits, late return hourly penalties, concierge dispatch contacts, and automated safety holds.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/10 gap-2">
        <button
          type="button"
          onClick={() => setActiveTab("financial")}
          className={`pb-3 px-3 text-xs font-medium transition border-b-2 flex items-center gap-2 ${
            activeTab === "financial"
              ? "border-[#d8b36a] text-[#d8b36a]"
              : "border-transparent text-[#9a9995] hover:text-[#f5f1e8]"
          }`}
        >
          <DollarSign size={14} />
          Financial &amp; Pricing Rules
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("concierge")}
          className={`pb-3 px-3 text-xs font-medium transition border-b-2 flex items-center gap-2 ${
            activeTab === "concierge"
              ? "border-[#d8b36a] text-[#d8b36a]"
              : "border-transparent text-[#9a9995] hover:text-[#f5f1e8]"
          }`}
        >
          <Phone size={14} />
          Concierge &amp; Studio Address
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("automation")}
          className={`pb-3 px-3 text-xs font-medium transition border-b-2 flex items-center gap-2 ${
            activeTab === "automation"
              ? "border-[#d8b36a] text-[#d8b36a]"
              : "border-transparent text-[#9a9995] hover:text-[#f5f1e8]"
          }`}
        >
          <Wrench size={14} />
          Automations &amp; Alerts
        </button>
      </div>

      {/* Feedback Alert */}
      {feedback && (
        <div
          className={`p-4 rounded-xl border text-xs flex items-center gap-3 ${
            feedback.type === "success"
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
              : "bg-red-500/10 border-red-500/30 text-red-400"
          }`}
        >
          {feedback.type === "success" ? (
            <CheckCircle2 size={16} />
          ) : (
            <AlertCircle size={16} />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {loading ? (
        <div className="admin-card p-12 rounded-2xl border border-white/10 text-center text-[#9a9995] text-xs flex flex-col items-center gap-3">
          <Loader2 size={22} className="animate-spin text-[#d8b36a]" />
          Loading system parameters...
        </div>
      ) : (
        <form onSubmit={handleSave} className="space-y-6 text-xs">
          {/* Tab 1: Financial & Pricing Rules */}
          {activeTab === "financial" && (
            <div className="admin-card p-6 rounded-2xl border border-white/10 space-y-5 bg-[#0c0c0c]">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-[#9a9995] font-mono text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                    <ShieldCheck size={13} className="text-[#d8b36a]" />
                    Minimum Security Deposit (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="100"
                    value={form.minDeposit}
                    onChange={(e) => handleChange("minDeposit", Number(e.target.value))}
                    className="w-full bg-[#070707] border border-white/10 rounded-xl p-3 text-[#f5f1e8] font-mono focus:border-[#d8b36a] outline-none"
                  />
                  <p className="text-[10px] text-[#9a9995]/70">
                    Mandatory refundable deposit held for high-value cine camera packages.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[#9a9995] font-mono text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                    <Clock size={13} className="text-[#d8b36a]" />
                    Late Return Penalty (₹ / Hour)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="50"
                    value={form.lateFeeHourly}
                    onChange={(e) => handleChange("lateFeeHourly", Number(e.target.value))}
                    className="w-full bg-[#070707] border border-white/10 rounded-xl p-3 text-[#f5f1e8] font-mono focus:border-[#d8b36a] outline-none"
                  />
                  <p className="text-[10px] text-[#9a9995]/70">
                    Billed per hour past scheduled return time prior to equipment check-in.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[#9a9995] font-mono text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                    <DollarSign size={13} className="text-[#d8b36a]" />
                    GST Tax Rate (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="28"
                    step="1"
                    value={form.gstRate}
                    onChange={(e) => handleChange("gstRate", Number(e.target.value))}
                    className="w-full bg-[#070707] border border-white/10 rounded-xl p-3 text-[#f5f1e8] font-mono focus:border-[#d8b36a] outline-none"
                  />
                  <p className="text-[10px] text-[#9a9995]/70">
                    Standard GST percentage calculated on invoices (18% statutory rate).
                  </p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[#9a9995] font-mono text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                    <Clock size={13} className="text-[#d8b36a]" />
                    Free Cancellation Window (Hours)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="72"
                    step="1"
                    value={form.cancellationWindowHours}
                    onChange={(e) => handleChange("cancellationWindowHours", Number(e.target.value))}
                    className="w-full bg-[#070707] border border-white/10 rounded-xl p-3 text-[#f5f1e8] font-mono focus:border-[#d8b36a] outline-none"
                  />
                  <p className="text-[10px] text-[#9a9995]/70">
                    Hours before shoot start when full 100% automated refund is allowed.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Concierge & Studio Details */}
          {activeTab === "concierge" && (
            <div className="admin-card p-6 rounded-2xl border border-white/10 space-y-5 bg-[#0c0c0c]">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-[#9a9995] font-mono text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                    <Phone size={13} className="text-[#d8b36a]" />
                    Concierge Dispatch Phone
                  </label>
                  <input
                    type="text"
                    value={form.conciergePhone}
                    onChange={(e) => handleChange("conciergePhone", e.target.value)}
                    className="w-full bg-[#070707] border border-white/10 rounded-xl p-3 text-[#f5f1e8] font-mono focus:border-[#d8b36a] outline-none"
                  />
                  <p className="text-[10px] text-[#9a9995]/70">
                    Published on booking confirmation SMS &amp; WhatsApp concierge links.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[#9a9995] font-mono text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                    <Mail size={13} className="text-[#d8b36a]" />
                    Official Support Email
                  </label>
                  <input
                    type="email"
                    value={form.supportEmail}
                    onChange={(e) => handleChange("supportEmail", e.target.value)}
                    className="w-full bg-[#070707] border border-white/10 rounded-xl p-3 text-[#f5f1e8] font-mono focus:border-[#d8b36a] outline-none"
                  />
                  <p className="text-[10px] text-[#9a9995]/70">
                    Automated rental invoices and ticket notifications sender address.
                  </p>
                </div>

                <div className="sm:col-span-2 space-y-1.5">
                  <label className="text-[#9a9995] font-mono text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                    <MapPin size={13} className="text-[#d8b36a]" />
                    Studio Pickup &amp; Return Address
                  </label>
                  <textarea
                    rows={3}
                    value={form.studioAddress}
                    onChange={(e) => handleChange("studioAddress", e.target.value)}
                    className="w-full bg-[#070707] border border-white/10 rounded-xl p-3 text-[#f5f1e8] focus:border-[#d8b36a] outline-none"
                  />
                  <p className="text-[10px] text-[#9a9995]/70">
                    Physical location printed on equipment rental passes and map navigations.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Tab 3: Automations & Platform Safety */}
          {activeTab === "automation" && (
            <div className="admin-card p-6 rounded-2xl border border-white/10 space-y-5 bg-[#0c0c0c]">
              <div className="space-y-4">
                <label className="flex items-start gap-3 p-3.5 rounded-xl border border-white/10 bg-[#070707] cursor-pointer hover:border-white/20 transition">
                  <input
                    type="checkbox"
                    checked={form.autoMaintenanceHold}
                    onChange={(e) => handleChange("autoMaintenanceHold", e.target.checked)}
                    className="mt-1 accent-[#d8b36a]"
                  />
                  <div>
                    <span className="font-medium text-[#f5f1e8] block">
                      Automatic Post-Rental Maintenance Hold
                    </span>
                    <span className="text-[11px] text-[#9a9995]">
                      When equipment is returned from a rental, automatically mark its status as "maintenance" for 2 hours to allow lens calibration and sensor cleaning.
                    </span>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-3.5 rounded-xl border border-white/10 bg-[#070707] cursor-pointer hover:border-white/20 transition">
                  <input
                    type="checkbox"
                    checked={form.enableEmailAlerts}
                    onChange={(e) => handleChange("enableEmailAlerts", e.target.checked)}
                    className="mt-1 accent-[#d8b36a]"
                  />
                  <div>
                    <span className="font-medium text-[#f5f1e8] block">
                      Staff Operational Alerts via Email
                    </span>
                    <span className="text-[11px] text-[#9a9995]">
                      Notify Sachin and Prem whenever a new high-tier booking, cancellation refund claim, or urgent support ticket is opened.
                    </span>
                  </div>
                </label>

                <div className="space-y-1.5 pt-2 max-w-sm">
                  <label className="text-[#9a9995] font-mono text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                    <Wrench size={13} className="text-[#d8b36a]" />
                    Routine Maintenance Cycle (Days)
                  </label>
                  <input
                    type="number"
                    min="7"
                    max="90"
                    step="1"
                    value={form.maintenanceThresholdDays}
                    onChange={(e) => handleChange("maintenanceThresholdDays", Number(e.target.value))}
                    className="w-full bg-[#070707] border border-white/10 rounded-xl p-3 text-[#f5f1e8] font-mono focus:border-[#d8b36a] outline-none"
                  />
                  <p className="text-[10px] text-[#9a9995]/70">
                    Triggers a scheduled inspection reminder on the Fleet Maintenance Calendar.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Footer Save Button */}
          <div className="flex items-center justify-between pt-2">
            <span className="text-[11px] text-[#9a9995]">
              {form.updatedAt
                ? `Last modified: ${new Date(form.updatedAt).toLocaleString()} ${form.updatedBy ? `by ${form.updatedBy}` : ""}`
                : "Operational parameters active"}
            </span>

            <button
              type="submit"
              disabled={saving}
              className="px-6 py-3 rounded-xl bg-[#d8b36a] text-[#070707] font-semibold text-xs hover:bg-[#b98a43] transition flex items-center gap-2 shadow-lg shadow-[#d8b36a]/10 disabled:opacity-50"
            >
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              <span>{saving ? "SAVING..." : "SAVE OPERATIONAL PARAMETERS"}</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
