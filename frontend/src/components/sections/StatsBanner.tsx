"use client";

import { motion, useInView } from "framer-motion";
import { useRef, useEffect, useState } from "react";

const STATS = [
  {
    icon: (
      <svg viewBox="0 0 40 40" fill="none" stroke="#c9a84c" strokeWidth="1.5" className="w-8 h-8">
        <circle cx="20" cy="20" r="16"/>
        <path d="M20 4v4M20 32v4M4 20h4M32 20h4"/>
        <path d="M8.7 8.7l2.8 2.8M28.5 28.5l2.8 2.8M8.7 31.3l2.8-2.8M28.5 11.5l2.8-2.8"/>
        <circle cx="20" cy="20" r="6" fill="#c9a84c" fillOpacity="0.2"/>
      </svg>
    ),
    value: "10",
    label: "Years of Experience",
  },
  {
    icon: (
      <svg viewBox="0 0 40 40" fill="none" stroke="#c9a84c" strokeWidth="1.5" className="w-8 h-8">
        <path d="M26 20a6 6 0 1 1-12 0 6 6 0 0 1 12 0z"/>
        <path d="M4 34c0-7.732 7.163-14 16-14s16 6.268 16 14"/>
        <path d="M30 10a4 4 0 1 1 0 8"/>
        <path d="M34 30c0-5.523-3.582-10-8-10"/>
      </svg>
    ),
    value: "5K+",
    label: "Students Placed",
  },
  {
    icon: (
      <svg viewBox="0 0 40 40" fill="none" stroke="#c9a84c" strokeWidth="1.5" className="w-8 h-8">
        <rect x="6" y="8" width="28" height="24" rx="3"/>
        <path d="M6 14h28M6 20h28M14 8v24M26 8v24"/>
      </svg>
    ),
    value: "100+",
    label: "Partner Universities",
  },
  {
    icon: (
      <svg viewBox="0 0 40 40" fill="none" stroke="#c9a84c" strokeWidth="1.5" className="w-8 h-8">
        <circle cx="20" cy="20" r="16"/>
        <path d="M4 20h32M20 4c-5 6-8 11-8 16s3 10 8 16M20 4c5 6 8 11 8 16s-3 10-8 16"/>
        <path d="M9 13h22M9 27h22"/>
      </svg>
    ),
    value: "25+",
    label: "Countries",
  },
  {
    icon: (
      <svg viewBox="0 0 40 40" fill="none" stroke="#c9a84c" strokeWidth="1.5" className="w-8 h-8">
        <circle cx="20" cy="20" r="16"/>
        <path d="M12 20l6 6 10-12" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    value: "98%",
    label: "Visa Success Rate",
  },
  {
    icon: (
      <svg viewBox="0 0 40 40" fill="none" stroke="#c9a84c" strokeWidth="1.5" className="w-8 h-8">
        <path d="M20 4l4.5 9 9.5 1.4-6.9 6.7 1.6 9.5L20 26l-8.7 4.6 1.6-9.5L6 14.4l9.5-1.4L20 4z"/>
      </svg>
    ),
    value: "4.9/5",
    label: "Google Rating",
  },
];

function Counter({ target }: { target: string }) {
  const [display, setDisplay] = useState("0");
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView) return;
    
    let isMounted = true;
    const num = parseFloat(target.replace(/[^0-9.]/g, ""));
    const suffix = target.replace(/[0-9.]/g, "");
    let start = 0;
    const step = num / 50;
    
    const timer = setInterval(() => {
      if (!isMounted) return;
      start = Math.min(start + step, num);
      setDisplay(
        (Number.isInteger(num) ? Math.round(start) : start.toFixed(1)) + suffix
      );
      if (start >= num) {
        clearInterval(timer);
      }
    }, 30);
    
    return () => {
      isMounted = false;
      clearInterval(timer);
    };
  }, [inView, target]);

  return <span ref={ref}>{display}</span>;
}

export default function StatsBanner() {
  return (
    <section
      className="py-10 relative overflow-hidden"
      id="stats"
      style={{ background: "linear-gradient(135deg, #1a2f5e 0%, #0f1c3d 100%)" }}
    >
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {STATS.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: i * 0.08 }}
              className="flex items-center gap-3"
            >
              {/* Icon */}
              <div className="shrink-0">{stat.icon}</div>
              {/* Text */}
              <div>
                <p className="text-xl font-bold text-white leading-tight">
                  <Counter target={stat.value} />
                </p>
                <p className="text-gray-400 text-xs leading-tight mt-0.5">{stat.label}</p>
              </div>
              {/* Divider (not last) */}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
