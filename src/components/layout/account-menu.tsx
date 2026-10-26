"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserAvatar } from "@/components/ui/user-avatar";
import { logoutAction } from "@/app/(auth)/actions";
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
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  // 1. Tutup menu secara otomatis saat berpindah halaman rute (Pola Resmi React tanpa ESLint effect error)
  const [prevPathname, setPrevPathname] = useState(pathname);
  if (prevPathname !== pathname) {
    setPrevPathname(pathname);
    setIsOpen(false);
  }

  // 2. Deteksi klik di luar elemen menu (Click Outside) dan tombol Escape
  useEffect(() => {
    if (!isOpen) return;

    function handleClickOutside(event: MouseEvent | TouchEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const handleClose = () => {
    setIsOpen(false);
  };

  return (
    <div ref={menuRef} className="relative">
      {/* Tombol Pemicu Dropdown */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label="Toggle user account menu"
        className="focus-ring flex min-h-11 cursor-pointer list-none items-center gap-2 rounded-[var(--radius-control)] border border-[var(--color-line-strong)] bg-white px-3 text-sm text-[var(--color-ink)] transition-colors hover:bg-[var(--color-surface-muted)]"
      >
        <UserAvatar name={name} email={email} image={image} size="sm" />

        <span className="hidden max-w-28 truncate sm:block font-medium">
          {name || email || common?.profile || "Profile"}
        </span>

        <span
          aria-hidden="true"
          className={`text-xs transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        >
          ▾
        </span>
      </button>

      {/* Panel Dropdown Menu */}
      {isOpen && (
        <div
          role="menu"
          aria-label="Account navigation"
          className="dropdown-panel absolute right-0 top-14 z-[80] max-h-[calc(100dvh-5rem)] w-60 overflow-y-auto rounded-[var(--radius-card)] border border-[var(--color-line)] bg-white p-2 shadow-[var(--shadow-soft)] animate-in fade-in zoom-in-95 duration-100"
        >
          {/* Header Info Akun */}
          <div className="border-b border-[var(--color-line)] px-3 py-3">
            <p className="truncate text-sm font-medium text-[var(--color-ink)]">
              {name || common?.user || "User"}
            </p>

            <p className="mt-1 truncate text-xs text-[var(--color-text-muted)]">
              {email}
            </p>
          </div>

          {/* Navigasi Menu Akun */}
          <nav aria-label="Account navigation" className="py-2">
            <Link
              href="/account"
              onClick={handleClose}
              className="block rounded-[var(--radius-control)] px-3 py-2.5 text-sm text-[var(--color-text)] hover:bg-[var(--color-surface-muted)] transition-colors"
            >
              {common?.account || "Account"}
            </Link>

            <Link
              href="/account/profile"
              onClick={handleClose}
              className="block rounded-[var(--radius-control)] px-3 py-2.5 text-sm text-[var(--color-text)] hover:bg-[var(--color-surface-muted)] transition-colors"
            >
              {common?.profile || "Profile"}
            </Link>

            <Link
              href="/account/orders"
              onClick={handleClose}
              className="block rounded-[var(--radius-control)] px-3 py-2.5 text-sm text-[var(--color-text)] hover:bg-[var(--color-surface-muted)] transition-colors"
            >
              {common?.orderHistory || "Order history"}
            </Link>

            {/* Link Download Center */}
            <Link
              href="/account/downloads"
              onClick={handleClose}
              className="block rounded-[var(--radius-control)] px-3 py-2.5 text-sm text-[var(--color-text)] hover:bg-[var(--color-surface-muted)] transition-colors"
            >
              {common?.downloadCenter || "Download center"}
            </Link>

            {/* Opsi Mulai Jualan (Khusus CUSTOMER) */}
            {role === "CUSTOMER" && (
              <Link
                href="/become-seller"
                onClick={handleClose}
                className="block rounded-[var(--radius-control)] px-3 py-2.5 text-sm font-medium text-[var(--color-accent-strong)] hover:bg-[var(--color-surface-muted)] transition-colors"
              >
                {common?.becomeSeller || "Mulai jualan →"}
              </Link>
            )}

            {/* Dashboard Penjual / Admin */}
            {(role === "SELLER" || role === "ADMIN") && (
              <Link
                href="/admin"
                onClick={handleClose}
                className="block rounded-[var(--radius-control)] px-3 py-2.5 text-sm font-medium text-[var(--color-ink)] hover:bg-[var(--color-surface-muted)] transition-colors"
              >
                {role === "ADMIN"
                  ? common?.adminDashboard || "Admin dashboard"
                  : common?.sellerDashboard || "Seller dashboard"}
              </Link>
            )}
          </nav>

          {/* Form Tombol Logout */}
          <form
            action={logoutAction}
            className="border-t border-[var(--color-line)] pt-2"
          >
            <button
              type="submit"
              onClick={handleClose}
              className="w-full rounded-[var(--radius-control)] px-3 py-2.5 text-left text-sm text-[var(--color-danger-strong)] hover:bg-[var(--color-danger-soft)] cursor-pointer transition-colors"
            >
              {common?.logout || "Logout"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
