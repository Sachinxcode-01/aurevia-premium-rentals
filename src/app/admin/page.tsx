"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/navigation/Navbar";
import { useCart } from "@/hooks/useCart";
import { useToast } from "@/hooks/useToast";
import { useAdminRealtime } from "@/hooks/useAdminRealtime";
import { updateBookingStatusAction } from "@/lib/actions/bookings";
import { NotificationBell } from "@/components/ui/NotificationBell";
import type { BookingStatus } from "@/lib/supabase/types";
import {
  ShieldAlert, Coins, FileSpreadsheet, FileDown, RefreshCw,
  Search, Check, X, ArrowUpRight, ClipboardList, Package, Loader2,
} from "lucide-react";
import {
  ResponsiveContainer, LineChart, Line, BarChart, Bar,
  PieChart, Pie, Cell, XAxis, YAxis, Tooltip, CartesianGrid,
} from "recharts";
import { animate, stagger } from "animejs";

const STATUS_STYLES: Record<string, string> = {
  pending:   "bg-amber-500/10 border-amber-500/30 text-amber-400",
  confirmed: "bg-emerald-500/10 border-emerald-500/30 text-emerald-400",
  picked_up: "bg-blue-500/10 border-blue-500/30 text-blue-400",
  returned:  "bg-white/5 border-white/15 text-muted-gray",
  cancelled: "bg-red-500/10 border-red-500/30 text-red-400",
  rejected:  "bg-red-500/10 border-red-500/30 text-red-400",
};

const COLORS = ["#D8B36A", "#B98A43", "#F5F1E8", "#9A9995"];

export default function AdminDashboard() {
  const { cart } = useCart();
  const toast = useToast();
  const { bookings, loading, alerts, unreadCount, markAllRead, dismissAlert, refresh } = useAdminRealtime();

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    setTimeout(() => {
      animate(".admin-item", {
        opacity: [0, 1],
        translateY: [15, 0],
        delay: stagger(50),
        duration: 655,
        easing: "easeOutQuad",
      });
    }, 50);
  }, [bookings.length]);

  // Computed stats from LIVE data
  const stats = {
    revenueTotal: bookings.filter((b) => b.payment_status === "paid").reduce((s, b) => s + b.total_payable, 0),
    revenueMonth: bookings
      .filter((b) => b.payment_status === "paid" && new Date(b.created_at).getMonth() === new Date().getMonth())
      .reduce((s, b) => s + b.total_payable, 0),
    bookingsTotalCount: bookings.length,
    bookingsPendingCount: bookings.filter((b) => b.status === "pending").length,
    bookingsConfirmedCount: bookings.filter((b) => b.status === "confirmed").length,
    utilizationRate: bookings.length > 0 ? Math.round((bookings.filter((b) => b.status === "picked_up").length / bookings.length) * 100) : 0,
  };

  // Revenue trend by month (from real data)
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const revenueTrend = months.map((m, i) => ({
    date: m,
    amount: bookings
      .filter((b) => new Date(b.created_at).getMonth() === i && b.payment_status === "paid")
      .reduce((s, b) => s + b.total_payable, 0),
  }));

  const handleUpdateStatus = async (bookingId: string, newStatus: BookingStatus) => {
    const label = newStatus.replace("_", " ").toUpperCase();
    if (!confirm(`Mark this booking as ${label}?`)) return;

    setUpdatingId(bookingId);
    const result = await updateBookingStatusAction(bookingId, newStatus);

    if (result.success) {
      toast.success(`Booking marked as ${label}.`);
      refresh();
    } else {
      toast.error(result.error ?? "Failed to update booking status.");
    }
    setUpdatingId(null);
  };

  const filteredBookings = bookings.filter((b) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      b.reference_code.toLowerCase().includes(q) ||
      b.contact_name.toLowerCase().includes(q) ||
      b.contact_phone.includes(q);
    const matchesStatus = statusFilter === "" || b.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-obsidian flex items-center justify-center">
        <div className="flex items-center gap-3 text-xs font-mono text-muted-gray">
          <Loader2 size={16} className="animate-spin text-gold-champagne" />
          INITIALIZING SECURE VAULT METRICS...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-obsidian text-ivory pb-20">
      <Navbar cartItemCount={cart.length} />

      {/* Admin header */}
      <div className="pt-32 pb-10 px-6 md:px-12 max-w-7xl mx-auto border-b border-white/5 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div className="space-y-1">
          <span className="text-[9px] font-semibold uppercase tracking-[0.25em] text-gold-champagne font-mono block">
            Aurevia Administration Panel
          </span>
          <h1 className="serif-heading text-3xl md:text-4xl font-light text-ivory">
            Enterprise Operations <span className="text-gold">Analytics Dashboard</span>
          </h1>
          <div className="flex items-center gap-2 pt-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider">
              Real-time connected · {bookings.length} total bookings
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Live notification bell */}
          <NotificationBell
            alerts={alerts}
            unreadCount={unreadCount}
            onMarkAllRead={markAllRead}
            onDismiss={dismissAlert}
          />

          <button
            onClick={refresh}
            className="p-2 border border-white/10 rounded hover:bg-white/5 hover:border-gold-champagne text-gold-champagne transition flex items-center gap-1.5 text-xs cursor-pointer"
          >
            <RefreshCw size={13} />
          </button>

          <button
            onClick={() => toast.info("CSV export requires a backend download endpoint.")}
            className="p-2 border border-white/10 rounded hover:bg-white/5 text-ivory transition flex items-center gap-1.5 text-xs cursor-pointer"
          >
            <FileSpreadsheet size={13} />
            CSV
          </button>

          <button
            onClick={() => toast.info("PDF report requires a backend rendering service.")}
            className="p-2 border border-white/10 rounded hover:bg-white/5 text-ivory transition flex items-center gap-1.5 text-xs cursor-pointer"
          >
            <FileDown size={13} />
            PDF
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-12 py-10 space-y-10">

        {/* Core Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              label: "Gross Revenue",
              value: `₹${stats.revenueTotal.toLocaleString("en-IN")}`,
              sub: `This month: ₹${stats.revenueMonth.toLocaleString("en-IN")}`,
              icon: <Coins size={14} className="text-gold-champagne" />,
              gold: true,
            },
            {
              label: "Bookings Volume",
              value: stats.bookingsTotalCount,
              sub: `Pending: ${stats.bookingsPendingCount} · Confirmed: ${stats.bookingsConfirmedCount}`,
              icon: <ClipboardList size={14} className="text-gold-champagne" />,
            },
            {
              label: "Utilization Rate",
              value: `${stats.utilizationRate}%`,
              sub: "Current rental flow load",
              icon: <ArrowUpRight size={14} className="text-gold-champagne" />,
            },
            {
              label: "Pending Alerts",
              value: unreadCount > 0 ? unreadCount : "—",
              sub: "New booking events",
              icon: <ShieldAlert size={14} className="text-gold-champagne" />,
            },
          ].map((m) => (
            <div key={m.label} className="admin-item opacity-0 glass-panel border-white/5 rounded-lg p-5 space-y-3">
              <div className="flex justify-between items-center text-muted-gray">
                <span className="text-[9px] uppercase tracking-wider font-mono">{m.label}</span>
                {m.icon}
              </div>
              <div className={`text-2xl font-light ${m.gold ? "text-gold-champagne" : ""}`}>{m.value}</div>
              <p className="text-[8px] text-muted-gray uppercase tracking-widest font-mono">{m.sub}</p>
            </div>
          ))}
        </div>

        {/* Revenue Trend Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="admin-item opacity-0 lg:col-span-2 glass-panel border-white/5 rounded-lg p-6 space-y-4">
            <h3 className="serif-heading text-lg font-light text-ivory border-b border-white/5 pb-2">Revenue Growth — {new Date().getFullYear()}</h3>
            <div className="h-64 w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={revenueTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2c" vertical={false} />
                  <XAxis dataKey="date" stroke="#9A9995" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke="#9A9995" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${v}`} />
                  <Tooltip contentStyle={{ backgroundColor: "#171719", borderColor: "rgba(216,179,106,0.35)", borderRadius: 6, fontSize: 11 }} />
                  <Line type="monotone" dataKey="amount" stroke="#D8B36A" strokeWidth={2.5} dot={{ r: 3 }} activeDot={{ r: 5 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Status breakdown pie */}
          <div className="admin-item opacity-0 glass-panel border-white/5 rounded-lg p-6 space-y-4 flex flex-col justify-between">
            <h3 className="serif-heading text-lg font-light text-ivory border-b border-white/5 pb-2">Status Breakdown</h3>
            <div className="h-44 w-full flex items-center justify-center">
              {bookings.length === 0 ? (
                <p className="text-xs text-muted-gray font-mono">NO DATA YET</p>
              ) : (() => {
                const statuses = ["pending", "confirmed", "picked_up", "returned", "cancelled"];
                const pieData = statuses.map((s) => ({ name: s, value: bookings.filter((b) => b.status === s).length })).filter((d) => d.value > 0);
                return (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={65} paddingAngle={3} dataKey="value" nameKey="name">
                        {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: "#171719", borderColor: "rgba(216,179,106,0.35)", fontSize: 11 }} />
                    </PieChart>
                  </ResponsiveContainer>
                );
              })()}
            </div>
            <div className="space-y-1.5 text-[9px] font-mono">
              {["pending","confirmed","picked_up","returned","cancelled"].map((s, i) => (
                <div key={s} className="flex justify-between">
                  <span className="flex items-center gap-1.5 text-muted-gray capitalize">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                    {s.replace("_"," ")}
                  </span>
                  <span className="text-ivory">{bookings.filter((b) => b.status === s).length}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bookings Table */}
        <div className="admin-item opacity-0 glass-panel border-white/5 rounded-lg p-6 space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/5 pb-4">
            <h3 className="serif-heading text-xl font-light text-ivory">Vault Reservations Log</h3>
            <div className="flex flex-wrap gap-3 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <input
                  type="text"
                  placeholder="Search code, customer..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 text-xs rounded px-3 py-2 pr-8 focus:outline-none focus:border-gold-champagne/30 transition"
                />
                <Search size={13} className="absolute right-3 top-2.5 text-muted-gray pointer-events-none" />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-[#0e0e0e] border border-white/10 text-xs rounded px-3 py-2 text-muted-gray focus:outline-none"
              >
                <option value="">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="picked_up">Picked Up</option>
                <option value="returned">Returned</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-light font-sans min-w-[700px]">
              <thead>
                <tr className="border-b border-white/10 font-mono text-[9px] text-muted-gray uppercase tracking-wider">
                  <th className="py-3 pr-4">Reference</th>
                  <th className="py-3 px-4">Renter</th>
                  <th className="py-3 px-4">Schedule</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 pl-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredBookings.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-10 text-center text-muted-gray font-mono text-[10px]">
                      NO RESERVATION RECORDS FOUND
                    </td>
                  </tr>
                ) : filteredBookings.map((b) => (
                  <tr key={b.id} className="hover:bg-white/[0.02] transition">
                    <td className="py-3.5 pr-4 font-mono font-semibold text-gold-champagne text-[11px]">{b.reference_code}</td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-ivory">{b.contact_name}</div>
                      <div className="text-[10px] text-muted-gray font-mono">{b.contact_phone}</div>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[10px] text-muted-gray">
                      {b.start_date} → {b.end_date}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-ivory font-mono">
                      ₹{b.total_payable.toLocaleString("en-IN")}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border ${STATUS_STYLES[b.status] ?? ""}`}>
                        {b.status.replace("_"," ")}
                      </span>
                    </td>
                    <td className="py-3.5 pl-4 text-right">
                      <div className="flex gap-1.5 justify-end">
                        {updatingId === b.id ? (
                          <Loader2 size={13} className="animate-spin text-gold-champagne" />
                        ) : (
                          <>
                            {b.status === "pending" && (
                              <>
                                <button
                                  onClick={() => handleUpdateStatus(b.id, "confirmed")}
                                  className="w-7 h-7 rounded bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 flex items-center justify-center cursor-pointer border border-emerald-500/20 transition"
                                  title="Confirm"
                                >
                                  <Check size={13} />
                                </button>
                                <button
                                  onClick={() => handleUpdateStatus(b.id, "rejected")}
                                  className="w-7 h-7 rounded bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 flex items-center justify-center cursor-pointer border border-rose-500/20 transition"
                                  title="Reject"
                                >
                                  <X size={13} />
                                </button>
                              </>
                            )}
                            {b.status === "confirmed" && (
                              <button
                                onClick={() => handleUpdateStatus(b.id, "picked_up")}
                                className="px-2.5 py-1 rounded bg-white/10 hover:bg-white/15 text-ivory text-[9px] font-bold uppercase tracking-widest border border-white/10 cursor-pointer transition"
                              >
                                Picked Up
                              </button>
                            )}
                            {b.status === "picked_up" && (
                              <button
                                onClick={() => handleUpdateStatus(b.id, "returned")}
                                className="px-2.5 py-1 rounded bg-gold-champagne/10 hover:bg-gold-champagne/20 text-gold-champagne text-[9px] font-bold uppercase tracking-widest border border-gold-champagne/30 cursor-pointer transition"
                              >
                                Returned
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
