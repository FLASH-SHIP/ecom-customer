"use client";

import { env } from "@customer/env";
import type { AppRouter } from "@flash-ship/ecom-trpc-types";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink } from "@trpc/client";
import { createTRPCReact } from "@trpc/react-query";
import { signOut } from "next-auth/react";
import { useState } from "react";
import superjson from "superjson";

export const trpc = createTRPCReact<AppRouter>();

function clearAllAuthCookies() {
  if (typeof document === "undefined") return;
  const cookies = document.cookie.split(";");
  for (const cookie of cookies) {
    const eqPos = cookie.indexOf("=");
    const name = eqPos > -1 ? cookie.substring(0, eqPos).trim() : cookie.trim();
    if (
      name.includes("session-token") ||
      name.includes("next-auth") ||
      name.includes("__Secure-") ||
      name.includes("__Host-")
    ) {
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
      if (window.location.hostname) {
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname};`;
      }
    }
  }
}

function handleUnauthorized(error: any) {
  const errCode =
    error?.shape?.code ?? error?.data?.code ?? error?.status ?? error?.data?.httpStatus;
  const errMsg = String(error?.message || error?.shape?.message || "").toLowerCase();
  const isUnauthorized =
    errCode === -32001 ||
    errCode === "UNAUTHORIZED" ||
    errCode === 401 ||
    errMsg.includes("unauthorized") ||
    errMsg.includes("token_expired") ||
    errMsg.includes("jwt expired") ||
    errMsg.includes("invalid token");

  if (isUnauthorized && typeof window !== "undefined") {
    // Thêm cờ __is_signing_out ngăn chặn việc gọi trùng lặp signOut nhiều lần đồng thời gây lặp vô hạn
    if (!(window as any).__is_signing_out) {
      (window as any).__is_signing_out = true;
      clearAllAuthCookies();
      signOut({ callbackUrl: "/auth/login?signedout=true" }).finally(() => {
        delete (window as any).__is_signing_out;
      });
    }
  }
  return isUnauthorized;
}

function getBaseUrl() {
  if (typeof window !== "undefined") return "";
  return env.NEXT_PUBLIC_APP_URL;
}

export function TRPCProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30 * 1000,
            refetchOnWindowFocus: false,
            retry(failureCount, error: any) {
              if (handleUnauthorized(error)) {
                return false;
              }
              return failureCount < 2;
            },
          },
          mutations: {
            onError(error: any) {
              handleUnauthorized(error);
            },
          },
        },
      }),
  );

  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
        httpBatchLink({
          url: `${getBaseUrl()}/api/trpc`,
          // biome-ignore lint/suspicious/noExplicitAny: tRPC v11 uses TypeError<> sentinel type for transformer — superjson satisfies DataTransformer at runtime
          transformer: superjson as any,
          headers() {
            const headers: Record<string, string> = {};
            if (typeof window !== "undefined") {
              const match = document.cookie.match(/NEXT_LOCALE=([^;]+)/);
              const cookieLocale = match?.[1];
              if (cookieLocale && /^[a-z]{2}$/.test(cookieLocale)) {
                headers["x-locale"] = cookieLocale;
              }
            }
            return headers;
          },
        }),
      ],
    }),
  );

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </trpc.Provider>
  );
}
