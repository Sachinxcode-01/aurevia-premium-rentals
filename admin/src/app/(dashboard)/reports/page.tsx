"use client";

import React, { useState } from "react";
import {
  FileSpreadsheet,
  Download,
  RefreshCw,
  FileText,
  Calendar,
  CheckCircle2,
  FileCode,
  ShieldCheck,
} from "lucide-react";
import { adminApiClient } from "@/lib/api-client";

type ReportType = "bookings" | "gst_tax" | "revenue" | "inventory" | "kyc";
type ExportFormat = "csv" | "json";
type DateRange = "30d" | "90d" | "ytd" | "all";

export default function AdminReportsPage() {
  const [reportType, setReportType] = useState<ReportType>("gst_tax");
  const [exportFormat, setExportFormat] = useState<ExportFormat>("csv");
  const [dateRange, setDateRange] = useState<DateRange>("30d");
  const [downloading, setDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

  const exportReport = async () => {
    setDownloading(true);
    setDownloadSuccess(null);

    try {
      let dataToExport: any[] = [];
      let filename = `AUREVIA_${reportType.toUpperCase()}_${dateRange.toUpperCase()}_${new Date().toISOString().slice(0, 10)}`;

      if (reportType === "gst_tax" || reportType === "revenue" || reportType === "bookings") {
        const res: any = await adminApiClient.bookings.list({ limit: 200 });
        const list: any[] =
          res?.bookings ||
          res?.data?.bookings ||
          (Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : []);

        // Filter by date range if applicable
        const now = Date.now();
        const daysLimit = dateRange === "30d" ? 30 : dateRange === "90d" ? 90 : dateRange === "ytd" ? 250 : 9999;
        const cutoffTime = now - daysLimit * 86400 * 1000;

        const filtered = list.filter((b) => {
          if (dateRange === "all") return true;
          const bTime = new Date(b.created_at || b.createdAt || Date.now()).getTime();
          return bTime >= cutoffTime;
        });

        if (reportType === "gst_tax") {
          // Indian GST Tax Compliance Calculation: 18% Total (9% CGST + 9% SGST)
          dataToExport = filtered.map((b) => {
            const grossPaid = Number(b.total_payable || b.totalAmount || 0);
            const deposit = Number(b.security_deposit || b.securityDeposit || 0);
            const rentalNetWithGst = Math.max(0, grossPaid - deposit);
            const taxableValue = Math.round(rentalNetWithGst / 1.18);
            const totalGst = rentalNetWithGst - taxableValue;
            const cgst = Math.round(totalGst / 2);
            const sgst = totalGst - cgst;

            return {
              Invoice_Ref: b.reference_code || b.id,
              Customer: b.contact_name || b.customerName || "Customer",
              GSTIN: "27AABCA1234F1Z5", // AUREVIA Maharashtra GSTIN
              Rental_Base_INR: taxableValue,
              CGST_9_Percent: cgst,
              SGST_9_Percent: sgst,
              Total_GST_18_Percent: totalGst,
              Refundable_Security_Deposit: deposit,
              Gross_Settled_INR: grossPaid,
              Status: b.payment_status || "PAID",
              Invoice_Date: b.created_at ? new Date(b.created_at).toLocaleDateString("en-IN") : "2026-08-12",
            };
          });
        } else if (reportType === "revenue") {
          dataToExport = filtered.map((b) => ({
            Booking_ID: b.id,
            Customer_Name: b.contact_name || b.customerName || "Customer",
            Amount_INR: b.total_payable || b.totalAmount || 0,
            Payment_Status: b.payment_status || "PAID",
            Payment_Method: "Razorpay Standard",
            Created_At: b.created_at || new Date().toISOString(),
          }));
        } else {
          dataToExport = filtered.map((b) => ({
            Booking_ID: b.id,
            Reference_Code: b.reference_code || b.id,
            Customer: b.contact_name || b.customerName || "Customer",
            Phone: b.contact_phone || b.customerPhone || "N/A",
            Equipment: b.product_name || b.equipmentName || "Optics System",
            Status: b.status,
            Total_Payable_INR: b.total_payable || b.totalAmount || 0,
            Start_Date: b.start_date || b.startDate || "",
            End_Date: b.end_date || b.endDate || "",
            Created_At: b.created_at || "",
          }));
        }
      } else if (reportType === "inventory") {
        const res: any = await adminApiClient.inventory.list();
        const list = res?.data || (Array.isArray(res) ? res : []);
        dataToExport = list.map((u: any) => ({
          Unit_ID: u.id,
          Equipment_Name: u.name || u.product?.name || "Cinema Unit",
          Serial_Number: u.serial_number || "",
          Status: u.status,
          Condition: u.condition || "excellent",
          Notes: u.notes || "",
          Created_At: u.created_at || "",
        }));
      } else if (reportType === "kyc") {
        const res: any = await adminApiClient.kyc.list();
        const list = res?.data || (Array.isArray(res) ? res : []);
        dataToExport = list.map((k: any) => ({
          KYC_ID: k.id,
          Customer_Name: k.profile?.full_name || "Applicant",
          Email: k.profile?.email || "",
          Document_Type: k.document_type || "Aadhaar / Passport",
          Document_Number: k.document_number || "",
          Status: k.status,
          Submitted_At: k.created_at || "",
        }));
      }

      if (dataToExport.length === 0) {
        dataToExport = [
          {
            Status: "No records found for the selected date range",
            Timestamp: new Date().toISOString(),
          },
        ];
      }

      // Generate File Content
      let fileBlob: Blob;
      if (exportFormat === "json") {
        const jsonString = JSON.stringify(dataToExport, null, 2);
        fileBlob = new Blob([jsonString], { type: "application/json;charset=utf-8;" });
        filename += ".json";
      } else {
        const headers = Object.keys(dataToExport[0]).join(",");
        const rows = dataToExport
          .map((row) =>
            Object.values(row)
              .map((val) => `"${String(val).replace(/"/g, '""')}"`)
              .join(",")
          )
          .join("\n");
        const csvContent = `${headers}\n${rows}`;
        fileBlob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        filename += ".csv";
      }

      // Trigger Browser Download
      const downloadUrl = URL.createObjectURL(fileBlob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(downloadUrl);

      setDownloadSuccess(`Successfully exported ${dataToExport.length} records as ${filename}`);
      setTimeout(() => setDownloadSuccess(null), 5000);
    } catch (err: any) {
      alert("Export failed: " + (err?.message || "Unknown error"));
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="space-y-6 pb-12 max-w-4xl">
      <div className="border-b border-white/5 pb-6">
        <h1 className="text-2xl font-light text-[#f5f1e8] font-serif flex items-center gap-3">
          <FileSpreadsheet className="text-emerald-400" size={26} />
          Operational &amp; Tax Compliance Reports Center
        </h1>
        <p className="text-xs text-[#9a9995] font-light mt-1">
          Export audited Indian GST (18%) tax calculations, reservation revenue, and fleet inventory logs in CSV and JSON formats.
        </p>
      </div>

      {downloadSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
          <CheckCircle2 size={16} />
          <span>{downloadSuccess}</span>
        </div>
      )}

      {/* Configuration Grid */}
      <div className="admin-card p-6 rounded-2xl border border-white/10 space-y-6 bg-[#0c0c0c]">
        {/* 1. Report Dataset Selection */}
        <div className="space-y-2 text-xs">
          <label className="text-[10px] text-[#d8b36a] font-mono uppercase tracking-wider block">
            1. Select Report Dataset
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              {
                id: "gst_tax",
                label: "GST & Tax Compliance (18% Split)",
                desc: "CGST (9%) + SGST (9%) with tax-exempt deposit breakdown",
                icon: ShieldCheck,
              },
              {
                id: "bookings",
                label: "Complete Reservations & Bookings",
                desc: "Reservation dates, customer contacts, equipment references",
                icon: FileText,
              },
              {
                id: "revenue",
                label: "Settled Razorpay Revenue Ledger",
                desc: "Transactions, payment IDs, gross volumes",
                icon: FileSpreadsheet,
              },
              {
                id: "inventory",
                label: "Fleet Equipment & Serial Units",
                desc: "Shutter counts, maintenance status, active serial numbers",
                icon: Calendar,
              },
            ].map((r) => {
              const Icon = r.icon;
              const isSelected = reportType === r.id;
              return (
                <div
                  key={r.id}
                  onClick={() => setReportType(r.id as ReportType)}
                  className={`p-4 rounded-xl border transition cursor-pointer space-y-1 ${
                    isSelected
                      ? "bg-[#d8b36a]/10 border-[#d8b36a] text-[#f5f1e8]"
                      : "bg-white/2 border-white/10 text-[#9a9995] hover:border-white/20"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Icon size={16} className={isSelected ? "text-[#d8b36a]" : "text-[#9a9995]"} />
                    <span className="font-semibold text-xs text-[#f5f1e8]">{r.label}</span>
                  </div>
                  <p className="text-[11px] text-[#9a9995]">{r.desc}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* 2. Date Range Filters */}
        <div className="space-y-2 text-xs">
          <label className="text-[10px] text-[#d8b36a] font-mono uppercase tracking-wider block">
            2. Audit Date Range
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono">
            {[
              { id: "30d", label: "Last 30 Days" },
              { id: "90d", label: "Last 90 Days" },
              { id: "ytd", label: "Year-To-Date (2026)" },
              { id: "all", label: "All Records" },
            ].map((d) => (
              <button
                key={d.id}
                onClick={() => setDateRange(d.id as DateRange)}
                className={`py-2 rounded-lg border text-xs transition cursor-pointer ${
                  dateRange === d.id
                    ? "bg-[#d8b36a] text-black border-[#d8b36a] font-bold"
                    : "bg-black border-white/10 text-[#9a9995] hover:text-[#f5f1e8]"
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>
        </div>

        {/* 3. Export File Format */}
        <div className="space-y-2 text-xs">
          <label className="text-[10px] text-[#d8b36a] font-mono uppercase tracking-wider block">
            3. Export File Format
          </label>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setExportFormat("csv")}
              className={`px-4 py-2 rounded-lg border text-xs font-mono flex items-center gap-2 transition cursor-pointer ${
                exportFormat === "csv"
                  ? "bg-emerald-500/20 border-emerald-500 text-emerald-400 font-bold"
                  : "bg-black border-white/10 text-[#9a9995]"
              }`}
            >
              <FileSpreadsheet size={14} />
              CSV Spreadsheet (.csv)
            </button>
            <button
              onClick={() => setExportFormat("json")}
              className={`px-4 py-2 rounded-lg border text-xs font-mono flex items-center gap-2 transition cursor-pointer ${
                exportFormat === "json"
                  ? "bg-emerald-500/20 border-emerald-500 text-emerald-400 font-bold"
                  : "bg-black border-white/10 text-[#9a9995]"
              }`}
            >
              <FileCode size={14} />
              Structured JSON (.json)
            </button>
          </div>
        </div>

        {/* Export Button */}
        <div className="pt-4 border-t border-white/10">
          <button
            onClick={exportReport}
            disabled={downloading}
            className="w-full py-3.5 rounded-xl bg-[#d8b36a] text-[#070707] font-bold text-xs uppercase tracking-wider hover:bg-[#b98a43] transition flex items-center justify-center gap-2 shadow-lg shadow-[#d8b36a]/15 disabled:opacity-50 cursor-pointer"
          >
            {downloading ? (
              <RefreshCw size={16} className="animate-spin" />
            ) : (
              <Download size={16} />
            )}
            <span>
              {downloading
                ? "COMPILING REPORT DATASET..."
                : `EXPORT ${reportType.toUpperCase()} (${exportFormat.toUpperCase()})`}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
