import { Metadata } from "next";
import CountryDetailClient from "./CountryDetailClient";

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const title = params.slug.charAt(0).toUpperCase() + params.slug.slice(1);
  return {
    title: `Study in ${title} | MVR Consultants`,
    description: `Explore universities, visas, and life in ${title} with MVR Consultants.`,
  };
}

// Generate static params for the predefined countries
export function generateStaticParams() {
  return [
    { slug: "usa" },
    { slug: "uk" },
    { slug: "canada" },
    { slug: "australia" },
    { slug: "germany" },
    { slug: "ireland" },
  ];
}

export default function CountryDetailPage({ params }: { params: { slug: string } }) {
  return <CountryDetailClient slug={params.slug} />;
}
