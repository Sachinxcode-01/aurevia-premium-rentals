"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { db } from "@/lib/db/store";
import { Product, ProductAddon, Coupon } from "@/lib/db/mockData";

export interface CartItem {
  product: Product;
  quantity: number;
  startDate: string;
  endDate: string;
  selectedAddons: string[]; // Addon IDs
}

interface CartContextType {
  cart: CartItem[];
  coupon: Coupon | null;
  discountPercent: number;
  applyCouponCode: (code: string) => Promise<boolean>;
  removeCoupon: () => void;
  addToCart: (product: Product, quantity: number, startDate: string, endDate: string, addons: string[]) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  updateCartItemDates: (productId: string, start: string, end: string) => void;
  updateCartItemQty: (productId: string, qty: number) => void;
  cartTotals: {
    rentalFee: number;
    depositFee: number;
    taxFee: number;
    deliveryFee: number;
    discountAmount: number;
    totalPayable: number;
    totalDays: number;
  };
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [coupon, setCoupon] = useState<Coupon | null>(null);
  const [discountPercent, setDiscountPercent] = useState(0);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem("aurevia_cart");
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (e) {
        console.error("Failed to parse cart localstorage", e);
      }
    }

    const savedCoupon = localStorage.getItem("aurevia_applied_coupon");
    if (savedCoupon) {
      try {
        const c: Coupon = JSON.parse(savedCoupon);
        setCoupon(c);
        setDiscountPercent(c.discountPercent);
      } catch (e) {
        // ignore
      }
    }
  }, []);

  // Save cart to localStorage on change
  const saveCart = (newCart: CartItem[]) => {
    setCart(newCart);
    localStorage.setItem("aurevia_cart", JSON.stringify(newCart));
  };

  const addToCart = (
    product: Product,
    quantity: number,
    startDate: string,
    endDate: string,
    addons: string[]
  ) => {
    const existingIdx = cart.findIndex((item) => item.product.id === product.id);
    const newCart = [...cart];

    if (existingIdx > -1) {
      // Overwrite with new specifications
      newCart[existingIdx] = {
        product,
        quantity,
        startDate,
        endDate,
        selectedAddons: addons,
      };
    } else {
      newCart.push({
        product,
        quantity,
        startDate,
        endDate,
        selectedAddons: addons,
      });
    }

    saveCart(newCart);
  };

  const removeFromCart = (productId: string) => {
    const newCart = cart.filter((item) => item.product.id !== productId);
    saveCart(newCart);
  };

  const clearCart = () => {
    saveCart([]);
    removeCoupon();
  };

  const updateCartItemDates = (productId: string, start: string, end: string) => {
    const newCart = cart.map((item) => {
      if (item.product.id === productId) {
        return { ...item, startDate: start, endDate: end };
      }
      return item;
    });
    saveCart(newCart);
  };

  const updateCartItemQty = (productId: string, qty: number) => {
    const newCart = cart.map((item) => {
      if (item.product.id === productId) {
        return { ...item, quantity: Math.max(1, qty) };
      }
      return item;
    });
    saveCart(newCart);
  };

  const applyCouponCode = async (code: string): Promise<boolean> => {
    const c = await db.getCoupon(code);
    if (c) {
      setCoupon(c);
      setDiscountPercent(c.discountPercent);
      localStorage.setItem("aurevia_applied_coupon", JSON.stringify(c));
      return true;
    }
    return false;
  };

  const removeCoupon = () => {
    setCoupon(null);
    setDiscountPercent(0);
    localStorage.removeItem("aurevia_applied_coupon");
  };

  // Compute pricing totals securely based on current state
  const calculateTotals = () => {
    let rentalFee = 0;
    let depositFee = 0;
    let totalDays = 0;

    cart.forEach((item) => {
      const start = new Date(item.startDate);
      const end = new Date(item.endDate);
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1 || 1;
      
      totalDays = Math.max(totalDays, days);

      // Daily vs Weekly pricing breakdown
      let rate = item.product.dailyPrice;
      if (days >= 7) {
        // Use weekly rate averaged per day if weekly price is better
        const weeklyEquivalent = item.product.weeklyPrice / 7;
        rate = Math.min(rate, weeklyEquivalent);
      }

      const baseCost = rate * days * item.quantity;
      
      // Calculate addons cost
      const addonsCost = item.selectedAddons.reduce((sum, addId) => {
        const addon = db.getAddons().then(list => list.find(a => a.id === addId));
        // Note: For sync UI, we've predefined mock addons and resolve their cost directly
        if (addId === "a1000000-0000-0000-0000-000000000001") return sum + 499 * days * item.quantity;
        if (addId === "a1000000-0000-0000-0000-000000000002") return sum + 199 * days * item.quantity;
        if (addId === "a1000000-0000-0000-0000-000000000003") return sum + 999 * days * item.quantity;
        return sum;
      }, 0);

      rentalFee += baseCost + addonsCost;
      depositFee += item.product.securityDeposit * item.quantity;
    });

    let discountAmount = 0;
    if (coupon) {
      if (coupon.discountFlat && coupon.discountFlat > 0) {
        // Calculate flat discount per camera unit per day
        cart.forEach((item) => {
          const start = new Date(item.startDate);
          const end = new Date(item.endDate);
          const diffTime = Math.abs(end.getTime() - start.getTime());
          const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1 || 1;
          discountAmount += (coupon.discountFlat || 0) * days * item.quantity;
        });
      } else {
        // Calculate percentage discount
        discountAmount = Math.round(rentalFee * (discountPercent / 100) * 100) / 100;
      }
    }

    const taxFee = Math.round((rentalFee - discountAmount) * 0.18 * 100) / 100; // 18% GST standard for luxury electronics
    
    // Flat delivery fee of 500 INR if cart has items, free pickup
    const deliveryFee = cart.length > 0 ? 500 : 0;
    
    const totalPayable = rentalFee + depositFee + taxFee + deliveryFee - discountAmount;

    return {
      rentalFee,
      depositFee,
      taxFee,
      deliveryFee,
      discountAmount,
      totalPayable,
      totalDays,
    };
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        coupon,
        discountPercent,
        applyCouponCode,
        removeCoupon,
        addToCart,
        removeFromCart,
        clearCart,
        updateCartItemDates,
        updateCartItemQty,
        cartTotals: calculateTotals(),
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
