"use client";

/**
 * @file input-otp.tsx
 * @description UI Component ô nhập mã xác thực OTP 6 số chuẩn Shadcn UI + TailwindCSS y hệt Figma.
 * Thiết kế 6 ô số nối liền dạng khối (segmented input bar), tự động nhảy focus, tự động paste mã từ SMS,
 * hiển thị con trỏ nhấp nháy mượt mà và bo góc `rounded-xl` đồng bộ toàn bộ form.
 * 
 * 100% Code Comment & Ghi chú bằng Tiếng Việt giúp dễ dàng bảo trì.
 */

import { cn } from "@flash-ship/ecom-ui/lib/utils";
import { OTPInput, OTPInputContext, type SlotProps } from "input-otp";
import { Minus } from "lucide-react";
import * as React from "react";

/**
 * Component InputOTP chính wrap từ thư viện `input-otp`
 */
const InputOTP = React.forwardRef<
  React.ComponentRef<typeof OTPInput>,
  React.ComponentPropsWithoutRef<typeof OTPInput>
>(({ className, containerClassName, ...props }, ref) => (
  <OTPInput
    ref={ref}
    containerClassName={cn(
      "flex items-center justify-center w-full has-[:disabled]:opacity-50 select-none",
      containerClassName,
    )}
    className={cn("disabled:cursor-not-allowed w-full", className)}
    inputMode="numeric"
    pattern="[0-9]*"
    autoComplete="one-time-code"
    {...props}
  />
));
InputOTP.displayName = "InputOTP";

/**
 * Component InputOTPGroup nhóm liền khối 6 ô OTP phủ 100% chiều rộng form (w-full) chuẩn Figma
 */
const InputOTPGroup = React.forwardRef<
  React.ComponentRef<"div">,
  React.ComponentPropsWithoutRef<"div">
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex items-center w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800/60 shadow-xs overflow-hidden transition-colors focus-within:border-[#008094] focus-within:ring-2 focus-within:ring-[#008094]/30",
      className,
    )}
    {...props}
  />
));
InputOTPGroup.displayName = "InputOTPGroup";

/**
 * Component InputOTPSlot hiển thị từng ô ký tự OTP đơn lẻ trong chuỗi nối liền
 */
const InputOTPSlot = React.forwardRef<
  React.ComponentRef<"div">,
  React.ComponentPropsWithoutRef<"div"> & { index: number }
>(({ index, className, ...props }, ref) => {
  const inputOTPContext = React.useContext(OTPInputContext) as { slots?: SlotProps[] } | null;
  const slot = inputOTPContext?.slots?.[index];
  const char = slot?.char;
  const hasFakeCaret = slot?.hasFakeCaret;
  const isActive = slot?.isActive;

  return (
    <div
      ref={ref}
      className={cn(
        "relative flex h-10.5 flex-1 items-center justify-center border-r border-slate-200 dark:border-slate-700 text-sm md:text-base font-semibold text-slate-900 dark:text-slate-100 transition-all duration-150 last:border-r-0",
        isActive && "z-10 bg-white dark:bg-slate-900 text-[#008094]",
        char && "bg-white dark:bg-slate-900 font-bold text-slate-900 dark:text-slate-100",
        className,
      )}
      {...props}
    >
      {char}
      {/* Hiển thị con trỏ giả nhấp nháy khi slot đang active */}
      {hasFakeCaret && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="h-5 w-0.5 animate-caret-blink bg-[#008094] duration-1000" />
        </div>
      )}
    </div>
  );
});
InputOTPSlot.displayName = "InputOTPSlot";

/**
 * Component InputOTPSeparator hiển thị dấu phân cách nếu cần
 */
const InputOTPSeparator = React.forwardRef<
  React.ComponentRef<"div">,
  React.ComponentPropsWithoutRef<"div">
>(({ ...props }, ref) => (
  <div ref={ref} aria-hidden="true" {...props}>
    <Minus className="size-4 text-slate-400" />
  </div>
));
InputOTPSeparator.displayName = "InputOTPSeparator";

export { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot };
