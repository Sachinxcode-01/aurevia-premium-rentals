"use client";

import React from "react";
import { X, MessageSquare, Send, CheckCircle2 } from "lucide-react";
import { generateWhatsAppLink, sendSimulatedSMS } from "@/lib/services/notificationService";

interface NotificationCenterModalProps {
  booking: any;
  onClose: () => void;
}

export default function NotificationCenterModal({ booking, onClose }: NotificationCenterModalProps) {
  const [smsSent, setSmsSent] = React.useState(false);

  const payload = {
    bookingId: booking.id,
    referenceCode: booking.referenceCode || booking.reference_code || booking.id,
    customerName: booking.customerName || booking.customer || "Valued Customer",
    customerPhone: booking.customerPhone || booking.contactPhone || "919686909048",
    equipmentName: booking.equipmentName || booking.equipment || "Camera Gear Package",
    status: booking.status || "ready_for_pickup",
    pickupOTP: booking.pickupOTP || "1358",
    startDate: booking.startDate,
    endDate: booking.endDate,
  };

  const whatsappUrl = generateWhatsAppLink(payload);

  const handleSendSMS = async () => {
    await sendSimulatedSMS(payload);
    setSmsSent(true);
    setTimeout(() => setSmsSent(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#121212] border border-[#D8B36A]/40 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-5 text-white">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-2">
            <MessageSquare className="text-[#D8B36A]" size={20} />
            <div>
              <h3 className="font-mono text-sm font-bold text-white uppercase tracking-wider">
                WhatsApp &amp; SMS Dispatcher
              </h3>
              <p className="text-xs text-gray-400 font-sans">
                {payload.customerName} ({payload.customerPhone})
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-white/10 rounded text-gray-400 hover:text-white">
            <X size={18} />
          </button>
        </div>

        {/* Dispatch Options */}
        <div className="space-y-3">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3.5 px-4 bg-[#25D366] hover:bg-[#20ba5a] text-black font-mono font-bold text-xs uppercase tracking-wider rounded-xl transition flex items-center justify-center gap-2 shadow-lg"
          >
            <MessageSquare size={16} />
            Open Instant WhatsApp Web / App
          </a>

          <button
            onClick={handleSendSMS}
            className="w-full py-3.5 px-4 bg-white/10 hover:bg-white/20 text-white font-mono font-bold text-xs uppercase tracking-wider rounded-xl border border-white/10 transition flex items-center justify-center gap-2"
          >
            <Send size={16} className="text-[#D8B36A]" />
            Dispatch Direct Gateway SMS
          </button>

          {smsSent && (
            <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono rounded-lg flex items-center justify-center gap-2 animate-fade-in">
              <CheckCircle2 size={14} /> SMS Notification sent to gateway!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
