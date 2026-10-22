import Link from "next/link";
import type { Metadata } from "next";

import { requireAdmin } from "@/lib/auth/require-user";
import { prisma } from "@/lib/db";
import { formatIdr } from "@/lib/format/currency";
import { Container } from "@/components/ui/container";
import { archiveProductAction } from "@/modules/catalog/actions";
import { getDictionary } from "@/lib/i18n/server";

export const metadata: Metadata = {
  title: "Kelola Produk Saya",
};

type AdminProductsPageProps = {
  searchParams: Promise<{
    q?: string;
    status?: string;
  }>;
};

type ProductFilterStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";

function statusLabel(status: string, isEn: boolean) {
  if (status === "PUBLISHED") return isEn ? "Published" : "Published";
  if (status === "ARCHIVED") return isEn ? "Archived" : "Diarsipkan";
  return isEn ? "Draft" : "Draf";
}

export default async function AdminProductsPage({
  searchParams,
}: AdminProductsPageProps) {
  const [admin, { locale }, params] = await Promise.all([
    requireAdmin(),
    getDictionary(),
    searchParams,
  ]);

  const isEn = locale === "en";

  const query = params.q?.trim() ?? "";
  const requestedStatus = params.status;
  const status: ProductFilterStatus | "" =
    requestedStatus === "DRAFT" ||
    requestedStatus === "PUBLISHED" ||
    requestedStatus === "ARCHIVED"
      ? requestedStatus
      : "";

  // 1. Isolasi Ketat: Seller hanya melihat produk miliknya sendiri
  const isolationWhere =
    admin.role === "ADMIN"
      ? { OR: [{ sellerId: admin.id }, { sellerId: null }] }
      : { sellerId: admin.id };

  // 2. Filter Search & Status
  const filterWhere = {
    ...(query
      ? {
          OR: [
            {
              title: {
                contains: query,
                mode: "insensitive" as const,
              },
            },
            {
              slug: {
                contains: query,
                mode: "insensitive" as const,
              },
            },
          ],
        }
      : {}),
    ...(status ? { status } : {}),
  };

  // Gabungkan isolasi akun dan filter pencarian secara aman
  const where = {
    AND: [isolationWhere, filterWhere],
  };

  const products = await prisma.product.findMany({
    where,
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

        <div className="mt-4 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-accent-strong)]">
              {isEn ? "Your Store Catalog" : "Katalog Toko Anda"}
            </p>
            <h1 className="mt-2 text-2xl font-bold tracking-tight text-[var(--color-ink)] sm:text-4xl">
              {isEn ? "My Product Catalog" : "Daftar Produk Saya"}
            </h1>
            <p className="mt-1 text-xs text-[var(--color-text-muted)] sm:text-sm">
              {isEn
                ? "Manage your storefront, modify digital asset metadata, and control product availability."
                : "Kelola etalase, ubah informasi aset digital, dan atur ketersediaan produk."}
            </p>
          </div>

          <Link
            href="/admin/products/new"
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-[var(--radius-control)] bg-[var(--color-ink)] px-5 text-sm font-semibold text-white! transition-all hover:bg-[var(--color-ink-soft)] active:scale-95 shadow-sm"
          >
            {isEn ? "+ Add New Product" : "+ Tambah Produk Baru"}
          </Link>
        </div>

        {/* Form Filter & Search */}
        <form
          method="get"
          className="mt-8 grid gap-3 rounded-[var(--radius-card)] border border-[var(--color-line)] bg-white p-4 sm:grid-cols-[1fr_220px_auto]"
        >
          <input
            name="q"
            type="search"
            defaultValue={query}
            placeholder={
              isEn
                ? "Search product name or slug..."
                : "Cari nama atau slug product..."
            }
            className="min-h-11 rounded-[var(--radius-control)] border border-[var(--color-line-strong)] px-3 text-sm"
          />

          <select
            name="status"
            defaultValue={status}
            className="min-h-11 rounded-[var(--radius-control)] border border-[var(--color-line-strong)] bg-white px-3 text-sm"
          >
            <option value="">{isEn ? "All status" : "Semua status"}</option>
            <option value="DRAFT">Draft</option>
            <option value="PUBLISHED">Published</option>
            <option value="ARCHIVED">{isEn ? "Archived" : "Diarsipkan"}</option>
          </select>

          <button
            type="submit"
            className="min-h-11 rounded-[var(--radius-control)] bg-[var(--color-ink)] px-4 text-sm font-medium text-white transition-opacity hover:opacity-90 cursor-pointer"
          >
            Filter
          </button>
        </form>

        {/* Tabel / Card Grid Produk Terisolasi */}
        <div className="mt-6 overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-line)] bg-white shadow-xs">
          {products.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-[var(--color-line)] bg-[var(--color-surface-muted)] text-[var(--color-text-muted)] uppercase tracking-wider font-semibold">
                  <tr>
                    <th className="px-4 py-3.5">
                      {isEn ? "Product Name" : "Nama Produk"}
                    </th>
                    <th className="px-4 py-3.5">
                      {isEn ? "Category" : "Kategori"}
                    </th>
                    <th className="px-4 py-3.5">{isEn ? "Price" : "Harga"}</th>
                    <th className="px-4 py-3.5">
                      {isEn ? "Status" : "Status"}
                    </th>
                    <th className="px-4 py-3.5 text-right">
                      {isEn ? "Action" : "Aksi"}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--color-line)]">
                  {products.map((product) => (
                    <tr
                      key={product.id}
                      className="transition-colors hover:bg-[var(--color-canvas)]"
                    >
                      <td className="px-4 py-3.5 font-medium text-[var(--color-ink)] max-w-xs truncate">
                        {product.title}
                      </td>
                      <td className="px-4 py-3.5 text-[var(--color-text-muted)]">
                        {product.category?.name ||
                          (isEn ? "Uncategorized" : "Tanpa Kategori")}
                      </td>
                      <td className="px-4 py-3.5 font-semibold text-[var(--color-ink)]">
                        {formatIdr(product.priceMinor, locale)}
                      </td>
                      <td className="px-4 py-3.5">
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold ${
                            product.status === "PUBLISHED"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : product.status === "ARCHIVED"
                                ? "bg-gray-100 text-gray-700 border border-gray-200"
                                : "bg-amber-50 text-amber-700 border border-amber-200"
                          }`}
                        >
                          {statusLabel(product.status, isEn)}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-2">
                          <Link
                            href={`/admin/products/${product.id}/edit`}
                            className="inline-flex min-h-9 items-center justify-center rounded-[var(--radius-control)] border border-[var(--color-line)] bg-white px-3 text-xs font-semibold text-[var(--color-ink)] transition-colors hover:bg-[var(--color-surface-muted)]"
                          >
                            {isEn ? "Edit" : "Edit"}
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
                                className="inline-flex min-h-9 items-center justify-center rounded-[var(--radius-control)] border border-rose-200 bg-rose-50 px-3 text-xs font-semibold text-rose-700 transition-colors hover:bg-rose-100 cursor-pointer"
                              >
                                {isEn ? "Archive" : "Arsipkan"}
                              </button>
                            </form>
                          )}
                        </div>
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
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                  />
                </svg>
              </div>
              <h3 className="mt-4 text-sm font-semibold text-[var(--color-ink)]">
                {query || status
                  ? isEn
                    ? "No products match your filter"
                    : "Tidak ada produk yang cocok dengan pencarian"
                  : isEn
                    ? "No products in your store yet"
                    : "Belum ada produk di toko Anda"}
              </h3>
              <p className="mt-1 text-xs text-[var(--color-text-muted)] max-w-sm mx-auto">
                {query || status
                  ? isEn
                    ? "Try clearing the search query or status filter to see other products."
                    : "Coba kosongkan kata kunci pencarian atau ubah filter status untuk melihat produk lainnya."
                  : isEn
                    ? "Your store catalog is currently empty. Start adding your first digital product to begin selling."
                    : "Katalog toko Anda saat ini masih kosong. Mulailah menambahkan produk digital pertama Anda untuk mulai berjualan."}
              </p>
              <div className="mt-6 flex justify-center gap-3">
                {query || status ? (
                  <Link
                    href="/admin/products"
                    className="inline-flex min-h-11 items-center justify-center rounded-[var(--radius-control)] border border-[var(--color-line)] bg-white px-4 text-sm font-semibold text-[var(--color-ink)] hover:bg-[var(--color-surface-muted)]"
                  >
                    {isEn ? "Reset Filter" : "Reset Filter"}
                  </Link>
                ) : (
                  <Link
                    href="/admin/products/new"
                    className="inline-flex min-h-11 items-center justify-center rounded-[var(--radius-control)] bg-[var(--color-ink)] px-5 text-sm font-semibold text-white! transition-all hover:bg-[var(--color-ink-soft)] active:scale-95"
                  >
                    {isEn
                      ? "Add Your First Product"
                      : "Tambah Produk Pertama Anda"}
                  </Link>
                )}
              </div>
            </div>
          )}
        </div>
      </Container>
    </main>
  );
}
