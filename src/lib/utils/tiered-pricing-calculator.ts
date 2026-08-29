export interface PricingTierBreakdown {
  days: number;
  tierName: string;
  tierBadge?: string;
  rateMultiplier: number;
  discountPercentage: number;
  daysFree: number;
  unbundledDailyTotal: number;
  packageDailyRate: number;
  totalPackageFee: number;
  totalSavingsAmount: number;
  effectiveDailyCost: number;
}

export function getTierMultiplier(days: number): {
  multiplier: number;
  tierName: string;
  tierBadge?: string;
  daysFree: number;
} {
  const d = Math.max(1, Math.round(days));

  if (d === 1) {
    return { multiplier: 1.0, tierName: "Single Day Shoot", daysFree: 0 };
  }
  if (d === 2) {
    return { multiplier: 1.8, tierName: "2-Day Production", daysFree: 0.2 };
  }
  if (d === 3) {
    return {
      multiplier: 2.0,
      tierName: "Weekend Special (Fri PM - Mon AM)",
      tierBadge: "1 Day Free",
      daysFree: 1.0,
    };
  }
  if (d <= 6) {
    // 4 to 6 days
    const mult = Number((2.0 + (d - 3) * 0.6).toFixed(2));
    return {
      multiplier: mult,
      tierName: `${d}-Day Extended Shoot`,
      daysFree: Number((d - mult).toFixed(1)),
    };
  }
  if (d >= 7 && d < 14) {
    // 1 Week tier: 7 days = 4.0x rate
    const weekMult = 4.0 + (d - 7) * 0.5;
    return {
      multiplier: Number(weekMult.toFixed(2)),
      tierName: d === 7 ? "1-Week Production Tier" : `${d}-Day Commercial Block`,
      tierBadge: d === 7 ? "3 Days Free (4x Rate)" : undefined,
      daysFree: Number((d - weekMult).toFixed(1)),
    };
  }
  if (d >= 14 && d < 30) {
    // 2 Weeks tier: 14 days = 7.0x rate
    const biweekMult = 7.0 + (d - 14) * 0.4;
    return {
      multiplier: Number(biweekMult.toFixed(2)),
      tierName: d === 14 ? "2-Week Principal Photography" : `${d}-Day Feature Block`,
      tierBadge: d === 14 ? "7 Days Free (50% Off)" : undefined,
      daysFree: Number((d - biweekMult).toFixed(1)),
    };
  }
  // 30+ Days Monthly Feature Tier
  const monthMult = 12.0 + (d - 30) * 0.35;
  return {
    multiplier: Number(monthMult.toFixed(2)),
    tierName: d === 30 ? "Monthly Feature Film Tier" : `${d}-Day Studio Residency`,
    tierBadge: "60% Multi-Day Discount",
    daysFree: Number((d - monthMult).toFixed(1)),
  };
}

export function calculatePackagePricing(
  unbundledDailyTotal: number,
  bundleDiscountPercent: number = 15,
  days: number = 3
): PricingTierBreakdown {
  const d = Math.max(1, Math.round(days));
  const { multiplier, tierName, tierBadge, daysFree } = getTierMultiplier(d);

  // Bundle daily rate after applying 15-20% bundle discount
  const packageDailyRate = Math.round(unbundledDailyTotal * (1 - bundleDiscountPercent / 100));

  // Total payable for package over given duration
  const totalPackageFee = Math.round(packageDailyRate * multiplier);

  // Compare against full unbundled price over the duration without discounts
  const fullUnbundledTotal = unbundledDailyTotal * d;
  const totalSavingsAmount = fullUnbundledTotal - totalPackageFee;

  const discountPercentage = Math.round((totalSavingsAmount / fullUnbundledTotal) * 100);
  const effectiveDailyCost = Math.round(totalPackageFee / d);

  return {
    days: d,
    tierName,
    tierBadge,
    rateMultiplier: multiplier,
    discountPercentage,
    daysFree,
    unbundledDailyTotal,
    packageDailyRate,
    totalPackageFee,
    totalSavingsAmount,
    effectiveDailyCost,
  };
}

export const POPULAR_DURATION_TIERS = [
  { days: 1, label: "1 Day (Daily)", desc: "1.0x Rate" },
  { days: 3, label: "3 Days (Weekend Special)", desc: "2.0x Rate (1 Day Free)" },
  { days: 7, label: "7 Days (1 Full Week)", desc: "4.0x Rate (3 Days Free)" },
  { days: 14, label: "14 Days (Bi-Weekly)", desc: "7.0x Rate (50% Off)" },
  { days: 30, label: "30 Days (Monthly Feature)", desc: "12.0x Rate (60% Off)" },
];
