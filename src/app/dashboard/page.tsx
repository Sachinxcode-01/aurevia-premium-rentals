"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/navigation/Navbar";
import { db, Booking, UserProfile } from "@/lib/db/store";
import { MOCK_PRODUCTS } from "@/lib/db/mockData";
import { useCart } from "@/hooks/useCart";
import {
  User,
  ShoppingBag,
  History,
  TrendingUp,
  Settings,
  Mail,
  Phone,
  MapPin,
  Calendar,
  CheckCircle,
  FileText,
  MessageCircle,
  Camera,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { animate, stagger } from "animejs";

export default function CustomerDashboard() {
  const { cart } = useCart();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [activeTab, setActiveTab] = useState<"overview" | "bookings" | "settings">("overview");
  
  // Stats
  const [stats, setStats] = useState({
    totalBookings: 0,
    activeRentals: 0,
    completedRentals: 0,
    totalSpent: 0,
  });

  // Profile Edit fields
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    const loadDashboardData = async () => {
      const prof = await db.getProfile();
      setProfile(prof);
      setName(prof.fullName);
      setPhone(prof.phone);
      setEmail(prof.email);

      const list = await db.getBookings(prof.id);
      setBookings(list);

      // Calculations
      const totalBookings = list.length;
      const activeRentals = list.filter((b) => b.status === "confirmed" || b.status === "picked_up").length;
      const completedRentals = list.filter((b) => b.status === "returned").length;
      const totalSpent = list
        .filter((b) => b.status !== "cancelled" && b.status !== "rejected")
        .reduce((sum, b) => sum + b.totalPayable, 0);

      setStats({
        totalBookings,
        activeRentals,
        completedRentals,
        totalSpent,
      });

      // Animate dashboard entrance
      setTimeout(() => {
        animate(".dashboard-animate", {
          opacity: [0, 1],
          translateY: [15, 0],
          delay: stagger(60),
          duration: 600,
          ease: "easeOutQuad",
        });
      }, 50);
    };

    loadDashboardData();
  }, [activeTab]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveSuccess(false);
    const updated = await db.updateProfile({
      fullName: name,
      phone: phone,
      email: email,
    });
    setProfile(updated);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  // Mock Invoice download trigger
  const handleDownloadInvoice = (booking: Booking) => {
    alert(`Generating Premium PDF Invoice for ${booking.referenceCode}...\nDownloaded successfully!`);
  };

  // Spending trend mock data
  const spendingTrendData = [
    { name: "Jan", amount: 0 },
    { name: "Mar", amount: 0 },
    { name: "May", amount: 0 },
    { name: "Jul", amount: stats.totalSpent },
  ];

  // Category Preference chart data
  const categoryData = [
    { name: "Mirrorless Bodies", value: 65 },
    { name: "Cinema Lenses", value: 20 },
    { name: "Stabilizers", value: 15 },
  ];
  const COLORS = ["#D8B36A", "#B98A43", "#F5F1E8"];

  return (
    <div className="min-h-screen bg-obsidian text-ivory pb-20">
      <Navbar cartItemCount={cart.length} />

      <div className="pt-32 pb-10 px-6 md:px-12 max-w-7xl mx-auto border-b border-white/5 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div className="space-y-1">
          <span className="text-[10px] font-semibold uppercase tracking-[0.25em] text-gold-champagne font-mono block">
            Aurevia Club Member
          </span>
          <h1 className="serif-heading text-3xl md:text-4xl font-light text-ivory">
            Welcome Back, <span className="text-gold">{profile?.fullName}</span>
          </h1>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-2 bg-white/5 p-1 rounded border border-white/5">
          <button
            onClick={() => setActiveTab("overview")}
            className={`px-4 py-2 text-xs font-semibold rounded uppercase tracking-wider transition cursor-pointer ${
              activeTab === "overview" ? "bg-gold-champagne text-obsidian" : "text-muted-gray hover:text-ivory"
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab("bookings")}
            className={`px-4 py-2 text-xs font-semibold rounded uppercase tracking-wider transition cursor-pointer ${
              activeTab === "bookings" ? "bg-gold-champagne text-obsidian" : "text-muted-gray hover:text-ivory"
            }`}
          >
            My Rentals
          </button>
          <button
            onClick={() => setActiveTab("settings")}
            className={`px-4 py-2 text-xs font-semibold rounded uppercase tracking-wider transition cursor-pointer ${
              activeTab === "settings" ? "bg-gold-champagne text-obsidian" : "text-muted-gray hover:text-ivory"
            }`}
          >
            Settings
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-12 py-10">
        
        {/* ==============================================
            TAB 1: OVERVIEW COCKPIT
            ============================================== */}
        {activeTab === "overview" && (
          <div className="space-y-10">
            {/* Metric Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="dashboard-animate opacity-0 glass-panel border-white/5 rounded-lg p-6 space-y-4">
                <div className="flex justify-between items-center text-muted-gray">
                  <span className="text-[10px] uppercase tracking-wider font-mono">Active Rentals</span>
                  <Camera size={16} className="text-gold-champagne" />
                </div>
                <div className="text-3xl font-light">{stats.activeRentals}</div>
                <p className="text-[9px] text-muted-gray uppercase tracking-widest font-mono">Currently checked out</p>
              </div>

              <div className="dashboard-animate opacity-0 glass-panel border-white/5 rounded-lg p-6 space-y-4">
                <div className="flex justify-between items-center text-muted-gray">
                  <span className="text-[10px] uppercase tracking-wider font-mono">Total Bookings</span>
                  <ShoppingBag size={16} className="text-gold-champagne" />
                </div>
                <div className="text-3xl font-light">{stats.totalBookings}</div>
                <p className="text-[9px] text-muted-gray uppercase tracking-widest font-mono">Life-time orders count</p>
              </div>

              <div className="dashboard-animate opacity-0 glass-panel border-white/5 rounded-lg p-6 space-y-4">
                <div className="flex justify-between items-center text-muted-gray">
                  <span className="text-[10px] uppercase tracking-wider font-mono">Completed Returns</span>
                  <History size={16} className="text-gold-champagne" />
                </div>
                <div className="text-3xl font-light">{stats.completedRentals}</div>
                <p className="text-[9px] text-muted-gray uppercase tracking-widest font-mono">Vault items returned</p>
              </div>

              <div className="dashboard-animate opacity-0 glass-panel border-white/5 rounded-lg p-6 space-y-4">
                <div className="flex justify-between items-center text-muted-gray">
                  <span className="text-[10px] uppercase tracking-wider font-mono">Total spent volume</span>
                  <TrendingUp size={16} className="text-gold-champagne" />
                </div>
                <div className="text-3xl font-light text-gold-champagne">₹{stats.totalSpent.toLocaleString("en-IN")}</div>
                <p className="text-[9px] text-muted-gray uppercase tracking-widest font-mono font-medium">Verified payments</p>
              </div>
            </div>

            {/* Visual Charts & Timeline Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Spending Trend */}
              <div className="dashboard-animate opacity-0 lg:col-span-2 glass-panel border-white/5 rounded-lg p-6 space-y-4">
                <h3 className="serif-heading text-lg font-light text-ivory border-b border-white/5 pb-2">Annual Spending Trend</h3>
                <div className="h-60 w-full pt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={spendingTrendData}>
                      <defs>
                        <linearGradient id="colorSpent" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#D8B36A" stopOpacity={0.25} />
                          <stop offset="95%" stopColor="#D8B36A" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="name" stroke="#9A9995" fontSize={10} tickLine={false} axisLine={false} />
                      <YAxis stroke="#9A9995" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${v}`} />
                      <Tooltip contentStyle={{ backgroundColor: "#171719", borderColor: "rgba(216,179,106,0.35)", borderRadius: 6 }} />
                      <Area type="monotone" dataKey="amount" stroke="#D8B36A" strokeWidth={2} fillOpacity={1} fill="url(#colorSpent)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Category preference */}
              <div className="dashboard-animate opacity-0 glass-panel border-white/5 rounded-lg p-6 space-y-4 flex flex-col justify-between">
                <h3 className="serif-heading text-lg font-light text-ivory border-b border-white/5 pb-2">Category Preference</h3>
                
                <div className="h-44 w-full flex items-center justify-center relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={70}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {categoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex items-center justify-center flex-col pointer-events-none">
                    <span className="text-xl font-bold text-gold-champagne">65%</span>
                    <span className="text-[8px] text-muted-gray uppercase font-mono font-light">Mirrorless</span>
                  </div>
                </div>

                <div className="space-y-2 pt-2 border-t border-white/5 text-[10px]">
                  {categoryData.map((entry, index) => (
                    <div key={entry.name} className="flex justify-between items-center">
                      <span className="flex items-center gap-1.5 text-muted-gray">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[index] }} />
                        {entry.name}
                      </span>
                      <span className="font-semibold">{entry.value}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Timeline of upcoming logistics */}
            <div className="dashboard-animate opacity-0 glass-panel border-white/5 rounded-lg p-6 space-y-6">
              <h3 className="serif-heading text-lg font-light text-ivory border-b border-white/5 pb-2">Pickup & Return Logistics Timeline</h3>
              
              <div className="relative border-l-2 border-white/10 pl-6 ml-4 space-y-8">
                {bookings.slice(0, 2).map((booking) => (
                  <div key={booking.id} className="relative">
                    {/* Circle icon on timeline */}
                    <span className="absolute -left-10 top-0.5 w-6 h-6 rounded-full bg-obsidian border-2 border-gold-champagne flex items-center justify-center text-[10px] text-gold-champagne font-mono font-semibold">
                      L
                    </span>

                    <div className="space-y-2 text-left">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <h4 className="text-sm font-semibold text-gold-champagne uppercase font-mono tracking-wider">
                          Booking {booking.referenceCode} ({booking.status.toUpperCase()})
                        </h4>
                        <span className="text-[10px] text-muted-gray font-mono">{booking.startDate} to {booking.endDate}</span>
                      </div>
                      <p className="text-xs text-muted-gray max-w-2xl font-light leading-relaxed">
                        Pickup from Aurevia Studio: Ensure to bring a government physical ID matching registration full name ({booking.contactName}). Contact the hotline at 9686909048 for directions.
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ==============================================
            TAB 2: BOOKINGS LISTING
            ============================================== */}
        {activeTab === "bookings" && (
          <div className="space-y-6">
            {bookings.length === 0 ? (
              <div className="glass-panel border-white/5 rounded p-12 text-center text-muted-gray text-xs">
                No bookings registered in history.
              </div>
            ) : (
              bookings.map((booking) => (
                <div
                  key={booking.id}
                  className="dashboard-animate opacity-0 glass-panel border-white/5 rounded-lg p-6 space-y-4 hover:border-gold-border/30 transition duration-300"
                >
                  <div className="flex flex-wrap items-center justify-between border-b border-white/5 pb-4 gap-4">
                    <div>
                      <span className="text-[9px] text-gold-champagne uppercase font-mono tracking-widest block mb-1">Vault Reservation</span>
                      <h4 className="serif-heading text-lg font-light text-ivory">{booking.referenceCode}</h4>
                    </div>

                    <div className="flex gap-4 items-center">
                      <div className="text-right">
                        <span className="text-[8px] text-muted-gray uppercase block font-mono">Total Paid</span>
                        <span className="text-sm font-semibold text-gold-champagne">₹{booking.totalPayable.toLocaleString("en-IN")}</span>
                      </div>
                      
                      <span className={`px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider rounded border ${
                        booking.status === "confirmed" || booking.status === "returned"
                          ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                          : "bg-amber-500/10 border-amber-500/30 text-amber-400"
                      }`}>
                        {booking.status}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs font-light text-muted-gray leading-relaxed">
                    <div className="space-y-1">
                      <p className="flex items-center gap-1.5"><Calendar size={13} className="text-gold-champagne" /> <strong>Duration:</strong> {booking.startDate} to {booking.endDate}</p>
                      <p className="flex items-center gap-1.5"><MapPin size={13} className="text-gold-champagne" /> <strong>Mode:</strong> {booking.deliveryMethod.toUpperCase()}</p>
                      <p className="flex items-center gap-1.5"><User size={13} className="text-gold-champagne" /> <strong>Renter:</strong> {booking.contactName} ({booking.contactPhone})</p>
                    </div>

                    <div className="flex flex-col justify-end items-end gap-3">
                      <div className="flex gap-3">
                        <button
                          onClick={() => handleDownloadInvoice(booking)}
                          className="px-4 py-2 border border-white/10 hover:border-white/30 rounded text-[10px] font-semibold uppercase tracking-wider text-ivory transition cursor-pointer flex items-center gap-1"
                        >
                          <FileText size={11} />
                          Invoice
                        </button>
                        
                        <a
                          href={`https://wa.me/919686909048?text=Enquiry%20regarding%20booking%20${booking.referenceCode}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-[10px] font-semibold uppercase tracking-wider transition cursor-pointer flex items-center gap-1"
                        >
                          <MessageCircle size={11} />
                          Support
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* ==============================================
            TAB 3: SETTINGS PROFILE EDIT
            ============================================== */}
        {activeTab === "settings" && (
          <div className="max-w-xl mx-auto glass-panel border-white/5 rounded-lg p-6 md:p-8 space-y-6 dashboard-animate opacity-0">
            <h3 className="serif-heading text-xl font-light text-ivory border-b border-white/5 pb-3">Edit Club Profile</h3>

            {saveSuccess && (
              <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono rounded">
                ✓ Club profile details updated successfully.
              </div>
            )}

            <form onSubmit={handleSaveProfile} className="space-y-4 text-xs font-sans">
              <div className="space-y-2">
                <label className="text-[10px] text-muted-gray uppercase font-mono tracking-wider block">Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 text-xs rounded p-2.5 focus:outline-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] text-muted-gray uppercase font-mono tracking-wider block">Registered Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 text-xs rounded p-2.5 focus:outline-none focus:border-white/20"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] text-muted-gray uppercase font-mono tracking-wider block">Mobile Number</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 text-xs rounded p-2.5 focus:outline-none"
                />
              </div>

              <div className="pt-4 border-t border-white/5">
                <button
                  type="submit"
                  className="w-full py-3 bg-gold-champagne hover:bg-gold-warm text-obsidian text-xs font-bold uppercase tracking-wider rounded transition cursor-pointer"
                >
                  Save Profile Changes
                </button>
              </div>
            </form>
          </div>
        )}

      </div>
    </div>
  );
}
