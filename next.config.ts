import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    // Only proxy /api/* to a separate backend if NEXT_PUBLIC_API_URL is explicitly set.
    // For single-deployment setups, leave NEXT_PUBLIC_API_URL unset.
    const apiDest = process.env.NEXT_PUBLIC_API_URL;
    if (apiDest) {
      return [
        {
          source: "/api/:path*",
          destination: `${apiDest}/api/:path*`,
        },
      ];
    }
    return [];
  },

  async headers() {
    return [
      // ── Security Headers (all routes) ──────────────────────────────
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options",           value: "DENY" },
          { key: "X-Content-Type-Options",     value: "nosniff" },
          { key: "Referrer-Policy",            value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy",         value: "camera=(), microphone=(), geolocation=()" },
          { key: "X-DNS-Prefetch-Control",     value: "on" },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
        ],
      },
    ];
  },

  // ── Image Optimization ────────────────────────────────────────────
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "*.supabase.co",
      },
    ],
  },

  // ── Production Console Optimization ──────────────────────────────
  compiler: {
    removeConsole: process.env.NODE_ENV === "production" ? { exclude: ["error", "warn"] } : false,
  },
};

export default nextConfig;
