import type { Metadata } from "next";
import Link from "next/link";
import { DollarSign, GraduationCap, Globe, Award, ArrowRight, CheckCircle2, Clock, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Scholarships — Study Abroad Funding | MVR Consultants",
  description:
    "Discover scholarships, grants, and financial aid opportunities for Indian students studying abroad in USA, UK, Canada, Australia, Germany, and more.",
};

const SCHOLARSHIPS = [
  {
    name: "Chevening Scholarship",
    country: "🇬🇧 United Kingdom",
    value: "Full funding",
    deadline: "Nov 2025",
    type: "Government",
    fields: ["All subjects"],
    highlight: "Covers tuition + living expenses",
    color: "bg-blue-50 border-blue-200",
    badge: "bg-blue-100 text-blue-700",
  },
  {
    name: "Australia Awards",
    country: "🇦🇺 Australia",
    value: "Full funding",
    deadline: "Apr 2026",
    type: "Government",
    fields: ["All subjects"],
    highlight: "Includes return airfare",
    color: "bg-emerald-50 border-emerald-200",
    badge: "bg-emerald-100 text-emerald-700",
  },
  {
    name: "Vanier Canada Graduate",
    country: "🇨🇦 Canada",
    value: "$50,000/year",
    deadline: "Oct 2025",
    type: "Government",
    fields: ["Health Sciences", "Natural Sciences", "Social Sciences"],
    highlight: "For PhD students",
    color: "bg-red-50 border-red-200",
    badge: "bg-red-100 text-red-700",
  },
  {
    name: "DAAD Scholarship",
    country: "🇩🇪 Germany",
    value: "€850–1,200/month",
    deadline: "Oct 2025",
    type: "Government",
    fields: ["Engineering", "Sciences", "Arts"],
    highlight: "Free tuition at public unis",
    color: "bg-gray-50 border-gray-200",
    badge: "bg-gray-100 text-gray-700",
  },
  {
    name: "Commonwealth Scholarship",
    country: "🇬🇧 United Kingdom",
    value: "Full funding",
    deadline: "Dec 2025",
    type: "Commonwealth",
    fields: ["STEM", "Development"],
    highlight: "Low/middle income countries",
    color: "bg-purple-50 border-purple-200",
    badge: "bg-purple-100 text-purple-700",
  },
  {
    name: "Erasmus Mundus",
    country: "🇪🇺 Europe",
    value: "€1,000–1,500/month",
    deadline: "Jan 2026",
    type: "EU Programme",
    fields: ["All Masters programs"],
    highlight: "Study in 2–3 EU countries",
    color: "bg-indigo-50 border-indigo-200",
    badge: "bg-indigo-100 text-indigo-700",
  },
  {
    name: "New Zealand Excellence",
    country: "🇳🇿 New Zealand",
    value: "Partial funding",
    deadline: "Mar 2026",
    type: "Government",
    fields: ["Business", "Engineering", "Agriculture"],
    highlight: "Post-study work visa",
    color: "bg-teal-50 border-teal-200",
    badge: "bg-teal-100 text-teal-700",
  },
  {
    name: "Fulbright-Nehru Fellowship",
    country: "🇺🇸 United States",
    value: "Full funding",
    deadline: "Jul 2025",
    type: "Bilateral",
    fields: ["Arts", "Sciences", "Research"],
    highlight: "India-specific program",
    color: "bg-amber-50 border-amber-200",
    badge: "bg-amber-100 text-amber-700",
  },
];

const TIPS = [
  { icon: BookOpen,    title: "Start Early",           desc: "Most scholarships open 12–18 months before the course start date. Begin researching now." },
  { icon: Award,       title: "Match Your Profile",    desc: "Every scholarship has specific eligibility criteria. Apply only where you strongly qualify." },
  { icon: Globe,       title: "Apply to Multiple",     desc: "Apply for 5–8 scholarships simultaneously to maximize your chances of receiving funding." },
  { icon: CheckCircle2,title: "Perfect Your Essays",   desc: "Your statement of purpose is the most critical document. Invest serious time here." },
];

export default function ScholarshipsPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-[#1a2f5e] py-20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-[#c9a84c]/5 -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <span className="inline-flex items-center gap-2 bg-[#c9a84c]/20 text-[#c9a84c] text-xs font-semibold uppercase tracking-wider px-4 py-2 rounded-full mb-6">
            <DollarSign size={13} /> Financial Aid Guide
          </span>
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-5" style={{ fontFamily: "var(--font-playfair)" }}>
            Fund Your <span className="text-gradient-gold">Study Abroad Dream</span>
          </h1>
          <p className="text-white/65 text-lg max-w-2xl mx-auto leading-relaxed">
            Studying abroad does not have to be expensive. We help you discover and apply for
            scholarships, grants, and financial aid worth thousands of dollars.
          </p>
          <div className="flex flex-wrap justify-center gap-8 mt-12">
            {[
              { icon: DollarSign,   v: "₹5Cr+",  l: "Scholarships Secured" },
              { icon: Award,        v: "500+",    l: "Awards Available" },
              { icon: GraduationCap,v: "85%",     l: "Applicants Funded" },
            ].map(({ icon: Icon, v, l }) => (
              <div key={l} className="text-center">
                <Icon size={18} className="text-[#c9a84c] mx-auto mb-1.5" />
                <p className="text-2xl font-bold text-white">{v}</p>
                <p className="text-white/50 text-xs">{l}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Scholarship Cards */}
      <section className="bg-white py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <p className="text-[#c9a84c] font-semibold text-sm uppercase tracking-wider mb-2">Top Opportunities</p>
            <h2 className="text-3xl font-bold text-[#1a2f5e]" style={{ fontFamily: "var(--font-playfair)" }}>
              Featured Scholarships
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {SCHOLARSHIPS.map((s) => (
              <div key={s.name} className={`rounded-2xl border ${s.color} p-5 hover:shadow-lg hover:-translate-y-1 transition-all duration-200`}>
                <div className="flex items-start justify-between mb-3">
                  <Badge className={`${s.badge} border-0 text-xs font-semibold`}>{s.type}</Badge>
                  <span className="text-gray-400 text-xs flex items-center gap-1">
                    <Clock size={10} /> {s.deadline}
                  </span>
                </div>
                <h3 className="font-bold text-[#1a2f5e] mb-1 leading-tight">{s.name}</h3>
                <p className="text-gray-500 text-sm mb-2">{s.country}</p>
                <p className="text-emerald-600 font-bold text-sm mb-3">{s.value}</p>
                <div className="flex flex-wrap gap-1 mb-3">
                  {s.fields.map((f) => (
                    <span key={f} className="bg-white/80 text-gray-600 text-xs px-2 py-0.5 rounded-full border border-gray-200">{f}</span>
                  ))}
                </div>
                <p className="text-xs text-gray-500 flex items-start gap-1.5 border-t border-current/10 pt-3">
                  <CheckCircle2 size={12} className="text-emerald-500 mt-0.5 shrink-0" />
                  {s.highlight}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tips */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <p className="text-[#c9a84c] font-semibold text-sm uppercase tracking-wider mb-2">Expert Advice</p>
            <h2 className="text-3xl font-bold text-[#1a2f5e]" style={{ fontFamily: "var(--font-playfair)" }}>
              Scholarship Application Tips
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-6">
            {TIPS.map((t) => (
              <div key={t.title} className="bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-md transition-shadow">
                <t.icon size={22} className="text-[#c9a84c] mb-3" />
                <h3 className="font-bold text-[#1a2f5e] mb-2">{t.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{t.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[#1a2f5e] py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl font-bold text-white mb-4" style={{ fontFamily: "var(--font-playfair)" }}>
            Need Help Applying for Scholarships?
          </h2>
          <p className="text-white/65 mb-8 text-lg">
            Our scholarship experts will identify the best awards for your profile and guide you through the application.
          </p>
          <Link href="/contact">
            <Button className="bg-[#c9a84c] hover:bg-[#a07a2e] text-white rounded-full px-12 h-12 font-bold gap-2">
              Get Scholarship Guidance <ArrowRight size={16} />
            </Button>
          </Link>
        </div>
      </section>
    </>
  );
}
