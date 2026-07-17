"use server";

/* eslint-disable @typescript-eslint/no-explicit-any */
import { createServerSupabaseClient, createServiceSupabaseClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { BookingStatus } from "@/lib/supabase/types";

export interface CreateBookingPayload {
  startDate: string;
  endDate: string;
  deliveryMethod: "pickup" | "delivery";
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  deliveryAddress?: string;
  couponApplied?: string;
  items: { productId: string; quantity: number }[];
  addonIds: { addonId: string }[];
}

export interface BookingActionResult {
  success: boolean;
  referenceCode?: string;
  bookingId?: string;
  error?: string;
}

function generateReferenceCode(): string {
  return `AV-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;
}

function countDays(start: string, end: string): number {
  return Math.max(1, Math.ceil((new Date(end).getTime() - new Date(start).getTime()) / 86400000));
}

// ─── 1. Create Booking ────────────────────────────────────────
export async function createBookingAction(payload: CreateBookingPayload): Promise<BookingActionResult> {
  const { isSupabaseConfigured, db } = await import("@/lib/db/store");
  if (!isSupabaseConfigured()) {
    const booking = await db.createBooking({
      profileId: "mock-profile-id",
      referenceCode: generateReferenceCode(),
      startDate: payload.startDate,
      endDate: payload.endDate,
      totalRentalFee: 0,
      taxFee: 0,
      deliveryFee: 0,
      discountAmount: 0,
      totalPayable: 0,
      deliveryMethod: payload.deliveryMethod,
      contactName: payload.contactName,
      contactPhone: payload.contactPhone,
      contactEmail: payload.contactEmail,
      couponApplied: payload.couponApplied,
      items: payload.items.map((i) => ({ productId: i.productId, quantity: i.quantity, unitPrice: 799 })),
      addons: payload.addonIds.map((a) => ({ addonId: a.addonId, price: 0 })),
      emergencyContact: "",
      agreementAccepted: false,
    });
    revalidatePath("/dashboard");
    revalidatePath("/admin");
    return { success: true, referenceCode: booking.referenceCode, bookingId: booking.id };
  }

  const supabase = await createServerSupabaseClient();
  const service = await createServiceSupabaseClient();

  const { data: { user }, error: authErr } = await supabase.auth.getUser();
  if (authErr || !user) return { success: false, error: "You must be signed in to create a booking." };

  const days = countDays(payload.startDate, payload.endDate);
  let totalRentalFee = 0;

  const { data: productsRaw } = await (service as any)
    .from("products")
    .select("id, daily_rate, daily_price, is_available")
    .in("id", payload.items.map((i) => i.productId));

  const products: any[] = productsRaw ?? [];
  if (products.length === 0) return { success: false, error: "Failed to fetch product pricing." };

  for (const item of payload.items) {
    const p = products.find((x: any) => x.id === item.productId);
    if (!p) return { success: false, error: `Product ${item.productId} not found.` };
    if (!p.is_available) return { success: false, error: "A selected product is currently unavailable." };
    const rate = p.daily_price || p.daily_rate || 799;
    totalRentalFee += rate * item.quantity * days;
  }

  let discountAmount = 0;
  if (payload.couponApplied) {
    const { data: coupon } = await (service as any)
      .from("coupons")
      .select("discount_percent, discount_flat, is_active")
      .eq("code", payload.couponApplied.toUpperCase())
      .maybeSingle();

    if (coupon?.is_active) {
      if (coupon.discount_flat && coupon.discount_flat > 0) {
        const totalItemsQty = payload.items.reduce((acc, item) => acc + item.quantity, 0);
        discountAmount = Number(coupon.discount_flat) * totalItemsQty * days;
      } else {
        discountAmount = (totalRentalFee * Number(coupon.discount_percent || 0)) / 100;
      }
    }
  }


  // Under pricing rules: No deposit, GST, shipping, handling or hidden charges.
  const deliveryFee = 0;
  const taxFee = 0;
  const totalPayable = totalRentalFee - discountAmount;

  const { data: bookingRaw, error: bookingErr } = await (supabase as any)
    .from("bookings")
    .insert({
      profile_id: user.id,
      reference_code: generateReferenceCode(),
      start_date: payload.startDate,
      end_date: payload.endDate,
      total_rental_fee: +totalRentalFee.toFixed(2),
      tax_fee: 0,
      delivery_fee: 0,
      discount_amount: +discountAmount.toFixed(2),
      total_payable: +totalPayable.toFixed(2),
      status: "pending",
      payment_status: "unpaid",
      delivery_method: payload.deliveryMethod,
      contact_name: payload.contactName,
      contact_phone: payload.contactPhone,
      contact_email: payload.contactEmail,
      delivery_address: payload.deliveryAddress ?? null,
      coupon_applied: payload.couponApplied ?? null,
    })
    .select("id, reference_code")
    .single();

  if (bookingErr || !bookingRaw) return { success: false, error: bookingErr?.message ?? "Failed to create booking." };

  await (supabase as any).from("booking_items").insert(
    payload.items.map((item) => {
      const p = products.find((x: any) => x.id === item.productId);
      return { booking_id: bookingRaw.id, product_id: item.productId, quantity: item.quantity, unit_price: p?.daily_rate ?? 0 };
    })
  );

  await (supabase as any).from("audit_logs").insert({
    action: "booking_created", table_name: "bookings", record_id: bookingRaw.id,
    changed_by: user.id, new_data: { reference_code: bookingRaw.reference_code, status: "pending" }, old_data: null,
  });

  revalidatePath("/dashboard");
  revalidatePath("/admin");
  return { success: true, referenceCode: bookingRaw.reference_code, bookingId: bookingRaw.id };
}

// ─── 2. Update Booking Status (Admin only) ───────────────────
export async function updateBookingStatusAction(
  bookingId: string, newStatus: BookingStatus
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createServerSupabaseClient();
  const service = await createServiceSupabaseClient();

  const { data: { user }, error: authErr } = await supabase.auth.getUser();
  if (authErr || !user) return { success: false, error: "Not authenticated." };

  const { data: profileRaw } = await (service as any).from("profiles").select("role").eq("id", user.id).single();
  if (!profileRaw || !["admin", "staff"].includes(profileRaw.role)) return { success: false, error: "Insufficient permissions." };

  const { data: currentRaw } = await (service as any).from("bookings").select("status").eq("id", bookingId).single();

  const { error } = await (service as any).from("bookings").update({ status: newStatus }).eq("id", bookingId);
  if (error) return { success: false, error: error.message };

  if (newStatus === "picked_up") await (service as any).rpc("reserve_inventory_for_booking", { p_booking_id: bookingId });
  if (newStatus === "returned" || newStatus === "cancelled") await (service as any).rpc("release_inventory_for_booking", { p_booking_id: bookingId });

  await (service as any).from("audit_logs").insert({
    action: "booking_status_updated", table_name: "bookings", record_id: bookingId,
    changed_by: user.id, old_data: { status: currentRaw?.status }, new_data: { status: newStatus },
  });

  revalidatePath("/admin");
  revalidatePath("/dashboard");
  return { success: true };
}

// ─── 3. Cancel Booking (Customer own only) ───────────────────
export async function cancelBookingAction(bookingId: string): Promise<{ success: boolean; error?: string }> {
  const { isSupabaseConfigured, db } = await import("@/lib/db/store");
  if (!isSupabaseConfigured()) {
    const booking = await db.getBookingById(bookingId);
    if (!booking) return { success: false, error: "Booking not found." };
    if (!["pending", "confirmed", "approval_pending", "paid", "pending_payment"].includes(booking.status)) {
      return { success: false, error: "This booking cannot be cancelled at its current stage." };
    }
    
    await db.updateBookingStatus(bookingId, "cancelled", "Cancelled by customer.", "Customer");
    
    // Create refund request if paid
    if (booking.paymentStatus === "paid") {
      const start = new Date(booking.startDate);
      const now = new Date();
      const hoursRemaining = (start.getTime() - now.getTime()) / (1000 * 60 * 60);
      const refundAmount = hoursRemaining >= 24 ? booking.totalPayable : booking.totalPayable * 0.5;
      await db.requestRefund(bookingId, refundAmount, "Customer cancellation request");
    }
    
    revalidatePath("/dashboard");
    revalidatePath("/admin");
    return { success: true };
  }

  const supabase = await createServerSupabaseClient();
  const service = await createServiceSupabaseClient();

  const { data: { user }, error: authErr } = await supabase.auth.getUser();
  if (authErr || !user) return { success: false, error: "Not authenticated." };

  const { data: bookingRaw } = await (service as any).from("bookings").select("profile_id, status, total_payable, payment_status, start_date").eq("id", bookingId).single();
  if (!bookingRaw) return { success: false, error: "Booking not found." };
  if (bookingRaw.profile_id !== user.id) return { success: false, error: "Unauthorized." };
  if (!["pending", "confirmed", "approval_pending", "paid", "pending_payment"].includes(bookingRaw.status)) {
    return { success: false, error: "This booking cannot be cancelled at its current stage." };
  }

  const { error } = await (service as any).from("bookings").update({ status: "cancelled" }).eq("id", bookingId);
  if (error) return { success: false, error: error.message };

  await (service as any).rpc("release_inventory_for_booking", { p_booking_id: bookingId });
  
  if (bookingRaw.payment_status === "paid") {
    const start = new Date(bookingRaw.start_date);
    const now = new Date();
    const hoursRemaining = (start.getTime() - now.getTime()) / (1000 * 60 * 60);
    const refundAmount = hoursRemaining >= 24 ? bookingRaw.total_payable : bookingRaw.total_payable * 0.5;

    await (service as any).from("refunds").insert({
      booking_id: bookingId,
      amount: refundAmount,
      status: "requested",
      reason: "Customer cancellation request",
    });
  }

  await (service as any).from("audit_logs").insert({
    action: "booking_cancelled_by_customer", table_name: "bookings", record_id: bookingId,
    changed_by: user.id, old_data: { status: bookingRaw.status }, new_data: { status: "cancelled" },
  });

  revalidatePath("/dashboard");
  revalidatePath("/admin");
  return { success: true };
}


// ─── 4. Get current user's bookings ─────────────────────────
export async function getUserBookingsAction() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await (supabase as any)
    .from("bookings")
    .select("*, booking_items(*, product:products(name, image_urls)), booking_addons(*)")
    .eq("profile_id", user.id)
    .order("created_at", { ascending: false });

  return data ?? [];
}

// ─── 5. Get all bookings (Admin only) ────────────────────────
export async function getAllBookingsAction() {
  const supabase = await createServerSupabaseClient();
  const service = await createServiceSupabaseClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data: profileRaw } = await (service as any).from("profiles").select("role").eq("id", user.id).single();
  if (!profileRaw || !["admin", "staff"].includes(profileRaw.role)) return [];

  const { data } = await (service as any)
    .from("bookings")
    .select("*, booking_items(*, product:products(name, image_urls)), profile:profiles(full_name, email, phone)")
    .order("created_at", { ascending: false });

  return data ?? [];
}
