import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/lib/api/response";
import { verifyApiAuth } from "@/lib/auth/rbac";
import { createServiceSupabaseClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/db/store";

export interface PaymentTx {
  id: string;
  bookingId: string;
  customerName: string;
  customerEmail?: string;
  amount: number;
  razorpayId: string;
  razorpayOrderId?: string;
  method: string;
  status: "PAID" | "FAILED" | "REFUNDED";
  date: string;
}

const DEFAULT_PAYMENTS: PaymentTx[] = [
  {
    id: "PAY-901",
    bookingId: "AUR-1042",
    customerName: "Rahul Verma",
    customerEmail: "rahul.v@gmail.com",
    amount: 14997,
    razorpayId: "pay_Pk8841299A",
    razorpayOrderId: "order_Pk8841299",
    method: "Razorpay UPI",
    status: "PAID",
    date: "12 Aug 2026, 09:15 AM",
  },
  {
    id: "PAY-900",
    bookingId: "AUR-1041",
    customerName: "Ananya Sharma",
    customerEmail: "ananya.sharma@yahoo.com",
    amount: 16500,
    razorpayId: "pay_Pk8840112B",
    razorpayOrderId: "order_Pk8840112",
    method: "Credit Card (Visa)",
    status: "PAID",
    date: "11 Aug 2026, 06:40 PM",
  },
  {
    id: "PAY-899",
    bookingId: "AUR-1040",
    customerName: "Vikramaditya Rao",
    customerEmail: "vikram.rao@cinemafilms.in",
    amount: 26000,
    razorpayId: "pay_Pk8839001C",
    razorpayOrderId: "order_Pk8839001",
    method: "Netbanking (HDFC)",
    status: "PAID",
    date: "10 Aug 2026, 10:10 AM",
  },
];

export async function GET(req: NextRequest) {
  try {
    const { user, response } = await verifyApiAuth(req, ["admin", "staff", "super_admin"]);
    if (response || !user) return response!;

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search")?.toLowerCase();
    const statusFilter = searchParams.get("status");

    if (isSupabaseConfigured()) {
      try {
        const supabase = await createServiceSupabaseClient();
        const { data: bookings, error } = await supabase
          .from("bookings")
          .select("id, reference_code, contact_name, contact_email, total_payable, payment_status, razorpay_payment_id, razorpay_order_id, payment_method, created_at, updated_at")
          .not("payment_status", "is", null)
          .order("created_at", { ascending: false });

        if (!error && bookings && bookings.length > 0) {
          let mapped: PaymentTx[] = bookings.map((b: any, idx: number) => {
            const rawStatus = (b.payment_status || "").toLowerCase();
            let status: PaymentTx["status"] = "PAID";
            if (rawStatus === "failed") status = "FAILED";
            else if (rawStatus === "refunded") status = "REFUNDED";

            return {
              id: `PAY-${b.id.slice(0, 4).toUpperCase() || (900 - idx)}`,
              bookingId: b.reference_code || `AUR-${b.id.slice(0, 4)}`,
              customerName: b.contact_name || "Production Client",
              customerEmail: b.contact_email,
              amount: Number(b.total_payable || 0),
              razorpayId: b.razorpay_payment_id || `pay_${b.id.slice(0, 10)}`,
              razorpayOrderId: b.razorpay_order_id || undefined,
              method: b.payment_method || "Razorpay Official Gateway",
              status,
              date: b.created_at ? new Date(b.created_at).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }) : "Recently",
            };
          });

          if (search) {
            mapped = mapped.filter(
              (p) =>
                p.bookingId.toLowerCase().includes(search) ||
                p.customerName.toLowerCase().includes(search) ||
                p.razorpayId.toLowerCase().includes(search)
            );
          }

          if (statusFilter && statusFilter !== "ALL") {
            mapped = mapped.filter((p) => p.status === statusFilter);
          }

          return successResponse(mapped, "Payment transactions loaded from database");
        }
      } catch (err) {
        console.warn("[Payments GET] Supabase fallback to memory:", err);
      }
    }

    let results = [...DEFAULT_PAYMENTS];
    if (search) {
      results = results.filter(
        (p) =>
          p.bookingId.toLowerCase().includes(search) ||
          p.customerName.toLowerCase().includes(search) ||
          p.razorpayId.toLowerCase().includes(search)
      );
    }
    if (statusFilter && statusFilter !== "ALL") {
      results = results.filter((p) => p.status === statusFilter);
    }

    return successResponse(results, "Payment transactions loaded from memory");
  } catch (err: any) {
    console.error("[Payments GET] Error:", err);
    return errorResponse("PAYMENTS_FETCH_FAILED", err.message || "Failed to load payment transactions", 500);
  }
}
