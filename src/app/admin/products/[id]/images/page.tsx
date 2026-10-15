import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { requireAdmin } from "@/lib/auth/require-user";
import { prisma } from "@/lib/db";
import { Container } from "@/components/ui/container";
import { ImageUploadForm } from "./image-upload-form";

type ProductImagesPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export const metadata: Metadata = {
  title: "Product Images",
};

export default async function ProductImagesPage({
  params,
}: ProductImagesPageProps) {
  await requireAdmin();

  const { id } = await params;

  const product = await prisma.product.findUnique({
    where: {
      id,
    },
    select: {
      id: true,
      title: true,
      images: {
        orderBy: {
          sortOrder: "asc",
        },
        select: {
          id: true,
          url: true,
          altText: true,
          sortOrder: true,
        },
      },
    },
  });

  if (!product) {
    notFound();
  }

  return (
    <main className="py-16 sm:py-24">
      <Container>
        <div className="max-w-4xl">
          <Link
            href={`/admin/products/${product.id}/edit`}
            className="text-sm font-medium text-[var(--color-accent-strong)] hover:underline"
          >
            ← Kembali ke edit product
          </Link>

          <p className="mt-8 text-sm font-medium uppercase tracking-[0.16em] text-[var(--color-accent-strong)]">
            Catalog images
          </p>

          <h1 className="mt-4 text-4xl font-semibold tracking-[-0.04em] text-[var(--color-ink)]">
            {product.title}
          </h1>

          <p className="mt-4 text-sm leading-6 text-[var(--color-text-muted)]">
            Upload foto yang akan tampil pada catalog dan halaman detail
            product.
          </p>

          <div className="mt-8">
            <ImageUploadForm productId={product.id} />
          </div>

          <section className="mt-8 rounded-[var(--radius-card)] border border-[var(--color-line)] bg-white">
            <div className="border-b border-[var(--color-line)] px-6 py-4">
              <h2 className="font-semibold text-[var(--color-ink)]">
                Foto product
              </h2>
            </div>

            {product.images.length === 0 ? (
              <p className="px-6 py-8 text-sm text-[var(--color-text-muted)]">
                Belum ada foto product.
              </p>
            ) : (
              <div className="divide-y divide-[var(--color-line)]">
                {product.images.map((image, index) => (
                  <div
                    key={image.id}
                    className="flex flex-col items-start gap-3 px-6 py-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0">
                      <p className="font-medium text-[var(--color-ink)]">
                        {index === 0 ? "Cover utama" : `Foto ${index + 1}`}
                      </p>

                      <p className="mt-1 truncate text-sm text-[var(--color-text-muted)]">
                        {image.altText}
                      </p>
                    </div>

                    <a
                      href={image.url}
                      target="_blank"
                      rel="noreferrer"
                      className="shrink-0 text-sm font-medium text-[var(--color-accent-strong)] hover:underline"
                    >
                      Lihat foto
                    </a>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </Container>
    </main>
  );
}
