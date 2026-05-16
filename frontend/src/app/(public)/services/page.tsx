import type { Metadata } from "next";
import Link from "next/link";
import {
  GraduationCap, FileText, Search, Globe, DollarSign,
  Home, Users, ClipboardList, ArrowRight, CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Our Services — Study Abroad, Visa, Scholarships | MVR Consultants",
  description:
    "MVR Consultants offers end-to-end study abroad services: university admissions, student visa guidance, scholarship assistance, test prep, accommodation, and post-arrival support.",
};

const SERVICES = [
  { icon: Search,       color: "bg-blue-50 text-blue-600",    title: "University Shortlisting",    desc: "Personalised university lists based on your profile, budget, and career goals.",             features: ["Profile evaluation", "Course matching", "Ranking analysis", "Deadline tracking"] },
  { icon: FileText,     color: "bg-emerald-50 text-emerald-600", title: "Admissions Assistance",   desc: "SOP writing, LOR guidance, and complete application management.",                          features: ["SOP writing & review", "LOR guidance", "Application submission", "Interview prep"] },
  { icon: Globe,        color: "bg-purple-50 text-purple-600", title: "Student Visa Guidance",     desc: "98% visa success rate. Complete documentation support and mock interviews.",               features: ["Visa type selection", "Document checklist", "Bank statement guidance", "Mock interviews"] },
  { icon: DollarSign,   color: "bg-amber-50 text-amber-600",   title: "Scholarship Assistance",    desc: "Identify and apply for scholarships, grants, and financial aid.",                          features: ["Scholarship discovery", "Essay support", "Financial aid apps", "Education loans"] },
  { icon: ClipboardList,color: "bg-rose-50 text-rose-600",     title: "Test Preparation",          desc: "IELTS, TOEFL, GRE, GMAT — score planning and test center registration.",                 features: ["Score planning", "Test registration", "Study material", "Practice tests"] },
  { icon: Home,         color: "bg-indigo-50 text-indigo-600", title: "Accommodation Support",     desc: "On-campus housing, homestays, and private accommodation guidance.",                        features: ["Campus housing", "Homestay matching", "Apartment search", "Safety guidance"] },
  { icon: Users,        color: "bg-teal-50 text-teal-600",     title: "Pre-Departure Orientation", desc: "Cultural adaptation, banking, health insurance, and packing essentials.",                  features: ["Cultural prep", "Banking & SIM", "Health insurance", "Packing guide"] },
  { icon: GraduationCap,color: "bg-orange-50 text-orange-600", title: "Post-Arrival Support",      desc: "Airport coordination, bank setup, and ongoing counseling after you land.",                 features: ["Airport coordination", "Bank setup", "Community access", "Ongoing support"] },
];

const PROCESS = [
  { step: "01", title: "Free Consultation", desc: "Discuss your profile, goals, and budget with our counselor." },
  { step: "02", title: "Profile Assessment", desc: "We build your complete study abroad strategy." },
  { step: "03", title: "University Shortlist", desc: "Curated list of universities matched to your profile." },
  { step: "04", title: "Application & Visa", desc: "We manage applications and guide you through visa." },
  { step: "05", title: "Fly & Settle In", desc: "Depart with confidence — support continues after arrival." },
];

export default function ServicesPage() {
  return (
    <>
      <section className="bg-[#1a2f5e] py-20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-[#c9a84c]/5 -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <span className="inline-flex items-center gap-2 bg-[#c9a84c]/20 text-[#c9a84c] text-xs font-semibold uppercase tracking-wider px-4 py-2 rounded-full mb-6">
            <GraduationCap size={13} /> End-to-End Support
          </span>
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-5" style={{ fontFamily: "var(--font-playfair)" }}>
            Everything You Need to <span className="text-gradient-gold">Study Abroad</span>
          </h1>
          <p className="text-white/65 text-lg max-w-2xl mx-auto leading-relaxed">
            From choosing the right university to settling into your new home — MVR Consultants
            handles every step of your study abroad journey.
          </p>
        </div>
      </section>

      <section className="bg-white py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <p className="text-[#c9a84c] font-semibold text-sm uppercase tracking-wider mb-2">What We Do</p>
            <h2 className="text-3xl font-bold text-[#1a2f5e]" style={{ fontFamily: "var(--font-playfair)" }}>Our Core Services</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {SERVICES.map((s) => (
              <div key={s.title} className="rounded-2xl border border-gray-100 p-6 hover:shadow-xl hover:-translate-y-1.5 transition-all duration-200 group">
                <div className={`w-11 h-11 ${s.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <s.icon size={20} />
                </div>
                <h3 className="font-bold text-[#1a2f5e] mb-2">{s.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed mb-4">{s.desc}</p>
                <ul className="space-y-1.5">
                  {s.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-gray-600 text-xs">
                      <CheckCircle2 size={12} className="text-[#c9a84c] shrink-0" /> {f}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-gray-50 py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <p className="text-[#c9a84c] font-semibold text-sm uppercase tracking-wider mb-2">How It Works</p>
            <h2 className="text-3xl font-bold text-[#1a2f5e]" style={{ fontFamily: "var(--font-playfair)" }}>Your Journey in 5 Steps</h2>
          </div>
          <div className="grid sm:grid-cols-5 gap-6">
            {PROCESS.map((p) => (
              <div key={p.step} className="text-center">
                <div className="w-20 h-20 bg-[#1a2f5e] rounded-2xl flex flex-col items-center justify-center mx-auto mb-4 shadow-lg">
                  <span className="text-[#c9a84c] text-xs font-semibold">Step</span>
                  <span className="text-white text-xl font-bold leading-none">{p.step}</span>
                </div>
                <h3 className="font-bold text-[#1a2f5e] text-sm mb-1">{p.title}</h3>
                <p className="text-gray-500 text-xs leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#1a2f5e] py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl font-bold text-white mb-4" style={{ fontFamily: "var(--font-playfair)" }}>
            Let&apos;s Plan Your Future Together
          </h2>
          <p className="text-white/65 mb-8 text-lg">Book a free consultation today. No commitment, just clarity.</p>
          <Link href="/contact">
            <Button className="bg-[#c9a84c] hover:bg-[#a07a2e] text-white rounded-full px-12 h-12 font-bold gap-2">
              Book Free Consultation <ArrowRight size={16} />
            </Button>
          </Link>
        </div>
      </section>
    </>
  );
}
