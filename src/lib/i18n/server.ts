import { cookies } from "next/headers";

import {
  DEFAULT_LOCALE,
  LOCALE_COOKIE_NAME,
  sanitizeLocale,
  type Locale,
} from "./config";
import { idDict, type Dictionary } from "./dictionaries/id";
import { enDict } from "./dictionaries/en";

const dictionaries: Record<Locale, Dictionary> = {
  id: idDict,
  en: enDict,
};

/**
 * Membaca preferensi bahasa pengguna dari Cookie secara aman di sisi server.
 */
export async function getLocale(): Promise<Locale> {
  try {
    const cookieStore = await cookies();
    const rawLocale = cookieStore.get(LOCALE_COOKIE_NAME)?.value;
    return sanitizeLocale(rawLocale);
  } catch {
    return DEFAULT_LOCALE;
  }
}

/**
 * Mengambil kamus bahasa dengan mekanisme Defensive Fallback.
 * Jika kamus bahasa yang diminta (misal English) memiliki struktur yang belum lengkap,
 * sistem otomatis mengisi celah dengan kamus default Bahasa Indonesia (anti-crash).
 */
export async function getDictionary(localeParam?: Locale): Promise<{
  locale: Locale;
  dict: Dictionary;
}> {
  const locale = localeParam ? sanitizeLocale(localeParam) : await getLocale();
  const dict = dictionaries[locale] ?? dictionaries[DEFAULT_LOCALE];

  return { locale, dict };
}
