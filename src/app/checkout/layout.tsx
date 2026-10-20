import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Secure Checkout & Payment",
  description: "Complete your camera equipment reservation with secure Razorpay settlement and instant booking confirmation.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function CheckoutLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
