import Link from "next/link";
import type { Metadata } from "next";

import { requireAdmin } from "@/lib/auth/require-user";
import { prisma } from "@/lib/db";
import { formatIdr } from "@/lib/format/currency";
import { Container } from "@/components/ui/container";
import { getDictionary } from "@/lib/i18n/server";

export const metadata: Metadata = {
  title: "Kelola Pesanan Masuk",
};

export default async function AdminOrdersPage() {
  const [admin, { locale }] = await Promise.all([
    requireAdmin(),
    getDictionary(),
  ]);

  const isEn = locale === "en";

  // Isolasi Ketat: Hanya Super Admin yang melihat produk lama (null).
  // Seller biasa hanya melihat pesanan atas produk miliknya sendiri.
  const whereClause =
    admin.role === "ADMIN"
      ? { OR: [{ sellerId: admin.id }, { sellerId: null }] }
      : { sellerId: admin.id };

  // 1. Ambil ID produk milik seller ini
  const sellerProducts = await prisma.product.findMany({
    where: whereClause,
    select: {
      id: true,
    },
  });

  const productIds = sellerProducts.map((p) => p.id);

  // 2. Kueri pesanan terisolasi: hanya pesanan yang membeli produk milik seller ini
  const orders =
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
            orderNumber: true,
            status: true,
            paymentStatus: true,
            createdAt: true,
            user: {
              select: {
                email: true,
                name: true,
              },
            },
            // Ambil item khusus milik seller ini untuk kalkulasi omzet terisolasi
            items: {
              where: {
                productId: {
                  in: productIds,
                },
              },
              select: {
                lineTotalMinor: true,
                productTitle: true,
                quantity: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
          take: 50,
        });

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-[var(--color-canvas)] py-8 sm:py-16 safe-bottom">
      <Container>
        {/* Breadcrumb Navigasi */}
        <Link
          href="/admin"
          className="inline-flex min-h-11 items-center gap-2 text-xs font-semibold text-[var(--color-accent-strong)] hover:underline"
        >
          {isEn ? "← Back to Admin Dashboard" : "← Kembali ke Dashboard Admin"}
        </Link>

        <div className="mt-4">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-accent-strong)]">
            {isEn ? "Sales Activity" : "Aktivitas Penjualan"}
          </p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-[var(--color-ink)] sm:text-4xl">
            {isEn
              ? "Incoming Orders for Your Products"
              : "Pesanan Masuk Produk Anda"}
          </h1>
          <p className="mt-1 text-xs text-[var(--color-text-muted)] sm:text-sm">
            {isEn
              ? "List of transactions from customers specifically for catalog items owned by your account."
              : "Daftar transaksi dari pembeli khusus untuk item katalog milik akun Anda."}
          </p>
        </div>

        {/* Tabel Pesanan Terisolasi */}
        <div className="mt-8 overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-line)] bg-white shadow-xs">
          {orders.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-[var(--color-line)] bg-[var(--color-surface-muted)] text-[var(--color-text-muted)] uppercase tracking-wider font-semibold">
                  <tr>
                    <th className="px-4 py-3.5">
                      {isEn ? "Order Number" : "Nomor Order"}
                    </th>
                    <th className="px-4 py-3.5">
                      {isEn ? "Customer" : "Pembeli"}
                    </th>
                    <th className="px-4 py-3.5">
                      {isEn ? "Purchased Items" : "Item Terbeli"}
                    </th>
                    <th className="px-4 py-3.5">
                      {isEn ? "Your Net Share" : "Total Bagian Anda"}
                    </th>
                    <th className="px-4 py-3.5">
                      {isEn ? "Payment Status" : "Status Pembayaran"}
                    </th>
                    <th className="px-4 py-3.5">{isEn ? "Date" : "Tanggal"}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--color-line)]">
                  {orders.map((order) => {
                    const sellerSubtotal = order.items.reduce(
                      (acc, item) => acc + item.lineTotalMinor,
                      0,
                    );

                    return (
                      <tr
                        key={order.orderNumber}
                        className="transition-colors hover:bg-[var(--color-canvas)]"
                      >
                        <td className="px-4 py-3.5 font-mono font-semibold text-[var(--color-ink)]">
                          {order.orderNumber}
                        </td>
                        <td className="px-4 py-3.5 text-[var(--color-ink)]">
                          <p className="font-medium">
                            {order.user.name ||
                              (isEn ? "Customer" : "Pelanggan")}
                          </p>
                          <p className="text-[11px] text-[var(--color-text-muted)]">
                            {order.user.email}
                          </p>
                        </td>
                        <td className="px-4 py-3.5 text-[var(--color-text-muted)] max-w-xs">
                          {order.items.map((it, idx) => (
                            <span key={idx} className="block truncate">
                              • {it.productTitle} ({it.quantity}x)
                            </span>
                          ))}
                        </td>
                        <td className="px-4 py-3.5 font-bold text-emerald-600">
                          {formatIdr(sellerSubtotal, locale)}
                        </td>
                        <td className="px-4 py-3.5">
                          <span
                            className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold ${
                              order.paymentStatus === "PAID"
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : "bg-amber-50 text-amber-700 border border-amber-200"
                            }`}
                          >
                            {order.paymentStatus}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-[var(--color-text-muted)] whitespace-nowrap">
                          {new Date(order.createdAt).toLocaleDateString(
                            isEn ? "en-US" : "id-ID",
                            {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            },
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-16 px-4 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-surface-muted)] text-[var(--color-text-muted)]">
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                  />
                </svg>
              </div>
              <h3 className="mt-4 text-sm font-semibold text-[var(--color-ink)]">
                {isEn ? "No incoming orders yet" : "Belum ada pesanan masuk"}
              </h3>
              <p className="mt-1 text-xs text-[var(--color-text-muted)] max-w-sm mx-auto">
                {isEn
                  ? "Orders placed by buyers for your store products will automatically be logged here."
                  : "Pesanan dari pembeli untuk produk toko Anda akan tercatat di sini secara otomatis."}
              </p>
            </div>
          )}
        </div>
      </Container>
    </main>
  );
}
