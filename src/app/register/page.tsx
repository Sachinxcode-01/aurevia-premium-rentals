"use client";

import React, { useState } from "react";
import Navbar from "@/components/navigation/Navbar";
import { useCart } from "@/hooks/useCart";
import { useToast } from "@/hooks/useToast";
import { useRouter } from "next/navigation";
import { Lock, Mail, User, Phone, CheckCircle, Loader2 } from "lucide-react";
import Link from "next/link";
import { signUpAction } from "@/lib/actions/auth";

export default function RegisterPage() {
  const { cart } = useCart();
  const toast = useToast();
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }
    setLoading(true);

    const result = await signUpAction(email, password, name, phone);

    if (result.success) {
      setSuccess(true);
      toast.success("Account created! Please sign in.");
      setTimeout(() => router.push("/login"), 1500);
    } else {
      toast.error(result.error ?? "Registration failed. Please try again.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-obsidian text-ivory pb-20 flex flex-col justify-between">
      <Navbar cartItemCount={cart.length} />

      <div className="flex-1 flex items-center justify-center px-6 pt-36 pb-12">
        <div className="glass-panel-gold border-gold-border rounded-lg max-w-sm w-full p-6 md:p-8 space-y-6 shadow-2xl relative">

          <div className="text-center space-y-1">
            <span className="text-[9px] uppercase tracking-widest text-gold-champagne font-mono block">Club Membership</span>
            <h2 className="serif-heading text-2xl font-light text-ivory">Create AUREVIA Profile</h2>
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
                <User size={13} className="absolute left-2.5 top-3.5 text-muted-gray pointer-events-none" />
                <input
                  type="text"
                  required
                  placeholder="Your full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 text-xs rounded p-2.5 pl-8 focus:outline-none focus:border-gold-champagne/40 transition"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[9px] text-muted-gray uppercase font-mono tracking-wider block">Email Address</label>
              <div className="relative">
                <Mail size={13} className="absolute left-2.5 top-3.5 text-muted-gray pointer-events-none" />
                <input
                  type="email"
                  required
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 text-xs rounded p-2.5 pl-8 focus:outline-none focus:border-gold-champagne/40 transition"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[9px] text-muted-gray uppercase font-mono tracking-wider block">Phone Number</label>
              <div className="relative">
                <Phone size={13} className="absolute left-2.5 top-3.5 text-muted-gray pointer-events-none" />
                <input
                  type="tel"
                  placeholder="+91 98000 00000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 text-xs rounded p-2.5 pl-8 focus:outline-none focus:border-gold-champagne/40 transition"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[9px] text-muted-gray uppercase font-mono tracking-wider block">Password</label>
              <div className="relative">
                <Lock size={13} className="absolute left-2.5 top-3.5 text-muted-gray pointer-events-none" />
                <input
                  type="password"
                  required
                  minLength={6}
                  placeholder="Min 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 text-xs rounded p-2.5 pl-8 focus:outline-none focus:border-gold-champagne/40 transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || success}
              className="w-full py-3 bg-gold-champagne hover:bg-gold-warm disabled:opacity-60 text-obsidian text-xs font-bold uppercase tracking-wider rounded transition cursor-pointer flex items-center justify-center gap-2"
            >
              {loading ? <><Loader2 size={13} className="animate-spin" /> Creating Account...</> : "Create Account"}
            </button>
          </form>

          <p className="text-center text-[11px] text-muted-gray">
            Already a member?{" "}
            <Link href="/login" className="text-gold-champagne hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
