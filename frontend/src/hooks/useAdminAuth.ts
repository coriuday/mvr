"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface AuthState {
  token: string | null;
  user: { name: string; email: string; role: string } | null;
}

export function useAdminAuth(): AuthState & { logout: () => void } {
  const router = useRouter();
  const [auth, setAuth] = useState<AuthState>({ token: null, user: null });

  useEffect(() => {
    const token = localStorage.getItem("mvr_access_token");
    const userStr = localStorage.getItem("mvr_user");
    if (!token || !userStr) {
      router.replace("/admin/login");
      return;
    }
    try {
      const user = JSON.parse(userStr);
      if (user.role !== "ADMIN" && user.role !== "Admin") {
        router.replace("/admin/login");
        return;
      }
      setAuth({ token, user });
    } catch {
      router.replace("/admin/login");
    }
  }, [router]);

  const logout = () => {
    localStorage.removeItem("mvr_access_token");
    localStorage.removeItem("mvr_refresh_token");
    localStorage.removeItem("mvr_user");
    router.replace("/admin/login");
  };

  return { ...auth, logout };
}
