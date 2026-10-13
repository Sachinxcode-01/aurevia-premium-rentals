"use client";

import React from "react";
import Image from "next/image";

interface LogoProps {
  /**
   * 'wordmark' - Full AUREVIA logo wordmark
   * 'monogram' - Compact "A" monogram
   */
  variant?: "wordmark" | "monogram";
  /**
   * 'light' - For dark backgrounds (ivory/gold)
   * 'dark' - For light backgrounds (dark charcoal/black)
   */
  theme?: "light" | "dark";
  className?: string;
  width?: number;
  height?: number;
}

export function Logo({
  variant = "wordmark",
  theme = "light",
  className = "",
  width,
  height,
}: LogoProps) {
  const altText = "AUREVIA Premium Camera Rentals";

  if (variant === "monogram") {
    // Beautiful, premium vector SVG monogram "A" with champagne-gold styling
    const strokeColor = theme === "light" ? "#D8B36A" : "#080808";
    const textColor = theme === "light" ? "#F5F1E8" : "#080808";
    
    return (
      <svg
        viewBox="0 0 100 100"
        className={`inline-block select-none shrink-0 ${className}`}
        style={{ width: width ?? 32, height: height ?? 32 }}
        aria-label={altText}
        role="img"
      >
        {/* Outer premium thin gold border circle */}
        <circle
          cx="50"
          cy="50"
          r="45"
          fill="none"
          stroke={strokeColor}
          strokeWidth="2.5"
          className="transition-all duration-300"
        />
        {/* Stylized Serif "A" Monogram */}
        <text
          x="50"
          y="68"
          fontFamily="var(--font-playfair), Georgia, serif"
          fontSize="48"
          fontWeight="bold"
          fill={textColor}
          textAnchor="middle"
          className="transition-all duration-300 tracking-normal"
        >
          A
        </text>
      </svg>
    );
  }

  // Wordmark using the official image `/readme/aurevia-logo.png`
  // Theme styling (reversion filter for light/dark)
  const filterStyle = theme === "dark" 
    ? "invert(1) brightness(0.1)" // Inverts white/gold to dark charcoal/black
    : "none";

  const sizeStyle: React.CSSProperties = {};
  if (width !== undefined) sizeStyle.width = width;
  if (height !== undefined) sizeStyle.height = height;
  if (width !== undefined && height === undefined) sizeStyle.height = width;
  if (height !== undefined && width === undefined) sizeStyle.width = height;

  const defaultClasses =
    width === undefined &&
    height === undefined &&
    !className.includes("w-") &&
    !className.includes("h-")
      ? "w-14 h-14"
      : "";

  return (
    <div 
      className={`relative inline-block select-none shrink-0 ${defaultClasses} ${className}`.trim()}
      style={sizeStyle}
    >
      <Image
        src="/readme/aurevia-logo.png"
        alt={altText}
        fill
        sizes="(max-width: 768px) 150px, 200px"
        priority
        className="object-contain"
        style={{ filter: filterStyle }}
      />
    </div>
  );
}
