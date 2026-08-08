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

  // Kiểm tra phiên đăng nhập NextAuth v5 - req.auth chứa JWT session đã qua xác thực
  const isLoggedIn = !!req.auth?.user;
  /** Trạng thái chấp nhận điều khoản dịch vụ (mặc định true nếu chưa bị đánh dấu false) */
  const isTermsAccepted = (req.auth?.user as any)?.isTermsAccepted ?? true;

  // Danh sách các tuyến đường bắt buộc bảo mật (Protected routes)
  const isProtectedRoute =
    normalizedPath.startsWith("dashboard") ||
    normalizedPath.startsWith("profile") ||
    normalizedPath.startsWith("wallet") ||
    normalizedPath.startsWith("orders") ||
    normalizedPath.startsWith("developer");

  if (isProtectedRoute) {
    if (!isLoggedIn) {
      const loginUrl = req.nextUrl.clone();
      loginUrl.pathname = "/auth/login";
      return NextResponse.redirect(loginUrl);
    }
    if (!isTermsAccepted) {
      const loginUrl = req.nextUrl.clone();
      loginUrl.pathname = "/auth/login";
      return NextResponse.redirect(loginUrl);
    }
  }

  const searchParams = req.nextUrl.searchParams;
  const isSignedOut = searchParams.has("signedout") || searchParams.has("error") || searchParams.has("signedOut");

  if (normalizedPath.startsWith("auth/") || normalizedPath === "auth") {
    if (isLoggedIn && !normalizedPath.startsWith("auth/logout") && !isSignedOut) {
      if (isTermsAccepted) {
        const dashboardUrl = req.nextUrl.clone();
        dashboardUrl.pathname = "/dashboard";
        return NextResponse.redirect(dashboardUrl);
      }
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|feed.xml).*)"],
};
