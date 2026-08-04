"use client";

import { translate as baseTranslate } from "@flash-ship/ecom-i18n";
import React, { createContext, useContext, useEffect, useState } from "react";

export const SUPPORTED_LOCALES = ["vi", "en"] as const;
export const DEFAULT_LOCALE = "vi" as const;
export const defaultLocale = DEFAULT_LOCALE;
export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

export type LanguageType = {
  id: string;
  title: string;
  flag?: string;
};

const LANGUAGES_MAP: Record<SupportedLocale, LanguageType> = {
  vi: { id: "vi", title: "Tiếng Việt", flag: "vn" },
  en: { id: "en", title: "English", flag: "us" },
};

const LANGUAGES_LIST: LanguageType[] = Object.values(LANGUAGES_MAP);

let activeGlobalLocale: SupportedLocale = DEFAULT_LOCALE;

export function getActiveLocale(): SupportedLocale {
  return activeGlobalLocale;
}

export function setActiveLocale(locale: SupportedLocale) {
  activeGlobalLocale = locale;
}

/**
 * Global translate function supporting dot notation keys.
 * If locale is omitted, falls back to activeGlobalLocale.
 */
export function translate(
  key: string,
  locale?: string | null,
  variables?: Record<string, unknown>,
): string {
  const resolvedLocale = locale || activeGlobalLocale;
  return baseTranslate(key, resolvedLocale, variables);
}

interface I18nContextType {
  locale: SupportedLocale;
  language: LanguageType;
  languageId: SupportedLocale;
  languages: LanguageType[];
  changeLanguage: (lang: string) => Promise<void>;
  langDirection: "ltr";
  t: (key: string, fallback?: string, variables?: Record<string, unknown>) => string;
  translate: (key: string, locale?: string | null, variables?: Record<string, unknown>) => string;
}

const I18nContext = createContext<I18nContextType | null>(null);

function setNextLocaleCookie(targetLocale: string) {
  if (typeof document !== "undefined") {
    // biome-ignore lint/suspicious/noDocumentCookie: client-side cookie persistence for i18n locale
    document.cookie = `NEXT_LOCALE=${targetLocale}; path=/; max-age=31536000; SameSite=Lax`;
  }
}

export function I18nProvider({
  children,
  initialLocale,
}: {
  children: React.ReactNode;
  initialLocale?: string;
}) {
  const [locale, setLocale] = useState<SupportedLocale>(() => {
    const validLocale =
      initialLocale && (SUPPORTED_LOCALES as readonly string[]).includes(initialLocale)
        ? (initialLocale as SupportedLocale)
        : DEFAULT_LOCALE;
    return validLocale;
  });

  useEffect(() => {
    setActiveLocale(locale);
  }, [locale]);

  const changeLanguage = async (newLang: string) => {
    if ((SUPPORTED_LOCALES as readonly string[]).includes(newLang)) {
      const targetLocale = newLang as SupportedLocale;
      setLocale(targetLocale);
      setActiveLocale(targetLocale);
      setNextLocaleCookie(targetLocale);
    }
  };

  const contextValue: I18nContextType = {
    locale,
    language: LANGUAGES_MAP[locale] || LANGUAGES_MAP.vi,
    languageId: locale,
    languages: LANGUAGES_LIST,
    changeLanguage,
    langDirection: "ltr",
    t: (key: string, fallback?: string, variables?: Record<string, unknown>) => {
      const res = translate(key, locale, variables);
      return res === key ? (fallback ?? key) : res;
    },
    translate: (key: string, targetLocale?: string | null, variables?: Record<string, unknown>) => {
      return translate(key, targetLocale || locale, variables);
    },
  };

  return React.createElement(I18nContext.Provider, { value: contextValue }, children);
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    return {
      locale: activeGlobalLocale,
      language: LANGUAGES_MAP[activeGlobalLocale] || LANGUAGES_MAP.vi,
      languageId: activeGlobalLocale,
      languages: LANGUAGES_LIST,
      changeLanguage: async (newLang: string) => {
        if ((SUPPORTED_LOCALES as readonly string[]).includes(newLang)) {
          setActiveLocale(newLang as SupportedLocale);
          setNextLocaleCookie(newLang);
        }
      },
      langDirection: "ltr" as const,
      t: (key: string, fallback?: string, variables?: Record<string, unknown>) => {
        const res = translate(key, activeGlobalLocale, variables);
        return res === key ? (fallback ?? key) : res;
      },
      translate: (key: string, locale?: string | null, variables?: Record<string, unknown>) => {
        return translate(key, locale || activeGlobalLocale, variables);
      },
    };
  }
  return context;
}

export default useI18n;
