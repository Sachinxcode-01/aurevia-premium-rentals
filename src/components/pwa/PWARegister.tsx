"use client";

import { useEffect, useState } from "react";

export function PWARegister() {
  const [showUpdate, setShowUpdate] = useState(false);
  const [swRegistration, setSwRegistration] = useState<ServiceWorkerRegistration | null>(null);

  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
      return;
    }

    navigator.serviceWorker
      .register("/sw.js")
      .then((reg) => {
        setSwRegistration(reg);

        // Check if there is an update waiting
        if (reg.waiting) {
          setShowUpdate(true);
        }

        // Listen for updates
        reg.addEventListener("updatefound", () => {
          const newWorker = reg.installing;
          if (newWorker) {
            newWorker.addEventListener("statechange", () => {
              if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
                setShowUpdate(true);
              }
            });
          }
        });
      })
      .catch((err) => {
        console.error("Service worker registration failed:", err);
      });

    let refreshing = false;
    navigator.serviceWorker.addEventListener("controllerchange", () => {
      if (!refreshing) {
        refreshing = true;
        window.location.reload();
      }
    });
  }, []);

  const handleUpdate = () => {
    if (swRegistration && swRegistration.waiting) {
      swRegistration.waiting.postMessage({ type: "SKIP_WAITING" });
    }
    setShowUpdate(false);
  };

  if (!showUpdate) return null;

  return (
    <div className="fixed bottom-24 right-6 z-[10000] flex flex-col gap-2 p-4 rounded border border-gold-champagne/30 bg-charcoal/95 backdrop-blur-sm text-ivory max-w-sm shadow-xl font-sans">
      <div className="flex flex-col gap-1">
        <h4 className="text-xs font-semibold tracking-wider text-gold-champagne uppercase font-mono">App Update Available</h4>
        <p className="text-[11px] text-muted-gray leading-normal">
          A new version of AUREVIA is available. Reload now to apply updates.
        </p>
      </div>
      <div className="flex gap-2 justify-end mt-2">
        <button
          onClick={() => setShowUpdate(false)}
          className="px-2.5 py-1 text-[10px] uppercase font-mono tracking-wider border border-white/10 hover:border-white/20 transition cursor-pointer"
        >
          Dismiss
        </button>
        <button
          onClick={handleUpdate}
          className="px-2.5 py-1 text-[10px] uppercase font-mono tracking-wider bg-gold-champagne text-obsidian font-semibold hover:bg-gold-champagne/90 transition cursor-pointer"
        >
          Update Now
        </button>
      </div>
    </div>
  );
}
