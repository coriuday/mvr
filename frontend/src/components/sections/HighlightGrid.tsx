"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, BookOpen, Building2, GraduationCap, Star } from "lucide-react";

const GRID_ITEMS = [
  {
    id: "courses",
    icon: BookOpen,
    color: "from-blue-500 to-indigo-600",
    badge: "2,500+ Programs",
    title: "Explore Courses",
    desc: "Find the perfect program across engineering, medicine, business, arts, and more.",
    href: "/courses",
    highlights: ["Undergraduate", "Postgraduate", "PhD / Research"],
  },
  {
    id: "universities",
    icon: Building2,
    color: "from-[#1a2f5e] to-[#2a4a8e]",
    badge: "100+ Partners",
    title: "Top Universities",
    desc: "Explore QS World Ranked universities and find the best fit for your profile.",
    href: "/universities",
    highlights: ["USA", "UK", "Canada", "Australia"],
  },
  {
    id: "scholarships",
    icon: GraduationCap,
    color: "from-amber-500 to-orange-600",
    badge: "$50M+ Awarded",
    title: "Scholarships",
    desc: "Government, university and private scholarships to fund your education abroad.",
    href: "/scholarships",
    highlights: ["Merit Based", "Need Based", "Country Specific"],
  },
  {
    id: "testimonials",
    icon: Star,
    color: "from-emerald-500 to-teal-600",
    badge: "4.9★ Google",
    title: "Success Stories",
    desc: "See what our students say — 50,000+ dreams realized with MVR Consultants.",
    href: "/testimonials",
    highlights: ["Harvard", "Oxford", "Toronto", "Melbourne"],
  },
];

export default function HighlightGrid() {
  return (
    <section className="py-20 bg-[#f8f9fc]" id="highlights">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <motion.div className="text-center mb-12" initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
          <p className="text-[#c9a84c] text-sm font-semibold uppercase tracking-widest mb-3">Explore Everything</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-[#1a2f5e] mb-4" style={{ fontFamily: "var(--font-playfair)" }}>
            Your Complete Study Abroad Hub
          </h2>
          <div className="section-divider" />
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {GRID_ITEMS.map((item, i) => (
            <motion.div key={item.id} initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              transition={{ duration: 0.45, delay: i * 0.09 }}>
              <Link href={item.href}>
                <div className="group bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 h-full flex flex-col">
                  {/* Gradient header */}
                  <div className={`bg-gradient-to-br ${item.color} p-6 text-white`}>
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-11 h-11 bg-white/20 rounded-xl flex items-center justify-center">
                        <item.icon size={22} />
                      </div>
                      <span className="text-xs bg-white/20 rounded-full px-3 py-1 font-semibold">
                        {item.badge}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold mb-1" style={{ fontFamily: "var(--font-playfair)" }}>
                      {item.title}
                    </h3>
                  </div>

                  {/* Body */}
                  <div className="p-5 flex-1 flex flex-col">
                    <p className="text-gray-500 text-sm leading-relaxed mb-4">{item.desc}</p>
                    <div className="flex flex-wrap gap-1.5 mb-5">
                      {item.highlights.map((h) => (
                        <span key={h} className="text-xs bg-gray-100 text-gray-600 rounded-full px-2.5 py-0.5 font-medium">
                          {h}
                        </span>
                      ))}
                    </div>
                    <div className="mt-auto flex items-center gap-1.5 text-[#1a2f5e] text-sm font-bold group-hover:text-[#c9a84c] transition-colors">
                      View All
                      <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform duration-200" />
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
