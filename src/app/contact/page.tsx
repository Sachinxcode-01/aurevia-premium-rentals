import { Metadata } from "next";
import ContactClient from "@/components/pages/ContactClient";

export const metadata: Metadata = {
  title: "Contact Us & Studio Location | AUREVIA Camera Rentals",
  description:
    "Get in touch with AUREVIA Premium Camera Rentals. Studio location in Gadag, phone support, email, and direct WhatsApp concierge.",
  alternates: {
    canonical: "https://aurevia-premium-rentals.vercel.app/contact",
  },
  openGraph: {
    title: "Contact AUREVIA Premium Camera Rentals",
    description:
      "Reach out to our equipment concierge team for bookings, equipment inquiries, or studio visits.",
    url: "https://aurevia-premium-rentals.vercel.app/contact",
    siteName: "AUREVIA Premium Rentals",
    images: [
      {
        url: "https://aurevia-premium-rentals.vercel.app/readme/aurevia-banner.png",
        width: 1200,
        height: 630,
        alt: "Contact AUREVIA Camera Rentals",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Contact AUREVIA Camera Rentals",
    description:
      "Get in touch with our camera equipment concierge team.",
    images: ["https://aurevia-premium-rentals.vercel.app/readme/aurevia-banner.png"],
  },
};

export default function ContactPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    "name": "Contact AUREVIA Premium Camera Rentals",
    "description": "Contact details and studio location for AUREVIA Premium Camera Rentals.",
    "url": "https://aurevia-premium-rentals.vercel.app/contact",
    "mainEntity": {
      "@type": "LocalBusiness",
      "name": "AUREVIA Premium Camera Rentals",
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
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ContactClient />
    </>
  );
}
