import Link from "next/link";

import { Button, ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { ProductCard } from "@/components/product/product-card";
import { prisma } from "@/lib/db";
import { getDictionary } from "@/lib/i18n/server";
import { formatIdr } from "@/lib/format/currency";
import { localizeProduct } from "@/lib/i18n/catalog";

export default async function HomePage() {
  const [{ dict, locale }, rawFeaturedProducts] = await Promise.all([
    getDictionary(),
    prisma.product.findMany({
      where: {
        status: "PUBLISHED",
        productType: "DIGITAL",
      },
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
      orderBy: {
        publishedAt: "desc",
      },
      take: 3,
    }),
  ]);

  const featuredProducts = rawFeaturedProducts.map((p) =>
    localizeProduct(p, locale),
  );
  const spotlightProduct = featuredProducts[0];
  const h = dict.home;

  return (
    <>
      <section className="border-b border-[var(--color-line)] bg-[var(--color-canvas)]">
        <Container className="py-12 sm:py-16 lg:py-20">
          <div className="grid items-start gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
            <div className="pt-2 lg:pt-6">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-accent-strong)]">
                {h.badge}
              </p>

              <h1 className="mt-5 max-w-3xl text-4xl font-semibold leading-[1.04] tracking-[-0.05em] text-[var(--color-ink)] sm:text-5xl lg:text-6xl">
                {h.heroTitle}
              </h1>

              <p className="mt-6 max-w-xl text-base leading-7 text-[var(--color-text-muted)]">
                {h.heroSubtitle}
              </p>

              <form
                action="/products"
                method="GET"
                className="mt-8 flex max-w-lg flex-col gap-2 sm:flex-row"
              >
                <label className="sr-only" htmlFor="homepage-search">
                  {h.searchBtn}
                </label>

                <input
                  id="homepage-search"
                  type="search"
                  name="q"
                  placeholder={h.searchPlaceholder}
                  className="min-h-11 flex-1 rounded-[var(--radius-control)] border border-[var(--color-line-strong)] bg-white px-4 text-sm text-[var(--color-ink)] placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-ink)] focus:outline-none"
                />

                <Button type="submit" size="md">
                  {h.searchBtn}
                </Button>
              </form>

              <div className="mt-5 flex flex-wrap gap-2">
                <Link
                  href="/products"
                  className="rounded-full border border-[var(--color-line-strong)] bg-white px-3 py-1.5 text-xs font-medium text-[var(--color-ink)] transition-transform duration-150 hover:border-[var(--color-ink)] active:scale-95"
                >
                  {h.categories.all}
                </Link>

                <Link
                  href="/products?category=templates"
                  className="rounded-full border border-[var(--color-line)] bg-white/60 px-3 py-1.5 text-xs text-[var(--color-text-muted)] transition-all duration-150 hover:border-[var(--color-line-strong)] hover:text-[var(--color-ink)] active:scale-95"
                >
                  {h.categories.templates}
                </Link>

                <Link
                  href="/products?category=ui-kit"
                  className="rounded-full border border-[var(--color-line)] bg-white/60 px-3 py-1.5 text-xs text-[var(--color-text-muted)] transition-all duration-150 hover:border-[var(--color-line-strong)] hover:text-[var(--color-ink)] active:scale-95"
                >
                  {h.categories.uiKit}
                </Link>

                <Link
                  href="/products?category=code"
                  className="rounded-full border border-[var(--color-line)] bg-white/60 px-3 py-1.5 text-xs text-[var(--color-text-muted)] transition-all duration-150 hover:border-[var(--color-line-strong)] hover:text-[var(--color-ink)] active:scale-95"
                >
                  {h.categories.code}
                </Link>
              </div>
            </div>

            {/* Spotlight Card */}
            <div className="rounded-[var(--radius-card)] border border-[var(--color-line)] bg-white p-5 shadow-[var(--shadow-soft)] sm:p-6">
              <div className="flex items-center justify-between border-b border-[var(--color-line)] pb-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-accent-strong)]">
                    {h.spotlight.badge}
                  </p>

                  <p className="mt-1 text-xs text-[var(--color-text-muted)]">
                    {h.spotlight.subtitle}
                  </p>
                </div>

                <span className="text-xs text-[var(--color-text-muted)]">
                  01
                </span>
              </div>

              {spotlightProduct ? (
                <div className="pt-5">
                  {spotlightProduct.images[0]?.url ? (
                    <div className="relative aspect-[4/3] overflow-hidden rounded-[var(--radius-image)] bg-[var(--color-surface-muted)]">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={spotlightProduct.images[0].url}
                        alt={
                          spotlightProduct.images[0].altText ??
                          spotlightProduct.title
                        }
                        className="h-full w-full object-cover object-top transition-transform duration-300 hover:scale-[1.02]"
                      />
                    </div>
                  ) : (
                    <div className="flex aspect-[4/3] items-end rounded-[var(--radius-image)] bg-[var(--color-surface-muted)] p-5">
                      <span className="text-xs font-medium uppercase tracking-[0.12em] text-[var(--color-text-muted)]">
                        {h.spotlight.preview}
                      </span>
                    </div>
                  )}

                  <div className="mt-5">
                    <p className="text-xs text-[var(--color-text-muted)]">
                      {spotlightProduct.category?.name ??
                        (locale === "en"
                          ? "Digital product"
                          : "Produk digital")}
                    </p>

                    <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-[var(--color-ink)]">
                      {spotlightProduct.title}
                    </h2>

                    <p className="mt-2 line-clamp-2 text-sm leading-6 text-[var(--color-text-muted)]">
                      {spotlightProduct.description}
                    </p>

                    <div className="mt-5 flex items-center justify-between gap-4 border-t border-[var(--color-line)] pt-4">
                      <div>
                        <p className="text-xs text-[var(--color-text-muted)]">
                          {dict.common.startingFrom}
                        </p>

                        <p className="mt-1 font-semibold text-[var(--color-ink)]">
                          {formatIdr(spotlightProduct.priceMinor, locale)}
                        </p>
                      </div>

                      <ButtonLink
                        href={`/products/${spotlightProduct.slug}`}
                        size="sm"
                        className="text-white! hover:text-white"
                      >
                        {dict.common.viewProduct}
                      </ButtonLink>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="py-16 text-center text-sm text-[var(--color-text-muted)]">
                  {h.spotlight.empty}
                </div>
              )}
            </div>
          </div>
        </Container>
      </section>

      {/* 3 Value Propositions */}
      <section className="border-b border-[var(--color-line)] bg-white">
        <Container className="grid gap-6 py-7 sm:grid-cols-3 sm:gap-8">
          <div>
            <p className="text-sm font-semibold text-[var(--color-ink)]">
              {h.features.f1Title}
            </p>
            <p className="mt-1 text-sm leading-6 text-[var(--color-text-muted)]">
              {h.features.f1Desc}
            </p>
          </div>

          <div>
            <p className="text-sm font-semibold text-[var(--color-ink)]">
              {h.features.f2Title}
            </p>
            <p className="mt-1 text-sm leading-6 text-[var(--color-text-muted)]">
              {h.features.f2Desc}
            </p>
          </div>

          <div>
            <p className="text-sm font-semibold text-[var(--color-ink)]">
              {h.features.f3Title}
            </p>
            <p className="mt-1 text-sm leading-6 text-[var(--color-text-muted)]">
              {h.features.f3Desc}
            </p>
          </div>
        </Container>
      </section>

      {/* Featured Catalog Section */}
      <section id="featured" className="py-14 sm:py-20">
        <Container>
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-accent-strong)]">
                {h.featured.badge}
              </p>

              <h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-[var(--color-ink)] sm:text-4xl">
                {h.featured.title}
              </h2>

              <p className="mt-3 max-w-xl text-sm leading-6 text-[var(--color-text-muted)]">
                {h.featured.desc}
              </p>
            </div>

            <Link
              href="/products"
              className="text-sm font-medium text-[var(--color-accent-strong)] hover:underline"
            >
              {h.featured.viewAll}
            </Link>
          </div>

          {featuredProducts.length > 0 ? (
            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {featuredProducts.map((product) => (
                <ProductCard
                  key={product.slug}
                  product={{
                    ...product,
                    image: product.images[0] ?? null,
                  }}
                  locale={locale}
                />
              ))}
            </div>
          ) : (
            <div className="mt-8 rounded-[var(--radius-card)] border border-dashed border-[var(--color-line-strong)] p-10 text-center">
              <p className="text-sm text-[var(--color-text-muted)]">
                {h.featured.empty}
              </p>
            </div>
          )}
        </Container>
      </section>
    </>
  );
}
