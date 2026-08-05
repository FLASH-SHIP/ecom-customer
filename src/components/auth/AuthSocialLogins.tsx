"use client";

/**
 * @file AuthSocialLogins.tsx
 * @description Component hàng nút Đăng Nhập Mạng Xã Hội (Apple, Google, Facebook) chuẩn y hệt Figma.
 * 
 * 100% Code Comment & Ghi chú bằng Tiếng Việt.
 */

import { translate } from "@flash-ship/ecom-i18n";
import { useI18n } from "@ecom/shared/@i18n";
import { GoogleIcon } from "@flash-ship/ecom-ui/components/icon-component/GoogleIcon";
import { signIn } from "next-auth/react";
import { useState } from "react";

export function AuthSocialLogins() {
  const { languageId: currentLocale } = useI18n();
  const [loadingProvider, setLoadingProvider] = useState<string | null>(null);

  /**
   * Xử lý gọi đăng nhập Social Provider qua NextAuth
   * @param provider Tên nhà cung cấp (google, facebook, apple)
   */
  const handleSocialLogin = async (provider: string) => {
    try {
      setLoadingProvider(provider);
      if (typeof window !== "undefined") {
        sessionStorage.setItem("just_logged_in", "true");
      }
      await signIn(provider, { callbackUrl: "/dashboard" });
    } catch (err) {
      console.error(`Lỗi đăng nhập social provider ${provider}:`, err);
      setLoadingProvider(null);
    }
  };

  return (
    <div className="flex flex-col gap-3.5 w-full select-none">
      {/* Thanh phân cách: OR CONTINUE WITH */}
      <div className="flex items-center gap-3 w-full">
        <div className="flex-1 h-[1px] bg-slate-200 dark:bg-slate-800" />
        <span className="text-xs text-[#737373] uppercase">
          {translate("customerAuth.login.orContinueWith", currentLocale)}
        </span>
        <div className="flex-1 h-[1px] bg-slate-200 dark:bg-slate-800" />
      </div>

      {/* Hàng 3 nút Đăng nhập Mạng Xã Hội chuẩn Figma (Apple, Google, Facebook) */}
      <div className="grid grid-cols-2 gap-2.5 w-full">
        {/* Nút Google */}
        <button
          type="button"
          disabled={loadingProvider !== null}
          onClick={() => handleSocialLogin("google")}
          className="flex items-center justify-center h-10 w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-all shadow-2xs active:scale-[0.98] cursor-pointer disabled:opacity-50"
        >
          {loadingProvider === "google" ? (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#4285F4] border-t-transparent" />
          ) : (
            <GoogleIcon />
          )}
        </button>

        {/* Nút Facebook */}
        <button
          type="button"
          disabled={loadingProvider !== null}
          onClick={() => handleSocialLogin("facebook")}
          className="flex items-center justify-center h-10 w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-all shadow-[0_1px_2px_0_rgba(0,0,0,0.1)] active:scale-[0.98] cursor-pointer disabled:opacity-50"
        >
          {loadingProvider === "facebook" ? (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#1877F2] border-t-transparent" />
          ) : (
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#1877F2">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}
