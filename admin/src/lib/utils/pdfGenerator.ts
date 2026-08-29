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
  companyName?: string;
  companyGstin?: string;
  billingAddress?: string;
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

// ─── Legal Rental Agreement PDF Contract ──────────────────────────

export interface AgreementData {
  contractNo: string;
  createdAt?: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  kycDocType?: string;
  kycNumber?: string;
  emergencyContact?: string;
  equipmentName: string;
  serialNumber: string;
  startDate: string;
  endDate: string;
  rentalFee: number;
  depositFee: number;
  status: string;
  otpCode?: string;
}

export function generateRentalAgreementHTML(data: AgreementData): string {
  const agreementNo = data.contractNo || `AGREEMENT-${Date.now().toString().slice(-6)}`;
  const createdDate = new Date(data.createdAt || Date.now()).toLocaleDateString("en-IN", {
    day: "numeric", month: "short", year: "numeric"
  });

  const rentalDays = Math.max(1, Math.ceil(
    (new Date(data.endDate).getTime() - new Date(data.startDate).getTime()) / 86400000
  ));

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8" />
      <title>AUREVIA Legal Equipment Rental Agreement — ${agreementNo}</title>
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
          line-height: 1.5;
        }
        .header-bar {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          border-bottom: 3px solid #D8B36A;
          padding-bottom: 20px;
          margin-bottom: 20px;
        }
        .brand-title {
          font-family: Georgia, serif;
          font-size: 26px;
          letter-spacing: 3px;
          color: #0c0c0c;
          font-weight: 700;
        }
        .brand-sub {
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 2px;
          color: #D8B36A;
          font-weight: 700;
        }
        .badge-contract {
          display: inline-block;
          padding: 4px 12px;
          background: #0c0c0c;
          color: #D8B36A;
          font-size: 10px;
          font-weight: 800;
          border-radius: 4px;
          text-transform: uppercase;
          letter-spacing: 1.5px;
          margin-bottom: 6px;
        }
        .grid-parties {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          margin-bottom: 20px;
          background: #fafafa;
          border: 1px solid #e5e5e5;
          padding: 16px;
          border-radius: 6px;
        }
        .party-title {
          font-size: 9px;
          text-transform: uppercase;
          letter-spacing: 1.5px;
          color: #D8B36A;
          font-weight: 800;
          margin-bottom: 6px;
          border-bottom: 1px solid #eee;
          padding-bottom: 4px;
        }
        .party-name { font-size: 13px; font-weight: 700; color: #111; }
        .party-detail { font-size: 11px; color: #555; }

        table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        th {
          text-align: left;
          border-bottom: 2px solid #D8B36A;
          padding: 10px 8px;
          font-size: 9px;
          text-transform: uppercase;
          letter-spacing: 1.5px;
          color: #333;
          font-weight: 800;
          background: #fdfbf7;
        }
        td { padding: 10px 8px; font-size: 12px; border-bottom: 1px solid #eeeeee; }
        .mono { font-family: monospace; font-weight: 700; }

        .clauses-box {
          background: #fff8eb;
          border: 1px solid #f2dfb8;
          padding: 16px;
          border-radius: 6px;
          margin-bottom: 24px;
          font-size: 10.5px;
          color: #444;
          line-height: 1.6;
        }
        .clauses-title {
          font-size: 11px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 1.5px;
          color: #8c671d;
          margin-bottom: 8px;
        }
        .clauses-box ol { margin: 0; padding-left: 18px; }
        .clauses-box li { margin-bottom: 6px; }

        .signatures-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 30px;
          border-top: 2px solid #D8B36A;
          padding-top: 20px;
          margin-top: 20px;
        }
        .sig-card {
          border: 1px border #eee;
          padding: 14px;
          background: #fafafa;
          border-radius: 6px;
        }
        .sig-label { font-size: 9px; text-transform: uppercase; letter-spacing: 1.5px; color: #666; font-weight: 800; }
        .sig-name { font-family: Georgia, serif; font-size: 16px; font-style: italic; color: #0c0c0c; margin-top: 12px; font-weight: 700; }
        .sig-status { font-size: 10px; color: #27ae60; font-weight: 700; font-mono: monospace; margin-top: 4px; }
      </style>
    </head>
    <body>
      <div class="no-print" style="margin-bottom: 20px; text-align: right;">
        <button onclick="window.print()" style="padding: 10px 22px; background: #0c0c0c; color: #D8B36A; border: 1px solid #D8B36A; border-radius: 6px; font-weight: 800; cursor: pointer; font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px;">
          🖨️ Print / Save Legal Agreement PDF
        </button>
      </div>

      <div class="header-bar">
        <div>
          <div class="brand-title">AUREVIA</div>
          <div class="brand-sub">Equipment Bailment &amp; Rental Contract</div>
        </div>

        <div style="text-align: right;">
          <div class="badge-contract">BINDING LEGAL CONTRACT</div>
          <div style="font-family: monospace; font-size: 14px; font-weight: 700;">${agreementNo}</div>
          <div style="font-size: 10.5px; color: #666; margin-top: 2px;">Executed Date: ${createdDate}</div>
        </div>
      </div>

      <div class="grid-parties">
        <div>
          <div class="party-title">Lessor (Equipment Provider)</div>
          <div class="party-name">AUREVIA Premium Camera Rentals</div>
          <div class="party-detail">Represented by: Prem Mundargi</div>
          <div class="party-detail">Desk Phone: +91 96869 09048</div>
          <div class="party-detail">Studio: Gadag Main Road, Karnataka 582101</div>
        </div>

        <div>
          <div class="party-title">Lessee (Renter / Production Desk)</div>
          <div class="party-name">${data.customerName}</div>
          <div class="party-detail">Email: ${data.customerEmail}</div>
          <div class="party-detail">Phone: ${data.customerPhone}</div>
          <div class="party-detail">KYC Document: ${data.kycDocType || "Government Photo ID"} (Verified)</div>
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th>Rented Cinema Equipment</th>
            <th>Assigned Serial No</th>
            <th style="text-align: center;">Rental Duration</th>
            <th style="text-align: right;">Rental Fee</th>
            <th style="text-align: right;">Security Deposit</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>${data.equipmentName}</strong></td>
            <td class="mono" style="color: #8c671d;">${data.serialNumber}</td>
            <td style="text-align: center;">${data.startDate} → ${data.endDate} (${rentalDays} Days)</td>
            <td style="text-align: right;" class="mono">₹${data.rentalFee.toLocaleString("en-IN")}</td>
            <td style="text-align: right;" class="mono">₹${data.depositFee.toLocaleString("en-IN")}</td>
          </tr>
        </tbody>
      </table>

      <div class="clauses-box">
        <div class="clauses-title">TERMS &amp; INDEMNITY CONDITIONS</div>
        <ol>
          <li><strong>BAILMENT &amp; TITLE:</strong> All equipment listed remains the exclusive property of Lessor. Lessee receives temporary possession solely for visual production purposes.</li>
          <li><strong>INSPECTION &amp; WORKING CONDITION:</strong> Lessee acknowledges physical inspection of equipment upon handover and confirms pristine operational condition.</li>
          <li><strong>DAMAGE &amp; REPLACEMENT INDEMNITY:</strong> Lessee agrees to pay full repair or market replacement costs for any equipment loss, water submersion, sensor scratch, impact damage, or theft occurring during the rental window.</li>
          <li><strong>SECURITY DEPOSIT RELEASE:</strong> The security deposit of ₹${data.depositFee.toLocaleString("en-IN")} is held by Lessor and will be refunded within 24 hours following technical inspection upon return.</li>
          <li><strong>CUTOFF TIME &amp; LATE PENALTY:</strong> Equipment must be returned to Aurevia Studio Vault before 6:00 PM on ${data.endDate}. Unapproved extensions incur ₹500/hr late fee.</li>
        </ol>
      </div>

      <div class="signatures-grid">
        <div class="sig-card">
          <div class="sig-label">Executed by Lessee (Renter Signature)</div>
          <div class="sig-name">${data.customerName}</div>
          <div class="sig-status">✓ Digital OTP Verified (${data.otpCode || "8842"})</div>
        </div>

        <div class="sig-card">
          <div class="sig-label">Executed by Lessor (Aurevia Operations)</div>
          <div class="sig-name">Prem Mundargi</div>
          <div class="sig-status">✓ Authorized Studio Stamp &amp; Signature</div>
        </div>
      </div>
    </body>
    </html>
  `;
}

export function printOrDownloadRentalAgreement(data: AgreementData) {
  const win = window.open("", "_blank");
  if (!win) return;
  win.document.write(generateRentalAgreementHTML(data));
  win.document.close();
  setTimeout(() => {
    win.print();
  }, 300);
}
