"use client";

import React from "react";
import { motion } from "motion/react";
import { staggerContainer, wordReveal } from "@/lib/motion";

interface RevealTextProps {
  text: string;
  className?: string;
  as?: keyof React.JSX.IntrinsicElements;
  delay?: number;
  staggerDelay?: number;
}

export default function RevealText({
  text,
  className = "",
  as = "h1",
  delay = 0,
  staggerDelay = 0.06,
}: RevealTextProps) {
  const words = text.split(" ");
  const Tag = motion[as as keyof typeof motion] as typeof motion.h1;

  return (
    <Tag
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-40px" }}
      variants={staggerContainer(staggerDelay, delay)}
      className={`inline-flex flex-wrap gap-x-[0.25em] gap-y-1 ${className}`}
    >
      {words.map((word, idx) => (
        <motion.span key={idx} variants={wordReveal} className="inline-block">
          {word}
        </motion.span>
      ))}
    </Tag>
  );
}
