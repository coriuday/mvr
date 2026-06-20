/**
 * API URL helpers — same-origin in the browser, direct backend on the server.
 *
 * Browser requests use relative `/api/*` paths so httpOnly auth cookies stay
 * on the frontend domain (Vercel rewrites proxy to Render; nginx does the same locally).
 * Server components / SSR call the backend directly via BACKEND_URL.
 */

function serverBackendUrl(): string {
  return (
    process.env.BACKEND_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    "http://localhost:8080"
  ).replace(/\/$/, "");
}

/** Base URL without `/api` suffix. Empty string in the browser = same-origin. */
export function getApiBaseUrl(): string {
  if (typeof window !== "undefined") return "";
  return serverBackendUrl();
}

/** Full URL for an API path, e.g. `/api/auth/login`. */
export function apiUrl(path: string): string {
  const normalized = path.startsWith("/api/")
    ? path
    : `/api${path.startsWith("/") ? path : `/${path}`}`;
  const base = getApiBaseUrl();
  return base ? `${base}${normalized}` : normalized;
}

/** Axios `baseURL` — `/api` in browser, full backend URL on server. */
export function getAxiosBaseUrl(): string {
  const base = getApiBaseUrl();
  return base ? `${base}/api` : "/api";
}
