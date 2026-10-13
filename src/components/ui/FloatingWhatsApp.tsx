"use client";

import React from "react";
import { MessageCircle } from "lucide-react";
import { motion } from "motion/react";

interface FloatingWhatsAppProps {
  phoneNumber?: string;
  defaultMessage?: string;
}

export default function FloatingWhatsApp({
  phoneNumber = "919686909048",
  defaultMessage = `Hello Prem sir, Greetings! 👋✨\n\nI would like to enquire about equipment availability and book gear from AUREVIA Premium Rentals:\n\n🎬 *Project / Shoot Type:*\n📅 *Pickup Date & Time:*\n🔄 *Return Date & Time:*\n📍 *Pickup / Delivery:*\n\n📷 *Requested Equipment List:*\n• Camera Body:\n• Lenses:\n• Accessories & Power:\n\n📄 *KYC Verification:* [Govt ID proof: Aadhaar / DL / Passport]\n\nCould you please confirm live availability and share the quote? Looking forward to locking this reservation with AUREVIA. 🙏`,
}: FloatingWhatsAppProps) {
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(defaultMessage)}`;

  return (
    <div className="fixed bottom-4 right-4 md:bottom-6 md:right-6 z-40 flex items-center pointer-events-auto select-none">
      <motion.a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        className="relative w-12 h-12 md:w-14 md:h-14 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white shadow-2xl border border-emerald-400/30 flex items-center justify-center transition-all duration-300 group cursor-pointer"
        aria-label="Enquire on WhatsApp"
      >
        <MessageCircle className="w-5 h-5 md:w-6 md:h-6 fill-current shrink-0" />
        
        {/* Pulsing online status indicator */}
        <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-300 rounded-full border-2 border-obsidian animate-pulse" />

        {/* Hover Tooltip (Expands to the left, desktop only) */}
        <span className="hidden md:block absolute right-16 px-3 py-1.5 bg-charcoal/95 border border-emerald-500/30 text-emerald-300 text-[10px] font-mono font-semibold uppercase tracking-wider rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap shadow-xl pointer-events-none">
          WhatsApp Concierge
        </span>
      </motion.a>
    </div>
  );
}
