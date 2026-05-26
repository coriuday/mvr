"use client";

import { motion } from "framer-motion";
import { CheckCircle2, FileText, Clock, CreditCard } from "lucide-react";
import type { VisaRequirements as VisaReq } from "@/types/country";

interface VisaSectionProps {
  visa: VisaReq;
  countryName: string;
}

export default function VisaSection({ visa, countryName }: VisaSectionProps) {
  return (
    <div className="space-y-6">
      {/* Visa Type Banner */}
      <div className="bg-gradient-to-r from-[#1a2f5e] to-[#243d7a] rounded-2xl p-5 flex items-center gap-4">
        <div className="w-12 h-12 bg-[#c9a84c]/20 rounded-xl flex items-center justify-center shrink-0">
          <FileText size={22} className="text-[#c9a84c]" />
        </div>
        <div>
          <p className="text-white/60 text-xs font-semibold uppercase tracking-wider mb-0.5">
            Visa Type
          </p>
          <p className="text-white font-bold text-base">{visa.type}</p>
        </div>
      </div>

      {/* Processing Time & Fee */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl border border-gray-100 p-4 flex items-start gap-3 shadow-sm">
          <div className="w-9 h-9 bg-[#c9a84c]/10 rounded-xl flex items-center justify-center shrink-0 mt-0.5">
            <Clock size={16} className="text-[#c9a84c]" />
          </div>
          <div>
            <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-1">
              Processing Time
            </p>
            <p className="text-[#1a2f5e] font-bold text-sm">{visa.processingTime}</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-4 flex items-start gap-3 shadow-sm">
          <div className="w-9 h-9 bg-[#c9a84c]/10 rounded-xl flex items-center justify-center shrink-0 mt-0.5">
            <CreditCard size={16} className="text-[#c9a84c]" />
          </div>
          <div>
            <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-1">
              Visa Fee
            </p>
            <p className="text-[#1a2f5e] font-bold text-sm">{visa.fee}</p>
          </div>
        </div>
      </div>

      {/* Requirements List */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
        <p className="text-[#1a2f5e] font-bold text-sm uppercase tracking-wider mb-4">
          Required Documents
        </p>
        <ul className="space-y-3">
          {visa.requirements.map((req, i) => (
            <motion.li
              key={i}
              initial={{ opacity: 0, x: -10 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
              className="flex items-start gap-3"
            >
              <div className="w-6 h-6 bg-[#1a2f5e] text-white rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                {i + 1}
              </div>
              <p className="text-gray-700 text-sm leading-relaxed">{req}</p>
            </motion.li>
          ))}
        </ul>
      </div>
    </div>
  );
}
