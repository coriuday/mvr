"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";

export default function NewsletterSection() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1000));
    setDone(true);
    setLoading(false);
    toast.success("Subscribed! Welcome to MVR Consultants.");
  }

  return (
    <section
      className="py-14 relative overflow-hidden"
      id="newsletter"
      style={{ background: "linear-gradient(135deg, #1a2f5e 0%, #0f1c3d 100%)" }}
    >
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6">
        <motion.div
          className="flex flex-col lg:flex-row items-center gap-6 lg:gap-10"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55 }}
        >
          {/* Left — icon + text */}
          <div className="flex items-center gap-5 flex-shrink-0">
            {/* Envelope icon */}
            <div className="w-14 h-14 rounded-full bg-[#c9a84c] flex items-center justify-center shrink-0">
              <svg viewBox="0 0 28 28" fill="none" stroke="white" strokeWidth="1.8" className="w-7 h-7">
                <rect x="2" y="6" width="24" height="17" rx="2"/>
                <path d="M2 8l12 9 12-9" strokeLinecap="round"/>
              </svg>
            </div>
            <div>
              <h2 className="text-white text-xl font-bold leading-tight">
                Stay Updated with the Latest
              </h2>
              <p className="text-gray-300 text-sm mt-0.5">
                Scholarships, university updates, visa news & more.
              </p>
            </div>
          </div>

          {/* Right — form */}
          <div className="flex-1 w-full lg:max-w-md">
            {done ? (
              <p className="text-[#c9a84c] font-semibold text-center text-lg">
                ✓ Subscribed! Thank you.
              </p>
            ) : (
              <form onSubmit={handleSubmit} className="flex gap-0">
                <input
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="flex-1 px-5 py-3.5 bg-white text-gray-700 placeholder:text-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-[#c9a84c] rounded-l-sm"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-[#c9a84c] hover:bg-[#a07a2e] text-white font-bold px-6 py-3.5 text-sm transition-all duration-200 shrink-0 rounded-r-sm disabled:opacity-60"
                >
                  {loading ? "..." : "SUBSCRIBE"}
                </button>
              </form>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
