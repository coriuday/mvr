"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { GraduationCap, ArrowRight, ArrowLeft, ShieldCheck, Sparkles, CheckCircle2, AlertTriangle, BadgeEuro, Clock, Info, Landmark, HelpCircle, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { UNIVERSITIES, type University } from "@/data/universities";

// ── Define Scales & Fields ──────────────────────────────────────────────────
const SCALES = [
  { id: "10", label: "10.0 CGPA Scale (India / Global)" },
  { id: "4", label: "4.0 GPA Scale (US / WES)" }
];

const STREAMS = [
  { id: "CS", label: "Computer Science & IT" },
  { id: "Engineering", label: "Engineering & Robotics" },
  { id: "Business", label: "Business & MBA" },
  { id: "Medicine", label: "Medicine & Health Sciences" },
  { id: "Law", label: "Law & International Relations" },
  { id: "Sciences", label: "Natural & Applied Sciences" },
  { id: "Architecture", label: "Architecture & Design" }
];

const COUNTRIES = [
  "USA", "UK", "Canada", "Australia", "Germany", "Ireland", "France", "Netherlands", "Sweden", "Singapore", "Japan", "Switzerland"
];

function EligibilityContent() {
  const searchParams = useSearchParams();
  const [step, setStep] = useState(1);

  // ── Step 1 States: Academics ──
  const [gpa, setGpa] = useState<string>("8.0");
  const [scale, setScale] = useState<string>("10");
  const [backlogs, setBacklogs] = useState<string>("0");
  const [degreeLevel, setDegreeLevel] = useState<"Undergraduate" | "Postgraduate">("Postgraduate");

  // ── Step 2 States: Language & Exam ──
  const [ielts, setIelts] = useState<string>("7.0");
  const [gre, setGre] = useState<string>("");
  const [gmat, setGmat] = useState<string>("");

  // ── Step 3 States: Preferences ──
  const [selectedStreams, setSelectedStreams] = useState<string[]>([]);
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);

  // ── Pre-fill values from Query Parameters on load ──
  useEffect(() => {
    const queryUni = searchParams.get("uni");
    const queryStream = searchParams.get("stream");
    const queryCountry = searchParams.get("country");

    if (queryUni) {
      const matchedUni = UNIVERSITIES.find(u => u.id === queryUni);
      if (matchedUni) {
        setSelectedCountries([matchedUni.country]);
        if (matchedUni.programs.length > 0) {
          setSelectedStreams([matchedUni.programs[0]]);
        }
      }
    } else {
      if (queryCountry) {
        setSelectedCountries([queryCountry]);
      }
      if (queryStream) {
        setSelectedStreams([queryStream]);
      }
    }
  }, [searchParams]);

  // ── Validation logic per step ──
  const isStepValid = useMemo(() => {
    if (step === 1) {
      const gpaNum = parseFloat(gpa);
      if (isNaN(gpaNum)) return false;
      if (scale === "10" && (gpaNum < 0 || gpaNum > 10)) return false;
      if (scale === "4" && (gpaNum < 0 || gpaNum > 4)) return false;
      return true;
    }
    if (step === 2) {
      const ieltsNum = parseFloat(ielts);
      if (isNaN(ieltsNum) || ieltsNum < 4.0 || ieltsNum > 9.0) return false;
      return true;
    }
    if (step === 3) {
      return selectedStreams.length > 0;
    }
    return true;
  }, [step, gpa, scale, ielts, selectedStreams]);

  // ── Stream and Country Toggle Helpers ──
  const toggleStream = (id: string) => {
    setSelectedStreams(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  const toggleCountry = (name: string) => {
    setSelectedCountries(prev =>
      prev.includes(name) ? prev.filter(c => c !== name) : [...prev, name]
    );
  };

  // ── Dynamic Scoring Logic ──
  const assessmentResult = useMemo(() => {
    const rawGpa = parseFloat(gpa);
    // Convert 4.0 scale to 10.0 scale equivalent for internal matching
    const gpa10Scale = scale === "4" ? rawGpa * 2.5 : rawGpa;
    const ieltsNum = parseFloat(ielts);
    const backlogsNum = parseInt(backlogs, 10);

    // Profile tier categorization
    let tier: "elite" | "strong" | "conditional" | "pathway" = "conditional";
    let message = "";
    let colorClass = "";

    if (gpa10Scale >= 8.5 && ieltsNum >= 7.0 && backlogsNum === 0) {
      tier = "elite";
      message = "Competitive Elite Profile";
      colorClass = "text-emerald-600 bg-emerald-50 border-emerald-200";
    } else if (gpa10Scale >= 7.2 && ieltsNum >= 6.5 && backlogsNum <= 2) {
      tier = "strong";
      message = "Strong Admissions Profile";
      colorClass = "text-[#1a2f5e] bg-[#fdf8ef] border-[#c9a84c]/20";
    } else if (gpa10Scale >= 6.0 && ieltsNum >= 5.5 && backlogsNum <= 4) {
      tier = "conditional";
      message = "Eligible with standard guidelines";
      colorClass = "text-amber-700 bg-amber-50 border-amber-200";
    } else {
      tier = "pathway";
      message = "Pathway or Pre-Sessional required";
      colorClass = "text-rose-700 bg-rose-50 border-rose-200";
    }

    // Filter matching universities from central database
    const matchedUnis = UNIVERSITIES.filter(u => {
      // 1. Country filter (if user selected specific countries, check them)
      if (selectedCountries.length > 0 && !selectedCountries.includes(u.country)) {
        return false;
      }
      
      // 2. Stream filter (must offer at least one of preferred disciplines)
      const offersProgram = u.programs.some(p => selectedStreams.includes(p));
      if (!offersProgram) return false;

      // 3. GPA requirement check
      if (u.gpaMin && gpa10Scale < u.gpaMin) return false;

      // 4. IELTS requirements check
      if (u.ieltsMin && ieltsNum < u.ieltsMin) return false;

      // 5. Backlog limits (strict schools restrict if backlogs > 3)
      if (backlogsNum > 3 && ["mit", "stanford", "harvard", "oxford", "cambridge", "eth"].includes(u.id)) {
        return false;
      }

      return true;
    });

    return { tier, message, colorClass, matchedUnis };
  }, [gpa, scale, backlogs, ielts, selectedStreams, selectedCountries]);

  return (
    <div className="bg-gray-50 min-h-screen pb-24">
      {/* Wizard Header Banner */}
      <section className="bg-[#1a2f5e] py-16 relative overflow-hidden text-white">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-[#c9a84c]/5 -translate-y-1/2 translate-x-1/4" />
        </div>
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-3" style={{ fontFamily: "var(--font-playfair)" }}>
            Study Abroad <span className="text-[#c9a84c]">Eligibility Checker</span>
          </h1>
          <p className="text-white/60 text-sm max-w-xl mx-auto leading-relaxed">
            Take our 4-step dynamic assessment to evaluate your academic profile and instantly discover matched partner universities and scholarships.
          </p>

          {/* Stepper Progress Bar */}
          <div className="max-w-md mx-auto mt-10 relative">
            <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-white/10 -translate-y-1/2 pointer-events-none" />
            <div
              className="absolute top-1/2 left-0 h-0.5 bg-[#c9a84c] -translate-y-1/2 transition-all duration-300 pointer-events-none"
              style={{ width: `${((step - 1) / 3) * 100}%` }}
            />
            
            <div className="flex justify-between relative z-10">
              {[1, 2, 3, 4].map((num) => (
                <button
                  key={num}
                  disabled={num > step && !isStepValid}
                  onClick={() => setStep(num)}
                  className={`w-9 h-9 rounded-full font-bold text-xs flex items-center justify-center border transition-all ${
                    step === num
                      ? "bg-[#c9a84c] border-[#c9a84c] text-white ring-4 ring-[#c9a84c]/20"
                      : step > num
                      ? "bg-[#1a2f5e] border-[#c9a84c] text-[#c9a84c]"
                      : "bg-[#122244] border-white/10 text-white/40 cursor-not-allowed"
                  }`}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Questionnaire Container */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 mt-10">
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6 md:p-10 min-h-[400px] flex flex-col">
          
          {/* ───────────────── STEP 1: ACADEMICS ───────────────── */}
          {step === 1 && (
            <div className="space-y-6 flex-1">
              <div>
                <span className="text-[10px] font-bold text-[#c9a84c] uppercase tracking-widest bg-[#fef9f0] px-3 py-1 rounded-full">Step 1 of 4</span>
                <h2 className="text-xl font-bold text-[#1a2f5e] mt-3" style={{ fontFamily: "var(--font-playfair)" }}>Academic Background</h2>
                <p className="text-gray-400 text-xs mt-1">Please enter your highest academic scores and backlog details.</p>
              </div>

              <div className="grid sm:grid-cols-2 gap-6 pt-4">
                {/* Scale selection */}
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">GPA / CGPA Scale</label>
                  <select
                    value={scale}
                    onChange={(e) => {
                      setScale(e.target.value);
                      setGpa(e.target.value === "10" ? "8.0" : "3.2");
                    }}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-semibold text-[#1a2f5e] focus:outline-none focus:border-[#c9a84c]"
                  >
                    {SCALES.map(s => (
                      <option key={s.id} value={s.id}>{s.label}</option>
                    ))}
                  </select>
                </div>

                {/* Score Input */}
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                    Academic Score ({scale === "10" ? "Out of 10.0" : "Out of 4.0"})
                  </label>
                  <input
                    type="number"
                    step="0.05"
                    min="0"
                    max={scale === "10" ? "10" : "4"}
                    value={gpa}
                    onChange={(e) => setGpa(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-[#1a2f5e] focus:outline-none focus:border-[#c9a84c]"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-6">
                {/* Backlog selectors */}
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Number of Backlogs</label>
                  <select
                    value={backlogs}
                    onChange={(e) => setBacklogs(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-semibold text-[#1a2f5e] focus:outline-none focus:border-[#c9a84c]"
                  >
                    <option value="0">0 Backlogs (None)</option>
                    <option value="1">1–3 Backlogs</option>
                    <option value="4">4–6 Backlogs</option>
                    <option value="7">7+ Backlogs</option>
                  </select>
                </div>

                {/* Degree Seeking */}
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Seeking Qualification</label>
                  <div className="grid grid-cols-2 gap-2 bg-gray-50 p-1 rounded-xl border border-gray-200">
                    <button
                      onClick={() => setDegreeLevel("Undergraduate")}
                      className={`py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        degreeLevel === "Undergraduate"
                          ? "bg-[#1a2f5e] text-white shadow"
                          : "text-gray-500 hover:text-[#1a2f5e]"
                      }`}
                    >
                      Bachelors (UG)
                    </button>
                    <button
                      onClick={() => setDegreeLevel("Postgraduate")}
                      className={`py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        degreeLevel === "Postgraduate"
                          ? "bg-[#1a2f5e] text-white shadow"
                          : "text-gray-500 hover:text-[#1a2f5e]"
                      }`}
                    >
                      Masters / MBA (PG)
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ───────────────── STEP 2: STANDARDIZED EXAMS ───────────────── */}
          {step === 2 && (
            <div className="space-y-6 flex-1">
              <div>
                <span className="text-[10px] font-bold text-[#c9a84c] uppercase tracking-widest bg-[#fef9f0] px-3 py-1 rounded-full">Step 2 of 4</span>
                <h2 className="text-xl font-bold text-[#1a2f5e] mt-3" style={{ fontFamily: "var(--font-playfair)" }}>Language & Standardized Tests</h2>
                <p className="text-gray-400 text-xs mt-1">Select your language scores or inputs. Leave academic test scores blank if not taken.</p>
              </div>

              <div className="grid sm:grid-cols-3 gap-5 pt-4">
                {/* IELTS selector */}
                <div className="sm:col-span-2">
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">IELTS Score (or equivalent)</label>
                    <span className="text-xs font-bold text-[#c9a84c] bg-[#fef9f0] px-2 py-0.5 rounded">
                      Band: {ielts}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="4.5"
                    max="9.0"
                    step="0.5"
                    value={ielts}
                    onChange={(e) => setIelts(e.target.value)}
                    className="w-full accent-[#c9a84c] h-2 bg-gray-100 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-gray-400 mt-1 font-semibold">
                    <span>4.5 (Basic)</span>
                    <span>6.5 (Standard)</span>
                    <span>9.0 (Expert)</span>
                  </div>
                </div>

                <div>
                  <div className="bg-[#fef9f0] border border-[#c9a84c]/20 p-3 rounded-2xl text-[10px] text-gray-500 leading-relaxed mt-2.5">
                    💡 <strong>PTE Equivalency:</strong><br />
                    IELTS 6.5 ≈ PTE 58-64<br />
                    IELTS 7.0 ≈ PTE 65-72
                  </div>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-6 pt-4 border-t border-gray-50">
                {/* GRE Score */}
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">GRE Score (Optional)</label>
                  <input
                    type="number"
                    min="260"
                    max="340"
                    placeholder="e.g. 312 (if taken)"
                    value={gre}
                    onChange={(e) => setGre(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-[#1a2f5e] focus:outline-none focus:border-[#c9a84c]"
                  />
                </div>

                {/* GMAT Score */}
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">GMAT Score (Optional)</label>
                  <input
                    type="number"
                    min="200"
                    max="800"
                    placeholder="e.g. 650 (if taken)"
                    value={gmat}
                    onChange={(e) => setGmat(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-[#1a2f5e] focus:outline-none focus:border-[#c9a84c]"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ───────────────── STEP 3: PREFERENCES ───────────────── */}
          {step === 3 && (
            <div className="space-y-6 flex-1">
              <div>
                <span className="text-[10px] font-bold text-[#c9a84c] uppercase tracking-widest bg-[#fef9f0] px-3 py-1 rounded-full">Step 3 of 4</span>
                <h2 className="text-xl font-bold text-[#1a2f5e] mt-3" style={{ fontFamily: "var(--font-playfair)" }}>Desired Streams & Countries</h2>
                <p className="text-gray-400 text-xs mt-1">Select one or more streams and countries you are interested in.</p>
              </div>

              {/* Stream Multiselect */}
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Field of Study (Select all that apply)</label>
                <div className="flex flex-wrap gap-2">
                  {STREAMS.map((s) => {
                    const isSelected = selectedStreams.includes(s.id);
                    return (
                      <button
                        key={s.id}
                        onClick={() => toggleStream(s.id)}
                        className={`px-4 py-2 rounded-2xl text-xs font-bold border transition-all cursor-pointer ${
                          isSelected
                            ? "bg-[#1a2f5e] border-[#1a2f5e] text-white shadow-sm"
                            : "bg-white border-gray-200 text-gray-600 hover:border-gray-300"
                        }`}
                      >
                        {s.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Country Multiselect */}
              <div className="pt-4 border-t border-gray-50">
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Target Destinations (Optional - leave empty for all)</label>
                <div className="flex flex-wrap gap-2">
                  {COUNTRIES.map((c) => {
                    const isSelected = selectedCountries.includes(c);
                    return (
                      <button
                        key={c}
                        onClick={() => toggleCountry(c)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                          isSelected
                            ? "bg-[#c9a84c] border-[#c9a84c] text-white shadow-sm"
                            : "bg-white border-gray-200 text-gray-500 hover:border-gray-300"
                        }`}
                      >
                        {c}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ───────────────── STEP 4: RESULT SCREEN ───────────────── */}
          {step === 4 && (
            <div className="space-y-6 flex-1">
              <div>
                <span className="text-[10px] font-bold text-[#c9a84c] uppercase tracking-widest bg-[#fef9f0] px-3 py-1 rounded-full">Step 4 of 4: Results</span>
                <h2 className="text-2xl font-bold text-[#1a2f5e] mt-3" style={{ fontFamily: "var(--font-playfair)" }}>Your Eligibility Profile</h2>
              </div>

              {/* Score Assessment Card */}
              <div className={`rounded-3xl border p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${assessmentResult.colorClass}`}>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider opacity-60">Calculated Assessment Tier</p>
                  <p className="text-xl font-black mt-1 flex items-center gap-1.5">
                    {assessmentResult.tier === "elite" && <Trophy size={20} />}
                    {assessmentResult.message}
                  </p>
                </div>
                <div className="shrink-0 flex items-center gap-2">
                  <div className="text-right">
                    <p className="text-[9px] font-bold uppercase tracking-wider opacity-50">Converted score</p>
                    <p className="text-sm font-bold">{scale === "4" ? `${gpa}/4.0` : `${gpa}/10.0`} GPA</p>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                    <CheckCircle2 size={22} className="shrink-0" />
                  </div>
                </div>
              </div>

              {/* Backlog / Exam feedback */}
              {parseInt(backlogs, 10) > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-2.5 text-xs text-amber-800">
                  <AlertTriangle size={16} className="shrink-0 mt-0.5 text-amber-600" />
                  <div>
                    <p className="font-bold">Active Backlog Alert ({backlogs} backlogs selected)</p>
                    <p className="mt-0.5">Top-tier universities in USA, Switzerland, and Singapore maintain strict backlog guidelines. Speak with our coaches to present mitigating factors or secure backlogs clearance certificates.</p>
                  </div>
                </div>
              )}

              {/* Recommended Universities Grid */}
              <div className="space-y-4 pt-4 border-t border-gray-100">
                <h3 className="font-bold text-[#1a2f5e] text-sm flex items-center gap-1">
                  🎓 Recommended Partner Universities ({assessmentResult.matchedUnis.length})
                </h3>
                
                {assessmentResult.matchedUnis.length === 0 ? (
                  <div className="bg-gray-50 rounded-2xl p-8 text-center text-gray-400 border-2 border-dashed border-gray-200">
                    <HelpCircle size={28} className="mx-auto mb-2 text-gray-300" />
                    <p className="font-bold text-gray-500 text-xs">No Exact Matches found</p>
                    <p className="text-[10px] text-gray-400 mt-1 max-w-sm mx-auto">Your score combination or specific country filters may be too strict. Contact our counselors to find custom structural pathway options.</p>
                  </div>
                ) : (
                  <div className="grid sm:grid-cols-2 gap-4">
                    {assessmentResult.matchedUnis.slice(0, 4).map((u) => (
                      <div key={u.id} className="bg-gray-50 border border-gray-200 rounded-2xl p-4 flex flex-col justify-between hover:border-[#c9a84c]/40 transition-colors">
                        <div>
                          <div className="flex items-center justify-between text-[10px] text-gray-400 font-semibold mb-2">
                            <span>{u.flag} {u.country}</span>
                            <span className="text-[#c9a84c]">{u.ranking}</span>
                          </div>
                          <h4 className="font-bold text-xs text-[#1a2f5e] line-clamp-1">{u.name}</h4>
                          <p className="text-[10px] text-gray-400 mt-1 line-clamp-2 leading-relaxed">{u.description}</p>
                        </div>
                        <div className="pt-3 border-t border-gray-200/50 mt-3 flex items-center justify-between text-[10px]">
                          <span className="font-bold text-[#1a2f5e]">{u.fees}</span>
                          <Link href={`/universities/${u.id}`} className="text-[#c9a84c] font-bold hover:underline">
                            Details
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {assessmentResult.matchedUnis.length > 4 && (
                  <p className="text-[10px] text-center text-gray-400 italic font-semibold">
                    + {assessmentResult.matchedUnis.length - 4} more matching schools. Apply below to receive your complete matching brochure.
                  </p>
                )}
              </div>

              {/* Dynamic Scholarships Display */}
              <div className="bg-[#fef9f0] border border-[#c9a84c]/20 rounded-2xl p-5 space-y-3">
                <h4 className="font-bold text-xs text-[#1a2f5e] flex items-center gap-1">
                  <Landmark size={15} className="text-[#c9a84c]" /> Potential Scholarships Matched
                </h4>
                <p className="text-[10px] text-gray-500 leading-relaxed">
                  Based on your competitive academic profile, you qualify for dynamic regional tuition fee waivers. Major matched support includes:
                </p>
                <ul className="text-[10px] text-gray-600 font-bold space-y-1 bg-white p-3 rounded-xl border border-[#c9a84c]/10">
                  <li>✓ Stipendium Hungaricum (100% tuition, medical, and living stipend for Hungary)</li>
                  <li>✓ DAAD Germany Scholarships (Full living allowance support)</li>
                  <li>✓ Merit-based School Waivers (Up to $15,000–$25,000 annual fee discount in USA/Canada)</li>
                </ul>
              </div>
            </div>
          )}

          {/* Stepper Buttons Panel */}
          <div className="mt-auto pt-8 border-t border-gray-100 flex items-center justify-between gap-4">
            {step > 1 && step < 4 && (
              <Button
                variant="outline"
                onClick={() => setStep(prev => prev - 1)}
                className="border-gray-200 text-[#1a2f5e] hover:bg-gray-50 font-bold text-xs h-11 rounded-full px-6 flex items-center gap-1.5"
              >
                <ArrowLeft size={14} /> Back
              </Button>
            )}
            
            {step === 4 && (
              <Button
                variant="outline"
                onClick={() => setStep(1)}
                className="border-gray-200 text-[#1a2f5e] hover:bg-gray-50 font-bold text-xs h-11 rounded-full px-6 flex items-center gap-1.5"
              >
                <ArrowLeft size={14} /> Restart Wizard
              </Button>
            )}

            <div className="ml-auto">
              {step < 3 ? (
                <Button
                  disabled={!isStepValid}
                  onClick={() => setStep(prev => prev + 1)}
                  className="bg-[#1a2f5e] hover:bg-[#c9a84c] text-white font-bold text-xs h-11 rounded-full px-7 flex items-center gap-1.5 shadow-sm"
                >
                  Continue <ArrowRight size={14} />
                </Button>
              ) : step === 3 ? (
                <Button
                  disabled={!isStepValid}
                  onClick={() => setStep(4)}
                  className="bg-[#c9a84c] hover:bg-[#a07a2e] text-white font-bold text-xs h-11 rounded-full px-8 flex items-center gap-1.5 shadow-md"
                >
                  Predict Matches <Sparkles size={14} />
                </Button>
              ) : (
                <Link href="/contact">
                  <Button className="bg-[#1a2f5e] hover:bg-[#c9a84c] text-white font-bold text-xs h-11 rounded-full px-8 flex items-center gap-1.5 shadow-sm">
                    Book Counselor Consultation <ArrowRight size={14} />
                  </Button>
                </Link>
              )}
            </div>
          </div>

        </div>
      </section>
    </div>
  );
}

export default function EligibilityClient() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center text-gray-400">
          <GraduationCap size={40} className="animate-bounce mx-auto mb-3 text-[#1a2f5e]" />
          <p className="font-semibold text-sm">Loading Eligibility Matcher...</p>
        </div>
      </div>
    }>
      <EligibilityContent />
    </Suspense>
  );
}
