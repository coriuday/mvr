import { Metadata } from "next";
import SopReviewerClient from "./SopReviewerClient";

export const metadata: Metadata = {
  title: "Free AI SOP Reviewer | MVR Consultants",
  description:
    "Get instant AI-powered feedback on your Statement of Purpose. Score your SOP across 5 dimensions and receive actionable improvements — free from MVR Consultants.",
};

export default function SopReviewerPage() {
  return <SopReviewerClient />;
}
