"use client";

import Link from "next/link";
import Image from "next/image";
import { Users, CheckCircle, GraduationCap, BookOpen } from "lucide-react";

const stats = [
  { value: "10", label: "Years of Excellence", icon: BookOpen },
  { value: "5K+", label: "Students Guided", icon: Users },
  { value: "98%", label: "Visa Success Rate", icon: CheckCircle },
  { value: "100+", label: "Partner Universities", icon: GraduationCap },
];

export default function HeroSection() {
  return (
    <section
      className="relative overflow-hidden"
      style={{ background: "linear-gradient(135deg, #fdf8ef 0%, #fef9f0 40%, #fff8e8 100%)" }}
      id="hero"
    >
      {/* Subtle background decorations */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Top-right golden glow */}
        <div
          className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full opacity-20"
          style={{ background: "radial-gradient(circle, #c9a84c 0%, transparent 70%)", transform: "translate(30%, -30%)" }}
        />
        {/* Bottom-left navy tint */}
        <div
          className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full opacity-10"
          style={{ background: "radial-gradient(circle, #1a2f5e 0%, transparent 70%)", transform: "translate(-30%, 30%)" }}
        />
        {/* Decorative curved golden line — top right */}
        <svg
          className="absolute top-0 right-0 w-[340px] opacity-30"
          viewBox="0 0 340 220"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M340,0 Q200,100 340,220"
            stroke="#c9a84c"
            strokeWidth="2.5"
            fill="none"
          />
          <path
            d="M340,20 Q210,110 340,200"
            stroke="#c9a84c"
            strokeWidth="1"
            fill="none"
            opacity="0.5"
          />
        </svg>
        {/* Decorative curved golden line — bottom left */}
        <svg
          className="absolute bottom-0 left-0 w-[260px] opacity-25"
          viewBox="0 0 260 180"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M0,180 Q130,80 0,0"
            stroke="#c9a84c"
            strokeWidth="2.5"
            fill="none"
          />
        </svg>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 pt-10 pb-0 lg:pt-14">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* ── Left column ── */}
          <div className="text-[#1a2f5e] pb-10 lg:pb-16">
            {/* Tagline */}
            <p
              className="hero-item-1 text-sm font-semibold uppercase tracking-widest mb-3"
              style={{ color: "#c9a84c" }}
            >
              Your Dream. Our Guidance.
            </p>

            {/* Main headline */}
            <h1
              className="hero-item-2 text-4xl sm:text-5xl xl:text-[3.6rem] font-bold leading-[1.08] mb-5"
              style={{ fontFamily: "var(--font-playfair)", color: "#1a2f5e" }}
            >
              Study Abroad.
              <br />
              Shape Your Future.
            </h1>

            {/* Sub-description */}
            <p
              className="hero-item-3 text-base leading-relaxed mb-8 max-w-lg"
              style={{ color: "#4b5563" }}
            >
              Expert guidance for admissions, visas, scholarships
              <br />
              and everything you need to succeed globally.
            </p>

            {/* CTA buttons */}
            <div className="hero-item-4 flex flex-wrap items-center gap-4 mb-10">
              <Link href="/contact">
                <button
                  className="inline-flex items-center gap-2 px-6 py-3 text-sm font-bold text-white rounded-none transition-all duration-200 hover:opacity-90 hover:scale-105"
                  style={{ background: "#1a2f5e" }}
                >
                  BOOK FREE CONSULTATION
                  <span className="ml-1">→</span>
                </button>
              </Link>
              <Link href="/countries">
                <button
                  className="inline-flex items-center gap-2 px-6 py-3 text-sm font-bold rounded-none border-2 transition-all duration-200 hover:bg-[#c9a84c] hover:text-white hover:border-[#c9a84c]"
                  style={{ borderColor: "#c9a84c", color: "#c9a84c", background: "transparent" }}
                >
                  EXPLORE DESTINATIONS
                  <span className="ml-1">→</span>
                </button>
              </Link>
            </div>

            {/* Stats row */}
            <div className="hero-item-5 grid grid-cols-2 sm:grid-cols-4 gap-4">
              {stats.map(({ value, label, icon: Icon }) => (
                <div key={label} className="flex items-start gap-2">
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                    style={{ background: "rgba(201,168,76,0.15)" }}
                  >
                    <Icon size={16} style={{ color: "#c9a84c" }} />
                  </div>
                  <div>
                    <p className="text-lg font-bold leading-tight" style={{ color: "#1a2f5e" }}>
                      {value}
                    </p>
                    <p className="text-[11px] font-medium leading-tight" style={{ color: "#6b7280" }}>
                      {label}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Right column — hero image in golden oval ── */}
          <div className="hero-image hidden lg:flex items-end justify-center relative">
            {/* Outer golden ring / oval glow */}
            <div
              className="relative flex items-end justify-center"
              style={{ width: "520px", height: "560px" }}
            >
              {/* Golden oval background */}
              <div
                className="absolute inset-0 rounded-[50%] opacity-80"
                style={{
                  background: "linear-gradient(160deg, #e8c96a 0%, #c9a84c 40%, #a07a2e 100%)",
                  transform: "scale(0.92)",
                }}
              />
              {/* Inner lighter oval */}
              <div
                className="absolute inset-0 rounded-[50%]"
                style={{
                  background: "linear-gradient(160deg, #f5dfa0 0%, #dbb55a 50%, #b8892a 100%)",
                  transform: "scale(0.82)",
                }}
              />
              {/* Student image — positioned to overflow upward */}
              <div className="relative z-10" style={{ marginBottom: "-2px" }}>
                <Image
                  src="/Gemini_Generated_Image_whl9aywhl9aywhl9.png"
                  alt="Student with world landmarks — Study Abroad with MVR Consultants"
                  width={480}
                  height={560}
                  className="object-contain object-bottom block"
                  style={{
                    maxHeight: "560px",
                    width: "auto",
                    filter: "drop-shadow(0 20px 40px rgba(26,47,94,0.18))",
                  }}
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
