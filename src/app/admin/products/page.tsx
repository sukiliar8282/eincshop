import Link from "next/link";
import type { Metadata } from "next";

import { requireAdmin } from "@/lib/auth/require-user";
import { prisma } from "@/lib/db";
import { formatIdr } from "@/lib/format/currency";
import { Container } from "@/components/ui/container";
import { archiveProductAction } from "@/modules/catalog/actions";

export const metadata: Metadata = {
  title: "Manage Products",
};

function statusLabel(status: string) {
  if (status === "PUBLISHED") return "Published";
  if (status === "ARCHIVED") return "Archived";
  return "Draft";
}

export default async function AdminProductsPage() {
  await requireAdmin();

  const products = await prisma.product.findMany({
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
    <main className="py-16 sm:py-24">
      <Container>
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.16em] text-[var(--color-accent-strong)]">
              Admin catalog
            </p>

            <h1 className="mt-4 text-4xl font-semibold tracking-[-0.04em] text-[var(--color-ink)]">
              Products
            </h1>
          </div>

          <Link
            href="/admin/products/new"
            className="inline-flex min-h-11 w-full items-center justify-center rounded-[var(--radius-control)] border border-[var(--color-line)] bg-white px-4 text-sm font-medium text-black hover:bg-stone-50 sm:w-auto"
          >
            New product
          </Link>
        </div>

        <div className="mobile-scroll mt-8 rounded-[var(--radius-card)] border border-[var(--color-line)] bg-white">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="border-b border-[var(--color-line)] bg-[var(--color-surface-muted)]">
              <tr>
                <th className="px-5 py-4 font-semibold">Product</th>
                <th className="px-5 py-4 font-semibold">Category</th>
                <th className="px-5 py-4 font-semibold">Price</th>
                <th className="px-5 py-4 font-semibold">Status</th>
                <th className="px-5 py-4 font-semibold">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[var(--color-line)]">
              {products.map((product) => (
                <tr key={product.id}>
                  <td className="px-5 py-4">
                    <p className="font-medium text-[var(--color-ink)]">
                      {product.title}
                    </p>
                    <p className="mt-1 text-xs text-[var(--color-text-muted)]">
                      /{product.slug}
                    </p>
                  </td>

                  <td className="px-5 py-4 text-[var(--color-text-muted)]">
                    {product.category.name}
                  </td>

                  <td className="px-5 py-4 text-[var(--color-text-muted)]">
                    {formatIdr(product.priceMinor)}
                  </td>

                  <td className="px-5 py-4">
                    <span className="rounded-full bg-[var(--color-surface-muted)] px-2.5 py-1 text-xs font-medium">
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
                        Assets
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
                            className="font-medium text-[var(--color-danger-strong)] hover:underline"
                          >
                            Archive
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
                    className="px-5 py-10 text-center text-[var(--color-text-muted)]"
                  >
                    Belum ada product.
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
