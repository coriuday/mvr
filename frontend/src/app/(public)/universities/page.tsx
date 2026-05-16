import type { Metadata } from "next";
import Link from "next/link";
import { GraduationCap, Star, Users, ArrowRight, Globe, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Partner Universities — Study Abroad | MVR Consultants",
  description:
    "Explore 200+ partner universities across USA, UK, Canada, Australia, Germany and more. Find the perfect university for your study abroad journey with MVR Consultants.",
};

const COUNTRIES = [
  { flag: "🇺🇸", name: "United States",    unis: 48, tagline: "Ivy League to State Schools" },
  { flag: "🇬🇧", name: "United Kingdom",   unis: 35, tagline: "Russell Group & Beyond" },
  { flag: "🇨🇦", name: "Canada",           unis: 28, tagline: "PR-Friendly Pathways" },
  { flag: "🇦🇺", name: "Australia",        unis: 24, tagline: "Group of Eight Universities" },
  { flag: "🇩🇪", name: "Germany",          unis: 22, tagline: "Free Tuition Options" },
  { flag: "🇮🇪", name: "Ireland",          unis: 15, tagline: "2-Year Stay-Back Visa" },
  { flag: "🇳🇿", name: "New Zealand",      unis: 12, tagline: "Post-Study Work Rights" },
  { flag: "🇳🇱", name: "Netherlands",      unis: 18, tagline: "English-Taught Programs" },
];

const FEATURED_UNIS = [
  { name: "University of Toronto",       country: "🇨🇦 Canada",    rank: "#1 in Canada",    qs: "21",  fields: ["Business", "Engineering", "Medicine"],          highlight: "PR pathway" },
  { name: "University of Melbourne",     country: "🇦🇺 Australia", rank: "#1 in Australia", qs: "14",  fields: ["Arts", "Science", "Law"],                        highlight: "Group of Eight" },
  { name: "University of Edinburgh",     country: "🇬🇧 UK",        rank: "Russell Group",   qs: "27",  fields: ["Medicine", "Business", "Engineering"],           highlight: "Graduate visa" },
  { name: "TU Munich",                   country: "🇩🇪 Germany",   rank: "#1 in Germany",   qs: "37",  fields: ["Engineering", "CS", "Sciences"],                 highlight: "Low/No tuition" },
  { name: "McGill University",           country: "🇨🇦 Canada",    rank: "Top 5 Canada",    qs: "32",  fields: ["Medicine", "Law", "Engineering"],                highlight: "Research leader" },
  { name: "University College London",   country: "🇬🇧 UK",        rank: "Russell Group",   qs: "22",  fields: ["Architecture", "Economics", "Medicine"],         highlight: "London campus" },
  { name: "UNSW Sydney",                 country: "🇦🇺 Australia", rank: "Group of Eight",  qs: "19",  fields: ["Engineering", "Commerce", "Law"],                highlight: "Industry links" },
  { name: "University of Amsterdam",     country: "🇳🇱 Netherlands", rank: "Top Dutch Uni", qs: "53", fields: ["Business", "Social Sciences", "Humanities"],      highlight: "English programs" },
  { name: "University of Dublin (TCD)",  country: "🇮🇪 Ireland",   rank: "#1 in Ireland",   qs: "81",  fields: ["Business", "Engineering", "Medicine"],           highlight: "Stay-back visa" },
  { name: "New York University",         country: "🇺🇸 USA",       rank: "Top 50 Global",   qs: "38",  fields: ["Business", "Law", "Arts"],                       highlight: "NYC campus" },
  { name: "University of British Columbia", country: "🇨🇦 Canada", rank: "Top 3 Canada",   qs: "34",  fields: ["Forestry", "Science", "Arts"],                   highlight: "Vancouver campus" },
  { name: "Maastricht University",       country: "🇳🇱 Netherlands", rank: "Top EU Uni",    qs: "246", fields: ["Business", "Law", "Psychology"],                 highlight: "Problem-based learning" },
];

export default function UniversitiesPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-[#1a2f5e] py-20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-[#c9a84c]/5 -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <span className="inline-flex items-center gap-2 bg-[#c9a84c]/20 text-[#c9a84c] text-xs font-semibold uppercase tracking-wider px-4 py-2 rounded-full mb-6">
            <GraduationCap size={13} /> 200+ Partner Universities
          </span>
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-5" style={{ fontFamily: "var(--font-playfair)" }}>
            Find Your <span className="text-gradient-gold">Dream University</span>
          </h1>
          <p className="text-white/65 text-lg max-w-2xl mx-auto leading-relaxed">
            We partner with 200+ top-ranked universities across 25+ countries. Every university
            on our list has been vetted for academic quality, student support, and visa success rates.
          </p>
          <div className="flex flex-wrap justify-center gap-8 mt-12">
            {[
              { icon: GraduationCap, v: "200+",  l: "Partner Universities" },
              { icon: Globe,         v: "25+",   l: "Countries" },
              { icon: Users,         v: "50K+",  l: "Students Placed" },
              { icon: Star,          v: "4.9★",  l: "Average Rating" },
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

      {/* Countries Filter */}
      <section className="bg-white py-14">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10">
            <p className="text-[#c9a84c] font-semibold text-sm uppercase tracking-wider mb-2">Browse by Destination</p>
            <h2 className="text-3xl font-bold text-[#1a2f5e]" style={{ fontFamily: "var(--font-playfair)" }}>
              Choose Your Country
            </h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {COUNTRIES.map((c) => (
              <div key={c.name}
                className="rounded-2xl border border-gray-100 p-5 text-center hover:border-[#c9a84c] hover:shadow-md transition-all duration-200 cursor-pointer group">
                <span className="text-4xl mb-3 block">{c.flag}</span>
                <h3 className="font-bold text-[#1a2f5e] group-hover:text-[#c9a84c] transition-colors">{c.name}</h3>
                <p className="text-gray-500 text-xs mt-1">{c.unis} universities</p>
                <p className="text-gray-400 text-xs mt-0.5">{c.tagline}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Universities */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <p className="text-[#c9a84c] font-semibold text-sm uppercase tracking-wider mb-2">Top Picks</p>
            <h2 className="text-3xl font-bold text-[#1a2f5e]" style={{ fontFamily: "var(--font-playfair)" }}>
              Featured Partner Universities
            </h2>
            <p className="text-gray-500 mt-3 max-w-xl mx-auto text-sm">
              These universities have exceptional Indian student support, strong scholarship programmes,
              and high visa approval rates for our applicants.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURED_UNIS.map((u) => (
              <div key={u.name}
                className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-200 group">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-[#1a2f5e]/8 rounded-xl flex items-center justify-center">
                    <GraduationCap size={22} className="text-[#1a2f5e]" />
                  </div>
                  <Badge className="bg-[#c9a84c]/15 text-[#a07a2e] border-0 text-xs">
                    QS #{u.qs}
                  </Badge>
                </div>
                <h3 className="font-bold text-[#1a2f5e] mb-1 group-hover:text-[#c9a84c] transition-colors">
                  {u.name}
                </h3>
                <p className="text-gray-500 text-sm mb-1">{u.country}</p>
                <p className="text-[#c9a84c] text-xs font-semibold mb-3">{u.rank}</p>
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {u.fields.map((f) => (
                    <span key={f} className="bg-gray-100 text-gray-600 text-xs px-2.5 py-1 rounded-full">{f}</span>
                  ))}
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <span className="text-emerald-600 text-xs font-semibold bg-emerald-50 px-2.5 py-1 rounded-full">
                    ✓ {u.highlight}
                  </span>
                  <button className="text-[#1a2f5e] text-xs font-semibold flex items-center gap-1 hover:text-[#c9a84c] transition-colors">
                    Learn more <ExternalLink size={11} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[#1a2f5e] py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl font-bold text-white mb-4" style={{ fontFamily: "var(--font-playfair)" }}>
            Not Sure Which University to Choose?
          </h2>
          <p className="text-white/65 mb-8 text-lg">
            Let our counselors match you with the perfect university based on your profile.
          </p>
          <Link href="/contact">
            <Button className="bg-[#c9a84c] hover:bg-[#a07a2e] text-white rounded-full px-12 h-12 font-bold gap-2">
              Get Personalised Shortlist <ArrowRight size={16} />
            </Button>
          </Link>
        </div>
      </section>
    </>
  );
}
