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
  /** Trạng thái chấp nhận điều khoản dịch vụ (mặc định false nếu chưa xác nhận) */
  const isTermsAccepted = (req.auth?.user as any)?.isTermsAccepted ?? false;

  // Danh sách các tuyến đường bắt buộc bảo mật (Protected routes)
  const isProtectedRoute =
    normalizedPath.startsWith("dashboard") ||
    normalizedPath.startsWith("profile") ||
    normalizedPath.startsWith("wallet") ||
    normalizedPath.startsWith("orders") ||
    normalizedPath.startsWith("developer");

  if (isProtectedRoute) {
    /** 1. Nếu chưa đăng nhập -> Chuyển hướng về màn hình đăng nhập /auth/login */
    if (!isLoggedIn) {
      const loginUrl = req.nextUrl.clone();
      loginUrl.pathname = "/auth/login";
      return NextResponse.redirect(loginUrl);
    }
    /**
     * 2. Kiểm Tra Bảo Mật Cấp Edge Server:
     * Nếu chưa chấp nhận điều khoản (isTermsAccepted === false), chặn đứng việc truy cập trang bảo mật
     * và chuyển hướng về /auth/login để hiển thị Modal xác nhận điều khoản dịch vụ.
     */
    if (!isTermsAccepted) {
      const loginUrl = req.nextUrl.clone();
      loginUrl.pathname = "/auth/login";
      return NextResponse.redirect(loginUrl);
    }
  }

  if (normalizedPath.startsWith("auth/") || normalizedPath === "auth") {
    /**
     * Nếu đang truy cập trang Auth nhưng đã đăng nhập:
     * CHỈ tự động điều hướng vào /dashboard khi ĐÃ chấp nhận điều khoản (isTermsAccepted === true).
     * Nếu CHƯA chấp nhận điều khoản, cho phép ở lại /auth/login để hiển thị Modal xác nhận.
     */
    if (isLoggedIn && !normalizedPath.startsWith("auth/logout")) {
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
