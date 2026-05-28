"use client";

import { useState } from "react";
import { Printer, CheckCircle2, Circle } from "lucide-react";

type Country = "UK" | "USA" | "Canada" | "Australia" | "Germany" | "France" | "Ireland" | "New Zealand";

interface ChecklistItem { id: string; category: string; item: string }

const CHECKLISTS: Record<Country, ChecklistItem[]> = {
  UK: [
    { id: "uk-1", category: "Identity", item: "Valid passport (6+ months validity beyond course end)" },
    { id: "uk-2", category: "Identity", item: "Recent passport-size photographs (biometric standard)" },
    { id: "uk-3", category: "University", item: "Unconditional offer letter from UK university" },
    { id: "uk-4", category: "University", item: "Confirmation of Acceptance for Studies (CAS) number" },
    { id: "uk-5", category: "University", item: "UCAS ID or student reference number" },
    { id: "uk-6", category: "Academic", item: "All academic transcripts and degree certificates" },
    { id: "uk-7", category: "Academic", item: "English proficiency test results (IELTS 6.0+ / TOEFL 80+)" },
    { id: "uk-8", category: "Financial", item: "Bank statements (last 3–6 months)" },
    { id: "uk-9", category: "Financial", item: "Proof of £1,334/month (London) or £1,023/month (outside London) × 9 months" },
    { id: "uk-10", category: "Financial", item: "First-year tuition fee proof of funds" },
    { id: "uk-11", category: "Financial", item: "Scholarship or sponsorship letters (if applicable)" },
    { id: "uk-12", category: "Health", item: "TB test certificate from approved clinic (if required for your country)" },
    { id: "uk-13", category: "Visa", item: "UK Student Visa application form (online)" },
    { id: "uk-14", category: "Visa", item: "Visa application fee payment (£490 from outside UK)" },
    { id: "uk-15", category: "Visa", item: "Immigration Health Surcharge payment (£776/yr postgraduate)" },
    { id: "uk-16", category: "Visa", item: "Biometric enrolment appointment booking" },
  ],
  USA: [
    { id: "us-1", category: "Identity", item: "Valid passport (6+ months validity beyond stay)" },
    { id: "us-2", category: "Identity", item: "Recent photograph meeting US visa photo requirements" },
    { id: "us-3", category: "University", item: "Form I-20 from SEVP-certified institution" },
    { id: "us-4", category: "University", item: "University acceptance / offer letter" },
    { id: "us-5", category: "Academic", item: "All academic transcripts (official, sealed)" },
    { id: "us-6", category: "Academic", item: "English proficiency scores (TOEFL / IELTS)" },
    { id: "us-7", category: "Academic", item: "GRE / GMAT scores (if required by program)" },
    { id: "us-8", category: "Financial", item: "Bank statements (last 3 months)" },
    { id: "us-9", category: "Financial", item: "Affidavit of Financial Support (if sponsored)" },
    { id: "us-10", category: "Financial", item: "Scholarship award letter (if applicable)" },
    { id: "us-11", category: "Visa", item: "SEVIS fee payment receipt (I-901, $350 for F-1)" },
    { id: "us-12", category: "Visa", item: "DS-160 Non-immigrant Visa Application (online)" },
    { id: "us-13", category: "Visa", item: "Visa application fee payment ($185 MRV fee)" },
    { id: "us-14", category: "Visa", item: "US Embassy / Consulate interview appointment" },
    { id: "us-15", category: "Visa", item: "Ties to home country evidence (employment, property, family)" },
  ],
  Canada: [
    { id: "ca-1", category: "Identity", item: "Valid passport" },
    { id: "ca-2", category: "Identity", item: "Passport-size photographs" },
    { id: "ca-3", category: "University", item: "Letter of acceptance from designated learning institution (DLI)" },
    { id: "ca-4", category: "Academic", item: "All academic transcripts and certificates" },
    { id: "ca-5", category: "Academic", item: "English/French proficiency scores (IELTS 6.0+ / TOEFL 80+)" },
    { id: "ca-6", category: "Financial", item: "Proof of funds: CA$10,000/yr for living + tuition" },
    { id: "ca-7", category: "Financial", item: "Bank statements (last 4 months)" },
    { id: "ca-8", category: "Financial", item: "Education loan sanction letter (if applicable)" },
    { id: "ca-9", category: "Visa", item: "Study permit application (IMM 1294)" },
    { id: "ca-10", category: "Visa", item: "Visa application fee (CA$150)" },
    { id: "ca-11", category: "Visa", item: "Biometric collection (CA$85 if required)" },
    { id: "ca-12", category: "Visa", item: "Quebec Acceptance Certificate (CAQ) if studying in Quebec" },
    { id: "ca-13", category: "Health", item: "Medical examination by IRCC-approved physician (if required)" },
    { id: "ca-14", category: "Other", item: "Intent to leave Canada letter" },
    { id: "ca-15", category: "Other", item: "Custodian declaration (for students under 18)" },
  ],
  Australia: [
    { id: "au-1", category: "Identity", item: "Valid passport" },
    { id: "au-2", category: "Identity", item: "Certified passport copies" },
    { id: "au-3", category: "University", item: "Confirmation of Enrolment (CoE) from Australian institution" },
    { id: "au-4", category: "Academic", item: "All academic transcripts and degree certificates" },
    { id: "au-5", category: "Academic", item: "English proficiency test (IELTS 6.0+ / PTE 50+)" },
    { id: "au-6", category: "Financial", item: "Proof of financial capacity (tuition + A$21,041/yr living)" },
    { id: "au-7", category: "Financial", item: "Bank statements (last 3 months)" },
    { id: "au-8", category: "Health", item: "Overseas Student Health Cover (OSHC) purchase receipt" },
    { id: "au-9", category: "Health", item: "Health examinations (if requested by DFAT)" },
    { id: "au-10", category: "Character", item: "Police clearance certificate from countries lived in 12+ months" },
    { id: "au-11", category: "Visa", item: "Student Visa application (Subclass 500) online" },
    { id: "au-12", category: "Visa", item: "Visa application fee (A$650)" },
    { id: "au-13", category: "Visa", item: "Genuine Temporary Entrant (GTE) statement" },
    { id: "au-14", category: "Other", item: "Scholarship letter (if applicable)" },
  ],
  Germany: [
    { id: "de-1", category: "Identity", item: "Valid national passport" },
    { id: "de-2", category: "Identity", item: "Biometric passport photos" },
    { id: "de-3", category: "University", item: "Unconditional admission letter from German university" },
    { id: "de-4", category: "University", item: "APS certificate (Akademische Prüfstelle) for Indian students" },
    { id: "de-5", category: "Academic", item: "All academic certificates and transcripts (officially certified)" },
    { id: "de-6", category: "Academic", item: "German language proficiency (TestDaF / DSH) OR English IELTS/TOEFL" },
    { id: "de-7", category: "Financial", item: "Blocked bank account (Sperrkonto) with €11,208" },
    { id: "de-8", category: "Financial", item: "Scholarship award letter (DAAD, etc.) — alternative to blocked account" },
    { id: "de-9", category: "Visa", item: "Visa application form (National Visa / Schengen Visa)" },
    { id: "de-10", category: "Visa", item: "Visa fee payment (€75)" },
    { id: "de-11", category: "Health", item: "Health insurance proof (public or private, valid in Germany)" },
    { id: "de-12", category: "Other", item: "Curriculum Vitae (German or English)" },
    { id: "de-13", category: "Other", item: "Statement of purpose / motivation letter" },
    { id: "de-14", category: "Other", item: "German embassy appointment booking" },
  ],
  France: [
    { id: "fr-1", category: "Identity", item: "Valid passport (3+ months beyond intended stay)" },
    { id: "fr-2", category: "Identity", item: "Biometric photographs" },
    { id: "fr-3", category: "University", item: "Campus France registration and interview completion" },
    { id: "fr-4", category: "University", item: "Acceptance letter from French institution" },
    { id: "fr-5", category: "Academic", item: "Academic transcripts and diplomas" },
    { id: "fr-6", category: "Academic", item: "French (DELF/TCF) or English proficiency proof" },
    { id: "fr-7", category: "Financial", item: "Bank statements or sponsorship letter" },
    { id: "fr-8", category: "Financial", item: "Proof of accommodation in France" },
    { id: "fr-9", category: "Visa", item: "Long-stay student visa application" },
    { id: "fr-10", category: "Visa", item: "Visa fee payment (€99)" },
    { id: "fr-11", category: "Health", item: "Travel and health insurance for duration of stay" },
    { id: "fr-12", category: "Other", item: "Curriculum Vitae" },
    { id: "fr-13", category: "Other", item: "Statement of purpose / letter of motivation" },
  ],
  Ireland: [
    { id: "ie-1", category: "Identity", item: "Valid passport" },
    { id: "ie-2", category: "Identity", item: "Passport-size photographs" },
    { id: "ie-3", category: "University", item: "Unconditional offer letter from Irish institution" },
    { id: "ie-4", category: "Academic", item: "All academic transcripts and certificates" },
    { id: "ie-5", category: "Academic", item: "English proficiency (IELTS 6.0+)" },
    { id: "ie-6", category: "Financial", item: "Bank statements showing €7,000+ for first year living" },
    { id: "ie-7", category: "Financial", item: "Tuition fee payment proof or education loan sanction" },
    { id: "ie-8", category: "Visa", item: "Visa application (Category D Student Visa)" },
    { id: "ie-9", category: "Visa", item: "Visa fee payment (€60)" },
    { id: "ie-10", category: "Visa", item: "GNIB (IRP) registration booking on arrival" },
    { id: "ie-11", category: "Health", item: "Travel insurance for the duration of stay" },
    { id: "ie-12", category: "Other", item: "Letter of intent / statement of purpose" },
    { id: "ie-13", category: "Other", item: "Accommodation proof in Ireland" },
  ],
  "New Zealand": [
    { id: "nz-1", category: "Identity", item: "Valid passport (3+ months beyond intended stay)" },
    { id: "nz-2", category: "Identity", item: "Biometric photographs" },
    { id: "nz-3", category: "University", item: "Offer of place from New Zealand institution" },
    { id: "nz-4", category: "Academic", item: "All academic transcripts and certificates" },
    { id: "nz-5", category: "Academic", item: "English proficiency (IELTS 6.0+)" },
    { id: "nz-6", category: "Financial", item: "Proof of funds: NZ$15,000/yr" },
    { id: "nz-7", category: "Financial", item: "Bank statements (last 3 months)" },
    { id: "nz-8", category: "Health", item: "Chest X-ray / medical certificate (if required)" },
    { id: "nz-9", category: "Character", item: "Police clearance certificate" },
    { id: "nz-10", category: "Visa", item: "Student visa application (online via Immigration NZ)" },
    { id: "nz-11", category: "Visa", item: "Visa fee payment (NZ$330)" },
    { id: "nz-12", category: "Other", item: "Travel insurance" },
    { id: "nz-13", category: "Other", item: "Proof of accommodation booking" },
  ],
};

const COUNTRY_LIST: Country[] = ["UK", "USA", "Canada", "Australia", "Germany", "France", "Ireland", "New Zealand"];
const FLAG: Record<Country, string> = {
  UK: "🇬🇧", USA: "🇺🇸", Canada: "🇨🇦", Australia: "🇦🇺",
  Germany: "🇩🇪", France: "🇫🇷", Ireland: "🇮🇪", "New Zealand": "🇳🇿",
};

function groupByCategory(items: ChecklistItem[]) {
  return items.reduce<Record<string, ChecklistItem[]>>((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {});
}

export default function VisaChecklist() {
  const [country, setCountry] = useState<Country>("UK");
  const [checked, setChecked] = useState<Set<string>>(new Set());

  const items = CHECKLISTS[country];
  const total = items.length;
  const done = items.filter((i) => checked.has(i.id)).length;
  const pct = Math.round((done / total) * 100);

  const toggle = (id: string) => {
    setChecked((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (done === total) {
      setChecked(new Set());
    } else {
      setChecked(new Set(items.map((i) => i.id)));
    }
  };

  const changeCountry = (c: Country) => {
    setCountry(c);
    setChecked(new Set());
  };

  const grouped = groupByCategory(items);

  const progressColor =
    pct >= 80 ? "bg-emerald-500" : pct >= 50 ? "bg-blue-500" : pct >= 20 ? "bg-amber-500" : "bg-gray-200";

  return (
    <div className="max-w-3xl mx-auto">
      {/* Country selector */}
      <div className="flex flex-wrap gap-2 mb-6">
        {COUNTRY_LIST.map((c) => (
          <button
            key={c}
            onClick={() => changeCountry(c)}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
              country === c
                ? "bg-[#1a2f5e] text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {FLAG[c]} {c}
          </button>
        ))}
      </div>

      {/* Progress bar */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="font-bold text-[#1a2f5e]">{FLAG[country]} {country} Student Visa Checklist</h3>
            <p className="text-gray-400 text-sm">{done} of {total} documents ready</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={toggleAll}
              className="text-xs text-[#c9a84c] font-semibold hover:underline"
            >
              {done === total ? "Uncheck all" : "Check all"}
            </button>
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-[#1a2f5e] transition-colors border border-gray-200 rounded-lg px-3 py-1.5"
            >
              <Printer size={12} /> Print
            </button>
          </div>
        </div>
        <div className="relative h-3 bg-gray-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${progressColor}`}
            style={{ width: `${pct}%` }}
          />
        </div>
        <p className="text-right text-xs text-gray-400 mt-1.5">{pct}% complete</p>
      </div>

      {/* Checklist grouped by category */}
      <div className="space-y-5">
        {Object.entries(grouped).map(([cat, catItems]) => (
          <div key={cat} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-6 py-3 bg-gray-50 border-b border-gray-100">
              <h4 className="font-bold text-[#1a2f5e] text-sm uppercase tracking-wider">{cat}</h4>
            </div>
            <div className="divide-y divide-gray-50">
              {catItems.map((item) => {
                const isChecked = checked.has(item.id);
                return (
                  <button
                    key={item.id}
                    onClick={() => toggle(item.id)}
                    className={`w-full flex items-center gap-4 px-6 py-4 text-left transition-colors hover:bg-gray-50 ${
                      isChecked ? "bg-emerald-50" : ""
                    }`}
                  >
                    {isChecked ? (
                      <CheckCircle2 size={18} className="text-emerald-500 shrink-0" />
                    ) : (
                      <Circle size={18} className="text-gray-300 shrink-0" />
                    )}
                    <span className={`text-sm ${isChecked ? "text-gray-400 line-through" : "text-[#1a2f5e]"}`}>
                      {item.item}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {done === total && (
        <div className="mt-6 bg-emerald-50 border border-emerald-100 rounded-2xl p-6 text-center">
          <CheckCircle2 size={32} className="text-emerald-500 mx-auto mb-2" />
          <p className="font-bold text-emerald-700">All documents ready!</p>
          <p className="text-emerald-600 text-sm">Your {country} student visa application is fully prepared.</p>
        </div>
      )}
    </div>
  );
}
