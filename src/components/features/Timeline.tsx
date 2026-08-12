"use client";

import React from "react";
import { motion } from "motion/react";
import { Camera, ShieldCheck, CalendarCheck, Sparkles } from "lucide-react";
import HoverCard from "@/components/motion/HoverCard";

const steps = [
  {
    step: "01",
    title: "Choose Masterpiece Gear",
    description: "Browse our curated inventory of flagship cinema cameras, anamorphic lenses, and precision lighting.",
    icon: Camera,
  },
  {
    step: "02",
    title: "Verify Identity Concierge",
    description: "Instant government ID and biometric verification via secure Supabase document storage.",
    icon: ShieldCheck,
  },
  {
    step: "03",
    title: "Reserve & Secure Payment",
    description: "Real-time calendar conflict check with Razorpay integration and instant reservation locks.",
    icon: CalendarCheck,
  },
  {
    step: "04",
    title: "Capture Extraordinary Stories",
    description: "Doorstep white-glove courier delivery or express studio pickup ready for your production.",
    icon: Sparkles,
  },
];

export default function Timeline() {
  return (
    <section className="py-20 relative bg-obsidian text-ivory overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
          <span className="text-xs uppercase font-mono tracking-widest text-gold-champagne px-3 py-1 rounded-full bg-gold-champagne/10 border border-gold-champagne/20">
            Seamless Workflow
          </span>
          <h2 className="serif-heading text-3xl sm:text-5xl font-light text-ivory tracking-tight">
            How Rental Process Works
          </h2>
          <p className="text-sm text-muted-gray leading-relaxed">
            From online reservation to production wrap, every step is optimized for creator excellence.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
          {steps.map((item, idx) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.5, delay: idx * 0.12 }}
              >
                <HoverCard className="p-6 h-full flex flex-col justify-between space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono text-gold-champagne font-bold tracking-widest">
                        {item.step}
                      </span>
                      <div className="p-2.5 rounded-lg bg-obsidian/60 border border-white/10 text-gold-champagne">
                        <Icon className="w-5 h-5" />
                      </div>
                    </div>
                    <h3 className="serif-heading text-xl text-ivory font-light">{item.title}</h3>
                    <p className="text-xs text-muted-gray leading-relaxed">{item.description}</p>
                  </div>
                  <div className="w-full h-[1px] bg-gradient-to-r from-gold-champagne/30 to-transparent" />
                </HoverCard>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
