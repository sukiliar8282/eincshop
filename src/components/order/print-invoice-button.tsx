"use client";

import { useI18n } from "@/lib/i18n/client";

export function PrintInvoiceButton() {
  const { locale } = useI18n();
  const isEn = locale === "en";

  const handlePrint = () => {
    window.print();
  };

  return (
    <button
      type="button"
      onClick={handlePrint}
      className="print:hidden inline-flex min-h-10 items-center justify-center gap-2 rounded-[var(--radius-control)] border border-[var(--color-line-strong)] bg-white px-4 text-xs font-semibold text-[var(--color-ink)] transition-colors hover:bg-[var(--color-surface-muted)] active:scale-95 shadow-xs"
      title={
        isEn ? "Print invoice or save as PDF" : "Cetak nota atau simpan PDF"
      }
    >
      <svg
        className="h-4 w-4 text-[var(--color-ink)]"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.75}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M6.72 13.829v3.829h10.56v-3.829M6.72 8.743h10.56M3.6 8.743h16.8c.663 0 1.2.537 1.2 1.2v6.6c0 .663-.537 1.2-1.2 1.2H3.6c-.663 0-1.2-.537-1.2-1.2v-6.6c0-.663.537-1.2 1.2-1.2zm3.12-5.4h10.56v5.4H6.72V3.343z"
        />
      </svg>
      <span>{isEn ? "Print / Save PDF" : "Cetak / Simpan PDF"}</span>
    </button>
  );
}
