"use client";

import React, { useState } from "react";
import Navbar from "@/components/navigation/Navbar";
import { useCart } from "@/hooks/useCart";
import { useToast } from "@/hooks/useToast";
import { useRouter } from "next/navigation";
import { Lock, Mail, CheckCircle, Loader2 } from "lucide-react";
import Link from "next/link";
import { signInAction } from "@/lib/actions/auth";

export default function LoginPage() {
  const { cart } = useCart();
  const toast = useToast();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const result = await signInAction(email, password);

    if (result.success) {
      setSuccess(true);
      toast.success("Signed in successfully.");
      setTimeout(() => {
        router.push(result.role === "admin" || result.role === "staff" ? "/admin" : "/dashboard");
      }, 800);
    } else {
      toast.error(result.error ?? "Sign-in failed. Check your credentials.");
    }
    setLoading(false);
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

          <form onSubmit={handleLogin} className="space-y-4 text-xs">
            <div className="space-y-2">
              <label className="text-[10px] text-muted-gray uppercase font-mono tracking-wider block">Email Address</label>
              <div className="relative">
                <Mail size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-gray pointer-events-none" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full bg-white/5 border border-white/10 text-xs rounded p-2.5 pl-8 focus:outline-none focus:border-gold-champagne/40 transition"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] text-muted-gray uppercase font-mono tracking-wider block">Password</label>
              <div className="relative">
                <Lock size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-gray pointer-events-none" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-white/5 border border-white/10 text-xs rounded p-2.5 pl-8 focus:outline-none focus:border-gold-champagne/40 transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || success}
              className="w-full py-3 bg-gold-champagne hover:bg-gold-warm disabled:opacity-60 text-obsidian text-xs font-bold uppercase tracking-wider rounded transition cursor-pointer flex items-center justify-center gap-2"
            >
              {loading ? <><Loader2 size={13} className="animate-spin" /> Signing In...</> : "Sign In"}
            </button>
          </form>

          <div className="text-center text-[11px] text-muted-gray space-y-1">
            <p>
              New to AUREVIA?{" "}
              <Link href="/register" className="text-gold-champagne hover:underline">
                Create account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
