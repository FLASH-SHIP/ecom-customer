"use client";

/**
 * @file TermsAndConditionsModal.tsx
 * @description Modal xác nhận Điều khoản & Điều kiện Dịch vụ (Terms & Conditions of Service)
 * chuẩn 100% giao diện Figma với hiệu ứng Glassmorphic Backdrop, cuộn mượt Y,
 * H-Scroll Tabs cho Mobile, đa ngôn ngữ EN/VN và đọc dữ liệu tập trung từ config/termsContent.ts.
 * 
 * 100% Code Comment & Ghi chú bằng Tiếng Việt.
 */

import { translate } from "@flash-ship/ecom-i18n";
import { useI18n } from "@ecom/shared/@i18n";
import { Button } from "@flash-ship/ecom-ui/components/button";
import { Checkbox } from "@flash-ship/ecom-ui/components/checkbox";
import { X } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { TabType, TERMS_CONTENT } from "../../config/termsContent";
import { trpc } from "../../lib/trpc";
import { showToast } from "../toast-provider";
import { AuthLanguageSelector } from "./AuthLanguageSelector";

export interface TermsAndConditionsModalProps {
  isOpen: boolean;
  customerId: string;
  onClose: () => void;
  onSuccess?: () => void;
}

/**
 * Hàm hỗ trợ hiển thị các thẻ định dạng in đậm/in nghiêng (<b>, <strong>, <i>, <u>) 
 * hoặc cú pháp **bold** trực tiếp từ tệp termsContent.ts
 */
function renderFormattedText(text: string) {
  if (!text) return null;

  // Chuyển đổi cú pháp markdown **text** thành <b>text</b>
  const htmlText = text.replace(/\*\*(.*?)\*\*/g, "<b>$1</b>");

  // Tách văn bản theo các thẻ HTML <b>, <strong>, <i>, <em>, <u>
  const parts = htmlText.split(/(<[b|strong|i|em|u]>.*?<\/[b|strong|i|em|u]>)/gi);

  return parts.map((part, index) => {
    const match = part.match(/^<([a-z]+)>(.*?)<\/\1>$/i);
    if (match) {
      const tag = match[1].toLowerCase();
      const content = match[2];
      if (tag === "b" || tag === "strong") {
        return (
          <strong key={index} className="font-bold text-slate-900 dark:text-slate-100">
            {content}
          </strong>
        );
      }
      if (tag === "i" || tag === "em") {
        return (
          <em key={index} className="italic">
            {content}
          </em>
        );
      }
      if (tag === "u") {
        return (
          <u key={index} className="underline">
            {content}
          </u>
        );
      }
    }
    return part;
  });
}

export function TermsAndConditionsModal({
  isOpen,
  customerId,
  onClose,
  onSuccess,
}: TermsAndConditionsModalProps) {
  const router = useRouter();
  const { languageId, changeLanguage } = useI18n();
  const currentLocale = languageId || "vi";
  const langKey = (currentLocale === "en" ? "en" : "vi") as "vi" | "en";

  /** State lưu Tab hiện tại được chọn */
  const [activeTab, setActiveTab] = useState<TabType>("credit");

  /** State quản lý trạng thái đã tích chọn checkbox đồng ý hay chưa */
  const [isAgreedChecked, setIsAgreedChecked] = useState(false);

  /** Lấy nội dung cấu hình phần điều khoản hiện tại */
  const currentSection = TERMS_CONTENT[activeTab];

  /**
   * Đóng modal khi người dùng nhấn phím Escape
   */
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  /**
   * Mutation tRPC cập nhật trạng thái đồng ý điều khoản dịch vụ
   */
  const acceptTermsMutation = trpc.customer.auth.acceptTerms.useMutation({
    onSuccess: () => {
      // Hiển thị Toast thông báo thành công ở góc trên bên phải
      const successMessage = translate("customerAuth.termsModal.successToast", currentLocale);
      showToast(successMessage, "success");

      if (onSuccess) {
        onSuccess();
      } else {
        router.push("/auth/login");
        onClose();
      }
    },
    onError: (err) => {
      showToast(err.message || "Đã xảy ra lỗi khi xác nhận điều khoản", "error");
    },
  });

  if (!isOpen) return null;

  /**
   * Xử lý nộp xác nhận đồng ý Điều khoản Dịch vụ
   */
  const handleAgree = () => {
    if (!isAgreedChecked || !customerId) return;
    acceptTermsMutation.mutate({ customerId });
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="terms-modal-title"
      className="fixed inset-0 z-[999] flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-md animate-in fade-in-0 duration-300"
    >
      {/* Khung Modal chính */}
      <div className="relative flex flex-col w-full max-w-4xl max-h-[85vh] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden animate-in fade-in-0 slide-in-from-bottom-6 zoom-in-95 duration-300 ease-out">
        {/* ========================================================================= */}
        {/* 1. HEADER CỐ ĐỊNH (FIXED HEADER) */}
        {/* ========================================================================= */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0">
          <div className="flex flex-col gap-0.5">
            <h2
              id="terms-modal-title"
              className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight"
            >
              {translate("customerAuth.termsModal.title", currentLocale)}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
              {translate("customerAuth.termsModal.subtitle", currentLocale)}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Bộ Chuyển Đổi Ngôn Ngữ EN / VN chuẩn Pill Switcher Figma */}
            <AuthLanguageSelector />

            {/* Nút Đóng Modal (X) */}
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              aria-label="Close dialog"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 2. NỘI DUNG CHÍNH THÂN MODAL (RESPONSIVE FLEX LAYOUT) */}
        {/* ========================================================================= */}
        <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
          {/* ----------------------------------------------------------------------- */}
          {/* TAB NAVIGATION: Sidebar Dọc trên Desktop/Tablet & H-Scroll trên Mobile */}
          {/* ----------------------------------------------------------------------- */}
          <div className="w-full md:w-56 bg-slate-50/70 dark:bg-slate-950/50 border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-800 p-3 shrink-0">
            <div className="flex md:flex-col overflow-x-auto md:overflow-x-visible no-scrollbar gap-1.5">
              <button
                type="button"
                onClick={() => setActiveTab("credit")}
                className={`flex items-center px-4 py-2.5 rounded-lg text-xs sm:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === "credit"
                    ? "bg-[#E6F4F6] text-[#008094] shadow-[0_2px_10px_rgba(0,128,148,0.12)] border-l-0 md:border-l-4 border-[#008094]"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800"
                }`}
              >
                {translate("customerAuth.termsModal.tabs.credit", currentLocale)}
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("transportation")}
                className={`flex items-center px-4 py-2.5 rounded-lg text-xs sm:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === "transportation"
                    ? "bg-[#E6F4F6] text-[#008094] shadow-[0_2px_10px_rgba(0,128,148,0.12)] border-l-0 md:border-l-4 border-[#008094]"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800"
                }`}
              >
                {translate("customerAuth.termsModal.tabs.transportation", currentLocale)}
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("appendix")}
                className={`flex items-center px-4 py-2.5 rounded-lg text-xs sm:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === "appendix"
                    ? "bg-[#E6F4F6] text-[#008094] shadow-[0_2px_10px_rgba(0,128,148,0.12)] border-l-0 md:border-l-4 border-[#008094]"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800"
                }`}
              >
                {translate("customerAuth.termsModal.tabs.appendix", currentLocale)}
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("trade")}
                className={`flex items-center px-4 py-2.5 rounded-lg text-xs sm:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === "trade"
                    ? "bg-[#E6F4F6] text-[#008094] shadow-[0_2px_10px_rgba(0,128,148,0.12)] border-l-0 md:border-l-4 border-[#008094]"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800"
                }`}
              >
                {translate("customerAuth.termsModal.tabs.trade", currentLocale)}
              </button>
            </div>
          </div>

          {/* ----------------------------------------------------------------------- */}
          {/* KHUNG NỘI DUNG CUỘN TRỤC Y BÊN PHẢI (TỰ ĐỘNG ĐỌC TỪ config/termsContent.ts) */}
          {/* ----------------------------------------------------------------------- */}
          <div className="flex-1 overflow-y-auto max-h-[55vh] md:max-h-[420px] p-6 text-slate-700 dark:text-slate-300 space-y-4">
            {currentSection && (
              <div
                key={activeTab}
                className="animate-in fade-in-30 slide-in-from-bottom-2 duration-200 space-y-4"
              >
                <span className="text-xs font-medium uppercase tracking-wider text-slate-400">
                  {typeof currentSection.sectionCode === "string"
                    ? currentSection.sectionCode
                    : currentSection.sectionCode[langKey]}
                </span>
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 border-b border-slate-200 dark:border-slate-800 pb-2">
                  {currentSection.title[langKey]}
                </h3>

                {currentSection.description && (
                  <p className="text-xs sm:text-sm leading-relaxed text-slate-600 dark:text-slate-400 font-normal">
                    {renderFormattedText(currentSection.description[langKey])}
                  </p>
                )}

                <div className="space-y-4 text-xs sm:text-sm leading-relaxed">
                  {(() => {
                    let runningCounter = 1;
                    return currentSection.clauses.map((clause, idx) => {
                      const listType = clause.listType || "number";
                      const isSubnumber = listType === "subnumber" || listType === "decimal";
                      const isAlpha = listType === "alpha" || listType === "letter";
                      const startNum = clause.startNumber ?? runningCounter;
                      const listItems = clause.list || [];

                      let subPrefix = "";
                      if (isSubnumber) {
                        if (clause.parentNumber !== undefined) {
                          subPrefix = String(clause.parentNumber);
                        } else if (clause.title && clause.title[langKey]) {
                          const match = clause.title[langKey].match(/^(\d+)/);
                          subPrefix = match ? match[1] : "1";
                        }
                      }

                      const renderedItems = listItems.map((item, itemIdx) => {
                        const itemNumber = startNum + itemIdx;
                        const letterStr = `${String.fromCharCode(97 + itemIdx)})`;

                        return (
                          <li key={itemIdx} className="flex items-start gap-2.5">
                            {listType === "bullet" && (
                              <span className="text-[#737373] font-medium text-sm mt-0.5 shrink-0 select-none">
                                •
                              </span>
                            )}
                            {listType === "number" && (
                              <span className="text-[#737373] font-medium text-sm shrink-0 select-none min-w-[20px]">
                                {itemNumber}.
                              </span>
                            )}
                            {isSubnumber && (
                              <span className="text-[#737373] font-medium text-sm shrink-0 select-none min-w-[28px]">
                                {subPrefix}.{itemIdx + 1}
                              </span>
                            )}
                            {isAlpha && (
                              <span className="text-[#737373] font-medium text-sm shrink-0 select-none min-w-[20px]">
                                {letterStr}
                              </span>
                            )}
                            <span className="flex-1 text-slate-600 dark:text-slate-400">
                              {renderFormattedText(item[langKey])}
                            </span>
                          </li>
                        );
                      });

                      if (listType === "number" && listItems.length > 0) {
                        runningCounter = startNum + listItems.length;
                      }

                      const isBoxedContainer = clause.variant === "boxed" || clause.isBoxed;

                      return (
                        <div
                          key={clause.id ? `${clause.id}-${idx}` : `clause-${idx}`}
                          className="space-y-2"
                        >
                          {clause.title && (
                            <h4 className="font-bold text-slate-900 dark:text-slate-100 uppercase mb-1">
                              {clause.title[langKey]}
                            </h4>
                          )}
                          <div
                            className={
                              isBoxedContainer
                                ? "p-3 xl:p-4 rounded-[4px] bg-[#F5F5F5] border border-[#A3A3A3] space-y-2.5 my-2"
                                : "space-y-2"
                            }
                          >
                            {clause.content && (
                              <p className="text-slate-600 dark:text-slate-400">
                                {renderFormattedText(clause.content[langKey])}
                              </p>
                            )}
                            {listItems.length > 0 && (
                              <ul className="space-y-2.5">
                                {renderedItems}
                              </ul>
                            )}
                          </div>
                        </div>
                      );
                    });
                  })()}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 3. FOOTER CỐ ĐỊNH (FIXED FOOTER WITH CHECKBOX & BUTTONS) */}
        {/* ========================================================================= */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0">
          {/* Checkbox Đồng Ý Nội Dung Điều Khoản */}
          <label
            htmlFor="terms-agree-checkbox"
            className="flex items-start gap-3 cursor-pointer select-none text-xs text-slate-600 dark:text-slate-300 max-w-xl"
          >
            <Checkbox
              id="terms-agree-checkbox"
              checked={isAgreedChecked}
              onCheckedChange={(checked) => setIsAgreedChecked(!!checked)}
              className="mt-0.5 border-slate-300 data-[state=checked]:bg-[#008094] data-[state=checked]:border-[#008094]"
            />
            <span>
              {translate("customerAuth.termsModal.agreeCheckbox", currentLocale)}
            </span>
          </label>

          {/* Cụm Nút Cancel & I Agree */}
          <div className="flex items-center gap-3 w-full sm:w-auto shrink-0 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="px-5 h-10 text-xs sm:text-sm font-semibold border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer"
            >
              {translate("customerAuth.termsModal.cancel", currentLocale)}
            </Button>

            <Button
              type="button"
              disabled={!isAgreedChecked || acceptTermsMutation.isPending}
              onClick={handleAgree}
              className={`px-6 h-10 text-xs sm:text-sm font-semibold rounded-lg transition-all cursor-pointer ${
                isAgreedChecked
                  ? "bg-gradient-to-r from-[#0F798C] to-[#008094] hover:from-[#006677] hover:to-[#006677] text-white shadow-[0_4px_14px_0_rgba(15,121,140,0.39)] hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]"
                  : "bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed"
              }`}
            >
              {acceptTermsMutation.isPending && (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent mr-2" />
              )}
              {translate("customerAuth.termsModal.agree", currentLocale)}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
