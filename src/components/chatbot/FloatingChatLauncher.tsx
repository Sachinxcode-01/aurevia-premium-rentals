"use client";

import React, { useState, useEffect, useRef, useSyncExternalStore } from "react";
import { useChatbot } from "./ChatbotProvider";
import { Sparkles, X } from "lucide-react";
import { animate } from "animejs";
import { Logo } from "@/components/ui/Logo";

const emptySubscribe = () => () => {};

function useIsMounted() {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
}

export default function FloatingChatLauncher() {
  const { toggleChat, openChat, isOpen, unreadCount } = useChatbot();
  const isMounted = useIsMounted();

  const [showGreeting, setShowGreeting] = useState(false);
  const launcherRef = useRef<HTMLButtonElement>(null);
  const greetingRef = useRef<HTMLDivElement>(null);

  // Clear any legacy custom drag coordinates to ensure fixed position above WhatsApp
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem("aurevia_chat_position");
      } catch {
        // ignore
      }
    }
  }, []);

  // Proactive greeting bubble timer (Desktop only: completely removed on mobile responsive)
  useEffect(() => {
    if (!isMounted) return;

    // Remove feature on mobile responsive
    const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
    if (isMobile) return;

    // Show greeting prompt on desktop after 3.2 seconds if not already opened
    const timer = setTimeout(() => {
      if (!isOpen && typeof window !== "undefined" && window.innerWidth >= 768) {
        setShowGreeting(true);
      }
    }, 3200);

    // Auto-dismiss after 12 seconds
    const dismissTimer = setTimeout(() => {
      setShowGreeting(false);
    }, 15200);

    return () => {
      clearTimeout(timer);
      clearTimeout(dismissTimer);
    };
  }, [isMounted, isOpen]);

  // Hide greeting when chat is opened
  useEffect(() => {
    if (isOpen) {
      setShowGreeting(false);
    }
  }, [isOpen]);

  // Idle breathing animation for launcher button
  useEffect(() => {
    if (!isMounted || isOpen || !launcherRef.current) return;

    const pulse = animate(launcherRef.current, {
      scale: [1, 1.04, 1],
      boxShadow: [
        "0 0 12px rgba(216, 179, 106, 0.25)",
        "0 0 24px rgba(216, 179, 106, 0.5)",
        "0 0 12px rgba(216, 179, 106, 0.25)",
      ],
      duration: 3200,
      loop: true,
      easing: "easeInOutSine",
    });

    return () => {
      pulse.pause();
    };
  }, [isMounted, isOpen]);

  if (!isMounted) return null;

  return (
    <div
      aria-label="Aurevia AI Concierge Chatbot"
      className="fixed bottom-19 right-4 md:bottom-24 md:right-6 z-50 flex items-center select-none"
    >
      <div className="relative group">
        {/* Desktop-only Proactive Greeting Tooltip Pill (Completely removed on mobile) */}
        {showGreeting && !isOpen && (
          <div
            ref={greetingRef}
            onClick={openChat}
            className="hidden md:flex absolute right-16 top-1/2 -translate-y-1/2 bg-obsidian/95 border border-gold-border/70 text-ivory text-xs px-3.5 py-2 rounded-xl shadow-2xl items-center gap-2.5 cursor-pointer whitespace-nowrap animate-in fade-in slide-in-from-right-3 duration-300 hover:border-gold-champagne transition backdrop-blur-md"
          >
            <Sparkles size={13} className="text-gold-champagne shrink-0 animate-spin" />
            <div className="text-left">
              <span className="font-semibold text-gold-champagne block text-[11px]">Need gear advice?</span>
              <span className="text-[10px] text-muted-gray">Chat with AURA Concierge</span>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowGreeting(false);
              }}
              title="Dismiss"
              className="ml-1 text-muted-gray hover:text-ivory p-0.5 transition"
            >
              <X size={12} />
            </button>
          </div>
        )}

        {/* Unread badge */}
        {!isOpen && unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-gold-champagne text-obsidian text-[10px] font-bold font-mono h-5 w-5 rounded-full flex items-center justify-center border-2 border-obsidian z-20 animate-bounce shadow-lg">
            {unreadCount}
          </span>
        )}

        {/* Floating Launcher Button - Fixed directly above WhatsApp icon */}
        <button
          ref={launcherRef}
          onClick={toggleChat}
          aria-label="Open AUREVIA AI Concierge Chatbot"
          className="relative w-12 h-12 md:w-14 md:h-14 rounded-full bg-obsidian border border-gold-border text-gold-champagne flex items-center justify-center shadow-2xl hover:bg-gold-champagne/15 active:scale-95 transition-all duration-300 cursor-pointer group"
        >
          <div className="relative w-6 h-6 md:w-8 md:h-8 flex items-center justify-center">
            <Logo variant="monogram" theme="light" width={28} height={28} />
          </div>
          
          {/* Active online ring indicator */}
          <span className="absolute bottom-0 right-0 w-3 h-3 md:w-3.5 md:h-3.5 rounded-full bg-emerald-500 border-2 border-obsidian animate-pulse" />

          {/* Desktop Hover Tooltip (Expands to the left) */}
          <span className="hidden md:block absolute right-16 px-3 py-1.5 bg-charcoal/95 border border-gold-border/40 text-gold-champagne text-[10px] font-mono font-semibold uppercase tracking-wider rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap shadow-xl pointer-events-none">
            AUREVIA AI Concierge
          </span>
        </button>
      </div>
    </div>
  );
}
