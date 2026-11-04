"use client";

import { useI18n } from "@/lib/i18n/client";

type MicroTrustBadgesProps = {
  locale?: string;
};

export function MicroTrustBadges({
  locale: propLocale,
}: MicroTrustBadgesProps) {
  const { locale: clientLocale } = useI18n();
  const locale = propLocale || clientLocale;
  const isEn = locale === "en";

  return (
    <div
      aria-label={
        isEn ? "Product purchase guarantees" : "Jaminan pembelian produk"
      }
      className="grid grid-cols-1 gap-3 rounded-[var(--radius-card)] border border-[var(--color-line)] bg-white p-4 sm:grid-cols-3 sm:gap-4 sm:p-5 shadow-xs"
    >
      {/* Badge 1: Unduhan Otomatis & Instan */}
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
          <svg
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 10V3L4 14h7v7l9-11h-7z"
            />
          </svg>
        </div>
        <div>
          <h4 className="text-xs font-semibold text-[var(--color-ink)]">
            {isEn ? "Instant Delivery" : "Unduhan Instan 24/7"}
          </h4>
          <p className="mt-0.5 text-[11px] leading-relaxed text-[var(--color-text-muted)]">
            {isEn
              ? "Direct access right after payment"
              : "Langsung diunduh setelah pembayaran"}
          </p>
        </div>
      </div>

      {/* Badge 2: Akses File Seumur Hidup */}
      <div className="flex items-start gap-3 border-t border-[var(--color-line)] pt-3 sm:border-t-0 sm:border-l sm:pl-3 sm:pt-0">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600">
          <svg
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
            />
          </svg>
        </div>
        <div>
          <h4 className="text-xs font-semibold text-[var(--color-ink)]">
            {isEn ? "Lifetime Access" : "Akses Selamanya"}
          </h4>
          <p className="mt-0.5 text-[11px] leading-relaxed text-[var(--color-text-muted)]">
            {isEn
              ? "Re-download anytime from account"
              : "Unduh ulang kapan saja di akun"}
          </p>
        </div>
      </div>

      {/* Badge 3: Terenkripsi & Resmi Midtrans */}
      <div className="flex items-start gap-3 border-t border-[var(--color-line)] pt-3 sm:border-t-0 sm:border-l sm:pl-3 sm:pt-0">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-purple-50 text-purple-600">
          <svg
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
            />
          </svg>
        </div>
        <div>
          <h4 className="text-xs font-semibold text-[var(--color-ink)]">
            {isEn ? "Verified Payment" : "Pembayaran Aman"}
          </h4>
          <p className="mt-0.5 text-[11px] leading-relaxed text-[var(--color-text-muted)]">
            {isEn
              ? "Encrypted security via Midtrans"
              : "Terenkripsi resmi via Midtrans"}
          </p>
        </div>
      </div>
    </div>
  );
}
