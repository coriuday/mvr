"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

const MIN_VISIBLE_MS = 2500;
const EXIT_MS = 800;
const SESSION_KEY = "mvr_preloader_shown";

/**
 * Full-screen animated splash on first visit per session.
 * Uses favicon.svg at 600x600 with layered Framer Motion effects.
 */
export default function Preloader() {
  const [isVisible, setIsVisible] = useState(false);
  const [skip, setSkip] = useState(true);
  const startTimeRef = useRef<number>(0);

  useEffect(() => {
    if (sessionStorage.getItem(SESSION_KEY)) {
      setSkip(true);
      return;
    }

    setSkip(false);
    setIsVisible(true);
    startTimeRef.current = Date.now();

    const scheduleHide = (): number => {
      const elapsed = Date.now() - startTimeRef.current;
      const remaining = Math.max(0, MIN_VISIBLE_MS - elapsed);
      return window.setTimeout(() => setIsVisible(false), remaining);
    };

    let hideTimer: number | undefined;

    if (document.readyState === "complete") {
      hideTimer = scheduleHide();
    } else {
      const onLoad = () => {
        hideTimer = scheduleHide();
      };
      window.addEventListener("load", onLoad, { once: true });
      return () => {
        window.removeEventListener("load", onLoad);
        clearTimeout(hideTimer);
      };
    }

    return () => clearTimeout(hideTimer);
  }, []);

  if (skip) return null;

  return (
    <AnimatePresence onExitComplete={() => sessionStorage.setItem(SESSION_KEY, "1")}>
      {isVisible && (
        <motion.div
          key="preloader"
          className="preloader"
          initial={{ opacity: 1 }}
          exit={{
            opacity: 0,
            scale: 1.02,
            transition: { duration: EXIT_MS / 1000, ease: "easeInOut" },
          }}
          aria-hidden="true"
        >
          {/* Expanding rings */}
          <motion.div
            className="absolute rounded-full border border-[#c9a84c]/20"
            initial={{ width: 0, height: 0, opacity: 0 }}
            animate={{ width: 420, height: 420, opacity: 0.2 }}
            transition={{ duration: 1.6, ease: "easeOut" }}
          />
          <motion.div
            className="absolute rounded-full border border-white/10"
            initial={{ width: 0, height: 0, opacity: 0 }}
            animate={{ width: 620, height: 620, opacity: 0.1 }}
            transition={{ duration: 2, ease: "easeOut", delay: 0.15 }}
          />

          <motion.div
            className="relative z-10 flex flex-col items-center gap-5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
          >
            {/* Gold glow behind logo */}
            <motion.div
              className="absolute rounded-full bg-[#c9a84c]/25 blur-3xl"
              style={{ width: 320, height: 320 }}
              animate={{ opacity: [0.35, 0.65, 0.35], scale: [0.95, 1.05, 0.95] }}
              transition={{ duration: 2.8, ease: "easeInOut", repeat: Infinity }}
            />

            {/* Logo */}
            <motion.div
              className="relative overflow-hidden rounded-3xl"
              initial={{ opacity: 0, scale: 0.88, filter: "blur(8px)" }}
              animate={{
                opacity: 1,
                scale: 1,
                filter: "blur(0px)",
                y: [0, -10, 0],
              }}
              transition={{
                opacity: { duration: 0.9, ease: "easeOut" },
                scale: { type: "spring", stiffness: 120, damping: 18 },
                filter: { duration: 0.9 },
                y: { duration: 3.2, ease: "easeInOut", repeat: Infinity, delay: 0.9 },
              }}
            >
              <motion.img
                src="/favicon.svg"
                alt="MVR Consultants"
                width={600}
                height={600}
                className="w-[600px] h-[600px] max-w-[min(600px,90vw)] max-h-[min(600px,50vh)] object-contain drop-shadow-2xl relative z-10 rounded-3xl"
                animate={{ scale: [1, 1.03, 1] }}
                transition={{ duration: 2.6, ease: "easeInOut", repeat: Infinity, delay: 0.5 }}
              />
            </motion.div>

            {/* Tagline */}
            <motion.p
              className="text-white/60 text-sm tracking-[0.25em] uppercase font-light text-center"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55, duration: 0.6, ease: "easeOut" }}
            >
              Dream · Plan · Achieve
            </motion.p>

            {/* Progress bar — one sweep over min visible duration */}
            <motion.div
              className="w-56 h-[2px] bg-white/10 rounded-full overflow-hidden mt-1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7, duration: 0.4 }}
            >
              <motion.div
                className="h-full bg-gradient-to-r from-transparent via-[#c9a84c] to-transparent"
                initial={{ x: "-100%" }}
                animate={{ x: "100%" }}
                transition={{
                  duration: MIN_VISIBLE_MS / 1000,
                  ease: "easeInOut",
                  delay: 0.2,
                }}
              />
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
