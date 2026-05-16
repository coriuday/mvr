import type { Metadata } from "next";
import ContactPageClient from "./ContactPageClient";

export const metadata: Metadata = {
  title: "Contact Us — Free Study Abroad Consultation | MVR Consultants",
  description:
    "Get a free consultation from MVR Consultants. Our expert advisors guide you through university admissions, student visa applications, and scholarship opportunities across 25+ countries.",
};

export default function ContactPage() {
  return <ContactPageClient />;
}
