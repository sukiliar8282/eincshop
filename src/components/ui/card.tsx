import type { HTMLAttributes } from "react";

type CardProps = HTMLAttributes<HTMLDivElement> & {
  interactive?: boolean;
};

export function Card({
  className = "",
  interactive = false,
  ...props
}: CardProps) {
  return (
    <div
      className={[
        "rounded-[var(--radius-card)] border border-[var(--color-line)] bg-white",
        interactive ? "surface-interactive" : "",
        className,
      ].join(" ")}
      {...props}
    />
  );
}
