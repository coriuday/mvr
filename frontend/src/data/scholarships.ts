export type StaticScholarship = {
  id: string;
  name: string;
  scholarship_type: string;
  country: string;
  amount: string | null;
  deadline: string | null;
  description: string | null;
  eligibility: string | null;
  apply_url: string | null;
  is_featured: boolean;
};

export const STATIC_SCHOLARSHIPS: StaticScholarship[] = [
  {
    id: "chevening",
    name: "Chevening Scholarship",
    scholarship_type: "GOVERNMENT",
    country: "United Kingdom",
    amount: "Full tuition + living allowance",
    deadline: "2025-11-15",
    description: "UK government's global scholarship programme for future leaders.",
    eligibility: "2+ years work experience; undergraduate degree; Indian citizens eligible",
    apply_url: "https://www.chevening.org",
    is_featured: true,
  },
  {
    id: "fulbright-nehru",
    name: "Fulbright-Nehru Fellowship",
    scholarship_type: "GOVERNMENT",
    country: "United States",
    amount: "Full funding",
    deadline: "2025-07-15",
    description: "Premier US-India exchange programme for Master's and PhD study.",
    eligibility: "Indian citizens; strong academic record and leadership",
    apply_url: "https://www.usief.org.in",
    is_featured: true,
  },
  {
    id: "daad",
    name: "DAAD Scholarship",
    scholarship_type: "GOVERNMENT",
    country: "Germany",
    amount: "€850–1,200/month",
    deadline: "2025-10-01",
    description: "German Academic Exchange Service funding for international students.",
    eligibility: "Bachelor's degree; relevant field of study",
    apply_url: "https://www.daad.de",
    is_featured: true,
  },
  {
    id: "commonwealth",
    name: "Commonwealth Scholarship",
    scholarship_type: "GOVERNMENT",
    country: "United Kingdom",
    amount: "Full Masters funding",
    deadline: "2025-12-01",
    description: "Funded by the UK Foreign, Commonwealth & Development Office.",
    eligibility: "Citizens of Commonwealth countries including India",
    apply_url: null,
    is_featured: false,
  },
];
