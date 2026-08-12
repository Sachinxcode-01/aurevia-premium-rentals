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
  defaultMessage = "Hi AUREVIA, I would like to enquire about renting camera gear.",
}: FloatingWhatsAppProps) {
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(defaultMessage)}`;

  return (
    <motion.a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.95 }}
      className="fixed bottom-6 right-6 z-40 flex items-center gap-2.5 px-4 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full shadow-2xl border border-emerald-400/30 transition-all duration-300 group cursor-pointer"
      title="Enquire on WhatsApp"
    >
      <div className="relative">
        <MessageCircle className="w-5 h-5 fill-current" />
        <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-300 rounded-full animate-ping" />
      </div>
      <span className="hidden sm:inline-block text-xs font-semibold tracking-wider font-mono uppercase">
        Rent Enquiry
      </span>
    </motion.a>
  );
}
