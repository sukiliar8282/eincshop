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
      title: "Product tidak ditemukan",
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
  const product = await getProduct(slug);

  if (!product) {
    notFound();
  }

  const relatedProducts = await prisma.product.findMany({
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

  const session = await auth();

  return (
    <main className="py-16 sm:py-24">
      <Container>
        {/* Breadcrumb */}
        <nav
          aria-label="Breadcrumb"
          className="mb-8 flex flex-wrap items-center gap-2 text-sm text-[var(--color-text-muted)]"
        >
          <Link href="/" className="hover:text-[var(--color-ink)]">
            Beranda
          </Link>

          <span aria-hidden="true">/</span>

          <Link href="/products" className="hover:text-[var(--color-ink)]">
            Katalog
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
            {/* Rasio gambar responsif: 16/10 di mobile, 4/3 di sm ke atas */}
            <div className="relative aspect-[16/10] overflow-hidden rounded-[var(--radius-card)] bg-[var(--color-surface-muted)] sm:aspect-[4/3]">
              {product.images[0] ? (
                <Image
                  src={product.images[0].url}
                  alt={product.images[0].altText}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 55vw"
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full items-end p-6">
                  <Badge tone="accent">Produk digital</Badge>
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

            <p className="mt-6 text-2xl font-semibold text-[var(--color-ink)]">
              {formatIdr(product.priceMinor)}
            </p>

            <div className="mt-8 border-t border-[var(--color-line)] pt-8">
              <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-[var(--color-text-muted)]">
                Tentang produk ini
              </h2>

              <p className="mt-4 whitespace-pre-line text-base leading-7 text-[var(--color-text)]">
                {product.description}
              </p>
            </div>

            <div className="mt-8 grid gap-3 border-y border-[var(--color-line)] py-5 text-sm sm:grid-cols-3">
              <div>
                <p className="text-xs text-[var(--color-text-muted)]">Jenis</p>
                <p className="mt-1 font-medium text-[var(--color-ink)]">
                  Produk digital
                </p>
              </div>

              <div>
                <p className="text-xs text-[var(--color-text-muted)]">
                  Kategori
                </p>
                <p className="mt-1 font-medium text-[var(--color-ink)]">
                  {product.category.name}
                </p>
              </div>

              <div>
                <p className="text-xs text-[var(--color-text-muted)]">Akses</p>
                <p className="mt-1 font-medium text-[var(--color-ink)]">
                  Setelah pembayaran
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
                Setelah pembayaran berhasil, file dapat diakses dari halaman
                pesanan Anda.
              </p>
            </div>
          </div>
        </div>

        {/* Section Produk Terkait (Related Products) */}
        {relatedProducts.length > 0 && (
          <section className="mt-20 border-t border-[var(--color-line)] pt-12">
            <div className="max-w-2xl">
              <p className="text-sm font-medium uppercase tracking-[0.16em] text-[var(--color-accent-strong)]">
                Produk lainnya
              </p>

              <h2 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-[var(--color-ink)]">
                Produk terkait
              </h2>

              <p className="mt-3 text-sm leading-6 text-[var(--color-text-muted)]">
                Temukan produk lain yang masih berada dalam kategori yang sama.
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
                />
              ))}
            </div>
          </section>
        )}
      </Container>
    </main>
  );
}
