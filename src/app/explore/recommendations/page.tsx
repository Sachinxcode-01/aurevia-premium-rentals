import { Metadata } from "next";
import RecommendationsClient from "@/components/pages/RecommendationsClient";

export const metadata: Metadata = {
  title: "AI Camera Recommendations | Match Your Production Setup | AUREVIA",
  description:
    "Interactive wizard to get personalized camera, lens, and lighting recommendations based on project type, budget, and experience level.",
  alternates: {
    canonical: "https://aurevia-premium-rentals.vercel.app/explore/recommendations",
  },
  openGraph: {
    title: "Find the Perfect Camera & Lens Setup | AUREVIA Recommendations",
    description:
      "Answer a few quick questions to receive curated equipment recommendations tailored to your shoot.",
    url: "https://aurevia-premium-rentals.vercel.app/explore/recommendations",
    siteName: "AUREVIA Premium Rentals",
    images: [
      {
        url: "https://aurevia-premium-rentals.vercel.app/readme/aurevia-banner.png",
        width: 1200,
        height: 630,
        alt: "AUREVIA Gear Match Wizard",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Camera Recommendations | AUREVIA",
    description:
      "Get personalized gear recommendations for your production.",
    images: ["https://aurevia-premium-rentals.vercel.app/readme/aurevia-banner.png"],
  },
};

export default function RecommendationsPage() {
  return <RecommendationsClient />;
}
