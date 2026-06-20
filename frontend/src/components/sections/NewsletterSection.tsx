"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { apiUrl } from "@/lib/api-url";

export default function NewsletterSection() {
  const [email, setEmail]     = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone]       = useState(false);
  const [error, setError]     = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(apiUrl("/api/newsletter/subscribe"), {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email:  email.trim().toLowerCase(),
          source: "homepage",
        }),
      });

      const data = await res.json();

      if (res.status === 429) {
        // Rate limited
        setError("Too many attempts. Please wait a moment before trying again.");
        toast.error("Too many requests. Please wait a moment.");
        return;
      }

      if (!res.ok || !data.success) {
        const msg = data?.error?.message ?? "Something went wrong. Please try again.";
        setError(msg);
        toast.error(msg);
        return;
      }

      // All three success outcomes (new, already subscribed, resubscribed)
      // return success:true with a distinct message
      setDone(true);
      toast.success(data.message ?? "Subscribed! Welcome to MVR Consultants.");
    } catch {
      const msg = "Connection error. Please check your internet and try again.";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
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
                Scholarships, university updates, visa news &amp; more.
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
              <>
                <form onSubmit={handleSubmit} className="flex gap-0">
                  <input
                    id="newsletter-email"
                    type="email"
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (error) setError(null);
                    }}
                    required
                    disabled={loading}
                    className="flex-1 px-5 py-3.5 bg-white text-gray-700 placeholder:text-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-[#c9a84c] rounded-l-sm disabled:opacity-60"
                  />
                  <button
                    type="submit"
                    id="newsletter-submit"
                    disabled={loading}
                    className="bg-[#c9a84c] hover:bg-[#a07a2e] text-white font-bold px-6 py-3.5 text-sm transition-all duration-200 shrink-0 rounded-r-sm disabled:opacity-60"
                  >
                    {loading ? "..." : "SUBSCRIBE"}
                  </button>
                </form>
                {error && (
                  <p className="text-red-300 text-xs mt-2 pl-1">{error}</p>
                )}
              </>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
