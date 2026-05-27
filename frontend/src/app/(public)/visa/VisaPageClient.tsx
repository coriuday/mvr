"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ShieldCheck, FileText, CalendarCheck, UserCheck, ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";

const PROCESS_STEPS = [
  {
    icon: FileText,
    title: "1. Document Preparation",
    description: "We help you gather and organize all required financial, academic, and personal documents perfectly.",
  },
  {
    icon: UserCheck,
    title: "2. Application Review",
    description: "Our experts meticulously review every field of your visa application to ensure 100% accuracy.",
  },
  {
    icon: CalendarCheck,
    title: "3. Interview Prep",
    description: "Participate in mock interviews with our ex-visa officers to build confidence (especially for US F-1 visas).",
  },
  {
    icon: ShieldCheck,
    title: "4. Visa Approval",
    description: "Submit your application with confidence and track its status until your passport arrives with the visa.",
  },
];

const COUNTRIES = [
  { name: "USA (F-1/J-1)", color: "bg-blue-50 text-blue-600" },
  { name: "UK (Tier 4)", color: "bg-emerald-50 text-emerald-600" },
  { name: "Canada (Study Permit)", color: "bg-red-50 text-red-600" },
  { name: "Australia (Subclass 500)", color: "bg-amber-50 text-amber-600" },
  { name: "Schengen Visas", color: "bg-purple-50 text-purple-600" },
  { name: "Ireland Student Visa", color: "bg-teal-50 text-teal-600" },
];

export default function VisaPageClient() {
  return (
    <div className="min-h-screen bg-white">
      {/* ── Hero ── */}
      <section className="relative bg-[#1a2f5e] py-28 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-[#c9a84c]/5 -translate-y-1/2 translate-x-1/2" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1 text-center md:text-left">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <span className="inline-flex items-center gap-2 bg-[#c9a84c]/20 text-[#c9a84c] text-xs font-semibold uppercase tracking-wider px-4 py-2 rounded-full mb-6">
                <ShieldCheck size={14} /> 98% Success Rate
              </span>
              <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight" style={{ fontFamily: "var(--font-playfair)" }}>
                Hassle-Free <span className="text-[#c9a84c]">Student Visas</span>
              </h1>
              <p className="text-white/70 text-lg leading-relaxed mb-8 max-w-xl">
                A single mistake on your visa application can cost you your dream. Let our experts handle the complexities while you focus on packing your bags.
              </p>
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <Link href="/contact">
                  <Button className="bg-[#c9a84c] hover:bg-[#a07a2e] text-white h-12 px-8 rounded-full font-bold shadow-lg shadow-[#c9a84c]/20 transition-all hover:scale-105">
                    Start Your Application
                  </Button>
                </Link>
                <div className="flex items-center gap-2 text-white/50 text-sm">
                  <CheckCircle2 size={16} className="text-[#c9a84c]" /> Free assessment
                </div>
              </div>
            </motion.div>
          </div>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, delay: 0.2 }}
            className="flex-1 relative hidden md:block"
          >
            <Image 
              src="https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=800&q=80" 
              alt="Visa Documents" 
              width={800}
              height={533}
              sizes="(max-width: 768px) 100vw, 50vw"
              className="rounded-3xl shadow-2xl border border-white/10 w-full h-auto object-cover"
            />
            <div className="absolute -bottom-6 -left-6 bg-white rounded-2xl p-6 shadow-xl border border-gray-100">
              <p className="text-[#1a2f5e] font-bold text-3xl mb-1">50K+</p>
              <p className="text-gray-500 text-sm font-medium">Visas Approved</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Supported Countries ── */}
      <section className="py-16 bg-gray-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <p className="text-center text-sm font-bold text-gray-400 uppercase tracking-wider mb-8">
            Expert Processing For
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            {COUNTRIES.map((c) => (
              <span key={c.name} className={`px-5 py-2.5 rounded-xl font-semibold text-sm ${c.color}`}>
                {c.name}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Process ── */}
      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-[#1a2f5e] mb-6" style={{ fontFamily: "var(--font-playfair)" }}>
            Our 4-Step Visa Process
          </h2>
          <p className="text-gray-500 text-lg leading-relaxed">
            We leave nothing to chance. Our systematic approach ensures every application is airtight before submission.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 relative">
          {PROCESS_STEPS.map((step, i) => (
            <motion.div 
              key={i} 
              initial={{ opacity: 0, y: 20 }} 
              whileInView={{ opacity: 1, y: 0 }} 
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="relative bg-white rounded-3xl p-8 border border-gray-100 shadow-sm hover:shadow-xl transition-shadow group"
            >
              <div className="w-14 h-14 bg-[#1a2f5e]/5 group-hover:bg-[#1a2f5e] transition-colors rounded-2xl flex items-center justify-center mb-6">
                <step.icon size={26} className="text-[#1a2f5e] group-hover:text-white transition-colors" />
              </div>
              <h3 className="text-lg font-bold text-[#1a2f5e] mb-3">{step.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="bg-[#1a2f5e] rounded-[3rem] p-10 md:p-16 text-center text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#c9a84c]/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-bold mb-6" style={{ fontFamily: "var(--font-playfair)" }}>
                Ready to File Your Visa?
              </h2>
              <p className="text-white/70 text-lg mb-10 max-w-2xl mx-auto">
                Don't risk your admission with a poor visa application. Let our experts guide you to a successful approval.
              </p>
              <Link href="/contact">
                <Button className="bg-[#c9a84c] hover:bg-[#a07a2e] text-white h-14 px-10 rounded-full font-bold text-lg shadow-lg shadow-[#c9a84c]/20 transition-all hover:scale-105">
                  Get Visa Assessment
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
