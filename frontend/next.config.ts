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

    // ── CSP directive builder ─────────────────────────────────────────────────
    //
    // next/font/google self-hosts font files under /_next/static at build time,
    // so fonts.googleapis.com is NOT required at runtime.  fonts.gstatic.com is
    // kept in font-src for the preload <link> hints Next.js emits.
    //
    // Framer Motion is fully bundled — no CDN, no eval() — so script-src can
    // stay strict.  The 'unsafe-eval' below is gated to dev only (React DevTools
    // and Next.js HMR both use Function() internally).
    //
    // 'unsafe-inline' in style-src is required: Next.js injects critical CSS via
    // <style> tags during SSR for above-the-fold content, and removing it causes
    // FOUC / broken Tailwind styles.
    //
    // dangerouslySetInnerHTML in the blog page renders plain HTML from our own
    // backend (no <script> tags) — it is safe under a strict script-src.
    const scriptSrc = isDev
      ? `'self' 'unsafe-eval' 'unsafe-inline'`  // HMR + React DevTools
      : `'self'`;                                 // strict in production

    const csp = [
      `default-src 'self'`,

      // ── Scripts ──────────────────────────────────────────────────────────────
      `script-src ${scriptSrc}`,

      // ── Styles ───────────────────────────────────────────────────────────────
      // 'unsafe-inline' required for Next.js SSR critical CSS injection.
      // fonts.googleapis.com is needed only when next/font emits a <link> preload
      // pointing to the Fonts API stylesheet (rare, but keep it safe).
      `style-src 'self' 'unsafe-inline' https://fonts.googleapis.com`,

      // ── Fonts ────────────────────────────────────────────────────────────────
      // next/font downloads and serves font files locally at build time.
      // fonts.gstatic.com covers the rare case where a preload hint resolves
      // to the CDN before the local copy is in cache.
      `font-src 'self' https://fonts.gstatic.com`,

      // ── Images ───────────────────────────────────────────────────────────────
      // data: required for SVG data-URIs used by Lucide React icons and Next.js
      // blurred placeholder base64 images.
      // blob: required for Next.js <Image /> progressive loading.
      `img-src 'self' data: blob: https://res.cloudinary.com https://images.unsplash.com https://lh3.googleusercontent.com`,

      // ── API / Fetch connections ───────────────────────────────────────────────
      // localhost:8080 — local Rust backend (dev)
      // *.mvrconsultants.com — production API subdomain
      // ws: / wss: — Next.js HMR WebSocket (dev only, ignored in prod)
      `connect-src 'self' http://localhost:8080 https://*.mvrconsultants.com ${isDev ? "ws://localhost:3000 ws://localhost:3001 http://localhost:3000" : ""}`,

      // ── Frames ───────────────────────────────────────────────────────────────
      // No iframes used on this site.  'none' also blocks clickjacking.
      `frame-src 'none'`,

      // ── Objects / Embeds ─────────────────────────────────────────────────────
      `object-src 'none'`,

      // ── Workers ──────────────────────────────────────────────────────────────
      // Next.js may use blob: workers for prefetch chunks.
      `worker-src 'self' blob:`,

      // ── Base URI ─────────────────────────────────────────────────────────────
      // Prevents <base> tag injection attacks.
      `base-uri 'self'`,

      // ── Form actions ─────────────────────────────────────────────────────────
      // All forms POST to our own backend; block redirects to foreign origins.
      `form-action 'self'`,

      // ── Manifest ─────────────────────────────────────────────────────────────
      `manifest-src 'self'`,
    ]
      .map((d) => d.trim())
      .join("; ");

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
          // ── Content Security Policy ───────────────────────────────────────
          {
            key: "Content-Security-Policy",
            value: csp,
          },
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
