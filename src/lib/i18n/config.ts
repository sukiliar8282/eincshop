export const LOCALES = ["id", "en"] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "id";
export const LOCALE_COOKIE_NAME = "einc_locale";

/**
 * Defensive Sanitizer:
 * Memastikan locale HANYA "id" atau "en". Jika ada input asing,
 * karakter aneh, atau path injection, otomatis dipaksa kembali ke "id".
 */
export function sanitizeLocale(val: unknown): Locale {
  if (typeof val === "string") {
    const clean = val.toLowerCase().trim();
    if (clean === "en") return "en";
    if (clean === "id") return "id";
  }
  return DEFAULT_LOCALE;
}
