import type { Metadata } from "next";

import { AuthForm } from "../auth-form";

export const metadata: Metadata = {
  title: "Register",
};

export default function RegisterPage() {
  return (
    <main className="min-h-[calc(100vh-4rem)] py-16 sm:py-24">
      <div className="mx-auto w-full max-w-md px-4 sm:px-6">
        <div className="rounded-[var(--radius-card)] border border-[var(--color-line)] bg-white p-6 shadow-[var(--shadow-soft)] sm:p-8">
          <p className="text-sm font-medium uppercase tracking-[0.16em] text-[var(--color-accent-strong)]">
            EINCSHOP
          </p>

          <h1 className="mt-4 text-3xl font-semibold tracking-[-0.03em] text-[var(--color-ink)]">
            Buat akun
          </h1>

          <p className="mt-3 text-sm leading-6 text-[var(--color-text-muted)]">
            Buat akun untuk menyimpan cart dan melihat order Anda.
          </p>

          <div className="mt-8">
            <AuthForm mode="register" />
          </div>
        </div>
      </div>
    </main>
  );
}