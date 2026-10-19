import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Secure Checkout & Gear Reservation",
  description:
    "Complete your cinema camera rental booking with zero-deposit verification options, dates confirmation, and secure payment processing at AUREVIA.",
  robots: {
    index: false,
    follow: true,
  },
};

export default function BookingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
