"use client";

import MyWallet from "@customer/app/wallet/topup/components/MyWallet";
import TopupTable, { type TopupItem } from "@customer/app/wallet/topup/components/TopupTable";
import WalletCost from "@customer/app/wallet/topup/components/WalletCost";
import WalletFilter from "@customer/app/wallet/topup/components/WalletFilter";
import { EditTopupModal } from "@customer/app/wallet/topup/components/EditTopupModal";
import { CancelTopupModal } from "@customer/app/wallet/topup/components/CancelTopupModal";
import { trpc } from "@customer/lib/trpc";
import { useState } from "react";
import { useToast } from "@customer/components/toast-provider";
import { useI18n } from "@ecom/shared/@i18n";
import { translate } from "@flash-ship/ecom-i18n";

export default function WalletTopupPage() {
  const { toast } = useToast();
  const { languageId: currentLocale } = useI18n();
  const trpcUtils = trpc.useUtils();

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [dateFrom, setDateFrom] = useState<string | undefined>();
  const [dateTo, setDateTo] = useState<string | undefined>();
  const [paymentMethod, setPaymentMethod] = useState<string>("");
  const [status, setStatus] = useState<string>("");

  // Modal Edit State
  const [editingItem, setEditingItem] = useState<TopupItem | null>(null);
  const [openEditModal, setOpenEditModal] = useState(false);

  // Modal Cancel State
  const [cancelingItem, setCancelingItem] = useState<TopupItem | null>(null);
  const [openCancelModal, setOpenCancelModal] = useState(false);
  const [isSubmittingCancel, setIsSubmittingCancel] = useState(false);

  const {
    data: historyData,
    isLoading,
    isFetching,
  } = trpc.customer.topup.getHistory.useQuery(
    {
      page,
      pageSize,
      dateFrom,
      dateTo,
      paymentMethodId: paymentMethod && paymentMethod !== "ALL" ? Number(paymentMethod) : undefined,
      status: status && status !== "ALL" ? status : undefined,
    },
    {
      placeholderData: (previousData) => previousData,
    },
  );

  const cancelMutation = trpc.customer.topup.cancel.useMutation();

  const handleEditItem = (item: TopupItem) => {
    setEditingItem(item);
    setOpenEditModal(true);
  };

  const handleCancelItem = (item: TopupItem) => {
    setCancelingItem(item);
    setOpenCancelModal(true);
  };

  const handleConfirmCancel = async () => {
    if (!cancelingItem) return;
    try {
      setIsSubmittingCancel(true);
      await cancelMutation.mutateAsync({ id: Number(cancelingItem.id) });

      // Làm mới cache tRPC (bảng giao dịch và tổng quan ví)
      await trpcUtils.customer.topup.invalidate();

      // Hiển thị Toast thông báo đa ngôn ngữ thành công
      const msg =
        translate("customerWallet.cancelTopupModal.cancelSuccess", currentLocale) ||
        "Top-up request cancelled successfully!";
      toast(msg, "success");

      setOpenCancelModal(false);
      setCancelingItem(null);
    } catch (err: any) {
      const errMsg =
        err?.message ||
        translate("customerWallet.cancelTopupModal.cancelError", currentLocale) ||
        "Failed to cancel top-up request.";
      toast(errMsg, "error");
    } finally {
      setIsSubmittingCancel(false);
    }
  };

  return (
    <div className="flex flex-col gap-5 w-full">
      {/* 2-Column Summary Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Card: My Wallet */}
        <MyWallet />

        {/* Right Card: Fulfillment Cost */}
        <WalletCost />
      </div>

      {/* Filter */}
      <WalletFilter
        dateFrom={dateFrom}
        dateTo={dateTo}
        paymentMethod={paymentMethod}
        status={status}
        onDateChange={(from, to) => {
          setDateFrom(from);
          setDateTo(to);
          setPage(1);
        }}
        onPaymentMethodChange={(pm) => {
          setPaymentMethod(pm);
          setPage(1);
        }}
        onStatusChange={(st) => {
          setStatus(st);
          setPage(1);
        }}
        onClearAll={() => {
          setDateFrom(undefined);
          setDateTo(undefined);
          setPaymentMethod("");
          setStatus("");
          setPage(1);
        }}
      />

      {/* Table */}
      <TopupTable
        data={historyData?.data}
        meta={historyData?.meta}
        isLoading={isLoading}
        isFetching={isFetching}
        page={page}
        perPage={pageSize}
        onPageChange={(p) => setPage(p)}
        onPerPageChange={(ps) => {
          setPageSize(ps);
          setPage(1);
        }}
        onEdit={handleEditItem}
        onCancel={handleCancelItem}
      />

      {/* Modal Edit Transaction */}
      <EditTopupModal
        open={openEditModal}
        onOpenChange={setOpenEditModal}
        item={editingItem}
      />

      {/* Modal Confirm Cancel Topup Transaction */}
      <CancelTopupModal
        open={openCancelModal}
        onOpenChange={setOpenCancelModal}
        item={cancelingItem}
        onConfirm={handleConfirmCancel}
        isSubmitting={isSubmittingCancel}
      />
    </div>
  );
}
