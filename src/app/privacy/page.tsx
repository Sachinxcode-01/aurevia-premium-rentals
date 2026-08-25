import { Metadata } from "next";
import PrivacyClient from "@/components/pages/PrivacyClient";

export const metadata: Metadata = {
  title: "Privacy Policy & Data Protection | AUREVIA",
  description:
    "AUREVIA Premium Camera Rentals privacy policy regarding user identity data, verification document safety, and cookie protection.",
  alternates: {
    canonical: "https://aurevia-premium-rentals.vercel.app/privacy",
  },
  openGraph: {
    title: "Privacy Policy | AUREVIA Camera Rentals",
    description: "Learn how AUREVIA protects your personal data and verification documents.",
    url: "https://aurevia-premium-rentals.vercel.app/privacy",
    siteName: "AUREVIA Premium Rentals",
    type: "website",
  },
};

export default function PrivacyPage() {
  return <PrivacyClient />;
}
