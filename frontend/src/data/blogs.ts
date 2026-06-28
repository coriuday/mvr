export type StaticBlogPost = {
  title: string;
  category: string;
  readTime: string;
  date: string;
  tags: string[];
  excerpt: string;
  content: string;
};

export const STATIC_BLOG_POSTS: Record<string, StaticBlogPost> = {
  "how-to-get-uk-student-visa": {
    title: "How to Get a UK Student Visa in 2025 — Complete Guide",
    category: "Visa Guide",
    readTime: "8 min read",
    date: "2025-04-15",
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
    category: "Scholarships",
    readTime: "6 min read",
    date: "2025-04-10",
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

/** List shape used by BlogsClient when API is empty or unavailable. */
export function getStaticBlogList() {
  return Object.entries(STATIC_BLOG_POSTS).map(([slug, post]) => ({
    id: slug,
    slug,
    title: post.title,
    excerpt: post.excerpt,
    content: post.content,
    category: post.category,
    readTime: post.readTime,
    created_at: post.date,
    tags: post.tags,
    published: true,
    image_url: null as string | null,
  }));
}
