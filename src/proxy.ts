import { auth } from "@customer/lib/auth";
import { NextResponse } from "next/server";

/**
 * i18n and Auth proxy for locale-prefixed URLs and protected routes.
 * Next.js 16 file convention: src/proxy.ts
 */
export default auth((req) => {
  const { pathname } = req.nextUrl;

  // Skip internal paths
  if (
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  const cleanPathname = pathname;
  const normalizedPath = cleanPathname.startsWith("/") ? cleanPathname.slice(1) : cleanPathname;

  // NextAuth v5 session check - req.auth contains the validated JWT session
  const isLoggedIn = !!req.auth;

  // Protected routes check
  if (
    normalizedPath.startsWith("dashboard/") ||
    normalizedPath === "dashboard" ||
    normalizedPath.startsWith("profile/") ||
    normalizedPath === "profile"
  ) {
    if (!isLoggedIn) {
      const loginUrl = req.nextUrl.clone();
      loginUrl.pathname = "/auth/login";
      return NextResponse.redirect(loginUrl);
    }
  }

  if (normalizedPath.startsWith("auth/") || normalizedPath === "auth") {
    // If accessing auth page but already logged in, redirect to dashboard
    if (isLoggedIn && !normalizedPath.startsWith("auth/logout")) {
      const dashboardUrl = req.nextUrl.clone();
      dashboardUrl.pathname = "/dashboard";
      return NextResponse.redirect(dashboardUrl);
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|feed.xml).*)"],
};
