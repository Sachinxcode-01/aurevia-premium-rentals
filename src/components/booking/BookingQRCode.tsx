"use client";

import React from "react";
import { QrCode, ShieldCheck, Key } from "lucide-react";

interface BookingQRCodeProps {
  referenceCode: string;
  customerPhone?: string;
  pickupOTP?: string;
}

export default function BookingQRCode({ referenceCode, customerPhone = "+91 96869 09048", pickupOTP = "1358" }: BookingQRCodeProps) {
  // Simple high-contrast SVG QR-code representation generator
  return (
    <div className="bg-[#121212] border border-[#D8B36A]/30 p-5 rounded-2xl shadow-2xl text-center space-y-4 max-w-sm mx-auto">
      <div className="flex items-center justify-between border-b border-white/10 pb-3">
        <div className="flex items-center gap-1.5 text-xs font-mono text-[#D8B36A] font-bold uppercase tracking-widest">
          <QrCode size={16} />
          <span>Aurevia Digital Verification Pass</span>
        </div>
        <span className="text-[9px] px-2 py-0.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded font-mono uppercase">
          VERIFIED
        </span>
      </div>

      <div className="bg-white p-4 rounded-xl inline-block border-4 border-[#D8B36A]/40 shadow-inner">
        {/* High contrast SVG QR mockup */}
        <svg className="w-40 h-40" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="100" height="100" fill="white" />
          {/* Outer corners */}
          <rect x="5" y="5" width="25" height="25" fill="#111" />
          <rect x="9" y="9" width="17" height="17" fill="white" />
          <rect x="13" y="13" width="9" height="9" fill="#111" />

          <rect x="70" y="5" width="25" height="25" fill="#111" />
          <rect x="74" y="9" width="17" height="17" fill="white" />
          <rect x="78" y="13" width="9" height="9" fill="#111" />

          <rect x="5" y="70" width="25" height="25" fill="#111" />
          <rect x="9" y="74" width="17" height="17" fill="white" />
          <rect x="13" y="78" width="9" height="9" fill="#111" />

          {/* Random pattern data cells */}
          <rect x="35" y="10" width="8" height="8" fill="#111" />
          <rect x="48" y="15" width="12" height="6" fill="#111" />
          <rect x="38" y="35" width="10" height="10" fill="#D8B36A" />
          <rect x="55" y="40" width="15" height="8" fill="#111" />
          <rect x="35" y="65" width="10" height="15" fill="#111" />
          <rect x="75" y="45" width="12" height="12" fill="#111" />
          <rect x="50" y="75" width="20" height="10" fill="#111" />
        </svg>
      </div>

      <div className="space-y-2">
        <div className="text-xs text-gray-400 font-mono">
          Ref: <strong className="text-white font-bold">{referenceCode}</strong>
        </div>

        <div className="bg-[#D8B36A]/10 border border-[#D8B36A]/30 p-2.5 rounded-lg flex items-center justify-between text-xs">
          <span className="text-gray-300 font-mono flex items-center gap-1.5">
            <Key size={14} className="text-[#D8B36A]" /> Handover OTP:
          </span>
          <span className="font-mono text-sm font-bold tracking-widest text-[#D8B36A] bg-black px-2 py-0.5 rounded border border-[#D8B36A]/40">
            {pickupOTP}
          </span>
        </div>
      </div>

      <p className="text-[10px] text-gray-500 font-sans">
        Show this QR pass or OTP at the rental counter during equipment pickup.
      </p>
    </div>
  );
}
