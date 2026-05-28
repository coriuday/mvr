"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { GraduationCap, ArrowRight, Search, SlidersHorizontal, BookOpen, Clock, BadgeEuro, Sparkles, Star, Milestone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { UNIVERSITIES, type University } from "@/data/universities";

interface CourseItem {
  id: string; // unique course identifier
  name: string;
  discipline: string;
  degreeLevel: "Undergraduate" | "Postgraduate";
  duration: string;
  durationYears: number;
  feesText: string;
  feesUsd: number;
  intake: string;
  ielts: string;
  university: University;
}

const DISCIPLINES_MAP: Record<string, { label: string; icon: string }> = {
  "CS": { label: "Computer Science", icon: "💻" },
  "Engineering": { label: "Engineering", icon: "⚙️" },
  "Business": { label: "Business & MBA", icon: "💼" },
  "Medicine": { label: "Medicine & Health", icon: "🏥" },
  "Law": { label: "Law", icon: "⚖️" },
  "Sciences": { label: "Sciences", icon: "🔬" },
  "Architecture": { label: "Architecture", icon: "🏗️" },
  "Design": { label: "Design & Arts", icon: "🎨" },
  "Liberal Arts": { label: "Liberal Arts", icon: "🎭" }
};

export default function CoursesSearchClient() {
  const [search, setSearch] = useState("");
  const [selectedDiscipline, setSelectedDiscipline] = useState("All");
  const [selectedLevel, setSelectedLevel] = useState("All"); // "All", "Undergraduate", "Postgraduate"
  const [maxFees, setMaxFees] = useState(120000);
  const [selectedDuration, setSelectedDuration] = useState("All"); // "All", "1-2", "3-4"

  // Dynamically synthesize a rich courses array from the UNIVERSITIES data source
  const allCourses = useMemo((): CourseItem[] => {
    const list: CourseItem[] = [];
    
    UNIVERSITIES.forEach(uni => {
      uni.programs.forEach(prog => {
        const disciplineInfo = DISCIPLINES_MAP[prog] || { label: prog, icon: "🎓" };
        
        // Split duration to simulate Undergraduate and Postgraduate options
        const hasUG = uni.duration.toLowerCase().includes("ug") || uni.duration.includes("3") || uni.duration.includes("4");
        const hasPG = uni.duration.toLowerCase().includes("pg") || uni.duration.includes("1") || uni.duration.includes("2");

        if (hasUG) {
          list.push({
            id: `${uni.id}-${prog.toLowerCase().replace(/[^a-z]+/g, "")}-ug`,
            name: `Bachelor of Science in ${disciplineInfo.label}`,
            discipline: prog,
            degreeLevel: "Undergraduate",
            duration: "3–4 Years",
            durationYears: 4,
            feesText: uni.fees,
            feesUsd: uni.annualTuitionUsd,
            intake: uni.intake,
            ielts: uni.ielts,
            university: uni
          });
        }
        
        if (hasPG) {
          list.push({
            id: `${uni.id}-${prog.toLowerCase().replace(/[^a-z]+/g, "")}-pg`,
            name: prog === "Business" ? `Master of Business Administration (MBA)` : `Master of Science in ${disciplineInfo.label}`,
            discipline: prog,
            degreeLevel: "Postgraduate",
            duration: "1–2 Years",
            durationYears: 2,
            feesText: uni.fees,
            feesUsd: uni.annualTuitionUsd,
            intake: uni.intake,
            ielts: uni.ielts,
            university: uni
          });
        }
      });
    });
    
    return list;
  }, []);

  // Filter list
  const filteredCourses = useMemo(() => {
    return allCourses.filter(c => {
      const matchText = search === "" ||
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.university.name.toLowerCase().includes(search.toLowerCase()) ||
        c.university.country.toLowerCase().includes(search.toLowerCase());

      const matchDiscipline = selectedDiscipline === "All" || c.discipline === selectedDiscipline;
      const matchLevel = selectedLevel === "All" || c.degreeLevel === selectedLevel;
      const matchFees = c.feesUsd <= maxFees;
      
      let matchDuration = true;
      if (selectedDuration === "1-2") {
        matchDuration = c.durationYears <= 2;
      } else if (selectedDuration === "3-4") {
        matchDuration = c.durationYears >= 3;
      }

      return matchText && matchDiscipline && matchLevel && matchFees && matchDuration;
    });
  }, [allCourses, search, selectedDiscipline, selectedLevel, maxFees, selectedDuration]);

  return (
    <div className="bg-gray-50 min-h-screen pb-24">
      {/* Hero Header */}
      <section className="bg-[#1a2f5e] py-20 relative overflow-hidden text-white">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-[550px] h-[550px] rounded-full bg-[#c9a84c]/5 -translate-y-1/2 translate-x-1/3" />
          <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full bg-white/[0.02] translate-y-1/3 -translate-x-1/4" />
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <span className="inline-flex items-center gap-2 bg-[#c9a84c]/20 text-[#c9a84c] text-xs font-semibold uppercase tracking-wider px-4 py-2 rounded-full mb-6">
            <GraduationCap size={14} /> Course Directory
          </span>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight" style={{ fontFamily: "var(--font-playfair)" }}>
            Find Your Perfect <span className="text-gradient-gold">Academic Track</span>
          </h1>
          <p className="text-white/70 text-lg max-w-2xl mx-auto leading-relaxed">
            Explore 150+ programs dynamically mapped to our partner universities. Filter by degree level, typical tuition, duration, and global destination.
          </p>
        </div>
      </section>

      {/* Main Filter & Course Catalog Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 -mt-10 relative z-10">
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6 md:p-8 mb-10">
          
          {/* Top Search bar */}
          <div className="flex flex-col lg:flex-row gap-4 mb-8">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search by course name, key major, university, or country..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-11 pr-5 py-3 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:border-[#c9a84c] focus:ring-1 focus:ring-[#c9a84c] transition-all"
              />
            </div>
            
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5 shrink-0">
                <SlidersHorizontal size={14} /> Degree Level:
              </span>
              <div className="inline-flex bg-gray-50 border border-gray-200 rounded-xl p-1 text-xs font-semibold">
                {["All", "Undergraduate", "Postgraduate"].map((lvl) => (
                  <button
                    key={lvl}
                    onClick={() => setSelectedLevel(lvl)}
                    className={`px-3.5 py-1.5 rounded-lg transition-colors cursor-pointer ${
                      selectedLevel === lvl 
                        ? "bg-[#1a2f5e] text-white" 
                        : "text-gray-500 hover:text-[#1a2f5e]"
                    }`}
                  >
                    {lvl === "All" ? "Both Levels" : lvl}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Core Selectors & Range Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-gray-100">
            {/* Discipline Dropdown */}
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Subject Discipline</label>
              <select
                value={selectedDiscipline}
                onChange={(e) => setSelectedDiscipline(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-[#1a2f5e] focus:outline-none focus:border-[#c9a84c] cursor-pointer"
              >
                <option value="All">🔬 All Subject Areas</option>
                {Object.entries(DISCIPLINES_MAP).map(([key, value]) => (
                  <option key={key} value={key}>{value.icon} {value.label}</option>
                ))}
              </select>
            </div>

            {/* Duration Selector */}
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Program Duration</label>
              <select
                value={selectedDuration}
                onChange={(e) => setSelectedDuration(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-[#1a2f5e] focus:outline-none focus:border-[#c9a84c] cursor-pointer"
              >
                <option value="All">⏱️ All Durations</option>
                <option value="1-2">1–2 Years (Typical PG / Masters)</option>
                <option value="3-4">3–4 Years (Typical UG / Bachelors)</option>
              </select>
            </div>

            {/* Budget range */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Annual Tuition Limit</label>
                <span className="text-xs font-bold text-[#c9a84c] bg-[#fef9f0] px-2 py-0.5 rounded">
                  Max: ${maxFees.toLocaleString()}
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="120000"
                step="5000"
                value={maxFees}
                onChange={(e) => setMaxFees(parseInt(e.target.value, 10))}
                className="w-full accent-[#c9a84c] h-2 bg-gray-100 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-gray-400 mt-1">
                <span>$0</span>
                <span>$60,000</span>
                <span>$120,000+</span>
              </div>
            </div>
          </div>
        </div>

        {/* Results Status Bar */}
        <div className="flex items-center justify-between mb-6 px-2">
          <p className="text-sm font-medium text-gray-500">
            Showing <span className="text-[#1a2f5e] font-bold">{filteredCourses.length}</span> structured courses
          </p>
          {(selectedDiscipline !== "All" || selectedLevel !== "All" || selectedDuration !== "All" || maxFees < 120000 || search !== "") && (
            <button
              onClick={() => {
                setSearch("");
                setSelectedDiscipline("All");
                setSelectedLevel("All");
                setSelectedDuration("All");
                setMaxFees(120000);
              }}
              className="text-xs text-red-500 hover:text-red-700 font-semibold cursor-pointer"
            >
              Reset Filters
            </button>
          )}
        </div>

        {/* Course Cards Grid */}
        {filteredCourses.length === 0 ? (
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-16 text-center text-gray-400 max-w-lg mx-auto">
            <BookOpen size={48} className="mx-auto mb-4 opacity-30 text-[#1a2f5e]" />
            <p className="text-lg font-bold text-[#1a2f5e] mb-1">No Courses Match Your Criteria</p>
            <p className="text-sm text-gray-400">Try modifying your filter settings or checking a different keyword search.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((c) => (
              <div
                key={c.id}
                className="bg-white rounded-3xl border border-gray-100 hover:border-[#c9a84c]/50 p-6 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group"
              >
                {/* Upper row: flag & degree badges */}
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-bold text-[#c9a84c] bg-[#fef9f0] px-3 py-1 rounded-full uppercase tracking-wider">
                    {c.degreeLevel}
                  </span>
                  
                  <div className="flex items-center gap-1.5 bg-gray-50 px-2.5 py-1 rounded-full border border-gray-100">
                    <span className="text-base">{c.university.flag}</span>
                    <span className="text-[10px] font-bold text-gray-500">{c.university.country}</span>
                  </div>
                </div>

                {/* Course Name */}
                <h3 className="text-base font-bold text-[#1a2f5e] group-hover:text-[#c9a84c] transition-colors leading-snug mb-1">
                  {c.name}
                </h3>
                
                {/* Offering University */}
                <p className="text-gray-400 text-xs font-semibold flex items-center gap-1 mb-5">
                  🏫 {c.university.name}
                </p>

                {/* Metrics Panel */}
                <div className="grid grid-cols-2 gap-3 bg-gray-50 rounded-2xl p-3 mb-5 text-xs">
                  <div className="flex items-center gap-2">
                    <Clock size={14} className="text-[#c9a84c] shrink-0" />
                    <div>
                      <p className="text-[9px] text-gray-400 font-semibold uppercase tracking-wider">Duration</p>
                      <p className="font-bold text-[#1a2f5e] truncate">{c.duration}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <BadgeEuro size={14} className="text-[#c9a84c] shrink-0" />
                    <div>
                      <p className="text-[9px] text-gray-400 font-semibold uppercase tracking-wider">Fees</p>
                      <p className="font-bold text-[#1a2f5e] truncate">{c.feesText}</p>
                    </div>
                  </div>
                </div>

                {/* Course Requirements */}
                <div className="flex flex-wrap items-center justify-between gap-2 bg-gray-50/50 p-2.5 rounded-xl border border-gray-100 text-[10px] text-gray-400 mb-6 font-semibold">
                  <span>Entry: IELTS {c.ielts}</span>
                  <span>CGPA: {c.university.gpaMin}+</span>
                  <span>Intakes: {c.intake}</span>
                </div>

                {/* Action CTA bottom */}
                <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between">
                  <Link
                    href={`/universities/${c.university.id}`}
                    className="text-[#1a2f5e] hover:text-[#c9a84c] font-bold text-xs flex items-center gap-1 transition-colors"
                  >
                    View University <ArrowRight size={12} />
                  </Link>
                  
                  <Link href={`/eligibility?uni=${c.university.id}&stream=${c.discipline}`}>
                    <Button size="xs" className="bg-[#1a2f5e] hover:bg-[#c9a84c] text-white text-[10px] font-bold px-3 py-1 rounded-full flex items-center gap-1 shadow-sm h-8">
                      Check Score Match <Sparkles size={10} />
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
