"use client";

import { translate } from "@flash-ship/ecom-i18n";
import { useI18n } from "@ecom/shared/@i18n";
import { Button } from "@flash-ship/ecom-ui/components/button";
import { DatePicker } from "@customer/components/ui/date-picker";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@flash-ship/ecom-ui/components/dialog";
import { ImportFileIcon, PlusCircleIcon, TopupIcon } from "@flash-ship/ecom-ui/components/icons";
import { Input } from "@flash-ship/ecom-ui/components/input";
import { Label } from "@flash-ship/ecom-ui/components/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@flash-ship/ecom-ui/components/select";
import { zodResolver } from "@hookform/resolvers/zod";
import clsx from "clsx";
import { FileText, LayoutDashboard, User } from "lucide-react";
import NextLink from "next/link";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { trpc } from "../../lib/trpc";

import { noSpecialCharsNameRegex, usernameRegex, vnPhoneRegex } from "@customer/constants";

const getProfileModalSchema = (locale: string) =>
  z.object({
    username: z
      .string()
      .optional()
      .refine(
        (val) => !val || val.length <= 50,
        translate("customerAuth.profileModal.usernameMax", locale),
      )
      .refine(
        (val) => !val || usernameRegex.test(val),
        translate("customerAuth.profileModal.usernameInvalid", locale),
      ),
    name: z
      .string()
      .min(1, translate("customerAuth.profileModal.nameRequired", locale))
      .max(50, translate("customerAuth.profileModal.nameMax", locale))
      .refine(
        (val) => !val || noSpecialCharsNameRegex.test(val.trim()),
        translate("customerAuth.profileModal.nameInvalid", locale),
      ),
    phone: z
      .string()
      .min(1, translate("customerAuth.profileModal.phoneRequired", locale))
      .refine(
        (val) => {
          if (!val) return false;
          const clean = val.replace(/[\s-]/g, "");
          return vnPhoneRegex.test(clean);
        },
        translate("customerAuth.profileModal.phoneInvalid", locale),
      ),
    dob: z.string().optional().nullable(),
    gender: z.enum(["male", "female"]).optional().nullable(),
  });

type ProfileModalFormValues = z.infer<ReturnType<typeof getProfileModalSchema>>;

export default function CustomerDashboardPage() {
  const { status } = useSession();
  const { languageId: currentLocale } = useI18n();

  const getLocalizedHref = (href: string) => {
    return href;
  };

  const {
    data: profile,
    isLoading: isLoadingProfile,
    refetch,
  } = trpc.customer.auth.me.useQuery(undefined, {
    enabled: status === "authenticated",
  });

  const isLoading = status === "loading" || isLoadingProfile;

  // Enforce profile modal states
  const [showModal, setShowModal] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<ProfileModalFormValues>({
    resolver: zodResolver(getProfileModalSchema(currentLocale ?? "vi")),
    defaultValues: {
      username: "",
      name: "",
      phone: "",
      dob: "",
      gender: null,
    },
  });

  useEffect(() => {
    if (profile) {
      const hasMissingInfo = !profile.name || !profile.phone;
      setShowModal(hasMissingInfo);

      // Pre-fill form values
      reset({
        username: profile.username ?? "",
        name: profile.name ?? "",
        phone: profile.phone ?? "",
        dob: profile.dob ? (new Date(profile.dob).toISOString().split("T")[0] ?? "") : "",
        gender: (profile.gender as "male" | "female") || null,
      });
    }
  }, [profile, reset]);

  const updateProfileMutation = trpc.customer.auth.updateProfile.useMutation({
    onSuccess: () => {
      setFormError(null);
      refetch();
    },
    onError: (err) => {
      setFormError(err.message);
    },
  });

  const handleModalSubmit = (data: ProfileModalFormValues) => {
    const usernameToSend =
      data.username !== profile?.username && data.username?.trim() !== ""
        ? data.username
        : undefined;

    updateProfileMutation.mutate({
      username: usernameToSend,
      name: data.name.trim(),
      phone: data.phone.trim(),
      dob: data.dob || null,
      gender: data.gender || null,
    });
  };

  if (status === "unauthenticated") {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <div className="mx-auto max-w-md rounded-lg border border-blue-200 bg-blue-50 px-6 py-4 text-sm text-blue-800">
          {translate("customerDashboard.pleaseLogin", currentLocale)}
          <div className="mt-2">
            <NextLink href={getLocalizedHref("/auth/login")} className="font-semibold underline">
              {translate("customerDashboard.login", currentLocale)}
            </NextLink>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16">
        <div className="mb-2 h-12 w-[280px] animate-pulse rounded bg-muted" />
        <div className="mb-8 h-5 w-[200px] animate-pulse rounded bg-muted" />
        <div className="grid gap-4 sm:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-[100px] animate-pulse rounded-xl bg-muted" />
          ))}
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <LayoutDashboard className="mx-auto mb-4 h-16 w-16 text-muted-foreground" />
        <h2 className="mb-2 text-xl font-bold">
          {translate("customerDashboard.notLoggedIn", currentLocale)}
        </h2>
        <p className="mb-6 text-sm text-muted-foreground">
          {translate("customerDashboard.pleaseLogin", currentLocale)}
        </p>
        <NextLink
          href={getLocalizedHref("/auth/login")}
          className="inline-block rounded-lg bg-primary px-6 py-2.5 font-semibold text-primary-foreground"
        >
          {translate("customerDashboard.login", currentLocale)}
        </NextLink>
      </div>
    );
  }

  const canChangeUsername = (profile.usernameChangeCount ?? 0) < 1;

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Welcome */}
      <div className={"title-page-content"}>
        {translate("customerDashboard.customer", currentLocale)}
      </div>

      <div className={"w-full grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 xl:gap-6"}>
        <div
          className={clsx(
            "border border-[#0F798C] text-[#0F798C] rounded-lg cursor-pointer",
            "flex flex-col items-center justify-center gap-2 xl:gap-4 px-8 py-4",
            "transition-all duration-300 ease-in-out hover:bg-[#0F798C] hover:text-white",
            "hover:-translate-y-1 hover:shadow-[0_8px_24px_rgba(15,121,140,0.25)] 2xl:h-[160px]",
          )}
        >
          <PlusCircleIcon />
          <span className={"font-medium text-2xl xl:text-3xl 2xl:text-[32px]"}>
            {translate("customerDashboard.createSingleOrder", currentLocale)}
          </span>
        </div>
        <div
          className={clsx(
            "border border-[#0042D0] text-[#0042D0] rounded-lg cursor-pointer",
            "flex flex-col items-center justify-center gap-2 xl:gap-4 px-8 py-4",
            "transition-all duration-300 ease-in-out hover:bg-[#0042D0] hover:text-white",
            "hover:-translate-y-1 hover:shadow-[0_8px_24px_rgba(0,66,208,0.25)] 2xl:h-[160px]",
          )}
        >
          <ImportFileIcon />
          <span className={"font-medium text-2xl xl:text-3xl 2xl:text-[32px]"}>
            {translate("customerDashboard.importOrderFile", currentLocale)}
          </span>
        </div>
        <div
          className={clsx(
            "border border-[#144D22] text-[#144D22] rounded-lg cursor-pointer",
            "flex flex-col items-center justify-center gap-2 xl:gap-4 px-8 py-4",
            "transition-all duration-300 ease-in-out hover:bg-[#144D22] hover:text-white",
            "hover:-translate-y-1 hover:shadow-[0_8px_24px_rgba(20,77,34,0.25)] 2xl:h-[160px]",
          )}
        >
          <TopupIcon />
          <span className={"font-medium text-2xl xl:text-3xl 2xl:text-[32px]"}>
            {translate("customerDashboard.topup", currentLocale)}
          </span>
        </div>
      </div>

      {/* Profile completion modal dialog */}
      <Dialog open={showModal}>
        <DialogContent
          className="[&>button]:hidden max-w-md w-[95%] rounded-3xl p-6 md:p-8"
          onPointerDownOutside={(e) => {
            const target = e.target as HTMLElement | null;
            if (
              target?.closest?.(
                "[data-radix-popper-content-wrapper], [role='listbox'], [role='option'], [data-radix-select-viewport]",
              )
            ) {
              return;
            }
            e.preventDefault();
          }}
          onEscapeKeyDown={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle className="text-lg md:text-xl font-bold text-foreground leading-none">
              {translate("customerAuth.profileModal.title", currentLocale)}
            </DialogTitle>
            <DialogDescription className="text-xs md:text-sm font-medium text-muted-foreground mt-2">
              {translate("customerAuth.profileModal.desc", currentLocale)}
            </DialogDescription>
          </DialogHeader>

          {formError && (
            <div className="rounded-xl border border-rose-100 dark:border-rose-950/50 bg-rose-50 dark:bg-rose-950/20 px-4 py-3 text-xs font-semibold text-rose-600 dark:text-rose-400">
              {formError}
            </div>
          )}

          <form onSubmit={handleSubmit(handleModalSubmit)} className="flex flex-col gap-4 mt-2">
            {/* Username */}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="modal-username" className="text-xs font-bold text-muted-foreground">
                {translate("customerAuth.profileModal.usernameLabel", currentLocale)}
              </Label>
              <Input
                id="modal-username"
                type="text"
                disabled={!canChangeUsername}
                {...register("username")}
                placeholder={translate(
                  "customerAuth.profileModal.usernamePlaceholder",
                  currentLocale,
                )}
                className="w-full bg-background/50"
              />
              {errors.username && (
                <p className="text-xs text-destructive mt-0.5">{errors.username.message}</p>
              )}
            </div>

            {/* Họ và tên */}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="modal-name" className="text-xs font-bold text-muted-foreground">
                {translate("customerAuth.profileModal.nameLabel", currentLocale)}
                <span className="text-destructive ml-0.5">*</span>
              </Label>
              <Input
                id="modal-name"
                type="text"
                {...register("name")}
                placeholder={translate("customerAuth.profileModal.namePlaceholder", currentLocale)}
                className="w-full bg-background/50"
              />
              {errors.name && (
                <p className="text-xs text-destructive mt-0.5">{errors.name.message}</p>
              )}
            </div>

            {/* Số điện thoại */}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="modal-phone" className="text-xs font-bold text-muted-foreground">
                {translate("customerAuth.profileModal.phoneLabel", currentLocale)}
                <span className="text-destructive ml-0.5">*</span>
              </Label>
              <Input
                id="modal-phone"
                type="tel"
                {...register("phone")}
                placeholder={translate("customerAuth.profileModal.phonePlaceholder", currentLocale)}
                className="w-full bg-background/50"
              />
              {errors.phone && (
                <p className="text-xs text-destructive mt-0.5">{errors.phone.message}</p>
              )}
            </div>

            {/* DOB & Gender (Optional) */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="modal-dob" className="text-xs font-bold text-muted-foreground">
                  {translate("customerAuth.profileModal.dobLabel", currentLocale)}
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
                      className="w-full bg-background/50"
                    />
                  )}
                />
                {errors.dob && (
                  <p className="text-xs text-destructive mt-0.5">{errors.dob.message}</p>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="modal-gender" className="text-xs font-bold text-muted-foreground">
                  {translate("customerAuth.profileModal.genderLabel", currentLocale)}
                </Label>
                <Controller
                  name="gender"
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={field.value || undefined}
                      onValueChange={(val) => field.onChange(val)}
                    >
                      <SelectTrigger className="w-full bg-background/50 border-input">
                        <SelectValue
                          placeholder={translate(
                            "customerAuth.profileModal.genderPlaceholder",
                            currentLocale,
                          )}
                        />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">
                          {translate("customerAuth.profileModal.genderMale", currentLocale)}
                        </SelectItem>
                        <SelectItem value="female">
                          {translate("customerAuth.profileModal.genderFemale", currentLocale)}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.gender && (
                  <p className="text-xs text-destructive mt-0.5">{errors.gender.message}</p>
                )}
              </div>
            </div>

            {/* Submit */}
            <Button
              type="submit"
              disabled={updateProfileMutation.isPending}
              className="w-full mt-4"
            >
              {updateProfileMutation.isPending && (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent mr-2" />
              )}
              {updateProfileMutation.isPending
                ? translate("customerAuth.profileModal.submitting", currentLocale)
                : translate("customerAuth.profileModal.submit", currentLocale)}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
