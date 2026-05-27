"use client";

import { useEffect, useState, useCallback } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { CONTACT_INFO } from "@/constants/navigation";

// ─── Configuration ────────────────────────────────────────────────────────────

/** WhatsApp business number from CONTACT_INFO — digits only, no spaces or + */
const WA_NUMBER = CONTACT_INFO.socialMedia.whatsapp;

/**
 * Generates a context-aware pre-filled message based on the current page.
 * The student name placeholder keeps it personal without requiring auth.
 */
function buildMessage(pathname: string): string {
  if (pathname.startsWith("/countries/")) {
    const slug = pathname.replace("/countries/", "");
    const country = slug
      .split("-")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
    return `Hi MVR Consultants! I'm interested in studying in ${country}. Could you please guide me on universities, visa requirements, and scholarships?`;
  }
  if (pathname.startsWith("/universities")) {
    return "Hi MVR Consultants! I'd like to learn more about university admissions and application processes. Can you help me?";
  }
  if (pathname.startsWith("/scholarships")) {
    return "Hi MVR Consultants! I'm looking for scholarship opportunities for studying abroad. Can you guide me?";
  }
  if (pathname.startsWith("/visa")) {
    return "Hi MVR Consultants! I need help with my student visa application. Can you assist me?";
  }
  if (pathname.startsWith("/services")) {
    return "Hi MVR Consultants! I'd like to know more about your study abroad services and counseling process.";
  }
  if (pathname.startsWith("/about")) {
    return "Hi MVR Consultants! I'd like to learn more about your team and how you can help me study abroad.";
  }
  if (pathname.startsWith("/contact")) {
    return "Hi MVR Consultants! I'd like to schedule a free counseling session. Is that possible?";
  }
  if (pathname.startsWith("/blogs")) {
    return "Hi MVR Consultants! I've been reading your blog and have some questions about studying abroad.";
  }
  // Default / homepage
  return "Hi MVR Consultants! I'm interested in studying abroad and would like a free counseling session. Can you help me?";
}

/** Opens WhatsApp with the pre-filled message */
function openWhatsApp(pathname: string) {
  const message = buildMessage(pathname);
  const encoded = encodeURIComponent(message);
  // wa.me works on both mobile (opens app) and desktop (opens web.whatsapp.com)
  window.open(`https://wa.me/${WA_NUMBER}?text=${encoded}`, "_blank", "noopener,noreferrer");
}

// ─── WhatsApp Icon (official green brand) ─────────────────────────────────────

function WhatsAppIcon({ size = 28 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M16 2C8.268 2 2 8.268 2 16c0 2.469.642 4.786 1.762 6.797L2 30l7.39-1.737A13.93 13.93 0 0 0 16 30c7.732 0 14-6.268 14-14S23.732 2 16 2Z"
        fill="#25D366"
      />
      <path
        d="M22.947 19.302c-.296-.148-1.754-.867-2.026-.966-.272-.099-.47-.148-.667.148-.198.296-.767.966-.940 1.163-.173.197-.346.222-.642.074-.296-.148-1.25-.46-2.381-1.469-.88-.785-1.474-1.754-1.647-2.05-.173-.296-.018-.456.130-.604.133-.132.296-.346.444-.519.148-.173.198-.296.296-.494.099-.197.05-.37-.025-.518-.074-.148-.667-1.608-.914-2.2-.24-.579-.485-.5-.667-.51l-.568-.01c-.198 0-.518.074-.79.37-.272.296-1.038 1.014-1.038 2.474s1.063 2.87 1.211 3.067c.148.198 2.09 3.193 5.065 4.48.708.306 1.26.488 1.69.625.71.226 1.357.194 1.869.118.57-.085 1.754-.717 2.001-1.41.247-.692.247-1.286.173-1.41-.074-.123-.272-.197-.568-.346Z"
        fill="#fff"
      />
    </svg>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function WhatsAppButton() {
  const pathname = usePathname();
  const [visible, setVisible]   = useState(false);
  const [tooltip, setTooltip]   = useState(false);
  const [clicked, setClicked]   = useState(false);

  // Show the button after the user has scrolled 300px — avoids competing
  // with above-the-fold hero CTAs on page load.
  const handleScroll = useCallback(() => {
    setVisible(window.scrollY > 300);
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll(); // evaluate immediately for pages shorter than 300px
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  // Close tooltip on route change (e.g. user navigates while tooltip is open)
  useEffect(() => {
    setTooltip(false);
  }, [pathname]);

  function handleClick() {
    setClicked(true);
    openWhatsApp(pathname);
    setTimeout(() => setClicked(false), 600);
  }

  return (
    <AnimatePresence>
      {visible && (
        <>
          {/* ── Desktop: fixed bottom-right pill ───────────────────────────── */}
          <motion.div
            key="wa-desktop"
            className="hidden sm:flex fixed bottom-6 right-6 z-50 items-center gap-0"
            initial={{ opacity: 0, scale: 0.7, y: 20 }}
            animate={{ opacity: 1, scale: 1,   y: 0  }}
            exit={{    opacity: 0, scale: 0.7, y: 20  }}
            transition={{ type: "spring", stiffness: 350, damping: 28 }}
          >
            {/* Tooltip bubble */}
            <AnimatePresence>
              {tooltip && (
                <motion.div
                  key="tooltip"
                  initial={{ opacity: 0, x: 8,  scale: 0.95 }}
                  animate={{ opacity: 1, x: 0,  scale: 1    }}
                  exit={{    opacity: 0, x: 8,  scale: 0.95 }}
                  transition={{ duration: 0.18 }}
                  className="mr-3 bg-white text-[#1a2f5e] text-sm font-semibold px-4 py-2.5 rounded-2xl shadow-xl whitespace-nowrap border border-gray-100 max-w-[220px]"
                  style={{ boxShadow: "0 8px 32px rgba(0,0,0,0.12)" }}
                >
                  Chat with us on WhatsApp
                  {/* Arrow pointing right */}
                  <span
                    className="absolute top-1/2 -translate-y-1/2 right-[-7px] w-3.5 h-3.5 bg-white rotate-45 border-r border-t border-gray-100"
                    aria-hidden="true"
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Button */}
            <motion.button
              id="whatsapp-cta"
              onClick={handleClick}
              onMouseEnter={() => setTooltip(true)}
              onMouseLeave={() => setTooltip(false)}
              aria-label="Chat with MVR Consultants on WhatsApp"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.92 }}
              animate={clicked ? { scale: [1, 0.92, 1.08, 1] } : {}}
              className="relative w-14 h-14 rounded-full flex items-center justify-center shadow-2xl focus:outline-none focus-visible:ring-4 focus-visible:ring-[#25D366]/50"
              style={{
                background: "linear-gradient(135deg, #25D366 0%, #128C7E 100%)",
                boxShadow: "0 8px 30px rgba(37,211,102,0.40)",
              }}
            >
              {/* Pulsing ring — only shown when tooltip is NOT open to avoid visual noise */}
              {!tooltip && (
                <span
                  className="absolute inset-0 rounded-full animate-ping"
                  style={{ background: "rgba(37,211,102,0.25)", animationDuration: "2.4s" }}
                  aria-hidden="true"
                />
              )}
              <WhatsAppIcon size={28} />
            </motion.button>
          </motion.div>

          {/* ── Mobile: full-width floating bar at safe area bottom ──────────── */}
          <motion.div
            key="wa-mobile"
            className="sm:hidden fixed bottom-0 left-0 right-0 z-50 px-4 pb-[env(safe-area-inset-bottom)] pt-3"
            style={{
              background: "linear-gradient(to top, rgba(15,28,61,0.98) 0%, rgba(15,28,61,0) 100%)",
            }}
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0  }}
            exit={{    opacity: 0, y: 32  }}
            transition={{ type: "spring", stiffness: 320, damping: 30 }}
          >
            <motion.button
              id="whatsapp-cta-mobile"
              onClick={handleClick}
              aria-label="Chat with MVR Consultants on WhatsApp"
              whileTap={{ scale: 0.97 }}
              animate={clicked ? { scale: [1, 0.96, 1.02, 1] } : {}}
              className="w-full flex items-center justify-center gap-3 py-3.5 rounded-2xl font-bold text-white text-base focus:outline-none focus-visible:ring-4 focus-visible:ring-[#25D366]/50"
              style={{
                background: "linear-gradient(135deg, #25D366 0%, #128C7E 100%)",
                boxShadow: "0 4px 24px rgba(37,211,102,0.35)",
              }}
            >
              <WhatsAppIcon size={22} />
              Chat on WhatsApp
            </motion.button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
