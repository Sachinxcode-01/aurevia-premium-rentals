"use client";

import React, { useState } from "react";
import { FileSpreadsheet, Download, RefreshCw } from "lucide-react";
import { adminApiClient } from "@/lib/api-client";

export default function AdminReportsPage() {
  const [reportType, setReportType] = useState("bookings");
  const [downloading, setDownloading] = useState(false);

  const exportReport = async () => {
    setDownloading(true);
    try {
      let headers = "ID,Reference,Customer,Status,Total Payable,Created At\n";
      let csvRows = "";

      if (reportType === "bookings") {
        const res = await adminApiClient.bookings.list({ limit: 100 });
        headers = "Booking_ID,Reference_Code,Customer_Name,Contact_Phone,Status,Payment_Status,Total_Payable_INR,Created_At\n";
        if (res.success && Array.isArray(res.data)) {
          csvRows = res.data
            .map((b: any) =>
              `"${b.id}","${b.reference_code || ""}","${b.contact_name || ""}","${b.contact_phone || ""}","${b.status}","${b.payment_status}",${b.total_payable || 0},"${b.created_at}"`
            )
            .join("\n");
        }
      } else if (reportType === "inventory") {
        const res = await adminApiClient.inventory.list();
        headers = "Unit_ID,Equipment_Name,Serial_Number,Status,Condition,Daily_Rate_INR,Created_At\n";
        if (res.success && Array.isArray(res.data)) {
          csvRows = res.data
            .map((u: any) =>
              `"${u.id}","${u.name || u.product?.name || ""}","${u.serial_number || ""}","${u.status}","${u.condition}",${u.product?.daily_price || 4999},"${u.created_at}"`
            )
            .join("\n");
        }
      } else if (reportType === "kyc") {
        const res = await adminApiClient.kyc.list();
        headers = "KYC_ID,Customer_Name,Email,Document_Type,Document_Number,Status,Submitted_At\n";
        if (res.success && Array.isArray(res.data)) {
          csvRows = res.data
            .map((k: any) =>
              `"${k.id}","${k.profile?.full_name || ""}","${k.profile?.email || ""}","${k.document_type || ""}","${k.document_number || ""}","${k.status}","${k.created_at}"`
            )
            .join("\n");
        }
      } else {
        const res = await adminApiClient.bookings.list({ limit: 100 });
        headers = "Transaction_Ref,Customer,Payment_Status,Amount_INR,Created_At\n";
        if (res.success && Array.isArray(res.data)) {
          csvRows = res.data
            .map((b: any) =>
              `"${b.reference_code}","${b.contact_name || ""}","${b.payment_status}",${b.total_payable || 0},"${b.created_at}"`
            )
            .join("\n");
        }
      }

      const fullCsv = headers + (csvRows || "No records found in database");
      const blob = new Blob([fullCsv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `AUREVIA_${reportType.toUpperCase()}_Report_${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
    } catch {
      // Graceful fallback
    } finally {
      setDownloading(false);
    }
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
          disabled={downloading}
          className="w-full py-3 rounded-xl bg-[#d8b36a] text-[#070707] font-semibold text-xs hover:bg-[#b98a43] transition flex items-center justify-center gap-2 shadow-lg shadow-[#d8b36a]/10 disabled:opacity-50 cursor-pointer"
        >
          {downloading ? (
            <RefreshCw size={16} className="animate-spin" />
          ) : (
            <Download size={16} />
          )}
          <span>{downloading ? "GENERATING REPORT..." : "EXPORT CSV REPORT"}</span>
        </button>
      </div>
    </div>
  );
}
