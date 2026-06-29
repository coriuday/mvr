import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowRight, CheckCircle2, Users, Building2, FileText,
  GraduationCap, Globe, CreditCard, Plane, Home,
  ChevronDown, Phone,
} from "lucide-react";
import { Button } from "@/components/ui/button";

// ─── Service content data ─────────────────────────────────────────────────────
const SERVICES: Record<string, {
  slug: string;
  title: string;
  tagline: string;
  description: string;
  icon: React.ReactNode;
  badge: string;
  stats: { value: string; label: string }[];
  features: { title: string; items: string[] }[];
  process: { step: string; title: string; desc: string }[];
  faqs: { q: string; a: string }[];
}> = {
  career: {
    slug: "career",
    title: "Career Counselling",
    tagline: "Find Your Path",
    description:
      "Personalised, data-driven career counselling to identify the right program, country, and university for your aspirations and profile.",
    icon: <Users size={28} className="text-[#c9a84c]" />,
    badge: "Career Guidance",
    stats: [
      { value: "4K+", label: "Students Counselled" },
      { value: "95%", label: "Goal-Match Rate" },
      { value: "50+", label: "Career Paths Mapped" },
    ],
    features: [
      {
        title: "What We Offer",
        items: [
          "In-depth profile evaluation & gap analysis",
          "Career aptitude & interest assessment",
          "Course and program recommendations",
          "Country & university shortlisting aligned to goals",
          "Salary benchmarking for target career paths",
          "Long-term career roadmap planning",
        ],
      },
      {
        title: "Why Choose Us",
        items: [
          "Experienced counsellors with global education expertise",
          "Data-backed recommendations, not guesswork",
          "One-on-one sessions with dedicated counsellor",
          "Follow-up support throughout the application journey",
        ],
      },
    ],
    process: [
      { step: "01", title: "Book Consultation", desc: "Schedule a free 30-minute intro session with our counselling team." },
      { step: "02", title: "Profile Assessment", desc: "We evaluate your academics, interests, budget, and career goals." },
      { step: "03", title: "Career Mapping", desc: "Receive a tailored report with programs, universities, and countries." },
      { step: "04", title: "Action Plan", desc: "Get a step-by-step roadmap from application to admission." },
      { step: "05", title: "Ongoing Support", desc: "We stay with you throughout the entire journey." },
    ],
    faqs: [
      { q: "How long does a career counselling session take?", a: "Initial sessions are 60–90 minutes. Follow-up sessions are typically 30–45 minutes. We recommend 2–3 sessions for a comprehensive career plan." },
      { q: "Is career counselling only for students who don't know what to study?", a: "Not at all. Even students with a clear goal benefit from counselling to identify the best universities, funding options, and application strategy." },
      { q: "Do you provide counselling for working professionals?", a: "Yes. We have dedicated counsellors for professionals looking to pursue an MBA, Master's, or executive programs abroad." },
      { q: "Is the first consultation free?", a: "Yes. We offer a complimentary 30-minute consultation to understand your profile before recommending any paid service." },
    ],
  },
  university: {
    slug: "university",
    title: "University Selection",
    tagline: "Find Your Perfect Fit",
    description:
      "Expert-curated university shortlists based on your academic profile, budget, career goals, and intake deadlines — matched to give you the best acceptance chances.",
    icon: <Building2 size={28} className="text-[#c9a84c]" />,
    badge: "Admissions Strategy",
    stats: [
      { value: "200+", label: "Partner Universities" },
      { value: "92%", label: "Offer Rate" },
      { value: "26", label: "Countries Covered" },
    ],
    features: [
      {
        title: "Selection Process",
        items: [
          "Academic profile evaluation (GPA, backlogs, work experience)",
          "Program-specific ranking analysis",
          "Safe, moderate, and ambitious university tiers",
          "Tuition fee vs ROI comparison",
          "Intake and application deadline tracking",
          "Post-study work permit & visa success rates",
        ],
      },
      {
        title: "What You Receive",
        items: [
          "Personalised shortlist of 8–12 universities",
          "Detailed profile-match analysis",
          "Acceptance probability estimates",
          "Fee and scholarship breakdown per university",
        ],
      },
    ],
    process: [
      { step: "01", title: "Profile Submission", desc: "Share your academic records, test scores, and preferences." },
      { step: "02", title: "Eligibility Check", desc: "We verify your eligibility against each university's requirements." },
      { step: "03", title: "Shortlist Creation", desc: "Receive a tiered list of safe, moderate, and reach universities." },
      { step: "04", title: "Review Meeting", desc: "Discuss the shortlist and refine based on your feedback." },
      { step: "05", title: "Application Start", desc: "Move forward with applications to your selected universities." },
    ],
    faqs: [
      { q: "How many universities should I apply to?", a: "We recommend 6–10 universities across safe, moderate, and ambitious tiers to maximise your chances of getting at least 2–3 offers." },
      { q: "Do you help with universities that are not on a ranking list?", a: "Yes. Rankings are one factor. We also consider graduate employment rates, location, program specialisation, and visa success rates." },
      { q: "Can I change my shortlist after reviewing?", a: "Absolutely. We offer one full revision of your shortlist based on your feedback at no extra cost." },
      { q: "Do you have partnerships with universities?", a: "Yes, we have direct partnerships with 200+ universities, which means faster processing and sometimes fee waivers for our students." },
    ],
  },
  application: {
    slug: "application",
    title: "Application Support",
    tagline: "Craft Your Best Application",
    description:
      "End-to-end application management — SOP writing, LOR guidance, document review, and submission support to maximise your admission chances.",
    icon: <FileText size={28} className="text-[#c9a84c]" />,
    badge: "Application Management",
    stats: [
      { value: "5K+", label: "Applications Processed" },
      { value: "94%", label: "Offer Success Rate" },
      { value: "3+", label: "Offers Per Student Avg" },
    ],
    features: [
      {
        title: "Application Services",
        items: [
          "Statement of Purpose (SOP) writing & multiple revisions",
          "Letter of Recommendation (LOR) coaching for referees",
          "Personal statement and essay writing support",
          "CV / resume review and optimisation",
          "Application form filling and submission",
          "Document checklist and verification",
        ],
      },
      {
        title: "Interview Preparation",
        items: [
          "University-specific mock interviews",
          "Common question preparation and answer coaching",
          "Video interview best practices",
          "Post-interview follow-up strategy",
        ],
      },
    ],
    process: [
      { step: "01", title: "Document Gathering", desc: "We provide a complete checklist of all required documents." },
      { step: "02", title: "SOP Drafting", desc: "Our writers create a compelling first draft tailored to each university." },
      { step: "03", title: "Review & Revise", desc: "Multiple revision rounds until you are fully satisfied." },
      { step: "04", title: "Application Filing", desc: "We fill, review, and submit applications on your behalf." },
      { step: "05", title: "Offer Tracking", desc: "We track all applications and notify you of updates." },
    ],
    faqs: [
      { q: "How many SOP revisions are included?", a: "We offer unlimited revisions until you are satisfied. Our goal is to ensure your SOP perfectly represents your profile and goals." },
      { q: "Can you help if I have backlogs or low GPA?", a: "Yes. We specialise in crafting strong applications that contextualise academic challenges and highlight your strengths and experiences." },
      { q: "Do you submit the applications or do I?", a: "We can do either. We prefer to guide you through submission so you understand the process, but we are happy to handle it fully." },
      { q: "How early should I start my application?", a: "Ideally 6–9 months before your intended intake. This allows ample time for SOP writing, university research, and documentation." },
    ],
  },
  scholarship: {
    slug: "scholarship",
    title: "Scholarship Assistance",
    tagline: "Fund Your Dream",
    description:
      "Identify, match, and apply for scholarships, grants, and financial aid worth thousands of dollars — reducing your study abroad costs significantly.",
    icon: <GraduationCap size={28} className="text-[#c9a84c]" />,
    badge: "Financial Aid",
    stats: [
      { value: "₹5Cr+", label: "Scholarships Secured" },
      { value: "500+", label: "Scholarships Tracked" },
      { value: "85%", label: "Applicants Funded" },
    ],
    features: [
      {
        title: "Scholarship Discovery",
        items: [
          "Profile-based scholarship matching",
          "Government, university, and private scholarships",
          "Country-specific funding opportunities",
          "Deadline tracking and application calendar",
          "Education loan guidance with partner banks",
          "Merit and need-based scholarship identification",
        ],
      },
      {
        title: "Application Support",
        items: [
          "Scholarship essay and motivation letter writing",
          "Reference letter guidance for scholarship applications",
          "Budget planning and financial documentation",
          "Follow-up and award acceptance support",
        ],
      },
    ],
    process: [
      { step: "01", title: "Profile Matching", desc: "We match your profile to scholarships you are eligible for." },
      { step: "02", title: "Priority List", desc: "Create a prioritised calendar of deadlines and requirements." },
      { step: "03", title: "Essay Writing", desc: "Craft compelling scholarship essays tailored to each award." },
      { step: "04", title: "Submission", desc: "Submit applications with all supporting documentation." },
      { step: "05", title: "Follow-up", desc: "Track results and assist with award acceptance and conditions." },
    ],
    faqs: [
      { q: "What types of scholarships do you help with?", a: "We help with government scholarships (Chevening, DAAD, Fulbright), university merit scholarships, private trusts, and education loans." },
      { q: "Do I need very high grades to get a scholarship?", a: "Not always. Many scholarships consider leadership, community service, and personal circumstances alongside academics." },
      { q: "Can you help with education loans if I don't get a scholarship?", a: "Yes. We work with partner banks and NBFCs to help you secure education loans at competitive interest rates." },
      { q: "Is scholarship assistance included in your standard package?", a: "Scholarship identification is included. Full scholarship application support (essay writing, submission) is an add-on service." },
    ],
  },
  visa: {
    slug: "visa",
    title: "Visa Assistance",
    tagline: "98% Visa Success Rate",
    description:
      "Expert student visa guidance with a 98% success rate. Complete documentation support, mock interviews, and application submission for all major study destinations.",
    icon: <Globe size={28} className="text-[#c9a84c]" />,
    badge: "Visa Guidance",
    stats: [
      { value: "98%", label: "Visa Success Rate" },
      { value: "20+", label: "Countries Handled" },
      { value: "40K+", label: "Visas Processed" },
    ],
    features: [
      {
        title: "Countries We Cover",
        items: [
          "USA — F-1 Student Visa",
          "UK — Student Visa (formerly Tier 4)",
          "Canada — Study Permit",
          "Australia — Student Visa (Subclass 500)",
          "Germany, France, Ireland — European Student Visa",
          "New Zealand, Singapore, UAE, and more",
        ],
      },
      {
        title: "Our Visa Service Includes",
        items: [
          "Visa type selection and eligibility check",
          "Complete document checklist and preparation",
          "Financial documentation and bank statement guidance",
          "DS-160, IMM1294, and other form filling",
          "Mock visa interview coaching",
          "Application submission and tracking",
        ],
      },
    ],
    process: [
      { step: "01", title: "Eligibility Review", desc: "We verify your visa eligibility and identify the correct visa type." },
      { step: "02", title: "Document Prep", desc: "Receive a tailored checklist and assistance gathering every document." },
      { step: "03", title: "Form Filling", desc: "We complete all visa application forms with precision." },
      { step: "04", title: "Mock Interview", desc: "Intensive interview coaching to prepare you for the consulate." },
      { step: "05", title: "Submission & Track", desc: "Submit your application and track it through to decision." },
    ],
    faqs: [
      { q: "How do you achieve a 98% visa success rate?", a: "Through meticulous documentation, thorough financial planning guidance, and intensive mock interview preparation. We prepare students to be fully ready for every scenario." },
      { q: "What if my visa is rejected?", a: "We analyse the rejection reason, address the gaps, and assist with reapplication at no additional service charge for the first re-application." },
      { q: "How early should I apply for a student visa?", a: "We recommend starting the visa process at least 3–4 months before your course start date to allow for processing time and any unforeseen delays." },
      { q: "Do you assist with dependent visas for family members?", a: "Yes. We assist with dependent/spouse visa applications for countries that allow students to bring family members." },
    ],
  },
  loan: {
    slug: "loan",
    title: "Education Loan",
    tagline: "Invest in Your Future",
    description:
      "Connect with India's leading banks and NBFCs for education loans at competitive rates — with or without collateral — for studying at top international universities.",
    icon: <CreditCard size={28} className="text-[#c9a84c]" />,
    badge: "Financial Planning",
    stats: [
      { value: "₹2Cr+", label: "Max Loan Amount" },
      { value: "15+", label: "Partner Banks & NBFCs" },
      { value: "72hr", label: "Approval Turnaround" },
    ],
    features: [
      {
        title: "Loan Types Available",
        items: [
          "Secured loans (with collateral) — up to ₹2 Crore+",
          "Unsecured loans (no collateral) — up to ₹75 Lakhs",
          "Government-backed Vidya Lakshmi portal loans",
          "NBFC fast-track approvals",
          "Loans for tuition, living, travel, and equipment",
          "Moratorium period during studies",
        ],
      },
      {
        title: "Partner Institutions",
        items: [
          "SBI, Bank of Baroda, Canara Bank (nationalised banks)",
          "HDFC Credila, Prodigy Finance (NBFCs)",
          "Avanse Financial Services",
          "InCred Education Finance",
        ],
      },
    ],
    process: [
      { step: "01", title: "Eligibility Check", desc: "Assess your loan eligibility based on profile and university offer letter." },
      { step: "02", title: "Bank Matching", desc: "Match you with the best loan option for your needs and repayment capacity." },
      { step: "03", title: "Documentation", desc: "Prepare all required documents — academic, financial, and property (if secured)." },
      { step: "04", title: "Application", desc: "Submit the loan application to the selected institution." },
      { step: "05", title: "Disbursement", desc: "Loan sanctioned and disbursed directly to the university or your account." },
    ],
    faqs: [
      { q: "What is the maximum loan amount available?", a: "Secured loans can go up to ₹2 Crore or more depending on the collateral. Unsecured loans from NBFCs go up to ₹75 Lakhs for top universities." },
      { q: "Do I need a co-applicant for an education loan?", a: "Most banks require a co-applicant (usually a parent or guardian). NBFCs may offer loans without a co-applicant for top universities." },
      { q: "When does repayment start?", a: "Most education loans have a moratorium period — you start repaying 6–12 months after completing your degree or getting a job, whichever is earlier." },
      { q: "Are there tax benefits on education loans?", a: "Yes. Under Section 80E of the Income Tax Act, the interest paid on education loans is fully deductible from taxable income for up to 8 years." },
    ],
  },
  "pre-departure": {
    slug: "pre-departure",
    title: "Pre-Departure Support",
    tagline: "Fly with Confidence",
    description:
      "Everything you need before you board — accommodation, banking, health insurance, cultural orientation, and on-ground support when you land.",
    icon: <Plane size={28} className="text-[#c9a84c]" />,
    badge: "Pre-Departure",
    stats: [
      { value: "5K+", label: "Students Supported" },
      { value: "48hr", label: "Support Response Time" },
      { value: "26", label: "Destination Countries" },
    ],
    features: [
      {
        title: "Pre-Departure Checklist",
        items: [
          "Flight booking guidance and timing advice",
          "Airport pick-up coordination",
          "Temporary & permanent accommodation search",
          "Bank account opening guidance (pre-arrival)",
          "SIM card and data plan recommendations",
          "Health insurance and NHS/Medicare enrolment",
        ],
      },
      {
        title: "Orientation & Cultural Prep",
        items: [
          "Country-specific cultural dos and don'ts",
          "Weather, clothing, and packing guide",
          "Cost of living breakdown by city",
          "Student community and social integration tips",
        ],
      },
    ],
    process: [
      { step: "01", title: "Post-Visa Support", desc: "Once your visa is granted, we schedule a pre-departure briefing." },
      { step: "02", title: "Accommodation", desc: "Help you secure student housing before you leave India." },
      { step: "03", title: "Orientation Session", desc: "Group or one-on-one orientation covering life in your destination." },
      { step: "04", title: "Travel Prep", desc: "Flight booking guidance, packing list, and insurance setup." },
      { step: "05", title: "Arrival Support", desc: "Coordinate airport pickup and first-week support." },
    ],
    faqs: [
      { q: "When does pre-departure support begin?", a: "We begin pre-departure support as soon as your visa is approved — typically 6–8 weeks before your departure date." },
      { q: "Do you help with finding accommodation?", a: "Yes. We help with on-campus applications, verified homestays, and private student accommodation in your destination city." },
      { q: "What insurance do I need as a student abroad?", a: "Most countries require health insurance. We guide you through student health plans, travel insurance, and country-specific mandatory schemes (e.g., NHS surcharge for UK)." },
      { q: "Is there support after I arrive?", a: "Yes. Our post-arrival support includes settling-in guidance, bank setup, local SIM card advice, and connecting you with our alumni community." },
    ],
  },
  accommodation: {
    slug: "accommodation",
    title: "Accommodation Assistance",
    tagline: "Find Your Home Away from Home",
    description:
      "Safe, affordable, and comfortable student accommodation guidance — from on-campus halls to private flats — in every major study destination worldwide.",
    icon: <Home size={28} className="text-[#c9a84c]" />,
    badge: "Student Housing",
    stats: [
      { value: "4K+", label: "Placements Made" },
      { value: "50+", label: "Cities Covered" },
      { value: "98%", label: "Satisfaction Rate" },
    ],
    features: [
      {
        title: "Accommodation Types",
        items: [
          "On-campus university halls of residence",
          "Purpose-built student accommodation (PBSA)",
          "Homestays with local families",
          "Private studio apartments and shared flats",
          "Co-living spaces near campus",
          "Temporary accommodation for first weeks",
        ],
      },
      {
        title: "Our Assistance Includes",
        items: [
          "Budget-based accommodation matching",
          "Safety and proximity to campus assessment",
          "Contract review and terms guidance",
          "Deposit and payment process support",
        ],
      },
    ],
    process: [
      { step: "01", title: "Requirement Gathering", desc: "Tell us your budget, preferences, and university location." },
      { step: "02", title: "Options Shortlist", desc: "We present verified accommodation options with pros and cons." },
      { step: "03", title: "Booking Support", desc: "Assist with applications, deposits, and contract reviews." },
      { step: "04", title: "Confirmation", desc: "Ensure your booking is confirmed before departure." },
      { step: "05", title: "Move-In Guidance", desc: "First-day checklist and landlord communication tips." },
    ],
    faqs: [
      { q: "Is on-campus accommodation better than off-campus?", a: "On-campus is more convenient and safer for first-year students. Off-campus is typically cheaper and offers more independence. We help you weigh both based on your situation." },
      { q: "How early should I book accommodation?", a: "As early as possible — ideally the moment you receive your university offer. Popular student cities get booked quickly, sometimes 6 months in advance." },
      { q: "Do you have verified accommodation partners?", a: "Yes. We work with verified accommodation providers and PBSA operators in the UK, Australia, Canada, USA, and Europe." },
      { q: "What if my accommodation has issues after I arrive?", a: "We provide support for escalating issues with landlords, understanding your tenant rights, and finding alternative housing if required." },
    ],
  },
};

// ─── Metadata ─────────────────────────────────────────────────────────────────
type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const service = SERVICES[slug];
  if (!service) return { title: "Service Not Found | MVR Consultants" };
  return {
    title: `${service.title} | MVR Consultants`,
    description: service.description,
  };
}

export function generateStaticParams() {
  return Object.keys(SERVICES).map((slug) => ({ slug }));
}

// ─── Page ──────────────────────────────────────────────────────────────────────
export default async function ServiceDetailPage({ params }: Props) {
  const { slug } = await params;
  const service = SERVICES[slug];
  if (!service) notFound();

  return (
    <>
      {/* ── Hero ── */}
      <section className="bg-[#1a2f5e] py-20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-[#c9a84c]/5 -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-white/3 translate-y-1/2 -translate-x-1/2 pointer-events-none" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <span className="inline-flex items-center gap-2 bg-[#c9a84c]/20 text-[#c9a84c] text-xs font-semibold uppercase tracking-wider px-4 py-2 rounded-full mb-6">
            {service.icon} {service.badge}
          </span>
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-5" style={{ fontFamily: "var(--font-playfair)" }}>
            {service.title}
          </h1>
          <p className="text-white/65 text-lg max-w-2xl mx-auto leading-relaxed mb-12">
            {service.description}
          </p>
          {/* Stats */}
          <div className="flex flex-wrap justify-center gap-12">
            {service.stats.map((s) => (
              <div key={s.label} className="text-center">
                <p className="text-3xl font-bold text-white">{s.value}</p>
                <p className="text-white/50 text-xs mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="bg-white py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <p className="text-[#c9a84c] font-semibold text-sm uppercase tracking-wider mb-2">What We Do</p>
            <h2 className="text-3xl font-bold text-[#1a2f5e]" style={{ fontFamily: "var(--font-playfair)" }}>
              Our {service.title} Services
            </h2>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            {service.features.map((section) => (
              <div key={section.title} className="bg-gray-50 rounded-2xl p-8 border border-gray-100">
                <h3 className="font-bold text-[#1a2f5e] text-lg mb-5" style={{ fontFamily: "var(--font-playfair)" }}>
                  {section.title}
                </h3>
                <ul className="space-y-3">
                  {section.items.map((item) => (
                    <li key={item} className="flex items-start gap-3 text-gray-600 text-sm">
                      <CheckCircle2 size={15} className="text-[#c9a84c] mt-0.5 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Process ── */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <p className="text-[#c9a84c] font-semibold text-sm uppercase tracking-wider mb-2">How It Works</p>
            <h2 className="text-3xl font-bold text-[#1a2f5e]" style={{ fontFamily: "var(--font-playfair)" }}>
              Our Step-by-Step Process
            </h2>
          </div>
          <div className="grid sm:grid-cols-5 gap-6">
            {service.process.map((p, i) => (
              <div key={p.step} className="text-center relative">
                {i < service.process.length - 1 && (
                  <div className="hidden sm:block absolute top-10 left-full w-full h-px bg-[#c9a84c]/20 -translate-x-1/2" />
                )}
                <div className="w-20 h-20 bg-[#1a2f5e] rounded-2xl flex flex-col items-center justify-center mx-auto mb-4 shadow-lg">
                  <span className="text-[#c9a84c] text-xs font-semibold">Step</span>
                  <span className="text-white text-xl font-bold leading-none">{p.step}</span>
                </div>
                <h3 className="font-bold text-[#1a2f5e] text-sm mb-1">{p.title}</h3>
                <p className="text-gray-500 text-xs leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="bg-white py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <p className="text-[#c9a84c] font-semibold text-sm uppercase tracking-wider mb-2">Common Questions</p>
            <h2 className="text-3xl font-bold text-[#1a2f5e]" style={{ fontFamily: "var(--font-playfair)" }}>
              Frequently Asked Questions
            </h2>
          </div>
          <div className="space-y-4">
            {service.faqs.map((faq) => (
              <details key={faq.q} className="group border border-gray-100 rounded-xl overflow-hidden">
                <summary className="flex items-center justify-between px-6 py-4 cursor-pointer list-none bg-gray-50 hover:bg-[#fef9f0] transition-colors">
                  <span className="font-semibold text-[#1a2f5e] text-sm pr-4">{faq.q}</span>
                  <ChevronDown size={16} className="text-[#c9a84c] shrink-0 group-open:rotate-180 transition-transform duration-200" />
                </summary>
                <div className="px-6 py-4 text-gray-600 text-sm leading-relaxed border-t border-gray-100">
                  {faq.a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="bg-[#1a2f5e] py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl font-bold text-white mb-4" style={{ fontFamily: "var(--font-playfair)" }}>
            Ready to Get Started?
          </h2>
          <p className="text-white/65 mb-8 text-lg">
            Book a free consultation with our {service.title.toLowerCase()} specialists today.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/contact">
              <Button className="bg-[#c9a84c] hover:bg-[#a07a2e] text-white rounded-full px-10 h-12 font-bold gap-2">
                Book Free Consultation <ArrowRight size={16} />
              </Button>
            </Link>
            <a href="tel:+919966903884">
              <Button variant="outline" className="rounded-full px-10 h-12 font-bold gap-2 border-white/30 text-white hover:bg-white/10 bg-transparent">
                <Phone size={15} /> Call Us Now
              </Button>
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
