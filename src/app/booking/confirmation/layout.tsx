import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Booking Confirmed & Reservation Manifest",
  description:
    "Your cinema equipment booking is confirmed. Access your digital invoice, calendar sync, and concierge dispatch details.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function BookingConfirmationLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
