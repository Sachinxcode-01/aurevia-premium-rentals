import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/lib/api/response";
import { verifyApiAuth } from "@/lib/auth/rbac";
import { createServiceSupabaseClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  try {
    const { user, response } = await verifyApiAuth(req, ["admin", "staff", "super_admin"]);
    if (response || !user) return response!;

    const { searchParams } = new URL(req.url);
    const range = (searchParams.get("range") || "30d").toLowerCase();

    const supabase = await createServiceSupabaseClient();

    // Determine day count from range filter
    let daysCount = 30;
    if (range === "7d") daysCount = 7;
    else if (range === "90d" || range === "3m") daysCount = 90;
    else if (range === "6m") daysCount = 180;
    else if (range === "1y") daysCount = 365;

    const startDateObj = new Date();
    startDateObj.setDate(startDateObj.getDate() - daysCount);
    const startDateIso = startDateObj.toISOString();

    // 1. Fetch filtered bookings from DB
    const { data: bookings } = await supabase
      .from("bookings")
      .select("id, total_payable, status, created_at, profile_id")
      .gte("created_at", startDateIso)
      .order("created_at", { ascending: true });

    // 2. Fetch inventory units count for utilization formula
    const { data: units } = await supabase
      .from("inventory_units")
      .select("id, status");

    const totalFleetUnits = units?.length || 20;
    const rentedUnitsCount = (units || []).filter((u) => u.status === "rented").length;
    const fleetUtilizationRate = Math.round((rentedUnitsCount / Math.max(1, totalFleetUnits)) * 100);

    // 3. Build time-series data
    const dateMap: Record<string, { date: string; revenue: number; bookings: number }> = {};
    const now = new Date();

    for (let i = daysCount - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateKey = d.toISOString().split("T")[0];
      const dateLabel = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      dateMap[dateKey] = { date: dateLabel, revenue: 0, bookings: 0 };
    }

    let totalPeriodRevenue = 0;
    let totalPeriodBookings = 0;

    if (bookings) {
      for (const b of bookings) {
        const dateKey = b.created_at ? b.created_at.split("T")[0] : "";
        const payable = Number(b.total_payable) || 0;

        if (b.status !== "cancelled" && b.status !== "rejected") {
          totalPeriodRevenue += payable;
          totalPeriodBookings += 1;
        }

        if (dateMap[dateKey]) {
          dateMap[dateKey].revenue += payable;
          dateMap[dateKey].bookings += 1;
        }
      }
    }

    const timeSeries = Object.values(dateMap);

    return successResponse(
      {
        range,
        summary: {
          totalRevenue: totalPeriodRevenue,
          totalBookings: totalPeriodBookings,
          averageOrderValue: totalPeriodBookings > 0 ? Math.round(totalPeriodRevenue / totalPeriodBookings) : 0,
          fleetUtilizationRate,
        },
        timeSeries,
      },
      `Revenue and booking analytics generated for ${range} duration`
    );
  } catch (err: any) {
    return errorResponse("ADMIN_ANALYTICS_FAILED", err.message || "Failed to calculate analytics", 500);
  }
}
