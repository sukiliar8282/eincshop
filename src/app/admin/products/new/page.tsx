import type { Metadata } from "next";
import Link from "next/link";

import { requireAdmin } from "@/lib/auth/require-user";
import { prisma } from "@/lib/db";
import { Container } from "@/components/ui/container";
import { ProductForm } from "../product-form";
import { getDictionary } from "@/lib/i18n/server";

export const metadata: Metadata = {
  title: "New Product",
};

export default async function NewProductPage() {
  const [admin, { locale }] = await Promise.all([
    requireAdmin(),
    getDictionary(),
  ]);

  const isEn = locale === "en";

  const categories = await prisma.category.findMany({
    where: {
      isActive: true,
    },
    select: {
      id: true,
      name: true,
    },
    orderBy: {
      name: "asc",
    },
  });

  return (
    <main className="py-16 sm:py-24">
      <Container>
        <div className="max-w-3xl">
          {/* Breadcrumb Navigasi Dwibahasa */}
          <Link
            href="/admin/products"
            className="inline-flex min-h-11 items-center gap-2 text-xs font-semibold text-[var(--color-accent-strong)] hover:underline mb-2"
          >
            {isEn ? "← Back to Products" : "← Kembali ke Daftar Produk"}
          </Link>

          <p className="text-sm font-medium uppercase tracking-[0.16em] text-[var(--color-accent-strong)]">
            {isEn ? "Store Catalog" : "Katalog Toko"}
          </p>

          <h1 className="mt-4 text-4xl font-semibold tracking-[-0.04em] text-[var(--color-ink)]">
            {isEn ? "Add New Product" : "Tambah Produk Baru"}
          </h1>

          <p className="mt-4 text-sm leading-6 text-[var(--color-text-muted)]">
            {isEn
              ? "Create a digital product, upload cover photos, set pricing in IDR, and attach downloadable files."
              : "Buat produk digital, unggah foto sampul, tentukan harga dalam Rupiah, dan lampirkan berkas yang dapat diunduh."}
          </p>

          <div className="mt-8">
            <ProductForm
              categories={categories}
              isSuperAdmin={admin.role === "ADMIN"}
            />
          </div>
        </div>
      </Container>
    </main>
  );
}
