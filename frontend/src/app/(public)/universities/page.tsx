import type { Metadata } from "next";
import UniversitiesSearchClient from "./UniversitiesSearchClient";

export const metadata: Metadata = {
  title: "Partner Universities — Search Directory | MVR Consultants",
  description:
    "Search and filter 55+ partner universities across USA, UK, Canada, Australia, Germany, France and more. Check entry requirements, annual tuition fees, and IELTS scores.",
  keywords: [
    "study abroad universities",
    "search global universities",
    "partner universities list",
    "study abroad tuition fees",
    "QS ranking universities",
    "MVR Consultants partners"
  ],
  openGraph: {
    title: "Partner Universities Search Directory | MVR Consultants",
    description: "Search and filter 55+ partner universities across 26 global destinations. Filter by budget, QS rank, intake term, and fields of study.",
    type: "website"
  }
};

export default function UniversitiesPage() {
  return <UniversitiesSearchClient />;
}
