import { Metadata } from "next";
import CountryDetailClient from "./CountryDetailClient";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const title = slug.charAt(0).toUpperCase() + slug.slice(1);
  return {
    title: `Study in ${title} | MVR Consultants`,
    description: `Explore universities, visas, and life in ${title} with MVR Consultants.`,
  };
}

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

export default async function CountryDetailPage({ params }: Props) {
  const { slug } = await params;
  return <CountryDetailClient slug={slug} />;
}
