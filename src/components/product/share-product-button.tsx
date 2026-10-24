"use client";

import { useState } from "react";
import { useToast } from "@/components/ui/toast-provider";
import { useI18n } from "@/lib/i18n/client";

type ShareProductButtonProps = {
  title: string;
};

export function ShareProductButton({ title }: ShareProductButtonProps) {
  const { locale } = useI18n();
  const isEn = locale === "en";
  const { showToast } = useToast();
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const url = window.location.href;

    // Utamakan Web Share API jika dijalankan di perangkat mobile (Android/iOS)
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title,
          text: isEn
            ? `Check out ${title} on Eincshop`
            : `Lihat ${title} di Eincshop`,
          url,
        });
        return;
      } catch {
        // Fallback jika dialog share dibatalkan
      }
    }

    // Salin ke Clipboard untuk desktop / browser tanpa Web Share API
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      showToast(
        "success",
        isEn
          ? "Product link copied to clipboard!"
          : "Tautan produk berhasil disalin!",
      );
      setTimeout(() => setCopied(false), 2500);
    } catch {
      showToast(
        "error",
        isEn ? "Failed to copy link." : "Gagal menyalin tautan.",
      );
    }
  };

  return (
    <button
      type="button"
      onClick={handleShare}
      className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-line-strong)] bg-white px-3 py-1.5 text-xs font-medium text-[var(--color-ink)] transition-all hover:bg-[var(--color-surface-muted)] active:scale-95 shadow-xs"
      title={isEn ? "Share or copy link" : "Bagikan atau salin tautan"}
    >
      {copied ? (
        <>
          <svg
            className="h-3.5 w-3.5 text-emerald-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2.5}
              d="M5 13l4 4L19 7"
            />
          </svg>
          <span className="text-emerald-700 font-semibold">
            {isEn ? "Link Copied!" : "Tersalin!"}
          </span>
        </>
      ) : (
        <>
          <svg
            className="h-3.5 w-3.5 text-[var(--color-text-muted)]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
            />
          </svg>
          <span>{isEn ? "Share Link" : "Salin Link"}</span>
        </>
      )}
    </button>
  );
}