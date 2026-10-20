import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create Concierge Account",
  description: "Join AUREVIA Premium Rentals. Gain access to zero-deposit filmmaker rentals, cinema equipment booking, and VIP discounts.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function RegisterLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
