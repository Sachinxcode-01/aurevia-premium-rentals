import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { db } from "@/lib/db/store";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: "Missing required query parameters: startDate, endDate." },
        { status: 400 }
      );
    }

    // Validate date formats
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (isNaN(start.getTime()) || isNaN(end.getTime()) || start > end) {
      return NextResponse.json(
        { error: "Invalid date range specified." },
        { status: 400 }
      );
    }

    const canonId = "p1000000-0000-0000-0000-000000000001";
    const nikonId = "p1000000-0000-0000-0000-000000000003";

    // Call store checkAvailability directly (atomic local check)
    const canonStatus = await db.checkAvailability(canonId, startDate, endDate);
    const nikonStatus = await db.checkAvailability(nikonId, startDate, endDate);

    // Filter units manually to give granular status
    const units = await db.getInventoryUnits();
    const canonUnits = units.filter((u) => u.productId === canonId && u.status !== "decommissioned" && u.status !== "maintenance");
    const nikonUnits = units.filter((u) => u.productId === nikonId && u.status !== "decommissioned" && u.status !== "maintenance");

    const bookings = await db.getBookings();
    const activeBookings = bookings.filter(
      (b) =>
        ["paid", "approval_pending", "approved", "ready_for_pickup", "rented", "returned", "completed", "overdue"].includes(b.status) &&
        new Date(b.startDate) <= end &&
        new Date(b.endDate) >= start
    );

    const checkUnitAvailability = (unitId: string) => {
      return !activeBookings.some((b) =>
        b.items.some((item) => item.inventoryUnitId === unitId)
      );
    };

    return NextResponse.json({
      startDate,
      endDate,
      cameras: {
        "Canon Camera 1": {
          available: checkUnitAvailability("u1") && canonUnits.some(u => u.id === "u1"),
          condition: canonUnits.find(u => u.id === "u1")?.condition ?? "unknown",
        },
        "Canon Camera 2": {
          available: checkUnitAvailability("u2") && canonUnits.some(u => u.id === "u2"),
          condition: canonUnits.find(u => u.id === "u2")?.condition ?? "unknown",
        },
        "Nikon Camera 1": {
          available: checkUnitAvailability("u3") && nikonUnits.some(u => u.id === "u3"),
          condition: nikonUnits.find(u => u.id === "u3")?.condition ?? "unknown",
        }
      },
      summary: {
        canonAvailableCount: canonStatus.remainingQty,
        nikonAvailableCount: nikonStatus.remainingQty,
      }
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to check real-time availability." },
      { status: 500 }
    );
  }
}
