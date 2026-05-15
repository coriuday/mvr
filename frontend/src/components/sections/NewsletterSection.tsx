"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, CheckCircle } from "lucide-react";
import { toast } from "sonner";

export default function NewsletterSection() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    // Simulate API call — wire to backend in Phase 3
    await new Promise((r) => setTimeout(r, 1000));
    setDone(true);
    setLoading(false);
    toast.success("You're subscribed! Welcome to MVR Consultants.");
  }

  return (
    <section className="py-20 bg-[#f8f9fc]" id="newsletter">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <motion.div
          className="bg-navy-gradient rounded-3xl px-8 py-14 sm:px-14 text-center relative overflow-hidden"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55 }}
        >
          {/* Background glow */}
          <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-[#c9a84c]/10 translate-x-1/3 -translate-y-1/3 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-white/5 -translate-x-1/3 translate-y-1/3 pointer-events-none" />

          <div className="relative z-10">
            <p className="text-[#c9a84c] text-sm font-semibold uppercase tracking-widest mb-3">
              Stay Updated
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4" style={{ fontFamily: "var(--font-playfair)" }}>
              Get Free Study Abroad Tips
            </h2>
            <p className="text-white/60 max-w-lg mx-auto text-sm mb-8">
              Subscribe to our newsletter and receive expert advice on scholarships, visa updates, university deadlines, and career tips.
            </p>

            {done ? (
              <motion.div
                initial={{ scale: 0.85, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="flex items-center justify-center gap-3 text-[#c9a84c] font-semibold text-lg"
              >
                <CheckCircle size={26} />
                Subscribed! Thank you.
              </motion.div>
            ) : (
              <form
                onSubmit={handleSubmit}
                className="flex flex-col sm:flex-row items-center gap-3 max-w-md mx-auto"
              >
                <Input
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="flex-1 bg-white/15 border-white/20 text-white placeholder:text-white/40 focus:border-[#c9a84c] focus:ring-[#c9a84c] rounded-full px-5"
                />
                <Button
                  type="submit"
                  disabled={loading}
                  className="bg-[#c9a84c] hover:bg-[#a07a2e] text-white font-bold rounded-full px-7 shrink-0 disabled:opacity-60"
                >
                  {loading ? "Subscribing…" : (
                    <>Subscribe <Send size={15} className="ml-2" /></>
                  )}
                </Button>
              </form>
            )}

            <p className="text-white/30 text-xs mt-4">
              No spam. Unsubscribe anytime.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
