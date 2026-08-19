"use client";

import React, { useState } from "react";
import Navbar from "@/components/navigation/Navbar";
import { useCart } from "@/hooks/useCart";
import { Phone, Mail, MapPin, MessageSquare, CheckCircle, Camera, Code2 } from "lucide-react";

import { submitOnlineEnquiry } from "@/lib/services/publicEngagementService";

export default function ContactPage() {
  const { cart } = useCart();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("rental");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);
  const [submittedRef, setSubmittedRef] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = submitOnlineEnquiry({
      customerName: name,
      customerEmail: email,
      subject,
      message
    });

    if (result.success && result.referenceNo) {
      setSubmittedRef(result.referenceNo);
      setSent(true);
      setName("");
      setEmail("");
      setSubject("rental");
      setMessage("");
      setTimeout(() => setSent(false), 8000);
    }
  };

  // Obfuscated email display to reduce spam harvesting
  const premEmail = ["premmundargi135", "@", "gmail.com"].join("");
  const sachinEmail = ["sachiii8827", "@", "gmail.com"].join("");

  return (
    <div className="min-h-screen bg-obsidian text-ivory pb-20">
      <Navbar cartItemCount={cart.length} />

      {/* Page header */}
      <div className="pt-32 pb-12 px-6 md:px-12 max-w-7xl mx-auto border-b border-white/5">
        <span className="text-[10px] font-semibold uppercase tracking-[0.25em] text-gold-champagne font-mono block mb-2">
          Concierge Channels
        </span>
        <h1 className="serif-heading text-4xl md:text-5xl lg:text-6xl font-light text-ivory">
          Contact <span className="text-gold">AUREVIA</span>
        </h1>
        <p className="text-sm text-muted-gray mt-3 max-w-2xl font-light leading-relaxed">
          Use the correct channel below to reach the right person quickly. Rental enquiries go directly to Prem, the business owner. Technical and website matters go to Sachin.
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-12 py-12 space-y-16">

        {/* ── Two contact cards ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* Prem — Business Owner */}
          <div className="glass-panel-gold border-gold-border rounded-xl p-8 space-y-6 relative overflow-hidden">
            {/* Subtle background accent */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gold-champagne/5 rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />

            <div className="flex items-start gap-4">
              <div className="w-11 h-11 rounded-full bg-gold-champagne/15 border border-gold-champagne/30 flex items-center justify-center shrink-0">
                <Camera size={18} className="text-gold-champagne" />
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-gold-champagne block mb-0.5">
                  Camera Rentals &amp; Bookings
                </span>
                <h2 className="text-xl font-semibold text-ivory serif-heading">
                  Prem Mundargi
                </h2>
                <p className="text-[11px] text-muted-gray mt-0.5 font-light">
                  Owner, AUREVIA Camera Rentals
                </p>
              </div>
            </div>

            <p className="text-xs text-muted-gray leading-relaxed font-light">
              Contact Prem for all rental enquiries, equipment availability, booking confirmations, pickup and return arrangements, pricing quotes, and general business matters.
            </p>

            <div className="space-y-3">
              <a
                href="tel:+919686909048"
                className="flex items-center gap-3 group"
              >
                <div className="w-8 h-8 rounded bg-white/5 group-hover:bg-gold-champagne/10 flex items-center justify-center transition">
                  <Phone size={13} className="text-gold-champagne" />
                </div>
                <div>
                  <p className="text-[10px] text-muted-gray uppercase font-mono tracking-wider">Call or WhatsApp</p>
                  <p className="text-sm font-semibold text-ivory group-hover:text-gold-champagne transition">
                    +91 96869 09048
                  </p>
                </div>
              </a>

              <a
                href={`mailto:${premEmail}`}
                className="flex items-center gap-3 group"
              >
                <div className="w-8 h-8 rounded bg-white/5 group-hover:bg-gold-champagne/10 flex items-center justify-center transition">
                  <Mail size={13} className="text-gold-champagne" />
                </div>
                <div>
                  <p className="text-[10px] text-muted-gray uppercase font-mono tracking-wider">Email</p>
                  <p className="text-sm font-semibold text-ivory group-hover:text-gold-champagne transition break-all">
                    {premEmail}
                  </p>
                </div>
              </a>

              <a
                href="https://www.instagram.com/ohh_itz_sachin_?igsh=eWRkeDBmdzc3MzBl&igsi=eWRkeDBmdzc3MzBl"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 group"
              >
                <div className="w-8 h-8 rounded bg-white/5 group-hover:bg-gold-champagne/10 flex items-center justify-center transition">
                  <svg className="w-3.5 h-3.5 text-gold-champagne fill-current" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </div>
                <div>
                  <p className="text-[10px] text-muted-gray uppercase font-mono tracking-wider">Instagram</p>
                  <p className="text-sm font-semibold text-ivory group-hover:text-gold-champagne transition">
                    @ohh_itz_sachin_
                  </p>
                </div>
              </a>

              <a
                href={`https://wa.me/919686909048?text=${encodeURIComponent("Hi Prem, I'm interested in renting from AUREVIA. Could you help me with availability and pricing?")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 flex items-center justify-center gap-2 w-full py-2.5 bg-[#25D366]/10 hover:bg-[#25D366]/20 border border-[#25D366]/25 text-[#25D366] text-xs font-semibold rounded transition"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                WhatsApp Prem
              </a>
            </div>
          </div>

          {/* Sachin — Technical Manager */}
          <div className="glass-panel border-white/5 rounded-xl p-8 space-y-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/3 rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />

            <div className="flex items-start gap-4">
              <div className="w-11 h-11 rounded-full bg-white/8 border border-white/10 flex items-center justify-center shrink-0">
                <Code2 size={18} className="text-ivory/70" />
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-gray block mb-0.5">
                  Website &amp; Technical Support
                </span>
                <h2 className="text-xl font-semibold text-ivory serif-heading">
                  Sachin
                </h2>
                <p className="text-[11px] text-muted-gray mt-0.5 font-light">
                  Website Designer, Developer &amp; Technical Manager
                </p>
              </div>
            </div>

            <p className="text-xs text-muted-gray leading-relaxed font-light">
              Contact Sachin for website issues, technical bugs, feature requests, performance matters, or if you would like to build a custom modern website for your business.
            </p>

            <div className="space-y-3">
              <a
                href="tel:+919880762623"
                className="flex items-center gap-3 group"
              >
                <div className="w-8 h-8 rounded bg-white/5 group-hover:bg-white/10 flex items-center justify-center transition">
                  <Phone size={13} className="text-ivory/60" />
                </div>
                <div>
                  <p className="text-[10px] text-muted-gray uppercase font-mono tracking-wider">Phone</p>
                  <p className="text-sm font-semibold text-ivory group-hover:text-ivory/80 transition">
                    +91 98807 62623
                  </p>
                </div>
              </a>

              <a
                href={`mailto:${sachinEmail}`}
                className="flex items-center gap-3 group"
              >
                <div className="w-8 h-8 rounded bg-white/5 group-hover:bg-white/10 flex items-center justify-center transition">
                  <Mail size={13} className="text-ivory/60" />
                </div>
                <div>
                  <p className="text-[10px] text-muted-gray uppercase font-mono tracking-wider">Email</p>
                  <p className="text-sm font-semibold text-ivory group-hover:text-ivory/80 transition break-all">
                    {sachinEmail}
                  </p>
                </div>
              </a>

              <a
                href="https://github.com/Sachinxcode-01"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 group"
              >
                <div className="w-8 h-8 rounded bg-white/5 group-hover:bg-white/10 flex items-center justify-center transition">
                  <svg className="w-3.5 h-3.5 text-ivory/70 fill-current group-hover:text-ivory transition" viewBox="0 0 24 24">
                    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
                  </svg>
                </div>
                <div>
                  <p className="text-[10px] text-muted-gray uppercase font-mono tracking-wider">GitHub</p>
                  <p className="text-sm font-semibold text-ivory group-hover:text-ivory/80 transition">
                    github.com/Sachinxcode-01
                  </p>
                </div>
              </a>

              <a
                href="https://www.instagram.com/ohh_itz_sachin_?igsh=eWRkeDBmdzc3MzBl&igsi=eWRkeDBmdzc3MzBl"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 group"
              >
                <div className="w-8 h-8 rounded bg-white/5 group-hover:bg-white/10 flex items-center justify-center transition">
                  <svg className="w-3.5 h-3.5 text-ivory/70 fill-current group-hover:text-ivory transition" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </div>
                <div>
                  <p className="text-[10px] text-muted-gray uppercase font-mono tracking-wider">Instagram</p>
                  <p className="text-sm font-semibold text-ivory group-hover:text-ivory/80 transition">
                    @ohh_itz_sachin_
                  </p>
                </div>
              </a>
            </div>
          </div>
        </div>

        {/* ── Want to Build a Website? Contact Sachin Banner ── */}
        <div className="glass-panel-gold rounded-xl p-8 space-y-6 relative overflow-hidden bg-gradient-to-r from-gold-champagne/10 via-obsidian to-gold-champagne/5 border border-gold-champagne/30 shadow-2xl">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-gold-champagne/15 border border-gold-champagne/30 rounded-full text-gold-champagne text-[10px] font-mono uppercase tracking-widest font-semibold">
                <Code2 size={12} />
                Web Design &amp; Full-Stack Development
              </div>
              <h2 className="serif-heading text-2xl md:text-3xl font-light text-ivory">
                Want to build a modern website for your business?
              </h2>
              <p className="text-xs text-muted-gray leading-relaxed font-light">
                Need a high-performance custom website, web app, or e-commerce platform like AUREVIA? Contact <strong className="text-ivory font-semibold">Sachin</strong> for bespoke development services built with Next.js, React, and modern UI design.
              </p>
            </div>

            <div className="flex flex-wrap gap-3 shrink-0">
              <a
                href="https://github.com/Sachinxcode-01"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-ivory text-xs font-semibold rounded border border-white/15 transition"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
                </svg>
                GitHub Profile
              </a>
              <a
                href="https://www.instagram.com/ohh_itz_sachin_?igsh=eWRkeDBmdzc3MzBl&igsi=eWRkeDBmdzc3MzBl"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white text-xs font-semibold rounded shadow transition"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
                Instagram
              </a>
              <a
                href="tel:+919880762623"
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-gold-champagne hover:bg-gold-warm text-obsidian text-xs font-bold rounded transition"
              >
                <Phone size={13} />
                Call Sachin
              </a>
            </div>
          </div>
        </div>

        {/* ── Studio location ── */}
        <div className="glass-panel border-white/5 rounded-xl p-6 flex flex-col sm:flex-row items-start sm:items-center gap-5">
          <div className="w-10 h-10 rounded-full bg-gold-champagne/10 border border-gold-champagne/20 flex items-center justify-center shrink-0">
            <MapPin size={16} className="text-gold-champagne" />
          </div>
          <div>
            <p className="text-[10px] font-mono uppercase tracking-widest text-gold-champagne mb-0.5">Studio &amp; Collection Point</p>
            <p className="text-sm font-semibold text-ivory">12th Main Road, Indiranagar, Bangalore, India</p>
            <p className="text-[11px] text-muted-gray mt-0.5 font-light">Equipment pickup and return by appointment only. Contact Prem to schedule.</p>
          </div>
        </div>

        {/* ── Online enquiry form ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          <div className="space-y-4">
            <h3 className="serif-heading text-2xl font-light text-ivory">Send an Enquiry</h3>
            <p className="text-xs text-muted-gray leading-relaxed font-light">
              Fill in the form and select your enquiry type. Your message will be directed to the correct contact and responded to promptly.
            </p>
            <div className="space-y-2 pt-2">
              <div className="flex items-center gap-2 text-xs text-muted-gray">
                <div className="w-1.5 h-1.5 rounded-full bg-gold-champagne/70" />
                Rental enquiries are handled by Prem, the business owner
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-gray">
                <div className="w-1.5 h-1.5 rounded-full bg-white/30" />
                Website &amp; technical matters are handled by Sachin
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-gray">
                <div className="w-1.5 h-1.5 rounded-full bg-white/30" />
                Response time: within 12 hours on business days
              </div>
            </div>
          </div>

          <div className="glass-panel-gold border-gold-border rounded-xl p-6 md:p-8 space-y-6">
            <h3 className="serif-heading text-xl font-light text-ivory border-b border-white/10 pb-3 flex items-center gap-2">
              <MessageSquare size={16} className="text-gold-champagne" />
              Online Enquiry Form
            </h3>

            {sent && (
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono rounded flex items-center gap-2">
                <CheckCircle size={14} />
                Enquiry {submittedRef || ""} submitted successfully! Synced to concierge desk. You will receive a response shortly.
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-xs font-sans">
              <div className="space-y-2">
                <label className="text-[10px] text-muted-gray uppercase font-mono tracking-wider block">
                  Your Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 text-xs rounded p-2.5 focus:outline-none focus:border-gold-champagne/40 transition"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] text-muted-gray uppercase font-mono tracking-wider block">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 text-xs rounded p-2.5 focus:outline-none focus:border-gold-champagne/40 transition"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] text-muted-gray uppercase font-mono tracking-wider block">
                  Enquiry Type
                </label>
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full bg-[#0e0e0e] border border-white/10 text-xs rounded p-2.5 focus:outline-none focus:border-gold-champagne/40 transition text-ivory"
                >
                  <option value="rental">Camera Rental &amp; Booking (→ Prem)</option>
                  <option value="availability">Equipment Availability (→ Prem)</option>
                  <option value="pricing">Pricing &amp; Quotation (→ Prem)</option>
                  <option value="website">Website Issue or Bug (→ Sachin)</option>
                  <option value="technical">Technical Support (→ Sachin)</option>
                  <option value="other">Other Enquiry</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] text-muted-gray uppercase font-mono tracking-wider block">
                  Message
                </label>
                <textarea
                  required
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Describe your enquiry in detail..."
                  className="w-full bg-white/5 border border-white/10 text-xs rounded p-2.5 focus:outline-none focus:border-gold-champagne/40 transition resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-gold-champagne hover:bg-gold-warm text-obsidian text-xs font-bold uppercase tracking-wider rounded transition cursor-pointer"
              >
                Submit Enquiry
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
