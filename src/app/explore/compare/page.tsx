import { Metadata } from "next";
import CompareClient from "@/components/pages/CompareClient";

export const metadata: Metadata = {
  title: "Compare Cameras & Equipment | AUREVIA Rentals",
  description:
    "Side-by-side spec comparison of professional cinema camera bodies and lenses. Compare resolutions, low-light performance, battery life, and weight.",
  alternates: {
    canonical: "https://aurevia-premium-rentals.vercel.app/explore/compare",
  },
  openGraph: {
    title: "Compare Camera Specs Side-by-Side | AUREVIA",
    description:
      "Detailed technical specification comparison matrix for full-frame cinema cameras and prime lenses.",
    url: "https://aurevia-premium-rentals.vercel.app/explore/compare",
    siteName: "AUREVIA Premium Rentals",
    images: [
      {
        url: "https://aurevia-premium-rentals.vercel.app/readme/aurevia-banner.png",
        width: 1200,
        height: 630,
        alt: "AUREVIA Equipment Comparison",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Compare Camera Specs | AUREVIA",
    description:
      "Side-by-side comparison of cinema cameras and lenses.",
    images: ["https://aurevia-premium-rentals.vercel.app/readme/aurevia-banner.png"],
  },
};

export default function ComparePage() {
  return <CompareClient />;
}
