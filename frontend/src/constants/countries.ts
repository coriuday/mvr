// =============================================================================
// Countries — All study abroad destinations (26 countries)
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

export const ALL_COUNTRIES = [
  { id: "usa",         name: "United States",  flag: "🇺🇸", tagline: "Hub of Innovation",          href: "/countries/usa" },
  { id: "uk",          name: "United Kingdom", flag: "🇬🇧", tagline: "Academic Excellence",         href: "/countries/uk" },
  { id: "canada",      name: "Canada",         flag: "🇨🇦", tagline: "Welcoming & Diverse",         href: "/countries/canada" },
  { id: "australia",   name: "Australia",      flag: "🇦🇺", tagline: "Global Opportunities",        href: "/countries/australia" },
  { id: "germany",     name: "Germany",        flag: "🇩🇪", tagline: "Engineering & Tech Hub",      href: "/countries/germany" },
  { id: "ireland",     name: "Ireland",        flag: "🇮🇪", tagline: "Europe's Silicon Valley",     href: "/countries/ireland" },
  { id: "france",      name: "France",         flag: "🇫🇷", tagline: "Culture Meets Excellence",    href: "/countries/france" },
  { id: "netherlands", name: "Netherlands",    flag: "🇳🇱", tagline: "Bicycle & Business Capital",  href: "/countries/netherlands" },
  { id: "sweden",      name: "Sweden",         flag: "🇸🇪", tagline: "Nordic Tech Pioneer",         href: "/countries/sweden" },
  { id: "new-zealand", name: "New Zealand",    flag: "🇳🇿", tagline: "Nature & Knowledge",          href: "/countries/new-zealand" },
  { id: "singapore",   name: "Singapore",      flag: "🇸🇬", tagline: "Asia's Global City",          href: "/countries/singapore" },
  { id: "switzerland", name: "Switzerland",    flag: "🇨🇭", tagline: "Precision & Excellence",      href: "/countries/switzerland" },
  { id: "dubai",       name: "Dubai (UAE)",    flag: "🇦🇪", tagline: "Future-Forward Education",    href: "/countries/dubai" },
  { id: "finland",     name: "Finland",        flag: "🇫🇮", tagline: "Nordic Innovation",           href: "/countries/finland" },
  { id: "denmark",     name: "Denmark",        flag: "🇩🇰", tagline: "Innovation & Design",         href: "/countries/denmark" },
  { id: "austria",     name: "Austria",        flag: "🇦🇹", tagline: "Alpine Academic Excellence",  href: "/countries/austria" },
  { id: "belgium",     name: "Belgium",        flag: "🇧🇪", tagline: "Heart of Europe",             href: "/countries/belgium" },
  { id: "hungary",     name: "Hungary",        flag: "🇭🇺", tagline: "Europe's Medical Capital",    href: "/countries/hungary" },
  { id: "malaysia",    name: "Malaysia",       flag: "🇲🇾", tagline: "Asia's Education Hub",        href: "/countries/malaysia" },
  { id: "italy",       name: "Italy",          flag: "🇮🇹", tagline: "Art, Culture & Academia",     href: "/countries/italy" },
  { id: "spain",       name: "Spain",          flag: "🇪🇸", tagline: "Sun, Culture & Study",        href: "/countries/spain" },
  { id: "japan",       name: "Japan",          flag: "🇯🇵", tagline: "Innovation Meets Tradition",  href: "/countries/japan" },
  { id: "cyprus",      name: "Cyprus",         flag: "🇨🇾", tagline: "Mediterranean Study Hub",     href: "/countries/cyprus" },
  { id: "lithuania",   name: "Lithuania",      flag: "🇱🇹", tagline: "Baltic Academic Hub",         href: "/countries/lithuania" },
  { id: "georgia",     name: "Georgia",        flag: "🇬🇪", tagline: "Affordable Gateway to EU",    href: "/countries/georgia" },
  { id: "russia",      name: "Russia",         flag: "🇷🇺", tagline: "Science & Heritage",          href: "/countries/russia" },
] as const;

export const STATS = [
  { value: "10",  label: "Years of Excellence",   icon: "Award" },
  { value: "5K+", label: "Students Guided",        icon: "Users" },
  { value: "98%",  label: "Visa Success Rate",      icon: "CheckCircle" },
  { value: "100+", label: "Partner Universities",   icon: "Building" },
  { value: "26+",  label: "Countries",              icon: "Globe" },
  { value: "4.7/5.0", label: "Google Rating",          icon: "Star" },
] as const;
