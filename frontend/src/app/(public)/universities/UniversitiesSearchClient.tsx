"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { GraduationCap, Star, Users, ArrowRight, Search, SlidersHorizontal, BookOpen, Clock, BadgeEuro, Sparkles, ExternalLink, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useUniversities } from "@/hooks/useUniversities";

const FIELDS_OF_STUDY = [
  "All", "CS", "Engineering", "Business", "Medicine", "Law", "Sciences", "Architecture", "Design"
];

const INTAKE_OPTIONS = [
  "All", "Sept", "Oct", "Jan", "Feb", "Apr", "Jul", "Aug"
];

export default function UniversitiesSearchClient() {
  const { universities: UNIVERSITIES, loading: apiLoading } = useUniversities();
  const [search, setSearch] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("All");
  const [selectedField, setSelectedField] = useState("All");
  const [selectedIntake, setSelectedIntake] = useState("All");
  const [maxFees, setMaxFees] = useState(120000);
  const [sortBy, setSortBy] = useState("rank"); // "rank", "fees-asc", "fees-desc", "alphabetical"

  // Derive unique countries dynamically from data
  const uniqueCountries = useMemo(() => {
    const countries = new Set(UNIVERSITIES.map(u => u.country));
    return ["All", ...Array.from(countries).sort()];
  }, [UNIVERSITIES]);

  // Filter universities
  const filteredUnis = useMemo(() => {
    return UNIVERSITIES.filter(u => {
      const matchText = search === "" ||
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.programs.some(p => p.toLowerCase().includes(search.toLowerCase())) ||
        u.country.toLowerCase().includes(search.toLowerCase());

      const matchCountry = selectedCountry === "All" || u.country === selectedCountry;
      const matchField = selectedField === "All" || u.programs.includes(selectedField);
      
      const matchIntake = selectedIntake === "All" || 
        u.intake.toLowerCase().includes(selectedIntake.toLowerCase());
      
      const matchFees = u.annualTuitionUsd <= maxFees;

      return matchText && matchCountry && matchField && matchIntake && matchFees;
    }).sort((a, b) => {
      if (sortBy === "alphabetical") {
        return a.name.localeCompare(b.name);
      }
      if (sortBy === "fees-asc") {
        return a.annualTuitionUsd - b.annualTuitionUsd;
      }
      if (sortBy === "fees-desc") {
        return b.annualTuitionUsd - a.annualTuitionUsd;
      }
      // sort by QS rank (we'll parse the rank or just use the ranking string pattern)
      const getRankNum = (ranking: string) => {
        const match = ranking.match(/\d+/);
        return match ? parseInt(match[0], 10) : 9999;
      };
      return getRankNum(a.ranking) - getRankNum(b.ranking);
    });
  }, [search, selectedCountry, selectedField, selectedIntake, maxFees, sortBy, UNIVERSITIES]);

  return (
    <div className="bg-gray-50 min-h-screen pb-24">
      {/* Search Header Banner */}
      <section className="bg-[#1a2f5e] py-20 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full bg-[#c9a84c]/5 -translate-y-1/2 translate-x-1/3" />
          <div className="absolute bottom-0 left-0 w-96 h-96 rounded-full bg-white/[0.02] translate-y-1/3 -translate-x-1/4" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <span className="inline-flex items-center gap-2 bg-[#c9a84c]/20 text-[#c9a84c] text-xs font-semibold uppercase tracking-wider px-4 py-2 rounded-full mb-6">
            <GraduationCap size={14} /> Interactive Directory
          </span>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6" style={{ fontFamily: "var(--font-playfair)" }}>
            Explore Our <span className="text-gradient-gold">Partner Universities</span>
          </h1>
          <p className="text-white/70 text-lg max-w-2xl mx-auto leading-relaxed">
            Instantly search and filter through 55+ world-class institutions across 26 global destinations. Vetted for academic quality and high visa success.
          </p>
        </div>
      </section>

      {/* Main Filter & Grid Container */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 -mt-10 relative z-10">
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6 md:p-8 mb-10">
          
          {/* Top Search & Sort Row */}
          <div className="flex flex-col lg:flex-row gap-4 mb-8">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search university name, country, or program (e.g. 'MIT', 'Germany', 'CS')..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-11 pr-5 py-3 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:border-[#c9a84c] focus:ring-1 focus:ring-[#c9a84c] transition-all"
              />
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5 shrink-0">
                <SlidersHorizontal size={14} /> Sort By:
              </span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-[#1a2f5e] focus:outline-none focus:border-[#c9a84c] cursor-pointer"
              >
                <option value="rank">QS Global Rank</option>
                <option value="fees-asc">Tuition: Low to High</option>
                <option value="fees-desc">Tuition: High to Low</option>
                <option value="alphabetical">Alphabetical A-Z</option>
              </select>
            </div>
          </div>

          {/* Detailed Filtering Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 pt-6 border-t border-gray-100">
            {/* Country Selector */}
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Country</label>
              <select
                value={selectedCountry}
                onChange={(e) => setSelectedCountry(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-[#1a2f5e] focus:outline-none focus:border-[#c9a84c] cursor-pointer"
              >
                {uniqueCountries.map(c => (
                  <option key={c} value={c}>{c === "All" ? "🌍 All Countries" : c}</option>
                ))}
              </select>
            </div>

            {/* Field Selector */}
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Field of Study</label>
              <select
                value={selectedField}
                onChange={(e) => setSelectedField(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-[#1a2f5e] focus:outline-none focus:border-[#c9a84c] cursor-pointer"
              >
                {FIELDS_OF_STUDY.map(f => (
                  <option key={f} value={f}>{f === "All" ? "🎓 All Disciplines" : f}</option>
                ))}
              </select>
            </div>

            {/* Intake Selector */}
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Intake Term</label>
              <select
                value={selectedIntake}
                onChange={(e) => setSelectedIntake(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-[#1a2f5e] focus:outline-none focus:border-[#c9a84c] cursor-pointer"
              >
                {INTAKE_OPTIONS.map(i => (
                  <option key={i} value={i}>{i === "All" ? "📅 All Intakes" : `${i} intake`}</option>
                ))}
              </select>
            </div>

            {/* Tuition Budget */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Annual Budget</label>
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

        {/* Dynamic Results Status Bar */}
        <div className="flex items-center justify-between mb-6 px-2">
          <p className="text-sm font-medium text-gray-500">
            Found <span className="text-[#1a2f5e] font-bold">{filteredUnis.length}</span> matching universities
          </p>
          {(selectedCountry !== "All" || selectedField !== "All" || selectedIntake !== "All" || maxFees < 120000 || search !== "") && (
            <button
              onClick={() => {
                setSearch("");
                setSelectedCountry("All");
                setSelectedField("All");
                setSelectedIntake("All");
                setMaxFees(120000);
              }}
              className="text-xs text-red-500 hover:text-red-700 font-semibold cursor-pointer"
            >
              Reset Filters
            </button>
          )}
        </div>

        {/* Universities Grid */}
        {filteredUnis.length === 0 ? (
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-16 text-center text-gray-400 max-w-lg mx-auto">
            <GraduationCap size={48} className="mx-auto mb-4 opacity-30 text-[#1a2f5e]" />
            <p className="text-lg font-bold text-[#1a2f5e] mb-1">No Universities Match Your Criteria</p>
            <p className="text-sm text-gray-400">Try loosening your budget slider, resetting selectors, or matching a different search term.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredUnis.map((u) => (
              <div
                key={u.id}
                className="bg-white rounded-3xl border border-gray-100 hover:border-[#c9a84c]/50 p-6 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group relative"
              >
                {/* Upper row: Rank & Flag */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2 bg-gray-50 border border-gray-100 px-3 py-1 rounded-full">
                    <span className="text-lg">{u.flag}</span>
                    <span className="text-xs font-bold text-gray-600">{u.country}</span>
                  </div>
                  <Badge className="bg-[#c9a84c]/15 text-[#a07a2e] hover:bg-[#c9a84c]/20 border-0 font-bold text-xs">
                    {u.ranking}
                  </Badge>
                </div>

                {/* University Name */}
                <h3 className="text-lg font-bold text-[#1a2f5e] group-hover:text-[#c9a84c] transition-colors mb-2 line-clamp-1" style={{ fontFamily: "var(--font-playfair)" }}>
                  {u.name}
                </h3>

                {/* Description */}
                <p className="text-gray-400 text-xs line-clamp-2 mb-5 leading-relaxed">
                  {u.description}
                </p>

                {/* Metrics Panel */}
                <div className="grid grid-cols-2 gap-3 bg-gray-50 rounded-2xl p-3.5 mb-5 text-xs">
                  <div className="flex items-center gap-2">
                    <BadgeEuro size={14} className="text-[#c9a84c] shrink-0" />
                    <div>
                      <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">Fees</p>
                      <p className="font-bold text-[#1a2f5e] truncate">{u.fees}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock size={14} className="text-[#c9a84c] shrink-0" />
                    <div>
                      <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">Intake</p>
                      <p className="font-bold text-[#1a2f5e] truncate">{u.intake}</p>
                    </div>
                  </div>
                </div>

                {/* Disciplines Badges */}
                <div className="flex flex-wrap gap-1.5 mb-6">
                  {u.programs.map((prog) => (
                    <span
                      key={prog}
                      className="bg-gray-100 text-gray-500 font-semibold text-[10px] px-2.5 py-1 rounded-full group-hover:bg-[#fdf8ef] group-hover:text-[#1a2f5e] transition-colors"
                    >
                      {prog}
                    </span>
                  ))}
                  <span className="bg-[#1a2f5e]/5 text-[#1a2f5e] font-semibold text-[10px] px-2.5 py-1 rounded-full">
                    IELTS {u.ielts}
                  </span>
                </div>

                {/* Action Buttons Row */}
                <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between gap-2.5">
                  <Link
                    href={`/universities/${u.id}`}
                    className="text-[#1a2f5e] hover:text-[#c9a84c] font-bold text-xs flex items-center gap-1 transition-colors"
                  >
                    View Brochure <ExternalLink size={12} />
                  </Link>

                  <div className="flex items-center gap-2">
                    <Link href={`/tools/compare?uni1=${u.id}`}>
                      <Button size="xs" variant="outline" className="border-gray-200 text-gray-500 text-[10px] font-bold h-8 px-2.5 rounded-full hover:bg-gray-50">
                        Compare
                      </Button>
                    </Link>
                    <Link href={`/eligibility?uni=${u.id}`}>
                      <Button size="xs" className="bg-[#1a2f5e] hover:bg-[#c9a84c] text-white text-[10px] font-bold h-8 px-3 rounded-full flex items-center gap-1 shadow-sm">
                        Apply <Sparkles size={10} />
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
