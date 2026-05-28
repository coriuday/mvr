"use client";

import { useState } from "react";
import { X, ChevronDown } from "lucide-react";

interface University {
  id: string;
  name: string;
  country: string;
  flag: string;
  ranking: string;
  fees: string;
  intake: string;
  duration: string;
  scholarship: string;
  ielts: string;
  programs: string[];
}

// Built from existing country JSON data
const UNIVERSITIES: University[] = [
  { id: "mit", name: "MIT", country: "USA", flag: "🇺🇸", ranking: "#1 QS", fees: "$55,000–60,000/yr", intake: "Sept", duration: "4 yrs (UG) / 1–2 yrs (PG)", scholarship: "TA/RA, Need-based", ielts: "6.5+", programs: ["Engineering", "CS", "Sciences"] },
  { id: "stanford", name: "Stanford University", country: "USA", flag: "🇺🇸", ranking: "#5 QS", fees: "$55,000–60,000/yr", intake: "Sept", duration: "4 yrs (UG) / 1–2 yrs (PG)", scholarship: "Need-based, RA", ielts: "6.5+", programs: ["Business", "Engineering", "CS"] },
  { id: "harvard", name: "Harvard University", country: "USA", flag: "🇺🇸", ranking: "#4 QS", fees: "$52,000–60,000/yr", intake: "Sept", duration: "4 yrs (UG) / 2 yrs (PG)", scholarship: "Need-based", ielts: "6.5+", programs: ["Law", "Medicine", "Business"] },
  { id: "cmu", name: "Carnegie Mellon Univ.", country: "USA", flag: "🇺🇸", ranking: "#52 QS", fees: "$55,000–60,000/yr", intake: "Sept / Jan", duration: "4 yrs (UG) / 1.5 yrs (PG)", scholarship: "Merit, RA", ielts: "6.5+", programs: ["CS", "Engineering", "Business"] },
  { id: "oxford", name: "University of Oxford", country: "UK", flag: "🇬🇧", ranking: "#3 QS", fees: "£26,000–37,000/yr", intake: "Oct", duration: "3 yrs (UG) / 1 yr (PG)", scholarship: "Clarendon, Chevening", ielts: "7.0+", programs: ["Law", "Medicine", "Sciences"] },
  { id: "cambridge", name: "University of Cambridge", country: "UK", flag: "🇬🇧", ranking: "#2 QS", fees: "£22,000–40,000/yr", intake: "Oct", duration: "3 yrs (UG) / 1 yr (PG)", scholarship: "Gates, Commonwealth", ielts: "7.0+", programs: ["Engineering", "Sciences", "Law"] },
  { id: "imperial", name: "Imperial College London", country: "UK", flag: "🇬🇧", ranking: "#6 QS", fees: "£30,000–38,000/yr", intake: "Oct", duration: "4 yrs (UG) / 1 yr (PG)", scholarship: "President's, GREAT", ielts: "6.5+", programs: ["Engineering", "Medicine", "Sciences"] },
  { id: "ucl", name: "University College London", country: "UK", flag: "🇬🇧", ranking: "#9 QS", fees: "£24,000–35,000/yr", intake: "Sept/Oct", duration: "3 yrs (UG) / 1 yr (PG)", scholarship: "Merit, GREAT", ielts: "6.5+", programs: ["Medicine", "Engineering", "Arts"] },
  { id: "manchester", name: "Univ. of Manchester", country: "UK", flag: "🇬🇧", ranking: "#34 QS", fees: "£21,000–28,000/yr", intake: "Sept", duration: "3 yrs (UG) / 1 yr (PG)", scholarship: "Merit, GREAT", ielts: "6.5+", programs: ["Business", "Engineering", "Sciences"] },
  { id: "toronto", name: "University of Toronto", country: "Canada", flag: "🇨🇦", ranking: "#21 QS", fees: "CA$40,000–55,000/yr", intake: "Sept / Jan", duration: "4 yrs (UG) / 2 yrs (PG)", scholarship: "Lester B. Pearson, Merit", ielts: "6.5+", programs: ["CS", "Engineering", "Business"] },
  { id: "ubc", name: "Univ. of British Columbia", country: "Canada", flag: "🇨🇦", ranking: "#38 QS", fees: "CA$38,000–50,000/yr", intake: "Sept / Jan", duration: "4 yrs (UG) / 2 yrs (PG)", scholarship: "International Leader, Merit", ielts: "6.5+", programs: ["Engineering", "Sciences", "Business"] },
  { id: "mcgill", name: "McGill University", country: "Canada", flag: "🇨🇦", ranking: "#32 QS", fees: "CA$22,000–38,000/yr", intake: "Sept / Jan", duration: "3–4 yrs (UG) / 1.5–2 yrs (PG)", scholarship: "Entrance, Research", ielts: "6.5+", programs: ["Medicine", "Law", "Engineering"] },
  { id: "waterloo", name: "Univ. of Waterloo", country: "Canada", flag: "🇨🇦", ranking: "#154 QS", fees: "CA$38,000–45,000/yr", intake: "Sept / Jan", duration: "4 yrs (UG) / 1.5 yrs (PG)", scholarship: "International Merit", ielts: "6.5+", programs: ["CS", "Engineering", "Math"] },
  { id: "melbourne", name: "Univ. of Melbourne", country: "Australia", flag: "🇦🇺", ranking: "#33 QS", fees: "A$38,000–50,000/yr", intake: "Feb / Jul", duration: "3 yrs (UG) / 1.5–2 yrs (PG)", scholarship: "Melbourne, Arts", ielts: "6.5+", programs: ["Business", "Sciences", "Arts"] },
  { id: "sydney", name: "University of Sydney", country: "Australia", flag: "🇦🇺", ranking: "#19 QS", fees: "A$40,000–55,000/yr", intake: "Feb / Jul", duration: "3 yrs (UG) / 1.5–2 yrs (PG)", scholarship: "International, Merit", ielts: "6.5+", programs: ["Law", "Medicine", "Engineering"] },
  { id: "monash", name: "Monash University", country: "Australia", flag: "🇦🇺", ranking: "#57 QS", fees: "A$34,000–46,000/yr", intake: "Feb / Jul", duration: "3 yrs (UG) / 1.5–2 yrs (PG)", scholarship: "International Merit", ielts: "6.0+", programs: ["Business", "Pharmacy", "Engineering"] },
  { id: "tum", name: "TU Munich", country: "Germany", flag: "🇩🇪", ranking: "#37 QS", fees: "€0–3,500/yr", intake: "Oct / Apr", duration: "3 yrs (UG) / 2 yrs (PG)", scholarship: "DAAD, Research", ielts: "6.5+", programs: ["Engineering", "Sciences", "CS"] },
  { id: "rwth", name: "RWTH Aachen", country: "Germany", flag: "🇩🇪", ranking: "#106 QS", fees: "€0–2,000/yr", intake: "Oct / Apr", duration: "3 yrs (UG) / 2 yrs (PG)", scholarship: "DAAD, Erasmus", ielts: "6.0+", programs: ["Engineering", "Sciences", "Architecture"] },
  { id: "aalto", name: "Aalto University", country: "Finland", flag: "🇫🇮", ranking: "#115 QS", fees: "€12,000–15,000/yr", intake: "Sept", duration: "3 yrs (UG) / 2 yrs (PG)", scholarship: "Aalto Scholarship (up to 100% waiver)", ielts: "6.5+", programs: ["Business", "Engineering", "Design"] },
  { id: "trinity", name: "Trinity College Dublin", country: "Ireland", flag: "🇮🇪", ranking: "#134 QS", fees: "€14,000–22,000/yr", intake: "Sept", duration: "4 yrs (UG) / 1 yr (PG)", scholarship: "Trinity Scholarships", ielts: "6.5+", programs: ["Business", "Medicine", "Engineering"] },
];

const COMPARE_FIELDS = [
  { key: "ranking", label: "QS Ranking" },
  { key: "fees", label: "Annual Fees" },
  { key: "intake", label: "Intake" },
  { key: "duration", label: "Duration" },
  { key: "scholarship", label: "Scholarships" },
  { key: "ielts", label: "IELTS Req." },
  { key: "programs", label: "Top Programs" },
];

const COUNTRIES_FILTER = ["All", "USA", "UK", "Canada", "Australia", "Germany", "Finland", "Ireland"];

export default function UniversityCompare() {
  const [selected, setSelected] = useState<string[]>([]);
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
          <div className="flex flex-wrap gap-2">
            {COUNTRIES_FILTER.map((c) => (
              <button
                key={c}
                onClick={() => setFilter(c)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
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
