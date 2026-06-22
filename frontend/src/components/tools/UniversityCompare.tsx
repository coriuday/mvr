"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { X, ChevronDown } from "lucide-react";
import { useUniversities } from "@/hooks/useUniversities";
import { COUNTRIES_FILTER, type University } from "@/data/universities";


const COMPARE_FIELDS = [
  { key: "ranking",     label: "QS Ranking" },
  { key: "fees",        label: "Annual Fees" },
  { key: "intake",      label: "Intake" },
  { key: "duration",    label: "Duration" },
  { key: "scholarship", label: "Scholarships" },
  { key: "ielts",       label: "IELTS Req." },
  { key: "programs",    label: "Top Programs" },
];



export default function UniversityCompare() {
  const { universities: UNIVERSITIES } = useUniversities();
  const searchParams = useSearchParams();

  // Seed initial selection from URL params: ?uni1=id&uni2=id&uni3=id
  const [selected, setSelected] = useState<string[]>(() => {
    const ids = ["uni1", "uni2", "uni3"]
      .map((key) => searchParams.get(key))
      .filter((id): id is string => !!id && UNIVERSITIES.some((u) => u.id === id));
    return [...new Set(ids)].slice(0, 3);
  });
  const [filter, setFilter] = useState("All");
  const [query, setQuery] = useState("");


  const filtered = UNIVERSITIES.filter(
    (u) =>
      (filter === "All" || u.country === filter) &&
      (query === "" || u.name.toLowerCase().includes(query.toLowerCase()))
  );

  const toggle = (id: string) => {
    if (selected.includes(id)) {
      setSelected(selected.filter((s) => s !== id));
    } else if (selected.length < 3) {
      setSelected([...selected, id]);
    }
  };

  const selectedUnis = selected.map((id) => UNIVERSITIES.find((u) => u.id === id)!).filter(Boolean);

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Selection panel */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex flex-col sm:flex-row gap-4 mb-5">
          <input
            type="text"
            placeholder="Search universities..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 text-sm border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:border-[#c9a84c] transition-colors"
          />
          <div className="flex overflow-x-auto gap-2 pb-1 scrollbar-thin scrollbar-thumb-gray-200">
            {COUNTRIES_FILTER.map((c) => (
              <button
                key={c}
                onClick={() => setFilter(c)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap shrink-0 ${
                  filter === c
                    ? "bg-[#1a2f5e] text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 mb-4">
          <p className="text-sm text-gray-500">
            Selected: <span className="font-bold text-[#1a2f5e]">{selected.length}/3</span>
          </p>
          {selected.length > 0 && (
            <button
              onClick={() => setSelected([])}
              className="text-xs text-red-400 hover:text-red-600 transition-colors"
            >
              Clear all
            </button>
          )}
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-64 overflow-y-auto">
          {filtered.map((u) => {
            const isSelected = selected.includes(u.id);
            const isFull = selected.length >= 3 && !isSelected;
            return (
              <button
                key={u.id}
                onClick={() => !isFull && toggle(u.id)}
                disabled={isFull}
                className={`text-left p-3 rounded-xl border transition-all ${
                  isSelected
                    ? "border-[#c9a84c] bg-[#fef9f0]"
                    : isFull
                    ? "border-gray-100 bg-gray-50 opacity-50 cursor-not-allowed"
                    : "border-gray-200 bg-white hover:border-[#c9a84c]/50"
                }`}
              >
                <div className="flex items-start justify-between">
                  <p className="text-sm font-semibold text-[#1a2f5e] leading-tight">{u.flag} {u.name}</p>
                  {isSelected && <X size={14} className="text-[#c9a84c] shrink-0 mt-0.5" />}
                </div>
                <p className="text-xs text-gray-400 mt-0.5">{u.ranking} · {u.country}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Comparison table */}
      {selectedUnis.length > 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-x-auto">
          <table className="w-full min-w-[500px]">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider w-36">
                  Criteria
                </th>
                {selectedUnis.map((u) => (
                  <th key={u.id} className="text-left px-6 py-4">
                    <div>
                      <p className="font-bold text-[#1a2f5e] text-sm">{u.flag} {u.name}</p>
                      <p className="text-gray-400 text-xs">{u.country} · {u.ranking}</p>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {COMPARE_FIELDS.map(({ key, label }) => (
                <tr key={key} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">{label}</td>
                  {selectedUnis.map((u) => (
                    <td key={u.id} className="px-6 py-4 text-sm text-[#1a2f5e]">
                      {key === "programs"
                        ? (u[key as keyof University] as string[]).join(", ")
                        : u[key as keyof University] as string}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 p-12 text-center">
          <ChevronDown size={32} className="text-gray-300 mx-auto mb-3" />
          <p className="text-gray-400 font-semibold">Select 1–3 universities above to compare them</p>
          <p className="text-gray-300 text-sm mt-1">Compare rankings, fees, intakes, and more</p>
        </div>
      )}
    </div>
  );
}
