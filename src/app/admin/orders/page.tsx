import Link from "next/link";
import type { Metadata } from "next";

import { requireAdmin } from "@/lib/auth/require-user";
import { prisma } from "@/lib/db";
import { formatIdr } from "@/lib/format/currency";
import { Container } from "@/components/ui/container";
import { getDictionary } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const { locale } = await getDictionary();
  return {
    title: locale === "en" ? "Manage Store Orders" : "Kelola Pesanan Masuk",
  };
}

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
    select: { id: true },
  });
  const productIds = sellerProducts.map((p) => p.id);

  // 2. Query Item Pesanan menggunakan Direct Indexed Scalar Query
  const orderItems =
    productIds.length === 0
      ? []
      : await prisma.orderItem.findMany({
          where: {
            productId: { in: productIds },
          },
          include: {
            order: {
              select: {
                orderNumber: true,
                paymentStatus: true,
                createdAt: true,
                user: {
                  select: {
                    name: true,
                    email: true,
                  },
                },
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
        {/* Breadcrumb Navigasi Dinamis Sesuai Role (Seller vs Admin) */}
        <Link
          href="/admin"
          className="inline-flex min-h-11 items-center gap-2 text-xs font-semibold text-[var(--color-accent-strong)] hover:underline"
        >
          {admin.role === "ADMIN"
            ? isEn
              ? "← Back to Admin Dashboard"
              : "← Kembali ke Dashboard Admin"
            : isEn
              ? "← Back to Seller Dashboard"
              : "← Kembali ke Dashboard Penjual"}
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
          {orderItems.length > 0 ? (
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
                  {orderItems.map((item) => (
                    <tr
                      key={item.id}
                      className="transition-colors hover:bg-[var(--color-canvas)]"
                    >
                      <td className="px-4 py-3.5 font-mono font-medium text-[var(--color-accent-strong)]">
                        {item.order.orderNumber}
                      </td>
                      <td className="px-4 py-3.5 text-[var(--color-text-muted)]">
                        {item.order.user?.name || item.order.user?.email || "-"}
                      </td>
                      <td className="px-4 py-3.5 font-medium text-[var(--color-ink)] max-w-xs truncate">
                        {item.productTitle} × {item.quantity}
                      </td>
                      <td className="px-4 py-3.5 font-semibold text-[var(--color-ink)]">
                        {formatIdr(item.lineTotalMinor, locale)}
                      </td>
                      <td className="px-4 py-3.5">
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold ${
                            item.order.paymentStatus === "PAID"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : "bg-amber-50 text-amber-700 border border-amber-200"
                          }`}
                        >
                          {item.order.paymentStatus}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-[var(--color-text-muted)] whitespace-nowrap">
                        {item.order.createdAt.toLocaleDateString(
                          isEn ? "en-US" : "id-ID",
                          {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          },
                        )}
                      </td>
                    </tr>
                  ))}
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
                  strokeWidth="1.5"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
                  />
                </svg>
              </div>
              <h3 className="mt-2 text-sm font-semibold text-[var(--color-ink)]">
                {isEn ? "No order activity yet" : "Belum ada aktivitas pesanan"}
              </h3>
              <p className="mt-1 text-xs text-[var(--color-text-muted)]">
                {isEn
                  ? "Orders for your items will automatically be recorded here once paid."
                  : "Pesanan masuk untuk item toko Anda akan otomatis tercatat di sini setelah pembeli melakukan pembayaran."}
              </p>
            </div>
          )}
        </div>
      </Container>
    </main>
  );
}