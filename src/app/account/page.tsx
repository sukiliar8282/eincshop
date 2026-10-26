import Link from "next/link";
import type { Metadata } from "next";

import { Container } from "@/components/ui/container";
import { UserAvatar } from "@/components/ui/user-avatar";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth/require-user";
import { getDictionary } from "@/lib/i18n/server";

export const metadata: Metadata = {
  title: "Akun Saya",
  description: "Kelola profil dan ringkasan akun Anda.",
};

function formatDate(date: Date, locale: string): string {
  return new Intl.DateTimeFormat(locale === "en" ? "en-US" : "id-ID", {
    month: "long",
    year: "numeric",
  }).format(date);
}

export default async function AccountPage() {
  const [sessionUser, { dict, locale }] = await Promise.all([
    requireUser(),
    getDictionary(),
  ]);

  // Query live langsung dari database PostgreSQL agar data selalu realtime
  const user = await prisma.user.findUnique({
    where: { id: sessionUser.id },
    select: {
      id: true,
      name: true,
      storeName: true,
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
  const memberSince = user?.createdAt
    ? formatDate(user.createdAt, locale)
    : null;
  const orderCount = user?._count.orders ?? 0;
  const downloadCount = user?._count.downloadGrants ?? 0;

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-[var(--color-canvas)] py-8 sm:py-16">
      <Container>
        <div className="mx-auto max-w-3xl space-y-6">
          {/* Breadcrumb / Kategori */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-accent-strong)]">
              {dict.account.dashboard}
            </p>
            <h1 className="mt-1 text-3xl font-bold tracking-tight text-[var(--color-ink)] sm:text-4xl">
              {dict.account.title}
            </h1>
          </div>

          {/* MAIN PROFILE HERO CARD: [ Foto Profil ] -- [ Nama & Info ] */}
          <section
            aria-label={dict.account.profileCardAria}
            className="relative overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-line)] bg-white p-5 shadow-sm sm:p-7"
          >
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
              {/* Kolom Kiri: Foto Profil Berdampingan dengan Nama */}
              <div className="flex items-center gap-4 sm:gap-6">
                <div className="group relative shrink-0">
                  <UserAvatar
                    name={currentUser.name}
                    email={currentUser.email}
                    image={currentUser.image}
                    size="xl"
                    priority
                  />

                  {/* Badge Edit Overlay saat Hover */}
                  <Link
                    href="/account/profile"
                    className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 text-[11px] font-medium text-white opacity-0 transition-opacity group-hover:opacity-100"
                    title={dict.account.changePhoto}
                  >
                    {dict.common.change}
                  </Link>
                </div>

                {/* Info Nama, Email, & Badge */}
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="truncate text-xl font-bold text-[var(--color-ink)] sm:text-2xl">
                      {currentUser.name || dict.common.user}
                    </h2>

                    {/* Badge Role */}
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold tracking-wide ${
                        currentUser.role === "ADMIN"
                          ? "bg-[var(--color-accent-soft)] text-[var(--color-accent-strong)]"
                          : "bg-[var(--color-surface-muted)] text-[var(--color-ink)]"
                      }`}
                    >
                      {currentUser.role === "ADMIN"
                        ? dict.common.admin
                        : currentUser.role === "SELLER"
                          ? dict.common.seller
                          : dict.common.member}
                    </span>
                  </div>

                  <p className="mt-1 truncate text-sm text-[var(--color-text-muted)]">
                    {currentUser.email}
                  </p>

                  {memberSince && (
                    <p className="mt-2 text-xs text-[var(--color-text-muted)]">
                      {dict.account.memberSince}{" "}
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
                  {dict.account.editProfile}
                </Link>
              </div>
            </div>
          </section>

          {/* QUICK SHORTCUT CARDS GRID */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {/* Kartu Riwayat Pesanan */}
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
                  {dict.account.ordersCount.replace(
                    "{{count}}",
                    String(orderCount),
                  )}
                </span>
              </div>

              <div className="mt-5">
                <h3 className="text-base font-semibold text-[var(--color-ink)]">
                  {dict.account.ordersTitle}
                </h3>
                <p className="mt-1 text-xs text-[var(--color-text-muted)]">
                  {dict.account.ordersDesc}
                </p>
              </div>
            </Link>

            {/* Kartu Pusat Unduhan */}
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
                  {dict.account.downloadsCount.replace(
                    "{{count}}",
                    String(downloadCount),
                  )}
                </span>
              </div>

              <div className="mt-5">
                <h3 className="text-base font-semibold text-[var(--color-ink)]">
                  {dict.account.downloadsTitle}
                </h3>
                <p className="mt-1 text-xs text-[var(--color-text-muted)]">
                  {dict.account.downloadsDesc}
                </p>
              </div>
            </Link>

            {/* Kartu Pengaturan Akun & Zona Bahaya */}
            <Link
              href="/account/settings"
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
                      d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                </div>

                <span className="rounded-full bg-[var(--color-surface-muted)] px-2.5 py-1 text-xs font-semibold text-[var(--color-ink)]">
                  {locale === "en" ? "Security" : "Keamanan"}
                </span>
              </div>

              <div className="mt-5">
                <h3 className="text-base font-semibold text-[var(--color-ink)]">
                  {locale === "en" ? "Account Settings" : "Pengaturan Akun"}
                </h3>
                <p className="mt-1 text-xs text-[var(--color-text-muted)]">
                  {locale === "en"
                    ? "Security, preferences, and danger zone."
                    : "Keamanan akun dan zona bahaya."}
                </p>
              </div>
            </Link>
          </div>
        </div>
      </Container>
    </main>
  );
}
