"use client";

import React, { useState, useEffect, useRef } from "react";
import { useChatbot } from "./ChatbotProvider";
import { MessageSquare, RefreshCw } from "lucide-react";
import { animate } from "animejs";

export default function FloatingChatLauncher() {
  const { toggleChat, isOpen, unreadCount } = useChatbot();
  
  // Position state (defaults to bottom-right)
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isReady, setIsReady] = useState(false);
  const launcherRef = useRef<HTMLButtonElement>(null);
  
  // Drag state
  const dragInfo = useRef({
    isDragging: false,
    startX: 0,
    startY: 0,
    startPosX: 0,
    startPosY: 0,
    hasMoved: false,
  });

  // Load saved position
  useEffect(() => {
    const saved = localStorage.getItem("aurevia_chat_position");
    if (saved) {
      try {
        const { x, y } = JSON.parse(saved);
        setPosition({ x, y });
      } catch (e) {
        // Fallback default
        setPosition({ x: window.innerWidth - 80, y: window.innerHeight - 80 });
      }
    } else {
      setPosition({ x: window.innerWidth - 80, y: window.innerHeight - 80 });
    }
    setIsReady(true);
  }, []);

  // Update position on window resize to prevent leaving viewport
  useEffect(() => {
    if (!isReady) return;
    const handleResize = () => {
      setPosition((prev) => {
        const maxX = window.innerWidth - 70;
        const maxY = window.innerHeight - 70;
        const newX = Math.min(Math.max(16, prev.x), maxX);
        const newY = Math.min(Math.max(16, prev.y), maxY);
        return { x: newX, y: newY };
      });
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isReady]);

  // Save position when it changes
  useEffect(() => {
    if (isReady) {
      localStorage.setItem("aurevia_chat_position", JSON.stringify(position));
    }
  }, [position, isReady]);

  // Breathing animation on idle
  useEffect(() => {
    if (!isReady || isOpen || !launcherRef.current) return;
    
    const pulse = animate(launcherRef.current, {
      scale: [1, 1.05, 1],
      boxShadow: [
        "0 0 10px rgba(216, 179, 106, 0.2)",
        "0 0 20px rgba(216, 179, 106, 0.4)",
        "0 0 10px rgba(216, 179, 106, 0.2)"
      ],
      duration: 3000,
      loop: true,
      easing: "easeInOutSine"
    });

    return () => {
      pulse.pause();
    };
  }, [isReady, isOpen]);

  const handlePointerDown = (e: React.PointerEvent<HTMLButtonElement>) => {
    // Left click or touch only
    if (e.button !== 0 && e.button !== undefined) return;
    
    const launcher = launcherRef.current;
    if (!launcher) return;
    
    launcher.setPointerCapture(e.pointerId);
    dragInfo.current = {
      isDragging: true,
      startX: e.clientX,
      startY: e.clientY,
      startPosX: position.x,
      startPosY: position.y,
      hasMoved: false,
    };
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (!dragInfo.current.isDragging) return;
    
    const deltaX = e.clientX - dragInfo.current.startX;
    const deltaY = e.clientY - dragInfo.current.startY;
    
    // Set minimal movement threshold to distinguish drag from click
    if (Math.abs(deltaX) > 4 || Math.abs(deltaY) > 4) {
      dragInfo.current.hasMoved = true;
    }

    const nextX = dragInfo.current.startPosX + deltaX;
    const nextY = dragInfo.current.startPosY + deltaY;

    // Viewport bounds checks (keeps full launcher inside screen)
    const padding = 16;
    const maxX = window.innerWidth - 70;
    const maxY = window.innerHeight - 70;

    const clampedX = Math.min(Math.max(padding, nextX), maxX);
    const clampedY = Math.min(Math.max(padding, nextY), maxY);

    requestAnimationFrame(() => {
      setPosition({ x: clampedX, y: clampedY });
    });
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (!dragInfo.current.isDragging) return;
    
    launcherRef.current?.releasePointerCapture(e.pointerId);
    
    const wasDragging = dragInfo.current.hasMoved;
    dragInfo.current.isDragging = false;

    // Only toggle chat if it was a clean click without significant drag
    if (!wasDragging) {
      toggleChat();
    } else {
      // Small bounce/snap animation on release
      if (launcherRef.current) {
        animate(launcherRef.current, {
          scale: [1.1, 1],
          duration: 350,
          easing: "easeOutElastic(1, .6)"
        });
      }
    }
  };

  const resetPosition = (e: React.MouseEvent) => {
    e.stopPropagation();
    const defaultX = window.innerWidth - 80;
    const defaultY = window.innerHeight - 80;
    
    if (launcherRef.current) {
      animate(launcherRef.current, {
        translateX: [position.x, defaultX],
        translateY: [position.y, defaultY],
        duration: 500,
        easing: "easeOutExpo",
        complete: () => {
          setPosition({ x: defaultX, y: defaultY });
        }
      });
    }
  };

  if (!isReady) return null;

  return (
    <div 
      className="fixed z-[9999] pointer-events-none"
      style={{
        left: 0,
        top: 0,
        transform: `translate3d(${position.x}px, ${position.y}px, 0)`
      }}
    >
      <div className="relative group pointer-events-auto">
        {/* Unread badge */}
        {!isOpen && unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-gold-champagne text-obsidian text-[10px] font-bold font-mono h-5 w-5 rounded-full flex items-center justify-center border border-obsidian z-10 animate-bounce">
            {unreadCount}
          </span>
        )}

        <button
          ref={launcherRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          aria-label="Open AUREVIA support chat"
          className="w-14 h-14 rounded-full bg-obsidian border border-gold-border text-gold-champagne flex items-center justify-center shadow-2xl hover:bg-gold-champagne/10 transition-colors cursor-grab active:cursor-grabbing select-none"
        >
          {/* Animated lens aperture icon / custom camera icon layout */}
          <div className="relative w-8 h-8 flex items-center justify-center">
            <svg viewBox="0 0 100 100" className="w-full h-full stroke-gold-champagne fill-none stroke-[6]">
              {/* Camera layout */}
              <rect x="15" y="30" width="70" height="50" rx="10" />
              <path d="M35 30 L40 18 L60 18 L65 30" />
              <circle cx="50" cy="55" r="16" className="stroke-gold-champagne fill-none" />
              <line x1="50" y1="39" x2="50" y2="43" className="stroke-gold-champagne" />
              {/* Aperture blades details inside inner circle */}
              <circle cx="50" cy="55" r="8" className="stroke-gold-champagne/40 fill-none stroke-[2]" />
            </svg>
          </div>
        </button>

        {/* Mini hover reset option */}
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
