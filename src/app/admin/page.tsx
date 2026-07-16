"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/navigation/Navbar";
import { useCart } from "@/hooks/useCart";
import { useToast } from "@/hooks/useToast";
import { useAdminRealtime } from "@/hooks/useAdminRealtime";
import { updateBookingStatusAction } from "@/lib/actions/bookings";
import { NotificationBell } from "@/components/ui/NotificationBell";
type BookingStatus =
  | "pending_payment"
  | "paid"
  | "approval_pending"
  | "approved"
  | "ready_for_pickup"
  | "rented"
  | "returned"
  | "completed"
  | "rejected"
  | "cancelled"
  | "payment_failed"
  | "overdue"
  | "maintenance";
import {
  ShieldAlert, Coins, FileSpreadsheet, FileDown, RefreshCw,
  Search, Check, X, ArrowUpRight, ClipboardList, Package, Loader2,
  Camera, User, Clock, Key, AlertTriangle, Trash2, History, Sparkles,
  Calendar, CheckSquare, Eye
} from "lucide-react";
import {
  ResponsiveContainer, LineChart, Line, BarChart, Bar,
  PieChart, Pie, Cell, XAxis, YAxis, Tooltip, CartesianGrid,
} from "recharts";
import { animate, stagger } from "animejs";
import { db } from "@/lib/db/store";

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

const COLORS = ["#D8B36A", "#B98A43", "#F5F1E8", "#9A9995"];

type AdminTab =
  | "overview"
  | "pickups_today"
  | "returns_today"
  | "approval_queue"
  | "ready_pickup"
  | "active_rentals"
  | "overdue"
  | "deposits"
  | "maintenance"
  | "audit_logs";

export default function AdminDashboard() {
  const { cart } = useCart();
  const toast = useToast();
  const { bookings: rawBookings, loading, alerts, unreadCount, markAllRead, dismissAlert, refresh } = useAdminRealtime();
  const bookings = rawBookings as any[];

  // Sidebar & Search filters
  const [activeTab, setActiveTab] = useState<AdminTab>("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Upgrade admin states
  const [inventoryUnits, setInventoryUnits] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  
  // Handover (OTP Checklist) modal states
  const [handoverBooking, setHandoverBooking] = useState<any | null>(null);
  const [enteredOtp, setEnteredOtp] = useState("");
  const [checkIdVerified, setCheckIdVerified] = useState(false);
  const [checkSerialMatched, setCheckSerialMatched] = useState(false);
  const [checkAccessories, setCheckAccessories] = useState({
    lensCap: false,
    strap: false,
    battery: false,
    charger: false,
    sdCard: false,
  });
  const [handoverNotes, setHandoverNotes] = useState("");

  // Return Inspection modal states
  const [returnModalBooking, setReturnModalBooking] = useState<any | null>(null);
  const [returnCondition, setReturnCondition] = useState<"good" | "damaged">("good");
  const [damageDescription, setDamageDescription] = useState("");
  const [damageCost, setDamageCost] = useState(0);
  const [calculatedLateFee, setCalculatedLateFee] = useState(0);
  const [returnAccessoriesChecked, setReturnAccessoriesChecked] = useState({
    lensCap: false,
    strap: false,
    battery: false,
    charger: false,
    sdCard: false,
  });

  const refreshInventoryUnits = () => {
    const units = db.getInventoryUnits();
    setInventoryUnits(units);
  };

  const refreshAuditLogs = () => {
    // Collect all audit logs from mock database
    const logs: any[] = [];
    bookings.forEach((b) => {
      if (b.auditLogs) {
        b.auditLogs.forEach((log: any) => {
          logs.push({
            ...log,
            bookingRef: b.reference_code || b.referenceCode,
            bookingId: b.id,
            renter: b.contact_name || b.contactName
          });
        });
      }
    });
    // Sort chronologically reverse
    logs.sort((x, y) => new Date(y.timestamp).getTime() - new Date(x.timestamp).getTime());
    setAuditLogs(logs);
  };

  useEffect(() => {
    refreshInventoryUnits();
    refreshAuditLogs();
  }, [bookings]);

  // Audio notifier triggers on new booking alerts
  useEffect(() => {
    if (unreadCount > 0) {
      try {
        const audio = new Audio("https://assets.mixkit.co/active_storage/sfx/2869/2869-200.wav");
        audio.volume = 0.15;
        audio.play().catch(() => {});
      } catch {}
    }
  }, [unreadCount]);

  useEffect(() => {
    setTimeout(() => {
      animate(".admin-item", {
        opacity: [0, 1],
        translateY: [15, 0],
        delay: stagger(40),
        duration: 500,
        easing: "easeOutQuad",
      });
    }, 50);
  }, [bookings.length, activeTab]);

  // Computed stats from LIVE data (excluding deposits)
  const stats = {
    // Exclude security deposit from rental revenue!
    revenueTotal: bookings
      .filter((b) => b.payment_status === "paid" || b.paymentStatus === "paid")
      .reduce((s, b) => s + ((b.totalPayable || b.total_payable || 0) - (b.securityDeposit || b.security_deposit || 0)), 0),
    revenueMonth: bookings
      .filter((b) => (b.payment_status === "paid" || b.paymentStatus === "paid") && new Date(b.created_at || b.createdAt).getMonth() === new Date().getMonth())
      .reduce((s, b) => s + ((b.totalPayable || b.total_payable || 0) - (b.securityDeposit || b.security_deposit || 0)), 0),
    depositHeldTotal: bookings
      .filter((b) => ["paid", "approval_pending", "approved", "ready_for_pickup", "rented", "overdue"].includes(b.status) && b.depositStatus === "Collected")
      .reduce((s, b) => s + (b.securityDeposit || 0), 0),
    bookingsTotalCount: bookings.length,
    bookingsPendingCount: bookings.filter((b) => b.status === "approval_pending").length,
    bookingsConfirmedCount: bookings.filter((b) => b.status === "approved" || b.status === "ready_for_pickup").length,
    utilizationRate: inventoryUnits.length > 0 ? Math.round((inventoryUnits.filter((u) => u.status === "rented").length / inventoryUnits.length) * 100) : 0,
  };

  // Revenue trend by month (excluding deposits)
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const revenueTrend = months.map((m, i) => ({
    date: m,
    amount: bookings
      .filter((b) => new Date(b.created_at || b.createdAt).getMonth() === i && (b.payment_status === "paid" || b.paymentStatus === "paid"))
      .reduce((s, b) => s + ((b.totalPayable || b.total_payable || 0) - (b.securityDeposit || b.security_deposit || 0)), 0),
  }));

  // Direct status transition helper
  const handleUpdateStatus = async (bookingId: string, newStatus: BookingStatus, notes = "") => {
    const label = newStatus.replace("_", " ").toUpperCase();
    if (!confirm(`Transition this booking status to ${label}?`)) return;

    setUpdatingId(bookingId);
    
    // In local dev fallback mode, call mock store directly
    const isSupabase = process.env.NEXT_PUBLIC_SUPABASE_URL && !process.env.NEXT_PUBLIC_SUPABASE_URL.includes("your-project-id");
    if (!isSupabase) {
      await db.updateBookingStatus(bookingId, newStatus, notes || `Status updated by Admin to ${newStatus}.`, "admin");
      toast.success(`Booking transitioned to ${label}.`);
      refresh();
      refreshInventoryUnits();
      setUpdatingId(null);
      return;
    }

    const result = await updateBookingStatusAction(bookingId, newStatus as any);
    if (result.success) {
      toast.success(`Booking transitioned to ${label}.`);
      refresh();
    } else {
      toast.error(result.error ?? "Failed to update booking status.");
    }
    setUpdatingId(null);
  };

  // Enable/Disable maintenance state
  const handleToggleMaintenance = async (unitId: string, currentStatus: string) => {
    const nextStatus = currentStatus === "maintenance" ? "available" : "maintenance";
    await db.updateInventoryUnitStatus(unitId, nextStatus);
    toast.success(`Camera unit marked as ${nextStatus}.`);
    refreshInventoryUnits();
    refresh();
  };

  // Admin unit manual override reassignment
  const handleReassignUnit = async (bookingId: string, productId: string, newUnitId: string) => {
    const success = await db.reassignBookingUnit(bookingId, productId, newUnitId);
    if (success) {
      toast.success("Camera unit successfully reassigned.");
      refreshInventoryUnits();
      refresh();
    } else {
      toast.error("Reassignment failed. Overlapping booking conflict detected on this unit.");
    }
  };

  // Launch Handover OTP Checklist modal
  const openHandoverModal = (booking: any) => {
    setHandoverBooking(booking);
    setEnteredOtp("");
    setCheckIdVerified(false);
    setCheckSerialMatched(false);
    setCheckAccessories({
      lensCap: false,
      strap: false,
      battery: false,
      charger: false,
      sdCard: false,
    });
    setHandoverNotes("");
  };

  // Confirm secure physical handover
  const handleConfirmHandover = async () => {
    if (!handoverBooking) return;
    
    if (enteredOtp !== handoverBooking.pickupOTP) {
      toast.error("Handover OTP code is invalid. Please double check customer dashboard.");
      return;
    }

    if (!checkIdVerified) {
      toast.error("You must physically verify customer's identification documents first.");
      return;
    }

    if (!checkSerialMatched) {
      toast.error("You must verify camera unit serial matches assigned booking serial.");
      return;
    }

    const unchecked = Object.values(checkAccessories).some(v => !v);
    if (unchecked) {
      if (!confirm("Some standard accessories are not checked. Proceed with handover?")) return;
    }

    setUpdatingId(handoverBooking.id);
    try {
      const accessoryChecklist = Object.keys(checkAccessories).filter(k => (checkAccessories as any)[k]);
      const remarks = `Verified ID physically. Checked accessories: ${accessoryChecklist.join(", ")}. Notes: ${handoverNotes}`;
      
      await db.confirmHandover(handoverBooking.id, enteredOtp, remarks, true);
      toast.success(`Equipment handover confirmed. Status transitioned to Rented!`);
      
      // Send mock messaging notification
      toast.info("Aurevia WhatsApp Trigger: 'Gear collected successfully. Late fee ₹999/day for delays.'");
      
      setHandoverBooking(null);
      refreshInventoryUnits();
      refresh();
    } catch (e: any) {
      toast.error(e.message || "Failed to confirm handover.");
    } finally {
      setUpdatingId(null);
    }
  };

  // Launch return inspection modal
  const openReturnModal = (booking: any) => {
    setReturnModalBooking(booking);
    setReturnCondition("good");
    setDamageDescription("");
    setDamageCost(0);
    setReturnAccessoriesChecked({
      lensCap: true,
      strap: true,
      battery: true,
      charger: true,
      sdCard: true,
    });

    // Overdue late return fee calculation: ₹999/day
    const today = new Date();
    today.setHours(0,0,0,0);
    const expectedReturn = new Date(booking.end_date || booking.endDate);
    expectedReturn.setHours(0,0,0,0);

    let lateFee = 0;
    if (today > expectedReturn) {
      const diffTime = today.getTime() - expectedReturn.getTime();
      const overdueDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      lateFee = overdueDays * 999;
    }
    setCalculatedLateFee(lateFee);
  };

  // Complete return inspection checklist
  const handleConfirmReturn = async () => {
    if (!returnModalBooking) return;
    setUpdatingId(returnModalBooking.id);

    try {
      const returnedAccessoriesList = Object.keys(returnAccessoriesChecked).filter(k => (returnAccessoriesChecked as any)[k]);
      
      await db.processReturn(
        returnModalBooking.id,
        returnCondition,
        damageDescription,
        damageCost,
        returnedAccessoriesList.join(", ")
      );
      
      toast.success("Equipment return processed. Inventory unit updated!");
      
      // Refund message alert
      if (returnCondition === "good" && calculatedLateFee === 0) {
        toast.info("Security Deposit Action: Refund status moved to Fully Refunded.");
      } else {
        toast.info("Security Deposit Action: Deposit held pending damage/late fee deductions.");
      }

      setReturnModalBooking(null);
      refreshInventoryUnits();
      refresh();
    } catch (e: any) {
      toast.error(e.message || "Failed to process return.");
    } finally {
      setUpdatingId(null);
    }
  };

  // Process deposit actions manually
  const handleProcessDepositStatus = async (bookingId: string, action: "refund_full" | "refund_partial" | "deduct_full") => {
    const booking = bookings.find(b => b.id === bookingId);
    if (!booking) return;

    let nextStatus: any = "fully_refunded";
    let message = "Refunded entire security deposit to customer bank account.";
    if (action === "refund_partial") {
      const deduct = prompt("Enter deduction amount (INR):", "1000");
      if (deduct === null) return;
      nextStatus = "partially_refunded";
      message = `Refunded deposit after deducting damage/late charges of ₹${deduct}.`;
    } else if (action === "deduct_full") {
      if (!confirm("Forfeit/deduct the entire security deposit?")) return;
      nextStatus = "deducted";
      message = `Forfeited entire security deposit of ₹${booking.securityDeposit} due to severe loss or damage.`;
    }

    setUpdatingId(bookingId);
    await db.updateDepositStatus(bookingId, nextStatus, message);
    toast.success(`Deposit status updated to: ${nextStatus.replace("_", " ")}`);
    refresh();
    setUpdatingId(null);
  };

  // Filter bookings based on active sidebar tab
  const getFilteredBookings = () => {
    const q = searchQuery.toLowerCase();
    
    // Base search matches
    const baseList = bookings.filter((b) => {
      return (
        (b.reference_code || b.referenceCode || "").toLowerCase().includes(q) ||
        (b.contact_name || b.contactName || "").toLowerCase().includes(q) ||
        (b.contact_phone || b.contactPhone || "").includes(q)
      );
    });

    const todayStr = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

    switch (activeTab) {
      case "pickups_today":
        return baseList.filter((b) => (b.status === "ready_for_pickup" || b.status === "approved") && (b.start_date || b.startDate) === todayStr);
      case "returns_today":
        return baseList.filter((b) => (b.status === "rented" || b.status === "overdue") && (b.end_date || b.endDate) === todayStr);
      case "approval_queue":
        return baseList.filter((b) => b.status === "approval_pending");
      case "ready_pickup":
        return baseList.filter((b) => b.status === "ready_for_pickup");
      case "active_rentals":
        return baseList.filter((b) => b.status === "rented" || b.status === "overdue");
      case "overdue":
        return baseList.filter((b) => b.status === "overdue" || (b.status === "rented" && new Date() > new Date(b.end_date || b.endDate)));
      case "deposits":
        return baseList.filter((b) => b.securityDeposit > 0 && b.status !== "cancelled" && b.status !== "rejected");
      default:
        return baseList;
    }
  };

  const filteredBookings = getFilteredBookings();

  // Calendar helpers
  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth();
  const daysCount = getDaysInMonth(currentYear, currentMonth);
  const daysArray = Array.from({ length: daysCount }, (_, i) => i + 1);

  const getMonthName = (monthIdx: number) => {
    return ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"][monthIdx];
  };

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
            onClick={() => toast.info("Excel CSV generated for accounting dashboard.")}
            className="p-2 border border-white/10 rounded hover:bg-white/5 text-ivory transition flex items-center gap-1.5 text-xs cursor-pointer"
          >
            <FileSpreadsheet size={13} />
            CSV
          </button>

          <button
            onClick={() => toast.info("PDF document format exported.")}
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
              label: "Net Rental Revenue",
              value: `₹${stats.revenueTotal.toLocaleString("en-IN")}`,
              sub: `This month: ₹${stats.revenueMonth.toLocaleString("en-IN")}`,
              icon: <Coins size={14} className="text-gold-champagne" />,
              gold: true,
            },
            {
              label: "Refundable Deposits Held",
              value: `₹${stats.depositHeldTotal.toLocaleString("en-IN")}`,
              sub: "Kept out of operational revenue",
              icon: <Sparkles size={14} className="text-emerald-400" />,
            },
            {
              label: "Utilization Rate",
              value: `${stats.utilizationRate}%`,
              sub: "Physical units out in field",
              icon: <ArrowUpRight size={14} className="text-gold-champagne" />,
            },
            {
              label: "Pending Approvals",
              value: bookings.filter((b) => b.status === "approval_pending").length || "—",
              sub: "Awaiting customer vetting",
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

        {/* Navigation Sidebar & Operational Grids */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
          
          {/* Operations sidebar selector */}
          <div className="lg:col-span-1 glass-panel border-white/5 rounded-lg p-4 space-y-2">
            <span className="text-[9px] text-muted-gray uppercase font-mono tracking-widest block mb-2 px-2">Operational Grids</span>
            {[
              { id: "overview",        label: "Metrics & Calendar", count: null },
              { id: "pickups_today",    label: "Today's Pickups",    count: bookings.filter((b) => (b.status === "ready_for_pickup" || b.status === "approved") && (b.start_date || b.startDate) === new Date().toISOString().split("T")[0]).length },
              { id: "returns_today",    label: "Today's Returns",    count: bookings.filter((b) => (b.status === "rented" || b.status === "overdue") && (b.end_date || b.endDate) === new Date().toISOString().split("T")[0]).length },
              { id: "approval_queue",   label: "Approval Queue",     count: bookings.filter((b) => b.status === "approval_pending").length },
              { id: "ready_pickup",     label: "Ready for Pickup",   count: bookings.filter((b) => b.status === "ready_for_pickup").length },
              { id: "active_rentals",   label: "Active Rentals",     count: bookings.filter((b) => b.status === "rented" || b.status === "overdue").length },
              { id: "overdue",          label: "Overdue Alerts",     count: bookings.filter((b) => b.status === "overdue" || (b.status === "rented" && new Date() > new Date(b.end_date || b.endDate))).length },
              { id: "deposits",         label: "Security Deposits",  count: bookings.filter((b) => b.depositStatus === "Collected" || b.depositStatus === "Pending").length },
              { id: "maintenance",      label: "Maintenance Log",    count: inventoryUnits.filter((u) => u.status === "maintenance").length },
              { id: "audit_logs",       label: "Operational Audit",  count: null },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as AdminTab)}
                className={`w-full text-left px-3 py-2.5 rounded text-xs font-semibold uppercase tracking-wider flex justify-between items-center transition cursor-pointer ${
                  activeTab === tab.id
                    ? "bg-gold-champagne text-obsidian"
                    : "text-muted-gray hover:bg-white/5 hover:text-ivory"
                }`}
              >
                <span>{tab.label}</span>
                {tab.count !== null && tab.count > 0 && (
                  <span className={`px-1.5 py-0.5 rounded text-[8px] font-mono font-bold ${
                    activeTab === tab.id ? "bg-obsidian text-gold-champagne" : "bg-gold-champagne/10 text-gold-champagne"
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          <div className="lg:col-span-3 space-y-8">
            
            {/* OVERVIEW CONTENT */}
            {activeTab === "overview" && (
              <>
                {/* Revenue Growth chart & status breakdown */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="admin-item opacity-0 md:col-span-2 glass-panel border-white/5 rounded-lg p-5 space-y-4">
                    <h3 className="serif-heading text-sm font-light text-ivory border-b border-white/5 pb-2">Revenue Growth (Rentals Only)</h3>
                    <div className="h-48 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={revenueTrend}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2c" vertical={false} />
                          <XAxis dataKey="date" stroke="#9A9995" fontSize={9} tickLine={false} axisLine={false} />
                          <YAxis stroke="#9A9995" fontSize={9} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${v}`} />
                          <Tooltip contentStyle={{ backgroundColor: "#171719", borderColor: "rgba(216,179,106,0.35)", borderRadius: 4, fontSize: 10 }} />
                          <Line type="monotone" dataKey="amount" stroke="#D8B36A" strokeWidth={2} dot={{ r: 2 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="admin-item opacity-0 glass-panel border-white/5 rounded-lg p-5 flex flex-col justify-between">
                    <h3 className="serif-heading text-sm font-light text-ivory border-b border-white/5 pb-2">Status Distribution</h3>
                    <div className="h-28 w-full flex items-center justify-center">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={["approval_pending", "approved", "ready_for_pickup", "rented", "returned", "completed"].map(s => ({
                              name: s,
                              value: bookings.filter(b => b.status === s).length
                            })).filter(d => d.value > 0)}
                            cx="50%" cy="50%" innerRadius={25} outerRadius={40} dataKey="value"
                          >
                            {COLORS.map((c, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="text-[8px] font-mono text-muted-gray uppercase space-y-1">
                      {["approval_pending", "ready_for_pickup", "rented", "returned"].map((s, i) => (
                        <div key={s} className="flex justify-between">
                          <span>{s.replace("_"," ")}</span>
                          <span className="text-ivory font-bold">{bookings.filter(b => b.status === s).length}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Calendar Availability Grid */}
                <div className="admin-item opacity-0 glass-panel border-white/5 rounded-lg p-6 space-y-4">
                  <div className="flex justify-between items-center border-b border-white/5 pb-2">
                    <h3 className="serif-heading text-base font-light text-ivory">Monthly Availability Grid — {getMonthName(currentMonth)} {currentYear}</h3>
                    <span className="text-[9px] font-mono text-muted-gray uppercase">Active camera schedules</span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs font-light font-mono min-w-[600px] border border-white/5">
                      <thead>
                        <tr className="bg-white/5 text-[9px] text-muted-gray uppercase">
                          <th className="p-2 border-b border-white/10">Camera Unit</th>
                          {daysArray.map((day) => (
                            <th key={day} className="p-0.5 text-center border-b border-white/10 min-w-[18px]">{day}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {inventoryUnits.map((unit) => (
                          <tr key={unit.id} className="hover:bg-white/[0.01] transition border-b border-white/5">
                            <td className="p-2 font-semibold text-ivory text-[9px] bg-white/[0.02]">
                              {unit.name} <span className="text-gold-champagne text-[8px] font-mono block">[{unit.serialNumber}]</span>
                            </td>
                            {daysArray.map((day) => {
                              const date = new Date(currentYear, currentMonth, day);
                              const bookedBooking = bookings.find((b) => {
                                if (!["approved", "ready_for_pickup", "rented", "returned", "completed", "overdue"].includes(b.status)) return false;
                                const start = new Date(b.start_date || b.startDate);
                                const end = new Date(b.end_date || b.endDate);
                                start.setHours(0,0,0,0);
                                end.setHours(23,59,59,999);
                                return date >= start && date <= end && b.items.some((item: any) => item.inventoryUnitId === unit.id);
                              });

                              const isMaintenance = unit.status === "maintenance";

                              return (
                                <td
                                  key={day}
                                  className={`p-0.5 text-center border-r border-white/5 text-[8px] ${
                                    bookedBooking
                                      ? "bg-gold-champagne/80 text-obsidian font-bold"
                                      : isMaintenance
                                      ? "bg-rose-500/20 text-rose-400"
                                      : "bg-white/[0.02] text-muted-gray/30"
                                  }`}
                                  title={
                                    bookedBooking
                                      ? `Booked: ${bookedBooking.reference_code || bookedBooking.referenceCode} (${bookedBooking.contact_name || bookedBooking.contactName})`
                                      : isMaintenance
                                      ? "Maintenance"
                                      : "Available"
                                  }
                                >
                                  {bookedBooking ? "B" : isMaintenance ? "M" : "•"}
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}

            {/* MAINTENANCE GRID */}
            {activeTab === "maintenance" && (
              <div className="glass-panel border-white/5 rounded-lg p-6 space-y-4">
                <h3 className="serif-heading text-lg font-light text-ivory border-b border-white/5 pb-2">Physical Camera Inventory & Maintenance Toggles</h3>
                <div className="space-y-3">
                  {inventoryUnits.map((unit) => (
                    <div key={unit.id} className="flex items-center justify-between p-3 bg-white/5 border border-white/5 rounded-lg">
                      <div>
                        <h4 className="text-xs font-semibold text-ivory">{unit.name}</h4>
                        <p className="text-[10px] text-muted-gray font-mono">
                          Serial: <span className="text-gold-champagne font-bold">{unit.serialNumber}</span> · Current Condition: <span className="text-gold-champagne capitalize">{unit.condition}</span>
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-mono tracking-wider font-bold border ${
                          unit.status === "available"
                            ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                            : unit.status === "rented"
                            ? "bg-blue-500/10 border-blue-500/30 text-blue-400"
                            : "bg-rose-500/10 border-rose-500/30 text-rose-400"
                        }`}>
                          {unit.status.toUpperCase()}
                        </span>
                        {unit.status !== "rented" && (
                          <button
                            onClick={() => handleToggleMaintenance(unit.id, unit.status)}
                            className="px-2.5 py-1 bg-white/10 hover:bg-white/15 text-ivory rounded text-[9px] font-mono uppercase tracking-wider transition cursor-pointer"
                          >
                            {unit.status === "maintenance" ? "Mark Available" : "Send to Maintenance"}
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* AUDIT LOGS / HISTORY GRID */}
            {activeTab === "audit_logs" && (
              <div className="glass-panel border-white/5 rounded-lg p-6 space-y-4">
                <h3 className="serif-heading text-lg font-light text-ivory border-b border-white/5 pb-2">Operations Audit & Transition Logs</h3>
                <div className="space-y-2.5 max-h-96 overflow-y-auto pr-2">
                  {auditLogs.length === 0 ? (
                    <p className="text-xs text-muted-gray italic">No audit records log found.</p>
                  ) : (
                    auditLogs.map((log, idx) => (
                      <div key={idx} className="p-3 bg-white/5 border border-white/5 rounded text-[10px] space-y-1">
                        <div className="flex justify-between items-center text-muted-gray">
                          <span className="font-mono">Ref: <span className="text-gold-champagne font-semibold">{log.bookingRef}</span> ({log.renter})</span>
                          <span className="font-mono text-[9px]">{new Date(log.timestamp).toLocaleString("en-IN")}</span>
                        </div>
                        <div className="text-ivory font-light font-mono leading-relaxed">
                          Action: <span className="text-gold capitalize">{log.action || "Status Change"}</span> · Notes: <span className="text-muted-gray">{log.notes || "—"}</span>
                        </div>
                        <div className="text-[8px] text-muted-gray uppercase tracking-widest font-mono">Operator: {log.userType || "System"}</div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* BOOKINGS TABLES (FILTERS APPLIED) */}
            {activeTab !== "overview" && activeTab !== "maintenance" && activeTab !== "audit_logs" && (
              <div className="admin-item opacity-0 glass-panel border-white/5 rounded-lg p-6 space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/5 pb-4">
                  <h3 className="serif-heading text-lg font-light text-ivory capitalize">
                    {activeTab.replace("_", " ")} ({filteredBookings.length})
                  </h3>
                  <div className="relative w-full sm:w-64">
                    <input
                      type="text"
                      placeholder="Search renter, phone, code..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 text-xs rounded px-3 py-2 pr-8 focus:outline-none focus:border-gold-champagne/30 transition"
                    />
                    <Search size={13} className="absolute right-3 top-2.5 text-muted-gray pointer-events-none" />
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs font-light font-sans min-w-[650px]">
                    <thead>
                      <tr className="border-b border-white/10 font-mono text-[9px] text-muted-gray uppercase tracking-wider">
                        <th className="py-2.5 pr-3">Ref Code</th>
                        <th className="py-2.5 px-3">Renter & Contacts</th>
                        <th className="py-2.5 px-3">Schedule Window</th>
                        <th className="py-2.5 px-3">Financials</th>
                        <th className="py-2.5 px-3">Operational Status</th>
                        <th className="py-2.5 pl-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {filteredBookings.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-10 text-center text-muted-gray font-mono text-[10px]">
                            NO CURRENT RESERVATION LOGS MATCHING FILTER
                          </td>
                        </tr>
                      ) : (
                        filteredBookings.map((b) => (
                          <tr key={b.id} className="hover:bg-white/[0.01] transition">
                            <td className="py-3 pr-3 font-mono font-semibold text-gold-champagne text-[11px]">
                              {b.reference_code || b.referenceCode}
                            </td>
                            <td className="py-3 px-3">
                              <div className="font-semibold text-ivory">{b.contact_name || b.contactName}</div>
                              <div className="text-[10px] text-muted-gray font-mono">{b.contact_phone || b.contactPhone}</div>
                              {b.emergencyContact && <div className="text-[9px] text-rose-400 font-mono">Emerg: {b.emergencyContact}</div>}
                            </td>
                            <td className="py-3 px-3 font-mono text-[10px] text-muted-gray">
                              <div>{b.start_date || b.startDate} → {b.end_date || b.endDate}</div>
                              <div className="text-[9px] text-muted-gray/70">Slot: Pickup {b.pickupTime || "10:00 AM"} · Return {b.returnTime || "04:00 PM"}</div>
                            </td>
                            <td className="py-3 px-3 font-mono text-[10px]">
                              <div className="font-semibold text-ivory">Total: ₹{b.totalPayable?.toLocaleString("en-IN")}</div>
                              <div className="text-emerald-400 text-[9px]">Deposit: ₹{b.securityDeposit?.toLocaleString("en-IN")} ({b.depositStatus || "Pending"})</div>
                            </td>
                            <td className="py-3 px-3">
                              <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border ${STATUS_STYLES[b.status] ?? ""}`}>
                                {b.status.replace("_", " ")}
                              </span>
                            </td>
                            <td className="py-3 pl-3 text-right">
                              <div className="flex gap-1.5 justify-end">
                                {updatingId === b.id ? (
                                  <Loader2 size={12} className="animate-spin text-gold-champagne" />
                                ) : (
                                  <>
                                    {/* Approval Queue actions */}
                                    {b.status === "approval_pending" && (
                                      <>
                                        <button
                                          onClick={() => handleUpdateStatus(b.id, "approved", "Vetted and approved by Admin.")}
                                          className="px-2 py-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded text-[9px] font-bold uppercase tracking-wider border border-emerald-500/20 cursor-pointer transition"
                                        >
                                          Approve
                                        </button>
                                        <button
                                          onClick={() => handleUpdateStatus(b.id, "rejected", "Vetting failed, customer rejected.")}
                                          className="px-2 py-1 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded text-[9px] font-bold uppercase tracking-wider border border-rose-500/20 cursor-pointer transition"
                                        >
                                          Reject
                                        </button>
                                      </>
                                    )}

                                    {/* Unit Reassignment & OTP Handover checkout */}
                                    {b.status === "ready_for_pickup" && (
                                      <div className="flex gap-2 items-center justify-end">
                                        <select
                                          value={b.items[0]?.inventoryUnitId || ""}
                                          onChange={(e) => handleReassignUnit(b.id, b.items[0].productId, e.target.value)}
                                          className="bg-black border border-white/10 text-[9px] font-mono rounded px-1.5 py-0.5 text-gold-champagne focus:outline-none"
                                        >
                                          {inventoryUnits.filter(u => u.productId === b.items[0]?.productId).map(u => (
                                            <option key={u.id} value={u.id}>{u.serialNumber} ({u.status})</option>
                                          ))}
                                        </select>
                                        <button
                                          onClick={() => openHandoverModal(b)}
                                          className="px-2.5 py-1 rounded bg-gold-champagne text-obsidian text-[9px] font-bold uppercase tracking-wider cursor-pointer transition hover:bg-gold-warm"
                                        >
                                          Handover Gear
                                        </button>
                                      </div>
                                    )}

                                    {/* Return Inspection checkout */}
                                    {(b.status === "rented" || b.status === "overdue") && (
                                      <button
                                        onClick={() => openReturnModal(b)}
                                        className="px-2.5 py-1 rounded bg-teal-500/10 hover:bg-teal-500/20 text-teal-400 text-[9px] font-bold uppercase tracking-wider border border-teal-500/20 cursor-pointer transition"
                                      >
                                        Inspect Return
                                      </button>
                                    )}

                                    {/* Completed status mark */}
                                    {b.status === "returned" && (
                                      <button
                                        onClick={() => handleUpdateStatus(b.id, "completed", "Return completed and finalized.")}
                                        className="px-2 py-1 bg-white/10 hover:bg-white/15 text-ivory rounded text-[9px] font-bold uppercase tracking-wider border border-white/10 cursor-pointer transition"
                                      >
                                        Finalize Completed
                                      </button>
                                    )}

                                    {/* Security Deposit controls */}
                                    {activeTab === "deposits" && b.depositStatus === "Collected" && (
                                      <div className="flex gap-1.5">
                                        <button
                                          onClick={() => handleProcessDepositStatus(b.id, "refund_full")}
                                          className="px-1.5 py-0.5 bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25 rounded text-[8px] font-mono uppercase tracking-wider transition"
                                        >
                                          Refund Full
                                        </button>
                                        <button
                                          onClick={() => handleProcessDepositStatus(b.id, "refund_partial")}
                                          className="px-1.5 py-0.5 bg-orange-500/15 text-orange-400 hover:bg-orange-500/25 rounded text-[8px] font-mono uppercase tracking-wider transition"
                                        >
                                          Deduct Late/Damage
                                        </button>
                                        <button
                                          onClick={() => handleProcessDepositStatus(b.id, "deduct_full")}
                                          className="px-1.5 py-0.5 bg-rose-500/15 text-rose-400 hover:bg-rose-500/25 rounded text-[8px] font-mono uppercase tracking-wider transition"
                                        >
                                          Forfeit Full
                                        </button>
                                      </div>
                                    )}
                                  </>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Handover OTP Checklist Modal */}
      {handoverBooking && (
        <div className="fixed inset-0 bg-black/85 flex items-center justify-center p-4 z-50 animate-fade-in font-sans">
          <div className="glass-panel border-gold-champagne/30 bg-[#0e0e0f] rounded-lg p-6 max-w-md w-full space-y-4 text-ivory">
            <h3 className="serif-heading text-lg font-light text-ivory border-b border-white/5 pb-2">Handover Verification Checklist</h3>
            <p className="text-xs text-muted-gray">
              Releasing gear for booking <strong>{handoverBooking.reference_code || handoverBooking.referenceCode}</strong>.
            </p>

            <div className="space-y-3 text-xs">
              {/* ID physical vetting check */}
              <label className="flex items-start gap-2.5 cursor-pointer p-2 bg-white/5 border border-white/5 rounded">
                <input
                  type="checkbox"
                  checked={checkIdVerified}
                  onChange={(e) => setCheckIdVerified(e.target.checked)}
                  className="mt-0.5 accent-gold-champagne"
                />
                <div>
                  <span className="font-semibold block text-gold-champagne">Vetted Government ID Physically</span>
                  <span className="text-[10px] text-muted-gray">Verified that the physical ID matches {handoverBooking.contactName || handoverBooking.contact_name}. DO NOT photograph or scan the document.</span>
                </div>
              </label>

              {/* Serial number checkout */}
              <label className="flex items-start gap-2.5 cursor-pointer p-2 bg-white/5 border border-white/5 rounded">
                <input
                  type="checkbox"
                  checked={checkSerialMatched}
                  onChange={(e) => setCheckSerialMatched(e.target.checked)}
                  className="mt-0.5 accent-gold-champagne"
                />
                <div>
                  <span className="font-semibold block text-gold-champagne">Assigned Serial Match</span>
                  <span className="text-[10px] text-muted-gray">Verified that the physical camera serial number matches the assigned unit.</span>
                </div>
              </label>

              {/* Accessories count */}
              <div className="p-3.5 bg-white/5 border border-white/5 rounded space-y-2">
                <span className="text-[9px] text-muted-gray uppercase font-mono tracking-wider block">Standard Accessories Count</span>
                <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
                  {Object.keys(checkAccessories).map((key) => (
                    <label key={key} className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={(checkAccessories as any)[key]}
                        onChange={(e) => setCheckAccessories(prev => ({ ...prev, [key]: e.target.checked }))}
                        className="accent-gold-champagne"
                      />
                      <span className="capitalize">{key.replace("sd", "SD ").replace("Cap", " Cap")}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Handover OTP */}
              <div className="space-y-1">
                <label className="text-[9px] text-muted-gray uppercase font-mono tracking-wider block">Renter Pickup OTP Code</label>
                <input
                  type="text"
                  maxLength={6}
                  placeholder="Enter 6-digit OTP code"
                  value={enteredOtp}
                  onChange={(e) => setEnteredOtp(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 text-center font-mono font-bold tracking-widest text-lg rounded p-2 focus:outline-none focus:border-gold-champagne/40 text-gold-champagne"
                />
              </div>

              {/* Notes */}
              <div className="space-y-1">
                <label className="text-[9px] text-muted-gray uppercase font-mono tracking-wider block">Handover Notes (Optional)</label>
                <input
                  type="text"
                  placeholder="Add accessories condition remarks..."
                  value={handoverNotes}
                  onChange={(e) => setHandoverNotes(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 text-xs rounded p-2 focus:outline-none text-ivory"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-white/5">
              <button
                onClick={() => setHandoverBooking(null)}
                className="px-4 py-2 border border-white/10 text-muted-gray hover:text-ivory rounded text-[10px] font-semibold uppercase tracking-wider transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmHandover}
                className="px-4 py-2 bg-gold-champagne hover:bg-gold-warm text-obsidian rounded text-[10px] font-bold uppercase tracking-wider transition cursor-pointer"
              >
                Confirm Pickup Handover
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Return Details Modal */}
      {returnModalBooking && (
        <div className="fixed inset-0 bg-black/85 flex items-center justify-center p-4 z-50 animate-fade-in font-sans">
          <div className="glass-panel border-gold-champagne/30 bg-[#0e0e0f] rounded-lg p-6 max-w-md w-full space-y-4 text-ivory">
            <h3 className="serif-heading text-lg font-light text-ivory border-b border-white/5 pb-2">Process Return Checklist</h3>
            <p className="text-xs text-muted-gray">
              Registering return for order <strong>{returnModalBooking.reference_code || returnModalBooking.referenceCode}</strong>.
            </p>

            {/* Overdue details */}
            <div className="p-3 bg-white/5 border border-white/5 rounded space-y-1 text-xs">
              <p className="text-[9px] text-muted-gray uppercase font-mono tracking-wider">Logistical Window Check</p>
              <p>Expected return: <strong>{returnModalBooking.end_date || returnModalBooking.endDate}</strong></p>
              <p>Today's Return Date: <strong>{new Date().toLocaleDateString("en-IN")}</strong></p>
              {calculatedLateFee > 0 ? (
                <p className="text-rose-400 font-semibold font-mono mt-1.5">LATE RETURN FEE (+₹999/day): +₹{calculatedLateFee.toLocaleString("en-IN")}</p>
              ) : (
                <p className="text-emerald-400 font-semibold font-mono mt-1.5">ON-TIME RETURN APPROVED</p>
              )}
            </div>

            {/* Returned accessories checklist */}
            <div className="p-3 bg-white/5 border border-white/5 rounded space-y-2 text-xs">
              <span className="text-[9px] text-muted-gray uppercase font-mono tracking-wider block">Verify Accessories Returned</span>
              <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
                {Object.keys(returnAccessoriesChecked).map((key) => (
                  <label key={key} className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={(returnAccessoriesChecked as any)[key]}
                      onChange={(e) => setReturnAccessoriesChecked(prev => ({ ...prev, [key]: e.target.checked }))}
                      className="accent-gold-champagne"
                    />
                    <span className="capitalize">{key.replace("sd", "SD ").replace("Cap", " Cap")}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Condition check */}
            <div className="space-y-2 text-xs">
              <label className="text-[9px] text-muted-gray uppercase font-mono tracking-wider block">Equipment Quality Assessment</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="returnCondition"
                    checked={returnCondition === "good"}
                    onChange={() => setReturnCondition("good")}
                    className="accent-gold-champagne"
                  />
                  Good Condition (Available for Rent)
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="returnCondition"
                    checked={returnCondition === "damaged"}
                    onChange={() => setReturnCondition("damaged")}
                    className="accent-gold-champagne"
                  />
                  Damaged Equipment (Maintenance Required)
                </label>
              </div>
            </div>

            {/* Damage descriptions */}
            {returnCondition === "damaged" && (
              <div className="space-y-3 pt-3 border-t border-white/5 text-xs animate-fade-in">
                <div className="space-y-1">
                  <label className="text-[9px] text-muted-gray uppercase font-mono tracking-wider block">Damage / Failure Description</label>
                  <textarea
                    placeholder="Describe scratches, screen crack, lens sensor dust, or battery locks damage..."
                    value={damageDescription}
                    onChange={(e) => setDamageDescription(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 text-xs rounded p-2 focus:outline-none focus:border-gold-champagne/40 h-16 text-ivory"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] text-muted-gray uppercase font-mono tracking-wider block">Estimated Damage Repair Cost (INR)</label>
                  <input
                    type="number"
                    placeholder="e.g. 2500"
                    value={damageCost}
                    onChange={(e) => setDamageCost(Number(e.target.value))}
                    className="w-full bg-white/5 border border-white/10 text-xs rounded p-2 focus:outline-none focus:border-gold-champagne/40 text-ivory font-mono"
                  />
                </div>
              </div>
            )}

            {/* Modal actions */}
            <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
              <button
                onClick={() => setReturnModalBooking(null)}
                className="px-4 py-2 border border-white/10 text-muted-gray hover:text-ivory rounded text-[10px] font-semibold uppercase tracking-wider transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReturn}
                className="px-4 py-2 bg-gold-champagne hover:bg-gold-warm text-obsidian rounded text-[10px] font-bold uppercase tracking-wider transition cursor-pointer"
              >
                Save Return Record
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
