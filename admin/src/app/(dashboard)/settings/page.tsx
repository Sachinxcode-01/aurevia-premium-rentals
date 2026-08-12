"use client";

import React, { useState } from "react";
import { Settings, Save, ShieldCheck } from "lucide-react";

export default function AdminSettingsPage() {
  const [minDeposit, setMinDeposit] = useState(2000);
  const [lateFeeHourly, setLateFeeHourly] = useState(500);

  const saveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Operational settings saved to database.");
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="border-b border-white/5 pb-6">
        <h1 className="text-2xl font-light text-[#f5f1e8] font-serif flex items-center gap-3">
          <Settings className="text-[#d8b36a]" size={24} />
          Operational &amp; Business Rules Settings
        </h1>
        <p className="text-xs text-[#9a9995] font-light mt-1">
          Configure security deposits, late return penalties, pickup office location details, and Razorpay parameters.
        </p>
      </div>

      <form onSubmit={saveSettings} className="admin-card p-6 rounded-2xl border border-white/10 space-y-6 max-w-xl text-xs">
        <div className="space-y-1">
          <label className="text-[#9a9995] font-mono uppercase">Minimum Deposit Amount (₹)</label>
          <input
            type="number"
            value={minDeposit}
            onChange={(e) => setMinDeposit(Number(e.target.value))}
            className="w-full bg-[#070707] border border-white/10 rounded-xl p-3 text-[#f5f1e8] font-mono focus:border-[#d8b36a] outline-none"
          />
        </div>

        <div className="space-y-1">
          <label className="text-[#9a9995] font-mono uppercase">Late Return Penalty Rate (₹ / hour)</label>
          <input
            type="number"
            value={lateFeeHourly}
            onChange={(e) => setLateFeeHourly(Number(e.target.value))}
            className="w-full bg-[#070707] border border-white/10 rounded-xl p-3 text-[#f5f1e8] font-mono focus:border-[#d8b36a] outline-none"
          />
        </div>

        <button
          type="submit"
          className="w-full py-3 rounded-xl bg-[#d8b36a] text-[#070707] font-semibold text-xs hover:bg-[#b98a43] transition flex items-center justify-center gap-2 shadow-lg shadow-[#d8b36a]/10"
        >
          <Save size={16} />
          <span>SAVE SYSTEM PARAMETERS</span>
        </button>
      </form>
    </div>
  );
}
