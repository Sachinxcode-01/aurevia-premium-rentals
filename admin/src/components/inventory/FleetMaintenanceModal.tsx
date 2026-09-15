"use client";

import React, { useState } from "react";
import { X, Wrench, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { adminApiClient } from "@/lib/api-client";
import { realtimeHub } from "@/lib/realtime/realtimeHub";

interface FleetMaintenanceModalProps {
  equipmentName: string;
  serialNumber: string;
  currentStatus?: string;
  initialNotes?: string;
  onClose: () => void;
  onSave: (newStatus: "AVAILABLE" | "MAINTENANCE") => void;
}

export default function FleetMaintenanceModal({
  equipmentName,
  serialNumber,
  currentStatus = "AVAILABLE",
  initialNotes = "",
  onClose,
  onSave,
}: FleetMaintenanceModalProps) {
  // Parse initial notes if available
  const extractNotePart = (prefix: string, fallback: string) => {
    if (!initialNotes) return fallback;
    const match = initialNotes.match(new RegExp(prefix + ":\\s*([^|]+)"));
    return match ? match[1].trim() : fallback;
  };

  const isInitiallyMaintenance = currentStatus?.toUpperCase() === "MAINTENANCE";

  const [shutterCount, setShutterCount] = useState(() =>
    extractNotePart("Shutter", "48,250 Clicks")
  );
  const [firmwareVersion, setFirmwareVersion] = useState(() =>
    extractNotePart("FW", "v3.01 Production Stable")
  );
  const [sensorStatus, setSensorStatus] = useState(() =>
    extractNotePart("Sensor", "Cleaned & Calibrated (Pass)")
  );
  const [lockDowntime, setLockDowntime] = useState(isInitiallyMaintenance);
  const [downtimeReason, setDowntimeReason] = useState(() => {
    if (!initialNotes) return "Scheduled Sensor Cleaning & Firmware Flash";
    const firstPart = initialNotes.split("|")[0]?.replace(/\s*\([^)]*\)\s*/, "").trim();
    return firstPart || "Scheduled Sensor Cleaning & Firmware Flash";
  });

  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    if (lockDowntime && !downtimeReason.trim()) {
      setErrorMessage("Please enter a service reason for downtime lock.");
      return;
    }

    setIsSaving(true);
    setErrorMessage(null);

    const targetStatus = lockDowntime ? "maintenance" : "available";
    const formattedNotes =
      downtimeReason.trim() +
      " (" +
      serialNumber +
      ") | Shutter: " +
      shutterCount.trim() +
      " | FW: " +
      firmwareVersion.trim() +
      " | Sensor: " +
      sensorStatus.trim();

    try {
      if (serialNumber) {
        await adminApiClient.inventory.update(serialNumber, {
          status: targetStatus,
          notes: formattedNotes,
        });

        realtimeHub.broadcast(
          "INVENTORY_UPDATED",
          { serialNumber, status: targetStatus },
          "admin"
        );
      }

      setSaved(true);
      setTimeout(() => {
        onSave(lockDowntime ? "MAINTENANCE" : "AVAILABLE");
        onClose();
      }, 1200);
    } catch (err: any) {
      setErrorMessage(
        err?.message || "Failed to save maintenance record. Please verify your connection."
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="relative max-w-lg w-full bg-[#0a0a0a] border border-[#d8b36a]/30 rounded-2xl p-6 space-y-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#d8b36a]/15 text-[#d8b36a] border border-[#d8b36a]/30">
              <Wrench size={20} />
            </div>
            <div>
              <span className="text-[10px] text-[#d8b36a] uppercase tracking-widest font-mono font-bold block">
                FLEET MAINTENANCE &amp; CALIBRATION
              </span>
              <h2 className="text-base font-semibold text-[#f5f1e8] font-serif">
                {equipmentName}
              </h2>
              <p className="text-[10px] font-mono text-gray-400">SN: {serialNumber}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isSaving}
            className="p-2 text-gray-400 hover:text-white transition cursor-pointer disabled:opacity-50"
          >
            <X size={18} />
          </button>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="p-3 bg-red-950/40 border border-red-500/30 rounded-xl flex items-start gap-2.5 text-xs text-red-200">
            <AlertCircle size={16} className="text-red-400 shrink-0 mt-0.5" />
            <span className="leading-snug">{errorMessage}</span>
          </div>
        )}

        {saved ? (
          <div className="py-8 text-center space-y-3">
            <CheckCircle2 size={42} className="text-emerald-400 mx-auto animate-bounce" />
            <h3 className="text-sm font-semibold text-[#f5f1e8]">Maintenance Log Saved!</h3>
            <p className="text-xs text-gray-400 font-mono">
              Equipment availability calendar updated to{" "}
              <span className="text-[#d8b36a] font-bold">
                {lockDowntime ? "MAINTENANCE DOWNTIME" : "AVAILABLE IN FLEET"}
              </span>
              .
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Shutter Count */}
            <div className="space-y-1">
              <label className="text-xs font-mono uppercase text-gray-400 block">
                Shutter / Operational Counter
              </label>
              <input
                type="text"
                value={shutterCount}
                onChange={(e) => setShutterCount(e.target.value)}
                disabled={isSaving}
                className="w-full bg-black border border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-[#f5f1e8] focus:outline-none focus:ring-1 focus:ring-[#d8b36a]"
              />
            </div>

            {/* Firmware Version */}
            <div className="space-y-1">
              <label className="text-xs font-mono uppercase text-gray-400 block">
                Firmware Build
              </label>
              <input
                type="text"
                value={firmwareVersion}
                onChange={(e) => setFirmwareVersion(e.target.value)}
                disabled={isSaving}
                className="w-full bg-black border border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-[#f5f1e8] focus:outline-none focus:ring-1 focus:ring-[#d8b36a]"
              />
            </div>

            {/* Sensor Status */}
            <div className="space-y-1">
              <label className="text-xs font-mono uppercase text-gray-400 block">
                Sensor &amp; Optical Calibration
              </label>
              <input
                type="text"
                value={sensorStatus}
                onChange={(e) => setSensorStatus(e.target.value)}
                disabled={isSaving}
                className="w-full bg-black border border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-[#f5f1e8] focus:outline-none focus:ring-1 focus:ring-[#d8b36a]"
              />
            </div>

            {/* Lock Maintenance Downtime Toggle */}
            <div className="p-4 bg-white/5 border border-white/10 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-[#f5f1e8] block">
                    Lock Maintenance Downtime
                  </span>
                  <span className="text-[10px] text-gray-400 font-mono">
                    {lockDowntime
                      ? "Hides unit from customer booking calendar during service"
                      : "Unit marked ready & available for customer bookings"}
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={lockDowntime}
                  onChange={(e) => setLockDowntime(e.target.checked)}
                  disabled={isSaving}
                  className="w-4 h-4 accent-[#d8b36a] cursor-pointer"
                />
              </div>

              {lockDowntime && (
                <div className="space-y-2 pt-2 border-t border-white/10">
                  <label className="text-[10px] font-mono uppercase text-[#d8b36a] block">
                    Service Reason
                  </label>
                  <input
                    type="text"
                    value={downtimeReason}
                    onChange={(e) => setDowntimeReason(e.target.value)}
                    disabled={isSaving}
                    placeholder="e.g. Scheduled Sensor Cleaning & Firmware Flash"
                    className="w-full bg-black border border-[#d8b36a]/40 rounded-lg px-3 py-1.5 text-xs font-mono text-[#f5f1e8] focus:outline-none"
                  />
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
              <button
                onClick={onClose}
                disabled={isSaving}
                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs text-gray-400 font-mono transition cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="px-6 py-2 rounded-xl bg-[#d8b36a] hover:bg-[#b98a43] text-black font-bold text-xs uppercase font-mono tracking-wider transition cursor-pointer flex items-center gap-2 disabled:opacity-60"
              >
                {isSaving && <Loader2 size={14} className="animate-spin" />}
                {isSaving ? "Saving..." : "Save Maintenance Record"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
