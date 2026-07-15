"use client";

import React, { useState } from "react";
import Navbar from "@/components/navigation/Navbar";
import { useCart } from "@/hooks/useCart";
import { Phone, Mail, MapPin, MessageSquare, CheckCircle } from "lucide-react";

export default function ContactPage() {
  const { cart } = useCart();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
    setName("");
    setEmail("");
    setMessage("");
    setTimeout(() => setSent(false), 4000);
  };

  return (
    <div className="min-h-screen bg-obsidian text-ivory pb-20">
      <Navbar cartItemCount={cart.length} />

      <div className="pt-32 pb-12 px-6 md:px-12 max-w-7xl mx-auto border-b border-white/5">
        <span className="text-[10px] font-semibold uppercase tracking-[0.25em] text-gold-champagne font-mono block mb-2">
          Concierge Channels
        </span>
        <h1 className="serif-heading text-4xl md:text-5xl lg:text-6xl font-light text-ivory">
          Contact <span className="text-gold">AUREVIA</span>
        </h1>
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-12 py-12 grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Contact Info cards */}
        <div className="space-y-8">
          <div className="space-y-4">
            <h3 className="serif-heading text-2xl font-light">Get in touch directly</h3>
            <p className="text-xs text-muted-gray leading-relaxed font-light">
              Reach out to our customer care team under the management of Prem. We will assist you with booking quotes, billing questions, or equipment setups.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4">
            <div className="glass-panel border-white/5 p-5 rounded space-y-2">
              <Phone size={16} className="text-gold-champagne" />
              <h4 className="font-semibold text-xs uppercase tracking-wider">Hotline Phone</h4>
              <p className="text-xs font-semibold text-ivory">9686909048</p>
              <span className="text-[10px] text-muted-gray">Calls and WhatsApp support</span>
            </div>

            <div className="glass-panel border-white/5 p-5 rounded space-y-2">
              <Mail size={16} className="text-gold-champagne" />
              <h4 className="font-semibold text-xs uppercase tracking-wider">Email Vault</h4>
              <p className="text-xs font-semibold text-ivory">support@aurevia.com</p>
              <span className="text-[10px] text-muted-gray">24 hour response SLA</span>
            </div>

            <div className="glass-panel border-white/5 p-5 rounded sm:col-span-2 space-y-2">
              <MapPin size={16} className="text-gold-champagne" />
              <h4 className="font-semibold text-xs uppercase tracking-wider">Showroom studio</h4>
              <p className="text-xs font-semibold text-ivory">12th Main Road, Indiranagar, Bangalore, India</p>
              <span className="text-[10px] text-muted-gray">By appointment only</span>
            </div>
          </div>
        </div>

        {/* Message Form */}
        <div className="glass-panel-gold border-gold-border rounded-lg p-6 md:p-8 space-y-6">
          <h3 className="serif-heading text-xl font-light text-ivory border-b border-white/10 pb-2 flex items-center gap-2">
            <MessageSquare size={16} className="text-gold-champagne" />
            Inquire Online
          </h3>

          {sent && (
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono rounded flex items-center gap-2">
              <CheckCircle size={14} />
              ✓ Inquiry sent successfully. Prem will respond shortly.
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs font-sans">
            <div className="space-y-2">
              <label className="text-[10px] text-muted-gray uppercase font-mono tracking-wider block">Your Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-white/5 border border-white/10 text-xs rounded p-2.5 focus:outline-none focus:border-white/20"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] text-muted-gray uppercase font-mono tracking-wider block">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white/5 border border-white/10 text-xs rounded p-2.5 focus:outline-none focus:border-white/20"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] text-muted-gray uppercase font-mono tracking-wider block">Message Details</label>
              <textarea
                required
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Details of your request..."
                className="w-full bg-white/5 border border-white/10 text-xs rounded p-2.5 focus:outline-none focus:border-white/20"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-gold-champagne hover:bg-gold-warm text-obsidian text-xs font-bold uppercase tracking-wider rounded transition cursor-pointer"
            >
              Send Inquiry
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
