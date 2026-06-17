"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const API_BASE_URL =
  typeof window !== "undefined"
    ? (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080")
    : "http://localhost:8080";

interface AuthState {
  token: null; // always null — real token is in the httpOnly cookie
  user: { name: string; email: string; role: string } | null;
  /** true while the /api/auth/me check is in flight */
  loading: boolean;
  /** alias kept for backwards compat — same as loading */
  isVerifying: boolean;
}

// H-5 fix: Only ADMIN role is permitted in the admin panel.
// COUNSELOR was previously listed here but has been removed per the security policy decision.
// The real auth gate is the server-side /api/auth/me check below — this list
// only drives the client-side redirect after the server response is received.
const ALLOWED_ROLES = ["ADMIN", "Admin"];

const MAX_RETRIES = 3;
const RETRY_DELAYS = [300, 800, 1500]; // ms

export function useAdminAuth(): AuthState & { logout: () => void } {
  const router = useRouter();
  const [auth, setAuth] = useState<AuthState>({
    token: null,
    user: null,
    loading: true,
    isVerifying: true,
  });

  useEffect(() => {
    let cancelled = false;

    async function verify(attempt = 0): Promise<void> {
      try {
        const res = await fetch(`${API_BASE_URL}/api/auth/me`, {
          method: "GET",
          credentials: "include", // send httpOnly cookie
          cache: "no-store",
        });

        if (cancelled) return;

        if (res.ok) {
          const data = await res.json();
          const serverUser: { name: string; email: string; role: string } =
            data?.data ?? data?.user ?? data;

          if (!serverUser?.role || !ALLOWED_ROLES.includes(serverUser.role)) {
            // Authenticated but not an admin
            router.replace("/admin/login");
            return;
          }

          // Persist display info only — never used for auth decisions
          localStorage.setItem(
            "mvr_user",
            JSON.stringify({
              name: serverUser.name,
              email: serverUser.email,
              role: serverUser.role,
            })
          );

          setAuth({ token: null, user: serverUser, loading: false, isVerifying: false });
          return;
        }

        // 401: try a token refresh before giving up (attempt 0 only)
        if (res.status === 401 && attempt === 0) {
          const refreshRes = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
            method: "POST",
            credentials: "include",
            cache: "no-store",
          });
          if (!cancelled && refreshRes.ok) {
            // Retry verification immediately after refresh
            setTimeout(() => verify(attempt + 1), 200);
            return;
          }
        }

        // Retry with exponential backoff for transient failures (non-401)
        if (res.status !== 401 && attempt < MAX_RETRIES) {
          setTimeout(() => verify(attempt + 1), RETRY_DELAYS[attempt]);
          return;
        }

        // All retries exhausted — treat as unauthenticated
        if (!cancelled) {
          localStorage.removeItem("mvr_user");
          setAuth({ token: null, user: null, loading: false, isVerifying: false });
          router.replace("/admin/login");
        }
      } catch {
        if (cancelled) return;
        if (attempt < MAX_RETRIES) {
          setTimeout(() => verify(attempt + 1), RETRY_DELAYS[attempt] ?? 1500);
        } else {
          setAuth({ token: null, user: null, loading: false, isVerifying: false });
          router.replace("/admin/login");
        }
      }
    }

    verify();
    return () => {
      cancelled = true;
    };
  }, [router]);

  const logout = async () => {
    try {
      // Ask the backend to set Max-Age=0 on both auth cookies.
      // withCredentials ensures the cookies are sent so the backend
      // can identify the session and clear it.
      await fetch(`${API_BASE_URL}/api/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch {
      // Swallow network errors — we still clear client state below
    } finally {
      localStorage.removeItem("mvr_user");
      localStorage.removeItem("mvr_access_token"); // clean up pre-migration remnants
      localStorage.removeItem("mvr_refresh_token");
      localStorage.removeItem("mvr_login_ts");
      router.replace("/admin/login");
    }
  };

  return { ...auth, logout };
}
