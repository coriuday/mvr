"use client";

import { useState, useEffect, useLayoutEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Eye, EyeOff, LogIn, GraduationCap, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { apiUrl } from "@/lib/api-url";

const LOGIN_TIMEOUT_MS = 25_000;
const NETWORK_RETRY_DELAY_MS = 2_000;

const NETWORK_ERROR_MSG =
  "Could not reach the server. Use www.mvrconsultants.org, wait 30s for the API to wake up, and disable ad-blockers for this site.";

function isNetworkError(err: unknown): boolean {
  if (!(err instanceof Error)) return false;
  return err.message.toLowerCase().includes("failed to fetch");
}

async function fetchWithTimeout(
  url: string,
  init: RequestInit,
  timeoutMs = LOGIN_TIMEOUT_MS
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timeoutId);
  }
}

async function loginRequest(
  email: string,
  password: string,
  retry = true
): Promise<Response> {
  try {
    return await fetchWithTimeout(apiUrl("/api/auth/login"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      cache: "no-store",
      body: JSON.stringify({ email, password }),
    });
  } catch (err) {
    if (retry && isNetworkError(err)) {
      await new Promise((r) => setTimeout(r, NETWORK_RETRY_DELAY_MS));
      return loginRequest(email, password, false);
    }
    throw err;
  }
}

async function completeLoginFromResponse(
  res: Response,
  onSuccess: () => void
): Promise<void> {
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
    const meRes = await fetchWithTimeout(apiUrl("/api/auth/me"), {
      method: "GET",
      credentials: "include",
      cache: "no-store",
    });
    if (meRes.ok) {
      const meData = await meRes.json();
      const user = meData?.data ?? meData?.user ?? meData;
      localStorage.setItem("mvr_user", JSON.stringify(user ?? {}));
      localStorage.setItem("mvr_login_ts", Date.now().toString());
      onSuccess();
      return;
    }
    throw new Error(
      "Login succeeded but the server returned no data. Please try again."
    );
  }

  if (!res.ok) {
    throw new Error(
      data.error?.message || data.message || "Invalid credentials"
    );
  }

  localStorage.setItem("mvr_user", JSON.stringify(data.data?.user ?? {}));
  localStorage.setItem("mvr_login_ts", Date.now().toString());
  onSuccess();
}

export default function AdminLoginPage() {
  const router = useRouter();
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isApexDomain, setIsApexDomain] = useState(false);
  const [formKey, setFormKey] = useState(0);
  const [apexRedirecting, setApexRedirecting] = useState(false);

  useLayoutEffect(() => {
    if (window.location.hostname === "mvrconsultants.org") {
      setApexRedirecting(true);
      window.location.replace(
        `https://www.mvrconsultants.org${window.location.pathname}${window.location.search}`
      );
    }
  }, []);

  useEffect(() => {
    setShowPass(false);

    const loggedOut =
      new URLSearchParams(window.location.search).get("logout") === "1";
    if (loggedOut) {
      localStorage.removeItem("mvr_user");
      localStorage.removeItem("mvr_login_ts");
      localStorage.removeItem("mvr_access_token");
      localStorage.removeItem("mvr_refresh_token");
      setFormKey((k) => k + 1);
    }

    // Wake Render backend before the user clicks Sign In.
    fetchWithTimeout("/health", { method: "GET", cache: "no-store" }, 15_000).catch(
      () => {}
    );

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12_000);
    fetch(apiUrl("/api/auth/me"), {
      credentials: "include",
      cache: "no-store",
      signal: controller.signal,
    })
      .then((res) => {
        if (res.ok) router.replace("/admin");
      })
      .catch(() => {})
      .finally(() => clearTimeout(timeoutId));

    return () => {
      clearTimeout(timeoutId);
      controller.abort();
    };
  }, [router]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (
      typeof window !== "undefined" &&
      window.location.hostname === "mvrconsultants.org"
    ) {
      window.location.replace(
        `https://www.mvrconsultants.org/admin/login${window.location.search}`
      );
      return;
    }

    const fd = new FormData(e.currentTarget);
    const email = String(fd.get("mvr-admin-email") ?? "").trim();
    const password = String(fd.get("mvr-admin-password") ?? "");

    if (!email || !password) {
      setError("Email and password are required");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await loginRequest(email, password);
      await completeLoginFromResponse(res, () => router.replace("/admin"));
    } catch (err: unknown) {
      if (err instanceof Error && err.name === "AbortError") {
        setError(
          "Request timed out. The API may be waking up — wait a moment and try again."
        );
        return;
      }
      if (isNetworkError(err)) {
        setError(NETWORK_ERROR_MSG);
        return;
      }
      const raw = err instanceof Error ? err.message : "";
      const isSafe =
        raw.length < 120 && !raw.includes("stack") && !raw.includes("DB error");
      setError(
        isSafe ? raw : "Login failed. Please check your credentials and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  if (apexRedirecting) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f1c3d] to-[#1a2f5e] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-[#c9a84c]/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <GraduationCap size={32} className="text-[#c9a84c]" />
          </div>
          <h1
            className="text-2xl font-bold text-white"
            style={{ fontFamily: "var(--font-playfair)" }}
          >
            MVR Admin
          </h1>
          <p className="text-white/50 text-sm mt-1">Sign in to manage your platform</p>
        </div>

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
            key={formKey}
            onSubmit={handleSubmit}
            className="space-y-5"
            autoComplete="off"
          >
            <div className="space-y-1.5">
              <Label
                htmlFor="admin-email"
                className="text-white/80 text-sm font-medium"
              >
                Email Address
              </Label>
              <Input
                id="admin-email"
                name="mvr-admin-email"
                type="email"
                inputMode="email"
                placeholder="Enter your Admin Mail"
                defaultValue=""
                autoComplete="email"
                autoCorrect="off"
                autoCapitalize="none"
                spellCheck={false}
                required
                className="admin-login-input bg-white/10 border-white/20 text-white placeholder:text-white/30 rounded-xl h-11 focus-visible:ring-[#c9a84c]/50"
              />
            </div>

            <div className="space-y-1.5">
              <Label
                htmlFor="admin-password"
                className="text-white/80 text-sm font-medium"
              >
                Password
              </Label>
              <div className="relative">
                <Input
                  id="admin-password"
                  name="mvr-admin-password"
                  type={showPass ? "text" : "password"}
                  placeholder="••••••••"
                  defaultValue=""
                  autoComplete="current-password"
                  required
                  className="admin-login-input bg-white/10 border-white/20 text-white placeholder:text-white/30 rounded-xl h-11 pr-12 focus-visible:ring-[#c9a84c]/50"
                />
                <button
                  type="button"
                  onClick={() => setShowPass((p) => !p)}
                  aria-label={showPass ? "Hide password" : "Show password"}
                  title={showPass ? "Hide password" : "Show password"}
                  className="absolute right-1.5 top-1/2 z-10 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-lg border border-white/25 bg-[#0f1c3d] text-[#c9a84c] hover:bg-[#1a2f5e] transition-colors"
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
                  <svg
                    className="animate-spin h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.4 0 0 5.4 0 12h4z"
                    />
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
