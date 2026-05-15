import type { Metadata } from "next";
import HeroSection from "@/components/hero/HeroSection";
import QuickActionBar from "@/components/sections/QuickActionBar";
import CountriesSection from "@/components/sections/CountriesSection";
import ServicesSection from "@/components/sections/ServicesSection";
import StatsBanner from "@/components/sections/StatsBanner";
import HighlightGrid from "@/components/sections/HighlightGrid";
import TestimonialsSection from "@/components/sections/TestimonialsSection";
import NewsletterSection from "@/components/sections/NewsletterSection";

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
      <HighlightGrid />
      <TestimonialsSection />
      <NewsletterSection />
    </>
  );
}
