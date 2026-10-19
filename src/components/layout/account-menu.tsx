import Image from "next/image";
import Link from "next/link";

import { signOut } from "@/lib/auth";

type AccountMenuProps = {
  name: string | null;
  email: string | null;
  role: "CUSTOMER" | "ADMIN";
  image?: string | null;
};

function getInitials(name: string | null, email: string | null): string {
  const value = name?.trim() || email?.split("@")[0] || "U";

  return value
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export function AccountMenu({ name, email, role, image }: AccountMenuProps) {
  const initials = getInitials(name, email);

  return (
    <details className="group relative" suppressHydrationWarning>
      <summary className="focus-ring flex min-h-11 cursor-pointer list-none items-center gap-2 rounded-[var(--radius-control)] border border-[var(--color-line-strong)] bg-white px-3 text-sm text-[var(--color-ink)] transition-colors hover:bg-[var(--color-surface-muted)]">
        {image ? (
          <Image
            src={`/api/profile-image?v=${encodeURIComponent(image)}`}
            alt={name || "Foto profile"}
            width={28}
            height={28}
            unoptimized
            className="h-7 w-7 rounded-full object-cover border border-[var(--color-line)]"
          />
        ) : (
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--color-accent-soft)] text-xs font-semibold text-[var(--color-accent-strong)]">
            {initials}
          </span>
        )}

        <span className="hidden max-w-28 truncate sm:block">
          {name || email || "Profile"}
        </span>

        <span aria-hidden="true" className="text-xs">
          ▾
        </span>
      </summary>

      <div className="dropdown-panel absolute right-0 top-14 z-[80] max-h-[calc(100dvh-5rem)] w-60 overflow-y-auto rounded-[var(--radius-card)] border border-[var(--color-line)] bg-white p-2 shadow-[var(--shadow-soft)]">
        <div className="border-b border-[var(--color-line)] px-3 py-3">
          <p className="truncate text-sm font-medium text-[var(--color-ink)]">
            {name || "User"}
          </p>

          <p className="mt-1 truncate text-xs text-[var(--color-text-muted)]">
            {email}
          </p>
        </div>

        <nav aria-label="Account navigation" className="py-2">
          <Link
            href="/account"
            className="block rounded-[var(--radius-control)] px-3 py-2.5 text-sm text-[var(--color-text)] hover:bg-[var(--color-surface-muted)]"
          >
            Account
          </Link>

          <Link
            href="/account/profile"
            className="block rounded-[var(--radius-control)] px-3 py-2.5 text-sm text-[var(--color-text)] hover:bg-[var(--color-surface-muted)]"
          >
            Profile
          </Link>

          <Link
            href="/account/orders"
            className="block rounded-[var(--radius-control)] px-3 py-2.5 text-sm text-[var(--color-text)] hover:bg-[var(--color-surface-muted)]"
          >
            Order history
          </Link>

          {/* Download Center Link */}
          <Link
            href="/account/downloads"
            className="block rounded-[var(--radius-control)] px-3 py-2.5 text-sm text-[var(--color-text)] hover:bg-[var(--color-surface-muted)]"
          >
            Download center
          </Link>

          {role === "ADMIN" && (
            <Link
              href="/admin"
              className="block rounded-[var(--radius-control)] px-3 py-2.5 text-sm text-[var(--color-text)] hover:bg-[var(--color-surface-muted)]"
            >
              Admin dashboard
            </Link>
          )}
        </nav>

        <form
          action={async () => {
            "use server";

            await signOut({
              redirectTo: "/",
            });
          }}
          className="border-t border-[var(--color-line)] pt-2"
        >
          <button
            type="submit"
            className="w-full rounded-[var(--radius-control)] px-3 py-2.5 text-left text-sm text-[var(--color-danger-strong)] hover:bg-[var(--color-danger-soft)]"
          >
            Logout
          </button>
        </form>
      </div>
    </details>
  );
}
