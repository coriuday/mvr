import axios from "axios";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

/**
 * Pre-configured Axios instance for the Rust backend API.
 * Uses HttpOnly cookies for authentication and handles 401 responses.
 */
const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000,
});

// ---------------------------------------------------------------------------
// Response interceptor — handle 401 (token expiry)
// ---------------------------------------------------------------------------
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Backend now expects HttpOnly cookie, so we just make the request.
        await axios.post(
          `${API_BASE_URL}/api/auth/refresh`,
          {},
          { withCredentials: true }
        );

        // If refresh was successful, retry the original request
        return api(originalRequest);
      } catch {
        // Redirect to login on failure
        localStorage.removeItem("mvr_user"); // Also clear any cached user state
        if (typeof window !== "undefined") {
          window.location.href = "/admin/login";
        }
      }
    }

    return Promise.reject(error);
  }
);

export default api;
