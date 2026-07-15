"use client";

import React from "react";
import Navbar from "@/components/navigation/Navbar";
import { useCart } from "@/hooks/useCart";
import Link from "next/link";
import { Camera, ShieldCheck, Heart, Phone, Mail } from "lucide-react";

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
          AUREVIA Premium Camera Rentals by Prem represents a new standard of luxury equipment concierge. We cater to film professionals and digital storytellers.
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-12 py-12 space-y-16">

        {/* Story */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6 text-sm text-muted-gray leading-relaxed font-light">
            <p>
              AUREVIA was founded in Bangalore, India, with a singular mission: to supply pristine optics, flagship bodies, and production stabilizers without compromise. We understand that in commercial shoots and cinema productions, second best is not an option.
            </p>
            <p>
              Under the direction of Prem Mundargi, we have established rigorous inspection protocols. Every camera sensor, gimbal motor, and lens element is verified before and after each rental slot to ensure it behaves exactly as it should.
            </p>
          </div>

          <div className="glass-panel border-white/5 rounded-lg p-8 space-y-6">
            <h3 className="serif-heading text-xl text-ivory border-b border-white/5 pb-2">Our Quality Core</h3>

            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded bg-gold-champagne/10 text-gold-champagne flex items-center justify-center shrink-0"><ShieldCheck size={16} /></div>
                <div>
                  <h4 className="font-semibold text-xs uppercase tracking-wider text-ivory">Calibration Standards</h4>
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

        {/* Meet the team */}
        <div className="space-y-8">
          <div className="border-t border-white/5 pt-10">
            <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-gold-champagne block mb-2">People Behind AUREVIA</span>
            <h2 className="serif-heading text-3xl font-light text-ivory">Meet the Team</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

            {/* Prem — Owner */}
            <div className="glass-panel-gold border-gold-border rounded-xl p-8 space-y-5">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-gold-champagne/15 border border-gold-champagne/30 flex items-center justify-center shrink-0">
                  <Camera size={20} className="text-gold-champagne" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-ivory serif-heading font-light">Prem Mundargi</h3>
                  <p className="text-[11px] text-gold-champagne font-mono uppercase tracking-wider mt-0.5">
                    Owner &amp; Founder, AUREVIA Camera Rentals
                  </p>
                </div>
              </div>
              <p className="text-xs text-muted-gray leading-relaxed font-light">
                Prem founded and operates AUREVIA Camera Rentals in Bangalore. He oversees the equipment fleet, manages all rental bookings, customer relations, and ensures every piece of gear meets exacting professional standards before it leaves the studio.
              </p>
              <div className="space-y-2 pt-1">
                <p className="text-[10px] font-mono uppercase tracking-wider text-gold-champagne/70 mb-2">Rental Enquiries</p>
                <a href="tel:+919686909048" className="flex items-center gap-2.5 text-xs text-muted-gray hover:text-gold-champagne transition">
                  <Phone size={12} className="text-gold-champagne/60" />
                  +91 96869 09048
                </a>
                <a href="mailto:premmundargi135@gmail.com" className="flex items-center gap-2.5 text-xs text-muted-gray hover:text-gold-champagne transition break-all">
                  <Mail size={12} className="text-gold-champagne/60" />
                  premmundargi135@gmail.com
                </a>
                <a
                  href="https://wa.me/919686909048"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 mt-2 px-4 py-2 bg-[#25D366]/10 hover:bg-[#25D366]/20 border border-[#25D366]/25 text-[#25D366] text-[11px] font-semibold rounded transition"
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                  WhatsApp Prem
                </a>
              </div>
            </div>

            {/* Sachin — Technical Manager */}
            <div className="glass-panel border-white/5 rounded-xl p-8 space-y-5">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-white/8 border border-white/10 flex items-center justify-center shrink-0">
                  <span className="text-ivory/60 text-base font-light font-mono">&lt;/&gt;</span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-ivory serif-heading font-light">Sachin</h3>
                  <p className="text-[11px] text-muted-gray font-mono uppercase tracking-wider mt-0.5">
                    Website Designer, Developer &amp; Technical Manager
                  </p>
                </div>
              </div>
              <p className="text-xs text-muted-gray leading-relaxed font-light">
                Sachin designed and developed the AUREVIA web platform — including the cinematic scroll animation, 3D optics showroom, booking engine, customer dashboard, and admin analytics panel. He manages all technical operations for AUREVIA&apos;s digital presence and online systems.
              </p>
              <div className="space-y-2 pt-1">
                <p className="text-[10px] font-mono uppercase tracking-wider text-muted-gray/60 mb-2">Website &amp; Technical Support</p>
                <a href="tel:+919880762623" className="flex items-center gap-2.5 text-xs text-muted-gray hover:text-ivory/70 transition">
                  <Phone size={12} className="text-muted-gray/50" />
                  +91 98807 62623
                </a>
                <a href="mailto:sachiii8827@gmail.com" className="flex items-center gap-2.5 text-xs text-muted-gray hover:text-ivory/70 transition break-all">
                  <Mail size={12} className="text-muted-gray/50" />
                  sachiii8827@gmail.com
                </a>
                <div className="mt-2 px-3 py-2 border border-white/8 rounded text-[11px] text-muted-gray/60 font-light italic">
                  For camera rentals, please contact Prem.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center pt-4 border-t border-white/5 space-y-4">
          <h3 className="serif-heading text-2xl text-ivory font-light">Frame the Extraordinary with us today</h3>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href="/explore"
              className="inline-block px-8 py-3.5 bg-gold-champagne hover:bg-gold-warm text-obsidian text-xs font-bold uppercase tracking-wider rounded transition"
            >
              Go to Showroom
            </Link>
            <Link
              href="/contact"
              className="inline-block px-8 py-3.5 border border-white/15 hover:border-gold-champagne hover:text-gold-champagne text-ivory text-xs font-semibold uppercase tracking-wider rounded transition"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
