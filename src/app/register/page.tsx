"use client";

import React, { useState } from "react";
import Navbar from "@/components/navigation/Navbar";
import { useCart } from "@/hooks/useCart";
import { useRouter } from "next/navigation";
import { Lock, Mail, User, Phone, CheckCircle } from "lucide-react";
import Link from "next/link";

export default function RegisterPage() {
  const { cart } = useCart();
  const router = useRouter();
  
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [success, setSuccess] = useState(false);

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(true);
    setTimeout(() => {
      router.push("/login");
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-obsidian text-ivory pb-20 flex flex-col justify-between">
      <Navbar cartItemCount={cart.length} />

      <div className="flex-1 flex items-center justify-center px-6 pt-36 pb-12">
        <div className="glass-panel-gold border-gold-border rounded-lg max-w-sm w-full p-6 md:p-8 space-y-6 shadow-2xl relative">
          
          <div className="text-center space-y-1">
            <span className="text-[9px] uppercase tracking-widest text-gold-champagne font-mono block">Club Membership</span>
            <h2 className="serif-heading text-2xl font-light text-ivory">Create Aurevia Profile</h2>
          </div>

          {success && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono rounded flex items-center gap-1.5 justify-center text-center">
              <CheckCircle size={13} />
              ✓ Profile Created. Proceeding to Login...
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-4 text-xs font-sans">
            <div className="space-y-2">
              <label className="text-[9px] text-muted-gray uppercase font-mono tracking-wider block">Full Name</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="Prem Kumar"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 text-xs rounded p-2.5 pl-8 focus:outline-none focus:border-gold-champagne/40"
                />
                <User size={13} className="absolute left-2.5 top-3.5 text-muted-gray" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[9px] text-muted-gray uppercase font-mono tracking-wider block">Email Address</label>
              <div className="relative">
                <input
                  type="email"
                  required
                  placeholder="contact@prem.dev"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 text-xs rounded p-2.5 pl-8 focus:outline-none focus:border-gold-champagne/40"
                />
                <Mail size={13} className="absolute left-2.5 top-3.5 text-muted-gray" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[9px] text-muted-gray uppercase font-mono tracking-wider block">Phone Number</label>
              <div className="relative">
                <input
                  type="tel"
                  required
                  placeholder="9686909048"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 text-xs rounded p-2.5 pl-8 focus:outline-none focus:border-gold-champagne/40"
                />
                <Phone size={13} className="absolute left-2.5 top-3.5 text-muted-gray" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[9px] text-muted-gray uppercase font-mono tracking-wider block">Create Password</label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 text-xs rounded p-2.5 pl-8 focus:outline-none focus:border-gold-champagne/40"
                />
                <Lock size={13} className="absolute left-2.5 top-3.5 text-muted-gray" />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-gold-champagne hover:bg-gold-warm text-obsidian text-xs font-bold uppercase tracking-wider rounded transition cursor-pointer"
            >
              Initialize Profile
            </button>
          </form>

          <p className="text-[10px] text-center text-muted-gray">
            Already registered?{" "}
            <Link href="/login" className="text-gold-champagne hover:underline">Access vault</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
