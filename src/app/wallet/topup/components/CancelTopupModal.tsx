"use client";

import { useI18n } from "@ecom/shared/@i18n";
import { translate } from "@flash-ship/ecom-i18n";
import { ConfirmModalType, TopupConfirmModal } from "@flash-ship/ecom-ui";
import React, { memo } from "react";
import type { TopupItem } from "./TopupTable";

/**
 * Props cho Component CancelTopupModal
 */
export interface CancelTopupModalProps {
  /** Trạng thái ẩn / hiện của Modal */
  open: boolean;
  /** Callback xử lý thay đổi trạng thái ẩn / hiện */
  onOpenChange: (open: boolean) => void;
  /** Thông tin bản ghi giao dịch nạp tiền đang chọn hủy */
  item: TopupItem | null;
  /** Callback gọi khi người dùng bấm nút Xác nhận hủy */
  onConfirm: () => Promise<void>;
  /** Trạng thái đang gọi API submit mutation */
  isSubmitting?: boolean;
}

/**
 * Component Modal Xác Nhận Hủy Giao Dịch Nạp Tiền (`CancelTopupModal`)
 * - Gọi đến `TopupConfirmModal` dùng chung từ gói `@flash-ship/ecom-ui`.
 * - Ánh xạ kiểu thông qua `ConfirmModalType.DANGER` enum.
 * - Hỗ trợ đầy đủ đa ngôn ngữ i18n và `React.memo` chống re-render thừa.
 */
export const CancelTopupModal = memo(function CancelTopupModal({
  open,
  onOpenChange,
  item,
  onConfirm,
  isSubmitting = false,
}: CancelTopupModalProps) {
  const { languageId: currentLocale } = useI18n();

  if (!item) return null;

  return (
    <TopupConfirmModal
      open={open}
      onOpenChange={onOpenChange}
      type={ConfirmModalType.DANGER}
      title={translate("customerWallet.cancelTopupModal.title", currentLocale)}
      amountLabel={translate("customerWallet.cancelTopupModal.amountLabel", currentLocale)}
      transactionCode={item.transactionCode || item.wireTransferConfirmation}
      transactionCodeLabel={translate("customerWallet.cancelTopupModal.transactionCodeLabel", currentLocale)}
      amount={item.wireAmount ? Number(item.wireAmount) : undefined}
      paymentMethod={item.paymentMethod}
      paymentMethodIcon={item.paymentMethodIcon}
      paymentMethodLabel={translate("customerWallet.cancelTopupModal.paymentMethodLabel", currentLocale)}
      confirmQuestion={translate("customerWallet.cancelTopupModal.confirmQuestion", currentLocale)}
      cancelText={translate("customerWallet.cancelTopupModal.cancelButton", currentLocale)}
      confirmText={translate("customerWallet.cancelTopupModal.confirmButton", currentLocale)}
      onConfirm={onConfirm}
      isSubmitting={isSubmitting}
    />
  );
});
