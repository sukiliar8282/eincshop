import Link from "next/link";
import type { Metadata } from "next";
import { Prisma } from "@/generated/prisma";

import { requireAdmin } from "@/lib/auth/require-user";
import { prisma } from "@/lib/db";
import { Container } from "@/components/ui/container";
import { CategoryForm } from "./category-form";
import { getDictionary } from "@/lib/i18n/server";

export const metadata: Metadata = {
  title: "Categories",
};

// Helper type otomatis dari query Prisma
type CategoryWithCount = Prisma.PromiseReturnType<typeof getCategories>[number];

async function getCategories() {
  return prisma.category.findMany({
    orderBy: {
      name: "asc",
    },
    include: {
      _count: {
        select: {
          products: true,
        },
      },
    },
  });
}

export default async function AdminCategoriesPage() {
  const [, { locale }] = await Promise.all([requireAdmin(), getDictionary()]);

  const isEn = locale === "en";
  const categories = await getCategories();

  return (
    <main className="py-16 sm:py-24">
      <Container>
        <div className="max-w-4xl">
          {/* Breadcrumb Navigasi */}
          <Link
            href="/admin"
            className="inline-flex min-h-11 items-center gap-2 text-xs font-semibold text-[var(--color-accent-strong)] hover:underline mb-2"
          >
            {isEn
              ? "← Back to Admin Dashboard"
              : "← Kembali ke Dashboard Admin"}
          </Link>

          <p className="text-sm font-medium uppercase tracking-[0.16em] text-[var(--color-accent-strong)]">
            {isEn ? "Admin Catalog" : "Katalog Admin"}
          </p>

          <h1 className="mt-4 text-4xl font-semibold tracking-[-0.04em] text-[var(--color-ink)]">
            {isEn ? "Categories" : "Kategori"}
          </h1>

          <div className="mt-8">
            <CategoryForm />
          </div>

          <div className="mt-8 overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-line)] bg-white">
            <div className="border-b border-[var(--color-line)] px-6 py-4">
              <h2 className="font-semibold text-[var(--color-ink)]">
                {isEn ? "Available Categories" : "Kategori tersedia"}
              </h2>
            </div>

            <ul className="divide-y divide-[var(--color-line)]">
              {categories.map((category: CategoryWithCount) => (
                <li
                  key={category.id}
                  className="flex flex-col items-start justify-between gap-2 px-6 py-4 sm:flex-row sm:items-center sm:gap-4"
                >
                  <div>
                    <p className="font-medium text-[var(--color-ink)]">
                      {category.name}
                    </p>
                    <p className="text-sm text-[var(--color-text-muted)]">
                      /{category.slug}
                    </p>
                  </div>

                  <span className="text-sm text-[var(--color-text-muted)] sm:shrink-0">
                    {category._count.products} {isEn ? "products" : "produk"}
                  </span>
                </li>
              ))}

              {categories.length === 0 && (
                <li className="px-6 py-8 text-sm text-[var(--color-text-muted)]">
                  {isEn
                    ? "No categories available yet."
                    : "Belum ada kategori."}
                </li>
              )}
            </ul>
          </div>
        </div>
      </Container>
    </main>
  );
}
