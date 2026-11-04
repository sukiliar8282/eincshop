import type { Locale } from "@/lib/i18n/config";

/**
 * Locale-Aware Currency Formatter:
 * - ID ("id" | "id-ID"): Rp 99.000 (Standar perbankan Indonesia)
 * - EN ("en" | "en-US"): IDR 99,000 (Standar marketplace global Envato/Gumroad)
 */
export function formatIdr(
  amountMinor: number,
  locale: Locale | string = "id",
): string {
  const isEn = locale === "en" || locale === "en-US";

  return new Intl.NumberFormat(isEn ? "en-US" : "id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(amountMinor);
}
