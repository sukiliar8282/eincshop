import type { Metadata } from "next";

import { requireAdmin } from "@/lib/auth/require-user";
import { prisma } from "@/lib/db";
import { Container } from "@/components/ui/container";
import { ProductForm } from "../product-form";

export const metadata: Metadata = {
  title: "New Product",
};

export default async function NewProductPage() {
  await requireAdmin();

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
          <p className="text-sm font-medium uppercase tracking-[0.16em] text-[var(--color-accent-strong)]">
            Admin catalog
          </p>

          <h1 className="mt-4 text-4xl font-semibold tracking-[-0.04em] text-[var(--color-ink)]">
            New product
          </h1>

          <p className="mt-4 text-sm leading-6 text-[var(--color-text-muted)]">
            Foundation ini hanya membuat product digital tanpa image atau
            digital asset upload.
          </p>

          <div className="mt-8">
            <ProductForm categories={categories} />
          </div>
        </div>
      </Container>
    </main>
  );
}