"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, GraduationCap, Briefcase, Building2, MapPin, DollarSign, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { notFound } from "next/navigation";

// Static data mapping for countries
const COUNTRY_DATA: Record<string, any> = {
  usa: {
    name: "United States",
    heroImage: "https://images.unsplash.com/photo-1485738422979-f5c462d49f74?auto=format&fit=crop&w=1920&q=80",
    description: "The US is home to the world's highest number of international students, offering unparalleled academic flexibility and cutting-edge research opportunities.",
    stats: [
      { icon: Building2, label: "Universities", value: "4,000+" },
      { icon: Briefcase, label: "Post-Study Work", value: "Up to 3 Years (OPT)" },
      { icon: DollarSign, label: "Avg. Tuition", value: "$20k - $50k/yr" },
      { icon: Calendar, label: "Main Intakes", value: "Fall, Spring" },
    ],
    whyStudy: [
      "Home to the highest number of top-ranked universities globally.",
      "Flexible education system allowing you to change majors.",
      "Hub of technology and innovation with OPT opportunities.",
      "Diverse culture and vibrant campus life.",
    ],
    topUnis: ["Massachusetts Institute of Technology (MIT)", "Stanford University", "Harvard University", "California Institute of Technology"],
  },
  uk: {
    name: "United Kingdom",
    heroImage: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=1920&q=80",
    description: "Experience academic prestige with shorter course durations. The UK is a global leader in quality education, recognized by employers worldwide.",
    stats: [
      { icon: Building2, label: "Universities", value: "150+" },
      { icon: Briefcase, label: "Post-Study Work", value: "2 Years (PSW)" },
      { icon: DollarSign, label: "Avg. Tuition", value: "£12k - £25k/yr" },
      { icon: Calendar, label: "Main Intakes", value: "Sept, Jan" },
    ],
    whyStudy: [
      "1-year Master's degree programs save time and money.",
      "Graduate Route Visa offers 2 years of post-study work.",
      "Home to some of the oldest and most prestigious universities.",
      "Gateway to Europe with rich history and culture.",
    ],
    topUnis: ["University of Oxford", "University of Cambridge", "Imperial College London", "University College London"],
  },
  canada: {
    name: "Canada",
    heroImage: "https://images.unsplash.com/photo-1503614472-8c93d56e92ce?auto=format&fit=crop&w=1920&q=80",
    description: "Consistently ranked as one of the best countries for quality of life, Canada offers top-tier education with clear pathways to permanent residency.",
    stats: [
      { icon: Building2, label: "Universities", value: "100+" },
      { icon: Briefcase, label: "Post-Study Work", value: "Up to 3 Years" },
      { icon: DollarSign, label: "Avg. Tuition", value: "CAD 15k - 35k/yr" },
      { icon: Calendar, label: "Main Intakes", value: "Sept, Jan, May" },
    ],
    whyStudy: [
      "Affordable tuition compared to the US and UK.",
      "Post-Graduation Work Permit (PGWP) pathway to PR.",
      "Highly welcoming, safe, and multicultural society.",
      "Strong economy with excellent job opportunities in tech and health.",
    ],
    topUnis: ["University of Toronto", "McGill University", "University of British Columbia", "University of Waterloo"],
  },
  australia: {
    name: "Australia",
    heroImage: "https://images.unsplash.com/photo-1523482580672-f109ba8cb9be?auto=format&fit=crop&w=1920&q=80",
    description: "Boasting 8 of the top 100 universities globally, Australia combines world-class education with an incredible lifestyle and high minimum wages.",
    stats: [
      { icon: Building2, label: "Universities", value: "40+" },
      { icon: Briefcase, label: "Post-Study Work", value: "Up to 4 Years" },
      { icon: DollarSign, label: "Avg. Tuition", value: "AUD 30k - 50k/yr" },
      { icon: Calendar, label: "Main Intakes", value: "Feb, July" },
    ],
    whyStudy: [
      "Generous post-study work rights (up to 4 years for masters).",
      "High minimum wage for part-time work during studies.",
      "Focus on practical and industry-oriented learning.",
      "Incredible quality of life, climate, and outdoor lifestyle.",
    ],
    topUnis: ["University of Melbourne", "University of Sydney", "Australian National University", "UNSW Sydney"],
  },
  germany: {
    name: "Germany",
    heroImage: "https://images.unsplash.com/photo-1467269204594-9661b134dd2b?auto=format&fit=crop&w=1920&q=80",
    description: "The engine of Europe's economy. Germany is globally revered for engineering and tech, offering zero or extremely low tuition fees.",
    stats: [
      { icon: Building2, label: "Universities", value: "300+" },
      { icon: Briefcase, label: "Post-Study Work", value: "18 Months" },
      { icon: DollarSign, label: "Avg. Tuition", value: "€0 - €3k/yr" },
      { icon: Calendar, label: "Main Intakes", value: "Winter, Summer" },
    ],
    whyStudy: [
      "Free or very low tuition at public universities.",
      "World leader in Engineering, Auto, and Manufacturing.",
      "18-month job seeker visa post-graduation.",
      "Central location in Europe making travel extremely accessible.",
    ],
    topUnis: ["Technical University of Munich", "LMU Munich", "Heidelberg University", "RWTH Aachen University"],
  },
  ireland: {
    name: "Ireland",
    heroImage: "https://images.unsplash.com/photo-1590089415225-401ed6f9db8e?auto=format&fit=crop&w=1920&q=80",
    description: "The European HQ for Google, Apple, and Facebook. Ireland offers an english-speaking environment with booming tech and pharma sectors.",
    stats: [
      { icon: Building2, label: "Universities", value: "30+" },
      { icon: Briefcase, label: "Post-Study Work", value: "Up to 2 Years" },
      { icon: DollarSign, label: "Avg. Tuition", value: "€10k - €25k/yr" },
      { icon: Calendar, label: "Main Intakes", value: "Sept, Jan" },
    ],
    whyStudy: [
      "Home to European headquarters of massive global tech firms.",
      "Only native English-speaking country in the Eurozone.",
      "2-year stay back option for postgraduates.",
      "Friendly, welcoming locals and rich cultural heritage.",
    ],
    topUnis: ["Trinity College Dublin", "University College Dublin", "University of Galway", "University College Cork"],
  },
};

export default function CountryDetailClient({ slug }: { slug: string }) {
  const country = COUNTRY_DATA[slug];

  if (!country) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* ── Hero Section ── */}
      <section className="relative h-[60vh] min-h-[500px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img src={country.heroImage} alt={country.name} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-[#1a2f5e]/80 mix-blend-multiply" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1a2f5e] via-transparent to-transparent" />
        </div>
        
        <div className="relative z-10 max-w-5xl mx-auto px-4 w-full text-center mt-16">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <Link href="/countries" className="inline-flex items-center gap-2 text-white/70 hover:text-white text-sm font-semibold mb-6 transition-colors">
              <ArrowLeft size={16} /> Back to Destinations
            </Link>
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6" style={{ fontFamily: "var(--font-playfair)" }}>
              Study in <span className="text-[#c9a84c]">{country.name}</span>
            </h1>
            <p className="text-white/80 text-lg md:text-xl max-w-3xl mx-auto leading-relaxed">
              {country.description}
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── Quick Stats Grid ── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 relative z-20 -mt-16">
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 grid grid-cols-2 md:grid-cols-4 gap-8"
        >
          {country.stats.map((stat: any, i: number) => (
            <div key={i} className="text-center md:text-left flex flex-col md:flex-row items-center md:items-start gap-4">
              <div className="w-12 h-12 bg-[#1a2f5e]/5 rounded-2xl flex items-center justify-center shrink-0">
                <stat.icon size={22} className="text-[#c9a84c]" />
              </div>
              <div>
                <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-1">{stat.label}</p>
                <p className="text-[#1a2f5e] font-bold text-lg">{stat.value}</p>
              </div>
            </div>
          ))}
        </motion.div>
      </section>

      {/* ── Content Section ── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 mt-20">
        <div className="grid md:grid-cols-3 gap-12">
          
          <div className="md:col-span-2 space-y-16">
            {/* Why Study Here */}
            <div>
              <div className="flex items-center gap-3 mb-8">
                <span className="w-10 h-10 rounded-xl bg-[#c9a84c]/20 flex items-center justify-center text-[#c9a84c]">
                  <GraduationCap size={20} />
                </span>
                <h2 className="text-3xl font-bold text-[#1a2f5e]" style={{ fontFamily: "var(--font-playfair)" }}>
                  Why Study in {country.name}?
                </h2>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                {country.whyStudy.map((reason: string, i: number) => (
                  <div key={i} className="bg-white rounded-2xl p-5 border border-gray-100 flex items-start gap-3 shadow-sm hover:shadow-md transition-shadow">
                    <CheckCircle2 size={18} className="text-[#c9a84c] shrink-0 mt-0.5" />
                    <p className="text-gray-700 text-sm leading-relaxed">{reason}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Universities */}
            <div>
              <div className="flex items-center gap-3 mb-8">
                <span className="w-10 h-10 rounded-xl bg-[#c9a84c]/20 flex items-center justify-center text-[#c9a84c]">
                  <Building2 size={20} />
                </span>
                <h2 className="text-3xl font-bold text-[#1a2f5e]" style={{ fontFamily: "var(--font-playfair)" }}>
                  Top Universities
                </h2>
              </div>
              <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">
                <ul className="space-y-4">
                  {country.topUnis.map((uni: string, i: number) => (
                    <li key={i} className="flex items-center gap-3 text-gray-700 font-medium pb-4 border-b border-gray-50 last:border-0 last:pb-0">
                      <div className="w-8 h-8 rounded-full bg-[#1a2f5e]/5 text-[#1a2f5e] flex items-center justify-center text-xs font-bold">
                        {i + 1}
                      </div>
                      {uni}
                    </li>
                  ))}
                </ul>
                <div className="mt-6 pt-6 border-t border-gray-100 text-center">
                  <Link href="/universities">
                    <Button variant="outline" className="rounded-full font-bold text-[#1a2f5e] border-gray-200 hover:border-[#1a2f5e]">
                      View All Universities in {country.name}
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar CTA */}
          <div className="md:col-span-1">
            <div className="sticky top-24 bg-[#1a2f5e] rounded-3xl p-8 text-center text-white shadow-xl shadow-[#1a2f5e]/10">
              <div className="w-16 h-16 bg-[#c9a84c]/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <MapPin size={28} className="text-[#c9a84c]" />
              </div>
              <h3 className="text-2xl font-bold mb-3" style={{ fontFamily: "var(--font-playfair)" }}>
                Start Your Journey
              </h3>
              <p className="text-white/70 text-sm leading-relaxed mb-8">
                Our counselors are experts in {country.name} admissions and visa processes. 
                Get a free profile evaluation today.
              </p>
              <Link href="/contact" className="block w-full">
                <Button className="w-full bg-[#c9a84c] hover:bg-[#a07a2e] text-white h-12 rounded-xl font-bold transition-all hover:scale-[1.02]">
                  Book Free Consultation
                </Button>
              </Link>
              <p className="text-white/40 text-xs mt-4">No commitment required. 100% Free.</p>
            </div>
          </div>

        </div>
      </section>
    </div>
  );
}
