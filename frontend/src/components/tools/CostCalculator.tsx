"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { CountryFlag } from "@/components/ui/CountryFlag";

type Level = "ug" | "pg";

interface CountryData {
  flag: string;
  currency: string;
  symbol: string;
  inrRate: number;
  ug: { tuitionLo: number; tuitionHi: number; livingLo: number; livingHi: number; visa: number };
  pg: { tuitionLo: number; tuitionHi: number; livingLo: number; livingHi: number; visa: number };
  notes: string;
}

const COUNTRIES: Record<string, CountryData> = {
  UK: {
    flag: "🇬🇧",
    currency: "GBP",
    symbol: "£",
    inrRate: 107,
    ug: { tuitionLo: 11000, tuitionHi: 28000, livingLo: 12000, livingHi: 18000, visa: 490 },
    pg: { tuitionLo: 15000, tuitionHi: 35000, livingLo: 12000, livingHi: 18000, visa: 490 },
    notes: "NHS Surcharge £776/yr (PG) or £776/yr (UG) added separately",
  },
  USA: {
    flag: "🇺🇸",
    currency: "USD",
    symbol: "$",
    inrRate: 83,
    ug: { tuitionLo: 20000, tuitionHi: 55000, livingLo: 12000, livingHi: 20000, visa: 510 },
    pg: { tuitionLo: 25000, tuitionHi: 65000, livingLo: 12000, livingHi: 22000, visa: 510 },
    notes: "SEVIS fee $350 + visa fee $185 (F-1). Living costs vary widely by city.",
  },
  Canada: {
    flag: "🇨🇦",
    currency: "CAD",
    symbol: "CA$",
    inrRate: 61,
    ug: { tuitionLo: 18000, tuitionHi: 42000, livingLo: 14000, livingHi: 20000, visa: 150 },
    pg: { tuitionLo: 16000, tuitionHi: 40000, livingLo: 14000, livingHi: 20000, visa: 150 },
    notes: "Proof of funds: CA$10,000/yr required for visa. Provincial health insurance available.",
  },
  Australia: {
    flag: "🇦🇺",
    currency: "AUD",
    symbol: "A$",
    inrRate: 54,
    ug: { tuitionLo: 22000, tuitionHi: 50000, livingLo: 20000, livingHi: 28000, visa: 650 },
    pg: { tuitionLo: 26000, tuitionHi: 55000, livingLo: 20000, livingHi: 28000, visa: 650 },
    notes: "OSHC (Overseas Student Health Cover) required — approx. A$600/yr.",
  },
  Germany: {
    flag: "🇩🇪",
    currency: "EUR",
    symbol: "€",
    inrRate: 89,
    ug: { tuitionLo: 0, tuitionHi: 1500, livingLo: 8000, livingHi: 12000, visa: 75 },
    pg: { tuitionLo: 0, tuitionHi: 3000, livingLo: 8000, livingHi: 12000, visa: 75 },
    notes: "Public universities charge only a semester administrative fee (~€300). Living costs vary by city.",
  },
  Finland: {
    flag: "🇫🇮",
    currency: "EUR",
    symbol: "€",
    inrRate: 89,
    ug: { tuitionLo: 4000, tuitionHi: 18000, livingLo: 9000, livingHi: 13000, visa: 80 },
    pg: { tuitionLo: 5000, tuitionHi: 20000, livingLo: 9000, livingHi: 13000, visa: 80 },
    notes: "Many Finnish universities offer scholarships covering 50–100% of tuition for eligible students.",
  },
};

const DURATION: Record<Level, number> = { ug: 3, pg: 1.5 };

function fmt(n: number, sym: string) {
  return `${sym}${n.toLocaleString()}`;
}

function toInr(n: number, rate: number) {
  const lakh = (n * rate) / 100000;
  return `₹${lakh.toFixed(1)}L`;
}

export default function CostCalculator() {
  const [country, setCountry] = useState<string>("UK");
  const [level, setLevel] = useState<Level>("pg");
  const [showTotal, setShowTotal] = useState(false);

  const data = COUNTRIES[country];
  const d = data[level];
  const years = DURATION[level];

  const midTuition = (d.tuitionLo + d.tuitionHi) / 2;
  const midLiving = (d.livingLo + d.livingHi) / 2;
  const totalCost = midTuition * years + midLiving * years + d.visa;

  const rows = [
    {
      label: "Tuition Fees",
      lo: d.tuitionLo,
      hi: d.tuitionHi,
      mid: midTuition,
      note: `per year × ${years} yr${years > 1 ? "s" : ""}`,
      color: "text-[#1a2f5e]",
    },
    {
      label: "Living Expenses",
      lo: d.livingLo,
      hi: d.livingHi,
      mid: midLiving,
      note: `per year × ${years} yr${years > 1 ? "s" : ""}`,
      color: "text-blue-600",
    },
    {
      label: "Visa / Application Fees",
      lo: d.visa,
      hi: d.visa,
      mid: d.visa,
      note: "one-time",
      color: "text-amber-600",
    },
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Controls */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-2">Country</label>
          <div className="grid grid-cols-3 gap-2">
            {Object.entries(COUNTRIES).map(([key, val]) => (
              <button
                key={key}
                onClick={() => setCountry(key)}
                className={`flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl text-sm font-semibold border transition-all duration-200 ${
                  country === key
                    ? "border-[#c9a84c] bg-[#fef9f0] text-[#1a2f5e]"
                    : "border-gray-200 bg-white text-gray-500 hover:border-[#c9a84c]/50"
                }`}
              >
                <CountryFlag label={key} size="sm" className="mr-1" />
                {key}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-2">Program Level</label>
          <div className="flex bg-gray-100 rounded-xl p-1">
            {(["ug", "pg"] as Level[]).map((l) => (
              <button
                key={l}
                onClick={() => setLevel(l)}
                className={`flex-1 py-3 rounded-lg text-sm font-bold transition-all duration-200 ${
                  level === l ? "bg-white text-[#1a2f5e] shadow-sm" : "text-gray-500 hover:text-[#1a2f5e]"
                }`}
              >
                {l === "ug" ? "🎓 Undergraduate" : "📚 Postgraduate"}
              </button>
            ))}
          </div>
          <div className="mt-3 flex items-center gap-2">
            <button
              onClick={() => setShowTotal(!showTotal)}
              className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${
                showTotal
                  ? "bg-[#1a2f5e] text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {showTotal ? "Annual View" : "Total Course Cost"}
            </button>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
        <div className="bg-[#1a2f5e] px-6 py-4 flex items-center justify-between">
          <div>
            <p className="text-white/60 text-xs">Estimated cost in {data.currency}</p>
            <p className="text-white font-bold text-lg">
              {data.flag} {country} — {level === "ug" ? "Undergraduate" : "Postgraduate"}
            </p>
          </div>
          <p className="text-[#c9a84c] text-xs font-semibold">{showTotal ? `${years}-year total` : "per year"}</p>
        </div>

        {rows.map((r) => {
          const display = showTotal
            ? r.note.includes("×")
              ? r.mid * years
              : r.mid
            : r.mid;
          const loD = r.note.includes("×") && showTotal ? r.lo * years : r.lo;
          const hiD = r.note.includes("×") && showTotal ? r.hi * years : r.hi;

          return (
            <div key={r.label} className="flex items-center justify-between px-6 py-4 border-b border-gray-50 last:border-0">
              <div>
                <p className="font-semibold text-[#1a2f5e] text-sm">{r.label}</p>
                <p className="text-gray-400 text-xs">
                  {fmt(loD, data.symbol)} – {fmt(hiD, data.symbol)} range
                </p>
              </div>
              <div className="text-right">
                <p className={`font-bold text-lg ${r.color}`}>{fmt(display, data.symbol)}</p>
                <p className="text-gray-400 text-xs">{toInr(display, data.inrRate)}</p>
              </div>
            </div>
          );
        })}

        <div className="flex items-center justify-between px-6 py-5 bg-gray-50 border-t border-gray-100">
          <p className="font-bold text-[#1a2f5e]">Estimated Total</p>
          <div className="text-right">
            <p className="font-bold text-2xl text-[#1a2f5e]">
              {fmt(showTotal ? totalCost : (midTuition + midLiving + d.visa / years), data.symbol)}
            </p>
            <p className="text-[#c9a84c] text-sm font-semibold">{toInr(showTotal ? totalCost : (midTuition + midLiving + d.visa / years), data.inrRate)}</p>
          </div>
        </div>
      </div>

      <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 text-sm text-amber-800">
        ⚠️ <strong>Note:</strong> {data.notes}
      </div>

      <div className="bg-[#1a2f5e] rounded-2xl p-6 text-center">
        <p className="text-white font-semibold mb-1">Need help financing your studies?</p>
        <p className="text-white/60 text-sm mb-4">Our experts can help with scholarships and education loans.</p>
        <Link href="/contact">
          <button className="bg-[#c9a84c] hover:bg-[#a07a2e] text-white rounded-full px-8 py-2.5 text-sm font-bold gap-2 inline-flex items-center transition-colors">
            Talk to an Expert <ArrowRight size={14} />
          </button>
        </Link>
      </div>
    </div>
  );
}
