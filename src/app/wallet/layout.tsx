"use client";

import { translate } from "@flash-ship/ecom-i18n";
import { useI18n } from "@ecom/shared/@i18n";
import { Key, Webhook } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type React from "react";

/**
 * Layout chung cho module Ví (Wallet) trên Customer Portal.
 * Quản lý thanh điều hướng tab: Nạp tiền (topup), Giao dịch (transaction), Số dư cuối kỳ (ending-balance).
 * 
 * LƯU Ý BẢO TRÌ (UX FIX):
 * Mặc định fallback khi `pathname` chỉ mới là "/wallet" (chưa chứa /transaction hay /ending-balance) 
 * BẮT BUỘC phải là "topup" để tránh lỗi giật chớp tab active sang "ending-balance" trước khi chuyển hướng.
 */
export default function LayoutWallet({ children }: { children: React.ReactNode }) {
  const { languageId: currentLocale } = useI18n();
  const pathname = usePathname();

  // Xác định tab đang active theo pathname (Mặc định fallback là "topup")
  const activeTab = pathname.includes("/transaction")
    ? "transaction"
    : pathname.includes("/ending-balance")
      ? "ending-balance"
      : "topup";

  return (
    <>
      <div className="flex flex-col gap-6 w-full pb-10">
        {/* Tabs Layout using Link */}
        <div className="bg-[#CCF2EB] dark:bg-teal-950/40 p-1 rounded-xl inline-flex gap-1 self-start border border-transparent dark:border-teal-800/20">
          <Link
            href="/wallet/topup"
            className={`px-6 py-2 font-bold text-sm transition-all rounded-lg flex items-center gap-2 cursor-pointer ${
              activeTab === "topup"
                ? "bg-white dark:bg-teal-900 text-[#0c6070] dark:text-teal-200 shadow-sm"
                : "text-[#0c6070] dark:text-teal-300 hover:bg-white/40 dark:hover:bg-teal-900/40"
            }`}
          >
            {translate("customerWallet.topup", currentLocale)}
          </Link>
          <Link
            href="/wallet/transaction"
            className={`px-6 py-2 font-bold text-sm transition-all rounded-lg flex items-center gap-2 cursor-pointer ${
              activeTab === "transaction"
                ? "bg-white dark:bg-teal-900 text-[#0c6070] dark:text-teal-200 shadow-sm"
                : "text-[#0c6070] dark:text-teal-300 hover:bg-white/40 dark:hover:bg-teal-900/40"
            }`}
          >
            {translate("customerWallet.transaction", currentLocale)}
          </Link>
          <Link
            href="/wallet/ending-balance"
            className={`px-6 py-2 font-bold text-sm transition-all rounded-lg flex items-center gap-2 cursor-pointer ${
              activeTab === "ending-balance"
                ? "bg-white dark:bg-teal-900 text-[#0c6070] dark:text-teal-200 shadow-sm"
                : "text-[#0c6070] dark:text-teal-300 hover:bg-white/40 dark:hover:bg-teal-900/40"
            }`}
          >
            {translate("customerWallet.endingBalance", currentLocale)}
          </Link>
        </div>

        {/* Tab content area */}
        {children}
      </div>
    </>
  );
}
