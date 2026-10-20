import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Filmmaker Dashboard & Active Rentals",
  description: "View active camera rentals, signed hire agreements, invoice receipts, and loyalty rewards.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
