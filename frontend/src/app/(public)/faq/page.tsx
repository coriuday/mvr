import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Frequently Asked Questions | MVR Consultants",
  description: "Find answers to your questions about studying abroad, university admissions, and student visas.",
};

const FAQS = [
  {
    q: "How much does it cost to study abroad?",
    a: "Costs vary wildly depending on the country, university, and course. For example, Germany has public universities with near-zero tuition, while top-tier US universities might cost $40k+/year. During counseling, we'll suggest options tailored exactly to your budget.",
  },
  {
    q: "Do I need to take the IELTS or TOEFL?",
    a: "In most cases, yes, if you are applying to an English-speaking country. However, some universities offer waivers if your previous medium of instruction was English. We'll guide you on exact requirements per university.",
  },
  {
    q: "Can you help me get a scholarship?",
    a: "Absolutely. We maintain a database of hundreds of university-specific and government scholarships. We will help you identify which ones you qualify for and assist in drafting strong scholarship essays.",
  },
  {
    q: "Are there part-time work opportunities while studying?",
    a: "Yes, most countries (like the US, UK, Canada, Australia, and Ireland) allow international students to work part-time (usually 20 hours per week) during semesters and full-time during breaks. We'll brief you on the exact visa regulations.",
  },
  {
    q: "What is your success rate for student visas?",
    a: "We currently boast a 98% visa approval rate. Our ex-visa officers conduct rigorous mock interviews and our documentation team ensures every file is flawless before submission.",
  },
];

export default function FAQPage() {
  return (
    <div className="min-h-screen bg-gray-50 pt-32 pb-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-[#1a2f5e] mb-4" style={{ fontFamily: "var(--font-playfair)" }}>
            Frequently Asked <span className="text-[#c9a84c]">Questions</span>
          </h1>
          <p className="text-gray-500 text-lg">Everything you need to know about starting your study abroad journey.</p>
        </div>

        <div className="space-y-6">
          {FAQS.map((faq, i) => (
            <div key={i} className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 transition-all hover:shadow-md">
              <h3 className="text-xl font-bold text-[#1a2f5e] mb-3 flex items-start gap-3">
                <span className="text-[#c9a84c] shrink-0">Q.</span>
                {faq.q}
              </h3>
              <p className="text-gray-600 leading-relaxed pl-8">
                {faq.a}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
