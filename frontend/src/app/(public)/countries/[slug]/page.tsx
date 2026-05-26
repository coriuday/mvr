import { Metadata } from "next";
import { notFound } from "next/navigation";
import CountryDetailClient from "./CountryDetailClient";
import type { CountryData } from "@/types/country";

type Props = { params: Promise<{ slug: string }> };

// All 26 country slugs
const ALL_SLUGS = [
  "australia", "austria", "belgium", "canada", "cyprus", "denmark",
  "dubai", "finland", "france", "georgia", "germany", "hungary",
  "ireland", "italy", "japan", "lithuania", "malaysia", "netherlands",
  "new-zealand", "russia", "singapore", "spain", "switzerland", "sweden",
  "uk", "usa",
];

async function getCountryData(slug: string): Promise<CountryData | null> {
  if (!ALL_SLUGS.includes(slug)) return null;
  try {
    const data = await import(`@/data/countries/${slug}.json`);
    return data.default as CountryData;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const country = await getCountryData(slug);

  if (!country) {
    return { title: "Country Not Found | MVR Consultants" };
  }

  return {
    title: `Study in ${country.name} | Fees, Visa & Scholarships | MVR Consultants`,
    description: `${country.description} Explore top universities, tuition fees, visa requirements, scholarships, and work permit rules for Indian students studying in ${country.name}.`,
    keywords: [
      `study in ${country.name}`,
      `${country.name} student visa`,
      `${country.name} universities`,
      `${country.name} scholarships`,
      `study abroad ${country.name}`,
      `${country.name} tuition fees`,
      `${country.name} work permit`,
    ],
    openGraph: {
      title: `Study in ${country.name} | MVR Consultants`,
      description: country.description,
      images: [{ url: country.heroImage, width: 1200, height: 630, alt: `Study in ${country.name}` }],
    },
  };
}

export function generateStaticParams() {
  return ALL_SLUGS.map((slug) => ({ slug }));
}

export default async function CountryDetailPage({ params }: Props) {
  const { slug } = await params;
  const country = await getCountryData(slug);

  if (!country) {
    notFound();
  }

  return <CountryDetailClient slug={slug} country={country} />;
}
