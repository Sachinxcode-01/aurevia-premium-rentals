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
    let taxFee = 0;
    let deliveryFee = 0;
    let totalDays = 0;

    cart.forEach((item) => {
      const start = new Date(item.startDate);
      const end = new Date(item.endDate);
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1 || 1;
      
      totalDays = Math.max(totalDays, days);

      // Force regular pricing: 799 INR per camera per day
      const rate = 799;
      const baseCost = rate * days * item.quantity;
      
      // Addons are completely free under new rules (zero cost)
      const addonsCost = 0;

      rentalFee += baseCost + addonsCost;
    });

    let discountAmount = 0;
    if (coupon) {
      if (coupon.code && coupon.code.toUpperCase() === "AUREVIA199") {
        // Calculate flat discount of 199 per camera day
        cart.forEach((item) => {
          const start = new Date(item.startDate);
          const end = new Date(item.endDate);
          const diffTime = Math.abs(end.getTime() - start.getTime());
          const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1 || 1;
          discountAmount += 199 * days * item.quantity;
        });
      } else {
        discountAmount = Math.round(rentalFee * (discountPercent / 100) * 100) / 100;
      }
    }

    const totalPayable = rentalFee - discountAmount;

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
