import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { VerifyOtpForm } from "./verify-otp-form";
import { getDictionary } from "@/lib/i18n/server";
import { auth } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Verify Email",
};

interface VerifyOtpPageProps {
  searchParams: Promise<{
    email?: string;
    unverified?: string;
  }>;
}

export default async function VerifyOtpPage({
  searchParams,
}: VerifyOtpPageProps) {
  const { locale } = await getDictionary();
  const isEn = locale === "en";
  const params = await searchParams;
  let email = params?.email?.trim();

  // Jika parameter email kosong di URL, deteksi email dari sesi login aktif (Google OAuth)
  if (!email) {
    const session = await auth();
    if (session?.user?.email) {
      email = session.user.email;
    } else {
      redirect("/register");
    }
  }

  const isUnverifiedNotice = params?.unverified === "true";

  return (
    <main className="min-h-[calc(100vh-4rem)] py-16 sm:py-24">
      <div className="mx-auto w-full max-w-md px-4 sm:px-6">
        <div className="rounded-[var(--radius-card)] border border-[var(--color-line)] bg-white p-6 shadow-[var(--shadow-soft)] sm:p-8">
          <p className="text-sm font-medium uppercase tracking-[0.16em] text-[var(--color-accent-strong)]">
            EINCSHOP SECURITY
          </p>

          <h1 className="mt-4 text-3xl font-semibold tracking-[-0.03em] text-[var(--color-ink)]">
            {isEn ? "Check your email" : "Cek email Anda"}
          </h1>

          <p className="mt-3 text-sm leading-6 text-[var(--color-text-muted)]">
            {isEn
              ? "We've sent a 6-digit verification code to:"
              : "Kami telah mengirimkan 6 digit kode keamanan ke:"}
          </p>

          <p className="mt-1 font-mono text-sm font-semibold text-[var(--color-ink)] break-all">
            {email}
          </p>

          <div className="mt-8">
            <VerifyOtpForm
              email={email}
              isUnverifiedNotice={isUnverifiedNotice}
            />
          </div>
        </div>
      </div>
    </main>
  );
} 
