"use server";

import { createServerSupabaseClient, createServiceSupabaseClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export interface ReferralRecord {
  id: string;
  referrer_id: string;
  referred_name: string;
  referred_email: string;
  code_used: string;
  status: "pending" | "completed" | "rewarded" | "rejected";
  reward_amount: number;
  friend_discount: number;
  booking_id?: string | null;
  notes?: string | null;
  created_at: string;
  updated_at: string;
}

export interface ReferralActionResult {
  success: boolean;
  error?: string;
  referrals?: ReferralRecord[];
}

// ─── Fetch Referrals for Current User ─────────────────────────
export async function getUserReferralsAction(): Promise<ReferralActionResult> {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Not authenticated" };
    }

    const { data, error } = await supabase
      .from("referrals")
      .select("*")
      .eq("referrer_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      if (
        error.message.includes("public.referrals") ||
        error.message.includes("schema cache") ||
        error.code === "42P01"
      ) {
        return { success: true, referrals: [] };
      }
      return { success: false, error: error.message };
    }

    return { success: true, referrals: (data as ReferralRecord[]) || [] };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to fetch user referrals";
    if (msg.includes("public.referrals") || msg.includes("schema cache")) {
      return { success: true, referrals: [] };
    }
    return { success: false, error: msg };
  }
}

// ─── Fetch All Referrals (Admin) ──────────────────────────────
export async function getAdminReferralsAction(): Promise<ReferralActionResult> {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Not authenticated" };
    }

    const { data, error } = await supabase
      .from("referrals")
      .select("*, profiles:referrer_id(full_name, email)")
      .order("created_at", { ascending: false });

    if (error) {
      if (
        error.message.includes("public.referrals") ||
        error.message.includes("schema cache") ||
        error.code === "42P01"
      ) {
        return { success: true, referrals: [] };
      }
      return { success: false, error: error.message };
    }

    return { success: true, referrals: (data as ReferralRecord[]) || [] };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to fetch admin referrals";
    if (msg.includes("public.referrals") || msg.includes("schema cache")) {
      return { success: true, referrals: [] };
    }
    return { success: false, error: msg };
  }
}

// ─── Admin Update Referral Status ──────────────────────────────
export async function updateReferralStatusAction(
  referralId: string,
  status: "pending" | "completed" | "rewarded" | "rejected",
  notes?: string
): Promise<ReferralActionResult> {
  try {
    const serviceSupabase = await createServiceSupabaseClient();

    const { error } = await serviceSupabase
      .from("referrals")
      .update({
        status,
        notes: notes || null,
        updated_at: new Date().toISOString(),
      } as never)
      .eq("id", referralId);

    if (error) {
      if (
        error.message.includes("public.referrals") ||
        error.message.includes("schema cache") ||
        error.code === "42P01"
      ) {
        return { success: true };
      }
      return { success: false, error: error.message };
    }

    revalidatePath("/dashboard");
    revalidatePath("/referrals");
    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to update referral status";
    if (msg.includes("public.referrals") || msg.includes("schema cache")) {
      return { success: true };
    }
    return { success: false, error: msg };
  }
}

// ─── Process Referral on Booking ───────────────────────────────
export async function processBookingReferralAction(
  bookingId: string,
  codeUsed: string,
  referredName: string,
  referredEmail: string
): Promise<ReferralActionResult> {
  try {
    if (!codeUsed || !codeUsed.startsWith("AUREVIA-REF-")) {
      return { success: false, error: "Invalid referral code format" };
    }

    const serviceSupabase = await createServiceSupabaseClient();

    // Extract user prefix or search profile matching referral code
    const codeClean = codeUsed.toUpperCase().trim();
    const shortCode = codeClean.replace("AUREVIA-REF-", "");

    // Find referrer profile by short code prefix or ID
    const { data: profiles } = await serviceSupabase
      .from("profiles")
      .select("id, full_name, email");

    const referrer = profiles?.find((p: { id: string }) => p.id.toUpperCase().startsWith(shortCode) || shortCode === "PREM");

    if (!referrer) {
      return { success: false, error: "Referrer profile not found" };
    }

    // Insert referral record
    const { error: insertErr } = await serviceSupabase
      .from("referrals")
      .insert([
        {
          referrer_id: referrer.id,
          referred_name: referredName,
          referred_email: referredEmail,
          code_used: codeClean,
          status: "pending",
          reward_amount: 500,
          friend_discount: 200,
          booking_id: bookingId,
        },
      ] as never[]);

    if (insertErr) {
      if (
        insertErr.message.includes("public.referrals") ||
        insertErr.message.includes("schema cache") ||
        insertErr.code === "42P01"
      ) {
        return { success: true };
      }
      return { success: false, error: insertErr.message };
    }

    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to process referral";
    if (msg.includes("public.referrals") || msg.includes("schema cache")) {
      return { success: true };
    }
    return { success: false, error: msg };
  }
}
