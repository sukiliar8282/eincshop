"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import {
  verifyOtpAction,
  resendOtpAction,
  type AuthActionState,
} from "@/app/(auth)/actions";
import { LoadingButton } from "@/components/ui/loading-button";
import { StatusMessage } from "@/components/ui/status-message";
import { useI18n } from "@/lib/i18n/client";

type VerifyOtpFormProps = {
  email: string;
  isUnverifiedNotice?: boolean;
};

const initialState: AuthActionState = {};

export function VerifyOtpForm({
  email,
  isUnverifiedNotice = false,
}: VerifyOtpFormProps) {
  const { locale } = useI18n();
  const isEn = locale === "en";

  const [verifyState, formAction, isVerifyPending] = useActionState(
    verifyOtpAction,
    initialState,
  );
  const [resendState, resendAction, isResendPending] = useActionState(
    resendOtpAction,
    initialState,
  );

  const [otpValue, setOtpValue] = useState("");
  const [clientError, setClientError] = useState<string | null>(null);

  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setClientError(null);
    const val = e.target.value.replace(/\D/g, "").slice(0, 6);
    setOtpValue(val);
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData("text");
    const clean = pasteData.replace(/\D/g, "").slice(0, 6);
    setClientError(null);
    setOtpValue(clean);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    if (otpValue.length !== 6) {
      e.preventDefault();
      setClientError(
        isEn
          ? "Please enter the full 6-digit verification code."
          : "Harap masukkan 6 digit kode verifikasi secara lengkap.",
      );
    }
  };

  const rawErrorMessage = clientError || verifyState.error;
  const displayErrorMessage = rawErrorMessage
    ? isEn
      ? rawErrorMessage.includes("kedaluwarsa") ||
        rawErrorMessage.includes("expired")
        ? "Verification code has expired. Please request a new code."
        : rawErrorMessage.includes("6 digit") ||
            rawErrorMessage.includes("digits")
          ? "Verification code must be 6 digits."
          : rawErrorMessage.includes("lengkap")
            ? "Please enter the full 6-digit verification code."
            : rawErrorMessage.includes("percobaan") ||
                rawErrorMessage.includes("attempts")
              ? rawErrorMessage
              : "Invalid or incorrect verification code."
      : rawErrorMessage
    : null;

  return (
    <div className="space-y-6">
      {isUnverifiedNotice && (
        <div className="rounded-[var(--radius-control)] border border-amber-200 bg-amber-50 p-3.5 text-xs text-amber-800 leading-5">
          {isEn
            ? "Your email address has not been verified yet. We have sent a verification code to complete your setup."
            : "Alamat email Anda belum diverifikasi. Kami telah mengirimkan kode OTP untuk menyelesaikan aktivasi akun."}
        </div>
      )}

      {/* Form Input Kode OTP 6 Digit */}
      <form action={formAction} onSubmit={handleSubmit} className="space-y-5">
        <input type="hidden" name="email" value={email} />
        <input type="hidden" name="locale" value={locale} />

        <div>
          <label
            htmlFor="otp"
            className="mb-2 block text-xs font-semibold uppercase tracking-wider text-[var(--color-ink)]"
          >
            {isEn ? "6-Digit Security Code" : "Kode Keamanan 6 Digit"}
          </label>
          <input
            id="otp"
            name="otp"
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            autoComplete="one-time-code"
            required
            autoFocus
            maxLength={12}
            value={otpValue}
            onChange={handleOtpChange}
            onPaste={handlePaste}
            placeholder="000000"
            className="min-h-12 w-full text-center font-mono text-2xl font-bold tracking-[0.35em] rounded-[var(--radius-control)] border border-[var(--color-line-strong)] bg-white px-3 outline-none focus:border-[var(--color-ink)] focus:ring-2 focus:ring-[var(--color-accent-soft)]"
          />
          <div className="mt-2 flex items-center justify-between text-xs text-[var(--color-text-muted)]">
            <span>
              {isEn
                ? "Code expires in 10 minutes."
                : "Kode berlaku selama 10 menit."}
            </span>
            <span
              className={
                otpValue.length === 6
                  ? "font-semibold text-emerald-600"
                  : "text-[var(--color-text-muted)]"
              }
            >
              {otpValue.length}/6 digit
            </span>
          </div>
        </div>

        {displayErrorMessage && (
          <StatusMessage tone="error">{displayErrorMessage}</StatusMessage>
        )}

        <LoadingButton
          type="submit"
          loading={isVerifyPending}
          className="w-full"
        >
          {isEn ? "Verify Account" : "Verifikasi Akun"}
        </LoadingButton>
      </form>

      {/* Fitur Kirim Ulang OTP */}
      <div className="pt-2 border-t border-[var(--color-line)] text-center space-y-3">
        <p className="text-xs text-[var(--color-text-muted)]">
          {isEn ? "Didn't receive the email?" : "Tidak menerima kode email?"}
        </p>

        {resendState.success && (
          <StatusMessage tone="success">
            {isEn
              ? "A new verification code has been sent to your email."
              : "Kode keamanan verifikasi baru telah dikirimkan ke email Anda."}
          </StatusMessage>
        )}
        {resendState.error && (
          <StatusMessage tone="error">
            {isEn
              ? resendState.error.includes("detik") ||
                resendState.error.includes("seconds")
                ? `Too many requests. Please wait ${resendState.error.replace(/\D/g, "") || "a few"} seconds before requesting a new code.`
                : "Too many requests. Please wait a moment."
              : resendState.error}
          </StatusMessage>
        )}

        <form action={resendAction}>
          <input type="hidden" name="email" value={email} />
          <input type="hidden" name="locale" value={locale} />
          <button
            type="submit"
            disabled={isResendPending}
            className="text-xs font-semibold text-[var(--color-ink)] hover:underline disabled:opacity-50 cursor-pointer"
          >
            {isResendPending
              ? isEn
                ? "Sending code..."
                : "Mengirimkan kode..."
              : isEn
                ? "Resend verification code"
                : "Kirim ulang kode verifikasi"}
          </button>
        </form>

        <div className="pt-2">
          <Link
            href="/login"
            className="text-xs text-[var(--color-text-muted)] hover:text-[var(--color-ink)] transition-colors"
          >
            {isEn ? "← Back to Sign In" : "← Kembali ke Halaman Masuk"}
          </Link>
        </div>
      </div>
    </div>
  );
}
