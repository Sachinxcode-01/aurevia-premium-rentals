"use client";

import React, { useState } from "react";
import { FileSpreadsheet, Download, Filter, Calendar } from "lucide-react";

export default function AdminReportsPage() {
  const [reportType, setReportType] = useState("bookings");

  const exportReport = () => {
    const csvContent = "Data,Exported,From,AUREVIA,Admin\n1,2,3,4,5";
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `AUREVIA_${reportType.toUpperCase()}_Report_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="border-b border-white/5 pb-6">
        <h1 className="text-2xl font-light text-[#f5f1e8] font-serif flex items-center gap-3">
          <FileSpreadsheet className="text-emerald-400" size={24} />
          Operational &amp; Tax Reports Center
        </h1>
        <p className="text-xs text-[#9a9995] font-light mt-1">
          Generate structured CSV exports for accounting, fleet audit, and tax compliance.
        </p>
      </div>

      <div className="admin-card p-6 rounded-2xl border border-white/10 space-y-6 max-w-xl">
        <div className="space-y-2 text-xs">
          <label className="text-[#9a9995] font-mono uppercase">Select Report Dataset</label>
          <select
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
            className="w-full bg-[#070707] border border-white/10 rounded-xl p-3 text-[#f5f1e8] font-mono outline-none"
          >
            <option value="bookings">Complete Reservations &amp; Rental Log</option>
            <option value="revenue">Financial Revenue &amp; Razorpay Transactions</option>
            <option value="inventory">Fleet Utilization &amp; Serial Inventory Status</option>
            <option value="kyc">Customer KYC Verification Log</option>
          </select>
        </div>

        <button
          onClick={exportReport}
          className="w-full py-3 rounded-xl bg-[#d8b36a] text-[#070707] font-semibold text-xs hover:bg-[#b98a43] transition flex items-center justify-center gap-2 shadow-lg shadow-[#d8b36a]/10"
        >
          <Download size={16} />
          <span>EXPORT CSV REPORT</span>
        </button>
      </div>
    </div>
  );
}
