import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "AUREVIA — Premium Camera Rentals",
    short_name: "AUREVIA",
    description: "Premium camera, lens, and production gear rental platform for cinematographers and studios.",
    start_url: "/",
    display: "standalone",
    background_color: "#0a0a0a",
    theme_color: "#D8B36A",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
    ],
  };
}
