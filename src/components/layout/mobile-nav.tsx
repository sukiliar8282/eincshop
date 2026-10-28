"use client";

import { useState, useRef, useEffect, useTransition } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { NavLink } from "@/components/layout/nav-link";
import { LanguageToggle } from "@/components/layout/language-toggle";
import { UserAvatar } from "@/components/ui/user-avatar";
import { logoutAction } from "@/app/(auth)/actions";
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
  const isEn = common?.logout === "Sign Out";
  const [isOpen, setIsOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isLoggingOut, startTransition] = useTransition();
  const menuRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  // 1. Tutup menu secara otomatis saat berpindah halaman rute (Pola Resmi React)
  const [prevPathname, setPrevPathname] = useState(pathname);
  if (prevPathname !== pathname) {
    setPrevPathname(pathname);
    setIsOpen(false);
  }

  // 2. Deteksi klik / sentuh di luar elemen drawer (Click Outside) dan tombol Escape
  useEffect(() => {
    if (!isOpen && !showLogoutModal) return;

    function handleClickOutside(event: MouseEvent | TouchEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
        setShowLogoutModal(false);
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
  }, [isOpen, showLogoutModal]);

  const handleClose = () => {
    setIsOpen(false);
  };

  // 3. Eksekusi logout aman dari modal konfirmasi
  const executeLogout = () => {
    if (isLoggingOut) return;

    startTransition(async () => {
      try {
        await logoutAction();
      } catch {
        // Abaikan jika server action melempar NEXT_REDIRECT
      }
      window.location.href = "/";
    });
  };

  return (
    <div ref={menuRef} className="relative md:hidden">
      {/* Tombol Hamburger dengan Animasi Garis Morphing ke 'X' */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label={dict?.nav.openMenu || "Toggle navigation"}
        className="focus-ring flex min-h-11 min-w-11 cursor-pointer items-center justify-center rounded-[var(--radius-control)] border border-[var(--color-line)] bg-white text-[var(--color-ink)] transition-colors active:scale-95 outline-none focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-ink)]"
      >
        <span className="sr-only">Toggle navigation</span>

        <span
          className="relative flex h-4 w-5 flex-col justify-between items-center pointer-events-none"
          aria-hidden="true"
        >
          <span
            className={`block h-0.5 w-5 rounded-full bg-current transition-all duration-300 ease-in-out origin-center ${
              isOpen ? "translate-y-[7px] rotate-45" : ""
            }`}
          />
          <span
            className={`block h-0.5 w-5 rounded-full bg-current transition-all duration-300 ease-in-out origin-center ${
              isOpen ? "translate-x-1 opacity-0" : ""
            }`}
          />
          <span
            className={`block h-0.5 w-5 rounded-full bg-current transition-all duration-300 ease-in-out origin-center ${
              isOpen ? "-translate-y-[7px] -rotate-45" : ""
            }`}
          />
        </span>
      </button>

      {/* Panel Drawer Navigasi Mobile */}
      {isOpen && (
        <nav
          aria-label={dict?.nav.mobileNav || "Navigasi mobile"}
          className="dropdown-panel absolute right-0 top-14 z-[80] max-h-[calc(100dvh-5rem)] w-64 overflow-y-auto rounded-[var(--radius-card)] border border-[var(--color-line)] bg-white p-2 text-[var(--color-ink)] shadow-[var(--shadow-soft)] animate-in fade-in zoom-in-95 duration-100"
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
            onClick={handleClose}
            className="block rounded-[var(--radius-control)] px-3 py-3 text-sm hover:bg-[var(--color-surface-muted)] aria-[current=page]:bg-[var(--color-surface-muted)] aria-[current=page]:text-[var(--color-ink)] transition-colors"
          >
            {common?.catalog || "Katalog"}
          </NavLink>

          {/* Link Keranjang */}
          <NavLink
            href="/cart"
            onClick={handleClose}
            className="flex items-center justify-between rounded-[var(--radius-control)] px-3 py-3 text-sm hover:bg-[var(--color-surface-muted)] aria-[current=page]:bg-[var(--color-surface-muted)] aria-[current=page]:text-[var(--color-ink)] transition-colors"
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
                onClick={handleClose}
                className="block rounded-[var(--radius-control)] px-3 py-3 text-sm hover:bg-[var(--color-surface-muted)] aria-[current=page]:bg-[var(--color-surface-muted)] aria-[current=page]:text-[var(--color-ink)] transition-colors"
              >
                {common?.account || "Account"}
              </NavLink>

              <NavLink
                href="/account/profile"
                onClick={handleClose}
                className="block rounded-[var(--radius-control)] px-3 py-3 text-sm hover:bg-[var(--color-surface-muted)] aria-[current=page]:bg-[var(--color-surface-muted)] aria-[current=page]:text-[var(--color-ink)] transition-colors"
              >
                {common?.profile || "Profile"}
              </NavLink>

              <NavLink
                href="/account/orders"
                onClick={handleClose}
                className="block rounded-[var(--radius-control)] px-3 py-3 text-sm hover:bg-[var(--color-surface-muted)] aria-[current=page]:bg-[var(--color-surface-muted)] aria-[current=page]:text-[var(--color-ink)] transition-colors"
              >
                {common?.orderHistory || "Order history"}
              </NavLink>

              <Link
                href="/account/downloads"
                onClick={handleClose}
                className="block rounded-[var(--radius-control)] px-3 py-3 text-sm hover:bg-[var(--color-surface-muted)] transition-colors"
              >
                {common?.downloadCenter || "Download center"}
              </Link>

              {/* Menu Mulai Jualan (Khusus CUSTOMER) */}
              {user.role === "CUSTOMER" && (
                <NavLink
                  href="/become-seller"
                  onClick={handleClose}
                  className="block rounded-[var(--radius-control)] px-3 py-3 text-sm font-medium text-[var(--color-accent-strong)] hover:bg-[var(--color-surface-muted)] aria-[current=page]:bg-[var(--color-surface-muted)] transition-colors"
                >
                  {common?.becomeSeller || "Mulai jualan →"}
                </NavLink>
              )}

              {/* Link Dashboard Seller/Admin */}
              {(user.role === "SELLER" || user.role === "ADMIN") && (
                <NavLink
                  href="/admin"
                  onClick={handleClose}
                  className="block rounded-[var(--radius-control)] px-3 py-3 text-sm hover:bg-[var(--color-surface-muted)] aria-[current=page]:bg-[var(--color-surface-muted)] aria-[current=page]:text-[var(--color-ink)] transition-colors"
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

              {/* Tombol Logout Mobile */}
              <div className="mt-2 border-t border-[var(--color-line)] pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    setShowLogoutModal(true);
                  }}
                  className="w-full rounded-[var(--radius-control)] px-3 py-3 text-left text-sm text-[var(--color-danger-strong)] hover:bg-[var(--color-danger-soft)] cursor-pointer transition-colors"
                >
                  {common?.logout || "Logout"}
                </button>
              </div>
            </>
          ) : (
            <>
              {/* Sakelar Bahasa untuk Pengunjung Belum Login */}
              <div className="my-2 border-t border-[var(--color-line)] pt-2">
                <LanguageToggle variant="menu" />
              </div>

              <Link
                href="/login"
                onClick={handleClose}
                className="mt-2 block rounded-[var(--radius-control)] bg-[var(--color-ink)] px-3 py-3 text-center text-sm font-semibold !text-white text-white! shadow-xs transition-colors hover:bg-[var(--color-ink-soft)] active:scale-95"
                style={{ color: "#ffffff" }}
              >
                {common?.login || "Sign In"}
              </Link>
            </>
          )}
        </nav>
      )}

      {/* Modal Dialog Konfirmasi Keluar Mobile */}
      {showLogoutModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="mobile-logout-dialog-title"
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/45 p-4 backdrop-blur-[2px] animate-in fade-in duration-150"
        >
          <div className="w-full max-w-sm rounded-[var(--radius-card)] border border-[var(--color-line)] bg-white p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150">
            <div className="space-y-1.5">
              <h3
                id="mobile-logout-dialog-title"
                className="text-base font-semibold text-[var(--color-ink)]"
              >
                {isEn ? "Confirm Sign Out" : "Konfirmasi Keluar"}
              </h3>
              <p className="text-xs leading-relaxed text-[var(--color-text-muted)]">
                {isEn
                  ? "Are you sure you want to sign out of your account?"
                  : "Apakah Anda yakin ingin keluar dari akun Anda?"}
              </p>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              {/* Tombol Batal */}
              <button
                type="button"
                onClick={() => setShowLogoutModal(false)}
                disabled={isLoggingOut}
                className="rounded-[var(--radius-control)] border border-[var(--color-line)] bg-white px-3.5 py-2 text-xs font-medium text-[var(--color-ink)] hover:bg-[var(--color-surface-muted)] transition-colors cursor-pointer"
              >
                {isEn ? "Cancel" : "Batal"}
              </button>

              {/* Tombol Konfirmasi Keluar */}
              <button
                type="button"
                onClick={executeLogout}
                disabled={isLoggingOut}
                className="rounded-[var(--radius-control)] bg-[var(--color-danger-strong)] px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-[var(--color-danger-strong)]/90 transition-colors cursor-pointer disabled:opacity-50"
              >
                {isLoggingOut
                  ? isEn
                    ? "Signing out..."
                    : "Keluar..."
                  : isEn
                    ? "Yes, Sign Out"
                    : "Ya, Keluar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
