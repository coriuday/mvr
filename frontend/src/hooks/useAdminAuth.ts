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
}

export function useAdminAuth(): AuthState & { logout: () => void } {
  const router = useRouter();
  const [auth, setAuth] = useState<AuthState>({ token: null, user: null });

  useEffect(() => {
    // Read the user profile from localStorage for immediate display.
    // The real authentication is enforced by the httpOnly cookie;
    // if the cookie is missing the next API call will 401 → redirect.
    const userStr = localStorage.getItem("mvr_user");
    if (!userStr) {
      router.replace("/admin/login");
      return;
    }
    try {
      const user = JSON.parse(userStr);
      if (user.role !== "ADMIN" && user.role !== "Admin") {
        router.replace("/admin/login");
        return;
      }
      setAuth({ token: null, user });
    } catch {
      router.replace("/admin/login");
    }
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
