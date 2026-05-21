"use client";

import Link from "next/link";
import Image from "next/image";
import { Phone, Mail, MapPin, ArrowRight } from "lucide-react";
import { SiFacebook, SiInstagram, SiYoutube } from "@icons-pack/react-simple-icons";
import {
  CONTACT_INFO,
  FOOTER_QUICK_LINKS,
  FOOTER_STUDY_ABROAD,
  FOOTER_SUPPORT,
} from "@/constants/navigation";

// LinkedIn not available in this simple-icons version — inline SVG matches the official shape
function IconLinkedin() {
  return (
    <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect x="2" y="9" width="4" height="12" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}

const socialLinks = [
  { icon: <SiFacebook  size={16} />, label: "Facebook",  href: CONTACT_INFO.socialMedia.facebook,  color: "hover:text-blue-600",  border: "hover:border-blue-400"  },
  { icon: <SiInstagram size={16} />, label: "Instagram", href: CONTACT_INFO.socialMedia.instagram, color: "hover:text-pink-600",  border: "hover:border-pink-400"  },
  { icon: <IconLinkedin />,          label: "LinkedIn",  href: CONTACT_INFO.socialMedia.linkedin,  color: "hover:text-sky-600",   border: "hover:border-sky-400"   },
  { icon: <SiYoutube   size={16} />, label: "YouTube",   href: CONTACT_INFO.socialMedia.youtube,   color: "hover:text-red-600",   border: "hover:border-red-400"   },
];

// ─── Sitemap data ─────────────────────────────────────────────────────────────
const SITEMAP = [
  {
    title: "Main Pages",
    links: [
      { label: "Home", href: "/" },
      { label: "About Us", href: "/about" },
      { label: "Services", href: "/services" },
      { label: "Scholarships", href: "/scholarships" },
      { label: "Universities", href: "/universities" },
      { label: "Blogs", href: "/blogs" },
      { label: "Contact Us", href: "/contact" },
    ],
  },
  {
    title: "Study Abroad",
    links: [
      { label: "All Countries", href: "/countries" },
      { label: "USA", href: "/countries/usa" },
      { label: "UK", href: "/countries/uk" },
      { label: "Canada", href: "/countries/canada" },
      { label: "Australia", href: "/countries/australia" },
      { label: "Germany", href: "/countries/germany" },
      { label: "Ireland", href: "/countries/ireland" },
    ],
  },
  {
    title: "Visa & Resources",
    links: [
      { label: "Visa Assistance", href: "/visa" },
      { label: "Student Visa", href: "/visa/student" },
      { label: "Visa Checklist", href: "/visa/checklist" },
      { label: "Courses", href: "/courses" },
      { label: "Student Resources", href: "/resources" },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "FAQ", href: "/faq" },
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms & Conditions", href: "/terms" },
      { label: "Refund Policy", href: "/refund" },
    ],
  },
];

// ─── Footer column component ──────────────────────────────────────────────────
function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: { label: string; href: string }[];
}) {
  return (
    <div>
      <h4 className="text-white font-bold text-sm mb-4 uppercase tracking-wider">
        {title}
      </h4>
      <ul className="space-y-2">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="text-white/60 hover:text-[#c9a84c] text-sm transition-colors duration-150 flex items-center gap-1.5 group"
            >
              <ArrowRight
                size={11}
                className="opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0 transition-all duration-150"
              />
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ─── Main footer ──────────────────────────────────────────────────────────────
export default function SiteFooter() {
  return (
    <footer className="bg-[#0f1c3d]">
      {/* Main footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-16 pb-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10">

          {/* Brand column */}
          <div className="lg:col-span-2">
            {/* Logo — same clipping approach as navbar, inverted white for dark bg */}
            <Link href="/" className="flex items-center shrink-0 mb-5">
              <div
                style={{
                  width: "260px",
                  height: "95px",
                  overflow: "hidden",
                  position: "relative",
                  flexShrink: 0,
                }}
              >
                <Image
                  src="/favicon-removebg-preview.png"
                  alt="MVR Consultants — Abroad Education"
                  width={1536}
                  height={1024}
                  style={{
                    width: "245px",
                    height: "163px",
                    position: "absolute",
                    top: "-31px",
                    left: "0",
                    filter: "brightness(0) invert(1)",
                  }}
                  unoptimized
                  priority
                />
              </div>
            </Link>

            <p className="text-white/55 text-sm leading-relaxed mb-6 max-w-sm">
              Empowering students to achieve their dream of studying abroad
              with expert guidance on admissions, visas, scholarships, and
              more. 15+ years of trust.
            </p>

            {/* Social media buttons */}
            <div className="flex items-center gap-3 mb-7">
              {socialLinks.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  title={s.label}
                  className={`w-9 h-9 rounded-lg bg-white border border-white/20 flex items-center justify-center text-gray-500 shadow-sm transition-all duration-200 hover:scale-110 ${s.color} ${s.border}`}
                >
                  {s.icon}
                </a>
              ))}
            </div>

            {/* Contact info */}
            <div className="space-y-3">
              <a
                href={`tel:${CONTACT_INFO.phone}`}
                className="flex items-center gap-3 text-white/60 hover:text-white text-sm transition-colors group"
              >
                <span className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shrink-0 group-hover:bg-[#c9a84c] transition-colors">
                  <Phone size={13} />
                </span>
                {CONTACT_INFO.phone}
              </a>
              <a
                href={`mailto:${CONTACT_INFO.email}`}
                className="flex items-center gap-3 text-white/60 hover:text-white text-sm transition-colors group"
              >
                <span className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shrink-0 group-hover:bg-[#c9a84c] transition-colors">
                  <Mail size={13} />
                </span>
                {CONTACT_INFO.email}
              </a>
              <div className="flex items-start gap-3 text-white/60 text-sm">
                <span className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shrink-0 mt-0.5">
                  <MapPin size={13} />
                </span>
                {CONTACT_INFO.address}
              </div>
            </div>
          </div>

          {/* Link columns */}
          <FooterColumn title="Quick Links" links={FOOTER_QUICK_LINKS} />
          <FooterColumn title="Study Abroad" links={FOOTER_STUDY_ABROAD} />
          <FooterColumn title="Support" links={FOOTER_SUPPORT} />
        </div>
      </div>

      {/* ── Sitemap section ── */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
          <h3 className="text-white/40 text-xs font-bold uppercase tracking-[0.2em] mb-6">
            Site Map
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            {SITEMAP.map((section) => (
              <div key={section.title}>
                <p className="text-white/30 text-[10px] font-bold uppercase tracking-widest mb-3">
                  {section.title}
                </p>
                <ul className="space-y-1.5">
                  {section.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="text-white/25 hover:text-[#c9a84c] text-xs transition-colors duration-150"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-white/40 text-xs text-center">
            © {new Date().getFullYear()} MVR Consultants. All rights reserved.
          </p>
          <p className="text-white/30 text-xs">
            Crafted with ❤️ for aspiring students worldwide
          </p>
        </div>
      </div>
    </footer>
  );
}
