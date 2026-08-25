import { Metadata } from "next";
import TermsClient from "@/components/pages/TermsClient";

export const metadata: Metadata = {
  title: "Terms of Service & Rental Agreement | AUREVIA",
  description:
    "Terms of service, equipment care rules, rental deposit policies, and user agreements for AUREVIA Premium Camera Rentals.",
  alternates: {
    canonical: "https://aurevia-premium-rentals.vercel.app/terms",
  },
  openGraph: {
    title: "Terms of Service | AUREVIA Camera Rentals",
    description: "Rental terms and conditions for camera equipment hire.",
    url: "https://aurevia-premium-rentals.vercel.app/terms",
    siteName: "AUREVIA Premium Rentals",
    type: "website",
  },
};

export default function TermsPage() {
  return <TermsClient />;
}
