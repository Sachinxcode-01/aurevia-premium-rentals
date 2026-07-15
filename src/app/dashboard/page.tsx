"use client";

import { useEffect, useState, useRef } from "react";
import Navbar from "@/components/navigation/Navbar";
import { useCart } from "@/hooks/useCart";
import { useToast } from "@/hooks/useToast";
import { useRealtimeBookings } from "@/hooks/useRealtimeBookings";
import { cancelBookingAction } from "@/lib/actions/bookings";
import { updateProfileAction, getCurrentUserAction } from "@/lib/actions/auth";
import {
  User, ShoppingBag, History, TrendingUp,
  MapPin, Calendar, MessageCircle,
  Camera, RefreshCw, XCircle, Loader2, CheckCircle,
} from "lucide-react";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip,
  PieChart, Pie, Cell,
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

export default function CustomerDashboard() {
  const { cart } = useCart();
  const toast = useToast();
  const { bookings, loading: bookingsLoading, error: bookingsError, refresh } = useRealtimeBookings();

  const [profile, setProfile] = useState<Record<string, unknown> | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "bookings" | "settings">("overview");

  // Settings form
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);

  // Cancel state
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  // Track previous booking count for toast
  const prevBookingCount = useRef(0);

  // Load profile once
  useEffect(() => {
    getCurrentUserAction().then((p) => {
      if (p) {
        setProfile(p as Record<string, unknown>);
        setName(String(p.full_name ?? ""));
        setPhone(String(p.phone ?? ""));
      }
      setProfileLoading(false);
    });
  }, []);

  // Toast when new booking appears live
  useEffect(() => {
    if (prevBookingCount.current > 0 && bookings.length > prevBookingCount.current) {
      toast.info("Your bookings have been updated.");
    }
    if (prevBookingCount.current > 0 && bookings.length === prevBookingCount.current) {
      // Check for status changes
      toast.info("A booking status has been updated.");
    }
    prevBookingCount.current = bookings.length;
  }, [bookings]);

  // Animate cards on tab change
  useEffect(() => {
    setTimeout(() => {
      animate(".dashboard-animate", {
        opacity: [0, 1],
        translateY: [15, 0],
        delay: stagger(60),
        duration: 600,
        easing: "easeOutQuad",
      });
    }, 50);
  }, [activeTab]);

  // Computed stats from LIVE bookings
  const stats = {
    totalBookings: bookings.length,
    activeRentals: bookings.filter((b) => b.status === "confirmed" || b.status === "picked_up").length,
    completedRentals: bookings.filter((b) => b.status === "returned").length,
    totalSpent: bookings
      .filter((b) => b.status !== "cancelled" && b.status !== "rejected")
      .reduce((sum, b) => sum + b.total_payable, 0),
  };

  // Spending trend chart from real bookings
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const spendingByMonth = months.map((m, i) => ({
    name: m,
    amount: bookings
      .filter((b) => new Date(b.created_at).getMonth() === i && b.payment_status === "paid")
      .reduce((s, b) => s + b.total_payable, 0),
  }));

  const COLORS = ["#D8B36A", "#B98A43", "#F5F1E8"];

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const result = await updateProfileAction(name, phone);
    if (result.success) {
      toast.success("Profile updated successfully.");
      setProfile((prev) => prev ? { ...prev, full_name: name, phone } : prev);
    } else {
      toast.error(result.error ?? "Failed to update profile.");
    }
    setSaving(false);
  };

  const handleCancelBooking = async (bookingId: string, ref: string) => {
    if (!confirm(`Cancel booking ${ref}? This cannot be undone.`)) return;
    setCancellingId(bookingId);
    const result = await cancelBookingAction(bookingId);
    if (result.success) {
      toast.success(`Booking ${ref} has been cancelled.`);
      refresh();
    } else {
      toast.error(result.error ?? "Could not cancel booking.");
    }
    setCancellingId(null);
  };

  if (profileLoading) {
    return (
      <div className="min-h-screen bg-obsidian flex items-center justify-center">
        <Loader2 size={24} className="animate-spin text-gold-champagne" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-obsidian text-ivory pb-20">
      <Navbar cartItemCount={cart.length} />

      {/* Header */}
      <div className="pt-32 pb-10 px-6 md:px-12 max-w-7xl mx-auto border-b border-white/5 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div className="space-y-1">
          <span className="text-[10px] font-semibold uppercase tracking-[0.25em] text-gold-champagne font-mono block">
            Aurevia Club Member
          </span>
          <h1 className="serif-heading text-3xl md:text-4xl font-light text-ivory">
            Welcome Back, <span className="text-gold">{String(profile?.full_name ?? "Member")}</span>
          </h1>
          <div className="flex items-center gap-2 pt-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider">Live data connected</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={refresh}
            className="p-2 rounded border border-white/10 hover:border-white/20 text-muted-gray hover:text-ivory transition cursor-pointer"
            title="Refresh bookings"
          >
            <RefreshCw size={13} />
          </button>

          <div className="flex gap-1 bg-white/5 p-1 rounded border border-white/5">
            {(["overview", "bookings", "settings"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 text-xs font-semibold rounded uppercase tracking-wider transition cursor-pointer ${
                  activeTab === tab ? "bg-gold-champagne text-obsidian" : "text-muted-gray hover:text-ivory"
                }`}
              >
                {tab === "overview" ? "Overview" : tab === "bookings" ? `Rentals (${bookings.length})` : "Settings"}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-12 py-10">

        {/* ── TAB 1: OVERVIEW ── */}
        {activeTab === "overview" && (
          <div className="space-y-10">
            {/* Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { label: "Active Rentals",    value: stats.activeRentals,     icon: <Camera size={16} className="text-gold-champagne" />,     sub: "Currently checked out" },
                { label: "Total Bookings",    value: stats.totalBookings,     icon: <ShoppingBag size={16} className="text-gold-champagne" />, sub: "Lifetime orders" },
                { label: "Completed Returns", value: stats.completedRentals,  icon: <History size={16} className="text-gold-champagne" />,     sub: "Vault items returned" },
                { label: "Total Spent",       value: `₹${stats.totalSpent.toLocaleString("en-IN")}`, icon: <TrendingUp size={16} className="text-gold-champagne" />, sub: "Verified payments", gold: true },
              ].map((m) => (
                <div key={m.label} className="dashboard-animate opacity-0 glass-panel border-white/5 rounded-lg p-6 space-y-4">
                  <div className="flex justify-between items-center text-muted-gray">
                    <span className="text-[10px] uppercase tracking-wider font-mono">{m.label}</span>
                    {m.icon}
                  </div>
                  <div className={`text-3xl font-light ${m.gold ? "text-gold-champagne" : ""}`}>{m.value}</div>
                  <p className="text-[9px] text-muted-gray uppercase tracking-widest font-mono">{m.sub}</p>
                </div>
              ))}
            </div>

            {/* Spending Trend (from real data) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="dashboard-animate opacity-0 lg:col-span-2 glass-panel border-white/5 rounded-lg p-6 space-y-4">
                <h3 className="serif-heading text-lg font-light text-ivory border-b border-white/5 pb-2">Spending Trend — {new Date().getFullYear()}</h3>
                <div className="h-60 w-full pt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={spendingByMonth}>
                      <defs>
                        <linearGradient id="colorSpent" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#D8B36A" stopOpacity={0.25} />
                          <stop offset="95%" stopColor="#D8B36A" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="name" stroke="#9A9995" fontSize={10} tickLine={false} axisLine={false} />
                      <YAxis stroke="#9A9995" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${v}`} />
                      <Tooltip contentStyle={{ backgroundColor: "#171719", borderColor: "rgba(216,179,106,0.35)", borderRadius: 6, fontSize: 11 }} />
                      <Area type="monotone" dataKey="amount" stroke="#D8B36A" strokeWidth={2} fillOpacity={1} fill="url(#colorSpent)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Recent bookings quick list */}
              <div className="dashboard-animate opacity-0 glass-panel border-white/5 rounded-lg p-6 space-y-4">
                <h3 className="serif-heading text-lg font-light text-ivory border-b border-white/5 pb-2">Recent Bookings</h3>
                {bookings.length === 0 ? (
                  <p className="text-xs text-muted-gray">No bookings yet.</p>
                ) : (
                  <div className="space-y-3">
                    {bookings.slice(0, 5).map((b) => (
                      <div key={b.id} className="flex items-center justify-between gap-3 py-2 border-b border-white/5 last:border-0">
                        <div>
                          <p className="text-[11px] font-mono text-gold-champagne">{b.reference_code}</p>
                          <p className="text-[10px] text-muted-gray">{b.start_date} → {b.end_date}</p>
                        </div>
                        <span className={`px-2 py-0.5 text-[9px] font-bold uppercase rounded border ${STATUS_STYLES[b.status] ?? ""}`}>
                          {b.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Timeline */}
            <div className="dashboard-animate opacity-0 glass-panel border-white/5 rounded-lg p-6 space-y-6">
              <h3 className="serif-heading text-lg font-light text-ivory border-b border-white/5 pb-2">Upcoming Pickup & Return Timeline</h3>
              <div className="relative border-l-2 border-white/10 pl-6 ml-4 space-y-8">
                {bookings.filter((b) => ["pending", "confirmed"].includes(b.status)).slice(0, 3).length === 0 ? (
                  <p className="text-xs text-muted-gray py-4">No upcoming pickups.</p>
                ) : bookings.filter((b) => ["pending", "confirmed"].includes(b.status)).slice(0, 3).map((b) => (
                  <div key={b.id} className="relative">
                    <span className="absolute -left-10 top-0.5 w-6 h-6 rounded-full bg-obsidian border-2 border-gold-champagne flex items-center justify-center text-[10px] text-gold-champagne font-mono font-semibold">L</span>
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <h4 className="text-sm font-semibold text-gold-champagne uppercase font-mono tracking-wider">
                          {b.reference_code} ({b.status.toUpperCase()})
                        </h4>
                        <span className="text-[10px] text-muted-gray font-mono">{b.start_date} to {b.end_date}</span>
                      </div>
                      <p className="text-xs text-muted-gray max-w-2xl font-light leading-relaxed">
                        Pickup from Aurevia Studio. Bring government ID matching registration name ({b.contact_name}). Contact Prem at 9686909048.
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 2: BOOKINGS LIST ── */}
        {activeTab === "bookings" && (
          <div className="space-y-6">
            {bookingsLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 size={20} className="animate-spin text-gold-champagne" />
              </div>
            ) : bookingsError ? (
              <div className="glass-panel border-red-500/20 rounded p-8 text-center space-y-3">
                <p className="text-xs text-red-400">{bookingsError}</p>
                <button onClick={refresh} className="text-xs text-gold-champagne underline cursor-pointer">Retry</button>
              </div>
            ) : bookings.length === 0 ? (
              <div className="glass-panel border-white/5 rounded p-12 text-center space-y-3">
                <Camera size={32} className="text-muted-gray mx-auto" />
                <p className="text-sm text-muted-gray">No bookings found.</p>
                <p className="text-xs text-muted-gray/60">Your rental history will appear here.</p>
              </div>
            ) : (
              bookings.map((booking) => (
                <div key={booking.id} className="dashboard-animate opacity-0 glass-panel border-white/5 rounded-lg p-6 space-y-4 hover:border-gold-border/30 transition duration-300">
                  <div className="flex flex-wrap items-center justify-between border-b border-white/5 pb-4 gap-4">
                    <div>
                      <span className="text-[9px] text-gold-champagne uppercase font-mono tracking-widest block mb-1">Vault Reservation</span>
                      <h4 className="serif-heading text-lg font-light text-ivory">{booking.reference_code}</h4>
                    </div>
                    <div className="flex gap-3 items-center">
                      <div className="text-right">
                        <span className="text-[8px] text-muted-gray uppercase block font-mono">Total Payable</span>
                        <span className="text-sm font-semibold text-gold-champagne">₹{booking.total_payable.toLocaleString("en-IN")}</span>
                      </div>
                      <span className={`px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider rounded border ${STATUS_STYLES[booking.status] ?? ""}`}>
                        {booking.status.replace("_", " ")}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs font-light text-muted-gray leading-relaxed">
                    <div className="space-y-1.5">
                      <p className="flex items-center gap-1.5"><Calendar size={12} className="text-gold-champagne" /><strong>Duration:</strong> {booking.start_date} → {booking.end_date}</p>
                      <p className="flex items-center gap-1.5"><MapPin size={12} className="text-gold-champagne" /><strong>Mode:</strong> {booking.delivery_method.toUpperCase()}</p>
                      <p className="flex items-center gap-1.5"><User size={12} className="text-gold-champagne" /><strong>Contact:</strong> {booking.contact_name} · {booking.contact_phone}</p>
                      <p className="flex items-center gap-1.5"><CheckCircle size={12} className="text-gold-champagne" /><strong>Payment:</strong> {booking.payment_status.toUpperCase()}</p>
                    </div>
                    <div className="flex flex-col justify-end items-end gap-3">
                      <div className="flex gap-2 flex-wrap justify-end">
                        {/* Cancel — only for pending/confirmed */}
                        {["pending", "confirmed"].includes(booking.status) && (
                          <button
                            onClick={() => handleCancelBooking(booking.id, booking.reference_code)}
                            disabled={cancellingId === booking.id}
                            className="px-3 py-2 border border-red-500/30 hover:border-red-500/60 text-red-400 rounded text-[10px] font-semibold uppercase tracking-wider transition cursor-pointer flex items-center gap-1 disabled:opacity-50"
                          >
                            {cancellingId === booking.id ? <Loader2 size={10} className="animate-spin" /> : <XCircle size={10} />}
                            Cancel
                          </button>
                        )}

                        <a
                          href={`https://wa.me/919686909048?text=Enquiry%20regarding%20booking%20${booking.reference_code}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-[10px] font-semibold uppercase tracking-wider transition cursor-pointer flex items-center gap-1"
                        >
                          <MessageCircle size={10} />
                          WhatsApp
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* ── TAB 3: SETTINGS ── */}
        {activeTab === "settings" && (
          <div className="max-w-xl mx-auto glass-panel border-white/5 rounded-lg p-6 md:p-8 space-y-6 dashboard-animate opacity-0">
            <h3 className="serif-heading text-xl font-light text-ivory border-b border-white/5 pb-3">Edit Club Profile</h3>

            <form onSubmit={handleSaveProfile} className="space-y-4 text-xs font-sans">
              <div className="space-y-2">
                <label className="text-[10px] text-muted-gray uppercase font-mono tracking-wider block">Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 text-xs rounded p-2.5 focus:outline-none focus:border-gold-champagne/40 transition"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] text-muted-gray uppercase font-mono tracking-wider block">Registered Email</label>
                <input
                  type="email"
                  disabled
                  value={String(profile?.email ?? "")}
                  className="w-full bg-white/3 border border-white/5 text-xs rounded p-2.5 text-muted-gray cursor-not-allowed"
                />
                <p className="text-[10px] text-muted-gray/60">Email cannot be changed after registration.</p>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] text-muted-gray uppercase font-mono tracking-wider block">Mobile Number</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 text-xs rounded p-2.5 focus:outline-none focus:border-gold-champagne/40 transition"
                />
              </div>
              <div className="pt-4 border-t border-white/5">
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full py-3 bg-gold-champagne hover:bg-gold-warm disabled:opacity-60 text-obsidian text-xs font-bold uppercase tracking-wider rounded transition cursor-pointer flex items-center justify-center gap-2"
                >
                  {saving ? <><Loader2 size={12} className="animate-spin" /> Saving...</> : "Save Profile Changes"}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
