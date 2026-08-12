import React from "react";
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AUREVIA — Admin Operations & Control Center",
  description: "Enterprise Operations, Inventory Control, Booking Management, KYC Verification, and Financial Intelligence for AUREVIA Premium Camera Rentals.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#070707] text-[#f5f1e8] antialiased selection:bg-[#d8b36a]/30 selection:text-[#d8b36a]">
        {children}
      </body>
    </html>
  );
}
