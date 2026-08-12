"use client";

import React, { useEffect, useState, useCallback } from "react";
import Navbar from "@/components/navigation/Navbar";
import { useToast } from "@/hooks/useToast";
import { useCart } from "@/hooks/useCart";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { db, Booking } from "@/lib/db/store";
import { getCurrentUserAction } from "@/lib/actions/auth";
import { getAllBookingsAction } from "@/lib/actions/bookings";
import { 
  Camera, TrendingUp, DollarSign, Tag, Users, Download, 
  RefreshCw, Award, ArrowUpRight, BarChart2, Calendar, AlertCircle
} from "lucide-react";
import Link from "next/link";
import dynamic from "next/dynamic";

// Dynamically import Recharts with SSR disabled to prevent hydration mismatches
const ResponsiveContainer = dynamic(() => import("recharts").then(m => m.ResponsiveContainer), { ssr: false });
const AreaChart = dynamic(() => import("recharts").then(m => m.AreaChart), { ssr: false });
const Area = dynamic(() => import("recharts").then(m => m.Area), { ssr: false });
const BarChart = dynamic(() => import("recharts").then(m => m.BarChart), { ssr: false });
const Bar = dynamic(() => import("recharts").then(m => m.Bar), { ssr: false });
const PieChart = dynamic(() => import("recharts").then(m => m.PieChart), { ssr: false });
const Pie = dynamic(() => import("recharts").then(m => m.Pie), { ssr: false });
const Cell = dynamic(() => import("recharts").then(m => m.Cell), { ssr: false });
const XAxis = dynamic(() => import("recharts").then(m => m.XAxis), { ssr: false });
const YAxis = dynamic(() => import("recharts").then(m => m.YAxis), { ssr: false });
const Tooltip = dynamic(() => import("recharts").then(m => m.Tooltip), { ssr: false });
const CartesianGrid = dynamic(() => import("recharts").then(m => m.CartesianGrid), { ssr: false });

const COLORS = ["#D8B36A", "#B98A43", "#F5F1E8", "#9A9995"];

export default function AdminAnalyticsPage() {
  const toast = useToast();
  const { cart } = useCart();

  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingAdmin, setCheckingAdmin] = useState(true);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [stats, setStats] = useState<any>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [repeatStats, setRepeatStats] = useState({
    repeatRate: 0,
    repeatCount: 0,
    uniqueCount: 0,
    topCustomers: [] as { name: string; email: string; count: number; spend: number }[]
  });

  // Verify Admin Role
  useEffect(() => {
    const checkRole = async () => {
      try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
        const isSupabase = supabaseUrl.length > 0 && !supabaseUrl.includes("your-project-id");
        
        if (isSupabase) {
          const user = await getCurrentUserAction();
          if (user && (user.role === "admin" || user.role === "staff")) {
            setIsAdmin(true);
          }
        } else {
          const prof = await db.getProfile();
          if (prof && (prof.role === "admin" || prof.role === "staff")) {
            setIsAdmin(true);
          }
        }
      } catch (e) {
        console.error(e);
      } finally {
        setCheckingAdmin(false);
      }
    };
    checkRole();
  }, []);

  const loadAnalyticsData = useCallback(async () => {
    setLoading(true);
    try {
      // 1. Load general stats
      const statsData = await db.getAdminStats();
      setStats(statsData);

      // 2. Load bookings to compute customer metrics
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
      const isSupabase = supabaseUrl.length > 0 && !supabaseUrl.includes("your-project-id");
      
      let allBookings: Booking[] = [];
      if (isSupabase) {
        allBookings = await getAllBookingsAction();
      } else {
        allBookings = await db.getBookings("usr-prem");
      }
      setBookings(allBookings);

      // Compute Repeat Customer Statistics
      const customersMap: Record<string, { name: string; email: string; count: number; spend: number }> = {};
      
      allBookings.forEach((b) => {
        const emailKey = b.contactEmail || "unknown@aurevia.com";
        const totalPaid = b.paymentStatus === "paid" ? b.totalPayable : 0;
        
        if (!customersMap[emailKey]) {
          customersMap[emailKey] = {
            name: b.contactName || "Valued Customer",
            email: emailKey,
            count: 0,
            spend: 0
          };
        }
        customersMap[emailKey].count += 1;
        customersMap[emailKey].spend += totalPaid;
      });

      const customersList = Object.values(customersMap);
      const uniqueCount = customersList.length;
      const repeatCustomers = customersList.filter(c => c.count >= 2);
      const repeatCount = repeatCustomers.length;
      const repeatRate = uniqueCount > 0 ? Math.round((repeatCount / uniqueCount) * 100) : 0;

      // Top 5 customers by spend
      const topCustomers = [...customersList]
        .sort((a, b) => b.spend - a.spend)
        .slice(0, 5);

      setRepeatStats({
        repeatRate,
        repeatCount,
        uniqueCount,
        topCustomers
      });
    } catch (e: any) {
      toast.error("Failed to load analytics: " + e.message);
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    if (isAdmin) {
      loadAnalyticsData();
    }
  }, [isAdmin, loadAnalyticsData]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadAnalyticsData();
    setRefreshing(false);
    toast.success("Metrics refreshed.");
  };

  const handleExportCSV = () => {
    try {
      if (bookings.length === 0) {
        toast.error("No bookings available to export.");
        return;
      }

      // Define columns
      const headers = ["Reference Code", "Contact Name", "Contact Email", "Start Date", "End Date", "Total Fee", "Payment Status", "Booking Status", "Late Fee", "Damage Cost"];
      const rows = bookings.map((b) => [
        b.referenceCode || b.id,
        b.contactName,
        b.contactEmail,
        b.startDate,
        b.endDate,
        b.totalPayable,
        b.paymentStatus,
        b.status,
        b.lateFee || 0,
        b.damageCost || 0
      ]);

      const csvContent = "data:text/csv;charset=utf-8," 
        + [headers.join(","), ...rows.map(e => e.map(val => `"${String(val).replace(/"/g, '""')}"`).join(","))].join("\n");
      
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `aurevia_bookings_export_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("CSV file downloaded successfully!");
    } catch (e: any) {
      toast.error("CSV export failed: " + e.message);
    }
  };

  if (checkingAdmin) {
    return (
      <div className="min-h-screen bg-obsidian flex items-center justify-center text-gold-champagne font-mono text-xs uppercase animate-pulse">
        Retrieving dashboard authorization...
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-obsidian flex flex-col items-center justify-center gap-4 text-center">
        <AlertCircle className="text-rose-500 h-10 w-10 animate-bounce" />
        <h2 className="serif-heading text-xl text-ivory">Access Denied</h2>
        <p className="text-xs text-muted-gray">This portal is restricted to Aurevia admin operators.</p>
        <Link href="/dashboard" className="text-gold-champagne hover:underline text-xs">Return to Dashboard</Link>
      </div>
    );
  }

  // Pre-process charts data
  const revenueTrendData = stats?.revenueTrend || [];
  const cameraRevenueData = [
    { name: "Canon EOS R5", revenue: stats?.revenuePerCamera?.["p1000000-0000-0000-0000-000000000001"] || 0 },
    { name: "Nikon Z8", revenue: stats?.revenuePerCamera?.["p1000000-0000-0000-0000-000000000003"] || 0 }
  ];

  const couponPerformanceData = stats?.couponPerformance 
    ? Object.entries(stats.couponPerformance).map(([code, count]) => ({ name: code, value: Number(count) }))
    : [];

  return (
    <AuthGuard>
      <div className="min-h-screen bg-obsidian text-ivory pb-32">
        <Navbar cartItemCount={cart.length} />

        <div className="max-w-6xl mx-auto px-6 pt-32 space-y-8">
          {/* Header */}
          <div className="flex justify-between items-center flex-wrap gap-4">
            <div>
              <span className="text-[9px] text-gold-champagne uppercase font-mono tracking-widest block mb-1">Corporate CIP Panel</span>
              <h1 className="serif-heading text-2xl font-light text-ivory">Business & Vault Intelligence</h1>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={handleExportCSV}
                className="flex items-center gap-1.5 text-[10px] bg-white/10 hover:bg-white/15 text-gold-champagne border border-white/5 px-3.5 py-2.5 rounded-lg font-bold uppercase transition cursor-pointer"
              >
                <Download size={12} /> Export CSV
              </button>
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="flex items-center gap-1.5 text-[10px] text-muted-gray hover:text-ivory border border-white/10 px-3.5 py-2.5 rounded-lg transition cursor-pointer"
              >
                <RefreshCw size={11} className={refreshing ? "animate-spin" : ""} />
                Refresh
              </button>
            </div>
          </div>

          {loading ? (
            <p className="text-xs font-mono text-muted-gray uppercase animate-pulse">Running data aggregation audits...</p>
          ) : (
            <div className="space-y-8">
              {/* Metrics Grid */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5">
                <div className="glass-panel border-white/5 p-4 rounded-lg space-y-1.5">
                  <span className="text-[9px] uppercase font-mono text-gold-champagne flex items-center gap-1">
                    <DollarSign size={10} /> Lifetime Revenue
                  </span>
                  <p className="text-xl font-light text-ivory serif-heading">₹{(stats?.revenueTotal || 0).toLocaleString("en-IN")}</p>
                </div>
                <div className="glass-panel border-white/5 p-4 rounded-lg space-y-1.5">
                  <span className="text-[9px] uppercase font-mono text-indigo-400 flex items-center gap-1">
                    <Calendar size={10} /> MTD Revenue
                  </span>
                  <p className="text-xl font-light text-ivory serif-heading">₹{(stats?.revenueMonth || 0).toLocaleString("en-IN")}</p>
                </div>
                <div className="glass-panel border-white/5 p-4 rounded-lg space-y-1.5">
                  <span className="text-[9px] uppercase font-mono text-amber-400 flex items-center gap-1">
                    <TrendingUp size={10} /> Utilization
                  </span>
                  <p className="text-xl font-light text-ivory serif-heading">{stats?.utilizationRate || 0}%</p>
                </div>
                <div className="glass-panel border-white/5 p-4 rounded-lg space-y-1.5">
                  <span className="text-[9px] uppercase font-mono text-emerald-400 flex items-center gap-1">
                    <Users size={10} /> Repeat rate
                  </span>
                  <p className="text-xl font-light text-ivory serif-heading">{repeatStats.repeatRate}%</p>
                </div>
                <div className="glass-panel border-white/5 p-4 rounded-lg space-y-1.5 col-span-2 md:col-span-1">
                  <span className="text-[9px] uppercase font-mono text-muted-gray flex items-center gap-1">
                    <Award size={10} /> Waitlist
                  </span>
                  <p className="text-xl font-light text-ivory serif-heading">{stats?.waitlistCount || 0} Entries</p>
                </div>
              </div>

              {/* Charts grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Revenue Trend AreaChart */}
                <div className="glass-panel border-white/5 rounded-xl p-5 space-y-4">
                  <h3 className="text-xs uppercase font-mono tracking-wider text-gold-champagne">Daily Revenue Trend</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={revenueTrendData} margin={{ left: -10, right: 10, top: 10, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#D8B36A" stopOpacity={0.2}/>
                            <stop offset="95%" stopColor="#D8B36A" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#222" />
                        <XAxis dataKey="date" stroke="#9A9995" fontSize={9} />
                        <YAxis stroke="#9A9995" fontSize={9} />
                        <Tooltip contentStyle={{ backgroundColor: "#121212", border: "1px solid #333", fontSize: "11px", color: "#FFF" }} />
                        <Area type="monotone" dataKey="amount" stroke="#D8B36A" fillOpacity={1} fill="url(#colorRev)" strokeWidth={2} name="Revenue (₹)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Camera Performance BarChart */}
                <div className="glass-panel border-white/5 rounded-xl p-5 space-y-4">
                  <h3 className="text-xs uppercase font-mono tracking-wider text-indigo-400">Revenue Contribution by Camera</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={cameraRevenueData} margin={{ left: -10, right: 10, top: 10, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#222" />
                        <XAxis dataKey="name" stroke="#9A9995" fontSize={9} />
                        <YAxis stroke="#9A9995" fontSize={9} />
                        <Tooltip contentStyle={{ backgroundColor: "#121212", border: "1px solid #333", fontSize: "11px", color: "#FFF" }} />
                        <Bar dataKey="revenue" fill="#D8B36A" radius={[4, 4, 0, 0]} name="Revenue (₹)">
                          {cameraRevenueData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Coupon performance PieChart */}
                <div className="glass-panel border-white/5 rounded-xl p-5 space-y-4">
                  <h3 className="text-xs uppercase font-mono tracking-wider text-emerald-400">Promo Code Utilization</h3>
                  {couponPerformanceData.length === 0 ? (
                    <div className="h-64 flex items-center justify-center text-xs text-muted-gray uppercase font-mono">
                      No coupon uses recorded yet.
                    </div>
                  ) : (
                    <div className="h-64 flex items-center justify-center">
                      <div className="w-full h-full max-w-[280px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={couponPerformanceData}
                              cx="50%" cy="50%"
                              innerRadius={60}
                              outerRadius={80}
                              paddingAngle={5}
                              dataKey="value"
                            >
                              {couponPerformanceData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip contentStyle={{ backgroundColor: "#121212", border: "1px solid #333", fontSize: "11px", color: "#FFF" }} />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  )}
                </div>

                {/* Top Customers Panel */}
                <div className="glass-panel border-white/5 rounded-xl p-5 space-y-4">
                  <h3 className="text-xs uppercase font-mono tracking-wider text-amber-400">Top Photographic Members</h3>
                  <div className="space-y-3.5">
                    {repeatStats.topCustomers.map((cust, idx) => (
                      <div key={cust.email} className="flex justify-between items-center border-b border-white/5 pb-2 last:border-b-0">
                        <div>
                          <p className="text-xs font-semibold text-ivory">{cust.name}</p>
                          <p className="text-[9px] text-muted-gray">{cust.email}</p>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-mono font-bold text-gold-champagne">₹{cust.spend.toLocaleString("en-IN")}</span>
                          <p className="text-[9px] text-muted-gray">{cust.count} bookings</p>
                        </div>
                      </div>
                    ))}
                    {repeatStats.topCustomers.length === 0 && (
                      <p className="text-xs text-muted-gray italic">No customer profiles parsed yet.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </AuthGuard>
  );
}
