"use client";

import { useState } from "react";
import { motion, type Variants } from "framer-motion";
import Link from "next/link";
import { Globe, ArrowRight, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import type { CountryCard } from "./page";
import { resolveHeroImage } from "@/lib/country-images";
import { CountryFlag } from "@/components/ui/CountryFlag";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" as const } },
};

// ---------------------------------------------------------------------------
// Props — cards come from the SSR page (DB or static fallback)
// ---------------------------------------------------------------------------
interface Props {
  cards: CountryCard[];
}

export default function CountriesPageClient({ cards }: Props) {
  const [search, setSearch] = useState("");

  const filtered = cards.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.tagline.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* ── Hero Section ── */}
      <section className="relative bg-[#1a2f5e] pt-28 pb-24 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-[#c9a84c]/5 -translate-y-1/2 translate-x-1/3" />
          <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full bg-white/[0.03] translate-y-1/2 -translate-x-1/3" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span className="inline-flex items-center gap-2 bg-[#c9a84c]/20 text-[#c9a84c] text-xs font-semibold uppercase tracking-wider px-4 py-2 rounded-full mb-6">
              <Globe size={14} /> {cards.length} Global Destinations
            </span>
            <h1
              className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6"
              style={{ fontFamily: "var(--font-playfair)" }}
            >
              Where Will Your{" "}
              <span className="text-[#c9a84c]">Ambition</span> Take You?
            </h1>
            <p className="text-white/70 text-lg max-w-2xl mx-auto leading-relaxed mb-10">
              Explore the world&apos;s most sought-after study destinations. From Ivy League prestige to
              European innovation — find the perfect country for your career.
            </p>

            {/* Search */}
            <div className="max-w-md mx-auto relative">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
              <input
                type="text"
                id="country-search"
                placeholder="Search countries..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-white/10 border border-white/20 text-white placeholder:text-white/40 rounded-full py-3 pl-11 pr-5 text-sm focus:outline-none focus:border-[#c9a84c]/50 transition-colors"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Destinations Grid ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 -mt-10 relative z-10">
        {filtered.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <Globe size={40} className="mx-auto mb-4 opacity-30" />
            <p className="text-lg font-semibold">No countries match your search.</p>
          </div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            {filtered.map((country) => {
              const imgSrc = resolveHeroImage(country.slug, country.image_url);

              return (
                <motion.div key={country.slug} variants={itemVariants} className="group">
                  <Link href={`/countries/${country.slug}`}>
                    <div className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-col h-full">
                      {/* Image */}
                      <div className="relative h-48 overflow-hidden">
                        <Image
                          src={imgSrc}
                          alt={`Study in ${country.name}`}
                          fill
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                          className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#1a2f5e]/90 via-[#1a2f5e]/20 to-transparent" />
                        <div className="absolute bottom-4 left-4 right-4">
                          <p className="text-[#c9a84c] text-[10px] font-bold uppercase tracking-widest mb-0.5">
                            {country.tagline}
                          </p>
                          <div className="flex items-center gap-2">
                            <CountryFlag slug={country.slug} size="md" className="rounded-sm" />
                            <h3
                              className="text-white text-lg font-bold"
                              style={{ fontFamily: "var(--font-playfair)" }}
                            >
                              {country.name}
                            </h3>
                          </div>
                        </div>
                      </div>

                      {/* Footer */}
                      <div className="p-4 flex items-center justify-between mt-auto">
                        <span className="text-gray-400 text-xs font-medium">
                          Explore programs →
                        </span>
                        <span className="w-8 h-8 bg-[#1a2f5e]/5 rounded-full flex items-center justify-center group-hover:bg-[#c9a84c] transition-colors">
                          <ArrowRight size={14} className="text-[#1a2f5e] group-hover:text-white transition-colors" />
                        </span>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </section>

      {/* ── CTA Banner ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 mt-20">
        <div className="bg-[#1a2f5e] rounded-3xl p-8 md:p-12 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="absolute right-0 top-0 w-64 h-full bg-[#c9a84c]/10 skew-x-12 translate-x-20" />
          <div className="relative z-10 max-w-2xl text-center md:text-left">
            <h2
              className="text-3xl font-bold text-white mb-4"
              style={{ fontFamily: "var(--font-playfair)" }}
            >
              Can&apos;t Decide Where to Go?
            </h2>
            <p className="text-white/70 text-sm md:text-base leading-relaxed">
              Our expert counselors evaluate your profile, budget, and career goals to recommend the
              best country and university for you. Personalized roadmaps to success.
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
