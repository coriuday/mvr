"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiUrl } from "@/lib/api-url";

interface AuthState {
  token: null;
  user: { name: string; email: string; role: string } | null;
  loading: boolean;
  isVerifying: boolean;
}

const ALLOWED_ROLES = ["ADMIN", "Admin"];

const MAX_RETRIES = 3;
const RETRY_DELAYS = [300, 800, 1500];

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
        const res = await fetch(apiUrl("/api/auth/me"), {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        });

        if (cancelled) return;

        if (res.ok) {
          const data = await res.json();
          const serverUser: { name: string; email: string; role: string } =
            data?.data ?? data?.user ?? data;

          if (!serverUser?.role || !ALLOWED_ROLES.includes(serverUser.role)) {
            router.replace("/admin/login");
            return;
          }

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

        if (res.status === 401 && attempt === 0) {
          const refreshRes = await fetch(apiUrl("/api/auth/refresh"), {
            method: "POST",
            credentials: "include",
            cache: "no-store",
          });
          if (!cancelled && refreshRes.ok) {
            setTimeout(() => verify(attempt + 1), 200);
            return;
          }
        }

        if (res.status !== 401 && attempt < MAX_RETRIES) {
          setTimeout(() => verify(attempt + 1), RETRY_DELAYS[attempt]);
          return;
        }

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
      await fetch(apiUrl("/api/auth/logout"), {
        method: "POST",
        credentials: "include",
      });
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
