import { Metadata } from "next";
import CookiesClient from "@/components/pages/CookiesClient";

export const metadata: Metadata = {
  title: "Cookie Policy & Tracking Consent | AUREVIA",
  description:
    "Learn how AUREVIA Premium Rentals uses essential, functional, and analytical cookies to safeguard sessions and power cinema equipment rentals.",
  alternates: {
    canonical: "https://aurevia-premium-rentals.vercel.app/cookies",
  },
  openGraph: {
    title: "Cookie Policy | AUREVIA Camera Rentals",
    description: "Detailed cookie classifications and consent preferences for AUREVIA.",
    url: "https://aurevia-premium-rentals.vercel.app/cookies",
    siteName: "AUREVIA Premium Rentals",
    type: "website",
  },
};

export default function CookiesPage() {
  return <CookiesClient />;
}
