import { Variants } from "motion/react";

// Global timing tokens (number type for flexible component defaults)
export const motionDuration = {
  fast: 0.2,
  normal: 0.4,
  slow: 0.7,
  cinematic: 1.1,
};

// Luxury editorial easing curve
export const motionEase = {
  luxury: [0.16, 1, 0.3, 1] as [number, number, number, number],
  smooth: [0.25, 0.1, 0.25, 1] as [number, number, number, number],
  springy: { type: "spring", stiffness: 300, damping: 20 },
};

// Stagger Container Variants
export const staggerContainer = (staggerChildren = 0.08, delayChildren = 0): Variants => ({
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren,
      delayChildren,
    },
  },
});

// Fade In Variant Builder
export const fadeIn = (
  direction: "up" | "down" | "left" | "right" | "none" = "up",
  distance: number = 30,
  duration: number = motionDuration.normal,
  delay: number = 0
): Variants => {
  let x = 0;
  let y = 0;
  if (direction === "up") y = distance;
  if (direction === "down") y = -distance;
  if (direction === "left") x = distance;
  if (direction === "right") x = -distance;

  return {
    hidden: {
      opacity: 0,
      x,
      y,
      filter: "blur(4px)",
    },
    visible: {
      opacity: 1,
      x: 0,
      y: 0,
      filter: "blur(0px)",
      transition: {
        duration,
        delay,
        ease: motionEase.luxury,
      },
    },
  };
};

// Text Word Reveal Variant
export const wordReveal: Variants = {
  hidden: {
    opacity: 0,
    y: 20,
    filter: "blur(6px)",
  },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: {
      duration: motionDuration.slow,
      ease: motionEase.luxury,
    },
  },
};

// Scale Reveal Variant
export const scaleReveal = (delay = 0): Variants => ({
  hidden: {
    opacity: 0,
    scale: 0.95,
    filter: "blur(8px)",
  },
  visible: {
    opacity: 1,
    scale: 1,
    filter: "blur(0px)",
    transition: {
      duration: motionDuration.slow,
      delay,
      ease: motionEase.luxury,
    },
  },
});
