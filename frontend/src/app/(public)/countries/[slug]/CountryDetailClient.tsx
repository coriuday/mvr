"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";

import {
  ArrowLeft,
  GraduationCap,
  Briefcase,
  Building2,
  DollarSign,
  Calendar,
  Globe,
  BookOpen,
  Languages,
  HelpCircle,
  MapPin,
  CheckCircle2,
  Laptop,
  Award,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { notFound } from "next/navigation";
import type { CountryData } from "@/types/country";
import ScholarshipCard from "@/components/sections/ScholarshipCard";
import VisaSection from "@/components/sections/VisaSection";
import FAQAccordion from "@/components/sections/FAQAccordion";
import UniversityCard from "@/components/sections/UniversityCard";


// ── Section Header ─────────────────────────────────────────────────────────

function SectionHeader({ icon: Icon, title }: { icon: React.ElementType; title: string }) {
  return (
    <div className="flex items-center gap-3 mb-8">
      <span className="w-10 h-10 rounded-xl bg-[#c9a84c]/20 flex items-center justify-center text-[#c9a84c] shrink-0">
        <Icon size={20} />
      </span>
      <h2 className="text-2xl md:text-3xl font-bold text-[#1a2f5e]" style={{ fontFamily: "var(--font-playfair)" }}>
        {title}
      </h2>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────

export default function CountryDetailClient({
  slug,
  country,
}: {
  slug: string;
  country: CountryData | null;
}) {
  const [activeTab, setActiveTab] = useState<"overview" | "visa" | "scholarships" | "faqs">("overview");

  if (!country) {
    notFound();
  }

  const tabs = [
    { id: "overview" as const, label: "Overview" },
    { id: "visa" as const, label: "Visa & Work" },
    { id: "scholarships" as const, label: "Scholarships" },
    { id: "faqs" as const, label: "FAQs" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* ── Hero Section ──────────────────────────────────────────────── */}
      <section className="relative h-[65vh] min-h-[520px] flex items-end overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={country.heroImage}
            alt={`Study in ${country.name}`}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1a2f5e] via-[#1a2f5e]/50 to-[#1a2f5e]/10" />
        </div>

        <div className="relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-6 pb-16">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Link
              href="/countries"
              className="inline-flex items-center gap-2 text-white/70 hover:text-white text-sm font-semibold mb-6 transition-colors"
            >
              <ArrowLeft size={16} /> Back to Destinations
            </Link>

            <div className="flex items-center gap-3 mb-3">
              <span className="text-5xl">{country.flag}</span>
              <span className="bg-[#c9a84c]/20 text-[#c9a84c] text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full">
                {country.tagline}
              </span>
            </div>

            <h1
              className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-4"
              style={{ fontFamily: "var(--font-playfair)" }}
            >
              Study in <span className="text-[#c9a84c]">{country.name}</span>
            </h1>
            <p className="text-white/80 text-base md:text-lg max-w-3xl leading-relaxed">
              {country.description}
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── Quick Stats ───────────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 relative z-20 -mt-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6 md:p-8 grid grid-cols-2 md:grid-cols-4 gap-6"
        >
          {[
            { icon: Building2, label: "Universities", value: country.stats.unis },
            { icon: Briefcase, label: "Post-Study Work", value: country.stats.workRights },
            { icon: DollarSign, label: "Avg. Tuition", value: country.stats.avgTuition },
            { icon: Calendar, label: "Main Intakes", value: country.stats.intakes },
          ].map((stat, i) => (
            <div key={i} className="text-center md:text-left flex flex-col md:flex-row items-center md:items-start gap-3">
              <div className="w-11 h-11 bg-[#1a2f5e]/5 rounded-2xl flex items-center justify-center shrink-0">
                <stat.icon size={20} className="text-[#c9a84c]" />
              </div>
              <div>
                <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-0.5">{stat.label}</p>
                <p className="text-[#1a2f5e] font-bold text-base leading-snug">{stat.value}</p>
              </div>
            </div>
          ))}
        </motion.div>
      </section>

      {/* ── Tab Navigation ────────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 mt-10">
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              id={`tab-${tab.id}`}
              onClick={() => setActiveTab(tab.id)}
              className={`shrink-0 px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-200 ${activeTab === tab.id
                  ? "bg-[#1a2f5e] text-white shadow-md shadow-[#1a2f5e]/20"
                  : "bg-white text-gray-500 border border-gray-200 hover:border-[#1a2f5e]/30 hover:text-[#1a2f5e]"
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </section>

      {/* ── Content ───────────────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 mt-10">
        <div className="grid md:grid-cols-3 gap-10">

          {/* ── Main Content ──────────────────────────────────────────── */}
          <div className="md:col-span-2 space-y-16">

            {/* OVERVIEW TAB */}
            {activeTab === "overview" && (
              <>
                {/* Popular Programs */}
                {country.popularPrograms && country.popularPrograms.length > 0 && (
                  <div>
                    <SectionHeader icon={GraduationCap} title="Popular Programs" />
                    <div className="flex flex-wrap gap-2.5">
                      {country.popularPrograms.map((prog, i) => (
                        <motion.span
                          key={i}
                          initial={{ opacity: 0, scale: 0.9 }}
                          whileInView={{ opacity: 1, scale: 1 }}
                          viewport={{ once: true }}
                          transition={{ delay: i * 0.04 }}
                          className="bg-white border border-gray-200 text-[#1a2f5e] font-semibold text-sm px-4 py-2 rounded-full shadow-sm hover:border-[#c9a84c] hover:text-[#c9a84c] transition-colors cursor-default"
                        >
                          {prog}
                        </motion.span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tuition Fees */}
                <div>
                  <SectionHeader icon={DollarSign} title="Tuition Fees" />
                  <div className="grid sm:grid-cols-3 gap-4">
                    {[
                      { label: "Undergraduate", value: country.tuitionFees.undergraduate, icon: "🎓" },
                      { label: "Postgraduate", value: country.tuitionFees.postgraduate, icon: "📚" },
                      { label: "PhD / Doctorate", value: country.tuitionFees.phd, icon: "🔬" },
                    ].map((item, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 12 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.1 }}
                        className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm"
                      >
                        <div className="text-2xl mb-3">{item.icon}</div>
                        <p className="text-[#1a2f5e] font-bold text-xs uppercase tracking-wider mb-2">{item.label}</p>
                        <p className="text-gray-600 text-sm leading-relaxed">{item.value}</p>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Language Requirements */}
                {country.languageRequirements && (
                  <div>
                    <SectionHeader icon={Languages} title="Language Requirements" />
                    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-5">
                        {[
                          { label: "IELTS", value: country.languageRequirements.ielts ? `${country.languageRequirements.ielts}+` : "" },
                          { label: "TOEFL iBT", value: country.languageRequirements.toefl ? `${country.languageRequirements.toefl}+` : "" },
                          { label: "PTE Academic", value: country.languageRequirements.pte ? `${country.languageRequirements.pte}+` : "" },
                          ...(country.languageRequirements.gmat ? [{ label: "GMAT", value: `${country.languageRequirements.gmat}+` }] : []),
                          ...(country.languageRequirements.gre ? [{ label: "GRE", value: `${country.languageRequirements.gre}+` }] : []),
                        ].filter(x => x.value).map((item, i) => (
                          <div key={i} className="bg-gray-50 rounded-xl p-4 text-center border border-gray-100">
                            <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-1">{item.label}</p>
                            <p className="text-[#1a2f5e] font-bold text-xl">{item.value}</p>
                          </div>
                        ))}
                      </div>
                      {country.languageRequirements.notes && (
                        <p className="text-gray-500 text-sm leading-relaxed flex items-start gap-2">
                          <span className="text-[#c9a84c] mt-0.5">ℹ️</span>
                          {country.languageRequirements.notes}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Top Universities */}
                {country.topUniversities && country.topUniversities.length > 0 && (
                  <div>
                    <SectionHeader icon={Building2} title="Top Universities" />
                    <div className="grid sm:grid-cols-2 gap-4">
                      {country.topUniversities.slice(0, 8).map((uni, i) => (
                        <UniversityCard key={i} university={uni} index={i} />
                      ))}
                    </div>
                    <div className="mt-6 text-center">
                      <Link href="/universities">
                        <Button
                          variant="outline"
                          className="rounded-full font-bold text-[#1a2f5e] border-gray-200 hover:border-[#1a2f5e] px-8"
                        >
                          View All Universities around the World
                        </Button>
                      </Link>
                    </div>
                  </div>
                )}

                {/* Image Gallery */}
                {country.images && country.images.length > 0 && (
                  <div>
                    <SectionHeader icon={Globe} title={`Life in ${country.name}`} />
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {country.images.slice(0, 6).map((img, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, scale: 0.95 }}
                          whileInView={{ opacity: 1, scale: 1 }}
                          viewport={{ once: true }}
                          transition={{ delay: i * 0.06 }}
                          className={`overflow-hidden rounded-2xl ${i === 0 ? "col-span-2 sm:col-span-2 row-span-2 h-56 sm:h-72" : "h-36 sm:h-44"}`}
                        >
                          <img
                            src={img}
                            alt={`${country.name} campus ${i + 1}`}
                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                          />
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}

            {/* VISA & WORK TAB */}
            {activeTab === "visa" && (
              <>
                <div>
                  <SectionHeader icon={BookOpen} title="Visa Requirements" />
                  <VisaSection visa={country.visaRequirements} countryName={country.name} />
                </div>

                {/* Work Permit */}
                <div>
                  <SectionHeader icon={Briefcase} title="Work Rights" />
                  <div className="grid sm:grid-cols-2 gap-5">
                    <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                      <div className="flex items-center gap-2 mb-4">
                        <div className="w-8 h-8 bg-[#1a2f5e]/10 rounded-xl flex items-center justify-center">
                          <Laptop size={15} className="text-[#1a2f5e]" />
                        </div>
                        <p className="text-[#1a2f5e] font-bold text-sm uppercase tracking-wider">During Study</p>
                      </div>
                      <p className="text-gray-700 text-sm leading-relaxed">{country.workPermit.duringStudy}</p>
                    </div>
                    <div className="bg-[#1a2f5e] rounded-2xl p-6 shadow-sm">
                      <div className="flex items-center gap-2 mb-4">
                        <div className="w-8 h-8 bg-[#c9a84c]/20 rounded-xl flex items-center justify-center">
                          <Award size={15} className="text-[#c9a84c]" />
                        </div>
                        <p className="text-white font-bold text-sm uppercase tracking-wider">Post-Study Work</p>
                      </div>
                      <p className="text-white/85 text-sm leading-relaxed">{country.workPermit.postStudy}</p>
                      {country.workPermit.notes && (
                        <p className="text-[#c9a84c] text-xs mt-3 leading-relaxed">ℹ️ {country.workPermit.notes}</p>
                      )}
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* SCHOLARSHIPS TAB */}
            {activeTab === "scholarships" && (
              <div>
                <SectionHeader icon={Award} title="Scholarships & Funding" />
                <div className="grid sm:grid-cols-2 gap-4">
                  {country.scholarships.map((s, i) => (
                    <ScholarshipCard key={i} scholarship={s} index={i} />
                  ))}
                </div>
                <div className="mt-8 bg-gradient-to-r from-[#1a2f5e] to-[#243d7a] rounded-2xl p-6 text-white">
                  <p className="font-bold text-base mb-2">Need help finding the right scholarship?</p>
                  <p className="text-white/70 text-sm mb-4">
                    Our counselors match your profile with the best scholarships available for {country.name}.
                  </p>
                  <Link href="/contact">
                    <Button className="bg-[#c9a84c] hover:bg-[#a07a2e] text-white font-bold rounded-full px-6 text-sm transition-all hover:scale-105">
                      Get Scholarship Advice
                    </Button>
                  </Link>
                </div>
              </div>
            )}

            {/* FAQS TAB */}
            {activeTab === "faqs" && (
              <div>
                <SectionHeader icon={HelpCircle} title={`FAQs — ${country.name}`} />
                <FAQAccordion faqs={country.faqs} />
              </div>
            )}
          </div>

          {/* ── Sidebar ───────────────────────────────────────────────── */}
          <div className="md:col-span-1">
            <div className="sticky top-24 space-y-5">
              {/* CTA Card */}
              <div className="bg-[#1a2f5e] rounded-3xl p-7 text-center text-white shadow-xl shadow-[#1a2f5e]/10">
                <div className="w-14 h-14 bg-[#c9a84c]/20 rounded-full flex items-center justify-center mx-auto mb-5">
                  <MapPin size={26} className="text-[#c9a84c]" />
                </div>
                <h3 className="text-xl font-bold mb-2" style={{ fontFamily: "var(--font-playfair)" }}>
                  Start Your Journey
                </h3>
                <p className="text-white/65 text-sm leading-relaxed mb-6">
                  Our counselors are experts in {country.name} admissions and visa processes. Get a free profile evaluation today.
                </p>
                <Link href="/contact" className="block w-full">
                  <Button className="w-full bg-[#c9a84c] hover:bg-[#a07a2e] text-white h-11 rounded-xl font-bold transition-all hover:scale-[1.02]">
                    Book Free Consultation
                  </Button>
                </Link>
                <p className="text-white/35 text-xs mt-3">No commitment. 100% Free.</p>
              </div>

              {/* Quick Facts Card */}
              <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">
                <p className="text-[#1a2f5e] font-bold text-sm uppercase tracking-wider mb-4">
                  Quick Facts
                </p>
                <ul className="space-y-3">
                  {[
                    { label: "IELTS Requirement", value: `${country.languageRequirements?.ielts || "6.0"}+` },
                    { label: "Average Tuition", value: country.stats.avgTuition },
                    { label: "Work During Study", value: country.workPermit.duringStudy.split(";")[0].split(",")[0] },
                    { label: "Universities", value: country.stats.unis },
                    { label: "Main Intakes", value: country.stats.intakes },
                  ].map((fact, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <CheckCircle2 size={14} className="text-[#c9a84c] mt-0.5 shrink-0" />
                      <span>
                        <span className="text-gray-400">{fact.label}: </span>
                        <span className="text-[#1a2f5e] font-semibold">{fact.value}</span>
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Tab shortcuts
              <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">
                <p className="text-[#1a2f5e] font-bold text-sm uppercase tracking-wider mb-4">
                  Explore More
                </p>
                <div className="space-y-2">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                        activeTab === tab.id
                          ? "bg-[#1a2f5e] text-white"
                          : "hover:bg-gray-50 text-gray-600"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div> */}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
