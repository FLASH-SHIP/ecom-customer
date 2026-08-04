import { Card } from "@flash-ship/ecom-ui/components/card";
import type React from "react";
import { AuthLanguageSelector } from "./AuthLanguageSelector";
import { AuthLogo } from "./AuthLogo";
import { AuthSocialLogins } from "./AuthSocialLogins";

/**
 * Interface Props cấu hình cho AuthCard
 */
interface AuthCardProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  showLogo?: boolean;
  showLanguageSelector?: boolean;
  showSocials?: boolean;
  showSupport?: boolean;
  /** Component/element Footer hiển thị DƯỚI NÚT SOCIAL LOGIN (VD: Don't have an account? Sign up) */
  footer?: React.ReactNode;
  icon?: React.ReactNode;
  onClose?: () => void;
}

/**
 * Component AuthCard tái hiện y hệt thiết kế Figma:
 * - Card màu trắng nổi (Solid White Card `bg-white dark:bg-slate-900`), bo góc `rounded-2xl`, shadow xịn `shadow-xl`, padding vừa vặn `p-6 sm:p-8`.
 * - Tiêu đề & Mô tả nằm căn giữa (centered text).
 * - Thứ tự các phần từ trên xuống dưới:
 *   1. Header Row (Logo & Language selector)
 *   2. Title & Description
 *   3. Form nhập liệu (children)
 *   4. Cụm Social Logins (OR CONTINUE WITH + 3 nút Apple, Google, Facebook)
 *   5. Footer link (Don't have an account? Sign up) NẰM ĐẦY ĐỦ Ở VỊ TRÍ DƯỚI 3 NÚT SOCIAL LOGIN!
 * 
 * 100% Code Comment & Ghi chú bằng Tiếng Việt.
 */
export function AuthCard({
  children,
  title,
  description,
  showLogo = true,
  showLanguageSelector = true,
  showSocials = true,
  footer,
}: AuthCardProps) {
  return (
    <Card className="w-full bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xl rounded-2xl p-6 sm:p-8 flex flex-col gap-5 sm:gap-6 relative">
      {/* Header Row: Logo ở góc trái & Nút chọn Ngôn ngữ ở góc phải */}
      {(showLogo || showLanguageSelector) && (
        <div className="flex items-center justify-between w-full select-none mb-1">
          {showLogo ? <AuthLogo /> : <div />}
          {showLanguageSelector && <AuthLanguageSelector />}
        </div>
      )}

      {/* Tiêu đề & Mô tả căn giữa chuẩn Figma */}
      {(title || description) && (
        <div className="flex flex-col items-center justify-center text-center gap-1.5 px-2">
          {title && (
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              {title}
            </h1>
          )}
          {description && (
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium max-w-[320px] leading-relaxed">
              {description}
            </p>
          )}
        </div>
      )}

      {/* 1. Form nhập dữ liệu */}
      <div className="flex flex-col gap-4 w-full">{children}</div>

      {/* 2. Cụm Đăng Nhập Mạng Xã Hội (Social Logins) */}
      {showSocials && <AuthSocialLogins />}

      {/* 3. Dòng chuyển hướng Footer ("Don't have an account? Sign up") ĐẶT CHÍNH XÁC VỊ TRÍ DƯỚI 3 NÚT SOCIAL LOGIN */}
      {footer && <div className="pt-1 text-center w-full">{footer}</div>}
    </Card>
  );
}
