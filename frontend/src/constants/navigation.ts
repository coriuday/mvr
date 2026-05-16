// =============================================================================
// Navigation constants
// =============================================================================

export const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "About Us", href: "/about" },
  {
    label: "Study Abroad",
    href: "/countries",
    children: [
      { label: "USA", href: "/countries/usa" },
      { label: "UK", href: "/countries/uk" },
      { label: "Canada", href: "/countries/canada" },
      { label: "Australia", href: "/countries/australia" },
      { label: "Germany", href: "/countries/germany" },
      { label: "Ireland", href: "/countries/ireland" },
      { label: "All Countries", href: "/countries" },
    ],
  },
  { label: "Services", href: "/services" },
  { label: "Scholarships", href: "/scholarships" },
  { label: "Universities", href: "/universities" },
  {
    label: "Visa",
    href: "/visa",
    children: [
      { label: "Student Visa", href: "/visa/student" },
      { label: "Visa Checklist", href: "/visa/checklist" },
    ],
  },
  { label: "Blogs", href: "/blogs" },
  { label: "Contact", href: "/contact" },
] as const;

export const FOOTER_QUICK_LINKS = [
  { label: "About Us", href: "/about" },
  { label: "Study Abroad", href: "/countries" },
  { label: "Universities", href: "/universities" },
  { label: "Services", href: "/services" },
  { label: "Visa Assistance", href: "/visa" },
  { label: "Contact Us", href: "/contact" },
];

export const FOOTER_STUDY_ABROAD = [
  { label: "Countries", href: "/countries" },
  { label: "USA", href: "/countries/usa" },
  { label: "Canada", href: "/countries/canada" },
  { label: "Courses", href: "/courses" },
  { label: "Scholarships", href: "/scholarships" },
  { label: "Student Resources", href: "/resources" },
  { label: "Blogs", href: "/blogs" },
];

export const FOOTER_SUPPORT = [
  { label: "FAQ", href: "/faq" },
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms & Conditions", href: "/terms" },
  { label: "Refund Policy", href: "/refund" },
  { label: "Sitemap", href: "/sitemap.xml" },
];

export const CONTACT_INFO = {
  // Primary phones (both numbers from visiting cards)
  phone: "+91 99669 03884",
  phoneAlt: "+91 85999 99331",

  // Primary email (Hyderabad office)
  email: "mvrconsultantshyd@gmail.com",
  emailGuntur: "mvroverseasconsultancy@gmail.com",

  // Website
  website: "www.mvrconsultants.com",

  // Managing Director
  md: "Mukkapati Veeranjaneyulu",

  // Hyderabad office
  address: "H No 15-31-27, Dharma Reddy Colony, Ph 1 MRO Office Lane, KPHB Colony, Hyderabad – 500 072",

  // Guntur office
  addressGuntur: "D. No: 3-28-41/5, 1st Floor, 4th Line Brundavan Gardens, Y5 Mall Beside Road, Opp. Yaganti Pearls Apartment, Guntur – 522006",

  socialMedia: {
    facebook: "https://facebook.com/mvrconsultants",
    instagram: "https://instagram.com/mvrconsultants",
    linkedin: "https://linkedin.com/company/mvrconsultants",
    youtube: "https://youtube.com/mvrconsultants",
  },
};

