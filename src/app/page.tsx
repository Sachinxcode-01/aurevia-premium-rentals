import { Metadata } from "next";
import HomeClient from "@/components/pages/HomeClient";

export const metadata: Metadata = {
  title: "AUREVIA Premium Rentals | Cinema Camera & Lens Concierge",
  description:
    "Rent premium cinema cameras, full-frame mirrorless bodies, cinema lenses, and production gear from AUREVIA Premium Rentals by Prem Mundargi. 100% calibrated sensors, zero-deposit options, and Pelican flight cases across Karnataka & India.",
  keywords: [
    "AUREVIA Premium Rentals",
    "Aurevia camera rentals",
    "Aurevia rentals",
    "camera rental Gadag",
    "camera rental Bangalore",
    "cinema camera rental Karnataka",
    "rent Sony FX3",
    "rent Canon EOS R5",
    "RED Komodo rental",
    "cinema lens rental",
    "Prem Mundargi camera rentals",
    "professional photography gear hire India",
  ],
  alternates: {
    canonical: "https://aurevia-premium-rentals.vercel.app",
  },
  openGraph: {
    title: "AUREVIA Premium Rentals | Cinema Camera & Lens Concierge",
    description:
      "Rent premium cinema cameras, full-frame mirrorless bodies, cinema lenses, and production gear from AUREVIA Premium Rentals by Prem Mundargi. Frame the Extraordinary.",
    url: "https://aurevia-premium-rentals.vercel.app",
    siteName: "AUREVIA Premium Rentals",
    images: [
      {
        url: "https://aurevia-premium-rentals.vercel.app/readme/aurevia-banner.png",
        width: 1200,
        height: 630,
        alt: "AUREVIA Premium Rentals Cinema & Camera Vault",
      },
    ],
    type: "website",
    locale: "en_IN",
  },
  twitter: {
    card: "summary_large_image",
    title: "AUREVIA Premium Rentals | Cinema Camera & Lens Concierge",
    description:
      "Rent premium cinema cameras, mirrorless bodies, cinema lenses and professional production gear from Prem Mundargi.",
    images: ["https://aurevia-premium-rentals.vercel.app/readme/aurevia-banner.png"],
    creator: "@aurevia_rentals",
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
        "alternateName": [
          "AUREVIA",
          "Aurevia Premium Rentals",
          "Aurevia Camera Rentals",
          "Aurevia Cinema Vault",
        ],
        "description": "Professional Cinema Camera, Lens & Production Gear Concierge Rentals",
        "publisher": {
          "@id": "https://aurevia-premium-rentals.vercel.app/#organization",
        },
        "potentialAction": {
          "@type": "SearchAction",
          "target": {
            "@type": "EntryPoint",
            "urlTemplate":
              "https://aurevia-premium-rentals.vercel.app/explore?search={search_term_string}",
          },
          "query-input": "required name=search_term_string",
        },
      },
      {
        "@type": "Organization",
        "@id": "https://aurevia-premium-rentals.vercel.app/#organization",
        "name": "AUREVIA Premium Rentals",
        "legalName": "AUREVIA Premium Camera Rentals",
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
        "name": "AUREVIA Premium Rentals",
        "image": "https://aurevia-premium-rentals.vercel.app/readme/aurevia-banner.png",
        "telephone": "+919686909048",
        "email": "premmundargi135@gmail.com",
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
      {
        "@type": "BreadcrumbList",
        "@id": "https://aurevia-premium-rentals.vercel.app/#breadcrumb",
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": "Home",
            "item": "https://aurevia-premium-rentals.vercel.app",
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
