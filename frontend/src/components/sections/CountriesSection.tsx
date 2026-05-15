"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { POPULAR_COUNTRIES } from "@/constants/countries";

const LANDMARKS: Record<string, string> = {
  usa: "🗽",
  uk: "🏰",
  canada: "🍁",
  australia: "🦘",
  germany: "🏛️",
  ireland: "🍀",
};

export default function CountriesSection() {
  return (
    <section className="py-20 bg-[#f8f9fc]" id="study-abroad">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Heading */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55 }}
        >
          <p className="text-[#c9a84c] text-sm font-semibold uppercase tracking-widest mb-3">
            Top Study Destinations
          </p>
          <h2
            className="text-3xl sm:text-4xl font-bold text-[#1a2f5e] mb-4"
            style={{ fontFamily: "var(--font-playfair)" }}
          >
            Where Do You Want to Study?
          </h2>
          <div className="section-divider" />
          <p className="text-gray-500 max-w-xl mx-auto text-sm mt-4">
            Choose from top countries with world-class universities, affordable
            tuition, and excellent post-study opportunities.
          </p>
        </motion.div>

        {/* Country cards grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {POPULAR_COUNTRIES.map((country, i) => (
            <motion.div
              key={country.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: i * 0.09 }}
            >
              <Link href={country.href}>
                <div className="group relative bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer h-full">
                  {/* Top colored bar */}
                  <div className="h-1.5 bg-gradient-to-r from-[#1a2f5e] via-[#2a4a8e] to-[#c9a84c]" />

                  <div className="p-7">
                    {/* Flag + landmark emoji */}
                    <div className="flex items-center justify-between mb-5">
                      <div className="flex items-center gap-3">
                        <span className="text-4xl">{country.flag}</span>
                        <div>
                          <h3 className="text-xl font-bold text-[#1a2f5e] group-hover:text-[#c9a84c] transition-colors duration-200">
                            {country.name}
                          </h3>
                          <p className="text-xs text-gray-400 font-medium">
                            {country.landmark}
                          </p>
                        </div>
                      </div>
                      <span className="text-3xl opacity-70">
                        {LANDMARKS[country.id]}
                      </span>
                    </div>

                    <p className="text-gray-500 text-sm leading-relaxed mb-5">
                      {country.description}
                    </p>

                    {/* Explore link */}
                    <div className="flex items-center gap-2 text-[#1a2f5e] text-sm font-bold group-hover:text-[#c9a84c] transition-colors duration-200">
                      Explore Universities
                      <ArrowRight
                        size={15}
                        className="group-hover:translate-x-1 transition-transform duration-200"
                      />
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* View all */}
        <motion.div
          className="text-center mt-10"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
        >
          <Link
            href="/countries"
            className="inline-flex items-center gap-2 text-[#1a2f5e] font-semibold border-2 border-[#1a2f5e] rounded-full px-7 py-3 hover:bg-[#1a2f5e] hover:text-white transition-all duration-200 text-sm"
          >
            View All Countries
            <ArrowRight size={16} />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
