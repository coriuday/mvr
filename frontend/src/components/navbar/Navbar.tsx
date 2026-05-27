"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────
type NavChild = { label: string; href: string };
type NavItem = {
  label: string;
  href: string;
  children?: ReadonlyArray<NavChild>;
};

// Nav items matching target design
const NAV_ITEMS: NavItem[] = [
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
  { label: "Visa", href: "/visa" },
  { label: "Blogs", href: "/blogs" },
  { label: "Contact", href: "/contact" },
];

// ─── Dropdown menu ─────────────────────────────────────────────────────────────
function NavDropdown({
  item,
  onClose,
}: {
  item: NavItem;
  onClose: () => void;
}) {
  return (
    <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-52 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-50"
      style={{ animation: "hero-fade-up 0.18s ease-out forwards" }}
    >
      {item.children?.map((child) => (
        <Link
          key={child.href}
          href={child.href}
          onClick={onClose}
          className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-[#fdf8ef] hover:text-[#1a2f5e] font-medium transition-colors duration-150 border-b border-gray-50 last:border-0"
        >
          {child.label}
        </Link>
      ))}
    </div>
  );
}

// ─── Desktop nav item ──────────────────────────────────────────────────────────
function DesktopNavItem({ item }: { item: NavItem }) {
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

  if (!item.children) {
    return (
      <Link
        href={item.href}
        className="text-sm font-semibold hover:text-[#c9a84c] transition-colors duration-200 whitespace-nowrap"
        style={{ color: "#1a2f5e" }}
      >
        {item.label}
      </Link>
    );
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1 text-sm font-semibold hover:text-[#c9a84c] transition-colors duration-200 whitespace-nowrap"
        style={{ color: "#1a2f5e" }}
      >
        {item.label}
        <ChevronDown
          size={13}
          className={cn(
            "transition-transform duration-200",
            open && "rotate-180"
          )}
        />
      </button>
      {open && (
        <NavDropdown item={item} onClose={() => setOpen(false)} />
      )}
    </div>
  );
}

// ─── Main Navbar ───────────────────────────────────────────────────────────────
export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileExpanded, setMobileExpanded] = useState<string | null>(null);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  return (
    <>
      {/* ── Main navbar ── */}
      {/* CSS navbar-slide-down animation replaces Framer Motion (blocked by prod CSP) */}
      <header
        className="navbar-animate sticky top-0 z-40"
        style={{
          background:
            "linear-gradient(135deg, #fdf8ef 0%, #fef9f0 40%, #fff8e8 100%)",
          borderBottom: "1px solid rgba(201,168,76,0.18)",
          boxShadow: "0 2px 16px rgba(26,47,94,0.05)",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-[90px] lg:h-[100px]">
            {/* Logo — clip the empty SVG whitespace above/below the logo content */}
            <Link href="/" className="flex items-center shrink-0">
              <div
                style={{
                  width: "320px",
                  height: "116px",
                  overflow: "hidden",
                  position: "relative",
                  flexShrink: 0,
                }}
              >
                {/* The SVG is 1536×1024. At width=320px → rendered height ≈ 213px.
                    Logo content sits roughly at y=40px–140px of rendered height.
                    We shift up by 38px so logo is centered in the 90px window. */}
                <Image
                  src="/favicon-removebg-preview.png"
                  alt="MVR Consultants — Abroad Education"
                  width={1536}
                  height={1024}
                  style={{
                    width: "300px",
                    height: "200px",
                    position: "absolute",
                    top: "-38px",
                    left: "0",
                    mixBlendMode: "multiply",
                  }}
                  unoptimized
                  priority
                />
              </div>
            </Link>

            {/* Desktop nav */}
            <nav className="hidden xl:flex items-center gap-6">
              {NAV_ITEMS.map((item) => (
                <DesktopNavItem key={item.href} item={item} />
              ))}
            </nav>

            {/* CTA + hamburger */}
            <div className="flex items-center gap-3">
              <Link href="/contact" className="hidden md:block">
                <Button
                  size="sm"
                  className="text-white font-bold px-5 text-xs rounded-none transition-all duration-200 tracking-widest hover:opacity-90"
                  style={{ background: "#1a2f5e" }}
                >
                  APPLY NOW →
                </Button>
              </Link>
              {/* Hamburger */}
              <button
                onClick={() => setMobileOpen((o) => !o)}
                className="xl:hidden p-2 rounded-lg transition-colors"
                style={{ color: "#1a2f5e" }}
                aria-label="Toggle menu"
              >
                {mobileOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>
          </div>
        </div>

        {/* ── Mobile menu ── */}
          {mobileOpen && (
            <div
              className="xl:hidden border-t overflow-y-auto max-h-[calc(100vh-70px)]"
              style={{
                background:
                  "linear-gradient(135deg, #fdf8ef 0%, #fff8e8 100%)",
                borderColor: "rgba(201,168,76,0.2)",
              }}
            >
              <div className="px-4 py-3 space-y-1">
                {NAV_ITEMS.map((item) => (
                  <div key={item.href}>
                    {item.children ? (
                      <>
                        <button
                          onClick={() =>
                            setMobileExpanded((p) =>
                              p === item.label ? null : item.label
                            )
                          }
                          className="w-full flex items-center justify-between px-3 py-2.5 text-sm font-semibold rounded-lg hover:bg-white/60"
                          style={{ color: "#1a2f5e" }}
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
                        {mobileExpanded === item.label && (
                            <div
                              className="overflow-hidden ml-3 border-l-2 pl-3"
                              style={{
                                borderColor: "rgba(201,168,76,0.4)",
                              }}
                            >
                              {item.children.map((child) => (
                                <Link
                                  key={child.href}
                                  href={child.href}
                                  onClick={() => setMobileOpen(false)}
                                  className="block py-2 text-sm font-medium hover:text-[#c9a84c]"
                                  style={{ color: "#4b5563" }}
                                >
                                  {child.label}
                                </Link>
                              ))}
                            </div>
                          )}
                        </>
                    ) : (
                      <Link
                        href={item.href}
                        onClick={() => setMobileOpen(false)}
                        className="block px-3 py-2.5 text-sm font-semibold rounded-lg hover:bg-white/60 hover:text-[#c9a84c]"
                        style={{ color: "#1a2f5e" }}
                      >
                        {item.label}
                      </Link>
                    )}
                  </div>
                ))}
                <div className="pt-3 pb-2">
                  <Link href="/contact" onClick={() => setMobileOpen(false)}>
                    <Button
                      className="w-full text-white font-bold rounded-none"
                      style={{ background: "#1a2f5e" }}
                    >
                      APPLY NOW →
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          )}
      </header>
    </>
  );
}
