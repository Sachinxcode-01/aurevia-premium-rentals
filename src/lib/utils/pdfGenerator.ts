/* Client-Side High-Definition Luxury Branded GST Tax Invoice & PDF Generator for AUREVIA */

import {
  AUREVIA_COMPANY_GST_DETAILS,
  calculateGSTBreakdown,
  convertNumberToIndianWords,
  validateGSTIN,
} from "./gst-calculator";

export interface InvoiceItem {
  name: string;
  category?: string;
  sacCode?: string;
  dailyRate: number;
  quantity: number;
  days?: number;
}

export interface InvoiceData {
  referenceCode: string;
  createdAt?: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  companyName?: string;
  companyGstin?: string;
  billingAddress?: string;
  stateCode?: string;
  items?: InvoiceItem[];
  equipmentName?: string;
  startDate: string;
  endDate: string;
  rentalFee: number;
  depositFee?: number;
  discountFee: number;
  couponCode?: string;
  taxFee?: number;
  totalPayable: number;
  status: string;
  paymentStatus: string;
  paymentMethod?: string;
  deliveryMethod?: string;
  shippingAddress?: string;
}

export function generateBrandedInvoiceHTML(data: InvoiceData): string {
  const invoiceNo = data.referenceCode || `INV-${Date.now().toString().slice(-6)}`;
  const createdDate = new Date(data.createdAt || Date.now()).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const rentalDays = Math.max(
    1,
    Math.ceil((new Date(data.endDate).getTime() - new Date(data.startDate).getTime()) / 86400000)
  );

  const rentalFee = data.rentalFee || 0;
  const discountFee = data.discountFee || 0;
  const taxableAmount = Math.max(0, rentalFee - discountFee);

  // GST Breakdown
  const buyerStateOrGSTIN = data.companyGstin || data.stateCode || "29";
  const gst = calculateGSTBreakdown(taxableAmount, buyerStateOrGSTIN);
  const totalPaid = data.totalPayable ?? gst.totalInvoiceAmount;
  const amountInWords = convertNumberToIndianWords(totalPaid);

  const itemsList: InvoiceItem[] =
    data.items && data.items.length > 0
      ? data.items
      : [
          {
            name: data.equipmentName || "ARRI Alexa Mini LF Cinema Package",
            category: "Professional Cinema Gear",
            sacCode: "997311",
            dailyRate: Math.round(rentalFee / rentalDays),
            quantity: 1,
            days: rentalDays,
          },
        ];

  const hasB2BGST = Boolean(data.companyGstin && validateGSTIN(data.companyGstin));

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8" />
      <title>AUREVIA Official GST Tax Invoice — ${invoiceNo}</title>
      <style>
        @media print {
          body { padding: 0; background: #fff; }
          @page { margin: 12mm; size: A4 portrait; }
          .no-print { display: none !important; }
        }
        * { box-sizing: border-box; }
        body {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          background: #ffffff;
          color: #111111;
          padding: 36px;
          max-width: 820px;
          margin: 0 auto;
          line-height: 1.45;
          font-size: 13px;
        }
        .header-bar {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          border-bottom: 2.5px solid #D8B36A;
          padding-bottom: 18px;
          margin-bottom: 20px;
        }
        .brand-title {
          font-family: Georgia, serif;
          font-size: 26px;
          letter-spacing: 3px;
          font-weight: 700;
          color: #0A0A0A;
          margin: 0;
        }
        .brand-sub {
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 2px;
          color: #D8B36A;
          font-weight: 700;
          margin-top: 2px;
        }
        .invoice-badge {
          background: #0A0A0A;
          color: #D8B36A;
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 1.5px;
          padding: 6px 14px;
          border-radius: 6px;
          display: inline-block;
          font-family: monospace;
        }
        .two-col-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
          margin-bottom: 20px;
        }
        .info-card {
          background: #fafafa;
          border: 1px solid #eaeaea;
          border-radius: 8px;
          padding: 14px;
        }
        .info-title {
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 1px;
          color: #888888;
          margin-bottom: 6px;
          border-bottom: 1px solid #eeeeee;
          padding-bottom: 4px;
        }
        .info-content {
          font-size: 12px;
          color: #222222;
        }
        .info-content strong {
          color: #000000;
        }
        .gst-highlight {
          color: #059669;
          font-family: monospace;
          font-weight: 700;
        }
        table.invoice-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 18px;
        }
        table.invoice-table th {
          background: #0A0A0A;
          color: #ffffff;
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 1px;
          padding: 8px 10px;
          text-align: left;
        }
        table.invoice-table td {
          padding: 10px;
          border-bottom: 1px solid #eaeaea;
          font-size: 12px;
        }
        .tax-summary-box {
          display: flex;
          justify-content: flex-end;
          margin-bottom: 20px;
        }
        .tax-summary-table {
          width: 340px;
          font-size: 12px;
        }
        .tax-summary-table tr td {
          padding: 4px 8px;
        }
        .tax-summary-table tr.total-row {
          border-top: 2px solid #D8B36A;
          font-weight: 800;
          font-size: 14px;
          color: #0A0A0A;
        }
        .words-box {
          background: #fdfbf7;
          border-left: 3px solid #D8B36A;
          padding: 10px 14px;
          font-size: 11px;
          margin-bottom: 20px;
          font-style: italic;
          color: #555555;
        }
        .footer-declaration {
          font-size: 10px;
          color: #777777;
          border-top: 1px dashed #cccccc;
          padding-top: 14px;
          margin-top: 24px;
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
        }
        .signature-block {
          text-align: right;
          min-width: 180px;
        }
        .stamp-circle {
          border: 1.5px solid #D8B36A;
          color: #D8B36A;
          font-size: 9px;
          font-weight: bold;
          text-transform: uppercase;
          padding: 4px 8px;
          border-radius: 4px;
          display: inline-block;
          margin-bottom: 6px;
          letter-spacing: 1px;
        }
        .btn-print {
          background: #D8B36A;
          color: #000000;
          border: none;
          font-weight: bold;
          padding: 10px 20px;
          border-radius: 8px;
          cursor: pointer;
          font-size: 13px;
        }
      </style>
    </head>
    <body>
      <!-- No-Print Action Bar -->
      <div class="no-print" style="margin-bottom: 24px; display: flex; justify-content: space-between; align-items: center; background: #0A0A0A; padding: 12px 18px; border-radius: 8px;">
        <span style="color: #D8B36A; font-family: monospace; font-size: 12px; font-weight: bold;">
          AUREVIA OFFICIAL TAX INVOICE — ${invoiceNo}
        </span>
        <button class="btn-print" onclick="window.print()">
          🖨️ Print / Save as PDF
        </button>
      </div>

      <!-- Header -->
      <div class="header-bar">
        <div>
          <h1 class="brand-title">AUREVIA</h1>
          <div class="brand-sub">Luxury Cinema Equipment Rentals</div>
          <div style="font-size: 10px; color: #666; margin-top: 4px; max-width: 320px;">
            ${AUREVIA_COMPANY_GST_DETAILS.legalName}<br/>
            ${AUREVIA_COMPANY_GST_DETAILS.address}<br/>
            <strong>GSTIN:</strong> <span class="gst-highlight">${AUREVIA_COMPANY_GST_DETAILS.gstin}</span> | <strong>PAN:</strong> ${AUREVIA_COMPANY_GST_DETAILS.pan}
          </div>
        </div>

        <div style="text-align: right;">
          <div class="invoice-badge">TAX INVOICE</div>
          <div style="font-family: monospace; font-size: 12px; margin-top: 6px;">
            <strong>Invoice No:</strong> ${invoiceNo}<br/>
            <strong>Date:</strong> ${createdDate}<br/>
            <strong>State of Supply:</strong> ${gst.placeOfSupply}
          </div>
        </div>
      </div>

      <!-- B2B Bill To & Shoot Logistics Grid -->
      <div class="two-col-grid">
        <div class="info-card">
          <div class="info-title">BILLED TO (RECIPIENT / PRODUCTION HOUSE)</div>
          <div class="info-content">
            <strong>${data.companyName || data.customerName}</strong><br/>
            ${data.companyName ? `Contact: ${data.customerName}<br/>` : ""}
            ${data.customerEmail} | ${data.customerPhone}<br/>
            ${data.billingAddress || data.shippingAddress || "Registered Studio Customer"}<br/>
            ${
              hasB2BGST
                ? `<strong>GSTIN / UIN:</strong> <span class="gst-highlight">${data.companyGstin}</span><br/><span style="color: #059669; font-size: 10px; font-weight: bold;">✓ ITC (Input Tax Credit) Eligible</span>`
                : `<span style="color: #666; font-size: 11px;">B2C Unregistered Consumer</span>`
            }
          </div>
        </div>

        <div class="info-card">
          <div class="info-title">RENTAL DISPATCH &amp; SHOOT DATES</div>
          <div class="info-content">
            <strong>Shoot Period:</strong> ${new Date(data.startDate).toLocaleDateString("en-IN", { day: "numeric", month: "short" })} – ${new Date(data.endDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })} (${rentalDays} Days)<br/>
            <strong>Fulfillment:</strong> ${data.deliveryMethod === "delivery" ? "Armored Vault Courier Delivery" : "Self-Pickup at Bangalore Vault"}<br/>
            <strong>Payment Mode:</strong> ${(data.paymentMethod || "Online (Razorpay / UPI)").toUpperCase()}<br/>
            <strong>Payment Status:</strong> <strong style="color: #059669;">${data.paymentStatus.toUpperCase()}</strong>
          </div>
        </div>
      </div>

      <!-- Line Items Table -->
      <table class="invoice-table">
        <thead>
          <tr>
            <th style="width: 5%;">#</th>
            <th style="width: 45%;">Description of Cinema Gear / Services</th>
            <th style="width: 15%;">HSN / SAC</th>
            <th style="width: 10%; text-align: center;">Qty</th>
            <th style="width: 10%; text-align: center;">Days</th>
            <th style="width: 15%; text-align: right;">Taxable Value</th>
          </tr>
        </thead>
        <tbody>
          ${itemsList
            .map(
              (item, idx) => `
            <tr>
              <td>${idx + 1}</td>
              <td>
                <strong>${item.name}</strong><br/>
                <span style="font-size: 10px; color: #666;">${item.category || "Professional Cinema Equipment"}</span>
              </td>
              <td style="font-family: monospace; color: #555;">${item.sacCode || "997311"}</td>
              <td style="text-align: center;">${item.quantity || 1}</td>
              <td style="text-align: center;">${item.days || rentalDays}</td>
              <td style="text-align: right; font-family: monospace; font-weight: bold;">₹${((item.dailyRate || 0) * (item.days || rentalDays) * (item.quantity || 1)).toLocaleString("en-IN")}</td>
            </tr>
          `
            )
            .join("")}
        </tbody>
      </table>

      <!-- Tax Calculations & Summary -->
      <div class="tax-summary-box">
        <table class="tax-summary-table">
          <tr>
            <td style="color: #666;">Subtotal (Rental Fee):</td>
            <td style="text-align: right; font-family: monospace;">₹${rentalFee.toLocaleString("en-IN")}</td>
          </tr>
          ${
            discountFee > 0
              ? `
          <tr>
            <td style="color: #059669;">Coupon / Referral Discount:</td>
            <td style="text-align: right; font-family: monospace; color: #059669;">-₹${discountFee.toLocaleString("en-IN")}</td>
          </tr>
          `
              : ""
          }
          <tr>
            <td style="color: #333; font-weight: 600;">Taxable Amount:</td>
            <td style="text-align: right; font-family: monospace; font-weight: 600;">₹${taxableAmount.toLocaleString("en-IN")}</td>
          </tr>
          ${
            gst.isInterState
              ? `
          <tr>
            <td style="color: #666;">Integrated GST (IGST @ 18%):</td>
            <td style="text-align: right; font-family: monospace;">₹${gst.igstAmount.toLocaleString("en-IN")}</td>
          </tr>
          `
              : `
          <tr>
            <td style="color: #666;">Central GST (CGST @ 9%):</td>
            <td style="text-align: right; font-family: monospace;">₹${gst.cgstAmount.toLocaleString("en-IN")}</td>
          </tr>
          <tr>
            <td style="color: #666;">State GST (SGST @ 9%):</td>
            <td style="text-align: right; font-family: monospace;">₹${gst.sgstAmount.toLocaleString("en-IN")}</td>
          </tr>
          `
          }
          <tr class="total-row">
            <td>Grand Total (Incl. GST):</td>
            <td style="text-align: right; font-family: monospace; color: #D8B36A;">₹${totalPaid.toLocaleString("en-IN")}</td>
          </tr>
        </table>
      </div>

      <!-- Amount in Words -->
      <div class="words-box">
        <strong>Amount in Words:</strong> ${amountInWords}
      </div>

      <!-- Legal Declaration & Signature Block -->
      <div class="footer-declaration">
        <div style="max-width: 480px;">
          <strong>Statutory Terms &amp; Conditions:</strong><br/>
          1. <strong>Reverse Charge:</strong> Tax is NOT payable under reverse charge basis.<br/>
          2. Certified under SAC 9973 for equipment leasing without operator.<br/>
          3. Security deposit is refundable upon certified Pelican return inspection.<br/>
          4. This is a computer-generated tax invoice verified under digital seal.
        </div>

        <div class="signature-block">
          <div class="stamp-circle">AUREVIA VERIFIED SEAL</div>
          <div style="font-family: Georgia, serif; font-size: 16px; font-weight: bold; color: #333; margin-top: 4px;">
            AUREVIA CINEMA RENTALS LLP
          </div>
          <div style="font-size: 10px; color: #666;">Authorized Signatory</div>
        </div>
      </div>
    </body>
    </html>
  `;
}

export function printOrDownloadInvoice(data: InvoiceData): void {
  const invoiceHtml = generateBrandedInvoiceHTML(data);
  const printWindow = window.open("", "_blank");
  if (printWindow) {
    printWindow.document.write(invoiceHtml);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 500);
  }
}
