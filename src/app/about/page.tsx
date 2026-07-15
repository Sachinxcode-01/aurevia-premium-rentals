"use client";

import React from "react";
import Navbar from "@/components/navigation/Navbar";
import { useCart } from "@/hooks/useCart";
import Link from "next/link";
import { Camera, ShieldCheck, Heart, UserCheck } from "lucide-react";

export default function AboutPage() {
  const { cart } = useCart();

  return (
    <div className="min-h-screen bg-obsidian text-ivory pb-20">
      <Navbar cartItemCount={cart.length} />

      <div className="pt-32 pb-12 px-6 md:px-12 max-w-7xl mx-auto border-b border-white/5">
        <span className="text-[10px] font-semibold uppercase tracking-[0.25em] text-gold-champagne font-mono block mb-2">
          Bespoke Heritage
        </span>
        <h1 className="serif-heading text-4xl md:text-5xl lg:text-6xl font-light text-ivory">
          About <span className="text-gold">AUREVIA Premium</span>
        </h1>
        <p className="text-sm text-muted-gray mt-3 max-w-2xl font-light">
          Aurevia Premium Camera Rentals by Prem represents a new standard of luxury equipment concierge. We cater to film professionals and digital storytellers.
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-12 py-12 space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6 text-sm text-muted-gray leading-relaxed font-light">
            <p>
              AUREVIA was founded in Bangalore, India, with a singular mission: to supply pristine optics, flagship bodies, and production stabilizers without compromise. We understand that in commercial shoots and cinema productions, second best is not an option.
            </p>
            <p>
              Under the direction of Prem, we have established rigorous inspection protocols. Every camera sensor, gimbal motor, and lens element is verified before and after each rental slot to ensure it behaves exactly as it should.
            </p>
          </div>

          <div className="glass-panel border-white/5 rounded-lg p-8 space-y-6">
            <h3 className="serif-heading text-xl text-ivory border-b border-white/5 pb-2">Our Quality Core</h3>
            
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded bg-gold-champagne/10 text-gold-champagne flex items-center justify-center shrink-0"><ShieldCheck size={16} /></div>
                <div>
                  <h4 className="font-semibold text-xs uppercase tracking-wider text-ivory">Calibration standards</h4>
                  <p className="text-[11px] text-muted-gray mt-1 leading-normal">Our lens elements are bench-tested for alignment and focus resolution before shipping.</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-8 h-8 rounded bg-gold-champagne/10 text-gold-champagne flex items-center justify-center shrink-0"><Heart size={16} /></div>
                <div>
                  <h4 className="font-semibold text-xs uppercase tracking-wider text-ivory">Concierge Handover</h4>
                  <p className="text-[11px] text-muted-gray mt-1 leading-normal">All items are delivered or picked up in heavy-duty weatherproof Pelican flight cases.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center pt-8 border-t border-white/5 space-y-4">
          <h3 className="serif-heading text-2xl text-ivory font-light">Frame the Extraordinary with us today</h3>
          <Link
            href="/explore"
            className="inline-block px-8 py-3.5 bg-gold-champagne hover:bg-gold-warm text-obsidian text-xs font-bold uppercase tracking-wider rounded transition"
          >
            Go to Showroom
          </Link>
        </div>
      </div>
    </div>
  );
}
