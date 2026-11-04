"use client";

import Script from "next/script";
import { useRouter } from "next/navigation";
import { useState } from "react";

type MidtransSnapPaymentProps = {
  token: string;
  isProduction: boolean;
};

export function MidtransSnapPayment({
  token,
  isProduction,
}: MidtransSnapPaymentProps) {
  const router = useRouter();
  const [message, setMessage] = useState("Menyiapkan halaman pembayaran...");

  const snapScript = isProduction
    ? "https://app.midtrans.com/snap/snap.js"
    : "https://app.sandbox.midtrans.com/snap/snap.js";

  function openPayment() {
    if (!window.snap) {
      setMessage("Payment interface belum siap. Silakan coba lagi.");
      return;
    }

    window.snap.pay(token, {
      onSuccess() {
        setMessage("Pembayaran diterima. Menunggu konfirmasi server.");
        router.refresh();
      },

      onPending() {
        setMessage("Pembayaran masih menunggu penyelesaian.");
        router.refresh();
      },

      onError() {
        setMessage("Pembayaran gagal diproses.");
        router.refresh();
      },

      onClose() {
        setMessage(
          "Halaman pembayaran ditutup. Status order tetap menunggu pembayaran.",
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
        className="mt-5 min-h-11 rounded-[var(--radius-control)] bg-[var(--color-ink)] px-4 text-sm font-medium text-white"
      >
        Buka payment page
      </button>
    </div>
  );
}
