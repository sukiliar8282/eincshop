"use client";

import { useI18n } from "@/lib/i18n/client";

type LanguageToggleProps = {
  variant?: "pill" | "menu";
  className?: string;
};

export function LanguageToggle({
  variant = "pill",
  className = "",
}: LanguageToggleProps) {
  const { locale, setLocale, isPending } = useI18n();

  // Tampilan 1: Minimalist Pill untuk Navbar Desktop
  if (variant === "pill") {
    return (
      <div
        className={`flex items-center rounded-full border border-[var(--color-line)] bg-[var(--color-surface-muted)] p-0.5 text-xs font-medium transition-opacity ${
          isPending ? "opacity-60" : "opacity-100"
        } ${className}`}
        aria-label="Pilih bahasa"
      >
        <button
          type="button"
          onClick={() => setLocale("id")}
          disabled={isPending}
          className={`cursor-pointer rounded-full px-2.5 py-0.5 transition-all ${
            locale === "id"
              ? "bg-white font-semibold text-[var(--color-ink)] shadow-xs"
              : "text-[var(--color-text-muted)] hover:text-[var(--color-ink)]"
          }`}
          title="Bahasa Indonesia"
        >
          ID
        </button>

        <button
          type="button"
          onClick={() => setLocale("en")}
          disabled={isPending}
          className={`cursor-pointer rounded-full px-2.5 py-0.5 transition-all ${
            locale === "en"
              ? "bg-white font-semibold text-[var(--color-ink)] shadow-xs"
              : "text-[var(--color-text-muted)] hover:text-[var(--color-ink)]"
          }`}
          title="English"
        >
          EN
        </button>
      </div>
    );
  }

  // Tampilan 2: Row Elegan untuk Drawer Menu Mobile Android / HP
  return (
    <div
      className={`flex items-center justify-between rounded-[var(--radius-control)] border border-[var(--color-line)] bg-[var(--color-surface-muted)] p-2 transition-opacity ${
        isPending ? "opacity-60" : "opacity-100"
      } ${className}`}
    >
      <span className="flex items-center gap-1.5 text-xs font-medium text-[var(--color-text-muted)]">
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          className="h-4 w-4"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418"
          />
        </svg>
        {locale === "id" ? "Bahasa" : "Language"}
      </span>

      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => setLocale("id")}
          disabled={isPending}
          className={`cursor-pointer rounded-[var(--radius-control)] px-2.5 py-1 text-xs font-medium transition-all ${
            locale === "id"
              ? "bg-white font-semibold text-[var(--color-ink)] shadow-xs"
              : "text-[var(--color-text-muted)] hover:text-[var(--color-ink)]"
          }`}
        >
          🇮🇩 ID
        </button>

        <button
          type="button"
          onClick={() => setLocale("en")}
          disabled={isPending}
          className={`cursor-pointer rounded-[var(--radius-control)] px-2.5 py-1 text-xs font-medium transition-all ${
            locale === "en"
              ? "bg-white font-semibold text-[var(--color-ink)] shadow-xs"
              : "text-[var(--color-text-muted)] hover:text-[var(--color-ink)]"
          }`}
        >
          🇬🇧 EN
        </button>
      </div>
    </div>
  );
}
