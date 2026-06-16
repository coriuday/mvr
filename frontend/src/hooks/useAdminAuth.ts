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
}

// H-5 fix: Only ADMIN role is permitted in the admin panel.
// COUNSELOR was previously listed here but has been removed per the security policy decision.
// The real auth gate is the server-side /api/auth/me check below — this list
// only drives the client-side redirect after the server response is received.
const ALLOWED_ROLES = ["ADMIN", "Admin"];

export function useAdminAuth(): AuthState & { logout: () => void } {
  const router = useRouter();
  const [auth, setAuth] = useState<AuthState>({ token: null, user: null, loading: true });

  useEffect(() => {
    let cancelled = false;

    async function verifySession() {
      try {
        // Always verify with the server — cookie is the source of truth.
        const res = await fetch(`${API_BASE_URL}/api/auth/me`, {
          method: "GET",
          credentials: "include", // send httpOnly cookie
        });

        if (cancelled) return;

        if (!res.ok) {
          // 401 / 403 — clear any stale localStorage and redirect
          localStorage.removeItem("mvr_user");
          router.replace("/admin/login");
          return;
        }

        const data = await res.json();
        const serverUser: { name: string; email: string; role: string } = data?.data ?? data?.user ?? data;

        if (!serverUser?.role || !ALLOWED_ROLES.includes(serverUser.role)) {
          // Authenticated but not an admin/counselor
          router.replace("/admin/login");
          return;
        }

        // Persist display info only — never used for auth decisions
        localStorage.setItem("mvr_user", JSON.stringify({
          name: serverUser.name,
          email: serverUser.email,
          role: serverUser.role,
        }));

        setAuth({ token: null, user: serverUser, loading: false });
      } catch {
        if (!cancelled) {
          // Network error — redirect to login
          router.replace("/admin/login");
        }
      }
    }

    verifySession();
    return () => { cancelled = true; };
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
      router.replace("/admin/login");
    }
  };

  return { ...auth, logout };
}
