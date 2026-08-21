import type { Metadata, Viewport } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/hooks/useCart";
import { ToastProvider } from "@/hooks/useToast";
import { OnlineStatusBanner } from "@/components/ui/OnlineStatusBanner";
import { ChatbotProvider } from "@/components/chatbot/ChatbotProvider";
import FloatingChatLauncher from "@/components/chatbot/FloatingChatLauncher";
import ChatWindow from "@/components/chatbot/ChatWindow";
import { PWARegister } from "@/components/pwa/PWARegister";
import { Analytics } from "@vercel/analytics/next";
import Spotlight from "@/components/effects/Spotlight";
import AmbientParticles from "@/components/effects/AmbientParticles";
import FloatingWhatsApp from "@/components/ui/FloatingWhatsApp";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Aurevia Premium Camera Rentals | Professional Cameras & Lenses for Rent",
  description: "Rent premium DSLR, mirrorless, cinema cameras, lenses and professional production gear from Aurevia Camera Rentals by Prem. Frame the Extraordinary.",
  metadataBase: new URL("https://aurevia-premium-rentals.vercel.app"),
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "any" }
    ],
    shortcut: "/icon.svg",
    apple: "/icon.svg",
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "AUREVIA",
  },
  alternates: { canonical: "/" },
  openGraph: {
    title: "Aurevia Premium Camera Rentals",
    description: "Rent premium DSLR, mirrorless, cinema cameras, lenses and professional production gear from Aurevia Camera Rentals by Prem.",
    url: "https://aurevia-premium-rentals.vercel.app",
    siteName: "AUREVIA",
    images: [
      {
        url: "/readme/aurevia-banner.png",
        width: 1200,
        height: 630,
        alt: "AUREVIA Premium Camera Rentals",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Aurevia Premium Camera Rentals",
    description: "Rent premium DSLR, mirrorless, cinema cameras, lenses and professional production gear from Aurevia Camera Rentals by Prem.",
    images: ["/readme/aurevia-banner.png"],
  },
  verification: {
    google: "google2af6b85353900719",
  },
};

export const viewport: Viewport = {
  themeColor: "#080808",
  width: "device-width",
  initialScale: 1,
};

import GearAssistantModal from "@/components/ai/GearAssistantModal";

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" data-scroll-behavior="smooth" className={`${playfair.variable} ${inter.variable} h-full antialiased`}>
      <head>
        {/* WebSite structured JSON-LD data for Google Search Site Name */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              "name": "AUREVIA",
              "alternateName": [
                "Aurevia Premium Rentals",
                "Aurevia Camera Rentals",
                "Aurevia Cinema Vault"
              ],
              "url": "https://aurevia-premium-rentals.vercel.app"
            })
          }}
        />
        {/* Organization structured JSON-LD data with official brand logo */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "AUREVIA Premium Camera Rentals",
              "url": "https://aurevia-premium-rentals.vercel.app",
              "logo": "https://aurevia-premium-rentals.vercel.app/icon.svg",
              "founder": {
                "@type": "Person",
                "name": "Prem Mundargi"
              },
              "contactPoint": {
                "@type": "ContactPoint",
                "telephone": "+919686909048",
                "contactType": "customer service",
                "areaServed": "IN",
                "availableLanguage": ["English", "Kannada", "Hindi"]
              }
            })
          }}
        />
        {/* LocalBusiness structured JSON-LD data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "LocalBusiness",
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
                "addressCountry": "IN"
              },
              "priceRange": "INR",
              "url": "https://aurevia-premium-rentals.vercel.app"
            })
          }}
        />
        {/* Product structured JSON-LD data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Product",
              "name": "Canon EOS R5 Renter Pack",
              "image": "https://aurevia-premium-rentals.vercel.app/assets/images/canon.jpg",
              "description": "Rent premium Canon EOS R5 camera body in Gadag. High resolution 45MP sensor for creative visual art projects.",
              "offers": {
                "@type": "Offer",
                "price": "799.00",
                "priceCurrency": "INR",
                "availability": "https://schema.org/InStock",
                "url": "https://aurevia-premium-rentals.vercel.app/gear/canon-eos-r5"
              }
            })
          }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-obsidian text-ivory font-sans selection:bg-gold-champagne/20 selection:text-ivory">
        {/* Cinematic noise film grain */}
        <div className="film-grain" />

        {/* Ambient Effects */}
        <Spotlight />
        <AmbientParticles />

        {/* Global providers: Toast → Cart → Chatbot → Page */}
        <ToastProvider>
          <CartProvider>
            <ChatbotProvider>
              <OnlineStatusBanner />
              <PWARegister />
              <div className="flex-1 flex flex-col">
                {children}
              </div>
              {/* Floating AI Chatbot overlay, AI Gear Concierge, & Floating WhatsApp trigger */}
              <FloatingChatLauncher />
              <ChatWindow />
              <GearAssistantModal />
              <FloatingWhatsApp />
            </ChatbotProvider>
          </CartProvider>
        </ToastProvider>
        <Analytics />
      </body>
    </html>
  );
}
