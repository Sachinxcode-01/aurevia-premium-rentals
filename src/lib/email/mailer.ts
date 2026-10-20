import nodemailer from "nodemailer";
import path from "path";
import fs from "fs";

interface EmailPayload {
  to: string;
  subject: string;
  html: string;
  text: string;
  idempotencyKey?: string;
  bookingId?: string;
  notificationType?: string;
  attachments?: nodemailer.SendMailOptions["attachments"];
}

export async function sendEmail({
  to,
  subject,
  html,
  text,
  idempotencyKey,
  bookingId,
  notificationType,
  attachments,
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
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_APP_PASSWORD || process.env.SMTP_PASS;
  const secure = process.env.SMTP_SECURE === "true" || port === 465;

  if (!host || !user || !pass || pass.includes("PLACEHOLDER")) {
    console.warn("[Email Warning] SMTP credentials are not configured or are placeholders. Logging email to console:");
    console.log(`--- EMAIL START ---\nTo: ${to}\nSubject: ${subject}\nText: ${text}\n--- EMAIL END ---`);
    
    // In mock/dev, register in db and treat as processed
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

  const from = process.env.EMAIL_FROM || process.env.SMTP_FROM || `"AUREVIA Camera Rentals" <${user}>`;
  const replyTo = process.env.EMAIL_REPLY_TO || process.env.SMTP_REPLY_TO || user;

  // Automatically attach inline Aurevia logo if available on disk and not already attached
  const finalAttachments = [...(attachments || [])];
  try {
    const candidatePaths = [
      path.join(process.cwd(), "public", "readme", "aurevia-logo.png"),
      path.join(process.cwd(), "public", "aurevia-logo.png"),
    ];
    const validLogoPath = candidatePaths.find((p) => fs.existsSync(p));

    if (validLogoPath && !finalAttachments.some((a: any) => a.cid === "aurevia-logo@inline")) {
      finalAttachments.push({
        filename: "aurevia-logo.png",
        path: validLogoPath,
        cid: "aurevia-logo@inline",
      });
    }
  } catch {
    // Non-blocking attachment fallback
  }

  const mailOptions: nodemailer.SendMailOptions = {
    from,
    to,
    replyTo,
    subject,
    text,
    html,
    attachments: finalAttachments,
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
        await db.logProcessedEvent(eventKey, "failed", attempt, undefined, bookingId, notificationType);
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

export interface BrandedTemplateOptions {
  recipientEmail?: string;
  recipientName?: string;
  badge?: string;
}

export function getBrandedTemplate(
  title: string,
  bodyContent: string,
  options: BrandedTemplateOptions = {}
): string {
  const replyEmail = process.env.EMAIL_REPLY_TO || "sachiii8827@gmail.com";
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://aurevia-premium-rentals.vercel.app";
  const remoteLogoUrl = "https://aurevia-premium-rentals.vercel.app/readme/aurevia-logo.png";
  const logoSrc = "cid:aurevia-logo@inline";

  const memberStrip = options.recipientEmail
    ? `
      <div style="background-color: #141416; border: 1px solid #27272a; border-radius: 8px; padding: 12px 16px; margin: 0 0 24px; font-size: 11px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td align="left" style="color: #a1a1aa;">
              <span style="display: inline-block; width: 6px; height: 6px; border-radius: 50%; background-color: #d8b36a; margin-right: 6px; vertical-align: middle;"></span>
              Member: <strong style="color: #f5f1e8; font-family: monospace;">${options.recipientEmail}</strong>
              ${options.recipientName ? `&nbsp;(<span style="color: #e4e4e7;">${options.recipientName}</span>)` : ""}
            </td>
            <td align="right" style="color: #10b981; font-family: monospace; font-size: 10px; font-weight: 600; letter-spacing: 0.05em;">
              ✓ VERIFIED MEMBER
            </td>
          </tr>
        </table>
      </div>
    `
    : "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} — AUREVIA Premium Rentals</title>
</head>
<body style="margin:0;padding:0;background-color:#070708;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#070708;padding:32px 12px;">
    <tr>
      <td align="center">
        <!-- Main Card Container -->
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background-color:#0f0f12;border-radius:14px;overflow:hidden;border:1px solid rgba(216,179,106,0.3);box-shadow:0 20px 40px rgba(0,0,0,0.8);">

          <!-- Top Gold Accent Ribbon -->
          <tr>
            <td style="height:3px;background:linear-gradient(90deg, #b98a43 0%, #d8b36a 50%, #f5e4be 100%);font-size:0;line-height:0;">&nbsp;</td>
          </tr>

          <!-- Header with Official Logo -->
          <tr>
            <td style="padding:32px 40px 24px;border-bottom:1px solid #222227;background-color:#0c0c0e;text-align:center;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <!-- Brand Aperture Logo -->
                    <a href="${appUrl}" target="_blank" style="text-decoration:none;display:inline-block;">
                      <img src="${logoSrc}" onerror="this.onerror=null;this.src='${remoteLogoUrl}'" alt="AUREVIA Logo" width="68" height="68" style="display:block;margin:0 auto 12px;border-radius:12px;border:1px solid #d8b36a;background-color:#000000;box-shadow:0 4px 14px rgba(216,179,106,0.25);" />
                    </a>
                    <h1 style="margin:0;font-size:22px;font-weight:700;letter-spacing:0.25em;color:#f5f1e8;text-transform:uppercase;font-family:Georgia,serif;">
                      A U R E V I A
                    </h1>
                    <p style="margin:6px 0 0;font-size:10px;color:#d8b36a;letter-spacing:0.18em;text-transform:uppercase;font-family:monospace;font-weight:600;">
                      SOUTH INDIA'S LUXURY CINEMA &amp; OPTICS CONCIERGE
                    </p>
                    <div style="margin-top:10px;display:inline-block;padding:3px 12px;border-radius:999px;background-color:rgba(216,179,106,0.1);border:1px solid rgba(216,179,106,0.25);font-size:9px;color:#d8b36a;font-family:monospace;letter-spacing:0.08em;">
                      🔒 256-BIT TLS ENCRYPTED TRANSMISSION
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Content Body -->
          <tr>
            <td style="padding:36px 40px;background-color:#0f0f12;">
              ${memberStrip}
              <h2 style="margin:0 0 20px;font-size:18px;font-weight:500;color:#f5f1e8;font-family:Georgia,serif;letter-spacing:0.01em;">
                ${title}
              </h2>
              <div style="font-size:14px;line-height:1.75;color:#d4d4d8;">
                ${bodyContent}
              </div>
            </td>
          </tr>

          <!-- Concierge WhatsApp Support Pill -->
          <tr>
            <td style="padding:0 40px 24px;background-color:#0f0f12;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#141416;border:1px solid #27272a;border-radius:10px;padding:16px;">
                <tr>
                  <td align="left">
                    <p style="margin:0;font-size:12px;font-weight:600;color:#f5f1e8;">Need Immediate Camera Concierge Support?</p>
                    <p style="margin:4px 0 0;font-size:11px;color:#a1a1aa;">Direct telephone calling or WhatsApp booking confirmation:</p>
                  </td>
                  <td align="right">
                    <a href="https://wa.me/919686909048" target="_blank" style="display:inline-block;background-color:#059669;color:#ffffff;padding:8px 16px;border-radius:6px;font-size:11px;font-weight:600;text-decoration:none;font-family:monospace;letter-spacing:0.03em;">
                      WhatsApp Concierge ↗
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Studio Information & Founder Signature -->
          <tr>
            <td style="padding:24px 40px;border-top:1px solid #1f1f23;background-color:#0a0a0c;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="left" style="font-size:11px;color:#71717a;line-height:1.6;">
                    <strong style="color:#d8b36a;font-family:Georgia,serif;font-size:12px;">Prem Mundargi</strong><br>
                    Founder &amp; Managing Director &bull; <strong style="color:#e4e4e7;">AUREVIA Premium Rentals</strong><br>
                    <span>Studio Vault, Gadag Main Road, Karnataka, India - 582101</span><br>
                    <span>Direct Calling: <strong style="color:#e4e4e7;">+91 96869 09048</strong></span> &bull; <span>Hubli &bull; Dharwad &bull; Bangalore</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Bottom Footer Bar -->
          <tr>
            <td style="padding:16px 40px 24px;background-color:#070708;text-align:center;border-top:1px solid #18181b;">
              <p style="margin:0;font-size:10px;color:#52525b;line-height:1.6;font-mono;">
                &copy; ${new Date().getFullYear()} AUREVIA Premium Rentals by Prem Mundargi. All rights reserved.
                <br>
                Official Website: <a href="${appUrl}" style="color:#d8b36a;text-decoration:none;">${appUrl.replace("https://","")}</a> &nbsp;&bull;&nbsp;
                Support: <a href="mailto:${replyEmail}" style="color:#d8b36a;text-decoration:none;">${replyEmail}</a>
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

export async function sendAccountVerificationOTP(email: string, name: string, otp: string) {
  const html = getBrandedTemplate(
    "Verify Your Account",
    `
    <p>Welcome to AUREVIA Premium Rentals, <strong style="color:#f5f1e8;">${name || "Valued Filmmaker"}</strong>.</p>
    <p>Please enter the 6-digit verification code below on the website to activate your private account and complete verification:</p>
    
    <div style="background-color:#09090b;border:1.5px solid #d8b36a;border-radius:10px;padding:22px;text-align:center;margin:24px 0;box-shadow:0 0 25px rgba(216,179,106,0.15);">
      <div style="font-size:10px;letter-spacing:0.25em;color:#d8b36a;text-transform:uppercase;font-family:monospace;margin-bottom:8px;font-weight:600;">
        ACCOUNT ACTIVATION CODE
      </div>
      <div style="font-size:36px;font-family:'Courier New',Courier,monospace;letter-spacing:0.35em;color:#f5f1e8;font-weight:700;padding-left:0.35em;">
        ${otp}
      </div>
      <div style="font-size:11px;color:#a1a1aa;margin-top:10px;font-family:monospace;">
        ⏱ EXPIRES IN 10 MINUTES &bull; ONE-TIME USE ONLY
      </div>
    </div>

    <p style="font-size:12px;color:#71717a;">If you did not request this verification code, please ignore this email or notify our concierge immediately.</p>
  `,
    { recipientEmail: email, recipientName: name }
  );

  const text = `Welcome to AUREVIA. Your Account Verification Code is: ${otp}\n\nEnter this code on the website to activate your account. Expires in 10 minutes.`;

  await sendEmail({
    to: email,
    subject: `Your AUREVIA Account Verification Code: ${otp}`,
    html,
    text,
    idempotencyKey: `verify-otp-${email}-${Date.now()}`,
    notificationType: "account_verification_otp",
  });
}

export async function sendEmailVerification(email: string, token: string) {
  const verifyUrl = `${process.env.NEXT_PUBLIC_APP_URL || "https://aurevia-premium-rentals.vercel.app"}/auth/verify?token=${token}`;
  const html = getBrandedTemplate(
    "Verify Your Email Address",
    `
    <p>Welcome to AUREVIA Premium Rentals.</p>
    <p>Please click the button below to verify your email address and activate your account access to our private cinema camera &amp; lens vault.</p>
    <div style="text-align:center;margin:28px 0;">
      <a href="${verifyUrl}" style="display:inline-block;background-color:#d8b36a;color:#070708;padding:12px 28px;text-decoration:none;border-radius:8px;font-size:13px;font-weight:700;letter-spacing:0.05em;font-family:monospace;">
        VERIFY ACCOUNT ACCESS &rarr;
      </a>
    </div>
    <p style="margin-top:20px;font-size:11px;color:#71717a;word-break:break-all;">If the button doesn't work, copy this link into your browser:<br>${verifyUrl}</p>
  `,
    { recipientEmail: email }
  );

  const text = `Welcome to AUREVIA.\n\nPlease verify your email using this link:\n${verifyUrl}`;

  await sendEmail({
    to: email,
    subject: "Verify Your AUREVIA Account",
    html,
    text,
    idempotencyKey: `verify-${email}`,
    notificationType: "verification",
  });
}

export async function sendPasswordResetOTP(email: string, otp: string) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://aurevia-premium-rentals.vercel.app";
  const html = getBrandedTemplate(
    "Password Reset Verification Code",
    `
    <p>We received an official request to reset the password for your AUREVIA member account.</p>
    <p>Please enter the 6-digit authentication code below directly on the website to set a new password:</p>
    
    <div style="background-color:#09090b;border:1.5px solid #d8b36a;border-radius:10px;padding:24px;text-align:center;margin:24px 0;box-shadow:0 0 25px rgba(216,179,106,0.15);">
      <div style="font-size:10px;letter-spacing:0.25em;color:#d8b36a;text-transform:uppercase;font-family:monospace;margin-bottom:8px;font-weight:600;">
        SECURITY PASSCODE
      </div>
      <div style="font-size:38px;font-family:'Courier New',Courier,monospace;letter-spacing:0.35em;color:#f5f1e8;font-weight:700;padding-left:0.35em;">
        ${otp}
      </div>
      <div style="font-size:11px;color:#a1a1aa;margin-top:10px;font-family:monospace;">
        ⏱ EXPIRES IN 10 MINUTES &bull; ONE-TIME USE
      </div>
    </div>

    <div style="text-align:center;margin:20px 0 28px;">
      <a href="${appUrl}/reset-password" style="display:inline-block;background-color:#d8b36a;color:#070708;padding:12px 26px;text-decoration:none;border-radius:8px;font-size:12px;font-weight:700;font-family:monospace;letter-spacing:0.05em;">
        RESET PASSWORD ON WEBSITE &rarr;
      </a>
    </div>

    <p style="font-size:12px;color:#71717a;line-height:1.6;">
      This verification code will expire in <strong>10 minutes</strong>. If you did not initiate this request, your account credentials remain safe and you can safely disregard this email.
    </p>
  `,
    { recipientEmail: email }
  );

  const text = `Your AUREVIA Password Reset Code is: ${otp}\n\nThis code expires in 10 minutes.\nEnter this on the website to reset your password.`;

  await sendEmail({
    to: email,
    subject: `Your Password Reset Code: ${otp}`,
    html,
    text,
    idempotencyKey: `reset-otp-${email}-${Date.now()}`,
    notificationType: "password_reset_otp",
  });
}

export async function sendPasswordReset(email: string, token: string) {
  const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || "https://aurevia-premium-rentals.vercel.app"}/reset-password?token=${token}`;
  const html = getBrandedTemplate(
    "Reset Your Password",
    `
    <p>We received a request to reset your password for your AUREVIA account.</p>
    <div style="text-align:center;margin:28px 0;">
      <a href="${resetUrl}" style="display:inline-block;background-color:#d8b36a;color:#070708;padding:12px 28px;text-decoration:none;border-radius:8px;font-size:13px;font-weight:700;font-family:monospace;">
        RESET PASSWORD &rarr;
      </a>
    </div>
    <p style="margin-top:20px;font-size:11px;color:#71717a;">If you did not request a password reset, you can safely ignore this email.</p>
  `,
    { recipientEmail: email }
  );

  const text = `Reset your password using this link:\n${resetUrl}`;

  await sendEmail({
    to: email,
    subject: "Reset Your AUREVIA Password",
    html,
    text,
    idempotencyKey: `reset-${email}`,
    notificationType: "password_reset",
  });
}

// ─── NEW: WELCOME EMAIL ──────────────────────────────────────────────
export async function sendWelcomeEmail(email: string, name: string) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://aurevia-premium-rentals.vercel.app";
  const firstName = name ? name.split(" ")[0] : "Filmmaker";

  const html = getBrandedTemplate(
    `Welcome to the AUREVIA Vault, ${firstName}`,
    `
    <p>Dear ${name || "Valued Filmmaker"},</p>
    <p>It is our pleasure to welcome you to <strong>AUREVIA Premium Rentals</strong> — South India's premier camera concierge, founded by Prem Mundargi.</p>
    <p>You now have private access to our calibrated inventory of cinema bodies (RED Komodo, Sony FX3, Canon EOS R5), collimated cinema glass, and production flight cases.</p>

    <div style="background-color:#141416;border:1px solid #d8b36a;border-radius:10px;padding:20px;margin:24px 0;text-align:center;">
      <p style="margin:0;font-size:11px;font-family:monospace;letter-spacing:0.15em;color:#d8b36a;text-transform:uppercase;font-weight:700;">
        EXCLUSIVE NEW MEMBER GIFT
      </p>
      <p style="margin:8px 0 4px;font-size:24px;font-weight:700;color:#f5f1e8;font-family:'Courier New',Courier,monospace;letter-spacing:0.1em;">
        AUREVIA199
      </p>
      <p style="margin:0;font-size:12px;color:#a1a1aa;">
        Enjoy <strong>Flat ₹199/Day OFF</strong> on your first cinema camera or lens rental booking.
      </p>
    </div>

    <div style="text-align:center;margin:28px 0;">
      <a href="${appUrl}/explore" style="display:inline-block;background-color:#d8b36a;color:#070708;padding:12px 28px;text-decoration:none;border-radius:8px;font-size:13px;font-weight:700;letter-spacing:0.05em;font-family:monospace;">
        EXPLORE THE GEAR VAULT &rarr;
      </a>
    </div>

    <table width="100%" cellpadding="0" cellspacing="0" style="margin:20px 0;font-size:12px;color:#a1a1aa;border-collapse:collapse;">
      <tr>
        <td style="padding:8px 0;border-bottom:1px solid #222227;">&bull; <strong>Cleanroom Certified:</strong> Every sensor is swabbed and optically tested before dispatch.</td>
      </tr>
      <tr>
        <td style="padding:8px 0;border-bottom:1px solid #222227;">&bull; <strong>Zero-Deposit Options:</strong> Verified professionals rent with minimal friction.</td>
      </tr>
      <tr>
        <td style="padding:8px 0;">&bull; <strong>Doorstep Flight Cases:</strong> Pelican waterproof flight cases delivered across Karnataka &amp; India.</td>
      </tr>
    </table>
  `,
    { recipientEmail: email, recipientName: name }
  );

  const text = `Welcome to AUREVIA Premium Rentals, ${name || "Filmmaker"}!\n\nUse your exclusive member coupon code AUREVIA199 for flat ₹199/day off your first rental.\n\nBrowse gear: ${appUrl}/explore\nConcierge: +91 96869 09048`;

  await sendEmail({
    to: email,
    subject: `Welcome to AUREVIA, ${firstName} ⚡ Exclusive ₹199 Member Gift Inside`,
    html,
    text,
    idempotencyKey: `welcome-${email}`,
    notificationType: "welcome_email",
  });
}

// ─── NEW: PASSWORD CHANGED CONFIRMATION ──────────────────────────────
export async function sendPasswordChangedConfirmation(email: string, name?: string) {
  const html = getBrandedTemplate(
    "Security Alert: Password Updated Successfully",
    `
    <p>Hello ${name || "AUREVIA Member"},</p>
    <p>This is an automated confirmation that the password for your AUREVIA account (<strong>${email}</strong>) was successfully changed.</p>
    <p style="margin:16px 0;padding:12px 16px;background-color:#141416;border:1px solid #27272a;border-radius:8px;font-size:12px;color:#a1a1aa;font-family:monospace;">
      Event: Password Reset Verified<br>
      Timestamp: ${new Date().toUTCString()}<br>
      Security Protocol: TLS 1.3 / bcrypt
    </p>
    <p style="font-size:12px;color:#f87171;">
      If you did not perform this action, please contact our emergency security team immediately at <strong>+91 96869 09048</strong> or reply to this email.
    </p>
  `,
    { recipientEmail: email, recipientName: name }
  );

  const text = `Security Alert: Your AUREVIA password was successfully updated on ${new Date().toUTCString()}.\nIf you did not make this change, please contact concierge immediately at +91 96869 09048.`;

  await sendEmail({
    to: email,
    subject: "Security Alert: AUREVIA Password Changed Successfully",
    html,
    text,
    idempotencyKey: `pwd-changed-${email}-${Date.now()}`,
    notificationType: "password_changed_security_alert",
  });
}

// ─── NEW: KYC STATUS NOTIFICATION ────────────────────────────────────
export async function sendKYCStatusEmail(
  email: string,
  name: string,
  status: "approved" | "rejected",
  reason?: string
) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://aurevia-premium-rentals.vercel.app";
  const isApproved = status === "approved";

  const html = getBrandedTemplate(
    isApproved ? "KYC Verification Approved" : "KYC Verification Update Required",
    `
    <p>Dear ${name || "Filmmaker"},</p>
    ${
      isApproved
        ? `
      <div style="background-color:#064e3b;border:1px solid #059669;border-radius:10px;padding:16px;margin:20px 0;text-align:center;">
        <p style="margin:0;font-size:14px;font-weight:700;color:#ecfdf5;font-family:monospace;">
          ✓ IDENTITY VERIFICATION APPROVED
        </p>
        <p style="margin:6px 0 0;font-size:12px;color:#a7f3d0;">
          You are now cleared for priority rentals and zero-deposit privileges.
        </p>
      </div>
      <p>Your government credentials and professional profile have been authenticated. You can now rent equipment seamlessly with express checkout.</p>
      <div style="text-align:center;margin:24px 0;">
        <a href="${appUrl}/explore" style="display:inline-block;background-color:#d8b36a;color:#070708;padding:12px 28px;text-decoration:none;border-radius:8px;font-size:13px;font-weight:700;font-family:monospace;">
          RENT GEAR WITH VERIFIED STATUS &rarr;
        </a>
      </div>
    `
        : `
      <div style="background-color:#450a0a;border:1px solid #dc2626;border-radius:10px;padding:16px;margin:20px 0;text-align:center;">
        <p style="margin:0;font-size:14px;font-weight:700;color:#fef2f2;font-family:monospace;">
          ACTION REQUIRED: KYC SUBMISSION NEEDS CORRECTION
        </p>
        <p style="margin:6px 0 0;font-size:12px;color:#fca5a5;">
          ${reason || "Document image blurred or information mismatch."}
        </p>
      </div>
      <p>Please log in to your dashboard to re-upload clear government proof (Aadhaar / Passport / DL) to complete verification.</p>
      <div style="text-align:center;margin:24px 0;">
        <a href="${appUrl}/kyc" style="display:inline-block;background-color:#d8b36a;color:#070708;padding:12px 28px;text-decoration:none;border-radius:8px;font-size:13px;font-weight:700;font-family:monospace;">
          UPDATE KYC DOCUMENTS &rarr;
        </a>
      </div>
    `
    }
  `,
    { recipientEmail: email, recipientName: name }
  );

  const text = isApproved
    ? `Dear ${name},\n\nYour AUREVIA KYC has been approved! You are cleared for express gear rentals: ${appUrl}/explore`
    : `Dear ${name},\n\nYour AUREVIA KYC needs attention: ${reason || "Please re-upload clear documents"}.\nUpdate here: ${appUrl}/kyc`;

  await sendEmail({
    to: email,
    subject: isApproved ? "KYC Approved - AUREVIA Verified Status Granted" : "KYC Update Required - AUREVIA Verification",
    html,
    text,
    idempotencyKey: `kyc-status-${email}-${status}-${Date.now()}`,
    notificationType: "kyc_status",
  });
}

// ─── BOOKINGS & PAYMENTS ─────────────────────────────────────────────

export async function sendPaymentReceived(booking: any) {
  const refCode = booking.referenceCode || booking.reference_code;
  const customerEmail = booking.contactEmail || booking.contact_email;
  const total = Number(booking.totalPayable ?? booking.total_payable ?? 0);
  const bookingId = booking.id;

  // 1. Notify Customer
  const htmlCustomer = getBrandedTemplate(
    "Payment Confirmed & Verified",
    `
    <p>Dear ${booking.contactName || "Customer"},</p>
    <p>We have successfully verified your checkout payment for booking reference <strong>${refCode}</strong>.</p>
    
    <div style="background-color:#141416;border:1px solid #27272a;border-radius:10px;padding:18px;margin:20px 0;">
      <table width="100%" cellpadding="0" cellspacing="0" style="font-size:13px;color:#d4d4d8;">
        <tr>
          <td style="padding:6px 0;">Booking Reference:</td>
          <td style="padding:6px 0;text-align:right;font-family:monospace;color:#d8b36a;font-weight:700;">${refCode}</td>
        </tr>
        <tr>
          <td style="padding:6px 0;">Amount Paid:</td>
          <td style="padding:6px 0;text-align:right;font-family:monospace;color:#10b981;font-weight:700;">₹${total.toLocaleString("en-IN")}</td>
        </tr>
        <tr>
          <td style="padding:6px 0;">Rental Status:</td>
          <td style="padding:6px 0;text-align:right;font-family:monospace;color:#e4e4e7;">Approval Pending</td>
        </tr>
      </table>
    </div>

    <p>Our studio team is reviewing the equipment allocation. You will receive an immediate notification once approved.</p>
  `,
    { recipientEmail: customerEmail, recipientName: booking.contactName }
  );

  const textCustomer = `Dear ${booking.contactName || "Customer"},\n\nPayment confirmed for booking ${refCode}. Amount: ₹${total.toLocaleString("en-IN")}. Current status: Approval Pending.`;
  
  await sendEmail({
    to: customerEmail,
    subject: `Payment Confirmed - Ref: ${refCode}`,
    html: htmlCustomer,
    text: textCustomer,
    idempotencyKey: `pay-cust-${refCode}`,
    bookingId,
    notificationType: "payment_received_customer",
  });

  // 2. Notify Owner / Admin
  const premEmail = process.env.EMAIL_REPLY_TO || "sachiii8827@gmail.com";
  const htmlOwner = getBrandedTemplate(
    "New Booking Payment Received",
    `
    <p>A new payment of <strong style="color:#10b981;">₹${total.toLocaleString("en-IN")}</strong> has been received from <strong>${booking.contactName || "Customer"}</strong> for booking <strong>${refCode}</strong>.</p>
    <p>Please log in to the admin panel to review and approve the equipment handover schedule.</p>
  `
  );
  const textOwner = `New payment of ₹${total.toLocaleString("en-IN")} received from ${booking.contactName || "Customer"} for booking ${refCode}. Please review in the admin panel.`;
  
  await sendEmail({
    to: premEmail,
    subject: `[NEW PAYMENT] ₹${total} from ${booking.contactName || "Customer"} (${refCode})`,
    html: htmlOwner,
    text: textOwner,
    idempotencyKey: `pay-owner-${refCode}`,
    bookingId,
    notificationType: "payment_received_owner",
  });
}

export async function sendBookingApproved(booking: any) {
  const refCode = booking.referenceCode || booking.reference_code;
  const customerEmail = booking.contactEmail || booking.contact_email;
  const bookingId = booking.id;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://aurevia-premium-rentals.vercel.app";

  const html = getBrandedTemplate(
    "Booking Approved & Equipment Reserved",
    `
    <p>Dear ${booking.contactName || "Customer"},</p>
    <p>Your equipment rental request <strong>${refCode}</strong> has been officially approved by our studio administration.</p>
    <p>Please log in to your dashboard to sign the digital rental agreement and generate your secure handover pass.</p>
    <div style="text-align:center;margin:28px 0;">
      <a href="${appUrl}/dashboard" style="display:inline-block;background-color:#d8b36a;color:#070708;padding:12px 28px;text-decoration:none;border-radius:8px;font-size:13px;font-weight:700;font-family:monospace;">
        SIGN AGREEMENT &amp; VIEW PASS &rarr;
      </a>
    </div>
  `,
    { recipientEmail: customerEmail, recipientName: booking.contactName }
  );

  const text = `Dear ${booking.contactName || "Customer"},\n\nYour booking ${refCode} has been approved. Please log in to sign the digital agreement:\n${appUrl}/dashboard`;
  
  await sendEmail({
    to: customerEmail,
    subject: `Booking Approved - ${refCode}`,
    html,
    text,
    idempotencyKey: `appr-${refCode}`,
    bookingId,
    notificationType: "booking_approved",
  });
}

export async function sendBookingRejected(booking: any, reason: string) {
  const refCode = booking.referenceCode || booking.reference_code;
  const customerEmail = booking.contactEmail || booking.contact_email;
  const bookingId = booking.id;

  const html = getBrandedTemplate(
    "Booking Status: Request Declined",
    `
    <p>Dear ${booking.contactName || "Customer"},</p>
    <p>We regret to inform you that your booking request <strong>${refCode}</strong> could not be fulfilled at this time.</p>
    <div style="background-color:#141416;border:1px solid #27272a;border-radius:8px;padding:14px;margin:18px 0;font-size:13px;color:#fca5a5;">
      <strong>Reason:</strong> ${reason || "Equipment schedule conflict or verification details mismatch."}
    </div>
    <p>Any advance deposit or rental fees paid will be automatically refunded to your original source account within 3–5 business days.</p>
  `,
    { recipientEmail: customerEmail, recipientName: booking.contactName }
  );

  const text = `Dear ${booking.contactName || "Customer"},\n\nYour booking ${refCode} has been rejected. Reason: ${reason}. A refund will be initiated.`;
  
  await sendEmail({
    to: customerEmail,
    subject: `Booking Request Update - ${refCode}`,
    html,
    text,
    idempotencyKey: `rej-${refCode}`,
    bookingId,
    notificationType: "booking_rejected",
  });
}

export async function sendBookingCancelled(booking: any) {
  const refCode = booking.referenceCode || booking.reference_code;
  const customerEmail = booking.contactEmail || booking.contact_email;
  const bookingId = booking.id;

  const html = getBrandedTemplate(
    "Booking Cancelled",
    `
    <p>Dear ${booking.contactName || "Customer"},</p>
    <p>Your booking request <strong>${refCode}</strong> has been cancelled as requested.</p>
    <p>Any eligible refund will be credited back to your original payment method in accordance with our rental terms.</p>
  `,
    { recipientEmail: customerEmail, recipientName: booking.contactName }
  );

  const text = `Dear ${booking.contactName || "Customer"},\n\nYour booking ${refCode} has been cancelled. Refund will be processed.`;
  
  await sendEmail({
    to: customerEmail,
    subject: `Booking Cancelled - ${refCode}`,
    html,
    text,
    idempotencyKey: `canc-${refCode}`,
    bookingId,
    notificationType: "booking_cancelled",
  });
}

export async function sendPickupOTP(booking: any, otp: string) {
  const refCode = booking.referenceCode || booking.reference_code;
  const customerEmail = booking.contactEmail || booking.contact_email;
  const bookingId = booking.id;

  const html = getBrandedTemplate(
    "Equipment Handover Pickup Passcode",
    `
    <p>Dear ${booking.contactName || "Customer"},</p>
    <p>Thank you for signing the rental agreement. Your equipment pickup authentication passcode is ready:</p>
    
    <div style="background-color:#09090b;border:1.5px solid #d8b36a;border-radius:10px;padding:24px;text-align:center;margin:24px 0;box-shadow:0 0 25px rgba(216,179,106,0.15);">
      <div style="font-size:10px;letter-spacing:0.25em;color:#d8b36a;text-transform:uppercase;font-family:monospace;margin-bottom:8px;font-weight:600;">
        COUNTER HANDOVER OTP
      </div>
      <div style="font-size:38px;font-family:'Courier New',Courier,monospace;letter-spacing:0.35em;color:#f5f1e8;font-weight:700;padding-left:0.35em;">
        ${otp}
      </div>
      <div style="font-size:11px;color:#a1a1aa;margin-top:10px;font-family:monospace;">
        PRESENT AT COUNTER FOR SERIAL VERIFICATION
      </div>
    </div>

    <p style="font-size:13px;color:#d4d4d8;">Please present this code to our studio specialist along with a valid ID when inspecting and collecting your Pelican flight cases.</p>
  `,
    { recipientEmail: customerEmail, recipientName: booking.contactName }
  );

  const text = `Dear ${booking.contactName || "Customer"},\n\nYour pickup OTP code is: ${otp}. Present it at checkout counter to collect your gear.`;
  
  await sendEmail({
    to: customerEmail,
    subject: `Equipment Handover OTP - ${refCode}`,
    html,
    text,
    idempotencyKey: `otp-${refCode}`,
    bookingId,
    notificationType: "pickup_otp",
  });
}

export async function sendPickupReminder(booking: any) {
  const refCode = booking.referenceCode || booking.reference_code;
  const customerEmail = booking.contactEmail || booking.contact_email;
  const bookingId = booking.id;

  const html = getBrandedTemplate(
    "Pickup Reminder: Rental Period Starts Today",
    `
    <p>Dear ${booking.contactName || "Customer"},</p>
    <p>This is a reminder that your rental period for booking <strong>${refCode}</strong> commences today.</p>
    <p>Please remember to bring a valid government ID and have your pickup OTP ready for sensor and collimation verification at the studio counter.</p>
  `,
    { recipientEmail: customerEmail, recipientName: booking.contactName }
  );

  const text = `Dear ${booking.contactName || "Customer"},\n\nReminder: Your rental pickup is scheduled today for booking ${refCode}.`;
  
  await sendEmail({
    to: customerEmail,
    subject: `Pickup Reminder - Booking ${refCode}`,
    html,
    text,
    idempotencyKey: `pickup-rem-${refCode}`,
    bookingId,
    notificationType: "pickup_reminder",
  });
}

export async function sendReturnReminder(booking: any) {
  const refCode = booking.referenceCode || booking.reference_code;
  const customerEmail = booking.contactEmail || booking.contact_email;
  const bookingId = booking.id;

  const html = getBrandedTemplate(
    "Return Reminder: Scheduled Return Tomorrow",
    `
    <p>Dear ${booking.contactName || "Customer"},</p>
    <p>This is a courtesy reminder that your rental booking <strong>${refCode}</strong> is scheduled for return tomorrow.</p>
    <p>Please return all Pelican flight cases, lens caps, and battery chargers before the 10:00 PM cutoff to ensure instant deposit settlement without late penalty fees.</p>
  `,
    { recipientEmail: customerEmail, recipientName: booking.contactName }
  );

  const text = `Dear ${booking.contactName || "Customer"},\n\nReminder: Your rental return is scheduled tomorrow for booking ${refCode}.`;
  
  await sendEmail({
    to: customerEmail,
    subject: `Return Reminder - Booking ${refCode}`,
    html,
    text,
    idempotencyKey: `return-rem-${refCode}`,
    bookingId,
    notificationType: "return_reminder",
  });
}

export async function sendLateReturnDamageCharge(
  booking: any,
  type: "late" | "damage" | "both",
  amount: number,
  description: string
) {
  const refCode = booking.referenceCode || booking.reference_code;
  const customerEmail = booking.contactEmail || booking.contact_email;
  const bookingId = booking.id;

  const html = getBrandedTemplate(
    "Incident Assessment Notice",
    `
    <p>Dear ${booking.contactName || "Customer"},</p>
    <p>Our optical diagnostics team has assessed fees for booking return <strong>${refCode}</strong>.</p>
    
    <div style="background-color:#141416;border:1px solid #27272a;border-radius:8px;padding:16px;margin:20px 0;">
      <table width="100%" cellpadding="0" cellspacing="0" style="font-size:13px;color:#d4d4d8;">
        <tr>
          <td style="padding:6px 0;">Assessment Type:</td>
          <td style="padding:6px 0;text-align:right;font-family:monospace;color:#f87171;font-weight:700;">${type.toUpperCase()}</td>
        </tr>
        <tr>
          <td style="padding:6px 0;">Amount Assessed:</td>
          <td style="padding:6px 0;text-align:right;font-family:monospace;color:#f87171;font-weight:700;">₹${amount.toLocaleString("en-IN")}</td>
        </tr>
        <tr>
          <td style="padding:6px 0;">Diagnostic Description:</td>
          <td style="padding:6px 0;text-align:right;color:#a1a1aa;">${description || "N/A"}</td>
        </tr>
      </table>
    </div>
  `,
    { recipientEmail: customerEmail, recipientName: booking.contactName }
  );

  const text = `Dear ${booking.contactName || "Customer"},\n\nIncident charges assessed for booking ${refCode}. Type: ${type}, Amount: ₹${amount.toLocaleString("en-IN")}, Details: ${description}`;
  
  await sendEmail({
    to: customerEmail,
    subject: `Assessed Charges Notification - ${refCode}`,
    html,
    text,
    idempotencyKey: `charge-${refCode}-${type}`,
    bookingId,
    notificationType: "incident_charge",
  });
}

export async function sendBookingCompletion(booking: any) {
  const refCode = booking.referenceCode || booking.reference_code;
  const customerEmail = booking.contactEmail || booking.contact_email;
  const bookingId = booking.id;

  const html = getBrandedTemplate(
    "Rental Completed & Handover Verified",
    `
    <p>Dear ${booking.contactName || "Customer"},</p>
    <p>Thank you for choosing <strong>AUREVIA Premium Rentals</strong> for your production.</p>
    <p>The return diagnostics for booking reference <strong>${refCode}</strong> have completed, and all equipment was verified in pristine working order.</p>
    <p>We look forward to powering your next cinematic vision!</p>
  `,
    { recipientEmail: customerEmail, recipientName: booking.contactName }
  );

  const text = `Dear ${booking.contactName || "Customer"},\n\nYour rental ${refCode} has been completed and returned in good order. Thank you!`;
  
  await sendEmail({
    to: customerEmail,
    subject: `Rental Completed - Thank You - ${refCode}`,
    html,
    text,
    idempotencyKey: `compl-${refCode}`,
    bookingId,
    notificationType: "booking_completed",
  });
}

export interface HandoverReceiptPayload {
  staffName?: string;
  items?: {
    productName: string;
    serialNumber?: string;
    condition?: string;
  }[];
  remarks?: string;
}

export async function sendHandoverDispatchReceipt(
  booking: any,
  details: HandoverReceiptPayload = {}
) {
  const refCode = booking.referenceCode || booking.reference_code || booking.id;
  const customerEmail = booking.contactEmail || booking.contact_email;
  const bookingId = booking.id;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://aurevia-premium-rentals.vercel.app";

  const itemsListHtml = (details.items || [])
    .map(
      (item) => `
      <tr style="border-bottom: 1px solid #222227;">
        <td style="padding: 10px 0; font-size: 13px; color: #f5f1e8; font-weight: 500;">${item.productName}</td>
        <td style="padding: 10px 0; font-size: 12px; font-family: monospace; color: #d8b36a; text-align: right;">${item.serialNumber || "AV-SN-AUTO"}</td>
      </tr>
    `
    )
    .join("");

  const html = getBrandedTemplate(
    "Equipment Handover & Dispatch Clearance",
    `
    <p>Dear ${booking.contactName || "Customer"},</p>
    <p>Your reserved equipment has been physically verified, optical sensor swabbed, and released to your custody at the AUREVIA studio counter.</p>
    
    <div style="background-color: #141416; border: 1px solid #27272a; border-radius: 8px; padding: 18px; margin: 20px 0;">
      <p style="margin: 0 0 12px; font-size: 11px; font-family: monospace; letter-spacing: 0.1em; color: #d8b36a; text-transform: uppercase;">
        DISPATCHED HARDWARE MANIFEST &bull; REF: ${refCode}
      </p>
      <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse;">
        <thead>
          <tr style="border-bottom: 1px solid #27272a;">
            <th style="padding: 6px 0; text-align: left; font-size: 11px; font-family: monospace; color: #71717a; text-transform: uppercase;">Item</th>
            <th style="padding: 6px 0; text-align: right; font-size: 11px; font-family: monospace; color: #71717a; text-transform: uppercase;">Serial No.</th>
          </tr>
        </thead>
        <tbody>
          ${itemsListHtml || '<tr><td colspan="2" style="padding:8px 0;color:#71717a;font-size:12px;">Cinema Camera Package (Serial Verified)</td></tr>'}
        </tbody>
      </table>
    </div>

    <table width="100%" cellpadding="0" cellspacing="0" style="margin: 16px 0; font-size: 13px; color: #d4d4d8;">
      <tr>
        <td style="padding: 6px 0;"><strong>Rental Return Cutoff:</strong></td>
        <td style="padding: 6px 0; text-align: right; font-family: monospace; color: #d8b36a; font-weight: 600;">${booking.endDate} &bull; 10:00 PM</td>
      </tr>
      <tr>
        <td style="padding: 6px 0;"><strong>Dispatched By:</strong></td>
        <td style="padding: 6px 0; text-align: right; color: #a1a1aa;">${details.staffName || "Studio Counter Specialist"}</td>
      </tr>
      ${details.remarks ? `<tr><td style="padding:6px 0;"><strong>Notes:</strong></td><td style="padding:6px 0;text-align:right;color:#a1a1aa;">${details.remarks}</td></tr>` : ""}
    </table>

    <div style="margin: 28px 0 12px; text-align: center;">
      <a href="${appUrl}/verify/booking?ref=${encodeURIComponent(refCode)}" style="display: inline-block; background-color: #d8b36a; color: #070708; padding: 12px 26px; border-radius: 8px; text-decoration: none; font-size: 13px; font-weight: 700; font-family: monospace; letter-spacing: 0.05em;">
        VIEW DIGITAL VERIFICATION PASS &rarr;
      </a>
    </div>
  `,
    { recipientEmail: customerEmail, recipientName: booking.contactName }
  );

  const text = `Dear ${booking.contactName || "Customer"},\n\nYour equipment for booking #${refCode} has been handed over at the studio counter.\n\nScheduled Return Cutoff: ${booking.endDate}\nDispatched by: ${details.staffName || "Studio Counter"}\n\nNeed support? Contact 24/7 concierge at +91 96869 09048.`;

  await sendEmail({
    to: customerEmail,
    subject: `Equipment Handover & Dispatch Receipt - ${refCode}`,
    html,
    text,
    idempotencyKey: `handover-receipt-${refCode}`,
    bookingId,
    notificationType: "handover_receipt",
  });
}

export interface ReturnSettlementPayload {
  condition: "good" | "damaged";
  damageCost?: number;
  damageDescription?: string;
  lateFee?: number;
  depositHeld?: number;
  netRefundable?: number;
  staffName?: string;
  remarks?: string;
}

export async function sendReturnSettlementReceipt(
  booking: any,
  details: ReturnSettlementPayload
) {
  const refCode = booking.referenceCode || booking.reference_code || booking.id;
  const customerEmail = booking.contactEmail || booking.contact_email;
  const bookingId = booking.id;
  const deposit = details.depositHeld || 5000;
  const lateFee = details.lateFee || 0;
  const damageCost = details.damageCost || 0;
  const netRefund = details.netRefundable !== undefined ? details.netRefundable : Math.max(0, deposit - lateFee - damageCost);
  const additionalDue = (lateFee + damageCost) > deposit ? (lateFee + damageCost - deposit) : 0;

  const html = getBrandedTemplate(
    "Equipment Return & Security Deposit Settlement",
    `
    <p>Dear ${booking.contactName || "Customer"},</p>
    <p>We have concluded the diagnostic inspection for equipment returned under booking <strong>#${refCode}</strong>.</p>

    <div style="background-color: ${details.condition === "good" ? "#064e3b" : "#450a0a"}; border: 1px solid ${details.condition === "good" ? "#059669" : "#dc2626"}; border-radius: 8px; padding: 14px 18px; margin: 18px 0;">
      <p style="margin: 0; font-size: 13px; font-weight: 700; color: ${details.condition === "good" ? "#ecfdf5" : "#fef2f2"}; font-family: monospace;">
        RETURN STATUS: ${details.condition === "good" ? "PRISTINE & RETURNED IN FULL" : "DAMAGE / WEAR ASSESSED"}
      </p>
      ${details.damageDescription ? `<p style="margin:6px 0 0;font-size:12px;color:#fca5a5;">Notes: ${details.damageDescription}</p>` : ""}
    </div>

    <div style="background-color: #141416; border: 1px solid #27272a; border-radius: 8px; padding: 18px; margin: 20px 0;">
      <p style="margin: 0 0 12px; font-size: 11px; font-family: monospace; letter-spacing: 0.1em; color: #d8b36a; text-transform: uppercase;">
        FINAL SETTLEMENT STATEMENT
      </p>
      <table width="100%" cellpadding="0" cellspacing="0" style="font-size: 13px; color: #d4d4d8;">
        <tr>
          <td style="padding: 6px 0;">Initial Security Deposit Held:</td>
          <td style="padding: 6px 0; text-align: right; font-family: monospace; color:#f5f1e8;">₹${deposit.toLocaleString("en-IN")}</td>
        </tr>
        ${lateFee > 0 ? `
        <tr>
          <td style="padding: 6px 0; color: #f87171;">Late Return Fee Deduction:</td>
          <td style="padding: 6px 0; text-align: right; font-family: monospace; color: #f87171;">-₹${lateFee.toLocaleString("en-IN")}</td>
        </tr>` : ""}
        ${damageCost > 0 ? `
        <tr>
          <td style="padding: 6px 0; color: #f87171;">Damage & Repair Deduction:</td>
          <td style="padding: 6px 0; text-align: right; font-family: monospace; color: #f87171;">-₹${damageCost.toLocaleString("en-IN")}</td>
        </tr>` : ""}
        <tr style="border-top: 1px solid #27272a;">
          <td style="padding: 10px 0; font-weight: 700; color: #f5f1e8;">Net Refundable Amount:</td>
          <td style="padding: 10px 0; text-align: right; font-family: monospace; font-size: 15px; font-weight: 700; color: #10b981;">₹${netRefund.toLocaleString("en-IN")}</td>
        </tr>
      </table>
    </div>

    ${additionalDue > 0 ? `
    <div style="background-color: #450a0a; border: 1px solid #dc2626; border-radius: 6px; padding: 12px; margin: 12px 0; font-size: 12px; color: #fca5a5;">
      Total deductions exceed the initial deposit held. An additional balance due of <strong>₹${additionalDue.toLocaleString("en-IN")}</strong> has been invoiced to your account.
    </div>` : `
    <p style="font-size: 12px; color: #a1a1aa;">
      The refundable deposit balance of <strong style="color:#10b981;">₹${netRefund.toLocaleString("en-IN")}</strong> will be credited to your original payment method within 3–5 business days.
    </p>`}
  `,
    { recipientEmail: customerEmail, recipientName: booking.contactName }
  );

  const text = `Dear ${booking.contactName || "Customer"},\n\nReturn inspection for booking #${refCode} has been finalized.\nCondition: ${details.condition.toUpperCase()}\nNet Refundable Deposit: ₹${netRefund.toLocaleString("en-IN")}\n\nThank you for choosing AUREVIA Premium Rentals!`;

  await sendEmail({
    to: customerEmail,
    subject: `Equipment Return & Settlement Receipt - ${refCode}`,
    html,
    text,
    idempotencyKey: `return-settlement-${refCode}`,
    bookingId,
    notificationType: "return_settlement",
  });
}
