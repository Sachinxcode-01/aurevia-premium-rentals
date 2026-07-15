"use client";

import { useState, useRef, useEffect } from "react";
import { Bell, X } from "lucide-react";
import { animate } from "animejs";
import type { AdminRealtimeAlert } from "@/hooks/useAdminRealtime";

interface NotificationBellProps {
  alerts: AdminRealtimeAlert[];
  unreadCount: number;
  onMarkAllRead: () => void;
  onDismiss: (id: string) => void;
}

export function NotificationBell({
  alerts,
  unreadCount,
  onMarkAllRead,
  onDismiss,
}: NotificationBellProps) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const badgeRef = useRef<HTMLSpanElement>(null);

  // Pulse badge when unread count increases
  useEffect(() => {
    if (unreadCount > 0 && badgeRef.current) {
      animate(badgeRef.current, {
        scale: [1, 1.4, 1],
        duration: 400,
        easing: "easeOutBack",
      });
    }
  }, [unreadCount]);

  // Animate dropdown
  useEffect(() => {
    if (dropdownRef.current) {
      if (open) {
        animate(dropdownRef.current, {
          opacity: [0, 1],
          translateY: [-8, 0],
          duration: 220,
          easing: "easeOutCubic",
        });
      }
    }
  }, [open]);

  const typeColor: Record<AdminRealtimeAlert["type"], string> = {
    new_booking: "text-gold-champagne",
    status_change: "text-blue-400",
    overdue: "text-red-400",
  };

  const typeIcon: Record<AdminRealtimeAlert["type"], string> = {
    new_booking: "📋",
    status_change: "🔄",
    overdue: "⚠️",
  };

  return (
    <div className="relative">
      <button
        onClick={() => {
          setOpen((v) => !v);
          if (!open) onMarkAllRead();
        }}
        className="relative p-2 rounded-full hover:bg-white/5 transition cursor-pointer"
        aria-label="Notifications"
      >
        <Bell size={16} className="text-ivory/70" />
        {unreadCount > 0 && (
          <span
            ref={badgeRef}
            className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-gold-champagne text-obsidian text-[9px] font-bold rounded-full flex items-center justify-center font-mono"
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setOpen(false)}
          />

          {/* Dropdown */}
          <div
            ref={dropdownRef}
            className="absolute right-0 top-full mt-2 w-80 bg-[#0e0e0e] border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden opacity-0"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
              <span className="text-[11px] font-mono uppercase tracking-wider text-gold-champagne">
                Live Alerts
              </span>
              <button
                onClick={onMarkAllRead}
                className="text-[10px] text-muted-gray hover:text-ivory transition cursor-pointer"
              >
                Mark all read
              </button>
            </div>

            <div className="max-h-80 overflow-y-auto">
              {alerts.length === 0 ? (
                <div className="py-8 text-center text-xs text-muted-gray">
                  No alerts yet
                </div>
              ) : (
                alerts.slice(0, 20).map((alert) => (
                  <div
                    key={alert.id}
                    className={`flex items-start gap-3 px-4 py-3 border-b border-white/5 hover:bg-white/3 transition ${
                      !alert.read ? "bg-white/[0.02]" : ""
                    }`}
                  >
                    <span className="text-sm mt-0.5">{typeIcon[alert.type]}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-ivory leading-snug">{alert.message}</p>
                      {alert.bookingRef && (
                        <p className="text-[10px] font-mono text-muted-gray mt-0.5">
                          {alert.bookingRef}
                        </p>
                      )}
                      <p className="text-[10px] text-muted-gray/50 mt-1">
                        {new Date(alert.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                    <button
                      onClick={() => onDismiss(alert.id)}
                      className="text-muted-gray hover:text-red-400 transition cursor-pointer shrink-0"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
