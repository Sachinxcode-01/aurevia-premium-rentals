/**
 * AUREVIA Production WhatsApp Business & SMS Notification System
 * Handles automated transactional alerts for camera rentals & concierge dispatches.
 */

import { createClient as createSupabaseClient } from "@supabase/supabase-js";

export type NotificationType =
  | "BOOKING_CONFIRMED"
  | "PAYMENT_RECEIVED"
  | "PICKUP_READY"
  | "RETURN_REMINDER"
  | "REFERRAL_CREDIT_EARNED"
  | "KYC_VERIFIED";

export interface NotificationPayload {
  phone: string;
  customerName: string;
  type: NotificationType;
  referenceCode?: string;
  equipmentName?: string;
  amount?: number;
  pickupTime?: string;
  customMessage?: string;
}

export interface NotificationResult {
  success: boolean;
  channel: "whatsapp_api" | "whatsapp_deeplink" | "sms";
  message: string;
  whatsappUrl?: string;
}

// Format phone number to clean E.164 standard (e.g. 919686909048)
function formatPhoneNumber(phone: string): string {
  const digits = (phone || "").replace(/\D/g, "");
  if (digits.length === 10) return `91${digits}`;
  if (digits.length === 12 && digits.startsWith("91")) return digits;
  return digits || "919686909048";
}

/**
 * Format notification message text for filmmakers
 */
export function buildNotificationText(payload: NotificationPayload): string {
  const name = payload.customerName || "Filmmaker";
  const ref = payload.referenceCode || "AUREVIA-RENTAL";
  const gear = payload.equipmentName || "Cinema Equipment Pack";
  const amount = payload.amount ? `₹${payload.amount.toLocaleString("en-IN")}` : "";

  switch (payload.type) {
    case "BOOKING_CONFIRMED":
      return `🎬 *AUREVIA CINEMA RENTALS*\n\nDear ${name},\n\nYour reservation *${ref}* for *${gear}* has been confirmed!\nTotal Amount: ${amount}\n\nOur concierge team is calibrating your gear. Thank you for framing the extraordinary with AUREVIA.`;

    case "PAYMENT_RECEIVED":
      return `💳 *AUREVIA PAYMENT RECEIPT*\n\nDear ${name},\n\nWe have received payment of *${amount}* for booking *${ref}*.\nYour digital agreement and receipt have been issued to your dashboard.`;

    case "PICKUP_READY":
      return `🧳 *PELICAN CASE READY FOR PICKUP*\n\nDear ${name},\n\nYour Pelican Flight-Case (*${ref}*) with *${gear}* has completed optical sensor certification!\n\nPickup Vault: Aurevia Studio, Gadag\nReady Time: ${payload.pickupTime || "Immediate"}\n\nPlease bring your original ID for handover.`;

    case "RETURN_REMINDER":
      return `⏳ *AUREVIA RETURN REMINDER*\n\nDear ${name},\n\nFriendly reminder: Your rental equipment for *${ref}* is due for return by *${payload.pickupTime || "04:00 PM today"}*.\n\nPlease ensure sensor caps, batteries, and memory cards are placed inside the Pelican flight case.`;

    case "REFERRAL_CREDIT_EARNED":
      return `🎁 *AUREVIA REWARD CREDIT EARNED*\n\nCongratulations ${name}!\n\nYour referred filmmaker has completed their first booking. You've earned *₹500 in rental credits*! View your balance on your dashboard.`;

    case "KYC_VERIFIED":
      return `🛡️ *AUREVIA KYC VERIFIED*\n\nDear ${name},\n\nYour identity documents have been approved by our security desk. You now hold VIP Creator Status for express equipment pickup!`;

    default:
      return payload.customMessage || `AUREVIA Notification for ${ref}`;
  }
}

/**
 * Legacy Helper: Generate WhatsApp Deep-Link URL
 */
export function generateWhatsAppLink(payload: any): string {
  const phone = formatPhoneNumber(payload.customerPhone || payload.phone || "919686909048");
  const text = buildNotificationText({
    phone,
    customerName: payload.customerName || "Valued Filmmaker",
    type: payload.status === "ready_for_pickup" ? "PICKUP_READY" : "BOOKING_CONFIRMED",
    referenceCode: payload.referenceCode || payload.bookingId,
    equipmentName: payload.equipmentName,
    pickupTime: payload.pickupTime,
  });
  return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
}

/**
 * Legacy Helper: Dispatch Simulated / Gateway SMS
 */
export async function sendSimulatedSMS(payload: any): Promise<{ success: boolean; message: string }> {
  return {
    success: true,
    message: `SMS alert dispatched to ${payload.customerPhone || payload.phone || "customer"}`,
  };
}

/**
 * Dispatch Transactional WhatsApp / SMS Notification
 */
export async function sendNotificationAction(
  payload: NotificationPayload
): Promise<NotificationResult> {
  const cleanPhone = formatPhoneNumber(payload.phone);
  const text = buildNotificationText(payload);

  // Check for Twilio / WhatsApp Cloud API environmental credentials
  const waToken = process.env.WHATSAPP_API_TOKEN;
  const waPhoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;

  if (waToken && waPhoneId) {
    try {
      const response = await fetch(
        `https://graph.facebook.com/v18.0/${waPhoneId}/messages`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${waToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            messaging_product: "whatsapp",
            to: cleanPhone,
            type: "text",
            text: { body: text },
          }),
        }
      );

      if (response.ok) {
        await recordNotificationInDB(payload.type, cleanPhone, text, "sent");
        return {
          success: true,
          channel: "whatsapp_api",
          message: "WhatsApp notification sent successfully via WhatsApp Cloud API.",
        };
      }
    } catch (err) {
      console.error("WhatsApp API dispatch error:", err);
    }
  }

  // Fallback: Generate WhatsApp Deep-Link URL for Concierge / Direct Dispatch
  const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;
  await recordNotificationInDB(payload.type, cleanPhone, text, "queued_deeplink");

  return {
    success: true,
    channel: "whatsapp_deeplink",
    message: "WhatsApp deep-link prepared for direct dispatch.",
    whatsappUrl,
  };
}

/**
 * Log Notification Entry in Supabase `notifications` Table
 */
async function recordNotificationInDB(
  type: string,
  phone: string,
  message: string,
  status: string
) {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://uoutovqmmxzawhvpahcg.supabase.co";
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
    if (!url || !key) return;

    const supabase = createSupabaseClient(url, key);
    await supabase.from("notifications").insert([
      {
        title: `WhatsApp Alert: ${type}`,
        message,
        type,
        status,
        created_at: new Date().toISOString(),
      },
    ] as never[]);
  } catch {
    // Non-blocking log recording
  }
}
