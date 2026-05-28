import type { Metadata } from "next";
import CoursesSearchClient from "./CoursesSearchClient";

export const metadata: Metadata = {
  title: "Search Study Abroad Courses | Bachelors, Masters & MBAs | MVR Consultants",
  description:
    "Explore 150+ academic courses across top destinations including USA, UK, Canada, Australia, Germany and France. Filter by discipline (CS, Engineering, MBA, Medicine), annual budget, and degree level.",
  keywords: [
    "study abroad courses",
    "search degrees abroad",
    "bachelors abroad",
    "masters study abroad",
    "MBA abroad universities",
    "CS engineering study abroad",
    "MVR Consultants courses"
  ],
  openGraph: {
    title: "Search Study Abroad Courses | MVR Consultants",
    description: "Explore 150+ academic courses across top destinations. Filter by degree level, subject area, and tuition limits.",
    type: "website"
  }
};

export default function CoursesPage() {
  return <CoursesSearchClient />;
}
