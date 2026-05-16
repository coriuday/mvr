"use client";

import Link from "next/link";
import { Phone, Mail, MapPin, Globe, ArrowRight } from "lucide-react";
import {
  CONTACT_INFO,
  FOOTER_QUICK_LINKS,
  FOOTER_STUDY_ABROAD,
  FOOTER_SUPPORT,
} from "@/constants/navigation";

const SOCIALS = [
  { short: "f",  name: "Facebook",  href: CONTACT_INFO.socialMedia.facebook  },
  { short: "ig", name: "Instagram", href: CONTACT_INFO.socialMedia.instagram },
  { short: "in", name: "LinkedIn",  href: CONTACT_INFO.socialMedia.linkedin  },
  { short: "yt", name: "YouTube",   href: CONTACT_INFO.socialMedia.youtube   },
];

function FooterColumn({ title, links }: { title: string; links: { label: string; href: string }[] }) {
  return (
    <div>
      <h4 className="text-white font-bold text-sm mb-4 uppercase tracking-wider">{title}</h4>
      <ul className="space-y-2">
        {links.map((link) => (
          <li key={link.href}>
            <Link href={link.href}
              className="text-white/60 hover:text-[#c9a84c] text-sm transition-colors duration-150 flex items-center gap-1.5 group">
              <ArrowRight size={11} className="opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0 transition-all duration-150" />
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-16 pb-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10">

          {/* Brand column */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-[#c9a84c]/20 rounded-xl flex items-center justify-center">
                <span className="text-[#c9a84c] font-black text-lg">MVR</span>
              </div>
              <div>
                <p className="text-white font-bold text-base leading-tight">MVR CONSULTANTS</p>
                <p className="text-[#c9a84c] text-[10px] tracking-[0.15em] uppercase">Overseas Education · Immigration</p>
              </div>
            </Link>
            <p className="text-white/55 text-sm leading-relaxed mb-5 max-w-sm">
              Empowering students to achieve their dream of studying abroad with expert guidance on
              admissions, visas, and scholarships. Offices in Hyderabad & Guntur.
            </p>

            {/* Social media */}
            <div className="flex items-center gap-3 mb-6">
              {SOCIALS.map((s) => (
                <a key={s.name} href={s.href} target="_blank" rel="noopener noreferrer"
                  aria-label={s.name} title={s.name}
                  className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-white/70 hover:bg-[#c9a84c] hover:text-white transition-all duration-200 text-xs font-bold uppercase">
                  {s.short}
                </a>
              ))}
            </div>

            {/* Contact info */}
            <div className="space-y-3">
              <a href={`tel:+919966903884`}
                className="flex items-center gap-3 text-white/60 hover:text-white text-sm transition-colors group">
                <span className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shrink-0 group-hover:bg-[#c9a84c] transition-colors">
                  <Phone size={13} />
                </span>
                <span>
                  <span className="block">{CONTACT_INFO.phone}</span>
                  <span className="text-white/40 text-xs">{CONTACT_INFO.phoneAlt}</span>
                </span>
              </a>
              <a href={`mailto:${CONTACT_INFO.email}`}
                className="flex items-center gap-3 text-white/60 hover:text-white text-sm transition-colors group">
                <span className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shrink-0 group-hover:bg-[#c9a84c] transition-colors">
                  <Mail size={13} />
                </span>
                <span>
                  <span className="block">{CONTACT_INFO.email}</span>
                  <span className="text-white/40 text-xs">{CONTACT_INFO.emailGuntur}</span>
                </span>
              </a>
              <div className="flex items-start gap-3 text-white/60 text-sm">
                <span className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shrink-0 mt-0.5">
                  <MapPin size={13} />
                </span>
                <div>
                  <p className="text-white/40 text-xs uppercase tracking-wider mb-0.5">Hyderabad</p>
                  <p>{CONTACT_INFO.address}</p>
                  <p className="text-white/40 text-xs uppercase tracking-wider mt-2 mb-0.5">Guntur</p>
                  <p className="text-white/50 text-xs">{CONTACT_INFO.addressGuntur}</p>
                </div>
              </div>
              <a href={`https://${CONTACT_INFO.website}`} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-3 text-white/60 hover:text-[#c9a84c] text-sm transition-colors group">
                <span className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shrink-0 group-hover:bg-[#c9a84c] transition-colors">
                  <Globe size={13} />
                </span>
                {CONTACT_INFO.website}
              </a>
            </div>
          </div>

          {/* Nav columns */}
          <FooterColumn title="Quick Links"  links={FOOTER_QUICK_LINKS}  />
          <FooterColumn title="Study Abroad" links={FOOTER_STUDY_ABROAD} />
          <FooterColumn title="Support"      links={FOOTER_SUPPORT}      />
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-white/40 text-xs text-center">
            © {new Date().getFullYear()} MVR Consultants. All rights reserved. · MD: {CONTACT_INFO.md}
          </p>
          <p className="text-white/25 text-xs">Crafted with ❤️ for aspiring students worldwide</p>
        </div>
      </div>
    </footer>
  );
}
