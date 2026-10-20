"use client";

import React, { useEffect, useState } from "react";
import {
  ShieldCheck,
  LayoutDashboard,
  Boxes,
  CalendarCheck,
  FileEdit,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  X,
  Sparkles,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function AdminQuickBar() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [role, setRole] = useState<string>("");
  const [userEmail, setUserEmail] = useState<string>("");
  const [collapsed, setCollapsed] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    let mounted = true;
    const supabase = createClient();

    const verifyRole = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user || !mounted) {
          setIsAdmin(false);
          return;
        }

        let userRole = (user.user_metadata?.role as string) || "";

        // Query profiles table for definitive RBAC role
        try {
          const { data } = await (supabase as any)
            .from("profiles")
            .select("role")
            .eq("id", user.id)
            .maybeSingle();

          if (data && typeof data === "object" && "role" in data && data.role) {
            userRole = String(data.role);
          }
        } catch {
          // Fall back to metadata role
        }

        const allowed = ["admin", "staff", "super_admin"];
        if (allowed.includes(userRole)) {
          if (mounted) {
            setIsAdmin(true);
            setRole(userRole.replace("_", " ").toUpperCase());
            setUserEmail(user.email || "");
          }
        } else {
          if (mounted) setIsAdmin(false);
        }
      } catch {
        if (mounted) setIsAdmin(false);
      }
    };

    verifyRole();

    const { data: authListener } = supabase.auth.onAuthStateChange(() => {
      verifyRole();
    });

    return () => {
      mounted = false;
      authListener?.subscription.unsubscribe();
    };
  }, []);

  if (!isAdmin || dismissed) return null;

  const adminBaseUrl =
    process.env.NEXT_PUBLIC_ADMIN_URL ||
    (typeof window !== "undefined" && window.location.hostname.includes("localhost")
      ? "http://localhost:3002"
      : "https://aurevia-admin.vercel.app");

  if (collapsed) {
    return (
      <aside aria-label="Aurevia Staff Bar" className="fixed top-3 right-3 z-9999 flex items-center">
        <button
          type="button"
          onClick={() => setCollapsed(false)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-obsidian/90 border border-gold-champagne/40 text-gold-champagne hover:border-gold-champagne hover:bg-gold-champagne/10 shadow-2xl backdrop-blur-md text-xs font-mono transition duration-200 cursor-pointer"
          title="Expand Aurevia Staff Command Strip"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-gold-champagne animate-pulse" />
          <ShieldCheck size={13} />
          <span className="font-semibold tracking-wider">STAFF STRIP</span>
          <ChevronDown size={12} className="opacity-70" />
        </button>
      </aside>
    );
  }

  return (
    <aside
      aria-label="Aurevia Staff Bar"
      className="fixed top-0 left-0 right-0 z-9999 bg-obsidian/95 border-b border-gold-champagne/30 text-ivory text-xs backdrop-blur-md shadow-2xl transition-all duration-300"
    >
      <div className="max-w-7xl mx-auto px-4 py-2 flex flex-wrap items-center justify-between gap-3">
        {/* Left: Role Badge & Identity */}
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-gold-champagne/15 border border-gold-champagne/30 text-gold-champagne font-mono font-medium text-[11px]">
            <span className="w-1.5 h-1.5 rounded-full bg-gold-champagne animate-pulse" />
            <ShieldCheck size={13} />
            <span>STAFF PORTAL</span>
            <span className="text-[10px] text-ivory/70 border-l border-gold-champagne/20 pl-1.5 ml-0.5">
              {role}
            </span>
          </div>

          <span className="hidden md:inline text-[11px] text-muted-gray font-light">
            Logged in as <span className="text-ivory font-mono">{userEmail}</span>
          </span>
        </div>

        {/* Center / Right: Quick Navigation Switchers */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <a
            href={`${adminBaseUrl}/`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/5 hover:bg-gold-champagne/15 hover:text-gold-champagne border border-white/10 transition text-[11px]"
            title="Open Admin Dashboard"
          >
            <LayoutDashboard size={13} />
            <span className="font-medium">Dashboard</span>
            <ExternalLink size={10} className="opacity-50" />
          </a>

          <a
            href={`${adminBaseUrl}/inventory`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/5 hover:bg-gold-champagne/15 hover:text-gold-champagne border border-white/10 transition text-[11px]"
            title="Fleet Inventory & Serial Control"
          >
            <Boxes size={13} />
            <span className="hidden sm:inline">Fleet</span> Inventory
            <ExternalLink size={10} className="opacity-50" />
          </a>

          <a
            href={`${adminBaseUrl}/bookings`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/5 hover:bg-gold-champagne/15 hover:text-gold-champagne border border-white/10 transition text-[11px]"
            title="Manage Rental Bookings & Handovers"
          >
            <CalendarCheck size={13} />
            <span className="hidden sm:inline">Orders &amp;</span> Bookings
            <ExternalLink size={10} className="opacity-50" />
          </a>

          <a
            href={`${adminBaseUrl}/cms`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-gold-champagne/20 hover:bg-gold-champagne/30 text-gold-champagne border border-gold-champagne/40 transition text-[11px] font-medium"
            title="Edit Website Banners & Announcements in CMS"
          >
            <FileEdit size={13} />
            <span>Edit in CMS</span>
            <Sparkles size={11} className="text-gold-champagne" />
          </a>

          {/* Controls: Collapse & Dismiss */}
          <div className="flex items-center gap-1 border-l border-white/10 pl-2 ml-1">
            <button
              type="button"
              onClick={() => setCollapsed(true)}
              className="p-1 rounded text-muted-gray hover:text-ivory hover:bg-white/10 transition cursor-pointer"
              title="Minimize Staff Strip"
              aria-label="Minimize Staff Strip"
            >
              <ChevronUp size={14} />
            </button>

            <button
              type="button"
              onClick={() => setDismissed(true)}
              className="p-1 rounded text-muted-gray hover:text-rose-400 hover:bg-rose-500/10 transition cursor-pointer"
              title="Close for this session"
              aria-label="Close Staff Strip"
            >
              <X size={14} />
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
