"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard, CalendarCheck, Camera, Users, ShieldAlert,
  RotateCcw, CreditCard, RefreshCw, Ticket, BarChart3, FileSpreadsheet,
  Bell, Activity, UserCog, Settings, LogOut, ChevronLeft, ChevronRight,
  Search, Command, Menu, X, Star, HelpCircle, LifeBuoy, Gift, ArrowRight
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { AdminLogo } from "@/components/ui/AdminLogo";
import { createClient } from "@/utils/supabase/client";

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  badge?: string;
  badgeColor?: string;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const NAV_SECTIONS: NavSection[] = [
  {
    title: "OVERVIEW",
    items: [
      { name: "Dashboard", href: "/", icon: LayoutDashboard },
    ],
  },
  {
    title: "OPERATIONS",
    items: [
      { name: "Bookings", href: "/bookings", icon: CalendarCheck, badge: "12", badgeColor: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
      { name: "Fleet Calendar", href: "/calendar", icon: CalendarCheck, badge: "LIVE", badgeColor: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" },
      { name: "Inventory", href: "/inventory", icon: Camera },
      { name: "Customers", href: "/customers", icon: Users },
      { name: "KYC Center", href: "/kyc", icon: ShieldAlert, badge: "4", badgeColor: "bg-amber-500/20 text-amber-400 border-amber-500/30" },
      { name: "Returns", href: "/returns", icon: RotateCcw, badge: "2", badgeColor: "bg-purple-500/20 text-purple-400 border-purple-500/30" },
    ],
  },
  {
    title: "CUSTOMER ENGAGEMENT",
    items: [
      { name: "Reviews Moderation", href: "/reviews", icon: Star, badge: "2", badgeColor: "bg-[#d8b36a]/20 text-[#d8b36a] border-[#d8b36a]/30" },
      { name: "Online Enquiries", href: "/enquiries", icon: HelpCircle, badge: "1", badgeColor: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
      { name: "Support Tickets", href: "/tickets", icon: LifeBuoy, badge: "1", badgeColor: "bg-rose-500/20 text-rose-400 border-rose-500/30" },
      { name: "Referral System", href: "/referrals", icon: Gift, badge: "LIVE", badgeColor: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" },
    ],
  },
  {
    title: "FINANCE",
    items: [
      { name: "Payments", href: "/payments", icon: CreditCard },
      { name: "Refunds", href: "/refunds", icon: RefreshCw },
      { name: "Coupons", href: "/coupons", icon: Ticket },
    ],
  },
  {
    title: "INSIGHTS",
    items: [
      { name: "Analytics", href: "/analytics", icon: BarChart3 },
      { name: "Reports", href: "/reports", icon: FileSpreadsheet },
    ],
  },
  {
    title: "SYSTEM",
    items: [
      { name: "Notifications", href: "/notifications", icon: Bell, badge: "5", badgeColor: "bg-[#d8b36a]/20 text-[#d8b36a] border-[#d8b36a]/30" },
      { name: "Activity Logs", href: "/activity", icon: Activity },
      { name: "Staff Access", href: "/staff", icon: UserCog },
      { name: "Settings", href: "/settings", icon: Settings },
    ],
  },
];

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    try {
      const supabase = createClient();
      supabase.auth.getUser().then(({ data }) => {
        if (!data?.user) {
          router.push("/admin-login");
        }
      }).catch(() => {
        router.push("/admin-login");
      });
    } catch {
      // Fallback
    }
  }, [router]);

  // Global keyboard shortcut: Cmd+K or Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
      if (e.key === "Escape") {
        setSearchOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleLogout = async () => {
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
    } catch {
      // Ignore
    }
    router.push("/admin-login");
  };

  const handleNavigate = (href: string) => {
    setSearchOpen(false);
    setSearchQuery("");
    router.push(href);
  };

  // Flattened navigation links for omnibox matching
  const allNavItems = NAV_SECTIONS.flatMap((sec) => sec.items);
  const filteredNavItems = searchQuery.trim()
    ? allNavItems.filter((item) =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : allNavItems.slice(0, 6);

  return (
    <div className="min-h-screen bg-[#070707] text-[#f5f1e8] flex flex-col md:flex-row font-sans selection:bg-[#d8b36a]/30">
      {/* Mobile Top Navigation */}
      <div className="md:hidden flex items-center justify-between p-4 bg-[#121212] border-b border-white/10 sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <AdminLogo variant="wordmark" width={130} height={34} />
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSearchOpen(true)}
            className="p-2 text-[#9a9995] hover:text-[#f5f1e8]"
          >
            <Search size={18} />
          </button>
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-2 text-[#9a9995] hover:text-[#f5f1e8]"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Sidebar Navigation */}
      <aside
        className={`fixed md:sticky top-0 z-30 h-screen bg-[#0c0c0c] border-r border-white/10 flex flex-col transition-all duration-300 ${
          collapsed ? "w-20" : "w-64"
        } ${mobileOpen ? "translate-x-0 w-64" : "-translate-x-full md:translate-x-0"}`}
      >
        {/* Brand Header */}
        <div className="h-16 px-4 flex items-center justify-between border-b border-white/5">
          {!collapsed && (
            <AdminLogo variant="wordmark" width={140} height={36} />
          )}
          {collapsed && (
            <AdminLogo variant="monogram" />
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden md:flex p-1.5 rounded-lg text-[#9a9995] hover:text-[#f5f1e8] hover:bg-white/5 transition"
          >
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>

        {/* Scrollable Navigation Items */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          {NAV_SECTIONS.map((section) => (
            <div key={section.title} className="space-y-1">
              {!collapsed && (
                <p className="px-3 text-[10px] font-mono uppercase tracking-widest text-[#9a9995]/60 mb-2">
                  {section.title}
                </p>
              )}
              {section.items.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition duration-200 ${
                      isActive
                        ? "bg-[#d8b36a]/15 text-[#d8b36a] border border-[#d8b36a]/30 shadow-md shadow-[#d8b36a]/5"
                        : "text-[#9a9995] hover:text-[#f5f1e8] hover:bg-white/5"
                    }`}
                  >
                    <Icon size={18} className={isActive ? "text-[#d8b36a]" : "text-[#9a9995] shrink-0"} />
                    {!collapsed && (
                      <span className="flex-1 truncate">{item.name}</span>
                    )}
                    {!collapsed && item.badge && (
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${item.badgeColor}`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Footer Admin User */}
        <div className="p-3 border-t border-white/5 bg-[#070707]/60">
          <div className={`flex items-center gap-3 ${collapsed ? "justify-center" : "justify-between"}`}>
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-full bg-linear-to-tr from-[#d8b36a]/30 to-[#b98a43]/20 border border-[#d8b36a]/40 flex items-center justify-center text-[#d8b36a] text-xs font-bold shrink-0">
                PM
              </div>
              {!collapsed && (
                <div className="truncate">
                  <p className="text-xs font-medium text-[#f5f1e8] truncate">Prem Mundargi</p>
                  <p className="text-[10px] font-mono text-[#d8b36a] truncate">SUPER_ADMIN</p>
                </div>
              )}
            </div>
            {!collapsed && (
              <button
                onClick={handleLogout}
                title="Sign Out"
                className="p-2 rounded-lg text-[#9a9995] hover:text-red-400 hover:bg-red-500/10 transition"
              >
                <LogOut size={16} />
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header Bar */}
        <header className="hidden md:flex h-16 px-8 bg-[#0c0c0c]/80 backdrop-blur-md border-b border-white/5 items-center justify-between sticky top-0 z-20">
          {/* Global Search Bar Trigger */}
          <button
            onClick={() => setSearchOpen(true)}
            className="flex items-center gap-3 w-80 px-3.5 py-2 rounded-xl bg-[#121212] border border-white/10 text-xs text-[#9a9995] hover:border-[#d8b36a]/40 transition group cursor-pointer"
          >
            <Search size={15} className="group-hover:text-[#d8b36a] transition" />
            <span className="flex-1 text-left">Search bookings, gear, customers...</span>
            <span className="flex items-center gap-0.5 text-[10px] font-mono bg-white/5 border border-white/10 px-1.5 py-0.5 rounded text-[#9a9995]">
              <Command size={10} /> K
            </span>
          </button>

          {/* Right Utilities */}
          <div className="flex items-center gap-4">
            <Link
              href="/kyc"
              className="flex items-center gap-2 text-xs px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 hover:bg-amber-500/20 transition font-mono"
            >
              <ShieldAlert size={14} />
              <span>4 KYC PENDING</span>
            </Link>

            <Link
              href="/notifications"
              className="relative p-2 rounded-xl text-[#9a9995] hover:text-[#f5f1e8] hover:bg-white/5 transition"
            >
              <Bell size={18} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#d8b36a] animate-ping" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#d8b36a]" />
            </Link>

            <div className="h-4 w-px bg-white/10" />

            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-[11px] font-mono text-[#9a9995]">SYSTEM LIVE</span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 md:p-8 overflow-y-auto">
          {children}
        </main>
      </div>

      {/* Global Admin Command Palette Modal */}
      <AnimatePresence>
        {searchOpen && (
          <div
            onClick={() => setSearchOpen(false)}
            className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-black/80 backdrop-blur-md"
          >
            <motion.div
              onClick={(e) => e.stopPropagation()}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-xl bg-[#121212] border border-white/15 rounded-2xl p-4 shadow-2xl space-y-4"
            >
              <div className="flex items-center gap-3 px-3 py-2 border-b border-white/10">
                <Search size={18} className="text-[#d8b36a]" />
                <input
                  autoFocus
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Type to search bookings, gear, customers, or coupons..."
                  className="w-full bg-transparent text-sm text-[#f5f1e8] focus:outline-none placeholder-[#9a9995]/60 font-sans"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="p-1 text-[#9a9995] hover:text-[#f5f1e8]"
                  >
                    <X size={15} />
                  </button>
                )}
              </div>

              {/* Dynamic Filter Search Actions */}
              {searchQuery.trim() && (
                <div className="space-y-1.5 border-b border-white/5 pb-3">
                  <p className="text-[10px] font-mono text-[#d8b36a] uppercase px-3">Direct Search Actions</p>
                  <button
                    onClick={() => handleNavigate(`/bookings?search=${encodeURIComponent(searchQuery)}`)}
                    className="w-full text-left px-3 py-2 rounded-xl hover:bg-white/5 flex items-center justify-between text-xs text-[#f5f1e8] transition"
                  >
                    <span className="flex items-center gap-2">
                      <CalendarCheck size={14} className="text-[#d8b36a]" />
                      Search Bookings for &quot;<strong className="text-[#d8b36a]">{searchQuery}</strong>&quot;
                    </span>
                    <ArrowRight size={13} className="text-[#9a9995]" />
                  </button>
                  <button
                    onClick={() => handleNavigate(`/customers?search=${encodeURIComponent(searchQuery)}`)}
                    className="w-full text-left px-3 py-2 rounded-xl hover:bg-white/5 flex items-center justify-between text-xs text-[#f5f1e8] transition"
                  >
                    <span className="flex items-center gap-2">
                      <Users size={14} className="text-emerald-400" />
                      Search Customers for &quot;<strong className="text-emerald-400">{searchQuery}</strong>&quot;
                    </span>
                    <ArrowRight size={13} className="text-[#9a9995]" />
                  </button>
                  <button
                    onClick={() => handleNavigate(`/inventory?search=${encodeURIComponent(searchQuery)}`)}
                    className="w-full text-left px-3 py-2 rounded-xl hover:bg-white/5 flex items-center justify-between text-xs text-[#f5f1e8] transition"
                  >
                    <span className="flex items-center gap-2">
                      <Camera size={14} className="text-blue-400" />
                      Search Inventory for &quot;<strong className="text-blue-400">{searchQuery}</strong>&quot;
                    </span>
                    <ArrowRight size={13} className="text-[#9a9995]" />
                  </button>
                </div>
              )}

              {/* Quick Jump Navigation */}
              <div className="space-y-1 max-h-72 overflow-y-auto text-xs">
                <p className="text-[10px] font-mono text-[#9a9995] uppercase px-3 mb-1">
                  {searchQuery ? "Matching Sections" : "Quick Section Jumps"}
                </p>
                {filteredNavItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.href}
                      onClick={() => handleNavigate(item.href)}
                      className="w-full text-left px-3 py-2 rounded-xl hover:bg-white/5 flex items-center justify-between text-xs text-[#f5f1e8] transition"
                    >
                      <span className="flex items-center gap-2.5">
                        <Icon size={15} className="text-[#d8b36a]" />
                        <span>{item.name}</span>
                      </span>
                      <span className="font-mono text-[10px] text-[#9a9995]">{item.href}</span>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
