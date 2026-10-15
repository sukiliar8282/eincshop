import type { ButtonHTMLAttributes, ReactNode } from "react";

import { Spinner } from "./spinner";

type LoadingButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  loading?: boolean;
  children: ReactNode;
};

export function LoadingButton({
  loading = false,
  children,
  disabled,
  className = "",
  ...props
}: LoadingButtonProps) {
  return (
    <button
      {...props}
      disabled={disabled || loading}
      className={`pressable focus-ring inline-flex min-h-11 items-center justify-center gap-2 rounded-[var(--radius-control)] bg-[var(--color-ink)] px-4 py-2.5 text-sm font-medium !text-white transition-colors hover:bg-[var(--color-ink-soft)] disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    >
      {loading && <Spinner size="sm" />}
      <span>{loading ? "Memproses..." : children}</span>
    </button>
  );
}
