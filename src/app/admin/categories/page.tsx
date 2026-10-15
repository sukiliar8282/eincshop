import type { Metadata } from "next";
import { Prisma } from "@/generated/prisma";

import { requireAdmin } from "@/lib/auth/require-user";
import { prisma } from "@/lib/db";
import { Container } from "@/components/ui/container";
import { CategoryForm } from "./category-form";

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
  await requireAdmin();

  const categories = await getCategories();

  return (
    <main className="py-16 sm:py-24">
      <Container>
        <div className="max-w-4xl">
          <p className="text-sm font-medium uppercase tracking-[0.16em] text-[var(--color-accent-strong)]">
            Admin catalog
          </p>

          <h1 className="mt-4 text-4xl font-semibold tracking-[-0.04em] text-[var(--color-ink)]">
            Categories
          </h1>

          <div className="mt-8">
            <CategoryForm />
          </div>

          <div className="mt-8 overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-line)] bg-white">
            <div className="border-b border-[var(--color-line)] px-6 py-4">
              <h2 className="font-semibold text-[var(--color-ink)]">
                Kategori tersedia
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
                    {category._count.products} product
                  </span>
                </li>
              ))}

              {categories.length === 0 && (
                <li className="px-6 py-8 text-sm text-[var(--color-text-muted)]">
                  Belum ada kategori.
                </li>
              )}
            </ul>
          </div>
        </div>
      </Container>
    </main>
  );
}
