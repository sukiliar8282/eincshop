import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { requireAdmin } from "@/lib/auth/require-user";
import { prisma } from "@/lib/db";
import { Container } from "@/components/ui/container";
import { EditProductForm } from "./edit-product-form";
import Link from "next/link";

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
  await requireAdmin();

  const { id } = await params;

  const [product, categories] = await Promise.all([
    prisma.product.findUnique({
      where: {
        id,
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

  return (
    <main className="py-16 sm:py-24">
      <Container>
        <div className="max-w-3xl">
          <p className="text-sm font-medium uppercase tracking-[0.16em] text-[var(--color-accent-strong)]">
            Admin catalog
          </p>

          <h1 className="mt-4 text-4xl font-semibold tracking-[-0.04em] text-[var(--color-ink)]">
            Edit product
          </h1>

          <div className="mt-6">
            <Link
              href={`/admin/products/${product.id}/images`}
              className="inline-flex min-h-11 items-center rounded-[var(--radius-control)] border border-[var(--color-line-strong)] bg-white px-4 text-sm font-medium text-[var(--color-ink)]"
            >
              Manage product images
            </Link>
          </div>

          <div className="mt-8">
            <EditProductForm
              product={product}
              categories={categories}
              currentAsset={product.digitalAssets[0] ?? null}
            />
          </div>
        </div>
      </Container>
    </main>
  );
}
