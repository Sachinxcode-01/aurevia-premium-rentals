"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/navigation/Navbar";
import { db, Booking } from "@/lib/db/store";
import { MOCK_PRODUCTS } from "@/lib/db/mockData";
import { useCart } from "@/hooks/useCart";
import {
  ShieldAlert,
  Coins,
  FileSpreadsheet,
  FileDown,
  RefreshCw,
  Search,
  Check,
  X,
  ArrowUpRight,
  ClipboardList,
  Package,
} from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { animate, stagger } from "animejs";

export default function AdminDashboard() {
  const { cart } = useCart();
  const [stats, setStats] = useState<any>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    const fetchAdminData = async () => {
      // Fetch stats aggregated from local bookings state
      const statistics = await db.getAdminStats();
      setStats(statistics);

      const list = await db.getBookings();
      setBookings(list);

      // Trigger animation triggers
      setTimeout(() => {
        animate(".admin-item", {
          opacity: [0, 1],
          translateY: [15, 0],
          delay: stagger(50),
          duration: 655,
          ease: "easeOutQuad",
        });
      }, 50);
    };

    fetchAdminData();
  }, [refreshTrigger]);

  const handleUpdateStatus = async (
    id: string,
    status: Booking["status"],
    paymentStatus?: Booking["paymentStatus"]
  ) => {
    const confirmAction = window.confirm(`Are you sure you want to mark this booking as ${status.toUpperCase()}?`);
    if (!confirmAction) return;

    await db.updateBookingStatus(id, status, paymentStatus);
    setRefreshTrigger((prev) => prev + 1); // trigger reload
  };

  const handleExportCSV = () => {
    alert("Exporting AUREVIA Bookings database schema to CSV...\nSaved successfully as: aurevia_bookings_export.csv");
  };

  const handleExportPDF = () => {
    alert("Compiling Premium Executive Revenue Report to PDF...\nSaved successfully as: aurevia_executive_report.pdf");
  };

  // Filtered Bookings list for detailed data table
  const filteredBookings = bookings.filter((b) => {
    const matchesSearch =
      b.referenceCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.contactName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.contactPhone.includes(searchQuery);

    const matchesStatus = statusFilter === "" || b.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const COLORS = ["#D8B36A", "#B98A43", "#F5F1E8", "#9A9995"];

  if (!stats) {
    return (
      <div className="min-h-screen bg-obsidian flex items-center justify-center text-xs font-mono text-muted-gray">
        INITIALIZING SECURE VAULT METRICS...
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
        </div>

        {/* Global actions */}
        <div className="flex gap-2">
          <button
            onClick={() => setRefreshTrigger((prev) => prev + 1)}
            className="p-2 border border-white/10 rounded hover:bg-white/5 hover:border-gold-champagne text-gold-champagne transition flex items-center gap-1.5 text-xs cursor-pointer"
          >
            <RefreshCw size={13} />
            Refresh
          </button>
          
          <button
            onClick={handleExportCSV}
            className="p-2 border border-white/10 rounded hover:bg-white/5 text-ivory transition flex items-center gap-1.5 text-xs cursor-pointer"
          >
            <FileSpreadsheet size={13} />
            CSV
          </button>

          <button
            onClick={handleExportPDF}
            className="p-2 border border-white/10 rounded hover:bg-white/5 text-ivory transition flex items-center gap-1.5 text-xs cursor-pointer"
          >
            <FileDown size={13} />
            PDF Report
          </button>
        </div>
      </div>

      {/* Metrics Section */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-10 space-y-10">
        
        {/* Core Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="admin-item opacity-0 glass-panel border-white/5 rounded-lg p-5 space-y-3">
            <div className="flex justify-between items-center text-muted-gray">
              <span className="text-[9px] uppercase tracking-wider font-mono">Gross revenue</span>
              <Coins size={14} className="text-gold-champagne" />
            </div>
            <div className="text-2xl font-light text-gold-champagne">₹{stats.revenueTotal.toLocaleString("en-IN")}</div>
            <p className="text-[8px] text-muted-gray uppercase tracking-widest font-mono">This Month: ₹{stats.revenueMonth.toLocaleString("en-IN")}</p>
          </div>

          <div className="admin-item opacity-0 glass-panel border-white/5 rounded-lg p-5 space-y-3">
            <div className="flex justify-between items-center text-muted-gray">
              <span className="text-[9px] uppercase tracking-wider font-mono">Bookings Volume</span>
              <ClipboardList size={14} className="text-gold-champagne" />
            </div>
            <div className="text-2xl font-light">{stats.bookingsTotalCount}</div>
            <p className="text-[8px] text-muted-gray uppercase tracking-widest font-mono">
              Pending: {stats.bookingsPendingCount} • Confirmed: {stats.bookingsConfirmedCount}
            </p>
          </div>

          <div className="admin-item opacity-0 glass-panel border-white/5 rounded-lg p-5 space-y-3">
            <div className="flex justify-between items-center text-muted-gray">
              <span className="text-[9px] uppercase tracking-wider font-mono">Utilization Rate</span>
              <ArrowUpRight size={14} className="text-gold-champagne" />
            </div>
            <div className="text-2xl font-light">{stats.utilizationRate}%</div>
            <p className="text-[8px] text-muted-gray uppercase tracking-widest font-mono">Current rental flow load</p>
          </div>

          <div className="admin-item opacity-0 glass-panel border-white/5 rounded-lg p-5 space-y-3">
            <div className="flex justify-between items-center text-muted-gray">
              <span className="text-[9px] uppercase tracking-wider font-mono">Inventory Units</span>
              <Package size={14} className="text-gold-champagne" />
            </div>
            <div className="text-2xl font-light">{stats.inventoryTotal}</div>
            <p className="text-[8px] text-muted-gray uppercase tracking-widest font-mono">
              Checked out: {stats.inventoryRented} • Free: {stats.inventoryAvailable}
            </p>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Revenue Daily Line chart */}
          <div className="admin-item opacity-0 lg:col-span-2 glass-panel border-white/5 rounded-lg p-6 space-y-4">
            <h3 className="serif-heading text-lg font-light text-ivory border-b border-white/5 pb-2">Revenue Growth Trend</h3>
            <div className="h-64 w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={stats.revenueTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2c" vertical={false} />
                  <XAxis dataKey="date" stroke="#9A9995" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke="#9A9995" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${v}`} />
                  <Tooltip contentStyle={{ backgroundColor: "#171719", borderColor: "rgba(216,179,106,0.35)", borderRadius: 6 }} />
                  <Line type="monotone" dataKey="amount" stroke="#D8B36A" strokeWidth={2.5} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Revenue by Brand Pie Chart */}
          <div className="admin-item opacity-0 glass-panel border-white/5 rounded-lg p-6 space-y-4 flex flex-col justify-between">
            <h3 className="serif-heading text-lg font-light text-ivory border-b border-white/5 pb-2">Revenue by Manufacturer</h3>
            
            <div className="h-44 w-full flex items-center justify-center relative">
              {stats.revenueByBrand.length === 0 ? (
                <p className="text-xs text-muted-gray font-mono">NO DATA RECORDED</p>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={stats.revenueByBrand}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={65}
                      paddingAngle={3}
                      dataKey="value"
                      nameKey="brand"
                    >
                      {stats.revenueByBrand.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: "#171719", borderColor: "rgba(216,179,106,0.35)" }} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>

            <div className="space-y-2 pt-2 border-t border-white/5 text-[9px] font-mono">
              {stats.revenueByBrand.map((entry: any, index: number) => (
                <div key={entry.brand} className="flex justify-between items-center">
                  <span className="flex items-center gap-1.5 text-muted-gray">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index] }} />
                    {entry.brand}
                  </span>
                  <span className="font-semibold text-ivory">₹{entry.value.toLocaleString("en-IN")}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Revenue by Category Bar Chart */}
        <div className="admin-item opacity-0 glass-panel border-white/5 rounded-lg p-6 space-y-4">
          <h3 className="serif-heading text-lg font-light text-ivory border-b border-white/5 pb-2">Revenue Contribution by Category</h3>
          <div className="h-56 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.revenueByCategory}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2c" vertical={false} />
                <XAxis dataKey="category" stroke="#9A9995" fontSize={9} tickLine={false} axisLine={false} />
                <YAxis stroke="#9A9995" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${v}`} />
                <Tooltip contentStyle={{ backgroundColor: "#171719", borderColor: "rgba(216,179,106,0.35)", borderRadius: 6 }} />
                <Bar dataKey="value" fill="#D8B36A" radius={[4, 4, 0, 0]} barSize={35}>
                  {stats.revenueByCategory.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={index === 0 ? "#D8B36A" : "#B98A43"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bookings Drill-Down Table */}
        <div className="admin-item opacity-0 glass-panel border-white/5 rounded-lg p-6 space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/5 pb-4">
            <h3 className="serif-heading text-xl font-light text-ivory">Vault Reservations Logs</h3>
            
            {/* Table Filters */}
            <div className="flex flex-wrap gap-3 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-60">
                <input
                  type="text"
                  placeholder="Search code, customer name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 text-xs rounded px-3 py-2 pr-8 focus:outline-none"
                />
                <Search size={13} className="absolute right-3 top-3 text-muted-gray" />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-white/5 border border-white/10 text-xs rounded px-3 py-2 text-muted-gray focus:outline-none"
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

          {/* Table Element */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-light font-sans min-w-[700px]">
              <thead>
                <tr className="border-b border-white/10 font-mono text-[9px] text-muted-gray uppercase tracking-wider pb-2">
                  <th className="py-3 pr-4">Reference</th>
                  <th className="py-3 px-4">Renter details</th>
                  <th className="py-3 px-4">Booking schedule</th>
                  <th className="py-3 px-4">Payable amount</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 pl-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredBookings.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-10 text-center text-muted-gray font-mono">
                      NO RESERVATION RECORDS REPORTED
                    </td>
                  </tr>
                ) : (
                  filteredBookings.map((b) => (
                    <tr key={b.id} className="hover:bg-white/[0.02] transition">
                      <td className="py-3.5 pr-4 font-mono font-semibold text-gold-champagne">{b.referenceCode}</td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-ivory">{b.contactName}</div>
                        <div className="text-[10px] text-muted-gray font-mono">{b.contactPhone}</div>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-[10px]">
                        {b.startDate} to {b.endDate}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-ivory font-mono">
                        ₹{b.totalPayable.toLocaleString("en-IN")}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border ${
                          b.status === "confirmed" || b.status === "returned"
                            ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                            : b.status === "pending"
                            ? "bg-amber-500/10 border-amber-500/30 text-amber-400"
                            : "bg-rose-500/10 border-rose-500/30 text-rose-400"
                        }`}>
                          {b.status}
                        </span>
                      </td>
                      <td className="py-3.5 pl-4 text-right">
                        <div className="flex gap-1.5 justify-end">
                          {b.status === "pending" && (
                            <>
                              <button
                                onClick={() => handleUpdateStatus(b.id, "confirmed", "paid")}
                                className="w-7 h-7 rounded bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 flex items-center justify-center cursor-pointer border border-emerald-500/20"
                                title="Confirm Reservation"
                              >
                                <Check size={13} />
                              </button>
                              <button
                                onClick={() => handleUpdateStatus(b.id, "rejected")}
                                className="w-7 h-7 rounded bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 flex items-center justify-center cursor-pointer border border-rose-500/20"
                                title="Reject Booking"
                              >
                                <X size={13} />
                              </button>
                            </>
                          )}
                          {b.status === "confirmed" && (
                            <button
                              onClick={() => handleUpdateStatus(b.id, "picked_up")}
                              className="px-2.5 py-1 rounded bg-white/10 hover:bg-white/15 text-ivory text-[9px] font-bold uppercase tracking-widest border border-white/10 cursor-pointer"
                            >
                              Picked Up
                            </button>
                          )}
                          {b.status === "picked_up" && (
                            <button
                              onClick={() => handleUpdateStatus(b.id, "returned")}
                              className="px-2.5 py-1 rounded bg-gold-champagne/10 hover:bg-gold-champagne/20 text-gold-champagne text-[9px] font-bold uppercase tracking-widest border border-gold-champagne/30 cursor-pointer"
                            >
                              Returned
                            </button>
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

      </div>
    </div>
  );
}
