"use client";

import { DatePicker } from "@flash-ship/ecom-ui";
import { trpc } from "@customer/lib/trpc";
import { translate } from "@flash-ship/ecom-i18n";
import { useI18n } from "@ecom/shared/@i18n";
import { useToast } from "@customer/components/toast-provider";
import { Button } from "@flash-ship/ecom-ui/components/button";
import { Input } from "@flash-ship/ecom-ui/components/input";
import { BaseModal, BaseModalContent } from "@flash-ship/ecom-ui/components/modals/base-modal";
import {
  AlertCircle,
  Check,
  ChevronLeft,
  ChevronRight,
  Copy,
  ImageIcon,
  Loader2,
  Plus,
  X,
} from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import type { TopupItem } from "./TopupTable";

/**
 * Interface đối tượng ảnh upload mới
 */
interface UploadedImageItem {
  id: string;
  url: string;
  file: File;
}

export interface EditTopupModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: TopupItem | null;
  onSuccess?: () => void;
}

/**
 * Component Modal Cập nhật giao dịch nạp tiền (EditTopupModal).
 * 
 * LƯU Ý BẢO TRÌ (MAINTENANCE NOTES):
 * 1. Đồ thị luồng xử lý:
 *    - Upload ảnh chứng từ mới ➔ REST API (`POST /api/v1/upload/topup`) ➔ Lấy danh sách relativeUrls.
 *    - Gọi tRPC mutation `updateTopupRequest`: Xóa danh sách ảnh cũ trong DB, chèn ảnh mới, cập nhật wireAmount & wireDate.
 *    - Ghi lịch sử thao tác với actionName = "Khách hàng cập nhật giao dịch".
 *    - Kích hoạt `await trpcUtils.customer.topup.invalidate()` làm mới cache realtime cho TopupTable & MyWallet.
 * 2. Validate: Bắt buộc chọn Wire Date, nhập Wire Amount và tải lên ít nhất 1 ảnh chứng từ mới.
 */
export function EditTopupModal({
  open,
  onOpenChange,
  item,
  onSuccess,
}: EditTopupModalProps) {
  const { languageId: currentLocale } = useI18n();
  const { toast } = useToast();
  const trpcUtils = trpc.useUtils();

  // Truy vấn danh sách phương thức thanh toán để lấy thông tin `isBank`
  const { data: paymentMethods } = trpc.customer.topup.getPaymentMethods.useQuery();

  const currentPaymentMethodObj = paymentMethods?.find(
    (pm) => pm.id === (item as any)?.paymentMethodId || pm.name === item?.paymentMethod,
  );

  const isBank =
    currentPaymentMethodObj?.isBank ??
    (item?.paymentMethod?.toLowerCase().includes("bank") || false);

  // Form State
  const [wireDate, setWireDate] = useState<string>(() => {
    if (item?.wireDate) {
      try {
        return new Date(item.wireDate).toISOString().split("T")[0];
      } catch {
        return new Date().toISOString().split("T")[0];
      }
    }
    return new Date().toISOString().split("T")[0];
  });

  const [wireAmountUsd, setWireAmountUsd] = useState<string>(() =>
    item?.wireAmount ? String(item.wireAmount) : "",
  );
  const [wireAmountVnd, setWireAmountVnd] = useState<string>("");
  const [activeInput, setActiveInput] = useState<"usd" | "vnd" | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);

  // Upload State
  const [uploadedFiles, setUploadedFiles] = useState<UploadedImageItem[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // Field-level Error State (Lưu thông báo lỗi hiển thị ngay dưới từng trường)
  const [fieldErrors, setFieldErrors] = useState<{
    wireDate?: string;
    wireAmount?: string;
    wireImages?: string;
  }>({});

  // Synchronize state & reset errors khi modal mở hoặc item thay đổi
  useEffect(() => {
    if (open) {
      setErrorMessage(null);
      setFieldErrors({});
      setUploadedFiles([]);
    }
    if (item) {
      if (item.wireDate) {
        try {
          setWireDate(new Date(item.wireDate).toISOString().split("T")[0]);
        } catch {
          setWireDate(new Date().toISOString().split("T")[0]);
        }
      }
      setWireAmountUsd(item.wireAmount ? String(item.wireAmount) : "");
    }
  }, [open, item]);

  // Real-time validation helper for Wire Date
  const handleWireDateChange = (val: string) => {
    setWireDate(val);
    if (!val) {
      setFieldErrors((prev) => ({
        ...prev,
        wireDate:
          translate("customerWallet.addFundModal.wireDateRequired", currentLocale) ||
          "Please select wire date.",
      }));
    } else {
      const selectedDate = new Date(val);
      const today = new Date();
      today.setHours(23, 59, 59, 999);
      if (selectedDate > today) {
        setFieldErrors((prev) => ({
          ...prev,
          wireDate:
            translate("customerWallet.addFundModal.wireDateFutureError", currentLocale) ||
            "Wire date cannot be in the future.",
        }));
      } else {
        setFieldErrors((prev) => ({ ...prev, wireDate: undefined }));
      }
    }
  };

  // Real-time validation helper for Wire Amount
  const validateWireAmountRealtime = (usdVal: string) => {
    if (!usdVal || Number.isNaN(parseFloat(usdVal))) {
      setFieldErrors((prev) => ({
        ...prev,
        wireAmount:
          translate("customerWallet.addFundModal.wireAmountRequired", currentLocale) ||
          "Please enter wire amount.",
      }));
    } else if (parseFloat(usdVal) <= 0) {
      setFieldErrors((prev) => ({
        ...prev,
        wireAmount:
          translate("customerWallet.addFundModal.wireAmountPositive", currentLocale) ||
          "Wire amount must be greater than 0.",
      }));
    } else {
      setFieldErrors((prev) => ({ ...prev, wireAmount: undefined }));
    }
  };

  // Real-time validation effect for Uploaded Files
  useEffect(() => {
    setFieldErrors((prev) => {
      if (prev.wireImages === undefined && uploadedFiles.length === 0) {
        return prev;
      }
      if (uploadedFiles.length === 0) {
        return {
          ...prev,
          wireImages: getI18nText(
            "customerWallet.editTopupModal.uploadRequired",
            "Please upload at least 1 new wire transfer confirmation image.",
            "Vui lòng tải lên ít nhất 1 ảnh chứng từ xác nhận chuyển tiền mới.",
          ),
        };
      }
      return { ...prev, wireImages: undefined };
    });
  }, [uploadedFiles, currentLocale]);

  // Query Exchange Rate từ DB theo wireDate được chọn
  const { data: exchangeRateData } = trpc.customer.topup.getLatestExchangeRate.useQuery(
    { date: wireDate },
    { enabled: open && isBank },
  );

  const exchangeRate = exchangeRateData?.rate ? Number(exchangeRateData.rate) : 25000;

  // File Input Ref
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Scroll Container Ref cho danh sách ảnh chứng từ cũ & ảnh chứng từ mới
  const oldScrollContainerRef = useRef<HTMLDivElement>(null);
  const newScrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollOldLeft, setCanScrollOldLeft] = useState(false);
  const [canScrollOldRight, setCanScrollOldRight] = useState(false);
  const [canScrollNewLeft, setCanScrollNewLeft] = useState(false);
  const [canScrollNewRight, setCanScrollNewRight] = useState(false);

  const updateTopupMutation = trpc.customer.topup.update.useMutation();

  // Debounce 1s USD -> VND
  useEffect(() => {
    if (!isBank || activeInput !== "usd") return;
    const timer = setTimeout(() => {
      if (!wireAmountUsd) {
        setWireAmountVnd("");
        return;
      }
      const num = parseFloat(wireAmountUsd);
      if (!Number.isNaN(num)) {
        const vnd = Math.round(num * exchangeRate);
        setWireAmountVnd(vnd.toLocaleString("vi-VN"));
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, [wireAmountUsd, exchangeRate, activeInput, isBank]);

  // Debounce 1s VND -> USD
  useEffect(() => {
    if (!isBank || activeInput !== "vnd") return;
    const timer = setTimeout(() => {
      if (!wireAmountVnd) {
        setWireAmountUsd("");
        return;
      }
      const cleanDigits = wireAmountVnd.replace(/[^0-9]/g, "");
      const num = Number.parseInt(cleanDigits, 10);
      if (!Number.isNaN(num)) {
        const usd = (num / exchangeRate).toFixed(2);
        setWireAmountUsd(usd);
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, [wireAmountVnd, exchangeRate, activeInput, isBank]);

  // Check scroll position cho danh sách ảnh cũ
  const checkOldScrollPosition = () => {
    if (!oldScrollContainerRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = oldScrollContainerRef.current;
    setCanScrollOldLeft(scrollLeft > 2);
    setCanScrollOldRight(scrollLeft + clientWidth < scrollWidth - 2);
  };

  useEffect(() => {
    checkOldScrollPosition();
  }, [item?.wireImages]);

  // Check scroll position cho danh sách ảnh mới
  const checkNewScrollPosition = () => {
    if (!newScrollContainerRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = newScrollContainerRef.current;
    setCanScrollNewLeft(scrollLeft > 2);
    setCanScrollNewRight(scrollLeft + clientWidth < scrollWidth - 2);
  };

  useEffect(() => {
    checkNewScrollPosition();
  }, [uploadedFiles]);

  const handleCopyCode = () => {
    const code = item?.transactionCode || item?.wireTransferConfirmation || "";
    if (!code) return;
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    toast(
      translate("customerWallet.addFundModal.copySuccess", currentLocale) || "Đã sao chép vào bộ nhớ tạm!",
      "success",
    );
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMessage(null);
    if (!e.target.files) return;
    const selectedFiles = Array.from(e.target.files);
    processFiles(selectedFiles);
    e.target.value = "";
  };

  const processFiles = (files: File[]) => {
    if (uploadedFiles.length + files.length > 10) {
      setErrorMessage(
        translate("customerWallet.addFundModal.maxFilesError", currentLocale) ||
          "You can upload up to 10 images",
      );
      return;
    }

    const validNewItems: UploadedImageItem[] = [];

    for (const file of files) {
      if (file.size > 5 * 1024 * 1024) {
        setErrorMessage(
          translate("customerWallet.addFundModal.maxSizeError", currentLocale) ||
            "Each file size cannot exceed 5MB",
        );
        return;
      }

      if (!file.type.match(/^image\/(png|jpe?g)$/i)) {
        setErrorMessage(
          translate("customerWallet.addFundModal.requiredFormat", currentLocale) ||
            "Allowed format:*png, *jpg, *jpeg",
        );
        return;
      }

      const id = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      const url = URL.createObjectURL(file);
      validNewItems.push({ id, url, file });
    }

    setUploadedFiles((prev) => [...prev, ...validNewItems]);
  };

  const handleRemoveFile = (id: string) => {
    setUploadedFiles((prev) => {
      const target = prev.find((item) => item.id === id);
      if (target) {
        URL.revokeObjectURL(target.url);
      }
      return prev.filter((item) => item.id !== id);
    });
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    setErrorMessage(null);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFiles = Array.from(e.dataTransfer.files);
      processFiles(droppedFiles);
    }
  };

  const handleSubmit = async () => {
    if (!item) return;

    const errors: { wireDate?: string; wireAmount?: string; wireImages?: string } = {};

    // 1. Validate Wire Date (Required & Not Future Date)
    if (!wireDate) {
      errors.wireDate =
        translate("customerWallet.addFundModal.wireDateRequired", currentLocale) ||
        "Please select wire date.";
    } else {
      const selectedDate = new Date(wireDate);
      const today = new Date();
      today.setHours(23, 59, 59, 999);
      if (selectedDate > today) {
        errors.wireDate =
          translate("customerWallet.addFundModal.wireDateFutureError", currentLocale) ||
          "Wire date cannot be in the future.";
      }
    }

    // 2. Validate Wire Amount USD (Required & Positive Number > 0)
    if (!wireAmountUsd || Number.isNaN(parseFloat(wireAmountUsd))) {
      errors.wireAmount =
        translate("customerWallet.addFundModal.wireAmountRequired", currentLocale) ||
        "Please enter wire amount.";
    } else if (parseFloat(wireAmountUsd) <= 0) {
      errors.wireAmount =
        translate("customerWallet.addFundModal.wireAmountPositive", currentLocale) ||
        "Wire amount must be greater than 0.";
    }

    // 3. Validate Proof Images (Required at least 1 image)
    if (uploadedFiles.length === 0) {
      errors.wireImages =
        getI18nText(
          "customerWallet.editTopupModal.uploadRequired",
          "Please upload at least 1 new wire transfer confirmation image.",
          "Vui lòng tải lên ít nhất 1 ảnh chứng từ xác nhận chuyển tiền mới.",
        );
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setFieldErrors({});

    try {
      setIsSubmitting(true);
      setErrorMessage(null);

      // 1. Upload mảng ảnh mới lên API resizer endpoint (/api/v1/upload/topup)
      const formData = new FormData();
      for (const fileItem of uploadedFiles) {
        formData.append("files", fileItem.file);
      }

      const apiBaseUrl = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000").replace(/\/$/, "");
      const uploadRes = await fetch(`${apiBaseUrl}/api/v1/upload/topup`, {
        method: "POST",
        body: formData,
      });

      if (!uploadRes.ok) {
        let errText = "Tải ảnh chứng từ mới thất bại.";
        try {
          const errJson = await uploadRes.json();
          errText = errJson.message || errJson.error || errText;
        } catch {}
        throw new Error(errText);
      }

      const uploadData = await uploadRes.json();
      const relativeUrls: string[] = Array.isArray(uploadData.data) ? uploadData.data : [];

      // 2. Gọi tRPC mutation updateTopupRequest
      await updateTopupMutation.mutateAsync({
        id: Number(item.id),
        data: {
          wireAmount: parseFloat(wireAmountUsd),
          wireDate: wireDate,
          wireImages: relativeUrls,
        },
      });

      // 3. Làm mới cache realtime
      await trpcUtils.customer.topup.invalidate();

      // Cleanup state
      uploadedFiles.forEach((f) => URL.revokeObjectURL(f.url));
      setUploadedFiles([]);

      // Toast thông báo thành công
      toast(
        getI18nText(
          "customerWallet.editTopupModal.updateSuccess",
          "Transaction updated successfully!",
          "Cập nhật giao dịch nạp tiền thành công!",
        ),
        "success",
      );

      onSuccess?.();
      onOpenChange(false);
    } catch (err: any) {
      const errText =
        err?.message ||
        getI18nText(
          "customerWallet.editTopupModal.updateError",
          "Failed to update transaction.",
          "Cập nhật giao dịch nạp tiền thất bại!",
        );
      setErrorMessage(errText);
      toast(errText, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!item) return null;

  const getI18nText = (key: string, defaultEn: string, defaultVi: string) => {
    const text = translate(key, currentLocale);
    if (!text || text === key) {
      return currentLocale === "vi" ? defaultVi : defaultEn;
    }
    return text;
  };

  const titleViaPrefix = getI18nText(
    "customerWallet.editTopupModal.title",
    "Update transaction",
    "Cập nhật giao dịch",
  );

  const modalTitle = (
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 rounded-full bg-[#0F798C]/15 flex items-center justify-center">
        <div className="w-6 h-6 rounded-full bg-[#0F798C] text-white flex items-center justify-center font-bold text-xs shadow-xs">
          $
        </div>
      </div>
      <span className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
        {titleViaPrefix}
      </span>
    </div>
  );

  const modalFooter = (
    <>
      <Button
        type="button"
        variant="outline"
        onClick={() => onOpenChange(false)}
        disabled={isSubmitting}
        className="px-6 py-2 h-10 rounded-lg font-medium border-slate-300 text-slate-700 hover:bg-slate-100 dark:border-zinc-700 dark:text-slate-300 cursor-pointer transition-colors"
      >
        {translate("common.cancel", currentLocale) || (currentLocale === "vi" ? "Đóng lại" : "Cancel")}
      </Button>
      <Button
        type="button"
        onClick={handleSubmit}
        disabled={isSubmitting}
        className="px-6 py-2 h-10 rounded-lg font-semibold bg-[#0F798C] hover:bg-[#0c6070] text-white shadow-sm cursor-pointer transition-all disabled:opacity-50 flex items-center gap-2"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>{translate("customerWallet.addFundModal.submitting", currentLocale) || "Updating..."}</span>
          </>
        ) : (
          <span>
            {getI18nText(
              "customerWallet.editTopupModal.updateButton",
              "Update",
              "Cập nhật",
            )}
          </span>
        )}
      </Button>
    </>
  );

  const oldImages = item.wireImages || [];

  return (
    <BaseModal open={open} onOpenChange={onOpenChange}>
      <BaseModalContent
        title={modalTitle}
        footer={modalFooter}
        hideSearch={true}
        className="max-w-[650px] rounded-2xl [&>div:first-child]:px-6 [&>div:first-child]:py-4"
      >
        <div className="flex flex-col gap-4 py-2 text-slate-800 dark:text-slate-200">
          {/* Top Info Row: Transaction Code + Disabled Payment Method */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* 1. Transaction Code with Copy button */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                {getI18nText(
                  "customerWallet.editTopupModal.transactionCodeLabel",
                  "Transaction code",
                  "Mã giao dịch",
                )}
              </label>
              <div className="flex items-center justify-between px-3 py-2 border border-slate-200 dark:border-zinc-800 rounded-xl bg-slate-50 dark:bg-zinc-900/60 font-mono text-sm font-semibold text-[#0F798C]">
                <span className="truncate">{item.transactionCode}</span>
                <button
                  type="button"
                  onClick={handleCopyCode}
                  className="p-1 text-slate-400 hover:text-[#0F798C] cursor-pointer transition-colors"
                  title="Copy transaction code"
                >
                  {copiedCode ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* 2. Current Payment Method (Disabled) */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                {getI18nText(
                  "customerWallet.editTopupModal.currentPaymentMethodLabel",
                  "Payment method",
                  "Phương thức thanh toán",
                )}
              </label>
              <div className="flex items-center gap-2.5 px-3 py-2 border border-slate-200 dark:border-zinc-800 rounded-xl bg-slate-100 dark:bg-zinc-800/60 text-slate-500 dark:text-slate-400 cursor-not-allowed">
                {item.paymentMethodIcon ? (
                  <img
                    src={item.paymentMethodIcon}
                    alt={item.paymentMethod}
                    className="w-5 h-5 object-contain rounded-[4px]"
                  />
                ) : (
                  <div className="w-5 h-5 rounded-full bg-[#0F798C]/20 text-[#0F798C] flex items-center justify-center font-bold text-[10px]">
                    $
                  </div>
                )}
                <span className="text-sm font-medium">{item.paymentMethod}</span>
              </div>
            </div>
          </div>

          {/* Form Fields: Wire Date & Wire Amount */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Wire Date Picker */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                <span>{translate("customerWallet.addFundModal.wireDateLabel", currentLocale) || "Wire date"}</span>
                <span className="text-rose-500">*</span>
              </label>
              <DatePicker
                value={wireDate}
                onChange={handleWireDateChange}
                disabledDays={(date) => date > new Date()}
                placeholder="YYYY-MM-DD"
                className="w-full h-10 rounded-xl"
              />
              {fieldErrors.wireDate && (
                <span className="text-xs text-rose-500 font-medium flex items-center gap-1 mt-0.5">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  {fieldErrors.wireDate}
                </span>
              )}
            </div>

            {/* Wire Amount (USD) */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                <span>
                  {isBank
                    ? translate("customerWallet.addFundModal.wireAmountUsdLabel", currentLocale) || "Wire amount (USD)"
                    : translate("customerWallet.addFundModal.wireAmountLabel", currentLocale) || "Wire amount"}
                </span>
                <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-medium text-sm">
                  $
                </span>
                <Input
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="0.00"
                  value={wireAmountUsd}
                  onFocus={() => setActiveInput("usd")}
                  onChange={(e) => {
                    setActiveInput("usd");
                    const val = e.target.value;
                    setWireAmountUsd(val);
                    validateWireAmountRealtime(val);
                  }}
                  className="pl-7 h-10 rounded-xl font-medium"
                />
              </div>
              {fieldErrors.wireAmount && (
                <span className="text-xs text-rose-500 font-medium flex items-center gap-1 mt-0.5">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  {fieldErrors.wireAmount}
                </span>
              )}
            </div>
          </div>

          {/* If isBank = true: Show Wire Amount (VND) + Exchange rate info */}
          {isBank && (
            <div className="flex flex-col gap-2 p-3 rounded-xl bg-slate-50 dark:bg-zinc-900/50 border border-slate-200 dark:border-zinc-800">
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  {translate("customerWallet.addFundModal.exchangeRateText", currentLocale) || "Exchange rate:"}
                </span>
                <span className="font-bold text-[#0F798C]">
                  {exchangeRate.toLocaleString("vi-VN")} VND = 1 USD
                </span>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  {translate("customerWallet.addFundModal.wireAmountVndLabel", currentLocale) || "Wire amount (VND)"}
                </label>
                <div className="relative">
                  <Input
                    type="text"
                    placeholder="0"
                    value={wireAmountVnd}
                    onFocus={() => setActiveInput("vnd")}
                    onChange={(e) => {
                      setActiveInput("vnd");
                      const cleanDigits = e.target.value.replace(/[^0-9]/g, "");
                      const num = Number.parseInt(cleanDigits, 10);
                      setWireAmountVnd(Number.isNaN(num) ? "" : num.toLocaleString("vi-VN"));

                      if (exchangeRate > 0) {
                        const calculatedUsd = Number.isNaN(num) ? "" : (num / exchangeRate).toFixed(2);
                        validateWireAmountRealtime(calculatedUsd);
                      }
                    }}
                    className="pr-12 h-10 rounded-xl font-medium"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 font-medium text-xs">
                    VND
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Section 1: Old top-up confirmation (Chứng từ cũ) */}
          {oldImages.length > 0 && (
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                {getI18nText(
                  "customerWallet.editTopupModal.oldProofTitle",
                  "Old top-up confirmation",
                  "Chứng từ giao dịch cũ",
                )}
              </label>

              <div className="relative group">
                {canScrollOldLeft && (
                  <button
                    type="button"
                    onClick={() => oldScrollContainerRef.current?.scrollBy({ left: -220, behavior: "smooth" })}
                    className="absolute left-1 top-1/2 -translate-y-1/2 z-10 w-7 h-7 rounded-full bg-white/90 dark:bg-zinc-800/90 shadow-md flex items-center justify-center text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-zinc-800 transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                )}

                {canScrollOldRight && (
                  <button
                    type="button"
                    onClick={() => oldScrollContainerRef.current?.scrollBy({ left: 220, behavior: "smooth" })}
                    className="absolute right-1 top-1/2 -translate-y-1/2 z-10 w-7 h-7 rounded-full bg-white/90 dark:bg-zinc-800/90 shadow-md flex items-center justify-center text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-zinc-800 transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                )}

                <div
                  ref={oldScrollContainerRef}
                  onScroll={checkOldScrollPosition}
                  className="flex items-center gap-3 overflow-x-auto no-scrollbar py-1"
                >
                  {oldImages.map((imgUrl, idx) => (
                    <div
                      key={`old-${idx}`}
                      className="relative w-20 h-20 shrink-0 rounded-xl overflow-hidden border border-slate-200 dark:border-zinc-800 bg-slate-100 dark:bg-zinc-800"
                    >
                      <img src={imgUrl} alt={`Old proof ${idx + 1}`} className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Section 2: New top-up confirmation (Tải chứng từ mới - Required *) */}
          <div className="flex flex-col gap-2 mt-1">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                {getI18nText(
                  "customerWallet.editTopupModal.newProofTitle",
                  "New top-up confirmation",
                  "Tải chứng từ giao dịch mới",
                )}{" "}
                <span className="text-rose-500">*</span>{" "}
                <span className="text-slate-400 font-normal">
                  {translate("customerWallet.addFundModal.uploadNote", currentLocale) ||
                    "(Maximum 10 images, each image not exceeding 5MB)"}
                </span>
              </label>
            </div>

            {/* Hidden file input */}
            <input
              type="file"
              ref={fileInputRef}
              multiple
              accept="image/png, image/jpeg, image/jpg"
              onChange={handleFileSelect}
              className="hidden"
            />

            {uploadedFiles.length === 0 ? (
              /* State 1: Big Drag & Drop Zone Box when 0 files uploaded */
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className="rounded-2xl border-2 border-dashed border-sky-400/80 bg-slate-50/50 dark:bg-zinc-900/30 hover:bg-slate-100/50 dark:hover:bg-zinc-900/50 p-6 flex flex-col items-center justify-center gap-1.5 cursor-pointer transition-all text-center"
              >
                <div className="w-12 h-12 rounded-xl bg-slate-200/60 dark:bg-zinc-800 flex items-center justify-center mb-1 text-slate-400">
                  <ImageIcon className="w-7 h-7" />
                </div>

                <div className="text-sm text-slate-600 dark:text-slate-300 font-normal">
                  {translate("customerWallet.addFundModal.dragAndDrop", currentLocale) ||
                    "Drag & drop or"}{" "}
                  <span className="text-[#1B64F2] font-semibold hover:underline">
                    {translate("customerWallet.addFundModal.browse", currentLocale) || "Browse"}
                  </span>
                </div>

                <span className="text-xs text-slate-400">
                  {translate("customerWallet.addFundModal.uploadLimit", currentLocale) ||
                    "Upload up to 10 files"}
                </span>

                <span className="text-xs text-slate-400 font-medium">
                  {translate("customerWallet.addFundModal.requiredFormat", currentLocale) ||
                    "Required to upload:*png, *jpg, *jpeg"}
                </span>
              </div>
            ) : (
              /* State 2: Uploaded List View with Horizontal Scroll & Floating Arrows */
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className="relative rounded-2xl border-2 border-dashed border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/30 p-3 min-h-[120px] flex items-center"
              >
                {/* Left Scroll Arrow */}
                {canScrollNewLeft && (
                  <button
                    type="button"
                    onClick={() => newScrollContainerRef.current?.scrollBy({ left: -220, behavior: "smooth" })}
                    className="absolute left-2 z-10 w-8 h-8 rounded-full bg-white/90 dark:bg-zinc-800/90 shadow-md text-slate-700 dark:text-slate-200 flex items-center justify-center hover:bg-white dark:hover:bg-zinc-800 cursor-pointer border border-slate-200 dark:border-zinc-700 transition-all"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                )}

                {/* Horizontal Scroll Area */}
                <div
                  ref={newScrollContainerRef}
                  onScroll={checkNewScrollPosition}
                  className="w-full flex items-center gap-3 overflow-x-auto scrollbar-none py-1 px-1 scroll-smooth"
                  style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
                >
                  {uploadedFiles.map((item) => (
                    <div
                      key={item.id}
                      className="relative w-24 h-24 rounded-2xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 shrink-0 overflow-hidden group shadow-xs"
                    >
                      <img
                        src={item.url}
                        alt="New wire confirmation"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveFile(item.id);
                        }}
                        className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 text-white flex items-center justify-center opacity-90 hover:bg-rose-600 transition-all cursor-pointer"
                        title="Remove image"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}

                  {/* Add Image Button (+) - ONLY displayed when uploadedFiles.length > 0 AND < 10 */}
                  {uploadedFiles.length < 10 && (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-24 h-24 rounded-2xl border-2 border-dashed border-sky-400/80 bg-sky-50/50 dark:bg-sky-950/20 hover:bg-sky-100/50 dark:hover:bg-sky-950/40 flex flex-col items-center justify-center shrink-0 cursor-pointer transition-all group"
                    >
                      <div className="w-8 h-8 rounded-full bg-[#0F798C] text-white flex items-center justify-center mb-1 group-hover:scale-110 transition-transform">
                        <Plus className="w-5 h-5 stroke-[2.5]" />
                      </div>
                      <span className="text-[11px] font-bold text-[#0F798C]">
                        {translate("customerWallet.addFundModal.uploadButton", currentLocale) ||
                          "Upload file"}
                      </span>
                    </button>
                  )}
                </div>

                {/* Right Scroll Arrow */}
                {canScrollNewRight && (
                  <button
                    type="button"
                    onClick={() => newScrollContainerRef.current?.scrollBy({ left: 220, behavior: "smooth" })}
                    className="absolute right-2 z-10 w-8 h-8 rounded-full bg-white/90 dark:bg-zinc-800/90 shadow-md text-slate-700 dark:text-slate-200 flex items-center justify-center hover:bg-white dark:hover:bg-zinc-800 cursor-pointer border border-slate-200 dark:border-zinc-700 transition-all"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                )}
              </div>
            )}

            {fieldErrors.wireImages && (
              <span className="text-xs text-rose-500 font-medium flex items-center gap-1 mt-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                {fieldErrors.wireImages}
              </span>
            )}
          </div>

          {/* Error Alert Box */}
          {errorMessage && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-600 dark:text-rose-400 text-xs font-medium">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}
        </div>
      </BaseModalContent>
    </BaseModal>
  );
}
