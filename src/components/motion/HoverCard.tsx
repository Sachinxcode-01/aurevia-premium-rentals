"use client";

import React, { useRef, useState } from "react";
import { motion } from "motion/react";

interface HoverCardProps {
  children: React.ReactNode;
  className?: string;
  tiltMaxAngle?: number;
  glowColor?: string;
}

export default function HoverCard({
  children,
  className = "",
  tiltMaxAngle = 6,
  glowColor = "rgba(212, 175, 55, 0.12)",
}: HoverCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const [cursorPos, setCursorPos] = useState({ x: 50, y: 50 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const percentX = (x / rect.width) * 100;
    const percentY = (y / rect.height) * 100;

    const rotX = ((y - rect.height / 2) / (rect.height / 2)) * -tiltMaxAngle;
    const rotY = ((x - rect.width / 2) / (rect.width / 2)) * tiltMaxAngle;

    setRotation({ x: rotX, y: rotY });
    setCursorPos({ x: percentX, y: percentY });
  };

  const handleMouseEnter = () => setIsHovered(true);
  const handleMouseLeave = () => {
    setIsHovered(false);
    setRotation({ x: 0, y: 0 });
  };

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      animate={{
        rotateX: rotation.x,
        rotateY: rotation.y,
        scale: isHovered ? 1.02 : 1,
      }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      style={{ transformStyle: "preserve-3d" }}
      className={`relative overflow-hidden rounded-xl bg-charcoal/60 border border-white/10 transition-colors duration-300 ${className}`}
    >
      {/* Specular Cursor Spotlight Glow */}
      <div
        className="pointer-events-none absolute -inset-px transition-opacity duration-500 rounded-xl"
        style={{
          opacity: isHovered ? 1 : 0,
          background: `radial-gradient(600px circle at ${cursorPos.x}% ${cursorPos.y}%, ${glowColor}, transparent 40%)`,
        }}
      />
      <div className="relative z-10">{children}</div>
    </motion.div>
  );
}
