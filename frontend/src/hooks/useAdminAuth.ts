"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { apiUrl } from "@/lib/api-url";

interface AuthUser {
  name: string;
  email: string;
  role: string;
}

interface AuthState {
  token: null;
  user: AuthUser | null;
  loading: boolean;
  isVerifying: boolean;
}

const AUTH_FETCH_TIMEOUT_MS = 12_000;

function readCachedUser(): AuthUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem("mvr_user");
    if (!raw) return null;
    const parsed = JSON.parse(raw) as AuthUser;
    if (!parsed?.email || !parsed?.name) return null;
    return parsed;
  } catch {
    return null;
  }
}

function isAdminRole(role: unknown): boolean {
  const normalized = String(role ?? "").toUpperCase();
  return normalized === "ADMIN";
}

async function authFetch(
  path: string,
  init?: RequestInit
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), AUTH_FETCH_TIMEOUT_MS);
  try {
    return await fetch(apiUrl(path), {
      ...init,
      credentials: "include",
      cache: "no-store",
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeoutId);
  }
}

export function useAdminAuth(): AuthState & { logout: () => void } {
  const router = useRouter();
  const pathname = usePathname();
  const onLoginPage = pathname === "/admin/login";
  const [auth, setAuth] = useState<AuthState>(() => {
    const cached = readCachedUser();
    return {
      token: null,
      user: cached,
      loading: !cached,
      isVerifying: !onLoginPage,
    };
  });

  useEffect(() => {
    if (onLoginPage) {
      setAuth({ token: null, user: null, loading: false, isVerifying: false });
      return;
    }

    let cancelled = false;

    async function verify(): Promise<void> {
      try {
        const res = await authFetch("/api/auth/me", { method: "GET" });
        if (cancelled) return;

        if (res.ok) {
          const data = await res.json();
          const serverUser: AuthUser = data?.data ?? data?.user ?? data;

          if (!serverUser?.role || !isAdminRole(serverUser.role)) {
            localStorage.removeItem("mvr_user");
            try {
              await authFetch("/api/auth/clear", { method: "POST" });
            } catch {
              // Best-effort cookie clear
            }
            setAuth({ token: null, user: null, loading: false, isVerifying: false });
            router.replace("/admin/login");
            return;
          }

          localStorage.setItem("mvr_user", JSON.stringify(serverUser));
          setAuth({
            token: null,
            user: serverUser,
            loading: false,
            isVerifying: false,
          });
          return;
        }

        if (res.status === 401) {
          const refreshRes = await authFetch("/api/auth/refresh", {
            method: "POST",
          });
          if (cancelled) return;

          if (refreshRes.ok) {
            const retryRes = await authFetch("/api/auth/me", { method: "GET" });
            if (cancelled) return;

            if (retryRes.ok) {
              const data = await retryRes.json();
              const serverUser: AuthUser = data?.data ?? data?.user ?? data;
              if (serverUser?.role && isAdminRole(serverUser.role)) {
                localStorage.setItem("mvr_user", JSON.stringify(serverUser));
                setAuth({
                  token: null,
                  user: serverUser,
                  loading: false,
                  isVerifying: false,
                });
                return;
              }
            }
          }
        }

        localStorage.removeItem("mvr_user");
        try {
          await authFetch("/api/auth/clear", { method: "POST" });
        } catch {
          // Best-effort cookie clear
        }
        setAuth({ token: null, user: null, loading: false, isVerifying: false });
        router.replace("/admin/login");
      } catch {
        if (cancelled) return;
        localStorage.removeItem("mvr_user");
        try {
          await authFetch("/api/auth/clear", { method: "POST" });
        } catch {
          // Best-effort cookie clear
        }
        setAuth({ token: null, user: null, loading: false, isVerifying: false });
        router.replace("/admin/login");
      }
    }

    verify();
    return () => {
      cancelled = true;
    };
  }, [router, onLoginPage]);

  const logout = async () => {
    try {
      await authFetch("/api/auth/logout", { method: "POST" });
    } catch {
      // Still clear client state below
    } finally {
      localStorage.removeItem("mvr_user");
      localStorage.removeItem("mvr_access_token");
      localStorage.removeItem("mvr_refresh_token");
      localStorage.removeItem("mvr_login_ts");
      router.replace("/admin/login");
    }
  };

  return { ...auth, logout };
}
