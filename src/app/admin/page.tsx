import type { Metadata } from "next";
import Link from "next/link";

import { requireAdmin } from "@/lib/auth/require-user";
import { prisma } from "@/lib/db";
import { formatIdr } from "@/lib/format/currency";
import { getSellerMetrics } from "@/lib/admin/seller-metrics";
import { getFinancialAnalytics } from "@/lib/admin/financial-analytics";
import { FinancialChart } from "@/components/admin/financial-chart";
import { Container } from "@/components/ui/container";
import { getDictionary } from "@/lib/i18n/server";

export const metadata: Metadata = {
  title: "Seller & Admin Dashboard",
  description:
    "Pusat kendali dan manajemen operasional marketplace multi-seller.",
};

export default async function AdminPage() {
  const [adminUser, { locale }] = await Promise.all([
    requireAdmin(),
    getDictionary(),
  ]);

  const isEn = locale === "en";

  // Isolasi produk: Super Admin diizinkan melihat produk bawaan sistem (sellerId: null),
  // sedangkan Seller biasa hanya dapat mengakses produk miliknya sendiri.
  const productWhereClause =
    adminUser.role === "ADMIN"
      ? { OR: [{ sellerId: adminUser.id }, { sellerId: null }] }
      : { sellerId: adminUser.id };

  // Kueri metrik, data analitik keuangan, dan produk seller secara paralel
  const [metrics, financialData, sellerProducts] = await Promise.all([
    getSellerMetrics(adminUser.id, adminUser.role),
    getFinancialAnalytics(adminUser.id, adminUser.role),
    prisma.product.findMany({
      where: productWhereClause,
      select: {
        id: true,
      },
    }),
  ]);

  const productIds = sellerProducts.map((product) => product.id);

  // Kueri 5 pesanan terbaru terisolasi khusus produk seller
  const recentOrders =
    productIds.length === 0
      ? []
      : await prisma.order.findMany({
          where: {
            items: {
              some: {
                productId: {
                  in: productIds,
                },
              },
            },
          },
          select: {
            id: true,
            orderNumber: true,
            status: true,
            paymentStatus: true,
            createdAt: true,
            user: {
              select: {
                name: true,
                email: true,
              },
            },
            items: {
              where: {
                productId: {
                  in: productIds,
                },
              },
              select: {
                lineTotalMinor: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
          take: 5,
        });

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-[var(--color-canvas)] py-6 sm:py-12 safe-bottom">
      <Container>
        <div className="space-y-8 sm:space-y-10">
          {/* HEADER SECTION: Informasi Akun Seller & Status Akses */}
          <div className="flex flex-col justify-between gap-4 border-b border-[var(--color-line)] pb-6 sm:flex-row sm:items-end">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center rounded-full bg-[var(--color-accent-soft)] px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-[var(--color-accent-strong)]">
                  {adminUser.role === "ADMIN"
                    ? isEn
                      ? "Admin Dashboard"
                      : "Dashboard Admin"
                    : isEn
                      ? "Seller Dashboard"
                      : "Dashboard Penjual"}
                </span>
                <span className="text-xs text-[var(--color-text-muted)]">
                  {isEn ? "• Isolated Access" : "• Akses Terisolasi"}
                </span>
              </div>
              <h1 className="mt-2 text-2xl font-bold tracking-tight text-[var(--color-ink)] sm:text-4xl">
                {isEn ? "Your Store Overview" : "Ringkasan Toko Anda"}
              </h1>
              <p className="mt-1 text-xs text-[var(--color-text-muted)] sm:text-sm">
                {isEn ? "Signed in as" : "Masuk sebagai"}{" "}
                <span className="font-semibold text-[var(--color-ink)]">
                  {adminUser.name || adminUser.email}
                </span>
              </p>
            </div>

            {/* Quick Action Button: Tambah Produk Baru */}
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
                {isEn ? "Add Product" : "Tambah Produk"}
              </Link>
            </div>
          </div>

          {/* KPI METRICS OVERVIEW GRID (Terisolasi per Seller) */}
          <section
            aria-label={
              isEn
                ? "Seller Operational Summary Metrics"
                : "Metrik Ringkasan Operasional Seller"
            }
          >
            <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-text-muted)] mb-3">
              {isEn ? "Your Sales Performance" : "Performa Penjualan Anda"}
            </h2>

            <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
              {/* Metrik 1: Total Pendapatan Seller */}
              <div className="rounded-[var(--radius-card)] border border-[var(--color-line)] bg-white p-5 shadow-xs">
                <p className="text-xs font-medium text-[var(--color-text-muted)]">
                  {isEn
                    ? "Total Revenue (Settled)"
                    : "Total Pendapatan (Lunas)"}
                </p>
                <p className="mt-2 text-2xl font-bold tracking-tight text-[var(--color-ink)]">
                  {formatIdr(metrics.totalRevenue, locale)}
                </p>
                <p className="mt-1 text-[11px] text-[var(--color-text-muted)]">
                  {isEn
                    ? "From completed payments"
                    : "Dari pesanan yang telah dibayar"}
                </p>
              </div>

              {/* Metrik 2: Total Pesanan Masuk */}
              <div className="rounded-[var(--radius-card)] border border-[var(--color-line)] bg-white p-5 shadow-xs">
                <p className="text-xs font-medium text-[var(--color-text-muted)]">
                  {isEn ? "Total Orders" : "Total Pesanan"}
                </p>
                <p className="mt-2 text-2xl font-bold tracking-tight text-[var(--color-ink)]">
                  {metrics.totalOrdersCount}
                </p>
                <p className="mt-1 text-[11px] text-[var(--color-text-muted)]">
                  {metrics.pendingOrdersCount}{" "}
                  {isEn ? "pending payment" : "menunggu pembayaran"}
                </p>
              </div>

              {/* Metrik 3: Total Produk Terdaftar */}
              <div className="rounded-[var(--radius-card)] border border-[var(--color-line)] bg-white p-5 shadow-xs">
                <p className="text-xs font-medium text-[var(--color-text-muted)]">
                  {isEn ? "Total Products" : "Total Produk"}
                </p>
                <p className="mt-2 text-2xl font-bold tracking-tight text-[var(--color-ink)]">
                  {metrics.totalProductsCount}
                </p>
                <p className="mt-1 text-[11px] text-[var(--color-text-muted)]">
                  {isEn ? "In your catalog" : "Dalam katalog Anda"}
                </p>
              </div>

              {/* Metrik 4: Kategori Terhubung */}
              <div className="rounded-[var(--radius-card)] border border-[var(--color-line)] bg-white p-5 shadow-xs">
                <p className="text-xs font-medium text-[var(--color-text-muted)]">
                  {isEn ? "Categories Used" : "Kategori Terpakai"}
                </p>
                <p className="mt-2 text-2xl font-bold tracking-tight text-[var(--color-ink)]">
                  {metrics.sellerCategoriesCount}
                </p>
                <p className="mt-1 text-[11px] text-[var(--color-text-muted)]">
                  {isEn ? "Active categories" : "Kategori terhubung"}
                </p>
              </div>
            </div>
          </section>

          {/* ANALYTICS CHART & RECENT ACTIVITY GRID */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* GRAFIK ARUS KAS KEUANGAN */}
            <div className="lg:col-span-2">
              <FinancialChart analytics={financialData} />
            </div>

            {/* DAFTAR PESANAN TERAKHIR KHUSUS SELLER */}
            <div className="flex flex-col justify-between rounded-[var(--radius-card)] border border-[var(--color-line)] bg-white p-5 shadow-xs sm:p-6">
              <div>
                <div className="flex items-center justify-between border-b border-[var(--color-line)] pb-4">
                  <h3 className="font-semibold text-[var(--color-ink)]">
                    {isEn ? "Recent Orders" : "Pesanan Terbaru"}
                  </h3>
                  <Link
                    href="/admin/orders"
                    className="text-xs font-medium text-[var(--color-accent-strong)] hover:underline"
                  >
                    {isEn ? "View all →" : "Lihat semua →"}
                  </Link>
                </div>

                <div className="mt-4 divide-y divide-[var(--color-line)]">
                  {recentOrders.length === 0 ? (
                    <div className="py-8 text-center">
                      <p className="text-xs text-[var(--color-text-muted)]">
                        {isEn
                          ? "No incoming orders yet."
                          : "Belum ada pesanan masuk."}
                      </p>
                    </div>
                  ) : (
                    recentOrders.map((order) => {
                      const sellerOrderTotal = order.items.reduce(
                        (sum, item) => sum + item.lineTotalMinor,
                        0,
                      );
                      const customerName =
                        order.user?.name ||
                        order.user?.email ||
                        (isEn ? "Customer" : "Pelanggan");

                      return (
                        <div
                          key={order.orderNumber}
                          className="flex items-center justify-between py-3 text-xs"
                        >
                          <div className="min-w-0 pr-3">
                            <p className="font-medium text-[var(--color-ink)] truncate">
                              {order.orderNumber}
                            </p>
                            <p className="text-[11px] text-[var(--color-text-muted)] truncate">
                              {customerName}
                            </p>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="font-semibold text-[var(--color-ink)]">
                              {formatIdr(sellerOrderTotal, locale)}
                            </p>
                            <span
                              className={`inline-block mt-0.5 px-1.5 py-0.5 rounded text-[10px] font-medium ${
                                order.paymentStatus === "PAID"
                                  ? "bg-emerald-50 text-emerald-700"
                                  : "bg-amber-50 text-amber-700"
                              }`}
                            >
                              {order.paymentStatus}
                            </span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-[var(--color-line)]">
                <Link
                  href="/admin/orders"
                  className="inline-flex min-h-11 w-full items-center justify-center rounded-[var(--radius-control)] border border-[var(--color-line-strong)] bg-white px-4 text-xs font-semibold text-[var(--color-ink)] transition-colors hover:bg-[var(--color-surface-muted)] active:scale-95"
                >
                  {isEn ? "Manage All Orders" : "Kelola Semua Pesanan"}
                </Link>
              </div>
            </div>
          </div>

          {/* GRID MODUL NAVIGASI */}
          <section
            aria-label={
              isEn ? "Store Management Modules" : "Modul Manajemen Toko"
            }
          >
            <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-text-muted)] mb-4">
              {isEn
                ? "Store Management & Navigation Modules"
                : "Modul Manajemen & Navigasi Toko"}
            </h2>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {/* MODUL 1: KATALOG PRODUK SAYA */}
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
                        d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5m8.25 3v6.75m0 0l-3-3m3 3l3-3M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z"
                      />
                    </svg>
                  </div>
                  <h3 className="mt-4 text-base font-semibold text-[var(--color-ink)] sm:text-lg">
                    {isEn ? "My Product Catalog" : "Katalog Produk Saya"}
                  </h3>
                  <p className="mt-1 text-xs leading-relaxed text-[var(--color-text-muted)]">
                    {isEn
                      ? "Manage your products, set prices, upload digital assets, and control publishing status."
                      : "Atur produk, pasang harga, unggah berkas digital, dan kelola status publikasi produk Anda."}
                  </p>
                </div>

                <div className="mt-5 pt-4 border-t border-[var(--color-line)]">
                  <Link
                    href="/admin/products"
                    className="inline-flex min-h-11 w-full items-center justify-center rounded-[var(--radius-control)] border border-[var(--color-line-strong)] bg-white px-4 text-xs font-semibold text-[var(--color-ink)] transition-colors hover:bg-[var(--color-surface-muted)] active:scale-95"
                  >
                    {isEn ? "Open Product Management" : "Buka Manajemen Produk"}
                  </Link>
                </div>
              </div>

              {/* MODUL 2: PESANAN & TRANSAKSI */}
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
                    {isEn ? "Orders & Sales" : "Pesanan & Penjualan"}
                  </h3>
                  <p className="mt-1 text-xs leading-relaxed text-[var(--color-text-muted)]">
                    {isEn
                      ? "Track incoming orders for your products, payment statuses, and transaction details."
                      : "Pantau pesanan yang masuk khusus untuk produk Anda, status pembayaran, dan rincian transaksi."}
                  </p>
                </div>

                <div className="mt-5 pt-4 border-t border-[var(--color-line)]">
                  <Link
                    href="/admin/orders"
                    className="inline-flex min-h-11 w-full items-center justify-center rounded-[var(--radius-control)] border border-[var(--color-line-strong)] bg-white px-4 text-xs font-semibold text-[var(--color-ink)] transition-colors hover:bg-[var(--color-surface-muted)] active:scale-95"
                  >
                    {isEn ? "Open Order History" : "Buka Riwayat Pesanan"}
                  </Link>
                </div>
              </div>

              {/* MODUL 3: TAMPILAN PUBLIK */}
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
                    {isEn ? "Public Storefront" : "Tampilan Publik"}
                  </h3>
                  <p className="mt-1 text-xs leading-relaxed text-[var(--color-text-muted)]">
                    {isEn
                      ? "View your storefront from a customer's perspective to verify active products."
                      : "Lihat etalase toko dari kacamata pembeli untuk memverifikasi produk yang sedang aktif."}
                  </p>
                </div>

                <div className="mt-5 pt-4 border-t border-[var(--color-line)]">
                  <Link
                    href="/products"
                    className="inline-flex min-h-11 w-full items-center justify-center rounded-[var(--radius-control)] border border-[var(--color-line-strong)] bg-white px-4 text-xs font-semibold text-[var(--color-ink)] transition-colors hover:bg-[var(--color-surface-muted)] active:scale-95"
                  >
                    {isEn ? "Visit Storefront" : "Kunjungi Toko"}
                  </Link>
                </div>
              </div>

              {/* MODUL 4: PENGATURAN AKUN SELLER */}
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
                    {isEn ? "My Profile" : "Profil Saya"}
                  </h3>
                  <p className="mt-1 text-xs leading-relaxed text-[var(--color-text-muted)]">
                    {isEn
                      ? "Manage personal profile settings and access your digital asset downloads."
                      : "Akses pengaturan profil akun personal dan pusat unduhan berkas Anda."}
                  </p>
                </div>

                <div className="mt-5 pt-4 border-t border-[var(--color-line)]">
                  <Link
                    href="/account"
                    className="inline-flex min-h-11 w-full items-center justify-center rounded-[var(--radius-control)] border border-[var(--color-line-strong)] bg-white px-4 text-xs font-semibold text-[var(--color-ink)] transition-colors hover:bg-[var(--color-surface-muted)] active:scale-95"
                  >
                    {isEn ? "Open My Account" : "Buka Akun Saya"}
                  </Link>
                </div>
              </div>

              {/* MODUL 5: KATEGORI KATALOG (KHUSUS SUPER ADMIN) */}
              {adminUser.role === "ADMIN" && (
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
                      {isEn ? "Catalog Categories" : "Kategori Katalog"}
                    </h3>
                    <p className="mt-1 text-xs leading-relaxed text-[var(--color-text-muted)]">
                      {isEn
                        ? "Manage global marketplace categories to organize public catalog taxonomy."
                        : "Kelola kategori global marketplace untuk pengelompokan taksonomi katalog."}
                    </p>
                  </div>

                  <div className="mt-5 pt-4 border-t border-[var(--color-line)]">
                    <Link
                      href="/admin/categories"
                      className="inline-flex min-h-11 w-full items-center justify-center rounded-[var(--radius-control)] border border-[var(--color-line-strong)] bg-white px-4 text-xs font-semibold text-[var(--color-ink)] transition-colors hover:bg-[var(--color-surface-muted)] active:scale-95"
                    >
                      {isEn ? "Manage Categories" : "Kelola Kategori"}
                    </Link>
                  </div>
                </div>
              )}

              {/* MODUL 6: AUDIT LOG (KHUSUS SUPER ADMIN) */}
              {adminUser.role === "ADMIN" && (
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
                          d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
                        />
                      </svg>
                    </div>
                    <h3 className="mt-4 text-base font-semibold text-[var(--color-ink)] sm:text-lg">
                      {isEn ? "Audit Logs & Security" : "Audit Log & Keamanan"}
                    </h3>
                    <p className="mt-1 text-xs leading-relaxed text-[var(--color-text-muted)]">
                      {isEn
                        ? "Inspect administrative audit trails for governance compliance and system security."
                        : "Rekam jejak setiap aksi administratif untuk kepatuhan tata kelola dan keamanan sistem."}
                    </p>
                  </div>

                  <div className="mt-5 pt-4 border-t border-[var(--color-line)]">
                    <Link
                      href="/admin/audit-logs"
                      className="inline-flex min-h-11 w-full items-center justify-center rounded-[var(--radius-control)] border border-[var(--color-line-strong)] bg-white px-4 text-xs font-semibold text-[var(--color-ink)] transition-colors hover:bg-[var(--color-surface-muted)] active:scale-95"
                    >
                      {isEn ? "Inspect Audit Logs" : "Inspeksi Audit Log"}
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </section>
        </div>
      </Container>
    </main>
  );
}
