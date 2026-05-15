"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Search, BookOpen, Globe, FileCheck, ArrowRight } from "lucide-react";

const QUICK_LINKS = [
  {
    icon: Search,
    label: "Search Universities",
    desc: "Find top universities by country & course",
    href: "/universities",
    color: "bg-blue-50 text-blue-600",
  },
  {
    icon: BookOpen,
    label: "Explore Courses",
    desc: "Browse thousands of programs worldwide",
    href: "/courses",
    color: "bg-purple-50 text-purple-600",
  },
  {
    icon: Globe,
    label: "Study Destinations",
    desc: "Explore 25+ study abroad countries",
    href: "/countries",
    color: "bg-emerald-50 text-emerald-600",
  },
  {
    icon: FileCheck,
    label: "Check Eligibility",
    desc: "See if you qualify for top programs",
    href: "/eligibility",
    color: "bg-amber-50 text-amber-600",
  },
];

export default function QuickActionBar() {
  return (
    <section className="py-10 bg-white" id="quick-actions">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <h2 className="text-2xl font-bold text-[#1a2f5e]" style={{ fontFamily: "var(--font-playfair)" }}>
            What are you looking for?
          </h2>
          <p className="text-gray-500 text-sm mt-1">
            Quick access to the most popular services
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {QUICK_LINKS.map((item, i) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
            >
              <Link href={item.href}>
                <div className="group flex items-center gap-4 p-5 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-[#c9a84c]/40 transition-all duration-200 card-hover cursor-pointer">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${item.color} group-hover:scale-110 transition-transform duration-200`}
                  >
                    <item.icon size={22} />
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-[#1a2f5e] text-sm leading-tight group-hover:text-[#c9a84c] transition-colors">
                      {item.label}
                    </p>
                    <p className="text-gray-500 text-xs mt-0.5 leading-snug truncate">
                      {item.desc}
                    </p>
                  </div>
                  <ArrowRight
                    size={15}
                    className="ml-auto text-gray-300 group-hover:text-[#c9a84c] group-hover:translate-x-1 transition-all duration-150 shrink-0"
                  />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
