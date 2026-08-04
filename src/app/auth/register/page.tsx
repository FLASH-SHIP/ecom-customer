"use client";

/**
 * @file RegisterPage.tsx
 * @description Màn hình Đăng Ký Tài Khoản Khách Hàng (Customer Register Page) chuẩn 100% thiết kế Figma.
 * Tích hợp InputOTP dạng khối 6 ô nối liền rộng 100% chiều rộng form, nút Send OTP inline màu Teal,
 * tự động chuyển đổi đa ngôn ngữ EN/VN và dòng "Already have an account? Log in" nằm dưới các nút Social.
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
import { signIn } from "next-auth/react";
import { useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { AuthCard } from "../../../components/auth/AuthCard";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "../../../components/ui/input-otp";
import { trpc } from "../../../lib/trpc";
import { zodResolver } from "../../../lib/zodResolver";

/**
 * Component trang Đăng Ký (RegisterPage)
 */
export default function RegisterPage() {
  const router = useRouter();
  const { languageId: currentLocale } = useI18n();

  /** State lưu thông báo lỗi màn hình Đăng ký */
  const [error, setError] = useState<string | null>(null);

  /** State lưu thông báo gửi mã OTP thành công */
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  /** State thời gian đếm ngược (tính bằng giây) trước khi cho phép gửi lại mã OTP */
  const [codeCountdown, setCodeCountdown] = useState(0);

  /** State kích hoạt hiệu ứng rung (Shake Animation) khi đăng ký thất bại */
  const [isShaking, setIsShaking] = useState(false);

  /**
   * Khởi tạo Zod Schema kiểm tra hợp lệ dữ liệu đăng ký
   */
  const schema = useMemo(
    () =>
      z.object({
        email: z
          .string()
          .min(1, translate("customerAuth.register.emailRequired", currentLocale))
          .email(translate("customerAuth.register.emailInvalid", currentLocale)),
        code: z
          .string()
          .min(1, translate("customerAuth.register.codeRequired", currentLocale))
          .length(6, translate("customerAuth.register.codeInvalid", currentLocale)),
        password: z.string().min(8, translate("customerAuth.register.passwordMin", currentLocale)),
      }),
    [currentLocale],
  );

  type FormValues = z.infer<typeof schema>;

  const resolver = useMemo(() => zodResolver(schema), [schema]);

  /**
   * Khởi tạo React Hook Form quản lý các ô nhập Đăng ký
   */
  const { control, handleSubmit, watch } = useForm<FormValues>({
    mode: "onChange",
    defaultValues: {
      email: "",
      code: "",
      password: "",
    },
    resolver,
  });

  const emailValue = watch("email");

  /**
   * Khôi phục thời gian đếm ngược gửi mã từ localStorage khi trang mount
   */
  useEffect(() => {
    const sentAtStr = localStorage.getItem("customer_register_otp_sent_at");
    if (sentAtStr) {
      const sentAt = Number.parseInt(sentAtStr, 10);
      const elapsed = Math.floor((Date.now() - sentAt) / 1000);
      if (elapsed > 0 && elapsed < 120) {
        setCodeCountdown(120 - elapsed);
      } else {
        localStorage.removeItem("customer_register_otp_sent_at");
      }
    }
  }, []);

  /**
   * Quản lý đếm ngược 1 giây cho đồng hồ đếm ngược gửi lại mã OTP
   */
  useEffect(() => {
    if (codeCountdown <= 0) {
      localStorage.removeItem("customer_register_otp_sent_at");
      return;
    }
    const timer = setInterval(() => {
      setCodeCountdown((prev) => {
        if (prev <= 1) {
          localStorage.removeItem("customer_register_otp_sent_at");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [codeCountdown]);

  /**
   * Mutation tRPC gửi mã xác thực OTP về email khách hàng
   */
  const sendCodeMutation = trpc.customer.auth.sendVerificationCode.useMutation({
    onSuccess: () => {
      setSuccessMessage(translate("customerAuth.register.codeSent", currentLocale));
      localStorage.setItem("customer_register_otp_sent_at", Date.now().toString());
      setCodeCountdown(120); // Đếm ngược 120 giây (2 phút)
      setError(null);
    },
    onError: (err) => {
      setError(err.message);
      setSuccessMessage(null);
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 400);
    },
  });

  /**
   * Mutation tRPC đăng ký tài khoản khách hàng mới
   */
  const registerMutation = trpc.customer.auth.register.useMutation({
    onSuccess: async (_, variables) => {
      localStorage.removeItem("customer_register_otp_sent_at");
      try {
        const params = variables as { email: string; password: string };
        // Tự động đăng nhập phiên cho khách hàng ngay sau khi đăng ký thành công
        await signIn("credentials", {
          redirect: false,
          identifier: params.email,
          password: params.password,
        });
        router.push("/dashboard");
      } catch (err) {
        console.error("Lỗi tự động đăng nhập sau đăng ký:", err);
        router.push("/auth/login");
      }
    },
    onError: (err) => {
      setError(err.message);
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 400);
    },
  });

  /**
   * Xử lý nộp form đăng ký tài khoản
   */
  const onSubmit = (data: FormValues) => {
    setError(null);
    registerMutation.mutate({
      email: data.email,
      password: data.password,
      code: data.code,
    });
  };

  const isPending = registerMutation.isPending;

  return (
    <div className={isShaking ? "animate-shake w-full" : "w-full"}>
      <AuthCard
        title={translate("customerAuth.register.title", currentLocale)}
        description={translate("customerAuth.register.subtitle", currentLocale)}
        showLogo
        showLanguageSelector
        showSocials
        footer={
          <p className="text-center text-xs font-semibold text-slate-500 dark:text-slate-400 select-none">
            {translate("customerAuth.register.alreadyHaveAccount", currentLocale)}{" "}
            <NextLink
              href="/auth/login"
              className="font-bold text-[#008094] hover:underline transition-colors"
            >
              {translate("customerAuth.register.logIn", currentLocale)}
            </NextLink>
          </p>
        }
      >
        {/* Thông báo lỗi nếu có */}
        {(error || registerMutation.error) && (
          <div
            role="alert"
            className="rounded-xl border border-rose-200/60 dark:border-rose-950/50 bg-rose-50/90 dark:bg-rose-950/40 px-4 py-3 text-xs font-semibold text-rose-600 dark:text-rose-400 animate-in fade-in-0 duration-200"
          >
            {error || registerMutation.error?.message}
          </div>
        )}

        {/* Thông báo thành công nếu có */}
        {successMessage && (
          <div
            role="alert"
            className="rounded-xl border border-emerald-200/60 dark:border-emerald-950/50 bg-emerald-50/90 dark:bg-emerald-950/40 px-4 py-3 text-xs font-semibold text-emerald-600 dark:text-emerald-400 animate-in fade-in-0 duration-200"
          >
            {successMessage}
          </div>
        )}

        {/* Form Đăng ký */}
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3.5">
          {/* Trường Email kèm nút Send OTP inline màu Teal góc phải */}
          <Controller
            name="email"
            control={control}
            render={({ field, fieldState }) => (
              <div className="flex flex-col gap-1">
                <Label htmlFor="register-email" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  {translate("customerAuth.register.emailLabel", currentLocale)}
                </Label>
                <div className="relative flex items-center w-full">
                  <Input
                    {...field}
                    id="register-email"
                    type="email"
                    autoComplete="email"
                    placeholder={translate("customerAuth.register.emailPlaceholder", currentLocale)}
                    className="w-full bg-slate-50/60 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 h-10.5 pr-24 rounded-xl text-xs sm:text-sm focus-visible:ring-2 focus-visible:ring-[#008094]/30 focus-visible:border-[#008094]"
                    aria-invalid={!!fieldState.error}
                  />
                  <button
                    type="button"
                    disabled={codeCountdown > 0 || sendCodeMutation.isPending || !emailValue}
                    onClick={() => {
                      if (emailValue) {
                        sendCodeMutation.mutate({ email: emailValue });
                      }
                    }}
                    className="absolute right-2.5 text-xs font-bold text-[#008094] hover:text-[#006677] disabled:text-slate-400 transition-colors select-none cursor-pointer"
                  >
                    {sendCodeMutation.isPending ? (
                      <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-[#008094] border-t-transparent inline-block" />
                    ) : codeCountdown > 0 ? (
                      `${Math.floor(codeCountdown / 60)
                        .toString()
                        .padStart(2, "0")}:${(codeCountdown % 60).toString().padStart(2, "0")}`
                    ) : (
                      translate("customerAuth.register.sendOtp", currentLocale)
                    )}
                  </button>
                </div>
                {fieldState.error && (
                  <p className="text-xs text-destructive font-medium mt-0.5">{fieldState.error.message}</p>
                )}
              </div>
            )}
          />

          {/* Trường Nhập Mã OTP 6 ô nối liền tràn 100% khung form y hệt Figma */}
          <Controller
            name="code"
            control={control}
            render={({ field, fieldState }) => (
              <div className="flex flex-col gap-1 w-full">
                <Label htmlFor="register-code" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  {translate("customerAuth.register.otpLabel", currentLocale)}
                </Label>
                <div className="flex justify-center w-full">
                  <InputOTP
                    maxLength={6}
                    value={field.value}
                    onChange={(val) => field.onChange(val)}
                    containerClassName="w-full"
                    className="w-full"
                  >
                    <InputOTPGroup className="w-full">
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                      <InputOTPSlot index={3} />
                      <InputOTPSlot index={4} />
                      <InputOTPSlot index={5} />
                    </InputOTPGroup>
                  </InputOTP>
                </div>
                {fieldState.error && (
                  <p className="text-xs text-destructive font-medium text-center mt-0.5">{fieldState.error.message}</p>
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
                <Label htmlFor="register-password" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  {translate("customerAuth.register.passwordLabel", currentLocale)}
                </Label>
                <Input
                  {...field}
                  id="register-password"
                  type="password"
                  autoComplete="new-password"
                  placeholder={translate("customerAuth.register.passwordPlaceholder", currentLocale)}
                  className="w-full bg-slate-50/60 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 h-10.5 rounded-xl text-xs sm:text-sm focus-visible:ring-2 focus-visible:ring-[#008094]/30 focus-visible:border-[#008094]"
                  aria-invalid={!!fieldState.error}
                />
                {fieldState.error && (
                  <p className="text-xs text-destructive font-medium mt-0.5">{fieldState.error.message}</p>
                )}
              </div>
            )}
          />

          {/* Nút Đăng ký màu Teal đặc trưng `#008094` */}
          <Button
            type="submit"
            disabled={isPending}
            className="w-full mt-1.5 h-11 text-xs sm:text-sm font-bold bg-[#008094] hover:bg-[#006e80] text-white rounded-xl transition-all shadow-md active:scale-[0.99] cursor-pointer"
          >
            {isPending && (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent mr-2" />
            )}
            {translate("customerAuth.register.signUp", currentLocale)}
          </Button>
        </form>
      </AuthCard>
    </div>
  );
}
