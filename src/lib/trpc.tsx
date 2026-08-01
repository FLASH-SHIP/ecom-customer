"use client";

import { env } from "@customer/env";
import type { AppRouter } from "@flash-ship/ecom-trpc-types";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink } from "@trpc/client";
import { createTRPCReact } from "@trpc/react-query";
import { useState } from "react";
import superjson from "superjson";

import { signOut } from "next-auth/react";

export const trpc = createTRPCReact<AppRouter>();

function handleUnauthorized(error: any) {
  const errCode = error?.shape?.code ?? error?.data?.code ?? error?.status ?? error?.data?.httpStatus;
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
    // Clear NextAuth session token cookies instantly from browser
    document.cookie = "ecom-customer.session-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie = "__Secure-ecom-customer.session-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    signOut({ callbackUrl: "/auth/login" });
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
