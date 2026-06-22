import { NextRequest, NextResponse } from "next/server";
import { resolveBackendUrl } from "@/lib/backend-url";

export const runtime = "nodejs";

const PROXY_TIMEOUT_MS = 25_000;

const HOP_BY_HOP = new Set([
  "connection",
  "keep-alive",
  "proxy-authenticate",
  "proxy-authorization",
  "te",
  "trailers",
  "transfer-encoding",
  "upgrade",
  "host",
]);

async function proxyRequest(req: NextRequest, pathSegments: string[]) {
  const backend = resolveBackendUrl();
  const target = `${backend}/api/${pathSegments.join("/")}${req.nextUrl.search}`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), PROXY_TIMEOUT_MS);

  const forwardHeaders = new Headers();
  req.headers.forEach((value, key) => {
    if (!HOP_BY_HOP.has(key.toLowerCase())) {
      forwardHeaders.set(key, value);
    }
  });

  const hasBody = req.method !== "GET" && req.method !== "HEAD";
  const body = hasBody ? await req.arrayBuffer() : undefined;

  try {
    const upstream = await fetch(target, {
      method: req.method,
      headers: forwardHeaders,
      body,
      signal: controller.signal,
      cache: "no-store",
    });

    const responseHeaders = new Headers();
    upstream.headers.forEach((value, key) => {
      if (!HOP_BY_HOP.has(key.toLowerCase())) {
        responseHeaders.append(key, value);
      }
    });

    // Node 18+ / undici: forward all Set-Cookie headers (login auth cookies).
    const cookies = upstream.headers.getSetCookie?.();
    if (cookies?.length) {
      responseHeaders.delete("set-cookie");
      for (const cookie of cookies) {
        responseHeaders.append("set-cookie", cookie);
      }
    }

    return new NextResponse(upstream.body, {
      status: upstream.status,
      statusText: upstream.statusText,
      headers: responseHeaders,
    });
  } catch (err) {
    const timedOut = err instanceof Error && err.name === "AbortError";
    console.error("[api proxy]", timedOut ? "timeout" : "error", target, err);
    return NextResponse.json(
      {
        success: false,
        error: {
          message: timedOut
            ? "API request timed out. The backend may be waking up — try again in a moment."
            : "Cannot reach the API server. Check BACKEND_URL or ensure the backend is running.",
        },
      },
      { status: 503 }
    );
  } finally {
    clearTimeout(timeout);
  }
}

type RouteContext = { params: Promise<{ path: string[] }> };

async function handle(req: NextRequest, context: RouteContext) {
  const { path } = await context.params;
  return proxyRequest(req, path);
}

export const GET = handle;
export const POST = handle;
export const PUT = handle;
export const PATCH = handle;
export const DELETE = handle;
