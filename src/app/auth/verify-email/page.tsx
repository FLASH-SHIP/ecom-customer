"use client";

/**
 * @file VerifyEmailPage.tsx
 * @description Màn hình Xử Lý Xác Thực Email (Customer Verify Email Page).
 * Đọc token xác thực từ URL query parameters, gọi API tRPC xác minh và hiển thị kết quả thành công/thất bại.
 * 
 * 100% Code Comment & Ghi chú bằng Tiếng Việt giúp dễ dàng bảo trì.
 */

import { translate } from "@flash-ship/ecom-i18n";
import { useI18n } from "@ecom/shared/@i18n";
import { CheckCircle, Loader2, XCircle } from "lucide-react";
import NextLink from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { AuthCard } from "../../../components/auth/AuthCard";
import { trpc } from "../../../lib/trpc";

/**
 * Component xử lý nội dung xác thực Email chính
 */
function VerifyEmailContent() {
  const { languageId: currentLocale } = useI18n();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

  /** Mutation tRPC gửi token xác thực email lên Backend */
  const verifyMutation = trpc.customer.auth.verifyEmail.useMutation();

  // Nếu không có token trên URL: Hiển thị màn hình lỗi token không hợp lệ
  if (!token) {
    return (
      <div className="text-center flex flex-col items-center gap-3 py-4 select-none animate-in fade-in-0 duration-200">
        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-rose-50 dark:bg-rose-950/20 text-rose-500 shadow-sm mb-1">
          <XCircle className="w-6 h-6" />
        </div>
        <h1 className="text-xl font-bold text-foreground">
          {translate("customerAuth.verifyEmail.invalidTokenTitle", currentLocale)}
        </h1>
        <p className="text-xs sm:text-sm font-semibold text-muted-foreground max-w-[280px] leading-relaxed">
          {translate("customerAuth.verifyEmail.invalidTokenDesc", currentLocale)}
        </p>
        <NextLink
          href="/auth/login"
          className="flex w-full items-center justify-center rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 h-11 text-sm font-semibold shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 text-center mt-3"
        >
          {translate("customerAuth.verifyEmail.backToLogin", currentLocale)}
        </NextLink>
      </div>
    );
  }

  // Tự động gửi lệnh xác thực khi mutation ở trạng thái idle
  if (verifyMutation.isIdle) {
    verifyMutation.mutate({ token });
  }

  // Trạng thái đang xử lý xác thực token
  if (verifyMutation.isPending) {
    return (
      <div className="text-center flex flex-col items-center gap-3 py-6 select-none animate-in fade-in-0 duration-200">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <h1 className="text-lg font-bold text-foreground mt-2">
          {translate("customerAuth.verifyEmail.verifyingTitle", currentLocale)}
        </h1>
        <p className="text-xs text-muted-foreground font-semibold">
          {translate("customerAuth.verifyEmail.verifyingDesc", currentLocale)}
        </p>
      </div>
    );
  }

  // Trạng thái xác thực thất bại
  if (verifyMutation.isError) {
    return (
      <div className="text-center flex flex-col items-center gap-3 py-4 select-none animate-in fade-in-0 duration-200">
        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-rose-50 dark:bg-rose-950/20 text-rose-500 shadow-sm mb-1">
          <XCircle className="w-6 h-6" />
        </div>
        <h1 className="text-xl font-bold text-foreground">
          {translate("customerAuth.verifyEmail.errorTitle", currentLocale)}
        </h1>
        <p className="text-xs sm:text-sm font-semibold text-muted-foreground max-w-[280px] leading-relaxed">
          {verifyMutation.error.message}
        </p>
        <NextLink
          href="/auth/login"
          className="flex w-full items-center justify-center rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 h-11 text-sm font-semibold shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 text-center mt-3"
        >
          {translate("customerAuth.verifyEmail.backToLogin", currentLocale)}
        </NextLink>
      </div>
    );
  }

  // Trạng thái xác thực email thành công
  return (
    <div className="text-center flex flex-col items-center gap-3 py-4 select-none animate-in fade-in-0 duration-200">
      <div className="flex items-center justify-center w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-950/20 text-emerald-500 shadow-sm mb-1">
        <CheckCircle className="w-6 h-6" />
      </div>
      <h1 className="text-xl font-bold text-foreground">
        {translate("customerAuth.verifyEmail.successTitle", currentLocale)}
      </h1>
      <p className="text-xs sm:text-sm font-semibold text-muted-foreground max-w-[280px] leading-relaxed">
        {translate("customerAuth.verifyEmail.successDesc", currentLocale)}
      </p>
      <NextLink
        href="/dashboard"
        className="flex w-full items-center justify-center rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 h-11 text-sm font-semibold shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 text-center mt-3"
      >
        {translate("customerAuth.verifyEmail.goToDashboard", currentLocale)}
      </NextLink>
    </div>
  );
}

/**
 * Component trang xác thực Email bọc bởi Suspense
 */
export default function VerifyEmailPage() {
  return (
    <AuthCard showSupport>
      <Suspense
        fallback={
          <div className="py-8 text-center text-sm font-bold text-muted-foreground select-none">
            Đang tải dữ liệu...
          </div>
        }
      >
        <VerifyEmailContent />
      </Suspense>
    </AuthCard>
  );
}
