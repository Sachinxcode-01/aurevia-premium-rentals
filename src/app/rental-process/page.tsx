import { Metadata } from "next";
import RentalProcessClient from "@/components/pages/RentalProcessClient";

export const metadata: Metadata = {
  title: "How Camera Rental Works | Rental Guidelines & Verification | AUREVIA",
  description:
    "Step-by-step guide to renting high-end camera bodies and lenses from AUREVIA. Learn about identity verification, pickup, delivery, and equipment returns.",
  alternates: {
    canonical: "https://aurevia-premium-rentals.vercel.app/rental-process",
  },
  openGraph: {
    title: "How AUREVIA Camera Rentals Work",
    description:
      "Seamless 4-step camera rental process: Gear Selection, KYC Verification, Studio Pickup or Dispatch, and Easy Return.",
    url: "https://aurevia-premium-rentals.vercel.app/rental-process",
    siteName: "AUREVIA Premium Rentals",
    images: [
      {
        url: "https://aurevia-premium-rentals.vercel.app/readme/aurevia-banner.png",
        width: 1200,
        height: 630,
        alt: "AUREVIA Rental Process Guide",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "How AUREVIA Camera Rentals Work",
    description:
      "4 simple steps to rent premium cinema cameras and lenses.",
    images: ["https://aurevia-premium-rentals.vercel.app/readme/aurevia-banner.png"],
  },
};

export default function RentalProcessPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "name": "How to Rent Camera Gear from AUREVIA Premium Rentals",
    "description": "Step-by-step instructions for booking, verifying, receiving, and returning camera equipment.",
    "step": [
      {
        "@type": "HowToStep",
        "name": "1. Reserve & Configure",
        "text": "Select your camera body, cinema lenses, or lighting accessories. Specify your start and end rental dates.",
      },
      {
        "@type": "HowToStep",
        "name": "2. Verify Identity (KYC)",
        "text": "Upload valid government ID and address verification for quick automated security clearance.",
      },
      {
        "@type": "HowToStep",
        "name": "3. Dispatch or Studio Handover",
        "text": "Collect your gear directly at our Gadag vault studio or request expedited doorstep dispatch.",
      },
      {
        "@type": "HowToStep",
        "name": "4. Shoot & Return",
        "text": "Execute your visual production project and return equipment smoothly at the end of the rental window.",
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <RentalProcessClient />
    </>
  );
}
