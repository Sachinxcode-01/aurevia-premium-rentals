import { Metadata } from "next";
import HomeClient from "@/components/pages/HomeClient";

export const metadata: Metadata = {
  title: "AUREVIA Premium Camera Rentals | Rent Professional Cameras & Lenses",
  description:
    "Rent premium DSLR, mirrorless, cinema cameras, cinema lenses and professional production gear from Aurevia Camera Rentals by Prem. Frame the Extraordinary.",
  alternates: {
    canonical: "https://aurevia-premium-rentals.vercel.app",
  },
  openGraph: {
    title: "AUREVIA Premium Camera Rentals | Rent Professional Cameras & Lenses",
    description:
      "Rent premium DSLR, mirrorless, cinema cameras, lenses and professional production gear from Aurevia Camera Rentals by Prem.",
    url: "https://aurevia-premium-rentals.vercel.app",
    siteName: "AUREVIA Premium Rentals",
    images: [
      {
        url: "https://aurevia-premium-rentals.vercel.app/readme/aurevia-banner.png",
        width: 1200,
        height: 630,
        alt: "AUREVIA Cinema & Camera Vault",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "AUREVIA Premium Camera Rentals",
    description:
      "Rent premium DSLR, mirrorless, cinema cameras, lenses and professional production gear.",
    images: ["https://aurevia-premium-rentals.vercel.app/readme/aurevia-banner.png"],
  },
};

export default function HomePage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": "https://aurevia-premium-rentals.vercel.app/#website",
        "url": "https://aurevia-premium-rentals.vercel.app",
        "name": "AUREVIA Premium Rentals",
        "description": "Professional Camera & Cinema Gear Concierge Rentals",
        "publisher": {
          "@id": "https://aurevia-premium-rentals.vercel.app/#organization",
        },
      },
      {
        "@type": "Organization",
        "@id": "https://aurevia-premium-rentals.vercel.app/#organization",
        "name": "AUREVIA Premium Camera Rentals",
        "url": "https://aurevia-premium-rentals.vercel.app",
        "logo": "https://aurevia-premium-rentals.vercel.app/icon.svg",
        "founder": {
          "@type": "Person",
          "name": "Prem Mundargi",
        },
        "contactPoint": {
          "@type": "ContactPoint",
          "telephone": "+919686909048",
          "contactType": "customer service",
          "areaServed": "IN",
          "availableLanguage": ["English", "Kannada", "Hindi"],
        },
      },
      {
        "@type": ["LocalBusiness", "Store"],
        "@id": "https://aurevia-premium-rentals.vercel.app/#localbusiness",
        "name": "AUREVIA Premium Camera Rentals",
        "image": "https://aurevia-premium-rentals.vercel.app/readme/aurevia-banner.png",
        "telephone": "+919686909048",
        "email": "prem@aurevia.com",
        "address": {
          "@type": "PostalAddress",
          "streetAddress": "Aurevia Studio Vault, Gadag Main Road",
          "addressLocality": "Gadag",
          "addressRegion": "Karnataka",
          "postalCode": "582101",
          "addressCountry": "IN",
        },
        "geo": {
          "@type": "GeoCoordinates",
          "latitude": 15.4319,
          "longitude": 75.6318,
        },
        "priceRange": "₹₹₹",
        "url": "https://aurevia-premium-rentals.vercel.app",
        "openingHoursSpecification": [
          {
            "@type": "OpeningHoursSpecification",
            "dayOfWeek": [
              "Monday",
              "Tuesday",
              "Wednesday",
              "Thursday",
              "Friday",
              "Saturday",
              "Sunday",
            ],
            "opens": "07:00",
            "closes": "22:00",
          },
        ],
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <HomeClient />
    </>
  );
}
