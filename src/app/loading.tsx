import React from "react";

export default function Loading() {
  return (
    <div
      aria-label="Loading AUREVIA content"
      className="min-h-screen bg-obsidian flex flex-col items-center justify-center p-6 space-y-6"
    >
      <div className="relative flex items-center justify-center">
        <div className="w-16 h-16 rounded-full border-2 border-amber-500/20 border-t-amber-400 animate-spin" />
        <div className="absolute font-serif text-amber-400 text-lg font-bold">A</div>
      </div>
      <div className="space-y-2 text-center">
        <p className="font-mono text-xs uppercase tracking-[0.25em] text-amber-400/90 font-medium">
          AUREVIA CONCIERGE
        </p>
        <p className="text-xs text-neutral-400 font-light">Calibrating optics &amp; vault availability...</p>
      </div>
    </div>
  );
}
