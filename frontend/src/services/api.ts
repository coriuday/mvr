import axios from "axios";
import { apiUrl, getAxiosBaseUrl } from "@/lib/api-url";

/**
 * Pre-configured Axios instance for the Rust backend API.
 *
 * Auth strategy (httpOnly cookie via same-origin proxy):
 *   • Browser requests go to `/api/*` on the frontend domain (Vercel rewrites → Render).
 *   • `withCredentials: true` sends `mvr_access` / `mvr_refresh` httpOnly cookies.
 *   • Cookies are same-site, so SameSite=Lax works correctly (unlike cross-origin Render calls).
 */
const api = axios.create({
  baseURL: getAxiosBaseUrl(),
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000,
  withCredentials: true,
});

api.interceptors.request.use(
  (config) => config,
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        await axios.post(
          apiUrl("/api/auth/refresh"),
          {},
          { withCredentials: true }
        );

        return api(originalRequest);
      } catch {
        if (typeof window !== "undefined") {
          localStorage.removeItem("mvr_access_token");
          localStorage.removeItem("mvr_refresh_token");
          localStorage.removeItem("mvr_user");
          window.location.href = "/admin/login";
        }
      }
    }

    return Promise.reject(error);
  }
);

export default api;
