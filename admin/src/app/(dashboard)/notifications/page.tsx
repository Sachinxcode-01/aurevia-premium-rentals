"use client";

import React, { useState } from "react";
import { Bell, Check, DollarSign, ShieldAlert, AlertCircle, RotateCcw } from "lucide-react";

interface AdminNotif {
  id: string;
  title: string;
  desc: string;
  time: string;
  read: boolean;
}

const MOCK_NOTIFS: AdminNotif[] = [
  { id: "1", title: "New Payment Received", desc: "₹14,997 received for Booking #AUR-1042", time: "5 minutes ago", read: false },
  { id: "2", title: "KYC Verification Submitted", desc: "Rahul Verma uploaded Aadhaar document", time: "12 minutes ago", read: false },
  { id: "3", title: "Equipment Returned", desc: "Canon RF 70-200mm returned by Priya Nair", time: "1 hour ago", read: true },
];

export default function AdminNotificationsPage() {
  const [notifs, setNotifs] = useState<AdminNotif[]>(MOCK_NOTIFS);

  const markAllRead = () => {
    setNotifs((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex items-center justify-between border-b border-white/5 pb-6">
        <div>
          <h1 className="text-2xl font-light text-[#f5f1e8] font-serif flex items-center gap-3">
            <Bell className="text-[#d8b36a]" size={24} />
            Notifications Center
          </h1>
          <p className="text-xs text-[#9a9995] font-light mt-1">
            Real-time operational alerts, customer submissions, and system warnings.
          </p>
        </div>

        <button
          onClick={markAllRead}
          className="text-xs text-[#d8b36a] hover:underline font-mono"
        >
          Mark All as Read
        </button>
      </div>

      <div className="space-y-3 max-w-2xl">
        {notifs.map((n) => (
          <div
            key={n.id}
            className={`admin-card p-4 rounded-2xl border transition ${
              !n.read ? "border-[#d8b36a]/40 bg-[#d8b36a]/5" : "border-white/10"
            }`}
          >
            <div className="flex justify-between items-start">
              <h3 className="text-sm font-semibold text-[#f5f1e8]">{n.title}</h3>
              <span className="text-[10px] font-mono text-[#9a9995]">{n.time}</span>
            </div>
            <p className="text-xs text-[#9a9995] font-light mt-1">{n.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
