"use client";

/**
 * @file AuthSupportInfo.tsx
 * @description Component hiển thị hotline hỗ trợ (+84 934 024 337 & +84 852 763 445) nằm phía dưới Card giao diện chuẩn Figma.
 * 
 * 100% Code Comment & Ghi chú bằng Tiếng Việt.
 */

import { Phone, Send } from "lucide-react";

export function AuthSupportInfo() {
  return (
    <div className="flex items-center justify-center gap-4 py-1 select-none">
      {/* Hotline 1 */}
      <a
        href="tel:+84934024337"
        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-200 hover:text-[#008094] transition-colors"
      >
        <span className="flex items-center justify-center w-5 h-5 rounded-full bg-slate-200/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
          <Phone className="w-3 h-3" />
        </span>
        <span>+84 934 024 337</span>
      </a>

      {/* Hotline 2 */}
      <a
        href="tel:+84852763445"
        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-200 hover:text-[#008094] transition-colors"
      >
        <span className="flex items-center justify-center w-5 h-5 rounded-full bg-blue-500 text-white">
          <Send className="w-3 h-3" />
        </span>
        <span>+84 852 763 445</span>
      </a>
    </div>
  );
}
