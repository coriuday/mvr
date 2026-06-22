"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, ChevronRight } from "lucide-react";
import { apiUrl } from "@/lib/api-url";
import { mapApiUniversity, type ApiUniversity } from "@/lib/universities-api";

const COURSES = [
  { icon: "⚙️", name: "Engineering", href: "/courses/engineering" },
  { icon: "💼", name: "Business & MBA", href: "/courses/business" },
  { icon: "💻", name: "Computer Science", href: "/courses/cs" },
  { icon: "🏥", name: "Medicine & Health", href: "/courses/medicine" },
  { icon: "⚖️", name: "Law", href: "/courses/law" },
  { icon: "🎨", name: "Design & Arts", href: "/courses/design" },
];

const STATIC_UNIVERSITIES = [
  { name: "Harvard University", country: "USA", flag: "🇺🇸", href: "/universities/harvard" },
  { name: "University of Toronto", country: "Canada", flag: "🇨🇦", href: "/universities/toronto" },
  { name: "University of Oxford", country: "UK", flag: "🇬🇧", href: "/universities/oxford" },
  { name: "The University of Melbourne", country: "Australia", flag: "🇦🇺", href: "/universities/melbourne" },
];

const STATIC_SCHOLARSHIPS = [
  {
    name: "Merit Based Scholarships",
    desc: "Unlock your potential",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="#c9a84c" strokeWidth="1.5" className="w-6 h-6 shrink-0">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
      </svg>
    ),
  },
  {
    name: "Need Based Scholarships",
    desc: "Financial support for you",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="#c9a84c" strokeWidth="1.5" className="w-6 h-6 shrink-0">
        <rect x="2" y="8" width="20" height="12" rx="2"/><path d="M6 8V6a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v2"/>
        <circle cx="12" cy="14" r="2"/>
      </svg>
    ),
  },
  {
    name: "Government Scholarships",
    desc: "Explore global opportunities",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="#c9a84c" strokeWidth="1.5" className="w-6 h-6 shrink-0">
        <circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2c-3 4-4.5 8-4.5 10s1.5 6 4.5 10M12 2c3 4 4.5 8 4.5 10S13.5 18 12 22"/>
      </svg>
    ),
  },
];

type UniLink = { name: string; country: string; flag: string; href: string };
type ScholarshipLink = { name: string; desc: string; icon: React.ReactNode };

export default function HighlightGrid() {
  const [universities, setUniversities] = useState<UniLink[]>(STATIC_UNIVERSITIES);
  const [scholarships, setScholarships] = useState<ScholarshipLink[]>(STATIC_SCHOLARSHIPS);

  useEffect(() => {
    fetch(apiUrl("/api/universities?is_featured=true&per_page=4"))
      .then((r) => r.json())
      .then((json) => {
        if (json?.success && Array.isArray(json.data) && json.data.length > 0) {
          setUniversities(
            json.data.slice(0, 4).map((u: ApiUniversity) => {
              const m = mapApiUniversity(u);
              return {
                name: m.name,
                country: m.country,
                flag: m.flag,
                href: `/universities/${m.id}`,
              };
            })
          );
        }
      })
      .catch(() => {});

    fetch(apiUrl("/api/scholarships"))
      .then((r) => r.json())
      .then((json) => {
        if (json?.success && Array.isArray(json.data)) {
          const featured = json.data.filter((s: { is_featured?: boolean }) => s.is_featured).slice(0, 3);
          const list = (featured.length > 0 ? featured : json.data.slice(0, 3));
          if (list.length > 0) {
            setScholarships(
              list.map((s: { name: string; amount?: string | null; scholarship_type?: string }) => ({
                name: s.name,
                desc: s.amount || s.scholarship_type?.replace(/_/g, " ") || "Funding available",
                icon: STATIC_SCHOLARSHIPS[0].icon,
              }))
            );
          }
        }
      })
      .catch(() => {});
  }, []);

  return (
    <section className="py-16 bg-[#f8f9fc]" id="highlights">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

          {/* ── Explore Courses ── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-lg p-6 border border-gray-100"
          >
            <h3 className="text-[#1a2f5e] font-bold text-base mb-5 tracking-wide uppercase text-sm">
              Explore Courses
            </h3>
            <ul className="space-y-3">
              {COURSES.map((c) => (
                <li key={c.name}>
                  <Link href={c.href} className="flex items-center gap-3 group">
                    <span className="text-base">{c.icon}</span>
                    <span className="text-[#1a2f5e] text-sm group-hover:text-[#c9a84c] transition-colors duration-150 font-medium">
                      {c.name}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
            <Link
              href="/courses"
              className="inline-flex items-center gap-1.5 text-[#1a2f5e] text-xs font-semibold mt-6 hover:text-[#c9a84c] transition-colors"
            >
              View All Courses <ArrowRight size={13} />
            </Link>
          </motion.div>

          {/* ── Top Universities ── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-white rounded-lg p-6 border border-gray-100"
          >
            <h3 className="text-[#1a2f5e] font-bold text-base mb-5 tracking-wide uppercase text-sm">
              Top Universities
            </h3>
            <ul className="space-y-4">
              {universities.map((u) => (
                <li key={u.name}>
                  <Link href={u.href} className="flex items-center gap-3 group">
                    <div className="w-9 h-9 rounded-full bg-[#f8f9fc] border border-gray-100 flex items-center justify-center text-base shrink-0">
                      {u.flag}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[#1a2f5e] text-sm font-semibold leading-tight group-hover:text-[#c9a84c] transition-colors truncate">
                        {u.name}
                      </p>
                      <p className="text-gray-400 text-xs">{u.country}</p>
                    </div>
                    <ChevronRight size={14} className="text-gray-300 group-hover:text-[#c9a84c] shrink-0" />
                  </Link>
                </li>
              ))}
            </ul>
            <Link
              href="/universities"
              className="inline-flex items-center gap-1.5 text-[#1a2f5e] text-xs font-semibold mt-6 hover:text-[#c9a84c] transition-colors"
            >
              View All Universities <ArrowRight size={13} />
            </Link>
          </motion.div>

          {/* ── Scholarships ── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white rounded-lg p-6 border border-gray-100"
          >
            <h3 className="text-[#1a2f5e] font-bold text-base mb-5 tracking-wide uppercase text-sm">
              Scholarships
            </h3>
            <ul className="space-y-5">
              {scholarships.map((s) => (
                <li key={s.name}>
                  <Link href="/scholarships" className="flex items-start gap-3 group">
                    {s.icon}
                    <div>
                      <p className="text-[#1a2f5e] text-sm font-semibold leading-tight group-hover:text-[#c9a84c] transition-colors">
                        {s.name}
                      </p>
                      <p className="text-gray-400 text-xs mt-0.5">{s.desc}</p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
            <Link
              href="/scholarships"
              className="inline-flex items-center gap-1.5 text-[#1a2f5e] text-xs font-semibold mt-6 hover:text-[#c9a84c] transition-colors"
            >
              View All Scholarships <ArrowRight size={13} />
            </Link>
          </motion.div>

          {/* ── Success Stories ── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-white rounded-lg p-6 border border-gray-100"
          >
            <h3 className="text-[#1a2f5e] font-bold text-base mb-5 tracking-wide uppercase text-sm">
              Success Stories
            </h3>
            <div className="bg-[#f8f9fc] rounded-lg p-4 border border-gray-100">
              {/* Profile */}
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-[#1a2f5e] flex items-center justify-center text-white font-bold text-sm shrink-0">
                  AM
                </div>
                <div>
                  <p className="text-[#1a2f5e] font-bold text-sm">Arjun Mehta</p>
                  <p className="text-gray-400 text-xs">University of Melbourne, Australia</p>
                </div>
              </div>
              {/* Quote */}
              <p className="text-gray-600 text-xs leading-relaxed italic">
                &ldquo;Thanks to MVR Consultants, I got admission in my dream university and achieved my goals.&rdquo;
              </p>
              <p className="text-[#c9a84c] text-xs font-bold mt-3">– Arjun Mehta</p>
            </div>
            <Link
              href="/testimonials"
              className="inline-flex items-center gap-1.5 text-[#1a2f5e] text-xs font-semibold mt-6 hover:text-[#c9a84c] transition-colors"
            >
              Read More Stories <ArrowRight size={13} />
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
