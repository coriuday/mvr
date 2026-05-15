// =============================================================================
// Countries — Popular study abroad destinations
// =============================================================================

export const POPULAR_COUNTRIES = [
  {
    id: "usa",
    name: "USA",
    flag: "🇺🇸",
    landmark: "Statue of Liberty",
    description: "Top-ranked universities, diverse culture, and strong job market.",
    href: "/countries/usa",
  },
  {
    id: "uk",
    name: "UK",
    flag: "🇬🇧",
    landmark: "Big Ben",
    description: "World-class education, rich history, and global career opportunities.",
    href: "/countries/uk",
  },
  {
    id: "canada",
    name: "Canada",
    flag: "🇨🇦",
    landmark: "CN Tower",
    description: "Affordable tuition, post-study work permits, and welcoming immigration.",
    href: "/countries/canada",
  },
  {
    id: "australia",
    name: "Australia",
    flag: "🇦🇺",
    landmark: "Sydney Opera House",
    description: "High quality of life, excellent universities, and vibrant student community.",
    href: "/countries/australia",
  },
  {
    id: "germany",
    name: "Germany",
    flag: "🇩🇪",
    landmark: "Brandenburg Gate",
    description: "Low tuition fees, strong engineering programs, and thriving economy.",
    href: "/countries/germany",
  },
  {
    id: "ireland",
    name: "Ireland",
    flag: "🇮🇪",
    landmark: "Cliffs of Moher",
    description: "English-speaking, EU access, and booming tech industry.",
    href: "/countries/ireland",
  },
] as const;

export const STATS = [
  { value: "15+", label: "Years of Excellence", icon: "Award" },
  { value: "50K+", label: "Students Guided", icon: "Users" },
  { value: "98%", label: "Visa Success Rate", icon: "CheckCircle" },
  { value: "100+", label: "Partner Universities", icon: "Building" },
  { value: "25+", label: "Countries", icon: "Globe" },
  { value: "4.9/5", label: "Google Rating", icon: "Star" },
] as const;
