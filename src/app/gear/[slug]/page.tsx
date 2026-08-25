import { Metadata } from "next";
import { notFound } from "next/navigation";
import { db } from "@/lib/db/store";
import GearClientDetails from "@/components/features/gear/GearClientDetails";

interface GearPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: GearPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await db.getProductBySlug(slug);

  if (!product) {
    return {
      title: "Gear Not Found | AUREVIA Premium Camera Rentals",
      description: "The requested camera or equipment piece was not found in the AUREVIA vault.",
    };
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://aurevia-premium-rentals.vercel.app";
  const pageUrl = `${siteUrl}/gear/${product.slug}`;

  return {
    title: `${product.name} | Rent Professional Cinema Gear`,
    description: `Rent ${product.name} starting at ₹${product.dailyPrice}/day from AUREVIA Premium Camera Rentals. ${product.description.slice(0, 120)}`,
    keywords: [
      product.name,
      `rent ${product.name}`,
      `${product.brandId} camera rental`,
      `${product.categoryId} rental`,
      "camera equipment rental",
      "Aurevia camera vault",
    ],
    alternates: {
      canonical: pageUrl,
    },
    openGraph: {
      title: `${product.name} — Rent at ₹${product.dailyPrice}/day | AUREVIA`,
      description: product.description,
      url: pageUrl,
      siteName: "AUREVIA Premium Rentals",
      images: [
        {
          url: product.imagePrimary,
          width: 1200,
          height: 630,
          alt: product.name,
        },
      ],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${product.name} | Rent at AUREVIA`,
      description: product.description,
      images: [product.imagePrimary],
    },
  };
}

export default async function GearDetailsPage({ params }: GearPageProps) {
  const { slug } = await params;
  const product = await db.getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://aurevia-premium-rentals.vercel.app";

  // Structured Data (JSON-LD) for SEO (Product + Breadcrumbs)
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": "Home",
            "item": siteUrl,
          },
          {
            "@type": "ListItem",
            "position": 2,
            "name": "Explore Catalog",
            "item": `${siteUrl}/explore`,
          },
          {
            "@type": "ListItem",
            "position": 3,
            "name": product.name,
            "item": `${siteUrl}/gear/${product.slug}`,
          },
        ],
      },
      {
        "@type": "Product",
        "name": product.name,
        "image": product.images && product.images.length > 0 ? product.images : [product.imagePrimary],
        "description": product.description,
        "sku": product.id,
        "brand": {
          "@type": "Brand",
          "name": product.brandId ? product.brandId.toUpperCase() : "AUREVIA",
        },
        "offers": {
          "@type": "Offer",
          "url": `${siteUrl}/gear/${product.slug}`,
          "priceCurrency": "INR",
          "price": product.dailyPrice,
          "availability": product.isArchived
            ? "https://schema.org/OutOfStock"
            : "https://schema.org/InStock",
          "itemCondition": "https://schema.org/UsedCondition",
          "seller": {
            "@type": "Organization",
            "name": "AUREVIA Premium Camera Rentals",
          },
        },
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <GearClientDetails product={product} slug={slug} />
    </>
  );
}
