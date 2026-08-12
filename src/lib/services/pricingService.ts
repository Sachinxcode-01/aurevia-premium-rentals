export interface PricingItem {
  productId: string;
  dailyPrice: number;
  quantity: number;
}

export interface PricingAddon {
  addonId: string;
  price: number;
}

export interface PricingCoupon {
  code: string;
  discountPercent?: number;
  discountFlat?: number;
  maxDiscount?: number;
  minBookingAmount?: number;
  isActive: boolean;
}

export interface PricingCalculationInput {
  startDate: string;
  endDate: string;
  items: PricingItem[];
  addons?: PricingAddon[];
  coupon?: PricingCoupon | null;
  deliveryMethod?: "pickup" | "delivery";
  deliveryFeeOverride?: number;
  securityDeposit?: number;
}

export interface PricingBreakdown {
  rentalDays: number;
  subtotal: number;
  addonsTotal: number;
  discountAmount: number;
  deliveryFee: number;
  securityDeposit: number;
  taxFee: number;
  totalPayable: number;
  couponCode?: string;
}

export function calculateRentalDays(start: string, end: string): number {
  const s = new Date(start);
  const e = new Date(end);
  const diffTime = e.getTime() - s.getTime();
  if (isNaN(diffTime) || diffTime <= 0) return 1;
  return Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
}

export function calculateBookingPrice(input: PricingCalculationInput): PricingBreakdown {
  const rentalDays = calculateRentalDays(input.startDate, input.endDate);

  let subtotal = 0;
  for (const item of input.items) {
    subtotal += item.dailyPrice * item.quantity * rentalDays;
  }

  let addonsTotal = 0;
  if (input.addons && input.addons.length > 0) {
    for (const addon of input.addons) {
      addonsTotal += addon.price;
    }
  }

  const grossTotal = subtotal + addonsTotal;

  let discountAmount = 0;
  if (input.coupon && input.coupon.isActive) {
    const minAmount = input.coupon.minBookingAmount || 0;
    if (grossTotal >= minAmount) {
      if (input.coupon.discountFlat && input.coupon.discountFlat > 0) {
        discountAmount = input.coupon.discountFlat;
      } else if (input.coupon.discountPercent && input.coupon.discountPercent > 0) {
        discountAmount = (grossTotal * input.coupon.discountPercent) / 100;
      }

      if (input.coupon.maxDiscount && input.coupon.maxDiscount > 0) {
        discountAmount = Math.min(discountAmount, input.coupon.maxDiscount);
      }
    }
  }

  // Ensure discount doesn't exceed subtotal
  discountAmount = Math.min(discountAmount, grossTotal);

  const deliveryFee = input.deliveryMethod === "delivery" ? (input.deliveryFeeOverride ?? 0) : 0;
  const securityDeposit = input.securityDeposit || 0;
  const taxFee = 0; // AUREVIA transparent pricing: inclusive pricing

  const totalPayable = Math.max(0, grossTotal - discountAmount + deliveryFee + securityDeposit);

  return {
    rentalDays,
    subtotal: +subtotal.toFixed(2),
    addonsTotal: +addonsTotal.toFixed(2),
    discountAmount: +discountAmount.toFixed(2),
    deliveryFee: +deliveryFee.toFixed(2),
    securityDeposit: +securityDeposit.toFixed(2),
    taxFee: +taxFee.toFixed(2),
    totalPayable: +totalPayable.toFixed(2),
    couponCode: input.coupon?.code,
  };
}
