import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Standalone output for Docker; disabled on Vercel (Vercel manages its own output)
  ...(process.env.DOCKER_BUILD === "true" ? { output: "standalone" as const } : {}),

  // ---------------------------------------------------------------------------
  // React Compiler (Next.js 15)
  // ---------------------------------------------------------------------------
  reactCompiler: true,

  // ---------------------------------------------------------------------------
  // Image optimization — allow Cloudinary and other external domains
  // ---------------------------------------------------------------------------
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        pathname: "/**",
      },
    ],
  },

  // ---------------------------------------------------------------------------
  // Environment variables exposed to the browser
  // ---------------------------------------------------------------------------
  env: {
    NEXT_PUBLIC_API_URL:
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080",
    NEXT_PUBLIC_APP_URL:
      process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
    NEXT_PUBLIC_APP_NAME: "MVR Consultants",
  },

  // ---------------------------------------------------------------------------
  // Security headers
  // ---------------------------------------------------------------------------
  async headers() {
    const isDev = process.env.NODE_ENV !== "production";

    return [
      {
        source: "/(.*)",
        headers: [
          // ── Existing headers (preserved) ──────────────────────────────────
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-XSS-Protection", value: "1; mode=block" },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(self)",
          },
          // HSTS — production only (localhost has no TLS certificate)
          // max-age=31536000 = 1 year; includeSubDomains covers api.* and www.*
          ...(isDev ? [] : [{
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains; preload",
          }]),
        ],
      },
      // Cache static assets ONLY in production — in dev this breaks HMR
      // because browsers permanently cache chunks and ignore server updates
      ...(process.env.NODE_ENV === "production"
        ? [
            {
              source: "/_next/static/(.*)",
              headers: [
                {
                  key: "Cache-Control",
                  value: "public, max-age=31536000, immutable",
                },
              ],
            },
          ]
        : []),
    ];
  },


  // ---------------------------------------------------------------------------
  // Redirect www → non-www (configure domain when ready)
  // ---------------------------------------------------------------------------
  async redirects() {
    return [];
  },
};

export default nextConfig;
