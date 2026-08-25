"use client";

import React, { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "motion/react";
import { 
  Gift, 
  Copy, 
  Check, 
  Share2, 
  Download, 
  X, 
  Sparkles, 
  MessageCircle, 
  ShieldCheck,
  Ticket
} from "lucide-react";
import { useToast } from "@/hooks/useToast";

interface ReferralModalProps {
  isOpen: boolean;
  onClose: () => void;
  userCode?: string;
}

export default function ReferralModal({
  isOpen,
  onClose,
  userCode = "AUREVIA-VIP-789",
}: ReferralModalProps) {
  const toast = useToast();
  const [copied, setCopied] = useState(false);
  const [referralCode, setReferralCode] = useState(userCode);

  const siteUrl = typeof window !== "undefined" 
    ? window.location.origin 
    : "https://aurevia-premium-rentals.vercel.app";

  const referralLink = `${siteUrl}/?ref=${referralCode}`;
  const bannerImageUrl = `${siteUrl}/referral-banner.jpg`;

  // WhatsApp Pre-filled Professional Referral Message
  const whatsappMessage = `🎬 *AUREVIA VIP CAMERA RENTAL PASS* 🎬

Hey! I'm sharing an exclusive 15% discount pass for renting premium cinema cameras, mirrorless bodies, and lenses from AUREVIA Premium Rentals!

🎁 *Your 15% Discount Voucher:* \`${referralCode}\`
✨ *Claim Discount & Reserve Gear:* ${referralLink}

🖼️ *View Official VIP Pass:* ${bannerImageUrl}

Frame the Extraordinary! 📷`;

  const handleWhatsAppDirectShare = (e: React.MouseEvent) => {
    e.preventDefault();
    const encodedText = encodeURIComponent(whatsappMessage);
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );

    if (isMobile) {
      // Launch native WhatsApp application directly on mobile
      window.location.href = `whatsapp://send?text=${encodedText}`;
    } else {
      // Open WhatsApp Web directly in a new tab on desktop/laptop
      window.open(`https://web.whatsapp.com/send?text=${encodedText}`, "_blank");
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      toast.success("Referral link copied to clipboard! Share it with your network.");
      setTimeout(() => setCopied(false), 2500);
    } catch {
      toast.error("Failed to copy link.");
    }
  };

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(referralCode);
      toast.success(`Voucher code '${referralCode}' copied!`);
    } catch {
      toast.error("Failed to copy voucher code.");
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "AUREVIA VIP Referral Pass — 15% OFF Camera Rentals",
          text: `Use my exclusive referral code ${referralCode} to get 15% OFF your luxury camera rental at AUREVIA!`,
          url: referralLink,
        });
        toast.success("Thank you for sharing AUREVIA!");
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          toast.error("Could not open share menu");
        }
      }
    } else {
      const encodedText = encodeURIComponent(whatsappMessage);
      window.open(`https://web.whatsapp.com/send?text=${encodedText}`, "_blank");
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-obsidian/85 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-xl bg-charcoal/95 border border-gold-champagne/30 rounded-2xl shadow-2xl overflow-hidden z-10 my-auto"
          >
            {/* Top Glow Accent Bar */}
            <div className="h-1.5 w-full bg-linear-to-r from-gold-champagne via-amber-300 to-gold-champagne" />

            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full bg-white/5 border border-white/10 text-muted-gray hover:text-ivory hover:bg-white/10 transition z-20 cursor-pointer"
              aria-label="Close modal"
            >
              <X size={18} />
            </button>

            {/* Modal Body */}
            <div className="p-6 sm:p-8 space-y-6">
              
              {/* Header */}
              <div className="text-center space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold-champagne/10 border border-gold-champagne/20 text-gold-champagne text-[11px] font-mono font-semibold uppercase tracking-widest">
                  <Gift size={13} /> VIP Referral Program
                </div>
                <h2 className="serif-heading text-2xl sm:text-3xl font-light text-ivory">
                  Gift <span className="text-gold">15% OFF</span>, Earn Rewards
                </h2>
                <p className="text-xs sm:text-sm text-muted-gray max-w-md mx-auto font-light leading-relaxed">
                  Share your exclusive VIP Referral Pass with fellow cinematographers and creators. They get <strong className="text-ivory font-medium">15% OFF</strong> their rental, and you receive <strong className="text-gold-champagne font-medium">₹500 Rental Credits</strong> when they book!
                </p>
              </div>

              {/* VIP Banner Preview Asset */}
              <div className="relative rounded-xl overflow-hidden border border-gold-champagne/20 shadow-xl group bg-black/60">
                <div className="aspect-video relative w-full">
                  <Image
                    src="/referral-banner.jpg"
                    alt="AUREVIA VIP Referral Pass Banner"
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-black/80 via-transparent to-transparent flex items-end p-4">
                    <div className="flex items-center justify-between w-full">
                      <span className="text-[10px] font-mono uppercase tracking-widest text-gold-champagne font-semibold flex items-center gap-1.5">
                        <Sparkles size={12} /> Official Promotional Banner
                      </span>
                      <a
                        href="/referral-banner.jpg"
                        download="Aurevia-VIP-Referral-Pass.jpg"
                        className="inline-flex items-center gap-1 text-[10px] font-mono font-semibold uppercase tracking-wider text-ivory bg-white/15 hover:bg-gold-champagne hover:text-obsidian px-2.5 py-1 rounded transition backdrop-blur-xs"
                      >
                        <Download size={11} /> Save Image
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              {/* Referral Code & Link Box */}
              <div className="space-y-4 bg-obsidian/70 border border-white/10 rounded-xl p-4 sm:p-5">
                
                {/* Code display */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5 pb-3">
                  <div className="flex-1">
                    <label className="text-[10px] font-mono uppercase text-muted-gray tracking-wider block mb-1">Your VIP Voucher Code</label>
                    <div className="flex items-center gap-2">
                      <Ticket size={16} className="text-gold-champagne shrink-0" />
                      <input
                        type="text"
                        value={referralCode}
                        onChange={(e) => setReferralCode(e.target.value.toUpperCase().replace(/[^A-Z0-9-]/g, ""))}
                        className="bg-charcoal border border-white/10 rounded px-2.5 py-1 text-xs font-mono font-bold text-gold-champagne focus:outline-none focus:border-gold-champagne uppercase"
                        placeholder="ENTER CODE"
                      />
                    </div>
                  </div>
                  <button
                    onClick={handleCopyCode}
                    className="px-3 py-1.5 text-xs font-mono font-semibold text-ivory bg-white/5 hover:bg-white/10 border border-white/10 rounded transition flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
                  >
                    <Copy size={13} /> Copy Code
                  </button>
                </div>

                {/* Link input + Copy Button */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono uppercase text-muted-gray tracking-wider block">Direct Referral Link</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={referralLink}
                      className="flex-1 bg-charcoal border border-white/10 rounded-lg px-3 py-2 text-xs font-mono text-ivory focus:outline-none focus:border-gold-champagne/50 select-all"
                    />
                    <button
                      onClick={handleCopyLink}
                      className="px-4 py-2 text-xs font-semibold text-obsidian bg-gold-champagne hover:bg-gold-warm rounded-lg transition flex items-center gap-1.5 shrink-0 cursor-pointer"
                    >
                      {copied ? <Check size={14} className="text-obsidian" /> : <Copy size={14} />}
                      {copied ? "Copied!" : "Copy Link"}
                    </button>
                  </div>
                </div>
              </div>

              {/* Action Sharing Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {/* WhatsApp Button */}
                <button
                  onClick={handleWhatsAppDirectShare}
                  className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs uppercase tracking-wider rounded-xl shadow-lg border border-emerald-400/30 flex items-center justify-center gap-2 transition cursor-pointer"
                >
                  <MessageCircle size={18} className="fill-current" />
                  Share on WhatsApp
                </button>

                {/* Native Share / General Share Button */}
                <button
                  onClick={handleNativeShare}
                  className="w-full py-3 px-4 bg-white/5 hover:bg-white/10 border border-white/15 text-ivory font-semibold text-xs uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 transition cursor-pointer"
                >
                  <Share2 size={16} />
                  More Share Options
                </button>
              </div>

              {/* Footer Trust Note */}
              <div className="flex items-center justify-center gap-2 text-[11px] text-muted-gray font-light text-center pt-1 border-t border-white/5">
                <ShieldCheck size={14} className="text-gold-champagne shrink-0" />
                <span>Unlimited referrals. Credits are applied automatically to your next checkout.</span>
              </div>

            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
