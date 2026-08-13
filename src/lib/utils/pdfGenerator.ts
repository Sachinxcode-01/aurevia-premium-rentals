/* Client-Side High-Definition Branded PDF Invoice Generator for Aurevia */

export interface InvoiceData {
  referenceCode: string;
  createdAt?: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  equipmentName?: string;
  startDate: string;
  endDate: string;
  rentalFee: number;
  discountFee: number;
  couponCode?: string;
  totalPayable: number;
  status: string;
  paymentStatus: string;
  paymentMethod?: string;
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
  const totalPaid = data.totalPayable ?? (rentalFee - discountFee);

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8" />
      <title>AUREVIA Tax Invoice — ${invoiceNo}</title>
      <style>
        @media print {
          body { padding: 0; }
          @page { margin: 12mm; }
        }
        body {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          background: #ffffff;
          color: #111111;
          padding: 32px;
          max-width: 750px;
          margin: 0 auto;
          line-height: 1.5;
        }
        .invoice-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 2.5px solid #D8B36A;
          padding-bottom: 20px;
        }
        .brand-title {
          font-family: Georgia, serif;
          font-size: 26px;
          letter-spacing: 3px;
          color: #111111;
          font-weight: 700;
        }
        .brand-sub {
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 2px;
          color: #D8B36A;
          font-weight: 600;
        }
        .invoice-meta {
          text-align: right;
        }
        .invoice-badge {
          display: inline-block;
          padding: 4px 12px;
          background: #faf4e8;
          border: 1px solid #D8B36A;
          color: #9e792e;
          font-size: 11px;
          font-weight: 700;
          border-radius: 4px;
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-bottom: 6px;
        }
        .grid-details {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          margin: 24px 0;
          background: #fcfbfa;
          border: 1px solid #eee;
          padding: 16px;
          border-radius: 8px;
        }
        .detail-item label {
          font-size: 9px;
          text-transform: uppercase;
          letter-spacing: 1.5px;
          color: #777;
          font-weight: 700;
          display: block;
        }
        .detail-item span {
          font-size: 13px;
          font-weight: 600;
          color: #111;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin: 24px 0;
        }
        th {
          text-align: left;
          border-bottom: 2px solid #D8B36A;
          padding: 10px 8px;
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 1.5px;
          color: #444;
          font-weight: 700;
        }
        td {
          padding: 14px 8px;
          font-size: 13px;
          border-bottom: 1px solid #eee;
        }
        .total-row td {
          font-weight: 700;
          font-size: 16px;
          border-top: 2.5px solid #D8B36A;
          color: #D8B36A;
        }
        .footer-note {
          margin-top: 36px;
          border-top: 1px solid #eee;
          padding-top: 18px;
          font-size: 11px;
          color: #555;
          display: flex;
          justify-content: space-between;
        }
      </style>
    </head>
    <body>
      <div class="invoice-header">
        <div>
          <div class="brand-title">AUREVIA</div>
          <div class="brand-sub">Premium Camera Rentals &amp; Cinema Optics</div>
        </div>
        <div class="invoice-meta">
          <div class="invoice-badge">Tax Invoice</div>
          <div style="font-size: 14px; font-weight: 700; color: #111;">${invoiceNo}</div>
          <div style="font-size: 11px; color: #666;">Date: ${createdDate}</div>
        </div>
      </div>

      <div class="grid-details">
        <div class="detail-item">
          <label>Customer Details</label>
          <span>${data.customerName}</span><br/>
          <span style="font-size: 11px; color: #555;">${data.customerEmail} | ${data.customerPhone}</span>
        </div>
        <div class="detail-item">
          <label>Rental Schedule</label>
          <span>${data.startDate} → ${data.endDate} (${rentalDays} Days)</span><br/>
          <span style="font-size: 11px; color: #555;">Payment Mode: ${(data.paymentMethod || "COD / Online").toUpperCase()}</span>
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th>Item &amp; Description</th>
            <th style="text-align: center;">Rental Duration</th>
            <th style="text-align: right;">Amount</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <strong>${data.equipmentName || "Camera Gear Package"}</strong><br/>
              <span style="font-size: 11px; color: #666;">Professional Cinema &amp; Optics Equipment Vault</span>
            </td>
            <td style="text-align: center;">${rentalDays} Days</td>
            <td style="text-align: right;">₹${rentalFee.toLocaleString("en-IN")}</td>
          </tr>
          ${discountFee > 0 ? `
          <tr>
            <td>
              <strong style="color: #e74c3c;">Coupon Discount Applied</strong><br/>
              <span style="font-size: 11px; color: #e74c3c;">Promotional Code: ${data.couponCode || "AUREVIA199"}</span>
            </td>
            <td style="text-align: center;">—</td>
            <td style="text-align: right; color: #e74c3c;">−₹${discountFee.toLocaleString("en-IN")}</td>
          </tr>
          ` : ""}
        </tbody>
        <tfoot>
          <tr class="total-row">
            <td colspan="2">Total Amount (${(data.paymentStatus || "PAID").toUpperCase()})</td>
            <td style="text-align: right;">₹${totalPaid.toLocaleString("en-IN")}</td>
          </tr>
        </tfoot>
      </table>

      <div class="footer-note">
        <div>
          <strong>Aurevia Desk:</strong> Prem Mundargi (+91 96869 09048)<br/>
          <strong>Support Email:</strong> premmundargi135@gmail.com
        </div>
        <div style="text-align: right;">
          <strong>Authorized Signatory:</strong><br/>
          <span style="font-family: serif; color: #D8B36A;">Aurevia Operations Team</span>
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
