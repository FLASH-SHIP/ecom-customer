import { env } from "@customer/env";
import type { CustomerAuthResponse } from "@flash-ship/ecom-types";
import NextAuth, { type NextAuthResult } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Facebook from "next-auth/providers/facebook";
import Google from "next-auth/providers/google";

export const AUTH_KEYS = {
  accessToken: "customerAccessToken",
  refreshToken: "customerRefreshToken",
} as const;

export interface AppUser {
  id: string;
  displayName: string;
  email?: string;
  photoURL?: string;
  role: string[];
  loginRedirectUrl: string;
}

export function getCustomerSessionCookieName(useSecureCookies: boolean): string {
  return useSecureCookies ? "__Secure-ecom-customer.session-token" : "ecom-customer.session-token";
}

const nextAuth: NextAuthResult = NextAuth({
  secret: env.AUTH_SECRET,
  session: { strategy: "jwt" },
  pages: {
    signIn: "/auth/login",
  },
  cookies: {
    sessionToken: {
      name: getCustomerSessionCookieName(env.NODE_ENV === "production"),
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: env.NODE_ENV === "production",
      },
    },
  },
  debug: env.NODE_ENV === "development",
  providers: [
    ...(env.AUTH_GOOGLE_ID && env.AUTH_GOOGLE_SECRET
      ? [
          Google({
            clientId: env.AUTH_GOOGLE_ID,
            clientSecret: env.AUTH_GOOGLE_SECRET,
          }),
        ]
      : []),
    ...(env.FACEBOOK_CLIENT_ID && env.FACEBOOK_CLIENT_SECRET
      ? [
          Facebook({
            clientId: env.FACEBOOK_CLIENT_ID,
            clientSecret: env.FACEBOOK_CLIENT_SECRET,
          }),
        ]
      : []),
    Credentials({
      name: "credentials",
      credentials: {
        identifier: { label: "Email or Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.identifier || !credentials?.password) {
          return null;
        }

        try {
          const apiUrl = env.NEXT_PUBLIC_API_URL;

          const res = await fetch(`${apiUrl}/api/v1/customer/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              identifier: credentials.identifier,
              password: credentials.password,
            }),
          });

          if (!res.ok) return null;
          const json: CustomerAuthResponse = await res.json();
          const user = json?.data?.user || json?.data?.customer;
          const accessToken = json?.data?.accessToken;
          const refreshToken = json?.data?.refreshToken;
          if (!user) return null;

          return {
            id: String(user.id),
            email: user.email,
            name: user.name || user.displayName || user.email,
            accessToken,
            refreshToken,
            tokenVersion: user.tokenVersion ?? 1,
          };
        } catch (error) {
          console.error("NextAuth customer authorize error:", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      const isSocialProvider =
        account?.provider &&
        account.provider !== "credentials" &&
        (account.provider === "google" || account.provider === "facebook");

      if (isSocialProvider && user?.email) {
        try {
          const apiUrl = env.NEXT_PUBLIC_API_URL;
          const res = await fetch(`${apiUrl}/api/v1/customer/auth/social-login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              provider: account.provider,
              providerId: user.id || account.providerAccountId,
              email: user.email,
              name: user.name || user.email,
              avatarUrl: user.image || undefined,
            }),
          });

          if (res.ok) {
            const json = await res.json();
            const data = json?.data || json;
            const backendUser = data?.user || data?.customer;
            const backendAccessToken = data?.accessToken;
            const backendRefreshToken = data?.refreshToken;

            if (backendUser) {
              token.id = String(backendUser.id);
              token.email = backendUser.email;
              token.name = backendUser.name || user.name;
              token.accessToken = backendAccessToken;
              token.refreshToken = backendRefreshToken;
              token.tokenVersion = backendUser.tokenVersion ?? 1;
            }
          } else {
            console.error(`[NextAuth ${account.provider} SSO] Social login API returned error:`, res.status);
          }
        } catch (error) {
          console.error(`[NextAuth ${account.provider} SSO] Error syncing user with backend:`, error);
        }
      } else if (user) {
        token.id = user.id;
        token.accessToken = (user as { accessToken?: string }).accessToken;
        token.refreshToken = (user as { refreshToken?: string }).refreshToken;
        token.tokenVersion = (user as { tokenVersion?: number }).tokenVersion ?? 1;
      }
      return token;
    },
    async session({ session, token }) {
      if (token?.id) {
        session.user.id = token.id as string;
      }
      if (token?.accessToken) {
        (session as any).accessToken = token.accessToken;
      }
      if (token?.refreshToken) {
        (session as any).refreshToken = token.refreshToken;
      }
      return session;
    },
  },
});

export const handlers = nextAuth.handlers;
export const auth = nextAuth.auth;
export const signIn = nextAuth.signIn;
export const signOut = nextAuth.signOut;
export default nextAuth;
