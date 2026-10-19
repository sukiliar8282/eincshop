import type { Metadata } from "next";
import Link from "next/link";

import { requireAdmin } from "@/lib/auth/require-user";
import { formatIdr } from "@/lib/format/currency";
import { getSellerMetrics } from "@/lib/admin/seller-metrics";
import { getFinancialAnalytics } from "@/lib/admin/financial-analytics";
import { FinancialChart } from "@/components/admin/financial-chart";
import { Container } from "@/components/ui/container";

export const metadata: Metadata = {
  title: "Seller & Admin Dashboard",
  description:
    "Pusat kendali dan manajemen operasional marketplace multi-seller.",
};

export default async function AdminPage() {
  const adminUser = await requireAdmin();

  // Kueri metrik terisolasi & data analitik arus kas khusus seller yang login
  const [metrics, financialData] = await Promise.all([
    getSellerMetrics(adminUser.id),
    getFinancialAnalytics(adminUser.id),
  ]);

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-[var(--color-canvas)] py-6 sm:py-12 safe-bottom">
      <Container>
        <div className="space-y-8 sm:space-y-10">
          {/* HEADER SECTION: Informasi Akun Seller & Status Akses */}
          <div className="flex flex-col justify-between gap-4 border-b border-[var(--color-line)] pb-6 sm:flex-row sm:items-end">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center rounded-full bg-[var(--color-accent-soft)] px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-[var(--color-accent-strong)]">
                  Seller Dashboard
                </span>
                <span className="text-xs text-[var(--color-text-muted)]">
                  • Akses Terisolasi
                </span>
              </div>
              <h1 className="mt-2 text-2xl font-bold tracking-tight text-[var(--color-ink)] sm:text-4xl">
                Ringkasan Toko Anda
              </h1>
              <p className="mt-1 text-xs text-[var(--color-text-muted)] sm:text-sm">
                Masuk sebagai{" "}
                <span className="font-semibold text-[var(--color-ink)]">
                  {adminUser.name || adminUser.email}
                </span>
              </p>
            </div>

            {/* Quick Action Button: Tambah Produk Baru (Touch target 44px) */}
            <div className="flex items-center">
              <Link
                href="/admin/products/new"
                className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-[var(--radius-control)] bg-[var(--color-ink)] px-5 text-sm font-semibold text-white! transition-all hover:bg-[var(--color-ink-soft)] active:scale-95 shadow-sm sm:w-auto"
              >
                <svg
                  aria-hidden="true"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="h-4 w-4 shrink-0"
                >
                  <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
                </svg>
                Tambah Produk
              </Link>
            </div>
          </div>

          {/* KPI METRICS OVERVIEW GRID (Mobile-First / Android Optimized) */}
          <section aria-label="Metrik Ringkasan Operasional Seller">
            <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-text-muted)] mb-3">
              Performa Penjualan Anda
            </h2>

            <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
              {/* Metrik 1: Total Pendapatan Seller */}
              <div className="rounded-[var(--radius-card)] border border-[var(--color-line)] bg-white p-5 shadow-xs">
                <p className="text-xs font-medium text-[var(--color-text-muted)]">
                  Total Pendapatan (Lunas)
                </p>
                <p className="mt-2 text-2xl font-bold tracking-tight text-[var(--color-ink)]">
                  {formatIdr(metrics.totalRevenue)}
                </p>
                <p className="mt-1 text-xs text-[var(--color-success-strong)] flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-success-strong)] shrink-0" />
                  Omzet produk Anda
                </p>
              </div>

              {/* Metrik 2: Total Pesanan Terkait Produk Seller */}
              <div className="rounded-[var(--radius-card)] border border-[var(--color-line)] bg-white p-5 shadow-xs">
                <p className="text-xs font-medium text-[var(--color-text-muted)]">
                  Pesanan Produk Anda
                </p>
                <p className="mt-2 text-2xl font-bold tracking-tight text-[var(--color-ink)]">
                  {metrics.totalOrdersCount}
                </p>
                <p className="mt-1 text-xs text-[var(--color-text-muted)]">
                  {metrics.pendingOrdersCount} pesanan menunggu pembayaran
                </p>
              </div>

              {/* Metrik 3: Total Produk Milik Seller */}
              <div className="rounded-[var(--radius-card)] border border-[var(--color-line)] bg-white p-5 shadow-xs">
                <p className="text-xs font-medium text-[var(--color-text-muted)]">
                  Katalog Produk Anda
                </p>
                <p className="mt-2 text-2xl font-bold tracking-tight text-[var(--color-ink)]">
                  {metrics.totalProductsCount}
                </p>
                <p className="mt-1 text-xs text-[var(--color-text-muted)]">
                  Item milik akun Anda
                </p>
              </div>

              {/* Metrik 4: Kategori yang Digunakan */}
              <div className="rounded-[var(--radius-card)] border border-[var(--color-line)] bg-white p-5 shadow-xs">
                <p className="text-xs font-medium text-[var(--color-text-muted)]">
                  Kategori Digunakan
                </p>
                <p className="mt-2 text-2xl font-bold tracking-tight text-[var(--color-ink)]">
                  {metrics.sellerCategoriesCount}
                </p>
                <p className="mt-1 text-xs text-[var(--color-text-muted)]">
                  Kategori aktif produk Anda
                </p>
              </div>
            </div>
          </section>

          {/* FINANCIAL FLOW & ARUS KAS SECTION */}
          <FinancialChart analytics={financialData} />

          {/* ADMIN ACTION MODULES GRID */}
          <section aria-label="Modul Akses Operasional">
            <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-text-muted)] mb-3">
              Modul Manajemen & Navigasi Toko
            </h2>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {/* MODUL 1: MANAJEMEN PRODUK */}
              <div className="flex flex-col justify-between rounded-[var(--radius-card)] border border-[var(--color-line)] bg-white p-5 shadow-xs sm:p-6">
                <div>
                  <div className="flex h-11 w-11 items-center justify-center rounded-[var(--radius-control)] bg-[var(--color-surface-muted)] text-[var(--color-ink)]">
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
                        d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z"
                      />
                    </svg>
                  </div>
                  <h3 className="mt-4 text-base font-semibold text-[var(--color-ink)] sm:text-lg">
                    Katalog Produk Saya
                  </h3>
                  <p className="mt-1 text-xs leading-relaxed text-[var(--color-text-muted)]">
                    Atur produk, pasang harga, unggah berkas digital, dan kelola
                    status publikasi produk Anda.
                  </p>
                </div>

                <div className="mt-5 pt-4 border-t border-[var(--color-line)]">
                  <Link
                    href="/admin/products"
                    className="inline-flex min-h-11 w-full items-center justify-center rounded-[var(--radius-control)] border border-[var(--color-line-strong)] bg-white px-4 text-xs font-semibold text-[var(--color-ink)] transition-colors hover:bg-[var(--color-surface-muted)] active:scale-95"
                  >
                    Buka Manajemen Produk
                  </Link>
                </div>
              </div>

              {/* MODUL 2: KATEGORI */}
              <div className="flex flex-col justify-between rounded-[var(--radius-card)] border border-[var(--color-line)] bg-white p-5 shadow-xs sm:p-6">
                <div>
                  <div className="flex h-11 w-11 items-center justify-center rounded-[var(--radius-control)] bg-[var(--color-surface-muted)] text-[var(--color-ink)]">
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
                        d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M6 6h.008v.008H6V6z"
                      />
                    </svg>
                  </div>
                  <h3 className="mt-4 text-base font-semibold text-[var(--color-ink)] sm:text-lg">
                    Kategori Katalog
                  </h3>
                  <p className="mt-1 text-xs leading-relaxed text-[var(--color-text-muted)]">
                    Lihat daftar kategori produk yang tersedia di marketplace
                    untuk pengelompokan produk Anda.
                  </p>
                </div>

                <div className="mt-5 pt-4 border-t border-[var(--color-line)]">
                  <Link
                    href="/admin/categories"
                    className="inline-flex min-h-11 w-full items-center justify-center rounded-[var(--radius-control)] border border-[var(--color-line-strong)] bg-white px-4 text-xs font-semibold text-[var(--color-ink)] transition-colors hover:bg-[var(--color-surface-muted)] active:scale-95"
                  >
                    Buka Daftar Kategori
                  </Link>
                </div>
              </div>

              {/* MODUL 3: PESANAN & TRANSAKSI */}
              <div className="flex flex-col justify-between rounded-[var(--radius-card)] border border-[var(--color-line)] bg-white p-5 shadow-xs sm:p-6">
                <div>
                  <div className="flex h-11 w-11 items-center justify-center rounded-[var(--radius-control)] bg-[var(--color-surface-muted)] text-[var(--color-ink)]">
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
                        d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z"
                      />
                    </svg>
                  </div>
                  <h3 className="mt-4 text-base font-semibold text-[var(--color-ink)] sm:text-lg">
                    Pesanan & Penjualan
                  </h3>
                  <p className="mt-1 text-xs leading-relaxed text-[var(--color-text-muted)]">
                    Pantau pesanan yang masuk khusus untuk produk Anda, status
                    pembayaran, dan rincian transaksi.
                  </p>
                </div>

                <div className="mt-5 pt-4 border-t border-[var(--color-line)]">
                  <Link
                    href="/admin/orders"
                    className="inline-flex min-h-11 w-full items-center justify-center rounded-[var(--radius-control)] border border-[var(--color-line-strong)] bg-white px-4 text-xs font-semibold text-[var(--color-ink)] transition-colors hover:bg-[var(--color-surface-muted)] active:scale-95"
                  >
                    Buka Riwayat Pesanan
                  </Link>
                </div>
              </div>

              {/* MODUL 4: AUDIT LOG & KEAMANAN */}
              <div className="flex flex-col justify-between rounded-[var(--radius-card)] border border-[var(--color-line)] bg-white p-5 shadow-xs sm:p-6">
                <div>
                  <div className="flex h-11 w-11 items-center justify-center rounded-[var(--radius-control)] bg-[var(--color-surface-muted)] text-[var(--color-ink)]">
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
                  <h3 className="mt-4 text-base font-semibold text-[var(--color-ink)] sm:text-lg">
                    Audit Log & Keamanan
                  </h3>
                  <p className="mt-1 text-xs leading-relaxed text-[var(--color-text-muted)]">
                    Rekam jejak setiap aksi administratif untuk kepatuhan tata
                    kelola dan keamanan sistem.
                  </p>
                </div>

                <div className="mt-5 pt-4 border-t border-[var(--color-line)]">
                  <Link
                    href="/admin/audit-logs"
                    className="inline-flex min-h-11 w-full items-center justify-center rounded-[var(--radius-control)] border border-[var(--color-line-strong)] bg-white px-4 text-xs font-semibold text-[var(--color-ink)] transition-colors hover:bg-[var(--color-surface-muted)] active:scale-95"
                  >
                    Inspeksi Audit Log
                  </Link>
                </div>
              </div>

              {/* MODUL 5: PRATINJAU TOKO PUBLIK */}
              <div className="flex flex-col justify-between rounded-[var(--radius-card)] border border-[var(--color-line)] bg-white p-5 shadow-xs sm:p-6">
                <div>
                  <div className="flex h-11 w-11 items-center justify-center rounded-[var(--radius-control)] bg-[var(--color-surface-muted)] text-[var(--color-ink)]">
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
                        d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"
                      />
                    </svg>
                  </div>
                  <h3 className="mt-4 text-base font-semibold text-[var(--color-ink)] sm:text-lg">
                    Tampilan Publik
                  </h3>
                  <p className="mt-1 text-xs leading-relaxed text-[var(--color-text-muted)]">
                    Lihat etalase toko dari kacamata pembeli untuk memverifikasi
                    produk yang sedang aktif.
                  </p>
                </div>

                <div className="mt-5 pt-4 border-t border-[var(--color-line)]">
                  <Link
                    href="/products"
                    className="inline-flex min-h-11 w-full items-center justify-center rounded-[var(--radius-control)] border border-[var(--color-line-strong)] bg-white px-4 text-xs font-semibold text-[var(--color-ink)] transition-colors hover:bg-[var(--color-surface-muted)] active:scale-95"
                  >
                    Kunjungi Toko
                  </Link>
                </div>
              </div>

              {/* MODUL 6: PENGATURAN AKUN SELLER */}
              <div className="flex flex-col justify-between rounded-[var(--radius-card)] border border-[var(--color-line)] bg-white p-5 shadow-xs sm:p-6">
                <div>
                  <div className="flex h-11 w-11 items-center justify-center rounded-[var(--radius-control)] bg-[var(--color-surface-muted)] text-[var(--color-ink)]">
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
                        d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
                      />
                    </svg>
                  </div>
                  <h3 className="mt-4 text-base font-semibold text-[var(--color-ink)] sm:text-lg">
                    Profil Saya
                  </h3>
                  <p className="mt-1 text-xs leading-relaxed text-[var(--color-text-muted)]">
                    Akses pengaturan profil akun personal dan pusat unduhan
                    berkas Anda.
                  </p>
                </div>

                <div className="mt-5 pt-4 border-t border-[var(--color-line)]">
                  <Link
                    href="/account"
                    className="inline-flex min-h-11 w-full items-center justify-center rounded-[var(--radius-control)] border border-[var(--color-line-strong)] bg-white px-4 text-xs font-semibold text-[var(--color-ink)] transition-colors hover:bg-[var(--color-surface-muted)] active:scale-95"
                  >
                    Buka Akun Saya
                  </Link>
                </div>
              </div>
            </div>
          </section>
        </div>
      </Container>
    </main>
  );
}
