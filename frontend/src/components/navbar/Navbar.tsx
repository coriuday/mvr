"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ChevronDown, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NAV_LINKS, CONTACT_INFO } from "@/constants/navigation";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────
type NavChild = { label: string; href: string };
type NavItem = {
  label: string;
  href: string;
  children?: ReadonlyArray<NavChild>;
};

// ─── Dropdown menu ─────────────────────────────────────────────────────────────
function NavDropdown({
  item,
  onClose,
}: {
  item: NavItem;
  onClose: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 8, scale: 0.96 }}
      transition={{ duration: 0.18, ease: "easeOut" }}
      className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-52 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-50"
    >
      {item.children?.map((child) => (
        <Link
          key={child.href}
          href={child.href}
          onClick={onClose}
          className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-[#f8f4ec] hover:text-[#1a2f5e] font-medium transition-colors duration-150 border-b border-gray-50 last:border-0"
        >
          {child.label}
        </Link>
      ))}
    </motion.div>
  );
}

// ─── Desktop nav item ──────────────────────────────────────────────────────────
function DesktopNavItem({
  item,
  scrolled,
}: {
  item: NavItem;
  scrolled: boolean;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const textClass = scrolled
    ? "text-gray-700 hover:text-[#1a2f5e]"
    : "text-white/90 hover:text-white";

  if (!item.children) {
    return (
      <Link
        href={item.href}
        className={cn(
          "text-sm font-medium transition-colors duration-200 whitespace-nowrap",
          textClass
        )}
      >
        {item.label}
      </Link>
    );
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "flex items-center gap-1 text-sm font-medium transition-colors duration-200 whitespace-nowrap",
          textClass
        )}
      >
        {item.label}
        <ChevronDown
          size={14}
          className={cn(
            "transition-transform duration-200",
            open && "rotate-180"
          )}
        />
      </button>
      <AnimatePresence>
        {open && (
          <NavDropdown item={item} onClose={() => setOpen(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Main Navbar ───────────────────────────────────────────────────────────────
export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileExpanded, setMobileExpanded] = useState<string | null>(null);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 20);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  return (
    <>
      {/* ── Top bar ── */}
      <div className="hidden lg:block bg-[#1a2f5e] text-white/80 text-xs py-1.5">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <span>🎓 Your Dream. Our Guidance. — Study Abroad Experts</span>
          <div className="flex items-center gap-6">
            <a
              href={`tel:${CONTACT_INFO.phone.replace(/\s/g, "")}`}
              className="flex items-center gap-1.5 hover:text-white transition-colors"
            >
              <Phone size={12} />
              {CONTACT_INFO.phone}
            </a>
            <a
              href={`mailto:${CONTACT_INFO.email}`}
              className="hover:text-white transition-colors"
            >
              {CONTACT_INFO.email}
            </a>
          </div>
        </div>
      </div>

      {/* ── Main navbar ── */}
      <motion.header
        className={cn(
          "sticky top-0 z-40 transition-all duration-300",
          scrolled
            ? "bg-white/95 backdrop-blur-md shadow-md border-b border-gray-100"
            : "bg-[#1a2f5e]"
        )}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16 lg:h-[70px]">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 shrink-0">
              <Image
                src="/web-app-manifest-192x192.png"
                alt="MVR Consultants"
                width={44}
                height={44}
                className="rounded-xl"
                priority
              />
              <div className="hidden sm:block">
                <p
                  className={cn(
                    "font-bold text-base leading-tight transition-colors duration-300",
                    scrolled ? "text-[#1a2f5e]" : "text-white"
                  )}
                >
                  MVR CONSULTANTS
                </p>
                <p
                  className={cn(
                    "text-[9px] tracking-[0.18em] uppercase transition-colors duration-300",
                    scrolled ? "text-[#c9a84c]" : "text-[#c9a84c]"
                  )}
                >
                  Abroad Education
                </p>
              </div>
            </Link>

            {/* Desktop nav */}
            <nav className="hidden xl:flex items-center gap-5">
              {(NAV_LINKS as unknown as NavItem[]).map((item) => (
                <DesktopNavItem key={item.href} item={item} scrolled={scrolled} />
              ))}
            </nav>

            {/* CTA + hamburger */}
            <div className="flex items-center gap-3">
              <Link href="/contact" className="hidden md:block">
                <Button
                  size="sm"
                  className="bg-[#c9a84c] hover:bg-[#a07a2e] text-white font-semibold px-5 rounded-full shadow-lg shadow-yellow-900/20 transition-all duration-200"
                >
                  Apply Now →
                </Button>
              </Link>
              {/* Hamburger */}
              <button
                onClick={() => setMobileOpen((o) => !o)}
                className={cn(
                  "xl:hidden p-2 rounded-lg transition-colors",
                  scrolled
                    ? "text-gray-700 hover:bg-gray-100"
                    : "text-white hover:bg-white/10"
                )}
                aria-label="Toggle menu"
              >
                {mobileOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>
          </div>
        </div>

        {/* ── Mobile menu ── */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className="xl:hidden bg-white border-t border-gray-100 shadow-xl overflow-y-auto max-h-[calc(100vh-70px)]"
            >
              <div className="px-4 py-3 space-y-1">
                {(NAV_LINKS as unknown as NavItem[]).map((item) => (
                  <div key={item.href}>
                    {item.children ? (
                      <>
                        <button
                          onClick={() =>
                            setMobileExpanded((p) =>
                              p === item.label ? null : item.label
                            )
                          }
                          className="w-full flex items-center justify-between px-3 py-2.5 text-sm font-semibold text-gray-700 rounded-lg hover:bg-gray-50"
                        >
                          {item.label}
                          <ChevronDown
                            size={15}
                            className={cn(
                              "transition-transform duration-200",
                              mobileExpanded === item.label && "rotate-180"
                            )}
                          />
                        </button>
                        <AnimatePresence>
                          {mobileExpanded === item.label && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                              className="overflow-hidden ml-3 border-l-2 border-[#c9a84c]/30 pl-3"
                            >
                              {item.children.map((child) => (
                                <Link
                                  key={child.href}
                                  href={child.href}
                                  onClick={() => setMobileOpen(false)}
                                  className="block py-2 text-sm text-gray-600 hover:text-[#1a2f5e] font-medium"
                                >
                                  {child.label}
                                </Link>
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </>
                    ) : (
                      <Link
                        href={item.href}
                        onClick={() => setMobileOpen(false)}
                        className="block px-3 py-2.5 text-sm font-semibold text-gray-700 rounded-lg hover:bg-gray-50 hover:text-[#1a2f5e]"
                      >
                        {item.label}
                      </Link>
                    )}
                  </div>
                ))}
                <div className="pt-3 pb-2">
                  <Link href="/contact" onClick={() => setMobileOpen(false)}>
                    <Button className="w-full bg-[#c9a84c] hover:bg-[#a07a2e] text-white font-bold rounded-full">
                      Apply Now →
                    </Button>
                  </Link>
                </div>
                <div className="py-3 border-t border-gray-100 space-y-2">
                  <p className="text-xs text-gray-400 font-medium px-3">Contact Us</p>
                  <a
                    href={`tel:${CONTACT_INFO.phone}`}
                    className="block px-3 py-1.5 text-sm text-[#1a2f5e] font-medium"
                  >
                    📞 {CONTACT_INFO.phone}
                  </a>
                  <a
                    href={`mailto:${CONTACT_INFO.email}`}
                    className="block px-3 py-1.5 text-sm text-[#1a2f5e] font-medium"
                  >
                    ✉️ {CONTACT_INFO.email}
                  </a>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>
    </>
  );
}
