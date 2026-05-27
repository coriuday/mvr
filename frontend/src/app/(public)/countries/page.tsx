import { Metadata } from "next";
import CountriesPageClient from "./CountriesPageClient";
import { ALL_COUNTRIES } from "@/constants/countries";

export const metadata: Metadata = {
  title: "Study Destinations | MVR Consultants",
  description:
    "Explore top study abroad destinations including the USA, UK, Canada, Australia, Germany, and Ireland with MVR Consultants.",
};

export interface CountryCard {
  slug: string;
  name: string;
  flag: string;
  tagline: string;
  image_url?: string | null;
}

/**
 * Fetch country cards from the backend API (SSR).
 * Falls back to the static constant if the DB is unavailable so the
 * page never returns a 500 during cold starts or DB downtime.
 */
async function fetchCountryCards(): Promise<CountryCard[]> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";
    const res = await fetch(`${apiUrl}/api/countries`, {
      next: { revalidate: 300 }, // ISR: re-fetch every 5 minutes
      signal: AbortSignal.timeout(10_000), // fail fast → use static fallback
    });
    if (!res.ok) throw new Error(`API returned ${res.status}`);
    const json = await res.json();
    const cards = json?.data as CountryCard[] | undefined;
    // If the table is empty (DB not seeded yet) fall through to static data
    if (Array.isArray(cards) && cards.length > 0) return cards;
  } catch (err) {
    console.warn("[countries/page] API unavailable — using static fallback:", err);
  }

  // Static fallback — same shape as CountryCard
  return ALL_COUNTRIES.map((c) => ({
    slug:      c.id,
    name:      c.name,
    flag:      c.flag,
    tagline:   c.tagline,
    image_url: null,
  }));
}

export default async function CountriesPage() {
  const cards = await fetchCountryCards();
  return <CountriesPageClient cards={cards} />;
}
