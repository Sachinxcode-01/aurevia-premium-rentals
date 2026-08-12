"use client";

import { useEffect, useRef } from "react";
import { animate } from "animejs";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import { Wifi, WifiOff } from "lucide-react";

export function OnlineStatusBanner() {
  const isOnline = useOnlineStatus();
  const bannerRef = useRef<HTMLDivElement>(null);
  const prevOnline = useRef(true);

  useEffect(() => {
    if (!bannerRef.current) return;

    if (!isOnline) {
      // Show offline banner
      animate(bannerRef.current, {
        translateY: [-40, 0],
        opacity: [0, 1],
        duration: 350,
        easing: "easeOutCubic",
      });
      prevOnline.current = false;
    } else if (!prevOnline.current) {
      // Was offline, now online — flash green then hide
      animate(bannerRef.current, {
        translateY: [0, -40],
        opacity: [1, 0],
        duration: 500,
        delay: 2000,
        easing: "easeInCubic",
      });
      prevOnline.current = true;
    }
  }, [isOnline]);

  if (isOnline && prevOnline.current) return null;

  return (
    <div
      ref={bannerRef}
      className={`fixed top-0 left-0 right-0 z-[10000] flex items-center justify-center gap-2 py-2 text-[11px] font-mono uppercase tracking-widest opacity-0 ${
        isOnline
          ? "bg-emerald-500/90 text-white"
          : "bg-red-900/90 text-red-200 backdrop-blur-sm"
      }`}
    >
      {isOnline ? (
        <>
          <Wifi size={12} />
          Connection restored
        </>
      ) : (
        <>
          <WifiOff size={12} />
          You are offline — live updates paused
        </>
      )}
    </div>
  );
}
