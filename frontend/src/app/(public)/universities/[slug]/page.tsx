import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { GraduationCap, Star, ArrowRight, ShieldCheck, HelpCircle, BadgeEuro, Clock, CalendarRange, Award, Info, Landmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { UNIVERSITIES } from "@/data/universities";

type Props = { params: Promise<{ slug: string }> };

// Derive all static paths during build for 100% SSR-safe loading
export async function generateStaticParams() {
  return UNIVERSITIES.map((u) => ({ slug: u.id }));
}

// Dynamic SEO Metadata
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const uni = UNIVERSITIES.find((u) => u.id === slug);

  if (!uni) {
    return { title: "University Not Found | MVR Consultants" };
  }

  return {
    title: `Study at ${uni.name} | Fees, Entry Requirements & Intakes | MVR Consultants`,
    description: `Get admission to ${uni.name} in ${uni.country}. Learn about tuition fees (${uni.fees}), key intakes (${uni.intake}), typical IELTS requirements (${uni.ielts}), and scholarships.`,
    keywords: [
      `study at ${uni.name}`,
      `${uni.name} tuition fees`,
      `${uni.name} admission requirements`,
      `${uni.name} scholarships`,
      `how to get into ${uni.name}`,
      `study in ${uni.country}`
    ]
  };
}

export default async function UniversityDetailPage({ params }: Props) {
  const { slug } = await params;
  const uni = UNIVERSITIES.find((u) => u.id === slug);

  if (!uni) {
    notFound();
  }

  return (
    <div className="bg-gray-50 min-h-screen pb-24">
      {/* Premium Hero */}
      <section className="bg-[#1a2f5e] py-24 relative overflow-hidden text-white">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-[#c9a84c]/5 -translate-y-1/2 translate-x-1/4" />
          <div className="absolute bottom-0 left-0 w-72 h-72 rounded-full bg-white/[0.02] translate-y-1/3 -translate-x-1/4" />
        </div>
        
        <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <Link href="/universities" className="text-white/60 hover:text-white text-xs font-semibold uppercase tracking-wider flex items-center gap-1 transition-colors">
              🎓 Partner Universities
            </Link>
            <span className="text-white/30 text-xs">/</span>
            <span className="text-[#c9a84c] text-xs font-bold uppercase tracking-wider bg-[#c9a84c]/15 px-3 py-1 rounded-full">
              {uni.country}
            </span>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <div className="max-w-3xl">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 leading-tight" style={{ fontFamily: "var(--font-playfair)" }}>
                {uni.name}
              </h1>
              <p className="text-white/70 text-lg leading-relaxed mb-6 max-w-2xl">
                {uni.description}
              </p>
              
              <div className="flex flex-wrap gap-4">
                <span className="inline-flex items-center gap-1.5 bg-[#c9a84c] text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-sm">
                  <Star size={12} fill="white" /> QS Ranking: {uni.ranking}
                </span>
                <span className="inline-flex items-center gap-1.5 bg-white/10 text-white text-xs font-semibold px-3 py-1.5 rounded-full border border-white/10">
                  IELTS: {uni.ielts} Required
                </span>
              </div>
            </div>

            {/* Quick Badge */}
            <div className="bg-white/5 border border-white/10 rounded-3xl p-6 shrink-0 lg:w-72 text-center backdrop-blur-sm">
              <span className="text-5xl mb-2 block">{uni.flag}</span>
              <p className="text-sm text-white/50 uppercase tracking-widest font-semibold">Destination</p>
              <p className="text-xl font-bold text-white mt-1">{uni.country}</p>
              <div className="mt-4 pt-4 border-t border-white/10">
                <Link href={`/countries/${uni.country.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}`}>
                  <span className="text-xs text-[#c9a84c] hover:underline font-bold flex items-center justify-center gap-1 cursor-pointer">
                    Explore {uni.country} Guide <ArrowRight size={12} />
                  </span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Brochure Content Container */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 mt-12 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left 2 Columns: Institutional Profile */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Metrics Card Grid */}
          <div className="bg-white rounded-3xl p-6 md:p-8 border border-gray-100 shadow-sm grid grid-cols-2 md:grid-cols-3 gap-6">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#c9a84c]/10 flex items-center justify-center text-[#c9a84c] shrink-0">
                <BadgeEuro size={20} />
              </div>
              <div>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Annual Cost</p>
                <p className="text-sm font-bold text-[#1a2f5e] mt-0.5">{uni.fees}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#c9a84c]/10 flex items-center justify-center text-[#c9a84c] shrink-0">
                <CalendarRange size={20} />
              </div>
              <div>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Key Intakes</p>
                <p className="text-sm font-bold text-[#1a2f5e] mt-0.5">{uni.intake} Terms</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#c9a84c]/10 flex items-center justify-center text-[#c9a84c] shrink-0">
                <Clock size={20} />
              </div>
              <div>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Duration</p>
                <p className="text-sm font-bold text-[#1a2f5e] mt-0.5 leading-tight">{uni.duration}</p>
              </div>
            </div>
          </div>

          {/* Academic Disciplines & Minimum Requirements */}
          <div className="bg-white rounded-3xl p-6 md:p-8 border border-gray-100 shadow-sm space-y-6">
            <h2 className="text-xl font-bold text-[#1a2f5e] flex items-center gap-2" style={{ fontFamily: "var(--font-playfair)" }}>
              <GraduationCap size={22} className="text-[#c9a84c]" /> Fields of Study & Top Majors
            </h2>
            <p className="text-gray-500 text-sm leading-relaxed">
              International students at {uni.name} typically excel in high-demand global fields. MVR Consultants provides full-spectrum academic counseling and application guidance for the following disciplines:
            </p>
            <div className="flex flex-wrap gap-2 pt-2">
              {uni.programs.map((prog) => (
                <span
                  key={prog}
                  className="bg-gray-50 border border-gray-100 hover:border-[#c9a84c]/30 text-gray-700 font-bold text-xs px-4 py-2 rounded-2xl transition-all"
                >
                  ✓ {prog} Major Track
                </span>
              ))}
            </div>

            <div className="pt-6 border-t border-gray-100">
              <h3 className="font-bold text-[#1a2f5e] text-sm mb-3">Typical Entry Guidelines</h3>
              <div className="grid sm:grid-cols-2 gap-4 text-xs bg-gray-50 p-4 rounded-2xl">
                <div>
                  <p className="text-gray-400 font-semibold mb-0.5">Academic Threshold</p>
                  <p className="font-bold text-[#1a2f5e]">{uni.gpaMin ? `Min CGPA ${uni.gpaMin}/10.0 (or equivalent)` : "Strong Academic Record"}</p>
                </div>
                <div>
                  <p className="text-gray-400 font-semibold mb-0.5">Language Proficiency</p>
                  <p className="font-bold text-[#1a2f5e]">IELTS {uni.ieltsMin ? `${uni.ieltsMin}+` : uni.ielts} Required</p>
                </div>
              </div>
            </div>
          </div>

          {/* Scholarships & Financial Aids */}
          <div className="bg-white rounded-3xl p-6 md:p-8 border border-gray-100 shadow-sm space-y-4">
            <h2 className="text-xl font-bold text-[#1a2f5e] flex items-center gap-2" style={{ fontFamily: "var(--font-playfair)" }}>
              <Award size={22} className="text-[#c9a84c]" /> Scholarship & Funding Options
            </h2>
            <div className="bg-[#fef9f0] border border-[#c9a84c]/20 rounded-2xl p-4 flex items-start gap-3">
              <Landmark size={20} className="text-[#c9a84c] shrink-0 mt-0.5" />
              <div>
                <h3 className="font-bold text-[#1a2f5e] text-sm mb-1">{uni.scholarship || "Merit-based assistance"}</h3>
                <p className="text-gray-600 text-xs leading-relaxed">
                  Both institutional partial waivers and external national awards (e.g. DAAD, Chevening, Fulbright, or private trust scholarships) may apply. Speak with our experts to secure maximum financial relief.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right 1 Column: Admission CTAs & Sidebar */}
        <div className="space-y-6">
          {/* Premium Evaluation Box */}
          <div className="bg-gradient-to-br from-[#1a2f5e] to-[#122244] text-white rounded-3xl p-6 md:p-8 border border-white/5 shadow-lg relative overflow-hidden">
            <div className="absolute right-0 top-0 w-32 h-32 bg-[#c9a84c]/10 rounded-full blur-2xl pointer-events-none" />
            <h3 className="text-lg font-bold mb-3 text-[#c9a84c] flex items-center gap-1.5" style={{ fontFamily: "var(--font-playfair)" }}>
              Am I Eligible? <ShieldCheck size={18} />
            </h3>
            <p className="text-white/70 text-xs leading-relaxed mb-6">
              Skip guesswork! Use our premium Dynamic Evaluation wizard to instantly match your scores (GPA, IELTS/PTE) against {uni.name}'s standards.
            </p>
            <Link href={`/eligibility?uni=${uni.id}`}>
              <Button className="w-full bg-[#c9a84c] hover:bg-[#a07a2e] text-white rounded-full font-bold h-11 text-xs gap-2">
                Evaluate My Profile <ArrowRight size={14} />
              </Button>
            </Link>
          </div>

          {/* Core Support Sidebar */}
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-5">
            <h3 className="font-bold text-[#1a2f5e] text-sm pb-3 border-b border-gray-100">Admissions Assistance</h3>
            
            <div className="space-y-4">
              {[
                { title: "University Selection", desc: "Evaluate program streams and global ROI." },
                { title: "SOP & Essay Coaching", desc: "Stand out with highly tailored application essays." },
                { title: "Scholarship Sourcing", desc: "Unlock school and government grants." },
                { title: "Student Visa Support", desc: "100% compliance coaching and mock interviews." }
              ].map((item, idx) => (
                <div key={idx} className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-[#1a2f5e]/5 text-[#1a2f5e] text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <div>
                    <h4 className="font-bold text-xs text-[#1a2f5e]">{item.title}</h4>
                    <p className="text-[10px] text-gray-400 mt-0.5">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-gray-100">
              <Link href="/contact">
                <Button variant="outline" className="w-full border-gray-200 text-[#1a2f5e] hover:bg-gray-50 rounded-full font-bold h-11 text-xs">
                  Speak with an Advisor
                </Button>
              </Link>
            </div>
          </div>

          {/* Quick FAQ Widget */}
          <div className="bg-gray-100 rounded-3xl p-5 border border-gray-200/50">
            <h4 className="font-bold text-xs text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-1">
              <Info size={12} /> Need Help?
            </h4>
            <p className="text-gray-500 text-xs leading-relaxed">
              Not sure about the conversion rules of your local GPA or the required backlog clearance certificate? We are here to guide you step-by-step.
            </p>
          </div>
        </div>

      </section>
    </div>
  );
}
