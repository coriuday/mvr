"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  Users, Building2, FileText, GraduationCap,
  FileCheck, CreditCard, Plane, Home,
} from "lucide-react";
import { SERVICES } from "@/constants/services";

const ICONS: Record<string, React.ElementType> = {
  Users, Building2, FileText, GraduationCap, FileCheck, CreditCard, Plane, Home,
};

const COLORS = [
  "bg-blue-50 text-blue-600 group-hover:bg-blue-600",
  "bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600",
  "bg-purple-50 text-purple-600 group-hover:bg-purple-600",
  "bg-amber-50 text-amber-600 group-hover:bg-amber-600",
  "bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600",
  "bg-rose-50 text-rose-600 group-hover:bg-rose-600",
  "bg-cyan-50 text-cyan-600 group-hover:bg-cyan-600",
  "bg-violet-50 text-violet-600 group-hover:bg-violet-600",
];

export default function ServicesSection() {
  return (
    <section className="py-20 bg-white" id="services">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <motion.div className="text-center mb-14" initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
          <p className="text-[#c9a84c] text-sm font-semibold uppercase tracking-widest mb-3">What We Offer</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-[#1a2f5e] mb-4" style={{ fontFamily: "var(--font-playfair)" }}>
            Our Comprehensive Services
          </h2>
          <div className="section-divider" />
          <p className="text-gray-500 max-w-xl mx-auto text-sm mt-4">
            End-to-end support from career counseling to post-arrival assistance — we&apos;re with you every step of the way.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {SERVICES.map((service, i) => {
            const Icon = ICONS[service.icon] ?? GraduationCap;
            return (
              <motion.div key={service.id} initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.07 }}>
                <Link href={service.href}>
                  <div className="group bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-xl hover:border-[#c9a84c]/30 transition-all duration-300 hover:-translate-y-1 h-full flex flex-col">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-5 transition-all duration-300 ${COLORS[i % COLORS.length]} group-hover:text-white`}>
                      <Icon size={24} />
                    </div>
                    <h3 className="text-base font-bold text-[#1a2f5e] mb-2 group-hover:text-[#c9a84c] transition-colors duration-200">
                      {service.title}
                    </h3>
                    <p className="text-gray-500 text-sm leading-relaxed flex-1">{service.description}</p>
                    <p className="text-[#c9a84c] text-xs font-bold mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      Learn More →
                    </p>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
