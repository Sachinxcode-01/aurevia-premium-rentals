"use client";

import React from "react";
import { motion, HTMLMotionProps } from "motion/react";
import { staggerContainer, fadeIn } from "@/lib/motion";

interface StaggerProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode;
  staggerChildren?: number;
  delayChildren?: number;
  className?: string;
}

export function StaggerContainer({
  children,
  staggerChildren = 0.08,
  delayChildren = 0,
  className = "",
  ...props
}: StaggerProps) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-40px" }}
      variants={staggerContainer(staggerChildren, delayChildren)}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}

interface StaggerItemProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode;
  className?: string;
  direction?: "up" | "down" | "left" | "right" | "none";
}

export function StaggerItem({
  children,
  className = "",
  direction = "up",
  ...props
}: StaggerItemProps) {
  return (
    <motion.div variants={fadeIn(direction)} className={className} {...props}>
      {children}
    </motion.div>
  );
}
