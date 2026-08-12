"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard, CalendarCheck, Camera, Users, ShieldAlert,
  RotateCcw, CreditCard, RefreshCw, Ticket, BarChart3, FileSpreadsheet,
  Bell, Activity, UserCog, Settings, LogOut, ChevronLeft, ChevronRight,
  Search, ShieldCheck, Command, Menu, X, Sparkles, User
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

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
      { name: "Inventory", href: "/inventory", icon: Camera },
      { name: "Customers", href: "/customers", icon: Users },
      { name: "KYC Center", href: "/kyc", icon: ShieldAlert, badge: "4", badgeColor: "bg-amber-500/20 text-amber-400 border-amber-500/30" },
      { name: "Returns", href: "/returns", icon: RotateCcw, badge: "2", badgeColor: "bg-purple-500/20 text-purple-400 border-purple-500/30" },
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

  const handleLogout = () => {
    router.push("/admin-login");
  };

  return (
    <div className="min-h-screen bg-[#070707] text-[#f5f1e8] flex flex-col md:flex-row font-sans selection:bg-[#d8b36a]/30">
      {/* Mobile Header Bar */}
      <div className="md:hidden flex items-center justify-between p-4 bg-[#121212] border-b border-white/10 sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#d8b36a]/10 border border-[#d8b36a]/30 text-[#d8b36a] flex items-center justify-center font-bold">
            A
          </div>
          <span className="font-serif tracking-wide text-sm font-semibold">AUREVIA ADMIN</span>
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
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#d8b36a]/10 border border-[#d8b36a]/40 text-[#d8b36a] flex items-center justify-center font-bold font-serif text-sm">
                A
              </div>
              <div>
                <span className="font-serif tracking-wider text-sm font-semibold text-[#f5f1e8]">AUREVIA</span>
                <span className="block text-[9px] font-mono uppercase tracking-widest text-[#d8b36a]">CONTROL CENTER</span>
              </div>
            </div>
          )}
          {collapsed && (
            <div className="mx-auto w-8 h-8 rounded-lg bg-[#d8b36a]/10 border border-[#d8b36a]/40 text-[#d8b36a] flex items-center justify-center font-bold font-serif text-sm">
              A
            </div>
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
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#d8b36a]/30 to-[#b98a43]/20 border border-[#d8b36a]/40 flex items-center justify-center text-[#d8b36a] text-xs font-bold shrink-0">
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
            className="flex items-center gap-3 w-80 px-3.5 py-2 rounded-xl bg-[#121212] border border-white/10 text-xs text-[#9a9995] hover:border-[#d8b36a]/40 transition group"
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
          <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-xl bg-[#121212] border border-white/15 rounded-2xl p-4 shadow-2xl space-y-4"
            >
              <div className="flex items-center gap-3 px-3 py-2 border-b border-white/10">
                <Search size={18} className="text-[#d8b36a]" />
                <input
                  autoFocus
                  placeholder="Type to search bookings, cameras, customers, or coupons..."
                  className="w-full bg-transparent text-sm text-[#f5f1e8] focus:outline-none placeholder-[#9a9995]/60"
                />
                <button
                  onClick={() => setSearchOpen(false)}
                  className="p-1 text-[#9a9995] hover:text-[#f5f1e8]"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-2 max-h-80 overflow-y-auto text-xs">
                <p className="text-[10px] font-mono text-[#9a9995] uppercase px-3">Quick Actions</p>
                <button onClick={() => { router.push("/bookings"); setSearchOpen(false); }} className="w-full text-left px-3 py-2 rounded-lg hover:bg-white/5 flex items-center justify-between">
                  <span>View All Bookings</span>
                  <span className="font-mono text-[10px] text-[#d8b36a]">AUR-1042...</span>
                </button>
                <button onClick={() => { router.push("/inventory"); setSearchOpen(false); }} className="w-full text-left px-3 py-2 rounded-lg hover:bg-white/5 flex items-center justify-between">
                  <span>Add New Equipment</span>
                  <span className="font-mono text-[10px] text-[#9a9995]">Inventory</span>
                </button>
                <button onClick={() => { router.push("/kyc"); setSearchOpen(false); }} className="w-full text-left px-3 py-2 rounded-lg hover:bg-white/5 flex items-center justify-between">
                  <span>Review Pending KYC (4)</span>
                  <span className="font-mono text-[10px] text-amber-400">Action Required</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
