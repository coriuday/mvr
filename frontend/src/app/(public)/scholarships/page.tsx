import type { Metadata } from "next";
import ScholarshipsClient from "./ScholarshipsClient";

export const metadata: Metadata = {
  title: "Scholarships — Study Abroad Funding | MVR Consultants",
  description:
    "Discover scholarships, grants, and financial aid opportunities for Indian students studying abroad in USA, UK, Canada, Australia, Germany, and more.",
};

export default function ScholarshipsPage() {
  return <ScholarshipsClient />;
}
