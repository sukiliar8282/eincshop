import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { formatIdr } from "@/lib/format/currency";
import { Container } from "@/components/ui/container";
import { Badge } from "@/components/ui/badge";
import { AddToCartForm } from "@/components/cart/add-to-cart-form";
import { ProductCard } from "@/components/product/product-card";
import { getDictionary } from "@/lib/i18n/server";
import { localizeProduct } from "@/lib/i18n/catalog";

type ProductDetailPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

async function getProduct(slug: string) {
  return prisma.product.findFirst({
    where: {
      slug,
      productType: "DIGITAL",
      status: "PUBLISHED",
    },
    select: {
      id: true,
      title: true,
      slug: true,
      description: true,
      priceMinor: true,
      updatedAt: true,
      currency: true,
      category: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
      images: {
        orderBy: {
          sortOrder: "asc",
        },
        take: 5,
        select: {
          id: true,
          url: true,
          altText: true,
        },
      },
      digitalAssets: {
        where: {
          status: "ACTIVE",
        },
        take: 1,
        select: {
          fileName: true,
          mimeType: true,
          fileSize: true,
          version: true,
        },
      },
    },
  });
}

export async function generateMetadata({
  params,
}: ProductDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) {
    return {
      title: "Product not found",
    };
  }

  return {
    title: product.title,
    description: product.description.slice(0, 160),
  };
}

export default async function ProductDetailPage({
  params,
}: ProductDetailPageProps) {
  const { slug } = await params;
  const [{ dict, locale }, rawProduct] = await Promise.all([
    getDictionary(),
    getProduct(slug),
  ]);

  if (!rawProduct) {
    notFound();
  }

  const product = localizeProduct(rawProduct, locale);
  const primaryAsset = product.digitalAssets[0];

  const rawRelatedProducts = await prisma.product.findMany({
    where: {
      id: {
        not: product.id,
      },
      categoryId: product.category.id,
      productType: "DIGITAL",
      status: "PUBLISHED",
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
  });

  const relatedProducts = rawRelatedProducts.map((p) =>
    localizeProduct(p, locale),
  );
  const session = await auth();
  const d = dict.productDetail;

  return (
    <main className="py-16 sm:py-24">
      <Container>
        {/* Breadcrumb Navigasi */}
        <nav
          aria-label="Breadcrumb"
          className="mb-8 flex flex-wrap items-center gap-2 text-sm text-[var(--color-text-muted)]"
        >
          <Link href="/" className="hover:text-[var(--color-ink)]">
            {d.breadcrumbHome}
          </Link>

          <span aria-hidden="true">/</span>

          <Link href="/products" className="hover:text-[var(--color-ink)]">
            {d.breadcrumbCatalog}
          </Link>

          <span aria-hidden="true">/</span>

          <Link
            href={`/products?category=${product.category.slug}`}
            className="hover:text-[var(--color-ink)]"
          >
            {product.category.name}
          </Link>

          <span aria-hidden="true">/</span>

          <span
            aria-current="page"
            className="font-medium text-[var(--color-ink)]"
          >
            {product.title}
          </span>
        </nav>

        {/* Grid Product Detail Utama */}
        <div className="grid gap-10 lg:grid-cols-[1fr_0.8fr] lg:items-start">
          <div className="space-y-3">
            <div className="relative aspect-[16/10] overflow-hidden rounded-[var(--radius-card)] bg-[var(--color-surface-muted)] sm:aspect-[4/3]">
              {product.images[0] ? (
                <Image
                  src={product.images[0].url}
                  alt={product.images[0].altText}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 55vw"
                  className="object-cover object-top"
                />
              ) : (
                <div className="flex h-full items-end p-6">
                  <Badge tone="accent">{dict.productCard.digitalProduct}</Badge>
                </div>
              )}
            </div>

            {product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-3">
                {product.images.map((image) => (
                  <div
                    key={image.id}
                    className="relative aspect-square overflow-hidden rounded-[var(--radius-control)] bg-[var(--color-surface-muted)]"
                  >
                    <Image
                      src={image.url}
                      alt={image.altText}
                      fill
                      sizes="120px"
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <p className="text-sm font-medium uppercase tracking-[0.16em] text-[var(--color-accent-strong)]">
              {product.category.name}
            </p>

            <h1 className="mt-4 text-4xl font-semibold tracking-[-0.04em] text-[var(--color-ink)] sm:text-5xl">
              {product.title}
            </h1>

            {/* Harga Produk Bilingual */}
            <p className="mt-6 text-2xl font-semibold text-[var(--color-ink)]">
              {formatIdr(product.priceMinor, locale)}
            </p>

            {/* Metadata Pengiriman & Terakhir Diperbarui */}
            <dl className="mt-6 grid gap-3 border-y border-[var(--color-line)] py-5 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-[var(--color-text-muted)]">
                  {d.deliveryLabel}
                </dt>
                <dd className="mt-1 font-medium text-[var(--color-ink)]">
                  {d.deliveryValue}
                </dd>
              </div>

              <div>
                <dt className="text-[var(--color-text-muted)]">
                  {d.lastUpdated}
                </dt>
                <dd className="mt-1 font-medium text-[var(--color-ink)]">
                  {product.updatedAt.toLocaleDateString(
                    locale === "en" ? "en-US" : "id-ID",
                    {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    },
                  )}
                </dd>
              </div>
            </dl>

            {/* Detail Spesifikasi File */}
            {primaryAsset && (
              <dl className="mt-4 grid gap-3 rounded-[var(--radius-card)] bg-[var(--color-surface-muted)] p-5 text-sm sm:grid-cols-3">
                <div>
                  <dt className="text-[var(--color-text-muted)]">
                    {d.specsFormat}
                  </dt>
                  <dd className="mt-1 font-medium text-[var(--color-ink)]">
                    {primaryAsset.mimeType
                      .replace("application/", "")
                      .toUpperCase()}
                  </dd>
                </div>

                <div>
                  <dt className="text-[var(--color-text-muted)]">
                    {d.specsFileSize}
                  </dt>
                  <dd className="mt-1 font-medium text-[var(--color-ink)]">
                    {primaryAsset.fileSize >= 1024 * 1024
                      ? `${(primaryAsset.fileSize / 1024 / 1024).toFixed(1)} MB`
                      : `${Math.ceil(primaryAsset.fileSize / 1024)} KB`}
                  </dd>
                </div>

                <div>
                  <dt className="text-[var(--color-text-muted)]">
                    {d.specsVersion}
                  </dt>
                  <dd className="mt-1 font-medium text-[var(--color-ink)]">
                    {primaryAsset.version || "-"}
                  </dd>
                </div>
              </dl>
            )}

            {/* Deskripsi Produk */}
            <div className="mt-8 border-t border-[var(--color-line)] pt-8">
              <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-[var(--color-text-muted)]">
                {d.aboutTitle}
              </h2>

              <p className="mt-4 whitespace-pre-line text-base leading-7 text-[var(--color-text)]">
                {product.description}
              </p>
            </div>

            <div className="mt-8 grid gap-3 border-y border-[var(--color-line)] py-5 text-sm sm:grid-cols-3">
              <div>
                <p className="text-xs text-[var(--color-text-muted)]">
                  {d.specType}
                </p>
                <p className="mt-1 font-medium text-[var(--color-ink)]">
                  {dict.productCard.digitalProduct}
                </p>
              </div>

              <div>
                <p className="text-xs text-[var(--color-text-muted)]">
                  {d.specCategory}
                </p>
                <p className="mt-1 font-medium text-[var(--color-ink)]">
                  {product.category.name}
                </p>
              </div>

              <div>
                <p className="text-xs text-[var(--color-text-muted)]">
                  {d.specAccess}
                </p>
                <p className="mt-1 font-medium text-[var(--color-ink)]">
                  {d.instantAccess}
                </p>
              </div>
            </div>

            <div className="mt-8">
              <AddToCartForm
                productId={product.id}
                isAuthenticated={Boolean(session?.user?.id)}
              />
            </div>

            <div className="mt-8 rounded-[var(--radius-card)] bg-[var(--color-surface-muted)] p-5">
              <p className="text-sm leading-6 text-[var(--color-text-muted)]">
                {d.postPurchaseNotice}
              </p>
            </div>
          </div>
        </div>

        {/* Section FAQ Bilingual */}
        <section
          aria-labelledby="product-faq-heading"
          className="mt-10 border-t border-[var(--color-line)] pt-8"
        >
          <h2
            id="product-faq-heading"
            className="text-xl font-semibold tracking-[-0.02em] text-[var(--color-ink)]"
          >
            {d.faqTitle}
          </h2>

          <div className="mt-4 divide-y divide-[var(--color-line)] rounded-[var(--radius-card)] border border-[var(--color-line)] bg-white">
            <details className="group px-5 py-4">
              <summary className="cursor-pointer list-none pr-8 font-medium text-[var(--color-ink)]">
                {d.faqQ1}
              </summary>
              <p className="mt-3 text-sm leading-6 text-[var(--color-text-muted)]">
                {d.faqA1}
              </p>
            </details>

            <details className="group px-5 py-4">
              <summary className="cursor-pointer list-none pr-8 font-medium text-[var(--color-ink)]">
                {d.faqQ2}
              </summary>
              <p className="mt-3 text-sm leading-6 text-[var(--color-text-muted)]">
                {d.faqA2}
              </p>
            </details>

            <details className="group px-5 py-4">
              <summary className="cursor-pointer list-none pr-8 font-medium text-[var(--color-ink)]">
                {d.faqQ3}
              </summary>
              <p className="mt-3 text-sm leading-6 text-[var(--color-text-muted)]">
                {d.faqA3}
              </p>
            </details>
          </div>
        </section>

        {/* Section Produk Terkait */}
        {relatedProducts.length > 0 && (
          <section className="mt-20 border-t border-[var(--color-line)] pt-12">
            <div className="max-w-2xl">
              <p className="text-sm font-medium uppercase tracking-[0.16em] text-[var(--color-accent-strong)]">
                {d.relatedBadge}
              </p>

              <h2 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-[var(--color-ink)]">
                {d.relatedTitle}
              </h2>

              <p className="mt-3 text-sm leading-6 text-[var(--color-text-muted)]">
                {d.relatedDesc}
              </p>
            </div>

            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {relatedProducts.map((relatedProduct) => (
                <ProductCard
                  key={relatedProduct.slug}
                  product={{
                    ...relatedProduct,
                    image: relatedProduct.images[0] ?? null,
                  }}
                  locale={locale}
                />
              ))}
            </div>
          </section>
        )}
      </Container>
    </main>
  );
}
