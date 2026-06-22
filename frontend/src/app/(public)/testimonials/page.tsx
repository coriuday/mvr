import type { Metadata } from "next";
import TestimonialsPageClient from "./TestimonialsPageClient";

export const metadata: Metadata = {
  title: "Student Testimonials | MVR Consultants",
  description: "Read success stories from Indian students who studied abroad with MVR Consultants.",
};

export default function TestimonialsPage() {
  return <TestimonialsPageClient />;
}
