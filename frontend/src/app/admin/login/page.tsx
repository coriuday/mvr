"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Eye, EyeOff, LogIn, GraduationCap, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function AdminLoginPage() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // ← receive httpOnly Set-Cookie from backend
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || data.message || "Invalid credentials");

      // C-4 fix: Role validation is enforced server-side by the backend's /api/auth/me endpoint.
      // The useAdminAuth hook will redirect to this page if the session doesn't have ADMIN role.
      // We never trust client-side role data as a security boundary.
      localStorage.setItem("mvr_user", JSON.stringify(data.data?.user ?? {}));
      // Bug 1 fix: Use a hard browser redirect so the httpOnly Set-Cookie header is fully committed
      // before the admin page mounts and fires /api/auth/me. router.push/replace won't work here
      // because Next.js client-side navigation doesn't trigger a full browser request cycle.
      localStorage.setItem("mvr_login_ts", Date.now().toString());
      window.location.replace("/admin");
    } catch (err: unknown) {
      // L-7 fix: Show a generic message — never echo server internals to the UI
      const raw = err instanceof Error ? err.message : "";
      const isSafe = raw.length < 120 && !raw.includes("stack") && !raw.includes("DB error");
      setError(isSafe ? raw : "Login failed. Please check your credentials and try again.");
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f1c3d] to-[#1a2f5e] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-md"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-[#c9a84c]/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <GraduationCap size={32} className="text-[#c9a84c]" />
          </div>
          <h1 className="text-2xl font-bold text-white" style={{ fontFamily: "var(--font-playfair)" }}>
            MVR Admin
          </h1>
          <p className="text-white/50 text-sm mt-1">Sign in to manage your platform</p>
        </div>

        {/* Card */}
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="admin-email" className="text-white/80 text-sm font-medium">Email Address</Label>
              <Input
                id="admin-email"
                type="email"
                placeholder="Enter your Admin Mail"
                value={form.email}
                onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                required
                className="bg-white/10 border-white/20 text-white placeholder:text-white/30 rounded-xl h-11 focus-visible:ring-[#c9a84c]/50"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="admin-password" className="text-white/80 text-sm font-medium">Password</Label>
              <div className="relative">
                <Input
                  id="admin-password"
                  type={showPass ? "text" : "password"}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
                  required
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/30 rounded-xl h-11 pr-11 focus-visible:ring-[#c9a84c]/50"
                />
                <button
                  type="button"
                  onClick={() => setShowPass((p) => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors"
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2.5 bg-red-500/15 border border-red-500/30 text-red-300 rounded-xl px-4 py-3 text-sm">
                <AlertCircle size={15} className="shrink-0" />
                {error}
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-[#c9a84c] hover:bg-[#a07a2e] text-white font-bold rounded-xl transition-all hover:scale-[1.01] disabled:opacity-60"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.4 0 0 5.4 0 12h4z" />
                  </svg>
                  Signing in…
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <LogIn size={16} /> Sign In
                </span>
              )}
            </Button>
          </form>
        </div>

        <p className="text-center text-white/25 text-xs mt-6">
          MVR Consultants Admin Panel · Restricted Access
        </p>
      </motion.div>
    </div>
  );
}
