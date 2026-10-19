import Link from "next/link";
import type { Metadata } from "next";

import { requireAdmin } from "@/lib/auth/require-user";
import { prisma } from "@/lib/db";
import { formatIdr } from "@/lib/format/currency";
import { Container } from "@/components/ui/container";
import { archiveProductAction } from "@/modules/catalog/actions";

export const metadata: Metadata = {
  title: "Kelola Produk Saya",
};

function statusLabel(status: string) {
  if (status === "PUBLISHED") return "Published";
  if (status === "ARCHIVED") return "Archived";
  return "Draft";
}

export default async function AdminProductsPage() {
  const admin = await requireAdmin();

  // Kueri terisolasi: hanya ambil produk milik seller yang sedang login
  const products = await prisma.product.findMany({
    where: {
      OR: [{ sellerId: admin.id }, { sellerId: null }],
    },
    select: {
      id: true,
      title: true,
      slug: true,
      priceMinor: true,
      status: true,
      category: {
        select: {
          name: true,
        },
      },
    },
    orderBy: {
      updatedAt: "desc",
    },
  });

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-[var(--color-canvas)] py-8 sm:py-16 safe-bottom">
      <Container>
        {/* Breadcrumb Navigasi Android Friendly */}
        <Link
          href="/admin"
          className="inline-flex min-h-11 items-center gap-2 text-xs font-semibold text-[var(--color-accent-strong)] hover:underline"
        >
          ← Kembali ke Dashboard Admin
        </Link>

        <div className="mt-4 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-accent-strong)]">
              Katalog Toko Anda
            </p>

            <h1 className="mt-2 text-3xl font-bold tracking-tight text-[var(--color-ink)] sm:text-4xl">
              Produk Saya ({products.length})
            </h1>
          </div>

          <Link
            href="/admin/products/new"
            className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-[var(--radius-control)] bg-[var(--color-ink)] px-5 text-sm font-semibold text-white! transition-all hover:bg-[var(--color-ink-soft)] active:scale-95 sm:w-auto shadow-sm"
          >
            + Tambah Produk Baru
          </Link>
        </div>

        {/* Tabel Responsif Mobile-Scroll */}
        <div className="mobile-scroll mt-8 rounded-[var(--radius-card)] border border-[var(--color-line)] bg-white shadow-xs">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="border-b border-[var(--color-line)] bg-[var(--color-surface-muted)]">
              <tr>
                <th className="px-5 py-4 font-semibold">Produk</th>
                <th className="px-5 py-4 font-semibold">Kategori</th>
                <th className="px-5 py-4 font-semibold">Harga</th>
                <th className="px-5 py-4 font-semibold">Status</th>
                <th className="px-5 py-4 font-semibold">Aksi</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[var(--color-line)]">
              {products.map((product) => (
                <tr
                  key={product.id}
                  className="hover:bg-stone-50/50 transition-colors"
                >
                  <td className="px-5 py-4">
                    <p className="font-medium text-[var(--color-ink)]">
                      {product.title}
                    </p>
                    <p className="mt-0.5 text-xs text-[var(--color-text-muted)]">
                      /{product.slug}
                    </p>
                  </td>

                  <td className="px-5 py-4 text-[var(--color-text-muted)]">
                    {product.category.name}
                  </td>

                  <td className="px-5 py-4 font-medium text-[var(--color-ink)]">
                    {formatIdr(product.priceMinor)}
                  </td>

                  <td className="px-5 py-4">
                    <span className="inline-flex rounded-full bg-[var(--color-surface-muted)] px-2.5 py-1 text-xs font-medium">
                      {statusLabel(product.status)}
                    </span>
                  </td>

                  <td className="px-5 py-4">
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                      <Link
                        href={`/admin/products/${product.id}/edit`}
                        className="font-medium text-[var(--color-accent-strong)] hover:underline"
                      >
                        Edit
                      </Link>

                      <Link
                        href={`/admin/products/${product.id}/assets`}
                        className="font-medium text-[var(--color-ink)] hover:underline"
                      >
                        Aset Digital
                      </Link>

                      {product.status !== "ARCHIVED" && (
                        <form action={archiveProductAction}>
                          <input
                            type="hidden"
                            name="productId"
                            value={product.id}
                          />

                          <button
                            type="submit"
                            className="font-medium text-[var(--color-danger-strong)] hover:underline cursor-pointer"
                          >
                            Arsipkan
                          </button>
                        </form>
                      )}
                    </div>
                  </td>
                </tr>
              ))}

              {products.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-5 py-12 text-center text-sm text-[var(--color-text-muted)]"
                  >
                    Belum ada produk yang Anda buat. Silakan tambahkan produk
                    baru.
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
