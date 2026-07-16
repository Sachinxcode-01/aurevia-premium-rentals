import type { Metadata, Viewport } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/hooks/useCart";
import { ToastProvider } from "@/hooks/useToast";
import { OnlineStatusBanner } from "@/components/ui/OnlineStatusBanner";
import { ChatbotProvider } from "@/components/chatbot/ChatbotProvider";
import FloatingChatLauncher from "@/components/chatbot/FloatingChatLauncher";
import ChatWindow from "@/components/chatbot/ChatWindow";

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
      <body className="min-h-full flex flex-col bg-obsidian text-ivory font-sans selection:bg-gold-champagne/20 selection:text-ivory">
        {/* Cinematic noise film grain */}
        <div className="film-grain" />

        {/* Global providers: Toast → Cart → Chatbot → Page */}
        <ToastProvider>
          <CartProvider>
            <ChatbotProvider>
              <OnlineStatusBanner />
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
