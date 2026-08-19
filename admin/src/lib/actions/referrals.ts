"use server";

import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";

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

function getServiceSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://uoutovqmmxzawhvpahcg.supabase.co";
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
  return createSupabaseClient(url, key);
}

// ─── Fetch All Referrals (Admin) ──────────────────────────────
export async function getAdminReferralsAction(): Promise<ReferralActionResult> {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Not authenticated" };
    }

    const serviceSupabase = getServiceSupabase();
    const { data, error } = await serviceSupabase
      .from("referrals")
      .select("*, profiles:referrer_id(full_name, email)")
      .order("created_at", { ascending: false });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, referrals: (data as ReferralRecord[]) || [] };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to fetch admin referrals";
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
    const serviceSupabase = getServiceSupabase();

    const { error } = await serviceSupabase
      .from("referrals")
      .update({
        status,
        notes: notes || null,
        updated_at: new Date().toISOString(),
      } as never)
      .eq("id", referralId);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to update referral status";
    return { success: false, error: msg };
  }
}
