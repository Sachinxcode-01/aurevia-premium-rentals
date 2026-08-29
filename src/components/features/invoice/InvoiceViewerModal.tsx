"use client";

import { useState } from "react";
import { InvoiceData, generateBrandedInvoiceHTML } from "@/lib/utils/pdfGenerator";
import { X, Printer, Download, FileText, CheckCircle2, Shield } from "lucide-react";

interface InvoiceViewerModalProps {
  invoiceData: InvoiceData;
  isOpen: boolean;
  onClose: () => void;
}

export default function InvoiceViewerModal({
  invoiceData,
  isOpen,
  onClose,
}: InvoiceViewerModalProps) {
  if (!isOpen) return null;

  const invoiceHtml = generateBrandedInvoiceHTML(invoiceData);

  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(invoiceHtml);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
      }, 500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-md">
      <div className="relative flex max-h-[92vh] w-full max-w-4xl flex-col rounded-3xl border border-white/15 bg-neutral-950 shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-white/10 bg-neutral-900/90 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="rounded-xl border border-amber-400/30 bg-amber-400/15 p-2 text-amber-400">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-amber-400">
                Official GST Invoicing Engine
              </span>
              <h3 className="text-base font-bold text-white">
                Tax Invoice — {invoiceData.referenceCode}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 rounded-xl bg-amber-400 px-4 py-2 text-xs font-bold text-black transition-transform hover:scale-105"
            >
              <Printer className="h-4 w-4" />
              Print / Save PDF
            </button>
            <button
              onClick={onClose}
              className="rounded-xl border border-white/10 bg-white/5 p-2 text-neutral-400 hover:text-white transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Live Invoice Preview Frame */}
        <div className="flex-1 overflow-y-auto bg-neutral-900 p-4">
          <div className="mx-auto max-w-3xl rounded-xl bg-white p-6 text-black shadow-xl">
            <iframe
              srcDoc={invoiceHtml}
              title="GST Tax Invoice Preview"
              className="h-[620px] w-full border-0"
            />
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between border-t border-white/10 bg-neutral-950 px-6 py-3 text-xs text-neutral-400 font-mono">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-emerald-400" />
            <span>SAC 997311 Compliant • 100% Valid for B2B ITC Filing</span>
          </div>
          <span className="text-neutral-500">AUREVIA CINEMA RENTALS LLP</span>
        </div>
      </div>
    </div>
  );
}
