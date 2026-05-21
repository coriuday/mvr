"use client";

import { motion } from "framer-motion";
import Link from "next/link";

const SERVICES = [
  {
    id: "career",
    label: "Career\nCounselling",
    href: "/services/career",
    icon: (
      <svg viewBox="0 0 52 52" fill="none" className="w-10 h-10 mx-auto">
        <circle cx="20" cy="16" r="8" stroke="#1a2f5e" strokeWidth="1.5"/>
        <path d="M4 44c0-8.837 7.163-16 16-16" stroke="#1a2f5e" strokeWidth="1.5" strokeLinecap="round"/>
        <circle cx="36" cy="36" r="12" stroke="#1a2f5e" strokeWidth="1.5"/>
        <path d="M32 36l3 3 5-5" stroke="#c9a84c" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M36 30v-4M36 42v4M30 36h-4M42 36h4" stroke="#c9a84c" strokeWidth="1" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    id: "university",
    label: "University\nSelection",
    href: "/services/university",
    icon: (
      <svg viewBox="0 0 52 52" fill="none" className="w-10 h-10 mx-auto">
        <rect x="6" y="24" width="40" height="22" rx="2" stroke="#1a2f5e" strokeWidth="1.5"/>
        <path d="M26 8L4 20h44L26 8z" stroke="#1a2f5e" strokeWidth="1.5" strokeLinejoin="round"/>
        <rect x="20" y="32" width="12" height="14" rx="1" stroke="#1a2f5e" strokeWidth="1.5"/>
        <rect x="10" y="28" width="8" height="8" rx="1" fill="#c9a84c" opacity="0.5"/>
        <rect x="34" y="28" width="8" height="8" rx="1" fill="#c9a84c" opacity="0.5"/>
        <line x1="26" y1="8" x2="26" y2="6" stroke="#1a2f5e" strokeWidth="1.5"/>
        <circle cx="26" cy="5" r="2" fill="#c9a84c"/>
      </svg>
    ),
  },
  {
    id: "application",
    label: "Application\nSupport",
    href: "/services/application",
    icon: (
      <svg viewBox="0 0 52 52" fill="none" className="w-10 h-10 mx-auto">
        <rect x="10" y="6" width="32" height="40" rx="3" stroke="#1a2f5e" strokeWidth="1.5"/>
        <path d="M18 18h16M18 24h16M18 30h10" stroke="#1a2f5e" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M30 36l4 4 8-8" stroke="#c9a84c" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    id: "scholarship",
    label: "Scholarship\nAssistance",
    href: "/services/scholarship",
    icon: (
      <svg viewBox="0 0 52 52" fill="none" className="w-10 h-10 mx-auto">
        <path d="M26 6L6 18l20 10 20-10L26 6z" stroke="#1a2f5e" strokeWidth="1.5" strokeLinejoin="round"/>
        <path d="M14 24v10c0 4 5.373 8 12 8s12-4 12-8V24" stroke="#1a2f5e" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M46 18v12" stroke="#c9a84c" strokeWidth="1.5" strokeLinecap="round"/>
        <circle cx="46" cy="32" r="3" fill="#c9a84c"/>
      </svg>
    ),
  },
  {
    id: "visa",
    label: "Visa\nAssistance",
    href: "/services/visa",
    icon: (
      <svg viewBox="0 0 52 52" fill="none" className="w-10 h-10 mx-auto">
        <rect x="6" y="12" width="40" height="28" rx="4" stroke="#1a2f5e" strokeWidth="1.5"/>
        <circle cx="20" cy="26" r="5" stroke="#1a2f5e" strokeWidth="1.5"/>
        <path d="M30 22h10M30 26h10M30 30h6" stroke="#c9a84c" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M12 18h6" stroke="#1a2f5e" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    id: "loan",
    label: "Education\nLoan",
    href: "/services/loan",
    icon: (
      <svg viewBox="0 0 52 52" fill="none" className="w-10 h-10 mx-auto">
        <circle cx="26" cy="26" r="20" stroke="#1a2f5e" strokeWidth="1.5"/>
        <path d="M26 14v2M26 36v2M18 18l1.5 1.5M34.5 32.5l1.5 1.5M14 26h2M36 26h2M18 34l1.5-1.5M34.5 19.5l1.5-1.5" stroke="#c9a84c" strokeWidth="1" strokeLinecap="round"/>
        <text x="21" y="30" fontSize="12" fontWeight="bold" fill="#1a2f5e">$</text>
      </svg>
    ),
  },
  {
    id: "predeparture",
    label: "Pre-Departure\nSupport",
    href: "/services/pre-departure",
    icon: (
      <svg viewBox="0 0 52 52" fill="none" className="w-10 h-10 mx-auto">
        <path d="M8 36l26-20 4 8-22 16H8v-4z" stroke="#1a2f5e" strokeWidth="1.5" strokeLinejoin="round"/>
        <path d="M34 16l6-4 6 6-4 6" stroke="#1a2f5e" strokeWidth="1.5" strokeLinejoin="round"/>
        <path d="M14 40l-4 6" stroke="#1a2f5e" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M28 14l-4-6" stroke="#c9a84c" strokeWidth="1.5" strokeLinecap="round"/>
        <circle cx="40" cy="12" r="8" stroke="#c9a84c" strokeWidth="1.5"/>
        <path d="M37 12l2 2 4-4" stroke="#c9a84c" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    id: "accommodation",
    label: "Accommodation\nAssistance",
    href: "/services/accommodation",
    icon: (
      <svg viewBox="0 0 52 52" fill="none" className="w-10 h-10 mx-auto">
        <path d="M6 26L26 8l20 18" stroke="#1a2f5e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <rect x="12" y="26" width="28" height="18" rx="1" stroke="#1a2f5e" strokeWidth="1.5"/>
        <rect x="22" y="34" width="8" height="10" rx="1" stroke="#1a2f5e" strokeWidth="1.5"/>
        <rect x="14" y="29" width="7" height="7" rx="1" fill="#c9a84c" opacity="0.5"/>
        <rect x="31" y="29" width="7" height="7" rx="1" fill="#c9a84c" opacity="0.5"/>
      </svg>
    ),
  },
];

export default function ServicesSection() {
  return (
    <section className="py-14 bg-[#f8f9fc]" id="services">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Heading */}
        <motion.div
          className="text-center mb-10"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2
            className="text-2xl font-bold text-[#1a2f5e] tracking-widest uppercase mb-3"
            style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
          >
            Our Services
          </h2>
          <div className="w-16 h-0.5 bg-[#c9a84c] mx-auto" />
        </motion.div>

        {/* 8 services in a row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
          {SERVICES.map((service, i) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.06 }}
            >
              <Link href={service.href}>
                <div className="group flex flex-col items-center py-6 px-2 bg-white rounded-lg border border-gray-100 hover:border-[#c9a84c]/50 hover:shadow-md transition-all duration-200 cursor-pointer text-center h-full">
                  <div className="mb-3 group-hover:scale-105 transition-transform duration-200">
                    {service.icon}
                  </div>
                  <p className="text-[#1a2f5e] text-xs font-semibold leading-tight whitespace-pre-line group-hover:text-[#c9a84c] transition-colors duration-200">
                    {service.label}
                  </p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
