"use client";

/**
 * @file AuthLanguageSelector.tsx
 * @description Component chuyển đổi ngôn ngữ dạng Pill Toggle Switcher (`🇺🇸 EN` | `🇻🇳 VN`) y hệt Figma.
 * 
 * 100% Code Comment & Ghi chú bằng Tiếng Việt.
 */

import { useI18n } from "@ecom/shared/@i18n";
import { type SupportedLocale } from "../../lib/i18n";

/**
 * Component AuthLanguageSelector dạng Nút Pill Toggle góc phải màn hình Auth
 */
export function AuthLanguageSelector() {
  const { languageId, changeLanguage } = useI18n();
  const currentLocale = (languageId as SupportedLocale) || "vi";

  return (
    <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg border border-slate-200/60 dark:border-slate-700/60 select-none">
      {/* Nút Tiếng Anh (EN) */}
      <button
        type="button"
        onClick={() => changeLanguage("en")}
        className={`flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
          currentLocale === "en"
            ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs"
            : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
        }`}
      >
        <span className="text-xs leading-none">🇺🇸</span>
        <span>EN</span>
      </button>

      {/* Nút Tiếng Việt (VN) */}
      <button
        type="button"
        onClick={() => changeLanguage("vi")}
        className={`flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
          currentLocale === "vi"
            ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs"
            : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
        }`}
      >
        <span className="text-xs leading-none">🇻🇳</span>
        <span>VN</span>
      </button>
    </div>
  );
}
