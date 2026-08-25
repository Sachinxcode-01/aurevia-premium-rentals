import { Metadata } from "next";
import FaqClient from "@/components/pages/FaqClient";
import { MOCK_FAQS } from "@/lib/db/mockData";

export const metadata: Metadata = {
  title: "Frequently Asked Questions | AUREVIA Camera Rentals",
  description:
    "Find answers to common questions about camera rentals, security deposits, KYC verification, delivery, and equipment handling at AUREVIA.",
  alternates: {
    canonical: "https://aurevia-premium-rentals.vercel.app/faq",
  },
  openGraph: {
    title: "Frequently Asked Questions — AUREVIA Camera Rentals",
    description:
      "Everything you need to know about renting DSLR, mirrorless, and cinema camera gear from AUREVIA.",
    url: "https://aurevia-premium-rentals.vercel.app/faq",
    siteName: "AUREVIA Premium Rentals",
    images: [
      {
        url: "https://aurevia-premium-rentals.vercel.app/readme/aurevia-banner.png",
        width: 1200,
        height: 630,
        alt: "AUREVIA FAQ",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "FAQ | AUREVIA Camera Rentals",
    description:
      "Answers to camera rental questions, deposits, KYC, and equipment policies.",
    images: ["https://aurevia-premium-rentals.vercel.app/readme/aurevia-banner.png"],
  },
};

export default function FAQPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": MOCK_FAQS.map((faq) => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer,
      },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <FaqClient />
    </>
  );
}
