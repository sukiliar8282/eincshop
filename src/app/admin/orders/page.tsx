import Link from "next/link";
import type { Metadata } from "next";

import { requireAdmin } from "@/lib/auth/require-user";
import { prisma } from "@/lib/db";
import { formatIdr } from "@/lib/format/currency";
import { Container } from "@/components/ui/container";
import { OrderStatus } from "@/components/order/order-status";

export const metadata: Metadata = {
  title: "Kelola Pesanan Seller",
};

export default async function AdminOrdersPage() {
  const admin = await requireAdmin();

  // 1. Dapatkan daftar ID produk milik seller ini
  const sellerProducts = await prisma.product.findMany({
    where: {
      OR: [{ sellerId: admin.id }, { sellerId: null }],
    },
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
                quantity: true,
                lineTotalMinor: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        });

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-[var(--color-canvas)] py-8 sm:py-16 safe-bottom">
      <Container>
        {/* Breadcrumb Navigasi */}
        <Link
          href="/admin"
          className="inline-flex min-h-11 items-center gap-2 text-xs font-semibold text-[var(--color-accent-strong)] hover:underline"
        >
          ← Kembali ke Dashboard Admin
        </Link>

        <div className="mt-4">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-accent-strong)]">
            Operasional Penjualan Anda
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight text-[var(--color-ink)] sm:text-4xl">
            Pesanan Masuk ({orders.length})
          </h1>
          <p className="mt-1 text-xs text-[var(--color-text-muted)] sm:text-sm">
            Daftar pesanan pembeli yang memuat produk milik akun toko Anda.
          </p>
        </div>

        {/* Tabel Responsif Mobile-Scroll */}
        <div className="mobile-scroll mt-8 rounded-[var(--radius-card)] border border-[var(--color-line)] bg-white shadow-xs">
          <table className="w-full min-w-[980px] text-left text-sm">
            <thead className="border-b border-[var(--color-line)] bg-[var(--color-surface-muted)]">
              <tr>
                <th className="px-5 py-4 font-semibold">Nomor Order</th>
                <th className="px-5 py-4 font-semibold">Pelanggan</th>
                <th className="px-5 py-4 font-semibold">Status Order</th>
                <th className="px-5 py-4 font-semibold">Status Pembayaran</th>
                <th className="px-5 py-4 font-semibold">Item & Omzet Anda</th>
                <th className="px-5 py-4 font-semibold">Tanggal</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[var(--color-line)]">
              {orders.map((order) => {
                const sellerPortionTotal = order.items.reduce(
                  (sum, item) => sum + item.lineTotalMinor,
                  0,
                );
                const sellerItemCount = order.items.reduce(
                  (sum, item) => sum + item.quantity,
                  0,
                );

                return (
                  <tr
                    key={order.orderNumber}
                    className="hover:bg-stone-50/50 transition-colors"
                  >
                    <td className="px-5 py-4">
                      <Link
                        href={`/orders/${order.orderNumber}`}
                        className="font-medium text-[var(--color-accent-strong)] hover:underline"
                      >
                        {order.orderNumber}
                      </Link>
                    </td>

                    <td className="px-5 py-4">
                      <p className="font-medium text-[var(--color-ink)]">
                        {order.user.name ?? "Pelanggan"}
                      </p>
                      <p className="mt-0.5 text-xs text-[var(--color-text-muted)]">
                        {order.user.email}
                      </p>
                    </td>

                    <td className="px-5 py-4">
                      <OrderStatus status={order.status} />
                    </td>

                    <td className="px-5 py-4">
                      <OrderStatus status={order.paymentStatus} />
                    </td>

                    <td className="px-5 py-4">
                      <p className="font-semibold text-[var(--color-ink)]">
                        {formatIdr(sellerPortionTotal)}
                      </p>
                      <p className="text-xs text-[var(--color-text-muted)]">
                        {sellerItemCount} item produk Anda
                      </p>
                    </td>

                    <td className="px-5 py-4 text-xs text-[var(--color-text-muted)]">
                      {order.createdAt.toLocaleDateString("id-ID", {
                        dateStyle: "medium",
                      })}
                    </td>
                  </tr>
                );
              })}

              {orders.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-5 py-12 text-center text-sm text-[var(--color-text-muted)]"
                  >
                    Belum ada pesanan yang masuk untuk produk Anda.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Container>
    </main>
  );
}
