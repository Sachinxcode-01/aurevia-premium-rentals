"use client";

import React, { useState } from "react";
import Navbar from "@/components/navigation/Navbar";
import { useCart } from "@/hooks/useCart";
import { useRouter } from "next/navigation";
import { Lock, Mail, CheckCircle } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
  const { cart } = useCart();
  const router = useRouter();
  const [email, setEmail] = useState("contact@prem.dev");
  const [password, setPassword] = useState("password123");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (email === "contact@prem.dev" && password === "password123") {
      setSuccess(true);
      setTimeout(() => {
        router.push("/dashboard");
      }, 1000);
    } else {
      setError("Invalid credential combination. Check email and password.");
    }
  };

  return (
    <div className="min-h-screen bg-obsidian text-ivory pb-20 flex flex-col justify-between">
      <Navbar cartItemCount={cart.length} />

      <div className="flex-1 flex items-center justify-center px-6 pt-36 pb-12">
        <div className="glass-panel-gold border-gold-border rounded-lg max-w-sm w-full p-6 md:p-8 space-y-6 shadow-2xl relative">
          
          <div className="text-center space-y-1">
            <span className="text-[9px] uppercase tracking-widest text-gold-champagne font-mono block">Vault Access</span>
            <h2 className="serif-heading text-2xl font-light text-ivory">Sign In to AUREVIA</h2>
          </div>

          {success && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono rounded flex items-center gap-1.5 justify-center">
              <CheckCircle size={13} />
              ✓ Authentication success. Redirecting...
            </div>
          )}

          {error && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-mono rounded text-center">
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4 text-xs font-sans">
            <div className="space-y-2">
              <label className="text-[9px] text-muted-gray uppercase font-mono tracking-wider block">Email Address</label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 text-xs rounded p-2.5 pl-8 focus:outline-none focus:border-gold-champagne/40"
                />
                <Mail size={13} className="absolute left-2.5 top-3.5 text-muted-gray" />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-[9px] text-muted-gray uppercase font-mono tracking-wider block">Password</label>
                <a href="#" className="text-[9px] text-gold-champagne hover:underline">Forgot?</a>
              </div>
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
              Access Vault
            </button>
          </form>

          <p className="text-[10px] text-center text-muted-gray">
            Don&apos;t have a club account?{" "}
            <Link href="/register" className="text-gold-champagne hover:underline">Register now</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
