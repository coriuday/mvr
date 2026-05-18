"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/services/api";

interface AuthState {
  user: { name: string; email: string; role: string } | null;
}

export function useAdminAuth(): AuthState & { logout: () => void } {
  const router = useRouter();
  const [auth, setAuth] = useState<AuthState>({ user: null });

  useEffect(() => {
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
      setAuth({ user });
    } catch {
      router.replace("/admin/login");
    }
  }, [router]);

  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } catch (e) {
      console.error("Logout error", e);
    } finally {
      localStorage.removeItem("mvr_user");
      router.replace("/admin/login");
    }
  };

  return { ...auth, logout };
}
