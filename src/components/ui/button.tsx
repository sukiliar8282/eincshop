import Link from "next/link";
import type { ButtonHTMLAttributes, ComponentPropsWithoutRef } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";

type ButtonStyleProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
};

const variantClasses: Record<ButtonVariant, string> = {
  primary: "bg-[var(--color-ink)] !text-white hover:bg-[var(--color-ink-soft)]",
  secondary:
    "border border-[var(--color-line-strong)] bg-white text-[var(--color-ink)] hover:bg-[var(--color-surface-muted)]",
  ghost:
    "bg-transparent text-[var(--color-ink)] hover:bg-[var(--color-surface-muted)]",
  danger: "bg-[var(--color-danger)] !text-white hover:opacity-90",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "min-h-9 px-3 text-xs",
  md: "min-h-11 px-4 text-sm",
  lg: "min-h-12 px-5 text-sm",
};

function getButtonClasses({
  variant,
  size,
  className = "",
}: ButtonStyleProps & { className?: string }) {
  return [
    "pressable focus-ring",
    "inline-flex items-center justify-center gap-2 rounded-[var(--radius-control)]",
    "font-medium touch-manipulation",
    "motion-safe:transition-[transform,background-color,opacity,box-shadow]",
    "motion-safe:duration-150",
    "active:scale-[0.98]",
    "disabled:cursor-not-allowed disabled:opacity-50",
    variantClasses[variant ?? "primary"],
    sizeClasses[size ?? "md"],
    className,
  ]
    .filter(Boolean)
    .join(" ");
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & ButtonStyleProps;

export function Button({
  className = "",
  variant = "primary",
  size = "md",
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={getButtonClasses({ variant, size, className })}
      {...props}
    />
  );
}

type ButtonLinkProps = ComponentPropsWithoutRef<typeof Link> & ButtonStyleProps;

export function ButtonLink({
  className = "",
  variant = "primary",
  size = "md",
  ...props
}: ButtonLinkProps) {
  return (
    <Link
      className={getButtonClasses({ variant, size, className })}
      {...props}
    />
  );
}
