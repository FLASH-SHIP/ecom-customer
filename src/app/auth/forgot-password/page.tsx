"use client";

/**
 * @file ForgotPasswordPage.tsx
 * @description Màn hình Yêu Cầu Quên Mật Khẩu (Customer Forgot Password Page).
 * Nhập email tài khoản để nhận đường dẫn/mã khôi phục mật khẩu.
 * 
 * 100% Code Comment & Ghi chú bằng Tiếng Việt giúp dễ dàng bảo trì.
 */

import { translate } from "@flash-ship/ecom-i18n";
import { useI18n } from "@ecom/shared/@i18n";
import { Button } from "@flash-ship/ecom-ui/components/button";
import { Input } from "@flash-ship/ecom-ui/components/input";
import { Label } from "@flash-ship/ecom-ui/components/label";
import { Lock } from "lucide-react";
import NextLink from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { AuthCard } from "../../../components/auth/AuthCard";
import { trpc } from "../../../lib/trpc";
import { zodResolver } from "../../../lib/zodResolver";

type FormValues = {
  /** Email tài khoản cần khôi phục mật khẩu */
  email: string;
};

/**
 * Component trang Quên Mật Khẩu
 */
export default function ForgotPasswordPage() {
  const router = useRouter();
  const { languageId: currentLocale } = useI18n();

  /** State ghi nhận trạng thái đã gửi yêu cầu thành công */
  const [submitted, setSubmitted] = useState(false);

  /** State kích hoạt hiệu ứng rung (Shake Animation) khi có lỗi */
  const [isShaking, setIsShaking] = useState(false);

  /**
   * Zod Schema validate định dạng Email
   */
  const schema = useMemo(
    () =>
      z.object({
        email: z
          .string()
          .min(1, translate("customerAuth.register.emailRequired", currentLocale))
          .email(translate("customerAuth.register.emailInvalid", currentLocale)),
      }),
    [currentLocale],
  );

  const resolver = useMemo(() => zodResolver(schema), [schema]);

  const { control, handleSubmit, formState } = useForm<FormValues>({
    mode: "onChange",
    defaultValues: {
      email: "",
    },
    resolver,
  });

  const { isSubmitting } = formState;

  /** Mutation tRPC gửi yêu cầu quên mật khẩu */
  const forgotMutation = trpc.customer.auth.forgotPassword.useMutation({
    onSuccess: () => setSubmitted(true),
    onError: () => {
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 400);
    },
  });

  const handleClose = () => router.push("/auth/login");

  const onSubmit = (data: FormValues) => {
    forgotMutation.mutate({ email: data.email });
  };

  // Trường hợp đã gửi yêu cầu thành công: Hiển thị màn hình thông báo kiểm tra Hòm thư Email
  if (submitted) {
    return (
      <AuthCard icon={<Lock className="w-4.5 h-4.5" />} onClose={handleClose} showSupport>
        <div className="text-center flex flex-col items-center gap-3 select-none py-2">
          <h1 className="text-xl font-bold text-foreground mt-1">
            {translate("customerAuth.forgotPassword.checkEmailTitle", currentLocale)}
          </h1>
          <p className="text-xs sm:text-sm font-semibold text-muted-foreground max-w-[290px] leading-relaxed">
            {translate("customerAuth.forgotPassword.checkEmailDesc", currentLocale)}
          </p>
        </div>

        <NextLink
          href="/auth/login"
          className="flex w-full items-center justify-center h-10 2xl:h-12 text-sm 2xl:text-base font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90 h-11 text-sm font-semibold shadow-sm transition-all hover:shadow-md active:translate-y-0 text-center"
        >
          {translate("customerAuth.forgotPassword.backToLogin", currentLocale)}
        </NextLink>
      </AuthCard>
    );
  }

  return (
    <div className={isShaking ? "animate-shake w-full" : "w-full"}>
      <AuthCard
        title={translate("customerAuth.forgotPassword.title", currentLocale)}
        description={translate("customerAuth.forgotPassword.desc", currentLocale)}
        icon={<Lock className="w-4.5 h-4.5" />}
        onClose={handleClose}
        showSupport
        showSocials={false}
      >
        {/* Banner thông báo lỗi nếu có */}
        {forgotMutation.error && (
          <div
            role="alert"
            className="rounded-xl border border-rose-200/60 dark:border-rose-950/50 bg-rose-50/90 dark:bg-rose-950/40 px-4 py-3 text-xs font-semibold text-rose-600 dark:text-rose-400 animate-in fade-in-0 duration-200"
          >
            {forgotMutation.error.message}
          </div>
        )}

        {/* Form nhập Email nhận link đặt lại mật khẩu */}
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 xl:gap-6">
          <Controller
            name="email"
            control={control}
            render={({ field, fieldState }) => (
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="forgot-email" className="text-sm 2xl:text-base font-medium text-[#0A0A0A]">
                  {translate("customerAuth.forgotPassword.emailLabel", currentLocale)}
                </Label>
                <Input
                  {...field}
                  id="forgot-email"
                  type="email"
                  placeholder={translate(
                    "customerAuth.forgotPassword.emailPlaceholder",
                    currentLocale,
                  )}
                  className="w-full bg-background/50 focus-visible:ring-2 focus-visible:ring-primary/40 transition-all duration-200 h-10 2xl:h-12 rounded-md text-xs sm:text-sm "
                  aria-invalid={!!fieldState.error}
                />
                {fieldState.error && (
                  <p className="text-xs text-destructive font-medium">{fieldState.error.message}</p>
                )}
              </div>
            )}
          />

          <div className={'flex flex-col sm:flex-row items-center justify-between gap-2.5 lg:gap-4'}>
            <Button
              disabled={isSubmitting}
              className="w-full h-10 2xl:h-12 text-sm 2xl:text-base font-medium bg-white hover:bg-slate-50 text-[#0A0A0A] border border-[#D4D4D4] rounded-md shadow-[0_1px_2px_0_rgba(0,0,0,0.05)] transition-all active:scale-[0.99] cursor-pointer"
              onClick={() => router.back()}
            >
              {translate("customerAuth.forgotPassword.buttonLabelBack", currentLocale)}
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-10 2xl:h-12 text-sm 2xl:text-base font-medium rounded-md transition-all active:scale-[0.99] cursor-pointer"
            >
              {isSubmitting && (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent mr-2" />
              )}
              {isSubmitting
                ? translate("customerAuth.forgotPassword.buttonLoading", currentLocale)
                : translate("customerAuth.forgotPassword.buttonLabelSendResetLink", currentLocale)}
            </Button>
          </div>
        </form>
      </AuthCard>
    </div>
  );
}
