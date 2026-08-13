/* Aurevia Rewards & Referral Program Store */

export interface RewardsState {
  pointsBalance: number;
  referralCode: string;
  totalEarned: number;
  referralCount: number;
}

const REWARDS_STORAGE_KEY = "aurevia_rewards_store";

export function getRewardsData(): RewardsState {
  if (typeof window === "undefined") {
    return { pointsBalance: 750, referralCode: "AUREVIA-PREM-77", totalEarned: 1250, referralCount: 3 };
  }
  try {
    const raw = localStorage.getItem(REWARDS_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  
  const defaultState: RewardsState = {
    pointsBalance: 750,
    referralCode: "AUREVIA-PREM-77",
    totalEarned: 1250,
    referralCount: 3,
  };
  saveRewardsData(defaultState);
  return defaultState;
}

export function saveRewardsData(data: RewardsState): void {
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(REWARDS_STORAGE_KEY, JSON.stringify(data));
    } catch {}
  }
}

export function addBookingPoints(bookingTotal: number): number {
  const points = Math.round(bookingTotal * 0.05); // 5% cashback points
  const current = getRewardsData();
  const updated: RewardsState = {
    ...current,
    pointsBalance: current.pointsBalance + points,
    totalEarned: current.totalEarned + points,
  };
  saveRewardsData(updated);
  return points;
}

export function redeemPoints(pointsToRedeem: number): { success: boolean; discountAmount: number } {
  const current = getRewardsData();
  if (current.pointsBalance < pointsToRedeem || pointsToRedeem <= 0) {
    return { success: false, discountAmount: 0 };
  }

  const discountAmount = pointsToRedeem; // 1 point = ₹1
  const updated: RewardsState = {
    ...current,
    pointsBalance: current.pointsBalance - pointsToRedeem,
  };
  saveRewardsData(updated);
  return { success: true, discountAmount };
}
