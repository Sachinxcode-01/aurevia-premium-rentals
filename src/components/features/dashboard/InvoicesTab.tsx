"use client";

import React, { useState } from "react";
import { InvoiceData } from "@/lib/utils/pdfGenerator";
import InvoiceViewerModal from "@/components/features/invoice/InvoiceViewerModal";
import { FileText, Download, Printer, ShieldCheck, Search } from "lucide-react";

interface InvoicesTabProps {
  bookings: any[];
  profileName?: string;
  profileEmail?: string;
  profilePhone?: string;
}

export default function InvoicesTab({
  bookings,
  profileName,
  profileEmail,
  profilePhone,
}: InvoicesTabProps) {
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceData | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const validInvoices = bookings.filter((b) =>
    ["paid", "completed", "rented", "approved", "ready_for_pickup"].includes(b.status)
  );

  const filteredInvoices = validInvoices.filter((b) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    const ref = (String(b.referenceCode || b.reference_code || "")).toLowerCase();
    return ref.includes(term);
  });

  const handleOpenInvoice = (b: any) => {
    const ref = b.referenceCode || b.reference_code || b.id;
    const itemsList = (b.booking_items || b.items || []).map((item: any) => ({
      name: item.product?.name || item.name || item.productId || "Cinema Package",
      dailyRate: item.unitPrice || item.price || 4000,
      quantity: item.quantity || 1,
      sacCode: "997311",
    }));

    const invoiceData: InvoiceData = {
      referenceCode: ref,
      createdAt: b.createdAt || b.created_at,
      customerName: b.contactName || profileName || "Valued Filmmaker",
      customerEmail: b.contactEmail || profileEmail || "customer@aurevia.com",
      customerPhone: b.contactPhone || profilePhone || "+91 96869 09048",
      companyName: b.companyOrCollege,
      items: itemsList.length > 0 ? itemsList : undefined,
      equipmentName: itemsList.length === 0 ? "Flagship Cinema Camera Package" : undefined,
      startDate: b.startDate || b.start_date,
      endDate: b.endDate || b.end_date,
      rentalFee: b.totalRentalFee || b.total_rental_fee || b.totalPayable || 4500,
      discountFee: b.discountAmount || b.discount_amount || 0,
      taxFee: b.taxFee || b.tax_fee,
      totalPayable: b.totalPayable || b.total_payable || 4500,
      status: b.status,
      paymentStatus: b.paymentStatus || "paid",
      paymentMethod: b.paymentMethod || "Online (Razorpay)",
      deliveryMethod: b.deliveryMethod || "pickup",
    };

    setSelectedInvoice(invoiceData);
  };

  return (
    <div className="space-y-6">
      {/* ─── HEADER & SEARCH ─── */}
      <div className="flex flex-col justify-between gap-4 rounded-2xl border border-white/10 bg-neutral-900/80 p-5 backdrop-blur-xl shadow-xl md:flex-row md:items-center">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-widest text-amber-400">
            <FileText className="h-4 w-4" />
            Statutory B2B Tax Invoices
          </div>
          <h3 className="mt-1 text-base font-bold text-white">
            Billing &amp; Tax Invoice Vault ({validInvoices.length})
          </h3>
        </div>

        <div className="relative w-full md:w-64">
          <Search className="absolute top-2.5 left-3 h-3.5 w-3.5 text-neutral-500" />
          <input
            type="text"
            placeholder="Search invoice #..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-black/60 py-1.5 pr-3 pl-8 text-xs text-white placeholder:text-neutral-500 focus:border-amber-400 focus:outline-none"
          />
        </div>
      </div>

      {/* ─── INVOICES TABLE ─── */}
      {filteredInvoices.length === 0 ? (
        <div className="rounded-3xl border border-white/10 bg-neutral-900/40 p-12 text-center text-neutral-500 space-y-2">
          <FileText className="mx-auto h-8 w-8 text-neutral-600" />
          <p className="text-sm font-mono">No tax invoices generated yet.</p>
        </div>
      ) : (
        <div className="dash-card overflow-hidden rounded-3xl border border-white/10 bg-neutral-900/80 shadow-2xl backdrop-blur-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs">
              <thead>
                <tr className="border-b border-white/10 bg-black/40 text-neutral-400 uppercase text-[10px] tracking-wider">
                  <th className="p-4 font-bold">Invoice Ref</th>
                  <th className="p-4 font-bold">Invoice Date</th>
                  <th className="p-4 font-bold">Shoot Duration</th>
                  <th className="p-4 font-bold">SAC Code</th>
                  <th className="p-4 font-bold">Total (Incl. GST)</th>
                  <th className="p-4 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredInvoices.map((b) => {
                  const ref = b.referenceCode || b.reference_code || b.id;
                  const dateStr = new Date(b.createdAt || b.created_at || Date.now()).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  });
                  const total = b.totalPayable || b.total_payable || 0;

                  return (
                    <tr key={b.id} className="hover:bg-white/5 transition-colors">
                      <td className="p-4 font-bold text-white">{ref}</td>
                      <td className="p-4 text-neutral-400">{dateStr}</td>
                      <td className="p-4 text-neutral-300">
                        {new Date(b.startDate || b.start_date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })} – {new Date(b.endDate || b.end_date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                      </td>
                      <td className="p-4 text-emerald-400 font-bold">SAC 997311</td>
                      <td className="p-4 font-bold text-amber-400">₹{total.toLocaleString("en-IN")}</td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => handleOpenInvoice(b)}
                          className="inline-flex items-center gap-1.5 rounded-xl border border-amber-400/30 bg-amber-400/10 px-3 py-1.5 text-xs font-bold text-amber-300 hover:bg-amber-400/20 transition-colors"
                        >
                          <FileText className="h-3.5 w-3.5" />
                          <span>View / PDF</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ─── INVOICE VIEWER MODAL ─── */}
      {selectedInvoice && (
        <InvoiceViewerModal
          isOpen={Boolean(selectedInvoice)}
          onClose={() => setSelectedInvoice(null)}
          invoiceData={selectedInvoice}
        />
      )}
    </div>
  );
}
