"use client";

import { useState } from "react";
import Link from "next/link";
import { BookOpen, Clock, Tag, ArrowRight } from "lucide-react";

const MOCK_POSTS = [
  { slug: "how-to-get-uk-student-visa",        title: "How to Get a UK Student Visa in 2025 — Complete Guide",                          excerpt: "Everything you need to know about the UK Student visa application process, from CAS numbers to biometrics and timelines.",                                  category: "Visa Guide",    readTime: "8 min read",  date: "2025-04-15", tags: ["UK", "Visa"],       featured: true  },
  { slug: "top-scholarships-indian-students",   title: "Top 10 Scholarships for Indian Students Studying Abroad in 2025",               excerpt: "A curated list of the best fully-funded and partial scholarships available to Indian students across USA, UK, Canada, and Europe.",                        category: "Scholarships",  readTime: "6 min read",  date: "2025-04-10", tags: ["Funding", "India"], featured: true  },
  { slug: "canada-pr-through-study",            title: "Canada PR Through Study: PGWP and Express Entry Explained",                      excerpt: "How studying in Canada can be your first step toward permanent residency. We break down PGWP, CRS scores, and Express Entry pathways.",                    category: "Immigration",   readTime: "10 min read", date: "2025-04-05", tags: ["Canada", "PR"],     featured: false },
  { slug: "ielts-vs-toefl",                     title: "IELTS vs TOEFL 2025: Which Test Is Right for Your Dream University?",            excerpt: "A detailed comparison of IELTS and TOEFL — scoring, university acceptance, test format, and our recommendation.",                                         category: "Test Prep",     readTime: "5 min read",  date: "2025-03-28", tags: ["IELTS", "TOEFL"],   featured: false },
  { slug: "germany-free-tuition-guide",         title: "Study in Germany for Free: Public Universities and How to Apply",               excerpt: "German public universities charge almost zero tuition. Here is how Indian students can get admission and what living costs look like.",                    category: "Country Guide", readTime: "7 min read",  date: "2025-03-20", tags: ["Germany", "Europe"], featured: false },
  { slug: "sop-writing-guide",                  title: "How to Write a Statement of Purpose That Gets You Admitted",                    excerpt: "Your SOP is the single most important document in your application. A step-by-step guide on structure, mistakes, and what top universities want.",      category: "Admissions",    readTime: "9 min read",  date: "2025-03-12", tags: ["SOP", "Admissions"], featured: false },
];

const CATEGORIES = ["All", "Visa Guide", "Scholarships", "Immigration", "Test Prep", "Country Guide", "Admissions"];

const CAT_COLORS: Record<string, string> = {
  "Visa Guide":    "bg-blue-100 text-blue-700",
  "Scholarships":  "bg-amber-100 text-amber-700",
  "Immigration":   "bg-emerald-100 text-emerald-700",
  "Test Prep":     "bg-purple-100 text-purple-700",
  "Country Guide": "bg-rose-100 text-rose-700",
  "Admissions":    "bg-indigo-100 text-indigo-700",
};

export default function BlogsClient() {
  const [activeCategory, setActiveCategory] = useState("All");
  const featured = MOCK_POSTS.find((p) => p.featured);
  const filtered = activeCategory === "All"
    ? MOCK_POSTS
    : MOCK_POSTS.filter((p) => p.category === activeCategory);

  return (
    <>
      {/* Hero */}
      <section className="bg-[#1a2f5e] py-16 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-[#c9a84c]/5 -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <span className="inline-flex items-center gap-2 bg-[#c9a84c]/20 text-[#c9a84c] text-xs font-semibold uppercase tracking-wider px-4 py-2 rounded-full mb-6">
            <BookOpen size={13} /> Expert Guides & Stories
          </span>
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4" style={{ fontFamily: "var(--font-playfair)" }}>
            Study Abroad <span className="text-gradient-gold">Insights</span>
          </h1>
          <p className="text-white/65 text-lg max-w-xl mx-auto">
            Visa guides, scholarship tips, SOP advice, and real student success stories — all in one place.
          </p>
        </div>
      </section>

      {/* Featured */}
      {featured && activeCategory === "All" && (
        <section className="bg-white py-12">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <p className="text-[#c9a84c] font-semibold text-xs uppercase tracking-wider mb-5">Featured Article</p>
            <Link href={`/blogs/${featured.slug}`}
              className="group grid lg:grid-cols-5 gap-8 bg-gradient-to-br from-[#1a2f5e] to-[#2a4a8e] rounded-3xl p-8 lg:p-10 hover:shadow-2xl transition-all duration-300">
              <div className="lg:col-span-3 flex flex-col justify-between">
                <div>
                  <span className={`inline-block text-xs font-semibold px-3 py-1 rounded-full mb-4 ${CAT_COLORS[featured.category] ?? "bg-gray-100 text-gray-600"}`}>
                    {featured.category}
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4 group-hover:text-[#c9a84c] transition-colors leading-tight"
                    style={{ fontFamily: "var(--font-playfair)" }}>
                    {featured.title}
                  </h2>
                  <p className="text-white/65 leading-relaxed">{featured.excerpt}</p>
                </div>
                <div className="flex items-center gap-5 mt-6 text-white/50 text-sm">
                  <span className="flex items-center gap-1.5"><Clock size={13} />{featured.readTime}</span>
                  <span>{new Date(featured.date).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</span>
                  <span className="ml-auto flex items-center gap-1 text-[#c9a84c] font-semibold">
                    Read Article <ArrowRight size={14} />
                  </span>
                </div>
              </div>
              <div className="lg:col-span-2 bg-white/10 rounded-2xl flex items-center justify-center min-h-40">
                <BookOpen size={64} className="text-white/20" />
              </div>
            </Link>
          </div>
        </section>
      )}

      {/* Grid */}
      <section className="bg-gray-50 py-14 pb-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          {/* Category filter */}
          <div className="flex flex-wrap gap-2 mb-10">
            {CATEGORIES.map((c) => (
              <button key={c} onClick={() => setActiveCategory(c)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  activeCategory === c
                    ? "bg-[#1a2f5e] text-white shadow-md"
                    : "bg-white text-gray-500 border border-gray-200 hover:border-[#c9a84c] hover:text-[#c9a84c]"
                }`}>
                {c}
              </button>
            ))}
          </div>

          {filtered.length === 0 ? (
            <div className="text-center py-16 text-gray-400">No posts in this category yet.</div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((post) => (
                <Link key={post.slug} href={`/blogs/${post.slug}`}
                  className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-200 group flex flex-col">
                  <div className="h-36 bg-gradient-to-br from-[#1a2f5e]/5 to-[#c9a84c]/5 flex items-center justify-center">
                    <BookOpen size={36} className="text-[#1a2f5e]/20" />
                  </div>
                  <div className="p-5 flex flex-col flex-1">
                    <span className={`self-start text-xs font-semibold px-2.5 py-1 rounded-full mb-3 ${CAT_COLORS[post.category] ?? "bg-gray-100 text-gray-600"}`}>
                      {post.category}
                    </span>
                    <h3 className="font-bold text-[#1a2f5e] leading-snug mb-2 group-hover:text-[#c9a84c] transition-colors flex-1"
                      style={{ fontFamily: "var(--font-playfair)" }}>
                      {post.title}
                    </h3>
                    <p className="text-gray-500 text-sm leading-relaxed line-clamp-2">{post.excerpt}</p>
                    <div className="flex items-center gap-3 mt-4 pt-4 border-t border-gray-100 text-gray-400 text-xs">
                      <span className="flex items-center gap-1"><Clock size={11} />{post.readTime}</span>
                      <span>{new Date(post.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</span>
                      <div className="flex gap-1 ml-auto">
                        {post.tags.slice(0, 2).map((t) => (
                          <span key={t} className="bg-gray-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                            <Tag size={9} />{t}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[#1a2f5e] py-14">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-2xl font-bold text-white mb-3" style={{ fontFamily: "var(--font-playfair)" }}>
            Get Study Abroad Tips in Your Inbox
          </h2>
          <p className="text-white/60 mb-6">Join 20,000+ students receiving weekly visa updates and scholarship alerts.</p>
          <Link href="/contact">
            <button className="bg-[#c9a84c] hover:bg-[#a07a2e] text-white font-bold px-10 py-3 rounded-full transition-colors">
              Subscribe to Newsletter
            </button>
          </Link>
        </div>
      </section>
    </>
  );
}
