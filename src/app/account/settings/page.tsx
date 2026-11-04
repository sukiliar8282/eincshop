import type { Metadata } from "next";
import Link from "next/link";

import { Container } from "@/components/ui/container";
import { requireUser } from "@/lib/auth/require-user";
import { prisma } from "@/lib/db";
import { getDictionary } from "@/lib/i18n/server";
import { DeleteAccountCard } from "./delete-account-card";

export const metadata: Metadata = {
  title: "Pengaturan Akun",
  description: "Kelola preferensi dan keamanan akun Anda.",
};

export default async function AccountSettingsPage() {
  const [sessionUser, { locale }] = await Promise.all([
    requireUser(),
    getDictionary(),
  ]);

  const isEn = locale === "en";

  const user = await prisma.user.findUnique({
    where: { id: sessionUser.id },
    select: {
      email: true,
      emailVerified: true,
      role: true,
      createdAt: true,
      accounts: {
        select: { provider: true },
      },
    },
  });

  const isGoogleLinked = user?.accounts.some((a) => a.provider === "google");

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-[var(--color-canvas)] py-8 sm:py-16">
      <Container>
        <div className="mx-auto max-w-3xl space-y-6">
          {/* Breadcrumb Navigasi */}
          <div>
            <Link
              href="/account"
              className="text-xs font-semibold text-[var(--color-text-muted)] hover:text-[var(--color-ink)] transition-colors"
            >
              {isEn ? "← Back to Dashboard" : "← Kembali ke Dashboard"}
            </Link>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-[var(--color-ink)] sm:text-4xl">
              {isEn ? "Account Settings" : "Pengaturan Akun"}
            </h1>
            <p className="mt-1 text-sm text-[var(--color-text-muted)]">
              {isEn
                ? "Manage your account security and danger zone preferences."
                : "Kelola keamanan akun dan preferensi zona bahaya Anda."}
            </p>
          </div>

          {/* KARTU INFORMASI AKUN & KEAMANAN */}
          <section className="rounded-[var(--radius-card)] border border-[var(--color-line)] bg-white p-6 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-[var(--color-ink)]">
              {isEn ? "Security & Identification" : "Keamanan & Identitas Akun"}
            </h2>

            <div className="divide-y divide-[var(--color-line)] text-sm">
              <div className="flex flex-col gap-1 py-3 sm:flex-row sm:items-center sm:justify-between">
                <span className="text-[var(--color-text-muted)]">
                  {isEn ? "Email Address" : "Alamat Email"}
                </span>
                <span className="font-mono font-medium text-[var(--color-ink)]">
                  {user?.email}
                </span>
              </div>

              <div className="flex flex-col gap-1 py-3 sm:flex-row sm:items-center sm:justify-between">
                <span className="text-[var(--color-text-muted)]">
                  {isEn ? "Email Verification" : "Status Verifikasi"}
                </span>
                <span className="inline-flex items-center gap-1.5 font-medium text-emerald-600">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  {isEn ? "Verified" : "Terverifikasi"}
                </span>
              </div>

              <div className="flex flex-col gap-1 py-3 sm:flex-row sm:items-center sm:justify-between">
                <span className="text-[var(--color-text-muted)]">
                  {isEn ? "Sign-in Method" : "Metode Masuk"}
                </span>
                <span className="font-medium text-[var(--color-ink)]">
                  {isGoogleLinked ? "Google OAuth" : "Email & Password"}
                </span>
              </div>
            </div>
          </section>

          {/* KOMPONEN ZONA BAHAYA (HAPUS AKUN PERMANEN) */}
          <DeleteAccountCard />
        </div>
      </Container>
    </main>
  );
}
