"use client";

import { motion, useInView } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import { STATS } from "@/constants/countries";
import { Award, Users, CheckCircle, Building, Globe, Star } from "lucide-react";

const ICONS: Record<string, React.ElementType> = {
  Award, Users, CheckCircle, Building, Globe, Star,
};

function Counter({ target }: { target: string }) {
  const [display, setDisplay] = useState("0");
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView) return;
    const num = parseFloat(target.replace(/[^0-9.]/g, ""));
    const suffix = target.replace(/[0-9.]/g, "");
    let start = 0;
    const step = num / 50;
    const timer = setInterval(() => {
      start = Math.min(start + step, num);
      setDisplay(
        (Number.isInteger(num) ? Math.round(start) : start.toFixed(1)) + suffix
      );
      if (start >= num) clearInterval(timer);
    }, 30);
    return () => clearInterval(timer);
  }, [inView, target]);

  return <span ref={ref}>{display}</span>;
}

export default function StatsBanner() {
  return (
    <section className="py-20 bg-navy-gradient relative overflow-hidden" id="stats">
      {/* Subtle grid overlay */}
      <div className="absolute inset-0 opacity-[0.04]"
        style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)", backgroundSize: "80px 80px" }} />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6">
        <motion.div className="text-center mb-14" initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
          <p className="text-[#c9a84c] text-sm font-semibold uppercase tracking-widest mb-3">Our Track Record</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4" style={{ fontFamily: "var(--font-playfair)" }}>
            Numbers That Speak for Themselves
          </h2>
          <div className="w-14 h-1 bg-[#c9a84c] rounded-full mx-auto" />
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
          {STATS.map((stat, i) => {
            const Icon = ICONS[stat.icon] ?? Award;
            return (
              <motion.div key={stat.label} initial={{ opacity: 0, scale: 0.85 }}
                whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}
                transition={{ duration: 0.45, delay: i * 0.08 }}
                className="text-center group">
                <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center mx-auto mb-4 group-hover:bg-[#c9a84c]/20 transition-colors duration-200">
                  <Icon size={28} className="text-[#c9a84c]" />
                </div>
                <p className="text-3xl font-bold text-white mb-1">
                  <Counter target={stat.value} />
                </p>
                <p className="text-white/55 text-xs font-medium uppercase tracking-wide">{stat.label}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
