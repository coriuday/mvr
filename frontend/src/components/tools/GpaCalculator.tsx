"use client";

import { useState, useCallback } from "react";
import { Plus, Trash2, RotateCcw } from "lucide-react";

const GRADES: { label: string; points: number }[] = [
  { label: "A+ / O (Outstanding)", points: 4.0 },
  { label: "A  (Excellent)", points: 4.0 },
  { label: "A− / A+ (Very Good)", points: 3.7 },
  { label: "B+ (Good)", points: 3.3 },
  { label: "B  (Above Average)", points: 3.0 },
  { label: "B− (Average)", points: 2.7 },
  { label: "C+ (Below Average)", points: 2.3 },
  { label: "C  (Satisfactory)", points: 2.0 },
  { label: "D  (Passing)", points: 1.0 },
  { label: "F  (Fail)", points: 0.0 },
];

const LETTER_GRADE = (gpa: number) => {
  if (gpa >= 3.7) return "A";
  if (gpa >= 3.3) return "B+";
  if (gpa >= 3.0) return "B";
  if (gpa >= 2.7) return "B−";
  if (gpa >= 2.3) return "C+";
  if (gpa >= 2.0) return "C";
  if (gpa >= 1.0) return "D";
  return "F";
};

interface Subject { id: number; name: string; credits: number; gradeIdx: number }

let nextId = 1;

export default function GpaCalculator() {
  const [subjects, setSubjects] = useState<Subject[]>([
    { id: nextId++, name: "Subject 1", credits: 3, gradeIdx: 0 },
    { id: nextId++, name: "Subject 2", credits: 3, gradeIdx: 2 },
  ]);

  const addSubject = () =>
    setSubjects((prev) => [
      ...prev,
      { id: nextId++, name: `Subject ${prev.length + 1}`, credits: 3, gradeIdx: 0 },
    ]);

  const removeSubject = (id: number) =>
    setSubjects((prev) => prev.filter((s) => s.id !== id));

  const update = useCallback(
    (id: number, field: keyof Subject, value: string | number) =>
      setSubjects((prev) =>
        prev.map((s) => (s.id === id ? { ...s, [field]: value } : s))
      ),
    []
  );

  const reset = () => {
    nextId = 1;
    setSubjects([
      { id: nextId++, name: "Subject 1", credits: 3, gradeIdx: 0 },
      { id: nextId++, name: "Subject 2", credits: 3, gradeIdx: 2 },
    ]);
  };

  // ── Calculation ──
  const totalCredits = subjects.reduce((sum, s) => sum + s.credits, 0);
  const weightedPoints = subjects.reduce(
    (sum, s) => sum + s.credits * GRADES[s.gradeIdx].points,
    0
  );
  const gpa = totalCredits > 0 ? weightedPoints / totalCredits : 0;
  const percentage = gpa * 25;

  const gpaColor =
    gpa >= 3.5 ? "text-emerald-600" : gpa >= 3.0 ? "text-blue-600" : gpa >= 2.0 ? "text-amber-600" : "text-red-600";

  return (
    <div className="max-w-4xl mx-auto">
      {/* Result banner */}
      <div className="grid sm:grid-cols-3 gap-4 mb-8">
        {[
          { label: "Your GPA", value: gpa.toFixed(2), sub: "out of 4.0", color: gpaColor },
          { label: "Equivalent %", value: `${percentage.toFixed(1)}%`, sub: "approximate", color: "text-[#1a2f5e]" },
          { label: "Letter Grade", value: LETTER_GRADE(gpa), sub: `${totalCredits} total credits`, color: "text-[#c9a84c]" },
        ].map((r) => (
          <div key={r.label} className="bg-white rounded-2xl border border-gray-100 p-6 text-center shadow-sm">
            <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-1">{r.label}</p>
            <p className={`text-4xl font-bold ${r.color}`}>{r.value}</p>
            <p className="text-gray-400 text-xs mt-1">{r.sub}</p>
          </div>
        ))}
      </div>

      {/* Subject table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-6">
        <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between">
          <h3 className="font-bold text-[#1a2f5e]">Subjects</h3>
          <button
            onClick={reset}
            className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-[#c9a84c] transition-colors"
          >
            <RotateCcw size={12} /> Reset
          </button>
        </div>

        {/* Header row */}
        <div className="grid grid-cols-12 gap-3 px-6 py-3 bg-gray-50 text-xs font-semibold text-gray-400 uppercase tracking-wider">
          <div className="col-span-5">Subject Name</div>
          <div className="col-span-3">Credits</div>
          <div className="col-span-3">Grade</div>
          <div className="col-span-1" />
        </div>

        {/* Rows */}
        {subjects.map((s) => (
          <div key={s.id} className="grid grid-cols-12 gap-3 px-6 py-3 items-center border-t border-gray-50">
            <div className="col-span-5">
              <input
                type="text"
                value={s.name}
                onChange={(e) => update(s.id, "name", e.target.value)}
                className="w-full text-sm text-[#1a2f5e] bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-[#c9a84c] transition-colors"
              />
            </div>
            <div className="col-span-3">
              <input
                type="number"
                min={1}
                max={6}
                value={s.credits}
                onChange={(e) => update(s.id, "credits", Math.max(1, Math.min(6, Number(e.target.value))))}
                className="w-full text-sm text-[#1a2f5e] bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-[#c9a84c] transition-colors"
              />
            </div>
            <div className="col-span-3">
              <select
                value={s.gradeIdx}
                onChange={(e) => update(s.id, "gradeIdx", Number(e.target.value))}
                className="w-full text-sm text-[#1a2f5e] bg-gray-50 border border-gray-200 rounded-lg px-2 py-2 focus:outline-none focus:border-[#c9a84c] transition-colors"
              >
                {GRADES.map((g, i) => (
                  <option key={i} value={i}>
                    {g.label} ({g.points.toFixed(1)})
                  </option>
                ))}
              </select>
            </div>
            <div className="col-span-1 flex justify-center">
              <button
                onClick={() => removeSubject(s.id)}
                disabled={subjects.length <= 1}
                className="text-gray-300 hover:text-red-400 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <Trash2 size={15} />
              </button>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={addSubject}
        className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-[#c9a84c]/40 rounded-xl text-sm text-[#c9a84c] font-semibold hover:border-[#c9a84c] hover:bg-[#fef9f0] transition-all"
      >
        <Plus size={16} /> Add Subject
      </button>

      {/* GPA scale reference */}
      <div className="mt-8 bg-gray-50 rounded-2xl p-6 border border-gray-100">
        <h4 className="font-bold text-[#1a2f5e] text-sm mb-4">GPA Scale Reference</h4>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {[
            { range: "3.7–4.0", label: "A / A+", color: "bg-emerald-50 text-emerald-700 border-emerald-100" },
            { range: "3.3–3.6", label: "B+", color: "bg-blue-50 text-blue-700 border-blue-100" },
            { range: "3.0–3.2", label: "B", color: "bg-indigo-50 text-indigo-700 border-indigo-100" },
            { range: "2.0–2.9", label: "C", color: "bg-amber-50 text-amber-700 border-amber-100" },
            { range: "Below 2.0", label: "D / F", color: "bg-red-50 text-red-700 border-red-100" },
          ].map((item) => (
            <div key={item.range} className={`text-center p-3 rounded-xl border ${item.color}`}>
              <p className="font-bold text-sm">{item.label}</p>
              <p className="text-xs opacity-70">{item.range}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
