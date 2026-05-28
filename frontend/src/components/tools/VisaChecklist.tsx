"use client";

import { useState } from "react";
import { Printer, CheckCircle2, Circle, ChevronDown } from "lucide-react";

type Country =
  | "UK" | "USA" | "Canada" | "Australia" | "Germany" | "France"
  | "Ireland" | "New Zealand" | "Netherlands" | "Sweden" | "Singapore"
  | "Japan" | "Switzerland" | "Dubai" | "Finland" | "Denmark"
  | "Austria" | "Belgium" | "Hungary" | "Malaysia" | "Italy"
  | "Spain" | "Cyprus" | "Lithuania" | "Georgia" | "Russia";

interface ChecklistItem { id: string; category: string; item: string }

const CHECKLISTS: Record<Country, ChecklistItem[]> = {
  UK: [
    { id: "uk-1",  category: "Identity",    item: "Valid passport (6+ months validity beyond course end)" },
    { id: "uk-2",  category: "Identity",    item: "Recent passport-size photographs (biometric standard)" },
    { id: "uk-3",  category: "University",  item: "Unconditional offer letter from UK university" },
    { id: "uk-4",  category: "University",  item: "Confirmation of Acceptance for Studies (CAS) number" },
    { id: "uk-5",  category: "University",  item: "UCAS ID or student reference number" },
    { id: "uk-6",  category: "Academic",    item: "All academic transcripts and degree certificates" },
    { id: "uk-7",  category: "Academic",    item: "English proficiency test results (IELTS 6.0+ / TOEFL 80+)" },
    { id: "uk-8",  category: "Financial",   item: "Bank statements (last 3–6 months)" },
    { id: "uk-9",  category: "Financial",   item: "Proof of £1,334/month (London) or £1,023/month (outside London) × 9 months" },
    { id: "uk-10", category: "Financial",   item: "First-year tuition fee proof of funds" },
    { id: "uk-11", category: "Financial",   item: "Scholarship or sponsorship letters (if applicable)" },
    { id: "uk-12", category: "Health",      item: "TB test certificate from approved clinic (if required)" },
    { id: "uk-13", category: "Visa",        item: "UK Student Visa application form (online)" },
    { id: "uk-14", category: "Visa",        item: "Visa application fee payment (£490 from outside UK)" },
    { id: "uk-15", category: "Visa",        item: "Immigration Health Surcharge payment (£776/yr postgraduate)" },
    { id: "uk-16", category: "Visa",        item: "Biometric enrolment appointment booking" },
  ],
  USA: [
    { id: "us-1",  category: "Identity",    item: "Valid passport (6+ months validity beyond stay)" },
    { id: "us-2",  category: "Identity",    item: "Recent photograph meeting US visa photo requirements" },
    { id: "us-3",  category: "University",  item: "Form I-20 from SEVP-certified institution" },
    { id: "us-4",  category: "University",  item: "University acceptance / offer letter" },
    { id: "us-5",  category: "Academic",    item: "All academic transcripts (official, sealed)" },
    { id: "us-6",  category: "Academic",    item: "English proficiency scores (TOEFL / IELTS)" },
    { id: "us-7",  category: "Academic",    item: "GRE / GMAT scores (if required by program)" },
    { id: "us-8",  category: "Financial",   item: "Bank statements (last 3 months)" },
    { id: "us-9",  category: "Financial",   item: "Affidavit of Financial Support (if sponsored)" },
    { id: "us-10", category: "Financial",   item: "Scholarship award letter (if applicable)" },
    { id: "us-11", category: "Visa",        item: "SEVIS fee payment receipt (I-901, $350 for F-1)" },
    { id: "us-12", category: "Visa",        item: "DS-160 Non-immigrant Visa Application (online)" },
    { id: "us-13", category: "Visa",        item: "Visa application fee payment ($185 MRV fee)" },
    { id: "us-14", category: "Visa",        item: "US Embassy / Consulate interview appointment" },
    { id: "us-15", category: "Visa",        item: "Ties to home country evidence (employment, property, family)" },
  ],
  Canada: [
    { id: "ca-1",  category: "Identity",    item: "Valid passport" },
    { id: "ca-2",  category: "Identity",    item: "Passport-size photographs" },
    { id: "ca-3",  category: "University",  item: "Letter of acceptance from designated learning institution (DLI)" },
    { id: "ca-4",  category: "Academic",    item: "All academic transcripts and certificates" },
    { id: "ca-5",  category: "Academic",    item: "English/French proficiency scores (IELTS 6.0+ / TOEFL 80+)" },
    { id: "ca-6",  category: "Financial",   item: "Proof of funds: CA$10,000/yr for living + tuition" },
    { id: "ca-7",  category: "Financial",   item: "Bank statements (last 4 months)" },
    { id: "ca-8",  category: "Financial",   item: "Education loan sanction letter (if applicable)" },
    { id: "ca-9",  category: "Visa",        item: "Study permit application (IMM 1294)" },
    { id: "ca-10", category: "Visa",        item: "Visa application fee (CA$150)" },
    { id: "ca-11", category: "Visa",        item: "Biometric collection (CA$85 if required)" },
    { id: "ca-12", category: "Visa",        item: "Quebec Acceptance Certificate (CAQ) if studying in Quebec" },
    { id: "ca-13", category: "Health",      item: "Medical examination by IRCC-approved physician (if required)" },
    { id: "ca-14", category: "Other",       item: "Intent to leave Canada letter" },
    { id: "ca-15", category: "Other",       item: "Custodian declaration (for students under 18)" },
  ],
  Australia: [
    { id: "au-1",  category: "Identity",    item: "Valid passport" },
    { id: "au-2",  category: "Identity",    item: "Certified passport copies" },
    { id: "au-3",  category: "University",  item: "Confirmation of Enrolment (CoE) from Australian institution" },
    { id: "au-4",  category: "Academic",    item: "All academic transcripts and degree certificates" },
    { id: "au-5",  category: "Academic",    item: "English proficiency test (IELTS 6.0+ / PTE 50+)" },
    { id: "au-6",  category: "Financial",   item: "Proof of financial capacity (tuition + A$21,041/yr living)" },
    { id: "au-7",  category: "Financial",   item: "Bank statements (last 3 months)" },
    { id: "au-8",  category: "Health",      item: "Overseas Student Health Cover (OSHC) purchase receipt" },
    { id: "au-9",  category: "Health",      item: "Health examinations (if requested by DFAT)" },
    { id: "au-10", category: "Character",   item: "Police clearance certificate from countries lived in 12+ months" },
    { id: "au-11", category: "Visa",        item: "Student Visa application (Subclass 500) online" },
    { id: "au-12", category: "Visa",        item: "Visa application fee (A$650)" },
    { id: "au-13", category: "Visa",        item: "Genuine Temporary Entrant (GTE) statement" },
    { id: "au-14", category: "Other",       item: "Scholarship letter (if applicable)" },
  ],
  Germany: [
    { id: "de-1",  category: "Identity",    item: "Valid national passport" },
    { id: "de-2",  category: "Identity",    item: "Biometric passport photos" },
    { id: "de-3",  category: "University",  item: "Unconditional admission letter from German university" },
    { id: "de-4",  category: "University",  item: "APS certificate (Akademische Prüfstelle) for Indian students" },
    { id: "de-5",  category: "Academic",    item: "All academic certificates and transcripts (officially certified)" },
    { id: "de-6",  category: "Academic",    item: "German language proficiency (TestDaF / DSH) OR English IELTS/TOEFL" },
    { id: "de-7",  category: "Financial",   item: "Blocked bank account (Sperrkonto) with €11,208" },
    { id: "de-8",  category: "Financial",   item: "Scholarship award letter (DAAD, etc.) — alternative to blocked account" },
    { id: "de-9",  category: "Visa",        item: "Visa application form (National Visa / Schengen Visa)" },
    { id: "de-10", category: "Visa",        item: "Visa fee payment (€75)" },
    { id: "de-11", category: "Health",      item: "Health insurance proof (public or private, valid in Germany)" },
    { id: "de-12", category: "Other",       item: "Curriculum Vitae (German or English)" },
    { id: "de-13", category: "Other",       item: "Statement of purpose / motivation letter" },
    { id: "de-14", category: "Other",       item: "German embassy appointment booking" },
  ],
  France: [
    { id: "fr-1",  category: "Identity",    item: "Valid passport (3+ months beyond intended stay)" },
    { id: "fr-2",  category: "Identity",    item: "Biometric photographs" },
    { id: "fr-3",  category: "University",  item: "Campus France registration and interview completion" },
    { id: "fr-4",  category: "University",  item: "Acceptance letter from French institution" },
    { id: "fr-5",  category: "Academic",    item: "Academic transcripts and diplomas" },
    { id: "fr-6",  category: "Academic",    item: "French (DELF/TCF) or English proficiency proof" },
    { id: "fr-7",  category: "Financial",   item: "Bank statements or sponsorship letter" },
    { id: "fr-8",  category: "Financial",   item: "Proof of accommodation in France" },
    { id: "fr-9",  category: "Visa",        item: "Long-stay student visa application" },
    { id: "fr-10", category: "Visa",        item: "Visa fee payment (€99)" },
    { id: "fr-11", category: "Health",      item: "Travel and health insurance for duration of stay" },
    { id: "fr-12", category: "Other",       item: "Curriculum Vitae" },
    { id: "fr-13", category: "Other",       item: "Statement of purpose / letter of motivation" },
  ],
  Ireland: [
    { id: "ie-1",  category: "Identity",    item: "Valid passport" },
    { id: "ie-2",  category: "Identity",    item: "Passport-size photographs" },
    { id: "ie-3",  category: "University",  item: "Unconditional offer letter from Irish institution" },
    { id: "ie-4",  category: "Academic",    item: "All academic transcripts and certificates" },
    { id: "ie-5",  category: "Academic",    item: "English proficiency (IELTS 6.0+)" },
    { id: "ie-6",  category: "Financial",   item: "Bank statements showing €7,000+ for first year living" },
    { id: "ie-7",  category: "Financial",   item: "Tuition fee payment proof or education loan sanction" },
    { id: "ie-8",  category: "Visa",        item: "Visa application (Category D Student Visa)" },
    { id: "ie-9",  category: "Visa",        item: "Visa fee payment (€60)" },
    { id: "ie-10", category: "Visa",        item: "GNIB (IRP) registration booking on arrival" },
    { id: "ie-11", category: "Health",      item: "Travel insurance for the duration of stay" },
    { id: "ie-12", category: "Other",       item: "Letter of intent / statement of purpose" },
    { id: "ie-13", category: "Other",       item: "Accommodation proof in Ireland" },
  ],
  "New Zealand": [
    { id: "nz-1",  category: "Identity",    item: "Valid passport (3+ months beyond intended stay)" },
    { id: "nz-2",  category: "Identity",    item: "Biometric photographs" },
    { id: "nz-3",  category: "University",  item: "Offer of place from New Zealand institution" },
    { id: "nz-4",  category: "Academic",    item: "All academic transcripts and certificates" },
    { id: "nz-5",  category: "Academic",    item: "English proficiency (IELTS 6.0+)" },
    { id: "nz-6",  category: "Financial",   item: "Proof of funds: NZ$15,000/yr" },
    { id: "nz-7",  category: "Financial",   item: "Bank statements (last 3 months)" },
    { id: "nz-8",  category: "Health",      item: "Chest X-ray / medical certificate (if required)" },
    { id: "nz-9",  category: "Character",   item: "Police clearance certificate" },
    { id: "nz-10", category: "Visa",        item: "Student visa application (online via Immigration NZ)" },
    { id: "nz-11", category: "Visa",        item: "Visa fee payment (NZ$330)" },
    { id: "nz-12", category: "Other",       item: "Travel insurance" },
    { id: "nz-13", category: "Other",       item: "Proof of accommodation booking" },
  ],
  Netherlands: [
    { id: "nl-1",  category: "Identity",    item: "Valid passport (6+ months validity)" },
    { id: "nl-2",  category: "Identity",    item: "Biometric photographs" },
    { id: "nl-3",  category: "University",  item: "Unconditional admission letter from Dutch institution" },
    { id: "nl-4",  category: "Academic",    item: "All academic transcripts and degree certificates" },
    { id: "nl-5",  category: "Academic",    item: "English proficiency (IELTS 6.0+ / TOEFL 80+)" },
    { id: "nl-6",  category: "Financial",   item: "Proof of funds: €11,000–14,000/yr living expenses" },
    { id: "nl-7",  category: "Financial",   item: "Bank statements (last 3 months)" },
    { id: "nl-8",  category: "Visa",        item: "MVV (Machtiging Voorlopig Verblijf) application via university" },
    { id: "nl-9",  category: "Visa",        item: "Visa fee payment (€192)" },
    { id: "nl-10", category: "Health",      item: "Dutch basic health insurance (Zorgverzekering) — required after arrival" },
    { id: "nl-11", category: "Other",       item: "DigiD registration on arrival (for government services)" },
    { id: "nl-12", category: "Other",       item: "Accommodation proof in the Netherlands" },
  ],
  Sweden: [
    { id: "se-1",  category: "Identity",    item: "Valid passport" },
    { id: "se-2",  category: "Identity",    item: "Biometric photographs" },
    { id: "se-3",  category: "University",  item: "Admission decision letter from Swedish institution" },
    { id: "se-4",  category: "Academic",    item: "All academic transcripts" },
    { id: "se-5",  category: "Academic",    item: "English proficiency (IELTS 6.5+ / TOEFL 90+)" },
    { id: "se-6",  category: "Financial",   item: "Proof of SEK 8,514/month (approx. ₹68,000/month)" },
    { id: "se-7",  category: "Financial",   item: "Bank statements or scholarship letter" },
    { id: "se-8",  category: "Visa",        item: "Swedish residence permit application (online via Migrationsverket)" },
    { id: "se-9",  category: "Visa",        item: "Permit application fee (SEK 1,000)" },
    { id: "se-10", category: "Health",      item: "Personal number registration for healthcare (on arrival)" },
    { id: "se-11", category: "Other",       item: "Accommodation proof in Sweden" },
  ],
  Singapore: [
    { id: "sg-1",  category: "Identity",    item: "Valid passport (6+ months validity)" },
    { id: "sg-2",  category: "Identity",    item: "Passport-size photographs" },
    { id: "sg-3",  category: "University",  item: "Unconditional offer letter from NUS / NTU / SMU / SIT" },
    { id: "sg-4",  category: "Academic",    item: "Certified academic transcripts and certificates" },
    { id: "sg-5",  category: "Academic",    item: "English proficiency (IELTS 6.5+ / TOEFL 90+)" },
    { id: "sg-6",  category: "Financial",   item: "Proof of sufficient funds for tuition + S$750–1,200/month living" },
    { id: "sg-7",  category: "Financial",   item: "Scholarship letter (if applicable)" },
    { id: "sg-8",  category: "Visa",        item: "Student's Pass application via ICA SOLAR system" },
    { id: "sg-9",  category: "Visa",        item: "ICA application fee (S$30)" },
    { id: "sg-10", category: "Health",      item: "Medical insurance (MediShield Life for PR; private for international)" },
    { id: "sg-11", category: "Other",       item: "Accommodation proof (university hall / private hostel)" },
  ],
  Japan: [
    { id: "jp-1",  category: "Identity",    item: "Valid passport" },
    { id: "jp-2",  category: "Identity",    item: "Recent photograph (4cm × 3cm, white background)" },
    { id: "jp-3",  category: "University",  item: "Certificate of Eligibility (CoE) issued by Japanese immigration via university" },
    { id: "jp-4",  category: "University",  item: "Admission letter from Japanese institution" },
    { id: "jp-5",  category: "Academic",    item: "Academic transcripts and graduation certificates" },
    { id: "jp-6",  category: "Academic",    item: "Japanese Language Proficiency (JLPT) OR English proficiency proof" },
    { id: "jp-7",  category: "Financial",   item: "Proof of funds: ¥1,000,000+ or scholarship letter" },
    { id: "jp-8",  category: "Financial",   item: "Bank statements (last 3 months)" },
    { id: "jp-9",  category: "Visa",        item: "Student Visa (College Student) application at Japanese embassy" },
    { id: "jp-10", category: "Visa",        item: "Visa fee (typically free for Indian passport holders)" },
    { id: "jp-11", category: "Health",      item: "National Health Insurance enrollment on arrival" },
    { id: "jp-12", category: "Other",       item: "Accommodation proof (dormitory or rental)" },
  ],
  Switzerland: [
    { id: "ch-1",  category: "Identity",    item: "Valid passport (3+ months beyond intended stay)" },
    { id: "ch-2",  category: "Identity",    item: "Biometric photographs" },
    { id: "ch-3",  category: "University",  item: "Admission letter from Swiss university" },
    { id: "ch-4",  category: "Academic",    item: "All academic transcripts (officially certified)" },
    { id: "ch-5",  category: "Academic",    item: "Language proficiency — French/German/Italian OR English (C1+)" },
    { id: "ch-6",  category: "Financial",   item: "Proof of CHF 21,000/yr (approx. ₹20 lakhs) minimum" },
    { id: "ch-7",  category: "Financial",   item: "Bank statements or scholarship letter" },
    { id: "ch-8",  category: "Visa",        item: "National Visa (Type D) application at Swiss embassy" },
    { id: "ch-9",  category: "Visa",        item: "Visa fee (CHF 80 / €75)" },
    { id: "ch-10", category: "Health",      item: "Swiss health insurance (mandatory; purchase within 3 months of arrival)" },
    { id: "ch-11", category: "Other",       item: "Accommodation proof in Switzerland" },
    { id: "ch-12", category: "Other",       item: "Motivation letter / CV" },
  ],
  Dubai: [
    { id: "ae-1",  category: "Identity",    item: "Valid passport (6+ months validity)" },
    { id: "ae-2",  category: "Identity",    item: "Passport-size photographs (white background)" },
    { id: "ae-3",  category: "University",  item: "Offer / acceptance letter from UAE-accredited institution" },
    { id: "ae-4",  category: "Academic",    item: "All academic transcripts and certificates (attested)" },
    { id: "ae-5",  category: "Academic",    item: "English proficiency (IELTS 5.5+ / TOEFL 68+)" },
    { id: "ae-6",  category: "Financial",   item: "Proof of sufficient funds for tuition + AED 3,000/month living" },
    { id: "ae-7",  category: "Financial",   item: "Bank statements (last 3 months)" },
    { id: "ae-8",  category: "Visa",        item: "Student Visa application through university (University Visa)" },
    { id: "ae-9",  category: "Visa",        item: "Visa fee (AED 300–500)" },
    { id: "ae-10", category: "Health",      item: "Emirates ID application (on arrival after residency stamp)" },
    { id: "ae-11", category: "Health",      item: "UAE health insurance (mandatory; usually arranged by university)" },
    { id: "ae-12", category: "Other",       item: "Accommodation proof (campus or private)" },
  ],
  Finland: [
    { id: "fi-1",  category: "Identity",    item: "Valid passport" },
    { id: "fi-2",  category: "Identity",    item: "Biometric photographs" },
    { id: "fi-3",  category: "University",  item: "Admission letter from Finnish institution" },
    { id: "fi-4",  category: "Academic",    item: "All academic transcripts" },
    { id: "fi-5",  category: "Academic",    item: "English proficiency (IELTS 6.0+ / TOEFL 80+)" },
    { id: "fi-6",  category: "Financial",   item: "Proof of €6,720/yr (€560/month) minimum" },
    { id: "fi-7",  category: "Financial",   item: "Bank statements or scholarship letter (Aalto Scholarship, etc.)" },
    { id: "fi-8",  category: "Visa",        item: "Residence permit application (online via Enter Finland)" },
    { id: "fi-9",  category: "Visa",        item: "Permit fee (€350)" },
    { id: "fi-10", category: "Health",      item: "Finnish Student Health Service (FSHS) registration on arrival" },
    { id: "fi-11", category: "Other",       item: "Accommodation proof (university/HOAS dormitory)" },
  ],
  Denmark: [
    { id: "dk-1",  category: "Identity",    item: "Valid passport (6+ months validity)" },
    { id: "dk-2",  category: "Identity",    item: "Biometric photographs" },
    { id: "dk-3",  category: "University",  item: "Admission letter from Danish institution" },
    { id: "dk-4",  category: "Academic",    item: "All academic transcripts and certificates" },
    { id: "dk-5",  category: "Academic",    item: "English proficiency (IELTS 6.5+ / TOEFL 88+)" },
    { id: "dk-6",  category: "Financial",   item: "Proof of DKK 5,891/month (approx. ₹70,000/month)" },
    { id: "dk-7",  category: "Financial",   item: "Bank statements or scholarship letter" },
    { id: "dk-8",  category: "Visa",        item: "Residence permit application (online via the Danish Immigration Service)" },
    { id: "dk-9",  category: "Visa",        item: "Permit fee (DKK 2,085)" },
    { id: "dk-10", category: "Health",      item: "Danish yellow health card (CPR registration on arrival)" },
    { id: "dk-11", category: "Other",       item: "Accommodation proof in Denmark" },
  ],
  Austria: [
    { id: "at-1",  category: "Identity",    item: "Valid passport" },
    { id: "at-2",  category: "Identity",    item: "Biometric photographs" },
    { id: "at-3",  category: "University",  item: "Admission letter from Austrian university" },
    { id: "at-4",  category: "Academic",    item: "All academic transcripts (officially certified + translated)" },
    { id: "at-5",  category: "Academic",    item: "Language proficiency — German (B2) OR English (IELTS 6.5+)" },
    { id: "at-6",  category: "Financial",   item: "Proof of €10,800/yr (€900/month) minimum" },
    { id: "at-7",  category: "Financial",   item: "Bank statements or scholarship letter" },
    { id: "at-8",  category: "Visa",        item: "Student Visa (National Visa / 'Aufenthaltstitel Student')" },
    { id: "at-9",  category: "Visa",        item: "Visa fee at Austrian embassy (€120)" },
    { id: "at-10", category: "Health",      item: "Austrian health insurance (BVAEB or private)" },
    { id: "at-11", category: "Other",       item: "Accommodation proof in Austria" },
    { id: "at-12", category: "Other",       item: "Motivation letter / CV" },
  ],
  Belgium: [
    { id: "be-1",  category: "Identity",    item: "Valid passport (15+ months validity)" },
    { id: "be-2",  category: "Identity",    item: "Biometric photographs" },
    { id: "be-3",  category: "University",  item: "Enrolment certificate from Belgian institution" },
    { id: "be-4",  category: "Academic",    item: "Certified academic transcripts and diplomas" },
    { id: "be-5",  category: "Academic",    item: "Language proficiency — Dutch/French/English as per program" },
    { id: "be-6",  category: "Financial",   item: "Proof of €650/month for duration of stay" },
    { id: "be-7",  category: "Financial",   item: "Bank statements or financial guarantee letter" },
    { id: "be-8",  category: "Visa",        item: "Long-stay student visa (Type D) application" },
    { id: "be-9",  category: "Visa",        item: "Visa fee (€180)" },
    { id: "be-10", category: "Health",      item: "Belgian mutual health insurance (mutualité) registration" },
    { id: "be-11", category: "Other",       item: "Municipality registration (commune) on arrival" },
  ],
  Hungary: [
    { id: "hu-1",  category: "Identity",    item: "Valid passport (6+ months validity)" },
    { id: "hu-2",  category: "Identity",    item: "Biometric photographs" },
    { id: "hu-3",  category: "University",  item: "Conditional / unconditional offer letter from Hungarian institution" },
    { id: "hu-4",  category: "Academic",    item: "All academic transcripts and degree certificates" },
    { id: "hu-5",  category: "Academic",    item: "English proficiency (IELTS 5.5+ for medical programs)" },
    { id: "hu-6",  category: "Financial",   item: "Proof of sufficient funds for tuition + HUF 130,000/month living" },
    { id: "hu-7",  category: "Financial",   item: "Bank statements (last 3 months)" },
    { id: "hu-8",  category: "Visa",        item: "Student Residence Permit application at Hungarian embassy" },
    { id: "hu-9",  category: "Visa",        item: "Visa fee (€60–110 depending on type)" },
    { id: "hu-10", category: "Health",      item: "TAJ card (Hungarian National Health Insurance) registration" },
    { id: "hu-11", category: "Other",       item: "Accommodation proof in Hungary" },
    { id: "hu-12", category: "Other",       item: "Motivation letter" },
  ],
  Malaysia: [
    { id: "my-1",  category: "Identity",    item: "Valid passport (18+ months validity)" },
    { id: "my-2",  category: "Identity",    item: "Recent passport-size photographs" },
    { id: "my-3",  category: "University",  item: "Offer letter from Malaysian institution" },
    { id: "my-4",  category: "Academic",    item: "All academic transcripts and certificates" },
    { id: "my-5",  category: "Academic",    item: "English proficiency (IELTS 5.5+ / TOEFL 58+)" },
    { id: "my-6",  category: "Financial",   item: "Proof of sufficient funds (MYR 4,000/month)" },
    { id: "my-7",  category: "Financial",   item: "Bank statements (last 3 months)" },
    { id: "my-8",  category: "Visa",        item: "Student Pass application via university to Immigration Dept. of Malaysia" },
    { id: "my-9",  category: "Visa",        item: "eVisa fee (MYR 300–600)" },
    { id: "my-10", category: "Health",      item: "EMGS medical examination in India (pre-arrival requirement)" },
    { id: "my-11", category: "Health",      item: "Malaysia health insurance or panel clinic coverage" },
    { id: "my-12", category: "Other",       item: "Accommodation proof (campus hostel or private)" },
  ],
  Italy: [
    { id: "it-1",  category: "Identity",    item: "Valid passport (6+ months validity)" },
    { id: "it-2",  category: "Identity",    item: "Biometric photographs" },
    { id: "it-3",  category: "University",  item: "Enrolment / pre-enrolment letter from Italian institution" },
    { id: "it-4",  category: "University",  item: "Declaration of Value (Dichiarazione di Valore) for your degree" },
    { id: "it-5",  category: "Academic",    item: "All academic transcripts and certificates" },
    { id: "it-6",  category: "Academic",    item: "Italian language proficiency (B2) OR English (IELTS 6.0+)" },
    { id: "it-7",  category: "Financial",   item: "Proof of €8,500/yr minimum" },
    { id: "it-8",  category: "Financial",   item: "Bank statements or scholarship letter" },
    { id: "it-9",  category: "Visa",        item: "Long-term student visa (Type D) at Italian consulate" },
    { id: "it-10", category: "Visa",        item: "Visa fee (€116)" },
    { id: "it-11", category: "Health",      item: "Italian National Health Service (SSN) registration on arrival" },
    { id: "it-12", category: "Other",       item: "Permesso di Soggiorno (residence permit) application within 8 days of arrival" },
  ],
  Spain: [
    { id: "es-1",  category: "Identity",    item: "Valid passport (6+ months validity)" },
    { id: "es-2",  category: "Identity",    item: "Biometric photographs" },
    { id: "es-3",  category: "University",  item: "Official enrolment confirmation from Spanish institution" },
    { id: "es-4",  category: "Academic",    item: "All academic transcripts (officially certified + translated)" },
    { id: "es-5",  category: "Academic",    item: "Spanish (B2) OR English (IELTS 6.0+) proficiency proof" },
    { id: "es-6",  category: "Financial",   item: "Proof of €600/month (€7,200/yr)" },
    { id: "es-7",  category: "Financial",   item: "Bank statements or sponsor letter" },
    { id: "es-8",  category: "Visa",        item: "Long-term student visa (Type D) application at Spanish consulate" },
    { id: "es-9",  category: "Visa",        item: "Visa fee (€60–80)" },
    { id: "es-10", category: "Health",      item: "Public health insurance (tarjeta sanitaria) registration on arrival" },
    { id: "es-11", category: "Other",       item: "NIE (foreigner ID number) application" },
    { id: "es-12", category: "Other",       item: "Empadronamiento (municipal registration)" },
  ],
  Cyprus: [
    { id: "cy-1",  category: "Identity",    item: "Valid passport (6+ months validity)" },
    { id: "cy-2",  category: "Identity",    item: "Biometric photographs" },
    { id: "cy-3",  category: "University",  item: "Acceptance letter from Cyprus institution" },
    { id: "cy-4",  category: "Academic",    item: "All academic transcripts and certificates" },
    { id: "cy-5",  category: "Academic",    item: "English proficiency (IELTS 6.0+ / TOEFL 80+)" },
    { id: "cy-6",  category: "Financial",   item: "Proof of €10,000/yr minimum" },
    { id: "cy-7",  category: "Financial",   item: "Bank statements (last 3 months)" },
    { id: "cy-8",  category: "Visa",        item: "Student Visa (Category D) application at Cyprus embassy" },
    { id: "cy-9",  category: "Visa",        item: "Visa fee (€70)" },
    { id: "cy-10", category: "Health",      item: "GESY (National Health System Cyprus) registration on arrival" },
    { id: "cy-11", category: "Other",       item: "Temporary Residence Permit application on arrival" },
    { id: "cy-12", category: "Other",       item: "Accommodation proof in Cyprus" },
  ],
  Lithuania: [
    { id: "lt-1",  category: "Identity",    item: "Valid passport (6+ months validity)" },
    { id: "lt-2",  category: "Identity",    item: "Biometric photographs" },
    { id: "lt-3",  category: "University",  item: "Admission letter from Lithuanian institution" },
    { id: "lt-4",  category: "Academic",    item: "All academic transcripts (certified + translated)" },
    { id: "lt-5",  category: "Academic",    item: "English proficiency (IELTS 5.5+ / TOEFL 72+)" },
    { id: "lt-6",  category: "Financial",   item: "Proof of €441/month minimum" },
    { id: "lt-7",  category: "Financial",   item: "Bank statements or scholarship letter" },
    { id: "lt-8",  category: "Visa",        item: "National Visa (Type D) application at Lithuanian embassy" },
    { id: "lt-9",  category: "Visa",        item: "Visa fee (€80)" },
    { id: "lt-10", category: "Health",      item: "Lithuanian Compulsory Health Insurance (PSDF) registration" },
    { id: "lt-11", category: "Other",       item: "Temporary residence permit application on arrival" },
  ],
  Georgia: [
    { id: "ge-1",  category: "Identity",    item: "Valid passport" },
    { id: "ge-2",  category: "Identity",    item: "Passport-size photographs" },
    { id: "ge-3",  category: "University",  item: "Offer/acceptance letter from Georgian institution" },
    { id: "ge-4",  category: "Academic",    item: "All academic transcripts and certificates" },
    { id: "ge-5",  category: "Academic",    item: "English proficiency proof (IELTS 5.5+ / equivalent)" },
    { id: "ge-6",  category: "Financial",   item: "Proof of GEL 500–800/month living expenses" },
    { id: "ge-7",  category: "Financial",   item: "Bank statements (last 3 months)" },
    { id: "ge-8",  category: "Visa",        item: "Georgian Study Visa (Indian citizens may enter visa-free up to 1 year — confirm latest policy)" },
    { id: "ge-9",  category: "Visa",        item: "Residence permit registration within 90 days if staying longer" },
    { id: "ge-10", category: "Health",      item: "Private health insurance (Georgia does not have universal public system for students)" },
    { id: "ge-11", category: "Other",       item: "Accommodation proof in Georgia" },
    { id: "ge-12", category: "Other",       item: "Authorized representative's declaration if under 18" },
  ],
  Russia: [
    { id: "ru-1",  category: "Identity",    item: "Valid passport (18+ months validity)" },
    { id: "ru-2",  category: "Identity",    item: "Passport-size photographs" },
    { id: "ru-3",  category: "University",  item: "Invitation letter / call-up notice from Russian institution" },
    { id: "ru-4",  category: "Academic",    item: "All academic transcripts and certificates" },
    { id: "ru-5",  category: "Academic",    item: "Russian language proficiency OR English (for English-medium programs)" },
    { id: "ru-6",  category: "Financial",   item: "Proof of funds for tuition + RUB 7,000–10,000/month living" },
    { id: "ru-7",  category: "Financial",   item: "Bank statements (last 3 months)" },
    { id: "ru-8",  category: "Health",      item: "Medical certificate (HIV test mandatory; other tests may be required)" },
    { id: "ru-9",  category: "Visa",        item: "Student Visa (Category 'Student') application at Russian embassy" },
    { id: "ru-10", category: "Visa",        item: "Visa fee ($40–65 depending on urgency)" },
    { id: "ru-11", category: "Visa",        item: "Migration card and registration within 7 working days of arrival" },
    { id: "ru-12", category: "Other",       item: "Accommodation proof (university dormitory letter preferred)" },
  ],
};

const COUNTRY_LIST: { key: Country; flag: string }[] = [
  { key: "UK",          flag: "🇬🇧" },
  { key: "USA",         flag: "🇺🇸" },
  { key: "Canada",      flag: "🇨🇦" },
  { key: "Australia",   flag: "🇦🇺" },
  { key: "Germany",     flag: "🇩🇪" },
  { key: "Ireland",     flag: "🇮🇪" },
  { key: "France",      flag: "🇫🇷" },
  { key: "Netherlands", flag: "🇳🇱" },
  { key: "Sweden",      flag: "🇸🇪" },
  { key: "New Zealand", flag: "🇳🇿" },
  { key: "Singapore",   flag: "🇸🇬" },
  { key: "Switzerland", flag: "🇨🇭" },
  { key: "Dubai",       flag: "🇦🇪" },
  { key: "Finland",     flag: "🇫🇮" },
  { key: "Denmark",     flag: "🇩🇰" },
  { key: "Austria",     flag: "🇦🇹" },
  { key: "Belgium",     flag: "🇧🇪" },
  { key: "Hungary",     flag: "🇭🇺" },
  { key: "Malaysia",    flag: "🇲🇾" },
  { key: "Italy",       flag: "🇮🇹" },
  { key: "Spain",       flag: "🇪🇸" },
  { key: "Japan",       flag: "🇯🇵" },
  { key: "Cyprus",      flag: "🇨🇾" },
  { key: "Lithuania",   flag: "🇱🇹" },
  { key: "Georgia",     flag: "🇬🇪" },
  { key: "Russia",      flag: "🇷🇺" },
];

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
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const items = CHECKLISTS[country];
  const total = items.length;
  const done = items.filter((i) => checked.has(i.id)).length;
  const pct = Math.round((done / total) * 100);

  const currentEntry = COUNTRY_LIST.find((c) => c.key === country)!;

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
    setDropdownOpen(false);
  };

  const grouped = groupByCategory(items);

  const progressColor =
    pct >= 80 ? "bg-emerald-500" : pct >= 50 ? "bg-blue-500" : pct >= 20 ? "bg-amber-500" : "bg-gray-200";

  return (
    <div className="max-w-3xl mx-auto">
      {/* Country selector — scrollable dropdown */}
      <div className="relative mb-6">
        <button
          onClick={() => setDropdownOpen((o) => !o)}
          className="w-full flex items-center justify-between px-5 py-3 bg-white border border-gray-200 rounded-xl shadow-sm hover:border-[#c9a84c] transition-colors text-left"
        >
          <span className="font-semibold text-[#1a2f5e] text-sm">
            {currentEntry.flag} {country} — Visa Checklist
          </span>
          <ChevronDown
            size={16}
            className={`text-gray-400 transition-transform duration-200 ${dropdownOpen ? "rotate-180" : ""}`}
          />
        </button>
        {dropdownOpen && (
          <div className="absolute top-full mt-1 left-0 right-0 bg-white border border-gray-200 rounded-xl shadow-xl z-30 max-h-72 overflow-y-auto">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-px p-2">
              {COUNTRY_LIST.map((c) => (
                <button
                  key={c.key}
                  onClick={() => changeCountry(c.key)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all text-left ${
                    country === c.key
                      ? "bg-[#1a2f5e] text-white"
                      : "text-gray-600 hover:bg-[#fef9f0] hover:text-[#1a2f5e]"
                  }`}
                >
                  <span>{c.flag}</span>
                  <span className="truncate">{c.key}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Progress bar */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="font-bold text-[#1a2f5e]">{currentEntry.flag} {country} Student Visa Checklist</h3>
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
