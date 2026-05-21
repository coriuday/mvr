"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

/**
 * Preloader — Full-screen animated logo splash screen.
 * Shows on first page load (tracked via sessionStorage).
 * Fades in the logo, pulses once, then fades out.
 */
export default function Preloader() {
  const [isVisible, setIsVisible] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    // Only show preloader on first visit in a session
    const hasSeenPreloader = sessionStorage.getItem("mvr_preloader_shown");
    if (hasSeenPreloader) {
      setIsVisible(false);
      return;
    }

    // Hide after 2.2 seconds
    const timer = setTimeout(() => {
      setIsVisible(false);
      sessionStorage.setItem("mvr_preloader_shown", "true");
    }, 2200);

    return () => clearTimeout(timer);
  }, []);

  // Don't render on server
  if (!isMounted) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          key="preloader"
          className="preloader"
          initial={{ opacity: 1 }}
          exit={{
            opacity: 0,
            transition: { duration: 0.6, ease: "easeInOut" },
          }}
          aria-hidden="true"
        >
          {/* Background shimmer rings */}
          <motion.div
            className="absolute rounded-full border border-white/10"
            initial={{ width: 0, height: 0, opacity: 0 }}
            animate={{ width: 300, height: 300, opacity: 0.15 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
          />
          <motion.div
            className="absolute rounded-full border border-white/5"
            initial={{ width: 0, height: 0, opacity: 0 }}
            animate={{ width: 450, height: 450, opacity: 0.08 }}
            transition={{ duration: 1.8, ease: "easeOut", delay: 0.2 }}
          />

          {/* Logo container */}
          <motion.div
            className="relative z-10 flex flex-col items-center gap-4"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{
              opacity: 1,
              scale: 1,
              transition: { duration: 0.5, ease: "easeOut" },
            }}
          >
            {/* Logo image */}
            <motion.div
              className="preloader-logo"
              animate={{
                scale: [1, 1.06, 1],
              }}
              transition={{
                duration: 1.2,
                ease: "easeInOut",
                repeat: Infinity,
                delay: 0.5,
              }}
            >
              <Image
                src="/web-app-manifest-512x512.png"
                alt="MVR Consultants"
                width={400}
                height={400}
                priority
                className="drop-shadow-2xl"
              />
            </motion.div>

            {/* Brand text */}
            <motion.div
              className="text-center"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              <p className="text-white/60 text-sm tracking-[0.25em] uppercase font-light mt-2">
                Dream · Plan · Achieve
              </p>
            </motion.div>

            {/* Gold loading bar */}
            <motion.div className="w-48 h-[2px] bg-white/10 rounded-full overflow-hidden mt-2">
              <motion.div
                className="h-full bg-gradient-to-r from-transparent via-[#c9a84c] to-transparent"
                initial={{ x: "-100%" }}
                animate={{ x: "100%" }}
                transition={{
                  duration: 1.4,
                  ease: "easeInOut",
                  repeat: Infinity,
                }}
              />
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
