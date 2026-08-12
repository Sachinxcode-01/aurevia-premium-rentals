/* eslint-disable @typescript-eslint/no-explicit-any */
import nodemailer from "nodemailer";

interface EmailPayload {
  to: string;
  subject: string;
  html: string;
  text: string;
  idempotencyKey?: string;
  bookingId?: string;
  notificationType?: string;
}

export async function sendEmail({
  to,
  subject,
  html,
  text,
  idempotencyKey,
  bookingId,
  notificationType
}: EmailPayload): Promise<boolean> {
  const eventKey = idempotencyKey || `email:${notificationType || "unknown"}:${bookingId || Date.now()}`;

  // 1. Check idempotency (database-driven)
  const { db } = await import("@/lib/db/store");
  const isDuplicate = await db.checkIdempotency(eventKey, undefined, bookingId, notificationType);
  if (isDuplicate) {
    console.log(`[Email Bypass] Duplicate email prevented: ${eventKey}`);
    return true;
  }

  // 2. Setup SMTP transporter
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 465);
  const secure = process.env.SMTP_SECURE === "true";
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_APP_PASSWORD;

  if (!host || !user || !pass || pass.includes("PLACEHOLDER")) {
    console.warn("[Email Warning] SMTP credentials are not configured or are placeholders. Logging email to console:");
    console.log(`--- EMAIL START ---\nTo: ${to}\nSubject: ${subject}\nText: ${text}\n--- EMAIL END ---`);
    
    // In mock/dev, consider mock send a success and register in db
    await db.logProcessedEvent(eventKey, "processed", 1, undefined, bookingId, notificationType);
    return true;
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
    connectionTimeout: 10000, // 10s connection timeout
  });

  const from = process.env.EMAIL_FROM || `"AUREVIA Camera Rentals" <${user}>`;
  const replyTo = process.env.EMAIL_REPLY_TO || user;

  const mailOptions = {
    from,
    to,
    replyTo,
    subject,
    text,
    html,
  };

  // 3. Retry Loop with Bounded Exponential Backoff
  let attempt = 0;
  const maxAttempts = 3;
  const initialDelay = 1000; // 1s
  const maxDelay = 8000; // 8s

  while (attempt < maxAttempts) {
    attempt++;
    try {
      const info = await transporter.sendMail(mailOptions);
      console.log(`[Email Success] Email sent to ${to}: ${info.messageId}`);
      
      // Log successful processed event
      await db.logProcessedEvent(eventKey, "processed", attempt, undefined, bookingId, notificationType);
      return true;
    } catch (err: any) {
      console.error(`[Email Failed] Attempt ${attempt} failed to send email to ${to}:`, err.message);
      
      if (attempt === maxAttempts) {
        // Record final failure state in database processed_events
        await db.logProcessedEvent(eventKey, "failed", attempt, undefined, bookingId, notificationType);
        
        // Critical: Do NOT try to send warning alert to Sachin using the same broken SMTP client.
        console.error(`[Email Error] Critical SMTP failure: All ${maxAttempts} attempts failed. Event logged as failed.`);
        break;
      } else {
        const backoffDelay = Math.min(initialDelay * Math.pow(2, attempt - 1), maxDelay);
        console.warn(`[Email Backoff] Waiting ${backoffDelay}ms before retry...`);
        await new Promise((resolve) => setTimeout(resolve, backoffDelay));
      }
    }
  }
  return false;
}

function getBrandedTemplate(title: string, bodyContent: string): string {
  const replyEmail = process.env.EMAIL_REPLY_TO || "sachiii8827@gmail.com";
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://aurevia-premium-rentals.vercel.app";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} — AUREVIA</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f5;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:8px;overflow:hidden;border:1px solid #e4e4e7;">

          <!-- Logo Header -->
          <tr>
            <td style="padding:32px 40px 24px;border-bottom:1px solid #e4e4e7;">
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <p style="margin:0;font-size:20px;font-weight:700;letter-spacing:0.15em;color:#0a0a0a;text-transform:uppercase;font-family:Georgia,serif;">AUREVIA</p>
                    <p style="margin:4px 0 0;font-size:10px;color:#71717a;letter-spacing:0.08em;text-transform:uppercase;">Premium Camera Rentals</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding:36px 40px;">
              <p style="margin:0 0 20px;font-size:15px;font-weight:600;color:#0a0a0a;">${title}</p>
              <div style="font-size:14px;line-height:1.7;color:#3f3f46;">
                ${bodyContent}
              </div>
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding:0 40px;">
              <hr style="border:none;border-top:1px solid #e4e4e7;margin:0;">
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:20px 40px;">
              <p style="margin:0;font-size:11px;color:#a1a1aa;line-height:1.6;">
                AUREVIA Premium Rentals &nbsp;·&nbsp; <a href="${appUrl}" style="color:#a1a1aa;text-decoration:underline;">${appUrl.replace("https://","")}</a>
                <br>Questions? Reply to this email or contact <a href="mailto:${replyEmail}" style="color:#a1a1aa;text-decoration:underline;">${replyEmail}</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

// ─── TRANSACTIONS / BRANDED EMAILS ───────────────────────────────────

export async function sendEmailVerification(email: string, token: string) {
  const verifyUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/auth/verify?token=${token}`;
  const html = getBrandedTemplate("Verify Your Email", `
    <p>Welcome to AUREVIA Premium Rentals.</p>
    <p>Please click the button below to verify your email address and activate your account access.</p>
    <p><a href="${verifyUrl}" style="display:inline-block;background-color:#0a0a0a;color:#ffffff;padding:10px 22px;text-decoration:none;border-radius:6px;font-size:13px;font-weight:600;">Verify Account →</a></p>
    <p style="margin-top:20px;font-size:11px;color:#a1a1aa;">If the button doesn't work, copy this link into your browser:<br>${verifyUrl}</p>
  `);
  const text = `Welcome to AUREVIA.\n\nPlease verify your email using this link:\n${verifyUrl}`;
  
  await sendEmail({
    to: email,
    subject: "Verify Your AUREVIA Account",
    html,
    text,
    idempotencyKey: `verify-${email}`,
    notificationType: "verification"
  });
}

export async function sendPasswordReset(email: string, token: string) {
  const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/reset-password?token=${token}`;
  const html = getBrandedTemplate("Reset Your Password", `
    <p>We received a request to reset your password for your AUREVIA account.</p>
    <p><a href="${resetUrl}" style="display:inline-block;background-color:#0a0a0a;color:#ffffff;padding:10px 22px;text-decoration:none;border-radius:6px;font-size:13px;font-weight:600;">Reset Password →</a></p>
    <p style="margin-top:20px;font-size:11px;color:#a1a1aa;">If you did not request a password reset, you can safely ignore this email.</p>
  `);
  const text = `Reset your password using this link:\n${resetUrl}`;
  
  await sendEmail({
    to: email,
    subject: "Reset Your AUREVIA Password",
    html,
    text,
    idempotencyKey: `reset-${email}`,
    notificationType: "password_reset"
  });
}

export async function sendPaymentReceived(booking: any) {
  const refCode = booking.referenceCode || booking.reference_code;
  const customerEmail = booking.contactEmail || booking.contact_email;
  const total = Number(booking.totalPayable ?? booking.total_payable ?? 0);
  const bookingId = booking.id;

  // 1. Notify Customer
  const htmlCustomer = getBrandedTemplate("Payment Confirmed", `
    <p>Dear ${booking.contactName || "Customer"},</p>
    <p>We have successfully verified your checkout payment for booking <strong>${refCode}</strong>.</p>
    <p>Your payment of <strong>₹${total.toLocaleString("en-IN")}</strong> has been credited to our system.</p>
    <p>Your rental status is currently <strong>Approval Pending</strong> while our administration reviews the equipment logs. You will receive an update shortly.</p>
  `);
  const textCustomer = `Dear ${booking.contactName || "Customer"},\n\nPayment confirmed for booking ${refCode}. Amount: ₹${total.toLocaleString("en-IN")}. Current status: Approval Pending.`;
  
  await sendEmail({
    to: customerEmail,
    subject: `Payment Confirmed - ${refCode}`,
    html: htmlCustomer,
    text: textCustomer,
    idempotencyKey: `pay-cust-${refCode}`,
    bookingId,
    notificationType: "payment_received_customer"
  });

  // 2. Notify Owner
  const premEmail = process.env.EMAIL_REPLY_TO || "sachiii8827@gmail.com";
  const htmlOwner = getBrandedTemplate("New Booking Payment Received", `
    <p>A new payment of <strong>₹${total.toLocaleString("en-IN")}</strong> has been received from <strong>${booking.contactName || "Customer"}</strong> for booking reference <strong>${refCode}</strong>.</p>
    <p>Please log in to the admin panel to review and approve this booking request.</p>
  `);
  const textOwner = `New payment of ₹${total.toLocaleString("en-IN")} received from ${booking.contactName || "Customer"} for booking ${refCode}. Please review in the admin panel.`;
  
  await sendEmail({
    to: premEmail,
    subject: `[PAYMENT] ₹${total} received from ${booking.contactName || "Customer"}`,
    html: htmlOwner,
    text: textOwner,
    idempotencyKey: `pay-owner-${refCode}`,
    bookingId,
    notificationType: "payment_received_owner"
  });
}

export async function sendBookingApproved(booking: any) {
  const refCode = booking.referenceCode || booking.reference_code;
  const customerEmail = booking.contactEmail || booking.contact_email;
  const bookingId = booking.id;

  const html = getBrandedTemplate("Booking Approved", `
    <p>Dear ${booking.contactName || "Customer"},</p>
    <p>Your booking request <strong>${refCode}</strong> has been approved.</p>
    <p>Please log in to your dashboard to sign the digital rental agreement. Once signed, your pick-up OTP will be generated.</p>
    <p><a href="${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/dashboard" style="display:inline-block;background-color:#0a0a0a;color:#ffffff;padding:10px 22px;text-decoration:none;border-radius:6px;font-size:13px;font-weight:600;letter-spacing:0.03em;">Go to Dashboard →</a></p>
  `);
  const text = `Dear ${booking.contactName || "Customer"},\n\nYour booking ${refCode} has been approved. Please log in to sign the digital agreement:\n${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/dashboard`;
  
  await sendEmail({
    to: customerEmail,
    subject: `Booking Approved - ${refCode}`,
    html,
    text,
    idempotencyKey: `appr-${refCode}`,
    bookingId,
    notificationType: "booking_approved"
  });
}

export async function sendBookingRejected(booking: any, reason: string) {
  const refCode = booking.referenceCode || booking.reference_code;
  const customerEmail = booking.contactEmail || booking.contact_email;
  const bookingId = booking.id;

  const html = getBrandedTemplate("Booking Rejected", `
    <p>Dear ${booking.contactName || "Customer"},</p>
    <p>We regret to inform you that your booking request <strong>${refCode}</strong> has been rejected by our administration.</p>
    <p><strong>Reason for rejection:</strong> ${reason || "Verification details mismatch."}</p>
    <p>A full refund will be initiated to your source account. Please contact support if you have any questions.</p>
  `);
  const text = `Dear ${booking.contactName || "Customer"},\n\nYour booking ${refCode} has been rejected. Reason: ${reason}. A refund will be initiated.`;
  
  await sendEmail({
    to: customerEmail,
    subject: `Booking Request Rejected - ${refCode}`,
    html,
    text,
    idempotencyKey: `rej-${refCode}`,
    bookingId,
    notificationType: "booking_rejected"
  });
}

export async function sendBookingCancelled(booking: any) {
  const refCode = booking.referenceCode || booking.reference_code;
  const customerEmail = booking.contactEmail || booking.contact_email;
  const bookingId = booking.id;

  const html = getBrandedTemplate("Booking Cancelled", `
    <p>Dear ${booking.contactName || "Customer"},</p>
    <p>Your booking request <strong>${refCode}</strong> has been successfully **cancelled**.</p>
    <p>Any payments made will be refunded to your source account within 5-7 business days.</p>
  `);
  const text = `Dear ${booking.contactName || "Customer"},\n\nYour booking ${refCode} has been cancelled. Refund will be processed.`;
  
  await sendEmail({
    to: customerEmail,
    subject: `Booking Cancelled - ${refCode}`,
    html,
    text,
    idempotencyKey: `canc-${refCode}`,
    bookingId,
    notificationType: "booking_cancelled"
  });
}

export async function sendPickupOTP(booking: any, otp: string) {
  const refCode = booking.referenceCode || booking.reference_code;
  const customerEmail = booking.contactEmail || booking.contact_email;
  const bookingId = booking.id;

  const html = getBrandedTemplate("Equipment Handover OTP", `
    <p>Dear ${booking.contactName || "Customer"},</p>
    <p>Thank you for signing the rental agreement. Your equipment pickup OTP has been generated.</p>
    <div style="background-color:#f4f4f5;padding:20px 24px;text-align:center;border-radius:6px;margin:24px 0;">
      <span style="font-size:32px;font-family:monospace;letter-spacing:0.3em;color:#0a0a0a;font-weight:700;">${otp}</span>
    </div>
    <p>Present this OTP at the checkout counter to collect your gear. This code is valid for this booking only.</p>
  `);
  const text = `Dear ${booking.contactName || "Customer"},\n\nYour pickup OTP code is: ${otp}. Present it at checkout to collect your gear.`;
  
  await sendEmail({
    to: customerEmail,
    subject: `Equipment Handover OTP - ${refCode}`,
    html,
    text,
    idempotencyKey: `otp-${refCode}`,
    bookingId,
    notificationType: "pickup_otp"
  });
}

export async function sendPickupReminder(booking: any) {
  const refCode = booking.referenceCode || booking.reference_code;
  const customerEmail = booking.contactEmail || booking.contact_email;
  const bookingId = booking.id;

  const html = getBrandedTemplate("Pickup Reminder", `
    <p>Dear ${booking.contactName || "Customer"},</p>
    <p>This is a reminder that your rental period for booking <strong>${refCode}</strong> starts today.</p>
    <p>Please bring a valid ID and present your pickup OTP at the checkout counter to verify the gear serial numbers and collect your equipment.</p>
  `);
  const text = `Dear ${booking.contactName || "Customer"},\n\nReminder: Your rental pickup is scheduled today for booking ${refCode}.`;
  
  await sendEmail({
    to: customerEmail,
    subject: `Pickup Reminder - Booking ${refCode}`,
    html,
    text,
    idempotencyKey: `pickup-rem-${refCode}`,
    bookingId,
    notificationType: "pickup_reminder"
  });
}

export async function sendReturnReminder(booking: any) {
  const refCode = booking.referenceCode || booking.reference_code;
  const customerEmail = booking.contactEmail || booking.contact_email;
  const bookingId = booking.id;

  const html = getBrandedTemplate("Return Reminder", `
    <p>Dear ${booking.contactName || "Customer"},</p>
    <p>This is a reminder that your rental period for booking <strong>${refCode}</strong> ends tomorrow.</p>
    <p>Please arrange to return the equipment before the cutoff time to avoid late fees (₹999 per day).</p>
  `);
  const text = `Dear ${booking.contactName || "Customer"},\n\nReminder: Your rental return is scheduled tomorrow for booking ${refCode}.`;
  
  await sendEmail({
    to: customerEmail,
    subject: `Return Reminder - Booking ${refCode}`,
    html,
    text,
    idempotencyKey: `return-rem-${refCode}`,
    bookingId,
    notificationType: "return_reminder"
  });
}

export async function sendLateReturnDamageCharge(booking: any, type: "late" | "damage" | "both", amount: number, description: string) {
  const refCode = booking.referenceCode || booking.reference_code;
  const customerEmail = booking.contactEmail || booking.contact_email;
  const bookingId = booking.id;

  const html = getBrandedTemplate("Incident Charges Assessed", `
    <p>Dear ${booking.contactName || "Customer"},</p>
    <p>Our team has assessed incident fees for your booking return <strong>${refCode}</strong>.</p>
    <p><strong>Charge Details:</strong></p>
    <ul>
      <li>Type: ${type.toUpperCase()}</li>
      <li>Amount: ₹${amount.toLocaleString("en-IN")}</li>
      <li>Description: ${description || "N/A"}</li>
    </ul>
  `);
  const text = `Dear ${booking.contactName || "Customer"},\n\nIncident charges assessed for booking ${refCode}. Type: ${type}, Amount: ₹${amount.toLocaleString("en-IN")}, Details: ${description}`;
  
  await sendEmail({
    to: customerEmail,
    subject: `Assessed Charges Notification - ${refCode}`,
    html,
    text,
    idempotencyKey: `charge-${refCode}-${type}`,
    bookingId,
    notificationType: "incident_charge"
  });
}

export async function sendBookingCompletion(booking: any) {
  const refCode = booking.referenceCode || booking.reference_code;
  const customerEmail = booking.contactEmail || booking.contact_email;
  const bookingId = booking.id;

  const html = getBrandedTemplate("Rental Completed", `
    <p>Dear ${booking.contactName || "Customer"},</p>
    <p>Thank you for choosing AUREVIA Premium Rentals.</p>
    <p>Your return for booking <strong>${refCode}</strong> has been successfully processed, and the gear was returned in good order.</p>
    <p>We hope to serve you again for your next creative project!</p>
  `);
  const text = `Dear ${booking.contactName || "Customer"},\n\nYour rental ${refCode} has been completed and returned in good order. Thank you!`;
  
  await sendEmail({
    to: customerEmail,
    subject: `Rental Completed - Thank You - ${refCode}`,
    html,
    text,
    idempotencyKey: `compl-${refCode}`,
    bookingId,
    notificationType: "booking_completed"
  });
}
