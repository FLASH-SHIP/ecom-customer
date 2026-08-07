"use client";

import { translate } from "@flash-ship/ecom-i18n";
import { useI18n } from "@ecom/shared/@i18n";
import { SidebarToggleIcon } from "@flash-ship/ecom-ui/components/icon-component/SidebarToggleIcon";
import { cn } from "@flash-ship/ecom-ui/lib/utils";
import { usePathname, useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { type ReactNode, useEffect, useState } from "react";
import { useToast } from "./toast-provider";
import { trpc } from "../lib/trpc";
import { CustomerHeader } from "./CustomerHeader";
import { CustomerSidebar } from "./CustomerSidebar";
import { TermsAndConditionsModal } from "./auth/TermsAndConditionsModal";

interface CustomerDashboardLayoutProps {
  children: ReactNode;
}

export function CustomerDashboardLayout({ children }: CustomerDashboardLayoutProps) {
  const _pathname = usePathname();
  const router = useRouter();
  const { status } = useSession();
  const { languageId: currentLocale } = useI18n();
  const { toast } = useToast();

  // Sidebar States
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [welcomeShown, setWelcomeShown] = useState(false);

  // Responsive Breakpoint Detection
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024; // lg
      setIsMobile(mobile);
      if (mobile) {
        setMobileOpen(false);
      }
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Fetch real-time customer profile
  const { data: profile, error: profileError, refetch: refetchProfile } = trpc.customer.auth.me.useQuery(undefined, {
    enabled: status === "authenticated",
    retry: false,
  });

  // Kiểm tra tài khoản đã chấp nhận điều khoản dịch vụ (is_terms_accepted) hay chưa (bao gồm cả luồng SSO Google/Facebook)
  const isTermsAcceptedPending = Boolean(
    status === "authenticated" && profile && (profile as any).isTermsAccepted === false
  );

  // LƯU Ý BẢO TRÌ (HEADER WALLET BALANCE):
  // Truy vấn số dư ví thực tế từ Hệ Thống Ví Độc Lập qua endpoint /payment-api/account/info (thông qua TRPC getWalletSummary).
  // Đảm bảo số dư ví hiển thị trên Header luôn đồng bộ 100% với thẻ "My Wallet" tại trang Quản Lý Ví (/wallet).
  const { data: walletSummary } = trpc.customer.topup.getWalletSummary.useQuery(undefined, {
    enabled: status === "authenticated",
    staleTime: 10_000, // Caching 10 giây tối ưu hiệu năng không spam API
  });

  const formattedHeaderBalance = walletSummary
    ? `$${walletSummary.accountBalance.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    : "$0.00";

  // Xử lý chuyển hướng khi phiên đăng nhập hết hiệu lực (unauthenticated)
  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/auth/login");
    }
  }, [status, router]);

  // Show welcome toast on successful login (Credentials & SSO)
  useEffect(() => {
    if (status === "authenticated" && profile && !welcomeShown) {
      const sessionKey = `welcome_toast_${profile.id || profile.email}`;
      const alreadyShown = sessionStorage.getItem(sessionKey);
      const justLoggedIn = sessionStorage.getItem("just_logged_in");

      if (!alreadyShown || justLoggedIn === "true") {
        sessionStorage.setItem(sessionKey, "true");
        sessionStorage.removeItem("just_logged_in");
        setWelcomeShown(true);

        const name = profile.name || profile.email?.split("@")[0] || "Customer";
        const welcomeMsg =
          translate("customerAuth.login.welcomeMessage", currentLocale, { name }) ||
          (currentLocale === "vi"
            ? `🎉 Chào mừng ${name} đã quay trở lại với Ecom Express!`
            : `🎉 Welcome back to Ecom Express, ${name}!`);

        toast(welcomeMsg, "success");
      }
    }
  }, [status, profile, currentLocale, welcomeShown, toast]);

  const displayName = profile?.name ?? profile?.email?.split("@")[0] ?? "Customer";

  const handleLogout = async () => {
    if (typeof window !== "undefined") {
      sessionStorage.clear();
    }
    await signOut({ callbackUrl: "/auth/login" });
  };

  return (
    <div className="flex flex-col w-full min-h-screen bg-background">
      {/* Toolbar Header */}
      <CustomerHeader
        isMobile={isMobile}
        sidebarOpen={sidebarOpen}
        mobileOpen={mobileOpen}
        onToggleSidebar={() => (isMobile ? setMobileOpen(!mobileOpen) : setSidebarOpen(!sidebarOpen))}
        onOpenMobile={() => setMobileOpen(true)}
        formattedHeaderBalance={formattedHeaderBalance}
        displayName={displayName}
        onLogout={handleLogout}
        currentLocale={currentLocale}
      />

      {/* Main body (Sidebar + Content) */}
      <div className="flex flex-1 w-full relative">
        {/* Desktop Sidebar */}
        {!isMobile && (
          <aside
            className={cn(
              "sticky top-[72px] z-40 h-[calc(100vh-72px)] shrink-0 border-r border-sys-border dark:border-zinc-800 bg-[var(--sidebar-bg)] shadow-[1px_0_8px_rgba(0,0,0,0.05)] dark:shadow-none transition-all duration-300 ease-out",
              sidebarOpen ? "w-[var(--sidebar-width)]" : "w-18",
            )}
          >
            <CustomerSidebar isCollapsed={!sidebarOpen} />

            {/* Floating Sidebar Toggle Button for Desktop */}
            <button
              type="button"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className={cn(
                "absolute top-6 z-50 transition-all duration-300 ease-out focus:outline-none hover:scale-105 active:scale-95 cursor-pointer",
                sidebarOpen ? "left-[calc(var(--sidebar-width)-12px)]" : "left-[60px]",
              )}
              title={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
            >
              <SidebarToggleIcon isOpen={sidebarOpen} className="size-6 drop-shadow-sm" />
            </button>
          </aside>
        )}

        {/* Mobile Sidebar backdrop */}
        {isMobile && mobileOpen && (
          <button
            type="button"
            aria-label="Close sidebar"
            className="fixed inset-0 z-40 bg-black/55 backdrop-blur-sm transition-opacity duration-300 cursor-default"
            onClick={() => setMobileOpen(false)}
          />
        )}

        {/* Mobile Drawer Sidebar */}
        {isMobile && (
          <aside
            className={cn(
              "fixed inset-y-0 left-0 z-50 w-full shadow-xl transition-transform duration-300 ease-out bg-[var(--sidebar-bg)]",
              mobileOpen ? "translate-x-0" : "-translate-x-full",
            )}
          >
            <CustomerSidebar
              isCollapsed={false}
              isDrawer={true}
              onClose={() => setMobileOpen(false)}
            />
          </aside>
        )}

        {/* Content Area */}
        <div className="flex flex-1 flex-col min-w-0 relative">
          <main className="flex flex-1 flex-col p-4 md:p-6">{children}</main>
        </div>

        {/* Modal Bắt Buộc Đồng Ý Điều Khoản Dịch Vụ Cho Cả Luồng SSO (Google/Facebook) */}
        {isTermsAcceptedPending && profile && (
          <TermsAndConditionsModal
            isOpen={isTermsAcceptedPending}
            customerId={profile.id}
            onClose={() => {
              // Nếu người dùng đóng Modal khi chưa đồng ý, tiến hành Đăng xuất để bảo đảm an toàn
              signOut({ callbackUrl: "/auth/login" });
            }}
            onSuccess={() => {
              refetchProfile();
            }}
          />
        )}
      </div>
    </div>
  );
}
