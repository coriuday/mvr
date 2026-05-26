// =============================================================================
// Country data types — matches the JSON schema from extract-blogs.py
// =============================================================================

export interface CountryStats {
  unis: string;
  workRights: string;
  intakes: string;
  avgTuition: string;
}

export interface TuitionFees {
  currency: string;
  undergraduate: string;
  postgraduate: string;
  phd: string;
}

export interface Scholarship {
  name: string;
  amount: string;
  eligibility: string;
  link?: string;
}

export interface VisaRequirements {
  type: string;
  requirements: string[];
  processingTime: string;
  fee: string;
}

export interface WorkPermit {
  duringStudy: string;
  postStudy: string;
  notes: string;
}

export interface LanguageRequirements {
  ielts: string;
  toefl: string;
  pte: string;
  gmat?: string;
  gre?: string;
  notes: string;
}

export interface University {
  name: string;
  ranking: string;
  programs: string[];
}

export interface FAQ {
  question: string;
  answer: string;
}

export interface CountryData {
  slug: string;
  name: string;
  flag: string;
  tagline: string;
  description: string;
  heroImage: string;
  images: string[];
  stats: CountryStats;
  tuitionFees: TuitionFees;
  scholarships: Scholarship[];
  visaRequirements: VisaRequirements;
  workPermit: WorkPermit;
  popularPrograms: string[];
  languageRequirements: LanguageRequirements;
  topUniversities: University[];
  faqs: FAQ[];
}
