"use client";

/**
 * @file ProfileCompletionModal.tsx
 * @description Modal Hoàn Thiện Hồ Sơ Cá Nhân (Complete Personal Profile Modal)
 * Khôi phục 100% chuẩn CSS từ bản git commit của bạn (text-sm text-[#262626], py-5 2xl:py-6, disabled:bg-[#0F798C] disabled:text-white, comment Skip button).
 */

import { translate } from "@flash-ship/ecom-i18n";
import { useI18n } from "@ecom/shared/@i18n";
import { Button } from "@flash-ship/ecom-ui/components/button";
import { DatePicker } from "@flash-ship/ecom-ui/components/date-picker";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@flash-ship/ecom-ui/components/dialog";
import { Input } from "@flash-ship/ecom-ui/components/input";
import { Label } from "@flash-ship/ecom-ui/components/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@flash-ship/ecom-ui/components/select";
import { SearchableSelect } from "@customer/components/ui/searchable-select";
import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { trpc } from "../../lib/trpc";
import { zodResolver } from "../../lib/zodResolver";
import { showToast } from "../toast-provider";

export interface ProfileCompletionModalProps {
  isOpen: boolean;
  userProfile?: {
    id?: string;
    username?: string;
    name?: string | null;
    email?: string;
    phone?: string | null;
    dob?: string | Date | null;
    gender?: string | null;
    usernameChangeCount?: number;
  } | null;
  onClose: () => void;
  onSuccess: () => void;
}

type FormValues = {
  senderName: string;
  senderPhone: string;
  senderAddress: string;
  senderCity: string;
  senderWard: string;
  senderZipCode: string;
  username: string;
  dob: string;
  gender: "male" | "female" | "other";
  email?: string;
};

export function ProfileCompletionModal({
  isOpen,
  userProfile,
  onClose,
  onSuccess,
}: ProfileCompletionModalProps) {
  const { languageId: currentLocale } = useI18n();

  const [formError, setFormError] = useState<string | null>(null);
  const [selectedCityLabel, setSelectedCityLabel] = useState<string>("");
  const [selectedWardLabel, setSelectedWardLabel] = useState<string>("");

  // Zod Schema Kiểm tra hợp lệ dữ liệu (Đa ngôn ngữ i18n)
  const schema = useMemo(() => {
    return z.object({
      senderName: z.string().min(1, {
        message: translate("customerAuth.profileModal.validation.senderNameRequired", currentLocale),
      }),
      senderPhone: z.string().min(8, {
        message: translate("customerAuth.profileModal.validation.senderPhoneRequired", currentLocale),
      }),
      senderAddress: z.string().min(1, {
        message: translate("customerAuth.profileModal.validation.addressRequired", currentLocale),
      }),
      senderCity: z.string().min(1, {
        message: translate("customerAuth.profileModal.validation.cityRequired", currentLocale),
      }),
      senderWard: z.string().min(1, {
        message: translate("customerAuth.profileModal.validation.wardRequired", currentLocale),
      }),
      senderZipCode: z.string().min(1, {
        message: translate("customerAuth.profileModal.validation.zipCodeRequired", currentLocale),
      }),
      username: z
        .string()
        .min(3, {
          message: translate("customerAuth.profileModal.validation.usernameMin", currentLocale),
        })
        .max(30, {
          message: translate("customerAuth.profileModal.validation.usernameMax", currentLocale),
        })
        .regex(/^[a-zA-Z0-9_.]{3,30}$/, {
          message: translate("customerAuth.profileModal.validation.usernameInvalid", currentLocale),
        }),
      dob: z
        .string()
        .min(1, {
          message: translate("customerAuth.profileModal.validation.dobRequired", currentLocale),
        })
        .refine(
          (val) => {
            if (!val) return false;
            const selectedDate = new Date(val);
            const today = new Date();
            today.setHours(23, 59, 59, 999);
            return selectedDate <= today;
          },
          {
            message: translate("customerAuth.profileModal.validation.dobFutureInvalid", currentLocale),
          }
        ),
      gender: z.enum(["male", "female", "other"]),
      email: z.string().optional(),
    });
  }, [currentLocale]);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    reset,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    mode: "onChange",
    defaultValues: {
      senderName: "",
      senderPhone: "",
      senderAddress: "",
      senderCity: "",
      senderWard: "",
      senderZipCode: "",
      username: "",
      dob: "",
      gender: "" as any,
      email: "",
    },
  });

  const watchedFormCity = watch("senderCity");
  const watchedFormWard = watch("senderWard");
  const watchedValues = watch();

  // Province / Ward logic (Giống hệt order/single SenderSection)
  const [provinceSearch, setProvinceSearch] = useState("");
  const { data: provincesData, isFetching: provincesFetching } =
    trpc.customer.divisions.listProvinces.useQuery(
      { search: provinceSearch || undefined },
      { enabled: isOpen, placeholderData: (prev) => prev }
    );

  const provinceOptions = useMemo(
    () => (provincesData ?? []).map((p: any) => ({ value: String(p.code), label: p.name })),
    [provincesData]
  );

  const selectedProvinceCode = useMemo(() => {
    const n = Number(watchedFormCity);
    return n > 0 ? n : undefined;
  }, [watchedFormCity]);

  const [wardSearch, setWardSearch] = useState("");
  const { data: wardsData, isFetching: wardsFetching } = trpc.customer.divisions.listWards.useQuery(
    { provinceCode: selectedProvinceCode ?? 0, search: wardSearch || undefined },
    { enabled: isOpen && !!selectedProvinceCode, placeholderData: (prev) => prev }
  );

  const wardOptions = useMemo(
    () => (wardsData ?? []).map((w: any) => ({ value: String(w.code), label: w.name })),
    [wardsData]
  );

  // Reset ward when city changes inside form
  const prevFormCityRef = useRef(watchedFormCity);
  useEffect(() => {
    if (prevFormCityRef.current !== watchedFormCity) {
      setValue("senderWard", "");
      setSelectedWardLabel("");
      prevFormCityRef.current = watchedFormCity;
    }
  }, [watchedFormCity, setValue]);

  // Track City label
  useEffect(() => {
    if (watchedFormCity && provincesData) {
      const p = provincesData.find((c: any) => String(c.code) === watchedFormCity);
      if (p) {
        setSelectedCityLabel(p.name);
      }
    }
  }, [watchedFormCity, provincesData]);

  // Track Ward label
  useEffect(() => {
    if (watchedFormWard && wardsData) {
      const w = wardsData.find((item: any) => String(item.code) === watchedFormWard);
      if (w) {
        setSelectedWardLabel(w.name);
      }
    }
  }, [watchedFormWard, wardsData]);

  // Kiểm tra thời gian thực (real-time) xem form đã nhập đủ và đúng tất cả các trường required hay chưa
  const isFormFilledAndValid = useMemo(() => {
    const isFieldsPresent = Boolean(
      watchedValues.senderName?.trim() &&
        watchedValues.senderPhone?.trim() &&
        watchedValues.senderAddress?.trim() &&
        watchedValues.senderCity?.trim() &&
        watchedValues.senderWard?.trim() &&
        watchedValues.senderZipCode?.trim() &&
        watchedValues.username?.trim() &&
        watchedValues.dob?.trim() &&
        (watchedValues.gender === "male" || watchedValues.gender === "female" || watchedValues.gender === "other")
    );
    if (!isFieldsPresent) return false;
    return schema.safeParse(watchedValues).success;
  }, [watchedValues, schema]);

  // Khởi tạo các giá trị ban đầu khi mở Modal
  useEffect(() => {
    if (isOpen && userProfile) {
      reset({
        senderName: "",
        senderPhone: "",
        senderAddress: "",
        senderCity: "",
        senderWard: "",
        senderZipCode: "",
        username: userProfile.username || "",
        dob: userProfile.dob ? new Date(userProfile.dob).toISOString().split("T")[0] : "",
        gender: (userProfile.gender as any) || ("" as any),
        email: userProfile.email || "",
      });
      setSelectedCityLabel("");
      setSelectedWardLabel("");
      setProvinceSearch("");
      setWardSearch("");
      setFormError(null);
    }
  }, [isOpen, userProfile, reset]);

  // Mutations
  const updateProfileMutation = trpc.customer.auth.updateProfile.useMutation();
  const createSenderMutation = trpc.customer.senders.create.useMutation();

  const isSubmitting = updateProfileMutation.isPending || createSenderMutation.isPending;

  // Xử lý submit form
  const handleFormSubmit = async (data: FormValues) => {
    setFormError(null);

    const cityName = selectedCityLabel || data.senderCity;
    const wardName = selectedWardLabel || data.senderWard;

    try {
      // Thực thi đồng thời (Parallel execution) 2 API: Cập nhật Profile & Lưu Địa chỉ người gửi
      await Promise.all([
        updateProfileMutation.mutateAsync({
          username: data.username.trim().toLowerCase(),
          name: data.senderName.trim(),
          phone: data.senderPhone.trim(),
          dob: data.dob ? data.dob : undefined,
          gender: data.gender,
        }),
        createSenderMutation.mutateAsync({
          name: data.senderName.trim(),
          phone: data.senderPhone.trim(),
          address: data.senderAddress.trim(),
          city: cityName,
          ward: wardName,
          zipCode: data.senderZipCode.trim(),
          country: "VN",
          isDefault: true,
        }),
      ]);

      showToast(translate("customerAuth.profileModal.savedSuccessToast", currentLocale), "success");
      onSuccess();
    } catch (err: any) {
      console.error("Profile completion error:", err);
      setFormError(err?.message || "Failed to save profile. Please check your inputs and try again.");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className="[&>button]:hidden w-[95vw] sm:w-[90vw] !gap-6 md:max-w-2xl rounded-[8px] p-0 bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 shadow-2xl overflow-hidden max-h-[92vh] sm:max-h-[85vh] flex flex-col animate-in fade-in-0 zoom-in-95 duration-200"
        onPointerDownOutside={(e) => {
          const target = e.target as HTMLElement | null;
          if (
            target?.closest?.(
              "[data-radix-popper-content-wrapper], [role='listbox'], [role='option'], [data-radix-select-viewport]"
            )
          ) {
            return;
          }
          e.preventDefault();
        }}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        {/* ========================================================================= */}
        {/* HEADER CỐ ĐỊNH (FIXED HEADER) */}
        {/* ========================================================================= */}
        <DialogHeader className="text-left space-y-1 px-5 pt-5 2xl:px-6 2xl:pt-6 shrink-0 bg-white dark:bg-zinc-950 z-10">
          <DialogTitle className="text-lg sm:text-xl md:text-2xl font-semibold text-[#232323] tracking-tight">
            {translate("customerAuth.profileModal.title", currentLocale)}
          </DialogTitle>
          <DialogDescription className="text-sm 2xl:text-base text-[#262626]">
            {translate("customerAuth.profileModal.desc", currentLocale)}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="flex flex-col flex-1 overflow-hidden min-h-0">
          {/* ========================================================================= */}
          {/* NỘI DUNG CUỘN DỌC (SCROLLABLE BODY CONTENT) */}
          {/* ========================================================================= */}
          <div className="flex-1 overflow-y-auto px-5 2xl:px-6 space-y-5 sm:space-y-6">
            {formError && (
              <div className="rounded-xl border border-rose-200 dark:border-rose-950/60 bg-rose-50 dark:bg-rose-950/30 px-4 py-3 text-xs font-semibold text-rose-600 dark:text-rose-400">
                {formError}
              </div>
            )}

            {/* NHÓM 1: SENDER ADDRESS (ĐỊA CHỈ NGƯỜI GỬI) */}
            <div className="space-y-3 sm:space-y-4">
              <h3 className="text-sm text-[#262626]">
                {translate("customerAuth.profileModal.senderAddressHeader", currentLocale)}
              </h3>

              {/* Hàng 1: Country, Sender name, Phone number */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-3.5">
                {/* Country */}
                <div className="space-y-1.5">
                  <Label className="text-sm 2xl:text-base font-medium text-[#0A0A0A]">
                    {translate("customerAuth.profileModal.countryLabel", currentLocale)} <span className="text-rose-500">*</span>
                  </Label>
                  <div className="flex items-center gap-2 px-3.5 h-10 2xl:h-12 bg-[#F5F5F5] dark:bg-zinc-900 border border-[#E5E5E5] dark:border-zinc-800 rounded-md text-[#0A0A0A] text-sm 2xl:text-base select-none shadow-[0_1px_2px_0_rgba(0,0,0,0.05)]">
                    <Image
                      src="/assets/icons/flags/flag-vn.svg"
                      alt="Vietnam Flag"
                      width={20}
                      height={14}
                      className="object-cover shrink-0"
                    />
                    <span className="font-medium truncate">{translate("customerAuth.profileModal.countryVietnam", currentLocale)}</span>
                  </div>
                </div>

                {/* Sender name */}
                <div className="space-y-1.5">
                  <Label htmlFor="modal-sender-name" className="text-sm 2xl:text-base font-medium text-[#0A0A0A]">
                    {translate("customerAuth.profileModal.senderNameLabel", currentLocale)} <span className="text-rose-500">*</span>
                  </Label>
                  <Input
                    id="modal-sender-name"
                    type="text"
                    placeholder={translate("customerAuth.profileModal.enterPlaceholder", currentLocale)}
                    {...register("senderName")}
                    className="h-10 2xl:h-12 rounded-md bg-white dark:bg-zinc-900/80 border-slate-200 dark:border-zinc-800 focus:border-[#008094] focus:ring-[#008094]/20 text-sm 2xl:text-base"
                  />
                  {errors.senderName && (
                    <p className="text-[11px] font-medium text-rose-500 mt-1">{errors.senderName.message}</p>
                  )}
                </div>

                {/* Phone number */}
                <div className="space-y-1.5 sm:col-span-2 md:col-span-1">
                  <Label htmlFor="modal-sender-phone" className="text-sm 2xl:text-base font-medium text-[#0A0A0A]">
                    {translate("customerAuth.profileModal.senderPhoneLabel", currentLocale)} <span className="text-rose-500">*</span>
                  </Label>
                  <Input
                    id="modal-sender-phone"
                    type="tel"
                    placeholder={translate("customerAuth.profileModal.enterPlaceholder", currentLocale)}
                    {...register("senderPhone")}
                    className="h-10 2xl:h-12 rounded-md bg-white dark:bg-zinc-900/80 border-slate-200 dark:border-zinc-800 focus:border-[#008094] focus:ring-[#008094]/20 text-sm 2xl:text-base"
                  />
                  {errors.senderPhone && (
                    <p className="text-[11px] font-medium text-rose-500 mt-1">{errors.senderPhone.message}</p>
                  )}
                </div>
              </div>

              {/* Hàng 2: Address */}
              <div className="space-y-1.5">
                <Label htmlFor="modal-sender-address" className="text-sm 2xl:text-base font-medium text-[#0A0A0A]">
                  {translate("customerAuth.profileModal.addressLabel", currentLocale)} <span className="text-rose-500">*</span>
                </Label>
                <Input
                  id="modal-sender-address"
                  type="text"
                  placeholder={translate("customerAuth.profileModal.addressPlaceholder", currentLocale)}
                  {...register("senderAddress")}
                  className="h-10 2xl:h-12 rounded-md bg-white dark:bg-zinc-900/80 border-slate-200 dark:border-zinc-800 focus:border-[#008094] focus:ring-[#008094]/20 text-sm 2xl:text-base w-full"
                />
                {errors.senderAddress && (
                  <p className="text-[11px] font-medium text-rose-500 mt-1">{errors.senderAddress.message}</p>
                )}
              </div>

              {/* Hàng 3: City, Ward, Zip code (Sử dụng SearchableSelect đồng bộ với order/single) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-3.5">
                {/* City */}
                <div className="space-y-1.5">
                  <Label className="text-sm 2xl:text-base font-medium text-[#0A0A0A]">
                    {translate("customerAuth.profileModal.cityLabel", currentLocale)} <span className="text-rose-500">*</span>
                  </Label>
                  <Controller
                    name="senderCity"
                    control={control}
                    render={({ field }) => (
                      <SearchableSelect
                        value={field.value}
                        onValueChange={field.onChange}
                        onOptionSelect={(opt) => setSelectedCityLabel(opt.label)}
                        options={provinceOptions}
                        placeholder={translate("customerAuth.profileModal.selectCityPlaceholder", currentLocale)}
                        searchPlaceholder={translate("customerAuth.profileModal.searchCityPlaceholder", currentLocale)}
                        allowClear
                        maxHeight="250px"
                        serverSearch
                        onSearchChange={setProvinceSearch}
                        loading={provincesFetching}
                        className="bg-white dark:bg-zinc-900/80 rounded-md"
                      />
                    )}
                  />
                  {errors.senderCity && (
                    <p className="text-[11px] font-medium text-rose-500 mt-1">{errors.senderCity.message}</p>
                  )}
                </div>

                {/* Ward */}
                <div className="space-y-1.5">
                  <Label className="text-sm 2xl:text-base font-medium text-[#0A0A0A]">
                    {translate("customerAuth.profileModal.wardLabel", currentLocale)} <span className="text-rose-500">*</span>
                  </Label>
                  <Controller
                    name="senderWard"
                    control={control}
                    render={({ field }) => (
                      <SearchableSelect
                        value={field.value}
                        onValueChange={field.onChange}
                        onOptionSelect={(opt) => setSelectedWardLabel(opt.label)}
                        options={wardOptions}
                        placeholder={translate("customerAuth.profileModal.selectWardPlaceholder", currentLocale)}
                        searchPlaceholder={translate("customerAuth.profileModal.searchWardPlaceholder", currentLocale)}
                        disabled={!selectedProvinceCode}
                        allowClear
                        maxHeight="250px"
                        serverSearch
                        onSearchChange={setWardSearch}
                        loading={wardsFetching}
                        className="bg-white dark:bg-zinc-900/80 rounded-md"
                      />
                    )}
                  />
                  {errors.senderWard && (
                    <p className="text-[11px] font-medium text-rose-500 mt-1">{errors.senderWard.message}</p>
                  )}
                </div>

                {/* Zip code */}
                <div className="space-y-1.5 sm:col-span-2 md:col-span-1">
                  <Label htmlFor="modal-sender-zip" className="text-sm 2xl:text-base font-medium text-[#0A0A0A]">
                    {translate("customerAuth.profileModal.zipCodeLabel", currentLocale)} <span className="text-rose-500">*</span>
                  </Label>
                  <Input
                    id="modal-sender-zip"
                    type="text"
                    placeholder={translate("customerAuth.profileModal.enterPlaceholder", currentLocale)}
                    {...register("senderZipCode")}
                    className="h-10 2xl:h-12 rounded-md bg-white dark:bg-zinc-900/80 border-slate-200 dark:border-zinc-800 focus:border-[#008094] focus:ring-[#008094]/20 text-sm 2xl:text-base"
                  />
                  {errors.senderZipCode && (
                    <p className="text-[11px] font-medium text-rose-500 mt-1">{errors.senderZipCode.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* NHÓM 2: CONTACT INFORMATION (THÔNG TIN LIÊN HỆ) */}
            <div className="space-y-3 sm:space-y-4 py-5 2xl:py-6 border-t border-slate-100 dark:border-zinc-800/80">
              <h3 className="text-sm text-[#262626]">
                {translate("customerAuth.profileModal.contactInfoHeader", currentLocale)}
              </h3>

              {/* Hàng 4: Username, Date of Birth, Gender */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-3.5">
                {/* Username */}
                <div className="space-y-1.5">
                  <Label htmlFor="modal-username" className="text-sm 2xl:text-base font-medium text-[#0A0A0A]">
                    {translate("customerAuth.profileModal.usernameLabel", currentLocale)} <span className="text-rose-500">*</span>
                  </Label>
                  <Input
                    id="modal-username"
                    type="text"
                    placeholder={translate("customerAuth.profileModal.enterPlaceholder", currentLocale)}
                    {...register("username")}
                    className="h-10 2xl:h-12 rounded-md bg-white dark:bg-zinc-900/80 border-slate-200 dark:border-zinc-800 focus:border-[#008094] focus:ring-[#008094]/20 text-sm 2xl:text-base"
                  />
                  {errors.username && (
                    <p className="text-[11px] font-medium text-rose-500 mt-1">{errors.username.message}</p>
                  )}
                </div>

                {/* Date of Birth */}
                <div className="space-y-1.5">
                  <Label className="text-sm 2xl:text-base font-medium text-[#0A0A0A]">
                    {translate("customerAuth.profileModal.dobLabel", currentLocale)} <span className="text-rose-500">*</span>
                  </Label>
                  <Controller
                    name="dob"
                    control={control}
                    render={({ field }) => (
                      <DatePicker
                        value={field.value || ""}
                        onChange={field.onChange}
                        placeholder="dd/mm/yyyy"
                        disabledDays={(date) => date > new Date()}
                        className="h-10 2xl:h-12 rounded-md bg-white dark:bg-zinc-900/80 border-slate-200 dark:border-zinc-800 focus:border-[#008094] focus:ring-[#008094]/20 text-sm 2xl:text-base w-full"
                      />
                    )}
                  />
                  {errors.dob && (
                    <p className="text-[11px] font-medium text-rose-500 mt-1">{errors.dob.message}</p>
                  )}
                </div>

                {/* Gender */}
                <div className="space-y-1.5 sm:col-span-2 md:col-span-1">
                  <Label className="text-sm 2xl:text-base font-medium text-[#0A0A0A]">
                    {translate("customerAuth.profileModal.genderLabel", currentLocale)} <span className="text-rose-500">*</span>
                  </Label>
                  <Controller
                    name="gender"
                    control={control}
                    render={({ field }) => (
                      <Select value={field.value || undefined} onValueChange={(val) => field.onChange(val)}>
                        <SelectTrigger className="h-10 2xl:h-12 rounded-md bg-white dark:bg-zinc-900/80 border-slate-200 dark:border-zinc-800 text-sm 2xl:text-base">
                          <SelectValue placeholder={translate("customerAuth.profileModal.selectPlaceholder", currentLocale)} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="male">{translate("customerAuth.profileModal.genderMale", currentLocale)}</SelectItem>
                          <SelectItem value="female">{translate("customerAuth.profileModal.genderFemale", currentLocale)}</SelectItem>
                          <SelectItem value="other">{translate("customerAuth.profileModal.genderOther", currentLocale)}</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.gender && (
                    <p className="text-[11px] font-medium text-rose-500 mt-1">{errors.gender.message}</p>
                  )}
                </div>
              </div>

              {/* Hàng 5: Email */}
              <div className="space-y-1.5">
                <Label htmlFor="modal-email" className="text-sm 2xl:text-base font-medium text-[#0A0A0A]">
                  {translate("customerAuth.profileModal.emailLabel", currentLocale)}
                </Label>
                <Input
                  id="modal-email"
                  type="email"
                  disabled
                  placeholder={translate("customerAuth.profileModal.enterPlaceholder", currentLocale)}
                  {...register("email")}
                  className="h-10 2xl:h-12 rounded-md bg-slate-100 dark:bg-zinc-900/90 border-slate-200 dark:border-zinc-800 text-slate-500 dark:text-slate-400 text-sm 2xl:text-base w-full cursor-not-allowed select-none"
                />
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* FOOTER CỐ ĐỊNH (FIXED FOOTER) */}
          {/* ========================================================================= */}
          <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2.5 sm:gap-3 p-5 2xl:p-6 border-t border-slate-100 dark:border-zinc-800/80 shrink-0 bg-white dark:bg-zinc-950 z-10">
            {/*<Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="px-6 h-10 2xl:h-12 text-sm 2xl:text-base font-semibold border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-zinc-900 rounded-md cursor-pointer"
            >
              {translate("customerAuth.profileModal.skipButton", currentLocale)}
            </Button>*/}

            <Button
              type="submit"
              disabled={!isFormFilledAndValid || isSubmitting}
              className="px-7 h-10 2xl:h-12 text-sm 2xl:text-base font-bold bg-[#0F798C] disabled:bg-[#0F798C] disabled:text-white disabled:shadow-none disabled:cursor-not-allowed text-white rounded-md shadow-md transition-all active:scale-[0.99] cursor-pointer"
            >
              {isSubmitting && (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent mr-2" />
              )}
              {translate("customerAuth.profileModal.continueButton", currentLocale)}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
