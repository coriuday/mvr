"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Variants } from "framer-motion";
import {
  Phone, Mail, MapPin, Clock, Send, CheckCircle2,
  GraduationCap, Globe, Award, MessageSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

const COUNTRIES = [
  "United States", "United Kingdom", "Canada", "Australia",
  "Germany", "Ireland", "New Zealand", "Netherlands",
  "France", "Sweden", "Singapore", "Japan", "Other",
];

const CONTACT_CARDS = [
  {
    icon: Phone,
    title: "Call Us",
    lines: ["+91 99669 03884", "+91 85999 99331"],
    sub: "Mon–Sat, 9am–7pm IST",
    color: "text-blue-500",
    bg: "bg-blue-50",
    href: "tel:+919966903884",
  },
  {
    icon: Mail,
    title: "Email Us",
    lines: ["mvrconsultantshyd@gmail.com", "mvroverseasconsultancy@gmail.com"],
    sub: "Reply within 4 hours",
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    href: "mailto:mvrconsultantshyd@gmail.com",
  },
  {
    icon: MapPin,
    title: "Hyderabad Office",
    lines: ["KPHB Colony, Hyderabad", "500 072, Telangana"],
    sub: "H No 15-31-27, Dharma Reddy Colony",
    color: "text-amber-600",
    bg: "bg-amber-50",
    href: "https://maps.google.com/?q=KPHB+Colony+Hyderabad",
  },
  {
    icon: Clock,
    title: "Office Hours",
    lines: ["Mon–Fri: 9am – 7pm", "Saturday: 10am – 5pm"],
    sub: "Sunday: Closed",
    color: "text-purple-600",
    bg: "bg-purple-50",
    href: null,
  },
];


const cardVariants: Variants = {
  hidden: {}, visible: { transition: { staggerChildren: 0.1 } },
};
const itemVariants: Variants = {
  hidden:  { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

export default function ContactPageClient() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", country_interest: "", subject: "", message: "" });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((p) => ({ ...p, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, phone: form.phone || undefined, country_interest: form.country_interest || undefined }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Failed to send message");
      }
      setStatus("success");
      setForm({ name: "", email: "", phone: "", country_interest: "", subject: "", message: "" });
    } catch (err: unknown) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    }
  };

  return (
    <>
      {/* ── Hero ── */}
      <section className="relative bg-[#1a2f5e] py-20 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-[#c9a84c]/5 -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-white/[0.03] translate-y-1/2 -translate-x-1/2" />
        </div>
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span className="inline-flex items-center gap-2 bg-[#c9a84c]/20 text-[#c9a84c] text-xs font-semibold uppercase tracking-wider px-4 py-2 rounded-full mb-6">
              <MessageSquare size={13} /> Free Consultation
            </span>
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-5" style={{ fontFamily: "var(--font-playfair)" }}>
              Start Your Study Abroad{" "}
              <span className="text-gradient-gold">Journey Today</span>
            </h1>
            <p className="text-white/65 text-lg max-w-2xl mx-auto leading-relaxed">
              Our expert counselors are ready to guide you. Fill out the form below and
              we&apos;ll reach out within 24 hours — no commitment required.
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-wrap justify-center gap-8 mt-12"
          >
            {[
              { icon: GraduationCap, label: "50K+ Students Guided" },
              { icon: Globe, label: "25+ Countries" },
              { icon: Award, label: "98% Visa Success" },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-2 text-white/70 text-sm">
                <Icon size={16} className="text-[#c9a84c]" /> {label}
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Contact Info Cards ── */}
      <section className="bg-white py-14">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <motion.div
            variants={cardVariants} initial="hidden" whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5"
          >
            {CONTACT_CARDS.map((card) => (
              <motion.div
                key={card.title} variants={itemVariants}
                className="rounded-2xl border border-gray-100 p-6 text-center hover:shadow-lg hover:-translate-y-1 transition-all duration-200"
              >
                <div className={`w-12 h-12 ${card.bg} rounded-xl flex items-center justify-center mx-auto mb-4`}>
                  <card.icon size={22} className={card.color} />
                </div>
                <h3 className="font-bold text-[#1a2f5e] mb-2">{card.title}</h3>
                {card.lines.map((l) => <p key={l} className="text-gray-600 text-sm">{l}</p>)}
                <p className="text-gray-400 text-xs mt-2">{card.sub}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Form + Sidebar ── */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-5 gap-12">
            {/* Form */}
            <motion.div
              initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.6 }}
              className="lg:col-span-3 bg-white rounded-3xl shadow-sm border border-gray-100 p-8"
            >
              <h2 className="text-2xl font-bold text-[#1a2f5e] mb-1" style={{ fontFamily: "var(--font-playfair)" }}>
                Send Us a Message
              </h2>
              <p className="text-gray-500 text-sm mb-8">
                Tell us about your study abroad goals and we&apos;ll match you with the right program.
              </p>

              <AnimatePresence mode="wait">
                {status === "success" ? (
                  <motion.div key="success" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                    className="flex flex-col items-center justify-center py-16 text-center"
                  >
                    <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mb-5">
                      <CheckCircle2 size={40} className="text-emerald-500" />
                    </div>
                    <h3 className="text-2xl font-bold text-[#1a2f5e] mb-3">Message Sent!</h3>
                    <p className="text-gray-500 max-w-sm">
                      One of our counselors will get back to you within 24 hours.
                      Check your inbox for a confirmation email.
                    </p>
                    <Button className="mt-8 bg-[#c9a84c] hover:bg-[#a07a2e] text-white rounded-full px-8"
                      onClick={() => setStatus("idle")}>
                      Send Another Message
                    </Button>
                  </motion.div>
                ) : (
                  <motion.form key="form" initial={{ opacity: 1 }} exit={{ opacity: 0 }} onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid sm:grid-cols-2 gap-5">
                      <div className="space-y-1.5">
                        <Label htmlFor="ct-name" className="text-gray-700 font-medium text-sm">Full Name <span className="text-red-500">*</span></Label>
                        <Input id="ct-name" placeholder="Your full name" value={form.name} onChange={set("name")} required
                          className="rounded-xl h-11 border-gray-200 focus-visible:ring-[#c9a84c]/30" />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="ct-email" className="text-gray-700 font-medium text-sm">Email Address <span className="text-red-500">*</span></Label>
                        <Input id="ct-email" type="email" placeholder="you@example.com" value={form.email} onChange={set("email")} required
                          className="rounded-xl h-11 border-gray-200 focus-visible:ring-[#c9a84c]/30" />
                      </div>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-5">
                      <div className="space-y-1.5">
                        <Label htmlFor="ct-phone" className="text-gray-700 font-medium text-sm">Phone Number</Label>
                        <Input id="ct-phone" type="tel" placeholder="+91 98765 43210" value={form.phone} onChange={set("phone")}
                          className="rounded-xl h-11 border-gray-200 focus-visible:ring-[#c9a84c]/30" />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-gray-700 font-medium text-sm">Country of Interest</Label>
                        <Select value={form.country_interest} onValueChange={(v) => setForm((p) => ({ ...p, country_interest: v ?? "" }))}>
                          <SelectTrigger className="rounded-xl h-11 border-gray-200">
                            <SelectValue placeholder="Select country" />
                          </SelectTrigger>
                          <SelectContent>
                            {COUNTRIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="ct-subject" className="text-gray-700 font-medium text-sm">Subject</Label>
                      <Input id="ct-subject" placeholder="e.g. MBA Admissions, Student Visa, Scholarship" value={form.subject} onChange={set("subject")}
                        className="rounded-xl h-11 border-gray-200 focus-visible:ring-[#c9a84c]/30" />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="ct-message" className="text-gray-700 font-medium text-sm">Your Message <span className="text-red-500">*</span></Label>
                      <Textarea id="ct-message" rows={5} placeholder="Tell us about your educational background, target programs, budget, and timeline..."
                        value={form.message} onChange={set("message")} required className="rounded-xl border-gray-200 resize-none focus-visible:ring-[#c9a84c]/30" />
                    </div>
                    {status === "error" && (
                      <p className="text-red-500 text-sm bg-red-50 rounded-xl px-4 py-3">{errorMsg}</p>
                    )}
                    <Button type="submit" disabled={status === "loading"}
                      className="w-full h-12 bg-[#1a2f5e] hover:bg-[#2a4a8e] text-white font-bold rounded-xl transition-all hover:scale-[1.01] disabled:opacity-60">
                      {status === "loading" ? (
                        <span className="flex items-center gap-2">
                          <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.4 0 0 5.4 0 12h4z" />
                          </svg>
                          Sending...
                        </span>
                      ) : (
                        <span className="flex items-center gap-2"><Send size={16} /> Send Message</span>
                      )}
                    </Button>
                    <p className="text-center text-gray-400 text-xs">🔒 Your information is secure and never shared.</p>
                  </motion.form>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Sidebar */}
            <motion.div
              initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.15 }}
              className="lg:col-span-2 space-y-6"
            >
              <div className="bg-[#1a2f5e] rounded-3xl p-8 text-white">
                <h3 className="text-lg font-bold mb-6" style={{ fontFamily: "var(--font-playfair)" }}>
                  Why Students Choose Us
                </h3>
                <ul className="space-y-4">
                  {[
                    "10 years of dedicated study abroad expertise",
                    "98% student visa approval rate",
                    "Direct tie-ups with 200+ global universities",
                    "End-to-end support from shortlisting to arrival",
                    "Scholarship assistance with a dedicated team",
                    "Free initial consultation — no hidden charges",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-3 text-white/80 text-sm">
                      <CheckCircle2 size={15} className="text-[#c9a84c] mt-0.5 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden">
                <div className="bg-gradient-to-br from-[#1a2f5e]/5 to-[#c9a84c]/5 px-6 py-5 border-b border-gray-100">
                  <h4 className="font-bold text-[#1a2f5e] mb-4 flex items-center gap-2">
                    <MapPin size={16} className="text-[#c9a84c]" /> Our Offices
                  </h4>
                  <div className="space-y-4">
                    <div>
                      <p className="text-xs font-semibold text-[#c9a84c] uppercase tracking-wider mb-1">🏢 Hyderabad</p>
                      <p className="text-gray-700 text-sm leading-relaxed">
                        H No 15-31-27, Dharma Reddy Colony,<br />
                        Ph 1 MRO Office Lane, KPHB Colony,<br />
                        Hyderabad – 500 072
                      </p>
                      <a href="https://maps.google.com/?q=KPHB+Colony+Hyderabad+500072"
                        target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[#c9a84c] text-xs font-semibold mt-1.5 hover:underline">
                        <MapPin size={11} /> Get Directions →
                      </a>
                    </div>
                    <div className="border-t border-gray-100 pt-4">
                      <p className="text-xs font-semibold text-[#c9a84c] uppercase tracking-wider mb-1">🏢 Guntur</p>
                      <p className="text-gray-700 text-sm leading-relaxed">
                        D. No: 3-28-41/5, 1st Floor,<br />
                        4th Line Brundavan Gardens,<br />
                        Opp. Yaganti Pearls Apartment, Guntur – 522006
                      </p>
                      <a href="https://maps.google.com/?q=Brundavan+Gardens+Guntur+522006"
                        target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[#c9a84c] text-xs font-semibold mt-1.5 hover:underline">
                        <MapPin size={11} /> Get Directions →
                      </a>
                    </div>
                  </div>
                </div>
                <div className="px-6 py-4">
                  <p className="text-gray-500 text-xs leading-relaxed">
                    Walk-ins welcome during office hours. Appointment booking recommended for personalized counseling sessions.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </>
  );
}
