"use client";

import { useState } from "react";
import { ArrowLeftRight } from "lucide-react";

type Tab = "cgpa-to-pct" | "pct-to-cgpa" | "gpa-scale";

const INDIAN_SCALES = [
  { label: "10-point scale (standard)", multiplier: 9.5 },
  { label: "10-point scale (×9)", multiplier: 9.0 },
  { label: "10-point scale (×8.5)", multiplier: 8.5 },
  { label: "10-point scale (custom)", multiplier: 0 }, // user enters
];

function clamp(v: number, min: number, max: number) {
  return Math.min(max, Math.max(min, v));
}

function pctToUsGpa(pct: number): number {
  if (pct >= 93) return 4.0;
  if (pct >= 90) return 3.7;
  if (pct >= 87) return 3.3;
  if (pct >= 83) return 3.0;
  if (pct >= 80) return 2.7;
  if (pct >= 77) return 2.3;
  if (pct >= 73) return 2.0;
  if (pct >= 70) return 1.7;
  if (pct >= 67) return 1.3;
  if (pct >= 65) return 1.0;
  return 0.0;
}

function pctToUkClass(pct: number): string {
  if (pct >= 70) return "First Class Honours (1st)";
  if (pct >= 60) return "Upper Second Class (2:1)";
  if (pct >= 50) return "Lower Second Class (2:2)";
  if (pct >= 40) return "Third Class Honours (3rd)";
  return "Fail";
}

function ukColor(cls: string) {
  if (cls.includes("First")) return "text-emerald-600";
  if (cls.includes("Upper")) return "text-blue-600";
  if (cls.includes("Lower")) return "text-amber-600";
  if (cls.includes("Third")) return "text-orange-600";
  return "text-red-600";
}

export default function CgpaConverter() {
  const [tab, setTab] = useState<Tab>("cgpa-to-pct");
  const [cgpa, setCgpa] = useState("8.5");
  const [scaleIdx, setScaleIdx] = useState(0);
  const [customMult, setCustomMult] = useState("9.5");
  const [pct, setPct] = useState("85");

  const multiplier =
    INDIAN_SCALES[scaleIdx].multiplier === 0
      ? parseFloat(customMult) || 9.5
      : INDIAN_SCALES[scaleIdx].multiplier;

  // CGPA → %
  const cgpaNum = clamp(parseFloat(cgpa) || 0, 0, 10);
  const calculatedPct = clamp(cgpaNum * multiplier, 0, 100);
  const derivedUsGpa = pctToUsGpa(calculatedPct);
  const derivedUkClass = pctToUkClass(calculatedPct);

  // % → CGPA
  const pctNum = clamp(parseFloat(pct) || 0, 0, 100);
  const derivedCgpa = clamp(pctNum / multiplier, 0, 10);

  const tabs: { key: Tab; label: string }[] = [
    { key: "cgpa-to-pct", label: "CGPA → Percentage" },
    { key: "pct-to-cgpa", label: "Percentage → CGPA" },
    { key: "gpa-scale", label: "Grading Scale Guide" },
  ];

  return (
    <div className="max-w-3xl mx-auto">
      {/* Tabs */}
      <div className="flex bg-gray-100 rounded-xl p-1 mb-8">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex-1 py-2.5 px-3 rounded-lg text-sm font-semibold transition-all duration-200 ${
              tab === t.key
                ? "bg-white text-[#1a2f5e] shadow-sm"
                : "text-gray-500 hover:text-[#1a2f5e]"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "cgpa-to-pct" && (
        <div className="space-y-6">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-2">
                Your CGPA (out of 10)
              </label>
              <input
                type="number"
                min={0}
                max={10}
                step={0.01}
                value={cgpa}
                onChange={(e) => setCgpa(e.target.value)}
                className="w-full text-2xl font-bold text-[#1a2f5e] bg-gray-50 border border-gray-200 rounded-xl px-4 py-4 focus:outline-none focus:border-[#c9a84c] transition-colors"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-2">
                University Scale
              </label>
              <select
                value={scaleIdx}
                onChange={(e) => setScaleIdx(Number(e.target.value))}
                className="w-full text-sm text-[#1a2f5e] bg-gray-50 border border-gray-200 rounded-xl px-4 py-4 focus:outline-none focus:border-[#c9a84c] transition-colors"
              >
                {INDIAN_SCALES.map((s, i) => (
                  <option key={i} value={i}>{s.label}</option>
                ))}
              </select>
              {INDIAN_SCALES[scaleIdx].multiplier === 0 && (
                <input
                  type="number"
                  min={7}
                  max={12}
                  step={0.5}
                  value={customMult}
                  onChange={(e) => setCustomMult(e.target.value)}
                  placeholder="Enter multiplier e.g. 9.2"
                  className="mt-2 w-full text-sm text-[#1a2f5e] bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-[#c9a84c] transition-colors"
                />
              )}
            </div>
          </div>

          {/* Results */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-[#1a2f5e] rounded-2xl p-6 text-center text-white">
              <p className="text-white/50 text-xs mb-1">Percentage</p>
              <p className="text-4xl font-bold text-[#c9a84c]">{calculatedPct.toFixed(1)}%</p>
              <p className="text-white/40 text-xs mt-1">Indian equivalent</p>
            </div>
            <div className="bg-white rounded-2xl p-6 text-center border border-gray-100">
              <p className="text-gray-400 text-xs mb-1">US GPA (4.0)</p>
              <p className="text-4xl font-bold text-blue-600">{derivedUsGpa.toFixed(1)}</p>
              <p className="text-gray-400 text-xs mt-1">approximate</p>
            </div>
            <div className="bg-white rounded-2xl p-6 text-center border border-gray-100">
              <p className="text-gray-400 text-xs mb-1">UK Grade</p>
              <p className={`text-lg font-bold leading-tight ${ukColor(derivedUkClass)}`}>
                {derivedUkClass.split("(")[0]}
              </p>
              <p className="text-gray-400 text-xs mt-1">{derivedUkClass.match(/\(([^)]+)\)/)?.[1] || ""}</p>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 text-sm text-amber-800">
            <strong>Formula used:</strong> Percentage = CGPA × {multiplier} (selected scale).
            The multiplier varies by university — check your official transcript for the correct value.
          </div>
        </div>
      )}

      {tab === "pct-to-cgpa" && (
        <div className="space-y-6">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-2">
                Your Percentage (%)
              </label>
              <input
                type="number"
                min={0}
                max={100}
                step={0.1}
                value={pct}
                onChange={(e) => setPct(e.target.value)}
                className="w-full text-2xl font-bold text-[#1a2f5e] bg-gray-50 border border-gray-200 rounded-xl px-4 py-4 focus:outline-none focus:border-[#c9a84c] transition-colors"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-2">
                Target Scale
              </label>
              <select
                value={scaleIdx}
                onChange={(e) => setScaleIdx(Number(e.target.value))}
                className="w-full text-sm text-[#1a2f5e] bg-gray-50 border border-gray-200 rounded-xl px-4 py-4 focus:outline-none focus:border-[#c9a84c] transition-colors"
              >
                {INDIAN_SCALES.map((s, i) => (
                  <option key={i} value={i}>{s.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="bg-[#1a2f5e] rounded-2xl p-6 text-center text-white">
              <p className="text-white/50 text-xs mb-1">CGPA (10-pt)</p>
              <p className="text-4xl font-bold text-[#c9a84c]">{derivedCgpa.toFixed(2)}</p>
              <p className="text-white/40 text-xs mt-1">out of 10</p>
            </div>
            <div className="bg-white rounded-2xl p-6 text-center border border-gray-100">
              <p className="text-gray-400 text-xs mb-1">US GPA</p>
              <p className="text-4xl font-bold text-blue-600">{pctToUsGpa(pctNum).toFixed(1)}</p>
              <p className="text-gray-400 text-xs mt-1">out of 4.0</p>
            </div>
            <div className="bg-white rounded-2xl p-6 text-center border border-gray-100">
              <p className="text-gray-400 text-xs mb-1">UK Class</p>
              <p className={`text-base font-bold leading-tight ${ukColor(pctToUkClass(pctNum))}`}>
                {pctToUkClass(pctNum).split("(")[0]}
              </p>
            </div>
          </div>
        </div>
      )}

      {tab === "gpa-scale" && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="grid grid-cols-4 bg-gray-50 px-6 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100">
              <div>Percentage</div><div>CGPA (÷9.5)</div><div>US GPA</div><div>UK Class</div>
            </div>
            {[
              [90,100,"9.5–10","3.7–4.0","First"],
              [80,89,"8.4–9.4","3.0–3.6","First / 2:1"],
              [70,79,"7.4–8.3","2.3–2.9","2:1"],
              [60,69,"6.3–7.3","1.7–2.2","2:2"],
              [50,59,"5.3–6.2","1.0–1.6","Third"],
              [40,49,"4.2–5.2","0.0–0.9","Pass"],
            ].map(([lo, hi, cgpaR, usGpaR, uk]) => (
              <div key={`${lo}`} className="grid grid-cols-4 px-6 py-4 border-b border-gray-50 last:border-0 hover:bg-gray-50 text-sm">
                <div className="font-semibold text-[#1a2f5e]">{lo}–{hi}%</div>
                <div className="text-gray-600">{cgpaR}</div>
                <div className="text-blue-600 font-semibold">{usGpaR}</div>
                <div className="text-gray-700">{uk}</div>
              </div>
            ))}
          </div>
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-800">
            <ArrowLeftRight size={14} className="inline mr-1" />
            These are <strong>approximate equivalencies</strong>. Each university and country may use slightly different conversion formulas. Always check with your target institution.
          </div>
        </div>
      )}
    </div>
  );
}
