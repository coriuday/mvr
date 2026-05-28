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

// Built from existing country JSON data — covers all 26 MVR study destinations
const UNIVERSITIES: University[] = [
  // ── USA ──────────────────────────────────────────────────────────────────
  { id: "mit",       name: "MIT",                      country: "USA",         flag: "🇺🇸", ranking: "#1 QS",   fees: "$55,000–60,000/yr", intake: "Sept",        duration: "4 yrs (UG) / 1–2 yrs (PG)", scholarship: "TA/RA, Need-based",           ielts: "6.5+", programs: ["Engineering", "CS", "Sciences"] },
  { id: "stanford", name: "Stanford University",        country: "USA",         flag: "🇺🇸", ranking: "#5 QS",   fees: "$55,000–60,000/yr", intake: "Sept",        duration: "4 yrs (UG) / 1–2 yrs (PG)", scholarship: "Need-based, RA",              ielts: "6.5+", programs: ["Business", "Engineering", "CS"] },
  { id: "harvard",  name: "Harvard University",         country: "USA",         flag: "🇺🇸", ranking: "#4 QS",   fees: "$52,000–60,000/yr", intake: "Sept",        duration: "4 yrs (UG) / 2 yrs (PG)",   scholarship: "Need-based",                   ielts: "6.5+", programs: ["Law", "Medicine", "Business"] },
  { id: "cmu",      name: "Carnegie Mellon Univ.",      country: "USA",         flag: "🇺🇸", ranking: "#52 QS",  fees: "$55,000–60,000/yr", intake: "Sept / Jan",  duration: "4 yrs (UG) / 1.5 yrs (PG)", scholarship: "Merit, RA",                    ielts: "6.5+", programs: ["CS", "Engineering", "Business"] },
  // ── UK ───────────────────────────────────────────────────────────────────
  { id: "oxford",   name: "University of Oxford",       country: "UK",          flag: "🇬🇧", ranking: "#3 QS",   fees: "£26,000–37,000/yr", intake: "Oct",         duration: "3 yrs (UG) / 1 yr (PG)",    scholarship: "Clarendon, Chevening",         ielts: "7.0+", programs: ["Law", "Medicine", "Sciences"] },
  { id: "cambridge",name: "University of Cambridge",    country: "UK",          flag: "🇬🇧", ranking: "#2 QS",   fees: "£22,000–40,000/yr", intake: "Oct",         duration: "3 yrs (UG) / 1 yr (PG)",    scholarship: "Gates, Commonwealth",          ielts: "7.0+", programs: ["Engineering", "Sciences", "Law"] },
  { id: "imperial", name: "Imperial College London",    country: "UK",          flag: "🇬🇧", ranking: "#6 QS",   fees: "£30,000–38,000/yr", intake: "Oct",         duration: "4 yrs (UG) / 1 yr (PG)",    scholarship: "President's, GREAT",           ielts: "6.5+", programs: ["Engineering", "Medicine", "Sciences"] },
  { id: "ucl",      name: "University College London",  country: "UK",          flag: "🇬🇧", ranking: "#9 QS",   fees: "£24,000–35,000/yr", intake: "Sept/Oct",   duration: "3 yrs (UG) / 1 yr (PG)",    scholarship: "Merit, GREAT",                 ielts: "6.5+", programs: ["Medicine", "Engineering", "Arts"] },
  { id: "manchester",name: "Univ. of Manchester",       country: "UK",          flag: "🇬🇧", ranking: "#34 QS",  fees: "£21,000–28,000/yr", intake: "Sept",        duration: "3 yrs (UG) / 1 yr (PG)",    scholarship: "Merit, GREAT",                 ielts: "6.5+", programs: ["Business", "Engineering", "Sciences"] },
  // ── Canada ───────────────────────────────────────────────────────────────
  { id: "toronto",  name: "University of Toronto",      country: "Canada",      flag: "🇨🇦", ranking: "#21 QS",  fees: "CA$40,000–55,000/yr",intake: "Sept / Jan",  duration: "4 yrs (UG) / 2 yrs (PG)",   scholarship: "Lester B. Pearson, Merit",     ielts: "6.5+", programs: ["CS", "Engineering", "Business"] },
  { id: "ubc",      name: "Univ. of British Columbia",  country: "Canada",      flag: "🇨🇦", ranking: "#38 QS",  fees: "CA$38,000–50,000/yr",intake: "Sept / Jan",  duration: "4 yrs (UG) / 2 yrs (PG)",   scholarship: "International Leader, Merit",  ielts: "6.5+", programs: ["Engineering", "Sciences", "Business"] },
  { id: "mcgill",   name: "McGill University",          country: "Canada",      flag: "🇨🇦", ranking: "#32 QS",  fees: "CA$22,000–38,000/yr",intake: "Sept / Jan",  duration: "3–4 yrs (UG) / 2 yrs (PG)", scholarship: "Entrance, Research",           ielts: "6.5+", programs: ["Medicine", "Law", "Engineering"] },
  { id: "waterloo", name: "Univ. of Waterloo",          country: "Canada",      flag: "🇨🇦", ranking: "#154 QS", fees: "CA$38,000–45,000/yr",intake: "Sept / Jan",  duration: "4 yrs (UG) / 1.5 yrs (PG)", scholarship: "International Merit",          ielts: "6.5+", programs: ["CS", "Engineering", "Math"] },
  // ── Australia ────────────────────────────────────────────────────────────
  { id: "melbourne",name: "Univ. of Melbourne",         country: "Australia",   flag: "🇦🇺", ranking: "#33 QS",  fees: "A$38,000–50,000/yr", intake: "Feb / Jul",   duration: "3 yrs (UG) / 1.5–2 yrs (PG)",scholarship: "Melbourne, Arts",             ielts: "6.5+", programs: ["Business", "Sciences", "Arts"] },
  { id: "sydney",   name: "University of Sydney",       country: "Australia",   flag: "🇦🇺", ranking: "#19 QS",  fees: "A$40,000–55,000/yr", intake: "Feb / Jul",   duration: "3 yrs (UG) / 1.5–2 yrs (PG)",scholarship: "International, Merit",        ielts: "6.5+", programs: ["Law", "Medicine", "Engineering"] },
  { id: "monash",   name: "Monash University",          country: "Australia",   flag: "🇦🇺", ranking: "#57 QS",  fees: "A$34,000–46,000/yr", intake: "Feb / Jul",   duration: "3 yrs (UG) / 1.5–2 yrs (PG)",scholarship: "International Merit",         ielts: "6.0+", programs: ["Business", "Pharmacy", "Engineering"] },
  // ── Germany ───────────────────────────────────────────────────────────────
  { id: "tum",      name: "TU Munich",                  country: "Germany",     flag: "🇩🇪", ranking: "#37 QS",  fees: "€0–3,500/yr",        intake: "Oct / Apr",   duration: "3 yrs (UG) / 2 yrs (PG)",   scholarship: "DAAD, Research",              ielts: "6.5+", programs: ["Engineering", "Sciences", "CS"] },
  { id: "rwth",     name: "RWTH Aachen",                country: "Germany",     flag: "🇩🇪", ranking: "#106 QS", fees: "€0–2,000/yr",        intake: "Oct / Apr",   duration: "3 yrs (UG) / 2 yrs (PG)",   scholarship: "DAAD, Erasmus",               ielts: "6.0+", programs: ["Engineering", "Sciences", "Architecture"] },
  { id: "lmu",      name: "LMU Munich",                 country: "Germany",     flag: "🇩🇪", ranking: "#59 QS",  fees: "€0–3,000/yr",        intake: "Oct / Apr",   duration: "3 yrs (UG) / 2 yrs (PG)",   scholarship: "DAAD, Bavaria",               ielts: "6.5+", programs: ["Medicine", "Sciences", "Business"] },
  // ── Ireland ───────────────────────────────────────────────────────────────
  { id: "trinity",  name: "Trinity College Dublin",     country: "Ireland",     flag: "🇮🇪", ranking: "#134 QS", fees: "€14,000–22,000/yr",  intake: "Sept",        duration: "4 yrs (UG) / 1 yr (PG)",    scholarship: "Trinity Scholarships",        ielts: "6.5+", programs: ["Business", "Medicine", "Engineering"] },
  { id: "ucd",      name: "University College Dublin",  country: "Ireland",     flag: "🇮🇪", ranking: "#181 QS", fees: "€16,000–24,000/yr",  intake: "Sept",        duration: "3 yrs (UG) / 1 yr (PG)",    scholarship: "Global Excellence",           ielts: "6.5+", programs: ["Business", "Engineering", "Law"] },
  // ── France ───────────────────────────────────────────────────────────────
  { id: "sorbonne", name: "Sorbonne University",        country: "France",      flag: "🇫🇷", ranking: "#59 QS",  fees: "€3,770–15,000/yr",   intake: "Sept",        duration: "3 yrs (UG) / 2 yrs (PG)",   scholarship: "Eiffel, Campus France",       ielts: "6.5+", programs: ["Sciences", "Arts", "Medicine"] },
  { id: "hec",      name: "HEC Paris",                  country: "France",      flag: "🇫🇷", ranking: "#1 FT MBA",fees: "€65,000 (MBA)",       intake: "Sept",        duration: "1.5 yrs (MBA)",              scholarship: "Merit, Need-based",           ielts: "7.0+", programs: ["Business", "Finance", "Management"] },
  // ── Netherlands ───────────────────────────────────────────────────────────
  { id: "delft",    name: "TU Delft",                   country: "Netherlands", flag: "🇳🇱", ranking: "#47 QS",  fees: "€15,000–20,000/yr",  intake: "Sept",        duration: "3 yrs (UG) / 2 yrs (PG)",   scholarship: "Holland, Justus & Louise",    ielts: "6.5+", programs: ["Engineering", "Architecture", "CS"] },
  { id: "amsterdam",name: "Univ. of Amsterdam",         country: "Netherlands", flag: "🇳🇱", ranking: "#55 QS",  fees: "€10,000–18,000/yr",  intake: "Sept",        duration: "3 yrs (UG) / 1–2 yrs (PG)", scholarship: "Holland Scholarship",          ielts: "6.5+", programs: ["Business", "Social Sciences", "Law"] },
  // ── Sweden ────────────────────────────────────────────────────────────────
  { id: "kth",      name: "KTH Royal Institute",        country: "Sweden",      flag: "🇸🇪", ranking: "#89 QS",  fees: "SEK 125,000–155,000/yr",intake: "Sept",      duration: "3 yrs (UG) / 2 yrs (PG)",   scholarship: "KTH Scholarship (up to 100%)",ielts: "6.5+", programs: ["Engineering", "CS", "Architecture"] },
  { id: "lund",     name: "Lund University",            country: "Sweden",      flag: "🇸🇪", ranking: "#100 QS", fees: "SEK 90,000–145,000/yr",intake: "Sept",       duration: "3 yrs (UG) / 2 yrs (PG)",   scholarship: "Swedish Institute",            ielts: "6.5+", programs: ["Law", "Business", "Sciences"] },
  // ── Singapore ─────────────────────────────────────────────────────────────
  { id: "nus",      name: "National Univ. of Singapore",country: "Singapore",   flag: "🇸🇬", ranking: "#8 QS",   fees: "S$29,000–38,000/yr", intake: "Aug",         duration: "4 yrs (UG) / 1–2 yrs (PG)", scholarship: "ASEAN, NUS Merit",            ielts: "6.5+", programs: ["Engineering", "Business", "Medicine"] },
  { id: "ntu",      name: "Nanyang Tech. University",   country: "Singapore",   flag: "🇸🇬", ranking: "#15 QS",  fees: "S$28,000–36,000/yr", intake: "Aug",         duration: "4 yrs (UG) / 1–2 yrs (PG)", scholarship: "NTU, ASEAN",                   ielts: "6.0+", programs: ["Engineering", "Business", "Sciences"] },
  // ── Japan ─────────────────────────────────────────────────────────────────
  { id: "todai",    name: "University of Tokyo",        country: "Japan",       flag: "🇯🇵", ranking: "#28 QS",  fees: "¥535,800/yr",        intake: "Apr / Sept",  duration: "4 yrs (UG) / 2 yrs (PG)",   scholarship: "MEXT, JASSO",                  ielts: "6.5+", programs: ["Engineering", "Sciences", "Law"] },
  { id: "kyoto",    name: "Kyoto University",           country: "Japan",       flag: "🇯🇵", ranking: "#55 QS",  fees: "¥535,800/yr",        intake: "Apr",         duration: "4 yrs (UG) / 2 yrs (PG)",   scholarship: "MEXT, Research",               ielts: "6.0+", programs: ["Sciences", "Engineering", "Arts"] },
  // ── Switzerland ───────────────────────────────────────────────────────────
  { id: "eth",      name: "ETH Zurich",                 country: "Switzerland", flag: "🇨🇭", ranking: "#7 QS",   fees: "CHF 730/yr",         intake: "Sept",        duration: "3 yrs (UG) / 2 yrs (PG)",   scholarship: "ETH Excellence",               ielts: "7.0+", programs: ["Engineering", "Sciences", "Architecture"] },
  { id: "epfl",     name: "EPFL",                       country: "Switzerland", flag: "🇨🇭", ranking: "#16 QS",  fees: "CHF 730/yr",         intake: "Sept",        duration: "3 yrs (UG) / 2 yrs (PG)",   scholarship: "Master Fellowship",            ielts: "7.0+", programs: ["Engineering", "CS", "Sciences"] },
  // ── Dubai (UAE) ───────────────────────────────────────────────────────────
  { id: "kust",     name: "Khalifa Univ. of S&T",      country: "Dubai",       flag: "🇦🇪", ranking: "#185 QS", fees: "AED 57,000–80,000/yr",intake: "Sept / Jan",  duration: "4 yrs (UG) / 2 yrs (PG)",   scholarship: "Merit (up to 100%)",           ielts: "6.0+", programs: ["Engineering", "CS", "Sciences"] },
  { id: "nyuad",    name: "NYU Abu Dhabi",              country: "Dubai",       flag: "🇦🇪", ranking: "#=185 QS",fees: "AED 88,000–95,000/yr",intake: "Sept",        duration: "4 yrs (UG)",                 scholarship: "Full-ride available",          ielts: "6.5+", programs: ["Liberal Arts", "Sciences", "Engineering"] },
  // ── Finland ───────────────────────────────────────────────────────────────
  { id: "aalto",    name: "Aalto University",           country: "Finland",     flag: "🇫🇮", ranking: "#115 QS", fees: "€12,000–15,000/yr",  intake: "Sept",        duration: "3 yrs (UG) / 2 yrs (PG)",   scholarship: "Aalto (up to 100% waiver)",   ielts: "6.5+", programs: ["Business", "Engineering", "Design"] },
  { id: "helsinki", name: "Univ. of Helsinki",         country: "Finland",     flag: "🇫🇮", ranking: "#115 QS", fees: "€4,000–18,000/yr",   intake: "Sept",        duration: "3 yrs (UG) / 2 yrs (PG)",   scholarship: "University Scholarship",       ielts: "6.5+", programs: ["Medicine", "Sciences", "Law"] },
  // ── Denmark ───────────────────────────────────────────────────────────────
  { id: "ku",       name: "Univ. of Copenhagen",       country: "Denmark",     flag: "🇩🇰", ranking: "#97 QS",  fees: "DKK 72,000–125,000/yr",intake: "Sept",       duration: "3 yrs (UG) / 2 yrs (PG)",   scholarship: "Government, Research",        ielts: "6.5+", programs: ["Medicine", "Sciences", "Law"] },
  { id: "dtu",      name: "DTU (Technical Univ.)",     country: "Denmark",     flag: "🇩🇰", ranking: "#146 QS", fees: "DKK 90,000–140,000/yr",intake: "Sept",       duration: "3 yrs (UG) / 2 yrs (PG)",   scholarship: "DTU, Erasmus",                 ielts: "6.5+", programs: ["Engineering", "CS", "Sciences"] },
  // ── Austria ───────────────────────────────────────────────────────────────
  { id: "tuwien",   name: "TU Wien",                   country: "Austria",     flag: "🇦🇹", ranking: "#165 QS", fees: "€1,500/yr",          intake: "Oct / Mar",   duration: "3 yrs (UG) / 2 yrs (PG)",   scholarship: "OeAD, Erasmus",               ielts: "6.5+", programs: ["Engineering", "Architecture", "CS"] },
  { id: "univie",   name: "Univ. of Vienna",           country: "Austria",     flag: "🇦🇹", ranking: "#163 QS", fees: "€1,500/yr",          intake: "Oct",         duration: "3 yrs (UG) / 2 yrs (PG)",   scholarship: "OeAD, Research",               ielts: "6.5+", programs: ["Medicine", "Sciences", "Law"] },
  // ── Belgium ───────────────────────────────────────────────────────────────
  { id: "kuleuven", name: "KU Leuven",                 country: "Belgium",     flag: "🇧🇪", ranking: "#75 QS",  fees: "€5,000–9,000/yr",    intake: "Sept",        duration: "3 yrs (UG) / 2 yrs (PG)",   scholarship: "KU Leuven, Erasmus+",         ielts: "6.5+", programs: ["Engineering", "Medicine", "Sciences"] },
  { id: "ugent",    name: "Ghent University",          country: "Belgium",     flag: "🇧🇪", ranking: "#175 QS", fees: "€4,000–8,000/yr",    intake: "Sept",        duration: "3 yrs (UG) / 2 yrs (PG)",   scholarship: "BOF, Erasmus+",               ielts: "6.5+", programs: ["Engineering", "Sciences", "Arts"] },
  // ── Hungary ───────────────────────────────────────────────────────────────
  { id: "semmelweis",name: "Semmelweis University",    country: "Hungary",     flag: "🇭🇺", ranking: "#551–560 QS",fees: "€9,000–16,000/yr",  intake: "Sept",        duration: "6 yrs (MBBS)",               scholarship: "Stipendium Hungaricum",        ielts: "5.5+", programs: ["Medicine", "Dentistry", "Pharmacy"] },
  { id: "bme",      name: "Budapest Univ. of Tech.",  country: "Hungary",     flag: "🇭🇺", ranking: "651–700 QS",fees: "€5,000–10,000/yr",   intake: "Sept",        duration: "3–5 yrs",                    scholarship: "Stipendium Hungaricum",        ielts: "5.5+", programs: ["Engineering", "CS", "Architecture"] },
  // ── Malaysia ──────────────────────────────────────────────────────────────
  { id: "utm",      name: "Univ. Teknologi Malaysia",  country: "Malaysia",    flag: "🇲🇾", ranking: "#187 QS", fees: "MYR 25,000–45,000/yr",intake: "Mar / Sept",  duration: "4 yrs (UG) / 2 yrs (PG)",   scholarship: "UTM, Commonwealth",            ielts: "6.0+", programs: ["Engineering", "CS", "Architecture"] },
  { id: "um",       name: "Universiti Malaya",         country: "Malaysia",    flag: "🇲🇾", ranking: "#65 QS",  fees: "MYR 18,000–40,000/yr",intake: "Mar / Sept",  duration: "4 yrs (UG) / 2 yrs (PG)",   scholarship: "UM Excellence",               ielts: "6.0+", programs: ["Medicine", "Engineering", "Business"] },
  // ── Italy ─────────────────────────────────────────────────────────────────
  { id: "polimi",   name: "Politecnico di Milano",     country: "Italy",       flag: "🇮🇹", ranking: "#139 QS", fees: "€4,000–12,000/yr",   intake: "Sept / Mar", duration: "3 yrs (UG) / 2 yrs (PG)",   scholarship: "EDISU, Regione Lombardia",    ielts: "6.5+", programs: ["Engineering", "Design", "Architecture"] },
  { id: "bologna",  name: "Univ. of Bologna",          country: "Italy",       flag: "🇮🇹", ranking: "#154 QS", fees: "€2,000–9,000/yr",    intake: "Sept",        duration: "3 yrs (UG) / 2 yrs (PG)",   scholarship: "ER.GO Scholarship",            ielts: "6.0+", programs: ["Law", "Sciences", "Humanities"] },
  // ── Spain ─────────────────────────────────────────────────────────────────
  { id: "upm",      name: "Univ. Politécnica de Madrid",country: "Spain",      flag: "🇪🇸", ranking: "#310 QS", fees: "€4,000–9,000/yr",    intake: "Sept",        duration: "4 yrs (UG) / 2 yrs (PG)",   scholarship: "Erasmus+, Becas",             ielts: "6.0+", programs: ["Engineering", "Architecture", "CS"] },
  { id: "iese",     name: "IESE Business School",      country: "Spain",       flag: "🇪🇸", ranking: "#4 FT MBA",fees: "€105,900 (MBA)",      intake: "Sept",        duration: "2 yrs (MBA)",                scholarship: "Merit, Need-based",           ielts: "7.0+", programs: ["Business", "Finance", "Management"] },
  // ── Cyprus ────────────────────────────────────────────────────────────────
  { id: "ucy",      name: "Univ. of Cyprus",           country: "Cyprus",      flag: "🇨🇾", ranking: "#601+ QS", fees: "€6,834–8,550/yr",    intake: "Sept",        duration: "4 yrs (UG) / 2 yrs (PG)",   scholarship: "State, Merit",                ielts: "6.0+", programs: ["Medicine", "Engineering", "Business"] },
  { id: "unic",     name: "Univ. of Nicosia",          country: "Cyprus",      flag: "🇨🇾", ranking: "801+ QS",  fees: "€8,000–12,000/yr",   intake: "Sept / Jan",  duration: "4–6 yrs",                    scholarship: "Merit, Excellence",           ielts: "5.5+", programs: ["Medicine", "Law", "Business"] },
  // ── Lithuania ─────────────────────────────────────────────────────────────
  { id: "vu",       name: "Vilnius University",         country: "Lithuania",   flag: "🇱🇹", ranking: "601–650 QS",fees: "€3,000–8,000/yr",    intake: "Sept",        duration: "4 yrs (UG) / 2 yrs (PG)",   scholarship: "Government, Erasmus+",        ielts: "5.5+", programs: ["Law", "Sciences", "Business"] },
  { id: "lsmu",     name: "Lithuanian Univ. Health Sci.",country: "Lithuania", flag: "🇱🇹", ranking: "801+ QS",  fees: "€8,000–11,000/yr",   intake: "Sept",        duration: "6 yrs (MBBS)",               scholarship: "Merit, ERASMUS+",             ielts: "5.5+", programs: ["Medicine", "Dentistry", "Pharmacy"] },
  // ── Georgia ───────────────────────────────────────────────────────────────
  { id: "tsu",      name: "Tbilisi State University",   country: "Georgia",     flag: "🇬🇪", ranking: "1001+ QS", fees: "GEL 4,500–7,000/yr",  intake: "Sept",        duration: "4–6 yrs",                    scholarship: "Government, University",       ielts: "5.5+", programs: ["Medicine", "Law", "Business"] },
  { id: "gumc",     name: "Geomedi Medical Univ.",      country: "Georgia",     flag: "🇬🇪", ranking: "N/A",      fees: "$4,000–6,000/yr",    intake: "Sept",        duration: "6 yrs (MBBS)",               scholarship: "Partial Merit",               ielts: "5.0+", programs: ["Medicine", "Dentistry", "Pharmacy"] },
  // ── Russia ────────────────────────────────────────────────────────────────
  { id: "mgu",      name: "Moscow State University",    country: "Russia",      flag: "🇷🇺", ranking: "#95 QS",  fees: "RUB 300,000–400,000/yr",intake: "Sept",      duration: "4 yrs (UG) / 2 yrs (PG)",   scholarship: "Russian Govt. Scholarship",    ielts: "6.0+", programs: ["Sciences", "Engineering", "Law"] },
  { id: "spbu",     name: "St. Petersburg Univ.",       country: "Russia",      flag: "🇷🇺", ranking: "#315 QS", fees: "RUB 200,000–350,000/yr",intake: "Sept",      duration: "4 yrs (UG) / 2 yrs (PG)",   scholarship: "Russian Govt. Scholarship",    ielts: "5.5+", programs: ["Sciences", "Law", "Arts"] },
  { id: "sechenovmed",name: "Sechenov Medical Univ.",   country: "Russia",      flag: "🇷🇺", ranking: "N/A",      fees: "$5,000–8,000/yr",    intake: "Sept",        duration: "6 yrs (MBBS)",               scholarship: "Russian Govt. (select seats)", ielts: "5.5+", programs: ["Medicine", "Dentistry", "Pharmacy"] },
];

const COMPARE_FIELDS = [
  { key: "ranking",     label: "QS Ranking" },
  { key: "fees",        label: "Annual Fees" },
  { key: "intake",      label: "Intake" },
  { key: "duration",    label: "Duration" },
  { key: "scholarship", label: "Scholarships" },
  { key: "ielts",       label: "IELTS Req." },
  { key: "programs",    label: "Top Programs" },
];

const COUNTRIES_FILTER = [
  "All", "USA", "UK", "Canada", "Australia", "Germany", "Ireland",
  "France", "Netherlands", "Sweden", "Singapore", "Japan", "Switzerland",
  "Dubai", "Finland", "Denmark", "Austria", "Belgium", "Hungary",
  "Malaysia", "Italy", "Spain", "Cyprus", "Lithuania", "Georgia", "Russia",
];


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
