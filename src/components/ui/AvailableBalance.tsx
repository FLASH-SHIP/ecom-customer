import { WalletSolidIcon } from "@ecom/ui";
import NextLink from "next/link";
import useI18n from "@customer/lib/i18n";
import { translate } from "@flash-ship/ecom-i18n";

interface AvailableBalanceProps {
  balance: string;
}

export default function AvailableBalance({ balance }: AvailableBalanceProps) {
  const { languageId: currentLocale } = useI18n();

  return <>
    <div className={'flex flex-col'}>
      <div className={'text-[#404040] text-xs'}>Available balance</div>
      <div className={'text-[#0F798C] font-semibold text-base 2xl:text-xl'}>{balance}</div>
    </div>
  </>
}