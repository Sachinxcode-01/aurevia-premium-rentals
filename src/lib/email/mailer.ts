import nodemailer from "nodemailer";

interface EmailPayload {
  to: string;
  subject: string;
  html: string;
  text: string;
  idempotencyKey?: string;
}

// In-memory cache to prevent duplicate email sends within the same request/worker lifetime
const sentEmailsCache = new Set<string>();

export async function sendEmail({ to, subject, html, text, idempotencyKey }: EmailPayload): Promise<boolean> {
  const cacheKey = idempotencyKey ? `${to}:${idempotencyKey}` : "";
  if (cacheKey && sentEmailsCache.has(cacheKey)) {
    console.log(`[Email Bypass] Duplicate email send prevented to: ${to} (Key: ${idempotencyKey})`);
    return true;
  }

  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 465);
  const secure = process.env.SMTP_SECURE === "true";
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_APP_PASSWORD;

  if (!host || !user || !pass) {
    console.warn("[Email Warning] SMTP credentials are not configured. Logging content to console:");
    console.log(`--- EMAIL START ---\nTo: ${to}\nSubject: ${subject}\nText: ${text}\n--- EMAIL END ---`);
    return false;
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

  let retries = 3;
  while (retries > 0) {
    try {
      const info = await transporter.sendMail(mailOptions);
      console.log(`[Email Success] Email sent to ${to}: ${info.messageId}`);
      if (cacheKey) {
        sentEmailsCache.add(cacheKey);
      }
      return true;
    } catch (err: any) {
      retries--;
      console.error(`[Email Retry] Failed to send email to ${to} (${retries} retries remaining):`, err.message);
      if (retries === 0) {
        // Critical failure: notify Technical Manager (Sachin)
        await notifySachinOfFailure(to, subject, err.message);
      } else {
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }
    }
  }
  return false;
}

async function notifySachinOfFailure(failedRecipient: string, originalSubject: string, errorMessage: string) {
  const sachinEmail = process.env.EMAIL_SUPPORT || "sachiii8827@gmail.com";
  if (failedRecipient === sachinEmail) return; // avoid infinite loop

  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 465);
  const secure = process.env.SMTP_SECURE === "true";
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_APP_PASSWORD;

  if (!host || !user || !pass) return;

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
  });

  const mailOptions = {
    from: process.env.EMAIL_FROM || `"AUREVIA Alert" <${user}>`,
    to: sachinEmail,
    subject: `⚠️ [CRITICAL] AUREVIA Email Delivery Failure`,
    text: `Technical Alert:\n\nEmail delivery failed to ${failedRecipient}.\n\nOriginal Subject: ${originalSubject}\nError: ${errorMessage}\n\nPlease check the SMTP app credentials immediately.`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`[Email Warning] System failure alert sent to Sachin: ${sachinEmail}`);
  } catch (err: any) {
    console.error(`[Email Error] Critical: Could not notify Sachin:`, err.message);
  }
}

function getBrandedTemplate(title: string, bodyContent: string): string {
  const replyEmail = process.env.EMAIL_REPLY_TO || "premmundargi135@gmail.com";
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            background-color: #0b0c10;
            color: #f5f1e8;
            margin: 0;
            padding: 0;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #12131c;
            border: 1px solid #d8b36a;
            border-radius: 8px;
            overflow: hidden;
          }
          .header {
            background-color: #0b0c10;
            text-align: center;
            padding: 24px;
            border-bottom: 1px solid rgba(216, 179, 106, 0.2);
          }
          .logo {
            color: #d8b36a;
            font-size: 22px;
            font-weight: 300;
            letter-spacing: 0.18em;
            text-transform: uppercase;
            margin: 0;
          }
          .content {
            padding: 36px;
            line-height: 1.6;
            font-size: 14px;
            color: #f5f1e8;
          }
          .content h2 {
            color: #d8b36a;
            font-size: 18px;
            font-weight: 400;
            margin-top: 0;
            margin-bottom: 20px;
            text-transform: uppercase;
            letter-spacing: 0.05em;
          }
          .btn {
            display: inline-block;
            background-color: #d8b36a;
            color: #0b0c10;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 4px;
            font-weight: bold;
            font-size: 11px;
            text-transform: uppercase;
            letter-spacing: 0.1em;
            margin-top: 20px;
          }
          .footer {
            background-color: #0b0c10;
            padding: 20px;
            text-align: center;
            font-size: 10px;
            color: #6b7280;
            border-top: 1px solid rgba(216, 179, 106, 0.1);
          }
          .footer a {
            color: #d8b36a;
            text-decoration: none;
          }
        </style>
      </head>
      <body>
        <div style="background-color: #0b0c10; padding: 20px;">
          <div class="container">
            <div class="header">
              <h1 class="logo">AUREVIA</h1>
            </div>
            <div class="content">
              <h2>${title}</h2>
              ${bodyContent}
            </div>
            <div class="footer">
              <p>Protected by Supabase Auth · AUREVIA © 2026</p>
              <p>For support or help with rentals, email <a href="mailto:${replyEmail}">${replyEmail}</a></p>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;
}

// ─── TRANSACTIONS / BRANDED emailS ───────────────────────────────────

export async function sendEmailVerification(email: string, token: string) {
  const verifyUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/verify?token=${token}`;
  const html = getBrandedTemplate("Verify Your Email", `
    <p>Welcome to AUREVIA Premium Rentals.</p>
    <p>Please click the button below to verify your email address and activate your account access.</p>
    <a href="${verifyUrl}" class="btn">Verify Account</a>
    <p style="margin-top: 25px; font-size: 11px; color: #6b7280;">If the button doesn't work, copy this link into your browser: <br>${verifyUrl}</p>
  `);
  const text = `Welcome to AUREVIA.\n\nPlease verify your email using this link:\n${verifyUrl}`;
  await sendEmail({ to: email, subject: "Verify Your AUREVIA Account", html, text, idempotencyKey: `verify-${email}` });
}

export async function sendPasswordReset(email: string, token: string) {
  const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/reset-password?token=${token}`;
  const html = getBrandedTemplate("Reset Your Password", `
    <p>We received a request to reset your password for your AUREVIA vault account.</p>
    <p>Please click the button below to establish a new password.</p>
    <a href="${resetUrl}" class="btn">Reset Password</a>
    <p style="margin-top: 25px; font-size: 11px; color: #6b7280;">If you did not request a password reset, you can safely ignore this email.</p>
  `);
  const text = `Reset your password using this link:\n${resetUrl}`;
  await sendEmail({ to: email, subject: "Reset Your AUREVIA Password", html, text, idempotencyKey: `reset-${email}` });
}

export async function sendPaymentReceived(booking: any) {
  const refCode = booking.referenceCode || booking.reference_code;
  const customerEmail = booking.contactEmail || booking.contact_email;
  const total = Number(booking.totalPayable ?? booking.total_payable ?? 0);

  // 1. Notify Customer
  const htmlCustomer = getBrandedTemplate("Payment Confirmed", `
    <p>Dear ${booking.contactName || "Customer"},</p>
    <p>We have successfully verified your checkout payment for booking <strong>${refCode}</strong>.</p>
    <p>Your payment of <strong>₹${total.toLocaleString("en-IN")}</strong> has been credited to our system.</p>
    <p>Your rental status is currently <strong>Approval Pending</strong> while our administration reviews the equipment logs. You will receive an update shortly.</p>
  `);
  const textCustomer = `Dear ${booking.contactName || "Customer"},\n\nPayment confirmed for booking ${refCode}. Amount: ₹${total.toLocaleString("en-IN")}. Current status: Approval Pending.`;
  await sendEmail({ to: customerEmail, subject: `Payment Confirmed - ${refCode}`, html: htmlCustomer, text: textCustomer, idempotencyKey: `pay-cust-${refCode}` });

  // 2. Notify Prem (Business Owner)
  const premEmail = process.env.EMAIL_REPLY_TO || "premmundargi135@gmail.com";
  const htmlOwner = getBrandedTemplate("New Booking Checkout Payment", `
    <p>Hello Prem,</p>
    <p>A new payment of <strong>₹${total.toLocaleString("en-IN")}</strong> has been received from <strong>${booking.contactName || "Customer"}</strong> for booking reference <strong>${refCode}</strong>.</p>
    <p>Please log in to the admin panel to review and approve this booking request.</p>
  `);
  const textOwner = `Hello Prem,\n\nNew payment of ₹${total.toLocaleString("en-IN")} received from ${booking.contactName || "Customer"} for booking ${refCode}. Please review in the admin panel.`;
  await sendEmail({ to: premEmail, subject: `[PAYMENT] ₹${total} received from ${booking.contactName || "Customer"}`, html: htmlOwner, text: textOwner, idempotencyKey: `pay-owner-${refCode}` });
}

export async function sendBookingApproved(booking: any) {
  const refCode = booking.referenceCode || booking.reference_code;
  const customerEmail = booking.contactEmail || booking.contact_email;

  const html = getBrandedTemplate("Booking Approved", `
    <p>Dear ${booking.contactName || "Customer"},</p>
    <p>Good news! Your booking request <strong>${refCode}</strong> has been **approved** by our administration.</p>
    <p>Please log in to your dashboard to sign the digital rental agreement. Once signed, your pick-up OTP will be generated.</p>
    <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard" class="btn">Go to Dashboard</a>
  `);
  const text = `Dear ${booking.contactName || "Customer"},\n\nYour booking ${refCode} has been approved. Please log in to sign the digital agreement:\n${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard`;
  await sendEmail({ to: customerEmail, subject: `Booking Approved - ${refCode}`, html, text, idempotencyKey: `appr-${refCode}` });
}

export async function sendBookingRejected(booking: any, reason: string) {
  const refCode = booking.referenceCode || booking.reference_code;
  const customerEmail = booking.contactEmail || booking.contact_email;

  const html = getBrandedTemplate("Booking Rejected", `
    <p>Dear ${booking.contactName || "Customer"},</p>
    <p>We regret to inform you that your booking request <strong>${refCode}</strong> has been rejected by our administration.</p>
    <p><strong>Reason for rejection:</strong> ${reason || "Verification details mismatch."}</p>
    <p>A full refund will be initiated to your source account. Please contact support if you have any questions.</p>
  `);
  const text = `Dear ${booking.contactName || "Customer"},\n\nYour booking ${refCode} has been rejected. Reason: ${reason}. A refund will be initiated.`;
  await sendEmail({ to: customerEmail, subject: `Booking Request Rejected - ${refCode}`, html, text, idempotencyKey: `rej-${refCode}` });
}

export async function sendBookingCancelled(booking: any) {
  const refCode = booking.referenceCode || booking.reference_code;
  const customerEmail = booking.contactEmail || booking.contact_email;

  const html = getBrandedTemplate("Booking Cancelled", `
    <p>Dear ${booking.contactName || "Customer"},</p>
    <p>Your booking request <strong>${refCode}</strong> has been successfully **cancelled**.</p>
    <p>Any payments made will be refunded to your source account within 5-7 business days.</p>
  `);
  const text = `Dear ${booking.contactName || "Customer"},\n\nYour booking ${refCode} has been cancelled. Refund will be processed.`;
  await sendEmail({ to: customerEmail, subject: `Booking Cancelled - ${refCode}`, html, text, idempotencyKey: `canc-${refCode}` });
}

export async function sendPickupOTP(booking: any, otp: string) {
  const refCode = booking.referenceCode || booking.reference_code;
  const customerEmail = booking.contactEmail || booking.contact_email;

  const html = getBrandedTemplate("Equipment Handover OTP", `
    <p>Dear ${booking.contactName || "Customer"},</p>
    <p>Thank you for signing the rental agreement. Your equipment pickup OTP has been generated.</p>
    <div style="background-color: #0b0c10; padding: 20px; text-align: center; border: 1px dashed #d8b36a; border-radius: 4px; margin: 20px 0;">
      <span style="font-size: 28px; font-family: monospace; letter-spacing: 0.25em; color: #d8b36a; font-weight: bold;">${otp}</span>
    </div>
    <p>Please present this OTP code to Prem Mundargi at the checkout counter to collect your gear.</p>
  `);
  const text = `Dear ${booking.contactName || "Customer"},\n\nYour pickup OTP code is: ${otp}. Present it at checkout to collect your gear.`;
  await sendEmail({ to: customerEmail, subject: `Equipment Handover OTP - ${refCode}`, html, text, idempotencyKey: `otp-${refCode}` });
}

export async function sendPickupReminder(booking: any) {
  const refCode = booking.referenceCode || booking.reference_code;
  const customerEmail = booking.contactEmail || booking.contact_email;

  const html = getBrandedTemplate("Pickup Reminder", `
    <p>Dear ${booking.contactName || "Customer"},</p>
    <p>This is a reminder that your rental period for booking <strong>${refCode}</strong> starts today.</p>
    <p>Please bring a valid ID and present your pickup OTP at the checkout counter to verify the gear serial numbers and collect your equipment.</p>
  `);
  const text = `Dear ${booking.contactName || "Customer"},\n\nReminder: Your rental pickup is scheduled today for booking ${refCode}.`;
  await sendEmail({ to: customerEmail, subject: `Pickup Reminder - Booking ${refCode}`, html, text, idempotencyKey: `pickup-rem-${refCode}` });
}

export async function sendReturnReminder(booking: any) {
  const refCode = booking.referenceCode || booking.reference_code;
  const customerEmail = booking.contactEmail || booking.contact_email;

  const html = getBrandedTemplate("Return Reminder", `
    <p>Dear ${booking.contactName || "Customer"},</p>
    <p>This is a reminder that your rental period for booking <strong>${refCode}</strong> ends tomorrow.</p>
    <p>Please arrange to return the equipment before the cutoff time to avoid late fees (₹999 per day).</p>
  `);
  const text = `Dear ${booking.contactName || "Customer"},\n\nReminder: Your rental return is scheduled tomorrow for booking ${refCode}.`;
  await sendEmail({ to: customerEmail, subject: `Return Reminder - Booking ${refCode}`, html, text, idempotencyKey: `return-rem-${refCode}` });
}

export async function sendLateReturnDamageCharge(booking: any, type: "late" | "damage" | "both", amount: number, description: string) {
  const refCode = booking.referenceCode || booking.reference_code;
  const customerEmail = booking.contactEmail || booking.contact_email;

  const html = getBrandedTemplate("Incident Charges Assessed", `
    <p>Dear ${booking.contactName || "Customer"},</p>
    <p>Our team has assessed incident fees for your booking return <strong>${refCode}</strong>.</p>
    <p><strong>Charge Details:</strong></p>
    <ul>
      <li>Type: ${type.toUpperCase()}</li>
      <li>Amount: ₹${amount.toLocaleString("en-IN")}</li>
      <li>Description: ${description || "N/A"}</li>
    </ul>
    <p>These charges will be deducted from your security deposit, or must be settled directly if they exceed the deposit amount.</p>
  `);
  const text = `Dear ${booking.contactName || "Customer"},\n\nIncident charges assessed for booking ${refCode}. Type: ${type}, Amount: ₹${amount.toLocaleString("en-IN")}, Details: ${description}`;
  await sendEmail({ to: customerEmail, subject: `Assessed Charges Notification - ${refCode}`, html, text, idempotencyKey: `charge-${refCode}-${type}` });
}

export async function sendBookingCompletion(booking: any) {
  const refCode = booking.referenceCode || booking.reference_code;
  const customerEmail = booking.contactEmail || booking.contact_email;

  const html = getBrandedTemplate("Rental Completed", `
    <p>Dear ${booking.contactName || "Customer"},</p>
    <p>Thank you for choosing AUREVIA Premium Rentals.</p>
    <p>Your return for booking <strong>${refCode}</strong> has been successfully processed, and the gear was returned in good order.</p>
    <p>Your security deposit has been fully refunded. We hope to serve you again for your next creative project!</p>
  `);
  const text = `Dear ${booking.contactName || "Customer"},\n\nYour rental ${refCode} has been completed and returned in good order. Thank you!`;
  await sendEmail({ to: customerEmail, subject: `Rental Completed - Thank You - ${refCode}`, html, text, idempotencyKey: `compl-${refCode}` });
}
