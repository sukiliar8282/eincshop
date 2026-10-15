import type { HTMLAttributes } from "react";

type StatusMessageProps = HTMLAttributes<HTMLParagraphElement> & {
  tone: "success" | "error" | "info";
};

const toneClasses = {
  success: "bg-[var(--color-success-soft)] text-[var(--color-success-strong)]",
  error: "bg-[var(--color-danger-soft)] text-[var(--color-danger-strong)]",
  info: "bg-[var(--color-surface-muted)] text-[var(--color-text-muted)]",
};

export function StatusMessage({
  tone,
  className = "",
  ...props
}: StatusMessageProps) {
  return (
    <p
      role={tone === "error" ? "alert" : "status"}
      className={`rounded-[var(--radius-control)] px-3 py-2 text-sm ${toneClasses[tone]} ${className}`}
      {...props}
    />
  );
}
