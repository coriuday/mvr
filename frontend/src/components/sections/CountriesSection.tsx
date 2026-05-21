"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

const COUNTRIES = [
  {
    id: "usa",
    name: "USA",
    href: "/countries/usa",
    monument: (
      <svg viewBox="0 0 100 130" fill="none" className="w-20 h-24 mx-auto">
        {/* Statue of Liberty */}
        <rect x="38" y="95" width="24" height="30" fill="#c9a84c"/>
        <rect x="34" y="80" width="32" height="20" fill="#c9a84c"/>
        <polygon points="50,30 40,80 60,80" fill="#c9a84c"/>
        <rect x="46" y="10" width="8" height="25" fill="#c9a84c"/>
        <circle cx="50" cy="8" r="8" fill="#c9a84c" stroke="#a07a2e" strokeWidth="1"/>
        <path d="M 43 8 L 40 0 L 46 5 L 50 -2 L 54 5 L 60 0 L 57 8" fill="#a07a2e"/>
        <rect x="60" y="28" width="3" height="18" fill="#c9a84c"/>
        <ellipse cx="61.5" cy="26" rx="4" ry="5" fill="#e4c97a"/>
      </svg>
    ),
  },
  {
    id: "uk",
    name: "UK",
    href: "/countries/uk",
    monument: (
      <svg viewBox="0 0 100 130" fill="none" className="w-20 h-24 mx-auto">
        {/* Big Ben */}
        <rect x="30" y="85" width="40" height="40" fill="#c9a84c"/>
        <rect x="28" y="70" width="44" height="20" fill="#a07a2e"/>
        <rect x="32" y="35" width="36" height="40" fill="#c9a84c"/>
        <rect x="34" y="15" width="32" height="25" fill="#a07a2e"/>
        <polygon points="50,0 34,15 66,15" fill="#8b6529"/>
        <circle cx="50" cy="57" r="11" fill="#fef9f0" stroke="#a07a2e" strokeWidth="2"/>
        <line x1="50" y1="46" x2="50" y2="57" stroke="#a07a2e" strokeWidth="2"/>
        <line x1="50" y1="57" x2="58" y2="57" stroke="#a07a2e" strokeWidth="2"/>
      </svg>
    ),
  },
  {
    id: "canada",
    name: "CANADA",
    href: "/countries/canada",
    monument: (
      <svg viewBox="0 0 100 130" fill="none" className="w-20 h-24 mx-auto">
        {/* CN Tower */}
        <polygon points="50,5 44,100 56,100" fill="#c9a84c"/>
        <rect x="36" y="95" width="28" height="30" fill="#a07a2e"/>
        <ellipse cx="50" cy="70" rx="16" ry="10" fill="#c9a84c"/>
        <ellipse cx="50" cy="65" rx="12" ry="7" fill="#e4c97a"/>
        <rect x="47" y="5" width="6" height="30" fill="#e4c97a"/>
      </svg>
    ),
  },
  {
    id: "australia",
    name: "AUSTRALIA",
    href: "/countries/australia",
    highlight: true,
    monument: (
      <svg viewBox="0 0 120 130" fill="none" className="w-24 h-28 mx-auto">
        {/* Sydney Opera House - highlighted/larger */}
        <path d="M 10 110 Q 40 40 80 110" fill="#c9a84c"/>
        <path d="M 45 110 Q 80 25 125 110" fill="#e4c97a"/>
        <path d="M 75 110 Q 100 55 140 110" fill="#c9a84c" opacity="0.7"/>
        <rect x="10" y="107" width="130" height="6" fill="#a07a2e"/>
        <rect x="5" y="113" width="140" height="12" fill="#8b6529"/>
      </svg>
    ),
  },
  {
    id: "germany",
    name: "GERMANY",
    href: "/countries/germany",
    monument: (
      <svg viewBox="0 0 100 130" fill="none" className="w-20 h-24 mx-auto">
        {/* Brandenburg Gate */}
        <rect x="10" y="80" width="80" height="45" fill="none"/>
        {/* Columns */}
        {[12, 25, 38, 51, 64, 77].map((x, i) => (
          <rect key={i} x={x} y="65" width="8" height="55" fill="#c9a84c"/>
        ))}
        {/* Top beam */}
        <rect x="8" y="55" width="84" height="14" fill="#a07a2e"/>
        {/* Gate top */}
        <rect x="20" y="35" width="60" height="22" fill="#c9a84c"/>
        {/* Quadriga base */}
        <rect x="28" y="20" width="44" height="17" fill="#a07a2e"/>
        {/* Horse/chariot simplified */}
        <path d="M 35 10 Q 50 0 65 10 L 65 20 L 35 20 Z" fill="#c9a84c"/>
        {/* Passages */}
        <rect x="23" y="75" width="14" height="30" fill="#fef9f0"/>
        <rect x="63" y="75" width="14" height="30" fill="#fef9f0"/>
        <rect x="40" y="68" width="20" height="37" fill="#fef9f0"/>
      </svg>
    ),
  },
  {
    id: "ireland",
    name: "IRELAND",
    href: "/countries/ireland",
    monument: (
      <svg viewBox="0 0 100 130" fill="none" className="w-20 h-24 mx-auto">
        {/* Cliffs / castle */}
        <rect x="20" y="60" width="60" height="65" fill="#c9a84c"/>
        <rect x="15" y="50" width="70" height="14" fill="#a07a2e"/>
        {/* Battlements */}
        {[15, 25, 35, 45, 55, 65, 75].map((x, i) => (
          <rect key={i} x={x} y="38" width="8" height="14" fill="#c9a84c"/>
        ))}
        {/* Tower */}
        <rect x="35" y="20" width="30" height="42" fill="#e4c97a"/>
        <polygon points="50,5 35,20 65,20" fill="#a07a2e"/>
        {/* Door arch */}
        <path d="M 43 125 L 43 100 Q 50 90 57 100 L 57 125" fill="#fef9f0"/>
        {/* Window */}
        <path d="M 44 60 L 44 48 Q 50 42 56 48 L 56 60" fill="#fef9f0"/>
      </svg>
    ),
  },
  {
    id: "more",
    name: "MORE\nCOUNTRIES",
    href: "/countries",
    monument: (
      <svg viewBox="0 0 100 100" fill="none" className="w-16 h-16 mx-auto">
        <circle cx="50" cy="50" r="42" stroke="#c9a84c" strokeWidth="2"/>
        <path d="M8 50h84M50 8c-10 14-16 27-16 42s6 28 16 42M50 8c10 14 16 27 16 42S60 78 50 92" stroke="#c9a84c" strokeWidth="1.5"/>
        <path d="M18 26h64M18 74h64" stroke="#c9a84c" strokeWidth="1.5"/>
      </svg>
    ),
  },
];

export default function CountriesSection() {
  return (
    <section className="py-16 bg-white" id="study-abroad">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Heading */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55 }}
        >
          <h2
            className="text-2xl font-bold text-[#1a2f5e] mb-3 tracking-widest uppercase"
            style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
          >
            Popular Destinations
          </h2>
          <div className="w-16 h-0.5 bg-[#c9a84c] mx-auto" />
        </motion.div>

        {/* Country cards grid */}
        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {COUNTRIES.map((country, i) => (
            <motion.div
              key={country.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.07 }}
            >
              <Link href={country.href}>
                <div
                  className={`group flex flex-col items-center py-5 px-2 rounded-lg border transition-all duration-300 hover:shadow-lg hover:-translate-y-1 cursor-pointer text-center ${
                    country.highlight
                      ? "border-[#c9a84c] bg-[#fef9f0] shadow-sm"
                      : "border-gray-200 bg-white hover:border-[#c9a84c]/50"
                  }`}
                >
                  <div className="mb-3 group-hover:scale-105 transition-transform duration-200">
                    {country.monument}
                  </div>
                  <p
                    className={`text-xs font-bold tracking-wide ${
                      country.highlight ? "text-[#c9a84c]" : "text-[#1a2f5e]"
                    } whitespace-pre-line leading-tight`}
                  >
                    {country.name}
                  </p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* View all */}
        <motion.div
          className="text-center mt-8"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
        >
          <Link
            href="/countries"
            className="inline-flex items-center gap-2 text-[#1a2f5e] hover:text-[#c9a84c] font-semibold text-sm transition-colors duration-200"
          >
            View All Countries
            <ArrowRight size={15} />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
