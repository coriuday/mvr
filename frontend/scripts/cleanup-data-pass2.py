#!/usr/bin/env python3
"""
cleanup-data-pass2.py
Second-pass cleanup: fixes remaining data quality issues not handled in pass 1.
- Fixes truncated/noisy workPermit text using proper defaults
- Fixes tuition that's still noisy (APS text for Germany, SDS text for Canada)
- Removes generic junk university entries ("Community Colleges", "Private Colleges", etc.)
- Fixes IELTS where it's too low (< 5.5 = likely wrong)
- Fixes capitalisation of "Mba" -> "MBA", "Ai" -> "AI"
"""

import json
import re
from pathlib import Path

DATA_DIR = Path(__file__).parent.parent / "src" / "data" / "countries"

# Full work permit defaults for all countries
WORK_PERMIT_DEFAULTS = {
    "australia": {
        "duringStudy": "Up to 48 hours per fortnight during semester; unlimited hours during scheduled breaks",
        "postStudy": "2–4 years Graduate Visa (Subclass 485); duration depends on level and location of study",
        "notes": "Regional study boosts post-study work rights by 1–2 extra years",
    },
    "austria": {
        "duringStudy": "Up to 20 hours per week during term time",
        "postStudy": "12-month job-seeker residence permit; Red-White-Red card for qualified graduates",
        "notes": "",
    },
    "belgium": {
        "duringStudy": "Up to 20 hours per week during term; full-time during holidays",
        "postStudy": "12-month job-search permit for graduates",
        "notes": "",
    },
    "canada": {
        "duringStudy": "Up to 24 hours per week off-campus; unlimited on-campus during semester; full-time during scheduled breaks",
        "postStudy": "Post-Graduation Work Permit (PGWP) for up to 3 years (equal to study duration)",
        "notes": "PGWP is a direct pathway to Canadian Permanent Residency (Express Entry)",
    },
    "cyprus": {
        "duringStudy": "Up to 20 hours per week during term",
        "postStudy": "Temporary residence extension available for job-seeking graduates",
        "notes": "",
    },
    "denmark": {
        "duringStudy": "Up to 20 hours per week during term; full-time in June, July, August",
        "postStudy": "2-year Establishment Card (job-seeker permit) for graduates",
        "notes": "",
    },
    "dubai": {
        "duringStudy": "Part-time work permitted with No-Objection Certificate (NOC) from institution",
        "postStudy": "2-year Graduate Visa available; Employment visa through employer sponsorship",
        "notes": "",
    },
    "finland": {
        "duringStudy": "Up to 25 hours per week during term; full-time during holidays",
        "postStudy": "Up to 2 years extended residence permit for job-seeking after graduation",
        "notes": "",
    },
    "france": {
        "duringStudy": "Up to 964 hours per year (approximately 20 hours per week)",
        "postStudy": "APS Visa: 1 year to find work in France after graduation",
        "notes": "",
    },
    "georgia": {
        "duringStudy": "No official restriction on working hours for students",
        "postStudy": "Temporary residence permit available for graduates",
        "notes": "Low cost of living; growing tech sector with increasing job opportunities",
    },
    "germany": {
        "duringStudy": "120 full days or 240 half-days per year (approx. 20 hours/week); €8–12/hour typical wage",
        "postStudy": "18-month job-seeker visa (Aufenthaltserlaubnis zur Arbeitssuche)",
        "notes": "Opportunity Card (Chancenkarte) available for skilled graduates seeking German employment",
    },
    "hungary": {
        "duringStudy": "Up to 24 hours per week during semester",
        "postStudy": "9-month job-seeker residence permit after graduation",
        "notes": "",
    },
    "ireland": {
        "duringStudy": "Up to 20 hours per week during term; up to 40 hours per week during summer (June–September)",
        "postStudy": "1–2 years Stay Back Option (SBOT): 2 years for degree graduates, 1 year for others",
        "notes": "Ireland is the only English-speaking EU country — ideal for EU career access",
    },
    "italy": {
        "duringStudy": "Up to 20 hours per week",
        "postStudy": "12-month job-seeker permit after graduation",
        "notes": "",
    },
    "japan": {
        "duringStudy": "Up to 28 hours per week with official permission from immigration",
        "postStudy": "Designated Activities visa for job-hunting (up to 1 year, extendable once)",
        "notes": "",
    },
    "lithuania": {
        "duringStudy": "Up to 20 hours per week during term",
        "postStudy": "Temporary residence permit for 6–12 months after graduation",
        "notes": "",
    },
    "malaysia": {
        "duringStudy": "Up to 20 hours per week during official holidays only",
        "postStudy": "Graduate Employment Pass available; Malaysia My Second Home (MM2H) for long-term stay",
        "notes": "",
    },
    "netherlands": {
        "duringStudy": "Up to 16 hours per week during term; full-time in June, July, August",
        "postStudy": "1-year Orientation Year (Zoekjaar) visa for graduates of Dutch or top-100 QS universities",
        "notes": "",
    },
    "new-zealand": {
        "duringStudy": "Up to 20 hours per week during term; full-time during scheduled breaks",
        "postStudy": "1–3 years Post-Study Work Visa (duration depends on level of qualification)",
        "notes": "",
    },
    "russia": {
        "duringStudy": "Part-time work with university permission",
        "postStudy": "Temporary work permit available for qualified graduates",
        "notes": "Low tuition and cost of living; Russian Government Scholarships widely available",
    },
    "singapore": {
        "duringStudy": "Up to 16 hours per week during term time",
        "postStudy": "Employment Pass or S Pass available for graduates meeting eligibility criteria",
        "notes": "",
    },
    "spain": {
        "duringStudy": "Up to 30 hours per week",
        "postStudy": "1-year job-seeker residence authorization after graduation",
        "notes": "",
    },
    "switzerland": {
        "duringStudy": "Up to 15 hours per week during term; full-time during holidays",
        "postStudy": "6-month residence permit to seek employment after graduation",
        "notes": "",
    },
    "sweden": {
        "duringStudy": "No official restriction on working hours during the study period",
        "postStudy": "1-year job-seeker residence permit after graduation",
        "notes": "",
    },
    "uk": {
        "duringStudy": "Up to 20 hours per week during term time; full-time during official vacation periods",
        "postStudy": "Graduate Route Visa: 2 years for degree graduates; 3 years for PhD graduates",
        "notes": "No IELTS required for the Graduate Route if already on a Student Visa",
    },
    "usa": {
        "duringStudy": "Up to 20 hours per week on-campus; Curricular Practical Training (CPT) for off-campus internships",
        "postStudy": "Optional Practical Training (OPT): 1 year; STEM OPT Extension: additional 24 months (total 3 years)",
        "notes": "H-1B visa lottery is the primary long-term path to US employment authorization",
    },
}

# Proper tuition defaults for countries where extracted text is clearly wrong
TUITION_OVERRIDES = {
    "canada": {
        "undergraduate": "CAD 15,000–40,000 per year (varies by province and program)",
        "postgraduate": "CAD 12,000–35,000 per year; MBA programs CAD 30,000–60,000",
        "phd": "CAD 7,000–25,000 per year; many positions include research funding",
    },
    "germany": {
        "undergraduate": "€0 tuition at public universities (semester administration fee of €150–€350 only)",
        "postgraduate": "€0 at most public universities; €5,000–€20,000 at private institutions",
        "phd": "Free at public universities; doctoral candidates often receive a monthly stipend",
    },
}

# Programs that need capitalisation fixes
PROGRAM_FIXES = {"Mba": "MBA", "Ai": "AI", "It": "IT", "Phd": "PhD", "Ug": "UG", "Pg": "PG"}

# Junk university name patterns to filter out
UNI_JUNK_PATTERNS = [
    r"^community college",
    r"^private college",
    r"^successfully completing",
    r"^colleges of art",
    r"^university of applied sciences \/ fachhochschule$",
    r"^technical university \/ universitat$",
    r"^state universities$",
    r"^private universities$",
    r"^public universities$",
]

def is_junk_uni(name: str) -> bool:
    lower = name.lower().strip()
    return any(re.match(p, lower) for p in UNI_JUNK_PATTERNS)

def fix_programs(programs: list) -> list:
    fixed = []
    for p in programs:
        fixed.append(PROGRAM_FIXES.get(p, p))
    return fixed

def fix_ielts(score: str, slug: str) -> str:
    CORRECT = {
        "canada": "6.5", "uk": "6.5", "usa": "6.5", "australia": "6.5",
        "germany": "6.5", "ireland": "6.5", "france": "6.5",
    }
    try:
        val = float(score)
        if val < 5.5:
            return CORRECT.get(slug, "6.0")
    except (ValueError, TypeError):
        return CORRECT.get(slug, "6.0")
    return score

def process(path: Path):
    slug = path.stem
    with open(path, encoding="utf-8") as f:
        data = json.load(f)

    # Fix work permit
    if slug in WORK_PERMIT_DEFAULTS:
        wp = WORK_PERMIT_DEFAULTS[slug]
        # Only override if current text looks truncated (ends mid-word, is very long, has noise)
        for field in ("duringStudy", "postStudy"):
            current = data["workPermit"].get(field, "")
            is_noisy = (
                len(current) > 180
                or current.endswith(("b", "e", "r", "n", "s", "d", "t"))
                and len(current) > 100
                and "." not in current[-20:]
            )
            if not current or is_noisy or current[0].islower():
                data["workPermit"][field] = wp[field]
        if wp["notes"] and not data["workPermit"].get("notes"):
            data["workPermit"]["notes"] = wp["notes"]
        elif wp["notes"]:
            data["workPermit"]["notes"] = wp["notes"]

    # Fix tuition
    if slug in TUITION_OVERRIDES:
        overrides = TUITION_OVERRIDES[slug]
        for field, value in overrides.items():
            current = data["tuitionFees"].get(field, "")
            # Override if still looks noisy
            if len(current) > 200 or "SDS" in current or "APS" in current or "Total Cost" in current:
                data["tuitionFees"][field] = value

    # Fix IELTS
    data["languageRequirements"]["ielts"] = fix_ielts(
        data["languageRequirements"].get("ielts", ""), slug
    )

    # Fix program capitalisation
    data["popularPrograms"] = fix_programs(data.get("popularPrograms", []))

    # Remove junk universities
    data["topUniversities"] = [
        u for u in data.get("topUniversities", [])
        if not is_junk_uni(u.get("name", ""))
    ]

    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

    print(f"  ✓ {slug}")


def main():
    print("Pass 2 cleanup...")
    for path in sorted(DATA_DIR.glob("*.json")):
        process(path)
    print("Done.")


if __name__ == "__main__":
    main()
