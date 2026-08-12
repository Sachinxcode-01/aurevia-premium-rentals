"use client";

import React from "react";
import { motion, HTMLMotionProps } from "motion/react";
import { fadeIn, motionDuration } from "@/lib/motion";

interface FadeInProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode;
  direction?: "up" | "down" | "left" | "right" | "none";
  distance?: number;
  duration?: number;
  delay?: number;
  viewportOnce?: boolean;
  className?: string;
}

export default function FadeIn({
  children,
  direction = "up",
  distance = 30,
  duration = motionDuration.normal,
  delay = 0,
  viewportOnce = true,
  className = "",
  ...props
}: FadeInProps) {
  const variants = fadeIn(direction, distance, duration, delay);

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: viewportOnce, margin: "-50px" }}
      variants={variants}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}
