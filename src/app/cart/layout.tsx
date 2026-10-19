import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Rental Cart & Reservation Review",
  description:
    "Review selected cinema cameras, lenses, Pelican flight cases, and custom rig configurations before booking at AUREVIA Premium Rentals.",
  robots: {
    index: false,
    follow: true,
  },
};

export default function CartLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
