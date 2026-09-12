import nodemailer from "nodemailer";

export interface BookingNotificationPayload {
  bookingId: string;
  referenceCode?: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  equipmentName: string;
  startDate: string;
  endDate: string;
  totalAmount: number;
  securityDeposit: number;
  deliveryAddress?: string;
  paymentId?: string;
}

export interface NotificationResult {
  success: boolean;
  channel: "email" | "whatsapp" | "console";
  messageId?: string;
  payloadText?: string;
  error?: string;
}

export class NotificationService {
  private static getTransporter() {
    const host = process.env.SMTP_HOST || "smtp.gmail.com";
    const port = Number(process.env.SMTP_PORT) || 587;
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;

    if (!user || !pass) {
      return null;
    }

    return nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
    });
  }

  /**
   * 1. Booking Confirmation Notification (Email + WhatsApp Concierge Template)
   */
  static async sendBookingConfirmation(payload: BookingNotificationPayload): Promise<NotificationResult> {
    const formattedAmount = `₹${payload.totalAmount.toLocaleString("en-IN")}`;
    const formattedDeposit = `₹${payload.securityDeposit.toLocaleString("en-IN")}`;

    const whatsAppText =
      `🎬 *AUREVIA Optics - Reservation Confirmed*\n\n` +
      `Hello ${payload.customerName},\n` +
      `Your reservation for *${payload.equipmentName}* is confirmed.\n\n` +
      `• *Booking Ref:* ${payload.referenceCode || payload.bookingId}\n` +
      `• *Rental Period:* ${payload.startDate} to ${payload.endDate}\n` +
      `• *Total Paid:* ${formattedAmount}\n` +
      `• *Security Deposit Hold:* ${formattedDeposit}\n\n` +
      `Our concierge team will dispatch your Pelican flight-case to your set location.\n` +
      `Track your booking: https://aurevia.com/dashboard`;

    const html = `
      <div style="font-family: 'Helvetica Neue', Arial, sans-serif; background: #070707; color: #f5f1e8; padding: 40px; border-radius: 12px; max-width: 600px; margin: auto;">
        <div style="border-bottom: 1px solid #222; padding-bottom: 20px; margin-bottom: 20px;">
          <h2 style="color: #d8b36a; margin: 0; font-size: 24px; letter-spacing: 2px;">AUREVIA OPTICS</h2>
          <p style="color: #888; margin: 4px 0 0; font-size: 11px; text-transform: uppercase;">Cinematic Rental Concierge</p>
        </div>
        <p style="font-size: 14px;">Dear ${payload.customerName},</p>
        <p style="font-size: 13px; color: #bbb; line-height: 1.6;">
          Your production equipment reservation <strong>#${payload.referenceCode || payload.bookingId}</strong> has been secured and scheduled for dispatch in protective Pelican flight-cases.
        </p>
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 12px;">
          <tr style="border-bottom: 1px solid #222;"><td style="padding: 8px 0; color: #888;">Equipment:</td><td style="padding: 8px 0; text-align: right; color: #fff; font-weight: bold;">${payload.equipmentName}</td></tr>
          <tr style="border-bottom: 1px solid #222;"><td style="padding: 8px 0; color: #888;">Rental Duration:</td><td style="padding: 8px 0; text-align: right; color: #fff;">${payload.startDate} — ${payload.endDate}</td></tr>
          <tr style="border-bottom: 1px solid #222;"><td style="padding: 8px 0; color: #888;">Total Amount:</td><td style="padding: 8px 0; text-align: right; color: #d8b36a; font-weight: bold;">${formattedAmount}</td></tr>
          <tr style="border-bottom: 1px solid #222;"><td style="padding: 8px 0; color: #888;">Deposit Hold:</td><td style="padding: 8px 0; text-align: right; color: #fff;">${formattedDeposit}</td></tr>
        </table>
        <p style="font-size: 11px; color: #666; margin-top: 30px; border-top: 1px dashed #333; padding-top: 15px;">
          AUREVIA Mumbai Flagship Hub • 24/7 Production Hot-swap Support
        </p>
      </div>
    `;

    const transporter = this.getTransporter();
    if (transporter && payload.customerEmail) {
      try {
        const info = await transporter.sendMail({
          from: process.env.SMTP_FROM || `"AUREVIA Rentals" <${process.env.SMTP_USER}>`,
          to: payload.customerEmail,
          subject: `Reservation Confirmed: ${payload.equipmentName} (#${payload.referenceCode || payload.bookingId})`,
          html,
        });
        return { success: true, channel: "email", messageId: info.messageId, payloadText: whatsAppText };
      } catch (err: any) {
        console.warn("[NotificationService] Email delivery warning:", err.message);
      }
    }

    // Fallback/log
    return { success: true, channel: "console", payloadText: whatsAppText };
  }

  /**
   * 2. KYC Verification Status Notification
   */
  static async sendKycStatusUpdate(payload: {
    customerName: string;
    customerEmail: string;
    status: "approved" | "rejected" | "reupload_required";
    reason?: string;
  }): Promise<NotificationResult> {
    const isApproved = payload.status === "approved";
    const statusText = isApproved ? "VERIFIED & APPROVED" : payload.status === "reupload_required" ? "RE-UPLOAD REQUIRED" : "REJECTED";

    const whatsAppText =
      `🛡️ *AUREVIA Identity Verification: ${statusText}*\n\n` +
      `Hello ${payload.customerName},\n` +
      (isApproved
        ? `Your KYC identity verification has passed our security audit. Your account is now cleared for zero-deposit eligible cinema rentals!`
        : `Your KYC submission requires attention. Reason: ${payload.reason || "Document details incomplete"}.\nPlease log in to re-upload: https://aurevia.com/dashboard/kyc`);

    const transporter = this.getTransporter();
    if (transporter && payload.customerEmail) {
      try {
        const info = await transporter.sendMail({
          from: process.env.SMTP_FROM || `"AUREVIA Security" <${process.env.SMTP_USER}>`,
          to: payload.customerEmail,
          subject: `KYC Identity Verification: ${statusText}`,
          text: whatsAppText,
        });
        return { success: true, channel: "email", messageId: info.messageId, payloadText: whatsAppText };
      } catch (err: any) {
        console.warn("[NotificationService] KYC email warning:", err.message);
      }
    }

    return { success: true, channel: "console", payloadText: whatsAppText };
  }

  /**
   * 3. Return Cleared & Security Deposit Refund Alert
   */
  static async sendReturnClearedAlert(payload: {
    bookingId: string;
    customerName: string;
    customerEmail?: string;
    customerPhone?: string;
    refundAmount: number;
    depositAmount: number;
  }): Promise<NotificationResult> {
    const formattedRefund = `₹${payload.refundAmount.toLocaleString("en-IN")}`;
    const whatsAppText =
      `✨ *AUREVIA Pelican Flight-Case Inspection: PASSED*\n\n` +
      `Hello ${payload.customerName},\n` +
      `Inspection for reservation #${payload.bookingId} has concluded. All serial numbers verified and sensor certified dust-free.\n\n` +
      `• *Original Deposit:* ₹${payload.depositAmount.toLocaleString("en-IN")}\n` +
      `• *Net Refund Released:* ${formattedRefund}\n\n` +
      `The refund has been initiated to your original payment method. Thank you for choosing AUREVIA!`;

    const transporter = this.getTransporter();
    if (transporter && payload.customerEmail) {
      try {
        const info = await transporter.sendMail({
          from: process.env.SMTP_FROM || `"AUREVIA Concierge" <${process.env.SMTP_USER}>`,
          to: payload.customerEmail,
          subject: `Inspection Cleared & Deposit Refund Released (#${payload.bookingId})`,
          text: whatsAppText,
        });
        return { success: true, channel: "email", messageId: info.messageId, payloadText: whatsAppText };
      } catch (err: any) {
        console.warn("[NotificationService] Return email warning:", err.message);
      }
    }

    return { success: true, channel: "console", payloadText: whatsAppText };
  }

  /**
   * 4. Razorpay Penalty / Damage Payment Link Dispatch
   */
  static async sendPenaltyPaymentLink(payload: {
    bookingId: string;
    customerName: string;
    customerEmail?: string;
    customerPhone?: string;
    amount: number;
    paymentUrl: string;
    reason?: string;
  }): Promise<NotificationResult> {
    const formattedAmount = `₹${payload.amount.toLocaleString("en-IN")}`;
    const whatsAppText =
      `⚠️ *AUREVIA Settlement Notice: Reservation #${payload.bookingId}*\n\n` +
      `Hello ${payload.customerName},\n` +
      `A settlement charge of *${formattedAmount}* has been assessed.\n` +
      `Reason: ${payload.reason || "Equipment return inspection adjustment / overdue hours"}.\n\n` +
      `Please complete the settlement securely via Razorpay:\n` +
      `👉 ${payload.paymentUrl}\n\n` +
      `Contact your concierge if you have questions regarding this assessment.`;

    const transporter = this.getTransporter();
    if (transporter && payload.customerEmail) {
      try {
        const info = await transporter.sendMail({
          from: process.env.SMTP_FROM || `"AUREVIA Billing" <${process.env.SMTP_USER}>`,
          to: payload.customerEmail,
          subject: `Payment Settlement Notice: #${payload.bookingId} (${formattedAmount})`,
          text: whatsAppText,
        });
        return { success: true, channel: "email", messageId: info.messageId, payloadText: whatsAppText };
      } catch (err: any) {
        console.warn("[NotificationService] Penalty email warning:", err.message);
      }
    }

    return { success: true, channel: "console", payloadText: whatsAppText };
  }
}
