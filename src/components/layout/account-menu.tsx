import Link from "next/link";
import { UserAvatar } from "@/components/ui/user-avatar";
import { signOut } from "@/lib/auth";
import type { Dictionary } from "@/lib/i18n/dictionaries/id";

type AccountMenuProps = {
  name: string | null;
  email: string | null;
  role: "CUSTOMER" | "SELLER" | "ADMIN";
  image?: string | null;
  dict?: Dictionary;
};

export function AccountMenu({
  name,
  email,
  role,
  image,
  dict,
}: AccountMenuProps) {
  const common = dict?.common;

  return (
    <details className="group relative" suppressHydrationWarning>
      <summary className="focus-ring flex min-h-11 cursor-pointer list-none items-center gap-2 rounded-[var(--radius-control)] border border-[var(--color-line-strong)] bg-white px-3 text-sm text-[var(--color-ink)] transition-colors hover:bg-[var(--color-surface-muted)]">
        {/* UserAvatar Deterministik Konsisten */}
        <UserAvatar name={name} email={email} image={image} size="sm" />

        <span className="hidden max-w-28 truncate sm:block">
          {name || email || common?.profile || "Profile"}
        </span>

        <span aria-hidden="true" className="text-xs">
          ▾
        </span>
      </summary>

      <div className="dropdown-panel absolute right-0 top-14 z-[80] max-h-[calc(100dvh-5rem)] w-60 overflow-y-auto rounded-[var(--radius-card)] border border-[var(--color-line)] bg-white p-2 shadow-[var(--shadow-soft)]">
        <div className="border-b border-[var(--color-line)] px-3 py-3">
          <p className="truncate text-sm font-medium text-[var(--color-ink)]">
            {name || common?.user || "User"}
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
            {common?.account || "Account"}
          </Link>

          <Link
            href="/account/profile"
            className="block rounded-[var(--radius-control)] px-3 py-2.5 text-sm text-[var(--color-text)] hover:bg-[var(--color-surface-muted)]"
          >
            {common?.profile || "Profile"}
          </Link>

          <Link
            href="/account/orders"
            className="block rounded-[var(--radius-control)] px-3 py-2.5 text-sm text-[var(--color-text)] hover:bg-[var(--color-surface-muted)]"
          >
            {common?.orderHistory || "Order history"}
          </Link>

          {/* Download Center Link */}
          <Link
            href="/account/downloads"
            className="block rounded-[var(--radius-control)] px-3 py-2.5 text-sm text-[var(--color-text)] hover:bg-[var(--color-surface-muted)]"
          >
            {common?.downloadCenter || "Download center"}
          </Link>

          {/* Opsi Mulai Jualan (Khusus CUSTOMER) */}
          {role === "CUSTOMER" && (
            <Link
              href="/become-seller"
              className="block rounded-[var(--radius-control)] px-3 py-2.5 text-sm font-medium text-[var(--color-accent-strong)] hover:bg-[var(--color-surface-muted)]"
            >
              {common?.becomeSeller || "Mulai jualan →"}
            </Link>
          )}

          {/* Dashboard Penjual / Admin */}
          {(role === "SELLER" || role === "ADMIN") && (
            <Link
              href="/admin"
              className="block rounded-[var(--radius-control)] px-3 py-2.5 text-sm font-medium text-[var(--color-ink)] hover:bg-[var(--color-surface-muted)]"
            >
              {role === "ADMIN"
                ? common?.adminDashboard || "Admin dashboard"
                : common?.sellerDashboard || "Seller dashboard"}
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
            {common?.logout || "Logout"}
          </button>
        </form>
      </div>
    </details>
  );
}
