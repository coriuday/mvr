import type { Metadata, Viewport } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

// ---------------------------------------------------------------------------
// Fonts
// ---------------------------------------------------------------------------
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

// ---------------------------------------------------------------------------
// Metadata
// ---------------------------------------------------------------------------
export const metadata: Metadata = {
  title: {
    default: "MVR Consultants — Study Abroad | Visa | Scholarships | Admissions",
    template: "%s | MVR Consultants",
  },
  description:
    "Expert guidance for study abroad, visa applications, scholarships, and university admissions. 10 years of experience. 50,000+ students guided. 98% visa success rate.",
  keywords: [
    "study abroad consultants",
    "visa guidance India",
    "scholarship assistance",
    "university admissions",
    "student counseling",
    "abroad education",
    "USA university",
    "UK university",
    "Canada student visa",
    "Australia student visa",
  ],
  authors: [{ name: "MVR Consultants" }],
  creator: "MVR Consultants",
  publisher: "MVR Consultants",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "https://www.mvrconsultants.org"
  ),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://www.mvrconsultants.org",
    siteName: "MVR Consultants",
    title: "MVR Consultants — Study Abroad | Visa | Scholarships | Admissions",
    description:
      "Expert guidance for study abroad, visa applications, scholarships, and university admissions. Dream. Plan. Achieve.",
    images: [
      {
        url: "/web-app-manifest-512x512.png",
        width: 512,
        height: 512,
        alt: "MVR Consultants Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "MVR Consultants — Study Abroad Experts",
    description:
      "Expert guidance for study abroad, visa applications, scholarships, and university admissions.",
    images: ["/web-app-manifest-512x512.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon-96x96.png", sizes: "96x96", type: "image/png" },
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
    apple: [{ url: "/apple-touch-icon.png" }],
    other: [
      { rel: "manifest", url: "/site.webmanifest" },
    ],
  },
};

export const viewport: Viewport = {
  themeColor: "#1a2f5e",
  width: "device-width",
  initialScale: 1,
};

// ---------------------------------------------------------------------------
// Root Layout
// ---------------------------------------------------------------------------
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`} suppressHydrationWarning data-scroll-behavior="smooth">
      <body className="antialiased min-h-screen bg-background font-sans">
          {/* Bug 3 fix: CSS-first preloader — visible immediately from server HTML, before any JS hydrates.
              This ensures the preloader is ALWAYS shown before the hero, even on first paint. */}
          <style dangerouslySetInnerHTML={{ __html: `
            #mvr-preloader {
              position: fixed;
              inset: 0;
              z-index: 99999;
              background: #1a2f5e;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              transition: opacity 0.45s ease;
              pointer-events: none;
            }
            #mvr-preloader.hide {
              opacity: 0;
            }
            .mvr-preloader-logo {
              width: 96px;
              height: 96px;
              object-fit: contain;
              animation: mvrPulse 1.3s ease-in-out infinite;
            }
            .mvr-preloader-tagline {
              color: rgba(255,255,255,0.45);
              font-size: 12px;
              letter-spacing: 0.22em;
              text-transform: uppercase;
              font-family: sans-serif;
              margin-top: 16px;
              font-weight: 300;
            }
            .mvr-bar {
              width: 160px;
              height: 2px;
              background: rgba(255,255,255,0.12);
              border-radius: 99px;
              margin-top: 20px;
              overflow: hidden;
            }
            .mvr-bar-fill {
              height: 100%;
              background: linear-gradient(90deg, transparent, #c9a84c, transparent);
              border-radius: 99px;
              animation: mvrLoading 1.5s ease-in-out infinite;
            }
            @keyframes mvrPulse {
              0%, 100% { transform: scale(1); opacity: 1; }
              50% { transform: scale(1.06); opacity: 0.88; }
            }
            @keyframes mvrLoading {
              0% { transform: translateX(-100%); }
              100% { transform: translateX(200%); }
            }
          ` }} />
          <div id="mvr-preloader" aria-hidden="true" suppressHydrationWarning>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/web-app-manifest-512x512.png"
              alt=""
              className="mvr-preloader-logo"
              width={96}
              height={96}
            />
            <p className="mvr-preloader-tagline">Dream · Plan · Achieve</p>
            <div className="mvr-bar"><div className="mvr-bar-fill" /></div>
          </div>
          <script dangerouslySetInnerHTML={{ __html: `
            (function() {
              var el = document.getElementById('mvr-preloader');
              // Skip preloader on admin routes or if already shown this session
              var isAdmin = window.location.pathname.startsWith('/admin');
              var alreadySeen = sessionStorage.getItem('mvr_preloader_shown');
              if (isAdmin || alreadySeen) {
                if (el) el.style.display = 'none';
                return;
              }
              function hide() {
                if (!el) return;
                el.classList.add('hide');
                setTimeout(function() { if (el) el.style.display = 'none'; }, 500);
                sessionStorage.setItem('mvr_preloader_shown', '1');
              }
              if (document.readyState === 'complete') {
                setTimeout(hide, 250);
              } else {
                window.addEventListener('load', function() { setTimeout(hide, 250); });
              }
              // Safety: hide after 4 s regardless
              setTimeout(hide, 4000);
            })();
          ` }} />
          {children}
          <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
