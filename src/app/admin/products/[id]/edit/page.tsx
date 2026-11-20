import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";

import { requireAdmin } from "@/lib/auth/require-user";
import { prisma } from "@/lib/db";
import { Container } from "@/components/ui/container";
import { EditProductForm } from "./edit-product-form";
import { getDictionary } from "@/lib/i18n/server";

type EditProductPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export const metadata: Metadata = {
  title: "Edit Product",
};

export default async function EditProductPage({
  params,
}: EditProductPageProps) {
  const [admin, { locale }] = await Promise.all([
    requireAdmin(),
    getDictionary(),
  ]);

  const isEn = locale === "en";
  const { id } = await params;

  // Isolasi Kepemilikan Seller (IDOR Check) & Ambil Koleksi Foto serta Tech Stack
  const [product, categories] = await Promise.all([
    prisma.product.findFirst({
      where: {
        id,
        ...(admin.role !== "ADMIN" ? { sellerId: admin.id } : {}),
      },
      select: {
        id: true,
        title: true,
        slug: true,
        description: true,
        priceMinor: true,
        sku: true,
        categoryId: true,
        status: true,
        techStack: true,
        images: {
          orderBy: {
            sortOrder: "asc",
          },
          select: {
            id: true,
            url: true,
          },
        },
        digitalAssets: {
          where: { status: "ACTIVE" },
          orderBy: { createdAt: "desc" },
          take: 1,
          select: { fileName: true, fileSize: true },
        },
      },
    }),

    prisma.category.findMany({
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
    }),
  ]);

  if (!product) {
    notFound();
  }

  // Normalisasi URL foto untuk form edit agar thumbnail selalu tampil
  const normalizedImages = product.images.map((img) => ({
    id: img.id,
    url:
      img.url &&
      !img.url.startsWith("/catalog/") &&
      !img.url.startsWith("/api/product-images/")
        ? `/api/product-images/${img.id}`
        : img.url,
  }));

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
            {isEn ? "Edit Product" : "Edit Produk"}
          </h1>

          <p className="mt-3 text-sm leading-6 text-[var(--color-text-muted)]">
            {isEn
              ? "Update product details, pricing, assets, or publish status."
              : "Perbarui informasi produk, harga, berkas aset, atau status rilis."}
          </p>

          <div className="mt-8">
            <EditProductForm
              product={{
                ...product,
                images: normalizedImages,
                techStack: product.techStack,
              }}
              categories={categories}
              currentAsset={product.digitalAssets[0] ?? null}
              isSuperAdmin={admin.role === "ADMIN"}
            />
          </div>
        </div>
      </Container>
    </main>
  );
}