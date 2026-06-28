import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Clock, Tag, BookOpen } from "lucide-react";
import DOMPurify from "isomorphic-dompurify";
import { apiUrl } from "@/lib/api-url";
import { STATIC_BLOG_POSTS } from "@/data/blogs";

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

/** Shared fetcher — Next.js deduplicates identical fetch() calls within the same render. */
async function fetchBlogPost(slug: string) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 s — allows Render cold start
  try {
    const res = await fetch(
      apiUrl(`/api/blogs/${slug}`),
      { next: { revalidate: 60 }, signal: controller.signal }
    );
    clearTimeout(timeoutId);
    if (!res.ok) return null;
    const data = await res.json();
    if (data.success && data.data) return data.data;
  } catch {
    clearTimeout(timeoutId);
  }
  return null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await fetchBlogPost(slug);
  if (post) {
    return {
      title: `${post.title} | MVR Consultants Blog`,
      description: post.excerpt || post.title,
    };
  }
  return { title: "Blog | MVR Consultants" };
}

export async function generateStaticParams() {
  return Object.keys(STATIC_BLOG_POSTS).map((slug) => ({ slug }));
}

// Simple markdown-to-html renderer (minimal, no dependencies)
// BUG-014: sanitizeHref blocks javascript: and data: URIs in markdown links
function sanitizeHref(url: string): string {
  const trimmed = url.trim().toLowerCase();
  // Allow only http/https/relative paths — block javascript:/data:/vbscript: etc.
  if (trimmed.startsWith("javascript:") || trimmed.startsWith("data:") || trimmed.startsWith("vbscript:")) {
    return "#";
  }
  return url;
}

/** HTML-encodes dangerous characters in a plain-text string before it is
 * embedded inside HTML tag content. Prevents raw < > & from DB content
 * being interpreted as HTML tags (M-8 fix). */
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function renderContent(content: string) {
  const rawHtml = content
    .split("\n")
    .map((line) => {
      const escaped = escapeHtml(line);
      if (escaped.startsWith("## ")) return `<h2 class="text-2xl font-bold text-[#1a2f5e] mt-10 mb-4" style="font-family:var(--font-playfair)">${escaped.slice(3)}</h2>`;
      if (escaped.startsWith("### ")) return `<h3 class="text-xl font-bold text-[#1a2f5e] mt-8 mb-3">${escaped.slice(4)}</h3>`;
      if (escaped.startsWith("**") && escaped.endsWith("**")) return `<strong class="text-[#1a2f5e]">${escaped.slice(2, -2)}</strong>`;
      if (/^\d+\. /.test(escaped)) {
        return `<li class="text-gray-600 leading-relaxed mb-1">${escaped.replace(/^\d+\.\s+/, "")}</li>`;
      }
      if (escaped.startsWith("- ") || escaped.startsWith("* ")) {
        return `<li class="text-gray-600 leading-relaxed mb-1">${escaped.slice(2)}</li>`;
      }
      if (escaped.startsWith("---")) return `<hr class="my-8 border-gray-200" />`;
      if (escaped.startsWith("*") && escaped.endsWith("*")) return `<em class="text-gray-500 text-sm">${escaped.slice(1, -1)}</em>`;
      if (escaped.trim() === "") return `<br />`;
      // Replace [text](/link) — sanitize href to block XSS
      const withLinks = escaped.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_match, text, url) => {
        const safeUrl = sanitizeHref(decodeURIComponent(url));
        return `<a href="${safeUrl}" class="text-[#c9a84c] font-semibold hover:underline" rel="noopener noreferrer">${text}</a>`;
      });
      return `<p class="text-gray-600 leading-relaxed mb-3">${withLinks}</p>`;
    })
    .join("\n");

  // C-3 security fix: sanitize the generated HTML with DOMPurify.
  // This is the last line of defence — even if renderContent produces
  // something unsafe (e.g. due to a bug), DOMPurify strips it here.
  return DOMPurify.sanitize(rawHtml, {
    ALLOWED_TAGS: [
      "p", "h2", "h3", "strong", "em", "a", "li", "ul", "ol",
      "hr", "br", "span",
    ],
    ALLOWED_ATTR: ["href", "class", "style", "rel", "target"],
    ALLOW_DATA_ATTR: false,
    FORBID_TAGS: ["script", "iframe", "object", "embed", "form", "input"],
    FORBID_ATTR: ["onerror", "onclick", "onload", "onmouseover"],
  });
}

export default async function BlogDetailPage({ params }: Props) {
  const { slug } = await params;
  let post = await fetchBlogPost(slug);

  // Fallback to mock data if API is down or post not found
  if (!post) {
    const mockPost = STATIC_BLOG_POSTS[slug];
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
