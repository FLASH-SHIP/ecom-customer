"use client";

import MyWallet from "@customer/app/wallet/topup/components/MyWallet";
import TopupTable, { type TopupItem } from "@customer/app/wallet/topup/components/TopupTable";
import WalletCost from "@customer/app/wallet/topup/components/WalletCost";
import WalletFilter from "@customer/app/wallet/topup/components/WalletFilter";
import { trpc } from "@customer/lib/trpc";
import { useState } from "react";
import { useToast } from "@customer/components/toast-provider";

export default function WalletTopupPage() {
  const { toast } = useToast();
  const trpcUtils = trpc.useUtils();

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [dateFrom, setDateFrom] = useState<string | undefined>();
  const [dateTo, setDateTo] = useState<string | undefined>();
  const [paymentMethod, setPaymentMethod] = useState<string>("");
  const [status, setStatus] = useState<string>("");

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

  const cancelMutation = trpc.customer.topup.cancel.useMutation({
    onSuccess: () => {
      toast("Cancelled top-up request successfully", "success");
      trpcUtils.customer.topup.getHistory.invalidate();
      trpcUtils.customer.topup.getWalletSummary.invalidate();
    },
    onError: (err) => {
      toast(err.message || "Failed to cancel top-up request", "error");
    },
  });

  const handleCancelItem = (item: TopupItem) => {
    if (window.confirm(`Are you sure you want to cancel top-up request ${item.transactionCode}?`)) {
      cancelMutation.mutate({ id: Number(item.id) });
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
        onCancel={handleCancelItem}
      />
    </div>
  );
}
