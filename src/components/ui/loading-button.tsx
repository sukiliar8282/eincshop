"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";

import { Spinner } from "./spinner";
import { useI18n } from "@/lib/i18n/client";

type LoadingButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  loading?: boolean;
  loadingText?: ReactNode;
  children: ReactNode;
};

export function LoadingButton({
  loading = false,
  loadingText,
  children,
  disabled,
  className = "",
  ...props
}: LoadingButtonProps) {
  let isEn = false;
  try {
    const { locale } = useI18n();
    isEn = locale === "en";
  } catch {
    isEn = false;
  }

  const defaultLoadingText = isEn ? "Processing..." : "Memproses...";
  const currentLoadingText = loadingText ?? defaultLoadingText;

  return (
    <button
      {...props}
      disabled={disabled || loading}
      className={`pressable focus-ring inline-flex min-h-11 items-center justify-center gap-2 rounded-[var(--radius-control)] bg-[var(--color-ink)] px-4 py-2.5 text-sm font-medium !text-white transition-colors hover:bg-[var(--color-ink-soft)] disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    >
      {loading && (
        <Spinner
          size="sm"
          label={
            typeof currentLoadingText === "string"
              ? currentLoadingText
              : defaultLoadingText
          }
        />
      )}
      <span>{loading ? currentLoadingText : children}</span>
    </button>
  );
}