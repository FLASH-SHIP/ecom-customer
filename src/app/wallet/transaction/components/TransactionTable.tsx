"use client";

import { useI18n } from "@ecom/shared/@i18n";
import { translate } from "@flash-ship/ecom-i18n";
import { TopupType } from "@flash-ship/ecom-types";
import { PaginationBase, TableBase } from "@flash-ship/ecom-ui";
import { Badge } from "@flash-ship/ecom-ui/components/badge";
import { Card } from "@flash-ship/ecom-ui/components/card";
import { format } from "date-fns";
import React, { memo, useMemo } from "react";

/**
 * Interface đối tượng bản ghi Lịch Sử Giao Dịch Ví hiển thị trên Table (`TransactionItemRecord`)
 */
export interface TransactionItemRecord {
  /** ID bản ghi giao dịch */
  id: string;
  /** Ngày xác nhận nạp tiền / Ngày tạo giao dịch (ISO String) */
  submissionDate: string | null;
  /** Mã đơn hàng (order_code) */
  orderCode: string | null;
  /** ID đơn hàng (order_id) */
  orderId: string | null;
  /** Loại giao dịch (topupType dạng enum TopupType) */
  topupType: TopupType | string;
  /** Số dư tài khoản trước giao dịch */
  accountBalanceBefore: number;
  /** Biến động số tiền giao dịch */
  amountChange: number;
  /** Số dư tài khoản sau giao dịch */
  accountBalanceAfter: number;
  /** Mô tả nội dung ghi chú giao dịch */
  description: string | null;
  /** Thời gian tạo bản ghi */
  createdAt?: string | null;
  /** Thời gian cập nhật bản ghi */
  updatedAt?: string | null;
}

/**
 * Props truyền vào Component `TransactionTable`
 */
export interface TransactionTableProps {
  /** Danh sách mảng các bản ghi giao dịch ví từ TRPC API */
  data?: TransactionItemRecord[];
  /** Trạng thái đang tải dữ liệu (Loading Spinner / Skeleton) */
  isLoading?: boolean;
  /** Trang hiện tại (1-indexed) */
  page: number;
  /** Số bản ghi hiển thị trên mỗi trang */
  perPage: number;
  /** Tổng số lượng bản ghi thỏa mãn điều kiện lọc */
  total: number;
  /** Callback khi người dùng chuyển trang */
  onPageChange: (newPage: number) => void;
  /** Callback khi người dùng thay đổi kích thước trang (pageSize) */
  onPerPageChange: (newPerPage: number) => void;
}

/**
 * Helper hàm định dạng số tiền USD dạng `$100.00`
 */
function formatCurrency(val: number | string): string {
  const num = typeof val === "number" ? val : Number.parseFloat(val);
  if (Number.isNaN(num)) return "$0.00";
  return `$${Math.abs(num).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

/**
 * Helper hàm định dạng chuỗi ngày tháng sang dạng `dd/MM/yyyy HH:mm:ss`
 */
function formatDate(dateStr?: string | null): string {
  if (!dateStr) return "-";
  try {
    return format(new Date(dateStr), "dd/MM/yyyy HH:mm:ss");
  } catch {
    return dateStr;
  }
}

/**
 * Component Hiển Thị Bảng Lịch Sử Biến Động Số Dư Ví (`TransactionTable`)
 * - Hiển thị 9 cột chuẩn: STT, Date, Order code, Order ID, Transaction type, Initial amount, Amount, Final amount, Description.
 * - Ánh xạ `topupType` thông qua Enum `TopupType` từ `@flash-ship/ecom-types`, không hardcode string.
 * - Tối ưu `React.memo` và `useMemo` chống re-render thừa.
 * - Hỗ trợ đa ngôn ngữ i18n (`en` & `vi`) đầy đủ.
 */
export const TransactionTable = memo(function TransactionTable({
  data = [],
  isLoading = false,
  page = 1,
  perPage = 10,
  total = 0,
  onPageChange,
  onPerPageChange,
}: TransactionTableProps) {
  const { languageId: currentLocale } = useI18n();

  /**
   * Render Badge màu sắc theo từng loại giao dịch ánh xạ chuẩn xác qua `TopupType` enum
   */
  const renderTransactionTypeBadge = (type: TopupType | string) => {
    switch (type) {
      case TopupType.PAID:
        return (
          <Badge className="bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-500/20 border-blue-200 font-medium">
            {translate("customerWallet.transactionFilter.paid", currentLocale) || "Paid"}
          </Badge>
        );
      case TopupType.ADDED_FUNDS:
        return (
          <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 border-emerald-200 font-medium">
            {translate("customerWallet.transactionFilter.addedFunds", currentLocale) || "Added Funds"}
          </Badge>
        );
      case TopupType.CANCELED:
        return (
          <Badge className="bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-500/20 border-zinc-200 font-medium">
            {translate("customerWallet.transactionFilter.canceled", currentLocale) || "Canceled"}
          </Badge>
        );
      case TopupType.REFUNDED:
        return (
          <Badge className="bg-purple-500/10 text-purple-600 dark:text-purple-400 hover:bg-purple-500/20 border-purple-200 font-medium">
            {translate("customerWallet.transactionFilter.refunded", currentLocale) || "Refunded"}
          </Badge>
        );
      case TopupType.ADJUST_BALANCE_INCREASE:
        return (
          <Badge className="bg-teal-500/10 text-teal-600 dark:text-teal-400 hover:bg-teal-500/20 border-teal-200 font-medium">
            {translate("customerWallet.transactionFilter.adjustBalanceIncrease", currentLocale) ||
              "Adjust Balance Increase"}
          </Badge>
        );
      case TopupType.ADJUST_BALANCE_DECREASE:
        return (
          <Badge className="bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-500/20 border-rose-200 font-medium">
            {translate("customerWallet.transactionFilter.adjustBalanceDecrease", currentLocale) ||
              "Adjust Balance Decrease"}
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="font-medium">
            {type}
          </Badge>
        );
    }
  };

  /**
   * Định nghĩa cấu hình các cột của Bảng (`columns`) bọc trong `useMemo` tối ưu hiệu năng
   */
  const columns = useMemo(
    () => [
      {
        header: translate("customerWallet.transactionTable.no", currentLocale) || "No.",
        width: 60,
        fixed: "left" as const,
        headerClassName: "text-center",
        className: "text-center font-medium text-muted-foreground",
        cell: (item: TransactionItemRecord) => {
          const index = data.findIndex((row) => row.id === item.id);
          const rowNumber = (page - 1) * perPage + (index >= 0 ? index : 0) + 1;
          return <div>{rowNumber}</div>;
        },
      },
      {
        header: translate("customerWallet.transactionTable.date", currentLocale) || "Date",
        width: 170,
        cell: (item: TransactionItemRecord) => <div>{formatDate(item.submissionDate)}</div>,
      },
      {
        header: translate("customerWallet.transactionTable.orderCode", currentLocale) || "Order code",
        width: 160,
        cell: (item: TransactionItemRecord) => (
          <span className="font-semibold text-[#0F798C]">{item.orderCode || "-"}</span>
        ),
      },
      {
        header:
          translate("customerWallet.transactionTable.partnerOrderId", currentLocale) || "Order ID",
        width: 160,
        cell: (item: TransactionItemRecord) => (
          <div className="font-medium text-slate-700 dark:text-slate-300">{item.orderId || "-"}</div>
        ),
      },
      {
        header:
          translate("customerWallet.transactionTable.transactionType", currentLocale) ||
          "Transaction type",
        width: 200,
        cell: (item: TransactionItemRecord) => renderTransactionTypeBadge(item.topupType),
      },
      {
        header:
          translate("customerWallet.transactionTable.initialAmount", currentLocale) ||
          "Initial amount",
        width: 150,
        cell: (item: TransactionItemRecord) => (
          <span className="text-foreground">
            {formatCurrency(item.accountBalanceBefore)}
          </span>
        ),
      },
      {
        header: translate("customerWallet.transactionTable.amount", currentLocale) || "Amount",
        width: 150,
        cell: (item: TransactionItemRecord) => {
          const amt = item.amountChange;
          const type = item.topupType;
          const isPositive =
            amt > 0 ||
            type === TopupType.ADDED_FUNDS ||
            type === TopupType.REFUNDED ||
            type === TopupType.ADJUST_BALANCE_INCREASE;
          const isNegative =
            amt < 0 ||
            type === TopupType.PAID ||
            type === TopupType.ADJUST_BALANCE_DECREASE;

          const prefix = amt === 0 ? "" : isPositive ? "+" : "-";

          return (
            <span
              className={`font-semibold ${
                amt === 0 || type === TopupType.CANCELED
                  ? "text-muted-foreground"
                  : isPositive
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-rose-600 dark:text-rose-400"
              }`}
            >
              {prefix}
              {formatCurrency(amt)}
            </span>
          );
        },
      },
      {
        header:
          translate("customerWallet.transactionTable.finalAmount", currentLocale) || "Final amount",
        width: 150,
        cell: (item: TransactionItemRecord) => (
          <span className="text-foreground">{formatCurrency(item.accountBalanceAfter)}</span>
        ),
      },
      {
        header:
          translate("customerWallet.transactionTable.description", currentLocale) || "Description",
        width: 280,
        cell: (item: TransactionItemRecord) => (
          <div className="text-muted-foreground truncate" title={item.description || ""}>
            {item.description || "-"}
          </div>
        ),
      },
    ],
    [currentLocale, page, perPage, data],
  );

  return (
    <Card className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
      <TableBase
        data={data}
        columns={columns}
        isLoading={isLoading}
        emptyMessage={
          translate("customerWallet.transactionTable.noRecordsFound", currentLocale) ||
          "No transaction records found."
        }
        minWidth={1400}
      />

      {/* Điều khiển phân trang (PaginationBase) */}
      {total > 0 && (
        <PaginationBase
          currentPage={page}
          totalItems={total}
          perPage={perPage}
          onPageChange={onPageChange}
          onPerPageChange={onPerPageChange}
          renderRangeText={(from, to, totalItems) => (
            <>
              {translate("pagination.showing", currentLocale)} {from}-{to}{" "}
              {translate("pagination.of", currentLocale)}{" "}
              <span className="text-[#0F798C] font-semibold">{totalItems}</span>{" "}
              {translate("pagination.items", currentLocale) || "items"}
            </>
          )}
        />
      )}
    </Card>
  );
});

export default TransactionTable;
