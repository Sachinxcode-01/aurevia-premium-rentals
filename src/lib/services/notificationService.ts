/* Automated WhatsApp & SMS Notification Dispatcher for Aurevia */

export interface NotificationPayload {
  bookingId: string;
  referenceCode: string;
  customerName: string;
  customerPhone: string;
  equipmentName: string;
  status: string;
  pickupOTP?: string;
  startDate?: string;
  endDate?: string;
}

export function generateWhatsAppLink(payload: NotificationPayload): string {
  const phone = payload.customerPhone.replace(/[^0-9]/g, "") || "919686909048";
  const formattedPhone = phone.startsWith("91") ? phone : `91${phone}`;

  let message = "";

  if (payload.status === "approved" || payload.status === "ready_for_pickup") {
    message = `Hello ${payload.customerName}! 📸 Your Aurevia Camera Rental reservation #${payload.referenceCode} for ${payload.equipmentName} is APPROVED and READY FOR PICKUP!\n\n🔑 Your Handover Verification OTP is: *${payload.pickupOTP || "1358"}*\n\nPlease present this OTP or scan your booking QR code at pickup.\nNeed help? Call +91 96869 09048.`;
  } else if (payload.status === "rented") {
    message = `Hello ${payload.customerName}! 🚀 Equipment Handover Complete for Booking #${payload.referenceCode} (${payload.equipmentName}).\n\nReturn Date: ${payload.endDate || "As scheduled"}.\nEnjoy your shoot! Thank you for choosing Aurevia.`;
  } else if (payload.status === "extension_approved") {
    message = `Hello ${payload.customerName}! ⏳ Your Rental Extension request for #${payload.referenceCode} has been APPROVED!\nNew Return Date: ${payload.endDate}.\nHappy shooting!`;
  } else {
    message = `Hello ${payload.customerName}! Updates regarding your Aurevia reservation #${payload.referenceCode} (${payload.equipmentName}): Status is now ${payload.status.replace(/_/g, " ").toUpperCase()}.\n\nView details: https://aurevia-premium-rentals.vercel.app/dashboard`;
  }

  return `https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`;
}

export async function sendSimulatedSMS(payload: NotificationPayload): Promise<{ success: boolean; message: string }> {
  console.log(`[SMS Dispatcher] Sending SMS to ${payload.customerPhone}: Booking #${payload.referenceCode} updated to ${payload.status}`);
  return {
    success: true,
    message: `SMS notification dispatched to ${payload.customerPhone}`,
  };
}
