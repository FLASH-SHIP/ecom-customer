import { defaultLocale, locales } from "@flash-ship/ecom-i18n";
import { I18nProvider } from "@ecom/shared/@i18n";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { cookies } from "next/headers";
import { SessionProvider } from "next-auth/react";
import { CustomerLayout } from "../components/CustomerLayout";
import { ToastProvider } from "../components/toast-provider";
import { CustomerThemeProvider } from "../lib/CustomerThemeProvider";
import { TRPCProvider } from "../lib/trpc";
import "./globals.css";

import { env } from "@customer/env";

const inter = Inter({
  subsets: ["latin", "vietnamese"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: {
    default: "Ecom Express",
    template: "%s | Ecom Express",
  },
  description: "Discover articles, guides, and resources on Ecom Express.",
  metadataBase: new URL(env.NEXT_PUBLIC_APP_URL),
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const locale = cookieStore.get("NEXT_LOCALE")?.value;
  const lang =
    locale && (locales as readonly string[]).includes(locale) ? locale : defaultLocale;

  return (
    <html lang={lang} className={inter.variable}>
      <body>
        <CustomerThemeProvider>
          <SessionProvider>
            <TRPCProvider>
              <I18nProvider initialLocale={lang}>
                <ToastProvider>
                  <div className="flex min-h-screen flex-col">
                    <CustomerLayout>{children}</CustomerLayout>
                  </div>
                </ToastProvider>
              </I18nProvider>
            </TRPCProvider>
          </SessionProvider>
        </CustomerThemeProvider>
      </body>
    </html>
  );
}
