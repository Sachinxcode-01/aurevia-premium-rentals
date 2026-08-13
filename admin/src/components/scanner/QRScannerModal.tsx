"use client";

import React, { useState } from "react";
import { X, QrCode, Search, CheckCircle2, ShieldAlert } from "lucide-react";

interface QRScannerModalProps {
  onClose: () => void;
  onScanSuccess: (bookingId: string) => void;
}

export default function QRScannerModal({ onClose, onScanSuccess }: QRScannerModalProps) {
  const [inputCode, setInputCode] = useState("");
  const [scanning, setScanning] = useState(false);

  const handleSimulateScan = (code: string) => {
    setScanning(true);
    setTimeout(() => {
      onScanSuccess(code);
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#121212] border border-[#D8B36A]/40 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-5 text-white">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-2">
            <QrCode className="text-[#D8B36A]" size={20} />
            <h3 className="font-mono text-sm font-bold text-white uppercase tracking-wider">
              Booking Pass QR &amp; OTP Scanner
            </h3>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-white/10 rounded text-gray-400 hover:text-white">
            <X size={18} />
          </button>
        </div>

        {/* Viewfinder Animation */}
        <div className="relative bg-black rounded-xl border-2 border-dashed border-[#D8B36A]/50 h-52 flex flex-col items-center justify-center overflow-hidden">
          <div className="absolute inset-0 bg-[#D8B36A]/5 animate-pulse"></div>
          <div className="w-36 h-36 border-2 border-[#D8B36A] rounded-lg relative flex items-center justify-center">
            <div className="w-full h-0.5 bg-[#D8B36A] shadow-[0_0_15px_#D8B36A] absolute top-1/2 animate-bounce"></div>
            <QrCode size={48} className="text-[#D8B36A]/30" />
          </div>
          <span className="text-[10px] font-mono text-gray-400 mt-3 relative z-10">
            Align Customer QR Pass within frame
          </span>
        </div>

        {/* Fast Action Shortcuts */}
        <div className="space-y-2">
          <label className="text-[10px] font-mono text-[#D8B36A] uppercase tracking-wider block">
            Quick Scan Simulation / Manual Input
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={inputCode}
              onChange={(e) => setInputCode(e.target.value)}
              placeholder="e.g. AUR-1042 or OTP 1358"
              className="flex-1 bg-black border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder-gray-500 focus:border-[#D8B36A] focus:outline-none font-mono"
            />
            <button
              onClick={() => handleSimulateScan(inputCode || "AUR-1042")}
              className="px-4 bg-[#D8B36A] hover:bg-[#c3a05b] text-black font-mono font-bold text-xs uppercase tracking-wider rounded-lg transition"
            >
              Verify
            </button>
          </div>
        </div>

        <div className="pt-2 border-t border-white/10 flex justify-around text-center font-mono text-[10px] text-gray-400">
          <button onClick={() => handleSimulateScan("AUR-1042")} className="hover:text-[#D8B36A] underline">
            AUR-1042 (Rahul V.)
          </button>
          <button onClick={() => handleSimulateScan("AUR-1041")} className="hover:text-[#D8B36A] underline">
            AUR-1041 (Ananya S.)
          </button>
        </div>
      </div>
    </div>
  );
}
