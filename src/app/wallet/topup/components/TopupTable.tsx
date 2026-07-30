"use client";

import { PaginationBase, TableBase } from "@flash-ship/ecom-ui";
import { translate } from "@flash-ship/ecom-i18n";
import { useI18n } from "@ecom/shared/@i18n";
import { Badge } from "@flash-ship/ecom-ui/components/badge";
import { Button } from "@flash-ship/ecom-ui/components/button";
import { Card } from "@flash-ship/ecom-ui/components/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@flash-ship/ecom-ui/components/dropdown-menu";
import { ThreeDotsVerticalIcon } from "@flash-ship/ecom-ui/components/icons";
import { format } from "date-fns";
import { WireConfirmationGallery } from "./WireConfirmationGallery";

export interface TopupItem {
  id: string;
  transactionCode: string;
  orderCode: string;
  submissionDate: string;
  wireDate: string;
  paymentMethod: string;
  paymentMethodIcon?: string | null;
  wireTransferConfirmation: string;
  status: string | number;
  wireAmount: number | string;
  wireAmountApproved: number | string;
  wireImages?: string[];
}

export interface TopupTableProps {
  data?: TopupItem[];
  meta?: {
    total: number;
    page: number;
    pageSize: number;
  };
  isLoading?: boolean;
  page?: number;
  perPage?: number;
  onPageChange?: (page: number) => void;
  onPerPageChange?: (perPage: number) => void;
  onEdit?: (item: TopupItem) => void;
  onCancel?: (item: TopupItem) => void;
}

export default function TopupTable({
  data = [],
  meta = { total: 0, page: 1, pageSize: 10 },
  isLoading = false,
  page = 1,
  perPage = 10,
  onPageChange,
  onPerPageChange,
  onEdit,
  onCancel,
}: TopupTableProps) {
  const { languageId: currentLocale } = useI18n();

  const handlePageChange = (newPage: number) => {
    onPageChange?.(newPage);
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "-";
    try {
      const d = new Date(dateStr);
      if (Number.isNaN(d.getTime())) return dateStr;
      return format(d, "dd/MM/yyyy HH:mm");
    } catch {
      return dateStr;
    }
  };

  const formatShortDate = (dateStr?: string) => {
    if (!dateStr) return "-";
    try {
      const d = new Date(dateStr);
      if (Number.isNaN(d.getTime())) return dateStr;
      return format(d, "dd/MM/yyyy");
    } catch {
      return dateStr;
    }
  };

  const formatCurrency = (amount: number | string) => {
    const num = Number(amount) || 0;
    return `$${num.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const columns = [
    {
      header: translate("customerWallet.table.no", currentLocale) || "No.",
      width: 50,
      fixed: "left" as const,
      headerClassName: "text-center",
      className: "text-center font-medium text-muted-foreground",
      cell: (order: TopupItem) => {
        const index = data.findIndex((item) => item.id === order.id);
        const rowNumber = (page - 1) * perPage + (index >= 0 ? index : 0) + 1;
        return <div>{rowNumber}</div>;
      },
    },
    {
      header: translate("customerWallet.table.submissionDate", currentLocale) || "Submission Date",
      width: 170,
      cell: (order: TopupItem) => <div>{formatDate(order.submissionDate)}</div>,
    },
    {
      header: translate("customerWallet.table.wireDate", currentLocale) || "Wire Date",
      width: 135,
      cell: (order: TopupItem) => <div>{formatShortDate(order.wireDate)}</div>,
    },
    // Cột Phương thức thanh toán (Hiển thị icon 20x20px rounded-full viền #E9EAED ở bên trái)
    {
      header: translate("customerWallet.table.paymentMethod", currentLocale) || "Payment Method",
      width: 180,
      cell: (order: TopupItem) => {
        const iconUrl = order.paymentMethodIcon;
        return (
          <div className="flex items-center gap-2">
            {iconUrl ? (
              <img
                src={iconUrl}
                alt={order.paymentMethod}
                className="w-5 h-5 rounded-full object-contain shrink-0 border border-[#E9EAED]"
              />
            ) : (
              <div className="w-5 h-5 rounded-full bg-slate-100 dark:bg-zinc-800 border border-[#E9EAED] flex items-center justify-center shrink-0 text-[10px] font-bold text-slate-500">
                {order.paymentMethod ? order.paymentMethod.charAt(0).toUpperCase() : "$"}
              </div>
            )}
            <span className="font-medium text-slate-800 dark:text-slate-200 truncate">
              {order.paymentMethod}
            </span>
          </div>
        );
      },
    },
    {
      header:
        translate("customerWallet.table.wireTransferConfirmation", currentLocale) ||
        "Wire transfer confirmation",
      width: 220,
      cell: (order: TopupItem) => (
        <WireConfirmationGallery
          images={order.wireImages && order.wireImages.length > 0 ? order.wireImages : undefined}
          fallbackText={order.wireTransferConfirmation || order.transactionCode}
        />
      ),
    },
    {
      header: translate("customerWallet.table.status", currentLocale) || "Status",
      width: 135,
      cell: (order: TopupItem) => {
        const rawStatus = order.status;
        const statusNum = Number(rawStatus);
        const upperStatus = String(rawStatus || "").toUpperCase();

        if (statusNum === 2 || upperStatus === "CONFIRM" || upperStatus === "CONFIRMED" || upperStatus === "APPROVED") {
          return (
            <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 border-emerald-200 font-medium">
              {translate("customerWallet.status.confirm", currentLocale) || "Confirmed"}
            </Badge>
          );
        }
        if (statusNum === 1 || upperStatus === "WAITING" || upperStatus === "CREATED") {
          return (
            <Badge className="bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20 border-amber-200 font-medium">
              {translate("customerWallet.status.waiting", currentLocale) || "Waiting"}
            </Badge>
          );
        }
        if (statusNum === 3 || upperStatus === "CANCELLED" || upperStatus === "CANCEL") {
          return (
            <Badge className="bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 border-zinc-200 font-medium">
              {translate("customerWallet.status.cancel", currentLocale) || "Cancelled"}
            </Badge>
          );
        }
        return (
          <Badge className="bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-500/20 border-rose-200 font-medium">
            {translate("customerWallet.status.reject", currentLocale) || "Rejected"}
          </Badge>
        );
      },
    },
    {
      header: translate("customerWallet.table.wireAmount", currentLocale) || "Wire Amount",
      width: 160,
      cell: (order: TopupItem) => (
        <span className="font-bold text-foreground">{formatCurrency(order.wireAmount)}</span>
      ),
    },
    {
      header: translate("customerWallet.table.approvedAmount", currentLocale) || "Approved Amount",
      width: 160,
      cell: (order: TopupItem) => (
        <span className="font-bold text-emerald-600 dark:text-emerald-400">
          {formatCurrency(order.wireAmountApproved)}
        </span>
      ),
    },
    {
      header: translate("customerWallet.table.action", currentLocale) || "Action",
      width: 80,
      fixed: "right" as const,
      headerClassName: "text-center",
      className: "text-center",
      cell: (order: TopupItem) => {
        // Chỉ hiển thị nút 3 chấm khi trạng thái là WAITING (status = 1)
        const statusNum = Number(order.status);
        const upperStatus = String(order.status || "").toUpperCase();
        if (statusNum !== 1 && upperStatus !== "WAITING") {
          return <div />;
        }

        return (
          // biome-ignore lint/a11y/noStaticElementInteractions lint/a11y/useKeyWithClickEvents: stop row click
          <div onClick={(e) => e.stopPropagation()}>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="hover:bg-accent text-primary h-8 w-8 rounded-lg cursor-pointer outline-none focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 data-[state=open]:ring-0 data-[state=open]:outline-none"
                  title="Actions"
                >
                  <ThreeDotsVerticalIcon />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-36 bg-white dark:bg-zinc-900 border border-border shadow-md rounded-lg p-1 z-30"
              >
                <DropdownMenuItem
                  className="px-3 py-2 text-sm text-foreground hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit?.(order);
                  }}
                >
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="px-3 py-2 text-sm text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-md cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    onCancel?.(order);
                  }}
                >
                  Cancel
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    },
  ];

  return (
    <Card className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
      <TableBase
        data={data}
        columns={columns}
        isLoading={isLoading}
        emptyMessage={
          translate("customerWallet.table.noRecordsFound", currentLocale) ||
          "No top-up records found."
        }
        minWidth={1200}
      />

      {/* Pagination Controls */}
      {meta && meta.total > 0 && (
        <PaginationBase
          currentPage={page}
          totalItems={meta.total}
          perPage={perPage}
          onPageChange={handlePageChange}
          onPerPageChange={(val) => {
            onPerPageChange?.(val);
          }}
          renderRangeText={(from, to, total) => (
            <>
              {translate("pagination.showing", currentLocale)} {from}-{to}{" "}
              {translate("pagination.of", currentLocale)}{" "}
              <span className="text-[#0F798C] font-semibold">{total}</span>{" "}
              {translate("pagination.orders", currentLocale)}
            </>
          )}
        />
      )}
    </Card>
  );
}
