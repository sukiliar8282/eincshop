import type { HTMLAttributes } from "react";

type BadgeTone = "neutral" | "accent" | "success" | "warning" | "danger";

type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  tone?: BadgeTone;
};

const toneClasses: Record<BadgeTone, string> = {
  neutral:
    "bg-[var(--color-surface-muted)] text-[var(--color-text-muted)]",
  accent:
    "bg-[var(--color-accent-soft)] text-[var(--color-accent-strong)]",
  success:
    "bg-[var(--color-success-soft)] text-[var(--color-success-strong)]",
  warning:
    "bg-[var(--color-warning-soft)] text-[var(--color-warning-strong)]",
  danger:
    "bg-[var(--color-danger-soft)] text-[var(--color-danger-strong)]",
};

export function Badge({
  className = "",
  tone = "neutral",
  ...props
}: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${toneClasses[tone]} ${className}`}
      {...props}
    />
  );
}