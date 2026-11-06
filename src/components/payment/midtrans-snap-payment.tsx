"use client";

import Script from "next/script";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useI18n } from "@/lib/i18n/client";

type MidtransSnapPaymentProps = {
  token: string;
  isProduction: boolean;
};

export function MidtransSnapPayment({
  token,
  isProduction,
}: MidtransSnapPaymentProps) {
  const router = useRouter();
  const { locale } = useI18n();
  const isEn = locale === "en";

  const [message, setMessage] = useState(
    isEn
      ? "Preparing payment interface..."
      : "Menyiapkan halaman pembayaran...",
  );

  const snapScript = isProduction
    ? "https://app.midtrans.com/snap/snap.js"
    : "https://app.sandbox.midtrans.com/snap/snap.js";

  function openPayment() {
    if (!window.snap) {
      setMessage(
        isEn
          ? "Payment interface is not ready yet. Please try again."
          : "Payment interface belum siap. Silakan coba lagi.",
      );
      return;
    }

    window.snap.pay(token, {
      onSuccess() {
        setMessage(
          isEn
            ? "Payment received. Awaiting server confirmation."
            : "Pembayaran diterima. Menunggu konfirmasi server.",
        );
        router.refresh();
      },

      onPending() {
        setMessage(
          isEn
            ? "Payment is pending completion."
            : "Pembayaran masih menunggu penyelesaian.",
        );
        router.refresh();
      },

      onError() {
        setMessage(
          isEn
            ? "Payment failed to process."
            : "Pembayaran gagal diproses.",
        );
        router.refresh();
      },

      onClose() {
        setMessage(
          isEn
            ? "Payment window closed. Order status remains pending payment."
            : "Halaman pembayaran ditutup. Status order tetap menunggu pembayaran.",
        );
      },
    });
  }

  return (
    <div>
      <Script
        src={snapScript}
        data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY}
        onLoad={openPayment}
      />

      <p className="text-sm leading-6 text-[var(--color-text-muted)]">
        {message}
      </p>

      <button
        type="button"
        onClick={openPayment}
        className="mt-5 min-h-11 cursor-pointer rounded-[var(--radius-control)] bg-[var(--color-ink)] px-4 text-sm font-medium text-white transition-opacity hover:opacity-90 active:scale-98"
      >
        {isEn ? "Open payment interface" : "Buka halaman pembayaran"}
      </button>
    </div>
  );
}