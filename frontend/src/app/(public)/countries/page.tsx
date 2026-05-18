import { Metadata } from "next";
import CountriesPageClient from "./CountriesPageClient";

export const metadata: Metadata = {
  title: "Study Destinations | MVR Consultants",
  description: "Explore top study abroad destinations including the USA, UK, Canada, Australia, Germany, and Ireland with MVR Consultants.",
};

export default function CountriesPage() {
  return <CountriesPageClient />;
}
