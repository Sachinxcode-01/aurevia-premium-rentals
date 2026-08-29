"use client";

import React from "react";
import { DashTab } from "./DashboardTypes";
import { TrendingUp, ShoppingBag, FileText, MessageCircle, Settings, LogOut, ChevronRight } from "lucide-react";

interface DashboardNavProps {
  activeTab: DashTab;
  onSelectTab: (tab: DashTab) => void;
  bookingCount: number;
  invoiceCount: number;
  supportUnresolvedCount: number;
  onLogout: () => void;
  profileName?: string;
  profileEmail?: string;
}

export default function DashboardNav({
  activeTab,
  onSelectTab,
  bookingCount,
  invoiceCount,
  supportUnresolvedCount,
  onLogout,
  profileName,
  profileEmail,
}: DashboardNavProps) {
  const navItems = [
    { id: "overview" as DashTab, label: "Overview", icon: <TrendingUp size={15} /> },
    { id: "bookings" as DashTab, label: "Bookings", icon: <ShoppingBag size={15} />, badge: bookingCount },
    { id: "invoices" as DashTab, label: "Invoices Vault", icon: <FileText size={15} />, badge: invoiceCount },
    { id: "support" as DashTab, label: "Support Desk", icon: <MessageCircle size={15} />, badge: supportUnresolvedCount },
    { id: "settings" as DashTab, label: "Settings", icon: <Settings size={15} /> },
  ];

  return (
    <aside className="w-full lg:w-64 shrink-0 space-y-6">
      {/* User Card */}
      <div className="rounded-2xl border border-white/10 bg-neutral-900/90 p-5 backdrop-blur-xl shadow-xl">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-400/20 text-base font-bold font-mono text-amber-400 border border-amber-400/30">
            {(profileName || "A")[0].toUpperCase()}
          </div>
          <div className="overflow-hidden">
            <h3 className="truncate text-sm font-bold text-white">
              {profileName || "Valued Filmmaker"}
            </h3>
            <p className="truncate text-[11px] text-neutral-400 font-mono">
              {profileEmail || "customer@aurevia.com"}
            </p>
          </div>
        </div>
      </div>

      {/* Nav Menu */}
      <nav className="rounded-2xl border border-white/10 bg-neutral-900/90 p-2 backdrop-blur-xl shadow-xl space-y-1">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-semibold transition-all ${
                isActive
                  ? "bg-amber-400 text-black shadow-md shadow-amber-400/20 font-bold"
                  : "text-neutral-300 hover:bg-white/5 hover:text-white"
              }`}
            >
              <div className="flex items-center gap-2.5">
                {item.icon}
                <span>{item.label}</span>
              </div>

              <div className="flex items-center gap-1.5">
                {item.badge !== undefined && item.badge > 0 && (
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-mono font-bold ${
                      isActive ? "bg-black text-amber-400" : "bg-white/10 text-neutral-300"
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
                <ChevronRight size={12} className={isActive ? "text-black" : "text-neutral-600"} />
              </div>
            </button>
          );
        })}

        <div className="border-t border-white/10 pt-2 mt-2">
          <button
            onClick={onLogout}
            className="flex w-full items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-rose-400 hover:bg-rose-500/10 transition-colors"
          >
            <LogOut size={15} />
            <span>Sign Out</span>
          </button>
        </div>
      </nav>
    </aside>
  );
}
