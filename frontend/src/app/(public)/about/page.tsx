import type { Metadata } from "next";
import Link from "next/link";
import {
  GraduationCap, Users, Globe, Award, Heart,
  Target, Shield, Lightbulb, ArrowRight, CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "About Us — MVR Consultants | 15+ Years of Study Abroad Excellence",
  description:
    "Learn about MVR Consultants — 15+ years helping students study abroad. Our experienced team has guided 50,000+ students to universities in 25+ countries.",
};

const MILESTONES = [
  { year: "2009", title: "Founded in Bangalore", desc: "Started with a small team of 3 passionate education advisors" },
  { year: "2013", title: "10,000 Students Milestone", desc: "Celebrated our 10,000th successful student placement" },
  { year: "2017", title: "Expanded to 10 Cities", desc: "Opened offices across major Indian cities" },
  { year: "2021", title: "Digital Transformation", desc: "Launched online counseling services for pan-India reach" },
  { year: "2024", title: "50,000+ Students", desc: "Reached 50,000 successful student placements globally" },
];

const VALUES = [
  { icon: Heart,      title: "Student-First",   desc: "Every decision we make is centered on what's best for the student's future." },
  { icon: Shield,     title: "Transparency",    desc: "Honest guidance on costs, requirements, and realistic expectations." },
  { icon: Target,     title: "Results-Driven",  desc: "98% visa approval rate — we measure our success by your success." },
  { icon: Lightbulb,  title: "Expert Advice",   desc: "Counselors with 5–15 years of international education experience." },
];

const TEAM = [
  { name: "Dr. Ramesh Kumar", role: "Founder & Director", exp: "20+ years", countries: "USA, UK, Canada" },
  { name: "Priya Nair",       role: "Head of Admissions", exp: "12 years",  countries: "Australia, Ireland" },
  { name: "Arjun Sharma",     role: "Visa Specialist",    exp: "10 years",  countries: "Germany, Netherlands" },
  { name: "Meera Reddy",      role: "Scholarship Expert", exp: "8 years",   countries: "UK, Sweden, France" },
];

export default function AboutPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative bg-[#1a2f5e] py-24 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-[#c9a84c]/5 -translate-y-1/3 translate-x-1/3" />
        </div>
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <span className="inline-flex items-center gap-2 bg-[#c9a84c]/20 text-[#c9a84c] text-xs font-semibold uppercase tracking-wider px-4 py-2 rounded-full mb-6">
            <Users size={13} /> Our Story
          </span>
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-6" style={{ fontFamily: "var(--font-playfair)" }}>
            15 Years of Turning{" "}
            <span className="text-gradient-gold">Dreams Into Degrees</span>
          </h1>
          <p className="text-white/70 text-lg leading-relaxed max-w-2xl mx-auto">
            MVR Consultants was founded with a single mission: make world-class education
            accessible to every Indian student willing to work for it. Since 2009, we have
            guided over 50,000 students to universities across 25+ countries.
          </p>
          <div className="flex flex-wrap justify-center gap-10 mt-14">
            {[
              { value: "50,000+", label: "Students Placed", icon: GraduationCap },
              { value: "25+",     label: "Countries",       icon: Globe },
              { value: "98%",     label: "Visa Success",    icon: Award },
              { value: "200+",    label: "Partner Unis",    icon: CheckCircle2 },
            ].map(({ value, label, icon: Icon }) => (
              <div key={label} className="text-center">
                <Icon size={20} className="text-[#c9a84c] mx-auto mb-2" />
                <p className="text-3xl font-bold text-white leading-none">{value}</p>
                <p className="text-white/50 text-sm mt-1">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="bg-white py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <p className="text-[#c9a84c] font-semibold text-sm uppercase tracking-wider mb-3">Our Mission</p>
              <h2 className="text-3xl sm:text-4xl font-bold text-[#1a2f5e] mb-6" style={{ fontFamily: "var(--font-playfair)" }}>
                Empowering Every Student With the Right Guidance
              </h2>
              <p className="text-gray-600 leading-relaxed mb-6">
                The journey to studying abroad can be overwhelming — hundreds of universities,
                complex visa processes, scholarships to apply for, and deadlines to track.
                MVR Consultants simplifies all of that.
              </p>
              <p className="text-gray-600 leading-relaxed mb-8">
                Our counselors have been through this process themselves and have helped thousands
                of students navigate it successfully. We do not just fill out applications —
                we build a complete roadmap for your future.
              </p>
              <Link href="/contact">
                <Button className="bg-[#1a2f5e] hover:bg-[#2a4a8e] text-white rounded-full px-8 gap-2">
                  Book a Free Session <ArrowRight size={16} />
                </Button>
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-5">
              {VALUES.map((v) => (
                <div key={v.title} className="bg-gray-50 rounded-2xl p-6 hover:shadow-md transition-shadow">
                  <v.icon size={24} className="text-[#c9a84c] mb-3" />
                  <h3 className="font-bold text-[#1a2f5e] mb-2">{v.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{v.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <p className="text-[#c9a84c] font-semibold text-sm uppercase tracking-wider mb-2">Our Journey</p>
            <h2 className="text-3xl font-bold text-[#1a2f5e]" style={{ fontFamily: "var(--font-playfair)" }}>
              15 Years of Milestones
            </h2>
          </div>
          <div className="relative">
            <div className="absolute left-8 top-0 bottom-0 w-px bg-[#c9a84c]/25 hidden sm:block" />
            <div className="space-y-8">
              {MILESTONES.map((m) => (
                <div key={m.year} className="flex gap-6 items-start">
                  <div className="relative flex-shrink-0 w-16 h-16 bg-[#1a2f5e] rounded-2xl flex flex-col items-center justify-center text-white">
                    <span className="text-[#c9a84c] text-xs font-bold leading-none">{m.year}</span>
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-full w-6 h-px bg-[#c9a84c]/40 hidden sm:block" />
                  </div>
                  <div className="bg-white rounded-2xl p-5 flex-1 border border-gray-100 shadow-sm">
                    <h3 className="font-bold text-[#1a2f5e] mb-1">{m.title}</h3>
                    <p className="text-gray-500 text-sm">{m.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="bg-white py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <p className="text-[#c9a84c] font-semibold text-sm uppercase tracking-wider mb-2">The Experts</p>
            <h2 className="text-3xl font-bold text-[#1a2f5e]" style={{ fontFamily: "var(--font-playfair)" }}>
              Meet Our Lead Counselors
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {TEAM.map((member) => (
              <div key={member.name} className="rounded-2xl border border-gray-100 p-6 text-center hover:shadow-lg hover:-translate-y-1 transition-all duration-200">
                <div className="w-20 h-20 rounded-full bg-[#1a2f5e]/10 mx-auto mb-4 flex items-center justify-center">
                  <span className="text-2xl font-bold text-[#1a2f5e]">{member.name.charAt(0)}</span>
                </div>
                <h3 className="font-bold text-[#1a2f5e]">{member.name}</h3>
                <p className="text-[#c9a84c] text-sm font-medium mb-3">{member.role}</p>
                <div className="text-gray-500 text-xs space-y-1">
                  <p>{member.exp} experience</p>
                  <p>Specializes: {member.countries}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[#1a2f5e] py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl font-bold text-white mb-4" style={{ fontFamily: "var(--font-playfair)" }}>
            Ready to Begin Your Journey?
          </h2>
          <p className="text-white/65 mb-8 text-lg">
            Join 50,000+ students who trusted MVR Consultants with their study abroad dreams.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/contact">
              <Button className="bg-[#c9a84c] hover:bg-[#a07a2e] text-white rounded-full px-10 h-12 font-bold">
                Get Free Counseling
              </Button>
            </Link>
            <Link href="/universities">
              <Button variant="outline" className="rounded-full px-10 h-12 text-white border-white/30 hover:bg-white/10">
                Explore Universities
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
