"use client";

import React, {
  createContext,
  useContext,
  useOptimistic,
  useTransition,
} from "react";
import type { Locale } from "./config";
import type { Dictionary } from "./dictionaries/id";
import { idDict } from "./dictionaries/id";
import { enDict } from "./dictionaries/en";
import { setLocaleAction } from "./actions";

const dictionaries: Record<Locale, Dictionary> = {
  id: idDict,
  en: enDict,
};

// Autocomplete Type-Safe untuk semua key kamus eincshop
export type TranslationKey =
  | `common.${keyof typeof idDict.common}`
  | `nav.${keyof typeof idDict.nav}`
  | `account.${keyof typeof idDict.account}`
  | `profile.${keyof typeof idDict.profile}`
  | `cropper.${keyof typeof idDict.cropper}`
  | (string & {});

type I18nContextValue = {
  locale: Locale;
  dict: Dictionary;
  setLocale: (newLocale: Locale) => void;
  isPending: boolean;
  t: (
    keyPath: TranslationKey,
    params?: Record<string, string | number>,
  ) => string;
};

const I18nContext = createContext<I18nContextValue | null>(null);

type I18nProviderProps = {
  initialLocale: Locale;
  dictionary: Dictionary;
  children: React.ReactNode;
};

export function I18nProvider({
  initialLocale,
  dictionary,
  children,
}: I18nProviderProps) {
  const [isPending, startTransition] = useTransition();

  // Idiomatic React 19: Menggunakan useOptimistic (Bebas useEffect & Bebas ESLint Warning)
  const [currentLocale, setOptimisticLocale] = useOptimistic(
    initialLocale,
    (_current: Locale, nextLocale: Locale) => nextLocale,
  );

  function handleSetLocale(newLocale: Locale) {
    if (newLocale === currentLocale) return;

    startTransition(async () => {
      // 1. Ubah tampilan layar seketika dengan hook optimis React 19
      setOptimisticLocale(newLocale);

      // 2. Simpan cookie 1 tahun di server & revalidate layout
      try {
        await setLocaleAction(newLocale);
      } catch (err) {
        console.error("[i18n] Gagal memperbarui bahasa:", err);
      }
    });
  }

  // Pilih kamus aktif secara instan sesuai locale optimis
  const activeDict = dictionaries[currentLocale] ?? dictionary;

  function t(
    keyPath: TranslationKey,
    params?: Record<string, string | number>,
  ): string {
    const parts = keyPath.split(".");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let current: any = activeDict;

    for (const part of parts) {
      if (current && typeof current === "object" && part in current) {
        current = current[part];
      } else {
        // Defensive: Beri peringatan di development, fallback aman ke key di production
        if (process.env.NODE_ENV !== "production") {
          console.warn(
            `[i18n] Key "${keyPath}" tidak ditemukan pada kamus "${currentLocale}".`,
          );
        }
        return keyPath;
      }
    }

    let text = typeof current === "string" ? current : keyPath;

    // Interpolasi parameter yang aman (contoh: {{count}} diganti 5)
    if (params) {
      for (const [key, value] of Object.entries(params)) {
        text = text.replace(new RegExp(`{{${key}}}`, "g"), String(value));
      }
    }

    return text;
  }

  return (
    <I18nContext.Provider
      value={{
        locale: currentLocale,
        dict: activeDict,
        setLocale: handleSetLocale,
        isPending,
        t,
      }}
    >
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n(): I18nContextValue {
  const context = useContext(I18nContext);

  if (!context) {
    throw new Error("useI18n harus digunakan di dalam <I18nProvider />.");
  }

  return context;
}
