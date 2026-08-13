/* Client-Side High-Definition Luxury Branded PDF Invoice Generator for Aurevia */

export interface InvoiceItem {
  name: string;
  category?: string;
  dailyRate: number;
  quantity: number;
}

export interface InvoiceData {
  referenceCode: string;
  createdAt?: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
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
  const invoiceNo = data.referenceCode || "INV-001";
  const createdDate = new Date(data.createdAt || Date.now()).toLocaleDateString("en-IN", {
    day: "numeric", month: "short", year: "numeric"
  });

  const rentalDays = Math.max(1, Math.ceil(
    (new Date(data.endDate).getTime() - new Date(data.startDate).getTime()) / 86400000
  ));

  const rentalFee = data.rentalFee || 0;
  const discountFee = data.discountFee || 0;
  const depositFee = data.depositFee || Math.round(rentalFee * 0.25);
  const taxFee = data.taxFee || Math.round(rentalFee * 0.18);
  const totalPaid = data.totalPayable ?? (rentalFee - discountFee + taxFee);

  const itemsList = data.items && data.items.length > 0 ? data.items : [
    {
      name: data.equipmentName || "Canon EOS R5 Mirrorless Camera Pack",
      category: "Professional Cinema Gear",
      dailyRate: Math.round(rentalFee / rentalDays),
      quantity: 1
    }
  ];

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8" />
      <title>AUREVIA Official Tax Invoice — ${invoiceNo}</title>
      <style>
        @media print {
          body { padding: 0; background: #fff; }
          @page { margin: 10mm; size: A4 portrait; }
          .no-print { display: none !important; }
        }
        * { box-sizing: border-box; }
        body {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          background: #ffffff;
          color: #111111;
          padding: 40px;
          max-width: 800px;
          margin: 0 auto;
          line-height: 1.5;
        }
        .header-bar {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          border-bottom: 3px solid #D8B36A;
          padding-bottom: 24px;
          margin-bottom: 24px;
        }
        .logo-wrap {
          display: flex;
          align-items: center;
          gap: 16px;
        }
        .logo-svg {
          width: 52px;
          height: 52px;
        }
        .brand-title {
          font-family: Georgia, serif;
          font-size: 28px;
          letter-spacing: 4px;
          color: #0c0c0c;
          font-weight: 700;
          line-height: 1;
        }
        .brand-sub {
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 2px;
          color: #D8B36A;
          font-weight: 700;
          margin-top: 4px;
        }
        .invoice-meta {
          text-align: right;
        }
        .badge-tax {
          display: inline-block;
          padding: 4px 14px;
          background: #faf4e8;
          border: 1px solid #D8B36A;
          color: #8c671d;
          font-size: 11px;
          font-weight: 800;
          border-radius: 4px;
          text-transform: uppercase;
          letter-spacing: 1.5px;
          margin-bottom: 8px;
        }
        .inv-number {
          font-family: monospace;
          font-size: 16px;
          font-weight: 700;
          color: #111;
        }
        .grid-details {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          margin-bottom: 28px;
          background: #fafafa;
          border: 1px solid #eaeaea;
          padding: 20px;
          border-radius: 8px;
        }
        .detail-box label {
          font-size: 9px;
          text-transform: uppercase;
          letter-spacing: 1.5px;
          color: #666;
          font-weight: 800;
          display: block;
          margin-bottom: 4px;
        }
        .detail-box .val-main {
          font-size: 14px;
          font-weight: 700;
          color: #111;
        }
        .detail-box .val-sub {
          font-size: 11px;
          color: #555;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 28px;
        }
        th {
          text-align: left;
          border-bottom: 2px solid #D8B36A;
          padding: 12px 10px;
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 1.5px;
          color: #333;
          font-weight: 800;
          background: #fdfbf7;
        }
        td {
          padding: 14px 10px;
          font-size: 13px;
          border-bottom: 1px solid #eeeeee;
        }
        .amount-col { text-align: right; font-family: monospace; font-size: 13px; }
        .row-summary td {
          border-bottom: none;
          padding: 8px 10px;
          font-size: 12px;
          color: #444;
        }
        .total-row td {
          font-weight: 800;
          font-size: 17px;
          border-top: 2px solid #D8B36A;
          border-bottom: 2px solid #D8B36A;
          color: #9e792e;
          background: #fdfbf7;
        }
        .deposit-box {
          background: #f4f9f5;
          border: 1px solid #c8e6c9;
          padding: 12px 16px;
          border-radius: 6px;
          margin-bottom: 28px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .deposit-box label {
          font-size: 11px;
          font-weight: 700;
          color: #2e7d32;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        .deposit-box span {
          font-family: monospace;
          font-weight: 700;
          color: #1b5e20;
          font-size: 14px;
        }
        .terms-section {
          border-top: 1px border #eee;
          padding-top: 16px;
          font-size: 10px;
          color: #666;
          line-height: 1.6;
          margin-bottom: 28px;
        }
        .terms-title {
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 1px;
          color: #333;
          margin-bottom: 4px;
        }
        .footer-bar {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          border-top: 1px solid #ddd;
          padding-top: 20px;
        }
        .contact-col {
          font-size: 11px;
          color: #444;
        }
        .sign-col {
          text-align: right;
          font-size: 11px;
        }
        .signature-line {
          font-family: Georgia, serif;
          font-size: 16px;
          font-style: italic;
          color: #D8B36A;
          margin-top: 8px;
        }
      </style>
    </head>
    <body>
      <!-- Action Bar (hidden on print) -->
      <div class="no-print" style="margin-bottom: 24px; text-align: right;">
        <button onclick="window.print()" style="padding: 10px 20px; bg-color: #D8B36A; background: #D8B36A; color: #0c0c0c; border: none; border-radius: 6px; font-weight: 700; cursor: pointer; font-size: 12px; uppercase tracking-wider;">
          🖨️ Print / Save as PDF
        </button>
      </div>

      <!-- Invoice Header -->
      <div class="header-bar">
        <div class="logo-wrap">
          <svg class="logo-svg" viewBox="0 0 100 100" fill="none">
            <circle cx="50" cy="50" r="46" stroke="#D8B36A" stroke-width="4"/>
            <rect x="25" y="35" width="50" height="36" rx="4" fill="#0c0c0c" stroke="#D8B36A" stroke-width="3"/>
            <circle cx="50" cy="53" r="12" fill="#D8B36A"/>
            <circle cx="50" cy="53" r="6" fill="#0c0c0c"/>
            <path d="M40 30L45 25H55L60 30H40Z" fill="#D8B36A"/>
          </svg>
          <div>
            <div class="brand-title">AUREVIA</div>
            <div class="brand-sub">Premium Camera Rentals &amp; Cinema Optics</div>
          </div>
        </div>

        <div class="invoice-meta">
          <div class="badge-tax">OFFICIAL RENTAL INVOICE</div>
          <div class="inv-number">${invoiceNo}</div>
          <div style="font-size: 11px; color: #666; margin-top: 4px;">Issued: ${createdDate}</div>
        </div>
      </div>

      <!-- Customer & Rental Meta Grid -->
      <div class="grid-details">
        <div class="detail-box">
          <label>Billed To (Renter)</label>
          <div class="val-main">${data.customerName}</div>
          <div class="val-sub">${data.customerEmail}</div>
          <div class="val-sub">${data.customerPhone}</div>
        </div>

        <div class="detail-box">
          <label>Rental Schedule &amp; Delivery</label>
          <div class="val-main">${data.startDate} → ${data.endDate} (${rentalDays} Days)</div>
          <div class="val-sub">Fulfillment: ${(data.deliveryMethod || "Studio Pickup").toUpperCase()}</div>
          <div class="val-sub">Payment Status: ${(data.paymentStatus || "PAID").toUpperCase()}</div>
        </div>
      </div>

      <!-- Itemized Table -->
      <table>
        <thead>
          <tr>
            <th>Equipment Description</th>
            <th style="text-align: center;">Qty</th>
            <th style="text-align: center;">Daily Rate</th>
            <th style="text-align: center;">Duration</th>
            <th style="text-align: right;">Total Fee</th>
          </tr>
        </thead>
        <tbody>
          ${itemsList.map(item => `
            <tr>
              <td>
                <strong>${item.name}</strong><br/>
                <span style="font-size: 11px; color: #666;">${item.category || "Professional Cinema Equipment"}</span>
              </td>
              <td style="text-align: center;">${item.quantity}</td>
              <td style="text-align: center; font-family: monospace;">₹${item.dailyRate.toLocaleString("en-IN")}</td>
              <td style="text-align: center;">${rentalDays} Days</td>
              <td class="amount-col">₹${(item.dailyRate * item.quantity * rentalDays).toLocaleString("en-IN")}</td>
            </tr>
          `).join("")}

          ${discountFee > 0 ? `
            <tr class="row-summary">
              <td colspan="4" style="text-align: right; color: #e74c3c;">Coupon Savings (${data.couponCode || "PROMO"}):</td>
              <td class="amount-col" style="color: #e74c3c;">−₹${discountFee.toLocaleString("en-IN")}</td>
            </tr>
          ` : ""}

          <tr class="row-summary">
            <td colspan="4" style="text-align: right;">GST / Taxes (18%):</td>
            <td class="amount-col">₹${taxFee.toLocaleString("en-IN")}</td>
          </tr>

          <tr class="total-row">
            <td colspan="4" style="text-align: right;">Total Amount Payable:</td>
            <td class="amount-col">₹${totalPaid.toLocaleString("en-IN")}</td>
          </tr>
        </tbody>
      </table>

      <!-- Security Deposit Card -->
      <div class="deposit-box">
        <div>
          <label>Refundable Security Deposit Status</label>
          <div style="font-size: 11px; color: #555;">Pre-authorized / Held during rental period. Released within 24h upon inspection return.</div>
        </div>
        <span>₹${depositFee.toLocaleString("en-IN")} (HELD)</span>
      </div>

      <!-- Rental Terms & Conditions Summary -->
      <div class="terms-section">
        <div class="terms-title">Rental Terms &amp; Conditions</div>
        1. Renter is fully responsible for physical equipment protection during the rental window.<br/>
        2. All camera bodies, lenses, and accessories undergo serial verification upon handover and return.<br/>
        3. Returns past scheduled cutoff date (6:00 PM) incur standard 1-day extension fees.
      </div>

      <!-- Footer Bar -->
      <div class="footer-bar">
        <div class="contact-col">
          <strong>Aurevia Studio Vault &amp; Desk:</strong><br/>
          Prem Mundargi (+91 96869 09048 | premmundargi135@gmail.com)<br/>
          Sachin (+91 98807 62623 | sachiii8827@gmail.com)<br/>
          Aurevia Studio Vault, Gadag Main Road, Karnataka 582101
        </div>

        <div class="sign-col">
          <strong>Authorized Signatory</strong>
          <div class="signature-line">Prem Mundargi</div>
          <div style="font-size: 10px; color: #888;">Aurevia Operations Director</div>
        </div>
      </div>
    </body>
    </html>
  `;
}

export function printOrDownloadInvoice(data: InvoiceData) {
  const win = window.open("", "_blank");
  if (!win) return;
  win.document.write(generateBrandedInvoiceHTML(data));
  win.document.close();
  setTimeout(() => {
    win.print();
  }, 300);
}
