"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import Navbar from "@/components/navigation/Navbar";
import { useCart } from "@/hooks/useCart";
import { useToast } from "@/hooks/useToast";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { SkeletonDashboard } from "@/components/ui/SkeletonLoader";
import { cancelBookingAction } from "@/lib/actions/bookings";
import { updateProfileAction, getCurrentUserAction, changePasswordAction, signOutAction } from "@/lib/actions/auth";
import {
  User, ShoppingBag, Settings, Camera, Calendar, Clock, CheckCircle,
  XCircle, Loader2, ShieldCheck, FileText, Download, Key, LogOut,
  ChevronRight, AlertTriangle, Menu, X, RefreshCw, Lock, Eye, EyeOff,
  Phone, Mail, MapPin, MessageCircle, TrendingUp, Tag, CreditCard, Star,
} from "lucide-react";
import { animate, stagger } from "animejs";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { db } from "@/lib/db/store";
import { Logo } from "@/components/ui/Logo";
import { MOCK_PRODUCTS } from "@/lib/db/mockData";

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

const TIMELINE_STEPS = [
  { key: "pending_payment",  label: "Pending\nPayment" },
  { key: "paid",             label: "Paid" },
  { key: "approval_pending", label: "Approval\nPending" },
  { key: "approved",         label: "Approved" },
  { key: "ready_for_pickup", label: "Ready for\nPickup" },
  { key: "rented",           label: "Rented" },
  { key: "completed",        label: "Completed" },
];

const STEP_ORDER = TIMELINE_STEPS.map((s) => s.key);

type DashTab = "overview" | "bookings" | "settings";
type BookingFilter = "all" | "upcoming" | "active" | "completed" | "cancelled";

/* ─── Booking filter helper ──────────────────────────────────── */
function filterBookings(bookings: any[], filter: BookingFilter) {
  if (filter === "all") return bookings;
  if (filter === "upcoming") return bookings.filter((b) => ["pending_payment","paid","approval_pending","approved","ready_for_pickup"].includes(b.status));
  if (filter === "active")   return bookings.filter((b) => ["rented","overdue"].includes(b.status));
  if (filter === "completed") return bookings.filter((b) => ["completed","returned"].includes(b.status));
  if (filter === "cancelled") return bookings.filter((b) => ["cancelled","rejected","payment_failed"].includes(b.status));
  return bookings;
}

function canCancel(status: string) {
  return ["pending_payment", "paid", "approval_pending"].includes(status);
}

/* ─── Print invoice helper ───────────────────────────────────── */
function printInvoice(booking: any, profile: any) {
  const w = window.open("", "_blank");
  if (!w) return;
  w.document.write(`
    <html><head><title>AUREVIA Invoice ${booking.referenceCode || booking.reference_code}</title>
    <style>
      body { font-family: 'Georgia', serif; background: #fff; color: #111; padding: 40px; max-width: 680px; margin: auto; }
      h1 { font-size: 28px; letter-spacing: 6px; color: #B98A43; margin-bottom: 4px; }
      .sub { font-size: 11px; letter-spacing: 2px; color: #666; text-transform: uppercase; }
      table { width: 100%; border-collapse: collapse; margin-top: 24px; }
      th { text-align: left; border-bottom: 1px solid #ddd; padding: 8px 4px; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #888; }
      td { padding: 8px 4px; font-size: 13px; border-bottom: 1px solid #f0f0f0; }
      .total-row td { font-weight: bold; font-size: 16px; border-top: 2px solid #B98A43; color: #B98A43; }
      .meta { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin: 24px 0; font-size: 12px; }
      .meta-item label { display: block; font-size: 10px; text-transform: uppercase; letter-spacing: 1px; color: #888; margin-bottom: 2px; }
      .footer { margin-top: 40px; font-size: 11px; color: #aaa; border-top: 1px solid #eee; padding-top: 16px; }
    </style></head><body>
    <div style="display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #B98A43; padding-bottom: 12px; margin-bottom: 16px;">
      <div>
        <img src="${window.location.origin}/readme/aurevia-logo.png" alt="AUREVIA" style="height: 40px; filter: invert(1) brightness(0.2); object-fit: contain;" />
        <div class="sub" style="margin-top: 4px;">Premium Camera Rentals · Invoice</div>
      </div>
    </div>
    <div class="meta">
      <div class="meta-item"><label>Invoice No.</label>${booking.referenceCode || booking.reference_code}</div>
      <div class="meta-item"><label>Date</label>${new Date(booking.createdAt || booking.created_at).toLocaleDateString("en-IN")}</div>
      <div class="meta-item"><label>Customer</label>${profile?.full_name || "—"}</div>
      <div class="meta-item"><label>Email</label>${profile?.email || booking.contactEmail || booking.contact_email || "—"}</div>
      <div class="meta-item"><label>Phone</label>${profile?.phone || booking.contactPhone || booking.contact_phone || "—"}</div>
      <div class="meta-item"><label>Status</label>${(booking.status || "").replace(/_/g, " ").toUpperCase()}</div>
      <div class="meta-item"><label>Rental Period</label>${booking.startDate || booking.start_date} → ${booking.endDate || booking.end_date}</div>
      <div class="meta-item"><label>Payment</label>${(booking.paymentStatus || booking.payment_status || "").replace(/_/g, " ").toUpperCase()}</div>
    </div>
    <table>
      <thead><tr><th>Item</th><th>Days</th><th style="text-align:right">Amount</th></tr></thead>
      <tbody>
        <tr><td>Camera Rental</td><td>${Math.max(1, Math.ceil((new Date(booking.endDate || booking.end_date).getTime() - new Date(booking.startDate || booking.start_date).getTime()) / 86400000))}</td><td style="text-align:right">₹${(booking.totalRentalFee || booking.total_rental_fee || 0).toLocaleString("en-IN")}</td></tr>
        ${(booking.discountAmount || booking.discount_amount) ? `<tr><td>Coupon Discount (${booking.couponApplied || booking.coupon_applied || ""})</td><td>—</td><td style="text-align:right; color:#e74c3c">−₹${((booking.discountAmount || booking.discount_amount) || 0).toLocaleString("en-IN")}</td></tr>` : ""}
      </tbody>
      <tfoot><tr class="total-row"><td colspan="2">Total Paid</td><td style="text-align:right">₹${((booking.totalPayable ?? booking.total_payable) || 0).toLocaleString("en-IN")}</td></tr></tfoot>
    </table>
    <div class="footer">
      AUREVIA Camera Rentals · by Prem Mundargi · aurevia.in<br/>
      Payment via Razorpay · All rentals subject to Terms &amp; Conditions<br/>
      Thank you for choosing AUREVIA.
    </div>
    </body></html>
  `);
  w.document.close();
  w.print();
}

/* ─── Main Component ──────────────────────────────────────────── */
export default function CustomerDashboard() {
  const router = useRouter();
  const { cart, addToCart } = useCart();
  const toast = useToast();

  const [profile, setProfile]           = useState<Record<string, unknown> | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [bookings, setBookings]         = useState<any[]>([]);
  const [bookingsLoading, setBookingsLoading] = useState(true);
  const [activeTab, setActiveTab]       = useState<DashTab>("overview");
  const [bookingFilter, setBookingFilter] = useState<BookingFilter>("all");
  const [sidebarOpen, setSidebarOpen]   = useState(false);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [refreshing, setRefreshing]     = useState(false);

  // Issue reporting states
  const [reportedIssues, setReportedIssues] = useState<Record<string, boolean>>({});
  const [reportingIssueId, setReportingIssueId] = useState<string | null>(null);
  const [issueText, setIssueText] = useState("");

  // Booking history search filters
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStartDate, setFilterStartDate] = useState("");
  const [filterEndDate, setFilterEndDate] = useState("");

  // Favorites & Recently viewed states
  const [favoritesList, setFavoritesList] = useState<any[]>([]);
  const [recentlyViewedList, setRecentlyViewedList] = useState<any[]>([]);

  // Post-rental review states
  const [reviewModalProduct, setReviewModalProduct] = useState<any | null>(null);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [submittingReview, setSubmittingReview] = useState(false);

  // Settings form
  const [name, setName]   = useState("");
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);

  // Password change
  const [newPw, setNewPw]     = useState("");
  const [cfmPw, setCfmPw]     = useState("");
  const [showNewPw, setShowNewPw] = useState(false);
  const [showCfmPw, setShowCfmPw] = useState(false);
  const [pwSaving, setPwSaving]   = useState(false);

  const prevCount = useRef(0);

  const loadFavoritesAndRecentlyViewed = useCallback(() => {
    if (typeof window !== "undefined") {
      const favorites = JSON.parse(localStorage.getItem("favorites") || "[]") as string[];
      const viewed = JSON.parse(localStorage.getItem("recently_viewed") || "[]") as string[];
      
      const favProducts = MOCK_PRODUCTS.filter((p) => favorites.includes(p.id));
      const viewProducts = viewed.map((id) => MOCK_PRODUCTS.find((p) => p.id === id)).filter(Boolean);
      
      setFavoritesList(favProducts);
      setRecentlyViewedList(viewProducts);
    }
  }, []);

  useEffect(() => {
    loadFavoritesAndRecentlyViewed();
  }, [activeTab, loadFavoritesAndRecentlyViewed]);

  const loadBookings = useCallback(async () => {
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
      const isSupabase = supabaseUrl.length > 0 && !supabaseUrl.includes("your-project-id");
      if (isSupabase && profile?.id) {
        const { getUserBookingsAction } = await import("@/lib/actions/bookings");
        const mine = await getUserBookingsAction();
        setBookings(mine);
      } else {
        const profileId = (profile?.id as string) ?? "usr-prem";
        const local = await db.getBookings(profileId);
        setBookings(local as any[]);
      }
    } catch {
      toast.error("Failed to load bookings.");
    } finally {
      setBookingsLoading(false);
    }
  }, [profile, toast]);

  // Load profile
  useEffect(() => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
    const isSupabase = supabaseUrl.length > 0 && !supabaseUrl.includes("your-project-id");

    if (isSupabase) {
      getCurrentUserAction().then((p) => {
        if (p) {
          setProfile(p);
          setName(String(p.full_name ?? ""));
          setPhone(String(p.phone ?? ""));
        }
        setProfileLoading(false);
      });
    } else {
      db.getProfile().then((p) => {
        const profileData = { full_name: p.fullName, email: p.email, phone: p.phone, role: p.role, id: p.id } as Record<string, unknown>;
        setProfile(profileData);
        setName(p.fullName);
        setPhone(p.phone);
        setProfileLoading(false);
      });
    }
  }, []);

  // Load bookings after profile
  useEffect(() => {
    if (!profileLoading) loadBookings();
  }, [profileLoading, loadBookings]);

  // Animate on tab change
  useEffect(() => {
    setTimeout(() => {
      animate(".dash-card", {
        opacity: [0, 1],
        translateY: [12, 0],
        delay: stagger(50),
        duration: 500,
        easing: "easeOutQuad",
      });
    }, 50);
  }, [activeTab, bookingFilter]);

  // New booking notification
  useEffect(() => {
    if (prevCount.current > 0 && bookings.length > prevCount.current) {
      toast.info("Your bookings have been updated.");
    }
    prevCount.current = bookings.length;
  }, [bookings, toast]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadBookings();
    setRefreshing(false);
    toast.success("Bookings refreshed.");
  };

  const handleCancel = async (id: string) => {
    if (!confirm("Cancel this booking? This action cannot be undone.")) return;
    setCancellingId(id);
    try {
      const result = await cancelBookingAction(id);
      if (result.success) {
        toast.success("Booking cancelled.");
        await loadBookings();
      } else {
        toast.error(result.error ?? "Failed to cancel.");
      }
    } catch {
      toast.error("Cancellation failed.");
    }
    setCancellingId(null);
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewModalProduct || !reviewComment) return;
    setSubmittingReview(true);
    try {
      await db.submitReview({
        productId: reviewModalProduct.id,
        authorName: String(profile?.full_name || "Valued Customer"),
        rating: reviewRating,
        quote: reviewComment,
      });
      toast.success("Thank you! Your review has been submitted for approval.");
      setReviewModalProduct(null);
      setReviewComment("");
      setReviewRating(5);
    } catch {
      toast.error("Failed to submit review.");
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
    const isSupabase = supabaseUrl.length > 0 && !supabaseUrl.includes("your-project-id");
    if (isSupabase) {
      const result = await updateProfileAction(name, phone);
      if (result.success) toast.success("Profile updated.");
      else toast.error(result.error ?? "Failed to update.");
    } else {
      await db.updateProfile({ fullName: name, phone });
      toast.success("Profile updated.");
    }
    setSaving(false);
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPw.length < 6) { toast.error("Password must be at least 6 characters."); return; }
    if (newPw !== cfmPw)  { toast.error("Passwords do not match."); return; }
    setPwSaving(true);
    const result = await changePasswordAction(newPw);
    if (result.success) {
      toast.success("Password updated successfully.");
      setNewPw(""); setCfmPw("");
    } else {
      toast.error(result.error ?? "Failed to update password.");
    }
    setPwSaving(false);
  };

  const handleLogout = async () => {
    const result = await signOutAction();
    if (result.success) window.location.href = "/login";
    else toast.error("Logout failed.");
  };

  /* ─── Derived stats ──────────────────────────────────── */
  const stats = {
    upcoming:  bookings.filter((b) => ["pending_payment","paid","approval_pending","approved","ready_for_pickup"].includes(b.status)).length,
    active:    bookings.filter((b) => ["rented","overdue"].includes(b.status)).length,
    completed: bookings.filter((b) => ["completed","returned"].includes(b.status)).length,
    cancelled: bookings.filter((b) => ["cancelled","rejected"].includes(b.status)).length,
  };

  let filteredBookings = filterBookings(bookings, bookingFilter);

  if (searchTerm) {
    const term = searchTerm.toLowerCase();
    filteredBookings = filteredBookings.filter((b) => {
      const ref = (b.referenceCode || b.reference_code || "").toLowerCase();
      const nameMatch = (b.booking_items || b.items || []).some((item: any) => {
        const prodName = item.product?.name || item.name || item.productId || "";
        return prodName.toLowerCase().includes(term);
      });
      return ref.includes(term) || nameMatch;
    });
  }

  if (filterStartDate) {
    filteredBookings = filteredBookings.filter((b) => (b.startDate || b.start_date) >= filterStartDate);
  }

  if (filterEndDate) {
    filteredBookings = filteredBookings.filter((b) => (b.endDate || b.end_date) <= filterEndDate);
  }

  /* ─── Sidebar nav items ───────────────────────────────── */
  const navItems: { id: DashTab; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: "overview",  label: "Overview",  icon: <TrendingUp size={15} /> },
    { id: "bookings",  label: "Bookings",  icon: <ShoppingBag size={15} />, badge: bookings.length },
    { id: "settings",  label: "Settings",  icon: <Settings size={15} /> },
  ];

  /* ─── Render ───────────────────────────────────────────── */
  return (
    <AuthGuard>
      <div className="min-h-screen bg-obsidian text-ivory">
        <Navbar cartItemCount={cart.length} />

        {/* Mobile sidebar backdrop */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/60 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <div className="max-w-7xl mx-auto px-4 md:px-8 pt-28 pb-16 flex gap-6">

          {/* Sidebar */}
          <aside className={`fixed lg:relative top-0 left-0 h-full lg:h-auto z-50 lg:z-auto w-64 lg:w-56 xl:w-64 bg-obsidian lg:bg-transparent border-r border-white/5 lg:border-none pt-20 lg:pt-0 px-4 lg:px-0 transition-transform duration-300 ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"} shrink-0`}>
            <div className="glass-panel border-white/5 rounded-xl p-4 space-y-1 sticky top-28">
              {/* Brand Wordmark */}
              <div className="px-2 pt-1 pb-3 border-b border-white/5 mb-2 flex justify-center">
                <Logo variant="wordmark" theme="light" width={120} height={32} />
              </div>
              {/* Profile mini */}
              <div className="px-2 py-3 border-b border-white/5 mb-3">
                <div className="mb-2 flex items-center">
                  <Logo variant="monogram" theme="light" width={32} height={32} />
                </div>
                {profileLoading ? (
                  <div className="space-y-1.5">
                    <div className="h-3 w-24 bg-white/10 rounded animate-pulse" />
                    <div className="h-2 w-16 bg-white/5 rounded animate-pulse" />
                  </div>
                ) : (
                  <>
                    <p className="text-xs font-semibold text-ivory truncate">{String(profile?.full_name ?? "")}</p>
                    <p className="text-[10px] text-muted-gray font-mono truncate">{String(profile?.email ?? "")}</p>
                  </>
                )}
              </div>

              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => { setActiveTab(item.id); setSidebarOpen(false); }}
                  className={`w-full flex items-center justify-between gap-2.5 px-3 py-2.5 rounded-lg text-xs transition cursor-pointer ${activeTab === item.id ? "bg-gold-champagne/10 text-gold-champagne border border-gold-border/30" : "text-muted-gray hover:text-ivory hover:bg-white/5"}`}
                >
                  <span className="flex items-center gap-2.5">
                    {item.icon}
                    {item.label}
                  </span>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="bg-gold-champagne/20 text-gold-champagne text-[9px] font-mono px-1.5 py-0.5 rounded-full">{item.badge}</span>
                  )}
                </button>
              ))}

              <div className="pt-3 mt-3 border-t border-white/5">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs text-rose-400/70 hover:text-rose-400 hover:bg-rose-500/5 transition cursor-pointer"
                >
                  <LogOut size={14} /> Sign Out
                </button>
              </div>
            </div>
          </aside>

          {/* Main content */}
          <main className="flex-1 min-w-0">
            {/* Mobile header */}
            <div className="flex items-center gap-3 mb-6 lg:hidden">
              <button
                onClick={() => setSidebarOpen(true)}
                className="p-2 border border-white/10 rounded-lg text-muted-gray hover:text-ivory transition cursor-pointer"
              >
                <Menu size={16} />
              </button>
              <div>
                <span className="text-[9px] text-gold-champagne uppercase font-mono tracking-widest">Customer Portal</span>
                <h2 className="text-base font-semibold text-ivory serif-heading">{["Overview","Bookings","Settings"][["overview","bookings","settings"].indexOf(activeTab)]}</h2>
              </div>
            </div>

            {/* Desktop header */}
            <div className="hidden lg:flex items-center justify-between mb-8">
              <div>
                <span className="text-[9px] text-gold-champagne uppercase font-mono tracking-widest block mb-1">Customer Portal</span>
                <h1 className="serif-heading text-2xl font-light text-ivory">
                  {activeTab === "overview" && `Welcome, ${String(profile?.full_name ?? "").split(" ")[0] || "Member"}`}
                  {activeTab === "bookings" && "My Bookings"}
                  {activeTab === "settings" && "Account Settings"}
                </h1>
              </div>
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="flex items-center gap-1.5 text-[10px] text-muted-gray hover:text-ivory border border-white/10 px-3 py-2 rounded-lg transition cursor-pointer disabled:opacity-50"
              >
                <RefreshCw size={11} className={refreshing ? "animate-spin" : ""} />
                Refresh
              </button>
            </div>

            {/* ── OVERVIEW TAB ── */}
            {activeTab === "overview" && (
              <div className="space-y-6">
                {/* Stats grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  {[
                    { label: "Upcoming", value: stats.upcoming, icon: <Calendar size={14} />, color: "text-amber-400" },
                    { label: "Active",   value: stats.active,   icon: <Camera size={14} />,   color: "text-indigo-400" },
                    { label: "Completed",value: stats.completed,icon: <CheckCircle size={14} />, color: "text-emerald-400" },
                    { label: "Cancelled",value: stats.cancelled, icon: <XCircle size={14} />,  color: "text-rose-400" },
                  ].map((s) => (
                    <div key={s.label} className="dash-card opacity-0 glass-panel border-white/5 rounded-lg p-4 space-y-2">
                      <div className={`flex items-center gap-1.5 text-[9px] uppercase font-mono tracking-wider ${s.color}`}>
                        {s.icon} {s.label}
                      </div>
                      <p className="text-2xl font-light text-ivory serif-heading">{s.value}</p>
                    </div>
                  ))}
                </div>

                {/* Referral Architecture Card */}
                <div className="dash-card opacity-0 glass-panel border-white/5 rounded-xl p-6 bg-gold-champagne/5 relative overflow-hidden">
                  <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 opacity-5">
                    <Tag size={160} className="text-gold-champagne" />
                  </div>
                  <h3 className="text-[11px] uppercase font-mono tracking-widest text-gold-champagne mb-2">Referral Concierge</h3>
                  <p className="text-xs text-ivory/80 leading-relaxed max-w-md">
                    Invite your fellow cinematographers and photographers to AUREVIA. When they book using your referral link, they receive a flat ₹199 discount, and you earn ₹500 in rental credits.
                  </p>
                  
                  <div className="mt-4 flex flex-wrap gap-2.5 items-center">
                    <div className="bg-black/45 border border-white/10 rounded px-3 py-2 text-xs font-mono text-gold-champagne select-all">
                      AUREVIA-REF-{String(profile?.id || "PREM").slice(0, 5).toUpperCase()}
                    </div>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(`http://localhost:3000/register?ref=AUREVIA-REF-${String(profile?.id || "PREM").slice(0, 5).toUpperCase()}`);
                        toast.success("Referral link copied to clipboard!");
                      }}
                      className="px-3 py-2 bg-white/10 hover:bg-white/15 text-[10px] uppercase font-bold text-gold-champagne rounded transition cursor-pointer"
                    >
                      Copy Invite Link
                    </button>
                  </div>
                </div>

                {/* Recent bookings */}
                <div className="dash-card opacity-0 glass-panel border-white/5 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-5">
                    <h3 className="text-[11px] uppercase font-mono tracking-widest text-muted-gray">Recent Reservations</h3>
                    <button onClick={() => setActiveTab("bookings")} className="text-[10px] text-gold-champagne hover:underline flex items-center gap-1">
                      View all <ChevronRight size={11} />
                    </button>
                  </div>
                  {bookingsLoading ? (
                    <div className="space-y-3">
                      {[1,2,3].map((i) => <div key={i} className="h-14 bg-white/5 rounded animate-pulse" />)}
                    </div>
                  ) : bookings.length === 0 ? (
                    <div className="text-center py-8 space-y-2">
                      <Camera size={28} className="text-muted-gray/40 mx-auto" />
                      <p className="text-sm text-muted-gray">No bookings yet.</p>
                      <Link href="/booking" className="text-[11px] text-gold-champagne hover:underline">Book your first camera →</Link>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {bookings.slice(0, 4).map((b) => (
                        <div key={b.id} className="flex items-center justify-between p-3 bg-white/3 hover:bg-white/5 rounded-lg transition">
                          <div>
                            <p className="text-xs font-mono text-ivory">{b.referenceCode || b.reference_code}</p>
                            <p className="text-[10px] text-muted-gray">{b.startDate || b.start_date} → {b.endDate || b.end_date}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-gold-champagne">₹{((b.totalPayable ?? b.total_payable) || 0).toLocaleString("en-IN")}</span>
                            <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase border ${STATUS_STYLES[b.status] ?? ""}`}>{b.status.replace(/_/g, " ")}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Quick links */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { label: "Book a Camera",  href: "/booking",  icon: <Camera size={15} />, desc: "Browse available cameras" },
                    { label: "WhatsApp Support",href: "https://wa.me/919686909048", icon: <MessageCircle size={15} />, desc: "Chat with Prem directly", external: true },
                    { label: "View Terms",     href: "/terms",    icon: <FileText size={15} />, desc: "Rental terms & conditions" },
                  ].map((q) => (
                    <Link
                      key={q.label}
                      href={q.href}
                      target={q.external ? "_blank" : undefined}
                      className="dash-card opacity-0 glass-panel border-white/5 hover:border-gold-border/30 rounded-lg p-4 flex items-center gap-3 transition group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-gold-champagne/10 flex items-center justify-center text-gold-champagne shrink-0 group-hover:bg-gold-champagne/20 transition">
                        {q.icon}
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-ivory">{q.label}</p>
                        <p className="text-[10px] text-muted-gray">{q.desc}</p>
                      </div>
                    </Link>
                  ))}
                </div>

                {/* Favorites Section */}
                {favoritesList.length > 0 && (
                  <div className="dash-card opacity-0 glass-panel border-white/5 rounded-xl p-6">
                    <h3 className="text-[11px] uppercase font-mono tracking-widest text-gold-champagne mb-5">Your Favorite Gear</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                      {favoritesList.map((g) => (
                        <div key={g.id} className="bg-black/35 border border-white/5 rounded-lg p-4 flex justify-between items-center gap-3">
                          <div>
                            <h4 className="text-xs font-semibold text-ivory">{g.name}</h4>
                            <p className="text-[10px] text-gold-champagne mt-0.5">₹{g.dailyPrice.toLocaleString("en-IN")}/day</p>
                          </div>
                          <Link
                            href={`/gear/${g.slug}`}
                            className="px-3 py-1.5 bg-white/10 hover:bg-gold-champagne hover:text-obsidian text-[9px] font-bold uppercase rounded transition cursor-pointer"
                          >
                            View
                          </Link>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recently Viewed Section */}
                {recentlyViewedList.length > 0 && (
                  <div className="dash-card opacity-0 glass-panel border-white/5 rounded-xl p-6">
                    <h3 className="text-[11px] uppercase font-mono tracking-widest text-muted-gray mb-5">Recently Viewed</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                      {recentlyViewedList.map((g) => (
                        <div key={g?.id} className="bg-black/35 border border-white/5 rounded-lg p-4 flex justify-between items-center gap-3">
                          <div>
                            <h4 className="text-xs font-semibold text-ivory">{g?.name}</h4>
                            <p className="text-[10px] text-muted-gray mt-0.5">₹{g?.dailyPrice.toLocaleString("en-IN")}/day</p>
                          </div>
                          <Link
                            href={`/gear/${g?.slug}`}
                            className="px-3 py-1.5 bg-white/10 hover:bg-white/15 text-[9px] font-bold text-gold-champagne uppercase rounded transition cursor-pointer"
                          >
                            Rent
                          </Link>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ── BOOKINGS TAB ── */}
            {activeTab === "bookings" && (
              <div className="space-y-5">
                {/* Filter tabs */}
                <div className="flex gap-1.5 flex-wrap">
                  {(["all","upcoming","active","completed","cancelled"] as BookingFilter[]).map((f) => (
                    <button
                      key={f}
                      onClick={() => setBookingFilter(f)}
                      className={`px-3 py-1.5 text-[10px] uppercase font-mono tracking-wider rounded-lg border transition cursor-pointer ${bookingFilter === f ? "bg-gold-champagne/15 border-gold-border text-gold-champagne" : "border-white/10 text-muted-gray hover:text-ivory hover:border-white/20"}`}
                    >
                      {f} {f === "all" ? `(${bookings.length})` : ""}
                    </button>
                  ))}
                </div>

                {/* Search & Date filters */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-white/5 border border-white/5 rounded-lg p-3">
                  <input
                    type="text"
                    placeholder="Search by ID or Camera Name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="bg-black/35 border border-white/10 rounded px-3 py-2 text-xs text-ivory focus:outline-none focus:border-gold-champagne/45 placeholder:text-muted-gray/50"
                  />
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] uppercase font-mono text-muted-gray/70">From:</span>
                    <input
                      type="date"
                      value={filterStartDate}
                      onChange={(e) => setFilterStartDate(e.target.value)}
                      className="flex-1 bg-black/35 border border-white/10 rounded px-2 py-1.5 text-xs text-ivory focus:outline-none focus:border-gold-champagne/45"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] uppercase font-mono text-muted-gray/70">To:</span>
                    <input
                      type="date"
                      value={filterEndDate}
                      onChange={(e) => setFilterEndDate(e.target.value)}
                      className="flex-1 bg-black/35 border border-white/10 rounded px-2 py-1.5 text-xs text-ivory focus:outline-none focus:border-gold-champagne/45"
                    />
                  </div>
                </div>

                {bookingsLoading ? (
                  <SkeletonDashboard />
                ) : filteredBookings.length === 0 ? (
                  <div className="glass-panel border-white/5 rounded-xl p-12 text-center space-y-3">
                    <Camera size={28} className="text-muted-gray/40 mx-auto" />
                    <p className="text-sm text-muted-gray">No {bookingFilter !== "all" ? bookingFilter : ""} bookings found.</p>
                    {bookingFilter !== "all" && (
                      <button onClick={() => setBookingFilter("all")} className="text-[11px] text-gold-champagne hover:underline">Show all bookings</button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredBookings.map((b) => {
                      const refCode    = b.referenceCode || b.reference_code;
                      const startDate  = b.startDate || b.start_date;
                      const endDate    = b.endDate || b.end_date;
                      const totalPay   = b.totalPayable ?? b.total_payable ?? 0;
                      const rentalFee  = b.totalRentalFee || b.total_rental_fee || 0;
                      const discount   = b.discountAmount || b.discount_amount || 0;
                      const coupon     = b.couponApplied || b.coupon_applied;
                      const pStatus    = b.paymentStatus || b.payment_status;
                      const days       = Math.max(1, Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / 86400000));
                      const stepIdx    = STEP_ORDER.indexOf(b.status);
                      const isTerminal = ["cancelled","rejected","payment_failed"].includes(b.status);

                      return (
                        <div key={b.id} className="dash-card opacity-0 glass-panel border-white/5 hover:border-white/10 rounded-xl p-5 space-y-4 transition">
                          {/* Header */}
                          <div className="flex flex-wrap items-start justify-between gap-3 border-b border-white/5 pb-4">
                            <div>
                              <span className="text-[8px] text-gold-champagne uppercase font-mono tracking-widest block mb-0.5">Reservation</span>
                              <p className="text-sm font-mono font-semibold text-ivory">{refCode}</p>
                              <p className="text-[10px] text-muted-gray mt-0.5">{startDate} → {endDate} · {days} day{days !== 1 ? "s" : ""}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={`px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider rounded-lg border ${STATUS_STYLES[b.status] ?? ""}`}>
                                {b.status.replace(/_/g, " ")}
                              </span>
                            </div>
                          </div>

                          {/* Status timeline */}
                          {!isTerminal && (
                            <div>
                              <p className="text-[8px] uppercase font-mono tracking-widest text-muted-gray mb-3">Rental Progress</p>
                              <div className="relative">
                                <div className="absolute top-3 left-0 right-0 h-px bg-white/5" />
                                <div
                                  className="absolute top-3 left-0 h-px bg-gold-champagne/40 transition-all duration-700"
                                  style={{ width: stepIdx >= 0 ? `${(stepIdx / (STEP_ORDER.length - 1)) * 100}%` : "0%" }}
                                />
                                <div className="relative flex justify-between">
                                  {TIMELINE_STEPS.map((step, i) => {
                                    const isDone    = i < stepIdx;
                                    const isCurrent = i === stepIdx;
                                    return (
                                      <div key={step.key} className="flex flex-col items-center gap-1.5" style={{ flex: 1 }}>
                                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center z-10 transition ${isCurrent ? "border-gold-champagne bg-gold-champagne/20 shadow-[0_0_8px_rgba(184,139,67,0.4)]" : isDone ? "border-gold-champagne/60 bg-gold-champagne/10" : "border-white/10 bg-obsidian"}`}>
                                          {isDone && <CheckCircle size={10} className="text-gold-champagne/60" />}
                                          {isCurrent && <div className="w-2 h-2 rounded-full bg-gold-champagne" />}
                                        </div>
                                        <span className={`text-[7px] font-mono text-center leading-tight whitespace-pre-line hidden sm:block ${isCurrent ? "text-gold-champagne" : isDone ? "text-muted-gray/60" : "text-muted-gray/30"}`}>
                                          {step.label}
                                        </span>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Pricing summary */}
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            <div className="bg-white/3 rounded-lg p-3">
                              <p className="text-[8px] uppercase font-mono text-muted-gray mb-1">Camera Rent</p>
                              <p className="text-sm font-semibold text-ivory">₹{rentalFee.toLocaleString("en-IN")}</p>
                            </div>
                            {discount > 0 && (
                              <div className="bg-teal-500/5 rounded-lg p-3">
                                <p className="text-[8px] uppercase font-mono text-teal-400/70 mb-1">
                                  Coupon {coupon ? `(${coupon})` : "Discount"}
                                </p>
                                <p className="text-sm font-semibold text-teal-400">−₹{discount.toLocaleString("en-IN")}</p>
                              </div>
                            )}
                            <div className="bg-gold-champagne/5 rounded-lg p-3">
                              <p className="text-[8px] uppercase font-mono text-gold-champagne/70 mb-1">Total Paid</p>
                              <p className="text-sm font-bold text-gold-champagne">₹{totalPay.toLocaleString("en-IN")}</p>
                            </div>
                            <div className="bg-white/3 rounded-lg p-3">
                              <p className="text-[8px] uppercase font-mono text-muted-gray mb-1">Payment</p>
                              <p className={`text-sm font-semibold ${pStatus === "paid" ? "text-emerald-400" : "text-amber-400"}`}>
                                {(pStatus || "").replace(/_/g, " ").toUpperCase() || "UNPAID"}
                              </p>
                            </div>
                          </div>

                          {/* Pickup OTP */}
                          {b.status === "ready_for_pickup" && b.pickupOTP && (
                            <div className="bg-emerald-500/8 border border-emerald-500/20 rounded-lg p-4 flex items-center gap-3">
                              <div className="w-9 h-9 rounded-lg bg-emerald-500/15 flex items-center justify-center shrink-0">
                                <Key size={16} className="text-emerald-400" />
                              </div>
                              <div>
                                <p className="text-[8px] uppercase font-mono text-emerald-400/70 mb-0.5">Pickup OTP — Show this to collect your camera</p>
                                <p className="text-2xl font-mono font-bold tracking-[0.3em] text-emerald-400">{b.pickupOTP}</p>
                              </div>
                            </div>
                          )}
                          
                          {/* Countdown display */}
                          {(() => {
                            const now = new Date();
                            const start = new Date(b.startDate);
                            const end = new Date(b.endDate);
                            if (start > now) {
                              const diffDays = Math.ceil((start.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
                              return (
                                <div className="text-[10px] text-amber-400 font-mono font-semibold bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 rounded-lg inline-block mt-2">
                                  ⏱ Rental starts in {diffDays} day{diffDays > 1 ? "s" : ""}
                                </div>
                              );
                            } else if (b.status === "rented" && end > now) {
                              const diffHours = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60));
                              return (
                                <div className="text-[10px] text-rose-400 font-mono font-semibold bg-rose-500/10 border border-rose-500/20 px-3 py-1.5 rounded-lg inline-block mt-2 animate-pulse">
                                  ⏱ Return due in {diffHours} hour{diffHours > 1 ? "s" : ""}
                                </div>
                              );
                            }
                            return null;
                          })()}

                          {/* Issue reporting form */}
                          {reportingIssueId === b.id ? (
                            <div className="space-y-2 mt-3 p-3 bg-white/5 rounded border border-white/5">
                              <span className="text-[8px] font-mono uppercase text-gold-champagne block">Describe the issue</span>
                              <textarea
                                value={issueText}
                                onChange={(e) => setIssueText(e.target.value)}
                                placeholder="Details about damage, missing items, or device failure..."
                                className="w-full bg-white/5 border border-white/10 text-xs rounded p-2 focus:outline-none text-ivory"
                              />
                              <div className="flex gap-2">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setReportedIssues(prev => ({ ...prev, [b.id]: true }));
                                    setReportingIssueId(null);
                                    setIssueText("");
                                    toast.success("Issue submitted. Prem will contact you.");
                                  }}
                                  className="px-3 py-1.5 bg-rose-500 text-white text-[9px] uppercase font-bold rounded cursor-pointer"
                                >
                                  Submit Report
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setReportingIssueId(null)}
                                  className="px-3 py-1.5 bg-white/10 text-[9px] uppercase font-bold rounded text-muted-gray cursor-pointer"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : reportedIssues[b.id] ? (
                            <div className="text-[9px] text-rose-400 font-mono uppercase bg-rose-500/10 border border-rose-500/20 p-2.5 rounded mt-3">
                              ⚠️ Issue reported. Concierge has been alerted.
                            </div>
                          ) : null}

                          {/* Actions */}
                          <div className="flex flex-wrap gap-2 pt-3 border-t border-white/5 mt-3">
                            <button
                              onClick={() => printInvoice(b, profile)}
                              className="flex items-center gap-1.5 text-[10px] px-3 py-1.5 border border-white/10 rounded-lg text-muted-gray hover:text-ivory hover:border-white/20 transition cursor-pointer"
                            >
                              <Download size={11} /> Download Invoice
                            </button>

                            {/* Calendar download button */}
                            {["paid", "approved", "ready_for_pickup"].includes(b.status) && (
                              <button
                                onClick={() => {
                                  const productName = b.booking_items?.[0]?.product?.name || b.items?.[0]?.name || "Camera";
                                  const mappedBooking = {
                                    id: b.id,
                                    startDate: b.startDate || b.start_date,
                                    endDate: b.endDate || b.end_date,
                                    createdAt: b.createdAt || b.created_at,
                                    referenceCode: b.referenceCode || b.reference_code,
                                    contactName: b.contactName || b.contact_name,
                                    contactPhone: b.contactPhone || b.contact_phone,
                                  } as any;
                                  
                                  import("@/lib/utils/ical").then((u) => {
                                    u.downloadCalendarFile(mappedBooking, productName);
                                    toast.success("Calendar invite downloaded successfully!");
                                  });
                                }}
                                className="flex items-center gap-1.5 text-[10px] px-3 py-1.5 border border-white/10 rounded-lg text-muted-gray hover:text-ivory hover:border-white/20 transition cursor-pointer"
                              >
                                📅 Add to Calendar
                              </button>
                            )}

                            {/* Report issue action */}
                            {b.status === "rented" && !reportedIssues[b.id] && !reportingIssueId && (
                              <button
                                onClick={() => {
                                  setReportingIssueId(b.id);
                                  setIssueText("");
                                }}
                                className="flex items-center gap-1.5 text-[10px] px-3 py-1.5 border border-rose-500/20 rounded-lg text-rose-400/80 hover:text-rose-400 hover:border-rose-500/40 transition cursor-pointer"
                              >
                                Report an Issue
                              </button>
                            )}

                            {/* Rebook and Review actions */}
                            {["completed", "returned"].includes(b.status) && (
                              <div className="flex flex-wrap gap-2">
                                <button
                                  onClick={async () => {
                                    const itemId = b.booking_items?.[0]?.product_id || b.items?.[0]?.productId;
                                    if (itemId) {
                                      const prod = await db.getProductById(itemId);
                                      if (prod) {
                                        addToCart(prod, 1, new Date().toISOString().split("T")[0], new Date(Date.now() + 3*86400000).toISOString().split("T")[0], []);
                                        toast.success("Camera added to cart. Rebooking...");
                                        router.push("/booking");
                                      }
                                    }
                                  }}
                                  className="flex items-center gap-1.5 text-[10px] px-3 py-1.5 bg-gold-champagne hover:bg-gold-warm text-obsidian rounded-lg font-bold transition cursor-pointer"
                                >
                                  Rebook This Model
                                </button>
                                <button
                                  onClick={async () => {
                                    const itemId = b.booking_items?.[0]?.product_id || b.items?.[0]?.productId;
                                    if (itemId) {
                                      const prod = await db.getProductById(itemId);
                                      if (prod) {
                                        setReviewModalProduct(prod);
                                        setReviewRating(5);
                                        setReviewComment("");
                                      }
                                    }
                                  }}
                                  className="flex items-center gap-1.5 text-[10px] px-3 py-1.5 border border-gold-border text-gold-champagne hover:bg-gold-champagne/10 rounded-lg transition cursor-pointer"
                                >
                                  ★ Write Review
                                </button>
                              </div>
                            )}

                            {canCancel(b.status) && (
                              <button
                                onClick={() => handleCancel(b.id)}
                                disabled={cancellingId === b.id}
                                className="flex items-center gap-1.5 text-[10px] px-3 py-1.5 border border-rose-500/20 rounded-lg text-rose-400/70 hover:text-rose-400 hover:border-rose-500/40 transition cursor-pointer disabled:opacity-50"
                              >
                                {cancellingId === b.id ? <Loader2 size={11} className="animate-spin" /> : <XCircle size={11} />}
                                Cancel Booking
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* ── SETTINGS TAB ── */}
            {activeTab === "settings" && (
              <div className="space-y-5">
                {/* Profile info */}
                <div className="dash-card opacity-0 glass-panel border-white/5 rounded-xl p-6">
                  <h3 className="text-[10px] uppercase font-mono tracking-widest text-muted-gray mb-5">Profile Information</h3>
                  <form onSubmit={handleSaveProfile} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] text-muted-gray uppercase font-mono tracking-wider block">Full Name</label>
                        <div className="relative">
                          <User size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-gray pointer-events-none" />
                          <input
                            type="text" value={name} onChange={(e) => setName(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 text-xs rounded-lg p-2.5 pl-8 focus:outline-none focus:border-gold-champagne/50 transition"
                          />
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] text-muted-gray uppercase font-mono tracking-wider block">Phone Number</label>
                        <div className="relative">
                          <Phone size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-gray pointer-events-none" />
                          <input
                            type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 text-xs rounded-lg p-2.5 pl-8 focus:outline-none focus:border-gold-champagne/50 transition"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] text-muted-gray uppercase font-mono tracking-wider block">Email Address <span className="text-muted-gray/40">(read-only)</span></label>
                      <div className="relative">
                        <Mail size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-gray pointer-events-none" />
                        <input
                          type="email" readOnly
                          value={String(profile?.email ?? "")}
                          className="w-full bg-white/3 border border-white/5 text-xs rounded-lg p-2.5 pl-8 text-muted-gray cursor-not-allowed"
                        />
                      </div>
                    </div>
                    <button
                      type="submit" disabled={saving}
                      className="px-5 py-2.5 bg-gold-champagne hover:bg-gold-warm disabled:opacity-60 text-obsidian text-xs font-bold uppercase tracking-wider rounded-lg transition cursor-pointer flex items-center gap-2"
                    >
                      {saving ? <><Loader2 size={12} className="animate-spin" /> Saving...</> : "Save Changes"}
                    </button>
                  </form>
                </div>

                {/* Change password */}
                <div className="dash-card opacity-0 glass-panel border-white/5 rounded-xl p-6">
                  <h3 className="text-[10px] uppercase font-mono tracking-widest text-muted-gray mb-5">Change Password</h3>
                  <form onSubmit={handleChangePassword} className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] text-muted-gray uppercase font-mono tracking-wider block">New Password</label>
                      <div className="relative">
                        <Lock size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-gray pointer-events-none" />
                        <input
                          type={showNewPw ? "text" : "password"} minLength={6}
                          value={newPw} onChange={(e) => setNewPw(e.target.value)}
                          placeholder="Min 6 characters"
                          className="w-full bg-white/5 border border-white/10 text-xs rounded-lg p-2.5 pl-8 pr-10 focus:outline-none focus:border-gold-champagne/50 transition placeholder-white/20"
                        />
                        <button type="button" onClick={() => setShowNewPw(v => !v)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-gray hover:text-ivory transition cursor-pointer" tabIndex={-1}>
                          {showNewPw ? <EyeOff size={12} /> : <Eye size={12} />}
                        </button>
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] text-muted-gray uppercase font-mono tracking-wider block">Confirm New Password</label>
                      <div className="relative">
                        <Lock size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-gray pointer-events-none" />
                        <input
                          type={showCfmPw ? "text" : "password"}
                          value={cfmPw} onChange={(e) => setCfmPw(e.target.value)}
                          placeholder="Repeat new password"
                          className={`w-full bg-white/5 border text-xs rounded-lg p-2.5 pl-8 pr-10 focus:outline-none transition placeholder-white/20 ${cfmPw.length > 0 && cfmPw !== newPw ? "border-rose-500/50" : "border-white/10 focus:border-gold-champagne/50"}`}
                        />
                        <button type="button" onClick={() => setShowCfmPw(v => !v)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-gray hover:text-ivory transition cursor-pointer" tabIndex={-1}>
                          {showCfmPw ? <EyeOff size={12} /> : <Eye size={12} />}
                        </button>
                      </div>
                    </div>
                    <button
                      type="submit" disabled={pwSaving || newPw.length < 6}
                      className="px-5 py-2.5 bg-white/10 hover:bg-white/15 disabled:opacity-50 text-ivory text-xs font-bold uppercase tracking-wider rounded-lg transition cursor-pointer flex items-center gap-2"
                    >
                      {pwSaving ? <><Loader2 size={12} className="animate-spin" /> Updating...</> : <><Key size={12} /> Update Password</>}
                    </button>
                  </form>
                </div>

                {/* Danger zone */}
                <div className="dash-card opacity-0 glass-panel border-rose-500/10 rounded-xl p-6">
                  <h3 className="text-[10px] uppercase font-mono tracking-widest text-rose-400/60 mb-4">Account Actions</h3>
                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2 px-4 py-2 border border-rose-500/20 rounded-lg text-xs text-rose-400 hover:bg-rose-500/10 transition cursor-pointer"
                    >
                      <LogOut size={13} /> Sign Out of AUREVIA
                    </button>
                    <Link
                      href="https://wa.me/919686909048"
                      target="_blank"
                      className="flex items-center gap-2 px-4 py-2 border border-white/10 rounded-lg text-xs text-muted-gray hover:text-ivory hover:border-white/20 transition"
                    >
                      <MessageCircle size={13} /> Contact Support
                    </Link>
                  </div>
                </div>
              </div>
            )}
            {/* ── WRITE REVIEW MODAL ── */}
            {reviewModalProduct && (
              <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                <div className="glass-panel border-gold-border/30 max-w-md w-full p-6 space-y-4 rounded-xl shadow-2xl relative bg-charcoal">
                  <button
                    onClick={() => setReviewModalProduct(null)}
                    className="absolute right-4 top-4 text-muted-gray hover:text-ivory transition cursor-pointer"
                  >
                    <X size={16} />
                  </button>

                  <div className="text-center space-y-1">
                    <span className="text-[9px] uppercase font-mono text-gold-champagne tracking-widest block">Concierge Experience Review</span>
                    <h3 className="serif-heading text-lg font-bold text-ivory">Review {reviewModalProduct.name}</h3>
                  </div>

                  <form onSubmit={handleSubmitReview} className="space-y-4 pt-2">
                    <div className="space-y-1">
                      <label className="text-[10px] text-muted-gray uppercase font-mono tracking-wider block">Your Rating</label>
                      <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setReviewRating(star)}
                            className="text-gold-champagne hover:scale-110 transition cursor-pointer"
                          >
                            <Star size={20} fill={star <= reviewRating ? "#D8B36A" : "transparent"} />
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] text-muted-gray uppercase font-mono tracking-wider block">Your Shooting Review</label>
                      <textarea
                        required
                        rows={4}
                        placeholder="How did the camera perform on your shoot? Mention details like autofocus accuracy, low light capture, etc."
                        value={reviewComment}
                        onChange={(e) => setReviewComment(e.target.value)}
                        className="w-full bg-black/45 border border-white/10 rounded-lg p-2.5 text-xs text-ivory focus:outline-none focus:border-gold-champagne/50 resize-none placeholder-white/20"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={submittingReview}
                      className="w-full py-3 bg-gold-champagne hover:bg-gold-warm text-obsidian text-xs font-bold uppercase tracking-wider rounded-lg transition cursor-pointer disabled:opacity-50"
                    >
                      {submittingReview ? "Submitting..." : "Submit Experience Review"}
                    </button>
                  </form>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}
