import { env } from "@customer/env";
import { auth, getCustomerSessionCookieName } from "@customer/lib/auth";
import { decodeToken, signCustomerAccessToken } from "@flash-ship/ecom-lib/jwt";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

const inFlightRefreshes = new Map<string, Promise<string | undefined>>();

async function trySilentRefresh(refreshToken: unknown): Promise<string | undefined> {
  if (typeof refreshToken !== "string" || !refreshToken) return undefined;

  const existingInFlight = inFlightRefreshes.get(refreshToken);
  if (existingInFlight) {
    return existingInFlight;
  }

  const refreshPromise = (async () => {
    try {
      const refreshRes = await fetch(`${env.NEXT_PUBLIC_API_URL}/api/v1/customer/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      });
      if (refreshRes.ok) {
        const refreshJson = await refreshRes.json();
        return refreshJson?.data?.accessToken;
      }
    } catch (err) {
      console.warn("[tRPC Proxy] Silent refresh request failed:", err);
    }
    return undefined;
  })();

  inFlightRefreshes.set(refreshToken, refreshPromise);
  try {
    return await refreshPromise;
  } finally {
    inFlightRefreshes.delete(refreshToken);
  }
}

async function extractAuthToken(req: Request): Promise<string | undefined> {
  try {
    // 1. Try NextAuth auth() native helper (handles all cookie names & proxy headers)
    const session = (await auth()) as unknown as (Record<string, unknown> & { user?: { id?: string; email?: string } }) | null;
    
    let jwtToken = session?.accessToken as string | undefined;
    let refreshToken = session?.refreshToken;
    let userId = session?.user?.id;
    let userEmail = session?.user?.email;
    let tokenVersion = (session?.tokenVersion as number) || 1;

    // 2. Fallback to getToken trying all possible session cookie names (for Nginx SSL termination / cookie variations)
    if (!session?.user) {
      const possibleCookieNames = [
        getCustomerSessionCookieName(env.NODE_ENV === "production"),
        getCustomerSessionCookieName(false),
        getCustomerSessionCookieName(true),
        "authjs.session-token",
        "__Secure-authjs.session-token",
        "next-auth.session-token",
        "__Secure-next-auth.session-token",
      ];

      for (const cookieName of possibleCookieNames) {
        try {
          const nextAuthToken = await getToken({
            req: req as unknown as NextRequest,
            secret: env.AUTH_SECRET,
            cookieName,
          });

          if (nextAuthToken?.id || nextAuthToken?.accessToken) {
            jwtToken = nextAuthToken.accessToken as string | undefined;
            refreshToken = nextAuthToken.refreshToken;
            userId = nextAuthToken.id as string | undefined;
            userEmail = nextAuthToken.email as string | undefined;
            tokenVersion = (nextAuthToken.tokenVersion as number) || 1;
            break;
          }
        } catch {
          // Continue trying next cookie name
        }
      }
    }

    if (!userId && !jwtToken) return undefined;

    if (jwtToken) {
      const decoded = decodeToken(jwtToken);
      if (!decoded?.exp || decoded.exp * 1000 <= Date.now() + 10000) {
        jwtToken = undefined;
      }
    }

    if (!jwtToken && refreshToken) {
      jwtToken = await trySilentRefresh(refreshToken);
    }

    if (!jwtToken && userId) {
      jwtToken = signCustomerAccessToken({
        sub: String(userId),
        email: userEmail,
        tokenVersion,
      });
    }

    return jwtToken;
  } catch (e) {
    console.warn("[tRPC Proxy] Failed to extract NextAuth session token:", e);
    return undefined;
  }
}

const handler = async (req: Request) => {
  const url = new URL(req.url);
  const backendUrl = `${env.NEXT_PUBLIC_API_URL}/api/trpc${url.pathname.replace("/api/trpc", "")}${url.search}`;

  const headers = new Headers(req.headers);
  headers.set("host", new URL(env.NEXT_PUBLIC_API_URL).host);

  // Forward client IP and User-Agent for audit logs & rate limiters
  const clientIp = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip");
  if (clientIp) headers.set("x-forwarded-for", clientIp);

  // SEC-01: Delete any client-supplied authorization header to prevent spoofing
  headers.delete("authorization");

  const token = await extractAuthToken(req);
  if (token) {
    headers.set("authorization", `Bearer ${token}`);
  }

  // SEC-02: Delete raw browser cookies before forwarding to backend
  headers.delete("cookie");

  try {
    const res = await fetch(backendUrl, {
      method: req.method,
      headers,
      body: req.method !== "GET" && req.method !== "HEAD" ? await req.text() : undefined,
    });

    const responseHeaders = new Headers(res.headers);
    responseHeaders.delete("content-encoding");
    responseHeaders.delete("content-length");

    return new Response(res.body, {
      status: res.status,
      headers: responseHeaders,
    });
  } catch (error) {
    console.warn("[tRPC Proxy] Backend API unavailable or starting up:", (error as Error).message);
    return Response.json(
      [{ error: { json: { message: "Backend API unavailable or warming up", code: -32603 } } }],
      { status: 503 },
    );
  }
};

export { handler as GET, handler as POST };
