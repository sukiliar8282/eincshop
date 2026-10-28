"use client";

import { useState, useRef, useEffect, useTransition } from "react";
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
  const isEn = common?.logout === "Sign Out";

  // Mengatur dropdown akun dan modal konfirmasi logout
  const [isOpen, setIsOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // Mengatur status proses logout
  const [isLoggingOut, startTransition] = useTransition();

  const menuRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  // Menutup dropdown saat pengguna berpindah halaman
  const [prevPathname, setPrevPathname] = useState(pathname);

  if (prevPathname !== pathname) {
    setPrevPathname(pathname);
    setIsOpen(false);
  }

  // Menangani klik di luar menu dan tombol Escape
  useEffect(() => {
    if (!isOpen && !showLogoutModal) return;

    function handleClickOutside(event: MouseEvent | TouchEvent) {
      if (
        isOpen &&
        menuRef.current &&
        !menuRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);

        if (!isLoggingOut) {
          setShowLogoutModal(false);
        }
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
  }, [isOpen, showLogoutModal, isLoggingOut]);

  // Menutup dropdown setelah tautan navigasi dipilih
  const handleClose = () => {
    setIsOpen(false);
  };

  // Menjalankan proses logout melalui Server Action
  const executeLogout = () => {
    if (isLoggingOut) return;

    startTransition(async () => {
      try {
        await logoutAction();
      } catch (error) {
        // Next.js dapat menggunakan redirect yang melempar error khusus.
        // Jika terjadi error lain, tampilkan di console untuk pemeriksaan.
        const isNextRedirect =
          error instanceof Error && error.message.includes("NEXT_REDIRECT");

        if (!isNextRedirect) {
          console.error("Gagal menjalankan logout:", error);
        }
      }

      // Kembali ke halaman utama dan muat ulang status autentikasi
      window.location.href = "/";
    });
  };

  return (
    <div ref={menuRef} className="relative">
      {/* Tombol untuk membuka dropdown akun */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label="Toggle user account menu"
        className="focus-ring flex min-h-11 cursor-pointer list-none items-center gap-2 rounded-[var(--radius-control)] border border-[var(--color-line-strong)] bg-white px-3 text-sm text-[var(--color-ink)] transition-colors hover:bg-[var(--color-surface-muted)]"
      >
        <UserAvatar name={name} email={email} image={image} size="sm" />

        <span className="hidden max-w-28 truncate font-medium sm:block">
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

      {/* Panel dropdown menu akun */}
      {isOpen && (
        <div
          role="menu"
          aria-label="Account navigation"
          className="dropdown-panel absolute right-0 top-14 z-[80] max-h-[calc(100dvh-5rem)] w-60 overflow-y-auto rounded-[var(--radius-card)] border border-[var(--color-line)] bg-white p-2 shadow-[var(--shadow-soft)] animate-in fade-in zoom-in-95 duration-100"
        >
          {/* Informasi akun */}
          <div className="border-b border-[var(--color-line)] px-3 py-3">
            <p className="truncate text-sm font-medium text-[var(--color-ink)]">
              {name || common?.user || "User"}
            </p>

            <p className="mt-1 truncate text-xs text-[var(--color-text-muted)]">
              {email}
            </p>
          </div>

          {/* Navigasi akun */}
          <nav aria-label="Account navigation" className="py-2">
            <Link
              href="/account"
              onClick={handleClose}
              className="block rounded-[var(--radius-control)] px-3 py-2.5 text-sm text-[var(--color-text)] transition-colors hover:bg-[var(--color-surface-muted)]"
            >
              {common?.account || "Account"}
            </Link>

            <Link
              href="/account/profile"
              onClick={handleClose}
              className="block rounded-[var(--radius-control)] px-3 py-2.5 text-sm text-[var(--color-text)] transition-colors hover:bg-[var(--color-surface-muted)]"
            >
              {common?.profile || "Profile"}
            </Link>

            <Link
              href="/account/orders"
              onClick={handleClose}
              className="block rounded-[var(--radius-control)] px-3 py-2.5 text-sm text-[var(--color-text)] transition-colors hover:bg-[var(--color-surface-muted)]"
            >
              {common?.orderHistory || "Order history"}
            </Link>

            {/* Menu download center */}
            <Link
              href="/account/downloads"
              onClick={handleClose}
              className="block rounded-[var(--radius-control)] px-3 py-2.5 text-sm text-[var(--color-text)] transition-colors hover:bg-[var(--color-surface-muted)]"
            >
              {common?.downloadCenter || "Download center"}
            </Link>

            {/* Opsi mulai berjualan untuk customer */}
            {role === "CUSTOMER" && (
              <Link
                href="/become-seller"
                onClick={handleClose}
                className="block rounded-[var(--radius-control)] px-3 py-2.5 text-sm font-medium text-[var(--color-accent-strong)] transition-colors hover:bg-[var(--color-surface-muted)]"
              >
                {common?.becomeSeller || "Mulai jualan →"}
              </Link>
            )}

            {/* Dashboard seller dan admin */}
            {(role === "SELLER" || role === "ADMIN") && (
              <Link
                href="/admin"
                onClick={handleClose}
                className="block rounded-[var(--radius-control)] px-3 py-2.5 text-sm font-medium text-[var(--color-ink)] transition-colors hover:bg-[var(--color-surface-muted)]"
              >
                {role === "ADMIN"
                  ? common?.adminDashboard || "Admin dashboard"
                  : common?.sellerDashboard || "Seller dashboard"}
              </Link>
            )}
          </nav>

          {/* Tombol untuk membuka dialog konfirmasi logout */}
          <div className="border-t border-[var(--color-line)] pt-2">
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                setShowLogoutModal(true);
              }}
              className="w-full cursor-pointer rounded-[var(--radius-control)] px-3 py-2.5 text-left text-sm text-[var(--color-danger-strong)] transition-colors hover:bg-[var(--color-danger-soft)]"
            >
              {common?.logout || "Logout"}
            </button>
          </div>
        </div>
      )}

      {/* Modal dialog konfirmasi keluar */}
      {showLogoutModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="logout-title"
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/45 p-4 backdrop-blur-[2px] animate-in fade-in duration-150"
        >
          <div className="w-full max-w-sm space-y-4 rounded-[var(--radius-card)] border border-[var(--color-line)] bg-white p-6 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="space-y-1.5">
              <h3
                id="logout-title"
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
              {/* Tombol batal */}
              <button
                type="button"
                onClick={() => setShowLogoutModal(false)}
                disabled={isLoggingOut}
                className="cursor-pointer rounded-[var(--radius-control)] border border-[var(--color-line)] bg-white px-3.5 py-2 text-xs font-medium text-[var(--color-ink)] transition-colors hover:bg-[var(--color-surface-muted)] disabled:opacity-50"
              >
                {isEn ? "Cancel" : "Batal"}
              </button>

              {/* Tombol konfirmasi keluar */}
              <button
                type="button"
                onClick={executeLogout}
                disabled={isLoggingOut}
                className="cursor-pointer rounded-[var(--radius-control)] bg-[var(--color-danger-strong)] px-4 py-2 text-xs font-semibold text-white shadow-xs transition-colors hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
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
