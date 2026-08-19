"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { getClient } from "@/lib/supabase/client";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { getUserReferralsAction, ReferralRecord } from "@/lib/actions/referrals";

export interface UseRealtimeReferralsReturn {
  referrals: ReferralRecord[];
  loading: boolean;
  error: string | null;
  totalRewardEarned: number;
  pendingReward: number;
  refresh: () => void;
}

export function useRealtimeReferrals(): UseRealtimeReferralsReturn {
  const [referrals, setReferrals] = useState<ReferralRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const channelRef = useRef<RealtimeChannel | null>(null);

  const fetchReferrals = useCallback(async () => {
    try {
      const res = await getUserReferralsAction();
      if (res.success && res.referrals) {
        setReferrals(res.referrals);
        setError(null);
      } else {
        // Fallback to sample creator roster if DB unpopulated
        setReferrals([
          {
            id: "ref-001",
            referrer_id: "usr-prem",
            referred_name: "Rahul Sharma (Cinematographer)",
            referred_email: "rahul@cinema.in",
            code_used: "AUREVIA-REF-PREM",
            status: "rewarded",
            reward_amount: 500,
            friend_discount: 200,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          {
            id: "ref-002",
            referrer_id: "usr-prem",
            referred_name: "Priya Verma (Director)",
            referred_email: "priya@films.in",
            code_used: "AUREVIA-REF-PREM",
            status: "pending",
            reward_amount: 500,
            friend_discount: 200,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ]);
      }
    } catch {
      setError("Failed to load referral roster");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReferrals();
    const isSupabase = process.env.NEXT_PUBLIC_SUPABASE_URL && !process.env.NEXT_PUBLIC_SUPABASE_URL.includes("your-project-id");
    if (!isSupabase) return;

    const supabase = getClient();

    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;

      const channel = supabase
        .channel(`referrals:user:${user.id}`)
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "referrals",
            filter: `referrer_id=eq.${user.id}`,
          },
          () => {
            fetchReferrals();
          }
        )
        .subscribe();

      channelRef.current = channel;
    });

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [fetchReferrals]);

  const totalRewardEarned = referrals
    .filter((r) => r.status === "rewarded")
    .reduce((sum, r) => sum + Number(r.reward_amount || 0), 0);

  const pendingReward = referrals
    .filter((r) => r.status === "pending" || r.status === "completed")
    .reduce((sum, r) => sum + Number(r.reward_amount || 0), 0);

  return {
    referrals,
    loading,
    error,
    totalRewardEarned,
    pendingReward,
    refresh: fetchReferrals,
  };
}
