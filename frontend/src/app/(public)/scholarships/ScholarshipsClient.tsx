"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  DollarSign, GraduationCap, Globe, Award, ArrowRight, CheckCircle2, Clock, BookOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { apiUrl } from "@/lib/api-url";
import { STATIC_SCHOLARSHIPS } from "@/data/scholarships";

interface Scholarship {
  id: string;
  name: string;
  scholarship_type: string;
  country: string;
  amount: string | null;
  deadline: string | null;
  description: string | null;
  eligibility: string | null;
  apply_url: string | null;
  is_featured: boolean;
}

const TYPE_COLORS: Record<string, { card: string; badge: string }> = {
  GOVERNMENT: { card: "bg-blue-50 border-blue-200", badge: "bg-blue-100 text-blue-700" },
  MERIT_BASED: { card: "bg-amber-50 border-amber-200", badge: "bg-amber-100 text-amber-700" },
  NEED_BASED: { card: "bg-emerald-50 border-emerald-200", badge: "bg-emerald-100 text-emerald-700" },
  UNIVERSITY: { card: "bg-purple-50 border-purple-200", badge: "bg-purple-100 text-purple-700" },
  PRIVATE: { card: "bg-teal-50 border-teal-200", badge: "bg-teal-100 text-teal-700" },
};

function formatType(t: string) {
  return t.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatDeadline(d: string | null) {
  if (!d) return "Rolling";
  return new Date(d).toLocaleDateString("en-IN", { month: "short", year: "numeric" });
}

const TIPS = [
  { icon: BookOpen, title: "Start Early", desc: "Most scholarships open 12–18 months before the course start date. Begin researching now." },
  { icon: Award, title: "Match Your Profile", desc: "Every scholarship has specific eligibility criteria. Apply only where you strongly qualify." },
  { icon: Globe, title: "Apply to Multiple", desc: "Apply for 5–8 scholarships simultaneously to maximize your chances of receiving funding." },
  { icon: CheckCircle2, title: "Perfect Your Essays", desc: "Your statement of purpose is the most critical document. Invest serious time here." },
];

export default function ScholarshipsClient() {
  const [scholarships, setScholarships] = useState<Scholarship[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(apiUrl("/api/scholarships"))
      .then((r) => r.json())
      .then((json) => {
        if (json?.success && Array.isArray(json.data) && json.data.length > 0) {
          setScholarships(json.data);
        } else {
          setScholarships(STATIC_SCHOLARSHIPS);
        }
      })
      .catch(() => {
        setScholarships(STATIC_SCHOLARSHIPS);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
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
        </div>
      </section>

      <section className="bg-white py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <p className="text-[#c9a84c] font-semibold text-sm uppercase tracking-wider mb-2">Top Opportunities</p>
            <h2 className="text-3xl font-bold text-[#1a2f5e]" style={{ fontFamily: "var(--font-playfair)" }}>
              Featured Scholarships
            </h2>
          </div>

          {loading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-48 bg-gray-100 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : scholarships.length === 0 ? (
            <p className="text-center text-gray-400 py-12">Scholarships will appear here once added in the admin panel.</p>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {scholarships.map((s) => {
                const colors = TYPE_COLORS[s.scholarship_type] ?? { card: "bg-gray-50 border-gray-200", badge: "bg-gray-100 text-gray-700" };
                return (
                  <div key={s.id} className={`rounded-2xl border ${colors.card} p-5 hover:shadow-lg hover:-translate-y-1 transition-all duration-200`}>
                    <div className="flex items-start justify-between mb-3">
                      <Badge className={`${colors.badge} border-0 text-xs font-semibold`}>{formatType(s.scholarship_type)}</Badge>
                      <span className="text-gray-400 text-xs flex items-center gap-1">
                        <Clock size={10} /> {formatDeadline(s.deadline)}
                      </span>
                    </div>
                    <h3 className="font-bold text-[#1a2f5e] mb-1 leading-tight">{s.name}</h3>
                    <p className="text-gray-500 text-sm mb-2">{s.country}</p>
                    <p className="text-emerald-600 font-bold text-sm mb-3">{s.amount || "Varies"}</p>
                    {s.eligibility && (
                      <p className="text-xs text-gray-500 flex items-start gap-1.5 border-t border-current/10 pt-3">
                        <CheckCircle2 size={12} className="text-emerald-500 mt-0.5 shrink-0" />
                        {s.eligibility}
                      </p>
                    )}
                    {s.apply_url && (
                      <a href={s.apply_url} target="_blank" rel="noopener noreferrer" className="text-xs text-[#1a2f5e] font-semibold mt-2 inline-block hover:underline">
                        Apply →
                      </a>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

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
