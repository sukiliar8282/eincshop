import Link from "next/link";
import { NavLink } from "@/components/layout/nav-link";
import { LanguageToggle } from "@/components/layout/language-toggle";
import { UserAvatar } from "@/components/ui/user-avatar";
import { signOut } from "@/lib/auth";
import type { Dictionary } from "@/lib/i18n/dictionaries/id";

type MobileUser = {
  name: string | null;
  email: string | null;
  role: "CUSTOMER" | "SELLER" | "ADMIN";
  image?: string | null;
};

type MobileNavProps = {
  user: MobileUser | null;
  cartCount?: number;
  dict?: Dictionary;
};

export function MobileNav({ user, cartCount = 0, dict }: MobileNavProps) {
  const common = dict?.common;

  return (
    <details className="group relative md:hidden">
      <summary
        aria-label={dict?.nav.openMenu || "Toggle navigation"}
        className="focus-ring flex min-h-11 min-w-11 cursor-pointer list-none items-center justify-center rounded-[var(--radius-control)] border border-[var(--color-line)] bg-white text-[var(--color-ink)] transition-colors active:scale-95 outline-none focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-ink)] [&::-webkit-details-marker]:hidden"
      >
        <span className="sr-only">Toggle navigation</span>

        {/* 3 Garis Morphing ke 'X' */}
        <span
          className="relative flex h-4 w-5 flex-col justify-between items-center pointer-events-none"
          aria-hidden="true"
        >
          <span className="block h-0.5 w-5 rounded-full bg-current transition-all duration-300 ease-in-out origin-center group-open:translate-y-[7px] group-open:rotate-45" />
          <span className="block h-0.5 w-5 rounded-full bg-current transition-all duration-300 ease-in-out origin-center group-open:translate-x-1 group-open:opacity-0" />
          <span className="block h-0.5 w-5 rounded-full bg-current transition-all duration-300 ease-in-out origin-center group-open:-translate-y-[7px] group-open:-rotate-45" />
        </span>
      </summary>

      <nav
        aria-label={dict?.nav.mobileNav || "Navigasi mobile"}
        className="dropdown-panel absolute right-0 top-14 z-[80] max-h-[calc(100dvh-5rem)] w-64 overflow-y-auto rounded-[var(--radius-card)] border border-[var(--color-line)] bg-white p-2 text-[var(--color-ink)] shadow-[var(--shadow-soft)]"
      >
        {user && (
          <div className="mb-2 flex items-center gap-3 border-b border-[var(--color-line)] px-3 py-3">
            <UserAvatar
              name={user.name}
              email={user.email}
              image={user.image}
              size="md"
            />

            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-[var(--color-ink)]">
                {user.name || common?.user || "User"}
              </p>

              <p className="mt-0.5 truncate text-xs text-[var(--color-text-muted)]">
                {user.email}
              </p>
            </div>
          </div>
        )}

        {/* Link Publik Katalog */}
        <NavLink
          href="/products"
          className="block rounded-[var(--radius-control)] px-3 py-3 text-sm hover:bg-[var(--color-surface-muted)] aria-[current=page]:bg-[var(--color-surface-muted)] aria-[current=page]:text-[var(--color-ink)]"
        >
          {common?.catalog || "Katalog"}
        </NavLink>

        {/* Link Keranjang */}
        <NavLink
          href="/cart"
          className="flex items-center justify-between rounded-[var(--radius-control)] px-3 py-3 text-sm hover:bg-[var(--color-surface-muted)] aria-[current=page]:bg-[var(--color-surface-muted)] aria-[current=page]:text-[var(--color-ink)]"
        >
          <span>{common?.cart || "Keranjang"}</span>

          {cartCount > 0 && (
            <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-[var(--color-accent)] px-1.5 py-0.5 text-[10px] font-semibold text-white">
              {cartCount > 99 ? "99+" : cartCount}
            </span>
          )}
        </NavLink>

        {user ? (
          <>
            <NavLink
              href="/account"
              className="block rounded-[var(--radius-control)] px-3 py-3 text-sm hover:bg-[var(--color-surface-muted)] aria-[current=page]:bg-[var(--color-surface-muted)] aria-[current=page]:text-[var(--color-ink)]"
            >
              {common?.account || "Account"}
            </NavLink>

            <NavLink
              href="/account/profile"
              className="block rounded-[var(--radius-control)] px-3 py-3 text-sm hover:bg-[var(--color-surface-muted)] aria-[current=page]:bg-[var(--color-surface-muted)] aria-[current=page]:text-[var(--color-ink)]"
            >
              {common?.profile || "Profile"}
            </NavLink>

            <NavLink
              href="/account/orders"
              className="block rounded-[var(--radius-control)] px-3 py-3 text-sm hover:bg-[var(--color-surface-muted)] aria-[current=page]:bg-[var(--color-surface-muted)] aria-[current=page]:text-[var(--color-ink)]"
            >
              {common?.orderHistory || "Order history"}
            </NavLink>

            <Link
              href="/account/downloads"
              className="block rounded-[var(--radius-control)] px-3 py-3 text-sm hover:bg-[var(--color-surface-muted)]"
            >
              {common?.downloadCenter || "Download center"}
            </Link>

            {/* Menu Mulai Jualan (Khusus CUSTOMER) */}
            {user.role === "CUSTOMER" && (
              <NavLink
                href="/become-seller"
                className="block rounded-[var(--radius-control)] px-3 py-3 text-sm font-medium text-[var(--color-accent-strong)] hover:bg-[var(--color-surface-muted)] aria-[current=page]:bg-[var(--color-surface-muted)]"
              >
                {common?.becomeSeller || "Mulai jualan →"}
              </NavLink>
            )}

            {/* Link Dashboard Seller/Admin */}
            {(user.role === "SELLER" || user.role === "ADMIN") && (
              <NavLink
                href="/admin"
                className="block rounded-[var(--radius-control)] px-3 py-3 text-sm hover:bg-[var(--color-surface-muted)] aria-[current=page]:bg-[var(--color-surface-muted)] aria-[current=page]:text-[var(--color-ink)]"
              >
                {user.role === "ADMIN"
                  ? common?.adminDashboard || "Admin dashboard"
                  : common?.sellerDashboard || "Seller dashboard"}
              </NavLink>
            )}

            {/* Sakelar Bahasa Mobile */}
            <div className="my-2 border-t border-[var(--color-line)] pt-2">
              <LanguageToggle variant="menu" />
            </div>

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
                {common?.logout || "Logout"}
              </button>
            </form>
          </>
        ) : (
          <>
            {/* Sakelar Bahasa untuk Pengunjung Belum Login */}
            <div className="my-2 border-t border-[var(--color-line)] pt-2">
              <LanguageToggle variant="menu" />
            </div>

            <Link
              href="/login"
              className="mt-2 block rounded-[var(--radius-control)] bg-[var(--color-ink)] px-3 py-3 text-center text-sm font-semibold !text-white text-white! shadow-xs transition-colors hover:bg-[var(--color-ink-soft)] active:scale-95"
              style={{ color: "#ffffff" }}
            >
              {common?.login || "Sign In"}
            </Link>
          </>
        )}
      </nav>
    </details>
  );
}
