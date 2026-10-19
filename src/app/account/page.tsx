import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";

import { Container } from "@/components/ui/container";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth/require-user";

export const metadata: Metadata = {
  title: "Akun Saya",
  description: "Kelola profil dan ringkasan akun Anda.",
};

function getInitials(name?: string | null, email?: string | null): string {
  const value = name?.trim() || email?.split("@")[0] || "U";
  return value
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("id-ID", {
    month: "long",
    year: "numeric",
  }).format(date);
}

export default async function AccountPage() {
  const sessionUser = await requireUser();

  // Query live langsung dari database PostgreSQL agar data selalu realtime
  const user = await prisma.user.findUnique({
    where: { id: sessionUser.id },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      role: true,
      createdAt: true,
      _count: {
        select: {
          orders: true,
          downloadGrants: true,
        },
      },
    },
  });

  const currentUser = user ?? sessionUser;
  const memberSince = user?.createdAt ? formatDate(user.createdAt) : null;
  const orderCount = user?._count.orders ?? 0;
  const downloadCount = user?._count.downloadGrants ?? 0;
  const initials = getInitials(currentUser.name, currentUser.email);

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-[var(--color-canvas)] py-8 sm:py-16">
      <Container>
        <div className="mx-auto max-w-3xl space-y-6">
          {/* Breadcrumb / Kategori */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-accent-strong)]">
              Dashboard Akun
            </p>
            <h1 className="mt-1 text-3xl font-bold tracking-tight text-[var(--color-ink)] sm:text-4xl">
              Akun Saya
            </h1>
          </div>

          {/* MAIN PROFILE HERO CARD: [ Foto Profil ] -- [ Nama & Info ] */}
          <section
            aria-label="Profil Pengguna"
            className="relative overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-line)] bg-white p-5 shadow-sm sm:p-7"
          >
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
              {/* Kolom Kiri: Foto Profil Berdampingan dengan Nama */}
              <div className="flex items-center gap-4 sm:gap-6">
                {/* Foto Profil dengan Ring Halus */}
                <div className="group relative h-20 w-20 shrink-0 overflow-hidden rounded-full border-2 border-[var(--color-line)] bg-[var(--color-surface-muted)] shadow-inner sm:h-24 sm:w-24">
                  {currentUser.image ? (
                    <Image
                      src={`/api/profile-image?v=${encodeURIComponent(currentUser.image)}`}
                      alt={currentUser.name || "Foto profil"}
                      width={96}
                      height={96}
                      unoptimized
                      priority
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <span className="flex h-full w-full items-center justify-center bg-[var(--color-accent-soft)] text-xl font-bold text-[var(--color-accent-strong)] sm:text-2xl">
                      {initials}
                    </span>
                  )}

                  {/* Badge Edit Overlay saat Hover */}
                  <Link
                    href="/account/profile"
                    className="absolute inset-0 flex items-center justify-center bg-black/40 text-[11px] font-medium text-white opacity-0 transition-opacity group-hover:opacity-100"
                    title="Ubah foto profil"
                  >
                    Ubah
                  </Link>
                </div>

                {/* Info Nama, Email, & Badge */}
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="truncate text-xl font-bold text-[var(--color-ink)] sm:text-2xl">
                      {currentUser.name || "Pengguna"}
                    </h2>

                    {/* Badge Role */}
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold tracking-wide ${
                        currentUser.role === "ADMIN"
                          ? "bg-[var(--color-accent-soft)] text-[var(--color-accent-strong)]"
                          : "bg-[var(--color-surface-muted)] text-[var(--color-ink)]"
                      }`}
                    >
                      {currentUser.role === "ADMIN" ? "ADMIN" : "MEMBER"}
                    </span>
                  </div>

                  <p className="mt-1 truncate text-sm text-[var(--color-text-muted)]">
                    {currentUser.email}
                  </p>

                  {memberSince && (
                    <p className="mt-2 text-xs text-[var(--color-text-muted)]">
                      Bergabung sejak{" "}
                      <span className="font-medium text-[var(--color-ink)]">
                        {memberSince}
                      </span>
                    </p>
                  )}
                </div>
              </div>

              {/* Kolom Kanan: Tombol Edit Profil */}
              <div className="shrink-0 border-t border-[var(--color-line)] pt-4 sm:border-t-0 sm:pt-0">
                <Link
                  href="/account/profile"
                  className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-[var(--radius-control)] border border-[var(--color-line-strong)] bg-white px-5 text-sm font-semibold text-[var(--color-ink)] transition-colors hover:bg-[var(--color-surface-muted)] active:scale-95 sm:w-auto"
                >
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className="h-4 w-4 text-[var(--color-text-muted)]"
                  >
                    <path d="M5.433 13.917l1.262-3.155A4 4 0 017.58 9.42l6.92-6.918a2.121 2.121 0 013 3l-6.92 6.918c-.383.383-.84.685-1.343.882l-3.154 1.262a.5.5 0 01-.65-.65z" />
                    <path d="M3.5 5.75c0-.69.56-1.25 1.25-1.25H10A.75.75 0 0010 3H4.75A2.75 2.75 0 002 5.75v9.5A2.75 2.75 0 004.75 18h9.5A2.75 2.75 0 0017 15.25V10a.75.75 0 00-1.5 0v5.25c0 .69-.56 1.25-1.25 1.25h-9.5c-.69 0-1.25-.56-1.25-1.25v-9.5z" />
                  </svg>
                  Edit Profil
                </Link>
              </div>
            </div>
          </section>

          {/* QUICK SHORTCUT CARDS GRID */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {/* 1. Kartu Riwayat Pesanan */}
            <Link
              href="/account/orders"
              className="group flex flex-col justify-between rounded-[var(--radius-card)] border border-[var(--color-line)] bg-white p-5 transition-all hover:border-[var(--color-ink)] hover:shadow-md active:scale-[0.99]"
            >
              <div className="flex items-start justify-between">
                <div className="flex h-11 w-11 items-center justify-center rounded-[var(--radius-control)] bg-[var(--color-surface-muted)] text-[var(--color-ink)] transition-colors group-hover:bg-[var(--color-ink)] group-hover:text-white">
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.75"
                    className="h-5 w-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25c-.669 0-1.189-.578-1.119-1.243l1.263-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
                    />
                  </svg>
                </div>

                <span className="rounded-full bg-[var(--color-surface-muted)] px-2.5 py-1 text-xs font-semibold text-[var(--color-ink)]">
                  {orderCount} Pesanan
                </span>
              </div>

              <div className="mt-5">
                <h3 className="text-base font-semibold text-[var(--color-ink)]">
                  Riwayat Pesanan
                </h3>
                <p className="mt-1 text-xs text-[var(--color-text-muted)]">
                  Lacak status transaksi dan nota pembelian.
                </p>
              </div>
            </Link>

            {/* 2. Kartu Download Center (Integrasi Baru) */}
            <Link
              href="/account/downloads"
              className="group flex flex-col justify-between rounded-[var(--radius-card)] border border-[var(--color-line)] bg-white p-5 transition-all hover:border-[var(--color-ink)] hover:shadow-md active:scale-[0.99]"
            >
              <div className="flex items-start justify-between">
                <div className="flex h-11 w-11 items-center justify-center rounded-[var(--radius-control)] bg-[var(--color-surface-muted)] text-[var(--color-ink)] transition-colors group-hover:bg-[var(--color-ink)] group-hover:text-white">
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.75"
                    className="h-5 w-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"
                    />
                  </svg>
                </div>

                <span className="rounded-full bg-[var(--color-surface-muted)] px-2.5 py-1 text-xs font-semibold text-[var(--color-ink)]">
                  {downloadCount} File
                </span>
              </div>

              <div className="mt-5">
                <h3 className="text-base font-semibold text-[var(--color-ink)]">
                  Download Center
                </h3>
                <p className="mt-1 text-xs text-[var(--color-text-muted)]">
                  Unduh langsung file digital dari order yang telah
                  diverifikasi.
                </p>
              </div>
            </Link>

            {/* 3. Kartu Pengaturan Profil */}
            <Link
              href="/account/profile"
              className="group flex flex-col justify-between rounded-[var(--radius-card)] border border-[var(--color-line)] bg-white p-5 transition-all hover:border-[var(--color-ink)] hover:shadow-md active:scale-[0.99]"
            >
              <div className="flex items-start justify-between">
                <div className="flex h-11 w-11 items-center justify-center rounded-[var(--radius-control)] bg-[var(--color-surface-muted)] text-[var(--color-ink)] transition-colors group-hover:bg-[var(--color-ink)] group-hover:text-white">
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.75"
                    className="h-5 w-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
                    />
                  </svg>
                </div>

                <span className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--color-success-strong)]">
                  <span className="h-2 w-2 rounded-full bg-[var(--color-success-strong)]" />
                  Aktif
                </span>
              </div>

              <div className="mt-5">
                <h3 className="text-base font-semibold text-[var(--color-ink)]">
                  Pengaturan Profil
                </h3>
                <p className="mt-1 text-xs text-[var(--color-text-muted)]">
                  Ubah foto profil, nama tampilan, dan alamat email akun.
                </p>
              </div>
            </Link>
          </div>
        </div>
      </Container>
    </main>
  );
}
