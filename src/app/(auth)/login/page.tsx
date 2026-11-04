import type { Metadata } from "next";

import { AuthForm } from "../auth-form";
import { getDictionary } from "@/lib/i18n/server";
import { StatusMessage } from "@/components/ui/status-message";

export const metadata: Metadata = {
  title: "Login",
};

interface LoginPageProps {
  searchParams: Promise<{
    error?: string;
    verified?: string;
    deleted?: string;
  }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { locale } = await getDictionary();
  const isEn = locale === "en";
  const params = await searchParams;
  const oauthError = params?.error;
  const isVerified = params?.verified === "true";
  const isDeleted = params?.deleted === "true";

  let errorMessage: string | null = null;
  if (oauthError === "OAuthAccountNotLinked") {
    errorMessage = isEn
      ? "This email is already registered with a password. Please sign in below using your email and password."
      : "Email ini sudah terdaftar menggunakan password. Silakan masuk menggunakan form email dan password di bawah ini.";
  } else if (oauthError === "AccessDenied") {
    errorMessage = isEn
      ? "Access denied. Please ensure your account is active and uses a valid @gmail.com address."
      : "Akses ditolak. Pastikan akun Anda aktif dan menggunakan alamat email @gmail.com yang valid.";
  } else if (oauthError === "AccountSuspended") {
    errorMessage = isEn
      ? "Your account has been suspended. Please contact customer support if you believe this is a mistake."
      : "Akun Anda telah ditangguhkan (disuspend). Silakan hubungi dukungan pelanggan jika Anda merasa ini adalah kekeliruan.";
  } else if (oauthError) {
    errorMessage = isEn
      ? "Authentication failed. Please try again."
      : "Autentikasi gagal. Silakan coba kembali.";
  }

  return (
    <main className="min-h-[calc(100vh-4rem)] py-16 sm:py-24">
      <div className="mx-auto w-full max-w-md px-4 sm:px-6">
        <div className="rounded-[var(--radius-card)] border border-[var(--color-line)] bg-white p-6 shadow-[var(--shadow-soft)] sm:p-8">
          <p className="text-sm font-medium uppercase tracking-[0.16em] text-[var(--color-accent-strong)]">
            EINCSHOP
          </p>

          <h1 className="mt-4 text-3xl font-semibold tracking-[-0.03em] text-[var(--color-ink)]">
            {isEn ? "Sign in to account" : "Masuk ke akun"}
          </h1>

          <p className="mt-3 text-sm leading-6 text-[var(--color-text-muted)]">
            {isEn
              ? "Use your email and password to continue."
              : "Gunakan email dan password untuk melanjutkan."}
          </p>

          {isDeleted && (
            <div className="mt-6">
              <StatusMessage tone="info">
                {isEn
                  ? "Your account and all associated data have been permanently deleted."
                  : "Akun Anda beserta seluruh datanya telah berhasil dihapus secara permanen."}
              </StatusMessage>
            </div>
          )}

          {isVerified && (
            <div className="mt-6">
              <StatusMessage tone="success">
                {isEn
                  ? "Email successfully verified! You can now sign in to your account."
                  : "Email berhasil diverifikasi! Silakan masuk ke akun Anda."}
              </StatusMessage>
            </div>
          )}

          {errorMessage && (
            <div className="mt-6">
              <StatusMessage tone="error">{errorMessage}</StatusMessage>
            </div>
          )}

          <div className="mt-8">
            <AuthForm mode="login" />
          </div>
        </div>
      </div>
    </main>
  );
}
