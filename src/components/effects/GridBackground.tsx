"use client";

import React from "react";

interface GridBackgroundProps {
  className?: string;
  children?: React.ReactNode;
}

export default function GridBackground({ className = "", children }: GridBackgroundProps) {
  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Framing Grid Overlay */}
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-30" />

      {/* Viewfinder Corner Accents */}
      <div className="pointer-events-none absolute top-6 left-6 w-8 h-8 border-t border-l border-gold-champagne/30" />
      <div className="pointer-events-none absolute top-6 right-6 w-8 h-8 border-t border-r border-gold-champagne/30" />
      <div className="pointer-events-none absolute bottom-6 left-6 w-8 h-8 border-b border-l border-gold-champagne/30" />
      <div className="pointer-events-none absolute bottom-6 right-6 w-8 h-8 border-b border-r border-gold-champagne/30" />

      <div className="relative z-10">{children}</div>
    </div>
  );
}
