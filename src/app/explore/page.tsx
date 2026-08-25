import { Metadata } from "next";
import ExploreClient from "@/components/pages/ExploreClient";
import { MOCK_PRODUCTS } from "@/lib/db/mockData";

export const metadata: Metadata = {
  title: "Explore Cinema & Camera Gear | AUREVIA Rentals",
  description:
    "Browse AUREVIA's curated collection of professional full-frame mirrorless cameras, cinema bodies, anamorphic & prime lenses, gimbals, and production lighting.",
  alternates: {
    canonical: "https://aurevia-premium-rentals.vercel.app/explore",
  },
  openGraph: {
    title: "Explore Professional Camera & Cinema Vault | AUREVIA",
    description:
      "Filter and discover elite cinema camera equipment, master prime lenses, and production accessories available for daily and weekly rental.",
    url: "https://aurevia-premium-rentals.vercel.app/explore",
    siteName: "AUREVIA Premium Rentals",
    images: [
      {
        url: "https://aurevia-premium-rentals.vercel.app/readme/aurevia-banner.png",
        width: 1200,
        height: 630,
        alt: "AUREVIA Camera Catalog",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Explore Camera Gear Catalog | AUREVIA",
    description:
      "Filter and book high-end cinema equipment and lenses.",
    images: ["https://aurevia-premium-rentals.vercel.app/readme/aurevia-banner.png"],
  },
};

export default function ExplorePage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": "AUREVIA Camera & Cinema Gear Catalog",
    "description": "Professional cinema cameras, lenses, and production gear for rent.",
    "numberOfItems": MOCK_PRODUCTS.length,
    "itemListElement": MOCK_PRODUCTS.map((product, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "item": {
        "@type": "Product",
        "name": product.name,
        "description": product.description,
        "image": product.imagePrimary,
        "url": `https://aurevia-premium-rentals.vercel.app/gear/${product.slug}`,
        "offers": {
          "@type": "Offer",
          "price": product.dailyPrice,
          "priceCurrency": "INR",
          "availability": "https://schema.org/InStock",
        },
      },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ExploreClient />
    </>
  );
}
