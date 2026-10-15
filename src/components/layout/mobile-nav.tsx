import Image from "next/image";
import Link from "next/link";

import { signOut } from "@/lib/auth";

type MobileUser = {
  name: string | null;
  email: string | null;
  role: "CUSTOMER" | "ADMIN";
  image?: string | null;
};

type MobileNavProps = {
  user: MobileUser | null;
  cartCount?: number;
};

const publicLinks = [{ href: "/products", label: "Katalog" }];

function getInitials(name: string | null, email: string | null): string {
  const value = name?.trim() || email?.split("@")[0] || "U";
  return value
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export function MobileNav({ user, cartCount = 0 }: MobileNavProps) {
  const initials = user ? getInitials(user.name, user.email) : "U";

  return (
    <details className="relative md:hidden">
      <summary className="focus-ring flex min-h-11 min-w-11 cursor-pointer list-none items-center justify-center rounded-[var(--radius-control)] border border-[var(--color-line)] bg-white text-[var(--color-ink)] transition-colors active:scale-95 [&::-webkit-details-marker]:hidden">
        <span className="sr-only">Buka menu</span>

        <span className="flex w-5 flex-col gap-1.5" aria-hidden="true">
          <span className="block h-0.5 bg-current" />
          <span className="block h-0.5 bg-current" />
          <span className="block h-0.5 bg-current" />
        </span>
      </summary>

      <nav
        aria-label="Navigasi mobile"
        className="dropdown-panel absolute right-0 top-14 z-[80] max-h-[calc(100dvh-5rem)] w-64 overflow-y-auto rounded-[var(--radius-card)] border border-[var(--color-line)] bg-white p-2 text-[var(--color-ink)] shadow-[var(--shadow-soft)]"
      >
        {/* Info Pengguna: Foto profil tepat di sebelah nama & email */}
        {user && (
          <div className="mb-2 flex items-center gap-3 border-b border-[var(--color-line)] px-3 py-3">
            {user.image ? (
              <Image
                src={`/api/profile-image?v=${encodeURIComponent(user.image)}`}
                alt={user.name || "Foto profil"}
                width={36}
                height={36}
                unoptimized
                className="h-9 w-9 shrink-0 rounded-full object-cover border border-[var(--color-line)]"
              />
            ) : (
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--color-accent-soft)] text-xs font-semibold text-[var(--color-accent-strong)]">
                {initials}
              </span>
            )}

            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-[var(--color-ink)]">
                {user.name || "User"}
              </p>

              <p className="mt-0.5 truncate text-xs text-[var(--color-text-muted)]">
                {user.email}
              </p>
            </div>
          </div>
        )}

        {publicLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="block rounded-[var(--radius-control)] px-3 py-3 text-sm hover:bg-[var(--color-surface-muted)]"
          >
            {link.label}
          </Link>
        ))}

        <Link
          href="/cart"
          className="flex items-center justify-between rounded-[var(--radius-control)] px-3 py-3 text-sm hover:bg-[var(--color-surface-muted)]"
        >
          <span>Keranjang</span>

          {cartCount > 0 && (
            <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-[var(--color-accent)] px-1.5 py-0.5 text-[10px] font-semibold text-white">
              {cartCount > 99 ? "99+" : cartCount}
            </span>
          )}
        </Link>

        {user ? (
          <>
            <Link
              href="/account"
              className="block rounded-[var(--radius-control)] px-3 py-3 text-sm hover:bg-[var(--color-surface-muted)]"
            >
              Account
            </Link>

            <Link
              href="/account/profile"
              className="block rounded-[var(--radius-control)] px-3 py-3 text-sm hover:bg-[var(--color-surface-muted)]"
            >
              Profile
            </Link>

            <Link
              href="/account/orders"
              className="block rounded-[var(--radius-control)] px-3 py-3 text-sm hover:bg-[var(--color-surface-muted)]"
            >
              Order history
            </Link>

            {user.role === "ADMIN" && (
              <Link
                href="/admin"
                className="block rounded-[var(--radius-control)] px-3 py-3 text-sm hover:bg-[var(--color-surface-muted)]"
              >
                Admin dashboard
              </Link>
            )}

            <form
              action={async () => {
                "use server";

                await signOut({
                  redirectTo: "/",
                });
              }}
              className="mt-2 border-t border-[var(--color-line)] pt-2"
            >
              <button
                type="submit"
                className="w-full rounded-[var(--radius-control)] px-3 py-3 text-left text-sm text-[var(--color-danger-strong)] hover:bg-[var(--color-danger-soft)]"
              >
                Logout
              </button>
            </form>
          </>
        ) : (
          <Link
            href="/login"
            className="mt-2 block text-center rounded-[var(--radius-control)] bg-[var(--color-ink)] px-3 py-3 text-sm font-medium !text-white"
          >
            Masuk
          </Link>
        )}
      </nav>
    </details>
  );
}
