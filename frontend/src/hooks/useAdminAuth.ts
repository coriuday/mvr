"use client";

import { useCallback, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { apiUrl } from "@/lib/api-url";
import {
  canAccessPath,
  getDefaultAdminPath,
  isStaffRole,
} from "@/lib/admin-permissions";

interface AuthUser {
  id?: string;
  name: string;
  email: string;
  role: string;
  totp_enabled?: boolean;
}

interface AuthState {
  token: null;
  user: AuthUser | null;
  loading: boolean;
  isVerifying: boolean;
  verifyError: boolean;
}

const AUTH_FETCH_TIMEOUT_MS = 20_000;
const AUTH_MAX_RETRIES = 3;
const AUTH_RETRY_BASE_MS = 2_000;

function readCachedUser(): AuthUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem("mvr_user");
    if (!raw) return null;
    const parsed = JSON.parse(raw) as AuthUser;
    if (!parsed?.email) return null;
    return parsed;
  } catch {
    return null;
  }
}

function isTransientError(err: unknown): boolean {
  if (err instanceof Error) {
    return (
      err.name === "AbortError" ||
      err.message.toLowerCase().includes("failed to fetch")
    );
  }
  return false;
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

async function authFetchWithRetry(
  path: string,
  init?: RequestInit
): Promise<Response> {
  let lastErr: unknown;
  for (let attempt = 0; attempt < AUTH_MAX_RETRIES; attempt++) {
    try {
      return await authFetch(path, init);
    } catch (err) {
      lastErr = err;
      if (!isTransientError(err) || attempt === AUTH_MAX_RETRIES - 1) {
        throw err;
      }
      await new Promise((r) =>
        setTimeout(r, AUTH_RETRY_BASE_MS * (attempt + 1))
      );
    }
  }
  throw lastErr;
}

async function clearSession(): Promise<void> {
  try {
    await authFetch("/api/auth/clear", { method: "POST" });
  } catch {
    // Best-effort cookie clear
  }
}

function applyStaffRouteGuards(
  router: ReturnType<typeof useRouter>,
  pathname: string,
  serverUser: AuthUser
): void {
  if (!canAccessPath(serverUser.role, pathname)) {
    router.replace(getDefaultAdminPath(serverUser.role));
  }
}

export function useAdminAuth(): AuthState & {
  logout: () => void;
  retryVerify: () => void;
} {
  const router = useRouter();
  const pathname = usePathname();
  const onLoginPage = pathname === "/admin/login";
  const [verifyTick, setVerifyTick] = useState(0);
  const [auth, setAuth] = useState<AuthState>(() => {
    const cached = readCachedUser();
    return {
      token: null,
      user: cached,
      loading: !cached,
      isVerifying: !onLoginPage,
      verifyError: false,
    };
  });

  const retryVerify = useCallback(() => {
    setVerifyTick((n) => n + 1);
  }, []);

  useEffect(() => {
    if (onLoginPage) {
      setAuth({
        token: null,
        user: null,
        loading: false,
        isVerifying: false,
        verifyError: false,
      });
      return;
    }

    let cancelled = false;
    const cached = readCachedUser();

    async function verify(): Promise<void> {
      try {
        const res = await authFetchWithRetry("/api/auth/me", { method: "GET" });
        if (cancelled) return;

        if (res.ok) {
          const data = await res.json();
          const serverUser: AuthUser = data?.data ?? data?.user ?? data;

          if (!serverUser?.role || !isStaffRole(serverUser.role)) {
            localStorage.removeItem("mvr_user");
            await clearSession();
            setAuth({
              token: null,
              user: null,
              loading: false,
              isVerifying: false,
              verifyError: false,
            });
            router.replace("/admin/login");
            return;
          }

          localStorage.setItem("mvr_user", JSON.stringify(serverUser));
          setAuth({
            token: null,
            user: serverUser,
            loading: false,
            isVerifying: false,
            verifyError: false,
          });
          applyStaffRouteGuards(router, pathname, serverUser);
          return;
        }

        if (res.status === 401) {
          const refreshRes = await authFetchWithRetry("/api/auth/refresh", {
            method: "POST",
          });
          if (cancelled) return;

          if (refreshRes.ok) {
            const retryRes = await authFetchWithRetry("/api/auth/me", {
              method: "GET",
            });
            if (cancelled) return;

            if (retryRes.ok) {
              const data = await retryRes.json();
              const serverUser: AuthUser = data?.data ?? data?.user ?? data;
              if (serverUser?.role && isStaffRole(serverUser.role)) {
                localStorage.setItem("mvr_user", JSON.stringify(serverUser));
                setAuth({
                  token: null,
                  user: serverUser,
                  loading: false,
                  isVerifying: false,
                  verifyError: false,
                });
                applyStaffRouteGuards(router, pathname, serverUser);
                return;
              }
            }
          }
        }

        localStorage.removeItem("mvr_user");
        setAuth({
          token: null,
          user: null,
          loading: false,
          isVerifying: false,
          verifyError: false,
        });
        router.replace("/admin/login?session=expired");
      } catch {
        if (cancelled) return;

        if (cached && isStaffRole(cached.role)) {
          setAuth({
            token: null,
            user: cached,
            loading: false,
            isVerifying: false,
            verifyError: true,
          });
          return;
        }

        localStorage.removeItem("mvr_user");
        setAuth({
          token: null,
          user: null,
          loading: false,
          isVerifying: false,
          verifyError: false,
        });
        router.replace("/admin/login?session=expired");
      }
    }

    verify();
    return () => {
      cancelled = true;
    };
  }, [router, onLoginPage, verifyTick, pathname]);

  const logout = async () => {
    try {
      await authFetch("/api/auth/logout", { method: "POST" });
    } catch {
      // Still clear client state below
    }
    await clearSession();
    localStorage.removeItem("mvr_user");
    localStorage.removeItem("mvr_access_token");
    localStorage.removeItem("mvr_refresh_token");
    localStorage.removeItem("mvr_login_ts");
    router.replace("/admin/login?logout=1");
  };

  return { ...auth, logout, retryVerify };
}
