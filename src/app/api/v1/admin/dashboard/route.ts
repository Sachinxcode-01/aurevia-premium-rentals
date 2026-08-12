import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/lib/api/response";
import { verifyApiAuth } from "@/lib/auth/rbac";
import { createServiceSupabaseClient } from "@/lib/supabase/server";
import { MOCK_PRODUCTS } from "@/lib/db/mockData";

export async function GET(req: NextRequest) {
  try {
    // Enforce Admin or Staff Server-Side RBAC
    const { user, response } = await verifyApiAuth(req, ["admin", "staff", "super_admin"]);
    if (response || !user) return response!;

    const { searchParams } = new URL(req.url);
    const timeRange = searchParams.get("range") || "30D";

    const supabase = await createServiceSupabaseClient();

    // 1. Fetch Bookings from DB
    const { data: bookings } = await supabase
      .from("bookings")
      .select("*, booking_items(*, product:products(name, slug, daily_price))")
      .order("created_at", { ascending: false });

    // 2. Fetch KYC Documents from DB
    const { data: kycDocs } = await supabase
      .from("kyc_documents")
      .select("*");

    // 3. Fetch Inventory Units from DB
    const { data: inventoryUnits } = await supabase
      .from("inventory_units")
      .select("*");

    // 4. Fetch Audit Logs from DB
    const { data: auditLogs } = await supabase
      .from("audit_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(10);

    const todayStr = new Date().toISOString().split("T")[0];

    // Compute Key KPI aggregates from DB
    let totalRevenue = 0;
    let todaysRevenue = 0;
    let todayTxCount = 0;
    let activeRentals = 0;
    let overdueCount = 0;

    const allBookings = bookings || [];

    for (const b of allBookings) {
      const payable = Number(b.total_payable) || 0;
      if (b.status !== "cancelled" && b.status !== "rejected") {
        totalRevenue += payable;
      }

      if (b.created_at && b.created_at.startsWith(todayStr)) {
        todaysRevenue += payable;
        todayTxCount++;
      }

      if (b.status === "rented" || b.status === "picked_up") {
        activeRentals++;
      }

      if (b.status === "overdue") {
        overdueCount++;
      }
    }

    const pendingKYC = (kycDocs || []).filter((d: any) => d.status === "pending").length;

    // Build 30D Time-Series Data from actual bookings
    const daysCount = timeRange === "7D" ? 7 : timeRange === "90D" ? 90 : 30;
    const timeSeriesMap: Record<string, { date: string; revenue: number; bookings: number }> = {};

    const now = new Date();
    for (let i = daysCount - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateKey = d.toISOString().split("T")[0];
      const label = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      timeSeriesMap[dateKey] = { date: label, revenue: 0, bookings: 0 };
    }

    for (const b of allBookings) {
      if (!b.created_at) continue;
      const dateKey = b.created_at.split("T")[0];
      if (timeSeriesMap[dateKey]) {
        timeSeriesMap[dateKey].revenue += Number(b.total_payable) || 0;
        timeSeriesMap[dateKey].bookings += 1;
      }
    }

    const revenueTimeSeries = Object.values(timeSeriesMap);

    // Compute Status Distribution
    const statusCounts: Record<string, number> = {
      "Active Rentals": activeRentals,
      "Ready Pickup": allBookings.filter((b: any) => b.status === "ready_for_pickup" || b.status === "confirmed").length,
      "Approval Pending": allBookings.filter((b: any) => b.status === "pending" || b.status === "approval_pending").length,
      "Returned": allBookings.filter((b: any) => b.status === "returned").length,
      "Completed": allBookings.filter((b: any) => b.status === "completed").length,
      "Overdue": overdueCount,
    };

    const statusDistribution = [
      { name: "Active Rentals", value: statusCounts["Active Rentals"] || 0, color: "#818cf8" },
      { name: "Ready Pickup", value: statusCounts["Ready Pickup"] || 0, color: "#34d399" },
      { name: "Approval Pending", value: statusCounts["Approval Pending"] || 0, color: "#fbbf24" },
      { name: "Returned", value: statusCounts["Returned"] || 0, color: "#c084fc" },
      { name: "Completed", value: statusCounts["Completed"] || 0, color: "#9ca3af" },
      { name: "Overdue", value: statusCounts["Overdue"] || 0, color: "#f87171" },
    ];

    // Compute Flagship Equipment Utilization from database
    const totalInventoryUnits = inventoryUnits?.length || 0;
    const rentedUnitsCount = (inventoryUnits || []).filter((u: any) => u.status === "rented").length;
    const fleetUtilization = totalInventoryUnits > 0 ? Math.round((rentedUnitsCount / totalInventoryUnits) * 100) : 0;

    const mostRentedGear = MOCK_PRODUCTS.slice(0, 4).map((p: any) => {
      const unitCount = (inventoryUnits || []).filter((u: any) => u.product_id === p.id).length;
      const rentedUnits = (inventoryUnits || []).filter((u: any) => u.product_id === p.id && u.status === "rented").length;
      const utilization = unitCount > 0 ? Math.round((rentedUnits / unitCount) * 100) : 0;
      const productBookings = allBookings.filter((b: any) =>
        b.booking_items?.some((bi: any) => bi.product_id === p.id)
      ).length;
      return {
        id: p.id,
        name: p.name,
        count: productBookings,
        revenue: p.dailyPrice * productBookings,
        utilization,
        image: "imageUrl" in p ? String(p.imageUrl) : "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=400",
      };
    });

    // Format Recent Bookings
    const recentBookings = allBookings.slice(0, 5).map((b: any) => ({
      id: b.reference_code || `AUR-${b.id.slice(0, 5)}`,
      customer: b.contact_name || "Customer",
      gear: b.booking_items?.[0]?.product?.name || "Cinema Camera Package",
      dates: `${b.start_date} - ${b.end_date}`,
      amount: Number(b.total_payable) || 0,
      payment: b.payment_status?.toUpperCase() || "UNPAID",
      status: b.status || "pending",
    }));

    // Format Activity Feed
    const activityFeed = (auditLogs || []).map((a: any, idx: number) => ({
      id: a.id || idx + 1,
      text: `${a.action.replace(/\./g, " ").toUpperCase()}: ${a.resource} #${a.resource_id || ""}`,
      time: new Date(a.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      type: a.action.split(".")[0],
    }));

    return successResponse({
      kpis: {
        totalRevenue,
        todaysRevenue,
        todayTxCount,
        activeRentals,
        fleetUtilization,
        pendingKYC,
        overdueCount,
      },
      revenueTimeSeries,
      statusDistribution,
      mostRentedGear,
      recentBookings: recentBookings.length > 0 ? recentBookings : [],
      activityFeed: activityFeed.length > 0 ? activityFeed : [],
    }, "Admin dashboard metrics retrieved");
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Failed to load dashboard metrics";
    return errorResponse("ADMIN_DASHBOARD_ERROR", errorMsg, 500);
  }
}
