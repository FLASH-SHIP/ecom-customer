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
  Info,
  Loader2,
  Plus,
  X,
} from "lucide-react";
import React, { useEffect, useRef, useState } from "react";

export interface SelectedPaymentMethodInfo {
  id?: number;
  name: string;
  isBank: boolean;
  icon?: string | null;
  image?: string | null;
  dataInfo?: string | null;
}

export interface AddFundModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedPaymentMethod?: SelectedPaymentMethodInfo | null;
  methodId?: string;
  methodName?: string;
  methodLogo?: React.ReactNode;
  onBack?: () => void;
  onSubmit?: () => void;
}

interface UploadedImageItem {
  id: string;
  url: string;
  file: File;
}

export function AddFundModal({
  open,
  onOpenChange,
  selectedPaymentMethod,
  methodId = "payoneer",
  methodName = "Payoneer",
  methodLogo,
  onBack,
  onSubmit,
}: AddFundModalProps) {
  const { languageId: currentLocale } = useI18n();
  const { toast } = useToast();
  const trpcUtils = trpc.useUtils();

  const isBank =
    selectedPaymentMethod?.isBank ??
    (methodId === "payoneer" || methodName?.toLowerCase().includes("payoneer"));

  // Form State
  const [wireDate, setWireDate] = useState<string>(() => new Date().toISOString().split("T")[0]);
  const [wireAmountUsd, setWireAmountUsd] = useState<string>("");
  const [wireAmountVnd, setWireAmountVnd] = useState<string>("");
  const [activeInput, setActiveInput] = useState<"usd" | "vnd" | null>(null);

  // Query Exchange Rate from DB topup_exchange_rate_management according to selected wireDate
  const { data: exchangeRateData } = trpc.customer.topup.getLatestExchangeRate.useQuery(
    wireDate ? { date: wireDate } : undefined,
  );

  const exchangeRate =
    typeof exchangeRateData === "number" && exchangeRateData > 0 ? exchangeRateData : 25000;

  // Copy State
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Upload State
  const [uploadedFiles, setUploadedFiles] = useState<UploadedImageItem[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Field-level Error State (Lưu thông báo lỗi hiển thị ngay dưới từng trường)
  const [fieldErrors, setFieldErrors] = useState<{
    wireDate?: string;
    wireAmount?: string;
    wireImages?: string;
  }>({});

  // Scroll State
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // Parse dataInfo JSON
  const parsedDataInfo = React.useMemo(() => {
    if (!selectedPaymentMethod?.dataInfo) return {};
    try {
      return typeof selectedPaymentMethod.dataInfo === "string"
        ? JSON.parse(selectedPaymentMethod.dataInfo)
        : selectedPaymentMethod.dataInfo;
    } catch {
      return {};
    }
  }, [selectedPaymentMethod?.dataInfo]);

  // Dynamic payment info fields
  const accountEmail = (parsedDataInfo?.email || "").trim();
  const accountHolder = (
    parsedDataInfo?.account_holder ||
    parsedDataInfo?.accountHolder ||
    "-"
  ).trim();
  const bankName = (parsedDataInfo?.bank_name || parsedDataInfo?.bankName || "-").trim();
  const accountNumber = (
    parsedDataInfo?.account_number ||
    parsedDataInfo?.accountNumber ||
    "-"
  ).trim();
  const description = (parsedDataInfo?.description || "-").trim();
  const defaultQrUrl = "/assets/images/qr-code/banking.jpg";
  const rawQrUrl = (parsedDataInfo?.qr_url || parsedDataInfo?.qrUrl || "").trim();

  const [qrSrc, setQrSrc] = useState<string>(rawQrUrl || defaultQrUrl);

  useEffect(() => {
    setQrSrc(rawQrUrl || defaultQrUrl);
  }, [rawQrUrl]);

  // Debounce 1s USD -> VND
  useEffect(() => {
    if (activeInput !== "usd") return;
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
  }, [wireAmountUsd, exchangeRate, activeInput]);

  // Debounce 1s VND -> USD
  useEffect(() => {
    if (activeInput !== "vnd") return;
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
  }, [wireAmountVnd, exchangeRate, activeInput]);

  // Reset modal state & errors whenever modal opens or payment method changes
  useEffect(() => {
    if (open) {
      setErrorMessage(null);
      setFieldErrors({});
    }
  }, [open, selectedPaymentMethod]);

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

  // Handle USD Input Change
  const handleUsdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setActiveInput("usd");
    setWireAmountUsd(val);
    validateWireAmountRealtime(val);
  };

  // Handle VND Input Change
  const handleVndChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    const cleanDigits = val.replace(/[^0-9]/g, "");
    setActiveInput("vnd");
    const num = Number.parseInt(cleanDigits, 10);
    const formattedVnd = Number.isNaN(num) ? "" : num.toLocaleString("vi-VN");
    setWireAmountVnd(formattedVnd);

    if (exchangeRate > 0) {
      const calculatedUsd = Number.isNaN(num) ? "" : (num / exchangeRate).toFixed(2);
      validateWireAmountRealtime(calculatedUsd);
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
          wireImages:
            translate("customerWallet.addFundModal.uploadRequired", currentLocale) ||
            "Please upload at least 1 wire transfer confirmation image.",
        };
      }
      return { ...prev, wireImages: undefined };
    });
  }, [uploadedFiles, currentLocale]);

  // Check scroll position
  const checkScrollPosition = () => {
    if (!scrollContainerRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
    setCanScrollLeft(scrollLeft > 2);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 2);
  };

  useEffect(() => {
    checkScrollPosition();
  }, [uploadedFiles]);

  const handleScrollLeft = () => {
    scrollContainerRef.current?.scrollBy({ left: -220, behavior: "smooth" });
  };

  const handleScrollRight = () => {
    scrollContainerRef.current?.scrollBy({ left: 220, behavior: "smooth" });
  };

  const handleCopy = (text: string, key: string) => {
    const trimmed = text ? text.trim() : "";
    if (!trimmed || trimmed === "-") return;
    navigator.clipboard.writeText(trimmed);
    setCopiedKey(key);
    toast(
      translate("customerWallet.addFundModal.copySuccess", currentLocale) ||
        "Đã sao chép vào bộ nhớ tạm!",
      "success",
    );
    setTimeout(() => setCopiedKey(null), 2000);
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
            "Each image must not exceed 5MB",
        );
        return;
      }

      const isValidType =
        file.type === "image/png" ||
        file.type === "image/jpeg" ||
        file.type === "image/jpg" ||
        file.name.match(/\.(png|jpg|jpeg)$/i);

      if (!isValidType) {
        setErrorMessage(
          translate("customerWallet.addFundModal.requiredFormat", currentLocale) ||
            "Required to upload:*png, *jpg, *jpeg",
        );
        return;
      }

      const imageUrl = URL.createObjectURL(file);
      validNewItems.push({
        id: `${file.name}-${Date.now()}-${Math.random()}`,
        url: imageUrl,
        file,
      });
    }

    setUploadedFiles((prev) => [...prev, ...validNewItems]);
  };

  const handleRemoveFile = (id: string) => {
    setUploadedFiles((prev) => {
      const itemToRemove = prev.find((item) => item.id === id);
      if (itemToRemove) {
        URL.revokeObjectURL(itemToRemove.url);
      }
      return prev.filter((item) => item.id !== id);
    });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    if (e.dataTransfer.files) {
      processFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleBack = () => {
    uploadedFiles.forEach((item) => {
      URL.revokeObjectURL(item.url);
    });
    setUploadedFiles([]);
    setErrorMessage(null);
    setWireDate(new Date().toISOString().split("T")[0]);
    setWireAmountUsd("");
    setWireAmountVnd("");
    onBack?.();
  };

  const [isSubmitting, setIsSubmitting] = useState(false);
  const utils = trpc.useUtils();
  const createTopupMutation = trpc.customer.topup.createTopupRequest.useMutation({
    onSuccess: () => {
      utils.customer.topup.getWalletSummary.invalidate();
      utils.customer.topup.getTopupHistory.invalidate();
    },
  });

  const handleSubmit = async () => {
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
        translate("customerWallet.addFundModal.uploadRequired", currentLocale) ||
        "Please upload at least 1 wire transfer confirmation image.";
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setFieldErrors({});

    try {
      setIsSubmitting(true);
      setErrorMessage(null);

      // 1. Tải mảng ảnh lên Tool Resizer Image API endpoint (/api/v1/upload/topup)
      // Tự động dùng NEXT_PUBLIC_API_URL (Localhost: http://localhost:4000, Server Dev: https://dev-api.ecomexpress.vn)
      const formData = new FormData();
      for (const item of uploadedFiles) {
        formData.append("files", item.file);
      }

      const apiBaseUrl = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000").replace(/\/$/, "");
      const uploadRes = await fetch(`${apiBaseUrl}/api/v1/upload/topup`, {
        method: "POST",
        body: formData,
      });

      if (!uploadRes.ok) {
        let errText = "Tải ảnh chứng từ thất bại.";
        try {
          const errJson = await uploadRes.json();
          errText = errJson.message || errJson.error || errText;
        } catch {}
        throw new Error(errText);
      }

      const uploadData = await uploadRes.json();
      const relativeUrls: string[] = Array.isArray(uploadData.data) ? uploadData.data : [];

      // 2. Gọi TRPC mutation createTopupRequest để khởi tạo bản ghi yêu cầu nạp tiền (status = 1 WAITING)
      // LƯU Ý NGHIỆP VỤ (ADR-012): Không tự động điền `description` ("Topup via...") khi gửi request.
      // Trường `description` trong bảng topup_transactions được để trống (null) và chỉ dành riêng để lưu lý do từ chối (rejectReason) khi Admin Từ chối.
      await createTopupMutation.mutateAsync({
        paymentMethodId: selectedPaymentMethod?.id ?? 1,
        wireAmount: parseFloat(wireAmountUsd),
        wireDate: wireDate,
        wireImages: relativeUrls,
      });

      // Refetch all topup queries (wallet summary & transaction history table)
      await trpcUtils.customer.topup.invalidate();

      // Cleanup state
      uploadedFiles.forEach((item) => {
        URL.revokeObjectURL(item.url);
      });
      setUploadedFiles([]);
      setWireAmountUsd("");
      setWireAmountVnd("");

      // Trigger success toast (Top Right SHA CDN ToastProvider)
      toast(
        translate("customerWallet.addFundModal.createSuccess", currentLocale) ||
          "Tạo yêu cầu nạp tiền thành công!",
        "success",
      );

      onSubmit?.();
      onOpenChange(false);
    } catch (err: any) {
      const errText =
        err?.message ||
        translate("customerWallet.addFundModal.createError", currentLocale) ||
        "Tạo yêu cầu nạp tiền thất bại!";
      setErrorMessage(errText);

      // Trigger error toast (Top Right SHA CDN ToastProvider)
      toast(errText, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const defaultLogo = (
    <div className="w-6 h-6 rounded-full bg-[#0F798C]/20 text-[#0F798C] flex items-center justify-center font-bold text-xs">
      $
    </div>
  );

  const displayLogo =
    selectedPaymentMethod?.icon || selectedPaymentMethod?.image ? (
      <img
        src={selectedPaymentMethod.icon || selectedPaymentMethod.image || ""}
        alt={selectedPaymentMethod.name}
        className="w-6 h-6 object-contain rounded-[6px] border border-[#E9EAED]"
      />
    ) : (
      methodLogo || defaultLogo
    );

  const titleViaPrefix = (() => {
    const translated = translate("customerWallet.addFundModal.titleVia", currentLocale);
    return translated && translated !== "customerWallet.addFundModal.titleVia"
      ? translated
      : currentLocale === "vi"
        ? "Nạp tiền qua"
        : "Top-up via";
  })();

  const modalTitle = (
    <div className="flex items-center gap-3">
      {displayLogo}
      <span className="font-semibold text-lg text-slate-800 dark:text-slate-100">
        {titleViaPrefix} {selectedPaymentMethod?.name || methodName}
      </span>
    </div>
  );

  const modalFooter = (
    <>
      <Button
        type="button"
        variant="outline"
        onClick={handleBack}
        disabled={isSubmitting}
        className="px-6 py-2 h-10 rounded-lg font-medium border-slate-300 text-slate-700 hover:bg-slate-100 dark:border-zinc-700 dark:text-slate-300 cursor-pointer transition-colors"
      >
        {translate("customerWallet.addFundModal.back", currentLocale) || "Back"}
      </Button>
      <Button
        type="button"
        onClick={handleSubmit}
        disabled={isSubmitting}
        className="px-6 py-2 h-10 rounded-lg font-semibold bg-[#0F798C] hover:bg-[#0c6070] text-white shadow-sm cursor-pointer transition-all disabled:opacity-50 flex items-center gap-2"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin shrink-0" />
            <span>
              {translate("customerWallet.addFundModal.submitting", currentLocale) || "Submitting..."}
            </span>
          </>
        ) : (
          translate("customerWallet.addFundModal.submit", currentLocale) || "Submit"
        )}
      </Button>
    </>
  );

  return (
    <BaseModal open={open} onOpenChange={onOpenChange}>
      <BaseModalContent
        title={modalTitle}
        hideSearch={true}
        footer={modalFooter}
        className="max-w-[660px] rounded-2xl [&>div:first-child]:px-6 [&>div:first-child]:py-4"
      >
        <div className="flex flex-col gap-6 py-2 text-slate-800 dark:text-slate-200">
          {/* Hidden File Input */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            multiple
            accept="image/png, image/jpeg, image/jpg"
            className="hidden"
          />

          {/* Yellow Warning Alert Box — Only for Non-Bank methods */}
          {!isBank && (
            <div className="bg-amber-500/10 border border-amber-300/60 dark:border-amber-700/50 rounded-xl p-3.5 flex gap-3 items-start">
              <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div className="flex flex-col gap-0.5">
                <span className="text-xs font-bold text-amber-800 dark:text-amber-300">
                  {translate("customerWallet.addFundModal.pleaseBeAware", currentLocale) ||
                    "Please be aware"}
                </span>
                <p className="text-xs text-amber-700 dark:text-amber-400 leading-relaxed">
                  {translate("customerWallet.addFundModal.alertMessage", currentLocale) ||
                    "Wire transactions may take up to 2 days to be processed and credited to your account."}
                </p>
              </div>
            </div>
          )}

          {/* Step 1: Send Fund */}
          <div className="relative pl-8">
            {/* Step Number Circle */}
            <div className="absolute left-0 top-0 w-6 h-6 rounded-full bg-[#0F798C] text-white flex items-center justify-center text-xs font-bold shadow-xs">
              1
            </div>

            {/* Connecting Vertical Line to Step 2 */}
            <div className="absolute left-[11px] top-6 -bottom-7 w-0 border-l-2 border-dashed border-[#0F798C] z-0" />

            <div className="flex flex-col gap-1 pb-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {translate("customerWallet.addFundModal.step1Title", currentLocale) || "Send fund"}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {translate("customerWallet.addFundModal.step1Desc", currentLocale) ||
                  "Please use the wire info below to send the funding amount."}
              </p>

              {isBank ? (
                /* Bank Info + QR Code Card Box (When is_bank === true) */
                <div className="mt-3 border border-slate-200/90 dark:border-zinc-800 rounded-2xl p-4 bg-slate-50/30 dark:bg-zinc-900/40 flex flex-col sm:flex-row items-center sm:items-start justify-between gap-4">
                  {/* Left Side: Banking Details */}
                  <div className="flex flex-col gap-2.5 flex-1 min-w-0 w-full text-xs">
                    {/* Account Holder */}
                    <div className="grid grid-cols-12 items-center gap-2">
                      <span className="col-span-4 text-slate-500 dark:text-slate-400 font-medium">
                        {translate(
                          "customerWallet.addFundModal.accountHolderLabel",
                          currentLocale,
                        ) || "Account holder:"}
                      </span>
                      <span className="col-span-8 font-bold text-[#1B64F2] truncate select-all">
                        {accountHolder}
                      </span>
                    </div>

                    {/* Bank Name */}
                    <div className="grid grid-cols-12 items-center gap-2">
                      <span className="col-span-4 text-slate-500 dark:text-slate-400 font-medium">
                        {translate("customerWallet.addFundModal.bankNameLabel", currentLocale) ||
                          "Bank Name:"}
                      </span>
                      <span className="col-span-8 font-bold text-[#1B64F2] leading-tight select-all">
                        {bankName}
                      </span>
                    </div>

                    {/* Account Number */}
                    <div className="grid grid-cols-12 items-center gap-2">
                      <span className="col-span-4 text-slate-500 dark:text-slate-400 font-medium">
                        {translate(
                          "customerWallet.addFundModal.accountNumberLabel",
                          currentLocale,
                        ) || "Account Number:"}
                      </span>
                      <div className="col-span-8 border border-dashed border-slate-300 dark:border-zinc-700 rounded-lg px-3 py-1.5 flex items-center justify-between bg-white dark:bg-zinc-900">
                        <span className="font-bold text-[#1B64F2] select-all">{accountNumber}</span>
                        {accountNumber && accountNumber !== "-" && (
                          <button
                            type="button"
                            onClick={() => handleCopy(accountNumber, "accNum")}
                            className="text-slate-400 hover:text-[#0F798C] transition-colors cursor-pointer ml-1"
                            title="Copy account number"
                          >
                            {copiedKey === "accNum" ? (
                              <Check className="w-3.5 h-3.5 text-emerald-500" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Description */}
                    <div className="grid grid-cols-12 items-center gap-2">
                      <span className="col-span-4 text-slate-500 dark:text-slate-400 font-medium">
                        {translate("customerWallet.addFundModal.descriptionLabel", currentLocale) ||
                          "Description:"}
                      </span>
                      <div className="col-span-8 border border-dashed border-slate-300 dark:border-zinc-700 rounded-lg px-3 py-1.5 flex items-center justify-between bg-white dark:bg-zinc-900">
                        <span className="font-bold text-[#1B64F2] select-all">{description}</span>
                        {description && description !== "-" && (
                          <button
                            type="button"
                            onClick={() => handleCopy(description, "desc")}
                            className="text-slate-400 hover:text-[#0F798C] transition-colors cursor-pointer ml-1"
                            title="Copy description"
                          >
                            {copiedKey === "desc" ? (
                              <Check className="w-3.5 h-3.5 text-emerald-500" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right Side: QR Code Card Box */}
                  <div className="w-32 h-32 lg:w-36 lg:h-36 rounded-xl border border-sky-400 bg-white p-2 flex flex-col items-center justify-center shrink-0 shadow-xs overflow-hidden">
                    <img
                      src={qrSrc}
                      alt="Bank QR Code"
                      onError={() => setQrSrc(defaultQrUrl)}
                      className="w-full h-full object-contain rounded-lg"
                    />
                  </div>
                </div>
              ) : (
                /* Non-Bank Methods: Simple Account Card */
                <div className="mt-3 border border-slate-200 dark:border-zinc-800 rounded-xl p-3.5 bg-slate-50/50 dark:bg-zinc-900/50 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                      {translate("customerWallet.addFundModal.accountLabel", currentLocale) ||
                        "Account:"}
                    </span>
                    <span className="text-sm font-bold text-[#1B64F2] select-all">
                      {accountEmail || "-"}
                    </span>
                  </div>
                  {accountEmail && (
                    <button
                      type="button"
                      onClick={() => handleCopy(accountEmail, "accEmail")}
                      className="p-1.5 text-slate-400 hover:text-[#0F798C] rounded-md transition-colors cursor-pointer relative"
                      title="Copy email"
                    >
                      {copiedKey === "accEmail" ? (
                        <Check className="w-4 h-4 text-emerald-500" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Step 2: Submit Wire Transaction Detail */}
          <div className="relative pl-8">
            {/* Step Number Circle */}
            <div className="absolute left-0 top-0 w-6 h-6 rounded-full bg-[#0F798C] text-white flex items-center justify-center text-xs font-bold shadow-xs">
              2
            </div>

            <div className="flex flex-col gap-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {translate("customerWallet.addFundModal.step2Title", currentLocale) ||
                    "Submit Wire Transaction Detail"}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {translate("customerWallet.addFundModal.step2Desc", currentLocale) ||
                    "Fill out wire date and amount and upload an image of your wire transfer confirmation."}
                </p>
              </div>

              {/* Form Layout */}
              {isBank ? (
                /* Bank Form: Full Width Wire Date + Dynamic Exchange Rate Note + USD/VND Dual Inputs */
                <div className="flex flex-col gap-3">
                  {/* Full Width Row: Wire date */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      {translate("customerWallet.addFundModal.wireDateLabel", currentLocale) ||
                        "Wire date"}{" "}
                      <span className="text-rose-500">*</span>
                    </label>
                    <DatePicker
                      value={wireDate}
                      onChange={handleWireDateChange}
                      placeholder="Select date"
                      disabledDays={(date) => date > new Date()}
                      className="w-full h-11 rounded-lg border-slate-300 dark:border-zinc-700"
                    />
                    {fieldErrors.wireDate && (
                      <span className="text-xs text-rose-500 font-medium flex items-center gap-1 mt-0.5">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        {fieldErrors.wireDate}
                      </span>
                    )}

                    {/* Dynamic Exchange Rate Info Note */}
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
                      <Info className="w-4 h-4 text-[#1B64F2] shrink-0" />
                      <span>
                        {translate("customerWallet.addFundModal.exchangeRateText", currentLocale) ||
                          "Exchange rate:"}{" "}
                        <strong className="text-[#1B64F2] font-bold">
                          {exchangeRate.toLocaleString("vi-VN")} VND = 1 USD
                        </strong>{" "}
                        <span className="text-slate-400">
                          {translate(
                            "customerWallet.addFundModal.exchangeRateNote",
                            currentLocale,
                          ) || "(The exchange rate may change over time)"}
                        </span>
                      </span>
                    </div>
                  </div>

                  {/* 2-Column Row: Wire amount (USD) & Wire amount (VND) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        {translate(
                          "customerWallet.addFundModal.wireAmountUsdLabel",
                          currentLocale,
                        ) || "Wire amount (USD)"}{" "}
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
                            setWireAmountUsd(e.target.value);
                            setFieldErrors((prev) => ({ ...prev, wireAmount: undefined }));
                          }}
                          className="pl-7 h-11 rounded-lg border-slate-300 dark:border-zinc-700 font-medium"
                        />
                      </div>
                      {fieldErrors.wireAmount && (
                        <span className="text-xs text-rose-500 font-medium flex items-center gap-1 mt-0.5">
                          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                          {fieldErrors.wireAmount}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        {translate(
                          "customerWallet.addFundModal.wireAmountVndLabel",
                          currentLocale,
                        ) || "Wire amount (VND)"}{" "}
                        <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <Input
                          type="text"
                          value={wireAmountVnd}
                          onFocus={() => setActiveInput("vnd")}
                          onChange={handleVndChange}
                          placeholder="0"
                          className="pr-12 h-11 rounded-lg border-slate-300 dark:border-zinc-700 font-medium"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 font-medium text-xs">
                          VND
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                /* Non-Bank Form: 2-Column Wire Date & Wire Amount (USD) */
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      {translate("customerWallet.addFundModal.wireDateLabel", currentLocale) ||
                        "Wire date"}{" "}
                      <span className="text-rose-500">*</span>
                    </label>
                    <DatePicker
                      value={wireDate}
                      onChange={handleWireDateChange}
                      placeholder="Select date"
                      disabledDays={(date) => date > new Date()}
                      className="w-full h-11 rounded-lg border-slate-300 dark:border-zinc-700"
                    />
                    {fieldErrors.wireDate && (
                      <span className="text-xs text-rose-500 font-medium flex items-center gap-1 mt-0.5">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        {fieldErrors.wireDate}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      {translate("customerWallet.addFundModal.wireAmountLabel", currentLocale) ||
                        "Wire amount"}{" "}
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
                          setWireAmountUsd(e.target.value);
                          setFieldErrors((prev) => ({ ...prev, wireAmount: undefined }));
                        }}
                        className="pl-7 h-11 rounded-lg border-slate-300 dark:border-zinc-700 font-medium"
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
              )}

              {/* Wire Transfer Confirmation Image Upload Section */}
              <div className="flex flex-col gap-2 mt-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    {translate("customerWallet.addFundModal.uploadLabel", currentLocale) ||
                      "Wire transfer confirmation image"}{" "}
                    <span className="text-rose-500">*</span>{" "}
                    <span className="text-slate-400 font-normal">
                      {translate("customerWallet.addFundModal.uploadNote", currentLocale) ||
                        "(Maximum 10 images, each image not exceeding 5MB)"}
                    </span>
                  </label>
                </div>

                {uploadedFiles.length === 0 ? (
                  /* State 1: Big Drag & Drop Zone Box when 0 files uploaded */
                  <div
                    onDragOver={(e) => e.preventDefault()}
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
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={handleDrop}
                    className="relative rounded-2xl border-2 border-dashed border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/30 p-3 min-h-[120px] flex items-center"
                  >
                    {/* Left Scroll Arrow */}
                    {canScrollLeft && (
                      <button
                        type="button"
                        onClick={handleScrollLeft}
                        className="absolute left-2 z-10 w-8 h-8 rounded-full bg-white/90 dark:bg-zinc-800/90 shadow-md text-slate-700 dark:text-slate-200 flex items-center justify-center hover:bg-white dark:hover:bg-zinc-800 cursor-pointer border border-slate-200 dark:border-zinc-700 transition-all"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                    )}

                    {/* Horizontal Scroll Area */}
                    <div
                      ref={scrollContainerRef}
                      onScroll={checkScrollPosition}
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
                            alt="Wire confirmation"
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
                    {canScrollRight && (
                      <button
                        type="button"
                        onClick={handleScrollRight}
                        className="absolute right-2 z-10 w-8 h-8 rounded-full bg-white/90 dark:bg-zinc-800/90 shadow-md text-slate-700 dark:text-slate-200 flex items-center justify-center hover:bg-white dark:hover:bg-zinc-800 cursor-pointer border border-slate-200 dark:border-zinc-700 transition-all"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                )}

                {fieldErrors.wireImages && (
                  <p className="text-xs text-rose-500 font-medium flex items-center gap-1 mt-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    {fieldErrors.wireImages}
                  </p>
                )}

                {/* API Error Message display */}
                {errorMessage && (
                  <p className="text-xs text-rose-500 font-medium flex items-center gap-1 mt-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    {errorMessage}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </BaseModalContent>
    </BaseModal>
  );
}
