import { Metadata } from "next";
import AboutClient from "@/components/pages/AboutClient";

export const metadata: Metadata = {
  title: "About AUREVIA | Premier Cinema & Camera Equipment Rental",
  description:
    "Learn about AUREVIA Premium Camera Rentals by Prem. High-end camera equipment concierge offering cinema gear, optics, and production support.",
  alternates: {
    canonical: "https://aurevia-premium-rentals.vercel.app/about",
  },
  openGraph: {
    title: "About AUREVIA Premium Camera Rentals",
    description:
      "AUREVIA represents a new standard of luxury equipment concierge. Founded by Prem Mundargi to empower filmmakers and storytellers.",
    url: "https://aurevia-premium-rentals.vercel.app/about",
    siteName: "AUREVIA Premium Rentals",
    images: [
      {
        url: "https://aurevia-premium-rentals.vercel.app/readme/aurevia-banner.png",
        width: 1200,
        height: 630,
        alt: "About AUREVIA Premium Camera Rentals",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "About AUREVIA Premium Camera Rentals",
    description:
      "Learn about AUREVIA Premium Camera Rentals by Prem. High-end equipment concierge for digital storytellers.",
    images: ["https://aurevia-premium-rentals.vercel.app/readme/aurevia-banner.png"],
  },
};

export default function AboutPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    "name": "About AUREVIA Premium Camera Rentals",
    "description":
      "AUREVIA Premium Camera Rentals by Prem represents a new standard of luxury equipment concierge for film professionals and digital storytellers.",
    "url": "https://aurevia-premium-rentals.vercel.app/about",
    "mainEntity": {
      "@type": "Organization",
      "name": "AUREVIA Premium Camera Rentals",
      "founder": {
        "@type": "Person",
        "name": "Prem Mundargi",
      },
      "url": "https://aurevia-premium-rentals.vercel.app",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <AboutClient />
    </>
  );
}
