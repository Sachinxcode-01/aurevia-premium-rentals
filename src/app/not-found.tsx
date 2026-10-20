import Link from "next/link";
import { Compass, Home, Camera, Sparkles, MessageCircle } from "lucide-react";
import { Logo } from "@/components/ui/Logo";

export default function NotFound() {
  const whatsappUrl = `https://wa.me/919686909048?text=${encodeURIComponent(
    "Hello Prem sir, I was looking for equipment on AUREVIA and came across a missing page. Could you help me locate the gear?"
  )}`;

  return (
    <div className="min-h-screen bg-obsidian flex flex-col items-center justify-center p-6 text-center text-ivory relative overflow-hidden selection:bg-gold-champagne/20 selection:text-ivory">
      {/* Background radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gold-champagne/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Brand Logo */}
      <div className="mb-8 z-10">
        <Link href="/" aria-label="AUREVIA Home">
          <Logo variant="wordmark" theme="light" width={130} height={36} />
        </Link>
      </div>

      <div className="relative mb-6 z-10">
        <div className="serif-heading text-8xl md:text-9xl font-light tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white/20 via-gold-champagne/15 to-transparent select-none">
          404
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-16 h-16 rounded-2xl bg-gold-champagne/10 border border-gold-champagne/30 flex items-center justify-center text-gold-champagne backdrop-blur-md shadow-xl shadow-gold-champagne/10">
            <Compass className="w-8 h-8" />
          </div>
        </div>
      </div>

      <h1 className="serif-heading text-3xl md:text-4xl font-light text-ivory mb-3 tracking-tight z-10">
        Scene Not Found
      </h1>
      <p className="text-muted-gray max-w-md text-sm mb-8 leading-relaxed font-light z-10">
        The cinema gear, visual package, or vault page you were looking for is outside the current frame or has relocated.
      </p>

      {/* Quick Action Navigation Buttons */}
      <div className="flex flex-wrap items-center justify-center gap-3 max-w-md z-10">
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gold-champagne text-obsidian font-semibold hover:bg-gold-champagne/90 transition shadow-lg shadow-gold-champagne/15 active:scale-95 text-xs font-mono tracking-wider uppercase cursor-pointer"
        >
          <Home className="w-3.5 h-3.5" />
          <span>Return Home</span>
        </Link>
        <Link
          href="/explore"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-ivory hover:border-gold-champagne/40 transition active:scale-95 text-xs font-mono tracking-wider uppercase cursor-pointer"
        >
          <Camera className="w-3.5 h-3.5 text-gold-champagne" />
          <span>Explore Gear</span>
        </Link>
        <Link
          href="/packages"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-ivory hover:border-gold-champagne/40 transition active:scale-95 text-xs font-mono tracking-wider uppercase cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5 text-gold-champagne" />
          <span>Shoot Kits</span>
        </Link>
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 transition active:scale-95 text-xs font-mono tracking-wider uppercase cursor-pointer"
        >
          <MessageCircle className="w-3.5 h-3.5" />
          <span>Ask Concierge</span>
        </a>
      </div>
    </div>
  );
}
