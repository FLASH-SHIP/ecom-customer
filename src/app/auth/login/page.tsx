"use client";

/**
 * @file LoginPage.tsx
 * @description Màn hình Đăng Nhập khách hàng (Customer Login Page) chuẩn 100% thiết kế Figma.
 * Tích hợp tự động chuyển đổi đa ngôn ngữ (Tiếng Anh - EN & Tiếng Việt - VN) hoạt động chuẩn xác,
 * dòng liên kết "Don't have an account? Sign up" nằm CHÍNH XÁC Ở VỊ TRÍ DƯỚI HÀNG 3 NÚT SOCIAL LOGIN.
 * 
 * 100% Code Comment & Ghi chú bằng Tiếng Việt.
 */

import { translate } from "@flash-ship/ecom-i18n";
import { useI18n } from "@ecom/shared/@i18n";
import { Button } from "@flash-ship/ecom-ui/components/button";
import { Input } from "@flash-ship/ecom-ui/components/input";
import { Label } from "@flash-ship/ecom-ui/components/label";
import NextLink from "next/link";
import { useRouter } from "next/navigation";
import { signIn, signOut, useSession } from "next-auth/react";
import { useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { AuthCard } from "../../../components/auth/AuthCard";
import { TermsAndConditionsModal } from "../../../components/auth/TermsAndConditionsModal";
import { trpc } from "../../../lib/trpc";
import { zodResolver } from "../../../lib/zodResolver";

/**
 * Kiểu dữ liệu FormValues đại diện cho form Đăng Nhập
 */
type FormValues = {
  /** Email hoặc Tên đăng nhập của khách hàng */
  identifier: string;
  /** Mật khẩu truy cập */
  password: string;
};

/**
 * Component trang Đăng Nhập chính (LoginPage)
 */
export default function LoginPage() {
  const router = useRouter();
  const { status, update } = useSession();
  const { languageId: currentLocale } = useI18n();

  /** State lưu thông báo lỗi khi đăng nhập thất bại */
  const [error, setError] = useState<string | null>(null);

  /** State quản lý kích hoạt hiệu ứng rung (Shake Animation) khi đăng nhập sai */
  const [isShaking, setIsShaking] = useState<boolean>(false);

  // Truy vấn thông tin profile người dùng hiện tại khi đã đăng nhập qua SSO (Google / Facebook)
  const { data: profile, refetch: refetchProfile } = trpc.customer.auth.me.useQuery(undefined, {
    enabled: status === "authenticated",
    retry: false,
  });

  const isTermsPending = Boolean(
    status === "authenticated" && profile && (profile as any).isTermsAccepted === false
  );

  // Nếu người dùng đã đăng nhập và ĐÃ đồng ý điều khoản ➔ Tự động chuyển hướng vào Dashboard
  useEffect(() => {
    if (status === "authenticated" && profile && (profile as any).isTermsAccepted === true) {
      if (typeof window !== "undefined") {
        sessionStorage.setItem("just_logged_in", "true");
        window.location.replace("/dashboard");
      }
    }
  }, [status, profile]);

  /**
   * Tải trước JavaScript bundle cho trang `/dashboard` ngay khi component mount
   * Giúp hành động chuyển hướng sau đăng nhập đạt tốc độ mượt mà tối đa (0ms wait)
   */
  useEffect(() => {
    router.prefetch("/dashboard");
  }, [router]);

  /**
   * Khởi tạo Zod Schema kiểm tra hợp lệ thông tin form đăng nhập (hỗ trợ i18n đa ngôn ngữ)
   */
  const schema = useMemo(
    () =>
      z.object({
        identifier: z
          .string()
          .min(1, translate("customerAuth.login.emailUsernameRequired", currentLocale)),
        password: z
          .string()
          .min(1, translate("customerAuth.register.passwordRequired", currentLocale)),
      }),
    [currentLocale],
  );

  /** Resolves schema với React Hook Form */
  const resolver = useMemo(() => zodResolver(schema), [schema]);

  /**
   * Khởi tạo React Hook Form với chế độ `onChange` cho trải nghiệm phản hồi tức thì
   */
  const { control, handleSubmit, formState } = useForm<FormValues>({
    mode: "onChange",
    defaultValues: {
      identifier: "",
      password: "",
    },
    resolver,
  });

  const { isSubmitting } = formState;

  /**
   * Xử lý gửi form Đăng Nhập tới NextAuth credentials provider
   * @param data Dữ liệu tài khoản và mật khẩu đã qua kiểm tra hợp lệ
   */
  async function onSubmit(data: FormValues) {
    setError(null);
    setIsShaking(false);

    try {
      // Gọi lệnh Đăng nhập Credentials không tự động chuyển hướng trang (redirect: false)
      const res = await signIn("credentials", {
        redirect: false,
        identifier: data.identifier,
        password: data.password,
      });

      if (res?.error) {
        // Hiển thị thông báo sai tài khoản/mật khẩu & kích hoạt hiệu ứng rung Shake Animation
        setError(translate("customerAuth.login.invalidCredentials", currentLocale));
        setIsShaking(true);
        // Tắt hiệu ứng shake sau 400ms
        setTimeout(() => setIsShaking(false), 400);
      } else {
        // Đăng nhập thành công: Lưu cờ vừa đăng nhập vào sessionStorage và chuyển trang
        if (typeof window !== "undefined") {
          sessionStorage.setItem("just_logged_in", "true");
          window.location.replace("/dashboard");
        }
      }
    } catch (err) {
      console.error("Lỗi đăng nhập không mong muốn:", err);
      setError(translate("customerAuth.login.unexpectedError", currentLocale));
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 400);
    }
  }

  return (
    <div className={isShaking ? "animate-shake w-full" : "w-full"}>
      <AuthCard
        title={translate("customerAuth.login.title", currentLocale)}
        description={translate("customerAuth.login.subtitle", currentLocale)}
        showLogo
        showLanguageSelector
        showSocials
        footer={
          <p className="text-center text-sm 2xl:text-base font-medium text-[#262626] select-none">
            {translate("customerAuth.login.dontHaveAccount", currentLocale)}{" "}
            <NextLink
              href="/auth/register"
              className="font-medium text-[#4F46E5] hover:underline transition-colors"
            >
              {translate("customerAuth.login.signUp", currentLocale)}
            </NextLink>
          </p>
        }
      >
        {/* Hiển thị thông báo lỗi nếu có */}
        {error && (
          <div
            role="alert"
            className="rounded-xl border border-rose-200/60 dark:border-rose-950/50 bg-rose-50/90 dark:bg-rose-950/40 px-4 py-3 text-xs font-semibold text-rose-600 dark:text-rose-400 animate-in fade-in-0 duration-200"
          >
            {error}
          </div>
        )}

        {/* Form Đăng Nhập y hệt Figma */}
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3.5">
          {/* Trường Email */}
          <Controller
            name="identifier"
            control={control}
            render={({ field, fieldState }) => (
              <div className="flex flex-col gap-1">
                <Label htmlFor="login-identifier" className="text-sm 2xl:text-base font-medium text-[#0A0A0A]">
                  {translate("customerAuth.login.emailLabel", currentLocale)}
                </Label>
                <Input
                  {...field}
                  id="login-identifier"
                  type="text"
                  autoComplete="username"
                  placeholder={translate("customerAuth.login.emailPlaceholder", currentLocale)}
                  className="w-full bg-slate-50/60 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 h-10 2xl:h-12 rounded-md text-sm 2xl:text-base focus-visible:ring-2 focus-visible:ring-[#008094]/30 focus-visible:border-[#008094]"
                  aria-invalid={!!fieldState.error}
                />
                {fieldState.error && (
                  <p className="text-xs text-destructive font-medium mt-0.5">{fieldState.error.message}</p>
                )}
              </div>
            )}
          />

          {/* Trường Mật khẩu */}
          <Controller
            name="password"
            control={control}
            render={({ field, fieldState }) => (
              <div className="flex flex-col gap-1">
                <Label htmlFor="login-password" className="text-sm 2xl:text-base font-medium text-[#0A0A0A]">
                  {translate("customerAuth.login.passwordLabel", currentLocale)}
                </Label>
                <Input
                  {...field}
                  id="login-password"
                  type="password"
                  autoComplete="current-password"
                  placeholder={translate("customerAuth.login.passwordPlaceholder", currentLocale)}
                  className="w-full bg-slate-50/60 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 h-10 2xl:h-12 rounded-md text-sm 2xl:text-base focus-visible:ring-2 focus-visible:ring-[#008094]/30 focus-visible:border-[#008094]"
                  aria-invalid={!!fieldState.error}
                />
                {fieldState.error && (
                  <p className="text-xs text-destructive font-medium mt-0.5">{fieldState.error.message}</p>
                )}
              </div>
            )}
          />

          {/* Quên mật khẩu link căn phải bên dưới ô Password */}
          <div className="flex justify-end -mt-0.5">
            <NextLink
              href="/auth/forgot-password"
              className="text-sm font-medium text-[#4F46E5] hover:underline transition-colors select-none"
            >
              {translate("customerAuth.login.forgotPassword", currentLocale)}
            </NextLink>
          </div>

          {/* Nút Đăng Nhập "Log in" màu Teal `#008094` */}
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-10 2xl:h-12 text-sm 2xl:text-base font-bold bg-[#008094] hover:bg-[#006e80] text-white rounded-md transition-all shadow-md active:scale-[0.99] cursor-pointer"
          >
            {isSubmitting && (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent mr-2" />
            )}
            {translate("customerAuth.login.logIn", currentLocale)}
          </Button>
        </form>
      </AuthCard>

      {/* Modal Bắt Buộc Đồng Ý Điều Khoản Dịch Vụ Nổi Trên Nền Auth Page chuẩn 100% Ảnh Mẫu */}
      {isTermsPending && profile && (
        <TermsAndConditionsModal
          isOpen={isTermsPending}
          customerId={profile.id}
          onClose={() => {
            signOut({ callbackUrl: "/auth/login" });
          }}
          onSuccess={async () => {
            await refetchProfile();
            await update({ isTermsAccepted: true });
            if (typeof window !== "undefined") {
              sessionStorage.setItem("just_logged_in", "true");
              window.location.replace("/dashboard");
            }
          }}
        />
      )}
    </div>
  );
}
