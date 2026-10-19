"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "@/hooks/useCart";
import { ShoppingBag, ArrowRight, MessageCircle, Sparkles } from "lucide-react";

export default function StickyMobileCTA() {
  const pathname = usePathname();
  const { cart } = useCart();
  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  // Don't show sticky mobile CTA on checkout, booking, or admin pages to avoid UI clutter
  if (
    pathname?.startsWith("/booking") ||
    pathname?.startsWith("/checkout") ||
    pathname?.startsWith("/admin")
  ) {
    return null;
  }

  const whatsappInquiryUrl = `https://wa.me/919686909048?text=${encodeURIComponent(
    "Hello Prem sir, Greetings! 👋✨\n\nI would like to inquire about cinema gear rental from AUREVIA Premium Rentals."
  )}`;

  return (
    <aside
      aria-label="Mobile quick action bar"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-neutral-950/95 backdrop-blur-xl border-t border-white/10 px-4 py-2.5 pb-[max(0.625rem,env(safe-area-inset-bottom))] shadow-[0_-10px_30px_rgba(0,0,0,0.8)] transition-all"
    >
      <div className="max-w-md mx-auto flex items-center justify-between gap-3">
        {/* Direct WhatsApp Concierge Button */}
        <a
          href={whatsappInquiryUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-mono font-semibold transition-all active:scale-95"
          aria-label="Direct WhatsApp inquiry"
        >
          <MessageCircle className="w-4 h-4 text-emerald-400" />
          <span className="hidden xs:inline">WhatsApp</span>
        </a>

        {/* Primary CTA (View Cart or Explore Vault) */}
        {cartCount > 0 ? (
          <Link
            href="/cart"
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 text-neutral-950 font-bold text-xs uppercase tracking-wider font-mono shadow-lg shadow-amber-500/20 active:scale-95 transition-all"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Cart ({cartCount})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        ) : (
          <Link
            href="/explore"
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 text-neutral-950 font-bold text-xs uppercase tracking-wider font-mono shadow-lg shadow-amber-500/20 active:scale-95 transition-all"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Explore Gear Vault</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        )}
      </div>
    </aside>
  );
}
