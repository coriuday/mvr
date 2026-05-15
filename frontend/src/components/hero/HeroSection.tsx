"use client";

import { motion } from "framer-motion";
import type { Variants } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  GraduationCap,
  Star,
  Users,
  Award,
  CheckCircle,
  ArrowRight,
  Play,
} from "lucide-react";

const stats = [
  { value: "50K+", label: "Students Guided", icon: Users },
  { value: "98%", label: "Visa Success", icon: CheckCircle },
  { value: "100+", label: "Universities", icon: GraduationCap },
  { value: "4.9★", label: "Google Rating", icon: Star },
];

const containerVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: "easeOut" } },
};

export default function HeroSection() {
  return (
    <section
      className="relative bg-[#1a2f5e] overflow-hidden min-h-[88vh] flex items-center"
      id="hero"
    >
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full bg-[#c9a84c]/5 -translate-y-1/4 translate-x-1/4" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-[#2a4a8e]/40 translate-y-1/4 -translate-x-1/4" />
        {/* Grid lines */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.4) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-16 lg:py-24">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* ── Left column ── */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="text-white"
          >
            {/* Pill badge */}
            <motion.div variants={itemVariants}>
              <Badge className="bg-[#c9a84c]/20 text-[#c9a84c] border-[#c9a84c]/30 mb-5 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider">
                🎓 Trusted Study Abroad Experts — 15+ Years
              </Badge>
            </motion.div>

            {/* Headline */}
            <motion.h1
              variants={itemVariants}
              className="text-4xl sm:text-5xl xl:text-6xl font-bold leading-[1.1] mb-6"
              style={{ fontFamily: "var(--font-playfair)" }}
            >
              Your{" "}
              <span className="text-gradient-gold">Dream University</span>
              <br />
              Awaits You Abroad
            </motion.h1>

            {/* Subtext */}
            <motion.p
              variants={itemVariants}
              className="text-white/65 text-lg leading-relaxed mb-8 max-w-xl"
            >
              Expert guidance for university admissions, student visas,
              scholarships, and study abroad placements across 25+ countries.
              We&apos;ve helped{" "}
              <span className="text-[#c9a84c] font-semibold">
                50,000+ students
              </span>{" "}
              achieve their dreams.
            </motion.p>

            {/* CTA buttons */}
            <motion.div
              variants={itemVariants}
              className="flex flex-wrap items-center gap-4 mb-12"
            >
              <Link href="/contact">
                <Button
                  size="lg"
                  className="bg-[#c9a84c] hover:bg-[#a07a2e] text-white font-bold px-8 py-6 text-base rounded-full shadow-lg shadow-yellow-900/25 transition-all duration-200 hover:scale-105"
                >
                  Get Free Counseling
                  <ArrowRight size={18} className="ml-2" />
                </Button>
              </Link>
              <Link href="/universities">
                <button className="flex items-center gap-2.5 text-white/80 hover:text-white font-medium transition-colors group">
                  <span className="w-11 h-11 rounded-full bg-white/15 group-hover:bg-white/25 flex items-center justify-center transition-colors">
                    <Play size={14} fill="currentColor" />
                  </span>
                  Explore Universities
                </button>
              </Link>
            </motion.div>

            {/* Stats row */}
            <motion.div
              variants={itemVariants}
              className="grid grid-cols-2 sm:grid-cols-4 gap-5 pt-8 border-t border-white/10"
            >
              {stats.map(({ value, label, icon: Icon }) => (
                <div key={label} className="text-center">
                  <Icon
                    size={18}
                    className="text-[#c9a84c] mx-auto mb-1.5 opacity-90"
                  />
                  <p className="text-xl font-bold text-white leading-tight">
                    {value}
                  </p>
                  <p className="text-white/50 text-[11px] font-medium mt-0.5">
                    {label}
                  </p>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* ── Right column — illustration card ── */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
            className="hidden lg:block relative"
          >
            {/* Main card */}
            <div className="relative bg-white/10 backdrop-blur-sm rounded-3xl p-8 border border-white/15">
              {/* Decorative flag row */}
              <div className="flex items-center gap-2 mb-6">
                {["🇺🇸", "🇬🇧", "🇨🇦", "🇦🇺", "🇩🇪", "🇮🇪"].map((flag) => (
                  <span
                    key={flag}
                    className="w-9 h-9 bg-white/15 rounded-full flex items-center justify-center text-lg"
                  >
                    {flag}
                  </span>
                ))}
                <span className="text-white/50 text-sm font-medium ml-1">
                  +20 more
                </span>
              </div>

              <h3
                className="text-white text-2xl font-bold mb-2"
                style={{ fontFamily: "var(--font-playfair)" }}
              >
                Study in Your Dream Country
              </h3>
              <p className="text-white/55 text-sm mb-8">
                Top-ranked universities across the globe
              </p>

              {/* Feature pills */}
              {[
                "✅ Free University Shortlisting",
                "✅ Visa Application Support",
                "✅ Scholarship Guidance",
                "✅ Post-Arrival Assistance",
              ].map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-3 mb-3.5 text-white/80 text-sm font-medium"
                >
                  {item}
                </div>
              ))}

              {/* CTA inside card */}
              <Link href="/contact">
                <Button className="mt-4 w-full bg-[#c9a84c] hover:bg-[#a07a2e] text-white font-bold rounded-xl py-5">
                  Book Free Consultation →
                </Button>
              </Link>
            </div>

            {/* Floating badge — top right */}
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -top-5 -right-5 bg-[#c9a84c] text-white rounded-2xl px-4 py-3 shadow-xl"
            >
              <div className="flex items-center gap-2">
                <Award size={18} />
                <div>
                  <p className="text-xs font-bold leading-none">98% Success</p>
                  <p className="text-[10px] opacity-80 mt-0.5">Visa Rate</p>
                </div>
              </div>
            </motion.div>

            {/* Floating badge — bottom left */}
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
              className="absolute -bottom-5 -left-5 bg-white rounded-2xl px-4 py-3 shadow-xl"
            >
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-[#1a2f5e] rounded-full flex items-center justify-center">
                  <Users size={14} className="text-white" />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-800 leading-none">
                    50,000+
                  </p>
                  <p className="text-[10px] text-gray-500 mt-0.5">
                    Students Placed
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Wave SVG at bottom */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 60" xmlns="http://www.w3.org/2000/svg" className="w-full fill-white">
          <path d="M0,30 C360,60 1080,0 1440,30 L1440,60 L0,60 Z" />
        </svg>
      </div>
    </section>
  );
}
