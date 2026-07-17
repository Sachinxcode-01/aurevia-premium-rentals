import { NextResponse } from "next/server";
import { db } from "@/lib/db/store";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  try {
    const { isSupabaseConfigured } = await import("@/lib/db/store");
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") || "bookings"; // bookings, maintenance, refunds

    // 1. Authorize Admin/Staff
    if (isSupabaseConfigured()) {
      const supabase = await createServerSupabaseClient();
      const { data: { user }, error: authErr } = await supabase.auth.getUser();
      if (authErr || !user) {
        return new Response("Unauthorized. Must be logged in.", { status: 401 });
      }

      const { data } = await supabase.from("profiles").select("role").eq("id", user.id).single();
      const profileRaw = data as any;
      if (!profileRaw || !["admin", "staff"].includes(profileRaw.role)) {
        return new Response("Forbidden. Insufficient permissions.", { status: 403 });
      }
    } else {
      // Mock auth check
      const profile = await db.getProfile();
      if (!["admin", "staff"].includes(profile.role)) {
        return new Response("Forbidden. Insufficient permissions.", { status: 403 });
      }
    }

    let csvContent = "";
    let filename = "";

    if (type === "bookings") {
      filename = `bookings_report_${Date.now()}.csv`;
      
      // Fetch all bookings (using dual-mode db layer)
      // Since db doesn't have getAllBookings directly, let's see. In store.ts:
      // Wait! getBookings is available or we can query bookings.
      // Let's check store.ts for how bookings are fetched. We saw getAllBookingsAction in bookings.ts which queries bookings.
      // We can query bookings using Supabase client if configured, otherwise getLocalBookings().
      let bookings: any[] = [];
      if (isSupabaseConfigured()) {
        const supabase = await createServerSupabaseClient();
        const { data } = await supabase
          .from("bookings")
          .select("*, profiles(full_name, email, phone)")
          .order("created_at", { ascending: false });
        bookings = data ?? [];
      } else {
        bookings = (db as any).getLocalBookings ? (db as any).getLocalBookings() : [];
      }

      const headers = ["Booking ID", "Reference Code", "Contact Name", "Contact Email", "Start Date", "End Date", "Total Payable", "Status", "Payment Status", "Coupon Applied", "Late Fee", "Damage Cost", "Created At"];
      csvContent += headers.join(",") + "\n";

      bookings.forEach((b: any) => {
        const row = [
          b.id,
          b.reference_code || b.referenceCode,
          `"${b.contact_name || b.contactName || ''}"`,
          b.contact_email || b.contactEmail || '',
          b.start_date || b.startDate,
          b.end_date || b.endDate,
          b.total_payable || b.totalPayable || 0,
          b.status,
          b.payment_status || b.paymentStatus,
          b.coupon_applied || b.couponApplied || "None",
          b.late_fee || b.lateFee || 0,
          b.damage_cost || b.damageCost || 0,
          b.created_at || b.createdAt || '',
        ];
        csvContent += row.map(val => String(val).replace(/[\n\r]/g, " ")).join(",") + "\n";
      });

    } else if (type === "maintenance") {
      filename = `maintenance_report_${Date.now()}.csv`;
      const records = await db.getMaintenanceRecords();

      const headers = ["Record ID", "Inventory Unit ID", "Serial Number", "Condition Before", "Condition After", "Reason", "Repair Cost", "Service Provider", "Expected Return", "Actual Return", "Created At"];
      csvContent += headers.join(",") + "\n";

      records.forEach((r: any) => {
        const serial = r.inventory_units?.serial_number || r.inventory_units?.serialNumber || "N/A";
        const row = [
          r.id,
          r.inventory_unit_id || r.inventoryUnitId,
          serial,
          r.condition_before || r.conditionBefore,
          r.condition_after || r.conditionAfter || "N/A",
          `"${r.maintenance_reason || r.maintenanceReason || ''}"`,
          r.repair_cost || r.repairCost || 0,
          `"${r.service_provider || r.serviceProvider || 'N/A'}"`,
          r.expected_return_date || r.expectedReturnDate || '',
          r.actual_return_date || r.actualReturnDate || 'N/A',
          r.created_at || r.createdAt || '',
        ];
        csvContent += row.map(val => String(val).replace(/[\n\r]/g, " ")).join(",") + "\n";
      });

    } else if (type === "refunds") {
      filename = `refunds_report_${Date.now()}.csv`;
      const refunds = await db.getRefunds();

      const headers = ["Refund ID", "Booking ID", "Reference Code", "Razorpay Refund ID", "Amount", "Status", "Reason", "Admin Notes", "Created At"];
      csvContent += headers.join(",") + "\n";

      refunds.forEach((r: any) => {
        const refCode = r.booking?.reference_code || r.booking?.referenceCode || "N/A";
        const row = [
          r.id,
          r.booking_id,
          refCode,
          r.razorpay_refund_id || "N/A",
          r.amount,
          r.status,
          `"${r.reason || ''}"`,
          `"${r.admin_notes || ''}"`,
          r.created_at || '',
        ];
        csvContent += row.map(val => String(val).replace(/[\n\r]/g, " ")).join(",") + "\n";
      });

    } else {
      return new Response("Invalid report type.", { status: 400 });
    }

    return new Response(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (err: any) {
    console.error("Report generation error:", err);
    return new Response("Failed to generate report.", { status: 500 });
  }
}
