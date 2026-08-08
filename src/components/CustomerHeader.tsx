"use client";

import { translate } from "@flash-ship/ecom-i18n";
import { Button } from "@flash-ship/ecom-ui/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@flash-ship/ecom-ui/components/dropdown-menu";
import { UserAvatarIcon } from "@flash-ship/ecom-ui/components/icon-component/UserAvatarIcon";
import { WalletSolidIcon } from "@flash-ship/ecom-ui/components/icon-component/WalletSolidIcon";
import {BellIcon, MenuIcon } from "@flash-ship/ecom-ui/components/icons";
import { Bell, ChevronDown, LogOut, PanelLeft, User as UserIcon } from "lucide-react";
import NextImage from "next/image";
import NextLink from "next/link";
import AvailableBalance from "@customer/components/ui/AvailableBalance";
import {AuthLanguageSelector} from "@customer/components/auth/AuthLanguageSelector";

interface CustomerHeaderProps {
  isMobile: boolean;
  sidebarOpen: boolean;
  mobileOpen: boolean;
  onToggleSidebar: () => void;
  onOpenMobile: () => void;
  formattedHeaderBalance: string;
  displayName: string;
  onLogout: () => void;
  currentLocale: string;
}

export function CustomerHeader({
  isMobile,
  sidebarOpen,
  mobileOpen,
  onToggleSidebar,
  onOpenMobile,
  formattedHeaderBalance,
  displayName,
  onLogout,
  currentLocale,
}: CustomerHeaderProps) {
  return (
    <header className="sticky top-0 z-30 flex h-[68px] shrink-0 items-center justify-between border-b border-border bg-background px-6 shadow-[0_1px_2px_0_rgba(0,0,0,0.04)]">
      {/* Left Branding & Toggle */}
      <div className="flex items-center gap-4">
        <NextLink href="/dashboard" className="flex items-center">
          {/* Desktop Long Logo */}
          <NextImage
            src="/assets/images/logo/ecom-express-long.svg"
            alt="EcomExpress"
            width={198}
            height={38}
            priority
            className="hidden lg:block h-9.5 w-auto object-contain"
          />
          {/* Mobile Short Logo */}
          <NextImage
            src="/assets/images/logo/ecom-express-short.svg"
            alt="EcomExpress"
            width={30}
            height={36}
            priority
            className="block lg:hidden h-9.5 w-auto object-contain"
          />
        </NextLink>

        <div className="hidden lg:block">
          <Button
            variant="ghost"
            size="icon"
            type="button"
            onClick={onToggleSidebar}
            className="flex lg:hidden cursor-pointer size-9 rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
            title="Toggle sidebar"
          >
            <PanelLeft className="h-[18px] w-[18px]" strokeWidth={1.8} />
          </Button>
        </div>
      </div>

      {/* Right Tools (Theme, Wallet, Notification, Account Dropdown) */}
      <div className="flex items-center gap-3">
        {/* Wallet (Số dư ví tài khoản khả dụng từ hệ thống ví độc lập) */}
        <AvailableBalance balance={formattedHeaderBalance} />

        {/*Divider*/}
        <div className={'w-[1px] h-[30px] bg-[#E5E5E5]'}></div>

        {/*Languages*/}
        {/*<AuthLanguageSelector />*/}

        {/*Divider*/}
        {/*<div className={'w-[1px] h-[30px] bg-[#E5E5E5]'}></div>*/}

        {/* Notification */}
        {/*<div className="hidden lg:block">*/}
        {/*  <button*/}
        {/*    type="button"*/}
        {/*    className="w-10 h-10 relative flex items-center justify-center rounded-md bg-white hover:bg-[#FAFAFA] hover:border hover:border-[#D4D4D4] hover:shadow-[0_1px_2px_0_rgba(0,0,0,0.05)] hover:opacity-90 transition-opacity transition duration-500 cursor-pointer"*/}
        {/*  >*/}
        {/*    <BellIcon />*/}
        {/*  </button>*/}
        {/*</div>*/}

        {/* User Account Dropdown */}
        <div className="hidden lg:block">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="flex items-center gap-2 rounded-md bg-[#CFFEF9] dark:bg-teal-950/40 px-3 py-[7px] text-sm font-semibold text-[#0F798C] dark:text-teal-200 border border-transparent dark:border-teal-800/30 hover:opacity-90 transition-opacity focus:outline-none cursor-pointer text-left"
              >
                <UserAvatarIcon />
                <span className="truncate max-w-[120px] text-sys-primary dark:text-teal-200 font-medium">
                  {displayName}
                </span>
                <ChevronDown className="size-3.5 text-[#0F798C] dark:text-teal-200 shrink-0" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 mt-1 z-[9999]">
              <DropdownMenuItem asChild>
                <NextLink
                  href="/profile/change-password"
                  className="flex items-center gap-2 cursor-pointer w-full text-sm"
                >
                  <UserIcon className="h-4 w-4" />
                  {translate("customerDashboard.changePassword", currentLocale)}
                </NextLink>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={onLogout}
                className="text-destructive focus:text-destructive cursor-pointer text-sm"
              >
                <LogOut className="h-4 w-4" />
                {translate("customerDashboard.logout", currentLocale)}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <Button
          variant="ghost"
          size="icon"
          type="button"
          onClick={onOpenMobile}
          className="border border-sys-border rounded-md flex items-center justify-center lg:hidden cursor-pointer h-9 w-9 text-muted-foreground hover:text-foreground"
        >
          <MenuIcon />
        </Button>
      </div>
    </header>
  );
}
