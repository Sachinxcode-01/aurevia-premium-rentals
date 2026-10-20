import { Metadata } from "next";
import ReturnClient from "@/components/pages/ReturnClient";

export const metadata: Metadata = {
  title: "Equipment Return & Handover Hub | AUREVIA",
  description:
    "Official equipment return protocol, safe handover guidelines, optical inspection criteria, and instant deposit settlement for AUREVIA rentals.",
  alternates: {
    canonical: "https://aurevia-premium-rentals.vercel.app/return",
  },
  openGraph: {
    title: "Equipment Return & Handover | AUREVIA Premium Rentals",
    description: "Drop-off guidelines, cleanroom sensor check, and deposit release information.",
    url: "https://aurevia-premium-rentals.vercel.app/return",
    siteName: "AUREVIA Premium Rentals",
    type: "website",
  },
};

export default function ReturnPage() {
  return <ReturnClient />;
}
