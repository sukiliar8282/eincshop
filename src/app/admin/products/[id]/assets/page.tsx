import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { requireAdmin } from "@/lib/auth/require-user";
import { prisma } from "@/lib/db";
import { Container } from "@/components/ui/container";
import { AssetUploadForm } from "./asset-upload-form";

type ProductAssetsPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export const metadata: Metadata = {
  title: "Digital Assets",
};

function formatFileSize(bytes: number): string {
  if (bytes < 1024 * 1024) {
    return `${Math.ceil(bytes / 1024)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default async function ProductAssetsPage({
  params,
}: ProductAssetsPageProps) {
  const admin = await requireAdmin();

  const { id } = await params;

  // F-01 Tenant Isolation: Cegah penjual melihat metadata aset produk penjual lain
  const product = await prisma.product.findFirst({
    where: {
      id,
      ...(admin.role !== "ADMIN" ? { sellerId: admin.id } : {}),
    },
    select: {
      id: true,
      title: true,
      productType: true,
      digitalAssets: {
        where: {
          status: "ACTIVE",
        },
        orderBy: {
          createdAt: "desc",
        },
        select: {
          id: true,
          fileName: true,
          mimeType: true,
          fileSize: true,
          createdAt: true,
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
        <div className="max-w-3xl">
          <p className="text-sm font-medium uppercase tracking-[0.16em] text-[var(--color-accent-strong)]">
            Digital delivery foundation
          </p>

          <h1 className="mt-4 text-4xl font-semibold tracking-[-0.04em] text-[var(--color-ink)]">
            {product.title}
          </h1>

          <p className="mt-4 text-sm leading-6 text-[var(--color-text-muted)]">
            Asset disimpan secara private. Download customer belum aktif sebelum
            order dan payment tersedia.
          </p>

          <div className="mt-8">
            <AssetUploadForm productId={product.id} />
          </div>

          <div className="mt-8 overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-line)] bg-white">
            <div className="border-b border-[var(--color-line)] px-6 py-4">
              <h2 className="font-semibold text-[var(--color-ink)]">
                Active assets
              </h2>
            </div>

            <ul className="divide-y divide-[var(--color-line)]">
              {product.digitalAssets.map((asset) => (
                <li
                  key={asset.id}
                  className="flex flex-col items-start gap-3 px-6 py-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="font-medium text-[var(--color-ink)]">
                      {asset.fileName}
                    </p>
                    <p className="mt-1 text-xs text-[var(--color-text-muted)]">
                      {asset.mimeType}
                    </p>
                  </div>

                  <span className="text-sm text-[var(--color-text-muted)]">
                    {formatFileSize(asset.fileSize)}
                  </span>
                </li>
              ))}

              {product.digitalAssets.length === 0 && (
                <li className="px-6 py-8 text-sm text-[var(--color-text-muted)]">
                  Belum ada digital asset.
                </li>
              )}
            </ul>
          </div>
        </div>
      </Container>
    </main>
  );
}
