"use client";

import React, { useState, useEffect, useRef, useSyncExternalStore } from "react";
import { useChatbot } from "./ChatbotProvider";
import { RefreshCw, Sparkles, X } from "lucide-react";
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

function getSavedPosition(): { x: number; y: number } | null {
  if (typeof window !== "undefined") {
    const saved = localStorage.getItem("aurevia_chat_position");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return null;
      }
    }
  }
  return null;
}

export default function FloatingChatLauncher() {
  const { toggleChat, openChat, isOpen, unreadCount } = useChatbot();
  const isMounted = useIsMounted();

  const [customPosition, setCustomPosition] = useState<{ x: number; y: number } | null>(getSavedPosition);
  const [showGreeting, setShowGreeting] = useState(false);
  const launcherRef = useRef<HTMLButtonElement>(null);
  const greetingRef = useRef<HTMLDivElement>(null);

  // Drag state
  const dragInfo = useRef({
    isDragging: false,
    startX: 0,
    startY: 0,
    startPosX: 0,
    startPosY: 0,
    hasMoved: false,
  });

  // Proactive greeting bubble timer
  useEffect(() => {
    if (!isMounted) return;

    // Show greeting prompt after 2.8 seconds if not already opened
    const timer = setTimeout(() => {
      if (!isOpen) {
        setShowGreeting(true);
      }
    }, 2800);

    // Auto-dismiss after 12 seconds
    const dismissTimer = setTimeout(() => {
      setShowGreeting(false);
    }, 14800);

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

  // Update position on window resize to prevent leaving viewport
  useEffect(() => {
    if (!isMounted || !customPosition) return;
    const handleResize = () => {
      setCustomPosition((prev) => {
        if (!prev) return null;
        const maxX = window.innerWidth - 70;
        const maxY = window.innerHeight - 70;
        const newX = Math.min(Math.max(16, prev.x), maxX);
        const newY = Math.min(Math.max(16, prev.y), maxY);
        return { x: newX, y: newY };
      });
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isMounted, customPosition]);

  // Save position when it changes
  useEffect(() => {
    if (isMounted) {
      if (customPosition && customPosition.x > 0 && customPosition.y > 0) {
        localStorage.setItem("aurevia_chat_position", JSON.stringify(customPosition));
      } else if (!customPosition) {
        localStorage.removeItem("aurevia_chat_position");
      }
    }
  }, [customPosition, isMounted]);

  // Idle breathing animation
  useEffect(() => {
    if (!isMounted || isOpen || !launcherRef.current) return;

    const pulse = animate(launcherRef.current, {
      scale: [1, 1.05, 1],
      boxShadow: [
        "0 0 10px rgba(216, 179, 106, 0.2)",
        "0 0 22px rgba(216, 179, 106, 0.45)",
        "0 0 10px rgba(216, 179, 106, 0.2)",
      ],
      duration: 3200,
      loop: true,
      easing: "easeInOutSine",
    });

    return () => {
      pulse.pause();
    };
  }, [isMounted, isOpen]);

  const handlePointerDown = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (e.button !== 0 && e.button !== undefined) return;

    const launcher = launcherRef.current;
    if (!launcher) return;

    launcher.setPointerCapture(e.pointerId);

    const currentRect = launcher.getBoundingClientRect();
    const currentPosX = customPosition ? customPosition.x : currentRect.left;
    const currentPosY = customPosition ? customPosition.y : currentRect.top;

    dragInfo.current = {
      isDragging: true,
      startX: e.clientX,
      startY: e.clientY,
      startPosX: currentPosX,
      startPosY: currentPosY,
      hasMoved: false,
    };
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (!dragInfo.current.isDragging) return;

    const deltaX = e.clientX - dragInfo.current.startX;
    const deltaY = e.clientY - dragInfo.current.startY;

    if (Math.abs(deltaX) > 4 || Math.abs(deltaY) > 4) {
      dragInfo.current.hasMoved = true;
    }

    const nextX = dragInfo.current.startPosX + deltaX;
    const nextY = dragInfo.current.startPosY + deltaY;

    const padding = 16;
    const maxX = window.innerWidth - 70;
    const maxY = window.innerHeight - 70;

    const clampedX = Math.min(Math.max(padding, nextX), maxX);
    const clampedY = Math.min(Math.max(padding, nextY), maxY);

    requestAnimationFrame(() => {
      setCustomPosition({ x: clampedX, y: clampedY });
    });
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (!dragInfo.current.isDragging) return;

    launcherRef.current?.releasePointerCapture(e.pointerId);

    const wasDragging = dragInfo.current.hasMoved;
    dragInfo.current.isDragging = false;

    if (!wasDragging) {
      toggleChat();
    } else {
      if (launcherRef.current) {
        animate(launcherRef.current, {
          scale: [1.1, 1],
          duration: 350,
          easing: "easeOutElastic(1, .6)",
        });
      }
    }
  };

  const resetPosition = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (launcherRef.current && customPosition) {
      const targetRect = {
        x: window.innerWidth - 70,
        y: window.innerHeight - 150,
      };

      animate(launcherRef.current, {
        translateX: [0, targetRect.x - customPosition.x],
        translateY: [0, targetRect.y - customPosition.y],
        duration: 400,
        easing: "easeOutExpo",
        complete: () => {
          setCustomPosition(null);
        },
      });
    } else {
      setCustomPosition(null);
    }
  };

  if (!isMounted) return null;

  return (
    <div
      className={
        customPosition
          ? "fixed z-50 pointer-events-none"
          : "fixed bottom-20 right-4 md:bottom-24 md:right-6 z-50 pointer-events-none"
      }
      style={
        customPosition
          ? {
              left: 0,
              top: 0,
              transform: `translate3d(${customPosition.x}px, ${customPosition.y}px, 0)`,
            }
          : undefined
      }
    >
      <div className="relative group pointer-events-auto">
        {/* Proactive Greeting Tooltip Pill */}
        {showGreeting && !isOpen && (
          <div
            ref={greetingRef}
            onClick={openChat}
            className="absolute right-14 top-1/2 -translate-y-1/2 bg-obsidian/95 border border-gold-border/60 text-ivory text-xs px-3.5 py-2 rounded-xl shadow-2xl flex items-center gap-2 cursor-pointer whitespace-nowrap animate-in fade-in slide-in-from-right-3 duration-300 hover:border-gold-champagne transition"
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
              className="ml-1 text-muted-gray hover:text-ivory p-0.5"
            >
              <X size={11} />
            </button>
          </div>
        )}

        {/* Unread badge */}
        {!isOpen && unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-gold-champagne text-obsidian text-[10px] font-bold font-mono h-5 w-5 rounded-full flex items-center justify-center border border-obsidian z-10 animate-bounce shadow-lg">
            {unreadCount}
          </span>
        )}

        {/* Floating Launcher Button */}
        <button
          ref={launcherRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          aria-label="Open AUREVIA support chat"
          className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-obsidian border border-gold-border text-gold-champagne flex items-center justify-center shadow-2xl hover:bg-gold-champagne/10 transition-colors cursor-grab active:cursor-grabbing select-none"
        >
          <div className="relative w-6 h-6 md:w-8 md:h-8 flex items-center justify-center">
            <Logo variant="monogram" theme="light" width={28} height={28} />
          </div>
          {/* Active online ring */}
          <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-obsidian" />
        </button>

        {/* Hover reset position button */}
        <button
          onClick={resetPosition}
          className="absolute -top-6 left-1/2 -translate-x-1/2 bg-black/80 border border-white/10 text-muted-gray hover:text-ivory text-[9px] font-mono py-0.5 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-auto flex items-center gap-1 shadow-lg whitespace-nowrap"
        >
          <RefreshCw size={8} /> Reset Pos
        </button>
      </div>
    </div>
  );
}
