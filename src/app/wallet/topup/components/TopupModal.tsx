"use client";

import { trpc } from "@customer/lib/trpc";
import { translate } from "@flash-ship/ecom-i18n";
import { useI18n } from "@ecom/shared/@i18n";
import { BaseModal, BaseModalContent } from "@flash-ship/ecom-ui/components/modals/base-modal";
import React from "react";

export interface TopupModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectPaymentMethod?: (method: any) => void;
}

export function TopupModal({ open, onOpenChange, onSelectPaymentMethod }: TopupModalProps) {
  const { languageId: currentLocale } = useI18n();
  const { data: paymentMethods, isLoading } = trpc.customer.topup.getPaymentMethods.useQuery();

  const handleSelect = (method: any) => {
    onSelectPaymentMethod?.(method);
    onOpenChange(false);
  };

  const modalTitle = (
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 rounded-full bg-[#00B4D8]/15 flex items-center justify-center">
        <div className="w-6 h-6 rounded-full bg-[#00B4D8] text-white flex items-center justify-center font-bold text-xs shadow-xs">
          $
        </div>
      </div>
      <span className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
        {translate("customerWallet.topupModal.title", currentLocale) || "Top-up"}
      </span>
    </div>
  );

  return (
    <BaseModal open={open} onOpenChange={onOpenChange}>
      <BaseModalContent
        title={modalTitle}
        hideSearch={true}
        className="max-w-[620px] rounded-2xl [&>div:first-child]:px-6 [&>div:first-child]:py-4"
      >
        <div className="flex flex-col py-2">
          {/* Subheading */}
          <p className="text-sm lg:text-base 2xl:text-lg font-medium text-slate-500 dark:text-slate-400 mb-3">
            {translate("customerWallet.topupModal.pleaseSelectPaymentMethod", currentLocale) ||
              "Please select payment method:"}
          </p>

          {/* Payment Methods Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {isLoading ? (
              <div className="col-span-4 text-center py-6 text-slate-500">Loading payment methods...</div>
            ) : paymentMethods && paymentMethods.length > 0 ? (
              paymentMethods.map((method) => (
                <button
                  key={method.id}
                  type="button"
                  onClick={() => handleSelect(method)}
                  className="aspect-square w-full flex items-center justify-center p-3 border-2 border-slate-200 dark:border-zinc-800 rounded-2xl bg-white dark:bg-zinc-900 hover:border-[#0F798C] hover:shadow-md cursor-pointer transition-all duration-200 group outline-none overflow-hidden"
                  title={method.name}
                >
                  {method.image || method.icon ? (
                    <img
                      src={method.image || method.icon || ""}
                      alt={method.name}
                      className="w-full h-full object-contain aspect-square"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-[#007AFF]/10 text-[#007AFF] flex items-center justify-center font-bold text-base aspect-square">
                      {method.name.charAt(0)}
                    </div>
                  )}
                </button>
              ))
            ) : (
              <div className="col-span-4 text-center py-8 text-slate-500 dark:text-slate-400 text-sm font-medium">
                {(() => {
                  const translated = translate("customerWallet.topupModal.noPaymentMethods", currentLocale);
                  return translated && translated !== "customerWallet.topupModal.noPaymentMethods"
                    ? translated
                    : currentLocale === "vi"
                      ? "Chưa có phương thức thanh toán nào khả dụng."
                      : "No active payment methods configured yet.";
                })()}
              </div>
            )}
          </div>
        </div>
      </BaseModalContent>
    </BaseModal>
  );
}
