import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    // If NEXT_PUBLIC_API_URL is configured (on the Frontend project),
    // proxy all /api/:path* requests to the backend server.
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
      {
        source: "/api/:path*",
        headers: [
          { key: "Access-Control-Allow-Credentials", value: "true" },
          { key: "Access-Control-Allow-Origin", value: process.env.NEXT_PUBLIC_APP_URL || "*" },
          { key: "Access-Control-Allow-Methods", value: "GET,OPTIONS,PATCH,DELETE,POST,PUT" },
          { key: "Access-Control-Allow-Headers", value: "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization" },
        ]
      }
    ];
  }
};

export default nextConfig;
