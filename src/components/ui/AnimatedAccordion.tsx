"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronDown } from "lucide-react";

interface AccordionItem {
  id: string;
  question: string;
  answer: string;
}

interface AnimatedAccordionProps {
  items: AccordionItem[];
  className?: string;
}

export default function AnimatedAccordion({ items, className = "" }: AnimatedAccordionProps) {
  const [openId, setOpenId] = useState<string | null>(items[0]?.id || null);

  const toggleItem = (id: string) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {items.map((item) => {
        const isOpen = openId === item.id;
        return (
          <div
            key={item.id}
            className="rounded-xl bg-charcoal/50 border border-white/10 overflow-hidden transition-colors duration-300 hover:border-gold-champagne/40"
          >
            <button
              onClick={() => toggleItem(item.id)}
              className="w-full p-6 text-left flex items-center justify-between gap-4 cursor-pointer outline-none"
              aria-expanded={isOpen}
            >
              <span className="serif-heading text-lg text-ivory font-light">{item.question}</span>
              <motion.div
                animate={{ rotate: isOpen ? 180 : 0 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className="text-gold-champagne shrink-0"
              >
                <ChevronDown className="w-5 h-5" />
              </motion.div>
            </button>

            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                  className="overflow-hidden"
                >
                  <div className="px-6 pb-6 pt-2 text-xs sm:text-sm text-muted-gray leading-relaxed border-t border-white/5">
                    {item.answer}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
