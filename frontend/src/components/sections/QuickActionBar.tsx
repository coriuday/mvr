"use client";

import { motion } from "framer-motion";
import Link from "next/link";

const QUICK_LINKS = [
  {
    icon: (
      <svg viewBox="0 0 48 48" fill="none" stroke="#c9a84c" strokeWidth="1.5" className="w-12 h-12">
        <rect x="6" y="10" width="36" height="32" rx="3"/>
        <path d="M14 10V6M34 10V6M6 20h36"/>
        <rect x="13" y="26" width="6" height="6" rx="1"/>
        <rect x="21" y="26" width="6" height="6" rx="1"/>
        <rect x="29" y="26" width="6" height="6" rx="1"/>
      </svg>
    ),
    label: "Search Universities",
    desc: "Find the best university",
    href: "/universities",
  },
  {
    icon: (
      <svg viewBox="0 0 48 48" fill="none" stroke="#c9a84c" strokeWidth="1.5" className="w-12 h-12">
        <path d="M24 6L6 16l18 10 18-10L24 6z"/>
        <path d="M6 28l18 10 18-10"/>
        <path d="M6 22l18 10 18-10"/>
      </svg>
    ),
    label: "Search Courses",
    desc: "Explore 5000+ courses",
    href: "/courses",
  },
  {
    icon: (
      <svg viewBox="0 0 48 48" fill="none" stroke="#c9a84c" strokeWidth="1.5" className="w-12 h-12">
        <circle cx="24" cy="24" r="18"/>
        <path d="M6 24h36M24 6c-5 6-8 12-8 18s3 12 8 18M24 6c5 6 8 12 8 18s-3 12-8 18"/>
        <path d="M10 14h28M10 34h28"/>
      </svg>
    ),
    label: "Search Countries",
    desc: "Choose your destination",
    href: "/countries",
  },
  {
    icon: (
      <svg viewBox="0 0 48 48" fill="none" stroke="#c9a84c" strokeWidth="1.5" className="w-12 h-12">
        <rect x="8" y="6" width="32" height="36" rx="3"/>
        <path d="M16 18h16M16 24h16M16 30h10"/>
        <circle cx="36" cy="36" r="8" fill="#c9a84c" stroke="#c9a84c"/>
        <path d="M33 36l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    label: "Eligibility Check",
    desc: "Check your eligibility",
    href: "/eligibility",
  },
];

export default function QuickActionBar() {
  return (
    <section className="bg-white shadow-md relative z-10" id="quick-actions">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 lg:divide-x divide-gray-100">
          {QUICK_LINKS.map((item, i) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.07 }}
            >
              <Link href={item.href}>
                <div className="group flex items-center gap-5 px-8 py-7 hover:bg-[#fef9f0] transition-colors duration-200 cursor-pointer">
                  <div className="shrink-0 group-hover:scale-105 transition-transform duration-200">
                    {item.icon}
                  </div>
                  <div>
                    <p className="font-bold text-[#1a2f5e] text-sm group-hover:text-[#c9a84c] transition-colors duration-200">
                      {item.label}
                    </p>
                    <p className="text-gray-400 text-xs mt-0.5">{item.desc}</p>
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
