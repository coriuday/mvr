import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // H-6 security fix: Do NOT emit source maps in production builds.
  // Source maps expose original TypeScript/JSX source to anyone who opens DevTools,
  // making reverse-engineering significantly easier.
  productionBrowserSourceMaps: false,

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
          // ── Content Security Policy (BUG-013) ─────────────────────────────
          // Allows self, Cloudinary, Unsplash, Google Fonts, backend API,
          // and open.er-api.com (currency converter).
          // unsafe-inline is required for Next.js hydration scripts + Tailwind.
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              // Scripts: self + Next.js inline hydration
              // H-6 security fix: 'unsafe-eval' has been REMOVED.
              // React 19 / Next.js 15 do not require unsafe-eval in production builds.
              // 'unsafe-inline' is kept for now for Next.js hydration (tracked in BUG-027:
              // migrate to nonce-based CSP when inline script hashes are available).
              "script-src 'self' 'unsafe-inline'",
              // Styles: self + inline (Tailwind) + Google Fonts
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              // Fonts: self + Google Fonts CDN
              "font-src 'self' https://fonts.gstatic.com",
              // Images: self + Cloudinary + Unsplash + data URIs (for icons)
              "img-src 'self' data: blob: https://res.cloudinary.com https://images.unsplash.com https://lh3.googleusercontent.com",
              // API connections: backend + currency API + Cloudinary upload API (H-2 signed uploads)
              // L-8 security fix: Removed generativelanguage.googleapis.com — the frontend
              // never calls Gemini directly. All AI requests go through the Rust backend.
              `connect-src 'self' ${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"} https://open.er-api.com https://api.cloudinary.com`,
              // Frames: none
              "frame-src 'none'",
              // Objects: none
              "object-src 'none'",
              // Upgrade insecure requests in production
              ...(isDev ? [] : ["upgrade-insecure-requests"]),
            ].join("; "),
          },
          // HSTS — production only (localhost has no TLS certificate)
          // max-age=31536000 = 1 year; includeSubDomains covers api.* and www.*
          ...(isDev ? [] : [{
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains; preload",
          }]),
        ],
      },
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
