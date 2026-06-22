import { apiUrl } from "@/lib/api-url";
import { UNIVERSITIES, type University } from "@/data/universities";

export interface ApiUniversity {
  id: string;
  slug?: string | null;
  name: string;
  country: string;
  flag?: string | null;
  ranking?: string | null;
  fees?: string | null;
  intake?: string | null;
  duration?: string | null;
  scholarship?: string | null;
  ielts?: string | null;
  ieltsMin?: number | null;
  gpaMin?: number | null;
  annualTuitionUsd?: number | null;
  programs?: string[];
  description?: string | null;
  isFeatured?: boolean;
  isActive?: boolean;
}

export function mapApiUniversity(u: ApiUniversity): University {
  return {
    id: u.slug || u.id,
    name: u.name,
    country: u.country,
    flag: u.flag || "🎓",
    ranking: u.ranking || "—",
    fees: u.fees || "—",
    intake: u.intake || "—",
    duration: u.duration || "—",
    scholarship: u.scholarship || "",
    ielts: u.ielts || "—",
    ieltsMin: u.ieltsMin ?? 6.0,
    gpaMin: u.gpaMin ?? 7.0,
    annualTuitionUsd: u.annualTuitionUsd ?? 50000,
    programs: u.programs ?? [],
    description: u.description || "",
  };
}

export async function fetchUniversities(perPage = 500): Promise<University[]> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);
  try {
    const res = await fetch(apiUrl(`/api/universities?per_page=${perPage}`), {
      signal: controller.signal,
      next: { revalidate: 120 },
    });
    clearTimeout(timeoutId);
    if (!res.ok) throw new Error(`API ${res.status}`);
    const json = await res.json();
    const rows = json?.data as ApiUniversity[] | undefined;
    if (Array.isArray(rows) && rows.length > 0) {
      return rows.map(mapApiUniversity);
    }
  } catch {
    clearTimeout(timeoutId);
  }
  return UNIVERSITIES;
}

export async function fetchUniversityBySlug(slug: string): Promise<University | null> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);
  try {
    const res = await fetch(apiUrl(`/api/universities/${slug}`), {
      signal: controller.signal,
      next: { revalidate: 60 },
    });
    clearTimeout(timeoutId);
    if (!res.ok) return null;
    const json = await res.json();
    if (json?.success && json?.data) return mapApiUniversity(json.data as ApiUniversity);
  } catch {
    clearTimeout(timeoutId);
  }
  return UNIVERSITIES.find((u) => u.id === slug) ?? null;
}

export async function fetchUniversitySlugs(): Promise<string[]> {
  const unis = await fetchUniversities();
  return unis.map((u) => u.id);
}
