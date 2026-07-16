"use client";

import { useEffect, useState, useCallback } from "react";
import Navbar from "@/components/navigation/Navbar";
import { useCart } from "@/hooks/useCart";
import { useToast } from "@/hooks/useToast";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { SkeletonDashboard } from "@/components/ui/SkeletonLoader";
import { NotificationBell } from "@/components/ui/NotificationBell";
import { updateBookingStatusAction } from "@/lib/actions/bookings";
import { getCurrentUserAction, signOutAction } from "@/lib/actions/auth";
import {
  ShieldAlert, Coins, FileSpreadsheet, FileDown, RefreshCw, Search,
  Check, X, ArrowUpRight, Loader2, Camera, User, Clock, Key, AlertTriangle,
  History, Sparkles, Calendar, CheckSquare, Eye, Menu, Tag, Users,
  BarChart2, Settings, LogOut, Package, ChevronRight, Lock, ShieldCheck,
  TrendingUp, XCircle, CheckCircle,
} from "lucide-react";
import {
  ResponsiveContainer, LineChart, Line, BarChart, Bar,
  PieChart, Pie, Cell, XAxis, YAxis, Tooltip, CartesianGrid, AreaChart, Area,
} from "recharts";
import { animate, stagger } from "animejs";
import { db } from "@/lib/db/store";
import type { Booking, InventoryUnit } from "@/lib/db/store";
import { Logo } from "@/components/ui/Logo";
import { MOCK_COUPONS } from "@/lib/db/mockData";
import type { Coupon } from "@/lib/db/mockData";

/* ─── Constants ──────────────────────────────────────────────── */
const STATUS_STYLES: Record<string, string> = {
  pending_payment:  "bg-amber-500/10 border-amber-500/30 text-amber-400",
  paid:             "bg-blue-500/10 border-blue-500/30 text-blue-400",
  approval_pending: "bg-orange-500/10 border-orange-500/30 text-orange-400",
  approved:         "bg-teal-500/10 border-teal-500/30 text-teal-400",
  ready_for_pickup: "bg-emerald-500/10 border-emerald-500/30 text-emerald-400",
  rented:           "bg-indigo-500/10 border-indigo-500/30 text-indigo-400",
  returned:         "bg-purple-500/10 border-purple-500/30 text-purple-400",
  completed:        "bg-white/5 border-white/15 text-muted-gray",
  rejected:         "bg-red-500/10 border-red-500/30 text-red-400",
  cancelled:        "bg-red-500/10 border-red-500/30 text-red-400",
  payment_failed:   "bg-rose-500/10 border-rose-500/30 text-rose-400",
  overdue:          "bg-rose-600/20 border-rose-500/40 text-rose-400 animate-pulse",
  maintenance:      "bg-amber-600/15 border-amber-500/30 text-amber-400",
};

const CHART_COLORS = ["#D8B36A", "#B98A43", "#F5F1E8", "#9A9995", "#6B7280"];

type AdminTab =
  | "overview" | "approval_queue" | "pickups_today" | "returns_today"
  | "active_rentals" | "overdue" | "inventory" | "coupons" | "customers" | "audit_logs";

type BookingStatus = Booking["status"];

/* ─── Main Admin Component ──────────────────────────────────── */
export default function AdminDashboard() {
  const { cart } = useCart();
  const toast = useToast();

  const [adminProfile, setAdminProfile]       = useState<Record<string, unknown> | null>(null);
  const [adminRole, setAdminRole]             = useState<string>("customer");
  const [profileLoading, setProfileLoading]   = useState(true);
  const [bookings, setBookings]               = useState<Booking[]>([]);
  const [inventoryUnits, setInventoryUnits]   = useState<InventoryUnit[]>([]);
  const [loading, setLoading]                 = useState(true);
  const [activeTab, setActiveTab]             = useState<AdminTab>("overview");
  const [sidebarOpen, setSidebarOpen]         = useState(false);
  const [searchQuery, setSearchQuery]         = useState("");
  const [updatingId, setUpdatingId]           = useState<string | null>(null);

  // Coupon manager state
  const [coupons, setCoupons]   = useState<Coupon[]>([...MOCK_COUPONS]);
  const [newCoupon, setNewCoupon] = useState({ code: "", discountFlat: 199, activeUntil: "", usageLimit: 100, perUserLimit: 1 });
  const [addingCoupon, setAddingCoupon] = useState(false);

  // Reject reason modal
  const [rejectingId, setRejectingId]     = useState<string | null>(null);
  const [rejectReason, setRejectReason]   = useState("");

  // Return modal
  const [returningId, setReturningId]     = useState<string | null>(null);
  const [returnCondition, setReturnCondition] = useState<"good" | "damaged">("good");
  const [damageDesc, setDamageDesc]       = useState("");
  const [damageCost, setDamageCost]       = useState(0);
  const [returnRemarks, setReturnRemarks] = useState("");

  // OTP generation
  const [generatingOTP, setGeneratingOTP] = useState<string | null>(null);

  const isOwner   = adminRole === "admin";
  const isAllowed = adminRole === "admin" || adminRole === "staff";

  /* ─── Load data ──────────────────────────────────── */
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [bks, inv] = await Promise.all([
        db.getBookings(),
        db.getInventoryUnits(),
      ]);
      setBookings(bks);
      setInventoryUnits(inv);
    } catch {
      toast.error("Failed to load data.");
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
    const isSupabase = supabaseUrl.length > 0 && !supabaseUrl.includes("your-project-id");
    if (isSupabase) {
      getCurrentUserAction().then((p) => {
        setAdminProfile(p);
        setAdminRole(String(p?.role ?? "customer"));
        setProfileLoading(false);
      });
    } else {
      db.getProfile().then((p) => {
        setAdminProfile({ full_name: p.fullName, email: p.email, role: p.role } as Record<string, unknown>);
        setAdminRole(p.role);
        setProfileLoading(false);
      });
    }
    loadData();
  }, [loadData]);

  useEffect(() => {
    setTimeout(() => {
      animate(".admin-card", {
        opacity: [0, 1],
        translateY: [10, 0],
        delay: stagger(40),
        duration: 450,
        easing: "easeOutQuad",
      });
    }, 50);
  }, [activeTab]);

  /* ─── Derived stats ──────────────────────────────── */
  const today = new Date().toISOString().split("T")[0];
  const stats = {
    total:       bookings.length,
    pending:     bookings.filter((b) => b.status === "pending_payment").length,
    approvalQ:   bookings.filter((b) => b.status === "approval_pending").length,
    active:      bookings.filter((b) => b.status === "rented").length,
    completed:   bookings.filter((b) => ["completed", "returned"].includes(b.status)).length,
    cancelled:   bookings.filter((b) => ["cancelled", "rejected"].includes(b.status)).length,
    overdue:     bookings.filter((b) => b.status === "overdue" || (b.status === "rented" && new Date() > new Date(b.endDate))).length,
    pickupsToday: bookings.filter((b) => b.status === "ready_for_pickup" && b.startDate === today).length,
    returnsToday: bookings.filter((b) => b.status === "rented" && b.endDate === today).length,
    revenue:     bookings.filter((b) => b.paymentStatus === "paid" && !["cancelled","rejected"].includes(b.status))
                         .reduce((s, b) => s + b.totalPayable, 0),
    discounts:   bookings.reduce((s, b) => s + (b.discountAmount || 0), 0),
  };

  // 7-day revenue trend
  const revenueTrend = (() => {
    const map: Record<string, number> = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i);
      map[d.toLocaleDateString("en-US", { month: "short", day: "numeric" })] = 0;
    }
    bookings.filter((b) => b.paymentStatus === "paid").forEach((b) => {
      const key = new Date(b.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" });
      if (key in map) map[key] += b.totalPayable;
    });
    return Object.entries(map).map(([date, amount]) => ({ date, amount }));
  })();

  // Revenue by camera model
  const revenueByCamera = (() => {
    const map: Record<string, number> = {};
    bookings.filter((b) => b.paymentStatus === "paid").forEach((b) => {
      b.items.forEach((item) => {
        const unit = inventoryUnits.find((u) => u.id === item.inventoryUnitId);
        const name = unit?.name || (item.productId.includes("000000000001") ? "Canon Camera" : "Nikon Camera");
        map[name] = (map[name] || 0) + item.unitPrice * item.quantity;
      });
    });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  })();

  /* ─── Filtered bookings ──────────────────────────── */
  const getTabBookings = () => {
    let base = bookings;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      base = base.filter((b) =>
        b.referenceCode.toLowerCase().includes(q) ||
        b.contactName.toLowerCase().includes(q) ||
        b.contactPhone.includes(q) ||
        b.contactEmail?.toLowerCase().includes(q)
      );
    }
    switch (activeTab) {
      case "approval_queue":  return base.filter((b) => b.status === "approval_pending");
      case "pickups_today":   return base.filter((b) => b.status === "ready_for_pickup" && b.startDate <= today);
      case "returns_today":   return base.filter((b) => b.status === "rented" && b.endDate <= today);
      case "active_rentals":  return base.filter((b) => b.status === "rented");
      case "overdue":         return base.filter((b) => b.status === "overdue" || (b.status === "rented" && new Date() > new Date(b.endDate)));
      default: return base;
    }
  };

  /* ─── Actions ────────────────────────────────────── */
  const handleStatus = async (id: string, status: BookingStatus, note = "") => {
    setUpdatingId(id);
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
      const isSupabase = supabaseUrl.length > 0 && !supabaseUrl.includes("your-project-id");
      if (isSupabase) {
        await updateBookingStatusAction(id, status as any);
      } else {
        await db.updateBookingStatus(id, status, note, String(adminProfile?.full_name ?? "admin"));
        if (status === "approved") await db.assignAvailableUnit(id);
      }
      toast.success(`Booking ${status.replace(/_/g, " ")}.`);
      await loadData();
    } catch (err: any) {
      toast.error(err.message ?? "Failed to update status.");
    }
    setUpdatingId(null);
  };

  const handleApprove = (id: string) => handleStatus(id, "approved", "Booking approved by admin.");
  const handleReject  = async (id: string) => {
    await handleStatus(id, "rejected", rejectReason || "Rejected by admin.");
    setRejectingId(null); setRejectReason("");
  };

  const handleGenerateOTP = async (id: string) => {
    setGeneratingOTP(id);
    try {
      const booking = await db.acceptAgreement(id, "admin");
      if (booking?.pickupOTP) toast.success(`OTP generated: ${booking.pickupOTP}`);
      await loadData();
    } catch (err: any) {
      toast.error(err.message ?? "Failed to generate OTP.");
    }
    setGeneratingOTP(null);
  };

  const handleConfirmPickup = async (id: string) => {
    try {
      const otp = bookings.find((b) => b.id === id)?.pickupOTP ?? "000000";
      await db.confirmHandover(id, otp, "Admin confirmed handover.", true);
      toast.success("Rental started — camera marked as rented.");
      await loadData();
    } catch (err: any) {
      toast.error(err.message ?? "Failed to confirm pickup.");
    }
  };

  const handleReturn = async (id: string) => {
    setUpdatingId(id);
    try {
      await db.processReturn(id, returnCondition, damageDesc, damageCost, returnRemarks);
      toast.success("Return processed and booking completed.");
      setReturningId(null); setReturnCondition("good"); setDamageDesc(""); setDamageCost(0); setReturnRemarks("");
      await loadData();
    } catch (err: any) {
      toast.error(err.message ?? "Failed to process return.");
    }
    setUpdatingId(null);
  };

  const handleInventoryStatus = async (unitId: string, status: InventoryUnit["status"]) => {
    await db.updateInventoryUnitStatus(unitId, status);
    toast.success(`Camera ${status}.`);
    setInventoryUnits(await db.getInventoryUnits());
  };

  const handleToggleCoupon = (id: string) => {
    setCoupons((prev) => prev.map((c) => c.id === id ? { ...c, isActive: !c.isActive } : c));
    toast.success("Coupon status updated.");
  };

  const handleAddCoupon = () => {
    if (!newCoupon.code || !newCoupon.activeUntil) { toast.error("Code and expiry are required."); return; }
    const newC: Coupon = {
      id: `c_${Date.now()}`,
      code: newCoupon.code.toUpperCase(),
      discountPercent: 0,
      discountFlat: newCoupon.discountFlat,
      activeUntil: newCoupon.activeUntil,
      isActive: true,
      activationDate: new Date().toISOString().split("T")[0],
      usageLimit: newCoupon.usageLimit,
      perUserLimit: newCoupon.perUserLimit,
    };
    setCoupons((prev) => [...prev, newC]);
    setNewCoupon({ code: "", discountFlat: 199, activeUntil: "", usageLimit: 100, perUserLimit: 1 });
    setAddingCoupon(false);
    toast.success(`Coupon ${newC.code} created.`);
  };

  const handleLogout = async () => {
    await signOutAction();
    window.location.href = "/login";
  };

  /* ─── Nav items ──────────────────────────────────── */
  const navItems: { id: AdminTab; label: string; icon: React.ReactNode; badge?: number; ownerOnly?: boolean }[] = [
    { id: "overview",       label: "Overview",         icon: <BarChart2 size={14} /> },
    { id: "approval_queue", label: "Approval Queue",   icon: <CheckSquare size={14} />, badge: stats.approvalQ },
    { id: "pickups_today",  label: "Pickups Today",    icon: <Calendar size={14} />,    badge: stats.pickupsToday },
    { id: "returns_today",  label: "Returns Today",    icon: <Clock size={14} />,       badge: stats.returnsToday },
    { id: "active_rentals", label: "Active Rentals",   icon: <Camera size={14} />,      badge: stats.active },
    { id: "overdue",        label: "Overdue Alerts",   icon: <AlertTriangle size={14} />, badge: stats.overdue },
    { id: "inventory",      label: "Camera Inventory", icon: <Package size={14} /> },
    { id: "coupons",        label: "Coupon Manager",   icon: <Tag size={14} />,         ownerOnly: true },
    { id: "customers",      label: "Customers",        icon: <Users size={14} /> },
    { id: "audit_logs",     label: "Audit Logs",       icon: <History size={14} /> },
  ];

  /* ─── Render ─────────────────────────────────────── */
  return (
    <AuthGuard requiredRole="admin">
      <div className="min-h-screen bg-obsidian text-ivory">
        <Navbar cartItemCount={cart.length} />

        {/* Access denied for non-admin/staff */}
        {!profileLoading && !isAllowed && (
          <div className="flex-1 flex flex-col items-center justify-center min-h-screen gap-4 text-center px-6 pt-32">
            <div className="w-16 h-16 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center">
              <Lock size={24} className="text-rose-400" />
            </div>
            <h2 className="serif-heading text-2xl font-light text-ivory">Access Restricted</h2>
            <p className="text-sm text-muted-gray max-w-sm">You do not have permission to access the admin panel. Contact the system administrator.</p>
            <a href="/dashboard" className="px-5 py-2.5 bg-gold-champagne text-obsidian text-xs font-bold uppercase tracking-wider rounded-lg mt-2">Go to Dashboard</a>
          </div>
        )}

        {isAllowed && (
          <>
            {/* Mobile sidebar backdrop */}
            {sidebarOpen && (
              <div className="fixed inset-0 bg-black/70 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
            )}

            <div className="max-w-screen-2xl mx-auto px-4 md:px-8 pt-28 pb-16 flex gap-6">

              {/* Sidebar */}
              <aside className={`fixed lg:relative top-0 left-0 h-full lg:h-auto z-50 lg:z-auto w-60 bg-obsidian lg:bg-transparent border-r border-white/5 lg:border-none pt-20 lg:pt-0 px-3 lg:px-0 transition-transform duration-300 ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"} shrink-0`}>
                <div className="glass-panel border-white/5 rounded-xl p-3 space-y-0.5 sticky top-28">
                  {/* Brand Wordmark */}
                  <div className="px-2 pt-1 pb-3 border-b border-white/5 mb-2 flex justify-center">
                    <Logo variant="wordmark" theme="light" width={110} height={28} />
                  </div>
                  {/* Profile mini */}
                  <div className="px-2 py-3 border-b border-white/5 mb-2">
                    <div className="flex items-center gap-2">
                      <div className="shrink-0">
                        <Logo variant="monogram" theme="light" width={28} height={28} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[11px] font-semibold text-ivory truncate">{String(adminProfile?.full_name ?? "Admin")}</p>
                        <div className="flex items-center gap-1">
                          <ShieldCheck size={9} className="text-gold-champagne" />
                          <span className="text-[9px] text-gold-champagne font-mono uppercase">{isOwner ? "Owner" : "Technical Manager"}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {navItems.filter((n) => !n.ownerOnly || isOwner).map((item) => (
                    <button
                      key={item.id}
                      onClick={() => { setActiveTab(item.id); setSidebarOpen(false); }}
                      className={`w-full flex items-center justify-between gap-2 px-2.5 py-2 rounded-lg text-[11px] transition cursor-pointer ${activeTab === item.id ? "bg-gold-champagne/10 text-gold-champagne border border-gold-border/30" : "text-muted-gray hover:text-ivory hover:bg-white/5"}`}
                    >
                      <span className="flex items-center gap-2">{item.icon}{item.label}</span>
                      {item.badge !== undefined && item.badge > 0 && (
                        <span className={`text-[8px] font-mono px-1.5 py-0.5 rounded-full ${item.id === "overdue" ? "bg-rose-500/20 text-rose-400" : "bg-gold-champagne/20 text-gold-champagne"}`}>{item.badge}</span>
                      )}
                    </button>
                  ))}

                  <div className="pt-2 mt-2 border-t border-white/5">
                    <button onClick={handleLogout} className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-[11px] text-rose-400/60 hover:text-rose-400 hover:bg-rose-500/5 transition cursor-pointer">
                      <LogOut size={13} /> Sign Out
                    </button>
                  </div>
                </div>
              </aside>

              {/* Main */}
              <main className="flex-1 min-w-0">
                {/* Top bar */}
                <div className="flex items-center justify-between mb-6 gap-3">
                  <div className="flex items-center gap-3">
                    <button onClick={() => setSidebarOpen(true)} className="p-2 border border-white/10 rounded-lg text-muted-gray lg:hidden cursor-pointer">
                      <Menu size={15} />
                    </button>
                    <div>
                      <span className="text-[8px] text-gold-champagne uppercase font-mono tracking-widest hidden lg:block">AUREVIA Operations</span>
                      <h1 className="serif-heading text-xl font-light text-ivory">
                        {navItems.find((n) => n.id === activeTab)?.label ?? "Admin"}
                      </h1>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {activeTab !== "overview" && activeTab !== "inventory" && activeTab !== "coupons" && activeTab !== "customers" && activeTab !== "audit_logs" && (
                      <div className="relative hidden sm:block">
                        <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-gray pointer-events-none" />
                        <input
                          type="text"
                          placeholder="Search bookings..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="bg-white/5 border border-white/10 text-[11px] rounded-lg pl-7 pr-3 py-2 focus:outline-none focus:border-gold-champagne/40 w-44 transition"
                        />
                      </div>
                    )}
                    <button onClick={loadData} disabled={loading} className="p-2 border border-white/10 rounded-lg text-muted-gray hover:text-ivory transition cursor-pointer disabled:opacity-40">
                      <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
                    </button>
                    <NotificationBell
                      alerts={[]}
                      unreadCount={stats.approvalQ}
                      onMarkAllRead={() => {}}
                      onDismiss={() => {}}
                    />
                  </div>
                </div>

                {loading && activeTab === "overview" ? (
                  <SkeletonDashboard />
                ) : (
                  <>
                    {/* ── OVERVIEW ── */}
                    {activeTab === "overview" && (
                      <div className="space-y-5">
                        {/* Stats cards */}
                        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
                          {[
                            { label: "Revenue",   value: `₹${stats.revenue.toLocaleString("en-IN")}`, icon: <Coins size={13} />,       color: "text-gold-champagne", gold: true },
                            { label: "Total",     value: stats.total,    icon: <FileSpreadsheet size={13} />, color: "text-ivory" },
                            { label: "Pending",   value: stats.approvalQ,icon: <Clock size={13} />,           color: "text-orange-400" },
                            { label: "Active",    value: stats.active,   icon: <Camera size={13} />,          color: "text-indigo-400" },
                            { label: "Completed", value: stats.completed,icon: <CheckCircle size={13} />,     color: "text-emerald-400" },
                            { label: "Overdue",   value: stats.overdue,  icon: <AlertTriangle size={13} />,   color: "text-rose-400" },
                          ].map((s) => (
                            <div key={s.label} className={`admin-card opacity-0 glass-panel rounded-xl p-4 space-y-2 ${s.gold ? "border-gold-border/30" : "border-white/5"}`}>
                              <div className={`flex items-center gap-1.5 text-[8px] uppercase font-mono tracking-wider ${s.color}`}>{s.icon} {s.label}</div>
                              <p className={`text-xl font-light serif-heading ${s.color}`}>{s.value}</p>
                            </div>
                          ))}
                        </div>

                        {/* Charts row */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                          {/* Revenue trend */}
                          <div className="admin-card opacity-0 glass-panel border-white/5 rounded-xl p-5 lg:col-span-2">
                            <p className="text-[9px] uppercase font-mono tracking-widest text-muted-gray mb-4">7-Day Revenue Trend</p>
                            <ResponsiveContainer width="100%" height={160}>
                              <AreaChart data={revenueTrend} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
                                <defs>
                                  <linearGradient id="goldGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#D8B36A" stopOpacity={0.2} />
                                    <stop offset="95%" stopColor="#D8B36A" stopOpacity={0} />
                                  </linearGradient>
                                </defs>
                                <XAxis dataKey="date" tick={{ fill: "#6B7280", fontSize: 9 }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fill: "#6B7280", fontSize: 9 }} axisLine={false} tickLine={false} />
                                <Tooltip contentStyle={{ background: "#111", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, fontSize: 11 }} />
                                <Area type="monotone" dataKey="amount" stroke="#D8B36A" strokeWidth={2} fill="url(#goldGrad)" />
                              </AreaChart>
                            </ResponsiveContainer>
                          </div>

                          {/* Revenue by camera */}
                          <div className="admin-card opacity-0 glass-panel border-white/5 rounded-xl p-5">
                            <p className="text-[9px] uppercase font-mono tracking-widest text-muted-gray mb-4">Revenue by Camera</p>
                            {revenueByCamera.length === 0 ? (
                              <div className="h-40 flex items-center justify-center text-xs text-muted-gray/40">No data yet</div>
                            ) : (
                              <ResponsiveContainer width="100%" height={160}>
                                <PieChart>
                                  <Pie data={revenueByCamera} cx="50%" cy="50%" innerRadius={40} outerRadius={65} dataKey="value" paddingAngle={3}>
                                    {revenueByCamera.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                                  </Pie>
                                  <Tooltip contentStyle={{ background: "#111", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, fontSize: 11 }} />
                                </PieChart>
                              </ResponsiveContainer>
                            )}
                          </div>
                        </div>

                        {/* Camera availability */}
                        <div className="admin-card opacity-0 glass-panel border-white/5 rounded-xl p-5">
                          <p className="text-[9px] uppercase font-mono tracking-widest text-muted-gray mb-4">Camera Fleet Status</p>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            {inventoryUnits.map((unit) => (
                              <div key={unit.id} className={`border rounded-xl p-4 space-y-2.5 transition ${unit.status === "available" ? "border-emerald-500/20 bg-emerald-500/5" : unit.status === "rented" ? "border-indigo-500/20 bg-indigo-500/5" : unit.status === "maintenance" ? "border-amber-500/20 bg-amber-500/5" : "border-white/10 bg-white/3"}`}>
                                <div className="flex items-center justify-between">
                                  <p className="text-xs font-semibold text-ivory">{unit.name}</p>
                                  <span className={`text-[8px] font-mono uppercase px-2 py-0.5 rounded-full border ${STATUS_STYLES[unit.status === "decommissioned" ? "cancelled" : unit.status === "available" ? "approved" : unit.status] ?? ""}`}>
                                    {unit.status}
                                  </span>
                                </div>
                                <p className="text-[10px] text-muted-gray font-mono">{unit.serialNumber}</p>
                                <p className="text-[9px] text-muted-gray/60">Condition: {unit.condition}</p>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Today's schedule */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {[
                            { label: "Today's Pickups", items: bookings.filter((b) => b.status === "ready_for_pickup" && b.startDate <= today), color: "text-emerald-400" },
                            { label: "Today's Returns", items: bookings.filter((b) => b.status === "rented" && b.endDate <= today),           color: "text-purple-400" },
                          ].map(({ label, items, color }) => (
                            <div key={label} className="admin-card opacity-0 glass-panel border-white/5 rounded-xl p-5">
                              <p className={`text-[9px] uppercase font-mono tracking-widest mb-4 ${color}`}>{label}</p>
                              {items.length === 0 ? (
                                <p className="text-xs text-muted-gray/40 text-center py-4">None scheduled</p>
                              ) : (
                                <div className="space-y-2">
                                  {items.map((b) => (
                                    <div key={b.id} className="flex items-center justify-between p-2.5 bg-white/3 rounded-lg">
                                      <div>
                                        <p className="text-[11px] font-semibold text-ivory">{b.contactName}</p>
                                        <p className="text-[9px] text-muted-gray font-mono">{b.referenceCode}</p>
                                      </div>
                                      <span className={`text-[8px] font-mono px-2 py-0.5 rounded border ${STATUS_STYLES[b.status] ?? ""}`}>
                                        {b.status.replace(/_/g, " ")}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* ── BOOKING TABS (approval queue, pickups, returns, active, overdue) ── */}
                    {["approval_queue","pickups_today","returns_today","active_rentals","overdue"].includes(activeTab) && (
                      <div className="space-y-3">
                        {getTabBookings().length === 0 ? (
                          <div className="glass-panel border-white/5 rounded-xl p-12 text-center">
                            <Camera size={28} className="text-muted-gray/30 mx-auto mb-3" />
                            <p className="text-sm text-muted-gray">No bookings in this category.</p>
                          </div>
                        ) : getTabBookings().map((b) => (
                          <div key={b.id} className="admin-card opacity-0 glass-panel border-white/5 hover:border-white/10 rounded-xl p-5 space-y-3 transition">
                            {/* Header row */}
                            <div className="flex flex-wrap items-start justify-between gap-3">
                              <div>
                                <p className="text-xs font-mono font-semibold text-ivory">{b.referenceCode}</p>
                                <p className="text-[11px] font-semibold text-ivory mt-0.5">{b.contactName}</p>
                                <p className="text-[10px] text-muted-gray">{b.contactPhone} · {b.contactEmail}</p>
                              </div>
                              <span className={`px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider rounded-lg border ${STATUS_STYLES[b.status] ?? ""}`}>
                                {b.status.replace(/_/g, " ")}
                              </span>
                            </div>

                            {/* Details row */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px]">
                              <div className="bg-white/3 rounded-lg p-2.5">
                                <p className="text-muted-gray/60 uppercase font-mono text-[8px] mb-0.5">Dates</p>
                                <p className="text-ivory font-mono">{b.startDate} → {b.endDate}</p>
                              </div>
                              <div className="bg-white/3 rounded-lg p-2.5">
                                <p className="text-muted-gray/60 uppercase font-mono text-[8px] mb-0.5">Total</p>
                                <p className="text-gold-champagne font-semibold">₹{b.totalPayable.toLocaleString("en-IN")}</p>
                              </div>
                              <div className="bg-white/3 rounded-lg p-2.5">
                                <p className="text-muted-gray/60 uppercase font-mono text-[8px] mb-0.5">Payment</p>
                                <p className={b.paymentStatus === "paid" ? "text-emerald-400" : "text-amber-400"}>{b.paymentStatus.toUpperCase()}</p>
                              </div>
                              <div className="bg-white/3 rounded-lg p-2.5">
                                <p className="text-muted-gray/60 uppercase font-mono text-[8px] mb-0.5">Coupon</p>
                                <p className="text-ivory">{b.couponApplied || "—"}</p>
                              </div>
                            </div>

                            {/* OTP display if ready */}
                            {b.pickupOTP && b.status === "ready_for_pickup" && (
                              <div className="flex items-center gap-2 bg-emerald-500/8 border border-emerald-500/20 rounded-lg p-3">
                                <Key size={13} className="text-emerald-400 shrink-0" />
                                <span className="text-[10px] text-emerald-400/70 font-mono">Pickup OTP:</span>
                                <span className="text-lg font-mono font-bold tracking-[0.3em] text-emerald-400">{b.pickupOTP}</span>
                              </div>
                            )}

                            {/* Emergency contact */}
                            {b.emergencyContact && (
                              <p className="text-[9px] text-muted-gray/50 font-mono">Emergency: {b.emergencyContact}</p>
                            )}

                            {/* Actions */}
                            <div className="flex flex-wrap gap-2 pt-1">
                              {updatingId === b.id ? (
                                <Loader2 size={14} className="animate-spin text-gold-champagne" />
                              ) : (
                                <>
                                  {/* Approval queue actions */}
                                  {b.status === "approval_pending" && (
                                    <>
                                      <button onClick={() => handleApprove(b.id)} className="flex items-center gap-1.5 px-3 py-1.5 bg-teal-500/15 border border-teal-500/30 text-teal-400 hover:bg-teal-500/25 text-[10px] font-mono uppercase tracking-wider rounded-lg transition cursor-pointer">
                                        <Check size={11} /> Approve
                                      </button>
                                      <button onClick={() => setRejectingId(b.id)} className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500/20 text-[10px] font-mono uppercase tracking-wider rounded-lg transition cursor-pointer">
                                        <X size={11} /> Reject
                                      </button>
                                    </>
                                  )}
                                  {/* Approved: generate OTP */}
                                  {b.status === "approved" && !b.pickupOTP && (
                                    <button onClick={() => handleGenerateOTP(b.id)} disabled={generatingOTP === b.id} className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 text-[10px] font-mono uppercase tracking-wider rounded-lg transition cursor-pointer disabled:opacity-50">
                                      {generatingOTP === b.id ? <Loader2 size={11} className="animate-spin" /> : <Key size={11} />} Generate OTP
                                    </button>
                                  )}
                                  {/* Ready for pickup: confirm pickup */}
                                  {b.status === "ready_for_pickup" && (
                                    <button onClick={() => handleConfirmPickup(b.id)} className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 hover:bg-indigo-500/20 text-[10px] font-mono uppercase tracking-wider rounded-lg transition cursor-pointer">
                                      <Camera size={11} /> Mark Rented
                                    </button>
                                  )}
                                  {/* Active/overdue: process return */}
                                  {(b.status === "rented" || b.status === "overdue") && (
                                    <button onClick={() => setReturningId(b.id)} className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-500/10 border border-purple-500/20 text-purple-400 hover:bg-purple-500/20 text-[10px] font-mono uppercase tracking-wider rounded-lg transition cursor-pointer">
                                      <ArrowUpRight size={11} /> Process Return
                                    </button>
                                  )}
                                  {/* Mark overdue */}
                                  {b.status === "rented" && new Date() > new Date(b.endDate) && (
                                    <button onClick={() => handleStatus(b.id, "overdue", "Marked overdue — return date passed.")} className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500/20 text-[10px] font-mono uppercase tracking-wider rounded-lg transition cursor-pointer">
                                      <AlertTriangle size={11} /> Mark Overdue
                                    </button>
                                  )}
                                </>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* ── INVENTORY ── */}
                    {activeTab === "inventory" && (
                      <div className="space-y-4">
                        {inventoryUnits.map((unit) => (
                          <div key={unit.id} className={`admin-card opacity-0 glass-panel rounded-xl p-5 border transition ${unit.status === "maintenance" ? "border-amber-500/20" : "border-white/5"}`}>
                            <div className="flex flex-wrap items-start justify-between gap-3">
                              <div>
                                <h3 className="text-sm font-semibold text-ivory">{unit.name}</h3>
                                <p className="text-[10px] text-muted-gray font-mono">{unit.serialNumber}</p>
                                <p className="text-[9px] text-muted-gray/60 mt-0.5">Condition: <span className="capitalize">{unit.condition}</span></p>
                                {unit.notes && <p className="text-[10px] text-amber-400/70 mt-1">{unit.notes}</p>}
                              </div>
                              <span className={`px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider rounded-lg border ${STATUS_STYLES[unit.status === "available" ? "approved" : unit.status === "rented" ? "rented" : unit.status === "maintenance" ? "maintenance" : "cancelled"] ?? ""}`}>
                                {unit.status}
                              </span>
                            </div>
                            <div className="flex flex-wrap gap-2 mt-4">
                              {unit.status !== "available" && (
                                <button onClick={() => handleInventoryStatus(unit.id, "available")} className="flex items-center gap-1.5 px-3 py-1.5 bg-teal-500/10 border border-teal-500/20 text-teal-400 hover:bg-teal-500/20 text-[10px] font-mono uppercase rounded-lg transition cursor-pointer">
                                  <CheckCircle size={11} /> Mark Available
                                </button>
                              )}
                              {unit.status !== "maintenance" && (
                                <button onClick={() => handleInventoryStatus(unit.id, "maintenance")} className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/10 border border-amber-500/20 text-amber-400 hover:bg-amber-500/20 text-[10px] font-mono uppercase rounded-lg transition cursor-pointer">
                                  <AlertTriangle size={11} /> Send to Maintenance
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* ── COUPON MANAGER (owner only) ── */}
                    {activeTab === "coupons" && isOwner && (
                      <div className="space-y-4">
                        {coupons.map((c) => (
                          <div key={c.id} className={`admin-card opacity-0 glass-panel rounded-xl p-5 border transition ${c.isActive ? "border-white/5" : "border-white/3 opacity-60"}`}>
                            <div className="flex flex-wrap items-start justify-between gap-3">
                              <div>
                                <p className="text-sm font-mono font-bold text-ivory">{c.code}</p>
                                <p className="text-[10px] text-muted-gray mt-0.5">
                                  {c.discountFlat ? `₹${c.discountFlat} flat` : `${c.discountPercent}% off`}
                                  {c.usageLimit ? ` · Max ${c.usageLimit} uses` : ""}
                                  {c.perUserLimit ? ` · ${c.perUserLimit}/user` : ""}
                                </p>
                                <p className="text-[9px] text-muted-gray/60 font-mono mt-0.5">Valid until {c.activeUntil}</p>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className={`text-[8px] font-mono uppercase px-2 py-0.5 rounded-full border ${c.isActive ? "border-emerald-500/30 text-emerald-400 bg-emerald-500/10" : "border-white/10 text-muted-gray/50"}`}>
                                  {c.isActive ? "Active" : "Inactive"}
                                </span>
                                <button onClick={() => handleToggleCoupon(c.id)} className="px-3 py-1.5 border border-white/10 text-muted-gray hover:text-ivory text-[10px] font-mono uppercase rounded-lg transition cursor-pointer">
                                  {c.isActive ? "Disable" : "Enable"}
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}

                        {/* Add coupon */}
                        {addingCoupon ? (
                          <div className="glass-panel border-gold-border/20 rounded-xl p-5 space-y-4">
                            <p className="text-[9px] uppercase font-mono tracking-widest text-gold-champagne">New Coupon</p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              {[
                                { label: "Coupon Code", key: "code",         type: "text",   ph: "e.g. SUMMER2026" },
                                { label: "Flat Discount (₹)", key: "discountFlat", type: "number", ph: "199" },
                                { label: "Expiry Date",  key: "activeUntil", type: "date",   ph: "" },
                                { label: "Usage Limit",  key: "usageLimit",  type: "number", ph: "100" },
                                { label: "Per-User Limit", key: "perUserLimit", type: "number", ph: "1" },
                              ].map(({ label, key, type, ph }) => (
                                <div key={key} className="space-y-1.5">
                                  <label className="text-[9px] uppercase font-mono tracking-wider text-muted-gray block">{label}</label>
                                  <input
                                    type={type} placeholder={ph}
                                    value={(newCoupon as any)[key]}
                                    onChange={(e) => setNewCoupon((prev) => ({ ...prev, [key]: type === "number" ? Number(e.target.value) : e.target.value }))}
                                    className="w-full bg-white/5 border border-white/10 text-xs rounded-lg p-2.5 focus:outline-none focus:border-gold-champagne/50 transition"
                                  />
                                </div>
                              ))}
                            </div>
                            <div className="flex gap-2">
                              <button onClick={handleAddCoupon} className="px-4 py-2 bg-gold-champagne text-obsidian text-xs font-bold uppercase tracking-wider rounded-lg cursor-pointer">Create</button>
                              <button onClick={() => setAddingCoupon(false)} className="px-4 py-2 border border-white/10 text-muted-gray text-xs font-mono uppercase rounded-lg cursor-pointer hover:text-ivory transition">Cancel</button>
                            </div>
                          </div>
                        ) : (
                          <button onClick={() => setAddingCoupon(true)} className="w-full border border-dashed border-white/15 text-muted-gray hover:text-ivory hover:border-gold-border/30 text-xs py-3 rounded-xl transition cursor-pointer">
                            + Add New Coupon
                          </button>
                        )}
                      </div>
                    )}

                    {/* ── CUSTOMERS ── */}
                    {activeTab === "customers" && (
                      <div className="space-y-3">
                        {(() => {
                          const customerMap: Record<string, { name: string; phone: string; email: string; count: number; total: number }> = {};
                          bookings.forEach((b) => {
                            const key = b.contactEmail || b.contactPhone;
                            if (!customerMap[key]) {
                              customerMap[key] = { name: b.contactName, phone: b.contactPhone, email: b.contactEmail, count: 0, total: 0 };
                            }
                            customerMap[key].count++;
                            customerMap[key].total += b.totalPayable;
                          });
                          return Object.entries(customerMap).map(([key, cust]) => (
                            <div key={key} className="admin-card opacity-0 glass-panel border-white/5 rounded-xl p-4 flex flex-wrap items-center justify-between gap-3">
                              <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                                  <User size={14} className="text-muted-gray" />
                                </div>
                                <div>
                                  <p className="text-xs font-semibold text-ivory">{cust.name}</p>
                                  <p className="text-[10px] text-muted-gray">{cust.email} · {cust.phone}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-4 text-right">
                                <div>
                                  <p className="text-[8px] uppercase font-mono text-muted-gray/60">Bookings</p>
                                  <p className="text-sm font-semibold text-ivory">{cust.count}</p>
                                </div>
                                <div>
                                  <p className="text-[8px] uppercase font-mono text-muted-gray/60">Total Spent</p>
                                  <p className="text-sm font-semibold text-gold-champagne">₹{cust.total.toLocaleString("en-IN")}</p>
                                </div>
                              </div>
                            </div>
                          ));
                        })()}
                        {bookings.length === 0 && (
                          <div className="glass-panel border-white/5 rounded-xl p-12 text-center">
                            <Users size={28} className="text-muted-gray/30 mx-auto mb-3" />
                            <p className="text-sm text-muted-gray">No customers yet.</p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* ── AUDIT LOGS ── */}
                    {activeTab === "audit_logs" && (
                      <div className="glass-panel border-white/5 rounded-xl overflow-hidden">
                        <div className="overflow-x-auto">
                          <table className="w-full text-[10px] font-mono">
                            <thead>
                              <tr className="border-b border-white/5">
                                <th className="py-3 px-4 text-left text-muted-gray/60 uppercase tracking-wider">Booking</th>
                                <th className="py-3 px-4 text-left text-muted-gray/60 uppercase tracking-wider">Action</th>
                                <th className="py-3 px-4 text-left text-muted-gray/60 uppercase tracking-wider hidden sm:table-cell">Performed By</th>
                                <th className="py-3 px-4 text-left text-muted-gray/60 uppercase tracking-wider hidden md:table-cell">Details</th>
                                <th className="py-3 px-4 text-left text-muted-gray/60 uppercase tracking-wider">Timestamp</th>
                              </tr>
                            </thead>
                            <tbody>
                              {bookings.flatMap((b) =>
                                (b.auditLogs || []).map((log, i) => (
                                  <tr key={`${b.id}-${i}`} className="border-b border-white/5 hover:bg-white/2 transition">
                                    <td className="py-2.5 px-4 text-gold-champagne/70">{b.referenceCode}</td>
                                    <td className="py-2.5 px-4 text-ivory">{log.action.replace(/_/g, " ")}</td>
                                    <td className="py-2.5 px-4 text-muted-gray hidden sm:table-cell">{log.performedBy}</td>
                                    <td className="py-2.5 px-4 text-muted-gray/60 hidden md:table-cell max-w-xs truncate">{log.details}</td>
                                    <td className="py-2.5 px-4 text-muted-gray/50">{new Date(log.timestamp).toLocaleString("en-IN")}</td>
                                  </tr>
                                ))
                              )}
                              {bookings.flatMap((b) => b.auditLogs || []).length === 0 && (
                                <tr>
                                  <td colSpan={5} className="py-12 text-center text-muted-gray/40">No audit logs yet.</td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </main>
            </div>

            {/* ── Reject Reason Modal ── */}
            {rejectingId && (
              <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center px-6" onClick={() => setRejectingId(null)}>
                <div className="glass-panel border-rose-500/20 rounded-2xl p-6 max-w-sm w-full space-y-4" onClick={(e) => e.stopPropagation()}>
                  <h3 className="text-sm font-semibold text-ivory">Reject Booking</h3>
                  <p className="text-[11px] text-muted-gray">Provide a reason for rejection (optional).</p>
                  <textarea
                    rows={3} value={rejectReason} onChange={(e) => setRejectReason(e.target.value)}
                    placeholder="E.g. Camera unavailable on requested dates."
                    className="w-full bg-white/5 border border-white/10 text-xs rounded-lg p-3 focus:outline-none focus:border-rose-500/40 resize-none transition"
                  />
                  <div className="flex gap-2">
                    <button onClick={() => rejectingId && handleReject(rejectingId)} className="px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold uppercase rounded-lg transition cursor-pointer">Confirm Reject</button>
                    <button onClick={() => { setRejectingId(null); setRejectReason(""); }} className="px-4 py-2 border border-white/10 text-muted-gray text-xs font-mono rounded-lg cursor-pointer hover:text-ivory transition">Cancel</button>
                  </div>
                </div>
              </div>
            )}

            {/* ── Return Processing Modal ── */}
            {returningId && (
              <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center px-6" onClick={() => setReturningId(null)}>
                <div className="glass-panel border-purple-500/20 rounded-2xl p-6 max-w-sm w-full space-y-4" onClick={(e) => e.stopPropagation()}>
                  <h3 className="text-sm font-semibold text-ivory">Process Return</h3>
                  <div className="space-y-1.5">
                    <label className="text-[9px] uppercase font-mono tracking-wider text-muted-gray block">Camera Condition</label>
                    <div className="flex gap-2">
                      {(["good","damaged"] as const).map((c) => (
                        <button key={c} onClick={() => setReturnCondition(c)} className={`flex-1 py-2 border text-[10px] font-mono uppercase rounded-lg transition cursor-pointer ${returnCondition === c ? (c === "good" ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-400" : "border-rose-500/50 bg-rose-500/10 text-rose-400") : "border-white/10 text-muted-gray"}`}>{c}</button>
                      ))}
                    </div>
                  </div>
                  {returnCondition === "damaged" && (
                    <>
                      <div className="space-y-1.5">
                        <label className="text-[9px] uppercase font-mono tracking-wider text-muted-gray block">Damage Description</label>
                        <textarea rows={2} value={damageDesc} onChange={(e) => setDamageDesc(e.target.value)} className="w-full bg-white/5 border border-white/10 text-xs rounded-lg p-2.5 focus:outline-none focus:border-rose-500/30 resize-none transition" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[9px] uppercase font-mono tracking-wider text-muted-gray block">Damage Cost (₹)</label>
                        <input type="number" value={damageCost} onChange={(e) => setDamageCost(Number(e.target.value))} className="w-full bg-white/5 border border-white/10 text-xs rounded-lg p-2.5 focus:outline-none focus:border-rose-500/30 transition" />
                      </div>
                    </>
                  )}
                  <div className="space-y-1.5">
                    <label className="text-[9px] uppercase font-mono tracking-wider text-muted-gray block">Return Remarks</label>
                    <textarea rows={2} value={returnRemarks} onChange={(e) => setReturnRemarks(e.target.value)} placeholder="Optional notes..." className="w-full bg-white/5 border border-white/10 text-xs rounded-lg p-2.5 focus:outline-none focus:border-gold-champagne/30 resize-none transition" />
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => returningId && handleReturn(returningId)} disabled={updatingId !== null} className="px-4 py-2 bg-purple-500/70 hover:bg-purple-500 text-white text-xs font-bold uppercase rounded-lg transition cursor-pointer disabled:opacity-50">
                      {updatingId ? <Loader2 size={13} className="animate-spin" /> : "Complete Return"}
                    </button>
                    <button onClick={() => setReturningId(null)} className="px-4 py-2 border border-white/10 text-muted-gray text-xs font-mono rounded-lg cursor-pointer hover:text-ivory transition">Cancel</button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </AuthGuard>
  );
}
