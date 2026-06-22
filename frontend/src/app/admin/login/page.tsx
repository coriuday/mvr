"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Eye, EyeOff, LogIn, GraduationCap, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { apiUrl } from "@/lib/api-url";

const EMPTY_FORM = { email: "", password: "" };

export default function AdminLoginPage() {
  const [form, setForm] = useState(EMPTY_FORM);
  const [showPass, setShowPass] = useState(false);
  const [fieldsReady, setFieldsReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isApexDomain, setIsApexDomain] = useState(false);

  useEffect(() => {
    setForm(EMPTY_FORM);
    setShowPass(false);
    setFieldsReady(false);

    let autofillGuard: ReturnType<typeof setTimeout> | undefined;

    // After logout, strip any saved client session metadata (not passwords).
    const loggedOut =
      new URLSearchParams(window.location.search).get("logout") === "1";
    if (loggedOut) {
      localStorage.removeItem("mvr_user");
      localStorage.removeItem("mvr_login_ts");
      localStorage.removeItem("mvr_access_token");
      localStorage.removeItem("mvr_refresh_token");
      // Browsers may autofill after paint — clear again once on return from logout.
      autofillGuard = setTimeout(() => {
        setForm(EMPTY_FORM);
        setShowPass(false);
      }, 150);
    }

    if (window.location.hostname === "mvrconsultants.org") {
      setIsApexDomain(true);
      window.location.replace(
        `https://www.mvrconsultants.org${window.location.pathname}${window.location.search}`
      );
      return () => {
        if (autofillGuard) clearTimeout(autofillGuard);
      };
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12_000);
    fetch(apiUrl("/api/auth/me"), {
      credentials: "include",
      cache: "no-store",
      signal: controller.signal,
    })
      .then((res) => {
        if (res.ok) window.location.replace("/admin");
      })
      .catch(() => {})
      .finally(() => clearTimeout(timeoutId));

    return () => {
      if (autofillGuard) clearTimeout(autofillGuard);
      clearTimeout(timeoutId);
      controller.abort();
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Apex domain (mvrconsultants.org) is not on Vercel — API calls fail there.
    if (
      typeof window !== "undefined" &&
      window.location.hostname === "mvrconsultants.org"
    ) {
      window.location.replace(
        `https://www.mvrconsultants.org/admin/login${window.location.search}`
      );
      return;
    }

    setLoading(true);
    setError("");
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 25_000);
    try {
      const res = await fetch(apiUrl("/api/auth/login"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        signal: controller.signal,
        body: JSON.stringify(form),
      });
      clearTimeout(timeoutId);

      const raw = await res.text();
      let data: {
        error?: { message?: string };
        message?: string;
        data?: { user?: unknown };
      } = {};

      if (raw.trim()) {
        try {
          data = JSON.parse(raw) as typeof data;
        } catch {
          throw new Error(
            raw.length < 160
              ? raw
              : "The API returned an unexpected response. Try again in a moment."
          );
        }
      } else if (res.ok) {
        // Proxy used to drop JSON bodies on Set-Cookie responses; cookies may still be set.
        const meRes = await fetch(apiUrl("/api/auth/me"), {
          credentials: "include",
          cache: "no-store",
        });
        if (meRes.ok) {
          const meData = await meRes.json();
          const user = meData?.data ?? meData?.user ?? meData;
          localStorage.setItem("mvr_user", JSON.stringify(user ?? {}));
          localStorage.setItem("mvr_login_ts", Date.now().toString());
          window.location.replace("/admin");
          return;
        }
        throw new Error("Login succeeded but the server returned no data. Please try again.");
      }

      if (!res.ok) {
        throw new Error(data.error?.message || data.message || "Invalid credentials");
      }

      localStorage.setItem("mvr_user", JSON.stringify(data.data?.user ?? {}));
      localStorage.setItem("mvr_login_ts", Date.now().toString());
      window.location.replace("/admin");
    } catch (err: unknown) {
      clearTimeout(timeoutId);
      if (err instanceof Error && err.name === "AbortError") {
        setError(
          "Request timed out. The API may be waking up — wait a moment and try again. Use www.mvrconsultants.org (not the apex domain)."
        );
        return;
      }
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
          {isApexDomain && (
              <div className="mb-5 flex items-start gap-2.5 bg-amber-500/15 border border-amber-500/30 text-amber-100 rounded-xl px-4 py-3 text-sm">
                <AlertCircle size={15} className="shrink-0 mt-0.5" />
                <span>
                  Use{" "}
                  <a
                    href="https://www.mvrconsultants.org/admin/login"
                    className="underline font-semibold text-white"
                  >
                    www.mvrconsultants.org
                  </a>{" "}
                  to sign in — the address without www cannot reach the admin API.
                </span>
              </div>
            )}
          <form
            onSubmit={handleSubmit}
            className="space-y-5"
            autoComplete="off"
          >
            {/* Decoy fields discourage browser password manager autofill */}
            <input
              type="text"
              name="prevent_autofill_username"
              autoComplete="username"
              tabIndex={-1}
              aria-hidden="true"
              className="hidden"
              defaultValue=""
            />
            <input
              type="password"
              name="prevent_autofill_password"
              autoComplete="current-password"
              tabIndex={-1}
              aria-hidden="true"
              className="hidden"
              defaultValue=""
            />

            <div className="space-y-1.5">
              <Label htmlFor="admin-email" className="text-white/80 text-sm font-medium">Email Address</Label>
              <Input
                id="admin-email"
                name="mvr-admin-email"
                type="email"
                inputMode="email"
                placeholder="Enter your Admin Mail"
                value={form.email}
                onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                onFocus={() => setFieldsReady(true)}
                readOnly={!fieldsReady}
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="none"
                spellCheck={false}
                required
                className="bg-white/10 border-white/20 text-white placeholder:text-white/30 rounded-xl h-11 focus-visible:ring-[#c9a84c]/50"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="admin-password" className="text-white/80 text-sm font-medium">Password</Label>
              <div className="relative">
                <Input
                  id="admin-password"
                  name="mvr-admin-password"
                  type={showPass ? "text" : "password"}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
                  onFocus={() => setFieldsReady(true)}
                  readOnly={!fieldsReady}
                  autoComplete="new-password"
                  required
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/30 rounded-xl h-11 pr-12 focus-visible:ring-[#c9a84c]/50"
                />
                <button
                  type="button"
                  onClick={() => setShowPass((p) => !p)}
                  aria-label={showPass ? "Hide password" : "Show password"}
                  title={showPass ? "Hide password" : "Show password"}
                  className="absolute right-2 top-1/2 z-10 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-lg text-white/50 hover:bg-white/10 hover:text-white transition-colors"
                >
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
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
