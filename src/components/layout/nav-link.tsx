"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ComponentProps } from "react";

type NavLinkProps = ComponentProps<typeof Link>;

export function NavLink({
  href,
  className = "",
  children,
  ...props
}: NavLinkProps) {
  const pathname = usePathname();
  const path = typeof href === "string" ? href : (href.pathname ?? "");
  const isActive =
    path === "/"
      ? pathname === "/"
      : pathname === path || pathname.startsWith(`${path}/`);

  return (
    <Link
      href={href}
      aria-current={isActive ? "page" : undefined}
      className={`${className} ${isActive ? "text-[var(--color-ink)]" : ""}`}
      {...props}
    >
      {children}
    </Link>
  );
}
