import type { MetadataRoute } from "next";

const BASE_URL =
  process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ||
  "https://www.mvrconsultants.org";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        // ── Allow all well-behaved crawlers ─────────────────────────────────
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin/",         // Admin dashboard
          "/admin/login/",   // Admin login
          "/admin/users/",   // User management
          "/admin/leads/",   // Internal leads
          "/admin/blogs/",   // Blog CMS
          "/admin/unis/",    // University management
          "/api/",           // API routes
          "/_next/",         // Next.js internals
          "/404",
          "/500",
        ],
      },
      {
        // ── Block GPTBot (opt-out of OpenAI training) ───────────────────────
        userAgent: "GPTBot",
        disallow: "/",
      },
      {
        // ── Block CCBot (opt-out of Common Crawl AI training) ───────────────
        userAgent: "CCBot",
        disallow: "/",
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
    host: BASE_URL,
  };
}
