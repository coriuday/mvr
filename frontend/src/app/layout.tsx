import type { Metadata, Viewport } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
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
    ],
    apple: [{ url: "/apple-touch-icon.png" }],
    other: [{ rel: "manifest", url: "/site.webmanifest" }],
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
          {children}
          <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
