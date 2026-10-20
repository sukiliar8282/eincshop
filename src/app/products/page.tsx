import type { Metadata } from "next";

import { prisma } from "@/lib/db";
import { Container } from "@/components/ui/container";
import { ProductCard } from "@/components/product/product-card";
import { CatalogControls } from "@/components/product/catalog-controls";
import { Pagination } from "@/components/product/pagination";
import { getDictionary } from "@/lib/i18n/server";
import { localizeProduct, localizeCategoryName } from "@/lib/i18n/catalog";

export const metadata: Metadata = {
  title: "Products",
  description: "Digital products from EINCSHOP.",
};

type ProductsPageProps = {
  searchParams: Promise<{
    q?: string;
    category?: string;
    page?: string;
    sort?: string;
  }>;
};

const PAGE_SIZE = 9;

export default async function ProductsPage({
  searchParams,
}: ProductsPageProps) {
  const [{ dict, locale }, params] = await Promise.all([
    getDictionary(),
    searchParams,
  ]);

  const query = params.q?.trim() ?? "";
  const category = params.category?.trim() ?? "";

  type SortOption = "newest" | "oldest" | "price_asc" | "price_desc";

  const requestedSort = params.sort;

  const sort: SortOption =
    requestedSort === "oldest" ||
    requestedSort === "price_asc" ||
    requestedSort === "price_desc"
      ? requestedSort
      : "newest";

  const orderBy =
    sort === "price_asc"
      ? { priceMinor: "asc" as const }
      : sort === "price_desc"
        ? { priceMinor: "desc" as const }
        : sort === "oldest"
          ? { createdAt: "asc" as const }
          : { publishedAt: "desc" as const };

  const parsedPage = Number.parseInt(params.page ?? "1", 10);
  const currentPage = Number.isFinite(parsedPage) ? Math.max(parsedPage, 1) : 1;

  const where = {
    productType: "DIGITAL" as const,
    status: "PUBLISHED" as const,
    ...(query
      ? {
          OR: [
            {
              title: {
                contains: query,
                mode: "insensitive" as const,
              },
            },
            {
              description: {
                contains: query,
                mode: "insensitive" as const,
              },
            },
          ],
        }
      : {}),
    ...(category
      ? {
          category: {
            slug: category,
          },
        }
      : {}),
  };

  const [rawCategories, totalProducts, rawProducts] = await Promise.all([
    prisma.category.findMany({
      where: {
        isActive: true,
      },
      select: {
        name: true,
        slug: true,
      },
      orderBy: {
        name: "asc",
      },
    }),
    prisma.product.count({ where }),
    prisma.product.findMany({
      where,
      orderBy,
      skip: (currentPage - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      select: {
        title: true,
        slug: true,
        description: true,
        priceMinor: true,
        category: {
          select: {
            name: true,
            slug: true,
          },
        },
        images: {
          orderBy: {
            sortOrder: "asc",
          },
          take: 1,
          select: {
            url: true,
            altText: true,
          },
        },
      },
    }),
  ]);

  const categories = rawCategories.map((c) => ({
    slug: c.slug,
    name: localizeCategoryName(c.slug, c.name, locale),
  }));

  const products = rawProducts.map((p) => localizeProduct(p, locale));
  const totalPages = Math.max(Math.ceil(totalProducts / PAGE_SIZE), 1);

  return (
    <main className="py-16 sm:py-24">
      <Container>
        <div className="max-w-2xl">
          <p className="text-sm font-medium uppercase tracking-[0.16em] text-[var(--color-accent-strong)]">
            {dict.catalog.badge}
          </p>

          <h1 className="mt-4 text-4xl font-semibold tracking-[-0.04em] text-[var(--color-ink)]">
            {dict.catalog.title}
          </h1>

          <p className="mt-4 text-base leading-7 text-[var(--color-text-muted)]">
            {dict.catalog.desc}
          </p>
        </div>

        <CatalogControls
          categories={categories}
          currentQuery={query}
          currentCategory={category}
          currentSort={sort}
          dict={dict.catalog}
        />

        {products.length > 0 ? (
          <>
            <div className="animate-fade-in mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {products.map((product, index) => (
                <div
                  key={product.slug}
                  className={
                    index < 3 ? `motion-delay-${index + 1}` : undefined
                  }
                >
                  <ProductCard
                    product={{
                      ...product,
                      image: product.images[0] ?? null,
                    }}
                    locale={locale}
                  />
                </div>
              ))}
            </div>

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              query={query}
              category={category}
              sort={sort}
            />
          </>
        ) : (
          <div className="mt-10 rounded-[var(--radius-card)] border border-dashed border-[var(--color-line-strong)] p-10 text-center">
            <p className="font-medium text-[var(--color-ink)]">
              {dict.catalog.emptyTitle}
            </p>

            <p className="mt-2 text-sm text-[var(--color-text-muted)]">
              {dict.catalog.emptyDesc}
            </p>
          </div>
        )}
      </Container>
    </main>
  );
}
