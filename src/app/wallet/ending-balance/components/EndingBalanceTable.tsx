"use client";

import { PaginationBase } from "@flash-ship/ecom-ui";
import { TableBase } from "@flash-ship/ecom-ui";
import { translate } from "@flash-ship/ecom-i18n";
import { useI18n } from "@ecom/shared/@i18n";
import { Card } from "@flash-ship/ecom-ui/components/card";
import { useState } from "react";

export interface EndingBalanceItem {
  id: string;
  date: string;
  totalTopupAmount: string;
  totalPaymentAmount: string;
  totalRefundAmount: string;
  totalAdjustmentAmount: string;
  endingBalance: string;
}

const EMPTY_ENDING_BALANCE_DATA = {
  data: [] as EndingBalanceItem[],
  meta: {
    total: 0,
    page: 1,
    perPage: 10,
  },
};

export default function EndingBalanceTable() {
  const { languageId: currentLocale } = useI18n();
  const isLoading = false;

  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const listData = EMPTY_ENDING_BALANCE_DATA;

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  type EndingBalanceRow = EndingBalanceItem;

  const columns = [
    {
      header: translate("customerWallet.endingBalanceTable.no", currentLocale) || "No.",
      width: 60,
      fixed: "left" as const,
      headerClassName: "text-center",
      className: "text-center font-medium text-muted-foreground",
      cell: (item: EndingBalanceRow) => {
        const index = listData.data.findIndex((row) => row.id === item.id);
        const rowNumber = (page - 1) * perPage + index + 1;
        return <div>{rowNumber}</div>;
      },
    },
    {
      header: translate("customerWallet.endingBalanceTable.date", currentLocale) || "Date",
      width: 150,
      cell: (item: EndingBalanceRow) => <div>{item.date}</div>,
    },
    {
      header:
        translate("customerWallet.endingBalanceTable.totalTopupAmount", currentLocale) ||
        "Total topup amount",
      width: 180,
      cell: (item: EndingBalanceRow) => (
        <span className="font-semibold text-emerald-600 dark:text-emerald-400">
          {item.totalTopupAmount}
        </span>
      ),
    },
    {
      header:
        translate("customerWallet.endingBalanceTable.totalPaymentAmount", currentLocale) ||
        "Total payment amount",
      width: 180,
      cell: (item: EndingBalanceRow) => (
        <span className="font-semibold text-rose-600 dark:text-rose-400">
          {item.totalPaymentAmount}
        </span>
      ),
    },
    {
      header:
        translate("customerWallet.endingBalanceTable.totalRefundAmount", currentLocale) ||
        "Total refund amount",
      width: 180,
      cell: (item: EndingBalanceRow) => (
        <span className="font-semibold text-purple-600 dark:text-purple-400">
          {item.totalRefundAmount}
        </span>
      ),
    },
    {
      header:
        translate("customerWallet.endingBalanceTable.totalAdjustmentAmount", currentLocale) ||
        "Total adjustment amount",
      width: 190,
      cell: (item: EndingBalanceRow) => {
        const isPositive = item.totalAdjustmentAmount.startsWith("+");
        const isNegative = item.totalAdjustmentAmount.startsWith("-");
        return (
          <span
            className={`font-semibold ${
              isPositive
                ? "text-teal-600 dark:text-teal-400"
                : isNegative
                  ? "text-rose-600 dark:text-rose-400"
                  : "text-muted-foreground"
            }`}
          >
            {item.totalAdjustmentAmount}
          </span>
        );
      },
    },
    {
      header:
        translate("customerWallet.endingBalanceTable.endingBalance", currentLocale) ||
        "Ending balance",
      width: 170,
      cell: (item: EndingBalanceRow) => (
        <span className="font-bold text-foreground">{item.endingBalance}</span>
      ),
    },
  ];

  return (
    <Card className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
      <TableBase
        data={listData.data}
        columns={columns}
        isLoading={isLoading}
        emptyMessage={
          translate("customerWallet.endingBalanceTable.noRecordsFound", currentLocale) ||
          "No ending balance records found."
        }
        minWidth={1100}
      />

      {/* Pagination Controls */}
      {listData && listData.meta.total > 0 && (
        <PaginationBase
          currentPage={page}
          totalItems={listData.meta.total}
          perPage={perPage}
          onPageChange={handlePageChange}
          onPerPageChange={(val) => {
            setPerPage(val);
            setPage(1);
          }}
          renderRangeText={(from, to, total) => (
            <>
              {translate("pagination.showing", currentLocale)} {from}-{to}{" "}
              {translate("pagination.of", currentLocale)}{" "}
              <span className="text-[#0F798C] font-semibold">{total}</span>{" "}
              {translate("pagination.items", currentLocale) || "items"}
            </>
          )}
        />
      )}
    </Card>
  );
}
