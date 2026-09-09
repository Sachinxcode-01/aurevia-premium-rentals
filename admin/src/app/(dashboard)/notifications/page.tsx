"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Bell, Check, DollarSign, ShieldAlert, RotateCcw,
  ShieldCheck, LifeBuoy, CalendarCheck, ArrowRight,
  RefreshCw, Loader2
} from "lucide-react";
import { adminApiClient } from "@/lib/api-client";

interface SystemNotification {
  id: string;
  type: "payment" | "refund" | "kyc" | "ticket" | "security" | "booking";
  title: string;
  desc: string;
  time: string;
  actionUrl: string;
  severity: "info" | "warning" | "urgent";
  read: boolean;
}

export default function AdminNotificationsPage() {
  const [notifs, setNotifs] = useState<SystemNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const loadNotifications = useCallback(async (isManual = false) => {
    if (isManual) setRefreshing(true);
    else setLoading(true);

    try {
      const res = await adminApiClient.notifications.list(selectedCategory);
      if (res.success && Array.isArray(res.data)) {
        setNotifs(res.data);
      }
    } catch {
      // Keep existing state
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedCategory]);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const markAsRead = async (id: string) => {
    setNotifs((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    try {
      await adminApiClient.notifications.markRead(id);
    } catch {}
  };

  const markAllRead = async () => {
    setNotifs((prev) => prev.map((n) => ({ ...n, read: true })));
    try {
      await adminApiClient.notifications.markRead("all");
    } catch {}
  };

  const unreadCount = notifs.filter((n) => !n.read).length;

  const renderIcon = (type: string) => {
    switch (type) {
      case "payment":
        return <DollarSign size={16} className="text-emerald-400" />;
      case "refund":
        return <RotateCcw size={16} className="text-amber-400" />;
      case "kyc":
        return <ShieldCheck size={16} className="text-sky-400" />;
      case "ticket":
        return <LifeBuoy size={16} className="text-purple-400" />;
      case "security":
        return <ShieldAlert size={16} className="text-rose-400" />;
      case "booking":
      default:
        return <CalendarCheck size={16} className="text-[#d8b36a]" />;
    }
  };

  const categories = [
    { key: "all", label: "All Alerts" },
    { key: "payment", label: "Payments" },
    { key: "refund", label: "Refunds" },
    { key: "kyc", label: "KYC Submissions" },
    { key: "ticket", label: "Support" },
    { key: "security", label: "Security" },
  ];

  return (
    <div className="space-y-6 pb-12 max-w-4xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-light text-[#f5f1e8] font-serif flex items-center gap-3">
              <Bell className="text-[#d8b36a]" size={24} />
              Operations Notification Center
            </h1>
            {unreadCount > 0 && (
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono bg-[#d8b36a]/20 text-[#d8b36a] border border-[#d8b36a]/30">
                {unreadCount} unread
              </span>
            )}
          </div>
          <p className="text-xs text-[#9a9995] font-light mt-1">
            Real-time operations feed: rental payments, pending refund authorizations, KYC reviews, and customer inquiries.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto">
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="text-xs text-[#d8b36a] hover:underline font-mono"
            >
              Mark All Read
            </button>
          )}

          <button
            onClick={() => loadNotifications(true)}
            disabled={refreshing}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-white/10 text-xs text-[#9a9995] hover:text-[#f5f1e8] hover:border-white/20 transition"
          >
            <RefreshCw size={13} className={refreshing ? "animate-spin text-[#d8b36a]" : ""} />
            Refresh
          </button>
        </div>
      </div>

      {/* Category Filter Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {categories.map((c) => (
          <button
            key={c.key}
            onClick={() => setSelectedCategory(c.key)}
            className={`px-3 py-1.5 rounded-xl text-xs whitespace-nowrap transition border ${
              selectedCategory === c.key
                ? "bg-[#d8b36a] text-[#070707] border-[#d8b36a] font-semibold"
                : "bg-[#0c0c0c] text-[#9a9995] border-white/10 hover:border-white/25 hover:text-[#f5f1e8]"
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {loading ? (
          <div className="admin-card p-12 rounded-2xl border border-white/10 text-center text-[#9a9995] text-xs flex flex-col items-center gap-3">
            <Loader2 size={20} className="animate-spin text-[#d8b36a]" />
            Fetching live notifications...
          </div>
        ) : notifs.length === 0 ? (
          <div className="admin-card p-12 rounded-2xl border border-white/10 text-center text-[#9a9995] text-xs">
            No notifications in this category. All systems normal.
          </div>
        ) : (
          notifs.map((n) => (
            <div
              key={n.id}
              onClick={() => markAsRead(n.id)}
              className={`admin-card p-4 sm:p-5 rounded-2xl border transition group cursor-pointer ${
                !n.read
                  ? "border-[#d8b36a]/30 bg-[#d8b36a]/5 hover:bg-[#d8b36a]/10"
                  : "border-white/10 bg-[#0c0c0c]/80 hover:bg-white/5"
              }`}
            >
              <div className="flex items-start gap-3.5">
                <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 shrink-0">
                  {renderIcon(n.type)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-xs font-semibold text-[#f5f1e8] group-hover:text-[#d8b36a] transition">
                        {n.title}
                      </h3>
                      {!n.read && (
                        <span className="w-1.5 h-1.5 rounded-full bg-[#d8b36a]" />
                      )}
                      {n.severity === "urgent" && (
                        <span className="px-1.5 py-0.2 rounded text-[9px] uppercase font-mono bg-rose-500/15 text-rose-400 border border-rose-500/30">
                          Urgent
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] font-mono text-[#9a9995]">
                      {n.time ? new Date(n.time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "Recently"}
                    </span>
                  </div>

                  <p className="text-xs text-[#9a9995] font-light mt-1 leading-relaxed">
                    {n.desc}
                  </p>

                  <div className="mt-3 flex items-center justify-between pt-2 border-t border-white/5">
                    <Link
                      href={n.actionUrl}
                      className="text-[11px] text-[#d8b36a] hover:underline flex items-center gap-1 font-mono group-hover:translate-x-0.5 transition-transform"
                    >
                      <span>Take Action</span>
                      <ArrowRight size={12} />
                    </Link>

                    {!n.read ? (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          markAsRead(n.id);
                        }}
                        className="text-[10px] text-[#9a9995] hover:text-[#f5f1e8] font-mono"
                      >
                        Mark read
                      </button>
                    ) : (
                      <span className="text-[10px] text-[#9a9995]/60 font-mono flex items-center gap-1">
                        <Check size={11} /> Read
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
