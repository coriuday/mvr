import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { GraduationCap, ArrowRight, ShieldCheck, Star, Sparkles, HeartPulse, Scale, Lightbulb, Compass, Award, ExternalLink, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { UNIVERSITIES, type University } from "@/data/universities";

type Props = { params: Promise<{ slug: string }> };

interface DisciplineGuide {
  title: string;
  disciplineId: string; // matches program code
  icon: LucideIcon;
  overview: string;
  averageSalary: string;
  roles: string[];
  skills: string[];
}

const DISCIPLINE_GUIDES: Record<string, DisciplineGuide> = {
  cs: {
    title: "Computer Science & IT",
    disciplineId: "CS",
    icon: Compass,
    overview: "Computer Science remains the most sought-after study abroad track. Degrees offer unmatched access to international technology corridors, AI labs, and high-paid software engineering packages.",
    averageSalary: "$98,000–$145,000/yr",
    roles: ["AI Research Engineer", "Full-Stack Developer", "Data Scientist", "Cloud Solutions Architect"],
    skills: ["Advanced Algorithms", "Machine Learning", "System Design", "Cloud Computing"]
  },
  engineering: {
    title: "Engineering & Robotics",
    disciplineId: "Engineering",
    icon: Award,
    overview: "From automotive pioneers in Germany to biomedical labs in the USA, global engineering tracks provide hands-on clinical and project-based experience.",
    averageSalary: "$85,000–$120,000/yr",
    roles: ["Robotics Engineer", "Automotive Systems Designer", "Renewable Energy Advisor", "Structural Project Manager"],
    skills: ["Mechanical CAD Modeling", "Thermodynamics", "Materials Science", "Industrial Automation"]
  },
  business: {
    title: "Business, Finance & MBA",
    disciplineId: "Business",
    icon: Lightbulb,
    overview: "International business schools offer massive career leverage. Study abroad programs merge core finance knowledge, leadership internships, and access to corporate venture houses.",
    averageSalary: "$90,000–$160,000/yr",
    roles: ["Investment Analyst", "Management Consultant", "Corporate CFO", "Strategic Product Planner"],
    skills: ["Corporate Valuation", "Global Supply Networks", "Leadership Psychology", "Strategic Negotiation"]
  },
  medicine: {
    title: "Medicine, Health & Pharmacy",
    disciplineId: "Medicine",
    icon: HeartPulse,
    overview: "Elite medical hubs in Europe and Asia deliver state-of-the-art MBBS, dentistry, and pharmacy programs. High compliance training and extensive clinical hours ensure globally accredited skills.",
    averageSalary: "$75,000–$180,000/yr",
    roles: ["Resident Physician", "Clinical Researcher", "Hospital Administrator", "Senior Pharmacologist"],
    skills: ["Pathological Diagnostics", "Pharmacokinetics", "Clinical Protocol", "Health Administration"]
  },
  law: {
    title: "Law & International Relations",
    disciplineId: "Law",
    icon: Scale,
    overview: "International legal tracks prepare consultants for a globalized corporate landscape. Courses focus on international treaties, patent regulations, and geopolitical strategy.",
    averageSalary: "$80,000–$140,000/yr",
    roles: ["Corporate Legal Counsel", "Intellectual Property Advisor", "International Arbitration Mediator", "Diplomatic Relations Attaché"],
    skills: ["Regulatory Analysis", "Treaty Interpretation", "Contract Dispute Mediation", "IP Law Compliance"]
  },
  design: {
    title: "Design, Fine Arts & Media",
    disciplineId: "Design",
    icon: Lightbulb,
    overview: "Top-tier styling institutes in Italy, Finland, and the UK nurture digital product designers, creative directors, and architects using industry labs and design studios.",
    averageSalary: "$65,000–$105,000/yr",
    roles: ["UI/UX Director", "Creative Brand Specialist", "Industrial Product Stylist", "Digital Animator"],
    skills: ["User Experience Research", "Visual Communication", "3D Rendering", "Generative Spatial Design"]
  }
};

// Static dynamic paths for all 6 core categories
export async function generateStaticParams() {
  return Object.keys(DISCIPLINE_GUIDES).map((slug) => ({ slug }));
}

// Generate dynamic metadata
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const guide = DISCIPLINE_GUIDES[slug];

  if (!guide) {
    return { title: "Discipline Guide Not Found | MVR Consultants" };
  }

  return {
    title: `Study ${guide.title} Abroad | Top Universities, Fees & Salaries | MVR Consultants`,
    description: `Complete guide to studying ${guide.title} abroad. Learn about tuition fee budgets, expected salaries (${guide.averageSalary}), core career roles, and top partner universities.`,
    keywords: [
      `study ${guide.title} abroad`,
      `best universities for ${guide.title}`,
      `${guide.title} average salary`,
      `${guide.title} courses abroad`,
      `MVR Consultants global guide`
    ]
  };
}

export default async function CourseDetailPage({ params }: Props) {
  const { slug } = await params;
  const guide = DISCIPLINE_GUIDES[slug];

  if (!guide) {
    notFound();
  }

  // Filter universities offering this discipline from the central database
  const matchingUnis = UNIVERSITIES.filter((u) =>
    u.programs.includes(guide.disciplineId)
  );

  return (
    <div className="bg-gray-50 min-h-screen pb-24">
      {/* Hero */}
      <section className="bg-[#1a2f5e] py-24 relative overflow-hidden text-white">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-[#c9a84c]/5 -translate-y-1/2 translate-x-1/4" />
          <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full bg-white/[0.02] translate-y-1/3 -translate-x-1/4" />
        </div>
        
        <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10 text-center">
          <Link href="/courses" className="text-white/60 hover:text-white text-xs font-semibold uppercase tracking-wider inline-flex items-center gap-1 mb-6 transition-colors">
            📚 Explore Courses Directory
          </Link>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-5 leading-tight" style={{ fontFamily: "var(--font-playfair)" }}>
            Study <span className="text-gradient-gold">{guide.title}</span> Abroad
          </h1>
          <p className="text-white/70 text-lg max-w-2xl mx-auto leading-relaxed">
            {guide.overview}
          </p>
        </div>
      </section>

      {/* Guide Content Grid */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 mt-12 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left 2 Columns */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Salary & Skills Widget */}
          <div className="bg-white rounded-3xl p-6 md:p-8 border border-gray-100 shadow-sm grid md:grid-cols-2 gap-6">
            <div>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Expected Global Salary</p>
              <p className="text-2xl font-extrabold text-[#c9a84c]">{guide.averageSalary}</p>
              <p className="text-gray-400 text-[10px] mt-1 leading-normal font-semibold">Typical package range for graduates in major destinations (USA, UK, Germany).</p>
            </div>
            
            <div className="border-t md:border-t-0 md:border-l border-gray-100 pt-5 md:pt-0 md:pl-6">
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-2">High-Demand Core Skills</p>
              <div className="flex flex-wrap gap-1.5">
                {guide.skills.map((s) => (
                  <span key={s} className="bg-gray-100 text-gray-600 text-[10px] font-bold px-2.5 py-1 rounded-full">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Top Universities Section */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-[#1a2f5e] px-1" style={{ fontFamily: "var(--font-playfair)" }}>
              Top Universities for {guide.title} ({matchingUnis.length})
            </h2>
            
            <div className="grid sm:grid-cols-2 gap-4">
              {matchingUnis.map((u) => (
                <div key={u.id} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-1.5 text-xs text-gray-500 font-semibold">
                        <span>{u.flag}</span>
                        <span>{u.country}</span>
                      </div>
                      <Badge className="bg-[#c9a84c]/15 text-[#a07a2e] border-0 text-[10px] font-bold">
                        {u.ranking}
                      </Badge>
                    </div>
                    <h3 className="font-bold text-[#1a2f5e] group-hover:text-[#c9a84c] transition-colors leading-tight mb-2">
                      {u.name}
                    </h3>
                    <p className="text-gray-400 text-xs line-clamp-2 leading-relaxed mb-4">
                      {u.description}
                    </p>
                  </div>
                  
                  <div className="pt-3 border-t border-gray-50 flex items-center justify-between">
                    <span className="text-[10px] text-gray-400 font-bold">{u.fees}</span>
                    <Link href={`/universities/${u.id}`} className="text-xs font-bold text-[#1a2f5e] hover:text-[#c9a84c] flex items-center gap-1 transition-colors">
                      Details <ExternalLink size={11} />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right 1 Column: Career Outcomes & Actions */}
        <div className="space-y-6">
          {/* Key Job Roles */}
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4">
            <h3 className="font-bold text-[#1a2f5e] text-sm pb-3 border-b border-gray-100">Popular Career Tracks</h3>
            
            <ul className="space-y-3">
              {guide.roles.map((r, i) => (
                <li key={r} className="flex items-center gap-2.5 text-xs text-[#1a2f5e] font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#c9a84c] shrink-0" />
                  {r}
                </li>
              ))}
            </ul>
          </div>

          {/* Dynamic Counseling CTA */}
          <div className="bg-gradient-to-br from-[#1a2f5e] to-[#122244] text-white rounded-3xl p-6 md:p-8 shadow-lg relative overflow-hidden">
            <div className="absolute right-0 top-0 w-32 h-32 bg-[#c9a84c]/10 rounded-full blur-2xl pointer-events-none" />
            <h3 className="text-lg font-bold mb-3 text-[#c9a84c] flex items-center gap-1.5" style={{ fontFamily: "var(--font-playfair)" }}>
              Admission Evaluation <ShieldCheck size={18} />
            </h3>
            <p className="text-white/70 text-xs leading-relaxed mb-6">
              Match your scores against typical GPA and IELTS thresholds of these top schools for {guide.title}.
            </p>
            <Link href={`/eligibility?stream=${guide.disciplineId}`}>
              <Button className="w-full bg-[#c9a84c] hover:bg-[#a07a2e] text-white rounded-full font-bold h-11 text-xs gap-2">
                Check Eligibility Now <ArrowRight size={14} />
              </Button>
            </Link>
          </div>

          {/* Counselors sidebar */}
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm text-center space-y-4">
            <p className="text-[#1a2f5e] font-bold text-sm">Need a Personal Shortlist?</p>
            <p className="text-gray-400 text-xs leading-relaxed">
              Our experts will select the absolute best country and programs for you based on your tuition budget and backlogs.
            </p>
            <Link href="/contact" className="block w-full">
              <Button variant="outline" className="w-full border-gray-200 text-[#1a2f5e] hover:bg-gray-50 rounded-full font-bold h-11 text-xs">
                Speak with a Counselor
              </Button>
            </Link>
          </div>
        </div>

      </section>
    </div>
  );
}
