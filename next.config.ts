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
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
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
      // ── CORS Headers (API routes only) ────────────────────────────
      {
        source: "/api/:path*",
        headers: [
          { key: "Access-Control-Allow-Credentials", value: "true" },
          { key: "Access-Control-Allow-Origin",      value: siteUrl },
          { key: "Access-Control-Allow-Methods",     value: "GET,OPTIONS,PATCH,DELETE,POST,PUT" },
          {
            key: "Access-Control-Allow-Headers",
            value: "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization",
          },
        ],
      },
    ];
  },

  // ── Image Optimization ────────────────────────────────────────────
  images: {
    formats: ["image/webp"],
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
};

export default nextConfig;
