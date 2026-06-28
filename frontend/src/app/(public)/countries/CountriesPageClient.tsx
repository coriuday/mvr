"use client";

import { useState } from "react";
import { motion, type Variants } from "framer-motion";
import Link from "next/link";
import { Globe, ArrowRight, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import type { CountryCard } from "./page";

// ---------------------------------------------------------------------------
// Fallback Unsplash thumbnail per slug.
// Used when the DB row has no image_url set yet (before seeding/admin upload).
// ---------------------------------------------------------------------------
const FALLBACK_IMAGES: Record<string, string> = {
  usa:          "https://images.unsplash.com/photo-1485738422979-f5c462d49f74?auto=format&fit=crop&w=800&q=80",
  uk:           "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=800&q=80",
  canada:       "https://images.unsplash.com/photo-1503614472-8c93d56e92ce?auto=format&fit=crop&w=800&q=80",
  australia:    "https://images.unsplash.com/photo-1523482580672-f109ba8cb9be?auto=format&fit=crop&w=800&q=80",
  germany:      "https://images.unsplash.com/photo-1467269204594-9661b134dd2b?auto=format&fit=crop&w=800&q=80",
  ireland:      "https://images.unsplash.com/photo-1590089415225-401ed6f9db8e?auto=format&fit=crop&w=800&q=80",
  france:       "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=800&q=80",
  netherlands:  "https://images.unsplash.com/photo-1512470876302-972faa2aa9a4?auto=format&fit=crop&w=800&q=80",
  sweden:       "https://images.unsplash.com/photo-1509356843151-3e7d96241e11?auto=format&fit=crop&w=800&q=80",
  "new-zealand":"https://images.unsplash.com/photo-1507699622108-4be3abd695ad?auto=format&fit=crop&w=800&q=80",
  singapore:    "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?auto=format&fit=crop&w=800&q=80",
  switzerland:  "https://images.unsplash.com/photo-1527668752968-14dc70a27c95?auto=format&fit=crop&w=800&q=80",
  dubai:        "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=800&q=80",
  finland:      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=800&q=80",
  denmark:      "https://images.unsplash.com/photo-1513622470522-26c3c8a854bc?auto=format&fit=crop&w=800&q=80",
  austria:      "https://images.unsplash.com/photo-1516550893923-42d28e5677af?auto=format&fit=crop&w=800&q=80",
  belgium:      "https://images.unsplash.com/photo-1491557345352-5929e343eb89?auto=format&fit=crop&w=800&q=80",
  hungary:      "https://images.unsplash.com/photo-1551867633-194f125bddfa?auto=format&fit=crop&w=800&q=80",
  malaysia:     "https://images.unsplash.com/photo-1596422846543-75c6fc197f07?auto=format&fit=crop&w=800&q=80",
  italy:        "https://images.unsplash.com/photo-1515542622106-78bda8ba0e5b?auto=format&fit=crop&w=800&q=80",
  spain:        "https://images.unsplash.com/photo-1543783207-ec64e4d95325?auto=format&fit=crop&w=800&q=80",
  japan:        "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=800&q=80",
  cyprus:       "https://images.unsplash.com/photo-1541976590-713941681591?auto=format&fit=crop&w=800&q=80",
  lithuania:    "https://images.unsplash.com/photo-1559827260-dc66d52bef19?auto=format&fit=crop&w=800&q=80",
  georgia:      "https://images.unsplash.com/photo-1565008576549-57569a49371d?auto=format&fit=crop&w=800&q=80",
  russia:       "https://images.unsplash.com/photo-1513326738677-b964603b136d?auto=format&fit=crop&w=800&q=80",
};

const DEFAULT_IMAGE =
  "https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=800&q=80";

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
              // Use DB image_url if set, otherwise fall back to Unsplash map
              const imgSrc =
                country.image_url ||
                FALLBACK_IMAGES[country.slug] ||
                DEFAULT_IMAGE;

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
                            <span className="text-xl">{country.flag}</span>
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
