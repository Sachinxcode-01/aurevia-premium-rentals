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
  metadataBase: new URL("http://localhost:3000"),
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "AUREVIA",
  },
  alternates: { canonical: "/" },
  openGraph: {
    title: "Aurevia Premium Camera Rentals",
    description: "Rent premium DSLR, mirrorless, cinema cameras, lenses and professional production gear.",
    url: "/",
    siteName: "AUREVIA",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Aurevia Premium Camera Rentals",
    description: "Rent premium DSLR, mirrorless, cinema cameras, lenses and professional production gear.",
  },
};

export const viewport: Viewport = {
  themeColor: "#080808",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${playfair.variable} ${inter.variable} h-full antialiased`}>
      <head>
        {/* LocalBusiness structured JSON-LD data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "LocalBusiness",
              "name": "AUREVIA Premium Camera Rentals",
              "image": "https://aurevia-premium-rentals.vercel.app/assets/images/canon.jpg",
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

        {/* Global providers: Toast → Cart → Chatbot → Page */}
        <ToastProvider>
          <CartProvider>
            <ChatbotProvider>
              <OnlineStatusBanner />
              <PWARegister />
              <div className="flex-1 flex flex-col">
                {children}
              </div>
              {/* Floating AI Chatbot overlay */}
              <FloatingChatLauncher />
              <ChatWindow />
            </ChatbotProvider>
          </CartProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
