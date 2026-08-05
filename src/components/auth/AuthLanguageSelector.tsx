"use client";

/**
 * @file AuthLanguageSelector.tsx
 * @description Component chuyển đổi ngôn ngữ dạng Pill Toggle Switcher (`EN` | `VN`) chuẩn Figma.
 * Hiển thị ảnh lá cờ bằng Next.js Image component thông qua hàm `getIconFlagByLocale`,
 * và áp dụng hiệu ứng bóng `shadow-[0_1px_2px_-1px_rgba(0,0,0,0.1),0_1px_3px_0_rgba(0,0,0,0.1)]` khi active chuẩn thiết kế Figma.
 * 
 * 100% Code Comment & Ghi chú bằng Tiếng Việt.
 */

import { useI18n } from "@ecom/shared/@i18n";
import Image from "next/image";
import { type SupportedLocale } from "../../lib/i18n";

/**
 * Component AuthLanguageSelector dạng Nút Pill Toggle góc phải màn hình Auth
 */
export function AuthLanguageSelector() {
  const { languageId, changeLanguage } = useI18n();
  const currentLocale = (languageId as SupportedLocale) || "vi";

  /**
   * Lấy đường dẫn hình ảnh lá cờ theo mã ngôn ngữ (locale)
   * @param locale Mã ngôn ngữ ("vi" | "en")
   * @returns Đường dẫn tệp hình ảnh lá cờ SVG trong thư mục public
   */
  const getIconFlagByLocale = (locale: string) => {
    if (locale === "vi") {
      return "/assets/icons/flags/flag-vn.svg";
    }
    return "/assets/icons/flags/flag-us.svg";
  };

  /**
   * Lớp CSS shadow khi nút ngôn ngữ ở trạng thái Active chuẩn thông số Figma:
   * Drop shadow 1: X=0, Y=1, Blur=2, Spread=-1
   * Drop shadow 2: X=0, Y=1, Blur=3, Spread=0
   */
  const activeShadowClass = "bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-[0_1px_2px_-1px_rgba(0,0,0,0.1),0_1px_3px_0_rgba(0,0,0,0.1)]";

  return (
    <div className="flex items-center bg-[#F5F5F5] dark:bg-slate-800 !p-[3px] rounded-lg select-none">
      {/* Nút Tiếng Anh (EN) */}
      <button
        type="button"
        onClick={() => changeLanguage("en")}
        className={`flex items-center gap-2 py-2 px-2.5 rounded-md text-sm font-medium transition-all cursor-pointer ${
          currentLocale === "en"
            ? activeShadowClass
            : ""
        }`}
      >
        <Image
          src={getIconFlagByLocale("en")}
          alt="English"
          width={16}
          height={12}
          className="w-4 h-3 rounded-xs object-cover"
        />
        <span>EN</span>
      </button>

      {/* Nút Tiếng Việt (VN) */}
      <button
        type="button"
        onClick={() => changeLanguage("vi")}
        className={`flex items-center gap-2 py-2 px-2.5 rounded-md text-sm font-medium transition-all cursor-pointer ${
          currentLocale === "vi"
            ? activeShadowClass
            : ""
        }`}
      >
        <Image
          src={getIconFlagByLocale("vi")}
          alt="Tiếng Việt"
          width={16}
          height={12}
          className="w-4 h-3 rounded-xs object-cover"
        />
        <span>VN</span>
      </button>
    </div>
  );
}
