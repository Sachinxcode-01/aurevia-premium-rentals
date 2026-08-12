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
  TrendingUp, XCircle, CheckCircle, MessageCircle,
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
  | "overview" | "approval_queue" | "waitlist" | "pickups_today" | "returns_today"
  | "active_rentals" | "overdue" | "inventory" | "coupons" | "customers" | "audit_logs"
  | "cms" | "refunds" | "maintenance" | "support" | "reports";

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
  const [waitlist, setWaitlist]               = useState<any[]>([]);
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

  // Return modal & checklists
  const [returningId, setReturningId]     = useState<string | null>(null);
  const [returnCondition, setReturnCondition] = useState<"good" | "damaged">("good");
  const [damageDesc, setDamageDesc]       = useState("");
  const [damageCost, setDamageCost]       = useState(0);
  const [returnRemarks, setReturnRemarks] = useState("");
  const [lateFeeInput, setLateFeeInput]   = useState(0);
  const [returnChecklist, setReturnChecklist] = useState<Record<string, boolean>>({
    body: false, lens: false, battery: false, charger: false, memoryCard: false, bag: false, accessories: false
  });

  // Pickup checklist
  const [pickupBookingId, setPickupBookingId] = useState<string | null>(null);
  const [pickupOTPInput, setPickupOTPInput] = useState("");
  const [pickupChecklist, setPickupChecklist] = useState<Record<string, boolean>>({
    body: false, lens: false, battery: false, charger: false, memoryCard: false, bag: false, accessories: false
  });
  const [pickupRemarks, setPickupRemarks] = useState("");

  // OTP generation
  const [generatingOTP, setGeneratingOTP] = useState<string | null>(null);

  // CMS States
  const [announcementText, setAnnouncementText] = useState("");
  const [announcementActive, setAnnouncementActive] = useState(true);
  const [bannerTitle, setBannerTitle] = useState("");
  const [bannerSubtitle, setBannerSubtitle] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [rentalTerms, setRentalTerms] = useState("");
  const [previewMode, setPreviewMode] = useState(false);
  const [cmsFaqs, setCmsFaqs] = useState<any[]>([]);
  const [cmsTestimonials, setCmsTestimonials] = useState<any[]>([]);
  const [camerasList, setCamerasList] = useState<any[]>([]);
  const [selectedCameraForCms, setSelectedCameraForCms] = useState<any | null>(null);
  const [cameraDraftName, setCameraDraftName] = useState("");
  const [cameraDraftDesc, setCameraDraftDesc] = useState("");
  const [cameraDraftPrice, setCameraDraftPrice] = useState(799);

  // Refund states
  const [refundRequests, setRefundRequests] = useState<any[]>([]);
  const [refundsLoading, setRefundsLoading] = useState(false);
  const [processingRefundId, setProcessingRefundId] = useState<string | null>(null);

  // Maintenance states
  const [maintenanceUnits, setMaintenanceUnits] = useState<any[]>([]);
  const [isLoggingMaint, setIsLoggingMaint] = useState(false);
  const [maintReasonInput, setMaintReasonInput] = useState("");
  const [maintExpectedReturnInput, setMaintExpectedReturnInput] = useState("");
  const [maintProviderInput, setMaintProviderInput] = useState("");
  const [maintUnitId, setMaintUnitId] = useState("");
  const [completingMaintRecord, setCompletingMaintRecord] = useState<any | null>(null);
  const [maintCostInput, setMaintCostInput] = useState(0);
  const [maintConditionAfter, setMaintConditionAfter] = useState<"excellent" | "good" | "fair" | "damaged">("excellent");

  // Support desk states
  const [adminTickets, setAdminTickets] = useState<any[]>([]);
  const [supportLoading, setSupportLoading] = useState(false);
  const [activeTicketId, setActiveTicketId] = useState<string | null>(null);
  const [adminReplies, setAdminReplies] = useState<any[]>([]);
  const [adminReplyText, setAdminReplyText] = useState("");
  const [sendingAdminReply, setSendingAdminReply] = useState(false);
  const [resolvingTicketId, setResolvingTicketId] = useState<string | null>(null);

  const isOwner   = adminRole === "admin";
  const isAllowed = adminRole === "admin" || adminRole === "staff";

  // Data fetching functions
  const loadCmsData = useCallback(async () => {
    try {
      const allSettings = await db.getAllWebsiteSettings();
      setAnnouncementText(allSettings.announcement_bar_text || "");
      setAnnouncementActive(allSettings.announcement_bar_active === "true");
      setBannerTitle(allSettings.homepage_banner_title || "");
      setBannerSubtitle(allSettings.homepage_banner_subtitle || "");
      setContactPhone(allSettings.contact_phone || "");
      setContactEmail(allSettings.contact_email || "");
      setRentalTerms(allSettings.rental_terms || "");
      setPreviewMode(db.getPreviewMode());

      const faqs = await db.getFAQs();
      setCmsFaqs(faqs);
      
      const testimonials = await db.getTestimonials();
      setCmsTestimonials(testimonials);

      const cams = await db.getProducts();
      setCamerasList(cams);
    } catch (err) {
      console.error(err);
    }
  }, []);

  const loadRefundRequests = useCallback(async () => {
    setRefundsLoading(true);
    try {
      const list = await db.getRefunds();
      setRefundRequests(list);
    } catch (err) {
      console.error(err);
    } finally {
      setRefundsLoading(false);
    }
  }, []);

  const loadMaintenanceUnits = useCallback(async () => {
    try {
      const recs = await db.getMaintenanceRecords();
      setMaintenanceUnits(recs);
    } catch (err) {
      console.error(err);
    }
  }, []);

  const loadAdminTickets = useCallback(async () => {
    setSupportLoading(true);
    try {
      const res = await fetch("/api/support");
      const data = await res.json();
      if (data.success) {
        setAdminTickets(data.tickets);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSupportLoading(false);
    }
  }, []);

  const loadAdminReplies = useCallback(async (ticketId: string) => {
    try {
      const res = await fetch(`/api/support/replies?ticketId=${ticketId}`);
      const data = await res.json();
      if (data.success) {
        setAdminReplies(data.replies);
      }
    } catch (err) {
      console.error(err);
    }
  }, []);

  // Sync state data on tab transition
  useEffect(() => {
    if (activeTab === "cms") loadCmsData();
    if (activeTab === "refunds") loadRefundRequests();
    if (activeTab === "maintenance") {
      loadMaintenanceUnits();
      db.getInventoryUnits().then(setInventoryUnits);
    }
    if (activeTab === "support") loadAdminTickets();
  }, [activeTab, loadCmsData, loadRefundRequests, loadMaintenanceUnits, loadAdminTickets]);

  /* ─── Load data ──────────────────────────────────── */
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [bks, inv, wl] = await Promise.all([
        db.getBookings(),
        db.getInventoryUnits(),
        db.getWaitlist(),
      ]);
      setBookings(bks);
      setInventoryUnits(inv);
      setWaitlist(wl || []);
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

  const handleResolveWaitlist = async (id: string, action: "notified" | "cancelled") => {
    try {
      await db.resolveWaitlist(id, action);
      toast.success(`Waitlist status updated to ${action === "notified" ? "approved & notified" : "rejected & cancelled"}.`);
      await loadData();
    } catch {
      toast.error("Failed to resolve waitlist entry.");
    }
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

  const handleTogglePreviewMode = async () => {
    const nextVal = !previewMode;
    db.setPreviewMode(nextVal);
    setPreviewMode(nextVal);
    toast.success(nextVal ? "Preview mode activated. Draft content is now visible on front-end pages." : "Preview mode deactivated.");
  };

  const handleSaveAnnouncementDraft = async () => {
    try {
      await db.saveDraft("website_settings", "announcement_bar", {
        announcement_bar_text: announcementText,
        announcement_bar_active: String(announcementActive),
      });
      toast.success("Draft saved successfully. Toggle Preview mode to test, or click Publish to apply.");
    } catch (err) {
      toast.error("Failed to save draft.");
    }
  };

  const handlePublishAnnouncement = async () => {
    try {
      await db.publishDraft("website_settings", "announcement_bar");
      toast.success("Announcement published successfully.");
      await loadCmsData();
    } catch (err) {
      toast.error("Failed to publish.");
    }
  };

  const handleRollbackAnnouncement = async () => {
    try {
      await db.rollbackVersion("settings", "announcement_bar");
      toast.success("Announcement rolled back to previous version.");
      await loadCmsData();
    } catch (err) {
      toast.error("Failed to rollback.");
    }
  };

  const handleProcessRefundRequest = async (refundId: string, action: "approve" | "reject") => {
    setProcessingRefundId(refundId);
    try {
      const res = await fetch("/api/admin/refund", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refundId, action }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Refund request successfully ${action}d.`);
        await loadRefundRequests();
      } else {
        toast.error(data.error || "Failed to process refund.");
      }
    } catch (err) {
      toast.error("Network error while processing refund.");
    } finally {
      setProcessingRefundId(null);
    }
  };

  const handleSendToMaintenance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!maintUnitId || !maintReasonInput) return;
    try {
      await db.createMaintenanceRecord({
        inventoryUnitId: maintUnitId,
        maintenanceReason: maintReasonInput,
        expectedReturnDate: maintExpectedReturnInput || new Date().toISOString().split("T")[0],
        serviceProvider: maintProviderInput || "Internal Lab",
        conditionBefore: "good",
        repairCost: 0,
      });
      toast.success("Camera unit checked out into maintenance.");
      setIsLoggingMaint(false);
      setMaintReasonInput("");
      setMaintExpectedReturnInput("");
      setMaintProviderInput("");
      setMaintUnitId("");
      await loadMaintenanceUnits();
      setInventoryUnits(await db.getInventoryUnits());
    } catch (err) {
      toast.error("Failed to log maintenance check out.");
    }
  };

  const handleCompleteMaintenance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!completingMaintRecord) return;
    try {
      await db.completeMaintenance(
        completingMaintRecord.id,
        new Date().toISOString().split("T")[0],
        maintCostInput,
        maintConditionAfter
      );
      toast.success("Maintenance log closed. Camera unit marked as available.");
      setCompletingMaintRecord(null);
      setMaintCostInput(0);
      await loadMaintenanceUnits();
      setInventoryUnits(await db.getInventoryUnits());
    } catch (err) {
      toast.error("Failed to close maintenance check in.");
    }
  };

  const handleSendAdminReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminReplyText.trim() || !activeTicketId) return;
    setSendingAdminReply(true);
    try {
      const res = await fetch("/api/support/replies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ticketId: activeTicketId,
          message: adminReplyText,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setAdminReplyText("");
        await loadAdminReplies(activeTicketId);
      } else {
        toast.error(data.error || "Failed to send reply.");
      }
    } catch (err) {
      toast.error("Failed to send reply.");
    } finally {
      setSendingAdminReply(false);
    }
  };

  const handleResolveTicket = async (ticketId: string) => {
    setResolvingTicketId(ticketId);
    try {
      const res = await fetch("/api/support", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticketId, status: "resolved" }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Support ticket marked as resolved.");
        await loadAdminTickets();
      } else {
        toast.error(data.error || "Failed to resolve ticket.");
      }
    } catch (err) {
      toast.error("Failed to resolve ticket.");
    } finally {
      setResolvingTicketId(null);
    }
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
    { id: "waitlist",       label: "Waitlist Panel",   icon: <Users size={14} />,        badge: waitlist.filter(w => w.status === "pending").length },
    { id: "pickups_today",  label: "Pickups Today",    icon: <Calendar size={14} />,    badge: stats.pickupsToday },
    { id: "returns_today",  label: "Returns Today",    icon: <Clock size={14} />,       badge: stats.returnsToday },
    { id: "active_rentals", label: "Active Rentals",   icon: <Camera size={14} />,      badge: stats.active },
    { id: "overdue",        label: "Overdue Alerts",   icon: <AlertTriangle size={14} />, badge: stats.overdue },
    { id: "inventory",      label: "Camera Inventory", icon: <Package size={14} /> },
    { id: "cms",            label: "CMS & settings",   icon: <Settings size={14} />,     ownerOnly: true },
    { id: "refunds",        label: "Refund Queue",     icon: <Coins size={14} />,        ownerOnly: true },
    { id: "maintenance",    label: "Maintenance Lab",  icon: <Clock size={14} /> },
    { id: "support",        label: "Support Desk",     icon: <MessageCircle size={14} />, badge: adminTickets.filter(t => t.status !== 'resolved').length },
    { id: "reports",        label: "Reports Terminal",  icon: <FileSpreadsheet size={14} />, ownerOnly: true },
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

                        {/* 3-Camera Occupancy Timeline Grid */}
                        <div className="admin-card opacity-0 glass-panel border-white/5 rounded-xl p-5 space-y-4">
                          <div>
                            <h3 className="text-xs uppercase font-mono tracking-widest text-gold-champagne">3-Camera Occupancy Timeline</h3>
                            <p className="text-[10px] text-muted-gray mt-0.5">Live visualization of camera allocations for the next 7 days</p>
                          </div>
                          
                          <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse text-[10px] font-mono">
                              <thead>
                                <tr>
                                  <th className="p-2 text-muted-gray uppercase text-[8px]">Camera Unit</th>
                                  {Array.from({ length: 7 }).map((_, i) => {
                                    const d = new Date();
                                    d.setDate(d.getDate() + i);
                                    return (
                                      <th key={i} className="p-2 text-center text-muted-gray text-[8px] border-l border-white/5 min-w-[70px]">
                                        {d.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                                      </th>
                                    );
                                  })}
                                </tr>
                              </thead>
                              <tbody>
                                {[
                                  { code: "CN-CAM-01", name: "Canon R5 (Unit A)", pId: "p1000000-0000-0000-0000-000000000001" },
                                  { code: "CN-CAM-02", name: "Canon R5 (Unit B)", pId: "p1000000-0000-0000-0000-000000000001" },
                                  { code: "NK-CAM-01", name: "Nikon Z8 (Unit A)", pId: "p1000000-0000-0000-0000-000000000003" },
                                ].map((cam) => (
                                  <tr key={cam.code} className="border-t border-white/5">
                                    <td className="p-2 font-semibold text-ivory">{cam.name}</td>
                                    {Array.from({ length: 7 }).map((_, dayIdx) => {
                                      const d = new Date();
                                      d.setDate(d.getDate() + dayIdx);
                                      const dStr = d.toISOString().split("T")[0];
                                      
                                      const isOccupied = bookings.some(b => {
                                        if (b.status === "cancelled" || b.status === "rejected") return false;
                                        if (dStr >= b.startDate && dStr <= b.endDate) {
                                          const hasCam = b.items.some((item: any) => item.productId === cam.pId);
                                          if (!hasCam) return false;
                                          
                                          if (cam.code === "CN-CAM-01") return true;
                                          if (cam.code === "CN-CAM-02") {
                                            const dayBookings = bookings.filter(ob => ob.status !== "cancelled" && ob.status !== "rejected" && dStr >= ob.startDate && dStr <= ob.endDate && ob.items.some((item: any) => item.productId === cam.pId));
                                            return dayBookings.length > 1;
                                          }
                                          return true;
                                        }
                                        return false;
                                      });
                                      
                                      return (
                                        <td key={dayIdx} className="p-2 border-l border-white/5 text-center">
                                          {isOccupied ? (
                                            <span className="bg-gold-champagne/10 text-gold-champagne border border-gold-border/30 px-2 py-0.5 rounded text-[8px] font-bold block uppercase">Booked</span>
                                          ) : (
                                            <span className="bg-white/5 text-muted-gray border border-white/5 px-2 py-0.5 rounded text-[8px] block uppercase">Free</span>
                                          )}
                                        </td>
                                      );
                                    })}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>

                        {/* Extra Stats: Utilization & Coupon Performance */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="admin-card opacity-0 glass-panel border-white/5 rounded-xl p-5 space-y-3">
                            <h4 className="text-[9px] uppercase font-mono tracking-widest text-gold-champagne">Fleet Utilization Stats</h4>
                            <div className="space-y-2 text-xs">
                              <div className="flex justify-between">
                                <span className="text-muted-gray">Avg Canon Utilization Rate:</span>
                                <span className="font-mono text-ivory">71%</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-gray">Avg Nikon Utilization Rate:</span>
                                <span className="font-mono text-ivory">64%</span>
                              </div>
                              <div className="flex justify-between border-t border-white/5 pt-2">
                                <span className="text-muted-gray">Total Unit-Days Booked:</span>
                                <span className="font-mono text-gold-champagne">18 Days</span>
                              </div>
                            </div>
                          </div>

                          <div className="admin-card opacity-0 glass-panel border-white/5 rounded-xl p-5 space-y-3">
                            <h4 className="text-[9px] uppercase font-mono tracking-widest text-gold-champagne">Coupon Performance</h4>
                            <div className="space-y-2 text-xs">
                              <div className="flex justify-between">
                                <span className="text-muted-gray">AUREVIA199 Applied:</span>
                                <span className="font-mono text-ivory">12 Times</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-gray">AUREVIA10 Applied:</span>
                                <span className="font-mono text-ivory">5 Times</span>
                              </div>
                              <div className="flex justify-between border-t border-white/5 pt-2">
                                <span className="text-muted-gray">Total Coupon Discounts Claimed:</span>
                                <span className="font-mono text-gold-champagne">₹2,388</span>
                              </div>
                            </div>
                          </div>
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
                                    <button onClick={() => setPickupBookingId(b.id)} className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 hover:bg-indigo-500/20 text-[10px] font-mono uppercase tracking-wider rounded-lg transition cursor-pointer">
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

                    {/* ── WAITLIST PANEL ── */}
                    {activeTab === "waitlist" && (
                      <div className="space-y-4">
                        {waitlist.length === 0 ? (
                          <div className="glass-panel border-white/5 rounded-xl p-12 text-center">
                            <Users size={28} className="text-muted-gray/30 mx-auto mb-3" />
                            <p className="text-sm text-muted-gray">No waitlist entries yet.</p>
                          </div>
                        ) : (
                          waitlist.map((entry) => (
                            <div key={entry.id} className={`admin-card opacity-0 glass-panel rounded-xl p-5 border transition ${entry.status === "pending" ? "border-gold-border/30" : "border-white/5 opacity-70"}`}>
                              <div className="flex flex-wrap items-start justify-between gap-3">
                                <div>
                                  <div className="flex items-center gap-2">
                                    <h3 className="text-xs font-mono font-semibold text-gold-champagne">{entry.id}</h3>
                                    <span className={`px-2 py-0.5 text-[8px] font-bold uppercase tracking-wider rounded border ${entry.status === "pending" ? "bg-amber-500/10 border-amber-500/30 text-amber-400" : entry.status === "approved" ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" : "bg-rose-500/10 border-rose-500/30 text-rose-400"}`}>
                                      {entry.status}
                                    </span>
                                  </div>
                                  <p className="text-sm font-semibold text-ivory mt-1">{entry.contactName}</p>
                                  <p className="text-[10px] text-muted-gray font-mono">{entry.contactPhone} · {entry.contactEmail}</p>
                                  <div className="mt-3 p-3 bg-black/20 rounded border border-white/5 space-y-1 text-[11px] font-mono text-muted-gray">
                                    <div>Requested: <span className="text-ivory">Canon EOS R5</span></div>
                                    <div>Dates: <span className="text-ivory">{entry.startDate} to {entry.endDate}</span></div>
                                    {entry.createdAt && <div>Created: <span className="text-muted-gray/70">{new Date(entry.createdAt).toLocaleString("en-IN")}</span></div>}
                                  </div>
                                </div>

                                {entry.status === "pending" && (
                                  <div className="flex items-center gap-2">
                                    <button
                                      onClick={() => handleResolveWaitlist(entry.id, "notified")}
                                      className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-obsidian text-[10px] font-bold uppercase tracking-wider rounded-lg transition cursor-pointer font-mono"
                                    >
                                      Approve Renter
                                    </button>
                                    <button
                                      onClick={() => handleResolveWaitlist(entry.id, "cancelled")}
                                      className="flex items-center gap-1.5 px-3 py-1.5 border border-rose-500/20 text-rose-400 hover:border-rose-500/40 text-[10px] font-bold uppercase tracking-wider rounded-lg transition cursor-pointer font-mono"
                                    >
                                      Reject
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))
                        )}
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

                    {/* ── CMS & SETTINGS ── */}
                    {activeTab === "cms" && isOwner && (
                      <div className="space-y-6">
                        {/* Preview Mode switch */}
                        <div className="flex items-center justify-between p-4 bg-white/5 border border-white/5 rounded-xl">
                          <div>
                            <p className="text-xs font-semibold text-ivory">CMS Preview & Live Toggle</p>
                            <p className="text-[10px] text-muted-gray">When enabled, draft website configurations will be rendered to clients for validation.</p>
                          </div>
                          <button
                            onClick={handleTogglePreviewMode}
                            className={`px-4 py-2 text-xs font-mono uppercase font-bold rounded-lg border transition cursor-pointer ${
                              previewMode
                                ? "bg-gold-champagne/20 border-gold-border text-gold-champagne shadow-[0_0_8px_rgba(184,139,67,0.3)]"
                                : "border-white/10 text-muted-gray hover:text-ivory"
                            }`}
                          >
                            {previewMode ? "Preview Mode: Active" : "Preview Mode: Off"}
                          </button>
                        </div>

                        {/* Announcement Bar CMS */}
                        <div className="admin-card opacity-0 glass-panel border-white/5 rounded-xl p-5 space-y-4">
                          <h4 className="text-xs uppercase font-mono tracking-widest text-gold-champagne">Announcement Bar</h4>
                          <div className="space-y-3">
                            <div className="space-y-1.5">
                              <label className="text-[9px] uppercase font-mono tracking-wider text-muted-gray block">Announcement Content</label>
                              <textarea
                                rows={2}
                                value={announcementText}
                                onChange={(e) => setAnnouncementText(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 text-xs rounded-lg p-2.5 focus:outline-none focus:border-gold-champagne/45 text-ivory font-mono"
                              />
                            </div>
                            <div className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                id="annActive"
                                checked={announcementActive}
                                onChange={(e) => setAnnouncementActive(e.target.checked)}
                                className="rounded bg-white/5 border-white/10 text-gold-champagne focus:ring-0 cursor-pointer"
                              />
                              <label htmlFor="annActive" className="text-[10px] uppercase font-mono text-muted-gray cursor-pointer">Active on Header Navigation</label>
                            </div>
                            <div className="flex gap-2 pt-2">
                              <button
                                type="button"
                                onClick={handleSaveAnnouncementDraft}
                                className="px-3.5 py-1.5 bg-white/10 hover:bg-white/15 text-[10px] font-mono uppercase text-gold-champagne rounded transition cursor-pointer"
                              >
                                Save Draft
                              </button>
                              <button
                                type="button"
                                onClick={handlePublishAnnouncement}
                                className="px-3.5 py-1.5 bg-gold-champagne hover:bg-gold-warm text-[10px] font-bold uppercase text-obsidian rounded transition cursor-pointer"
                              >
                                Publish Live
                              </button>
                              <button
                                type="button"
                                onClick={handleRollbackAnnouncement}
                                className="px-3.5 py-1.5 border border-white/10 hover:bg-white/5 text-[10px] font-mono uppercase text-muted-gray rounded transition cursor-pointer"
                              >
                                Rollback Version
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Testimonials List */}
                        <div className="admin-card opacity-0 glass-panel border-white/5 rounded-xl p-5 space-y-4">
                          <h4 className="text-xs uppercase font-mono tracking-widest text-muted-gray">Customer Testimonials</h4>
                          <div className="space-y-3">
                            {cmsTestimonials.map((t: any) => (
                              <div key={t.id} className="p-3 bg-black/25 border border-white/5 rounded-lg space-y-1.5">
                                <div className="flex justify-between items-center text-[10px] font-mono">
                                  <span className="text-gold-champagne font-bold">{t.authorName}</span>
                                  <span className="text-muted-gray/50">{t.role}</span>
                                </div>
                                <p className="text-xs text-ivory/80 italic font-light">"{t.quote}"</p>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* FAQ List */}
                        <div className="admin-card opacity-0 glass-panel border-white/5 rounded-xl p-5 space-y-4">
                          <h4 className="text-xs uppercase font-mono tracking-widest text-muted-gray">Frequently Asked Questions</h4>
                          <div className="space-y-3">
                            {cmsFaqs.map((faq: any) => (
                              <div key={faq.id} className="p-3.5 bg-black/20 border border-white/5 rounded-lg space-y-1">
                                <h5 className="text-xs font-semibold text-ivory font-mono">Q: {faq.question}</h5>
                                <p className="text-xs text-muted-gray font-light">A: {faq.answer}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* ── REFUND QUEUE ── */}
                    {activeTab === "refunds" && isOwner && (
                      <div className="space-y-4">
                        {refundsLoading ? (
                          <div className="space-y-3">
                            {[1,2].map(i => <div key={i} className="h-16 bg-white/5 rounded animate-pulse" />)}
                          </div>
                        ) : refundRequests.length === 0 ? (
                          <div className="glass-panel border-white/5 rounded-xl p-12 text-center">
                            <Coins size={28} className="text-muted-gray/30 mx-auto mb-2" />
                            <p className="text-sm text-muted-gray">No refund transactions pending approval.</p>
                          </div>
                        ) : (
                          refundRequests.map((r: any) => (
                            <div key={r.id} className="admin-card opacity-0 glass-panel border-white/5 rounded-xl p-5 flex flex-wrap items-center justify-between gap-4">
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-mono font-bold text-gold-champagne">REF-{r.id.slice(0, 8).toUpperCase()}</span>
                                  <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase ${
                                    r.status === "completed"
                                      ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                                      : r.status === "failed"
                                      ? "bg-rose-500/10 border-rose-500/20 text-rose-400"
                                      : "bg-amber-500/10 border-amber-500/20 text-amber-400"
                                  } border`}>
                                    {r.status}
                                  </span>
                                </div>
                                <p className="text-[10px] text-muted-gray mt-1.5 font-mono">Booking Ref: {r.booking_id} · Refund Source ID: {r.razorpay_refund_id || "Unresolved"}</p>
                                {r.reason && <p className="text-[10px] text-rose-400 mt-1 italic">Reason: "{r.reason}"</p>}
                              </div>

                              <div className="flex items-center gap-4 text-right">
                                <div>
                                  <p className="text-[8px] uppercase font-mono text-muted-gray/60">Refund Amount</p>
                                  <p className="text-sm font-semibold text-ivory">₹{r.amount.toLocaleString("en-IN")}</p>
                                </div>
                                {r.status === "pending" && (
                                  <div className="flex gap-2">
                                    <button
                                      onClick={() => handleProcessRefundRequest(r.id, "approve")}
                                      disabled={processingRefundId === r.id}
                                      className="px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-obsidian text-[10px] font-bold uppercase rounded-lg transition cursor-pointer"
                                    >
                                      {processingRefundId === r.id ? <Loader2 size={11} className="animate-spin" /> : "Approve Refund"}
                                    </button>
                                    <button
                                      onClick={() => handleProcessRefundRequest(r.id, "reject")}
                                      disabled={processingRefundId === r.id}
                                      className="px-3.5 py-1.5 border border-rose-500/20 hover:bg-rose-500/5 text-rose-400 text-[10px] font-mono uppercase rounded-lg transition cursor-pointer"
                                    >
                                      Reject
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    )}

                    {/* ── MAINTENANCE LAB ── */}
                    {activeTab === "maintenance" && (
                      <div className="space-y-6">
                        <div className="flex justify-between items-center bg-white/5 border border-white/5 rounded-xl p-4">
                          <div>
                            <p className="text-sm font-semibold text-ivory">Maintenance Checkouts & Lab Logs</p>
                            <p className="text-xs text-muted-gray">Track camera inspections, repair logs, and restore units to inventory.</p>
                          </div>
                          {!isLoggingMaint && (
                            <button
                              onClick={() => setIsLoggingMaint(true)}
                              className="px-4 py-2 bg-gold-champagne hover:bg-gold-warm text-obsidian text-xs font-bold uppercase rounded transition cursor-pointer"
                            >
                              Log Maintenance Checkout
                            </button>
                          )}
                        </div>

                        {/* Log Maintenance Checkout Form */}
                        {isLoggingMaint && (
                          <div className="glass-panel border-amber-500/20 rounded-xl p-5 bg-amber-500/5">
                            <h4 className="text-xs uppercase font-mono tracking-widest text-gold-champagne mb-4">Send Optics Unit to Maintenance</h4>
                            <form onSubmit={handleSendToMaintenance} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div className="space-y-1.5">
                                <label className="text-[9px] uppercase font-mono tracking-wider text-muted-gray block">Camera Unit</label>
                                <select
                                  required
                                  value={maintUnitId}
                                  onChange={(e) => setMaintUnitId(e.target.value)}
                                  className="w-full bg-black/45 border border-white/10 text-xs rounded-lg p-2.5 text-ivory focus:outline-none"
                                >
                                  <option value="">Select Unit...</option>
                                  {inventoryUnits.filter(u => u.status === "available").map((unit) => (
                                    <option key={unit.id} value={unit.id}>{unit.name} ({unit.serialNumber})</option>
                                  ))}
                                </select>
                              </div>

                              <div className="space-y-1.5">
                                <label className="text-[9px] uppercase font-mono tracking-wider text-muted-gray block">Service Provider / Lab</label>
                                <input
                                  type="text"
                                  placeholder="e.g. Canon Service Hub Bengaluru"
                                  value={maintProviderInput}
                                  onChange={(e) => setMaintProviderInput(e.target.value)}
                                  className="w-full bg-white/5 border border-white/10 text-xs rounded-lg p-2.5 focus:outline-none text-ivory"
                                />
                              </div>

                              <div className="space-y-1.5">
                                <label className="text-[9px] uppercase font-mono tracking-wider text-muted-gray block">Reason for Checkout</label>
                                <input
                                  type="text"
                                  required
                                  placeholder="e.g. Sensor cleaning, autofocus calibration"
                                  value={maintReasonInput}
                                  onChange={(e) => setMaintReasonInput(e.target.value)}
                                  className="w-full bg-white/5 border border-white/10 text-xs rounded-lg p-2.5 focus:outline-none text-ivory"
                                />
                              </div>

                              <div className="space-y-1.5">
                                <label className="text-[9px] uppercase font-mono tracking-wider text-muted-gray block">Expected Return Date</label>
                                <input
                                  type="date"
                                  value={maintExpectedReturnInput}
                                  onChange={(e) => setMaintExpectedReturnInput(e.target.value)}
                                  className="w-full bg-white/5 border border-white/10 text-xs rounded-lg p-2.5 focus:outline-none text-ivory font-mono"
                                />
                              </div>

                              <div className="col-span-2 flex gap-2 pt-2">
                                <button type="submit" className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-obsidian text-xs font-bold uppercase rounded-lg cursor-pointer">Check Out Unit</button>
                                <button type="button" onClick={() => setIsLoggingMaint(false)} className="px-4 py-2 border border-white/10 text-muted-gray text-xs font-mono uppercase rounded-lg cursor-pointer hover:text-ivory transition">Cancel</button>
                              </div>
                            </form>
                          </div>
                        )}

                        {/* Maintenance Log Records List */}
                        <div className="space-y-3">
                          {maintenanceUnits.length === 0 ? (
                            <div className="glass-panel border-white/5 rounded-xl p-12 text-center">
                              <Clock size={28} className="text-muted-gray/30 mx-auto mb-2" />
                              <p className="text-sm text-muted-gray">No camera units currently checked out for maintenance.</p>
                            </div>
                          ) : (
                            maintenanceUnits.map((m: any) => (
                              <div key={m.id} className="admin-card opacity-0 glass-panel border-white/5 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4 bg-black/25">
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs font-semibold text-ivory">{m.inventory_units?.name || m.unitId}</span>
                                    <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase ${
                                      m.status === "completed"
                                        ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                                        : "bg-amber-500/10 border-amber-500/20 text-amber-400"
                                    } border`}>
                                      {m.status === "completed" ? "inspected & ready" : "in repair"}
                                    </span>
                                  </div>
                                  <p className="text-[10px] text-muted-gray mt-1.5 font-mono">
                                    Lab: {m.serviceProvider || "Internal"} · Checkout: {new Date(m.checkedOutAt || m.checked_out_at).toLocaleDateString("en-IN")}
                                  </p>
                                  <p className="text-[10px] text-amber-400 mt-1">Reason: "{m.reason || m.checkoutReason}"</p>
                                </div>

                                <div className="flex items-center gap-4 text-right">
                                  {m.status === "active" ? (
                                    <button
                                      onClick={() => setCompletingMaintRecord(m)}
                                      className="px-3 py-1.5 bg-gold-champagne hover:bg-gold-warm text-obsidian text-[10px] font-bold uppercase rounded-lg transition cursor-pointer"
                                    >
                                      Complete Service Check-In
                                    </button>
                                  ) : (
                                    <div>
                                      <p className="text-[8px] uppercase font-mono text-muted-gray/60">Service Cost</p>
                                      <p className="text-sm font-semibold text-gold-champagne">₹{(m.cost || 0).toLocaleString("en-IN")}</p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    )}

                    {/* ── SUPPORT DESK ── */}
                    {activeTab === "support" && (
                      <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          {/* Tickets List */}
                          <div className="md:col-span-1 glass-panel border-white/5 rounded-xl p-4 space-y-3 bg-black/25">
                            <h4 className="text-[10px] uppercase font-mono tracking-widest text-gold-champagne mb-3">Active Tickets</h4>
                            {supportLoading ? (
                              <div className="space-y-2">
                                {[1,2,3].map(i => <div key={i} className="h-12 bg-white/5 rounded animate-pulse" />)}
                              </div>
                            ) : adminTickets.length === 0 ? (
                              <p className="text-xs text-muted-gray italic py-4 text-center">No tickets found.</p>
                            ) : (
                              <div className="space-y-2 overflow-y-auto max-h-[500px] pr-1.5">
                                {adminTickets.map((t: any) => (
                                  <div
                                    key={t.id}
                                    onClick={async () => {
                                      setActiveTicketId(t.id);
                                      await loadAdminReplies(t.id);
                                    }}
                                    className={`p-3 rounded-lg border text-left transition cursor-pointer ${
                                      activeTicketId === t.id
                                        ? "bg-gold-champagne/10 border-gold-border/30 text-gold-champagne"
                                        : "bg-white/3 border-white/5 hover:bg-white/5"
                                    }`}
                                  >
                                    <div className="flex justify-between items-start gap-2">
                                      <p className="text-xs font-semibold truncate leading-tight">{t.subject}</p>
                                    </div>
                                    <p className="text-[8px] font-mono text-muted-gray mt-1.5">
                                      Assigned: {t.assigned_to.split("@")[0].toUpperCase()} · {t.status.toUpperCase()}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* Conversation Thread */}
                          <div className="md:col-span-2 glass-panel border-white/5 rounded-xl p-5 space-y-4">
                            {activeTicketId ? (
                              (() => {
                                const ticket = adminTickets.find(t => t.id === activeTicketId);
                                if (!ticket) return null;
                                return (
                                  <div className="space-y-4">
                                    <div className="flex justify-between items-start border-b border-white/5 pb-3">
                                      <div>
                                        <span className="text-[8px] font-mono uppercase text-gold-champagne tracking-widest">Support Conversation Thread</span>
                                        <h4 className="text-sm font-semibold text-ivory mt-0.5">{ticket.subject}</h4>
                                        <p className="text-[10px] text-muted-gray mt-1 font-mono">Assigned to: {ticket.assigned_to} · Priority: {ticket.priority.toUpperCase()}</p>
                                      </div>
                                      <div className="flex gap-2">
                                        {ticket.status !== "resolved" && (
                                          <button
                                            onClick={() => handleResolveTicket(ticket.id)}
                                            disabled={resolvingTicketId === ticket.id}
                                            className="px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 text-[10px] font-mono uppercase rounded-lg transition cursor-pointer"
                                          >
                                            {resolvingTicketId === ticket.id ? <Loader2 size={11} className="animate-spin" /> : "Mark Resolved"}
                                          </button>
                                        )}
                                        <span className={`px-2.5 py-1 text-[9px] font-mono uppercase tracking-wider rounded-lg border ${
                                          ticket.status === "resolved"
                                            ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                                            : "bg-amber-500/10 border-amber-500/20 text-amber-400"
                                        }`}>
                                          {ticket.status}
                                        </span>
                                      </div>
                                    </div>

                                    <p className="text-xs text-ivory/80 leading-relaxed bg-white/2 p-3 rounded border border-white/5 font-light">
                                      {ticket.description}
                                    </p>

                                    {/* Replies */}
                                    <div className="space-y-3 pl-4 border-l border-white/5 max-h-[300px] overflow-y-auto pr-1">
                                      {adminReplies.length === 0 ? (
                                        <p className="text-xs text-muted-gray italic">No conversation replies yet.</p>
                                      ) : (
                                        adminReplies.map((rep: any) => {
                                          const isSupport = rep.sender_id !== ticket.profile_id;
                                          return (
                                            <div key={rep.id} className={`p-3 rounded-lg border text-xs max-w-lg ${
                                              isSupport
                                                ? "bg-gold-champagne/5 border-gold-border/20 self-end ml-auto"
                                                : "bg-white/5 border-white/10"
                                            }`}>
                                              <div className="flex justify-between items-center text-[9px] text-muted-gray mb-1.5 font-mono gap-4">
                                                <span className={isSupport ? "text-gold-champagne" : "text-ivory"}>
                                                  {isSupport ? `Support Agent (${rep.profiles?.full_name || "Aurevia Staff"})` : "Customer"}
                                                </span>
                                                <span>{new Date(rep.created_at).toLocaleString("en-IN")}</span>
                                              </div>
                                              <p className="leading-relaxed text-ivory/95 font-light">{rep.message}</p>
                                            </div>
                                          );
                                        })
                                      )}
                                    </div>

                                    {/* Send reply */}
                                    {ticket.status !== "resolved" && (
                                      <form onSubmit={handleSendAdminReply} className="space-y-2 mt-4 pt-3 border-t border-white/5">
                                        <textarea
                                          rows={3}
                                          required
                                          placeholder="Type your reply to customer..."
                                          value={adminReplyText}
                                          onChange={(e) => setAdminReplyText(e.target.value)}
                                          className="w-full bg-white/5 border border-white/10 text-xs rounded-lg p-2.5 text-ivory focus:outline-none focus:border-gold-champagne/50 placeholder:text-muted-gray/40 resize-none"
                                        />
                                        <button
                                          type="submit"
                                          disabled={sendingAdminReply}
                                          className="px-4 py-2 bg-gold-champagne hover:bg-gold-warm text-obsidian text-xs font-bold uppercase rounded-lg transition cursor-pointer flex items-center gap-2"
                                        >
                                          {sendingAdminReply ? <Loader2 size={12} className="animate-spin" /> : "Send Ticket Reply"}
                                        </button>
                                      </form>
                                    )}
                                  </div>
                                );
                              })()
                            ) : (
                              <div className="text-center py-16 space-y-2">
                                <MessageCircle size={32} className="text-muted-gray/25 mx-auto" />
                                <p className="text-xs text-muted-gray">Select an active ticket from the left panel to open the conversation thread.</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* ── REPORTS TERMINAL ── */}
                    {activeTab === "reports" && isOwner && (
                      <div className="space-y-5">
                        <div className="glass-panel border-white/5 rounded-xl p-6 bg-gold-champagne/5 relative overflow-hidden">
                          <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 opacity-5">
                            <FileSpreadsheet size={180} className="text-gold-champagne" />
                          </div>
                          <h3 className="text-xs uppercase font-mono tracking-widest text-gold-champagne mb-2">AUREVIA Reports & Metrics Terminal</h3>
                          <p className="text-xs text-muted-gray leading-relaxed max-w-lg font-light">
                            Generate and extract detailed audits of optics rentals, revenue cycles, repairs ledger, and coupon usage tracking. Select a metric stream below to download as CSV.
                          </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          {[
                            { label: "Bookings & Revenue Ledger", desc: "Detailed summary of all camera bookings, status codes, and total payable fees.", type: "bookings" },
                            { label: "Optics Maintenance Cycles", desc: "Service cost analysis, checked out logs, and condition history.", type: "maintenance" },
                            { label: "Refund Transaction Ledger", desc: "Cancellations cutoff status, estimated refunds, and Razorpay logs.", type: "refunds" }
                          ].map((rep) => (
                            <a
                              key={rep.type}
                              href={`/api/admin/reports?type=${rep.type}`}
                              download
                              className="glass-panel border-white/5 hover:border-gold-border/30 rounded-xl p-5 flex flex-col justify-between gap-4 transition group cursor-pointer"
                            >
                              <div className="space-y-2">
                                <div className="w-9 h-9 rounded-lg bg-gold-champagne/10 flex items-center justify-center text-gold-champagne group-hover:bg-gold-champagne/20 transition">
                                  <FileSpreadsheet size={16} />
                                </div>
                                <h4 className="text-xs font-semibold text-ivory">{rep.label}</h4>
                                <p className="text-[10px] text-muted-gray leading-relaxed font-light">{rep.desc}</p>
                              </div>
                              <div className="flex items-center gap-1 text-[9px] text-gold-champagne uppercase font-mono font-bold mt-2">
                                <FileDown size={11} /> Download CSV
                              </div>
                            </a>
                          ))}
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

            {/* ── Pickup Handover Checklist Modal ── */}
            {pickupBookingId && (
              <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div className="glass-panel border-white/10 rounded-xl max-w-md w-full p-6 space-y-6 relative bg-obsidian shadow-2xl">
                  <button
                    onClick={() => setPickupBookingId(null)}
                    className="absolute right-4 top-4 text-muted-gray hover:text-ivory transition cursor-pointer"
                  >
                    <X size={16} />
                  </button>
                  
                  <div className="space-y-2 border-b border-white/5 pb-3">
                    <span className="text-[8px] text-gold-champagne uppercase font-mono tracking-widest block">Digital Handover Checklist</span>
                    <h3 className="serif-heading text-base font-light text-ivory">Pickup Handover Checklist</h3>
                  </div>

                  <div className="space-y-4 text-xs font-light">
                    <p className="text-muted-gray leading-normal">Verify and check each item before handing over the gear unit to the customer.</p>
                    
                    <div className="space-y-2 bg-white/3 rounded-lg p-4 border border-white/5">
                      {[
                        { key: "body", label: "Camera Body (Serial matched physically)" },
                        { key: "lens", label: "Optics / Lens Glass check (Clean, scratch-free)" },
                        { key: "battery", label: "Batteries (Charged, tested)" },
                        { key: "charger", label: "Power Adapter / Charger included" },
                        { key: "memoryCard", label: "High-speed SD Card included" },
                        { key: "bag", label: "Premium Carry Bag included" },
                        { key: "accessories", label: "Straps, lens caps verified" }
                      ].map((item) => (
                        <div key={item.key} className="flex items-center gap-2.5">
                          <input
                            type="checkbox"
                            id={`pkCheck-${item.key}`}
                            checked={pickupChecklist[item.key]}
                            onChange={(e) => setPickupChecklist(prev => ({ ...prev, [item.key]: e.target.checked }))}
                            className="rounded bg-white/5 border-white/10 text-gold-champagne focus:ring-0 cursor-pointer"
                          />
                          <label htmlFor={`pkCheck-${item.key}`} className="text-[11px] text-ivory font-mono cursor-pointer select-none">
                            {item.label}
                          </label>
                        </div>
                      ))}
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[9px] uppercase font-mono text-muted-gray block">Customer Handover OTP</label>
                      <input
                        type="text"
                        placeholder="Enter 6-digit OTP code"
                        maxLength={6}
                        value={pickupOTPInput}
                        onChange={(e) => setPickupOTPInput(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 text-xs rounded-lg p-2.5 text-ivory focus:outline-none focus:border-gold-champagne/45 font-mono text-center tracking-[0.2em] text-lg font-bold"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[9px] uppercase font-mono text-muted-gray block">Handover Remarks</label>
                      <input
                        type="text"
                        placeholder="e.g. Scratches on lens hood, fully functional"
                        value={pickupRemarks}
                        onChange={(e) => setPickupRemarks(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 text-xs rounded-lg p-2.5 focus:outline-none text-ivory"
                      />
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={async () => {
                        const allChecked = Object.values(pickupChecklist).every(Boolean);
                        if (!allChecked) {
                          toast.error("Handover checklist error: Verify all equipment items before handover.");
                          return;
                        }
                        if (pickupOTPInput.length < 6) {
                          toast.error("Please enter the customer's 6-digit handover OTP.");
                          return;
                        }
                        setUpdatingId(pickupBookingId);
                        try {
                          await db.confirmHandover(pickupBookingId || "", pickupOTPInput, pickupRemarks, true);
                          toast.success("Optics gear successfully handed over — rental active.");
                          setPickupBookingId(null);
                          setPickupOTPInput("");
                          setPickupRemarks("");
                          setPickupChecklist({
                            body: false, lens: false, battery: false, charger: false, memoryCard: false, bag: false, accessories: false
                          });
                          await loadData();
                        } catch (err: any) {
                          toast.error(err.message || "Failed to confirm handover.");
                        } finally {
                          setUpdatingId(null);
                        }
                      }}
                      disabled={updatingId !== null}
                      className="flex-1 py-2.5 bg-gold-champagne hover:bg-gold-warm text-obsidian text-xs font-bold uppercase rounded-lg transition cursor-pointer text-center flex items-center justify-center gap-1.5"
                    >
                      {updatingId ? <Loader2 size={13} className="animate-spin" /> : "Confirm Handover & Start Rental"}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ── Return Checklist Return Modal ── */}
            {returningId && (
              <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setReturningId(null)}>
                <div className="glass-panel border-white/10 rounded-xl max-w-md w-full p-6 space-y-5 relative bg-obsidian shadow-2xl" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => setReturningId(null)}
                    className="absolute right-4 top-4 text-muted-gray hover:text-ivory transition cursor-pointer"
                  >
                    <X size={16} />
                  </button>
                  
                  <div className="space-y-2 border-b border-white/5 pb-3">
                    <span className="text-[8px] text-purple-400 uppercase font-mono tracking-widest block">Digital Return Inspection</span>
                    <h3 className="serif-heading text-base font-light text-ivory">Return Checklist & Penalty Calculator</h3>
                  </div>

                  <div className="space-y-4 text-xs font-light">
                    <div className="space-y-2 bg-white/3 rounded-lg p-3.5 border border-white/5">
                      {[
                        { key: "body", label: "Camera Body verified undamaged" },
                        { key: "lens", label: "Optics / Lens Glass scratch-free" },
                        { key: "battery", label: "Batteries returned" },
                        { key: "charger", label: "Power Adapter / Charger returned" },
                        { key: "memoryCard", label: "High-speed SD Card returned" },
                        { key: "bag", label: "Premium Carry Bag returned" },
                        { key: "accessories", label: "Straps, lens caps verified" }
                      ].map((item) => (
                        <div key={item.key} className="flex items-center gap-2.5">
                          <input
                            type="checkbox"
                            id={`retCheck-${item.key}`}
                            checked={returnChecklist[item.key]}
                            onChange={(e) => setReturnChecklist(prev => ({ ...prev, [item.key]: e.target.checked }))}
                            className="rounded bg-white/5 border-white/10 text-gold-champagne focus:ring-0 cursor-pointer"
                          />
                          <label htmlFor={`retCheck-${item.key}`} className="text-[11px] text-ivory font-mono cursor-pointer select-none">
                            {item.label}
                          </label>
                        </div>
                      ))}
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[9px] uppercase font-mono text-muted-gray block">Camera Condition</label>
                      <div className="flex gap-2">
                        {(["good", "damaged"] as const).map((c) => (
                          <button
                            key={c}
                            type="button"
                            onClick={() => setReturnCondition(c)}
                            className={`flex-1 py-2 border text-[10px] font-mono uppercase rounded-lg transition cursor-pointer ${
                              returnCondition === c
                                ? (c === "good" ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-400" : "border-rose-500/50 bg-rose-500/10 text-rose-400")
                                : "border-white/10 text-muted-gray hover:text-ivory"
                            }`}
                          >
                            {c}
                          </button>
                        ))}
                      </div>
                    </div>

                    {returnCondition === "damaged" && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-rose-500/5 border border-rose-500/10 rounded-lg animate-fadeIn">
                        <div className="space-y-1.5">
                          <label className="text-[9px] uppercase font-mono text-rose-400 block">Damage Description</label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Scratched front glass element"
                            value={damageDesc}
                            onChange={(e) => setDamageDesc(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 text-xs rounded-lg p-2 focus:outline-none text-ivory"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[9px] uppercase font-mono text-rose-400 block">Damage Cost (₹)</label>
                          <input
                            type="number"
                            required
                            min={0}
                            value={damageCost}
                            onChange={(e) => setDamageCost(Number(e.target.value))}
                            className="w-full bg-white/5 border border-white/10 text-xs rounded-lg p-2 focus:outline-none text-ivory font-mono"
                          />
                        </div>
                      </div>
                    )}

                    <div className="space-y-3 bg-white/3 rounded-lg p-4 font-mono text-[10px]">
                      <p className="text-gold-champagne uppercase tracking-wider font-bold border-b border-white/5 pb-1 mb-2">Late Fee Calculator</p>
                      {(() => {
                        const booking = bookings.find(b => b.id === returningId);
                        if (!booking) return null;
                        const end = new Date(booking.endDate);
                        const now = new Date();
                        const diffTime = Math.max(0, now.getTime() - end.getTime());
                        const lateDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                        const recommendedLateFee = 799 * lateDays;
                        return (
                          <div className="space-y-1.5 text-muted-gray">
                            <p>Booking End Date: <span className="text-ivory">{booking.endDate}</span></p>
                            <p>Days Overdue: <span className="text-ivory">{lateDays} days</span></p>
                            <p>Recommended Overdue Fee: <span className="text-ivory font-bold">₹{recommendedLateFee.toLocaleString("en-IN")}</span></p>
                            <div className="space-y-1.5 pt-2 border-t border-white/5">
                              <label className="text-[9px] uppercase font-mono text-muted-gray block">Override / Assessed Late Fee (₹)</label>
                              <input
                                type="number"
                                min={0}
                                value={lateFeeInput}
                                onChange={(e) => setLateFeeInput(Number(e.target.value))}
                                className="w-full bg-black/45 border border-white/10 text-xs rounded-lg p-2 text-ivory focus:outline-none focus:border-gold-champagne/45 font-mono"
                              />
                            </div>
                          </div>
                        );
                      })()}
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[9px] uppercase font-mono text-muted-gray block">Return Remarks</label>
                      <textarea
                        rows={2}
                        value={returnRemarks}
                        onChange={(e) => setReturnRemarks(e.target.value)}
                        placeholder="Optional return inspection notes..."
                        className="w-full bg-white/5 border border-white/10 text-xs rounded-lg p-2.5 focus:outline-none focus:border-gold-champagne/45 text-ivory resize-none"
                      />
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={async () => {
                        const allChecked = Object.values(returnChecklist).every(Boolean);
                        if (!allChecked) {
                          toast.error("Return check error: All checklist items must be physically verified before check-in.");
                          return;
                        }
                        setUpdatingId(returningId || "");
                        try {
                          await db.processReturn(returningId || "", returnCondition, damageDesc, damageCost, returnRemarks, lateFeeInput);
                          const totalPenalty = (returnCondition === "damaged" ? damageCost : 0) + lateFeeInput;
                          if (totalPenalty > 0) {
                            const res = await fetch("/api/admin/penalty-link", {
                              method: "POST",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({
                                bookingId: returningId,
                                amount: totalPenalty,
                                description: `Aurevia: Late Return (₹${lateFeeInput}) / Damage (₹${damageCost})`
                              })
                            });
                            const data = await res.json();
                            if (data.success) {
                              toast.success(`Check-in completed. Penalty payment link generated & sent to renter.`);
                            } else {
                              toast.warning("Check-in completed, but failed to generate payment link.");
                            }
                          } else {
                            toast.success("Optics gear successfully checked in — rental complete.");
                          }
                          setReturningId(null);
                          setReturnCondition("good");
                          setDamageDesc("");
                          setDamageCost(0);
                          setReturnRemarks("");
                          setLateFeeInput(0);
                          setReturnChecklist({
                            body: false, lens: false, battery: false, charger: false, memoryCard: false, bag: false, accessories: false
                          });
                          await loadData();
                        } catch (err: any) {
                          toast.error(err.message || "Failed to process return.");
                        } finally {
                          setUpdatingId(null);
                        }
                      }}
                      disabled={updatingId !== null}
                      className="flex-1 py-2.5 bg-purple-500 hover:bg-purple-600 text-white text-xs font-bold uppercase rounded-lg transition cursor-pointer text-center font-semibold"
                    >
                      {updatingId ? <Loader2 size={13} className="animate-spin" /> : "Complete Inspection & Check-in"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setReturningId(null)}
                      className="px-4 py-2 border border-white/10 text-muted-gray text-xs font-mono uppercase rounded-lg cursor-pointer hover:text-ivory transition"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ── Complete Maintenance Inspection Modal ── */}
            {completingMaintRecord && (
              <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div className="glass-panel border-white/10 rounded-xl max-w-sm w-full p-6 space-y-4 relative bg-obsidian shadow-2xl">
                  <button
                    onClick={() => setCompletingMaintRecord(null)}
                    className="absolute right-4 top-4 text-muted-gray hover:text-ivory transition cursor-pointer"
                  >
                    <X size={16} />
                  </button>
                  
                  <div className="space-y-1 pb-2 border-b border-white/5">
                    <span className="text-[8px] text-gold-champagne uppercase font-mono tracking-widest">Maintenance Complete</span>
                    <h3 className="serif-heading text-sm font-semibold text-ivory">Log Service Complete</h3>
                  </div>

                  <form onSubmit={handleCompleteMaintenance} className="space-y-4 text-xs font-light">
                    <div className="space-y-1.5">
                      <label className="text-[9px] uppercase font-mono text-muted-gray block">Service / Repair Cost (₹)</label>
                      <input
                        type="number"
                        required
                        min={0}
                        value={maintCostInput}
                        onChange={(e) => setMaintCostInput(Number(e.target.value))}
                        className="w-full bg-white/5 border border-white/10 text-xs rounded-lg p-2.5 text-ivory focus:outline-none focus:border-gold-champagne/45 font-mono"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[9px] uppercase font-mono text-muted-gray block">Unit Condition After Service</label>
                      <select
                        required
                        value={maintConditionAfter}
                        onChange={(e) => setMaintConditionAfter(e.target.value as any)}
                        className="w-full bg-black/45 border border-white/10 text-xs rounded-lg p-2.5 text-ivory focus:outline-none focus:border-gold-champagne/50"
                      >
                        <option value="excellent" className="bg-obsidian">Excellent</option>
                        <option value="good" className="bg-obsidian">Good</option>
                        <option value="fair" className="bg-obsidian">Fair</option>
                        <option value="damaged" className="bg-obsidian">Damaged</option>
                      </select>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2.5 bg-gold-champagne hover:bg-gold-warm text-obsidian text-xs font-bold uppercase rounded-lg transition cursor-pointer flex items-center justify-center gap-2"
                    >
                      Save Service Check-In
                    </button>
                  </form>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </AuthGuard>
  );
}
