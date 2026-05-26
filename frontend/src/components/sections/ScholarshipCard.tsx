"use client";

import { motion } from "framer-motion";
import { Award, ExternalLink } from "lucide-react";
import type { Scholarship } from "@/types/country";

interface ScholarshipCardProps {
  scholarship: Scholarship;
  index: number;
}

export default function ScholarshipCard({ scholarship, index }: ScholarshipCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.08, duration: 0.45, ease: "easeOut" }}
      className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col gap-3"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 bg-[#c9a84c]/10 rounded-xl flex items-center justify-center shrink-0 mt-0.5">
            <Award size={16} className="text-[#c9a84c]" />
          </div>
          <h4 className="text-[#1a2f5e] font-semibold text-sm leading-snug">
            {scholarship.name}
          </h4>
        </div>
        {scholarship.amount && scholarship.amount !== "Varies" && (
          <span className="shrink-0 bg-[#1a2f5e]/5 text-[#1a2f5e] text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap">
            {scholarship.amount}
          </span>
        )}
        {scholarship.amount === "Varies" && (
          <span className="shrink-0 bg-[#c9a84c]/10 text-[#c9a84c] text-xs font-bold px-3 py-1 rounded-full">
            Varies
          </span>
        )}
      </div>

      {scholarship.eligibility && (
        <p className="text-gray-500 text-xs leading-relaxed pl-12">
          {scholarship.eligibility}
        </p>
      )}

      {scholarship.link && (
        <a
          href={scholarship.link}
          target="_blank"
          rel="noopener noreferrer"
          className="pl-12 inline-flex items-center gap-1 text-[#c9a84c] text-xs font-semibold hover:underline"
        >
          Learn more <ExternalLink size={11} />
        </a>
      )}
    </motion.div>
  );
}
