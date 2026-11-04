"use client";

import Link from "next/link";
import { useActionState } from "react";
import { signIn } from "next-auth/react";

import { LoadingButton } from "@/components/ui/loading-button";
import { StatusMessage } from "@/components/ui/status-message";
import { Turnstile } from "@/components/ui/turnstile";
import { loginAction, registerAction, type AuthActionState } from "./actions";
import { useI18n } from "@/lib/i18n/client";

type AuthFormProps = {
  mode: "login" | "register";
};

const initialState: AuthActionState = {};

export function AuthForm({ mode }: AuthFormProps) {
  const { locale } = useI18n();
  const isEn = locale === "en";

  const action = mode === "login" ? loginAction : registerAction;
  const [state, formAction, isPending] = useActionState(action, initialState);

  const isRegister = mode === "register";

  return (
    <div className="space-y-6">
      {/* Tombol Login 1-Klik dengan Google */}
      <button
        type="button"
        onClick={() => signIn("google", { callbackUrl: "/account" })}
        className="flex min-h-11 w-full items-center justify-center gap-3 rounded-[var(--radius-control)] border border-[var(--color-line-strong)] bg-white px-4 text-sm font-medium text-[var(--color-ink)] transition-colors hover:bg-[var(--color-surface-muted)] cursor-pointer"
      >
        <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24">
          <path
            fill="#4285F4"
            d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
          />
          <path
            fill="#34A853"
            d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
          />
          <path
            fill="#FBBC05"
            d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
          />
          <path
            fill="#EA4335"
            d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
          />
        </svg>
        {isRegister
          ? isEn
            ? "Sign up with Google"
            : "Daftar dengan Google"
          : isEn
            ? "Sign in with Google"
            : "Masuk dengan Google"}
      </button>

      <div className="relative flex items-center justify-center">
        <div className="w-full border-t border-[var(--color-line)]" />
        <span className="absolute bg-white px-3 text-xs uppercase tracking-wider text-[var(--color-text-muted)]">
          {isEn ? "or with Gmail" : "atau via Gmail"}
        </span>
      </div>

      <form action={formAction} className="space-y-5">
        {isRegister && (
          <div>
            <label
              htmlFor="name"
              className="mb-2 block text-sm font-medium text-[var(--color-ink)]"
            >
              {isEn ? "Full Name" : "Nama"}
            </label>
            <input
              id="name"
              name="name"
              type="text"
              autoComplete="name"
              required
              minLength={2}
              maxLength={80}
              placeholder={isEn ? "Your name" : "Nama Anda"}
              className="min-h-11 w-full rounded-[var(--radius-control)] border border-[var(--color-line-strong)] bg-white px-3 text-sm outline-none focus:border-[var(--color-ink)] focus:ring-2 focus:ring-[var(--color-accent-soft)]"
            />
          </div>
        )}

        <div>
          <label
            htmlFor="email"
            className="mb-2 block text-sm font-medium text-[var(--color-ink)]"
          >
            {isEn ? "Email (@gmail.com required)" : "Email (Wajib @gmail.com)"}
          </label>
          <input
            id="email"
            name="email"
            type="email"
            placeholder="nama@gmail.com"
            autoComplete="email"
            required
            maxLength={254}
            className="min-h-11 w-full rounded-[var(--radius-control)] border border-[var(--color-line-strong)] bg-white px-3 text-sm outline-none focus:border-[var(--color-ink)] focus:ring-2 focus:ring-[var(--color-accent-soft)]"
          />
        </div>

        <div>
          <label
            htmlFor="password"
            className="mb-2 block text-sm font-medium text-[var(--color-ink)]"
          >
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete={isRegister ? "new-password" : "current-password"}
            required
            minLength={8}
            maxLength={128}
            className="min-h-11 w-full rounded-[var(--radius-control)] border border-[var(--color-line-strong)] bg-white px-3 text-sm outline-none focus:border-[var(--color-ink)] focus:ring-2 focus:ring-[var(--color-accent-soft)]"
          />
        </div>

        {state.error && (
          <StatusMessage tone="error">{state.error}</StatusMessage>
        )}

        {/* Cloudflare Turnstile CAPTCHA */}
        <Turnstile />

        <LoadingButton type="submit" loading={isPending} className="w-full">
          {isRegister
            ? isEn
              ? "Create account"
              : "Buat akun"
            : isEn
              ? "Sign in"
              : "Masuk"}
        </LoadingButton>

        <p className="text-center text-sm text-[var(--color-text-muted)]">
          {isRegister
            ? isEn
              ? "Already have an account?"
              : "Sudah punya akun?"
            : isEn
              ? "Don't have an account?"
              : "Belum punya akun?"}{" "}
          <Link
            href={isRegister ? "/login" : "/register"}
            className="font-medium text-[var(--color-accent-strong)] hover:underline"
          >
            {isRegister
              ? isEn
                ? "Sign in here"
                : "Masuk di sini"
              : isEn
                ? "Register here"
                : "Daftar di sini"}
          </Link>
        </p>
      </form>
    </div>
  );
}
