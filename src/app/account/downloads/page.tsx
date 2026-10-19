import Link from "next/link";
import type { Metadata } from "next";

import { Container } from "@/components/ui/container";
import { requireUser } from "@/lib/auth/require-user";
import { prisma } from "@/lib/db";

export const metadata: Metadata = {
  title: "Download Center",
};

export default async function DownloadCenterPage() {
  const user = await requireUser();

  const grants = await prisma.downloadGrant.findMany({
    where: {
      userId: user.id,
      status: "ACTIVE",
      order: {
        paymentStatus: "PAID",
      },
      digitalAsset: {
        status: "ACTIVE",
      },
    },
    select: {
      id: true,
      downloadCount: true,
      order: {
        select: {
          orderNumber: true,
        },
      },
      digitalAsset: {
        select: {
          fileName: true,
          product: {
            select: {
              title: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <main className="py-16 sm:py-24">
      <Container>
        <div className="max-w-3xl">
          <p className="text-sm font-medium uppercase tracking-[0.16em] text-[var(--color-accent-strong)]">
            Account
          </p>

          <h1 className="mt-4 text-4xl font-semibold tracking-[-0.04em] text-[var(--color-ink)]">
            Download center
          </h1>

          <p className="mt-4 text-sm leading-6 text-[var(--color-text-muted)]">
            File digital dari order yang pembayarannya sudah terverifikasi.
          </p>

          {grants.length > 0 ? (
            <div className="mt-8 divide-y divide-[var(--color-line)] overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-line)] bg-white">
              {grants.map((grant) => (
                <article
                  key={grant.id}
                  className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <p className="break-words font-medium text-[var(--color-ink)]">
                      {grant.digitalAsset.product.title}
                    </p>

                    <p className="mt-1 break-all text-sm text-[var(--color-text-muted)]">
                      {grant.digitalAsset.fileName}
                    </p>

                    <p className="mt-2 text-xs text-[var(--color-text-muted)]">
                      {grant.order.orderNumber} · Diunduh {grant.downloadCount}x
                    </p>

                    {/* Order Traceability: Tautan langsung menuju rincian invoice/order */}
                    <Link
                      href={`/orders/${grant.order.orderNumber}`}
                      className="mt-3 inline-flex text-sm font-medium text-[var(--color-accent-strong)] hover:underline"
                    >
                      Lihat order →
                    </Link>
                  </div>

                  {/* Tombol Download dengan penegasan text-white! */}
                  <a
                    href={`/api/downloads/${grant.id}`}
                    className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-[var(--radius-control)] bg-[var(--color-ink)] px-4 text-sm font-medium text-white! transition-colors hover:bg-[var(--color-ink-soft)] active:scale-95"
                  >
                    Download
                  </a>
                </article>
              ))}
            </div>
          ) : (
            <div className="mt-8 rounded-[var(--radius-card)] border border-dashed border-[var(--color-line-strong)] p-8 text-center">
              <p className="font-medium text-[var(--color-ink)]">
                Belum ada file yang tersedia.
              </p>

              <Link
                href="/products"
                className="mt-4 inline-flex text-sm font-medium text-[var(--color-accent-strong)] hover:underline"
              >
                Jelajahi katalog
              </Link>
            </div>
          )}
        </div>
      </Container>
    </main>
  );
}
