import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Clock, Tag, BookOpen, Share2 } from "lucide-react";

// Same mockup data — will be replaced by API call once DB is live
const MOCK_POSTS: Record<string, {
  title: string; category: string; readTime: string; date: string;
  tags: string[]; excerpt: string; content: string;
}> = {
  "how-to-get-uk-student-visa": {
    title: "How to Get a UK Student Visa in 2025 — Complete Guide",
    category: "Visa Guide", readTime: "8 min read", date: "2025-04-15",
    tags: ["UK", "Visa", "Student Visa"],
    excerpt: "Everything you need to know about the UK Student visa application process.",
    content: `
## What is the UK Student Visa?

The UK Student visa (previously Tier 4) allows you to study at a licensed UK institution for courses longer than 6 months. You must be 16 or older and have been offered a place on a course by a licensed student sponsor.

## Key Requirements

1. **Confirmation of Acceptance for Studies (CAS)** — Your university issues this after you accept your offer and pay any required deposit.
2. **English language proficiency** — IELTS Academic 6.0+ (or equivalent) for most universities.
3. **Financial evidence** — Proof that you can cover tuition fees AND living costs (£1,334/month in London; £1,023/month elsewhere).
4. **Genuine Student requirement** — You may be asked to attend a visa interview.

## Application Steps

1. Receive your Unconditional Offer and CAS number
2. Gather all supporting documents (financial statements, IELTS, passport)
3. Apply online at least **3 months before** your course starts
4. Pay the visa fee (£363) and Immigration Health Surcharge
5. Book a biometrics appointment at a Visa Application Centre
6. Wait 3–8 weeks for your decision

## Common Mistakes to Avoid

- Applying too early (before you receive your CAS)
- Bank statements older than 28 days
- Insufficient financial evidence — especially for London
- Not disclosing previous visa refusals

## How MVR Helps

Our visa specialists have achieved a **98% UK Student visa success rate** over the past 5 years. We prepare a complete document checklist, review your financial evidence, and conduct mock interviews so you are fully prepared.

---

*Ready to start your UK journey? [Book a free consultation](/contact) with our UK visa specialist today.*
    `,
  },
  "top-scholarships-indian-students": {
    title: "Top 10 Scholarships for Indian Students Studying Abroad in 2025",
    category: "Scholarships", readTime: "6 min read", date: "2025-04-10",
    tags: ["Scholarships", "Funding", "India"],
    excerpt: "A curated list of the best fully-funded scholarships for Indian students.",
    content: `
## Why Scholarships Matter

The cost of studying abroad can range from ₹20–80 lakhs depending on the country and course. Scholarships can reduce this to near zero. Here are the top 10 opportunities for 2025.

## 1. Chevening Scholarship (UK)

**Value:** Full funding — tuition + living allowance + return airfare  
**Deadline:** November 2025  
**Eligibility:** 2+ years of work experience, undergraduate degree

## 2. Fulbright-Nehru Fellowship (USA)

**Value:** Full funding for Masters and PhD  
**Deadline:** July 2025  
**Eligibility:** Indian citizens only; strong academic and leadership record

## 3. DAAD Scholarship (Germany)

**Value:** €850–1,200/month stipend  
**Deadline:** October 2025  
**Eligibility:** Bachelor's degree; some knowledge of German for engineering

## 4. Australia Awards

**Value:** Full tuition + living costs + return airfare  
**Deadline:** April 2026  
**Eligibility:** Citizens of eligible countries including India

## 5. Commonwealth Scholarship (UK)

**Value:** Full funding for Masters  
**Deadline:** December 2025  
**Eligibility:** Development-focused courses; low/middle-income country nationals

---

*Need help applying for scholarships? [Contact our scholarship team](/contact) for personalised guidance.*
    `,
  },
};

const CAT_COLORS: Record<string, string> = {
  "Visa Guide":    "bg-blue-100 text-blue-700",
  "Scholarships":  "bg-amber-100 text-amber-700",
  "Immigration":   "bg-emerald-100 text-emerald-700",
  "Test Prep":     "bg-purple-100 text-purple-700",
  "Country Guide": "bg-rose-100 text-rose-700",
  "Admissions":    "bg-indigo-100 text-indigo-700",
};

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 2000);
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/blogs/${slug}`, {
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    const data = await res.json();
    if (data.success && data.data) {
      return {
        title: `${data.data.title} | MVR Consultants Blog`,
        description: data.data.excerpt || data.data.title,
      };
    }
  } catch (err) {
    clearTimeout(timeoutId);
  }
  
  return { title: "Blog | MVR Consultants" };
}

export async function generateStaticParams() {
  return Object.keys(MOCK_POSTS).map((slug) => ({ slug }));
}

// Simple markdown-to-html renderer (minimal, no dependencies)
function renderContent(content: string) {
  return content
    .split("\n")
    .map((line) => {
      if (line.startsWith("## ")) return `<h2 class="text-2xl font-bold text-[#1a2f5e] mt-10 mb-4" style="font-family:var(--font-playfair)">${line.slice(3)}</h2>`;
      if (line.startsWith("## ")) return `<h3 class="text-xl font-bold text-[#1a2f5e] mt-8 mb-3">${line.slice(3)}</h3>`;
      if (line.startsWith("**") && line.endsWith("**")) return `<strong class="text-[#1a2f5e]">${line.slice(2, -2)}</strong>`;
      if (line.startsWith("1. ") || line.startsWith("2. ") || line.startsWith("3. ")) {
        return `<li class="text-gray-600 leading-relaxed mb-1">${line.replace(/^\d+\. /, "")}</li>`;
      }
      if (line.startsWith("- ") || line.startsWith("* ")) {
        return `<li class="text-gray-600 leading-relaxed mb-1">${line.slice(2)}</li>`;
      }
      if (line.startsWith("---")) return `<hr class="my-8 border-gray-200" />`;
      if (line.startsWith("*") && line.endsWith("*")) return `<em class="text-gray-500 text-sm">${line.slice(1, -1)}</em>`;
      if (line.trim() === "") return `<br />`;
      // Replace [text](/link)
      const linkMatch = line.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-[#c9a84c] font-semibold hover:underline">$1</a>');
      return `<p class="text-gray-600 leading-relaxed mb-3">${linkMatch}</p>`;
    })
    .join("\n");
}

export default async function BlogDetailPage({ params }: Props) {
  const { slug } = await params;
  let post = null;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 2000);
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/blogs/${slug}`, {
      next: { revalidate: 60 },
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    const data = await res.json();
    if (data.success && data.data) {
      post = data.data;
    }
  } catch (error) {
    clearTimeout(timeoutId);
    console.error("Failed to fetch blog post:", error);
  }

  // Fallback to mock data if API is down or post not found
  if (!post) {
    const mockPost = MOCK_POSTS[slug];
    if (mockPost) {
      post = {
        ...mockPost,
        created_at: mockPost.date,
        tags: mockPost.tags,
      };
    } else {
      notFound();
    }
  }

  // Handle missing fields from backend
  const category = post.category || "Country Guide";
  const tags = post.tags || [];
  const readTime = post.readTime || "5 min read";

  return (
    <>
      {/* Header */}
      <section className="bg-[#1a2f5e] py-16 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-[#c9a84c]/5 -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6">
          <Link href="/blogs" className="inline-flex items-center gap-2 text-white/50 hover:text-white text-sm mb-8 transition-colors">
            <ArrowLeft size={15} /> Back to Blog
          </Link>
          <span className={`inline-block text-xs font-semibold px-3 py-1 rounded-full mb-5 ${CAT_COLORS[category] ?? "bg-gray-100 text-gray-600"}`}>
            {category}
          </span>
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-6 leading-tight" style={{ fontFamily: "var(--font-playfair)" }}>
            {post.title}
          </h1>
          <div className="flex flex-wrap items-center gap-5 text-white/50 text-sm">
            <span className="flex items-center gap-1.5"><Clock size={13} />{readTime}</span>
            <span>{new Date(post.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</span>
            <span>By {post.author_name || "MVR Consultants Editorial Team"}</span>
            <div className="flex gap-2 ml-auto">
              {tags.map((t: string) => (
                <span key={t} className="bg-white/10 text-white/70 px-2.5 py-1 rounded-full text-xs flex items-center gap-1">
                  <Tag size={9} />{t}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="bg-white py-14">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-4 gap-12">
            <article className="lg:col-span-3 prose-sm max-w-none">
              <div
                className="text-gray-600 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: renderContent(post.content) }}
              />
            </article>

            {/* Sidebar */}
            <aside className="space-y-6">
              <div className="bg-[#1a2f5e] rounded-2xl p-6 text-white sticky top-24">
                <BookOpen size={24} className="text-[#c9a84c] mb-3" />
                <h3 className="font-bold mb-2 text-lg" style={{ fontFamily: "var(--font-playfair)" }}>
                  Need Help?
                </h3>
                <p className="text-white/65 text-sm leading-relaxed mb-5">
                  Our expert counselors are here to guide you through every step of your study abroad journey.
                </p>
                <Link href="/contact"
                  className="block w-full bg-[#c9a84c] hover:bg-[#a07a2e] text-white text-center font-bold py-3 rounded-xl transition-colors text-sm">
                  Book Free Consultation
                </Link>
              </div>

              <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
                <p className="font-semibold text-[#1a2f5e] mb-3 text-sm">Tags</p>
                <div className="flex flex-wrap gap-2">
                  {tags.map((t: string) => (
                    <span key={t} className="bg-white border border-gray-200 text-gray-600 text-xs px-3 py-1.5 rounded-full">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>

      {/* Related CTA */}
      <section className="bg-gray-50 py-14 border-t border-gray-100">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <p className="text-[#c9a84c] font-semibold text-xs uppercase tracking-wider mb-2">More Guides</p>
          <h2 className="text-2xl font-bold text-[#1a2f5e] mb-6" style={{ fontFamily: "var(--font-playfair)" }}>
            Continue Reading
          </h2>
          <Link href="/blogs"
            className="inline-flex items-center gap-2 bg-[#1a2f5e] hover:bg-[#2a4a8e] text-white font-bold px-8 py-3 rounded-full transition-colors">
            <BookOpen size={15} /> Browse All Articles
          </Link>
        </div>
      </section>
    </>
  );
}
