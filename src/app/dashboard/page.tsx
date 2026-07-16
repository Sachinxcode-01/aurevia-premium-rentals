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
  ShieldCheck, FileText, Printer, Lock, Download, AlertTriangle
} from "lucide-react";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip,
  PieChart, Pie, Cell,
} from "recharts";
import { animate, stagger } from "animejs";
import Link from "next/link";
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

export default function CustomerDashboard() {
  const { cart } = useCart();
  const toast = useToast();
  const { bookings: rawBookings, loading: bookingsLoading, error: bookingsError, refresh } = useRealtimeBookings();
  const bookings = rawBookings as any[];

  const [profile, setProfile] = useState<Record<string, unknown> | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "bookings" | "settings">("overview");

  // Settings form
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);

  // Cancel state
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  
  // Agreement signing state
  const [signingId, setSigningId] = useState<string | null>(null);
  const [signCheck, setSignCheck] = useState<Record<string, boolean>>({});

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

  // Toast when new booking status changes live
  useEffect(() => {
    if (prevBookingCount.current > 0 && bookings.length > prevBookingCount.current) {
      toast.info("Your bookings have been updated.");
      // Trigger browser audio notification
      try {
        const audio = new Audio("https://assets.mixkit.co/active_storage/sfx/2869/2869-200.wav");
        audio.volume = 0.2;
        audio.play().catch(() => {});
      } catch {}
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
    activeRentals: bookings.filter((b) => b.status === "rented").length,
    completedRentals: bookings.filter((b) => b.status === "completed" || b.status === "returned").length,
    totalSpent: bookings
      .filter((b) => b.status !== "cancelled" && b.status !== "rejected" && (b.paymentStatus === "paid" || b.payment_status === "paid"))
      .reduce((sum, b) => sum + (b.totalPayable - b.securityDeposit), 0), // Subtract refundable deposits from revenue
  };

  // Spending trend chart from real bookings (excluding deposits)
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const spendingByMonth = months.map((m, i) => ({
    name: m,
    amount: bookings
      .filter((b) => new Date(b.created_at || b.createdAt).getMonth() === i && (b.payment_status === "paid" || b.paymentStatus === "paid"))
      .reduce((s, b) => s + (b.totalPayable - b.securityDeposit), 0),
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
    
    const isSupabase = process.env.NEXT_PUBLIC_SUPABASE_URL && !process.env.NEXT_PUBLIC_SUPABASE_URL.includes("your-project-id");
    if (!isSupabase) {
      await db.updateBookingStatus(bookingId, "cancelled", "Cancelled by customer.", "customer");
      toast.success(`Booking ${ref} has been cancelled.`);
      refresh();
      setCancellingId(null);
      return;
    }

    const result = await cancelBookingAction(bookingId);
    if (result.success) {
      toast.success(`Booking ${ref} has been cancelled.`);
      refresh();
    } else {
      toast.error(result.error ?? "Could not cancel booking.");
    }
    setCancellingId(null);
  };

  // Accept digital rental agreement
  const handleSignAgreement = async (bookingId: string) => {
    setSigningId(bookingId);
    try {
      const ip = "122.164.88.24"; // Mock client IP Address
      await db.acceptAgreement(bookingId, ip);
      toast.success("Agreement signed successfully. Your Pickup OTP code is generated!");
      
      // WhatsApp notification alert
      toast.info("Aurevia WhatsApp Notification: 'Agreement signed. Present OTP to receive gear.'");
      refresh();
    } catch (e: any) {
      toast.error(e.message || "Failed to sign rental agreement.");
    } finally {
      setSigningId(null);
    }
  };

  // Printable digital agreement generator
  const handlePrintAgreement = (booking: any) => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const start = new Date(booking.start_date || booking.startDate);
    const end = new Date(booking.end_date || booking.endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1 || 1;

    const itemsHtml = booking.items.map((item: any) => {
      const prodName = item.productId === "p1000000-0000-0000-0000-000000000001" ? "Canon Camera" : "Nikon Camera";
      const serialText = item.inventoryUnitId ? ` [Serial: ${item.inventoryUnitId === 'u1' ? 'CN-CAM-01' : item.inventoryUnitId === 'u2' ? 'CN-CAM-02' : 'NK-CAM-01'}]` : "";
      return `<li>${prodName}${serialText} (Qty: ${item.quantity})</li>`;
    }).join("");

    const agreementHtml = `
      <html>
      <head>
        <title>AUREVIA Digital Rental Agreement - ${booking.reference_code || booking.referenceCode}</title>
        <style>
          body { font-family: 'Courier New', Courier, monospace; color: #111111; margin: 40px; line-height: 1.4; font-size: 12px; }
          .title { text-align: center; font-size: 16px; font-weight: bold; margin-bottom: 25px; text-transform: uppercase; border-bottom: 1px solid #111; padding-bottom: 10px; }
          .grid { display: grid; grid-template-cols: 1fr 1fr; gap: 20px; margin-bottom: 20px; }
          .label { font-weight: bold; text-transform: uppercase; font-size: 10px; color: #555; }
          .terms { border: 1px solid #111; padding: 15px; max-height: 250px; overflow-y: auto; margin: 20px 0; background: #fafafa; font-size: 11px; }
          .sign-block { border: 1px dashed #111; padding: 15px; margin-top: 30px; line-height: 1.6; }
          .footer { text-align: center; font-size: 9px; color: #777; margin-top: 50px; border-top: 1px solid #ccc; padding-top: 15px; }
        </style>
      </head>
      <body>
        <div class="title">AUREVIA PRESERVED EQUIPMENT RENTAL AGREEMENT</div>
        
        <div class="grid">
          <div>
            <div class="label">Renter Details</div>
            <strong>Name:</strong> ${booking.contact_name || booking.contactName}<br>
            <strong>Phone:</strong> +91 ${booking.contact_phone || booking.contactPhone}<br>
            <strong>Email:</strong> ${booking.contactEmail || "contact@prem.dev"}<br>
            <strong>Emergency Contact:</strong> ${booking.emergencyContact || "Aswin Kumar - 9876543210"}
          </div>
          <div>
            <div class="label">Rental Reference</div>
            <strong>Booking Ref:</strong> ${booking.reference_code || booking.referenceCode}<br>
            <strong>Pickup Window:</strong> ${booking.start_date || booking.startDate} (${booking.pickupTime || "10:00 AM"})<br>
            <strong>Return Window:</strong> ${booking.end_date || booking.endDate} (${booking.returnTime || "04:00 PM"})<br>
            <strong>Company/College:</strong> ${booking.companyOrCollege || "—"}
          </div>
        </div>

        <div class="label font-bold">Equipment List</div>
        <ul>
          ${itemsHtml}
        </ul>

        <div class="label">Financial Terms</div>
        <p>
          Camera Rent (₹799/day): ₹${(booking.totalRentalFee || 0).toLocaleString("en-IN")} · 
          Coupon Discount: -₹${(booking.discountAmount || 0).toLocaleString("en-IN")} · 
          <strong>Total Amount Paid: ₹${(booking.totalPayable || 0).toLocaleString("en-IN")}</strong>
        </p>

        <div class="label">Rental Terms & Conditions</div>
        <div class="terms" style="text-align: left; font-size: 10px; line-height: 1.4;">
          1. RETURN POLICY: Customer must return the camera on the selected date and time.<br>
          2. LATE RETURN: Late return fees may be charged per extra day at ₹999/day.<br>
          3. PHYSICAL DAMAGE: Customer is responsible for physical damage during the rental period.<br>
          4. REPAIR COSTS: Breakage or repair charges will be based on the actual service cost.<br>
          5. LOSS / THEFT: Lost or stolen camera requires payment of the camera’s replacement value.<br>
          6. ACCESSORIES: Missing lens, battery, charger, memory card, bag or accessories will be charged separately.<br>
          7. MISUSE: Water, impact, fire or misuse damage is the customer’s responsibility.<br>
          8. INSPECTION: Camera condition will be recorded before pickup and after return.<br>
          9. SUB-RENT: Customer must not transfer or sub-rent the camera.<br>
          10. CANCELLATION: Free cancellation up to 24 hours prior. 50% cancellation fee applies if cancelled within 24 hours of booking. No refunds post pickup.
        </div>

        <div class="sign-block">
          <strong>DIGITAL SIGNATURE VERIFICATION RECORD</strong><br>
          Signature: <strong>ACCEPTED</strong> (Signed digitally via checkbox)<br>
          Sign Timestamp: ${booking.agreementAcceptedAt || new Date().toISOString()}<br>
          Origin IP Address: ${booking.agreementIP || "122.164.88.24"}<br>
          OTP Handover Code Assigned: <strong>${booking.pickupOTP || "Pending"}</strong>
        </div>

        <div class="footer">
          Aurevia Premium Rentals · Bangalore Concierge Office · Jubilee Hills Studio
        </div>
        <script>window.onload = function() { window.print(); }</script>
      </body>
      </html>
    `;

    printWindow.document.write(agreementHtml);
    printWindow.document.close();
  };

  // Printable tax invoice client-side
  const handlePrintInvoice = (booking: any) => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    
    const start = new Date(booking.start_date || booking.startDate);
    const end = new Date(booking.end_date || booking.endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1 || 1;
    
    const itemsHtml = booking.items.map((item: any) => {
      const prodName = item.productId === "p1000000-0000-0000-0000-000000000001" ? "Canon Camera" : "Nikon Camera";
      const serialText = item.inventoryUnitId ? ` (Serial: ${item.inventoryUnitId})` : "";
      return `
        <tr>
          <td style="padding: 12px; border-bottom: 1px solid #eeeeee;">${prodName}${serialText}</td>
          <td style="padding: 12px; border-bottom: 1px solid #eeeeee; text-align: center;">${item.quantity}</td>
          <td style="padding: 12px; border-bottom: 1px solid #eeeeee; text-align: center;">${days}</td>
          <td style="padding: 12px; border-bottom: 1px solid #eeeeee; text-align: right;">₹${item.unitPrice.toLocaleString("en-IN")}</td>
          <td style="padding: 12px; border-bottom: 1px solid #eeeeee; text-align: right;">₹${(item.unitPrice * days * item.quantity).toLocaleString("en-IN")}</td>
        </tr>
      `;
    }).join("");

    const invoiceHtml = `
      <html>
      <head>
        <title>Aurevia Invoice - ${booking.reference_code || booking.referenceCode}</title>
        <style>
          body { font-family: 'Inter', sans-serif; color: #222222; margin: 45px; line-height: 1.5; }
          .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #D8B36A; padding-bottom: 25px; }
          .logo { font-size: 26px; font-weight: 700; letter-spacing: 0.15em; color: #D8B36A; text-transform: uppercase; }
          .invoice-details { text-align: right; font-size: 13px; line-height: 1.6; }
          .grid { display: grid; grid-template-cols: 1fr 1fr; gap: 30px; margin-top: 30px; }
          .bill-to, .studio-from { font-size: 13px; line-height: 1.6; }
          .section-title { font-weight: bold; text-transform: uppercase; font-size: 11px; tracking: 0.1em; color: #777777; margin-bottom: 8px; }
          .items-table { width: 100%; border-collapse: collapse; margin-top: 35px; font-size: 13px; }
          .items-table th { background: #f4f6f5; padding: 12px; border-bottom: 2px solid #e0e0e0; text-align: left; font-weight: 600; color: #555555; }
          .totals { margin-top: 35px; text-align: right; font-size: 13px; line-height: 2.0; width: 320px; margin-left: auto; }
          .totals table { width: 100%; border-collapse: collapse; }
          .totals td { padding: 4px 0; }
          .totals .highlight { font-size: 16px; font-weight: bold; color: #D8B36A; border-top: 2px solid #D8B36A; padding-top: 8px; margin-top: 8px; }
          .footer { margin-top: 80px; border-top: 1px solid #eeeeee; padding-top: 25px; font-size: 11px; text-align: center; color: #777777; line-height: 1.6; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo">AUREVIA</div>
          <div class="invoice-details">
            <strong>TAX INVOICE</strong><br>
            Invoice Ref: <strong>${booking.reference_code || booking.referenceCode}</strong><br>
            Date: ${new Date(booking.created_at || booking.createdAt).toLocaleDateString("en-IN")}<br>
            Payment: ${String(booking.payment_status || booking.paymentStatus).toUpperCase()}
          </div>
        </div>
        
        <div class="grid">
          <div class="studio-from">
            <div class="section-title">From Studio</div>
            <strong>AUREVIA Premium Rentals</strong><br>
            Jubilee Hills, Road No. 36<br>
            Hyderabad, Telangana 500033<br>
            GSTIN: 36AABCA1234F1Z8
          </div>
          <div class="bill-to">
            <div class="section-title">Customer details</div>
            <strong>Name:</strong> ${booking.contact_name || booking.contactName}<br>
            <strong>Phone:</strong> +91 ${booking.contact_phone || booking.contactPhone}<br>
            <strong>Delivery:</strong> ${String(booking.delivery_method || booking.deliveryMethod).toUpperCase()}<br>
            <strong>Logistics Window:</strong> Pickup: ${booking.pickupTime || "10:00 AM"} · Return: ${booking.returnTime || "04:00 PM"}<br>
            <strong>Emergency Contact:</strong> ${booking.emergencyContact || "—"}
          </div>
        </div>
        
        <table class="items-table">
          <thead>
            <tr>
              <th>Equipment Description</th>
              <th style="text-align: center;">Qty</th>
              <th style="text-align: center;">Days</th>
              <th style="text-align: right;">Day Rate</th>
              <th style="text-align: right;">Net Subtotal</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>
        
        <div class="totals">
          <table>
            <tr>
              <td>Rental & Addon Subtotal:</td>
              <td style="text-align: right;">₹${(booking.total_rental_fee || booking.totalRentalFee || 0).toLocaleString("en-IN")}</td>
            </tr>
            ${(booking.discount_amount || booking.discountAmount) ? `
            <tr>
              <td>Coupon Discount:</td>
              <td style="text-align: right; color: #d9534f;">-₹${(booking.discount_amount || booking.discountAmount).toLocaleString("en-IN")}</td>
            </tr>
            ` : ""}
            <!-- No GST, Delivery, or Refundable Deposit under new rules -->
            ${booking.lateFee ? `
            <tr>
              <td>Overdue Late Fees (+₹999/day):</td>
              <td style="text-align: right; color: #d9534f;">₹${booking.lateFee.toLocaleString("en-IN")}</td>
            </tr>
            ` : ""}
            ${booking.damageCost ? `
            <tr>
              <td>Damage Repair Assessment:</td>
              <td style="text-align: right; color: #d9534f;">₹${booking.damageCost.toLocaleString("en-IN")}</td>
            </tr>
            ` : ""}
            <tr class="highlight">
              <td>Total Amount Paid:</td>
              <td style="text-align: right;">₹${(booking.total_payable || booking.totalPayable || 0).toLocaleString("en-IN")}</td>
            </tr>
          </table>
        </div>
        
        <div class="footer">
          This is a computer-generated invoice and requires no physical signature.<br>
          Aurevia Studio · contact@aurevia.com · +91 9686909048
        </div>
        <script>
          window.onload = function() { window.print(); }
        </script>
      </body>
      </html>
    `;
    
    printWindow.document.write(invoiceHtml);
    printWindow.document.close();
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
                { label: "Active Rentals",    value: stats.activeRentals,     icon: <Camera size={16} className="text-gold-champagne" />,     sub: "Gear out in field" },
                { label: "Total Bookings",    value: stats.totalBookings,     icon: <ShoppingBag size={16} className="text-gold-champagne" />, sub: "Lifetime orders" },
                { label: "Completed Returns", value: stats.completedRentals,  icon: <History size={16} className="text-gold-champagne" />,     sub: "Vault items returned" },
                { label: "Rental Spent",      value: `₹${stats.totalSpent.toLocaleString("en-IN")}`, icon: <TrendingUp size={16} className="text-gold-champagne" />, sub: "Net Rent Paid", gold: true },
              ].map((m) => (
                <div key={m.label} className="dashboard-animate opacity-0 glass-panel border-white/5 rounded-lg p-6 space-y-4">
                  <div className="flex justify-between items-center text-muted-gray">
                    <span className="text-[9px] uppercase tracking-wider font-mono">{m.label}</span>
                    {m.icon}
                  </div>
                  <div className={`text-2xl font-light ${m.gold ? "text-gold-champagne" : ""}`}>{m.value}</div>
                  <p className="text-[8px] text-muted-gray uppercase tracking-widest font-mono">{m.sub}</p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Spending Trends */}
              <div className="dashboard-animate opacity-0 lg:col-span-2 glass-panel border-white/5 rounded-lg p-6 space-y-4">
                <h3 className="serif-heading text-lg font-light text-ivory border-b border-white/5 pb-2">Your Rental Expenditure</h3>
                <div className="h-64 w-full pt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={spendingByMonth}>
                      <defs>
                        <linearGradient id="colorSpent" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#D8B36A" stopOpacity={0.2}/>
                          <stop offset="95%" stopColor="#D8B36A" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="name" stroke="#9A9995" fontSize={10} tickLine={false} axisLine={false} />
                      <YAxis stroke="#9A9995" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${v}`} />
                      <Tooltip contentStyle={{ backgroundColor: "#171719", borderColor: "rgba(216,179,106,0.2)", borderRadius: 6, fontSize: 11 }} />
                      <Area type="monotone" dataKey="amount" stroke="#D8B36A" fillOpacity={1} fill="url(#colorSpent)" strokeWidth={1.5} />
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
                          <p className="text-[11px] font-mono text-gold-champagne">{b.reference_code || b.referenceCode}</p>
                          <p className="text-[10px] text-muted-gray">{b.start_date || b.startDate} → {b.end_date || b.endDate}</p>
                        </div>
                        <span className={`px-2 py-0.5 text-[9px] font-bold uppercase rounded border ${STATUS_STYLES[b.status] ?? ""}`}>
                          {b.status.replace("_", " ")}
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
                {bookings.filter((b) => ["approved", "ready_for_pickup"].includes(b.status)).slice(0, 3).length === 0 ? (
                  <p className="text-xs text-muted-gray py-4">No upcoming collections.</p>
                ) : bookings.filter((b) => ["approved", "ready_for_pickup"].includes(b.status)).slice(0, 3).map((b) => (
                  <div key={b.id} className="relative">
                    <span className="absolute -left-10 top-0.5 w-6 h-6 rounded-full bg-obsidian border-2 border-gold-champagne flex items-center justify-center text-[10px] text-gold-champagne font-mono font-semibold">L</span>
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <h4 className="text-sm font-semibold text-gold-champagne uppercase font-mono tracking-wider">
                          {b.reference_code || b.referenceCode} ({b.status.replace("_", " ").toUpperCase()})
                        </h4>
                        <span className="text-[10px] text-muted-gray font-mono">{b.start_date || b.startDate} to {b.end_date || b.endDate}</span>
                      </div>
                      <p className="text-xs text-muted-gray max-w-2xl font-light leading-relaxed">
                        Pickup from Aurevia Jubilee Hills Studio. Please bring a government ID matching the registration details for physical verification. Delivery Method: {String(b.delivery_method || b.deliveryMethod || "").toUpperCase()} · Logistics window: {b.pickupTime || "10:00 AM"}. Emergency Contact: {b.emergencyContact}.
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
                      <h4 className="serif-heading text-lg font-light text-ivory">{booking.reference_code || booking.referenceCode}</h4>
                    </div>
                    <div className="flex gap-3 items-center">
                      <div className="text-right">
                        <span className="text-[8px] text-muted-gray uppercase block font-mono">Total Payable (Paid)</span>
                        <span className="text-sm font-semibold text-gold-champagne">₹{(booking.totalPayable ?? booking.total_payable ?? 0).toLocaleString("en-IN")}</span>
                      </div>
                      <span className={`px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider rounded border ${STATUS_STYLES[booking.status] ?? ""}`}>
                        {booking.status.replace("_", " ")}
                      </span>
                    </div>
                  </div>

                  {/* Status Timeline */}
                  <div className="py-4 border-t border-b border-white/5 my-2">
                    <span className="text-[9px] text-muted-gray uppercase font-mono tracking-widest block mb-3">Rental Progression Status</span>
                    <div className="grid grid-cols-6 gap-2 relative">
                      {[
                        { label: "Paid", active: ["paid", "approval_pending", "approved", "ready_for_pickup", "rented", "returned", "completed"].includes(booking.status) },
                        { label: "Approved", active: ["approved", "ready_for_pickup", "rented", "returned", "completed"].includes(booking.status) },
                        { label: "Agreement Signed", active: ["ready_for_pickup", "rented", "returned", "completed"].includes(booking.status) },
                        { label: "Out for Rent", active: ["rented", "returned", "completed"].includes(booking.status) },
                        { label: "Returned", active: ["returned", "completed"].includes(booking.status) },
                        { label: "Completed", active: booking.status === "completed" },
                      ].map((step, idx) => (
                        <div key={idx} className="flex flex-col items-center text-center">
                          <div className={`w-4 h-4 rounded-full border flex items-center justify-center text-[9px] font-mono font-semibold ${
                            step.active 
                              ? "bg-gold-champagne border-gold-champagne text-obsidian" 
                              : "bg-white/5 border-white/10 text-muted-gray"
                          }`}>
                            {idx + 1}
                          </div>
                          <span className={`text-[8px] mt-1 font-mono uppercase tracking-wider ${
                            step.active ? "text-gold-champagne font-semibold" : "text-muted-gray/60"
                          }`}>
                            {step.label}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Operational sections for Signed / Checklists */}
                  {booking.status === "approved" && (
                    <div className="p-4 bg-gold-champagne/5 border border-gold-champagne/30 rounded-lg space-y-3 animate-fade-in">
                      <h4 className="serif-heading text-xs font-semibold text-gold-champagne flex items-center gap-1.5">
                        <Lock size={13} />
                        Digital Rental Agreement Signature Pending
                      </h4>
                      <p className="text-[10px] text-muted-gray leading-normal">
                        Your booking has been approved! Please read the terms below and tick the checkbox to digitally sign your contract, which will generate your unique OTP and secure collection code.
                      </p>
                      <div className="p-3 bg-white/5 border border-white/5 rounded text-[10px] text-muted-gray max-h-20 overflow-y-auto space-y-1.5 font-mono">
                        <p><strong>LATE RETURNS:</strong> ₹999.00 late return charges apply for every overdue calendar day.</p>
                        <p><strong>DAMAGES:</strong> Renter assumes full financial responsibility for any equipment damage. Breakage or repair charges will be based on actual service cost.</p>
                      </div>
                      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                        <label className="flex items-center gap-2 cursor-pointer text-[10px] text-muted-gray font-light">
                          <input
                            type="checkbox"
                            checked={!!signCheck[booking.id]}
                            onChange={(e) => setSignCheck(prev => ({ ...prev, [booking.id]: e.target.checked }))}
                            className="accent-gold-champagne"
                          />
                          I accept all late return, damage liability, and physical rental terms.
                        </label>
                        <button
                          onClick={() => handleSignAgreement(booking.id)}
                          disabled={signingId === booking.id || !signCheck[booking.id]}
                          className="px-4 py-1.5 bg-gold-champagne hover:bg-gold-warm disabled:opacity-50 text-obsidian rounded text-[10px] font-bold uppercase tracking-wider transition cursor-pointer flex items-center gap-1"
                        >
                          {signingId === booking.id ? <Loader2 size={10} className="animate-spin" /> : <ShieldCheck size={11} />}
                          Sign & Accept Agreement
                        </button>
                      </div>
                    </div>
                  )}

                  {booking.status === "ready_for_pickup" && (
                    <div className="p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-lg flex flex-col md:flex-row items-center justify-between gap-4 animate-fade-in">
                      <div className="space-y-1 text-left">
                        <h4 className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
                          <CheckCircle size={13} />
                          Ready for Studio Pickup
                        </h4>
                        <p className="text-[10px] text-muted-gray">
                          Renter agreement is verified. Please present this unique OTP code or show the booking reference code to the studio vault officer.
                        </p>
                      </div>
                      <div className="flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/20 p-2.5 rounded-lg">
                        <div className="w-10 h-10 border border-emerald-500/30 flex items-center justify-center bg-white/5 rounded">
                          {/* Mock QR Code lucide */}
                          <Lock size={20} className="text-emerald-400" />
                        </div>
                        <div>
                          <span className="text-[8px] text-muted-gray uppercase font-mono block">Collection OTP</span>
                          <span className="text-base font-bold text-emerald-400 font-mono tracking-wider">{booking.pickupOTP || "782490"}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs font-light text-muted-gray leading-relaxed">
                    <div className="space-y-1.5">
                      <p className="flex items-center gap-1.5"><Calendar size={12} className="text-gold-champagne" /><strong>Duration:</strong> {booking.start_date || booking.startDate} → {booking.end_date || booking.endDate}</p>
                      <p className="flex items-center gap-1.5"><MapPin size={12} className="text-gold-champagne" /><strong>Collection:</strong> {String(booking.delivery_method || booking.deliveryMethod || "").toUpperCase()} ({booking.pickupTime || "10:00 AM"})</p>
                      <p className="flex items-center gap-1.5"><User size={12} className="text-gold-champagne" /><strong>Renter:</strong> {booking.contact_name || booking.contactName} ({booking.contact_phone || booking.contactPhone})</p>
                      <p className="flex items-center gap-1.5"><AlertTriangle size={12} className="text-gold-champagne" /><strong>Emergency Contact:</strong> {booking.emergencyContact || "—"}</p>
                      {booking.companyOrCollege && <p className="flex items-center gap-1.5"><ShieldCheck size={12} className="text-gold-champagne" /><strong>Organization:</strong> {booking.companyOrCollege}</p>}
                      {/* Security deposit removed */}

                      {/* Assigned physical unit */}
                      {booking.items.some((item: any) => item.inventoryUnitId) && (
                        <p className="flex items-center gap-1.5"><Camera size={12} className="text-gold-champagne" /><strong>Assigned Unit Serial:</strong> {booking.items.map((item: any) => {
                          if (!item.inventoryUnitId) return null;
                          const name = item.productId === "p1000000-0000-0000-0000-000000000001" ? "Canon Camera" : "Nikon Camera";
                          const serial = item.inventoryUnitId === "u1" ? "CN-CAM-01" : item.inventoryUnitId === "u2" ? "CN-CAM-02" : "NK-CAM-01";
                          return `${name} (${serial})`;
                        }).filter(Boolean).join(", ")}</p>
                      )}

                      {/* Overdue late fees and damages */}
                      {((booking.lateFee && booking.lateFee > 0) || (booking.damageCost && booking.damageCost > 0)) && (
                        <div className="p-2 border border-red-500/20 bg-red-500/5 rounded space-y-1 mt-2 text-[10px]">
                          {booking.lateFee && booking.lateFee > 0 && <p className="text-rose-400 font-semibold font-mono">LATE RETURN FEE (+₹999/day): +₹{booking.lateFee.toLocaleString("en-IN")}</p>}
                          {booking.damageCost && booking.damageCost > 0 && <p className="text-rose-400 font-semibold font-mono">DAMAGE DEDUCTION: +₹{booking.damageCost.toLocaleString("en-IN")} ({booking.damageDescription})</p>}
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col justify-end items-end gap-3">
                      <div className="flex gap-2 flex-wrap justify-end">
                        {/* Download Printable Rental Agreement */}
                        {booking.agreementAccepted && (
                          <button
                            onClick={() => handlePrintAgreement(booking)}
                            className="px-3 py-2 border border-emerald-500/30 hover:border-emerald-500/60 text-emerald-400 rounded text-[10px] font-semibold uppercase tracking-wider transition cursor-pointer flex items-center gap-1"
                          >
                            <Download size={10} />
                            Agreement PDF
                          </button>
                        )}

                        {/* Print Invoice */}
                        {["paid", "approval_pending", "approved", "ready_for_pickup", "rented", "returned", "completed"].includes(booking.status) && (
                          <button
                            onClick={() => handlePrintInvoice(booking)}
                            className="px-3 py-2 border border-gold-champagne/30 hover:border-gold-champagne/60 text-gold-champagne rounded text-[10px] font-semibold uppercase tracking-wider transition cursor-pointer flex items-center gap-1"
                          >
                            <Printer size={10} />
                            Invoice
                          </button>
                        )}

                        {/* Cancel — only for pending/paid */}
                        {["pending_payment", "paid", "approval_pending"].includes(booking.status) && (
                          <button
                            onClick={() => handleCancelBooking(booking.id, booking.reference_code || booking.referenceCode)}
                            disabled={cancellingId === booking.id}
                            className="px-3 py-2 border border-red-500/30 hover:border-red-500/60 text-red-400 rounded text-[10px] font-semibold uppercase tracking-wider transition cursor-pointer flex items-center gap-1 disabled:opacity-50"
                          >
                            {cancellingId === booking.id ? <Loader2 size={10} className="animate-spin" /> : <XCircle size={10} />}
                            Cancel
                          </button>
                        )}

                        <a
                          href={`https://wa.me/919686909048?text=Enquiry%20regarding%20booking%20${booking.reference_code || booking.referenceCode}`}
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
