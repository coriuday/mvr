import type { Metadata } from "next";
import dynamic from "next/dynamic";
import HeroSection from "@/components/hero/HeroSection";
import QuickActionBar from "@/components/sections/QuickActionBar";
import CountriesSection from "@/components/sections/CountriesSection";

// Dynamically import below-the-fold sections with SSR enabled to preserve SEO pre-rendering
const ServicesSection = dynamic(() => import("@/components/sections/ServicesSection"), {
  loading: () => <div className="min-h-[500px] animate-pulse bg-gray-50 m-8 rounded-3xl" />,
  ssr: true,
});

const StatsBanner = dynamic(() => import("@/components/sections/StatsBanner"), {
  loading: () => <div className="min-h-[160px] animate-pulse bg-[#0f1c3d] m-4 rounded-2xl" />,
  ssr: true,
});

const TestimonialsSection = dynamic(() => import("@/components/sections/TestimonialsSection"), {
  loading: () => <div className="min-h-[480px] animate-pulse bg-gray-50 m-8 rounded-3xl" />,
  ssr: true,
});

const HighlightGrid = dynamic(() => import("@/components/sections/HighlightGrid"), {
  loading: () => <div className="min-h-[400px] animate-pulse bg-[#f8f9fc] m-6 rounded-2xl" />,
  ssr: true,
});

const StudentResourcesSection = dynamic(() => import("@/components/sections/StudentResourcesSection"), {
  loading: () => <div className="min-h-[220px] animate-pulse bg-gray-50 m-4 rounded-xl" />,
  ssr: true,
});

const NewsletterSection = dynamic(() => import("@/components/sections/NewsletterSection"), {
  loading: () => <div className="min-h-[160px] animate-pulse bg-[#0f1c3d] m-4 rounded-2xl" />,
  ssr: true,
});

export const metadata: Metadata = {
  title: "MVR Consultants — Study Abroad | Visa | Scholarships | Admissions",
  description:
    "Expert guidance for study abroad, visa applications, scholarships, and university admissions. 15+ years of experience. 50,000+ students guided. 98% visa success rate.",
};

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <QuickActionBar />
      <CountriesSection />
      <ServicesSection />
      <StatsBanner />
      <TestimonialsSection />
      <HighlightGrid />
      <StudentResourcesSection />
      <NewsletterSection />
    </>
  );
}
