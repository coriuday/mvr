import type { Metadata } from "next";
import EligibilityClient from "./EligibilityClient";

export const metadata: Metadata = {
  title: "Admissions Eligibility Checker | GPA, IELTS & Backlogs | MVR Consultants",
  description:
    "Evaluate your academic profile (GPA/CGPA) and English language scores (IELTS, TOEFL, PTE) to instantly match with top-ranked partner universities and scholarships in the US, UK, Canada, and Germany.",
  keywords: [
    "study abroad eligibility check",
    "admissions score evaluator",
    "CGPA to US GPA matching",
    "IELTS requirement checker",
    "backlogs admission evaluation",
    "MVR Consultants matcher"
  ],
  openGraph: {
    title: "Admissions Eligibility Checker | MVR Consultants",
    description: "Check your study abroad eligibility in seconds. Input your CGPA/GPA, IELTS band, and find qualified partner universities and funding.",
    type: "website"
  }
};

export default function EligibilityPage() {
  return <EligibilityClient />;
}
