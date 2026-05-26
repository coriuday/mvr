"use client";

import { motion } from "framer-motion";
import { Building2, GraduationCap, Trophy } from "lucide-react";
import type { University } from "@/types/country";

interface UniversityCardProps {
  university: University;
  index: number;
}

export default function UniversityCard({ university, index }: UniversityCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.07, duration: 0.45, ease: "easeOut" }}
      className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 duration-200 flex gap-4"
    >
      {/* Rank badge */}
      <div className="w-10 h-10 rounded-2xl bg-[#1a2f5e]/5 flex items-center justify-center shrink-0 mt-0.5">
        <span className="text-[#1a2f5e] font-bold text-sm">{index + 1}</span>
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h4 className="text-[#1a2f5e] font-bold text-sm leading-snug">
            {university.name}
          </h4>
        </div>

        {university.ranking && (
          <div className="flex items-center gap-1.5 mb-3">
            <Trophy size={11} className="text-[#c9a84c]" />
            <span className="text-[#c9a84c] text-xs font-semibold">{university.ranking}</span>
          </div>
        )}

        {university.programs && university.programs.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {university.programs.slice(0, 3).map((prog, pi) => (
              <span
                key={pi}
                className="bg-gray-100 text-gray-600 text-xs px-2.5 py-0.5 rounded-full font-medium"
              >
                {prog}
              </span>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
