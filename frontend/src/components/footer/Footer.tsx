"use client";

import Link from "next/link";
import Image from "next/image";
import { Phone, Mail, MapPin, ArrowRight } from "lucide-react";
import {
  CONTACT_INFO,
  FOOTER_QUICK_LINKS,
  FOOTER_STUDY_ABROAD,
  FOOTER_SUPPORT,
} from "@/constants/navigation";

// Social platforms — text labels only (lucide-react has no brand icons)
const SOCIALS = [
  { short: "f", name: "Facebook", href: CONTACT_INFO.socialMedia.facebook },
  { short: "ig", name: "Instagram", href: CONTACT_INFO.socialMedia.instagram },
  { short: "in", name: "LinkedIn", href: CONTACT_INFO.socialMedia.linkedin },
  { short: "yt", name: "YouTube", href: CONTACT_INFO.socialMedia.youtube },
];

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

export default function SiteFooter() {
  return (
    <footer className="bg-[#0f1c3d]">
      {/* Main footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-16 pb-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand column */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-3 mb-5">
              <Image
                src="/web-app-manifest-192x192.png"
                alt="MVR Consultants"
                width={48}
                height={48}
                className="rounded-xl"
              />
              <div>
                <p className="text-white font-bold text-base leading-tight">
                  MVR CONSULTANTS
                </p>
                <p className="text-[#c9a84c] text-[10px] tracking-[0.2em] uppercase">
                  Abroad Education
                </p>
              </div>
            </Link>
            <p className="text-white/55 text-sm leading-relaxed mb-6 max-w-sm">
              Empowering students to achieve their dream of studying abroad
              with expert guidance on admissions, visas, scholarships, and
              more. 15+ years of trust.
            </p>

            {/* Social media buttons */}
            <div className="flex items-center gap-3 mb-7">
              {SOCIALS.map((s) => (
                <a
                  key={s.name}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.name}
                  title={s.name}
                  className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-white/70 hover:bg-[#c9a84c] hover:text-white transition-all duration-200 text-xs font-bold uppercase"
                >
                  {s.short}
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
