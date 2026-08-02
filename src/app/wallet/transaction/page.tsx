"use client";

import TransactionFilter from "@customer/app/wallet/transaction/components/TransactionFilter";
import TransactionTable from "@customer/app/wallet/transaction/components/TransactionTable";
import { trpc } from "@customer/lib/trpc";
import { format, subDays } from "date-fns";
import { TopupStatus } from "@flash-ship/ecom-types";
import { useCallback, useEffect, useMemo, useState } from "react";

/**
 * Hook tùy chỉnh Debounce Value chống spam request API
 * 
 * @param value Giá trị cần debounce
 * @param delay Thời gian chờ (mặc định: 300ms)
 */
function useDebounceValue<T>(value: T, delay = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Trang Quản Lý Lịch Sử Biến Động Số Dư Ví Khách Hàng (`TransactionPage`)
 * - Kết nối TRPC API Query `trpc.customer.topup.getTransactionHistory.useQuery`.
 * - Tự động thiết lập bộ lọc mặc định: Lọc 7 ngày gần nhất, khóa ngày tương lai (`disableFuture = true`).
 * - Chỉ lấy các giao dịch ở trạng thái `status = 2` (`TopupStatus.CONFIRMED` - Đã phê duyệt).
 * - Phân trang mặc định `pageSize = 10`, `page = 1`, sắp xếp `updatedAt: "desc"`.
 * - Tối ưu hóa hiệu năng với Debounce Search 300ms và `staleTime: 10000ms` (React Query Caching).
 */
export default function TransactionPage() {
  // Khoảng thời gian mặc định 7 ngày gần nhất
  const defaultToDate = useMemo(() => format(new Date(), "yyyy-MM-dd"), []);
  const defaultFromDate = useMemo(() => format(subDays(new Date(), 6), "yyyy-MM-dd"), []);

  // State bộ lọc và phân trang
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [dateFrom, setDateFrom] = useState<string | undefined>(defaultFromDate);
  const [dateTo, setDateTo] = useState<string | undefined>(defaultToDate);
  const [orderCode, setOrderCode] = useState("");
  const [transactionType, setTransactionType] = useState("");

  // Debounce từ khóa tìm kiếm (300ms) để không spam request API
  const debouncedOrderCode = useDebounceValue(orderCode, 300);

  // Gọi TRPC Query lấy danh sách giao dịch (Chỉ lấy status = 2 = TopupStatus.CONFIRMED)
  const { data: responseData, isLoading } = trpc.customer.topup.getTransactionHistory.useQuery(
    {
      page,
      pageSize,
      dateFrom,
      dateTo,
      search: debouncedOrderCode,
      topupType: transactionType === "ALL" ? "" : transactionType,
      status: TopupStatus.CONFIRMED, // 2 = TopupStatus.CONFIRMED (Chỉ hiển thị các giao dịch đã được Phê duyệt)
      sortBy: "updatedAt",
      sortOrder: "desc",
    },
    {
      placeholderData: (previousData) => previousData,
      staleTime: 10_000, // Cache dữ liệu 10 giây giúp chuyển tab mượt mà
    },
  );

  const transactions = responseData?.data ?? [];
  const totalItems = responseData?.meta?.total ?? 0;

  // Handler thay đổi khoảng ngày
  const handleDateChange = useCallback((from?: string, to?: string) => {
    setDateFrom(from);
    setDateTo(to);
    setPage(1); // Reset về trang 1 khi chọn lại ngày
  }, []);

  // Handler thay đổi từ khóa tìm kiếm
  const handleOrderCodeChange = useCallback((code: string) => {
    setOrderCode(code);
    setPage(1); // Reset về trang 1 khi tìm kiếm
  }, []);

  // Handler thay đổi loại giao dịch
  const handleTransactionTypeChange = useCallback((type: string) => {
    setTransactionType(type);
    setPage(1); // Reset về trang 1 khi đổi loại giao dịch
  }, []);

  // Handler xóa toàn bộ bộ lọc về mặc định
  const handleClearAll = useCallback(() => {
    setDateFrom(defaultFromDate);
    setDateTo(defaultToDate);
    setOrderCode("");
    setTransactionType("");
    setPage(1);
  }, [defaultFromDate, defaultToDate]);

  // Handler xuất Excel danh sách giao dịch
  const exportMutation = trpc.customer.topup.exportTransactionExcel.useMutation({
    onSuccess: (data) => {
      if (!data?.fileData) return;
      downloadBase64File(data.filename || "Wallet_Transactions.xlsx", data.fileData);
    },
    onError: (error) => {
      console.error("Export Excel API error:", error);
    },
  });

  const handleExport = useCallback(() => {
    exportMutation.mutate({
      page,
      pageSize,
      dateFrom,
      dateTo,
      search: orderCode ? orderCode.trim() : undefined,
      topupType: transactionType === "ALL" ? "" : transactionType,
      status: TopupStatus.CONFIRMED,
      sortBy: "updatedAt",
      sortOrder: "desc",
    });
  }, [page, pageSize, dateFrom, dateTo, orderCode, transactionType, exportMutation]);

  // Handler chuyển trang
  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage);
  }, []);

  // Handler thay đổi số bản ghi / trang
  const handlePerPageChange = useCallback((newPerPage: number) => {
    setPageSize(newPerPage);
    setPage(1);
  }, []);

  return (
    <div className="flex flex-col gap-5 w-full">
      {/* 1. Thanh Bộ Lọc & Tìm Kiếm */}
      <TransactionFilter
        dateFrom={dateFrom}
        dateTo={dateTo}
        onDateChange={handleDateChange}
        orderCode={orderCode}
        onOrderCodeChange={handleOrderCodeChange}
        transactionType={transactionType}
        onTransactionTypeChange={handleTransactionTypeChange}
        onClearAll={handleClearAll}
        onExport={handleExport}
        isExporting={exportMutation.isPending}
      />

      {/* 2. Bảng Hiển Thị Danh Sách Giao Dịch */}
      <TransactionTable
        data={transactions}
        isLoading={isLoading}
        page={page}
        perPage={pageSize}
        total={totalItems}
        onPageChange={handlePageChange}
        onPerPageChange={handlePerPageChange}
      />
    </div>
  );
}

/**
 * Helper giải mã chuỗi Base64 và kích hoạt tải về File Blob Excel trên Trình Duyệt
 */
function downloadBase64File(filename: string, base64Data: string) {
  const byteCharacters = atob(base64Data);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  const blob = new Blob([byteArray], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
}
