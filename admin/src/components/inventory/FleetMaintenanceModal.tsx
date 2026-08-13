"use client";

import React, { useState } from "react";
import { X, Wrench, CheckCircle2 } from "lucide-react";

interface FleetMaintenanceModalProps {
  equipmentName: string;
  serialNumber: string;
  onClose: () => void;
  onSave: () => void;
}

export default function FleetMaintenanceModal({
  equipmentName,
  serialNumber,
  onClose,
  onSave,
}: FleetMaintenanceModalProps) {
  const [shutterCount, setShutterCount] = useState("48,250 Clicks");
  const [firmwareVersion, setFirmwareVersion] = useState("v3.01 Production Stable");
  const [sensorStatus, setSensorStatus] = useState("Cleaned & Calibrated (Pass)");
  const [lockDowntime, setLockDowntime] = useState(false);
  const [downtimeReason, setDowntimeReason] = useState("Scheduled Sensor Cleaning & Firmware Flash");
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => {
      onSave();
      onClose();
    }, 1200);
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
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-white transition cursor-pointer">
            <X size={18} />
          </button>
        </div>

        {saved ? (
          <div className="py-8 text-center space-y-3">
            <CheckCircle2 size={42} className="text-emerald-400 mx-auto animate-bounce" />
            <h3 className="text-sm font-semibold text-[#f5f1e8]">Maintenance Log Saved!</h3>
            <p className="text-xs text-gray-400 font-mono">
              Equipment availability calendar updated with service status.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Shutter Count */}
            <div className="space-y-1">
              <label className="text-xs font-mono uppercase text-gray-400 block">Shutter / Operational Counter</label>
              <input
                type="text"
                value={shutterCount}
                onChange={(e) => setShutterCount(e.target.value)}
                className="w-full bg-black border border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-[#f5f1e8] focus:border-[#d8b36a] focus:outline-none"
              />
            </div>

            {/* Firmware Version */}
            <div className="space-y-1">
              <label className="text-xs font-mono uppercase text-gray-400 block">Firmware Build</label>
              <input
                type="text"
                value={firmwareVersion}
                onChange={(e) => setFirmwareVersion(e.target.value)}
                className="w-full bg-black border border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-[#f5f1e8] focus:border-[#d8b36a] focus:outline-none"
              />
            </div>

            {/* Sensor Status */}
            <div className="space-y-1">
              <label className="text-xs font-mono uppercase text-gray-400 block">Sensor &amp; Optical Calibration</label>
              <input
                type="text"
                value={sensorStatus}
                onChange={(e) => setSensorStatus(e.target.value)}
                className="w-full bg-black border border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-[#f5f1e8] focus:border-[#d8b36a] focus:outline-none"
              />
            </div>

            {/* Lock Maintenance Downtime Toggle */}
            <div className="p-4 bg-white/5 border border-white/10 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-[#f5f1e8] block">Lock Maintenance Downtime</span>
                  <span className="text-[10px] text-gray-400 font-mono">Hides unit from customer booking calendar during service</span>
                </div>
                <input
                  type="checkbox"
                  checked={lockDowntime}
                  onChange={(e) => setLockDowntime(e.target.checked)}
                  className="w-4 h-4 accent-[#d8b36a] cursor-pointer"
                />
              </div>

              {lockDowntime && (
                <div className="space-y-2 pt-2 border-t border-white/10">
                  <label className="text-[10px] font-mono uppercase text-[#d8b36a] block">Service Reason</label>
                  <input
                    type="text"
                    value={downtimeReason}
                    onChange={(e) => setDowntimeReason(e.target.value)}
                    className="w-full bg-black border border-[#d8b36a]/40 rounded-lg px-3 py-1.5 text-xs font-mono text-[#f5f1e8] focus:outline-none"
                  />
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs text-gray-400 font-mono transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-6 py-2 rounded-xl bg-[#d8b36a] hover:bg-[#b98a43] text-black font-bold text-xs uppercase font-mono tracking-wider transition cursor-pointer"
              >
                Save Maintenance Record
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
