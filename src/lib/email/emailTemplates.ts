export interface EmailTemplatePayload {
  toName: string;
  referenceCode?: string;
  productNames?: string[];
  startDate?: string;
  endDate?: string;
  totalAmount?: number;
  reason?: string;
  actionUrl?: string;
}

const BRAND_HEADER = `
  <div style="background-color: #0A0A0A; padding: 30px; text-align: center; border-bottom: 1px solid #262626;">
    <h1 style="color: #D8B36A; font-family: 'Cinzel', serif, Georgia; margin: 0; font-size: 24px; letter-spacing: 4px;">AUREVIA</h1>
    <p style="color: #888888; font-size: 11px; text-transform: uppercase; letter-spacing: 2px; margin-top: 5px;">Cinematic Equipment Vault</p>
  </div>
`;

const BRAND_FOOTER = `
  <div style="background-color: #050505; padding: 25px; text-align: center; border-top: 1px solid #1A1A1A; color: #666666; font-size: 12px; font-family: sans-serif;">
    <p style="margin: 0 0 8px 0;">AUREVIA Premium Rentals — High Performance Production Gear</p>
    <p style="margin: 0; color: #444444;">If you have any questions, contact concierge@aurevia.com</p>
  </div>
`;

function wrapTemplate(content: string): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8"/>
        <style>
          body { margin: 0; padding: 0; background-color: #000000; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #E5E5E5; }
          .container { max-width: 600px; margin: 0 auto; background-color: #0F0F0F; border: 1px solid #222222; border-radius: 8px; overflow: hidden; }
          .content { padding: 35px 30px; line-height: 1.6; }
          .gold { color: #D8B36A; }
          .button { display: inline-block; background-color: #D8B36A; color: #000000; padding: 12px 28px; font-weight: 600; text-decoration: none; border-radius: 4px; letter-spacing: 1px; margin-top: 20px; text-transform: uppercase; font-size: 12px; }
          .box { background-color: #161616; border: 1px solid #282828; padding: 18px; border-radius: 6px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div style="padding: 20px 0;">
          <div class="container">
            ${BRAND_HEADER}
            <div class="content">
              ${content}
            </div>
            ${BRAND_FOOTER}
          </div>
        </div>
      </body>
    </html>
  `;
}

export function generateBookingConfirmationEmail(data: EmailTemplatePayload): { subject: string; html: string } {
  return {
    subject: `Booking Confirmed: ${data.referenceCode}`,
    html: wrapTemplate(`
      <h2 style="color: #FFFFFF; font-size: 20px; margin-top: 0;">Reservation Confirmation</h2>
      <p>Dear ${data.toName},</p>
      <p>Your reservation for premium camera equipment has been confirmed under reference code <strong class="gold">${data.referenceCode}</strong>.</p>
      <div class="box">
        <p style="margin: 4px 0;"><strong>Rental Period:</strong> ${data.startDate} to ${data.endDate}</p>
        <p style="margin: 4px 0;"><strong>Total Reserved:</strong> ₹${data.totalAmount?.toLocaleString("en-IN")}</p>
      </div>
      <p>Please present your government ID and reference code at pickup.</p>
      ${data.actionUrl ? `<a href="${data.actionUrl}" class="button">View Booking Details</a>` : ""}
    `),
  };
}

export function generateKycStatusEmail(data: EmailTemplatePayload & { status: "APPROVED" | "REJECTED" }): { subject: string; html: string } {
  const isApproved = data.status === "APPROVED";
  return {
    subject: isApproved ? `KYC Verification Approved` : `KYC Action Required: Re-upload Document`,
    html: wrapTemplate(`
      <h2 style="color: #FFFFFF; font-size: 20px; margin-top: 0;">KYC Verification ${isApproved ? "Approved" : "Update"}</h2>
      <p>Dear ${data.toName},</p>
      ${
        isApproved
          ? `<p>Your identity documents have been successfully verified. You are now cleared to reserve high-tier cinema gear on AUREVIA.</p>`
          : `<p>We were unable to verify your submitted identity document. Reason: <em>${data.reason || "Document illegible"}</em>. Please re-upload your document to clear your account for rentals.</p>`
      }
      ${data.actionUrl ? `<a href="${data.actionUrl}" class="button">${isApproved ? "Go to Dashboard" : "Re-upload Document"}</a>` : ""}
    `),
  };
}

export function generateReturnReminderEmail(data: EmailTemplatePayload): { subject: string; html: string } {
  return {
    subject: `Rental Return Reminder: ${data.referenceCode}`,
    html: wrapTemplate(`
      <h2 style="color: #FFFFFF; font-size: 20px; margin-top: 0;">Upcoming Equipment Return</h2>
      <p>Dear ${data.toName},</p>
      <p>This is a reminder that your rental for <strong class="gold">${data.referenceCode}</strong> is scheduled for return by <strong class="gold">${data.endDate}</strong>.</p>
      <p>Please ensure all batteries, cables, lens caps, and accessories are included in the return case.</p>
    `),
  };
}
