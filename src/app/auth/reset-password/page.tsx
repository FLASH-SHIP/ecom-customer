"use client";

/**
 * @file ResetPasswordPage.tsx
 * @description Màn hình Đặt Lại Mật Khẩu Khách Hàng (Customer Reset Password Page).
 * Đọc token khôi phục từ URL query parameters, cho phép nhập mật khẩu mới và xác nhận mật khẩu.
 * 
 * 100% Code Comment & Ghi chú bằng Tiếng Việt giúp dễ dàng đọc hiểu và bảo trì lâu dài.
 */

import { translate } from "@flash-ship/ecom-i18n";
import { useI18n } from "@ecom/shared/@i18n";
import { Button } from "@flash-ship/ecom-ui/components/button";
import { Input } from "@flash-ship/ecom-ui/components/input";
import { Label } from "@flash-ship/ecom-ui/components/label";
import { CheckCircle, Lock } from "lucide-react";
import NextLink from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { AuthCard } from "../../../components/auth/AuthCard";
import { trpc } from "../../../lib/trpc";
import { zodResolver } from "../../../lib/zodResolver";

/**
 * Component Form Đặt Lại Mật Khẩu chính
 */
function ResetPasswordForm() {
  const router = useRouter();
  const { languageId: currentLocale } = useI18n();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

  /** State lưu thông báo lỗi */
  const [error, setError] = useState<string | null>(null);

  /** State kích hoạt hiệu ứng rung (Shake Animation) khi có lỗi */
  const [isShaking, setIsShaking] = useState(false);

  /**
   * Zod Schema validate mật khẩu mới và khớp mật khẩu xác nhận
   */
  const schema = useMemo(
    () =>
      z
        .object({
          password: z
            .string()
            .min(8, translate("customerAuth.register.passwordMin", currentLocale)),
          confirmPassword: z
            .string()
            .min(1, translate("customerAuth.register.passwordRequired", currentLocale)),
        })
        .refine((data) => data.password === data.confirmPassword, {
          message: translate("customerAuth.register.passwordMismatch", currentLocale),
          path: ["confirmPassword"],
        }),
    [currentLocale],
  );

  type FormValues = z.infer<typeof schema>;

  const resolver = useMemo(() => zodResolver(schema), [schema]);

  const { control, handleSubmit, formState } = useForm<FormValues>({
    mode: "onChange",
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
    resolver,
  });

  const { isSubmitting } = formState;

  /** Mutation tRPC gửi yêu cầu đổi mật khẩu mới lên Backend */
  const resetMutation = trpc.customer.auth.resetPassword.useMutation({
    onError: (err) => {
      setError(err.message);
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 400);
    },
  });

  const handleClose = () => router.push("/auth/login");

  const onSubmit = (data: FormValues) => {
    setError(null);
    resetMutation.mutate({ token, password: data.password });
  };

  // Nếu không có token xác minh trong URL
  if (!token) {
    return (
      <AuthCard icon={<Lock className="w-4.5 h-4.5" />} onClose={handleClose} showSupport>
        <div className="text-center flex flex-col items-center gap-3 py-4 select-none animate-in fade-in-0 duration-200">
          <p className="text-rose-500 font-bold text-sm">
            {translate("customerAuth.resetPassword.invalidToken", currentLocale)}
          </p>
          <NextLink
            href="/auth/forgot-password"
            className="mt-2 text-primary font-bold text-sm hover:underline"
          >
            {translate("customerAuth.resetPassword.requestNewLink", currentLocale)}
          </NextLink>
        </div>
      </AuthCard>
    );
  }

  // Đặt lại mật khẩu thành công
  if (resetMutation.isSuccess) {
    return (
      <AuthCard icon={<Lock className="w-4.5 h-4.5" />} onClose={handleClose} showSupport>
        <div className="text-center flex flex-col items-center gap-3 select-none py-2 animate-in fade-in-0 duration-200">
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-950/20 text-emerald-500 shadow-sm mb-1">
            <CheckCircle className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-bold text-foreground">
            {translate("customerAuth.resetPassword.successTitle", currentLocale)}
          </h1>
          <p className="text-xs sm:text-sm font-semibold text-muted-foreground max-w-[280px] leading-relaxed">
            {translate("customerAuth.resetPassword.successDesc", currentLocale)}
          </p>
        </div>

        <NextLink
          href="/auth/login"
          className="flex w-full items-center justify-center rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 h-11 text-sm font-semibold shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 text-center mt-3"
        >
          {translate("customerAuth.resetPassword.signIn", currentLocale)}
        </NextLink>
      </AuthCard>
    );
  }

  return (
    <div className={isShaking ? "animate-shake w-full" : "w-full"}>
      <AuthCard
        title={translate("customerAuth.resetPassword.title", currentLocale)}
        description={translate("customerAuth.resetPassword.desc", currentLocale)}
        icon={<Lock className="w-4.5 h-4.5" />}
        onClose={handleClose}
        showSupport
      >
        {/* Banner thông báo lỗi nếu có */}
        {(error || resetMutation.error) && (
          <div
            role="alert"
            className="rounded-xl border border-rose-200/60 dark:border-rose-950/50 bg-rose-50/90 dark:bg-rose-950/40 px-4 py-3 text-xs font-semibold text-rose-600 dark:text-rose-400 animate-in fade-in-0 duration-200"
          >
            {error || resetMutation.error?.message}
          </div>
        )}

        {/* Form nhập Mật khẩu mới & Xác nhận Mật khẩu */}
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <Controller
            name="password"
            control={control}
            render={({ field, fieldState }) => (
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="reset-password" className="text-xs font-bold text-muted-foreground">
                  {translate("customerAuth.resetPassword.newPasswordLabel", currentLocale)}
                </Label>
                <Input
                  {...field}
                  id="reset-password"
                  type="password"
                  placeholder={translate(
                    "customerAuth.resetPassword.newPasswordPlaceholder",
                    currentLocale,
                  )}
                  className="w-full bg-background/50 focus-visible:ring-2 focus-visible:ring-primary/40 transition-all duration-200"
                  showPasswordLabel={translate("auth.showPassword", currentLocale)}
                  hidePasswordLabel={translate("auth.hidePassword", currentLocale)}
                  aria-invalid={!!fieldState.error}
                />
                {fieldState.error && (
                  <p className="text-xs text-destructive font-medium">{fieldState.error.message}</p>
                )}
              </div>
            )}
          />

          <Controller
            name="confirmPassword"
            control={control}
            render={({ field, fieldState }) => (
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="reset-confirm" className="text-xs font-bold text-muted-foreground">
                  {translate("customerAuth.resetPassword.confirmPasswordLabel", currentLocale)}
                </Label>
                <Input
                  {...field}
                  id="reset-confirm"
                  type="password"
                  placeholder={translate(
                    "customerAuth.resetPassword.confirmPasswordPlaceholder",
                    currentLocale,
                  )}
                  className="w-full bg-background/50 focus-visible:ring-2 focus-visible:ring-primary/40 transition-all duration-200"
                  showPasswordLabel={translate("auth.showPassword", currentLocale)}
                  hidePasswordLabel={translate("auth.hidePassword", currentLocale)}
                  aria-invalid={!!fieldState.error}
                />
                {fieldState.error && (
                  <p className="text-xs text-destructive font-medium">{fieldState.error.message}</p>
                )}
              </div>
            )}
          />

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full mt-2 h-11 text-sm font-semibold rounded-xl transition-all shadow-md active:scale-[0.99] cursor-pointer"
          >
            {isSubmitting && (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent mr-2" />
            )}
            {isSubmitting
              ? translate("customerAuth.resetPassword.buttonLoading", currentLocale)
              : translate("customerAuth.resetPassword.buttonLabel", currentLocale)}
          </Button>
        </form>
      </AuthCard>
    </div>
  );
}

/**
 * Component trang ResetPasswordPage bọc trong Suspense
 */
export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full bg-background/75 backdrop-blur-xl text-foreground rounded-3xl p-10 shadow-2xl text-center text-sm font-bold text-muted-foreground select-none">
          Đang tải dữ liệu...
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
