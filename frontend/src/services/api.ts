import axios from "axios";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

/**
 * Pre-configured Axios instance for the Rust backend API.
 *
 * Auth strategy (httpOnly cookie):
 *   • `withCredentials: true` tells the browser to send the `mvr_access`
 *     and `mvr_refresh` httpOnly cookies on every cross-origin request.
 *   • The backend CORS config already has `allow_credentials(true)` and an
 *     explicit allowed-origin list, which is required by the spec.
 *   • The access token is in an httpOnly cookie so JavaScript cannot read or
 *     steal it — this eliminates the XSS token-theft risk of localStorage.
 *   • The refresh token is scoped to `Path=/api/auth` so it is only sent
 *     to the refresh endpoint, not to every API call.
 */
const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000,
  withCredentials: true, // send httpOnly cookies on every request
});

// ---------------------------------------------------------------------------
// Request interceptor — cookie auth is automatic via withCredentials.
// The Authorization header is intentionally NOT set here; the browser
// attaches the mvr_access cookie instead.  If a caller explicitly provides
// a token (e.g. server-side API calls during SSR), they can set it manually.
// ---------------------------------------------------------------------------
api.interceptors.request.use(
  (config) => config,
  (error) => Promise.reject(error)
);

// ---------------------------------------------------------------------------
// Response interceptor — handle 401 (cookie expired, attempt silent refresh)
// ---------------------------------------------------------------------------
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Only attempt refresh once per request to avoid infinite loops
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // POST to /api/auth/refresh with credentials so the browser sends
        // the mvr_refresh cookie.  The backend reads the cookie and issues
        // new tokens, setting fresh Set-Cookie headers in the response.
        await axios.post(
          `${API_BASE_URL}/api/auth/refresh`,
          {}, // empty body — token comes from cookie
          { withCredentials: true }
        );

        // The browser now has fresh mvr_access/mvr_refresh cookies.
        // Retry the original request — the new cookie is sent automatically.
        return api(originalRequest);
      } catch {
        // Refresh failed (cookie expired or revoked) — force re-login.
        // Clear any residual localStorage data from before the migration.
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
