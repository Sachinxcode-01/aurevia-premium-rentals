"use client";

import React, { useEffect, useState } from "react";

interface SpotlightProps {
  className?: string;
  fill?: string;
}

export default function Spotlight({ className = "", fill = "rgba(212, 175, 55, 0.08)" }: SpotlightProps) {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div
      className={`pointer-events-none fixed inset-0 z-30 transition-opacity duration-300 ${className}`}
      style={{
        background: `radial-gradient(650px circle at ${mousePosition.x}px ${mousePosition.y}px, ${fill}, transparent 80%)`,
      }}
    />
  );
}
