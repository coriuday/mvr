"use client";

import { motion, type Variants } from "framer-motion";
import Link from "next/link";
import { Globe, GraduationCap, Building2, Briefcase, ArrowRight, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";

const DESTINATIONS = [
  {
    id: "usa",
    name: "United States",
    tagline: "The Hub of Innovation",
    description: "Home to Ivy League institutions and global tech giants. Experience unparalleled research opportunities and a vibrant campus life.",
    image: "https://images.unsplash.com/photo-1485738422979-f5c462d49f74?auto=format&fit=crop&w=800&q=80",
    stats: {
      unis: "4,000+",
      workRights: "Up to 3 Years (STEM)",
      intakes: "Fall, Spring",
    },
  },
  {
    id: "uk",
    name: "United Kingdom",
    tagline: "Academic Excellence",
    description: "A legacy of world-class education. Enjoy shorter course durations and a rich cultural history right at Europe's doorstep.",
    image: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=800&q=80",
    stats: {
      unis: "150+",
      workRights: "2 Years (PSW)",
      intakes: "Sep, Jan",
    },
  },
  {
    id: "canada",
    name: "Canada",
    tagline: "Welcoming & Diverse",
    description: "Consistently ranked as one of the best countries for quality of life. High post-graduation PR success rate and friendly communities.",
    image: "https://images.unsplash.com/photo-1503614472-8c93d56e92ce?auto=format&fit=crop&w=800&q=80",
    stats: {
      unis: "100+",
      workRights: "Up to 3 Years",
      intakes: "Sep, Jan, May",
    },
  },
  {
    id: "australia",
    name: "Australia",
    tagline: "Global Opportunities",
    description: "World-class universities, breathtaking landscapes, and a strong economy offering excellent part-time and post-study work options.",
    image: "https://images.unsplash.com/photo-1523482580672-f109ba8cb9be?auto=format&fit=crop&w=800&q=80",
    stats: {
      unis: "40+",
      workRights: "Up to 4 Years",
      intakes: "Feb, July",
    },
  },
  {
    id: "germany",
    name: "Germany",
    tagline: "Engineering & Tech Hub",
    description: "Renowned for technical excellence and public universities with zero to minimal tuition fees. A powerhouse of European industry.",
    image: "https://images.unsplash.com/photo-1467269204594-9661b134dd2b?auto=format&fit=crop&w=800&q=80",
    stats: {
      unis: "300+",
      workRights: "18 Months",
      intakes: "Winter, Summer",
    },
  },
  {
    id: "ireland",
    name: "Ireland",
    tagline: "Europe's Silicon Valley",
    description: "The European headquarters for top IT and Pharma companies. Friendly locals, beautiful scenery, and excellent career prospects.",
    image: "https://images.unsplash.com/photo-1590089415225-401ed6f9db8e?auto=format&fit=crop&w=800&q=80",
    stats: {
      unis: "30+",
      workRights: "Up to 2 Years",
      intakes: "Sep, Jan",
    },
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as const } },
};

export default function CountriesPageClient() {
  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* ── Hero Section ── */}
      <section className="relative bg-[#1a2f5e] pt-28 pb-20 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-[#c9a84c]/5 -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-white/[0.03] translate-y-1/2 -translate-x-1/2" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span className="inline-flex items-center gap-2 bg-[#c9a84c]/20 text-[#c9a84c] text-xs font-semibold uppercase tracking-wider px-4 py-2 rounded-full mb-6">
              <Globe size={14} /> Global Destinations
            </span>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6" style={{ fontFamily: "var(--font-playfair)" }}>
              Where Will Your <span className="text-[#c9a84c]">Ambition</span> Take You?
            </h1>
            <p className="text-white/70 text-lg max-w-2xl mx-auto leading-relaxed">
              Explore the world's most sought-after study destinations. From Ivy League prestige to European 
              innovation, find the perfect country for your academic and career goals.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── Destinations Grid ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 -mt-10 relative z-10">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {DESTINATIONS.map((country) => (
            <motion.div key={country.id} variants={itemVariants} className="group">
              <Link href={`/countries/${country.id}`}>
                <div className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-col h-full">
                  {/* Image Header */}
                  <div className="relative h-56 overflow-hidden">
                    <img 
                      src={country.image} 
                      alt={country.name} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#1a2f5e]/90 via-[#1a2f5e]/20 to-transparent" />
                    <div className="absolute bottom-4 left-6 right-6">
                      <p className="text-[#c9a84c] text-xs font-bold uppercase tracking-wider mb-1">{country.tagline}</p>
                      <h3 className="text-white text-2xl font-bold" style={{ fontFamily: "var(--font-playfair)" }}>
                        {country.name}
                      </h3>
                    </div>
                  </div>

                  {/* Body */}
                  <div className="p-6 flex flex-col flex-grow">
                    <p className="text-gray-600 text-sm leading-relaxed mb-6 flex-grow">
                      {country.description}
                    </p>

                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                        <div className="flex items-center gap-2 text-[#1a2f5e] mb-1">
                          <GraduationCap size={14} />
                          <span className="text-xs font-semibold">Universities</span>
                        </div>
                        <p className="text-gray-700 font-medium text-sm">{country.stats.unis}</p>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                        <div className="flex items-center gap-2 text-[#1a2f5e] mb-1">
                          <Briefcase size={14} />
                          <span className="text-xs font-semibold">Post-Study</span>
                        </div>
                        <p className="text-gray-700 font-medium text-sm">{country.stats.workRights}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500 font-medium bg-gray-100 px-3 py-1 rounded-full text-xs">
                        Intakes: {country.stats.intakes}
                      </span>
                      <span className="text-[#c9a84c] font-bold flex items-center gap-1 group-hover:gap-2 transition-all">
                        Explore <ArrowRight size={14} />
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ── Global Network Banner ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 mt-20">
        <div className="bg-[#1a2f5e] rounded-3xl p-8 md:p-12 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="absolute right-0 top-0 w-64 h-full bg-[#c9a84c]/10 skew-x-12 translate-x-20" />
          
          <div className="relative z-10 max-w-2xl text-center md:text-left">
            <h2 className="text-3xl font-bold text-white mb-4" style={{ fontFamily: "var(--font-playfair)" }}>
              Can't Decide Where to Go?
            </h2>
            <p className="text-white/70 text-sm md:text-base leading-relaxed">
              Our expert counselors will evaluate your profile, budget, and career goals to recommend 
              the best country and university for you. We provide personalized roadmaps for success.
            </p>
          </div>

          <div className="relative z-10 shrink-0">
            <Link href="/contact">
              <Button className="bg-[#c9a84c] hover:bg-[#a07a2e] text-white h-12 px-8 rounded-full font-bold shadow-lg shadow-[#c9a84c]/20 transition-all hover:scale-105">
                Book Free Counseling
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
