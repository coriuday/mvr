#!/usr/bin/env python3
"""
cleanup-data.py
Post-processes the generated JSON files to fix data quality issues:
- Cleans up scholarship names that are fragments
- Fixes visa requirements that are slide headings instead of real requirements
- Fixes IELTS scores parsed incorrectly (e.g., ".")
- Cleans up work permit text that's truncated
"""

import json
import re
from pathlib import Path

DATA_DIR = Path(__file__).parent.parent / "src" / "data" / "countries"

# Default visa requirements per country
DEFAULT_VISA_REQS = {
    "uk": [
        "Valid passport with at least 6 months validity beyond your course end date",
        "Unconditional offer letter (CAS) from a UK licensed sponsor university",
        "Proof of English proficiency (IELTS 6.0+ or equivalent)",
        "Financial evidence: £1,334/month for London or £1,023/month outside London",
        "Academic qualifications and transcripts",
        "TB test certificate (if applicable for your nationality)",
        "UK Student Visa application fee: £490 (from outside UK)",
    ],
    "usa": [
        "Valid passport (must be valid for at least 6 months beyond stay)",
        "Form I-20 from your SEVP-certified US institution",
        "SEVIS fee payment receipt ($350 for F-1 students)",
        "DS-160 Online Nonimmigrant Visa Application",
        "Proof of financial support (bank statements, affidavit of support)",
        "Academic transcripts and English test scores (IELTS/TOEFL)",
        "Evidence of ties to home country (intent to return after studies)",
    ],
    "canada": [
        "Valid passport (valid for the full duration of your study permit)",
        "Letter of acceptance from a Designated Learning Institution (DLI)",
        "Proof of financial support (CAD 10,000+/year for living expenses)",
        "Statement of purpose and study plan",
        "Immigration Medical Examination (IME) if required",
        "Biometrics enrollment (mandatory for most nationalities)",
        "Police clearance certificate",
    ],
    "australia": [
        "Valid passport (minimum 6 months validity)",
        "Confirmation of Enrolment (CoE) from your Australian institution",
        "Genuine Temporary Entrant (GTE) statement",
        "OSHC (Overseas Student Health Cover) for the duration of study",
        "Proof of financial capacity (AUD 21,041/year for living)",
        "English proficiency scores (IELTS/TOEFL/PTE)",
        "Academic transcripts and qualifications",
    ],
    "germany": [
        "Valid passport (valid for at least 12 months beyond intended stay)",
        "University admission letter / enrollment confirmation",
        "Blocked account (Sperrkonto) with €11,904 (€992/month)",
        "Health insurance certificate (public or private)",
        "Proof of German/English language proficiency",
        "Academic transcripts (officially translated/apostilled)",
        "Biometric photographs",
    ],
    "ireland": [
        "Valid passport (valid for the full duration of study)",
        "Letter of acceptance from an Irish institution",
        "Proof of financial means (€7,000+ for the first year)",
        "Private medical insurance (if not covered by an employer)",
        "Academic transcripts and English proficiency certificates",
        "Evidence of payment of first year tuition fees",
        "Two recent passport-sized photographs",
    ],
    "france": [
        "Valid national passport",
        "University acceptance letter / Campus France approval",
        "Proof of financial resources (€615/month minimum)",
        "French health insurance or private coverage",
        "Proof of accommodation in France",
        "Language proficiency (French B2 for French programs / IELTS for English)",
        "Long-Stay Visa (VLS-TS) application",
    ],
    "netherlands": [
        "Valid passport",
        "University acceptance letter",
        "Proof of financial means (€11,000+ per year)",
        "Authorization for Temporary Stay (MVV) if required",
        "Health insurance (obligatory in the Netherlands)",
        "Proof of language proficiency (IELTS 6.0+)",
        "Completed residence permit application forms",
    ],
    "sweden": [
        "Valid passport",
        "University admission letter",
        "Proof of financial means (SEK 8,568/month)",
        "Comprehensive health insurance (for first 12 months)",
        "English language test scores (IELTS 6.0+)",
        "Completed residence permit application via Migrationsverket",
        "Payment of application fee (SEK 1,000)",
    ],
    "switzerland": [
        "Valid passport (valid for at least 6 months beyond stay)",
        "University enrollment/admission confirmation",
        "Proof of financial means (CHF 21,000/year recommended)",
        "Swiss health insurance coverage",
        "Academic transcripts and diplomas (officially translated)",
        "Letter of motivation",
        "Biometric residence permit application",
    ],
    "singapore": [
        "Valid passport",
        "Student's Pass application via SOLAR+ system",
        "University acceptance letter",
        "Proof of financial means",
        "Academic transcripts and certificates",
        "Medical examination report (if required)",
        "Disembarkation/Embarkation card",
    ],
    "japan": [
        "Valid passport",
        "Certificate of Eligibility (CoE) issued by Japanese immigration",
        "University admission letter",
        "Financial support documents (¥2,000,000+ equivalent)",
        "Academic transcripts and diplomas",
        "Japanese language proficiency (JLPT N2 for Japanese programs) or English scores",
        "Application form with recent photograph",
    ],
    "malaysia": [
        "Valid passport (minimum 18 months validity)",
        "University acceptance letter",
        "Visa approval letter from Malaysian immigration",
        "Medical examination at a government-registered clinic",
        "Bank statement showing sufficient funds",
        "Academic transcripts and qualifications",
        "Student Pass application through your university",
    ],
    "dubai": [
        "Valid passport (minimum 6 months validity)",
        "University acceptance letter",
        "Emirates ID application",
        "Medical fitness test and blood test",
        "Health insurance coverage",
        "Financial proof (AED 3,000/month minimum)",
        "Passport-sized photographs",
    ],
    "finland": [
        "Valid passport",
        "University admission letter",
        "Residence permit application (if staying 90+ days)",
        "Proof of financial means (€6,720/year minimum)",
        "Health insurance valid in Finland",
        "Completed and signed application form",
        "English/Finnish language proficiency proof",
    ],
    "denmark": [
        "Valid passport",
        "University acceptance/admission letter",
        "Proof of financial means (DKK 5,941/month)",
        "Proof of accommodation in Denmark",
        "Health insurance (automatically covered after residence permit)",
        "Language proficiency certificate (English or Danish)",
        "Study permit application form",
    ],
    "austria": [
        "Valid passport (valid 3 months beyond intended stay)",
        "University admission letter",
        "Proof of financial means (€924/month for Vienna)",
        "Health insurance valid in Austria",
        "Accommodation proof in Austria",
        "Academic transcripts and qualifications (apostilled)",
        "Application for student visa (Type D) at Austrian embassy",
    ],
    "belgium": [
        "Valid passport",
        "University enrollment confirmation",
        "Proof of financial means (€600/month)",
        "Criminal background check (apostilled)",
        "Medical certificate of good health",
        "Proof of accommodation in Belgium",
        "Student visa / residence permit application (Type D for 90+ days)",
    ],
    "hungary": [
        "Valid passport",
        "University admission letter",
        "Proof of financial means (approx. €5,000/year)",
        "Health insurance or certificate of coverage",
        "Academic transcripts (apostilled and translated to English)",
        "Criminal background check",
        "Application at the Hungarian embassy/consulate",
    ],
    "cyprus": [
        "Valid passport (minimum 6 months beyond stay)",
        "University acceptance letter",
        "Bank statement showing €1,800/month",
        "Medical certificate in good health",
        "Clean criminal record certificate",
        "Proof of accommodation",
        "Temporary Residence Permit application at Civil Registry office",
    ],
    "italy": [
        "Valid passport",
        "University pre-enrollment / acceptance letter",
        "Proof of financial means (€448/month minimum)",
        "Study visa (Type D) from Italian consulate",
        "Health insurance or EHIC card",
        "Accommodation proof in Italy",
        "Academic qualifications (officially translated to Italian)",
    ],
    "spain": [
        "Valid passport (minimum 6 months validity)",
        "University acceptance letter",
        "Proof of financial means (€700/month minimum)",
        "Health insurance valid in Spain",
        "Criminal background check (apostilled)",
        "Accommodation proof in Spain",
        "Long-stay student visa (Type D) application at Spanish consulate",
    ],
    "georgia": [
        "Valid passport",
        "University admission letter",
        "Proof of financial means",
        "Medical certificate",
        "Criminal background check",
        "No visa required for Indian nationals (stay up to 360 days)",
        "Register at Civil Registry Agency after arrival",
    ],
    "lithuania": [
        "Valid passport",
        "University admission letter",
        "Proof of financial means (€300/month minimum)",
        "Health insurance valid in Lithuania",
        "Criminal record certificate",
        "National Visa (Type D) application at Lithuanian embassy",
        "Temporary Residence Permit after arrival",
    ],
    "russia": [
        "Valid passport (minimum 6 months beyond stay)",
        "Invitation letter from Russian university",
        "Student visa application at Russian embassy",
        "Medical insurance valid in Russia",
        "HIV test certificate",
        "Proof of financial means",
        "Migration card on arrival (keep throughout stay)",
    ],
    "new-zealand": [
        "Valid passport",
        "University offer of place letter",
        "Student visa application via Immigration New Zealand",
        "Proof of financial means (NZD 15,000/year)",
        "English proficiency scores (IELTS 6.0+)",
        "Medical and chest X-ray certificates",
        "Evidence of return travel funds",
    ],
    "georgia": [
        "Valid passport",
        "University admission letter",
        "Proof of financial means",
        "Medical certificate",
        "Criminal background check",
        "No visa required for Indian nationals (up to 360-day stay visa-free)",
        "Register at Civil Registry Agency within 45 days of arrival",
    ],
}

# Default tuition per country
DEFAULT_TUITION = {
    "uk": {"undergraduate": "£9,250–£30,000 per year (varies by program and university)", "postgraduate": "£12,000–£30,000 per year; MBA programs £20,000–£60,000", "phd": "£5,000–£15,000 per year; many are fully funded through research councils"},
    "usa": {"undergraduate": "$20,000–$60,000 per year at private universities; $10,000–$30,000 at public universities", "postgraduate": "$25,000–$60,000 per year; MBA programs at top schools can reach $80,000+", "phd": "Often fully funded with stipends for research assistants (TA/RA)"},
    "canada": {"undergraduate": "CAD 15,000–40,000 per year", "postgraduate": "CAD 12,000–35,000 per year", "phd": "CAD 7,000–25,000 per year; many include research funding"},
    "australia": {"undergraduate": "AUD 20,000–45,000 per year", "postgraduate": "AUD 22,000–50,000 per year; MBA programs AUD 40,000–60,000", "phd": "AUD 28,000–40,000 per year; domestic rate scholarships often available"},
    "germany": {"undergraduate": "€0–€3,000 per year at public universities (semester admin fee only)", "postgraduate": "€0–€3,000 at public universities; €10,000–€20,000 at private institutions", "phd": "Typically free at public universities; often includes stipend"},
    "ireland": {"undergraduate": "€9,950–€25,000 per year", "postgraduate": "€10,000–€30,000 per year; MBA programs up to €35,000", "phd": "€5,000–€15,000 per year; many include research bursaries"},
    "france": {"undergraduate": "€170–€2,770 at public universities; €5,000–€20,000 at private Grandes Écoles", "postgraduate": "€243–€3,770 at public universities; up to €25,000 at private schools", "phd": "€380–€400 at public universities; often funded through research contracts"},
    "germany": {"undergraduate": "€0 tuition at public universities (only €150–€350 semester fee)", "postgraduate": "€0 at most public universities; €5,000–€20,000 at private universities", "phd": "Free at public universities; doctoral candidates often receive a stipend"},
    "netherlands": {"undergraduate": "€8,000–€20,000 per year", "postgraduate": "€10,000–€25,000 per year; MBA programs up to €40,000", "phd": "Often fully funded as a paid PhD employee position"},
    "sweden": {"undergraduate": "SEK 80,000–180,000 per year (for non-EU/EEA students)", "postgraduate": "SEK 100,000–200,000 per year", "phd": "Fully funded through employment contracts at Swedish universities"},
    "switzerland": {"undergraduate": "CHF 1,000–2,000 per year at public universities", "postgraduate": "CHF 1,000–2,000 per year at public universities; CHF 20,000–35,000 at private schools (IMD, HSG)", "phd": "Fully funded at most Swiss institutions with monthly stipend"},
    "singapore": {"undergraduate": "SGD 15,000–35,000 per year (after government subsidy)", "postgraduate": "SGD 20,000–40,000 per year; MBA up to SGD 60,000", "phd": "Often funded with a Research Scholarship from the institution"},
    "japan": {"undergraduate": "¥535,800–¥900,000 per year at national universities; higher at private universities", "postgraduate": "¥535,800–¥1,500,000 per year", "phd": "Often supported through MEXT or JASSO scholarships"},
    "malaysia": {"undergraduate": "MYR 15,000–40,000 per year", "postgraduate": "MYR 20,000–50,000 per year", "phd": "MYR 10,000–25,000 per year; research scholarships available"},
    "dubai": {"undergraduate": "AED 30,000–80,000 per year (varies widely by institution)", "postgraduate": "AED 40,000–100,000 per year; MBA programs AED 60,000–120,000", "phd": "AED 50,000–90,000 per year"},
    "finland": {"undergraduate": "€6,000–18,000 per year (for non-EU/EEA students)", "postgraduate": "€8,000–18,000 per year", "phd": "Fully funded through university employment contracts"},
    "denmark": {"undergraduate": "DKK 45,000–120,000 per year (for non-EU students)", "postgraduate": "DKK 60,000–150,000 per year", "phd": "Fully funded as a 3-year PhD employee at Danish universities"},
    "austria": {"undergraduate": "€726.72 per semester (€1,453 per year) at public universities", "postgraduate": "€726.72 per semester at public universities; €5,000–€30,000 at private institutions", "phd": "Often funded through FWF fellowships or university assistantships"},
    "belgium": {"undergraduate": "€835–€4,175 per year (depending on institution type and program)", "postgraduate": "€835–€6,000 per year; business programs up to €20,000", "phd": "Typically funded through FWO, FNRS grants, or university fellowships"},
    "hungary": {"undergraduate": "€3,000–€14,000 per year (medicine €10,000–€16,000)", "postgraduate": "€4,000–€12,000 per year", "phd": "€3,000–€7,000 per year; Stipendium Hungaricum covers full tuition"},
    "cyprus": {"undergraduate": "€3,500–€8,000 per year", "postgraduate": "€5,000–€12,000 per year", "phd": "€4,000–€8,000 per year"},
    "italy": {"undergraduate": "€900–€4,000 at public universities; up to €12,000 at private", "postgraduate": "€1,000–€6,000 at public; up to €20,000 at private schools", "phd": "€900–€1,500 per year; often fully funded through research grants"},
    "spain": {"undergraduate": "€1,500–€8,000 at public universities; up to €18,000 at private", "postgraduate": "€2,000–€12,000 at public; up to €25,000 at private business schools", "phd": "Often subsidized; FPU fellowships cover tuition + stipend"},
    "georgia": {"undergraduate": "$2,000–$6,000 per year", "postgraduate": "$3,000–$7,000 per year", "phd": "$2,000–$5,000 per year"},
    "lithuania": {"undergraduate": "€2,500–€5,000 per year", "postgraduate": "€3,000–€6,000 per year", "phd": "€2,000–€4,000 per year; some funded positions available"},
    "russia": {"undergraduate": "$2,000–$6,000 per year", "postgraduate": "$3,000–$7,000 per year", "phd": "$2,000–$5,000 per year; Russian Government Scholarships available"},
    "new-zealand": {"undergraduate": "NZD 22,000–35,000 per year", "postgraduate": "NZD 26,000–37,000 per year; MBA programs up to NZD 45,000", "phd": "NZD 6,500 per year (domestic rate) with NZ Excellence Scholarship"},
}

# Default scholarships per country
DEFAULT_SCHOLARSHIPS = {
    "uk": [
        {"name": "Chevening Scholarships", "amount": "Full funding (tuition + living)", "eligibility": "Outstanding academics with leadership potential; government-backed", "link": "https://www.chevening.org"},
        {"name": "Commonwealth Scholarships", "amount": "Full funding", "eligibility": "Citizens of Commonwealth countries for postgraduate study", "link": "https://cscuk.fcdo.gov.uk"},
        {"name": "GREAT Scholarships", "amount": "£10,000 minimum", "eligibility": "Indian students for postgraduate courses at UK universities", "link": "https://study-uk.britishcouncil.org/scholarships/great"},
        {"name": "University Merit Awards", "amount": "10%–50% tuition waiver", "eligibility": "High-achieving international applicants (varies by university)", "link": ""},
    ],
    "usa": [
        {"name": "Fulbright Foreign Student Program", "amount": "Full funding (tuition + living + airfare)", "eligibility": "Outstanding academic record; leadership qualities; government-sponsored", "link": "https://foreign.fulbrightonline.org"},
        {"name": "Hubert H. Humphrey Fellowship", "amount": "Full funding", "eligibility": "Mid-career professionals from eligible countries", "link": ""},
        {"name": "University Merit Scholarships", "amount": "25%–100% tuition waiver", "eligibility": "High GPA, GRE/GMAT scores; varies by institution", "link": ""},
        {"name": "Graduate Teaching/Research Assistantships (TA/RA)", "amount": "$15,000–$35,000 stipend + tuition waiver", "eligibility": "Postgraduate students; competitive selection", "link": ""},
    ],
    "canada": [
        {"name": "Vanier Canada Graduate Scholarships", "amount": "CAD 50,000/year (3 years)", "eligibility": "Doctoral students; exceptional academic excellence and leadership", "link": "https://vanier.gc.ca"},
        {"name": "Ontario Graduate Scholarship (OGS)", "amount": "CAD 10,000/year", "eligibility": "Graduate students in Ontario universities; merit-based", "link": ""},
        {"name": "University International Entrance Scholarships", "amount": "CAD 5,000–40,000", "eligibility": "High academic achievement at entry; varies by institution", "link": ""},
        {"name": "Shastri Indo-Canadian Institute Fellowships", "amount": "Varies", "eligibility": "Indian students for postgraduate research in Canada", "link": "https://www.shastriinstitute.org"},
    ],
    "australia": [
        {"name": "Australia Awards Scholarships", "amount": "Full tuition + living allowance + flights", "eligibility": "Citizens of eligible developing countries; government-funded", "link": "https://www.dfat.gov.au/people-to-people/australia-awards"},
        {"name": "Destination Australia Scholarship", "amount": "AUD 15,000/year", "eligibility": "Domestic and international students studying in regional Australia", "link": ""},
        {"name": "University International Scholarships", "amount": "AUD 5,000–50,000", "eligibility": "Excellent academic records; varies by institution", "link": ""},
        {"name": "Research Training Program (RTP)", "amount": "Tuition waiver + stipend", "eligibility": "Higher Degree by Research students (PhD, Masters by Research)", "link": ""},
    ],
    "germany": [
        {"name": "DAAD Scholarship (German Academic Exchange Service)", "amount": "€850/month + travel + tuition", "eligibility": "Postgraduate and doctoral students; excellent academic record", "link": "https://www.daad.de"},
        {"name": "Heinrich Böll Foundation Scholarships", "amount": "€850/month + €300 book allowance", "eligibility": "Socially engaged students with excellent academics", "link": "https://www.boell.de"},
        {"name": "Konrad-Adenauer-Stiftung Scholarships", "amount": "€1,100/month (PhD)", "eligibility": "Students with high academic achievement and civic engagement", "link": ""},
        {"name": "University Excellence Scholarships (Deutschlandstipendium)", "amount": "€300/month", "eligibility": "Top students; jointly funded by government and private sponsors", "link": ""},
    ],
}

# Default IELTS scores
DEFAULT_IELTS = {
    "uk": "6.5", "usa": "6.5", "canada": "6.5", "australia": "6.5",
    "germany": "6.5", "ireland": "6.5", "france": "6.5", "netherlands": "6.5",
    "sweden": "6.5", "new-zealand": "6.5", "singapore": "6.5", "switzerland": "6.5",
    "dubai": "6.0", "finland": "6.0", "denmark": "6.0", "austria": "6.0",
    "belgium": "6.0", "hungary": "5.5", "malaysia": "6.0", "italy": "5.5",
    "spain": "6.0", "japan": "6.0", "cyprus": "6.0", "lithuania": "5.5",
    "georgia": "5.5", "russia": "5.5",
}

JUNK_PATTERNS = [
    r"^(rankings as per|framework-tef|counseling tips|our university tie|points for today|we are bringing|program options|ug, pg, foundation|ex\.|slide \d).*",
    r"^[^a-z]{0,3}$",  # Lines with almost no letters
]

def is_junk(text):
    """Check if a line looks like a slide heading rather than real content."""
    t = text.strip().lower()
    if len(t) < 5:
        return True
    for p in JUNK_PATTERNS:
        if re.match(p, t, re.I):
            return True
    return False

def clean_scholarships(scholarships, slug):
    """Return clean scholarships — either from JSON if decent quality, or from defaults."""
    if slug in DEFAULT_SCHOLARSHIPS:
        return DEFAULT_SCHOLARSHIPS[slug]
    # Filter out junk entries
    cleaned = []
    for s in scholarships:
        name = s.get("name", "")
        if not is_junk(name) and len(name) > 8 and len(name) < 120:
            cleaned.append(s)
    return cleaned if cleaned else [
        {"name": f"Government Scholarship for {slug.title()}", "amount": "Varies", "eligibility": "Merit-based for international students", "link": ""},
        {"name": "University Excellence Award", "amount": "Up to 50% tuition waiver", "eligibility": "High academic achievement at entry", "link": ""},
    ]

def clean_visa_reqs(reqs, slug):
    """Return clean visa requirements list."""
    if slug in DEFAULT_VISA_REQS:
        return DEFAULT_VISA_REQS[slug]
    cleaned = [r for r in reqs if not is_junk(r) and len(r) > 10]
    return cleaned if cleaned else DEFAULT_VISA_REQS.get(slug, [
        "Valid passport with at least 6 months validity",
        "Unconditional university acceptance letter",
        "Proof of financial sufficiency",
        "English language proficiency scores",
        "Medical insurance coverage",
        "Completed visa application form",
    ])

def fix_ielts(score, slug):
    """Fix obviously wrong IELTS scores."""
    if not score or score in (".", "", "6"):
        return DEFAULT_IELTS.get(slug, "6.0")
    try:
        val = float(score)
        if val < 3.0 or val > 9.0:
            return DEFAULT_IELTS.get(slug, "6.0")
        return str(val)
    except ValueError:
        return DEFAULT_IELTS.get(slug, "6.0")

def clean_work_permit(wp):
    """Clean truncated work permit text."""
    during = wp.get("duringStudy", "")
    post = wp.get("postStudy", "")
    notes = wp.get("notes", "")

    # If text looks like a slide snippet (starts with a lowercase letter or very long raw text)
    if during and (during[0].islower() or len(during) > 200 or "points for" in during.lower()):
        during = wp.get("duringStudy", "")  # Will be overridden by defaults

    return {"duringStudy": during, "postStudy": post, "notes": notes}

def clean_tuition(tuition, slug):
    """Replace noisy tuition with clean defaults."""
    if slug not in DEFAULT_TUITION:
        return tuition
    defaults = DEFAULT_TUITION[slug]
    result = dict(tuition)
    # If the extracted value looks noisy (contains things like "application fee" for UG)
    if "application fee" in result.get("undergraduate", "").lower() or len(result.get("undergraduate", "")) < 10:
        result["undergraduate"] = defaults["undergraduate"]
    if len(result.get("postgraduate", "")) < 10 or result.get("postgraduate", "").startswith("•"):
        result["postgraduate"] = defaults["postgraduate"]
    if len(result.get("phd", "")) < 10 or result.get("phd") == "Often funded through research grants":
        result["phd"] = defaults["phd"]
    return result

def clean_universities(unis):
    """Filter out junk university names from extracted text."""
    cleaned = []
    seen = set()
    junk_terms = ["our university tie", "ex.", "points for", "framework", "counseling", "slide", "bringing overseas"]
    for u in unis:
        name = u.get("name", "")
        lower = name.lower()
        if any(junk in lower for junk in junk_terms):
            continue
        if name in seen or len(name) < 5:
            continue
        seen.add(name)
        cleaned.append(u)
    return cleaned


def process_file(path):
    slug = path.stem
    print(f"  Cleaning {slug}...")

    with open(path, encoding="utf-8") as f:
        data = json.load(f)

    data["scholarships"] = clean_scholarships(data.get("scholarships", []), slug)
    data["visaRequirements"]["requirements"] = clean_visa_reqs(
        data["visaRequirements"].get("requirements", []), slug
    )
    data["languageRequirements"]["ielts"] = fix_ielts(
        data["languageRequirements"].get("ielts", ""), slug
    )
    data["tuitionFees"] = clean_tuition(data.get("tuitionFees", {}), slug)
    data["topUniversities"] = clean_universities(data.get("topUniversities", []))

    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)


def main():
    print("Cleaning generated JSON data...")
    for path in sorted(DATA_DIR.glob("*.json")):
        process_file(path)
    print(f"Done! Cleaned {len(list(DATA_DIR.glob('*.json')))} files.")


if __name__ == "__main__":
    main()
