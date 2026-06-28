"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Brain, FileText, CheckCircle, AlertTriangle, XCircle,
  ChevronDown, ChevronUp, Sparkles, ArrowRight, RotateCcw,
  TrendingUp, Zap,
} from "lucide-react";
import Link from "next/link";
import { apiUrl } from "@/lib/api-url";

// ─── Types (mirror backend) ───────────────────────────────────────────────────

type DegreeLevel = "undergraduate" | "postgraduate" | "phd";
type Priority = "critical" | "high" | "medium" | "low";

interface ReviewDimension { name: string; score: number; comment: string; }
interface Improvement { priority: Priority; section: string; issue: string; fix: string; }

interface SopReviewResult {
  overall_score: number;
  verdict: string;
  dimensions: ReviewDimension[];
  strengths: string[];
  improvements: Improvement[];
  revised_intro: string | null;
  word_count: number;
  tokens_used?: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const COUNTRIES = [
  { value: "usa",         label: "🇺🇸 USA" },
  { value: "uk",          label: "🇬🇧 United Kingdom" },
  { value: "canada",      label: "🇨🇦 Canada" },
  { value: "australia",   label: "🇦🇺 Australia" },
  { value: "germany",     label: "🇩🇪 Germany" },
  { value: "ireland",     label: "🇮🇪 Ireland" },
  { value: "france",      label: "🇫🇷 France" },
  { value: "netherlands", label: "🇳🇱 Netherlands" },
  { value: "singapore",   label: "🇸🇬 Singapore" },
];

const DEGREES: { value: DegreeLevel; label: string }[] = [
  { value: "undergraduate", label: "Undergraduate (B.Sc / B.A / B.Eng)" },
  { value: "postgraduate",  label: "Postgraduate (M.Sc / MBA / M.A)" },
  { value: "phd",           label: "PhD / Doctorate" },
];

function scoreColor(score: number) {
  if (score >= 80) return "#22c55e";
  if (score >= 60) return "#f59e0b";
  if (score >= 40) return "#f97316";
  return "#ef4444";
}

function scoreLabel(score: number) {
  if (score >= 80) return "Strong";
  if (score >= 65) return "Good";
  if (score >= 50) return "Needs Work";
  return "Weak";
}

const PRIORITY_CONFIG: Record<Priority, { icon: React.ReactNode; color: string; bg: string }> = {
  critical: { icon: <XCircle size={14} />,       color: "#ef4444", bg: "#fef2f2" },
  high:     { icon: <AlertTriangle size={14} />, color: "#f97316", bg: "#fff7ed" },
  medium:   { icon: <AlertTriangle size={14} />, color: "#f59e0b", bg: "#fffbeb" },
  low:      { icon: <CheckCircle size={14} />,   color: "#6b7280", bg: "#f9fafb" },
};

// ─── Score Ring SVG ───────────────────────────────────────────────────────────

function ScoreRing({ score }: { score: number }) {
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = scoreColor(score);

  return (
    <div className="relative flex items-center justify-center" style={{ width: 132, height: 132 }}>
      <svg width={132} height={132} viewBox="0 0 132 132" className="-rotate-90">
        <circle cx={66} cy={66} r={radius} fill="none" stroke="#e5e7eb" strokeWidth={10} />
        <motion.circle
          cx={66} cy={66} r={radius}
          fill="none"
          stroke={color}
          strokeWidth={10}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2, ease: "easeOut" }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <motion.span
          className="text-3xl font-bold"
          style={{ color }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          {score}
        </motion.span>
        <span className="text-xs text-gray-400 font-semibold">/100</span>
      </div>
    </div>
  );
}

// ─── Dimension Bar ────────────────────────────────────────────────────────────

function DimensionBar({ dim, index }: { dim: ReviewDimension; index: number }) {
  const [open, setOpen] = useState(false);
  const color = scoreColor(dim.score);

  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.1 * index }}
      className="border border-gray-100 rounded-xl overflow-hidden"
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors text-left"
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-gray-800 truncate">{dim.name}</span>
            <span className="text-sm font-bold ml-3 shrink-0" style={{ color }}>
              {dim.score} — {scoreLabel(dim.score)}
            </span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{ backgroundColor: color }}
              initial={{ width: 0 }}
              animate={{ width: `${dim.score}%` }}
              transition={{ duration: 0.9, ease: "easeOut", delay: 0.15 * index }}
            />
          </div>
        </div>
        <span className="text-gray-400 shrink-0">
          {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </span>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <p className="px-4 pb-4 text-sm text-gray-600 leading-relaxed border-t border-gray-100 pt-3">
              {dim.comment}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── Improvement Card ─────────────────────────────────────────────────────────

function ImprovementCard({ item, index }: { item: Improvement; index: number }) {
  const cfg = PRIORITY_CONFIG[item.priority];

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.08 * index }}
      className="rounded-xl border p-4"
      style={{ borderColor: cfg.color + "33", backgroundColor: cfg.bg }}
    >
      <div className="flex items-center gap-2 mb-2">
        <span style={{ color: cfg.color }}>{cfg.icon}</span>
        <span className="text-xs font-bold uppercase tracking-wider" style={{ color: cfg.color }}>
          {item.priority}
        </span>
        <span className="text-xs text-gray-400 ml-1">— {item.section}</span>
      </div>
      <p className="text-sm font-semibold text-gray-800 mb-1">{item.issue}</p>
      <div className="flex items-start gap-2 mt-2 pt-2 border-t border-gray-200">
        <ArrowRight size={13} className="text-[#1a2f5e] mt-0.5 shrink-0" />
        <p className="text-sm text-gray-700">{item.fix}</p>
      </div>
    </motion.div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

type Step = "form" | "loading" | "result" | "error";

export default function SopReviewerClient() {
  const [step, setStep]         = useState<Step>("form");
  const [sopText, setSopText]   = useState("");
  const [country, setCountry]   = useState("");
  const [degree, setDegree]     = useState<DegreeLevel | "">("");
  const [program, setProgram]   = useState("");
  const [result, setResult]     = useState<SopReviewResult | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [loadingMsg, setLoadingMsg] = useState("Analysing your SOP…");

  const wordCount = sopText.trim().split(/\s+/).filter(Boolean).length;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStep("loading");

    // Progressive loading messages — AI takes 5–10s, keep user engaged
    const msgs = [
      "Analysing your SOP…",
      "Evaluating clarity & structure…",
      "Reviewing motivation & purpose…",
      "Checking academic presentation…",
      "Generating improvement suggestions…",
      "Almost done…",
    ];
    let i = 0;
    const ticker = setInterval(() => {
      i = (i + 1) % msgs.length;
      setLoadingMsg(msgs[i]);
    }, 1800);

    try {
      const res = await fetch(apiUrl("/api/sop/review"), {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sop_text: sopText.trim(),
          country:  country   || undefined,
          degree:   degree    || undefined,
          program:  program.trim() || undefined,
        }),
      });

      const data = await res.json();

      if (res.status === 429) {
        setErrorMsg("You've reached the review limit. Please wait 2 minutes before trying again.");
        setStep("error");
        return;
      }
      if (!res.ok || !data.success) {
        setErrorMsg(data?.error?.message ?? "Something went wrong. Please try again.");
        setStep("error");
        return;
      }

      setResult(data.data);
      setStep("result");
    } catch {
      setErrorMsg("Connection error. Please check your internet and try again.");
      setStep("error");
    } finally {
      clearInterval(ticker);
    }
  }

  function reset() {
    setStep("form");
    setResult(null);
    setErrorMsg("");
    setSopText("");
  }

  // ── Form ──────────────────────────────────────────────────────────────────

  if (step === "form") return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="bg-[#1a2f5e] pt-28 pb-20 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-[420px] h-[420px] rounded-full bg-[#c9a84c]/5 -translate-y-1/2 translate-x-1/3" />
          <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-white/[0.03] translate-y-1/2 -translate-x-1/3" />
        </div>
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55 }}>
            <span className="inline-flex items-center gap-2 bg-[#c9a84c]/20 text-[#c9a84c] text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full mb-6">
              <Sparkles size={13} /> AI-Powered — Free Tool
            </span>
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-5" style={{ fontFamily: "var(--font-playfair)" }}>
              SOP Review <span className="text-[#c9a84c]">by AI</span>
            </h1>
            <p className="text-white/65 text-lg max-w-xl mx-auto leading-relaxed">
              Get instant, expert-level feedback on your Statement of Purpose. Scored across 5 dimensions with actionable improvements.
            </p>
            <div className="flex flex-wrap gap-4 justify-center mt-6">
              {[
                { icon: <Brain size={14} />, label: "5-Dimension Analysis" },
                { icon: <Zap size={14} />,   label: "Results in ~10 seconds" },
                { icon: <TrendingUp size={14} />, label: "Concrete Rewrites" },
              ].map((f) => (
                <div key={f.label} className="flex items-center gap-2 bg-white/10 text-white/80 text-xs font-semibold px-4 py-2 rounded-full">
                  {f.icon} {f.label}
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Form */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 -mt-8 pb-24 relative z-10">
        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 space-y-6"
        >
          {/* Context fields */}
          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                Target Country
              </label>
              <select
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#1a2f5e]/30 bg-white"
              >
                <option value="">Any country</option>
                {COUNTRIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                Degree Level
              </label>
              <select
                value={degree}
                onChange={(e) => setDegree(e.target.value as DegreeLevel)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#1a2f5e]/30 bg-white"
              >
                <option value="">Select level</option>
                {DEGREES.map((d) => <option key={d.value} value={d.value}>{d.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                Program / Field
              </label>
              <input
                type="text"
                placeholder="e.g. Computer Science"
                value={program}
                onChange={(e) => setProgram(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#1a2f5e]/30"
              />
            </div>
          </div>

          {/* SOP textarea */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">
                Your SOP Text <span className="text-red-400">*</span>
              </label>
              <span className={`text-xs font-semibold ${wordCount < 50 ? "text-red-400" : wordCount > 3000 ? "text-red-400" : "text-gray-400"}`}>
                {wordCount} / 3,000 words
              </span>
            </div>
            <textarea
              id="sop-text"
              required
              rows={16}
              value={sopText}
              onChange={(e) => setSopText(e.target.value)}
              placeholder="Paste your full Statement of Purpose here…"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 leading-relaxed focus:outline-none focus:ring-2 focus:ring-[#1a2f5e]/30 resize-y"
            />
            {wordCount > 0 && wordCount < 50 && (
              <p className="text-xs text-red-400 mt-1">Please write at least 50 words for a meaningful review.</p>
            )}
            {wordCount > 3000 && (
              <p className="text-xs text-red-400 mt-1">Please reduce to 3,000 words maximum.</p>
            )}
          </div>

          <button
            id="sop-submit"
            type="submit"
            disabled={wordCount < 50 || wordCount > 3000}
            className="w-full flex items-center justify-center gap-2 bg-[#1a2f5e] hover:bg-[#2a4a8e] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-2xl transition-all duration-200 text-base"
          >
            <Brain size={18} />
            Review My SOP with AI
          </button>

          <p className="text-center text-xs text-gray-400">
            Powered by Google Gemini AI · Results in ~10 seconds · No data is stored
          </p>
        </motion.form>
      </section>
    </div>
  );

  // ── Loading ───────────────────────────────────────────────────────────────

  if (step === "loading") return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <motion.div
        className="text-center px-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        {/* Pulsing AI Brain */}
        <div className="relative w-24 h-24 mx-auto mb-8">
          <div className="absolute inset-0 rounded-full bg-[#1a2f5e]/10 animate-ping" style={{ animationDuration: "1.5s" }} />
          <div className="absolute inset-2 rounded-full bg-[#1a2f5e]/15 animate-ping" style={{ animationDuration: "2s", animationDelay: "0.3s" }} />
          <div className="relative w-full h-full rounded-full bg-[#1a2f5e] flex items-center justify-center shadow-xl shadow-[#1a2f5e]/30">
            <Brain size={36} className="text-white" />
          </div>
        </div>

        <motion.p
          key={loadingMsg}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-lg font-semibold text-[#1a2f5e] mb-2"
          style={{ fontFamily: "var(--font-playfair)" }}
        >
          {loadingMsg}
        </motion.p>
        <p className="text-gray-400 text-sm">Google Gemini AI is reading your SOP…</p>

        {/* Progress bar */}
        <div className="mt-8 w-64 mx-auto h-1.5 bg-gray-200 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-[#c9a84c] rounded-full"
            initial={{ width: "0%" }}
            animate={{ width: "85%" }}
            transition={{ duration: 9, ease: "easeInOut" }}
          />
        </div>
      </motion.div>
    </div>
  );

  // ── Error ─────────────────────────────────────────────────────────────────

  if (step === "error") return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <motion.div
        className="bg-white rounded-3xl shadow-xl border border-red-100 p-10 max-w-md w-full text-center"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-5">
          <XCircle size={32} className="text-red-400" />
        </div>
        <h2 className="text-xl font-bold text-gray-800 mb-3" style={{ fontFamily: "var(--font-playfair)" }}>
          Review Failed
        </h2>
        <p className="text-gray-500 text-sm leading-relaxed mb-6">{errorMsg}</p>
        <div className="flex flex-col sm:flex-row gap-3">
          <button onClick={reset} className="flex-1 flex items-center justify-center gap-2 border border-gray-200 text-gray-700 font-semibold py-3 rounded-2xl hover:bg-gray-50 transition-colors text-sm">
            <RotateCcw size={15} /> Try Again
          </button>
          <Link href="/contact" className="flex-1 flex items-center justify-center gap-2 bg-[#1a2f5e] text-white font-semibold py-3 rounded-2xl hover:bg-[#2a4a8e] transition-colors text-sm">
            Talk to Counselor
          </Link>
        </div>
      </motion.div>
    </div>
  );

  // ── Result ────────────────────────────────────────────────────────────────

  if (!result) return null;

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Result hero */}
      <section className="bg-[#1a2f5e] pt-28 pb-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
            <span className="inline-flex items-center gap-2 bg-[#c9a84c]/20 text-[#c9a84c] text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full mb-6">
              <CheckCircle size={13} /> Review Complete
            </span>
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4" style={{ fontFamily: "var(--font-playfair)" }}>
              Your SOP Score
            </h1>

            {/* Score ring */}
            <div className="flex justify-center mb-5">
              <ScoreRing score={result.overall_score} />
            </div>

            <motion.p
              className="text-white/80 text-lg max-w-xl mx-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              {result.verdict}
            </motion.p>
            <p className="text-white/40 text-xs mt-3">{result.word_count} words analysed</p>
          </motion.div>
        </div>
      </section>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 -mt-6 space-y-6">

        {/* Dimension Scores */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-bold text-[#1a2f5e] mb-5 flex items-center gap-2" style={{ fontFamily: "var(--font-playfair)" }}>
            <TrendingUp size={18} className="text-[#c9a84c]" />
            Dimension Breakdown
          </h2>
          <div className="space-y-3">
            {result.dimensions.map((d, i) => <DimensionBar key={d.name} dim={d} index={i} />)}
          </div>
        </motion.div>

        {/* Strengths */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-bold text-[#1a2f5e] mb-4 flex items-center gap-2" style={{ fontFamily: "var(--font-playfair)" }}>
            <CheckCircle size={18} className="text-green-500" />
            What Works Well
          </h2>
          <ul className="space-y-3">
            {result.strengths.map((s, i) => (
              <motion.li key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.08 * i }}
                className="flex items-start gap-3 text-sm text-gray-700">
                <span className="w-5 h-5 rounded-full bg-green-100 text-green-600 flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">{i + 1}</span>
                {s}
              </motion.li>
            ))}
          </ul>
        </motion.div>

        {/* Improvements */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-bold text-[#1a2f5e] mb-4 flex items-center gap-2" style={{ fontFamily: "var(--font-playfair)" }}>
            <AlertTriangle size={18} className="text-amber-400" />
            Priority Improvements
          </h2>
          <div className="space-y-3">
            {result.improvements.map((item, i) => <ImprovementCard key={i} item={item} index={i} />)}
          </div>
        </motion.div>

        {/* Revised Intro (conditional) */}
        {result.revised_intro && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="bg-gradient-to-br from-[#1a2f5e] to-[#2a4a8e] rounded-3xl p-6">
            <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2" style={{ fontFamily: "var(--font-playfair)" }}>
              <Sparkles size={18} className="text-[#c9a84c]" />
              AI-Rewritten Opening
            </h2>
            <p className="text-sm text-gray-400 mb-4">Your opening paragraph scored below 65 — here&apos;s a stronger version:</p>
            <div className="bg-white/10 rounded-2xl p-4">
              <p className="text-white/90 text-sm leading-relaxed italic">&ldquo;{result.revised_intro}&rdquo;</p>
            </div>
          </motion.div>
        )}

        {/* CTA */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="bg-[#c9a84c]/10 border border-[#c9a84c]/30 rounded-3xl p-6 text-center">
          <FileText size={28} className="text-[#c9a84c] mx-auto mb-3" />
          <h2 className="text-lg font-bold text-[#1a2f5e] mb-2" style={{ fontFamily: "var(--font-playfair)" }}>
            Need a Human Expert Review?
          </h2>
          <p className="text-gray-500 text-sm mb-5 max-w-md mx-auto">
            Our counselors have reviewed 10,000+ SOPs. Book a free session for personalised guidance tailored to your target university.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button onClick={reset} className="flex items-center justify-center gap-2 border border-gray-200 text-gray-700 font-semibold px-6 py-3 rounded-2xl hover:bg-gray-50 transition-colors text-sm">
              <RotateCcw size={14} /> Review Another SOP
            </button>
            <Link href="/contact" className="flex items-center justify-center gap-2 bg-[#1a2f5e] text-white font-semibold px-6 py-3 rounded-2xl hover:bg-[#2a4a8e] transition-colors text-sm">
              Book Free Counseling <ArrowRight size={14} />
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
