"use client";

import { translate } from "@flash-ship/ecom-i18n";
import { useI18n } from "@ecom/shared/@i18n";
import { ImportFileIcon, PlusCircleIcon, TopupIcon } from "@flash-ship/ecom-ui/components/icons";
import clsx from "clsx";
import { LayoutDashboard } from "lucide-react";
import NextLink from "next/link";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { trpc } from "../../lib/trpc";
import { ProfileCompletionModal } from "../../components/auth/ProfileCompletionModal";

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

  useEffect(() => {
    if (profile) {
      const hasMissingInfo = !profile.name || !profile.phone;
      setShowModal(hasMissingInfo);
    }
  }, [profile]);

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
      <ProfileCompletionModal
        isOpen={showModal}
        userProfile={profile}
        onClose={() => setShowModal(false)}
        onSuccess={() => {
          setShowModal(false);
          refetch();
        }}
      />
    </div>
  );
}
