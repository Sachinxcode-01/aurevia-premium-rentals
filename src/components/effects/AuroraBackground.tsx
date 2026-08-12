"use client";

import React from "react";

interface AuroraBackgroundProps {
  className?: string;
  children?: React.ReactNode;
}

export default function AuroraBackground({ className = "", children }: AuroraBackgroundProps) {
  return (
    <div className={`relative overflow-hidden bg-obsidian text-ivory ${className}`}>
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {/* Animated Mesh Gradients */}
        <div
          className="absolute -top-[30%] -left-[10%] w-[60vw] h-[60vw] rounded-full blur-[140px] opacity-15 animate-pulse"
          style={{
            background: "radial-gradient(circle, rgba(212, 175, 55, 0.4) 0%, rgba(20, 20, 20, 0) 70%)",
            animationDuration: "12s",
          }}
        />
        <div
          className="absolute top-[20%] -right-[15%] w-[55vw] h-[55vw] rounded-full blur-[160px] opacity-10 animate-pulse"
          style={{
            background: "radial-gradient(circle, rgba(184, 134, 11, 0.3) 0%, rgba(10, 10, 10, 0) 70%)",
            animationDuration: "15s",
            animationDelay: "3s",
          }}
        />
        <div
          className="absolute -bottom-[20%] left-[20%] w-[50vw] h-[50vw] rounded-full blur-[150px] opacity-15"
          style={{
            background: "radial-gradient(circle, rgba(40, 40, 40, 0.8) 0%, rgba(5, 5, 5, 0) 75%)",
          }}
        />

        {/* Faint Noise Grain Overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:32px_32px] opacity-[0.03]" />
      </div>

      <div className="relative z-10">{children}</div>
    </div>
  );
}
