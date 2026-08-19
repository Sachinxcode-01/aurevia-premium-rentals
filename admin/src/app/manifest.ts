import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "AUREVIA Admin Control Center",
    short_name: "AUREVIA Admin",
    description: "Enterprise Operations, Inventory Control, KYC, & Booking Management for AUREVIA Premium Rentals.",
    start_url: "/",
    display: "standalone",
    background_color: "#070707",
    theme_color: "#d8b36a",
    icons: [
      {
        src: "/aurevia-logo.png",
        sizes: "192x192",
        type: "image/png",
      },
    ],
  };
}
