export const LOCALES = ["id", "en"] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "en";
export const LOCALE_COOKIE_NAME = "einc_locale";

/**
 * Defensive Sanitizer:
 * Memastikan locale HANYA "id" atau "en". Jika ada input asing,
 * karakter aneh, atau path injection, otomatis diarahkan ke default "en".
 */
export function sanitizeLocale(val: unknown): Locale {
  if (typeof val === "string") {
    const clean = val.toLowerCase().trim();
    if (clean === "id") return "id";
    if (clean === "en") return "en";
  }
  return DEFAULT_LOCALE;
}
