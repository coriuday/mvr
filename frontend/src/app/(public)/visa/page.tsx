import { Metadata } from "next";
import VisaPageClient from "./VisaPageClient";

export const metadata: Metadata = {
  title: "Student Visa Assistance | MVR Consultants",
  description: "Expert guidance for student visas. We boast a 98% visa success rate for the USA, UK, Canada, Australia, and Europe.",
};

export default function VisaPage() {
  return <VisaPageClient />;
}
