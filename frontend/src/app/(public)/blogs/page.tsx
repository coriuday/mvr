import type { Metadata } from "next";
import BlogsClient from "./BlogsClient";

export const metadata: Metadata = {
  title: "Study Abroad Blog — Tips, Guides & Success Stories | MVR Consultants",
  description:
    "Read expert guides on studying abroad, student visa tips, scholarship advice, and success stories from students who achieved their dreams with MVR Consultants.",
};

export default function BlogsPage() {
  return <BlogsClient />;
}
